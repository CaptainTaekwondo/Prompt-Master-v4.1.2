export type GenerationMode = 'image' | 'video' | 'text';

export interface PromptSettings {
  imagePurpose: string;
  style: string;
  lighting: string;
  composition: string;
  cameraAngle: string;
  mood: string;
  colorPalette: string;
  aspectRatio: string;
  quality: string;
  // New video-specific settings
  cameraShot: string;
  cameraMovement: string;
  fashionEra: string;
  videoEffect: string;
  videoPurpose: string;
  videoDuration: string;
}

export interface ProfessionalTextSettings {
  writingIdentity: string;
  purpose: string;
  creativeTone: string[];
  writingStyle: string[];
  audience: string;
  formality: string;
  citationStyle: string;
  fontSuggestion: string;
  aiPlatform: string;
  outputFormat: string;
  formattingQuality: number; // 0-100
  paperSize: string; // e.g., 'A4'
  fontSize: number; // e.g., 12
  pageSettings: {
    count: number;
    type: 'words' | 'pages';
  };
  authorInfo: {
    name: string;
    title: string;
    language: 'en' | 'ar' | 'fr';
    repeatOnEveryPage: boolean;
    placement: {
      macro: 'header' | 'footer';
      horizontal: 'left' | 'center' | 'right';
    };
    placementSetByUser: boolean;
  };
}

export interface GeneratedPrompt {
  id: string;
  name?: string; // User-defined name for the prompt
  prompt: string;
  platformName: string;
  platformIcon: string;
  platformUrl: string;
  baseIdea: string;
  timestamp: number;
  mode: GenerationMode;
  settings?: PromptSettings; // Save settings for reuse
  proTextSettings?: ProfessionalTextSettings;
}

export type ProTier = 'bronze' | 'silver' | 'gold';

export interface UserData {
  coins: number;
  favorites: GeneratedPrompt[];
  history: GeneratedPrompt[];
  proTier: ProTier | null;
  subscriptionEndDate: number | null; // Timestamp
  lastCoinRewardDate: string | null; // YYYY-MM-DD
  adsWatchedToday?: {
    count: number;
    date: string; // YYYY-MM-DD
  };
  sharesToday?: {
    count: number;
    date: string; // YYYY-MM-DD
  };
}

export interface UsersData {
  [userId: string]: UserData;
}

export interface Platform {
  name: string;
  icon: string;
  url: string;
}

// Performance Report Types
export interface ReportSample {
  caseNumber: number;
  description: string;
  settings: Record<string, string>; // Generic settings object for all modes
  output: string;
  status: 'Success' | 'Failure';
}


export interface PlatformReportData {
  platformName: string;
  compliance: number;
  professionalism: number;
  overallStrength: number;
  issues: string[];
  recommendations: string[];
  samples: ReportSample[];
}

export interface ReportSummary {
  totalTests: number;
  overallSuccessRate: number;
  averageCompliance: number;
  averageProfessionalism: number;
}

export interface PerformanceReportData {
  summary: ReportSummary;
  platformReports: PlatformReportData[];
}