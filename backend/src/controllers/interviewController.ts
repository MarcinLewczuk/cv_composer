import { Request, Response } from 'express';
import { generateInterviewQuestions } from '../services/interviewService';
import { db } from '../app';
import { QueryError } from 'mysql2';

/**
 * Generate a new interview practice session
 */
export const generateInterviewHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const { jobRole, experienceLevel, questionCount } = req.body;

    if (!jobRole || !experienceLevel) {
      return res.status(400).json({
        success: false,
        message: 'Job role and experience level are required',
      });
    }

    const count = questionCount || 10;

    // Generate questions using AI
    const generatedInterview = await generateInterviewQuestions(jobRole, experienceLevel, count);

    // Save session to database
    const insertSessionQuery = `
      INSERT INTO interview_sessions (jobRole, experienceLevel, questionCount, createdBy)
      VALUES (?, ?, ?, ?)
    `;

    db.query(
      insertSessionQuery,
      [jobRole, experienceLevel, count, userId],
      (error: QueryError | null, results: any) => {
        if (error) {
          console.error('Error saving interview session:', error);
          return res.status(500).json({
            success: false,
            message: 'Failed to save interview session',
          });
        }

        const sessionId = results.insertId;

        // Save questions to database
        const insertQuestionQuery = `
          INSERT INTO interview_questions (sessionId, question, questionType, sampleAnswer, tips, \`order\`)
          VALUES (?, ?, ?, ?, ?, ?)
        `;

        let questionsInserted = 0;
        const totalQuestions = generatedInterview.questions.length;

        generatedInterview.questions.forEach((q, index) => {
          db.query(
            insertQuestionQuery,
            [sessionId, q.question, q.questionType, q.sampleAnswer, q.tips, index + 1],
            (qError: QueryError | null) => {
              if (qError) {
                console.error('Error saving question:', qError);
              }
              questionsInserted++;

              // When all questions are inserted, send response
              if (questionsInserted === totalQuestions) {
                return res.status(201).json({
                  success: true,
                  message: 'Interview session generated successfully',
                  data: {
                    sessionId,
                    jobRole: generatedInterview.jobRole,
                    experienceLevel: generatedInterview.experienceLevel,
                    questionCount: totalQuestions,
                  },
                });
              }
            }
          );
        });
      }
    );
  } catch (error) {
    console.error('Generate Interview Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate interview session',
    });
  }
};

/**
 * Get all interview sessions for the authenticated user
 */
export const getInterviewSessionsHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const query = `
      SELECT 
        s.id,
        s.jobRole,
        s.experienceLevel,
        s.questionCount,
        s.createdAt,
        COUNT(DISTINCT r.questionId) as answeredCount
      FROM interview_sessions s
      LEFT JOIN interview_responses r ON s.id = r.sessionId AND r.userId = ?
      WHERE s.createdBy = ?
      GROUP BY s.id
      ORDER BY s.createdAt DESC
    `;

    db.query(query, [userId, userId], (error: QueryError | null, results: any[]) => {
      if (error) {
        console.error('Error fetching sessions:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to fetch sessions',
        });
      }

      return res.status(200).json({
        success: true,
        data: results,
      });
    });
  } catch (error) {
    console.error('Get Sessions Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch sessions',
    });
  }
};

/**
 * Get a specific interview session with all questions
 */
export const getInterviewSessionByIdHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const { id } = req.params;
    const sessionId = parseInt(id, 10);

    if (isNaN(sessionId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid session ID',
      });
    }

    // Get session details
    const sessionQuery = 'SELECT * FROM interview_sessions WHERE id = ? AND createdBy = ?';

    db.query(sessionQuery, [sessionId, userId], (error: QueryError | null, sessions: any[]) => {
      if (error) {
        console.error('Error fetching session:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to fetch session',
        });
      }

      if (sessions.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Session not found',
        });
      }

      const session = sessions[0];

      // Get questions for this session (without sample answers initially - user can reveal them)
      const questionsQuery = `
        SELECT id, question, questionType, \`order\`
        FROM interview_questions
        WHERE sessionId = ?
        ORDER BY \`order\` ASC
      `;

      db.query(questionsQuery, [sessionId], (qError: QueryError | null, questions: any[]) => {
        if (qError) {
          console.error('Error fetching questions:', qError);
          return res.status(500).json({
            success: false,
            message: 'Failed to fetch questions',
          });
        }

        return res.status(200).json({
          success: true,
          data: {
            ...session,
            questions,
          },
        });
      });
    });
  } catch (error) {
    console.error('Get Session By ID Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch session',
    });
  }
};

/**
 * Get question details including sample answer and tips
 */
export const getQuestionDetailsHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const { questionId } = req.params;
    const qId = parseInt(questionId, 10);

    if (isNaN(qId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid question ID',
      });
    }

    const query = `
      SELECT q.*, s.createdBy
      FROM interview_questions q
      JOIN interview_sessions s ON q.sessionId = s.id
      WHERE q.id = ? AND s.createdBy = ?
    `;

    db.query(query, [qId, userId], (error: QueryError | null, results: any[]) => {
      if (error) {
        console.error('Error fetching question details:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to fetch question details',
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Question not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: results[0],
      });
    });
  } catch (error) {
    console.error('Get Question Details Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch question details',
    });
  }
};

/**
 * Submit answer for a question
 */
export const submitAnswerHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const { sessionId, questionId, answer } = req.body;

    if (!sessionId || !questionId || !answer) {
      return res.status(400).json({
        success: false,
        message: 'Session ID, question ID, and answer are required',
      });
    }

    // Verify session belongs to user
    const verifyQuery = 'SELECT id FROM interview_sessions WHERE id = ? AND createdBy = ?';

    db.query(verifyQuery, [sessionId, userId], (error: QueryError | null, results: any[]) => {
      if (error || results.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized access to this session',
        });
      }

      // Save the response
      const insertQuery = `
        INSERT INTO interview_responses (sessionId, userId, questionId, userAnswer)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE userAnswer = VALUES(userAnswer), completedAt = CURRENT_TIMESTAMP
      `;

      db.query(
        insertQuery,
        [sessionId, userId, questionId, answer],
        (insertError: QueryError | null, insertResults: any) => {
          if (insertError) {
            console.error('Error saving response:', insertError);
            return res.status(500).json({
              success: false,
              message: 'Failed to save response',
            });
          }

          return res.status(200).json({
            success: true,
            message: 'Answer submitted successfully',
            data: {
              responseId: insertResults.insertId,
            },
          });
        }
      );
    });
  } catch (error) {
    console.error('Submit Answer Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit answer',
    });
  }
};

/**
 * Get user's responses for a session
 */
export const getSessionResponsesHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const { id } = req.params;
    const sessionId = parseInt(id, 10);

    if (isNaN(sessionId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid session ID',
      });
    }

    const query = `
      SELECT 
        q.id as questionId,
        q.question,
        q.questionType,
        q.sampleAnswer,
        q.tips,
        r.userAnswer,
        r.completedAt
      FROM interview_questions q
      LEFT JOIN interview_responses r ON q.id = r.questionId AND r.userId = ? AND r.sessionId = ?
      WHERE q.sessionId = ?
      ORDER BY q.\`order\` ASC
    `;

    db.query(query, [userId, sessionId, sessionId], (error: QueryError | null, results: any[]) => {
      if (error) {
        console.error('Error fetching responses:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to fetch responses',
        });
      }

      return res.status(200).json({
        success: true,
        data: results,
      });
    });
  } catch (error) {
    console.error('Get Session Responses Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch responses',
    });
  }
};
