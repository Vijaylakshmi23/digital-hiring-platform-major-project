
export interface WorkerProfile {
  id: number;
  name: string;
  profession: string | null;
  skills: string | null;
  experience: number | null;
  expectedWage: number | null;
  wageType: string | null;
  location: string | null;
  description: string | null;
  availabilityStatus: string | null;
  profileImageUrl: string | null;
}

export interface WorkerSearchParams {
  profession?: string;
  location?: string;
  minExperience?: number;
  availabilityStatus?: string;
}
