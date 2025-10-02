import styles from "../page.module.css";
import { CourseMappingWizard } from "@/components/CourseMappingWizard";
import { notFound } from "next/navigation";

type StepPageParams = {
  step?: string[];
};

const TOTAL_STEPS = 4;

const parseInitialStep = (segments?: string[]) => {
  if (!segments || segments.length === 0) {
    return 0;
  }

  if (segments.length > 1) {
    return null;
  }

  const [first] = segments;
  if (!first) {
    return 0;
  }

  const match = first.match(/^step-(\d+)$/i);
  if (!match) {
    return null;
  }

  const index = Number.parseInt(match[1], 10) - 1;
  if (Number.isNaN(index) || index < 0 || index >= TOTAL_STEPS) {
    return null;
  }

  return index;
};

type StepPageProps = {
  params: StepPageParams;
};

export default function StepPage({ params }: StepPageProps) {
  const initialStep = parseInitialStep(params.step);

  if (initialStep === null) {
    notFound();
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <CourseMappingWizard initialStep={initialStep ?? 0} />
      </main>
    </div>
  );
}