
import { PropmtSettings } from "../types";

export const generatePromptLocally = (idea: string, settings: PropmtSettings): string => {
  const { platform, style, lighting, camera, artist, color, quality, composition } = settings;

  const promptParts = [idea];

  if (platform && platform !== 'none') {
    promptParts.push(`on the ${platform} platform`);
  }
  if (style && style !== 'none') {
    promptParts.push(`in a ${style} style`);
  }
  if (lighting && lighting !== 'none') {
    promptParts.push(`with ${lighting} lighting`);
  }
  if (camera && camera !== 'none') {
    promptParts.push(`using a ${camera} camera`);
  }
    if (artist && artist !== 'none') {
    promptParts.push(`inspired by the artist ${artist}`);
  }
    if (color && color !== 'none') {
    promptParts.push(`with a ${color} color palette`);
  }
    if (quality && quality !== 'none') {
    promptParts.push(`in ${quality} quality`);
  }
    if (composition && composition !== 'none') {
    promptParts.push(`with a ${composition} composition`);
  }


  return promptParts.join(', ');
};
