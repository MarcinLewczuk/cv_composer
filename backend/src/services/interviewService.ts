import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface GeneratedInterviewQuestion {
  question: string;
  questionType: 'technical' | 'behavioral' | 'situational' | 'role-specific';
  sampleAnswer: string;
  tips: string;
}

export interface GeneratedInterview {
  jobRole: string;
  experienceLevel: string;
  questions: GeneratedInterviewQuestion[];
}

/**
 * Generate interview questions for a specific job role
 * @param jobRole - Job role/position
 * @param experienceLevel - Years of experience or level (entry, mid, senior)
 * @param questionCount - Number of questions to generate
 * @returns Generated interview questions with sample answers and tips
 */
export const generateInterviewQuestions = async (
  jobRole: string,
  experienceLevel: string,
  questionCount: number
): Promise<GeneratedInterview> => {
  try {
    const message = await client.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: `Generate ${questionCount} realistic interview questions for a ${jobRole} position at ${experienceLevel} experience level.

Create a balanced mix of question types:
- 30% Technical questions (skills, tools, methodologies specific to the role)
- 30% Behavioral questions (past experiences, teamwork, problem-solving)
- 20% Situational questions (hypothetical scenarios)
- 20% Role-specific questions (industry knowledge, best practices)

For each question provide:
1. The question itself (clear and specific)
2. Question type (technical, behavioral, situational, or role-specific)
3. A sample strong answer (2-3 paragraphs showing STAR method for behavioral, detailed technical knowledge for technical questions)
4. Tips for answering (what interviewers are looking for, common mistakes to avoid)

CRITICAL FORMATTING RULES:
- Return ONLY valid, parseable JSON
- Use compact/minified JSON format (no unnecessary whitespace or line breaks)
- All string values MUST be valid JSON strings on a single line
- Never include literal line breaks, tabs, or control characters inside string values
- Write sample answers as continuous text - use periods and spaces, not paragraph breaks
- If you need to show structure in answers, use numbered points like: "1. First point 2. Second point"

Return compact JSON in this structure:
{
  "jobRole": "${jobRole}",
  "experienceLevel": "${experienceLevel}",
  "questions": [
    {
      "question": "The interview question",
      "questionType": "technical",
      "sampleAnswer": "A comprehensive sample answer demonstrating best practices",
      "tips": "Key tips for answering this question effectively"
    }
  ]
}

Make questions realistic, relevant to actual ${jobRole} interviews at ${experienceLevel} level, and ensure they assess different competencies.`,
        },
      ],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : null;

    if (!responseText) {
      throw new Error('No text response from Claude');
    }

    console.log('=== RAW CLAUDE RESPONSE (Interview) ===');
    console.log(responseText.substring(0, 500));
    console.log('=== END RAW RESPONSE ===');

    // Clean response - remove markdown code blocks if present
    let cleanedText = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    console.log('=== CLEANED TEXT (Interview) ===');
    console.log(cleanedText.substring(0, 500));
    console.log('=== END CLEANED ===');

    const generatedInterview = JSON.parse(cleanedText);
    return generatedInterview;
  } catch (error) {
    console.error('Interview Generation Error:', error);
    throw error;
  }
};
