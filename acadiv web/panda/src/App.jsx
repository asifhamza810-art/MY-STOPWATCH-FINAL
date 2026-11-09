import { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AppShell from './components/layout/AppShell'

// Public standalone marketing & auth pages
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'

// Authenticated application pages (lazy-loaded)
const ExploreHubPage = lazy(() => import('./pages/ExploreHubPage'))
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'))
const AssessmentPage = lazy(() => import('./pages/AssessmentPage'))
const DiagnosticMatchPage = lazy(() => import('./pages/DiagnosticMatchPage'))
const CareerRoadmapPage = lazy(() => import('./pages/CareerRoadmapPage'))
const SkillGapPage = lazy(() => import('./pages/SkillGapPage'))
const InstitutionsPage = lazy(() => import('./pages/InstitutionsPage'))
const SkillFirmsPage = lazy(() => import('./pages/SkillFirmsPage'))
const CampusBulletinPage = lazy(() => import('./pages/CampusBulletinPage'))
const ArtifactVaultPage = lazy(() => import('./pages/ArtifactVaultPage'))
const PortfolioPage = lazy(() => import('./pages/PortfolioPage'))
const CommunityPage = lazy(() => import('./pages/CommunityPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))

function PageFallback() {
  return (
    <div style={{ maxWidth: '840px', margin: '60px auto', padding: '24px' }}>
      <div className="skeleton" style={{ height: '36px', width: '280px', marginBottom: '20px' }} />
      <div className="skeleton" style={{ height: '220px', width: '100%', borderRadius: 'var(--radius-lg)' }} />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            {/* ============================================================ */}
            {/* PUBLIC STANDALONE ROUTES (NO DASHBOARD NAVBAR / APP CHIPS)   */}
            {/* ============================================================ */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Publicly Shareable Student Portfolio & ATS CV */}
            <Route path="/portfolio/:username" element={<PortfolioPage />} />

            {/* ============================================================ */}
            {/* AUTHENTICATED STUDENT WORKSPACE (PROTECTED BY APPSHELL)      */}
            {/* ============================================================ */}
            <Route
              element={
                <ProtectedRoute>
                  <AppShell />
                </ProtectedRoute>
              }
            >
              {/* Authenticated Student Hub */}
              <Route path="/explore" element={<ExploreHubPage />} />

              {/* Dual-Path Academic Onboarding */}
              <Route path="/onboarding" element={<OnboardingPage />} />

              {/* Adaptive Holland RIASEC Assessment */}
              <Route path="/assessment" element={<AssessmentPage />} />

              {/* Diagnostic Holland Code & Explainable Match Profile */}
              <Route path="/profile/match" element={<DiagnosticMatchPage />} />

              {/* Interactive 3D Career Roadmap & Pathway Navigator */}
              <Route path="/roadmap" element={<CareerRoadmapPage />} />

              {/* Skill-Gap Diagnostics vs P@SHA/HEC Standards */}
              <Route path="/skill-gap" element={<SkillGapPage />} />

              {/* Karachi Accredited Institution Directory */}
              <Route path="/institutions" element={<InstitutionsPage />} />

              {/* Verified Karachi Skill Bootcamps & Academies */}
              <Route path="/skills" element={<SkillFirmsPage />} />

              {/* Zero-Chat Campus Opportunity & Competition Bulletin */}
              <Route path="/bulletin" element={<CampusBulletinPage />} />

              {/* Student Evidence & Artifact Vault */}
              <Route path="/vault" element={<ArtifactVaultPage />} />

              {/* Student Own Portfolio Workspace & ATS Export */}
              <Route path="/portfolio/me" element={<PortfolioPage />} />
              <Route path="/portfolio" element={<Navigate to="/portfolio/me" replace />} />

              {/* Moderated Student Discussion Hub */}
              <Route path="/community" element={<CommunityPage />} />

              {/* Student Account & Data Controls */}
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            {/* Universal Fallback: Unmatched paths redirect to / */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  )
}
