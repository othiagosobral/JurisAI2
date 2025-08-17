export interface BrandingConfig {
  appName: string;
  tagline: string;
  logo: string;
  favicon: string;
  colors: {
    light: ColorScheme;
    dark: ColorScheme;
  };
  fonts: {
    primary: string;
    secondary: string;
  };
  contact: {
    email: string;
    phone: string;
    website: string;
  };
}

export interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
}

export interface Court {
  id: string;
  name: string;
  url: string;
  type: 'estadual' | 'federal' | 'superior';
}

export interface AppConfig {
  api: {
    baseUrl: string;
    timeout: number;
  };
  features: {
    documentAnalysis: boolean;
    caseSearch: boolean;
    contractAnalysis: boolean;
    jurisprudenceSearch: boolean;
    mindMap: boolean;
  };
  courts: Court[];
  fileUpload: {
    maxSize: number;
    allowedTypes: string[];
    maxFiles: number;
  };
  security: {
    enableCSRF: boolean;
    enableCORS: boolean;
    maxRequestSize: number;
    rateLimiting: {
      enabled: boolean;
      requests: number;
      window: number;
    };
  };
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    documentId?: string;
    analysisType?: string;
    caseNumber?: string;
  };
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: Date;
  status: 'uploading' | 'processing' | 'ready' | 'error';
  analysis?: DocumentAnalysis;
}

export interface DocumentAnalysis {
  summary: string;
  keyPoints: string[];
  parties: string[];
  dates: string[];
  obligations: string[];
  risks: string[];
  mindMap?: MindMapNode;
}

export interface MindMapNode {
  id: string;
  label: string;
  type: 'root' | 'category' | 'item';
  children?: MindMapNode[];
  position?: { x: number; y: number };
}

export interface CaseInfo {
  number: string;
  court: string;
  status: string;
  parties: string[];
  subject: string;
  lastUpdate: Date;
  timeline: CaseEvent[];
  deadlines: Deadline[];
}

export interface CaseEvent {
  id: string;
  date: Date;
  description: string;
  type: 'decision' | 'hearing' | 'filing' | 'deadline';
}

export interface Deadline {
  id: string;
  date: Date;
  description: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
}

export interface JurisprudenceResult {
  id: string;
  court: string;
  date: Date;
  summary: string;
  decision: string;
  relevance: number;
  tags: string[];
}

export interface ContractAnalysisResult {
  summary: string;
  risks: Risk[];
  suggestions: Suggestion[];
  compliance: ComplianceCheck[];
  score: number;
}

export interface Risk {
  id: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
  clause: string;
  recommendation: string;
}

export interface Suggestion {
  id: string;
  type: 'improvement' | 'addition' | 'removal';
  description: string;
  clause: string;
  newText?: string;
}

export interface ComplianceCheck {
  id: string;
  law: string;
  article: string;
  status: 'compliant' | 'non-compliant' | 'unclear';
  description: string;
}