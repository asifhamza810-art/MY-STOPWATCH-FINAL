import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { SkillGapIcon, RoadmapIcon, ArrowRightIcon, CheckIcon } from '../components/icons/AcadivIcons'

const LEVEL_ORDER = { none: 0, exploring: 1, beginner: 2, intermediate: 3, advanced: 4 }
const LEVEL_COLORS = {
  none: 'var(--text-dim)',
  exploring: 'var(--coral)',
  beginner: '#E8A838',
  intermediate: 'var(--teal)',
  advanced: 'var(--forest)',
}
const PRIORITY_STYLES = {
  high: { badge: 'badge-forest', bar: 'var(--coral)' },
  medium: { badge: 'badge-subtle', bar: '#E8A838' },
  low: { badge: 'badge-subtle', bar: 'var(--text-dim)' },
}

export default function SkillGapPage() {
  const { user, activeCareer } = useAuth()
  const [skills, setSkills] = useState([])
  const [studentSkills, setStudentSkills] = useState([])
  const [gaps, setGaps] = useState([])
  const [gapCareer, setGapCareer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)
  const [feedbackMsg, setFeedbackMsg] = useState(null)
  const [feedbackOk, setFeedbackOk] = useState(true)
  const [filterCategory, setFilterCategory] = useState('all')

  const loadData = async (careerId) => {
    setLoading(true)
    try {
      const sRes = await api('/skills')
      setSkills(sRes.data || [])

      if (user) {
        const params = careerId ? `?careerId=${careerId}` : ''
        const gapRes = await api(`/skill-gap${params}`, { auth: true })
        setStudentSkills(gapRes.data?.studentSkills || [])
        setGaps(gapRes.data?.assessment?.gaps || [])
        setGapCareer(gapRes.data?.career || null)
      }
    } catch (err) {
      console.error('Failed to load skill gap data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const careerId = activeCareer?.id || activeCareer?._id
    loadData(careerId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, activeCareer?.id])

  const handleUpdateLevel = async (skillId, declaredLevel) => {
    setUpdatingId(skillId)
    setFeedbackMsg(null)
    try {
      await api('/student-skills', {
        method: 'PUT',
        auth: true,
        body: { skillId, declaredLevel },
      })
      // Refresh with active career context
      const careerId = activeCareer?.id || activeCareer?._id
      const params = careerId ? `?careerId=${careerId}` : ''
      const gapRes = await api(`/skill-gap${params}`, { auth: true })
      setStudentSkills(gapRes.data?.studentSkills || [])
      setGaps(gapRes.data?.assessment?.gaps || [])
      setGapCareer(gapRes.data?.career || null)
      setFeedbackMsg('Competency level saved. Skill gap recalculated.')
      setFeedbackOk(true)
      setTimeout(() => setFeedbackMsg(null), 3000)
    } catch (err) {
      setFeedbackMsg(`Error updating: ${err.message}`)
      setFeedbackOk(false)
    } finally {
      setUpdatingId(null)
    }
  }

  const getDeclaredLevel = (skillId) => {
    const found = studentSkills.find((s) => s.skillId?._id === skillId || s.skillId === skillId)
    return found ? found.declaredLevel : 'none'
  }

  // Filter gaps by category
  const filteredGaps = filterCategory === 'all'
    ? gaps
    : gaps.filter((g) => g.category === filterCategory || (!g.category && filterCategory === 'required'))

  const highPriorityCount = gaps.filter((g) => g.priority === 'high').length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge badge-forest">Competency Diagnostic</span>
            <span className="badge badge-verified">P@SHA / HEC Curriculum Benchmarks</span>
            {gapCareer && (
              <span className="badge badge-accent">
                Career: {gapCareer.title}
              </span>
            )}
          </div>
          <h1>Skill-Gap Analysis</h1>
          <p style={{ maxWidth: '680px', fontSize: '0.98rem' }}>
            {gapCareer
              ? `Comparing your declared competencies against the entry-level requirements for ${gapCareer.title} roles in Pakistan.`
              : 'Compare your declared competencies against baseline industry expectations. Select a career direction to get a targeted gap analysis.'}
          </p>
        </div>

        {!activeCareer && (
          <Link to="/profile/match" className="btn btn-forest btn-sm" style={{ gap: '6px' }}>
            <SkillGapIcon size={15} /> Select Career Direction →
          </Link>
        )}
      </div>

      {/* Feedback message */}
      {feedbackMsg && (
        <div
          style={{
            padding: '12px 18px',
            borderRadius: 'var(--radius-md)',
            background: feedbackOk ? 'var(--teal-soft)' : 'var(--coral-soft)',
            border: `1px solid ${feedbackOk ? 'var(--teal)' : 'var(--coral)'}`,
            color: feedbackOk ? 'var(--forest)' : '#C24B2F',
            fontSize: '0.9rem',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {feedbackOk && <CheckIcon size={16} />}
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Summary Metrics */}
      {gaps.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '14px',
          }}
        >
          <div style={{ padding: '20px', background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--coral)', fontFamily: 'var(--font-display)' }}>
              {highPriorityCount}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>High Priority Gaps</div>
          </div>
          <div style={{ padding: '20px', background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#E8A838', fontFamily: 'var(--font-display)' }}>
              {gaps.length - highPriorityCount}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>Medium / Low Gaps</div>
          </div>
          <div style={{ padding: '20px', background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--forest)', fontFamily: 'var(--font-display)' }}>
              {studentSkills.filter((s) => s.declaredLevel && s.declaredLevel !== 'none').length}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>Declared Competencies</div>
          </div>
          {gapCareer && (
            <div style={{ padding: '20px', background: 'var(--teal-soft)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(52,185,165,0.3)', textAlign: 'center' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--forest)', fontFamily: 'var(--font-display)' }}>
                {gapCareer.domain || 'Professional'}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>Active Career Domain</div>
            </div>
          )}
        </div>
      )}

      {/* Prioritized Gaps */}
      {gaps.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ fontSize: '1.35rem' }}>
              {gapCareer ? `${gapCareer.title} — Required Competency Gaps` : 'Prioritized Growth Areas'}
            </h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['all', 'required', 'useful', 'baseline'].map((cat) => {
                const hasItems = cat === 'all' ? true : gaps.some((g) => (g.category || 'required') === cat)
                if (!hasItems) return null
                return (
                  <button
                    key={cat}
                    type="button"
                    className={`btn btn-sm ${filterCategory === cat ? 'btn-forest' : 'btn-outline'}`}
                    onClick={() => setFilterCategory(cat)}
                    style={{ fontSize: '0.8rem', textTransform: 'capitalize' }}
                  >
                    {cat === 'all' ? `All (${gaps.length})` : cat}
                  </button>
                )
              })}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredGaps.map((gap, idx) => {
              const style = PRIORITY_STYLES[gap.priority] || PRIORITY_STYLES.medium

              return (
                <div
                  key={gap.skillId || gap.skillName || idx}
                  className="card"
                  style={{
                    padding: '24px',
                    border: gap.priority === 'high' ? '1.5px solid rgba(228,123,96,0.3)' : '1px solid var(--border)',
                    background: 'var(--surface)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <h4 style={{ color: 'var(--ink)', fontSize: '1.1rem', marginBottom: '4px' }}>{gap.skillName}</h4>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <span className={`badge ${style.badge}`}>{gap.priority} priority</span>
                        {gap.category && gap.category !== 'baseline' && (
                          <span className="badge badge-subtle" style={{ textTransform: 'capitalize' }}>{gap.category}</span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', fontSize: '0.86rem', flexShrink: 0 }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: LEVEL_COLORS[gap.currentLevel] || 'var(--text-dim)', fontWeight: 700, textTransform: 'capitalize' }}>
                          {gap.currentLevel || 'None'}
                        </div>
                        <div style={{ color: 'var(--text-dim)', fontSize: '0.76rem' }}>Current</div>
                      </div>
                      <div style={{ color: 'var(--text-dim)', display: 'flex', alignItems: 'center' }}>→</div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: LEVEL_COLORS[gap.targetLevel] || 'var(--forest)', fontWeight: 700, textTransform: 'capitalize' }}>
                          {gap.targetLevel || 'Working'}
                        </div>
                        <div style={{ color: 'var(--text-dim)', fontSize: '0.76rem' }}>Target</div>
                      </div>
                    </div>
                  </div>

                  {/* Gap progress bar */}
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '14px' }}>
                    {['none', 'exploring', 'beginner', 'intermediate', 'advanced'].map((lvl) => {
                      const filled = (LEVEL_ORDER[gap.currentLevel] || 0) >= LEVEL_ORDER[lvl]
                      const isTarget = lvl === gap.targetLevel
                      return (
                        <div
                          key={lvl}
                          style={{
                            flex: 1,
                            height: '6px',
                            borderRadius: 'var(--radius-full)',
                            background: filled ? style.bar : 'var(--surface-alt)',
                            border: isTarget ? `2px solid ${style.bar}` : 'none',
                            transition: 'background 0.3s ease',
                          }}
                        />
                      )
                    })}
                  </div>

                  {gap.reason && (
                    <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginBottom: '12px', lineHeight: 1.5 }}>
                      {gap.reason}
                    </p>
                  )}

                  {gap.suggestedActions?.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {gap.suggestedActions.map((action, aIdx) => (
                        <div key={aIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.84rem', color: 'var(--ink)' }}>
                          <span style={{ color: 'var(--teal)', marginTop: '1px', flexShrink: 0 }}>→</span>
                          <span>{action}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* No gaps found */}
      {!loading && gaps.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon" style={{ color: 'var(--teal)', display: 'flex', justifyContent: 'center' }}>
            <CheckIcon size={44} />
          </div>
          <h2 className="empty-title">No Significant Gaps Found</h2>
          <p className="empty-text">
            {gapCareer
              ? `Your declared competencies cover the core requirements for ${gapCareer.title}. Declare additional skills below to refine the analysis.`
              : 'Declare your skills below, then select a career direction from your Match Profile for a targeted gap analysis.'}
          </p>
          {!activeCareer && (
            <Link to="/profile/match" className="btn btn-forest" style={{ marginTop: '16px' }}>
              Select Career Direction →
            </Link>
          )}
        </div>
      )}

      {/* Full Competency Declaration List */}
      <div className="card" style={{ padding: '36px', border: '1.5px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.35rem', marginBottom: '4px' }}>Declare Your Current Competencies</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Be honest about your current level. This directly recalculates your career-specific gap analysis.
            </p>
          </div>
          {gapCareer && (
            <span className="badge badge-verified" style={{ fontSize: '0.78rem' }}>
              Filtered for: {gapCareer.title}
            </span>
          )}
        </div>

        {loading ? (
          <div className="skeleton" style={{ height: '140px', width: '100%' }} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
            {skills.map((skill) => {
              const currentLevel = getDeclaredLevel(skill._id)
              const isUpdating = updatingId === skill._id
              const inGapList = gaps.some((g) => g.skillName?.toLowerCase() === skill.name?.toLowerCase())

              return (
                <div
                  key={skill._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                    borderRadius: 'var(--radius-md)',
                    background: inGapList ? 'var(--canvas)' : 'var(--surface-alt)',
                    border: inGapList ? '1.5px solid var(--border-strong)' : '1px solid var(--border)',
                    flexWrap: 'wrap',
                    gap: '12px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '1rem', color: 'var(--ink)' }}>{skill.name}</strong>
                    {inGapList && (
                      <span className="badge badge-coral" style={{ fontSize: '0.68rem', marginLeft: '8px' }}>Gap</span>
                    )}
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'capitalize', marginTop: '2px' }}>
                      {skill.domain || 'Technical'} • Current: <strong style={{ color: LEVEL_COLORS[currentLevel] }}>{currentLevel}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {['none', 'exploring', 'beginner', 'intermediate', 'advanced'].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        disabled={isUpdating}
                        className={`btn btn-sm ${currentLevel === lvl ? 'btn-forest' : 'btn-outline'}`}
                        style={{ textTransform: 'capitalize', padding: '5px 11px', fontSize: '0.8rem' }}
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

      {/* Quick links to related tools */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '14px',
        }}
      >
        <Link
          to="/skills"
          className="card"
          style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', border: '1px solid var(--border)' }}
        >
          <span style={{ color: 'var(--teal)' }}><SkillGapIcon size={22} /></span>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--ink)', fontSize: '0.95rem' }}>Find Karachi Bootcamps</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Close skill gaps with verified providers</div>
          </div>
        </Link>
        <Link
          to="/roadmap"
          className="card"
          style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', border: '1px solid var(--border)' }}
        >
          <span style={{ color: 'var(--forest)' }}><RoadmapIcon size={22} /></span>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--ink)', fontSize: '0.95rem' }}>View Career Roadmap</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>See milestone-based pathway to your career</div>
          </div>
        </Link>
      </div>
    </div>
  )
}
