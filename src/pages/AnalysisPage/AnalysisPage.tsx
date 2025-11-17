import { Header } from '@shared/ui/Header/Header';
import { Footer } from '@shared/ui/Footer/Footer';
import { AnalysisSection } from '@features/script-analysis/ui/AnalysisSection.tsx';

export function AnalysisPage() {
  return (
    <div>
      <Header />
      <main>
        <AnalysisSection />
      </main>
      <Footer />
    </div>
  );
}
