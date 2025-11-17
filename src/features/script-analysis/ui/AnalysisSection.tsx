import { useRef, useState } from 'react';
import styles from './AnalysisSection.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import type { Script } from '@features/script-analysis/model/types';
import { Navigate, useLocation } from 'react-router-dom';

type Rating = 'None' | 'Mild' | 'Moderate' | 'Severe';
type CategoryKey = 'sex' | 'violence' | 'profanity' | 'substances' | 'frightening';
type AnalysisNavState = { script: Script };
type TabKey = 'rec' | 'just';

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
  const [activeTabs, setActiveTabs] = useState<Record<number, TabKey>>({});
  const setTab = (id: number, tab: TabKey) => setActiveTabs((s) => ({ ...s, [id]: tab }));
  const getTab = (id: number): TabKey => activeTabs[id] ?? 'rec';
  if (!nav?.script) {
    return <Navigate to="/" replace />;
  }
  const script = nav.script;

  const scrollToCategory = (key: CategoryKey) => {
    sectionRefs.current[key]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
              <button key={c.id} className={styles.summaryRow} onClick={() => scrollToCategory(key)}>
                <div className={styles.summaryLeft}>
                  <span className={`${styles.indicator} ${rateClass(aggregate)}`} aria-hidden />
                  <span className={styles.summaryLabel}>{c.label}:</span>
                  <span className={`${styles.summaryRating} ${rateClass(aggregate)}`}>{aggregate}</span>
                </div>
                <div className={styles.summaryRight}>
                  <span className={`${styles.counterBadge} ${styles.hasTooltip}`} data-tip="Количество">
                    {c.occurrences_count}
                  </span>
                  <span className={`${styles.percentBadge} ${styles.hasTooltip}`} data-tip="Доля сцен с нарушением">
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
              <div className={styles.empty}>Нет нарушений</div>
            ) : (
              <ul className={styles.itemList}>
                {c.occurrences.map((o) => {
                  const r = toRating(o.severity);
                  const tab = getTab(o.id);
                  const description = o.description;
                  const recommendation = o.recommendation || '';
                  const justification = o.justification || '';
                  return (
                    <li key={o.id} className={styles.itemCard}>
                      <div className={styles.itemHeader}>
                        <span className={`${styles.itemPill} ${rateClass(r)}`}>{r}</span>
                        {o.scene_number != null && <span className={styles.sceneTag}>Scene: {o.scene_number}</span>}
                      </div>

                      <pre className={styles.itemExcerpt}>{description}</pre>

                      <div className={styles.itemTabs} role="tablist" aria-label="Дополнительная информация">
                        <button
                          type="button"
                          className={`${styles.tabBtn} ${tab === 'rec' ? styles.tabActive : ''}`}
                          role="tab"
                          aria-selected={tab === 'rec'}
                          onClick={() => setTab(o.id, 'rec')}
                        >
                          Рекомендация
                        </button>
                        <button
                          type="button"
                          className={`${styles.tabBtn} ${tab === 'just' ? styles.tabActive : ''}`}
                          role="tab"
                          aria-selected={tab === 'just'}
                          onClick={() => setTab(o.id, 'just')}
                        >
                          Документация
                        </button>
                      </div>

                      <div className={styles.tabPanel} role="tabpanel">
                        <p className={styles.tabText}>{tab === 'just' ? justification : recommendation}</p>
                      </div>
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
