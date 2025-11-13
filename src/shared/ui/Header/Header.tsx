import styles from './Header.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartColumn, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@shared/ui/Button/Button.tsx';

interface HeaderProps {
  name?: string;
  rating?: string | null;
  isHidden?: boolean;
  onAnalyze?: () => void;
  onReport?: () => void;
}

export function Header({
  name = 'Script Reviewer',
  rating = '18+',
  isHidden = false,
  onAnalyze,
  onReport,
}: HeaderProps) {
  const handleAnalyze = () => {
    if (!isHidden && onAnalyze) {
      onAnalyze();
    }
  };

  const handleReport = () => {
    if (!isHidden && onReport) {
      onReport();
    }
  };

  return (
    <header className={styles.header} role="banner">
      <div className={styles.left}>
        <div className={styles.logo}>{name}</div>
      </div>

      {!isHidden ? (
        <div className={styles.right}>
          <div className={styles.buttonGroup}>
            <Button variant="primary" onClick={handleAnalyze}>
              <FontAwesomeIcon icon={faMagnifyingGlass} />
              Запустить анализ
            </Button>

            <Button variant="secondary" onClick={handleReport}>
              <FontAwesomeIcon icon={faChartColumn} />
              Получить отчет
            </Button>
          </div>

          <div className={styles.rating}>{rating}</div>
        </div>
      ) : null}
    </header>
  );
}
