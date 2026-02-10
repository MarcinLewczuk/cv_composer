import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env['ANTHROPIC_API_KEY'],
});

export interface TestQuestion {
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

export interface GeneratedTest {
  title: string;
  description: string;
  questions: TestQuestion[];
}

/**
 * Generate a mock test with multiple choice questions using AI
 * @param topic - Topic for the test (e.g., "JavaScript", "System Design", "Behavioral")
 * @param difficulty - Difficulty level
 * @param questionCount - Number of questions to generate
 * @returns Generated test with MCQ questions
 */
export const generateMockTest = async (
  topic: string,
  difficulty: 'easy' | 'medium' | 'hard',
  questionCount: number
): Promise<GeneratedTest> => {
  try {
    const difficultyInstructions = {
      easy: 'straightforward questions suitable for beginners',
      medium: 'intermediate level questions requiring solid understanding',
      hard: 'advanced questions requiring deep knowledge and experience'
    };

    const message = await client.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: `Generate a professional mock interview test with ${questionCount} multiple choice questions.

Topic: ${topic}
Difficulty: ${difficulty} - ${difficultyInstructions[difficulty]}

Create questions that:
1. Test practical knowledge and real-world scenarios
2. Have 4 distinct answer options (A, B, C, D)
3. Include a clear explanation for the correct answer
4. Are relevant to job interviews in this field
5. Progressively test different aspects of the topic

CRITICAL: Return ONLY valid JSON with NO line breaks within string values. All text must be on single lines.

Return this exact JSON structure (no markdown, no extra text, no newlines in strings):
{
  "title": "Test title - concise and descriptive",
  "description": "Brief description of what this test covers",
  "questions": [
    {
      "question": "The question text",
      "optionA": "First option",
      "optionB": "Second option",
      "optionC": "Third option",
      "optionD": "Fourth option",
      "correctAnswer": "A",
      "explanation": "Detailed explanation of why this is correct and why others are wrong"
    }
  ]
}

IMPORTANT: Keep all questions, options, and explanations as single-line text. Make questions engaging and realistic. Ensure correct answers are distributed across all options (A, B, C, D).`,
        },
      ],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : null;

    if (!responseText) {
      throw new Error('No text response from Claude');
    }

    console.log('=== RAW CLAUDE RESPONSE ===');
    console.log(responseText.substring(0, 500)); // First 500 chars
    console.log('=== END RAW RESPONSE ===');

    // Clean response - remove markdown code blocks if present
    let cleanedText = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    console.log('=== CLEANED TEXT ===');
    console.log(cleanedText.substring(0, 500));
    console.log('=== END CLEANED ===');

    const generatedTest = JSON.parse(cleanedText);
    return generatedTest;
  } catch (error) {
    console.error('Test Generation Error:', error);
    throw error;
  }
};

/**
 * Generate interview questions for a specific job role
 * @param jobRole - Job role/position
 * @param experienceLevel - Years of experience or level
 * @param questionCount - Number of questions
 * @returns Generated test focused on job role
 */
export const generateJobSpecificTest = async (
  jobRole: string,
  experienceLevel: string,
  questionCount: number
): Promise<GeneratedTest> => {
  try {
    const message = await client.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: `Generate ${questionCount} interview questions specifically for a ${jobRole} position with ${experienceLevel} experience level.

Mix question types:
- 40% Technical/Skill-based questions
- 30% Behavioral/Situational questions
- 30% Role-specific knowledge questions

CRITICAL: Return ONLY valid JSON with NO line breaks within string values.

Return this exact JSON structure (no markdown, no extra text, no newlines in strings):
{
  "title": "Job role test title",
  "description": "Description focused on this role",
  "questions": [
    {
      "question": "The question text",
      "optionA": "First option",
      "optionB": "Second option",
      "optionC": "Third option",
      "optionD": "Fourth option",
      "correctAnswer": "A",
      "explanation": "Detailed explanation"
    }
  ]
}

Make questions realistic and relevant to actual interviews for this role. Keep all text on single lines.`,
        },
      ],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : null;

    if (!responseText) {
      throw new Error('No text response from Claude');
    }

    console.log('=== RAW CLAUDE RESPONSE (Job-Specific) ===');
    console.log(responseText.substring(0, 500));
    console.log('=== END RAW RESPONSE ===');

    let cleanedText = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    console.log('=== CLEANED TEXT (Job-Specific) ===');
    console.log(cleanedText.substring(0, 500));
    console.log('=== END CLEANED ===');

    const generatedTest = JSON.parse(cleanedText);
    return generatedTest;
  } catch (error) {
    console.error('Job Test Generation Error:', error);
    throw error;
  }
};

export default {
  generateMockTest,
  generateJobSpecificTest,
};
