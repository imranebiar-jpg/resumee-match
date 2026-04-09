import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface AnalysisResult {
  matchScore: number;
  gapAnalysis: string[];
  coverLetter: string;
  summary: string;
}

export async function analyzeResume(resumeText: string, jobDescription: string): Promise<AnalysisResult> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Gemini API key is missing. Please configure it in the Secrets panel.");
  }

  const prompt = `
    You are an expert HR recruiter and career coach. 
    Analyze the following resume against the job description provided.
    
    Resume:
    ${resumeText}
    
    Job Description:
    ${jobDescription}
    
    Provide a structured analysis including:
    1. A match score (0-100).
    2. A gap analysis: a list of specific skills, experiences, or qualifications mentioned in the job description that are missing or weak in the resume.
    3. A brief summary of the match.
    4. A tailored cover letter draft that highlights the candidate's strengths relative to this specific job.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          matchScore: { type: Type.NUMBER },
          gapAnalysis: { 
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          summary: { type: Type.STRING },
          coverLetter: { type: Type.STRING }
        },
        required: ["matchScore", "gapAnalysis", "summary", "coverLetter"]
      }
    }
  });

  const result = JSON.parse(response.text || "{}");
  return result as AnalysisResult;
}
