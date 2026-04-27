import { useEffect, useState, useRef } from 'react'
import Navbar from '../components/Navbar'
import { getMyResumes } from '../api/resumes'
import { getMyJobPosts } from '../api/jobPosts'
import { getMySessions, createSession, getSession, sendMessage } from '../api/chat'

export default function ChatPage() {
  const [resumes, setResumes] = useState([])
  const [jobPosts, setJobPosts] = useState([])
  const [sessions, setSessions] = useState([])
  const [activeSession, setActiveSession] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [resumeId, setResumeId] = useState('')
  const [jobPostId, setJobPostId] = useState('')
  const [loadError, setLoadError] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    Promise.all([getMyResumes(), getMyJobPosts(), getMySessions()])
      .then(([r, j, s]) => {
        setResumes(Array.isArray(r.data.data) ? r.data.data : [])
        setJobPosts(Array.isArray(j.data.data) ? j.data.data : [])
        setSessions(Array.isArray(s.data.data) ? s.data.data : [])
      })
      .catch((err) => {
        console.error('Failed to load chat page data:', err)
        setLoadError('Failed to load data. Please refresh the page.')
      })
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSelectSession = async (session) => {
    setActiveSession(session)
    try {
      const res = await getSession(session.id)
      setMessages(res.data.data.messages || [])
    } catch (err) {
      console.error('Failed to load session:', err)
    }
  }

  const handleCreateSession = async () => {
    if (!resumeId || !jobPostId) {
      alert('Please select both a resume and a job post')
      return
    }
    try {
      const res = await createSession(Number(resumeId), Number(jobPostId))
      const newSession = res.data.data
      setSessions((prev) => [newSession, ...prev])
      setActiveSession(newSession)
      setMessages([])
    } catch (err) {
      console.error('Failed to create session:', err)
      alert(err.response?.data?.message || 'Failed to create session')
    }
  }

  const handleSend = async () => {
    if (!input.trim() || !activeSession) return
    const userMsg = { role: 'USER', content: input }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)
    try {
      const res = await sendMessage(activeSession.id, input)
      setMessages((prev) => [...prev, res.data.data])
    } catch (err) {
      console.error('Failed to send message:', err)
      setMessages((prev) => [
        ...prev,
        { role: 'ASSISTANT', content: 'Something went wrong. Please try again.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const getSessionLabel = (session) => {
    const resume = resumes.find((r) => r.id === session.resumeId)
    const job = jobPosts.find((j) => j.id === session.jobPostId)
    if (resume && job) return `${resume.title} × ${job.companyName}`
    return `Session #${session.id}`
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {loadError && (
        <div className="bg-red-50 text-red-600 text-sm px-6 py-2 text-center">
          {loadError}
        </div>
      )}

      <div className="flex flex-1 max-w-6xl mx-auto w-full px-6 py-6 gap-6">

        {/* Sidebar */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">New Session</p>

            <select
              value={resumeId}
              onChange={(e) => setResumeId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-xs mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select resume</option>
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>{r.title}</option>
              ))}
            </select>

            <select
              value={jobPostId}
              onChange={(e) => setJobPostId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-xs mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select job post</option>
              {jobPosts.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.jobTitle} @ {j.companyName}
                </option>
              ))}
            </select>

            <button
              onClick={handleCreateSession}
              className="w-full bg-blue-600 text-white py-1.5 rounded-lg text-xs font-medium hover:bg-blue-700"
            >
              Start Session
            </button>

            {sessions.length > 0 && (
              <div className="mt-4 space-y-1">
                <p className="text-xs text-gray-400 font-medium mb-2">Past Sessions</p>
                {sessions.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleSelectSession(s)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs leading-tight ${
                      activeSession?.id === s.id
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {getSessionLabel(s)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-200 flex flex-col overflow-hidden">
          {!activeSession ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-1">No active session</p>
                <p className="text-gray-300 text-xs">
                  Select a resume and job post, then click Start Session
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="border-b border-gray-100 px-6 py-3">
                <p className="text-sm font-medium text-gray-700">
                  {getSessionLabel(activeSession)}
                </p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-300 text-sm">
                      Ask anything about your resume or this job
                    </p>
                  </div>
                )}
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex ${m.role === 'USER' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm ${
                        m.role === 'USER'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-2xl px-4 py-3 text-sm text-gray-400">
                      Thinking...
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="border-t border-gray-100 p-4 flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                  placeholder="Ask about your resume, skills, or how to improve..."
                  className="flex-1 border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}