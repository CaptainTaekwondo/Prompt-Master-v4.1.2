
import { ImagePromptInputs } from '../types';

// --- Platform Strategy Groups ---
const DIRECT_PLATFORMS = ['Ideogram', 'Stable Diffusion', 'Leonardo.Ai', 'Playground AI', 'Adobe Firefly', 'Canva'];
const META_PLATFORMS = ['DALL-E 3', 'Gemini', 'ChatGPT', 'Copilot', 'Midjourney', 'Grok'];


// --- Helper Functions ---

// Gets a natural language prefix for aspect ratio.
const getAspectRatioText = (ratio: string): string => {
  const aspectRatios: { [key: string]: string } = {
    '16:9': 'A wide cinematic horizontal image of ',
    '9:16': 'A tall vertical portrait image of ',
    '1:1': 'A square image of ',
    '4:3': 'A wide standard image of ',
    '3:2': 'A landscape photography style image of ',
  };
  return aspectRatios[ratio] || '';
};


// --- Main Prompt Assembly Function ---
export const assembleImagePrompt = (settings: ImagePromptInputs): string => {
  const {
    idea, platform, style, composition, camera,
    lighting, fashionEra, videoEffect, aspectRatio, quality
  } = settings;

  // 1. Build the core visual description from all selected options.
  const styleElements = [
    style !== 'default' ? style : '',
    lighting !== 'default' ? lighting : '',
    composition !== 'default' ? composition : '',
    camera !== 'default' ? camera : '',
    fashionEra !== 'default' ? `${fashionEra} style` : '',
    videoEffect !== 'default' ? videoEffect : '',
    quality !== 'default' ? quality : ''
  ].filter(Boolean).join(', ');

  let corePrompt = idea;
  if (styleElements) {
    corePrompt += `, ${styleElements}`;
  }

  // --- Final Return (The Split) ---

  // CASE A: Direct Platforms (Ideogram, etc.)
  if (DIRECT_PLATFORMS.includes(platform)) {
    return corePrompt;
  }

  // CASE B & C: Meta Platforms (Midjourney, DALL-E, etc.)
  if (META_PLATFORMS.includes(platform)) {
    const metaPromptWrapper = `Act as a world-class photographer and I will provide you with a concept and you will create a detailed, realistic, and visually compelling image prompt based on it. Use the following key elements to craft your response:\n\n[INSTRUCTIONS]\n- Start with a clear, concise summary of the main subject and action.\n- Describe the setting and environment with rich, evocative language.\n- Detail the lighting, mood, and atmosphere to set the tone.\n- Specify the artistic style, composition, and camera view for a dynamic shot.\n- Mention any relevant character details, attire, or actions.\n- Use a comma-separated list of keywords at the end for emphasis.\n- Do NOT use any line breaks, only one block of text.\n\n[AVOID]\n- Do not include your own commentary or interpretation outside of the prompt itself.\n- Do not ask me any questions.\n- Do not use any line breaks in your response.`;

    // B: Midjourney
    if (platform === 'Midjourney') {
      return `${metaPromptWrapper}\n\n[MY IDEA]: \"${corePrompt}\" --ar ${aspectRatio}`;
    }
    
    // C: DALL-E / Gemini / ChatGPT
    const prefix = getAspectRatioText(aspectRatio);
    const prefixedDescription = `${prefix}${corePrompt}`;
    return `${metaPromptWrapper}\n\n[MY IDEA]: \"${prefixedDescription}\"`;
  }

  // Fallback for General Mode or any unhandled platform.
  return corePrompt;
};
