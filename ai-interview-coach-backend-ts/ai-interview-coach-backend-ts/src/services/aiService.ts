import { GoogleGenerativeAI } from "@google/generative-ai";import logger from "../utils/logger";
import {
  AIQuestionsResponse,
  AIAnswerEvaluation,
  AIOverallInterviewFeedback,
  AIResumeAnalysis,
  AIRoadmapResponse,
  InterviewType,
  InterviewDifficulty,
} from "../types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-1.5-flash";

// Calls the model and forces a JSON-only response, parsing it into type T.
// Centralizing this here means every feature (interview, resume, roadmap)
// talks to the AI the same way and we only handle parsing/error-cases once.
const getJsonCompletion = async <T>(systemPrompt: string, userPrompt: string): Promise<T> => {
  try {
    // 1. Get the model and pass the system prompt as an instruction
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      systemInstruction: systemPrompt,
    });

    // 2. Configure it to force a strict JSON response
    const generationConfig = {
      temperature: 0.6,
      responseMimeType: "application/json",
    };

    // 3. Call the API
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      generationConfig,
    });

    const raw = result.response.text();
    
    if (!raw) {
      throw new Error("Received empty response from Gemini");
    }

    return JSON.parse(raw) as T;
  } catch (error: any) {
    logger.error("AI service error:", error.message || error);
    // Passing the actual error message to Postman helps with debugging!
    throw new Error(`AI generation failed: ${error.message}`);
  }
};

// ---------------- MOCK INTERVIEW ----------------

export const generateInterviewQuestions = async (
  role: string,
  type: InterviewType,
  difficulty: InterviewDifficulty,
  count = 5
): Promise<string[]> => {
  const systemPrompt = `You are an expert technical interviewer. Generate realistic ${difficulty} difficulty ${type} interview questions for the role "${role}".
Respond ONLY with valid JSON in this exact shape:
{ "questions": ["question 1", "question 2", ...] }`;

  const userPrompt = `Generate exactly ${count} interview questions.`;

  const result = await getJsonCompletion<AIQuestionsResponse>(systemPrompt, userPrompt);
  return result.questions || [];
};

export const evaluateAnswer = async (
  role: string,
  question: string,
  answer: string
): Promise<AIAnswerEvaluation> => {
  const systemPrompt = `You are an expert interview coach evaluating a candidate's answer for a "${role}" interview.
Score the answer from 0-10 and give short, constructive, actionable feedback.
Respond ONLY with valid JSON in this exact shape:
{ "score": number, "feedback": "string" }`;

  const userPrompt = `Question: ${question}\nCandidate Answer: ${answer}`;

  return getJsonCompletion<AIAnswerEvaluation>(systemPrompt, userPrompt);
};

export const generateOverallInterviewFeedback = async (
  role: string,
  qaList: { question: string; answer: string | null; score: number | null }[]
): Promise<AIOverallInterviewFeedback> => {
  const systemPrompt = `You are an expert interview coach. Given a full interview transcript for the role "${role}",
give an overall score (0-10) and a summary of strengths, weaknesses, and improvement tips.
Respond ONLY with valid JSON in this exact shape:
{ "overallScore": number, "overallFeedback": "string" }`;

  const userPrompt = JSON.stringify(qaList);

  return getJsonCompletion<AIOverallInterviewFeedback>(systemPrompt, userPrompt);
};

// ---------------- RESUME ANALYZER ----------------

export const analyzeResume = async (
  resumeText: string,
  targetRole?: string
): Promise<AIResumeAnalysis> => {
  const systemPrompt = `You are an expert ATS (Applicant Tracking System) and resume reviewer.
Analyze the resume text for the target role "${targetRole || "General Software Role"}".
Respond ONLY with valid JSON in this exact shape:
{
  "atsScore": number (0-100),
  "strengths": ["string", ...],
  "weaknesses": ["string", ...],
  "missingKeywords": ["string", ...],
  "suggestions": ["string", ...]
}`;

  const userPrompt = `Resume Content:\n${resumeText.slice(0, 12000)}`;

  return getJsonCompletion<AIResumeAnalysis>(systemPrompt, userPrompt);
};

// ---------------- AI ROADMAP ----------------

export const generateRoadmap = async (
  targetRole: string,
  currentSkills: string[] = [],
  durationWeeks = 12
): Promise<AIRoadmapResponse> => {
  const systemPrompt = `You are a career mentor creating a personalized, week-by-week placement preparation roadmap
for the target role "${targetRole}". The learner's current skills are: ${currentSkills.join(", ") || "none specified"}.
Create a roadmap spanning ${durationWeeks} weeks.
Respond ONLY with valid JSON in this exact shape:
{
  "weeks": [
    { "week": number, "title": "string", "topics": ["string", ...], "resources": ["string", ...], "milestone": "string" }
  ]
}`;

  const userPrompt = `Generate the ${durationWeeks}-week roadmap now.`;

  return getJsonCompletion<AIRoadmapResponse>(systemPrompt, userPrompt);
};
