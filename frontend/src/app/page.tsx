'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Download,
  Fingerprint,
  LogOut,
  MessageSquare,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { getUserRole, isAuthenticated, logout } from '@/lib/auth';

type Role = 'ADMIN' | 'TEACHER' | 'STUDENT' | undefined;

export default function Home() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [role, setRole] = useState<Role>(undefined);

  useEffect(() => {
    setAuthenticated(isAuthenticated());
    setRole(getUserRole());
    setReady(true);
  }, []);

  const dashboardPath = useMemo(() => {
    if (role === 'ADMIN') return '/admin/dashboard';
    if (role === 'TEACHER') return '/teacher/dashboard';
    if (role === 'STUDENT') return '/student/dashboard';
    return '/login';
  }, [role]);

  return (
    <div className="landing-page min-h-screen p-4 sm:p-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="landing-nav">
          <div className="flex items-center gap-4">
            <div className="landing-brand-icon">
              <Fingerprint className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="landing-brand-title">Smart Attendance System</h1>
              <p className="landing-brand-subtitle">
                Role-based attendance, class management, feedback, and CSV exports
              </p>
            </div>
          </div>

          {ready && (
            <div className="flex flex-wrap items-center gap-3">
              {authenticated ? (
                <>
                  <button
                    onClick={() => router.push(dashboardPath)}
                    className="landing-primary-button"
                  >
                    Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={logout}
                    className="landing-secondary-button"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => router.push('/login')}
                    className="landing-primary-button"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => router.push('/register')}
                    className="landing-secondary-button"
                  >
                    Register
                  </button>
                </>
              )}
            </div>
          )}
        </header>

        <section className="landing-hero">
          <div className="landing-hero-copy">
            <div className="landing-kicker">Platform overview</div>
            <h2 className="landing-hero-title">
              Attendance workflows built for schools.
            </h2>
            <p className="landing-hero-description">
              This system already supports separate admin, teacher, and student dashboards,
              class creation and material updates, attendance marking, post-class feedback,
              and teacher and admin CSV exports.
            </p>

            <div className="landing-hero-actions">
              <button
                onClick={() => router.push(authenticated ? dashboardPath : '/login')}
                className="landing-primary-button"
              >
                {authenticated ? 'Open Dashboard' : 'Open Login'}
              </button>
              <button
                onClick={() => router.push('/register')}
                className="landing-secondary-button"
              >
                Create Account
              </button>
            </div>
          </div>

          <div className="landing-highlight-card">
            <div className="landing-highlight-row">
              <ShieldCheck className="h-5 w-5 text-blue-400" />
              <span>JWT-protected role-based access</span>
            </div>
            <div className="landing-highlight-row">
              <Fingerprint className="h-5 w-5 text-cyan-400" />
              <span>Attendance marking with biometric flow support</span>
            </div>
            <div className="landing-highlight-row">
              <MessageSquare className="h-5 w-5 text-violet-400" />
              <span>Student feedback collection after class completion</span>
            </div>
            <div className="landing-highlight-row">
              <Download className="h-5 w-5 text-emerald-400" />
              <span>CSV export for admins and teachers</span>
            </div>
          </div>
        </section>

        <section className="landing-role-grid">
          <RoleCard
            icon={<Users className="h-6 w-6 text-blue-500" />}
            title="Admin workspace"
            description="Review users, inspect every class, read anonymous class feedback, and export full-system CSV data."
          />
          <RoleCard
            icon={<BookOpen className="h-6 w-6 text-emerald-500" />}
            title="Teacher workspace"
            description="Create classes, update materials, mark teacher attendance, review student feedback, and export your records."
          />
          <RoleCard
            icon={<Fingerprint className="h-6 w-6 text-cyan-500" />}
            title="Student workspace"
            description="Mark attendance, track attendance history, and submit feedback once a class has ended."
          />
        </section>

        <section className="landing-panel">
          <div className="mb-6 flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-amber-400" />
            <h3 className="landing-section-title">What is live in this build</h3>
          </div>

          <div className="landing-check-grid">
            {/* <FeatureLine text="Role-specific dashboards for admins, teachers, and students" /> */}
            <FeatureLine text="Class creation, schedule handling, and material editing" />
            <FeatureLine text="Attendance marking with duplicate protection and validation" />
            <FeatureLine text="Post-class student feedback with teacher/admin review" />
            <FeatureLine text="CSV export from admin and teacher dashboards" />
            {/* <FeatureLine text="Dark mode toggle and persistent theme preference" /> */}
          </div>
        </section>
      </div>
    </div>
  );
}

function RoleCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <article className="landing-panel">
      <div className="landing-card-icon">{icon}</div>
      <h3 className="landing-card-title">{title}</h3>
      <p className="landing-card-description">{description}</p>
    </article>
  );
}

function FeatureLine({ text }: { text: string }) {
  return (
    <div className="landing-check-line">
      <CheckCircle2 className="h-4 w-4 mt-1 text-emerald-400" />
      <span>{text}</span>
    </div>
  );
}
