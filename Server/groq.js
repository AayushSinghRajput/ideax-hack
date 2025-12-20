import fs from "fs";
import Groq from "groq-sdk";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Initialize the Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY 
});

async function main() {
  // Create a translation job
  const translation = await groq.audio.translations.create({
    file: fs.createReadStream("sample.mp4"), // Required path to audio file
    model: "whisper-large-v3", // Required model to use for translation
    prompt: "Specify context or spelling", // Optional
    language: "en", // Optional ('en' only)
    response_format: "json", // Optional
    temperature: 0.0, // Optional
  });
  
  // Log the transcribed text
  console.log(translation.text);
}

main().catch(console.error);