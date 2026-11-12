export const SCORING_DIMENSIONS = [
  "FINANCIAL_VIABILITY",
  "FINANCING_STRUCTURE",
  "PROFITABILITY",
  "MARKET_COMMERCIAL",
  "RISK_PREPAREDNESS",
] as const;

export type ScoringDimensionCode = (typeof SCORING_DIMENSIONS)[number];

export type ScoringWeight = {
  dimensionCode: ScoringDimensionCode;
  weight: number;
};

export type ScoringConfiguration = {
  dimensions: ScoringWeight[];
  totalWeight: number;
};

export type ScoreIndicator = { code: string; label: string; value: number | null };

export type ScoreDimension = {
  code: ScoringDimensionCode;
  label: string;
  score: number | null;
  weight: number;
  weightedContribution: number | null;
  status: "ASSESSABLE" | "NOT_ASSESSABLE";
  indicators: ScoreIndicator[];
  positivePoints: string[];
  improvementPoints: string[];
};

export type BusinessPlanScore = {
  globalScore: number | null;
  status: "INCOMPLETE" | "PROVISIONAL" | "COMPLETE";
  assessmentCoverage: number;
  interpretation: "POINTS_CRITIQUES" | "A_RENFORCER" | "ENCOURAGEANT" | "SOLIDE" | null;
  dimensions: ScoreDimension[];
};
