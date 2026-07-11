export type UserRole = "student" | "admin";

export type InterviewType = "technical" | "hr" | "behavioral" | "system-design";
export type InterviewDifficulty = "easy" | "medium" | "hard";
export type InterviewStatus = "in-progress" | "completed";

// ---------- AI service response shapes ----------

export interface AIQuestionsResponse {
  questions: string[];
}

export interface AIAnswerEvaluation {
  score: number;
  feedback: string;
}

export interface AIOverallInterviewFeedback {
  overallScore: number;
  overallFeedback: string;
}

export interface AIResumeAnalysis {
  atsScore: number;
  strengths: string[];
  weaknesses: string[];
  missingKeywords: string[];
  suggestions: string[];
}

export interface RoadmapWeek {
  week: number;
  title: string;
  topics: string[];
  resources: string[];
  milestone: string;
}

export interface AIRoadmapResponse {
  weeks: RoadmapWeek[];
}

// ---------- API response envelope ----------

export interface ApiSuccessBody<T = unknown> {
  success: true;
  message: string;
  data: T | null;
}

export interface ApiErrorBody {
  success: false;
  message: string;
  errors?: unknown;
}
