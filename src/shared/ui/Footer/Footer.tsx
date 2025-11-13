import styles from './Footer.module.scss';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <p className={styles.description}>
          Сервис тщательно анализирует текст сценария, предупреждает о рисках некорректной возрастной маркировки и
          помогает авторам и продюсерам адаптировать материалы для легального показа. Анализ учитывает формальные
          критерии закона, а также распространённые требования платформ дистрибуции и сервисов видеоконтента.
        </p>
      </div>
    </footer>
  );
}
