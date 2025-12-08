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