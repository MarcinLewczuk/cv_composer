import Anthropic from '@anthropic-ai/sdk';
import { ParsedCVStructure, ImprovedCVStructure, ReviewResult } from '../types/cv';

const client = new Anthropic({
  apiKey: process.env['ANTHROPIC_API_KEY'],
});

/**
 * Parse CV text (extracted from PDF) to structured JSON
 * @param cvText - Extracted text from CV PDF
 * @returns Parsed CV structure matching our schema
 */
export const parseCV = async (cvText: string): Promise<ParsedCVStructure> => {
  try {
    const message = await client.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: `Extract CV information from this text and structure it as JSON matching our schema exactly.

Text:
${cvText}

Return ONLY valid JSON matching this exact structure (no markdown, no extra text):
{
  "personalInfo": {
    "name": "string - full name",
    "email": "string - email address",
    "phone": "string or null",
    "location": "string or null"
  },
  "summary": "string or null - professional summary",
  "experience": [
    {
      "company": "string",
      "position": "string",
      "duration": "string or null - e.g., '2020-2024'",
      "description": "string or null - main responsibilities",
      "achievements": ["string array of key achievements or null"]
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "field": "string",
      "graduationYear": "string or null"
    }
  ],
  "skills": ["array of skill strings"],
  "certifications": [
    {
      "name": "string",
      "issuer": "string",
      "date": "string or null"
    }
  ]
}

Extract all information. If a section is missing, use empty array for arrays and null for optional fields.
Keep experience, education, and skills as arrays even if there's only one item or none.
Return ONLY the JSON, no other text.`,
        },
      ],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : null;

    if (!responseText) {
      throw new Error('No text response from Claude');
    }

    // Clean response - remove markdown code blocks if present
    const cleanedText = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const parsedCV = JSON.parse(cleanedText);
    return parsedCV;
  } catch (error) {
    console.error('Claude Parse Error:', error);
    throw error;
  }
};

/**
 * Review CV and check against our style and structure requirements
 * @param cvJson - Parsed CV structure
 * @returns Review results with issues and recommendations
 */
export const reviewCV = async (cvJson: ParsedCVStructure): Promise<ReviewResult> => {
  try {
    const message = await client.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: `Review this CV against professional standards and our structure requirements.

CV Data:
${JSON.stringify(cvJson, null, 2)}

Check for:
1. Required fields present (personalInfo, education, skills)
2. Professional language and formatting
3. Use of action verbs in experience descriptions
4. Presence of metrics/achievements
5. All arrays properly formatted

Return ONLY valid JSON (no markdown):
{
  "isValid": boolean,
  "structureIssues": ["list of missing or malformed structure issues"],
  "styleIssues": ["list of professional/language issues"],
  "recommendations": ["list of improvement recommendations"],
  "summary": "brief overall assessment"
}

Be constructive. If CV is good, set isValid to true with empty issue arrays.
Return ONLY the JSON, no other text.`,
        },
      ],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : null;

    if (!responseText) {
      throw new Error('No text response from Claude');
    }

    const cleanedText = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const review = JSON.parse(cleanedText);
    return review;
  } catch (error) {
    console.error('Claude Review Error:', error);
    throw error;
  }
};

/**
 * Improve CV based on review and required fields
 * @param cvJson - Parsed CV structure
 * @returns Improved CV with better language and structure
 */
export const improveCV = async (cvJson: ParsedCVStructure): Promise<ImprovedCVStructure> => {
  try {
    const cvSchema = JSON.stringify(cvJson, null, 2);

    const message = await client.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: `Improve this CV while maintaining the exact JSON structure. Focus on:
1. Using strong action verbs in experience descriptions
2. Adding metrics and quantifiable achievements
3. Improving professional language
4. Ensuring consistent formatting

Current CV:
${cvSchema}

Rules:
- KEEP the exact same structure and fields
- KEEP all array items (just improve them)
- ONLY add/improve text content, don't remove fields
- RETURN ONLY valid JSON with same structure

Return the improved CV as JSON ONLY, no markdown or extra text.`,
        },
      ],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : null;

    if (!responseText) {
      throw new Error('No text response from Claude');
    }

    const cleanedText = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const improvedCV = JSON.parse(cleanedText);
    return improvedCV;
  } catch (error) {
    console.error('Claude Improve Error:', error);
    throw error;
  }
};

/**
 * Tailor CV for a specific job description
 * @param cvJson - Parsed CV structure
 * @param jobBrief - Job description
 * @returns CV tailored for the job
 */
export const tailorCVForJob = async (
  cvJson: ParsedCVStructure,
  jobBrief: string,
): Promise<ImprovedCVStructure> => {
  try {
    const cvSchema = JSON.stringify(cvJson, null, 2);

    const message = await client.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: `Tailor this CV for the specific job description. Reorder and emphasize skills and experience that match the job.

Job Description:
${jobBrief}

Current CV:
${cvSchema}

Tasks:
1. Reorder experience by relevance to the job
2. Highlight matching skills and keywords
3. Adjust descriptions to emphasize relevant achievements
4. KEEP the exact same JSON structure
5. Don't add or remove fields, only improve content

Return ONLY the tailored CV as JSON with the same structure. No markdown or extra text.`,
        },
      ],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : null;

    if (!responseText) {
      throw new Error('No text response from Claude');
    }

    const cleanedText = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const tailoredCV = JSON.parse(cleanedText);
    return tailoredCV;
  } catch (error) {
    console.error('Claude Tailor Error:', error);
    throw error;
  }
};

/**
 * Generate interview questions based on CV and job
 * @param cvJson - Parsed CV structure
 * @param jobBrief - Job description
 * @returns Array of interview questions
 */
export const generateInterviewQuestions = async (
  cvJson: ParsedCVStructure,
  jobBrief: string,
): Promise<string[]> => {
  try {
    const message = await client.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: `Generate 5-7 tailored interview questions based on this CV and job description.

Job Description:
${jobBrief}

Candidate CV:
${JSON.stringify(cvJson, null, 2)}

Generate questions that:
1. Are specific to their experience in the CV
2. Relate to the job requirements
3. Assess their fit for this role
4. Mix behavioral and technical questions

Return ONLY a JSON array of question strings, NO markdown:
["question 1", "question 2", ...]`,
        },
      ],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : null;

    if (!responseText) {
      throw new Error('No text response from Claude');
    }

    const cleanedText = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const questions = JSON.parse(cleanedText);
    return questions;
  } catch (error) {
    console.error('Claude Questions Error:', error);
    throw error;
  }
};

export default {
  parseCV,
  reviewCV,
  improveCV,
  tailorCVForJob,
  generateInterviewQuestions,
};
