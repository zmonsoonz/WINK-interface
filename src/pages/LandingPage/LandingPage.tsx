import { UploadZone } from '@features/script-upload';
import { Header } from '@shared/ui/Header/Header';
import { Footer } from '@shared/ui/Footer/Footer';
import styles from './LandingPage.module.scss';

export function LandingPage() {
  return (
    <div className={styles.landingPage}>
      <Header isHidden={true} />
      <main className={styles.main}>
        <h1 className={styles.title}>Загрузите сценарий для анализа</h1>
        <UploadZone />
      </main>
      <Footer />
    </div>
  );
}
