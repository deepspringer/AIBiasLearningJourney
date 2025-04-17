import { ENGAGEMENT_GUIDANCE } from "@/constants/prompts";

export interface OpenAIRequest {
  systemPrompt: string;
  userMessage: string;
  chatHistory: Array<{ role: string; content: string }>;
}

export interface OpenAIResponse {
  message: string;
}

export interface BiasTestRequest {
  template: string;
  substitutions: string[];
}

export interface BiasTestResult {
  word: string;
  message: string;
  topLogprobs: Array<{ token: string; logprob: number }>;
}

export interface BiasTestResponse {
  results: BiasTestResult[];
}

export interface SaveConclusionRequest {
  conclusion: string;
}

export interface SaveConclusionResponse {
  success: boolean;
}
