export enum AnalysisStyle {
  DESCRIPTIVE = 'Descriptive',
  ARTISTIC = 'Artistic',
  MIDJOURNEY = 'Midjourney v6',
  STABLE_DIFFUSION = 'Stable Diffusion XL',
  CINEMATIC = 'Cinematic Motion',
}

export interface AnalysisResult {
  prompt: string;
  videoPrompt: string;
  tags: string[];
  motionAnalysis: string;
}

export interface UploadedImage {
  file: File;
  previewUrl: string;
  base64: string;
  mimeType: string;
}

export interface LoadingState {
  isLoading: boolean;
  message: string;
}