import { GoogleGenAI, Modality } from "@google/genai";

// A utility function to convert a data URL to a base64 string and mime type
const dataUrlToParts = (
  dataUrl: string
): { mimeType: string; data: string } => {
  const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!match) {
    throw new Error("Invalid data URL format");
  }
  const [, mimeType, data] = match;
  return { mimeType, data };
};

export async function upscaleImage(
  base64ImageDataUrl: string,
  prompt: string
): Promise<string> {
  // Ensure the API key is available
  if (!import.meta.env.VITE_API_KEY) {
    // Changed to import.meta.env
    throw new Error("VITE_API_KEY environment variable not set."); // Updated error message
  }

  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY }); // Changed to import.meta.env

  const { mimeType, data } = dataUrlToParts(base64ImageDataUrl);

  const imagePart = {
    inlineData: {
      mimeType,
      data,
    },
  };

  const textPart = {
    text: prompt,
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [imagePart, textPart],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    // The response can contain multiple parts, find the image part
    const imageParts = response.candidates?.[0]?.content?.parts?.filter(
      (part) => part.inlineData
    );

    if (imageParts && imageParts.length > 0 && imageParts[0].inlineData) {
      const upscaledImageData = imageParts[0].inlineData;
      return `data:${upscalImageData.mimeType};base64,${upscalImageData.data}`;
    } else {
      // Check for text part which might contain a safety message or refusal
      const textResponse = response.text;
      if (textResponse) {
        throw new Error(
          `The model returned a text response instead of an image: "${textResponse}"`
        );
      }
      throw new Error(
        "Upscaling failed: No image data was returned from the API."
      );
    }
  } catch (error) {
    console.error("Gemini API call failed:", error);
    throw new Error(
      "Failed to communicate with the AI model. Please check your prompt and try again."
    );
  }
}

export async function generateTextFromImage(
  base64ImageDataUrl: string
): Promise<string> {
  if (!import.meta.env.VITE_API_KEY) {
    // Changed to import.meta.env
    throw new Error("VITE_API_KEY environment variable not set."); // Updated error message
  }
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY }); // Changed to import.meta.env
  const { mimeType, data } = dataUrlToParts(base64ImageDataUrl);

  const imagePart = { inlineData: { mimeType, data } };
  const textPart = {
    text: "Describe this image in detail for a text-to-image prompt. Focus on the subject, setting, style, and composition.",
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: [imagePart, textPart] },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API call failed for text generation:", error);
    throw new Error("Failed to generate description from image.");
  }
}

export async function enhancePrompt(
  basePrompt: string,
  negativePrompt: string,
  model: string,
  style: string
): Promise<string> {
  if (!import.meta.env.VITE_API_KEY) {
    // Changed to import.meta.env
    throw new Error("VITE_API_KEY environment variable not set."); // Updated error message
  }
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY }); // Changed to import.meta.env

  const systemInstruction = `You are a master prompt engineer for text-to-image AI models. Your goal is to expand a user's simple prompt into a rich, detailed, and effective positive prompt, and generate a corresponding negative prompt based on user input and general best practices.

**Output Format:**
You MUST return the positive and negative prompts separated by "---".
Example:
[Positive Prompt Here]
---
[Negative Prompt Here]

**Model-Specific Instructions:**
- **Flux:** Use natural, descriptive language for the positive prompt. The negative prompt should also be in natural language.
- **Qwen:** Be more direct and keyword-focused for the positive prompt. The negative prompt should list undesirable concepts.
- **SDXL:** Generate a highly detailed positive prompt using comma-separated keywords, artistic styles, and camera details. Use weighting like (word:1.2) for emphasis. The negative prompt should be a comprehensive list of common negative embeddings and concepts like 'ugly, tiling, poorly drawn hands, poorly drawn feet, out of frame, extra limbs, disfigured, deformed, body out of frame, blurry, bad anatomy, blurred, watermark, grainy, signature, cut off, draft'.

Do not include any other explanations, just the formatted prompts.`;

  const styleInstruction = style
    ? ` with a blend of the following style(s): "${style}"`
    : "";
  const userPrompt = `Enhance this prompt for the ${model} model${styleInstruction}.
Base prompt: "${basePrompt}"
User's negative prompt ideas: "${
    negativePrompt || "None, use standard negative prompts."
  }"`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: userPrompt,
      config: { systemInstruction },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API call failed for prompt enhancement:", error);
    throw new Error("Failed to enhance prompt.");
  }
}

export async function enhanceVideoPrompt(basePrompt: string): Promise<string> {
  if (!import.meta.env.VITE_API_KEY) {
    // Changed to import.meta.env
    throw new Error("VITE_API_KEY environment variable not set."); // Updated error message
  }
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY }); // Changed to import.meta.env

  const systemInstruction = `You are a master cinematographer and AI video prompt engineer. Your task is to take a user's prompt, which includes a scene description and a camera motion, and embellish it with vivid details. Add descriptive adjectives, specify lighting conditions (e.g., 'golden hour light', 'ominous moonlight'), and suggest atmospheric elements (e.g., 'wisps of fog', 'dust motes dancing in the air') to make the final prompt more cinematic and evocative. Do not change the core subject or the camera motion. Output only the enhanced prompt.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: basePrompt,
      config: { systemInstruction },
    });
    return response.text;
  } catch (error) {
    console.error(
      "Gemini API call failed for video prompt enhancement:",
      error
    );
    throw new Error("Failed to enhance video prompt.");
  }
}
