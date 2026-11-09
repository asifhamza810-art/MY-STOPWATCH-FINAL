import { Link } from 'react-router-dom'
import AcadivLogo from '../brand/AcadivLogo'
import OrganicCrumbleMotif from '../brand/OrganicCrumbleMotif'
import {
  ExploreIcon,
  AssessmentIcon,
  RoadmapIcon,
  InstitutionsIcon,
  SkillFirmsIcon,
  BulletinIcon,
  VaultIcon,
  CommunityIcon,
  ExternalLinkIcon,
  CheckIcon,
} from '../icons/AcadivIcons'

export default function Footer({ showMotif = true }) {
  return (
    <footer className="footer no-print" style={{ position: 'relative', marginTop: 'auto' }}>
      {/* Full-Width Organic Crumble Fragment Motif */}
      {showMotif && (
        <div style={{ width: '100%', transform: 'translateY(1px)' }}>
          <OrganicCrumbleMotif variant="footer" />
        </div>
      )}

      <div
        style={{
          background: 'var(--surface)',
          borderTop: '1px solid var(--border)',
          width: '100%',
        }}
      >
        <div className="footer-inner" style={{ maxWidth: '1360px', margin: '0 auto', padding: '60px 32px 40px' }}>
          {/* Brand & Purpose Column */}
          <div className="footer-brand" style={{ maxWidth: '380px' }}>
            <div style={{ marginBottom: '16px' }}>
              <AcadivLogo variant="full" size="md" surface="light" asLink to="/" />
            </div>
            <p style={{ fontSize: '0.92rem', lineHeight: '1.65', color: 'var(--text-muted)' }}>
              An evidence-based educational and career-navigation platform built specifically for Pakistani students.
              Designed around Karachi colleges, universities, entry examinations, and verifiable industry pathways.
            </p>
            <div style={{ marginTop: '20px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span className="badge badge-verified">
                <CheckIcon size={13} /> Karachi Directory
              </span>
              <span className="badge badge-forest">
                <CheckIcon size={13} /> Zero Fabrication
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="footer-col">
            <h4>Student Platform</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li>
                <Link to="/explore" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <ExploreIcon size={16} /> Explore Hub
                </Link>
              </li>
              <li>
                <Link to="/assessment" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <AssessmentIcon size={16} /> RIASEC Assessment
                </Link>
              </li>
              <li>
                <Link to="/roadmap" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <RoadmapIcon size={16} /> 3D Career Roadmap
                </Link>
              </li>
              <li>
                <Link to="/vault" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <VaultIcon size={16} /> Artifact Vault
                </Link>
              </li>
            </ul>
          </div>

          {/* Discovery Links */}
          <div className="footer-col">
            <h4>Karachi Discovery</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li>
                <Link to="/institutions" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <InstitutionsIcon size={16} /> Institutions Directory
                </Link>
              </li>
              <li>
                <Link to="/skills" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <SkillFirmsIcon size={16} /> Skill Bootcamps
                </Link>
              </li>
              <li>
                <Link to="/bulletin" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <BulletinIcon size={16} /> Campus Bulletin
                </Link>
              </li>
              <li>
                <Link to="/community" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <CommunityIcon size={16} /> Community Discussions
                </Link>
              </li>
            </ul>
          </div>

          {/* Provenance & Official Regulatory Sources */}
          <div className="footer-col">
            <h4>Source Provenance</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li>
                <a href="https://www.hec.gov.pk/" target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  HEC Recognized <ExternalLinkIcon size={13} />
                </a>
              </li>
              <li>
                <a href="https://www.biek.edu.pk/" target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  BIEK Karachi Affiliated <ExternalLinkIcon size={13} />
                </a>
              </li>
              <li>
                <a href="https://beta.sbte.edu.pk/" target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  SBTE Sindh Technical <ExternalLinkIcon size={13} />
                </a>
              </li>
              <li>
                <a href="https://stevta.gos.pk/" target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  STEVTA Vocational List <ExternalLinkIcon size={13} />
                </a>
              </li>
              <li>
                <a href="https://navttc.gov.pk/" target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  NAVTTC Partner Institutes <ExternalLinkIcon size={13} />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Base Note */}
        <div
          className="footer-bottom"
          style={{
            maxWidth: '1360px',
            margin: '0 auto',
            padding: '24px 32px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            fontSize: '0.82rem',
            color: 'var(--text-dim)',
          }}
        >
          <div>
            © {new Date().getFullYear()} Acadiv. All institutional trademarks belong to their respective universities and boards.
          </div>
          <div>
            Verified public admission announcements. Confirmation required with official admissions offices.
          </div>
        </div>
      </div>
    </footer>
  )
}
