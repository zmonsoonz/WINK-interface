// Как будет готов бэк
export interface Script {
  scriptId: string;
  title: string;
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  ageRating: string | null;
  error?: string;
  createdAt: string;
}
