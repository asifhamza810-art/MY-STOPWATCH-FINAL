import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'

export default function CommunityPage() {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showNewModal, setShowNewModal] = useState(false)
  const [statusMsg, setStatusMsg] = useState(null)

  // New post form state
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')
  const [category, setCategory] = useState('admissions')
  const [submitting, setSubmitting] = useState(false)

  // Reply state
  const [replyPostId, setReplyPostId] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [replying, setReplying] = useState(false)
  const [repliesMap, setRepliesMap] = useState({})
  const [loadingReplies, setLoadingReplies] = useState({})

  // Report modal state (replaces prompt)
  const [reportPostId, setReportPostId] = useState(null)
  const [reportReason, setReportReason] = useState('')

  const loadPosts = async () => {
    setLoading(true)
    try {
      let path = '/community/posts?'
      if (search) path += `q=${encodeURIComponent(search)}&`
      if (selectedCategory) path += `category=${encodeURIComponent(selectedCategory)}&`
      const res = await api(path)
      setPosts(res.data || [])
    } catch (err) {
      console.error('Failed to load community posts:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(loadPosts, 250)
    return () => clearTimeout(timer)
  }, [search, selectedCategory])

  const handleCreatePost = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setStatusMsg(null)
    try {
      const tagList = tags.split(',').map((t) => t.trim()).filter(Boolean)
      const res = await api('/community/posts', {
        method: 'POST',
        auth: true,
        body: { title, content, tags: tagList, category },
      })
      setStatusMsg(res.data?.message || 'Discussion thread posted successfully.')
      setTitle('')
      setContent('')
      setTags('')
      setShowNewModal(false)
      await loadPosts()
    } catch (err) {
      setStatusMsg(`Error creating post: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleVote = async (postId) => {
    try {
      const res = await api(`/community/posts/${postId}/vote`, {
        method: 'POST',
        auth: true,
      })
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? { ...p, upvoteCount: res.data.upvoteCount } : p))
      )
    } catch (err) {
      console.error('Vote failed:', err)
    }
  }

  const loadRepliesForPost = async (postId) => {
    setLoadingReplies((prev) => ({ ...prev, [postId]: true }))
    try {
      const res = await api(`/community/posts/${postId}/replies`)
      setRepliesMap((prev) => ({ ...prev, [postId]: res.data || [] }))
    } catch (err) {
      console.error('Failed to load replies:', err)
    } finally {
      setLoadingReplies((prev) => ({ ...prev, [postId]: false }))
    }
  }

  const handleToggleReplies = (postId) => {
    if (replyPostId === postId) {
      setReplyPostId(null)
    } else {
      setReplyPostId(postId)
      if (!repliesMap[postId]) {
        loadRepliesForPost(postId)
      }
    }
  }

  const handleReplySubmit = async (postId) => {
    if (!replyText.trim()) return
    setReplying(true)
    try {
      await api(`/community/posts/${postId}/replies`, {
        method: 'POST',
        auth: true,
        body: { content: replyText },
      })
      setReplyText('')
      setStatusMsg('Your reply was submitted and queued for moderation review.')
      await loadRepliesForPost(postId)
    } catch (err) {
      setStatusMsg(`Reply failed: ${err.message}`)
    } finally {
      setReplying(false)
    }
  }

  const handleReportSubmit = async () => {
    if (!reportPostId || !reportReason.trim()) return
    try {
      await api('/community/reports', {
        method: 'POST',
        auth: true,
        body: {
          targetType: 'post',
          targetId: reportPostId,
          category: 'content_issue',
          explanation: reportReason,
        },
      })
      setStatusMsg('Report logged for administrator review.')
      setReportPostId(null)
      setReportReason('')
    } catch (err) {
      setStatusMsg(`Report error: ${err.message}`)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge badge-forest">Moderated Student Exchange</span>
            <span className="badge badge-verified">Karachi Academic Discussions</span>
          </div>
          <h1>Karachi Student Community Hub</h1>
          <p style={{ maxWidth: '680px', fontSize: '0.98rem' }}>
            Ask questions about university merit lists, entry exam techniques, BIEK equivalency, and vocational career steps with peers and verified senior mentors.
          </p>
        </div>

        <button type="button" className="btn btn-forest" onClick={() => setShowNewModal(true)}>
          + Start Discussion Thread
        </button>
      </div>

      {statusMsg && (
        <div style={{ padding: '12px 18px', borderRadius: 'var(--radius-md)', background: 'var(--teal-soft)', border: '1px solid var(--teal)', color: 'var(--forest)', fontSize: '0.92rem' }}>
          {statusMsg}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="filter-bar" style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
        <div className="search-box" style={{ flex: 1, minWidth: '240px' }}>
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search discussions: NED entry test, FAST aggregate, ICS subjects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="form-select"
          style={{ width: 'auto', minWidth: '180px' }}
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="admissions">Admissions & Entrance Tests</option>
          <option value="guidance">Career & Subject Choice</option>
          <option value="skills">Bootcamps & Industry Skills</option>
          <option value="general">Karachi Student Life</option>
        </select>
      </div>

      {/* Posts Feed */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="card" style={{ height: '160px' }}>
              <div className="skeleton" style={{ height: '24px', width: '50%', marginBottom: '14px' }} />
              <div className="skeleton" style={{ height: '60px', width: '100%' }} />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💬</div>
          <h3 className="empty-title">No Discussions in This Category Yet</h3>
          <p className="empty-text">Be the first to start a conversation or ask an entry test question.</p>
          <button type="button" className="btn btn-forest btn-sm" onClick={() => setShowNewModal(true)}>
            Start New Discussion
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {posts.map((post) => (
            <div
              key={post._id}
              className="card"
              style={{
                padding: '28px',
                border: '1.5px solid var(--border)',
                background: 'var(--surface)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="badge badge-forest">{post.category?.toUpperCase()}</span>
                  {post.isDemo && (
                    <span className="badge badge-subtle">
                      DEMO FIXTURE
                    </span>
                  )}
                  <span style={{ fontSize: '0.88rem', color: 'var(--text-dim)' }}>
                    Posted by <strong style={{ color: 'var(--ink)' }}>{post.authorId?.displayName || 'Student'}</strong>
                    {post.authorId?.role === 'moderator' && (
                      <span className="badge badge-verified" style={{ marginLeft: '6px', fontSize: '0.72rem' }}>
                        Senior Mentor
                      </span>
                    )}
                  </span>
                </div>

                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '0.82rem', cursor: 'pointer' }}
                  onClick={() => setReportPostId(post._id)}
                >
                  🚩 Report
                </button>
              </div>

              <h3 style={{ fontSize: '1.35rem', marginBottom: '10px', color: 'var(--ink)' }}>
                {post.title}
              </h3>
              <p style={{ fontSize: '0.94rem', marginBottom: '18px', lineHeight: '1.65', color: 'var(--text-muted)' }}>
                {post.content}
              </p>

              {post.tags?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '18px' }}>
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        fontSize: '0.78rem',
                        padding: '3px 10px',
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--canvas)',
                        color: 'var(--forest)',
                        border: '1px solid var(--border)',
                        fontWeight: 600,
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => handleVote(post._id)}
                >
                  ▲ Upvote ({post.upvoteCount || 0})
                </button>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleToggleReplies(post._id)}
                >
                  💬 {replyPostId === post._id ? 'Close Thread' : 'Discussion Thread'}
                </button>
              </div>

              {/* Threaded Replies Box */}
              {replyPostId === post._id && (
                <div style={{ marginTop: '20px', padding: '20px', background: 'var(--canvas)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <h4 style={{ fontSize: '1rem', marginBottom: '14px', color: 'var(--forest)' }}>
                    Replies & Peer Insights
                  </h4>

                  {loadingReplies[post._id] ? (
                    <div className="skeleton" style={{ height: '60px', width: '100%', marginBottom: '12px' }} />
                  ) : repliesMap[post._id]?.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
                      {repliesMap[post._id].map((rep) => (
                        <div key={rep._id} style={{ padding: '12px 16px', background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <strong style={{ fontSize: '0.88rem', color: 'var(--forest)' }}>
                              {rep.authorId?.displayName || 'Peer Mentor'}
                            </strong>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                              {rep.isDemo ? 'Exemplar' : 'Verified'}
                            </span>
                          </div>
                          <p style={{ fontSize: '0.88rem', color: 'var(--ink)' }}>{rep.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                      No replies yet. Share your experience below.
                    </p>
                  )}

                  {/* Add Reply Input */}
                  <textarea
                    className="form-textarea"
                    rows={2}
                    placeholder="Contribute advice or follow-up question..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                    <button
                      type="button"
                      className="btn btn-forest btn-sm"
                      disabled={replying || !replyText.trim()}
                      onClick={() => handleReplySubmit(post._id)}
                    >
                      {replying ? 'Submitting...' : 'Post Reply'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* New Post Modal */}
      {showNewModal && (
        <div className="modal-backdrop" onClick={() => setShowNewModal(false)}>
          <div className="modal-panel" style={{ maxWidth: '620px' }} onClick={(e) => e.stopPropagation()}>
            <button type="button" className="modal-close" onClick={() => setShowNewModal(false)}>
              ✕
            </button>

            <span className="badge badge-forest" style={{ marginBottom: '8px' }}>Academic Discourse</span>
            <h3 style={{ fontSize: '1.6rem', marginBottom: '8px' }}>Start a Discussion</h3>
            <p style={{ fontSize: '0.9rem', marginBottom: '20px', lineHeight: '1.5' }}>
              All discussions are community-moderated to ensure genuine educational exchange without spam or unsolicited promotion.
            </p>

            <form onSubmit={handleCreatePost}>
              <div className="form-group">
                <label className="form-label">Discussion Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Tips for FAST-NUCES Karachi Entry Test Advanced Math"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Topic Category</label>
                <select
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="admissions">Admissions & Entrance Tests</option>
                  <option value="guidance">Career & Subject Guidance</option>
                  <option value="skills">Bootcamps & Technical Skills</option>
                  <option value="general">Karachi Student Life</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Tags (comma-separated)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. FAST, EntryTest, Mathematics, HSC"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Discussion Content</label>
                <textarea
                  className="form-textarea"
                  rows={4}
                  placeholder="Provide context, specific questions, or advice..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="submit" className="btn btn-forest" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Post Discussion'}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setShowNewModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Modal (Clean UI replacing prompt) */}
      {reportPostId && (
        <div className="modal-backdrop" onClick={() => setReportPostId(null)}>
          <div className="modal-panel" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <button type="button" className="modal-close" onClick={() => setReportPostId(null)}>
              ✕
            </button>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Report Discussion</h3>
            <p style={{ fontSize: '0.88rem', marginBottom: '16px' }}>
              Help keep Acadiv safe. Please describe the reason (e.g. spam, misinformation, inappropriate language).
            </p>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Reason for report..."
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
            />
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button
                type="button"
                className="btn btn-forest btn-sm"
                disabled={!reportReason.trim()}
                onClick={handleReportSubmit}
              >
                Submit Report
              </button>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setReportPostId(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
