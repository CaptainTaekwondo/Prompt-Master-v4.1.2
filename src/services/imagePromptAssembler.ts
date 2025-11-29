'''
import { ImagePromptInputs } from '../types';

// Grouping platforms for easier logic management
const aR_MODELS: string[] = ['Midjourney'];
const NL_MODELS: string[] = ['DALL-E 3', 'ChatGPT', 'Gemini', 'Copilot', 'Grok'];
const UI_MODELS: string[] = ['Stable Diffusion', 'Leonardo.Ai', 'Playground AI', 'Adobe Firefly', 'Canva', 'Ideogram'];

const getAspectRatioPrefix = (ratio: string): string => {
  switch (ratio) {
    case '16:9': return 'A wide cinematic horizontal image of ';
    case '9:16': return 'A tall vertical portrait image of ';
    case '1:1': return 'A square image of ';
    case '4:3': return 'A wide standard image of ';
    case '3:2': return 'A landscape photography style image of ';
    default: return '';
  }
};

export const assembleImagePrompt = (settings: ImagePromptInputs): string => {
  const { idea, platform, style, composition, camera, lighting, fashionEra, videoEffect, aspectRatio, quality } = settings;

  let prompt = '';
  let finalPrompt = '';

  // 1. Build the core description
  let description = idea;

  // Add visual style elements for platforms that use them in the text
  if (!UI_MODELS.includes(platform)) {
    const styleElements = [
      style !== 'default' ? style : '',
      lighting !== 'default' ? lighting : '',
      composition !== 'default' ? composition : '',
      camera !== 'default' ? camera : '',
      fashionEra !== 'default' ? `${fashionEra} style` : '',
      videoEffect !== 'default' ? videoEffect : '',
      quality !== 'default' ? quality : ''
    ].filter(Boolean).join(', ');

    if (styleElements) {
      description += `, in a ${styleElements} style`;
    }
  }

  // 2. Handle platform-specific formatting
  if (NL_MODELS.includes(platform)) {
    // Natural Language Models
    const prefix = getAspectRatioPrefix(aspectRatio);
    finalPrompt = `Act as a world-class photographer and I will provide you with a concept and you will create a detailed, realistic, and visually compelling image prompt based on it. Use the following key elements to craft your response:

[INSTRUCTIONS]
- Start with a clear, concise summary of the main subject and action.
- Describe the setting and environment with rich, evocative language.
- Detail the lighting, mood, and atmosphere to set the tone.
- Specify the artistic style, composition, and camera view for a dynamic shot.
- Mention any relevant character details, attire, or actions.
- Use a comma-separated list of keywords at the end for emphasis.
- Do NOT use any line breaks, only one block of text.

[AVOID]
- Do not include your own commentary or interpretation outside of the prompt itself.
- Do not ask me any questions.
- Do not use any line breaks in your response.

[MY IDEA]: "${prefix}${description}"`;
  } else if (aR_MODELS.includes(platform)) {
    // --ar parameter models (Midjourney)
    finalPrompt = `Act as a world-class photographer and I will provide you with a concept and you will create a detailed, realistic, and visually compelling image prompt based on it. Use the following key elements to craft your response:

[INSTRUCTIONS]
- Start with a clear, concise summary of the main subject and action.
- Describe the setting and environment with rich, evocative language.
- Detail the lighting, mood, and atmosphere to set the tone.
- Specify the artistic style, composition, and camera view for a dynamic shot.
- Mention any relevant character details, attire, or actions.
- Use a comma-separated list of keywords at the end for emphasis.
- Do NOT use any line breaks, only one block of text.

[AVOID]
- Do not include your own commentary or interpretation outside of the prompt itself.
- Do not ask me any questions.
- Do not use any line breaks in your response.

[MY IDEA]: "${description}" --ar ${aspectRatio}`;
  } else if (platform === 'Ideogram') {
    // Ideogram - Clean, descriptive prompt
    finalPrompt = description;
  } else {
    // Other/UI-based models (Stable Diffusion, etc.)
    finalPrompt = description;
  }

  return finalPrompt;
};
''