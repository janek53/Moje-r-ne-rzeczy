import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";
import { ImagePart, TextPart } from '../types';

/**
 * Initializes the GoogleGenAI client.
 * Assumes process.env.API_KEY is available in the environment.
 * A new instance is created on each call to ensure the latest API key is used,
 * especially relevant for Veo models where the key might be selected at runtime.
 */
const getGeminiClient = () => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY is not defined. Please ensure it's set in your environment.");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

/**
 * Edits an image using the Gemini 2.5 Flash Image model based on a text prompt.
 *
 * @param base64Image The base64 encoded string of the image to be edited.
 * @param mimeType The MIME type of the image (e.g., 'image/png', 'image/jpeg').
 * @param prompt The text prompt describing the desired edit.
 * @returns A Promise that resolves to the base64 encoded string of the edited image.
 * @throws An error if the API call fails or the response does not contain an image.
 */
export const editImage = async (
  base64Image: string,
  mimeType: string,
  prompt: string,
): Promise<string> => {
  try {
    const ai = getGeminiClient();

    const imagePart: ImagePart = {
      inlineData: {
        data: base64Image,
        mimeType: mimeType,
      },
    };

    const textPart: TextPart = {
      text: prompt,
    };

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [imagePart, textPart],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    const editedImagePart = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;

    if (editedImagePart?.data && editedImagePart?.mimeType) {
      return `data:${editedImagePart.mimeType};base64,${editedImagePart.data}`;
    } else {
      throw new Error('No edited image found in the response.');
    }
  } catch (error) {
    console.error('Error editing image:', error);
    // You might want to parse the error for more specific messages
    if (error instanceof Error) {
        throw new Error(`Failed to edit image: ${error.message}`);
    } else {
        throw new Error('An unknown error occurred during image editing.');
    }
  }
};
