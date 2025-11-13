import React, { useCallback, useEffect, useRef, useState } from 'react';
import { formatSize, validateFileType } from '../lib/uploadUtils';
import styles from './UploadZone.module.scss';
import { Button } from '@shared/ui/Button/Button.tsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFile, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';

export function UploadZone() {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    // console.log('over');
    setDragActive(true);
    // console.log(dragActive);
  }, []);

  const handleDragLeave = useCallback(() => setDragActive(false), []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    console.log('drop');
    const f = e.dataTransfer.files?.[0];
    if (!f) return;
    const validationError = validateFileType(f);
    if (validationError) {
      setError('err');
      setFile(null);
      toast.error(validationError.message);
      return;
    }
    setError(null);
    setFile(f);
  }, []);

  const handleZoneClick = useCallback(() => fileInputRef.current?.click(), []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    if (!f) return;
    const validationError = validateFileType(f);
    if (validationError) {
      setError('error');
      setFile(null);
      toast.error(validationError.message);
      return;
    }
    setError(null);
    setFile(f);
    e.target.value = '';
  }, []);

  // useEffect(
  //   (e) => {
  //     toast.error(validationError.message);
  //   },
  //   [error],
  // );
  return (
    <div className={styles.wrapper}>
      <div
        className={`${styles.zone} ${file ? styles.filled : ''} ${dragActive ? styles.active : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleZoneClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click();
        }}
        aria-label="Загрузить файл сценария"
      >
        {!file && (
          <div className={styles.content} aria-hidden="true">
            <div className={styles.iconCircle}>
              <span className={styles.iconArrow}>↑</span>
            </div>
            <h3 className={styles.title}>{dragActive ? 'Отпустите для загрузки' : 'Перетащите сценарий сюда'}</h3>
            <span className={styles.pickFile}>или выберите файл</span>
          </div>
        )}

        {file && (
          <div className={styles.fileInfo}>
            <div className={styles.fileBadge} title={file.name}>
              <FontAwesomeIcon icon={faFile} />
              <span className={styles.fileName}>{file.name}</span>
              <span className={styles.fileSize}>{formatSize(file.size)}</span>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx"
          onChange={handleFileSelect}
          className={styles.fileInput}
          id="file-input"
        />
      </div>
      {file && (
        <Button variant="primary">
          <FontAwesomeIcon icon={faMagnifyingGlass} />
          Запустить анализ
        </Button>
      )}

      <div className={styles.hint}>
        <p>
          Поддерживаемые форматы: <strong>PDF, DOCX</strong>
        </p>
        <p className={styles.hintMuted}>Время анализа: 2–5 минут</p>
      </div>
    </div>
  );
}
