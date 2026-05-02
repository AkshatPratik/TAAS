import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from './supabase';
import { Database } from './database.types';

type RoadmapWithModules = Database['public']['Tables']['roadmaps']['Row'] & {
  modules: (Database['public']['Tables']['modules']['Row'] & {
    checkpoints: Database['public']['Tables']['checkpoints']['Row'][]
  })[]
};

export function useRoadmaps() {
  return useQuery({
    queryKey: ['roadmaps'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('roadmaps')
        .select(`
          *,
          modules (*, checkpoints (*))
        `)
        .order('order', { referencedTable: 'modules', ascending: true })
        .order('order', { referencedTable: 'modules.checkpoints', ascending: true });

      if (error) throw error;
      return data as RoadmapWithModules[];
    }
  });
}

export function useSubmissions(studentId?: string) {
  return useQuery({
    queryKey: ['submissions', studentId],
    queryFn: async () => {
      let query = supabase.from('submissions').select('*');
      if (studentId) query = query.eq('student_id', studentId);
      
      const { data, error } = await query.order('submitted_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!studentId,
  });
}

export function useSubmitCheckpoint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: Database['public']['Tables']['submissions']['Insert']) => {
      const { data, error } = await supabase.from('submissions').insert([vars]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['submissions', vars.student_id] });
    }
  });
}

export function useNgoChallenges(ngoId?: string) {
  return useQuery({
    queryKey: ['ngoChallenges', ngoId],
    queryFn: async () => {
      let query = supabase.from('ngo_challenges').select('*, users!ngo_id(name)');
      if (ngoId) query = query.eq('ngo_id', ngoId);

      const { data, error } = await query.order('posted_at', { ascending: false });
      if (error) throw error;
      return data.map(d => ({ ...d, ngoName: (d.users as any)?.name || 'NGO' }));
    }
  });
}

export function useCreateNgoChallenge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: Database['public']['Tables']['ngo_challenges']['Insert']) => {
      const { data, error } = await supabase.from('ngo_challenges').insert([vars]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ngoChallenges'] });
    }
  });
}

export function useApplications(studentId?: string) {
  return useQuery({
    queryKey: ['applications', studentId],
    queryFn: async () => {
      let query = supabase.from('applications').select('*, projects!project_id(title)');
      if (studentId) query = query.eq('student_id', studentId);
      
      const { data, error } = await query.order('applied_at', { ascending: false });
      if (error) throw error;
      return data.map(a => ({ ...a, projectTitle: (a.projects as any)?.title || 'Project' }));
    },
    enabled: !!studentId,
  });
}

export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string, status: 'accepted' | 'rejected' }) => {
      const { data, error } = await supabase.from('applications').update({ status }).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['startupApplications'] });
    }
  });
}

export function useProjects(startupId?: string) {
  return useQuery({
    queryKey: ['projects', startupId],
    queryFn: async () => {
      let query = supabase.from('projects').select('*, users!startup_id(name)');
      if (startupId) query = query.eq('startup_id', startupId);

      const { data, error } = await query.order('posted_at', { ascending: false });
      if (error) throw error;
      return data.map(d => ({ ...d, startupName: (d.users as any)?.name || 'Startup' }));
    }
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: Database['public']['Tables']['projects']['Insert']) => {
      const { data, error } = await supabase.from('projects').insert([vars]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  });
}

export function useStartupApplications(startupId?: string) {
  return useQuery({
    queryKey: ['startupApplications', startupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('applications')
        .select('*, users!student_id(name), projects!inner(startup_id)')
        .eq('projects.startup_id', startupId)
        .order('applied_at', { ascending: false });
        
      if (error) throw error;
      return data.map(a => ({ 
        ...a, 
        studentName: (a.users as any)?.name || 'Student' 
      }));
    },
    enabled: !!startupId,
  });
}

export function useNgoSubmissions(ngoId?: string) {
  return useQuery({
    queryKey: ['ngoSubmissions', ngoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('submissions')
        .select('*, users!student_id(name), ngo_challenges!inner(ngo_id)')
        .eq('ngo_challenges.ngo_id', ngoId)
        .order('submitted_at', { ascending: false });
        
      if (error) throw error;
      return data.map(s => ({ 
        ...s, 
        studentName: (s.users as any)?.name || 'Student' 
      }));
    },
    enabled: !!ngoId,
  });
}

// ---- Marketplace & Admin Hooks ----

export function useMarketplaceProjects() {
  return useQuery({
    queryKey: ['marketplaceProjects'],
    queryFn: async () => {
      // Get all projects with application counts
      const { data, error } = await supabase
        .from('projects')
        .select('*, users!startup_id(name), applications(count)')
        .order('posted_at', { ascending: false });
      if (error) throw error;
      return data.map(d => ({ 
        ...d, 
        startupName: (d.users as any)?.name || 'Startup',
        applicants: Array.isArray(d.applications) ? d.applications.length : (d.applications?.[0]?.count || 0)
      }));
    }
  });
}

export function useApplyToProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: Database['public']['Tables']['applications']['Insert']) => {
      const { data, error } = await supabase.from('applications').insert([vars]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['applications', vars.student_id] });
    }
  });
}

export function useAdminSubmissions() {
  return useQuery({
    queryKey: ['adminSubmissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('submissions')
        .select('*, checkpoints(title)')
        .order('submitted_at', { ascending: false });
      if (error) throw error;
      return data.map(s => ({ ...s, checkpointTitle: (s.checkpoints as any)?.title }));
    }
  });
}

export function useAdminApplications() {
  return useQuery({
    queryKey: ['adminApplications'],
    queryFn: async () => {
      const { data, error } = await supabase.from('applications').select('*');
      if (error) throw error;
      return data;
    }
  });
}

export function useEvaluateSubmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, score, feedback }: { id: string, score: number, feedback: string }) => {
      const { data, error } = await supabase
        .from('submissions')
        .update({ status: 'evaluated', score, feedback })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSubmissions'] });
    }
  });
}

export function useNgoEvaluateSubmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string, status: 'accepted' | 'rejected' }) => {
      const { data, error } = await supabase
        .from('submissions')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ngoSubmissions'] });
    }
  });
}

// ======================================================
// NGO Test System Hooks
// ======================================================

export function useNgoTests(ngoId?: string) {
  return useQuery({
    queryKey: ['ngoTests', ngoId],
    queryFn: async () => {
      let query = supabase
        .from('tests')
        .select('*, questions(count), test_results(count)')
        .order('created_at', { ascending: false });
      if (ngoId) query = query.eq('ngo_id', ngoId);

      const { data, error } = await query;
      if (error) throw error;
      return data.map(t => ({
        ...t,
        questionCount: (t.questions as any)?.[0]?.count ?? 0,
        resultCount: (t.test_results as any)?.[0]?.count ?? 0,
      }));
    },
    enabled: !!ngoId,
  });
}

export function useCreateTest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: Database['public']['Tables']['tests']['Insert']) => {
      const { data, error } = await supabase.from('tests').insert([vars]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ngoTests'] });
    }
  });
}

export function useUpdateTest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Database['public']['Tables']['tests']['Update']) => {
      const { data, error } = await supabase.from('tests').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ngoTests'] });
    }
  });
}

export function usePublishTest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, is_published }: { id: string, is_published: boolean }) => {
      const { data, error } = await supabase
        .from('tests')
        .update({ is_published, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ngoTests'] });
      queryClient.invalidateQueries({ queryKey: ['publishedTests'] });
    }
  });
}

export function useDeleteTest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tests').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ngoTests'] });
    }
  });
}

// ---- Questions ----

export function useTestQuestions(testId?: string) {
  return useQuery({
    queryKey: ['testQuestions', testId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('test_id', testId!)
        .order('order', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!testId,
  });
}

export function useAddQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: Database['public']['Tables']['questions']['Insert']) => {
      const { data, error } = await supabase.from('questions').insert([vars]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['testQuestions', vars.test_id] });
      queryClient.invalidateQueries({ queryKey: ['ngoTests'] });
    }
  });
}

export function useUpdateQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string, test_id: string } & Database['public']['Tables']['questions']['Update']) => {
      const { data, error } = await supabase.from('questions').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['testQuestions', vars.test_id] });
    }
  });
}

export function useDeleteQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, test_id }: { id: string, test_id: string }) => {
      const { error } = await supabase.from('questions').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['testQuestions', vars.test_id] });
      queryClient.invalidateQueries({ queryKey: ['ngoTests'] });
    }
  });
}

// ---- Test Results ----

export function useTestResults(testId?: string) {
  return useQuery({
    queryKey: ['testResults', testId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('test_results')
        .select('*, users!student_id(name, email)')
        .eq('test_id', testId!)
        .order('completed_at', { ascending: false });
      if (error) throw error;
      return data.map(r => ({
        ...r,
        studentName: (r.users as any)?.name || 'Student',
        studentEmail: (r.users as any)?.email || '',
      }));
    },
    enabled: !!testId,
  });
}

export function useSubmitTestResult() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: Database['public']['Tables']['test_results']['Insert']) => {
      const { data, error } = await supabase.from('test_results').insert([vars]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['testResults', vars.test_id] });
      queryClient.invalidateQueries({ queryKey: ['publishedTests'] });
    }
  });
}

// For students: get published tests
export function usePublishedTests() {
  return useQuery({
    queryKey: ['publishedTests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tests')
        .select('*, users!ngo_id(name), questions(count), test_results(count)')
        .eq('is_published', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data.map(t => ({
        ...t,
        ngoName: (t.users as any)?.name || 'NGO',
        questionCount: (t.questions as any)?.[0]?.count ?? 0,
        resultCount: (t.test_results as any)?.[0]?.count ?? 0,
      }));
    }
  });
}

// ======================================================
// Business & Talent Hooks
// ======================================================

export function useBusinessStudents() {
  return useQuery({
    queryKey: ['businessStudents'],
    queryFn: async () => {
      // Fetch students with accepted submissions
      const { data, error } = await supabase
        .from('submissions')
        .select(`
          id,
          student_id,
          score,
          status,
          users!student_id(name),
          ngo_challenges!inner(title, skills)
        `)
        .eq('status', 'accepted')
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      return data.map(s => ({
        id: s.id,
        studentId: s.student_id,
        studentName: (s.users as any)?.name || 'Student',
        challengeTitle: (s.ngo_challenges as any)?.title || 'Challenge',
        skills: (s.ngo_challenges as any)?.skills || [],
        score: s.score,
        status: s.status,
      }));
    }
  });
}

export function useBusinessShortlist(businessId?: string) {
  return useQuery({
    queryKey: ['shortlist', businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shortlists')
        .select('*')
        .eq('business_id', businessId!);
      if (error) throw error;
      return data;
    },
    enabled: !!businessId,
  });
}

export function useShortlistStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ business_id, student_id, isShortlisted }: { business_id: string, student_id: string, isShortlisted: boolean }) => {
      if (isShortlisted) {
        // Remove from shortlist
        const { error } = await supabase.from('shortlists').delete().eq('business_id', business_id).eq('student_id', student_id);
        if (error) throw error;
      } else {
        // Add to shortlist
        const { error } = await supabase.from('shortlists').insert([{ business_id, student_id }]);
        if (error) throw error;
      }
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['shortlist', vars.business_id] });
    }
  });
}

export function useSendOpportunity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: Database['public']['Tables']['opportunities']['Insert']) => {
      const { data, error } = await supabase.from('opportunities').insert([vars]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
    }
  });
}

export function useStudentOpportunities(studentId?: string) {
  return useQuery({
    queryKey: ['opportunities', studentId],
    queryFn: async () => {
      // Simple query - no joins that might fail due to missing tables
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .eq('student_id', studentId!)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching opportunities:', error);
        return [];
      }

      // Fetch business names separately to avoid join issues
      const enriched = await Promise.all(
        (data || []).map(async (opp) => {
          const { data: bizUser } = await supabase
            .from('users')
            .select('name')
            .eq('id', opp.business_id)
            .single();
          return {
            ...opp,
            companyName: bizUser?.name || 'Business',
          };
        })
      );

      return enriched;
    },
    enabled: !!studentId,
  });
}

// ======================================================
// Module Quiz Hooks
// ======================================================

export function useModuleQuizQuestions(moduleId?: string) {
  return useQuery({
    queryKey: ['moduleQuizQuestions', moduleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('module_quiz_questions')
        .select('*')
        .eq('module_id', moduleId!)
        .order('order', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!moduleId,
  });
}

export function useModuleQuizResults(studentId?: string) {
  return useQuery({
    queryKey: ['moduleQuizResults', studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('module_quiz_results')
        .select('*')
        .eq('student_id', studentId!);
      if (error) throw error;
      return data;
    },
    enabled: !!studentId,
  });
}

export function useSubmitModuleQuiz() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      student_id: string;
      module_id: string;
      score: number;
      total_questions: number;
      answers: Record<string, string>;
      violations: number;
    }) => {
      const { data, error } = await supabase
        .from('module_quiz_results')
        .insert([vars])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['moduleQuizResults', vars.student_id] });
    },
  });
}

// Fetch student's NGO test results (for unified talent score)
export function useStudentTestResults(studentId?: string) {
  return useQuery({
    queryKey: ['studentTestResults', studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('test_results')
        .select('*')
        .eq('student_id', studentId!);
      if (error) throw error;
      return data;
    },
    enabled: !!studentId,
  });
}

