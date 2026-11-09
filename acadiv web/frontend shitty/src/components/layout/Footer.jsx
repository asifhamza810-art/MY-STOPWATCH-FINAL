import { Link } from 'react-router-dom'
import AcadivLogo from '../brand/AcadivLogo'

export default function Footer() {
  return (
    <footer className="footer no-print">
      <div className="footer-inner">
        <div className="footer-brand">
          <div style={{ marginBottom: '14px' }}>
            <AcadivLogo variant="full" size="md" surface="light" />
          </div>
          <p>
            An evidence-based educational and career-navigation platform built specifically for Pakistani students.
            Designed around Karachi colleges, universities, entry examinations, and real industry pathways.
          </p>
          <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span className="badge badge-verified">Verified Karachi Directory</span>
            <span className="badge badge-forest">Zero Fabrication</span>
          </div>
        </div>

        <div className="footer-col">
          <h4>Navigation</h4>
          <ul>
            <li><Link to="/explore">Student Dashboard</Link></li>
            <li><Link to="/assessment">RIASEC Assessment</Link></li>
            <li><Link to="/profile/match">Diagnostic Match</Link></li>
            <li><Link to="/roadmap">3D Career Roadmap</Link></li>
            <li><Link to="/skill-gap">Skill-Gap Analysis</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Discovery</h4>
          <ul>
            <li><Link to="/institutions">Karachi Institutions</Link></li>
            <li><Link to="/skills">Skill Firms & Bootcamps</Link></li>
            <li><Link to="/bulletin">Campus Bulletin</Link></li>
            <li><Link to="/community">Community Discussion</Link></li>
            <li><Link to="/vault">Student Artifact Vault</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Integrity & Provenance</h4>
          <ul>
            <li><a href="https://www.hec.gov.pk/" target="_blank" rel="noreferrer">HEC Pakistan Recognized</a></li>
            <li><a href="https://www.biek.edu.pk/" target="_blank" rel="noreferrer">BIEK Karachi Affiliations</a></li>
            <li><a href="https://beta.sbte.edu.pk/" target="_blank" rel="noreferrer">SBTE Technical Board</a></li>
            <li><a href="https://stevta.gos.pk/" target="_blank" rel="noreferrer">STEVTA Vocational List</a></li>
            <li><a href="https://navttc.gov.pk/" target="_blank" rel="noreferrer">NAVTTC Training Partners</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div>
          © {new Date().getFullYear()} Acadiv. All institutional trademarks belong to their respective universities and boards.
        </div>
        <div>
          Fee and admission records reflect verified public announcements. Final eligibility and cutoffs must be confirmed with respective admissions offices.
        </div>
      </div>
    </footer>
  )
}
