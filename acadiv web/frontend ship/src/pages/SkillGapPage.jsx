import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'

export default function SkillGapPage() {
  const { user } = useAuth()
  const [skills, setSkills] = useState([])
  const [studentSkills, setStudentSkills] = useState([])
  const [gaps, setGaps] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)
  const [feedbackMsg, setFeedbackMsg] = useState(null)

  useEffect(() => {
    async function loadData() {
      try {
        const sRes = await api('/skills')
        setSkills(sRes.data || [])

        if (user) {
          const gapRes = await api('/skill-gap', { auth: true })
          setStudentSkills(gapRes.data?.studentSkills || [])
          setGaps(gapRes.data?.assessment?.gaps || [])
        }
      } catch (err) {
        console.error('Failed to load skill gap data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [user])

  const handleUpdateLevel = async (skillId, declaredLevel) => {
    setUpdatingId(skillId)
    setFeedbackMsg(null)
    try {
      await api('/student-skills', {
        method: 'PUT',
        auth: true,
        body: { skillId, declaredLevel },
      })
      // Refresh gap data
      const gapRes = await api('/skill-gap', { auth: true })
      setStudentSkills(gapRes.data?.studentSkills || [])
      setGaps(gapRes.data?.assessment?.gaps || [])
      setFeedbackMsg('Competency level updated in database.')
    } catch (err) {
      console.error('Failed to update student skill:', err)
      setFeedbackMsg(`Error updating: ${err.message}`)
    } finally {
      setUpdatingId(null)
    }
  }

  const getDeclaredLevel = (skillId) => {
    const found = studentSkills.find((s) => s.skillId?._id === skillId || s.skillId === skillId)
    return found ? found.declaredLevel : 'none'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span className="badge badge-forest">Competency Diagnostic</span>
          <span className="badge badge-verified">P@SHA / HEC Curriculum Benchmarks</span>
        </div>
        <h1>Skill-Gap Analysis</h1>
        <p style={{ maxWidth: '680px', fontSize: '0.98rem' }}>
          Compare your declared competency levels against entry-level industry expectations for Pakistani computing and engineering roles.
        </p>
      </div>

      {feedbackMsg && (
        <div style={{ padding: '12px 18px', borderRadius: 'var(--radius-md)', background: 'var(--teal-soft)', border: '1px solid var(--teal)', color: 'var(--forest)', fontSize: '0.92rem' }}>
          {feedbackMsg}
        </div>
      )}

      {/* Prioritized Gaps */}
      {gaps.length > 0 && (
        <div>
          <h3 style={{ fontSize: '1.35rem', marginBottom: '16px' }}>Prioritized Growth Areas</h3>
          <div className="grid-cols-2" style={{ gap: '18px' }}>
            {gaps.slice(0, 6).map((gap, idx) => (
              <div
                key={idx}
                className="card"
                style={{
                  padding: '24px',
                  border: '1.5px solid var(--border)',
                  background: 'var(--surface)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <h4 style={{ color: 'var(--ink)', fontSize: '1.15rem' }}>{gap.skillName}</h4>
                  <span className={`badge ${gap.priority === 'high' ? 'badge-forest' : 'badge-subtle'}`}>
                    {gap.priority} priority
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '20px', fontSize: '0.86rem', color: 'var(--text-muted)' }}>
                  <span>Current: <strong>{gap.currentLevel || 'none'}</strong></span>
                  <span>Target: <strong>{gap.targetLevel || 'intermediate'}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full Competency Evaluation List */}
      <div className="card" style={{ padding: '36px', border: '1.5px solid var(--border)' }}>
        <h3 style={{ fontSize: '1.35rem', marginBottom: '8px' }}>Declare Your Current Competencies</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
          Be honest about your current level. This information directly adjusts your personalized roadmap recommendations.
        </p>

        {loading ? (
          <div className="skeleton" style={{ height: '140px', width: '100%' }} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {skills.map((skill) => {
              const currentLevel = getDeclaredLevel(skill._id)
              const isUpdating = updatingId === skill._id

              return (
                <div
                  key={skill._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--canvas)',
                    border: '1px solid var(--border)',
                    flexWrap: 'wrap',
                    gap: '14px',
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '1.05rem', color: 'var(--ink)' }}>{skill.name}</strong>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)', textTransform: 'capitalize' }}>
                      Domain: {skill.domain || 'Technical'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['none', 'beginner', 'intermediate', 'advanced'].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        disabled={isUpdating}
                        className={`btn btn-sm ${currentLevel === lvl ? 'btn-forest' : 'btn-outline'}`}
                        style={{ textTransform: 'capitalize', padding: '6px 12px', fontSize: '0.82rem' }}
                        onClick={() => handleUpdateLevel(skill._id, lvl)}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
