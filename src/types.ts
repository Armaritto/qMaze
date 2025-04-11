export interface Player {
  id: number;
  color: string;
  position: number;
  name: string;
}

export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
  grade: string;
}

export interface Box {
  id: number;
  backgroundUrl?: string;
}