import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PublicHeader from '../components/layout/PublicHeader'
import FluidLandingBackground from '../components/fluid/FluidLandingBackground'
import Footer from '../components/layout/Footer'
import {
  ExploreIcon,
  InstitutionsIcon,
  RoadmapIcon,
  VaultIcon,
  CheckIcon,
  BulletinIcon,
  ArrowRightIcon,
} from '../components/icons/AcadivIcons'

export default function LandingPage() {
  const { user } = useAuth()

  return (
    <div style={{ background: 'var(--canvas)', minHeight: '100vh', overflowX: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* ============================================================ */}
      {/* 1. CINEMATIC HERO WITH LIVING FLUID WEBGL BACKGROUND */}
      {/* ============================================================ */}
      <section className="fluid-hero-container">
        {/* Living Fluid WebGL Scene (Autonomous drift & delayed reveal) */}
        <FluidLandingBackground />

        {/* Contrast Veil ensuring 100% crisp typography readability */}
        <div className="fluid-hero-veil" />

        {/* Minimal Public Header (Brand + Only Sign In / Get Started) */}
        <PublicHeader />

        {/* Hero Narrative */}
        <div className="fluid-hero-content">
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(251, 250, 246, 0.1)',
              border: '1px solid rgba(251, 250, 246, 0.2)',
              marginBottom: '28px',
              backdropFilter: 'blur(8px)',
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--lime)' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#FBFAF6' }}>
              Karachi Educational & Career Navigation
            </span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.5rem, 5.8vw, 4.4rem)',
              lineHeight: 1.15,
              fontWeight: 800,
              maxWidth: '960px',
              margin: '0 auto 24px',
              color: '#FBFAF6',
              letterSpacing: '-0.035em',
            }}
          >
            Navigate Your Education and Career with{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #C7ED69 0%, #34B9A5 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Verified Facts
            </span>
            , Not Assumptions.
          </h1>

          <p
            style={{
              fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
              maxWidth: '720px',
              margin: '0 auto 40px',
              color: '#DCE2D9',
              lineHeight: 1.65,
              fontWeight: 400,
            }}
          >
            Acadiv provides explainable guidance tailored to Pakistani educational realities — Matric, FSc, ICS,
            A-Levels, Karachi university entry tests, verified bootcamps, and demonstrable artifact portfolios.
          </p>

          {/* ONLY TWO PRIMARY CALLS TO ACTION */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            {user ? (
              <Link to="/explore" className="btn btn-lime btn-lg">
                Continue to Student Dashboard <ArrowRightIcon size={16} />
              </Link>
            ) : (
              <>
                <Link to="/signup" className="btn btn-lime btn-lg">
                  Get Started <ArrowRightIcon size={16} />
                </Link>
                <Link to="/login" className="btn btn-outline-white btn-lg">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. PRODUCT EXPLANATION & WHAT ACADIV DELIVERS */}
      {/* ============================================================ */}
      <section style={{ padding: '96px 24px', maxWidth: '1240px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 64px' }}>
          <span className="badge badge-verified" style={{ marginBottom: '12px' }}>
            Core Capabilities
          </span>
          <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', marginBottom: '16px' }}>
            Engineered for Pakistani Students
          </h2>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)' }}>
            Traditional career counseling relies on subjective opinions or opaque algorithms. Acadiv grounds every
            recommendation in official curriculum pathways, accredited institutions, and demonstrable evidence.
          </p>
        </div>

        <div className="grid-cols-2" style={{ gap: '32px' }}>
          <div className="card card-interactive" style={{ padding: '36px', border: '1.5px solid var(--border)' }}>
            <div style={{ color: 'var(--forest)', marginBottom: '16px' }}>
              <ExploreIcon size={36} />
            </div>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '10px', color: 'var(--ink)' }}>Explainable Career Discovery</h3>
            <p style={{ fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '16px', color: 'var(--text-muted)' }}>
              Our adaptive RIASEC question engine maps your inclinations to 15+ career disciplines. Receive transparent
              reason traces explaining why each pathway matched your answers.
            </p>
            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--forest)' }}>
              15–20 localized Karachi scenarios • Auditable Holland Code logic
            </div>
          </div>

          <div className="card card-interactive" style={{ padding: '36px', border: '1.5px solid var(--border)' }}>
            <div style={{ color: 'var(--forest)', marginBottom: '16px' }}>
              <InstitutionsIcon size={36} />
            </div>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '10px', color: 'var(--ink)' }}>Comprehensive Karachi Directory</h3>
            <p style={{ fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '16px', color: 'var(--text-muted)' }}>
              Explore accredited universities (NED, IBA, FAST, KU), historic BIEK government colleges (DJ Science, Adamjee),
              and polytechnic institutes (GCT SITE, SBTI). Verified fees, test criteria, and official portals.
            </p>
            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--forest)' }}>
              Accreditation authorities: HEC, PEC, PMDC, BIEK, SBTE, STEVTA
            </div>
          </div>

          <div className="card card-interactive" style={{ padding: '36px', border: '1.5px solid var(--border)' }}>
            <div style={{ color: 'var(--teal)', marginBottom: '16px' }}>
              <RoadmapIcon size={36} />
            </div>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '10px', color: 'var(--ink)' }}>Interactive 3D Pathway Roadmaps</h3>
            <p style={{ fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '16px', color: 'var(--text-muted)' }}>
              Visualize a multi-year trajectory from your current intermediate stage into industry entry. Inspect prerequisites,
              skills gained, and decision point trade-offs with genuine timeline and budget aggregations.
            </p>
            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--forest)' }}>
              3D spatial WebGL canvas + accessible structured timeline view
            </div>
          </div>

          <div className="card card-interactive" style={{ padding: '36px', border: '1.5px solid var(--border)' }}>
            <div style={{ color: 'var(--forest)', marginBottom: '16px' }}>
              <VaultIcon size={36} />
            </div>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '10px', color: 'var(--ink)' }}>Artifact Vault & ATS-Friendly CV</h3>
            <p style={{ fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '16px', color: 'var(--text-muted)' }}>
              A secure workspace for student-owned evidence: GitHub projects, competition certificates, and course outputs.
              Export an ATS-conscious CV formatted with student-approved facts only.
            </p>
            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--forest)' }}>
              Proof over claims • Cryptographic unlisted share links
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. THE CONNECTED STUDENT JOURNEY */}
      {/* ============================================================ */}
      <section style={{ background: 'var(--surface-alt)', padding: '96px 24px', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', width: '100%' }}>
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 56px' }}>
            <span className="badge badge-featured" style={{ marginBottom: '12px' }}>
              Student Trajectory
            </span>
            <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', marginBottom: '14px' }}>
              A Coherent Journey from Matric to Employment
            </h2>
            <p style={{ fontSize: '1.02rem', color: 'var(--text-muted)' }}>
              Acadiv connects each stage of your education, ensuring decisions made during Intermediate or A-Levels
              align with university entry examinations and practical workplace skills.
            </p>
          </div>

          <div className="grid-cols-3" style={{ gap: '24px' }}>
            {[
              { num: '01', title: 'Explore', desc: 'Discover 15+ verified Pakistani career families without artificial bias toward medicine or engineering.' },
              { num: '02', title: 'Understand', desc: 'Review explainable RIASEC scoring traces and learn why specific subjects and competencies matter.' },
              { num: '03', title: 'Plan', desc: 'Build an interactive 3D roadmap tracking HSC subjects, FAST/NED/IBA entrance exams, and degree prerequisites.' },
              { num: '04', title: 'Improve', desc: 'Identify competency gaps against P@SHA and industry standards, enrolling in verified Karachi bootcamps like Jawan Pakistan.' },
              { num: '05', title: 'Participate', desc: 'Compete in campus hackathons, speed programming contests, and exhibitions listed on the zero-chat Bulletin.' },
              { num: '06', title: 'Present', desc: 'Publish a verifiable portfolio and print an ATS-optimized CV linking real code repositories from your Artifact Vault.' },
            ].map((step) => (
              <div
                key={step.num}
                className="card card-interactive"
                style={{
                  padding: '32px 28px',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                }}
              >
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--teal)', letterSpacing: '0.08em', marginBottom: '12px' }}>
                  STAGE {step.num}
                </div>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '8px', color: 'var(--ink)' }}>{step.title}</h3>
                <p style={{ fontSize: '0.92rem', lineHeight: 1.55, color: 'var(--text-muted)' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. TRUST & STRICT EVIDENCE STANDARDS */}
      {/* ============================================================ */}
      <section style={{ padding: '96px 24px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        <div className="card card-dark" style={{ padding: '56px 40px', textAlign: 'center' }}>
          <span className="badge badge-dark" style={{ marginBottom: '16px' }}>
            Integrity First
          </span>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', marginBottom: '16px', color: '#FBFAF6' }}>
            Zero AI Sloppiness. Zero Fabricated Data.
          </h2>
          <p style={{ maxWidth: '680px', margin: '0 auto 40px', fontSize: '1rem', color: '#DCE2D9' }}>
            Acadiv strictly enforces data provenance. When official semester fees or admission dates are not published,
            they remain transparently marked as unknown rather than disguised as free or estimated.
          </p>

          <div className="grid-cols-3" style={{ gap: '24px', textAlign: 'left' }}>
            <div style={{ background: 'rgba(251, 250, 246, 0.06)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(251, 250, 246, 0.12)' }}>
              <div style={{ color: '#C7ED69', marginBottom: '10px' }}>
                <CheckIcon size={22} />
              </div>
              <h4 style={{ color: '#FBFAF6', marginBottom: '6px' }}>Direct Sourcing</h4>
              <p style={{ fontSize: '0.88rem', color: '#A4B3B4' }}>
                All university profiles link directly to official NED, IBA, FAST, and University of Karachi portals.
              </p>
            </div>

            <div style={{ background: 'rgba(251, 250, 246, 0.06)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(251, 250, 246, 0.12)' }}>
              <div style={{ color: '#34B9A5', marginBottom: '10px' }}>
                <BulletinIcon size={22} />
              </div>
              <h4 style={{ color: '#FBFAF6', marginBottom: '6px' }}>Automated Expiry</h4>
              <p style={{ fontSize: '0.88rem', color: '#A4B3B4' }}>
                Campus Bulletin opportunities disappear immediately once their deadline passes to avoid stale links.
              </p>
            </div>

            <div style={{ background: 'rgba(251, 250, 246, 0.06)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(251, 250, 246, 0.12)' }}>
              <div style={{ color: '#C7ED69', marginBottom: '10px' }}>
                <VaultIcon size={22} />
              </div>
              <h4 style={{ color: '#FBFAF6', marginBottom: '6px' }}>Student Data Control</h4>
              <p style={{ fontSize: '0.88rem', color: '#A4B3B4' }}>
                Your assessment answers, roadmaps, and vault files remain private by default with full deletion controls.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. CLOSING CTA SECTION */}
      {/* ============================================================ */}
      <section style={{ padding: '80px 24px 100px', textAlign: 'center', background: 'var(--canvas)' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(2.2rem, 4vw, 3rem)', marginBottom: '16px' }}>
            Ready to Take Control of Your Career Path?
          </h2>
          <p style={{ fontSize: '1.1rem', marginBottom: '36px', color: 'var(--text-muted)' }}>
            Join students across Karachi navigating college admissions, technical bootcamps, and career milestones.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <Link to="/signup" className="btn btn-primary btn-lg" style={{ gap: '10px' }}>
              Get Started with Acadiv <ArrowRightIcon size={16} />
            </Link>
            <Link to="/signup" className="btn btn-outline btn-lg">
              Sign Up Now
            </Link>
          </div>
        </div>
      </section>

      {/* Complete Full-Width Footer with Organic Crumble Motif */}
      <Footer showMotif={true} />
    </div>
  )
}
