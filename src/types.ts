export interface PaperSection {
  title: string;
  content: string;
}

export interface ResearchPaper {
  id: string;
  title: string;
  authors: string[];
  affiliations: string[];
  abstract: string;
  category: string;
  date: string;
  doi: string;
  sections: PaperSection[];
  references: string[];
  isGenerated?: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: string;
}

export type PaperCategory = "All" | "Architecture" | "Optimization" | "Alignment" | "Evaluation" | "Multimodality" | "Security";
