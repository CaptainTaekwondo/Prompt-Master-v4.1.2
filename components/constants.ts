import type { Platform, PromptSettings, ProfessionalTextSettings } from '../types.ts';

// Image Generation Constants
export const BASE_IMAGE_STYLES = ['default', 'cinematic', 'photorealistic', 'anime', 'fantasy art', 'vaporwave', 'cyberpunk', 'watercolor', 'vector_art', 'minimalist', '3d_render', 'impressionism', 'surrealism', 'pop_art', 'pixel_art', 'graffiti'];
export const BASE_IMAGE_LIGHTING = ['default', 'dramatic lighting', 'soft light', 'golden hour', 'neon glow', 'studio lighting', 'volumetric lighting', 'natural_light', 'cinematic_lighting', 'backlight', 'rim_light'];
export const BASE_IMAGE_COMPOSITIONS = ['default', 'wide-angle shot', 'close-up shot', 'dutch angle', 'top-down view', 'portrait', 'landscape', 'rule_of_thirds', 'leading_lines', 'symmetry', 'golden_ratio'];
export const CAMERA_ANGLES = ['default', 'eye_level', 'low_angle', 'high_angle', 'overhead_shot', 'birds_eye_view'];
export const MOODS = ['default', 'dramatic', 'serene', 'nostalgic', 'energetic', 'mysterious', 'cheerful', 'eerie'];
export const COLOR_PALETTES = ['default', 'vibrant', 'monochromatic', 'pastel', 'earth_tones', 'neon', 'black_and_white'];
export const ASPECT_RATIOS = ['16:9', '9:16', '1:1', '4:3', '3:2'];
export const QUALITIES = ['default', 'HD', 'FHD', '4K', '8K'];
export const IMAGE_PURPOSES = ['default', 'portrait_photography', 'product_shot', 'landscape_art', 'social_media_post', 'architectural_visualization', 'food_photography', 'fashion_shoot', 'concept_art', 'stock_photo', 'wildlife_photography', 'abstract_art', 'logo_design', 'character_design', 'cinematic_still', 'ui_element', 'storyboard_frame'];

// --- Dynamic Options based on Image Purpose ---
const imagePurposeOptionOverrides: Record<string, Partial<Record<'styles' | 'lighting' | 'compositions', string[]>>> = {
  logo_design: {
    styles: ['default', 'vector_art', 'minimalist', '3d_render'],
    compositions: ['default', 'close-up shot'],
  },
  character_design: {
    styles: ['default', 'anime', 'fantasy art', '3d_render', 'chibi'],
  },
  cinematic_still: {
    styles: ['default', 'cinematic', 'photorealistic'],
    lighting: ['default', 'dramatic lighting', 'cinematic_lighting', 'low_key', 'neon_noir'],
  },
  wildlife_photography: {
    styles: ['default', 'photorealistic'],
    lighting: ['default', 'natural_light', 'golden hour', 'soft light'],
    compositions: ['default', 'close-up shot', 'wide-angle shot', 'landscape'],
  },
  abstract_art: {
    styles: ['default', 'minimalist', 'watercolor', 'vaporwave'],
    compositions: ['default', 'top-down view'],
  },
  ui_element: {
    styles: ['default', 'minimalist', 'vector_art', '3d_render'],
    lighting: ['default', 'soft light', 'studio lighting'],
  },
  storyboard_frame: {
    styles: ['default', 'anime', 'cinematic'],
    compositions: ['default', 'wide-angle shot', 'medium_shot', 'close-up shot'],
  },
};

export const getImageOptionsForPurpose = (purpose: string) => {
  const overrides = imagePurposeOptionOverrides[purpose] || {};
  return {
    styles: overrides.styles || BASE_IMAGE_STYLES,
    lighting: overrides.lighting || BASE_IMAGE_LIGHTING,
    compositions: overrides.compositions || BASE_IMAGE_COMPOSITIONS,
  };
};


// New Video Generation Constants
export const VIDEO_PURPOSES = ['default', 'cinematic_film', 'social_media_ad', 'short_reel', 'documentary', 'animation', 'music_video', 'explainer_video', 'product_visualization', 'ugc_style_ad', 'viral_meme_video'];
export const VIDEO_DURATIONS = [
    { value: 'short', label: 'Short (Up to 5s)', prompt: 'a 5 second video' },
    { value: 'medium', label: 'Medium (5-15s)', prompt: 'a 15 second video' },
    { value: 'long', label: 'Long (15-30s)', prompt: 'a 30 second video' },
    { value: 'one_minute', label: '1 Minute', prompt: 'a one minute video' },
    { value: 'two_minutes', label: '2 Minutes', prompt: 'a two minute video' },
    { value: 'extended', label: 'Extended (2m+)', prompt: 'an extended video clip over two minutes long' },
];

// --- Base Video Options (for 'default' purpose) ---
const BASE_VIDEO_STYLES = ['default', 'cinematic', 'documentary', 'vlog', 'vintage_8mm', 'epic_fantasy', 'sci_fi', 'horror', 'dreamlike'];
const BASE_VIDEO_LIGHTING = ['default', 'natural_light', 'studio_lighting', 'golden_hour', 'blue_hour', 'neon_noir', 'high_key', 'low_key', 'cinematic_lighting'];
const BASE_VIDEO_CAMERA_SHOTS = ['default', 'wide_shot', 'medium_shot', 'close_up', 'extreme_close_up', 'drone_shot', 'fpv', 'tracking_shot', 'slow_motion', 'time_lapse', 'dutch_angle'];
export const BASE_VIDEO_CAMERA_MOVEMENTS = ['default', 'Static Shot', 'Pan Right', 'Pan Left', 'Tilt Up', 'Tilt Down', 'Dolly In', 'Dolly Out', 'Zoom In', 'Zoom Out', 'Tracking Shot', 'Crane Shot', 'Handheld Shot', 'Whip Pan', 'Arc Shot', 'Dutch Angle', 'FPV Shot', 'Drone Flyover', 'Drone Orbit', 'Drone Follow', 'Vertigo Effect', 'Pedestal Up', 'Pedestal Down', 'Truck Left', 'Truck Right'];
const BASE_FASHION_ERAS = ['default', 'modern', 'futuristic', '1920s_flapper', '1970s_disco', '1980s_neon', 'cyberpunk', 'ancient_egyptian', 'victorian_era', 'medieval_knight', 'steampunk'];
const BASE_VIDEO_EFFECTS = ['default', 'no_effects', 'lens_flare', 'light_leaks', 'film_grain', 'glitch_effect', 'bokeh_blur', 'color_grading_teal_orange'];

// --- Dynamic Options based on Video Purpose ---
const purposeOptionOverrides: Record<string, Partial<Record<'styles' | 'lighting' | 'cameraShots' | 'fashionEras' | 'videoEffects', string[]>>> = {
  cinematic_film: {
    styles: ['default', 'cinematic', 'epic_fantasy', 'sci_fi', 'horror', 'film_noir', 'western'],
    cameraShots: ['default', 'wide_shot', 'establishing_shot', 'close_up', 'tracking_shot', 'crane_shot', 'dutch_angle'],
    videoEffects: ['default', 'no_effects', 'film_grain', 'lens_flare', 'cinematic_color_grading']
  },
  social_media_ad: {
    styles: ['default', 'modern_clean', 'vibrant_energetic', 'minimalist'],
    cameraShots: ['default', 'product_shot', 'medium_shot', 'dynamic_cuts', 'slow_motion'],
    videoEffects: ['default', 'no_effects', 'fast_cuts', 'text_overlay_friendly', 'glitch_effect']
  },
  short_reel: {
    styles: ['default', 'vlog', 'trendy', 'lo_fi'],
    cameraShots: ['default', 'fpv', 'selfie_shot', 'quick_zoom', 'whip_pan'],
    videoEffects: ['default', 'glitch_effect', 'fast_cuts', 'retro_vhs', 'stop_motion']
  },
  documentary: {
    styles: ['default', 'documentary', 'cinematic_realism', 'archival'],
    cameraShots: ['default', 'interview_shot', 'handheld_shot', 'wide_shot', 'drone_shot'],
    lighting: ['default', 'natural_light', 'available_light']
  },
  animation: {
    styles: ['default', 'anime', 'ghibli_style', 'classic_2d', '3d_cartoon', 'stop_motion', 'chibi'],
    cameraShots: ['default', 'wide_shot', 'medium_shot', 'close_up'],
    fashionEras: ['default', 'modern', 'fantasy', 'sci_fi', 'historical'],
    videoEffects: ['default', 'no_effects', 'cel_shading', 'toon_outline']
  }
};

export const getVideoOptionsForPurpose = (purpose: string) => {
  const overrides = purposeOptionOverrides[purpose] || {};
  return {
    styles: overrides.styles || BASE_VIDEO_STYLES,
    lighting: overrides.lighting || BASE_VIDEO_LIGHTING,
    cameraShots: overrides.cameraShots || BASE_VIDEO_CAMERA_SHOTS,
    fashionEras: overrides.fashionEras || BASE_FASHION_ERAS,
    videoEffects: overrides.videoEffects || BASE_VIDEO_EFFECTS,
  };
};

export const IMAGE_PURPOSE_PRESETS: Record<string, { settings: Partial<PromptSettings>, platformName: string }> = {
  portrait_photography: {
    settings: {
      style: 'photorealistic',
      lighting: 'soft light',
      composition: 'portrait',
      aspectRatio: '3:2',
      quality: '4K',
    },
    platformName: 'Adobe Firefly',
  },
  product_shot: {
    settings: {
      style: 'photorealistic',
      lighting: 'studio lighting',
      composition: 'close-up shot',
      aspectRatio: '1:1',
      quality: '4K',
    },
    platformName: 'Canva',
  },
  landscape_art: {
    settings: {
      style: 'fantasy art',
      lighting: 'golden hour',
      composition: 'landscape',
      aspectRatio: '16:9',
      quality: 'FHD',
    },
    platformName: 'Midjourney',
  },
  social_media_post: {
    settings: {
      style: 'cinematic',
      lighting: 'dramatic lighting',
      composition: 'default',
      aspectRatio: '1:1',
      quality: 'FHD',
    },
    platformName: 'DALL-E 3',
  },
  architectural_visualization: {
    settings: {
      style: 'photorealistic',
      lighting: 'soft light',
      composition: 'wide-angle shot',
      aspectRatio: '16:9',
      quality: '4K',
    },
    platformName: 'Stable Diffusion',
  },
  food_photography: {
    settings: {
      style: 'photorealistic',
      lighting: 'soft light',
      composition: 'top-down view',
      aspectRatio: '4:3',
      quality: '4K',
    },
    platformName: 'Adobe Firefly',
  },
  fashion_shoot: {
    settings: {
      style: 'cinematic',
      lighting: 'studio lighting',
      composition: 'portrait',
      aspectRatio: '9:16',
      quality: '4K',
    },
    platformName: 'Midjourney',
  },
  concept_art: {
    settings: {
      style: 'fantasy art',
      lighting: 'dramatic lighting',
      composition: 'default',
      aspectRatio: '16:9',
      quality: 'FHD',
    },
    platformName: 'Leonardo.Ai',
  },
  stock_photo: {
    settings: {
      style: 'photorealistic',
      lighting: 'natural_light',
      composition: 'default',
      aspectRatio: '16:9',
      quality: '4K',
    },
    platformName: 'Adobe Firefly',
  },
  wildlife_photography: {
    settings: {
      style: 'photorealistic',
      lighting: 'natural_light',
      composition: 'landscape',
      aspectRatio: '3:2',
      quality: '4K',
    },
    platformName: 'Gemini',
  },
  abstract_art: {
    settings: {
      style: 'minimalist',
      lighting: 'soft light',
      composition: 'default',
      aspectRatio: '1:1',
      quality: 'FHD',
    },
    platformName: 'Midjourney',
  },
  logo_design: {
    settings: {
      style: 'vector_art',
      lighting: 'default',
      composition: 'close-up shot',
      aspectRatio: '1:1',
      quality: 'HD',
    },
    platformName: 'Ideogram',
  },
  character_design: {
    settings: {
      style: 'anime',
      lighting: 'dramatic lighting',
      composition: 'portrait',
      aspectRatio: '3:2',
      quality: 'FHD',
    },
    platformName: 'Leonardo.Ai',
  },
  cinematic_still: {
    settings: {
      style: 'cinematic',
      lighting: 'cinematic_lighting',
      composition: 'wide-angle shot',
      aspectRatio: '16:9',
      quality: '4K',
    },
    platformName: 'Midjourney',
  },
  ui_element: {
    settings: {
      style: '3d_render',
      lighting: 'soft light',
      composition: 'close-up shot',
      aspectRatio: '1:1',
      quality: 'HD',
    },
    platformName: 'Playground AI',
  },
  storyboard_frame: {
    settings: {
      style: 'anime',
      lighting: 'default',
      composition: 'medium_shot',
      aspectRatio: '16:9',
      quality: 'HD',
    },
    platformName: 'Stable Diffusion',
  }
};

// Define presets for video purposes to suggest settings
export const VIDEO_PURPOSE_PRESETS: Record<string, { settings: Partial<PromptSettings>, platformName: string }> = {
  cinematic_film: {
    settings: {
      style: 'cinematic',
      lighting: 'cinematic_lighting',
      cameraShot: 'tracking_shot',
      fashionEra: 'modern',
      videoEffect: 'film_grain',
      aspectRatio: '16:9',
      quality: '4K',
      videoDuration: 'long',
    },
    platformName: 'Sora',
  },
  social_media_ad: {
    settings: {
      style: 'vibrant_energetic',
      lighting: 'studio_lighting',
      cameraShot: 'dynamic_cuts',
      fashionEra: 'modern',
      videoEffect: 'fast_cuts',
      aspectRatio: '9:16',
      quality: 'FHD',
      videoDuration: 'medium',
    },
    platformName: 'Pika',
  },
  short_reel: {
    settings: {
      style: 'trendy',
      lighting: 'natural_light',
      cameraShot: 'fpv',
      fashionEra: 'modern',
      videoEffect: 'fast_cuts',
      aspectRatio: '9:16',
      quality: 'FHD',
      videoDuration: 'medium',
    },
    platformName: 'Pika',
  },
  documentary: {
    settings: {
      style: 'documentary',
      lighting: 'natural_light',
      cameraShot: 'interview_shot',
      fashionEra: 'modern',
      videoEffect: 'no_effects',
      aspectRatio: '16:9',
      quality: '4K',
      videoDuration: 'long',
    },
    platformName: 'Runway ML',
  },
  animation: {
    settings: {
      style: 'ghibli_style',
      lighting: 'natural_light',
      cameraShot: 'wide_shot',
      fashionEra: 'fantasy',
      videoEffect: 'cel_shading',
      aspectRatio: '16:9',
      quality: 'FHD',
      videoDuration: 'medium',
    },
    platformName: 'Pika',
  },
  music_video: {
    settings: {
      style: 'dreamlike',
      lighting: 'neon_noir',
      cameraShot: 'dynamic_cuts',
      videoEffect: 'glitch_effect',
      aspectRatio: '16:9',
      quality: 'FHD',
      videoDuration: 'long',
    },
    platformName: 'Kaiber',
  },
  explainer_video: {
    settings: {
      style: 'modern_clean',
      lighting: 'studio_lighting',
      cameraShot: 'medium_shot',
      videoEffect: 'no_effects',
      aspectRatio: '16:9',
      quality: 'FHD',
      videoDuration: 'medium',
    },
    platformName: 'InVideo AI',
  },
  product_visualization: {
    settings: {
      style: 'modern_clean',
      lighting: 'studio_lighting',
      cameraShot: 'product_shot',
      videoEffect: 'no_effects',
      aspectRatio: '1:1',
      quality: '4K',
      videoDuration: 'medium',
    },
    platformName: 'Runway ML',
  },
  ugc_style_ad: {
    settings: {
      style: 'vlog',
      lighting: 'natural_light',
      cameraShot: 'selfie_shot',
      videoEffect: 'no_effects',
      aspectRatio: '9:16',
      quality: 'FHD',
      videoDuration: 'medium',
    },
    platformName: 'Pika',
  },
  viral_meme_video: {
    settings: {
      style: 'lo_fi',
      lighting: 'natural_light',
      cameraShot: 'quick_zoom',
      videoEffect: 'retro_vhs',
      aspectRatio: '9:16',
      quality: 'HD',
      videoDuration: 'short',
    },
    platformName: 'Pika',
  },
};


// New constants for Professional Text Mode
export const WRITING_IDENTITIES = ['default', 'student', 'professor', 'storyteller', 'novelist', 'journalist', 'poet', 'scientist', 'blogger', 'screenwriter', 'employee_reporter', 'social_media_scripter', 'marketer'];
export const TEXT_PURPOSES = ['normal', 'dramatic_novel', 'children_story', 'scientific_research', 'educational_article', 'marketing_content', 'business_proposal', 'technical_manual', 'legal_document', 'blog_post', 'book', 'inspiring_text', 'press_report', 'screenplay', 'youtube_script', 'work_report'];
export const BASE_CREATIVE_TONES = ['normal', 'moving', 'sad', 'witty', 'inspiring', 'charismatic', 'dramatic', 'mysterious', 'poetic', 'epic', 'humorous', 'urgent'];
export const BASE_WRITING_STYLES = ['normal', 'poetic', 'conversational', 'reader_address', 'simple', 'professional', 'scientific', 'narrative', 'informative', 'motivational', 'persuasive', 'descriptive'];
export const AUDIENCES = ['general', 'experts', 'students', 'children', 'business_professionals'];
export const FORMALITY_LEVELS = ['formal', 'neutral', 'informal'];
export const CITATION_STYLES = ['none', 'apa', 'mla', 'chicago', 'harvard'];
export const FONT_SUGGESTIONS = ['auto', 'serif', 'sans_serif', 'monospace', 'display'];

export const AI_PLATFORMS = ['Auto', 'Gemini', 'ChatGPT', 'Claude', 'Mistral', 'Copilot', 'Perplexity', 'Jasper', 'Writesonic', 'Copy.ai', 'Sudowrite'];
export const OUTPUT_FORMATS = ['view_only', 'pdf', 'word', 'markdown', 'text', 'html'];
export const PAPER_SIZES = ['Auto', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6'];
export const AUTHOR_TITLES = ['none', 'Dr', 'Mr', 'Ms', 'Prof', 'Eng', 'Captain', 'C', 'M', 'Ed'];
export const AUTHOR_MACRO_POSITIONS = ['header', 'footer'];
export const AUTHOR_HORIZONTAL_ALIGNMENTS = ['left', 'center', 'right'];

// --- Dynamic Text Options ---
const textOptionsOverrides: Record<string, Partial<Record<'tones' | 'styles', string[]>>> = {
  scientific_research: {
    tones: ['normal', 'dramatic', 'mysterious'],
    styles: ['professional', 'scientific', 'informative', 'descriptive'],
  },
  children_story: {
    tones: ['normal', 'moving', 'witty', 'inspiring', 'humorous', 'poetic'],
    styles: ['simple', 'conversational', 'narrative', 'descriptive'],
  },
  business_proposal: {
    tones: ['normal', 'charismatic', 'urgent'],
    styles: ['professional', 'persuasive', 'informative'],
  },
};

export const getTextOptionsForPurpose = (purpose: string) => {
    const overrides = textOptionsOverrides[purpose] || {};
    return {
        tones: overrides.tones || BASE_CREATIVE_TONES,
        styles: overrides.styles || BASE_WRITING_STYLES,
    };
};

// --- Writing Identity Presets ---
export const WRITING_IDENTITY_PRESETS: Record<string, Partial<ProfessionalTextSettings>> = {
  student: {
    purpose: 'educational_article',
    audience: 'students',
    formality: 'formal',
    citationStyle: 'mla',
    writingStyle: ['informative'],
    creativeTone: ['normal'],
    fontSuggestion: 'serif',
    aiPlatform: 'Gemini',
  },
  professor: {
    purpose: 'scientific_research',
    audience: 'experts',
    formality: 'formal',
    citationStyle: 'apa',
    writingStyle: ['scientific'],
    creativeTone: ['normal'],
    fontSuggestion: 'serif',
    aiPlatform: 'Gemini',
  },
  storyteller: {
    purpose: 'children_story',
    audience: 'children',
    formality: 'informal',
    creativeTone: ['inspiring', 'witty'],
    writingStyle: ['simple', 'narrative'],
    citationStyle: 'none',
    fontSuggestion: 'sans_serif',
  },
  novelist: {
    purpose: 'dramatic_novel',
    audience: 'general',
    formality: 'neutral',
    creativeTone: ['dramatic', 'mysterious'],
    writingStyle: ['narrative', 'descriptive'],
    citationStyle: 'none',
    fontSuggestion: 'serif',
  },
  journalist: {
    purpose: 'press_report',
    audience: 'general',
    formality: 'neutral',
    writingStyle: ['informative', 'professional'],
    creativeTone: ['normal'],
    citationStyle: 'none',
    fontSuggestion: 'serif',
  },
  poet: {
    purpose: 'inspiring_text',
    audience: 'general',
    formality: 'neutral',
    creativeTone: ['poetic', 'moving'],
    writingStyle: ['poetic'],
    citationStyle: 'none',
    fontSuggestion: 'serif',
  },
  scientist: {
    purpose: 'scientific_research',
    audience: 'experts',
    formality: 'formal',
    citationStyle: 'chicago',
    writingStyle: ['scientific'],
    creativeTone: ['normal'],
    fontSuggestion: 'serif',
  },
  blogger: {
    purpose: 'blog_post',
    audience: 'general',
    formality: 'informal',
    writingStyle: ['conversational', 'informative'],
    creativeTone: ['normal'],
    citationStyle: 'none',
    fontSuggestion: 'sans_serif',
  },
  screenwriter: {
    purpose: 'screenplay',
    audience: 'general',
    formality: 'neutral',
    writingStyle: ['narrative', 'descriptive'],
    creativeTone: ['dramatic'],
    citationStyle: 'none',
    outputFormat: 'markdown',
  },
  employee_reporter: {
    purpose: 'work_report',
    audience: 'business_professionals',
    formality: 'formal',
    writingStyle: ['professional', 'informative'],
    creativeTone: ['normal'],
    citationStyle: 'none',
    fontSuggestion: 'sans_serif',
  },
  social_media_scripter: {
    purpose: 'youtube_script',
    audience: 'general',
    formality: 'informal',
    writingStyle: ['conversational', 'persuasive'],
    creativeTone: ['humorous', 'charismatic'],
    citationStyle: 'none',
    fontSuggestion: 'sans_serif',
  },
  marketer: {
    purpose: 'marketing_content',
    audience: 'general',
    formality: 'neutral',
    creativeTone: ['charismatic', 'urgent'],
    writingStyle: ['persuasive'],
    citationStyle: 'none',
    fontSuggestion: 'sans_serif',
  },
};


type PlatformData = {
  image: Platform[];
  video: Platform[];
  text: Platform[];
}

export const PLATFORMS_DATA: PlatformData = {
  image: [
    {
      name: 'General Mode',
      icon: '🌐',
      url: '#',
    },
    { 
      name: 'Midjourney', 
      icon: '🎨',
      url: 'https://www.midjourney.com/',
    },
    { 
      name: 'DALL-E 3', 
      icon: '🤖',
      url: 'https://openai.com/dall-e-3',
    },
    { 
      name: 'Gemini', 
      icon: '✨',
      url: 'https://gemini.google.com',
    },
    { 
      name: 'Grok', 
      icon: '🦄',
      url: 'https://grok.x.ai/',
    },
    {
      name: 'Stable Diffusion',
      icon: '🌀',
      url: 'https://dreamstudio.ai/generate',
    },
    {
      name: 'Leonardo.Ai',
      icon: '🦁',
      url: 'https://leonardo.ai/',
    },
    {
      name: 'Playground AI',
      icon: '🎠',
      url: 'https://playground.com/',
    },
    {
      name: 'Adobe Firefly',
      icon: '🔥',
      url: 'https://firefly.adobe.com/',
    },
    {
      name: 'Ideogram',
      icon: '💡',
      url: 'https://ideogram.ai/',
    },
    {
      name: 'Canva',
      icon: '🖌️',
      url: 'https://www.canva.com/ai-image-generator/',
    },
    {
      name: 'Copilot',
      icon: '🧑‍✈️',
      url: 'https://copilot.microsoft.com/',
    }
  ],
  video: [
    {
      name: 'General Mode',
      icon: '🌐',
      url: '#',
    },
    { 
      name: 'Runway ML', 
      icon: '🎬',
      url: 'https://runwayml.com/',
    },
    { 
      name: 'Pika', 
      icon: '🏞️',
      url: 'https://pika.art/',
    },
     { 
      name: 'Veo', 
      icon: '✨',
      url: 'https://deepmind.google/technologies/veo/',
    },
    {
      name: 'Sora',
      icon: '🌌',
      url: 'https://openai.com/sora',
    },
    {
      name: 'InVideo AI',
      icon: '🎞️',
      url: 'https://invideo.io/ai',
    },
    {
      name: 'Kaiber',
      icon: '💫',
      url: 'https://kaiber.ai/',
    },
    {
      name: 'Luma AI',
      icon: '💡',
      url: 'https://lumalabs.ai/',
    },
    {
      name: 'Haiper',
      icon: '🌊',
      url: 'https://haiper.ai/',
    },
    {
      name: 'Stable Video Diffusion',
      icon: '🌀',
      url: 'https://stability.ai/stable-video',
    }
  ],
  text: [
    {
      name: 'General Mode',
      icon: '🌐',
      url: '#',
    },
  ]
};

const AD_TAG_URLS = [
  'https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/omid_ad_samples&env=vp&gdfp_req=1&output=vast&sz=640x480&description_url=http%3A%2F%2Ftest_site.com%2Fhomepage&vpmute=0&vpa=0&vad_format=linear&url=http%3A%2F%2Ftest_site.com&vpos=preroll&unviewed_position_start=1&correlator=',
  'https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/vmap_ad_samples&sz=640x480&cust_params=sample_ar%3Dpremidpostlongpod&ciu_szs=300x250&gdfp_req=1&ad_rule=1&output=vmap&unviewed_position_start=1&env=vp&cmsid=496&vid=short_onecue&correlator=',
  'https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/vmap_ad_samples&sz=640x480&cust_params=sample_ar%3Dpremidpostoptimizedpodbumper&ciu_szs=300x250&gdfp_req=1&ad_rule=1&output=vmap&unviewed_position_start=1&env=vp&cmsid=496&vid=short_onecue&correlator=',
  'https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/vmap_ad_samples&sz=640x480&cust_params=sample_ar%3Dpremidpostpodbumper&ciu_szs=300x250&gdfp_req=1&ad_rule=1&output=vmap&unviewed_position_start=1&env=vp&cmsid=496&vid=short_onecue&correlator=',
  'https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/vmap_ad_samples&sz=640x480&cust_params=sample_ar%3Dpostonlybumper&ciu_szs=300x250&gdfp_req=1&ad_rule=1&output=vmap&unviewed_position_start=1&env=vp&correlator=',
  'https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/single_ad_samples&sz=640x480&cust_params=sample_ct%3Dlinear&ciu_szs=300x250%2C728x90&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&correlator=',
  'https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/single_ad_samples&sz=640x480&cust_params=sample_ct%3Dredirecterror&ciu_szs=300x250%2C728x90&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&correlator=',
  'https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/vmap_skip_ad_samples&sz=640x480&cust_params=sample_ar%3Dmidskiponly&ciu_szs=300x250&gdfp_req=1&ad_rule=1&output=vmap&unviewed_position_start=1&env=vp&cmsid=496&vid=short_onecue&correlator=',
  'https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/vmap_ad_samples&sz=640x480&cust_params=sample_ar%3Dpremidpost&ciu_szs=300x250&gdfp_req=1&ad_rule=1&output=vmap&unviewed_position_start=1&env=vp&cmsid=496&vid=short_onecue&correlator=',
  'https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/vmap_ad_samples&sz=640x480&cust_params=sample_ar%3Dpreonly&ciu_szs=300x250%2C728x90&gdfp_req=1&ad_rule=1&output=vmap&unviewed_position_start=1&env=vp&correlator=',
  'https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/vmap_ad_samples&sz=640x480&cust_params=sample_ar%3Dpreonlybumper&ciu_szs=300x250&gdfp_req=1&ad_rule=1&output=vmap&unviewed_position_start=1&env=vp&correlator='
];

const VSI_BASE_URL = 'https://googleads.github.io/googleads-ima-html5/vsi/vsi.html?adTagUrl=';

export const AD_VIDEOS = AD_TAG_URLS.map(tagUrl => 
  `${VSI_BASE_URL}${encodeURIComponent(tagUrl)}&autoplay=1&vpmute=1`
);