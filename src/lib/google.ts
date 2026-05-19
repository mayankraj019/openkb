import { google } from '@ai-sdk/google';

export const getGeminiModel = () => google('gemini-2.5-flash');
