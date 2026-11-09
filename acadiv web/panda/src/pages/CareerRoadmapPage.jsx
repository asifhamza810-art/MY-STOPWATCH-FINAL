import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import CareerCanvas3D from '../components/roadmap/CareerCanvas3D'
import { SaveIcon, RoadmapIcon, CheckIcon, CalendarIcon, StarIcon, ArrowRightIcon } from '../components/icons/AcadivIcons'

// Comprehensive fallback milestones for all 15 catalog careers in Karachi/Pakistani context
const DEFAULT_PATHWAY_TEMPLATES = {
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
      title: 'Stage 4: Industrial Internships & PEC Project',
      description: 'Complete mandatory industrial internships at Port Qasim, Pakistan Machine Tool Factory (PMTF), Indus Motor Company (Toyota), or K-Electric.',
      status: 'planned',
      estimatedMonths: 12,
      skills: ['PLC Programming', 'Quality Assurance', 'Plant Maintenance'],
      prerequisites: ['Core engineering credits complete'],
      isDecisionPoint: false,
      tradeoffs: 'Industrial manufacturing vs heavy plant operations vs technical sales.',
    },
    {
      _id: 'me-5',
      title: 'Stage 5: Graduate Engineer Trainee (GET) Role',
      description: 'Secure competitive GET roles in multinational energy, automotive, FMCG (Unilever, Engro), or prepare for PEC Registered Engineer certification.',
      status: 'planned',
      estimatedMonths: 6,
      skills: ['Project Management', 'ISO Standards', 'Safety Engineering'],
      prerequisites: ['BS Mechanical Engineering degree from PEC-accredited faculty'],
      isDecisionPoint: false,
      tradeoffs: 'Local industrial plant operations vs overseas Gulf opportunities vs MS abroad.',
    },
  ],

  'doctor-mbbs': [
    {
      _id: 'med-1',
      title: 'Stage 1: Intermediate Pre-Medical Excellence',
      description: 'Score 85%+ in HSC Pre-Medical (Biology, Chemistry, Physics) or A-Levels (minimum 3 principal subjects with IBCC equivalence) to qualify for competitive MDCAT quotas.',
      status: 'done',
      estimatedMonths: 24,
      skills: ['Biology', 'Organic Chemistry', 'Physics'],
      prerequisites: ['Matriculation Science with Biology (70%+)'],
      isDecisionPoint: false,
      tradeoffs: 'High HSC board aggregate is mandatory for public medical colleges in Sindh.',
    },
    {
      _id: 'med-2',
      title: 'Stage 2: MDCAT Entrance Examination',
      description: 'Prepare rigorously for the provincial MDCAT administered by PM&DC/DUHS. Focus on biology recall, chemistry problem-solving, and logical reasoning speed.',
      status: 'in_progress',
      estimatedMonths: 4,
      skills: ['MDCAT Reasoning', 'Medical Ethics Basics', 'Speed Diagnostics'],
      prerequisites: ['HSC Part 1 clearance with 65%+ aggregate'],
      isDecisionPoint: true,
      tradeoffs: 'Public medical colleges (Dow, SMC) have ~$35k PKR/yr fees; Private colleges (AKU, Ziauddin) require $1.5M–$2.5M PKR/yr.',
    },
    {
      _id: 'med-3',
      title: 'Stage 3: 5-Year MBBS Academic Curriculum',
      description: 'Complete pre-clinical (Anatomy, Physiology, Biochemistry, Pharmacology) and clinical years with ward rotations across Karachi civil hospitals.',
      status: 'planned',
      estimatedMonths: 60,
      skills: ['Clinical Examination', 'Pharmacology', 'Pathology', 'Patient Interaction'],
      prerequisites: ['PM&DC-recognized medical college enrollment'],
      isDecisionPoint: false,
      tradeoffs: 'Pre-clinical theoretical mastery vs early hospital ward exposure.',
    },
    {
      _id: 'med-4',
      title: 'Stage 4: Mandatory House Job',
      description: 'One full year of paid rotary internship (House Job) divided into medicine and surgery rotations at Civil Hospital Karachi, JPMC, or tertiary teaching hospitals.',
      status: 'planned',
      estimatedMonths: 12,
      skills: ['Emergency Medicine', 'Patient Management', 'Surgical Assisting'],
      prerequisites: ['Final professional MBBS examination clearance'],
      isDecisionPoint: true,
      tradeoffs: 'Public tertiary hospital (high patient volume & hands-on autonomy) vs private hospital (structured systems).',
    },
    {
      _id: 'med-5',
      title: 'Stage 5: FCPS-1 / Post-Graduate Specialization',
      description: 'Pass the College of Physicians and Surgeons Pakistan (CPSP) FCPS Part 1 exam or explore international licensing (USMLE / PLAB / AMC) to enter formal residency.',
      status: 'planned',
      estimatedMonths: 48,
      skills: ['Sub-Specialty Clinical Practice', 'Medical Research', 'Evidence-Based Care'],
      prerequisites: ['Full PM&DC permanent medical registration & completed House Job'],
      isDecisionPoint: false,
      tradeoffs: 'Local FCPS 4-year residency vs international licensure pathway.',
    },
  ],

  'chartered-accountant': [
    {
      _id: 'ca-1',
      title: 'Stage 1: PRC (Pre-Requisite Competencies)',
      description: 'Register with the Institute of Chartered Accountants of Pakistan (ICAP) after HSC (Commerce, Pre-Engineering, Pre-Medical, ICS) or A-Levels and pass PRC exams.',
      status: 'done',
      estimatedMonths: 6,
      skills: ['Financial Accounting Basics', 'Economics', 'Business Communication'],
      prerequisites: ['Intermediate (50%+) or A-Levels minimum 2 passes'],
      isDecisionPoint: false,
      tradeoffs: 'Fastest direct entry into professional accounting without a 4-year degree.',
    },
    {
      _id: 'ca-2',
      title: 'Stage 2: CAF (Certificate in Accounting and Finance)',
      description: 'Clear all 8 CAF papers covering Financial Accounting, Cost & Management Accounting, Taxation, Corporate Law, and Audit.',
      status: 'in_progress',
      estimatedMonths: 18,
      skills: ['Financial Analysis', 'Sindh & Federal Tax Laws', 'Corporate Governance'],
      prerequisites: ['All 5 PRC papers cleared'],
      isDecisionPoint: true,
      tradeoffs: 'Self-study through ICAP study texts vs enrolled tuition at RAETs (CAMS, Tabani, TSA).',
    },
    {
      _id: 'ca-3',
      title: 'Stage 3: 3.5-Year Mandatory Articleship',
      description: 'Induction into Big-4 accounting firms (A.F. Ferguson / PwC, EY Ford Rhodes, KPMG Taseer Hadi, Deloitte Yousuf Adil) or approved training organizations in Karachi.',
      status: 'planned',
      estimatedMonths: 42,
      skills: ['Statutory Audit', 'Internal Controls', 'ERP Systems', 'IFRS Standards'],
      prerequisites: ['All CAF papers cleared and ICAP training contract eligibility'],
      isDecisionPoint: true,
      tradeoffs: 'Big-4 firm (prestige and multinational exit opportunities) vs industry training organization (specialized sector experience).',
    },
    {
      _id: 'ca-4',
      title: 'Stage 4: CFAP & MSA Final Examinations',
      description: 'Study and clear Certified Finance and Accounting Professional (CFAP) and Multi-Subject Assessment (MSA) examinations while working full-time articleship.',
      status: 'planned',
      estimatedMonths: 24,
      skills: ['Advanced Corporate Reporting', 'Strategic Financial Management', 'Forensic Audit'],
      prerequisites: ['Completed specified months of articleship'],
      isDecisionPoint: false,
      tradeoffs: 'Workload management between grueling audit busy seasons and demanding exam cycles.',
    },
    {
      _id: 'ca-5',
      title: 'Stage 5: ACA Certification & CFO Pathway',
      description: 'Receive Associate Chartered Accountant (ACA) designation, join corporate banking, advisory, or multinational finance leadership tracks.',
      status: 'planned',
      estimatedMonths: 12,
      skills: ['Executive Financial Strategy', 'Capital Allocation', 'Tax Advisory'],
      prerequisites: ['All CFAP & MSA examinations passed and 3.5 years articleship verified'],
      isDecisionPoint: false,
      tradeoffs: 'Practice partnership track vs corporate financial management (CFO track).',
    },
  ],

  'ux-designer': [
    {
      _id: 'ux-1',
      title: 'Stage 1: Intermediate / Foundation in Visual Culture',
      description: 'Complete HSC (Arts, Commerce, Science) or A-Levels with strong visual intuition, human psychology curiosity, and digital literacy.',
      status: 'done',
      estimatedMonths: 24,
      skills: ['Visual Hierarchy', 'Typography Basics', 'Psychology Fundamentals'],
      prerequisites: ['Matriculation or O-Levels'],
      isDecisionPoint: false,
      tradeoffs: 'Formal art/design school route vs computer science/engineering route with self-taught UX.',
    },
    {
      _id: 'ux-2',
      title: 'Stage 2: Design School Entry or Focused Bootcamp',
      description: 'Pass the aptitude drawing and interview test at Indus Valley School of Art and Architecture (IVS), Karachi University Visual Studies, or complete an intensive UI/UX bootcamp.',
      status: 'in_progress',
      estimatedMonths: 4,
      skills: ['Color Theory', 'Design Thinking', 'User Interviewing'],
      prerequisites: ['Intermediate clearance and portfolio submission'],
      isDecisionPoint: true,
      tradeoffs: '4-Year B.Des degree (deep theoretical craftsmanship) vs 6-Month bootcamp + intensive portfolio building.',
    },
    {
      _id: 'ux-3',
      title: 'Stage 3: Figma, Interaction Systems & Wireframing',
      description: 'Master industry-standard tooling (Figma, FigJam, auto-layout, design tokens, component variants) and user research methodologies tailored to Pakistani mobile users.',
      status: 'planned',
      estimatedMonths: 12,
      skills: ['Figma Components', 'Information Architecture', 'Usability Testing', 'Prototyping'],
      prerequisites: ['Core visual design principles'],
      isDecisionPoint: false,
      tradeoffs: 'Pure UX research specialization vs Product Designer generalist (UI + UX + Systems).',
    },
    {
      _id: 'ux-4',
      title: 'Stage 4: Case Study Production & Artifact Vault',
      description: 'Produce 3 in-depth, problem-driven product case studies (e.g. redesigning a local fintech, ride-hailing app, or public portal). Upload interactive prototypes into Acadiv Artifact Vault.',
      status: 'planned',
      estimatedMonths: 6,
      skills: ['Design Systems', 'Micro-Interactions', 'Case Study Storytelling'],
      prerequisites: ['Figma proficiency and qualitative research experience'],
      isDecisionPoint: true,
      tradeoffs: 'Visual Dribbble-style UI vs real evidence-based UX case studies solving usability friction.',
    },
    {
      _id: 'ux-5',
      title: 'Stage 5: Product Studio / Tech Company Induction',
      description: 'Join leading Karachi product agencies (10Pearls, VentureDive, Systems Limited), fintech unicorns, or global remote teams as a Product Designer.',
      status: 'planned',
      estimatedMonths: 6,
      skills: ['Stakeholder Alignment', 'Cross-Functional Hand-off', 'User Telemetry'],
      prerequisites: ['Evidence-based portfolio demonstrating real problem-solving'],
      isDecisionPoint: false,
      tradeoffs: 'Agency experience (variety of projects) vs in-house product team (deep feature iteration).',
    },
  ],
}

// Generic generator for other careers
function generateMilestonesForCareer(career) {
  const title = career?.title || 'Professional Career'
  const domain = career?.domain || 'Professional'
  const prereqs = career?.eligibilityPrerequisites || ['Intermediate / FSc / A-Levels']

  return [
    {
      _id: 'gen-1',
      title: 'Stage 1: Secondary Education & Core Prerequisites',
      description: `Complete foundational academic credentials with competitive marks in relevant subjects (${prereqs.slice(0, 2).join(', ')}).`,
      status: 'done',
      estimatedMonths: 24,
      skills: ['Core Subject Knowledge', 'Analytical Thinking', 'Time Management'],
      prerequisites: ['Matriculation / O-Levels (60%+)'],
      isDecisionPoint: false,
      tradeoffs: 'Selecting the optimal intermediate stream to keep university eligibility broad.',
    },
    {
      _id: 'gen-2',
      title: `Stage 2: Karachi Admissions & Standardized Testing`,
      description: `Target entry examinations and aptitude evaluations for accredited Karachi institutions offering recognized degrees in ${domain}.`,
      status: 'in_progress',
      estimatedMonths: 4,
      skills: ['Aptitude Testing', 'Interview Preparation', 'Domain Vocabulary'],
      prerequisites: ['Intermediate Part-1 clearance or equivalent predicted grades'],
      isDecisionPoint: true,
      tradeoffs: 'Public subsidized university merit seats vs private accredited institutions.',
    },
    {
      _id: 'gen-3',
      title: `Stage 3: Undergraduate Degree / Professional Coursework`,
      description: `Complete the 4-year HEC-recognized curriculum or professional training curriculum relevant to ${title}.`,
      status: 'planned',
      estimatedMonths: 48,
      skills: ['Specialized Domain Knowledge', 'Research Methods', 'Technical Execution'],
      prerequisites: ['Confirmed institutional enrollment'],
      isDecisionPoint: false,
      tradeoffs: 'Balancing academic coursework with practical projects and verifiable portfolio artifacts.',
    },
    {
      _id: 'gen-4',
      title: `Stage 4: Verifiable Practical Training & Artifact Vault`,
      description: `Build demonstrable industry artifacts, complete internships, and store verified evidence inside your Acadiv Vault.`,
      status: 'planned',
      estimatedMonths: 12,
      skills: ['Industry Tooling', 'Teamwork', 'Communication', 'Problem Solving'],
      prerequisites: ['Core coursework completion'],
      isDecisionPoint: true,
      tradeoffs: 'Specializing within a sub-field vs maintaining broad generalist capability.',
    },
    {
      _id: 'gen-5',
      title: `Stage 5: Industry Placement & Continuous Upskilling`,
      description: `Secure entry-level employment, entry into professional regulatory bodies (PEC, PMDC, ICAP, Bar Council), and execute ongoing professional development.`,
      status: 'planned',
      estimatedMonths: 6,
      skills: ['Professional Ethics', 'Regulatory Compliance', 'Executive Communication'],
      prerequisites: ['Completed academic degree and verified evidence portfolio'],
      isDecisionPoint: false,
      tradeoffs: 'Local corporate placement vs freelance global remote practice vs post-graduate studies.',
    },
  ]
}

export default function CareerRoadmapPage() {
  const { user, activeCareer, selectActiveCareer } = useAuth()
  const [careersList, setCareersList] = useState([])
  const [selectedCareer, setSelectedCareer] = useState(null)
  const [milestones, setMilestones] = useState([])
  const [selectedNode, setSelectedNode] = useState(null)
  const [activeTab, setActiveTab] = useState('3d') // '3d' | 'timeline'
  const [savedRoadmapId, setSavedRoadmapId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState(null)
  const [activatingCareer, setActivatingCareer] = useState(false)
  const [loading, setLoading] = useState(true)

  // 1. Fetch available careers
  useEffect(() => {
    async function loadCareers() {
      try {
        const res = await api('/careers?limit=100')
        const allCareers = res.data || []
        setCareersList(allCareers)

        // Find initial career: prefer activeCareer from context, otherwise first career
        let initial = null
        if (activeCareer) {
          initial = allCareers.find(
            (c) => (c._id === activeCareer.id || c.slug === activeCareer.slug || c.title === activeCareer.title)
          )
        }
        if (!initial && allCareers.length > 0) {
          initial = allCareers.find((c) => c.slug === 'software-engineer') || allCareers[0]
        }
        if (initial) {
          setSelectedCareer(initial)
        }
      } catch (err) {
        console.error('Failed to load careers:', err)
      } finally {
        setLoading(false)
      }
    }
    loadCareers()
  }, [activeCareer?.id, activeCareer?.slug])

  // 2. When selected career changes, load saved roadmap or build milestones
  useEffect(() => {
    if (!selectedCareer) return

    async function loadRoadmapForCareer() {
      setSaveMessage(null)
      try {
        // Look up if user has a saved roadmap for this career
        const res = await api(`/roadmaps?careerId=${selectedCareer._id || selectedCareer.id}`, { auth: true })
        const savedList = res.data || []
        const existing = savedList.find(
          (r) => r.careerId === selectedCareer._id || r.title?.toLowerCase().includes(selectedCareer.title.toLowerCase())
        )

        if (existing && existing.milestones?.length > 0) {
          setSavedRoadmapId(existing._id)
          setMilestones(existing.milestones)
          setSelectedNode(existing.milestones[0])
          return
        }

        // If no saved roadmap, check if career has specific pathway template
        setSavedRoadmapId(null)
        const template = DEFAULT_PATHWAY_TEMPLATES[selectedCareer.slug]
        if (template) {
          setMilestones(template)
          setSelectedNode(template[0])
        } else {
          const generated = generateMilestonesForCareer(selectedCareer)
          setMilestones(generated)
          setSelectedNode(generated[0])
        }
      } catch (err) {
        // Fallback to template on network error
        const template = DEFAULT_PATHWAY_TEMPLATES[selectedCareer.slug] || generateMilestonesForCareer(selectedCareer)
        setMilestones(template)
        setSelectedNode(template[0])
      }
    }

    loadRoadmapForCareer()
  }, [selectedCareer?._id, selectedCareer?.slug])

  const handleCareerChange = (careerObj) => {
    setSelectedCareer(careerObj)
  }

  const handleUpdateStatus = (id, newStatus) => {
    setMilestones((prev) =>
      prev.map((m) => (m._id === id ? { ...m, status: newStatus } : m))
    )
    if (selectedNode && selectedNode._id === id) {
      setSelectedNode((prev) => ({ ...prev, status: newStatus }))
    }
  }

  const handleSaveRoadmap = async () => {
    if (!selectedCareer) return
    setSaving(true)
    setSaveMessage(null)
    const totalMonths = milestones.reduce((sum, m) => sum + (Number(m.estimatedMonths) || 0), 0)

    try {
      if (savedRoadmapId) {
        await api(`/roadmaps/${savedRoadmapId}`, {
          method: 'PATCH',
          auth: true,
          body: {
            title: `Roadmap for ${selectedCareer.title}`,
            careerId: selectedCareer._id || selectedCareer.id,
            milestones,
            timelineAssumptions: `Total estimated timeline: ${totalMonths} months`,
          },
        })
      } else {
        const res = await api('/roadmaps', {
          method: 'POST',
          auth: true,
          body: {
            title: `Roadmap for ${selectedCareer.title}`,
            careerId: selectedCareer._id || selectedCareer.id,
            milestones,
            timelineAssumptions: `Total estimated timeline: ${totalMonths} months`,
          },
        })
        setSavedRoadmapId(res.data._id)
      }
      setSaveMessage('Roadmap progress successfully synchronized to your MongoDB profile.')
    } catch (err) {
      setSaveMessage(`Error saving roadmap: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleSetAsActiveCareer = async () => {
    if (!selectedCareer) return
    setActivatingCareer(true)
    try {
      await selectActiveCareer({
        _id: selectedCareer._id || selectedCareer.id,
        id: selectedCareer._id || selectedCareer.id,
        slug: selectedCareer.slug,
        title: selectedCareer.title,
        domain: selectedCareer.domain || 'Professional',
        compatibilityScore: 85,
      })
      setSaveMessage(`"${selectedCareer.title}" is now your active career direction across Acadiv.`)
    } catch (err) {
      console.error('Failed to set active career:', err)
    } finally {
      setActivatingCareer(false)
    }
  }

  const completedCount = milestones.filter((m) => m.status === 'done').length
  const inProgressCount = milestones.filter((m) => m.status === 'in_progress').length
  const progressPercent = Math.round((completedCount / Math.max(1, milestones.length)) * 100)

  const isCurrentActive =
    activeCareer &&
    selectedCareer &&
    ((activeCareer.id && activeCareer.id === (selectedCareer._id || selectedCareer.id)) ||
      activeCareer.slug === selectedCareer.slug ||
      activeCareer.title === selectedCareer.title)

  if (loading) {
    return (
      <div style={{ maxWidth: '960px', margin: '40px auto' }}>
        <div className="skeleton" style={{ height: '36px', width: '320px', marginBottom: '20px' }} />
        <div className="skeleton" style={{ height: '420px', width: '100%', borderRadius: 'var(--radius-lg)' }} />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge badge-forest">Interactive Pathway Navigator</span>
            <span className="badge badge-verified">Karachi Academic Verification</span>
            {isCurrentActive && (
              <span className="badge badge-accent">
                Active Career Direction
              </span>
            )}
          </div>
          <h1 style={{ fontSize: '2.4rem', margin: '4px 0 8px' }}>
            {selectedCareer ? selectedCareer.title : 'Career Pathway Roadmap'}
          </h1>
          <p style={{ maxWidth: '680px', fontSize: '0.98rem', color: 'var(--text-muted)' }}>
            Explore verified, milestone-by-milestone pathways through Matric, Intermediate, entry exams, accredited degrees, and real industry placement.
          </p>
        </div>

        {/* View Toggle & Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
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

          {!isCurrentActive && selectedCareer && (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleSetAsActiveCareer}
              disabled={activatingCareer}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <StarIcon size={14} />
              <span>{activatingCareer ? 'Setting...' : 'Set as Active Career'}</span>
            </button>
          )}

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
        <div
          style={{
            padding: '14px 20px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--teal-soft)',
            border: '1px solid var(--forest)',
            color: 'var(--forest)',
            fontSize: '0.92rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CheckIcon size={16} />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* Dynamic Database Career Selector Bar */}
      <div className="filter-bar" style={{ gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--ink)' }}>
          Career Discipline:
        </span>
        {careersList.map((c) => {
          const isSelected = selectedCareer && (selectedCareer._id === c._id || selectedCareer.slug === c.slug)
          const isCurrentAppActive =
            activeCareer && (activeCareer.id === c._id || activeCareer.slug === c.slug)

          return (
            <button
              key={c._id || c.slug}
              type="button"
              className={`btn btn-sm ${isSelected ? 'btn-forest' : 'btn-outline'}`}
              style={{
                fontSize: '0.82rem',
                position: 'relative',
              }}
              onClick={() => handleCareerChange(c)}
            >
              {isCurrentAppActive && <span style={{ color: 'var(--lime)', marginRight: '4px' }}>★</span>}
              {c.title}
            </button>
          )
        })}
      </div>

      {/* Progress Metric Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 22px',
          background: 'var(--surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--ink)' }}>
              Pathway Progress:
            </span>{' '}
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              {completedCount} Completed • {inProgressCount} In Progress • {milestones.length - completedCount - inProgressCount} Planned
            </span>
          </div>
          <span className="badge badge-subtle">
            Est. Total: {milestones.reduce((s, m) => s + (Number(m.estimatedMonths) || 0), 0)} Months
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--forest)' }}>
            {progressPercent}%
          </span>
          <div style={{ width: '180px', height: '10px', background: 'var(--surface-alt)', borderRadius: 'var(--radius-full)', overflow: 'hidden', border: '1px solid var(--border)' }}>
            <div style={{ width: `${progressPercent}%`, height: '100%', background: 'linear-gradient(90deg, var(--teal), var(--lime))', transition: 'width 0.3s ease' }} />
          </div>
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
              key={m._id || idx}
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
              <p style={{ fontSize: '0.92rem', marginBottom: '12px', lineHeight: '1.5', color: 'var(--ink)' }}>
                {m.description}
              </p>
              {m.prerequisites?.length > 0 && (
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  <strong>Prerequisites:</strong> {m.prerequisites.join(', ')}
                </div>
              )}
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
                {selectedNode.estimatedMonths && (
                  <span className="badge badge-subtle">
                    ~{selectedNode.estimatedMonths} Months
                  </span>
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

          <p style={{ fontSize: '1rem', lineHeight: '1.65', marginBottom: '24px', color: 'var(--ink)' }}>
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
