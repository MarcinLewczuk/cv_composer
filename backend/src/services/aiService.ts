import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env['ANTHROPIC_API_KEY'],
});

/**
 * Generates a professional CV based on user input
 * @param userInput - User's raw information (experiences, education, skills, etc.)
 * @returns Generated CV content as a string
 */
export async function generateCV(userInput: string): Promise<string> {
  const message = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: `You are a professional CV writer. Based on the following information, create a well-formatted, professional CV in markdown format. Make it concise, impactful, and ATS-friendly (Applicant Tracking System compatible).

User Information:
${userInput}

Please structure the CV with these sections:
- Contact Information
- Professional Summary
- Work Experience
- Education
- Skills
- Certifications (if any)

Make it compelling and highlight achievements.`,
      },
    ],
  });

  // Extract text content from the response
  const content = message.content[0];
  if (content.type === 'text') {
    return content.text;
  }
  throw new Error('Unexpected response type from Claude API');
}

/**
 * Reviews a CV and provides detailed feedback
 * @param cvContent - The CV text to review
 * @returns Detailed review and improvement suggestions
 */
export async function reviewCV(cvContent: string): Promise<string> {
  const message = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: `You are an expert CV reviewer and career coach. Please review the following CV and provide constructive feedback. Be specific and actionable.

CV Content:
${cvContent}

Please analyze and provide feedback on:
1. **Impact and Clarity** - Are achievements clear and compelling?
2. **ATS Optimization** - Will this pass Applicant Tracking Systems?
3. **Formatting** - Is it well-structured and easy to read?
4. **Content Quality** - Is there relevant skills and experience highlighted?
5. **Improvements** - Specific suggestions for enhancement
6. **Strengths** - What's working well in this CV?
7. **Action Items** - Top 3 changes to make immediate impact

Format your response as a clear review with sections.`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type === 'text') {
    return content.text;
  }
  throw new Error('Unexpected response type from Claude API');
}

/**
 * Tailors a CV for a specific job description
 * @param cvContent - The original CV
 * @param jobDescription - The target job description
 * @returns Tailored CV content
 */
export async function tailorCVForJob(cvContent: string, jobDescription: string): Promise<string> {
  const message = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: `You are a career coach specializing in CV optimization. Please tailor the following CV to match the job description. Highlight relevant skills and experiences that align with the job requirements.

Original CV:
${cvContent}

Job Description:
${jobDescription}

Please create a tailored version of this CV that:
1. Emphasizes the most relevant skills and experiences for this role
2. Uses keywords from the job description naturally
3. Reorganizes bullet points to highlight matching qualifications first
4. Maintains authenticity (don't add false information)
5. Keeps the same professional structure

Provide only the tailored CV content in markdown format.`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type === 'text') {
    return content.text;
  }
  throw new Error('Unexpected response type from Claude API');
}

/**
 * Generates interview questions based on CV content
 * @param cvContent - The CV to generate questions from
 * @param jobDescription - Optional job description for targeted questions
 * @returns Array of interview questions
 */
export async function generateInterviewQuestions(
  cvContent: string,
  jobDescription?: string,
): Promise<string[]> {
  const jobContext = jobDescription ? `\n\nJob Description:\n${jobDescription}` : '';

  const message = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `Based on the following CV${jobDescription ? ' and job description' : ''}, generate 8-10 relevant interview questions that would be asked by a hiring manager.${jobContext}

CV Content:
${cvContent}

Return ONLY a JSON array of questions strings, like: ["Question 1?", "Question 2?", ...]

Format: Valid JSON array with no additional text.`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type === 'text') {
    try {
      // Extract JSON array from response
      const jsonMatch = content.text.match(/\[.*\]/s);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Could not parse questions');
    } catch (e) {
      console.error('Failed to parse interview questions:', e);
      return [];
    }
  }
  throw new Error('Unexpected response type from Claude API');
}
