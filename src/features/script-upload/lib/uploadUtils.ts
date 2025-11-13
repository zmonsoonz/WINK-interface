import type { UploadError } from '../model/types';

export function validateFileType(file: File): UploadError | null {
  if (!file.name.match(/\.(pdf|docx)$/i)) {
    return { message: 'Поддерживаются только PDF, DOCX', code: 'INVALID_FORMAT' };
  }
  return null;
}
export const formatSize = (size: number) => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};
