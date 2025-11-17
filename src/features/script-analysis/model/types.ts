type Occurrence = {
  id: number;
  category_id: number;
  description: string;
  scene_number?: number;
  severity: string;
  recommendation: string;
  justification: string;
};

type Category = {
  id: number;
  type: string;
  label: string;
  severity: string;
  occurrences_count: number;
  percentage: number;
  occurrences: Occurrence[];
};

export type Script = {
  script_id: number;
  title: string;
  rating: string;
  categories: Category[];
};
