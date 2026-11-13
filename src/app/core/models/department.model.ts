export interface Department {
  id: string;
  code: string;
  name: string;
  description: string;
  headName: string;
  headEmail: string;
  headAvatar?: string;
  employeeCount: number;
  budget?: string;
  location?: string;
  color?: string;
}

