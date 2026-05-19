import { createOpenAI } from '@ai-sdk/openai';

// OpenRouter Provider using AI SDK
export const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY || 'dummy_key',
});

// We can use any free or premium Llama model from OpenRouter
export const getLlamaModel = () => openrouter.chat('meta-llama/llama-3.1-8b-instruct:free');
