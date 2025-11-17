import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './UploadZone.module.scss';
import { Button } from '@shared/ui/Button/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFile, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';
import { formatSize, validateFileType } from '../lib/uploadUtils';
import { useApi } from '@shared/hooks/useApi';

type StartResp = { script_id: number };
type StatusResp = {
  status: 'queued' | 'running' | 'done' | 'error';
  progress?: number;
  report_id?: number;
  message?: string;
};

export function UploadZone() {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const pollTimerRef = useRef<number | null>(null);

  const navigate = useNavigate();
  const { post, get } = useApi();

  useEffect(() => {
    return () => {
      if (pollTimerRef.current) window.clearTimeout(pollTimerRef.current);
    };
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (!isAnalyzing) setDragActive(true);
    },
    [isAnalyzing],
  );

  const handleDragLeave = useCallback(() => {
    if (!isAnalyzing) setDragActive(false);
  }, [isAnalyzing]);

  const handleZoneClick = useCallback(() => {
    if (!isAnalyzing) fileInputRef.current?.click();
  }, [isAnalyzing]);

  const acceptFile = useCallback((f: File) => {
    const validationError = validateFileType(f);
    if (validationError) {
      setError(validationError.message);
      setFile(null);
      toast.error(validationError.message);
      return;
    }
    setError(null);
    setFile(f);
    const baseName = f.name.replace(/\.[^/.]+$/, '').trim();
    setTitle(baseName);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragActive(false);
      if (isAnalyzing) return;
      const f = e.dataTransfer.files?.[0];
      if (!f) return;
      acceptFile(f);
    },
    [acceptFile, isAnalyzing],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0] || null;
      if (!f) return;
      acceptFile(f);
      e.target.value = '';
    },
    [acceptFile],
  );

  const isTitleValid = title.trim().length > 0;

  const clearPoll = () => {
    if (pollTimerRef.current) {
      window.clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  };

  const startPolling = useCallback(
    (scriptId: number) => {
      const poll = async () => {
        try {
          const s = await get<StatusResp>(`/script/${scriptId}/analysis`);
          if (!s || s.status === 'queued' || s.status === 'running') {
            pollTimerRef.current = window.setTimeout(poll, 5000);
            return;
          }
          if (s.status === 'done') {
            clearPoll();
            setIsAnalyzing(false);
            navigate('/analysis', {
              replace: true,
              state: { script: s },
            });
            return;
          }
          if (s.status === 'error') {
            clearPoll();
            setIsAnalyzing(false);
            toast.error(s.message || 'Ошибка анализа');
            return;
          }
          pollTimerRef.current = window.setTimeout(poll, 5000);
        } catch {
          pollTimerRef.current = window.setTimeout(poll, 5000);
        }
      };
      poll();
    },
    [get, navigate],
  );

  const handleStartAnalyze = useCallback(async () => {
    if (!file) return;

    const safeTitle = title.trim();
    if (!safeTitle) {
      toast.error('Введите название сценария');
      return;
    }

    try {
      setIsAnalyzing(true);

      const fd = new FormData();
      fd.append('file', file);
      fd.append('title', safeTitle);

      const resp = await post<StartResp>('/script/upload', fd);
      const scriptId = resp?.script_id;
      if (!scriptId) {
        setIsAnalyzing(false);
        toast.error('Не удалось получить идентификатор сценария');
        return;
      }

      startPolling(scriptId);
    } catch (e) {
      setIsAnalyzing(false);
      toast.error(e instanceof Error ? e.message : 'Не удалось отправить сценарий');
    }
  }, [file, title, post, startPolling]);

  return (
    <div className={styles.wrapper}>
      <div
        className={`${styles.zone} ${file ? styles.filled : ''} ${dragActive ? styles.active : ''} ${isAnalyzing ? styles.loading : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleZoneClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (!isAnalyzing && (e.key === 'Enter' || e.key === ' ')) fileInputRef.current?.click();
        }}
        aria-label="Загрузить файл сценария"
        aria-busy={isAnalyzing}
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
          disabled={isAnalyzing}
        />

        {isAnalyzing && <div className={styles.zoneSpinner} aria-hidden />}
      </div>

      {file && (
        <div className={styles.titleRow}>
          <label className={styles.titleLabel} htmlFor="script-title">
            Название сценария
          </label>
          <input
            id="script-title"
            className={styles.titleInput}
            type="text"
            placeholder="Введите название"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => setTitle((t) => t.trim())}
            disabled={isAnalyzing}
            aria-invalid={!isTitleValid}
          />
          {!isTitleValid && <div className={styles.inputError}>Название не может быть пустым</div>}
        </div>
      )}

      {file && (
        <Button variant="primary" onClick={handleStartAnalyze} disabled={isAnalyzing || !isTitleValid}>
          {isAnalyzing ? (
            <>
              <span className={styles.btnSpinner} aria-hidden /> Анализируем…
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faMagnifyingGlass} /> Запустить анализ
            </>
          )}
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
