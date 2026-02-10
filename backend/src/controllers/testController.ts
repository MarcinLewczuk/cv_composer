import { Request, Response } from 'express';
import { generateMockTest, generateJobSpecificTest } from '../services/testService';
import { db } from '../app';
import { QueryError } from 'mysql2';

/**
 * POST /api/tests/generate
 * Generate a new mock test using AI
 * Body: { topic: string, difficulty: 'easy'|'medium'|'hard', questionCount: number }
 */
export const generateTestHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'UNAUTHORIZED',
      });
    }

    const { topic, difficulty, questionCount } = req.body as {
      topic: string;
      difficulty: 'easy' | 'medium' | 'hard';
      questionCount: number;
    };

    if (!topic || !difficulty || !questionCount) {
      return res.status(400).json({
        success: false,
        message: 'topic, difficulty, and questionCount are required',
        error: 'INVALID_INPUT',
      });
    }

    if (questionCount < 5 || questionCount > 50) {
      return res.status(400).json({
        success: false,
        message: 'questionCount must be between 5 and 50',
        error: 'INVALID_INPUT',
      });
    }

    // Generate test using AI
    const generatedTest = await generateMockTest(topic, difficulty, questionCount);

    // Calculate duration (rough estimate: 1.5 minutes per question)
    const duration = Math.ceil(questionCount * 1.5);

    // Save test to database
    const insertTestQuery = `
      INSERT INTO mock_tests (title, description, difficulty, duration, topic, createdBy)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
      insertTestQuery,
      [generatedTest.title, generatedTest.description, difficulty, duration, topic, userId],
      (error: QueryError | null, results: any) => {
        if (error) {
          console.error('Error saving test:', error);
          return res.status(500).json({
            success: false,
            message: 'Failed to save test',
            error: error.message,
          });
        }

        const testId = results.insertId;

        // Save questions
        const insertQuestionQuery = `
          INSERT INTO test_questions (testId, question, optionA, optionB, optionC, optionD, correctAnswer, explanation, \`order\`)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        let completedInserts = 0;
        const questions = generatedTest.questions;

        questions.forEach((q, index) => {
          db.query(
            insertQuestionQuery,
            [testId, q.question, q.optionA, q.optionB, q.optionC, q.optionD, q.correctAnswer, q.explanation, index + 1],
            (qError: QueryError | null) => {
              if (qError) {
                console.error('Error saving question:', qError);
              }
              completedInserts++;

              if (completedInserts === questions.length) {
                // All questions saved, return response
                return res.status(201).json({
                  success: true,
                  message: 'Test generated successfully',
                  data: {
                    testId,
                    title: generatedTest.title,
                    description: generatedTest.description,
                    difficulty,
                    duration,
                    questionCount: questions.length,
                  },
                });
              }
            }
          );
        });
      }
    );
  } catch (error) {
    console.error('Generate Test Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate test',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * GET /api/tests
 * Get all available tests for the user
 */
export const getTestsHandler = async (req: Request, res: Response) => {
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
        t.id,
        t.title,
        t.description,
        t.difficulty,
        t.duration,
        t.topic,
        t.createdAt,
        COUNT(q.id) as questionCount,
        (SELECT COUNT(*) FROM test_results WHERE testId = t.id AND userId = ?) as attemptCount
      FROM mock_tests t
      LEFT JOIN test_questions q ON t.id = q.testId
      GROUP BY t.id
      ORDER BY t.createdAt DESC
    `;

    db.query(query, [userId], (error: QueryError | null, results: any[]) => {
      if (error) {
        console.error('Error fetching tests:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to fetch tests',
          error: error.message,
        });
      }

      return res.status(200).json({
        success: true,
        data: results,
      });
    });
  } catch (error) {
    console.error('Get Tests Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch tests',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * GET /api/tests/:id
 * Get a specific test with its questions (without correct answers)
 */
export const getTestByIdHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const { id } = req.params;
    const testId = parseInt(id, 10);

    if (isNaN(testId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid test ID',
      });
    }

    // Get test details
    const testQuery = 'SELECT * FROM mock_tests WHERE id = ?';
    
    db.query(testQuery, [testId], (testError: QueryError | null, testResults: any[]) => {
      if (testError) {
        console.error('Error fetching test:', testError);
        return res.status(500).json({
          success: false,
          message: 'Failed to fetch test',
        });
      }

      if (testResults.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Test not found',
        });
      }

      const test = testResults[0];

      // Get questions (without correct answers and explanations for taking the test)
      const questionsQuery = `
        SELECT id, question, optionA, optionB, optionC, optionD, \`order\`
        FROM test_questions
        WHERE testId = ?
        ORDER BY \`order\` ASC
      `;

      db.query(questionsQuery, [testId], (qError: QueryError | null, questions: any[]) => {
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
            ...test,
            questions,
          },
        });
      });
    });
  } catch (error) {
    console.error('Get Test Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch test',
    });
  }
};

/**
 * POST /api/tests/:id/submit
 * Submit test answers and get results
 * Body: { answers: { [questionId: number]: 'A'|'B'|'C'|'D' }, timeTaken: number }
 */
export const submitTestHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const { id } = req.params;
    const testId = parseInt(id, 10);
    const { answers, timeTaken } = req.body as {
      answers: { [key: number]: string };
      timeTaken: number;
    };

    if (isNaN(testId) || !answers || typeof timeTaken !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'Invalid input',
      });
    }

    // Get all questions with correct answers
    const questionsQuery = 'SELECT * FROM test_questions WHERE testId = ? ORDER BY `order` ASC';

    db.query(questionsQuery, [testId], (error: QueryError | null, questions: any[]) => {
      if (error) {
        console.error('Error fetching questions:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to fetch questions',
        });
      }

      // Calculate score
      let correctCount = 0;
      const results = questions.map((q) => {
        const userAnswer = answers[q.id];
        const isCorrect = userAnswer === q.correctAnswer;
        if (isCorrect) correctCount++;

        return {
          questionId: q.id,
          question: q.question,
          userAnswer,
          correctAnswer: q.correctAnswer,
          isCorrect,
          explanation: q.explanation,
        };
      });

      const totalQuestions = questions.length;
      const score = correctCount;
      const percentage = Math.round((score / totalQuestions) * 100);

      // Save result to database
      const insertResultQuery = `
        INSERT INTO test_results (testId, userId, score, totalQuestions, timeTaken, answers)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      db.query(
        insertResultQuery,
        [testId, userId, score, totalQuestions, timeTaken, JSON.stringify(answers)],
        (insertError: QueryError | null, insertResults: any) => {
          if (insertError) {
            console.error('Error saving result:', insertError);
            return res.status(500).json({
              success: false,
              message: 'Failed to save result',
            });
          }

          return res.status(200).json({
            success: true,
            message: 'Test submitted successfully',
            data: {
              resultId: insertResults.insertId,
              score,
              totalQuestions,
              percentage,
              timeTaken,
              results,
            },
          });
        }
      );
    });
  } catch (error) {
    console.error('Submit Test Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit test',
    });
  }
};

/**
 * GET /api/tests/results
 * Get user's test results/history
 */
export const getTestResultsHandler = async (req: Request, res: Response) => {
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
        r.id,
        r.score,
        r.totalQuestions,
        r.timeTaken,
        r.completedAt,
        t.title as testTitle,
        t.difficulty,
        t.topic,
        ROUND((r.score * 100.0 / r.totalQuestions)) as percentage
      FROM test_results r
      JOIN mock_tests t ON r.testId = t.id
      WHERE r.userId = ?
      ORDER BY r.completedAt DESC
    `;

    db.query(query, [userId], (error: QueryError | null, results: any[]) => {
      if (error) {
        console.error('Error fetching results:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to fetch results',
          error: error.message,
        });
      }

      // Calculate statistics - recalculate percentages in JavaScript to ensure accuracy
      const resultsWithPercentage = results.map(r => ({
        ...r,
        percentage: Math.round((r.score / r.totalQuestions) * 100)
      }));

      const stats = {
        totalTests: resultsWithPercentage.length,
        averageScore: resultsWithPercentage.length > 0 
          ? Math.round(resultsWithPercentage.reduce((sum, r) => sum + r.percentage, 0) / resultsWithPercentage.length) 
          : 0,
        bestScore: resultsWithPercentage.length > 0 
          ? Math.max(...resultsWithPercentage.map(r => r.percentage)) 
          : 0,
      };

      return res.status(200).json({
        success: true,
        data: {
          stats,
          results: resultsWithPercentage,
        },
      });
    });
  } catch (error) {
    console.error('Get Results Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch results',
    });
  }
};

/**
 * GET /api/tests/results/:id
 * Get detailed result for a specific test submission
 */
export const getTestResultByIdHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const { id } = req.params;
    const resultId = parseInt(id, 10);

    if (isNaN(resultId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid result ID',
      });
    }

    const query = `
      SELECT 
        r.*,
        t.title as testTitle,
        t.description as testDescription,
        t.difficulty,
        t.topic
      FROM test_results r
      JOIN mock_tests t ON r.testId = t.id
      WHERE r.id = ? AND r.userId = ?
    `;

    db.query(query, [resultId, userId], (error: QueryError | null, results: any[]) => {
      if (error) {
        console.error('Error fetching result:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to fetch result',
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Result not found',
        });
      }

      const result = results[0];
      const userAnswers = JSON.parse(result.answers);

      // Get questions with correct answers
      const questionsQuery = 'SELECT * FROM test_questions WHERE testId = ? ORDER BY `order` ASC';

      db.query(questionsQuery, [result.testId], (qError: QueryError | null, questions: any[]) => {
        if (qError) {
          console.error('Error fetching questions:', qError);
          return res.status(500).json({
            success: false,
            message: 'Failed to fetch questions',
          });
        }

        const detailedResults = questions.map((q) => ({
          questionId: q.id,
          question: q.question,
          optionA: q.optionA,
          optionB: q.optionB,
          optionC: q.optionC,
          optionD: q.optionD,
          userAnswer: userAnswers[q.id],
          correctAnswer: q.correctAnswer,
          isCorrect: userAnswers[q.id] === q.correctAnswer,
          explanation: q.explanation,
        }));

        return res.status(200).json({
          success: true,
          data: {
            ...result,
            percentage: Math.round((result.score / result.totalQuestions) * 100),
            detailedResults,
          },
        });
      });
    });
  } catch (error) {
    console.error('Get Result Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch result',
    });
  }
};
