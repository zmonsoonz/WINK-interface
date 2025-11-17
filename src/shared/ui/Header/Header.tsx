// Header.tsx
import styles from './Header.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartColumn, faScroll } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@shared/ui/Button/Button.tsx';
import { Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { Script } from '@features/script-analysis/model/types.ts';
import { API_BASE } from '@shared/lib/constants.ts';

interface HeaderProps {
  isHidden?: boolean;
}

export function Header({ isHidden = false }: HeaderProps) {
  const { state } = useLocation();
  const nav = state as { script: Script } | null;
  const id = nav?.script.script_id;

  const handleReportClick = async () => {
    if (isHidden) return;

    try {
      if (!id) {
        toast.error('ID сценария не найден');
        return;
      }
      const res = await fetch(`${API_BASE}/script/${id}/report`, { method: 'GET' });
      if (!res.ok) {
        toast.error(`Не удалось получить отчёт: ${res.status}`);
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = decodeURIComponent(`report_${id}.pdf`);

      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Ошибка загрузки отчёта');
    }
  };

  return (
    <header className={styles.header} role="banner">
      <div className={styles.left}>
        <div className={styles.logo}>Script Reviewer</div>
      </div>

      {!isHidden && (
        <div className={styles.right}>
          <div className={styles.buttonGroup}>
            <Button variant="primary" onClick={handleReportClick}>
              <FontAwesomeIcon icon={faChartColumn} />
              Получить отчет
            </Button>

            <Link to="/" className={styles.linkReset}>
              <Button variant="secondary" className={styles.newBtn}>
                <FontAwesomeIcon icon={faScroll} />
                Новый сценарий
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
