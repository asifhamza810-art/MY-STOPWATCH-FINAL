import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { WarningIcon, TrophyIcon, PinIcon, ExploreIcon, ArrowRightIcon } from '../components/icons/AcadivIcons'

export default function AssessmentPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [sessionId, setSessionId] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [progress, setProgress] = useState(0)
  const [answeredCount, setAnsweredCount] = useState(0)
  const [targetMin, setTargetMin] = useState(15)
  const [targetMax, setTargetMax] = useState(20)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const initAssessment = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api('/assessment/start', { method: 'POST', auth: true })
      setSessionId(res.data.sessionId)
      setCurrentQuestion(res.data.nextQuestion)
      const min = res.data.targetMin || 15
      const max = res.data.targetMax || 20
      setTargetMin(min)
      setTargetMax(max)
      const answered = res.data.answered || 0
      setAnsweredCount(answered)
      const pct = res.data.percent ?? Math.min(100, Math.round((answered / max) * 100))
      setProgress(pct)
    } catch (err) {
      console.error('Failed to initialize assessment:', err)
      setError(err.message || 'Unable to connect to diagnostic engine. Please retry.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    initAssessment()
  }, [])

  const handleSelectOption = async (optionKey) => {
    if (!currentQuestion || !sessionId) return
    setSubmitting(true)
    setError(null)

    try {
      const res = await api('/assessment/answer', {
        method: 'POST',
        auth: true,
        body: {
          sessionId,
          questionId: currentQuestion.id,
          optionKey,
        },
      })

      if (res.data.status === 'completed' || res.data.result) {
        navigate('/profile/match')
        return
      }

      setCurrentQuestion(res.data.nextQuestion)
      const prog = res.data.progress || {}
      const max = prog.targetMax || targetMax || 20
      const min = prog.targetMin || targetMin || 15
      setTargetMax(max)
      setTargetMin(min)
      const answered = prog.answered ?? (answeredCount + 1)
      setAnsweredCount(answered)
      const pct = prog.percent ?? Math.min(100, Math.round((answered / max) * 100))
      setProgress(pct)
    } catch (err) {
      setError(err.message || 'Failed to submit response. Please retry.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div style={{ maxWidth: '760px', margin: '60px auto', textAlign: 'center' }}>
        <div className="skeleton" style={{ height: '24px', width: '220px', margin: '0 auto 16px' }} />
        <div className="skeleton" style={{ height: '48px', width: '85%', margin: '0 auto 24px' }} />
        <div className="skeleton" style={{ height: '200px', width: '100%', borderRadius: 'var(--radius-lg)' }} />
      </div>
    )
  }

  if (error && !currentQuestion) {
    return (
      <div style={{ maxWidth: '640px', margin: '60px auto', textAlign: 'center' }}>
        <div className="card" style={{ padding: '40px' }}>
          <div style={{ color: 'var(--coral)', marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
            <WarningIcon size={44} />
          </div>
          <h2 style={{ marginBottom: '12px' }}>Assessment Connection Issue</h2>
          <p style={{ marginBottom: '24px' }}>{error}</p>
          <button type="button" className="btn btn-primary" onClick={initAssessment}>
            Retry Assessment Session ↻
          </button>
        </div>
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div style={{ maxWidth: '680px', margin: '60px auto', textAlign: 'center' }}>
        <div className="card" style={{ padding: '44px 32px' }}>
          <div style={{ color: 'var(--forest)', marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
            <TrophyIcon size={48} />
          </div>
          <span className="badge badge-verified" style={{ marginBottom: '12px' }}>
            Diagnostic Assessment Complete
          </span>
          <h2 style={{ marginBottom: '12px' }}>Your Holland Code is Ready</h2>
          <p style={{ maxWidth: '520px', margin: '0 auto 28px' }}>
            Your RIASEC answers have been scored against the versioned scoring engine (`riasec-pk-v1`).
            View your normalized dimensions, career matches, and 3D roadmap.
          </p>
          <button
            type="button"
            className="btn btn-forest btn-lg"
            onClick={() => navigate('/profile/match')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <span>View Diagnostic Match Profile</span>
            <ArrowRightIcon size={16} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header & Holland Engine Progress */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-verified">RIASEC Engine: riasec-pk-v1</span>
            <span className="badge badge-subtle">Karachi Contextual Scenarios</span>
          </div>
          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--forest)' }}>
            Question {answeredCount + 1} of {targetMin}–{targetMax}
          </span>
        </div>

        {/* Progress Bar with Warm Editorial gradient */}
        <div
          style={{
            width: '100%',
            height: '10px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--surface-alt)',
            border: '1px solid var(--border)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${Math.max(5, progress)}%`,
              height: '100%',
              background: 'linear-gradient(90deg, var(--teal) 0%, var(--lime) 100%)',
              transition: 'width 0.35s ease',
            }}
          />
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: '12px 18px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--coral-soft)',
            border: '1px solid var(--coral)',
            color: '#C24B2F',
            fontSize: '0.9rem',
            fontWeight: 500,
          }}
        >
          {error}
        </div>
      )}

      {/* Main Question Card */}
      <div
        className="card"
        style={{
          padding: '40px 36px',
          background: 'var(--surface)',
          border: '1.5px solid var(--border)',
        }}
      >
        {currentQuestion.scenarioContext && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--teal-soft)',
              color: 'var(--forest)',
              fontSize: '0.78rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: '18px',
            }}
          >
            <PinIcon size={13} />
            <span>Scenario: {currentQuestion.scenarioContext}</span>
          </div>
        )}

        <h2 style={{ fontSize: '1.55rem', lineHeight: '1.4', marginBottom: '32px', color: 'var(--ink)' }}>
          {currentQuestion.text}
        </h2>

        {/* Question Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {currentQuestion.options?.map((opt) => (
            <button
              key={opt.key}
              type="button"
              disabled={submitting}
              onClick={() => handleSelectOption(opt.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '18px',
                padding: '18px 22px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--canvas)',
                border: '1.5px solid var(--border)',
                color: 'var(--ink)',
                fontSize: '1rem',
                textAlign: 'left',
                cursor: submitting ? 'wait' : 'pointer',
                transition: 'all 0.18s ease',
              }}
              onMouseEnter={(e) => {
                if (!submitting) {
                  e.currentTarget.style.borderColor = 'var(--teal)'
                  e.currentTarget.style.background = 'var(--surface-alt)'
                  e.currentTarget.style.transform = 'translateX(4px)'
                }
              }}
              onMouseLeave={(e) => {
                if (!submitting) {
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.background = 'var(--canvas)'
                  e.currentTarget.style.transform = 'translateX(0)'
                }
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'var(--teal-soft)',
                  border: '1.5px solid var(--teal)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  color: 'var(--forest)',
                  flexShrink: 0,
                }}
              >
                {opt.key.toUpperCase()}
              </div>
              <div style={{ flex: 1, lineHeight: '1.45', fontWeight: 500 }}>{opt.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Disclaimers & Provenance */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '14px 20px',
          background: 'var(--surface-alt)',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.84rem',
          color: 'var(--text-muted)',
          border: '1px solid var(--border)',
        }}
      >
        <span style={{ color: 'var(--teal)' }}><ExploreIcon size={18} /></span>
        <span>
          Acadiv RIASEC questions evaluate personal inclinations through realistic Karachi academic scenarios.
          Scoring uses normalized Holland occupational scales to suggest pathways, not to restrict student choice.
        </span>
      </div>
    </div>
  )
}
