import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import {
  MatchIcon,
  SaveIcon,
  AssessmentIcon,
  RoadmapIcon,
  SkillGapIcon,
  InstitutionsIcon,
  CheckIcon,
  ArrowRightIcon,
  StarIcon,
  ExploreIcon,
} from '../components/icons/AcadivIcons'

export default function DiagnosticMatchPage() {
  const { user, activeCareer, selectActiveCareer } = useAuth()
  const navigate = useNavigate()
  const [matchData, setMatchData] = useState(null)
  const [catalogCareers, setCatalogCareers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectingId, setSelectingId] = useState(null)
  const [selectSuccessMsg, setSelectSuccessMsg] = useState(null)
  const [selectedForComparison, setSelectedForComparison] = useState(null)
  const [showCatalogModal, setShowCatalogModal] = useState(false)

  // Working-style and environmental preferences
  const [workStyle, setWorkStyle] = useState({
    environment: 'desk', // 'desk' | 'field' | 'hybrid'
    collaboration: 'collaborative', // 'collaborative' | 'independent'
    pace: 'structured', // 'structured' | 'rapid'
  })
  const [workStyleSaved, setWorkStyleSaved] = useState(false)

  // Qualitative reflection
  const [ikigaiNotes, setIkigaiNotes] = useState({ love: '', goodAt: '', worldNeeds: '', paidFor: '' })
  const [ikigaiMsg, setIkigaiMsg] = useState(null)
  const [savingNotes, setSavingNotes] = useState(false)

  useEffect(() => {
    async function loadMatchAndCareers() {
      if (!user) {
        setLoading(false)
        return
      }
      try {
        const [matchRes, careersRes] = await Promise.all([
          api('/profile/match', { auth: true }),
          api('/careers?limit=100'),
        ])
        const result = matchRes.data?.result || null
        setMatchData(result)
        const careers = careersRes.data || []
        setCatalogCareers(careers)

        // Default comparison career to active career or first recommendation
        if (result?.recommendedFields?.length) {
          const recs = result.recommendedFields
          const currentActive = recs.find((c) => (c.careerId || c.slug) === (activeCareer?.id || activeCareer?.slug))
          setSelectedForComparison(currentActive || recs[0])
        }
      } catch (err) {
        console.error('Failed to load profile match:', err)
      } finally {
        setLoading(false)
      }
    }
    loadMatchAndCareers()
  }, [user, activeCareer?.id, activeCareer?.slug])

  // Handle setting a career as active career direction
  const handleSelectActiveCareer = async (career) => {
    setSelectingId(career.careerId || career._id || career.id || career.slug)
    setSelectSuccessMsg(null)
    try {
      await selectActiveCareer({
        _id: career.careerId || career._id || career.id,
        id: career.careerId || career._id || career.id,
        slug: career.slug,
        title: career.title,
        domain: career.domain || 'Professional',
        compatibilityScore: career.compatibilityScore || 85,
      })
      setSelectedForComparison(career)
      setSelectSuccessMsg(`"${career.title}" is now your active career direction across Acadiv.`)
      setTimeout(() => setSelectSuccessMsg(null), 4000)
    } catch (err) {
      console.error('Error selecting active career:', err)
    } finally {
      setSelectingId(null)
    }
  }

  const handleSaveWorkStyle = async () => {
    try {
      await api('/preferences', {
        method: 'PATCH',
        auth: true,
        body: { workStylePreferences: workStyle },
      })
      setWorkStyleSaved(true)
      setTimeout(() => setWorkStyleSaved(false), 3000)
    } catch (err) {
      console.warn('Could not save work style to server:', err)
    }
  }

  const handleSaveReflection = async () => {
    setSavingNotes(true)
    setIkigaiMsg(null)
    try {
      const interests = [ikigaiNotes.love, ikigaiNotes.worldNeeds].filter(Boolean)
      if (interests.length > 0) {
        await api('/profile', {
          method: 'PATCH',
          auth: true,
          body: {
            careerInterests: interests,
            academicPreferences: [ikigaiNotes.goodAt, ikigaiNotes.paidFor].filter(Boolean),
          },
        })
      }
      localStorage.setItem(`acadiv_ikigai_${user?._id}`, JSON.stringify(ikigaiNotes))
      setIkigaiMsg('Reflection saved to profile and browser cache.')
    } catch (err) {
      setIkigaiMsg(`Saved locally. (${err.message})`)
      localStorage.setItem(`acadiv_ikigai_${user?._id}`, JSON.stringify(ikigaiNotes))
    } finally {
      setSavingNotes(false)
    }
  }

  // Load cached reflection notes
  useEffect(() => {
    if (user?._id) {
      try {
        const cached = localStorage.getItem(`acadiv_ikigai_${user._id}`)
        if (cached) setIkigaiNotes(JSON.parse(cached))
      } catch {
        /* ignore */
      }
    }
  }, [user])

  if (loading) {
    return (
      <div style={{ maxWidth: '980px', margin: '40px auto' }}>
        <div className="skeleton" style={{ height: '36px', width: '320px', marginBottom: '24px' }} />
        <div className="grid-cols-2" style={{ gap: '20px' }}>
          <div className="skeleton" style={{ height: '240px' }} />
          <div className="skeleton" style={{ height: '240px' }} />
        </div>
      </div>
    )
  }

  if (!matchData) {
    return (
      <div style={{ maxWidth: '680px', margin: '60px auto', textAlign: 'center' }}>
        <div className="empty-state">
          <div className="empty-icon" style={{ color: 'var(--teal)', display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
            <AssessmentIcon size={44} />
          </div>
          <h2 className="empty-title">No Completed Assessment Found</h2>
          <p className="empty-text">
            Complete our adaptive Holland assessment to calculate your verified RIASEC code and explainable career match recommendations.
          </p>
          <Link to="/assessment" className="btn btn-forest">
            Begin RIASEC Assessment →
          </Link>
        </div>
      </div>
    )
  }

  const dimensions = [
    { key: 'R', label: 'Realistic', color: '#174B43', desc: 'Practical, physical systems, engineering tools' },
    { key: 'I', label: 'Investigative', color: '#34B9A5', desc: 'Analytical, scientific research, algorithmic problem solving' },
    { key: 'A', label: 'Artistic', color: '#7568D8', desc: 'Creative, UX/UI, digital design, expressive systems' },
    { key: 'S', label: 'Social', color: '#1F8A70', desc: 'Mentorship, healthcare, community development, teaching' },
    { key: 'E', label: 'Enterprising', color: '#E47B60', desc: 'Leadership, tech startups, business growth, persuasion' },
    { key: 'C', label: 'Conventional', color: '#5C7184', desc: 'Data structures, organization, financial audits, systems' },
  ]

  const scores = matchData.normalizedScores || {}
  const primaryRecommendations = matchData.recommendedFields?.length
    ? matchData.recommendedFields.slice(0, 3)
    : (matchData.recommendedCareers || []).slice(0, 3)
  const alternativeRecommendations = matchData.alternativeFields || []

  // Active career ID or slug
  const currentActiveId = activeCareer?.id || activeCareer?._id || activeCareer?.slug

  return (
    <div style={{ maxWidth: '1040px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '36px' }}>
      {/* Success alert on career activation */}
      {selectSuccessMsg && (
        <div
          style={{
            padding: '14px 20px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--teal-soft)',
            border: '1.5px solid var(--forest)',
            color: 'var(--forest)',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <CheckIcon size={18} />
          <span>{selectSuccessMsg}</span>
        </div>
      )}

      {/* Top Banner with Holland Code & Active Career Indicator */}
      <div
        className="card"
        style={{
          padding: '40px 36px',
          background: 'var(--surface)',
          border: '1.5px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '24px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge badge-verified">Diagnostic Match Profile</span>
            <span className="badge badge-forest">Engine: riasec-pk-v1</span>
            {activeCareer && (
              <span className="badge badge-accent">
                Active Career: {activeCareer.title}
              </span>
            )}
          </div>
          <h1 style={{ fontSize: '2.5rem', margin: '6px 0 12px' }}>
            Holland Code: <span style={{ color: 'var(--teal)', letterSpacing: '0.08em' }}>{matchData.hollandCode}</span>
          </h1>
          <p style={{ maxWidth: '620px', fontSize: '0.98rem', lineHeight: '1.6', color: 'var(--text-muted)' }}>
            Your primary dimensions reflect verified inclinations scored across Karachi academic and technical scenarios. Compatibility scores represent dimensional alignment, not a statistical guarantee of career success.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link to="/roadmap" className="btn btn-forest">
            <RoadmapIcon size={16} /> Explore 3D Roadmap
          </Link>
          <Link to="/skill-gap" className="btn btn-outline">
            <SkillGapIcon size={16} /> Skill-Gap Diagnostics
          </Link>
        </div>
      </div>

      {/* 6 Dimension Visualizations */}
      <div className="card" style={{ padding: '36px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.35rem', marginBottom: '4px' }}>
              Normalized Dimension Distribution (0–100%)
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Balanced scores across all six Holland RIASEC personality-work environment dimensions.
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {dimensions.map((d) => {
            const val = scores[d.key] || 0
            return (
              <div key={d.key}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.92rem' }}>
                  <div>
                    <strong style={{ color: 'var(--ink)' }}>{d.key} — {d.label}</strong>{' '}
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.84rem' }}>({d.desc})</span>
                  </div>
                  <div style={{ fontWeight: 800, color: d.color }}>{val}%</div>
                </div>
                <div
                  style={{
                    width: '100%',
                    height: '10px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--surface-alt)',
                    overflow: 'hidden',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div
                    style={{
                      width: `${val}%`,
                      height: '100%',
                      background: d.color,
                      borderRadius: 'var(--radius-full)',
                      transition: 'width 0.6s ease',
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3 PRIMARY EXPLAINABLE RECOMMENDATIONS                         */}
      {/* ============================================================ */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <span className="badge badge-forest" style={{ marginBottom: '6px' }}>Primary Recommendations</span>
            <h2 style={{ fontSize: '1.65rem' }}>Top 3 Aligned Career Directions</h2>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)' }}>
              Defensible matches calculated against Karachi employment markets and your verified top RIASEC dimensions.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => setShowCatalogModal(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <ExploreIcon size={14} /> Browse All {catalogCareers.length} Careers
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {primaryRecommendations.map((c, idx) => {
            const careerId = c.careerId || c._id || c.id || c.slug
            const isActive = currentActiveId === careerId || (activeCareer?.title && activeCareer.title === c.title)
            const score = c.compatibilityScore || 85

            return (
              <div
                key={careerId || idx}
                className="card"
                style={{
                  padding: '32px',
                  border: isActive ? '2px solid var(--forest)' : '1.5px solid var(--border)',
                  background: isActive ? 'var(--surface)' : 'var(--surface)',
                  boxShadow: isActive ? '0 4px 20px rgba(23, 75, 67, 0.08)' : 'none',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {isActive && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      background: 'var(--forest)',
                      color: '#FFFFFF',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      padding: '4px 14px',
                      borderBottomLeftRadius: 'var(--radius-sm)',
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Active Career Direction
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span className="badge badge-subtle">{c.domain || 'Professional Domain'}</span>
                      {c.matchingDimensions && (
                        <span className="badge badge-verified">
                          Matches: {Array.isArray(c.matchingDimensions) ? c.matchingDimensions.join(', ') : c.matchingDimensions}
                        </span>
                      )}
                    </div>
                    <h3 style={{ fontSize: '1.45rem', color: 'var(--ink)' }}>{c.title}</h3>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--forest)', fontFamily: 'var(--font-display)', lineHeight: 1 }}>
                      {score}<span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>/100</span>
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                      Compatibility Index
                    </div>
                  </div>
                </div>

                {/* Individualized explanation */}
                <div
                  style={{
                    fontSize: '0.92rem',
                    lineHeight: '1.6',
                    color: 'var(--ink)',
                    background: 'var(--teal-soft)',
                    padding: '14px 18px',
                    borderRadius: 'var(--radius-md)',
                    borderLeft: '4px solid var(--forest)',
                    marginBottom: '20px',
                  }}
                >
                  <strong>Why This Direction Fits:</strong> {c.why || c.rationale || `Strong alignment with your top Holland dimensions (${matchData.hollandCode}) in analytical modeling and practical execution.`}
                </div>

                {/* Strengths & Growth Areas */}
                <div className="grid-cols-2" style={{ gap: '16px', marginBottom: '20px' }}>
                  {c.strengths?.length > 0 && (
                    <div style={{ padding: '14px 16px', background: 'var(--surface-alt)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--forest)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.04em' }}>
                        Matching Inclinations & Strengths
                      </div>
                      <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.86rem', color: 'var(--ink)', lineHeight: 1.55 }}>
                        {c.strengths.map((s, sIdx) => (
                          <li key={sIdx}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {c.growthAreas?.length > 0 && (
                    <div style={{ padding: '14px 16px', background: 'var(--surface-alt)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.04em' }}>
                        Growth Areas & Realities
                      </div>
                      <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.86rem', color: 'var(--ink)', lineHeight: 1.55 }}>
                        {c.growthAreas.map((g, gIdx) => (
                          <li key={gIdx}>{g}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Educational Pathway */}
                {c.relevantPathway && (
                  <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                    <strong style={{ color: 'var(--ink)' }}>Karachi Educational Pathway:</strong> {c.relevantPathway}
                  </div>
                )}

                {/* Action buttons */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {isActive ? (
                      <span
                        className="btn btn-sm"
                        style={{
                          background: 'var(--forest)',
                          color: '#FFFFFF',
                          cursor: 'default',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <CheckIcon size={14} /> Active Career Selected
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-forest btn-sm"
                        disabled={selectingId === careerId}
                        onClick={() => handleSelectActiveCareer(c)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        <StarIcon size={14} />
                        <span>{selectingId === careerId ? 'Selecting...' : 'Select This Career Direction'}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => setSelectedForComparison(c)}
                      style={{ fontSize: '0.84rem' }}
                    >
                      Compare RIASEC Fit
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Link to="/roadmap" className="btn btn-ghost btn-sm" style={{ gap: '6px' }}>
                      <RoadmapIcon size={14} /> 3D Roadmap
                    </Link>
                    <Link to="/institutions" className="btn btn-ghost btn-sm" style={{ gap: '6px' }}>
                      <InstitutionsIcon size={14} /> Institutions
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ============================================================ */}
      {/* CAREER-SPECIFIC RIASEC DIMENSION COMPARISON (Section 08)      */}
      {/* ============================================================ */}
      {selectedForComparison && (
        <div className="card" style={{ padding: '36px', background: 'var(--surface)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
            <div>
              <span className="badge badge-forest" style={{ marginBottom: '6px' }}>Section 08 Dimensional Fit</span>
              <h3 style={{ fontSize: '1.4rem' }}>
                Your RIASEC Profile vs. {selectedForComparison.title}
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                Comparing your normalized student scores against the archetype profile for this profession.
              </p>
            </div>
            <span className="badge badge-verified">
              Target Code: {selectedForComparison.riasecProfile ? Object.entries(selectedForComparison.riasecProfile).sort((a,b) => b[1]-a[1]).slice(0,3).map(e=>e[0]).join('') : matchData.hollandCode}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {dimensions.map((d) => {
              const studentVal = scores[d.key] || 0
              // Reference archetype value: if defined in career object or simulated archetype
              const careerArchetype = selectedForComparison.riasecProfile?.[d.key]
                ? Math.round((selectedForComparison.riasecProfile[d.key] / 10) * 100)
                : (matchData.hollandCode.includes(d.key) ? 80 : 35)

              return (
                <div key={d.key} style={{ padding: '12px 16px', background: 'var(--surface-alt)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.88rem' }}>
                    <strong>{d.key} — {d.label}</strong>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '0.82rem' }}>
                      <span style={{ color: 'var(--forest)', fontWeight: 700 }}>Your Score: {studentVal}%</span>
                      <span style={{ color: 'var(--text-dim)' }}>Career Target: {careerArchetype}%</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ width: '100%', height: '8px', borderRadius: 'var(--radius-full)', background: 'var(--surface)', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${studentVal}%`,
                          height: '100%',
                          background: d.color,
                          borderRadius: 'var(--radius-full)',
                        }}
                      />
                    </div>
                    <div style={{ width: '100%', height: '6px', borderRadius: 'var(--radius-full)', background: 'var(--surface)', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${careerArchetype}%`,
                          height: '100%',
                          background: 'var(--text-dim)',
                          opacity: 0.5,
                          borderRadius: 'var(--radius-full)',
                        }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ALTERNATIVE CAREER DIRECTIONS                                */}
      {/* ============================================================ */}
      {alternativeRecommendations.length > 0 && (
        <div>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '16px' }}>
            Alternative Cross-Disciplinary Fields
          </h3>
          <div className="grid-cols-2" style={{ gap: '18px' }}>
            {alternativeRecommendations.map((c, idx) => {
              const careerId = c.careerId || c._id || c.id || c.slug
              const isActive = currentActiveId === careerId || (activeCareer?.title && activeCareer.title === c.title)

              return (
                <div key={careerId || idx} className="card" style={{ padding: '24px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h4 style={{ fontSize: '1.15rem', color: 'var(--ink)' }}>{c.title}</h4>
                    <span className="badge badge-subtle">{c.compatibilityScore || 75}/100</span>
                  </div>
                  <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '14px' }}>
                    {c.why || `Secondary match based on your supporting dimensions.`}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => handleSelectActiveCareer(c)}
                    >
                      {isActive ? '✓ Selected' : 'Switch Active Career'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => setSelectedForComparison(c)}
                    >
                      Compare Fit
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* WORKING-STYLE & ENVIRONMENTAL PREFERENCE CHECK               */}
      {/* ============================================================ */}
      <div className="card" style={{ padding: '36px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div>
            <span className="badge badge-subtle" style={{ marginBottom: '6px' }}>Preference Tuning</span>
            <h3 style={{ fontSize: '1.3rem' }}>Working-Style & Environment Alignment</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Specify your environmental realities to calibrate recommended pathways.
            </p>
          </div>
          {workStyleSaved && (
            <span className="badge badge-verified">
              <CheckIcon size={12} /> Preferences Saved
            </span>
          )}
        </div>

        <div className="grid-cols-3" style={{ gap: '16px', marginBottom: '20px' }}>
          <div className="form-group">
            <label className="form-label">Physical Setting</label>
            <select
              className="form-input"
              value={workStyle.environment}
              onChange={(e) => setWorkStyle({ ...workStyle, environment: e.target.value })}
            >
              <option value="desk">Desk / Remote / Lab based</option>
              <option value="field">Field / Industrial / Site visits</option>
              <option value="hybrid">Balanced Hybrid</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Collaboration Mode</label>
            <select
              className="form-input"
              value={workStyle.collaboration}
              onChange={(e) => setWorkStyle({ ...workStyle, collaboration: e.target.value })}
            >
              <option value="collaborative">Teamwork & Cross-Functional</option>
              <option value="independent">Focused Deep Independent Work</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Execution Cadence</label>
            <select
              className="form-input"
              value={workStyle.pace}
              onChange={(e) => setWorkStyle({ ...workStyle, pace: e.target.value })}
            >
              <option value="structured">Structured & Process-Oriented</option>
              <option value="rapid">Rapid Iteration & Startup Speed</option>
            </select>
          </div>
        </div>

        <button type="button" className="btn btn-outline btn-sm" onClick={handleSaveWorkStyle}>
          Save Environmental Preferences
        </button>
      </div>

      {/* Auditable Reason Trace */}
      <div className="card" style={{ padding: '32px', background: 'var(--surface-alt)' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '12px' }}>Auditable Scoring Provenance</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
          This trace is deterministically calculated from your recorded answers against versioned scoring rules (`riasec-pk-v1`).
        </p>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem', color: 'var(--ink)' }}>
          {matchData.reasonTrace?.map((item, idx) => (
            <li key={idx} style={{ padding: '8px 12px', background: 'var(--surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
              • {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Optional Qualitative Reflection */}
      <div className="card" style={{ padding: '36px' }}>
        <h3 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>Personal Alignment Reflection</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
          Capture qualitative reflections separate from numeric RIASEC scoring to fine-tune your roadmap choices.
        </p>

        {ikigaiMsg && (
          <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--teal-soft)', border: '1px solid var(--teal)', color: 'var(--forest)', fontSize: '0.9rem', marginBottom: '20px' }}>
            {ikigaiMsg}
          </div>
        )}

        <div className="grid-cols-2" style={{ gap: '18px', marginBottom: '24px' }}>
          <div className="form-group">
            <label className="form-label">What You Genuinely Enjoy</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Building tools, debugging algorithms, patient care"
              value={ikigaiNotes.love}
              onChange={(e) => setIkigaiNotes({ ...ikigaiNotes, love: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Skills You Are Developing</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. JavaScript, advanced calculus, Figma, laboratory assays"
              value={ikigaiNotes.goodAt}
              onChange={(e) => setIkigaiNotes({ ...ikigaiNotes, goodAt: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">What Industry / Karachi Needs</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Full-stack engineers, cloud security, clinical nursing"
              value={ikigaiNotes.worldNeeds}
              onChange={(e) => setIkigaiNotes({ ...ikigaiNotes, worldNeeds: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Economically Sustainable Direction</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Software house roles, medical residency, global remote"
              value={ikigaiNotes.paidFor}
              onChange={(e) => setIkigaiNotes({ ...ikigaiNotes, paidFor: e.target.value })}
            />
          </div>
        </div>

        <button
          type="button"
          className="btn btn-forest btn-sm"
          disabled={savingNotes}
          onClick={handleSaveReflection}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <SaveIcon size={14} />
          <span>{savingNotes ? 'Saving...' : 'Save Reflection to Profile'}</span>
        </button>
      </div>

      {/* Catalog Modal */}
      {showCatalogModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: '720px',
              width: '100%',
              maxHeight: '80vh',
              overflowY: 'auto',
              padding: '32px',
              background: 'var(--surface)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem' }}>Select From All Catalog Careers</h3>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
                  Choose any career from our database to set as your active direction.
                </p>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setShowCatalogModal(false)}
              >
                ✕ Close
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {catalogCareers.map((c) => {
                const cId = c._id || c.id
                const isCurrent = currentActiveId === cId || (activeCareer?.title && activeCareer.title === c.title)

                return (
                  <div
                    key={cId}
                    style={{
                      padding: '14px 18px',
                      background: 'var(--surface-alt)',
                      borderRadius: 'var(--radius-sm)',
                      border: isCurrent ? '1.5px solid var(--forest)' : '1px solid var(--border)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <strong style={{ color: 'var(--ink)' }}>{c.title}</strong>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>
                        {c.domain || c.disciplines?.[0] || 'Professional'} • {c.eligibilityPrerequisites?.slice(0, 2).join(', ') || 'FSc / ICS'}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline"
                      disabled={isCurrent}
                      onClick={() => {
                        handleSelectActiveCareer(c)
                        setShowCatalogModal(false)
                      }}
                    >
                      {isCurrent ? '✓ Active' : 'Select'}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
