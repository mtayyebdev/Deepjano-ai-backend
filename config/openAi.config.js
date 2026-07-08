import OpenAi from "openai";
import { ENV } from "./env.config.js";

export const openai = new OpenAi({
  baseURL: ENV.OPENAI_BASE_URL,
  apiKey: ENV.OPENAI_API_KEY,
});