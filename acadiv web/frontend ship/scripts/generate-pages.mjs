import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const w = (rel, content) => {
  const p = path.join(root, rel)
  fs.mkdirSync(path.dirname(p), { recursive: true })
  fs.writeFileSync(p, content)
  console.log('wrote', rel)
}

w(
  'src/pages/LandingPage.jsx',
  `import { Link } from 'react-router-dom'
import FluidBackground from '../components/fluid/FluidBackground'
import MotionSection from '../components/fluid/MotionSection'
import Button from '../components/ui/Button'
import Seo from '../components/layout/Seo'

export default function LandingPage() {
  return (
    <div className="landing">
      <Seo
        title="Home"
        description="Acadiv helps Pakistani students explore careers, compare education routes, and plan next steps with source-backed Karachi information."
      />
      <section className="hero">
        <FluidBackground />
        <div className="hero-content">
          <p className="brand-mark">Acadiv</p>
          <h1>Find your next step — without pretending we know your future.</h1>
          <p className="hero-lede">
            Explore realistic pathways for Matric, Intermediate, O/A Level, and university students in Karachi and across Pakistan. Evidence first. Clear trade-offs. Actionable plans.
          </p>
          <div className="hero-cta">
            <Button as={Link} to="/onboarding">Begin your journey</Button>
            <Button as={Link} to="/institutions" variant="ghost">Browse institutions</Button>
          </div>
        </div>
      </section>

      <MotionSection className="section">
        <h2>Explore → Understand → Compare → Plan</h2>
        <p className="lede">Acadiv connects discovery, assessment, roadmaps, skills, campus opportunities, and evidence — without inventing rankings or guaranteed outcomes.</p>
        <div className="feature-row">
          <div><h3>Guided assessment</h3><p>RIASEC questions with explainable reason traces — exploratory, not diagnostic.</p></div>
          <div><h3>Karachi directory</h3><p>Institutions and training providers with source links and last-checked dates.</p></div>
          <div><h3>Living roadmap</h3><p>Editable milestones, budgets you define, and alternative routes you can inspect.</p></div>
        </div>
      </MotionSection>

      <MotionSection className="section section-split">
        <div>
          <h2>Built for Pakistani education realities</h2>
          <p>Matric, FSc, ICS, FA, DAE, O/A Levels, entrance exams, local budgets, and shifting admission cycles — designed into the product, not bolted on.</p>
        </div>
        <div className="trust-panel">
          <h3>Trust principles</h3>
          <ul>
            <li>No fabricated user counts or success rates</li>
            <li>Missing fees stay unknown — never zero</li>
            <li>Featured placements are editorial, not secret partnerships</li>
            <li>Community posts wait for moderation</li>
          </ul>
        </div>
      </MotionSection>
    </div>
  )
}
`
)

w(
  'src/pages/OnboardingPage.jsx',
  `import { Link } from 'react-router-dom'
import Seo from '../components/layout/Seo'
import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

export default function OnboardingPage() {
  return (
    <div className="page">
      <Seo title="Onboarding" description="Choose a fast track or guided RIASEC assessment." />
      <PageHeader eyebrow="Dual path" title="How do you want to begin?" subtitle="You can change direction later. No long forms before value." />
      <div className="two-col">
        <Card>
          <h2>Fast Track</h2>
          <p>Pick your education stage and a field of interest, then jump into careers and roadmap planning.</p>
          <Button as={Link} to="/roadmap">Continue to roadmap</Button>
        </Card>
        <Card>
          <h2>Guided Assessment</h2>
          <p>Answer adaptive RIASEC questions and receive an explainable match profile.</p>
          <Button as={Link} to="/assessment">Start assessment</Button>
        </Card>
      </div>
    </div>
  )
}
`
)

w(
  'src/pages/AssessmentPage.jsx',
  `import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Seo from '../components/layout/Seo'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'

export default function AssessmentPage() {
  const { user } = useAuth()
  const nav = useNavigate()
  const [sessionId, setSessionId] = useState(null)
  const [question, setQuestion] = useState(null)
  const [progress, setProgress] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const start = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api('/assessment/start', { method: 'POST', auth: true })
      setSessionId(res.data.sessionId)
      setQuestion(res.data.nextQuestion)
      setProgress({ answered: res.data.answered || 0, targetMin: 15, targetMax: 20 })
    } catch (e) {
      setError(e.message || 'Could not start assessment')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) start()
  }, [user])

  const answer = async (optionKey) => {
    setLoading(true)
    setError('')
    try {
      const res = await api('/assessment/answer', {
        method: 'POST',
        auth: true,
        body: { sessionId, questionId: question.id, optionKey },
      })
      setProgress(res.data.progress)
      if (res.data.result) {
        nav('/profile/match')
        return
      }
      setQuestion(res.data.nextQuestion)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="page">
        <Seo title="Assessment" />
        <PageHeader title="Sign in to continue" subtitle="Assessment progress is saved to your account." />
        <Button as={Link} to="/login">Sign in</Button>
      </div>
    )
  }

  return (
    <div className="page narrow">
      <Seo title="Assessment" description="Adaptive RIASEC assessment for Acadiv." />
      <PageHeader
        eyebrow="RIASEC · exploratory"
        title="Guided assessment"
        subtitle="Not a diagnosis. Your answers produce an explainable Holland-style profile."
      />
      {progress ? (
        <p className="muted">Answered {progress.answered} · target {progress.targetMin}–{progress.targetMax}</p>
      ) : null}
      {error ? <p className="error-text">{error}</p> : null}
      {question ? (
        <div className="question-card">
          {question.scenarioContext ? <p className="eyebrow">{question.scenarioContext}</p> : null}
          <h2>{question.text}</h2>
          <div className="option-stack">
            {question.options.map((o) => (
              <button key={o.key} type="button" className="option" disabled={loading} onClick={() => answer(o.key)}>
                {o.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <Button type="button" onClick={start} disabled={loading}>{loading ? 'Loading…' : 'Start / resume'}</Button>
      )}
    </div>
  )
}
`
)

w(
  'src/pages/MatchPage.jsx',
  `import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Seo from '../components/layout/Seo'
import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'

const DIMS = ['R', 'I', 'A', 'S', 'E', 'C']

export default function MatchPage() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return
    api('/profile/match', { auth: true })
      .then((res) => setData(res.data))
      .catch((e) => setError(e.message))
  }, [user])

  if (!user) {
    return (
      <div className="page">
        <Seo title="Match profile" />
        <EmptyState title="Sign in required" action={<Button as={Link} to="/login">Sign in</Button>} />
      </div>
    )
  }

  const result = data?.result
  return (
    <div className="page">
      <Seo title="Match profile" />
      <PageHeader eyebrow="Diagnostic profile" title="Your exploratory match" subtitle={data?.disclaimer} />
      {error ? <p className="error-text">{error}</p> : null}
      {!result ? (
        <EmptyState title="No completed assessment yet" body="Finish the guided assessment to generate a Holland-style profile." action={<Button as={Link} to="/assessment">Take assessment</Button>} />
      ) : (
        <>
          <div className="holland-hero">
            <p className="eyebrow">Three-letter code</p>
            <p className="holland-code">{result.hollandCode}</p>
          </div>
          <div className="dim-bars">
            {DIMS.map((d) => (
              <div key={d} className="dim-bar">
                <span>{d}</span>
                <div className="bar-track"><div className="bar-fill" style={{ width: \`\${result.normalizedScores?.[d] || 0}%\` }} /></div>
                <span>{result.normalizedScores?.[d] || 0}</span>
              </div>
            ))}
          </div>
          <h2>Why this appeared</h2>
          <ul className="trace-list">{(result.reasonTrace || []).map((t) => <li key={t}>{t}</li>)}</ul>
          <h2>Plausible directions</h2>
          <div className="card-grid">
            {(result.recommendedFields || []).map((f) => (
              <Card key={f.title}><h3>{f.title}</h3><p>{f.why}</p><p className="muted">{f.uncertainty}</p></Card>
            ))}
          </div>
          <Button as={Link} to="/roadmap">Build a roadmap</Button>
        </>
      )}
    </div>
  )
}
`
)

w(
  'src/pages/RoadmapPage.jsx',
  `import { useEffect, useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import Seo from '../components/layout/Seo'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

const DEFAULT_NODES = [
  { id: 'n1', title: 'Current stage', description: 'Where you are now', status: 'in_progress', estimatedMonths: 0, position: [-2, 0, 0] },
  { id: 'n2', title: 'Skill foundation', description: 'Core skills + evidence', status: 'planned', estimatedMonths: 6, estimatedBudgetPkr: null, budgetAssumption: 'Set your own budget', position: [0, 0.4, 0] },
  { id: 'n3', title: 'Programme / pathway', description: 'Institution or training route', status: 'planned', estimatedMonths: 12, position: [2, 0, 0] },
  { id: 'n4', title: 'Career entry', description: 'First role / internship target', status: 'planned', estimatedMonths: 6, position: [3.5, -0.3, 0] },
]

function NodeMesh({ node, selected, onSelect }) {
  const color = selected ? '#C59B27' : node.status === 'done' ? '#0284C7' : '#1C2541'
  return (
    <group position={node.position} onClick={(e) => { e.stopPropagation(); onSelect(node) }}>
      <mesh>
        <sphereGeometry args={[0.28, 24, 24]} />
        <meshStandardMaterial color={color} emissive={selected ? '#C59B27' : '#0077B6'} emissiveIntensity={0.25} />
      </mesh>
      <Text position={[0, 0.45, 0]} fontSize={0.14} color="#F4F6F9" anchorX="center">{node.title}</Text>
    </group>
  )
}

export default function RoadmapPage() {
  const { user } = useAuth()
  const [nodes, setNodes] = useState(DEFAULT_NODES)
  const [selected, setSelected] = useState(DEFAULT_NODES[0])
  const [message, setMessage] = useState('')
  const months = useMemo(() => nodes.reduce((s, n) => s + (Number(n.estimatedMonths) || 0), 0), [nodes])
  const budget = useMemo(() => {
    const vals = nodes.map((n) => n.estimatedBudgetPkr).filter((v) => typeof v === 'number')
    if (!vals.length) return null
    return vals.reduce((a, b) => a + b, 0)
  }, [nodes])

  useEffect(() => {
    if (!user) return
    api('/roadmaps', { auth: true }).then((res) => {
      const first = res.data?.[0]
      if (first?.milestones?.length) {
        setNodes(first.milestones)
        setSelected(first.milestones[0])
      }
    }).catch(() => {})
  }, [user])

  const save = async () => {
    if (!user) return
    try {
      await api('/roadmaps', {
        method: 'POST',
        auth: true,
        body: {
          title: 'My pathway',
          milestones: nodes,
          connections: [
            { from: 'n1', to: 'n2' },
            { from: 'n2', to: 'n3' },
            { from: 'n3', to: 'n4' },
          ],
          timelineAssumptions: 'Estimates are student-editable and not guarantees.',
          budgetAssumptions: 'Only amounts you enter are summed. Missing values stay unknown.',
        },
      })
      setMessage('Roadmap saved to your account.')
    } catch (e) {
      setMessage(e.message)
    }
  }

  return (
    <div className="page">
      <Seo title="Roadmap" description="Interactive career roadmap canvas." />
      <PageHeader eyebrow="Career canvas" title="Interactive roadmap" subtitle="Drag the view, select nodes, edit assumptions. Mobile users get a readable list below." />
      <div className="roadmap-stats">
        <span>~{months} months (sum of node estimates)</span>
        <span>{budget == null ? 'Budget: not set' : \`Budget sum: PKR \${budget.toLocaleString()}\`}</span>
      </div>
      <div className="roadmap-stage" role="img" aria-label="3D roadmap canvas">
        <Canvas camera={{ position: [0, 1.2, 6], fov: 45 }} dpr={[1, 1.5]}>
          <color attach="background" args={['#0B132B']} />
          <ambientLight intensity={0.7} />
          <directionalLight position={[4, 6, 2]} intensity={1.1} />
          {nodes.map((n) => (
            <NodeMesh key={n.id} node={n} selected={selected?.id === n.id} onSelect={setSelected} />
          ))}
          <OrbitControls enablePan makeDefault />
        </Canvas>
      </div>
      <div className="roadmap-detail">
        {selected ? (
          <>
            <h2>{selected.title}</h2>
            <p>{selected.description}</p>
            <label>
              Status
              <select
                value={selected.status}
                onChange={(e) => {
                  const next = nodes.map((n) => (n.id === selected.id ? { ...n, status: e.target.value } : n))
                  setNodes(next)
                  setSelected(next.find((n) => n.id === selected.id))
                }}
              >
                <option value="planned">Planned</option>
                <option value="in_progress">In progress</option>
                <option value="done">Done</option>
                <option value="skipped">Skipped</option>
              </select>
            </label>
          </>
        ) : null}
        {user ? <Button type="button" onClick={save}>Save roadmap</Button> : <Button as={Link} to="/login">Sign in to save</Button>}
        {message ? <p className="muted">{message}</p> : null}
      </div>
      <ol className="roadmap-list">
        {nodes.map((n) => (
          <li key={n.id}><strong>{n.title}</strong> — {n.description} ({n.status}, ~{n.estimatedMonths || 0} mo)</li>
        ))}
      </ol>
    </div>
  )
}
`
)

console.log('core pages written')
