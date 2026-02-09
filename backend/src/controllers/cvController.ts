import { Request, Response } from 'express';
import {
  parseCV,
  reviewCV,
  improveCV,
  tailorCVForJob,
  generateInterviewQuestions,
} from '../services/claudeService';
import { saveCV, getCVById, getUserCVs, deleteCV, updateCV } from '../queries/cvQueries';
import { ParsedCVStructure, ReviewResult, ApiResponse } from '../types/cv';

// Store parsed CV temporarily for multi-step workflow (in-memory for now)
// In production, consider Redis or database
const parsedCVCache: { [key: string]: ParsedCVStructure } = {};

/**
 * POST /api/cv/parse
 * Parse CV text to structured JSON
 * Body: { cvText: string }
 */
export const parseCVHandler = async (req: Request, res: Response) => {
  try {
    const { cvText } = req.body as { cvText: string };

    if (!cvText || typeof cvText !== 'string' || cvText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'CV text is required and must not be empty',
        error: 'INVALID_INPUT',
      } as ApiResponse);
    }

    // Call Claude service to parse CV
    const parsedCV = await parseCV(cvText);

    // Store in cache temporarily
    const cacheKey = `cv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    parsedCVCache[cacheKey] = parsedCV;

    return res.status(200).json({
      success: true,
      message: 'CV parsed successfully',
      data: {
        parsedCV,
        cacheKey, // Return this key for next step
      },
    } as ApiResponse);
  } catch (error) {
    console.error('CV Parse Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to parse CV',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ApiResponse);
  }
};

/**
 * POST /api/cv/review
 * Review parsed CV for structure and style
 * Body: { cvJson: ParsedCVStructure } or { cacheKey: string }
 */
export const reviewCVHandler = async (req: Request, res: Response) => {
  try {
    const { cvJson, cacheKey } = req.body as {
      cvJson?: ParsedCVStructure;
      cacheKey?: string;
    };

    // Use cached CV if cacheKey provided, otherwise use cvJson
    let cvToReview = cvJson;
    if (cacheKey && parsedCVCache[cacheKey]) {
      cvToReview = parsedCVCache[cacheKey];
    }

    if (!cvToReview) {
      return res.status(400).json({
        success: false,
        message: 'CV data is required. Provide cvJson or valid cacheKey',
        error: 'INVALID_INPUT',
      } as ApiResponse);
    }

    // Call Claude service to review CV
    const review = await reviewCV(cvToReview);

    return res.status(200).json({
      success: true,
      message: 'CV review completed',
      data: review,
    } as ApiResponse);
  } catch (error) {
    console.error('CV Review Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to review CV',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ApiResponse);
  }
};

/**
 * POST /api/cv/improve
 * Improve CV based on review
 * Body: { cvJson: ParsedCVStructure } or { cacheKey: string }
 */
export const improveCVHandler = async (req: Request, res: Response) => {
  try {
    const { cvJson, cacheKey } = req.body as {
      cvJson?: ParsedCVStructure;
      cacheKey?: string;
    };

    // Use cached CV if cacheKey provided
    let cvToImprove = cvJson;
    if (cacheKey && parsedCVCache[cacheKey]) {
      cvToImprove = parsedCVCache[cacheKey];
      delete parsedCVCache[cacheKey]; // Clear cache after use
    }

    if (!cvToImprove) {
      return res.status(400).json({
        success: false,
        message: 'CV data is required. Provide cvJson or valid cacheKey',
        error: 'INVALID_INPUT',
      } as ApiResponse);
    }

    // Call Claude service to improve CV
    const improvedCV = await improveCV(cvToImprove);

    return res.status(200).json({
      success: true,
      message: 'CV improved successfully',
      data: improvedCV,
    } as ApiResponse);
  } catch (error) {
    console.error('CV Improve Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to improve CV',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ApiResponse);
  }
};

/**
 * POST /api/cv/tailor
 * Tailor CV for specific job
 * Body: { cvJson: ParsedCVStructure, jobBrief: string }
 */
export const tailorCVHandler = async (req: Request, res: Response) => {
  try {
    const { cvJson, jobBrief } = req.body as {
      cvJson: ParsedCVStructure;
      jobBrief: string;
    };

    if (!cvJson) {
      return res.status(400).json({
        success: false,
        message: 'CV data is required',
        error: 'INVALID_INPUT',
      } as ApiResponse);
    }

    if (!jobBrief || typeof jobBrief !== 'string' || jobBrief.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Job brief is required and must not be empty',
        error: 'INVALID_INPUT',
      } as ApiResponse);
    }

    // Call Claude service to tailor CV
    const tailoredCV = await tailorCVForJob(cvJson, jobBrief);

    return res.status(200).json({
      success: true,
      message: 'CV tailored for job successfully',
      data: tailoredCV,
    } as ApiResponse);
  } catch (error) {
    console.error('CV Tailor Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to tailor CV',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ApiResponse);
  }
};

/**
 * POST /api/cv/save
 * Save CV to database
 * Body: { cvJson: ParsedCVStructure, originalContent: string }
 * Requires auth (userId from session)
 */
export const saveCVHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id; // From auth middleware

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'UNAUTHORIZED',
      } as ApiResponse);
    }

    const { cvJson, originalContent } = req.body as {
      cvJson: ParsedCVStructure;
      originalContent: string;
    };

    if (!originalContent || typeof originalContent !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'CV content is required',
        error: 'INVALID_INPUT',
      } as ApiResponse);
    }

    if (!cvJson) {
      return res.status(400).json({
        success: false,
        message: 'Parsed CV data is required',
        error: 'INVALID_INPUT',
      } as ApiResponse);
    }

    // Check required fields
    if (!cvJson.personalInfo?.name || !cvJson.personalInfo?.email) {
      return res.status(400).json({
        success: false,
        message: 'Required fields missing: personalInfo.name and personalInfo.email',
        error: 'MISSING_REQUIRED_FIELDS',
      } as ApiResponse);
    }

    if (!cvJson.education || cvJson.education.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one education entry is required',
        error: 'MISSING_REQUIRED_FIELDS',
      } as ApiResponse);
    }

    if (!cvJson.skills || cvJson.skills.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one skill is required',
        error: 'MISSING_REQUIRED_FIELDS',
      } as ApiResponse);
    }

    // Save to database
    const savedCV = await saveCV(originalContent, userId, cvJson);

    return res.status(201).json({
      success: true,
      message: 'CV saved successfully',
      data: {
        id: savedCV.id,
        fullName: savedCV.fullName,
        email: savedCV.email,
        createdAt: savedCV.createdAt,
      },
    } as ApiResponse);
  } catch (error) {
    console.error('CV Save Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to save CV',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ApiResponse);
  }
};

/**
 * GET /api/cv/:id
 * Retrieve CV by ID
 * Requires auth
 */
export const getCVHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'UNAUTHORIZED',
      } as ApiResponse);
    }

    const { id } = req.params as { id: string };
    const cvId = parseInt(id, 10);

    if (isNaN(cvId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid CV ID',
        error: 'INVALID_ID',
      } as ApiResponse);
    }

    const cv = await getCVById(cvId, userId);

    return res.status(200).json({
      success: true,
      message: 'CV retrieved successfully',
      data: cv,
    } as ApiResponse);
  } catch (error) {
    console.error('CV Get Error:', error);
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';

    if (errorMsg === 'CV not found') {
      return res.status(404).json({
        success: false,
        message: 'CV not found',
        error: 'CV_NOT_FOUND',
      } as ApiResponse);
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve CV',
      error: errorMsg,
    } as ApiResponse);
  }
};

/**
 * GET /api/cv
 * Get all CVs for current user
 * Requires auth
 */
export const getUserCVsHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'UNAUTHORIZED',
      } as ApiResponse);
    }

    const cvs = await getUserCVs(userId);

    return res.status(200).json({
      success: true,
      message: 'CVs retrieved successfully',
      data: cvs,
    } as ApiResponse);
  } catch (error) {
    console.error('Get User CVs Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve CVs',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ApiResponse);
  }
};

/**
 * POST /api/cv/generate-questions
 * Generate interview questions
 * Body: { cvJson: ParsedCVStructure, jobBrief: string }
 */
export const generateQuestionsHandler = async (req: Request, res: Response) => {
  try {
    const { cvJson, jobBrief } = req.body as {
      cvJson: ParsedCVStructure;
      jobBrief: string;
    };

    if (!cvJson) {
      return res.status(400).json({
        success: false,
        message: 'CV data is required',
        error: 'INVALID_INPUT',
      } as ApiResponse);
    }

    if (!jobBrief || typeof jobBrief !== 'string' || jobBrief.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Job brief is required',
        error: 'INVALID_INPUT',
      } as ApiResponse);
    }

    // Call Claude service
    const questions = await generateInterviewQuestions(cvJson, jobBrief);

    return res.status(200).json({
      success: true,
      message: 'Interview questions generated successfully',
      data: {
        questions,
        count: questions.length,
      },
    } as ApiResponse);
  } catch (error) {
    console.error('Generate Questions Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate questions',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ApiResponse);
  }
};

/**
 * DELETE /api/cv/:id
 * Delete CV
 * Requires auth
 */
export const deleteCVHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'UNAUTHORIZED',
      } as ApiResponse);
    }

    const { id } = req.params as { id: string };
    const cvId = parseInt(id, 10);

    if (isNaN(cvId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid CV ID',
        error: 'INVALID_ID',
      } as ApiResponse);
    }

    await deleteCV(cvId, userId);

    return res.status(200).json({
      success: true,
      message: 'CV deleted successfully',
    } as ApiResponse);
  } catch (error) {
    console.error('CV Delete Error:', error);
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';

    if (errorMsg === 'CV not found') {
      return res.status(404).json({
        success: false,
        message: 'CV not found',
        error: 'CV_NOT_FOUND',
      } as ApiResponse);
    }

    if (errorMsg === 'Unauthorized') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this CV',
        error: 'FORBIDDEN',
      } as ApiResponse);
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to delete CV',
      error: errorMsg,
    } as ApiResponse);
  }
};
