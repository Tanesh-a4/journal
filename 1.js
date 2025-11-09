import { GoogleGenerativeAI } from "@google/generative-ai";

// Make sure you have your API key set as an environment variable
// For example:  export GEMINI_API_KEY="your_api_key_here"
const API_KEY =" AIzaSyC6VZF08Ll_sKKi3ABesv8Vmr4Wp1sbiwA";

if (!API_KEY) {
  console.error("❌ GEMINI_API_KEY not set in environment variables!");
  process.exit(1);
}

const client = new GoogleGenerativeAI(API_KEY);

async function listModels() {
  console.log("List of models that support generateContent:\n");

  // The SDK doesn’t directly list models, so we use the REST API endpoint
  const response = await fetch("https://generativelanguage.googleapis.com/v1/models?key=" + API_KEY);
  const data = await response.json();

  if (data.models) {
    for (const model of data.models) {
      if (model.supportedGenerationMethods?.includes("generateContent")) {
        console.log(model.name);
      }
    }
  } else {
    console.error("No models found or invalid API key.");
  }
}

listModels().catch(err => console.error("Error:", err));
