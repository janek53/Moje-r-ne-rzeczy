/**
 * Represents the structure for an image part in the Gemini API.
 */
export interface ImagePart {
  inlineData: {
    mimeType: string;
    data: string;
  };
}

/**
 * Represents the structure for a text part in the Gemini API.
 */
export interface TextPart {
  text: string;
}

/**
 * Type for content parts that can be sent to Gemini API.
 */
export type ContentPart = ImagePart | TextPart;