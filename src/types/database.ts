export interface Trainee {
  tid: string;  // Changed from uid
  name: string;
  birth_date: string;
  phone: string;
  preferred_position: string;
  status: string;
  email: string;
}

export interface Club {
  cid: string;  // Changed from id
  name: string;
  email: string;
  password: string;  // Hashed
  location: string;
  phone: string;
  contact_person: string;
  logo_url?: string;
  description?: string;
  created_at: string;
}

export interface Scouter {
  sid: string;  // Changed from id
  name: string;
  email: string;
  created_at: string;
}

export interface TestResult {
  id: string;
  tid: string;  // Changed from trainee_uid
  submitted_by: string;  // References sid in scouters table
  test_date: string;
  technical_skills: number;
  tactical_understanding: number;
  physical_abilities: number;
  mental_attributes: number;
  overall_rating: number;
  notes: string;
}

export interface Application {
  id: string;
  tid: string;  // Changed from trainee_uid
  cid: string;  // Changed from club_id
  status: string;
  created_at: string;
}

export type UserRole = 'trainee' | 'scouter' | 'club';

export interface SignUpParams {
  email: string;
  password: string;
  role: UserRole;
  full_name: string;
}

export interface Database {
  public: {
    Tables: {
      trainees: {
        Row: Trainee;
        Insert: Omit<Trainee, 'tid'>;
        Update: Partial<Omit<Trainee, 'tid'>>;
      };
      clubs: {
        Row: Club;
        Insert: Omit<Club, 'cid' | 'created_at'>;
        Update: Partial<Omit<Club, 'cid'>>;
      };
      scouters: {
        Row: Scouter;
        Insert: Omit<Scouter, 'sid' | 'created_at'>;
        Update: Partial<Omit<Scouter, 'sid'>>;
      };
      test_results: {
        Row: TestResult;
        Insert: Omit<TestResult, 'id'>;
        Update: Partial<Omit<TestResult, 'id'>>;
      };
      applications: {
        Row: Application;
        Insert: Omit<Application, 'id' | 'created_at'>;
        Update: Partial<Omit<Application, 'id'>>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
} 