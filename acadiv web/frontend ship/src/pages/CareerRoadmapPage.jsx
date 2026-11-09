import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import CareerCanvas3D from '../components/roadmap/CareerCanvas3D'
import { SaveIcon, RoadmapIcon, CheckIcon, CalendarIcon } from '../components/icons/AcadivIcons'

const CAREER_PATHWAYS = {
  'software-engineer': [
    {
      _id: 'se-1',
      title: 'Stage 1: Pre-Engineering / ICS Foundation',
      description: 'Excel in Mathematics, Physics, and Algorithmic Logic during HSC (Pre-Engineering/ICS) or A-Levels. Target an aggregate of 70%+ for public merit and tier-1 entry tests.',
      status: 'done',
      estimatedMonths: 24,
      skills: ['Mathematics', 'Physics', 'Programming Logic'],
      prerequisites: ['Matriculation Science (65%+) or O-Levels'],
      isDecisionPoint: false,
      tradeoffs: 'Pre-Engineering keeps hardware/electrical open; ICS focuses purely on computing concepts.',
    },
    {
      _id: 'se-2',
      title: 'Stage 2: Karachi University Entry Tests',
      description: 'Targeted preparation for FAST-NUCES (NU Test), NED Pre-Admission Test, and IBA Karachi computing entry exams. Focus on analytical reasoning and speed calculus.',
      status: 'in_progress',
      estimatedMonths: 4,
      skills: ['Advanced Math', 'Analytical Logic', 'English Comprehension'],
      prerequisites: ['HSC Part 1 results or Cambridge predicted grades'],
      isDecisionPoint: true,
      tradeoffs: 'Public (NED) offers subsidized fees (~PKR 35k/sem); Private (FAST/IBA) offers higher campus recruiting velocity (~PKR 190k+/sem).',
    },
    {
      _id: 'se-3',
      title: 'Stage 3: BS CS / SE Core Foundations',
      description: 'Master Object-Oriented Programming (OOP), Data Structures & Algorithms (DSA), Database Systems (SQL/NoSQL), and Computer Networks at university.',
      status: 'planned',
      estimatedMonths: 24,
      skills: ['C++', 'Data Structures', 'OOP', 'Relational Databases', 'Discrete Math'],
      prerequisites: ['University admission confirmation'],
      isDecisionPoint: false,
      tradeoffs: 'Deep theoretical DSA focus vs immediate quick freelance web development.',
    },
    {
      _id: 'se-4',
      title: 'Stage 4: Specialized Engineering & Vault Evidence',
      description: 'Build 3–4 production-quality full-stack applications (React, Node.js, MongoDB Atlas). Link verifiable GitHub repositories in your Acadiv Artifact Vault and participate in Procom hackathons.',
      status: 'planned',
      estimatedMonths: 12,
      skills: ['React', 'Node.js', 'REST APIs', 'Git', 'Cloud Deployment'],
      prerequisites: ['DSA and database fundamentals'],
      isDecisionPoint: true,
      tradeoffs: 'Full-Stack Web vs AI/ML Engineering vs Mobile Apps.',
    },
    {
      _id: 'se-5',
      title: 'Stage 5: Software House Internship & Placement',
      description: 'Secure summer engineering internships at Karachi software houses, venture-funded tech companies (Careem, Bazaar, VentureDive), or remote global startups.',
      status: 'planned',
      estimatedMonths: 6,
      skills: ['System Architecture', 'Code Review', 'Production Testing', 'CI/CD'],
      prerequisites: ['Verifiable code artifacts in student portfolio'],
      isDecisionPoint: false,
      tradeoffs: 'Local high-growth startup vs established multinational training track.',
    },
  ],

  'mechanical-engineer': [
    {
      _id: 'me-1',
      title: 'Stage 1: HSC Pre-Engineering / DAE Mechanical',
      description: 'Master Physics mechanics, Calculus, and Chemistry during Intermediate Pre-Engineering or a 3-Year DAE in Mechanical Technology through SBTE.',
      status: 'done',
      estimatedMonths: 24,
      skills: ['Calculus', 'Classical Mechanics', 'Thermodynamics'],
      prerequisites: ['Matriculation Science (60%+)'],
      isDecisionPoint: false,
      tradeoffs: 'Intermediate FSc prepares directly for university BS; DAE gives immediate hands-on shop-floor technical skills.',
    },
    {
      _id: 'me-2',
      title: 'Stage 2: PEC-Accredited Engineering Entry',
      description: 'Clear the NED University of Engineering & Technology, Dawood UET, or SSUET pre-admission test. Confirm PEC Green Status accreditation.',
      status: 'in_progress',
      estimatedMonths: 4,
      skills: ['Physics Applications', 'Engineering Mathematics'],
      prerequisites: ['FSc Part 1 (60%+ minimum requirement)'],
      isDecisionPoint: true,
      tradeoffs: 'NED University (Public merit subsidized) vs Dawood UET / Private PEC faculties.',
    },
    {
      _id: 'me-3',
      title: 'Stage 3: Thermal & Mechanical Design Core',
      description: 'Complete university coursework in Fluid Mechanics, Machine Design, Heat Transfer, and CAD/CAM modeling (SolidWorks / AutoCAD).',
      status: 'planned',
      estimatedMonths: 24,
      skills: ['SolidWorks', 'FEA Analysis', 'Thermodynamics', 'Manufacturing Processes'],
      prerequisites: ['First year engineering clearance'],
      isDecisionPoint: false,
      tradeoffs: 'HVAC specialization vs Automotive vs Industrial Robotics.',
    },
    {
      _id: 'me-4',
      title: 'Stage 4: Industrial Plant Internship & Capstone',
      description: 'Undergo mandatory 6–8 week summer training in Karachi industrial corridors (SITE, Port Qasim, Korangi Industrial Area: Engro, K-Electric, Indus Motors).',
      status: 'planned',
      estimatedMonths: 12,
      skills: ['Industrial Maintenance', 'Plant Operations', 'Safety Protocols', 'SCADA'],
      prerequisites: ['Core mechanical curriculum'],
      isDecisionPoint: false,
      tradeoffs: 'Power & Energy sector vs Automotive assembly vs Process manufacturing.',
    },
  ],

  'doctor-mbbs': [
    {
      _id: 'med-1',
      title: 'Stage 1: HSC Pre-Medical Academic Excellence',
      description: 'Maintain 80%+ aggregate in HSC Pre-Medical (Biology, Chemistry, Physics) under BIEK or Federal Board. Matric/FSc grades carry 50% composite weight.',
      status: 'done',
      estimatedMonths: 24,
      skills: ['Cell Biology', 'Organic Chemistry', 'Anatomy Fundamentals'],
      prerequisites: ['Matriculation Science (Biology track)'],
      isDecisionPoint: false,
      tradeoffs: 'High academic sacrifice required; backup plans in Biotechnology or Pharmacy recommended.',
    },
    {
      _id: 'med-2',
      title: 'Stage 2: PMDC National MDCAT Examination',
      description: 'Compete in the Sindh National MDCAT test (180 MCQs: Biology, Chemistry, Physics, English, Logic). Target score: 165+ for public seats (Dow DUHS, JSMU, KMDC).',
      status: 'in_progress',
      estimatedMonths: 5,
      skills: ['Speed Recall', 'Biochemical Pathways', 'Medical Reasoning'],
      prerequisites: ['FSc Pre-Medical completion with 65%+'],
      isDecisionPoint: true,
      tradeoffs: 'Public government medical college (~PKR 45k/year) vs Private PMDC-recognized college (~PKR 1.8M+/year).',
    },
    {
      _id: 'med-3',
      title: 'Stage 3: 5-Year MBBS Medical Curriculum',
      description: 'Complete 5 years of rigorous medical school: Pre-clinical basic sciences (Anatomy, Physiology, Biochemistry, Pharmacology) followed by clinical rotations (Civil Hospital / JPMC).',
      status: 'planned',
      estimatedMonths: 60,
      skills: ['Clinical Diagnostics', 'Pathology', 'Pharmacology', 'Patient History'],
      prerequisites: ['MDCAT admission merit confirmation'],
      isDecisionPoint: false,
      tradeoffs: 'Clinical practice vs Medical research / Public health track.',
    },
    {
      _id: 'med-4',
      title: 'Stage 4: 1-Year Paid House Job & PMDC Full License',
      description: 'Complete 12 months mandatory rotating house job (Medicine, Surgery, Pediatrics, Gynecology) in a recognized teaching hospital to earn permanent PMDC medical practice license.',
      status: 'planned',
      estimatedMonths: 12,
      skills: ['Emergency Care', 'Ward Management', 'Surgical Assisting'],
      prerequisites: ['MBBS Final Professional Examination'],
      isDecisionPoint: false,
      tradeoffs: 'Local FCPS specialization vs USMLE (USA) / PLAB (UK) pathways.',
    },
  ],

  'chartered-accountant': [
    {
      _id: 'ca-1',
      title: 'Stage 1: Intermediate / A-Levels Entry',
      description: 'Complete Intermediate (Commerce / Science) or Cambridge A-Levels. Maintain above 60% aggregate for direct registration with the Institute of Chartered Accountants of Pakistan (ICAP).',
      status: 'done',
      estimatedMonths: 24,
      skills: ['Financial Math', 'Business Accounting', 'Economics'],
      prerequisites: ['Matriculation or O-Levels'],
      isDecisionPoint: false,
      tradeoffs: 'ICAP CA (Pakistan-centric regulatory license) vs ACCA (Global UK-headquartered credential).',
    },
    {
      _id: 'ca-2',
      title: 'Stage 2: ICAP PRC (Pre-Requisite Competency)',
      description: 'Pass 5 computer-based assessment modules: Business Writing, Quantitative Methods, Principles of Economics, Introduction to Accounting, and Introduction to Business.',
      status: 'in_progress',
      estimatedMonths: 6,
      skills: ['Accounting Principles', 'Microeconomics', 'Business Communication'],
      prerequisites: ['ICAP student registration'],
      isDecisionPoint: false,
      tradeoffs: 'Self-study vs full-time registration at recognized RAET academies in Karachi.',
    },
    {
      _id: 'ca-3',
      title: 'Stage 3: Certificate in Accounting & Finance (CAF)',
      description: 'Clear 8 comprehensive CAF papers: Financial Accounting & Reporting, Tax Practices, Cost Accounting, Company Law, and Audit fundamentals.',
      status: 'planned',
      estimatedMonths: 18,
      skills: ['Tax Law', 'Auditing Standards', 'Cost Accounting', 'Financial Statements'],
      prerequisites: ['PRC exam clearance'],
      isDecisionPoint: true,
      tradeoffs: 'CAF is the qualifying threshold for entry into mandatory 3.5-year firm training.',
    },
    {
      _id: 'ca-4',
      title: 'Stage 4: 3.5-Year Articleship at Big 4 Firm',
      description: 'Join a chartered accountancy firm in Karachi (A.F. Ferguson / PwC, KPMG Taseer Hadi, EY Ford Rhodes, BDO Ebrahim) for formal articleship training while clearing CFAP final exams.',
      status: 'planned',
      estimatedMonths: 42,
      skills: ['Statutory Audit', 'Corporate Taxation', 'Financial Modeling', 'IFRS'],
      prerequisites: ['CAF exam clearance'],
      isDecisionPoint: false,
      tradeoffs: 'Big 4 audit firm experience vs mid-tier firm with broader client variety.',
    },
  ],

  'ux-designer': [
    {
      _id: 'ux-1',
      title: 'Stage 1: Visual Design & Creative Foundations',
      description: 'Develop drawing, spatial composition, typography, and human psychology foundations during Intermediate / A-Levels or self-directed digital sketching.',
      status: 'done',
      estimatedMonths: 24,
      skills: ['Visual Hierarchy', 'Typography', 'Color Theory', 'Wireframing'],
      prerequisites: ['Matriculation / O-Levels'],
      isDecisionPoint: false,
      tradeoffs: 'Formal art school degree (IVSAA / KUVS) vs computing background with UX focus.',
    },
    {
      _id: 'ux-2',
      title: 'Stage 2: Design School Entry or Bootcamp',
      description: 'Prepare portfolio for Indus Valley School of Art and Architecture (IVSAA), Karachi University Visual Studies (KUVS), or complete an intensive UI/UX track at Jawan Pakistan.',
      status: 'in_progress',
      estimatedMonths: 6,
      skills: ['Figma', 'User Research', 'Design Systems', 'Usability Testing'],
      prerequisites: ['Creative portfolio submission or bootcamp enrollment'],
      isDecisionPoint: true,
      tradeoffs: '4-year design degree gives deep theory; verified bootcamp offers fast route into entry freelance/agency work.',
    },
    {
      _id: 'ux-3',
      title: 'Stage 3: Real Product Case Studies in Vault',
      description: 'Design 3 comprehensive case studies solving Pakistani product problems (e.g. optimizing mobile banking for low-literacy users, ride-hailing interfaces). Store interactive Figma links in Artifact Vault.',
      status: 'planned',
      estimatedMonths: 12,
      skills: ['Interaction Design', 'Prototyping', 'User Journey Mapping', 'A/B Testing'],
      prerequisites: ['Figma component architecture mastery'],
      isDecisionPoint: false,
      tradeoffs: 'Agency client work vs in-house startup product design focus.',
    },
    {
      _id: 'ux-4',
      title: 'Stage 4: Junior Product Designer Placement',
      description: 'Secure full-time or contract product design roles at Karachi tech companies, software consultancies, or remote international product agencies.',
      status: 'planned',
      estimatedMonths: 6,
      skills: ['Design Sprint Leadership', 'Developer Handoff', 'Product Metrics'],
      prerequisites: ['Verified design case studies in student portfolio'],
      isDecisionPoint: false,
      tradeoffs: 'Local product company vs international remote design contractor.',
    },
  ],
}

export default function CareerRoadmapPage() {
  const { user } = useAuth()
  const [selectedCareer, setSelectedCareer] = useState('software-engineer')
  const [milestones, setMilestones] = useState(CAREER_PATHWAYS['software-engineer'])
  const [selectedNode, setSelectedNode] = useState(CAREER_PATHWAYS['software-engineer'][1])
  const [activeTab, setActiveTab] = useState('3d') // '3d' | 'timeline'
  const [savedRoadmapId, setSavedRoadmapId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState(null)

  // Switch career pathway
  const handleCareerChange = (careerKey) => {
    setSelectedCareer(careerKey)
    const newMilestones = CAREER_PATHWAYS[careerKey] || CAREER_PATHWAYS['software-engineer']
    setMilestones(newMilestones)
    setSelectedNode(newMilestones[0])
    setSaveMessage(null)
  }

  // Load any existing saved roadmaps for student
  useEffect(() => {
    async function loadSavedRoadmaps() {
      if (!user) return
      try {
        const res = await api('/roadmaps', { auth: true })
        if (res.data && res.data.length > 0) {
          const latest = res.data[0]
          setSavedRoadmapId(latest._id)
          if (latest.milestones && latest.milestones.length > 0) {
            setMilestones(latest.milestones)
            setSelectedNode(latest.milestones[0])
          }
        }
      } catch (err) {
        console.warn('Could not load existing saved roadmap:', err.message)
      }
    }
    loadSavedRoadmaps()
  }, [user])

  const handleUpdateStatus = (id, newStatus) => {
    setMilestones((prev) =>
      prev.map((m) => (m._id === id ? { ...m, status: newStatus } : m))
    )
    if (selectedNode && selectedNode._id === id) {
      setSelectedNode((prev) => ({ ...prev, status: newStatus }))
    }
  }

  const handleSaveRoadmap = async () => {
    setSaving(true)
    setSaveMessage(null)
    const totalMonths = milestones.reduce((sum, m) => sum + (Number(m.estimatedMonths) || 0), 0)

    try {
      if (savedRoadmapId) {
        await api(`/roadmaps/${savedRoadmapId}`, {
          method: 'PATCH',
          auth: true,
          body: {
            title: `Roadmap for ${selectedCareer}`,
            milestones,
            timelineAssumptions: `Total estimated timeline: ${totalMonths} months`,
          },
        })
      } else {
        const res = await api('/roadmaps', {
          method: 'POST',
          auth: true,
          body: {
            title: `Roadmap for ${selectedCareer}`,
            milestones,
            timelineAssumptions: `Total estimated timeline: ${totalMonths} months`,
          },
        })
        setSavedRoadmapId(res.data._id)
      }
      setSaveMessage('Roadmap successfully synchronized to your MongoDB profile.')
    } catch (err) {
      setSaveMessage(`Error saving roadmap: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const completedCount = milestones.filter((m) => m.status === 'done').length
  const progressPercent = Math.round((completedCount / Math.max(1, milestones.length)) * 100)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge badge-forest">Interactive Pathway Navigator</span>
            <span className="badge badge-verified">Karachi Academic Verification</span>
          </div>
          <h1>Career Pathway Roadmap</h1>
          <p style={{ maxWidth: '680px', fontSize: '0.98rem' }}>
            Explore verified, milestone-by-milestone pathways through Matric, Intermediate, entry exams, accredited degrees, and real industry placement.
          </p>
        </div>

        {/* View Toggle & Save Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'inline-flex', background: 'var(--surface-alt)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <button
              type="button"
              className={`btn btn-sm ${activeTab === '3d' ? 'btn-forest' : 'btn-ghost'}`}
              onClick={() => setActiveTab('3d')}
            >
              3D Spatial Graph
            </button>
            <button
              type="button"
              className={`btn btn-sm ${activeTab === 'timeline' ? 'btn-forest' : 'btn-ghost'}`}
              onClick={() => setActiveTab('timeline')}
            >
              2D Timeline
            </button>
          </div>

          <button
            type="button"
            className="btn btn-teal btn-sm"
            onClick={handleSaveRoadmap}
            disabled={saving}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <SaveIcon size={14} />
            <span>{saving ? 'Saving...' : 'Save Roadmap'}</span>
          </button>
        </div>
      </div>

      {saveMessage && (
        <div style={{ padding: '12px 18px', borderRadius: 'var(--radius-md)', background: 'var(--teal-soft)', border: '1px solid var(--teal)', color: 'var(--forest)', fontSize: '0.92rem', fontWeight: 600 }}>
          {saveMessage}
        </div>
      )}

      {/* Career Field Switcher Bar */}
      <div className="filter-bar" style={{ gap: '12px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--ink)' }}>
          Career Discipline:
        </span>
        {[
          { id: 'software-engineer', label: 'Software Engineering' },
          { id: 'mechanical-engineer', label: 'Mechanical Engineering' },
          { id: 'doctor-mbbs', label: 'Medical (MBBS)' },
          { id: 'chartered-accountant', label: 'Chartered Accountancy' },
          { id: 'ux-designer', label: 'UI/UX & Product Design' },
        ].map((c) => (
          <button
            key={c.id}
            type="button"
            className={`btn btn-sm ${selectedCareer === c.id ? 'btn-forest' : 'btn-outline'}`}
            onClick={() => handleCareerChange(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Progress Metric Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--ink)' }}>
            Pathway Progress:
          </span>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            {completedCount} of {milestones.length} Milestones Completed ({progressPercent}%)
          </span>
        </div>
        <div style={{ width: '200px', height: '8px', background: 'var(--surface-alt)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
          <div style={{ width: `${progressPercent}%`, height: '100%', background: 'linear-gradient(90deg, var(--teal), var(--lime))', transition: 'width 0.3s ease' }} />
        </div>
      </div>

      {/* Main View Area: 3D Canvas OR 2D Accessible Timeline */}
      {activeTab === '3d' ? (
        <CareerCanvas3D
          milestones={milestones}
          selectedNode={selectedNode}
          onSelectNode={(node) => setSelectedNode(node)}
        />
      ) : (
        /* Accessible 2D Timeline View */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {milestones.map((m, idx) => (
            <div
              key={m._id}
              className="card"
              style={{
                padding: '24px',
                border: selectedNode?._id === m._id ? '2px solid var(--teal)' : '1px solid var(--border)',
                background: selectedNode?._id === m._id ? 'var(--surface-alt)' : 'var(--surface)',
                cursor: 'pointer',
              }}
              onClick={() => setSelectedNode(m)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: m.status === 'done' ? 'var(--teal)' : m.status === 'in_progress' ? 'var(--lime)' : 'var(--surface-alt)',
                      color: m.status === 'done' ? '#FFFFFF' : 'var(--forest)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      border: '1px solid var(--border)',
                    }}
                  >
                    {idx + 1}
                  </span>
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--ink)' }}>{m.title}</h3>
                </div>
                <span className={`badge ${m.status === 'done' ? 'badge-verified' : m.status === 'in_progress' ? 'badge-forest' : 'badge-subtle'}`}>
                  {m.status === 'done' ? 'Completed' : m.status === 'in_progress' ? 'In Progress' : 'Planned'}
                </span>
              </div>
              <p style={{ fontSize: '0.92rem', marginBottom: '12px', lineHeight: '1.5' }}>
                {m.description}
              </p>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                <strong>Prerequisites:</strong> {m.prerequisites?.join(', ')}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selected Node Details Panel */}
      {selectedNode && (
        <div
          className="card"
          style={{
            padding: '36px',
            background: 'var(--surface)',
            border: '1.5px solid var(--border)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span className="badge badge-forest">Milestone Details</span>
                {selectedNode.isDecisionPoint && (
                  <span className="badge badge-verified">Strategic Decision Point</span>
                )}
              </div>
              <h2 style={{ fontSize: '1.7rem' }}>{selectedNode.title}</h2>
            </div>

            {/* Status Switcher Buttons */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className={`btn btn-sm ${selectedNode.status === 'done' ? 'btn-teal' : 'btn-outline'}`}
                onClick={() => handleUpdateStatus(selectedNode._id, 'done')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
              >
                <CheckIcon size={13} />
                <span>Mark Done</span>
              </button>
              <button
                type="button"
                className={`btn btn-sm ${selectedNode.status === 'in_progress' ? 'btn-forest' : 'btn-outline'}`}
                onClick={() => handleUpdateStatus(selectedNode._id, 'in_progress')}
              >
                In Progress
              </button>
              <button
                type="button"
                className={`btn btn-sm ${selectedNode.status === 'planned' ? 'btn-secondary' : 'btn-outline'}`}
                onClick={() => handleUpdateStatus(selectedNode._id, 'planned')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
              >
                <CalendarIcon size={13} />
                <span>Planned</span>
              </button>
            </div>
          </div>

          <p style={{ fontSize: '1rem', lineHeight: '1.65', marginBottom: '24px' }}>
            {selectedNode.description}
          </p>

          <div className="grid-cols-2" style={{ gap: '20px', marginBottom: '24px' }}>
            <div style={{ padding: '20px', background: 'var(--canvas)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '8px', color: 'var(--forest)' }}>
                Prerequisites & Eligibility
              </h4>
              <ul style={{ listStyle: 'none', fontSize: '0.88rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {selectedNode.prerequisites?.map((pre, idx) => (
                  <li key={idx}>• {pre}</li>
                ))}
              </ul>
            </div>

            <div style={{ padding: '20px', background: 'var(--canvas)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '8px', color: 'var(--forest)' }}>
                Core Skills Developed
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {selectedNode.skills?.map((sk, idx) => (
                  <span key={idx} className="badge badge-forest" style={{ fontSize: '0.78rem' }}>
                    {sk}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {selectedNode.tradeoffs && (
            <div
              style={{
                padding: '16px 20px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--teal-soft)',
                border: '1px solid var(--teal)',
                fontSize: '0.9rem',
                color: 'var(--forest)',
              }}
            >
              <strong>Karachi Educational Realities & Tradeoffs:</strong> {selectedNode.tradeoffs}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
