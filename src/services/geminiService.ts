import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';

if (!apiKey) {
  console.warn('GEMINI_API_KEY not set. AI profile generation will not work.');
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

/**
 * Generate profile description from CV text using Gemini AI
 * @param cvText - Extracted text from CV
 * @returns Generated profile description
 */
export async function generateProfileFromCV(cvText: string): Promise<string> {
  if (!apiKey) {
    throw new Error('Gemini API key not configured');
  }

  if (!cvText || cvText.trim().length === 0) {
    throw new Error('CV text is empty');
  }

  const prompt = `Analyze this CV and create a professional 2-3 sentence profile description highlighting key skills, experience level, and expertise. Be concise and engaging.

CV Content:
${cvText.substring(0, 5000)}`; // Limit to first 5000 chars to avoid token limits

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text || text.trim().length === 0) {
      throw new Error('Generated profile is empty');
    }

    return text.trim();
  } catch (error) {
    console.error('Error generating profile from CV:', error);
    throw new Error('Failed to generate profile. Please try again.');
  }
}
