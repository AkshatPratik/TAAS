export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          role: "student" | "startup" | "admin" | "ngo" | "business"
          avatar: string | null
          created_at: string
        }
        Insert: {
          id: string
          name: string
          email: string
          role?: "student" | "startup" | "admin" | "ngo" | "business"
          avatar?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          role?: "student" | "startup" | "admin" | "ngo" | "business"
          avatar?: string | null
          created_at?: string
        }
      }
      roadmaps: {
        Row: {
          id: string
          title: string
          description: string
          icon: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          icon: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          icon?: string
        }
      }
      modules: {
        Row: {
          id: string
          roadmap_id: string
          title: string
          description: string
          order: number
        }
        Insert: {
          id?: string
          roadmap_id: string
          title: string
          description: string
          order: number
        }
        Update: {
          id?: string
          roadmap_id?: string
          title?: string
          description?: string
          order?: number
        }
      }
      checkpoints: {
        Row: {
          id: string
          module_id: string
          title: string
          description: string
          order: number
          passing_score: number
        }
        Insert: {
          id?: string
          module_id: string
          title: string
          description: string
          order: number
          passing_score?: number
        }
        Update: {
          id?: string
          module_id?: string
          title?: string
          description?: string
          order?: number
          passing_score?: number
        }
      }
      projects: {
        Row: {
          id: string
          startup_id: string
          title: string
          description: string
          required_skills: Json | null
          min_score: number
          required_checkpoints: Json | null
          status: "open" | "closed"
          posted_at: string
        }
        Insert: {
          id?: string
          startup_id: string
          title: string
          description: string
          required_skills?: Json | null
          min_score?: number
          required_checkpoints?: Json | null
          status?: "open" | "closed"
          posted_at?: string
        }
        Update: {
          id?: string
          startup_id?: string
          title?: string
          description?: string
          required_skills?: Json | null
          min_score?: number
          required_checkpoints?: Json | null
          status?: "open" | "closed"
          posted_at?: string
        }
      }
      ngo_challenges: {
        Row: {
          id: string
          ngo_id: string
          title: string
          description: string
          skills: Json | null
          difficulty: "beginner" | "intermediate" | "advanced"
          status: "open" | "closed"
          posted_at: string
        }
        Insert: {
          id?: string
          ngo_id: string
          title: string
          description: string
          skills?: Json | null
          difficulty: "beginner" | "intermediate" | "advanced"
          status?: "open" | "closed"
          posted_at?: string
        }
        Update: {
          id?: string
          ngo_id?: string
          title?: string
          description?: string
          skills?: Json | null
          difficulty?: "beginner" | "intermediate" | "advanced"
          status?: "open" | "closed"
          posted_at?: string
        }
      }
      submissions: {
        Row: {
          id: string
          student_id: string
          checkpoint_id: string | null
          challenge_id: string | null
          github_link: string | null
          description: string
          status: "pending" | "evaluated" | "accepted" | "rejected"
          score: number | null
          feedback: string | null
          submitted_at: string
        }
        Insert: {
          id?: string
          student_id: string
          checkpoint_id?: string | null
          challenge_id?: string | null
          github_link?: string | null
          description: string
          status?: "pending" | "evaluated" | "accepted" | "rejected"
          score?: number | null
          feedback?: string | null
          submitted_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          checkpoint_id?: string | null
          challenge_id?: string | null
          github_link?: string | null
          description?: string
          status?: "pending" | "evaluated" | "accepted" | "rejected"
          score?: number | null
          feedback?: string | null
          submitted_at?: string
        }
      }
      applications: {
        Row: {
          id: string
          student_id: string
          project_id: string
          status: "pending" | "accepted" | "rejected"
          talent_score: number
          applied_at: string
        }
        Insert: {
          id?: string
          student_id: string
          project_id: string
          status?: "pending" | "accepted" | "rejected"
          talent_score: number
          applied_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          project_id?: string
          status?: "pending" | "accepted" | "rejected"
          talent_score?: number
          applied_at?: string
        }
      }
      // --- NGO Test System ---
      tests: {
        Row: {
          id: string
          ngo_id: string
          title: string
          description: string
          is_published: boolean
          time_limit_minutes: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          ngo_id: string
          title: string
          description: string
          is_published?: boolean
          time_limit_minutes?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          ngo_id?: string
          title?: string
          description?: string
          is_published?: boolean
          time_limit_minutes?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      questions: {
        Row: {
          id: string
          test_id: string
          question_text: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          correct_option: "A" | "B" | "C" | "D"
          order: number
          created_at: string
        }
        Insert: {
          id?: string
          test_id: string
          question_text: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          correct_option: "A" | "B" | "C" | "D"
          order?: number
          created_at?: string
        }
        Update: {
          id?: string
          test_id?: string
          question_text?: string
          option_a?: string
          option_b?: string
          option_c?: string
          option_d?: string
          correct_option?: "A" | "B" | "C" | "D"
          order?: number
          created_at?: string
        }
      }
      test_results: {
        Row: {
          id: string
          test_id: string
          student_id: string
          score: number
          total_questions: number
          answers: Json | null
          completed_at: string
        }
        Insert: {
          id?: string
          test_id: string
          student_id: string
          score: number
          total_questions: number
          answers?: Json | null
          completed_at?: string
        }
        Update: {
          id?: string
          test_id?: string
          student_id?: string
          score?: number
          total_questions?: number
          answers?: Json | null
          completed_at?: string
        }
      }
      businesses: {
        Row: {
          id: string
          company_name: string
          industry: string | null
          website: string | null
          description: string | null
          created_at: string
        }
        Insert: {
          id: string
          company_name: string
          industry?: string | null
          website?: string | null
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          company_name?: string
          industry?: string | null
          website?: string | null
          description?: string | null
          created_at?: string
        }
      }
      shortlists: {
        Row: {
          id: string
          business_id: string
          student_id: string
          created_at: string
        }
        Insert: {
          id?: string
          business_id: string
          student_id: string
          created_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          student_id?: string
          created_at?: string
        }
      }
      opportunities: {
        Row: {
          id: string
          business_id: string
          student_id: string
          title: string
          description: string
          type: "internship" | "job"
          salary_range: string | null
          status: "sent" | "viewed" | "accepted" | "rejected"
          created_at: string
        }
        Insert: {
          id?: string
          business_id: string
          student_id: string
          title: string
          description: string
          type: "internship" | "job"
          salary_range?: string | null
          status?: "sent" | "viewed" | "accepted" | "rejected"
          created_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          student_id?: string
          title?: string
          description?: string
          type?: "internship" | "job"
          salary_range?: string | null
          status?: "sent" | "viewed" | "accepted" | "rejected"
          created_at?: string
        }
      }
    }
  }
}
