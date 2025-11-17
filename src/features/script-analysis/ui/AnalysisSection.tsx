// pages/AnalysisSection.tsx
import { useRef } from 'react';
import styles from './AnalysisSection.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import type { Script } from '@features/script-analysis/model/types.ts';
import { Navigate, useLocation } from 'react-router-dom';

type Rating = 'None' | 'Mild' | 'Moderate' | 'Severe';
type CategoryKey = 'sex' | 'violence' | 'profanity' | 'substances' | 'frightening';
type AnalysisNavState = { script: Script };

const toRating = (s: string): Rating => {
  const v = (s || '').toLowerCase();
  if (v === 'mild') return 'Mild';
  if (v === 'moderate') return 'Moderate';
  if (v === 'severe') return 'Severe';
  return 'None';
};

const rateClass = (r: Rating) => styles['rate_' + r.toLowerCase()];

export const AnalysisSection = () => {
  const sectionRefs = useRef<Record<CategoryKey, HTMLDivElement | null>>({
    sex: null,
    violence: null,
    profanity: null,
    substances: null,
    frightening: null,
  });
  const { state } = useLocation();
  const nav = state as AnalysisNavState | null;

  if (!nav?.script) {
    return <Navigate to="/" replace />;
  }

  const script = nav.script;

  const scrollToCategory = (key: CategoryKey) => {
    const el = sectionRefs.current[key];
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const ageClass = (rating: string) => {
    const num = (rating || '').split('+')[0].trim();
    return styles[`age${num}`] ?? styles.age12;
  };

  return (
    <div className={styles.page}>
      <div className={styles.titleHero} aria-label="Название сценария">
        <h1 className={styles.scriptName}>{script.title}</h1>
      </div>

      <header className={styles.titleHeader}>
        <span className={styles.catBar} aria-hidden />
        <h2 className={styles.title}>Результаты анализа</h2>
        <div className={`${styles.ageBadge} ${ageClass(script.rating)}`} title="Рекомендованный возраст">
          {script.rating}
        </div>
      </header>

      <section className={styles.summary}>
        <div className={styles.summaryCard}>
          {script.categories.map((c) => {
            const key = c.type as CategoryKey;
            const aggregate = toRating(c.severity);
            return (
              <button key={c.id} className={`${styles.summaryRow}`} onClick={() => scrollToCategory(key)}>
                <div className={styles.summaryLeft}>
                  <span className={`${styles.indicator} ${rateClass(aggregate)}`} aria-hidden />
                  <span className={styles.summaryLabel}>{c.label}:</span>
                  <span className={`${styles.summaryRating} ${rateClass(aggregate)}`}>{aggregate}</span>
                </div>
                <div className={styles.summaryRight}>
                  <span className={`${styles.counterBadge} ${styles.hasTooltip}`} data-tip="Violations count">
                    {c.occurrences_count}
                  </span>
                  <span
                    className={`${styles.percentBadge} ${styles.hasTooltip}`}
                    data-tip="Percentage of scenes with violations"
                  >
                    {c.percentage}%
                  </span>
                  <span className={styles.summaryChevron} aria-hidden>
                    <FontAwesomeIcon icon={faChevronRight} />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {script.categories.map((c) => {
        const key = c.type as CategoryKey;
        const aggregate = toRating(c.severity);
        return (
          <section
            key={c.id}
            ref={(el: HTMLDivElement | null) => {
              sectionRefs.current[key] = el;
            }}
            className={styles.categorySection}
            aria-labelledby={`cat-${key}`}
          >
            <header className={styles.catHeader}>
              <span className={styles.catBar} aria-hidden />
              <h2 id={`cat-${key}`} className={styles.catTitle}>
                {c.label}
              </h2>
              <span className={`${styles.catBadge} ${rateClass(aggregate)}`}>{aggregate}</span>
              <span className={styles.catCount}>{c.occurrences_count}</span>
            </header>

            {c.occurrences.length === 0 ? (
              <div className={styles.empty}>None</div>
            ) : (
              <ul className={styles.itemList}>
                {c.occurrences.map((o) => {
                  const r = toRating(o.severity);
                  return (
                    <li key={o.id} className={styles.itemCard}>
                      <div className={styles.itemHeader}>
                        <span className={`${styles.itemPill} ${rateClass(r)}`}>{r}</span>
                        {o.scene_number != null && <span className={styles.sceneTag}>Scene: {o.scene_number}</span>}
                      </div>
                      <pre className={styles.itemExcerpt}>{o.description}</pre>
                      {o.recommendation && (
                        <div className={styles.recBox}>
                          <div className={styles.recLabel}>Рекомендация</div>
                          <p className={styles.recText}>{o.recommendation}</p>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
};
