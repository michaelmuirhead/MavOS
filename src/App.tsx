import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import { Shell } from '@/components/Shell';
import { SignIn } from '@/components/SignIn';
import { Dashboard } from '@/modules/dashboard/Dashboard';
import { Tasks } from '@/modules/tasks/Tasks';
import { Finances } from '@/modules/finances/Finances';
import { Scripture } from '@/modules/scripture/Scripture';
import { Health } from '@/modules/health/Health';
import { Journal } from '@/modules/journal/Journal';
import { supabaseConfigured } from '@/lib/supabase';
import { SetupScreen } from '@/components/SetupScreen';

export default function App() {
  const { user, loading, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!supabaseConfigured) return <SetupScreen />;
  if (loading) return <SplashScreen />;
  if (!user) return <SignIn />;

  return (
    <Shell>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/finances" element={<Finances />} />
        <Route path="/scripture" element={<Scripture />} />
        <Route path="/health" element={<Health />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Shell>
  );
}

function SplashScreen() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="font-display text-2xl text-ink-300 tracking-wide">MavOS</div>
    </div>
  );
}
