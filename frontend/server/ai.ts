import { GoogleGenerativeAI } from '@google/generative-ai';
import { DigestResponse } from './types.js';
import { ExtractedDocument } from './parser.js';

const SYSTEM_PROMPT = `You are an inclusive university learning assistant helping Moroccan university students (French-Baccalaureate freshmen transitioning to English, ADHD learners, and dyslexic students).

CRITICAL REQUIREMENT:
Focus STRICTLY and EXCLUSIVELY on the academic discipline, scientific, mathematical, or engineering subject matter taught in the document or slides (for example: Multivariable Calculus, Functions of Several Variables, Domains and Ranges, Level Curves and Contour Maps, Limits, Continuity, Partial Derivatives).

STRICT PROHIBITIONS:
1. NEVER extract presentation, software, or file format terminology as concepts or glossary terms (e.g., 'Slide Deck', 'Metadata', 'Aspect Ratio', 'Vector Graphics', 'Embedded Object', 'PowerPoint', 'Layout', 'Slide 1', 'Professor', 'Author', 'Widescreen').
2. NEVER discuss how the slides were formatted, the screen dimensions, or who created the slides.
3. If slide formatting or templates appear, ignore them completely and focus 100% on the actual academic concepts, definitions, and theorems taught to students.

Return ONLY valid JSON matching this exact schema (no markdown fences, no commentary):
{
  "title": "Concise, descriptive academic subject title (e.g., 'Functions of Several Variables, Contour Maps & Limits')",
  "overview": "2-3 sentence plain-English big picture summary of the academic mathematics/science taught in this lecture.",
  "glossary": [
    {
      "term": "Academic or mathematical term from the lecture",
      "simpleEnglish": "Clear 1-sentence plain-English explanation",
      "french": "Accurate French equivalent and meaning for French-Bac students (e.g. 'Fonction de deux variables : ...')",
      "darija": "Natural, friendly Moroccan Darija explanation in Latin script (e.g., 'B7al ila...')"
    }
  ],
  "microCards": [
    {
      "id": 1,
      "title": "Short 3-6 word concept title",
      "estimatedMinutes": 3,
      "keyPoints": ["Bullet 1 (max 16 words)", "Bullet 2 (max 16 words)", "Bullet 3 (max 16 words)"],
      "recallQuestion": "One crisp active-recall question testing this concept",
      "recallAnswer": "Clear 1-2 sentence answer"
    }
  ],
  "audioScript": "A natural, spoken-style 60 to 90 second study recap written to be read aloud clearly by text-to-speech. Avoid raw LaTeX, symbols, or bullet markers."
}

Rules:
- Include 6 to 10 items in glossary and 4 to 6 items in microCards.
- Stay strictly faithful to the academic content; never invent unrelated facts.
- Keep language clear, warm, and accessible.
`;

function cleanJsonString(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return cleaned.trim();
}

/**
 * Generates an accessible digest using the Google Gemini API.
 * Supports both text extraction and multimodal visual slide analysis.
 */
export async function generateLectureDigest(
  docOrText: ExtractedDocument | string,
  fileName: string
): Promise<Omit<DigestResponse, 'id' | 'cached' | 'fileName'>> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey || apiKey === 'your_gemini_key_here' || apiKey.length < 8) {
    throw new Error('MISSING_GEMINI_KEY: No Gemini API Key configured. Please enter your free Gemini API key to analyze this document.');
  }

  const extractedDoc: ExtractedDocument = typeof docOrText === 'string'
    ? { fileHash: '', text: docOrText, charCount: docOrText.length }
    : docOrText;

  // Model candidates prioritized for stability, vision capability, and zero 404/503 errors
  const modelCandidates = [
    'gemini-3-flash-preview',
    'gemini-flash-latest',
    'gemini-2.5-flash',
  ];

  let lastError: any = null;

  for (const modelName of modelCandidates) {
    try {
      console.log(`[Gemini AI] Calling model: ${modelName} for file: ${fileName}...`);
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      // Prepare multimodal or text prompt
      const contents: any[] = [];
      const introText = `${SYSTEM_PROMPT}\n\nDocument File Name: ${fileName}\n`;

      if (extractedDoc.slideImages && extractedDoc.slideImages.length > 0) {
        console.log(`[Gemini AI] Analyzing ${extractedDoc.slideImages.length} slide visuals with multimodal vision...`);
        contents.push({
          text: `${introText}\nAnalyze the following university lecture slides. Read and transcribe all definitions, formulas, graphs, and theorems shown in the images:`,
        });

        // Pass up to 12 primary slide images to stay well within token and payload limits
        const selectedImages = extractedDoc.slideImages.slice(0, 12);
        for (const img of selectedImages) {
          contents.push({
            inlineData: {
              mimeType: img.mimeType,
              data: img.base64,
            },
          });
        }

        if (extractedDoc.text && extractedDoc.text.length > 50) {
          contents.push({
            text: `Additional extracted text notes:\n"""\n${extractedDoc.text}\n"""`,
          });
        }
      } else {
        const textContent = extractedDoc.text && extractedDoc.text.length > 0
          ? extractedDoc.text
          : `University Lecture: ${fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')}`;
        
        contents.push({
          text: `${introText}\nLecture Extracted Text:\n"""\n${textContent}\n"""`,
        });
      }

      const result = await model.generateContent(contents);
      const responseText = result.response.text();
      const cleanedJson = cleanJsonString(responseText);
      const parsed = JSON.parse(cleanedJson);

      return {
        title: parsed.title || fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
        overview: parsed.overview || 'Lecture digest generated successfully.',
        glossary: Array.isArray(parsed.glossary) ? parsed.glossary : [],
        microCards: Array.isArray(parsed.microCards) ? parsed.microCards : [],
        audioScript: parsed.audioScript || parsed.overview || 'Welcome to this lecture digest.',
      };
    } catch (err: any) {
      console.warn(`[Gemini AI] Model ${modelName} encountered an issue:`, err?.message || err);
      lastError = err;
    }
  }

  throw new Error(`Gemini AI generation failed: ${lastError?.message || 'All model candidates failed.'}`);
}
