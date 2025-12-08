export type ThemeColor = 'primary' | 'blue' | 'purple' | 'orange' | 'red';

export interface ModuleData {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  progress: number;
  totalLessons: number;
  color: ThemeColor;
  status: 'locked' | 'active' | 'completed';
}

export interface UserStats {
  level: number;
  xp: number;
  streak: number;
  gems: number;
}

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id?: string;
  quiz_id?: string;
  question_text: string;
  options: QuizOption[];
  correct_option_id: string;
  explanation: string;
}