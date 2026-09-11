"use client";

import { useEffect, useState, createContext, useContext } from "react";
import { supabase } from "@/lib/supabase";
import { processSyncQueue, syncDownstream } from "@/lib/db";
import type { User } from "@supabase/supabase-js";
import { AlertCircle } from "lucide-react";

interface Profile {
  id: string;
  email: string;
  role: 'PUBLIC' | 'TREE_OWNER' | 'STEWARD' | 'VERIFIER' | 'PROJECT_ADMIN' | 'SUPER_ADMIN';
  organization_id?: string;
  full_name?: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, profile: null, loading: true });

export const useAuth = () => useContext(AuthContext);

export function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        syncDownstream();
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        syncDownstream();
      } else {
        setProfile(null);
      }
    });

    const handleOnline = () => {
      processSyncQueue();
      syncDownstream();
    };
    window.addEventListener('online', handleOnline);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase!.from('profiles').select('*').eq('id', userId).single();
      if (!error && data) {
        setProfile(data as Profile);
      } else {
        setProfile({ id: userId, email: user?.email || '', role: 'PUBLIC' });
      }
    } catch (e) {
      console.error("Profile fetch error", e);
    } finally {
      setLoading(false);
    }
  };

  if (!supabase) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full border border-destructive/20 text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h1 className="text-xl font-bold text-slate-900 mb-2">Configuration Error</h1>
          <p className="text-slate-600 text-sm mb-6">
            The application cannot start because the Supabase production backend is not configured. 
            Missing environment variables: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.
          </p>
          <div className="text-xs text-slate-400 bg-slate-50 p-4 rounded text-left font-mono">
            Please refer to DEPLOYMENT_CHECKLIST.md to configure the production backend.
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
