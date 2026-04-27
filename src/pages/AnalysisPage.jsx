import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { getMyResumes } from '../api/resumes'
import { getMyJobPosts } from '../api/jobPosts'
import { analyzeMatch, generateCoverLetter, generateMockInterview, generateSelfIntro } from '../api/analysis'

export default function AnalysisPage() {
  const [resumes, setResumes] = useState([])
  const [jobPosts, setJobPosts] = useState([])
  const [resumeId, setResumeId] = useState('')
  const [jobPostId, setJobPostId] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('match')
  const [result, setResult] = useState(null)
  const [extraContext, setExtraContext] = useState('')
  const [focusArea, setFocusArea] = useState('')

  useEffect(() => {
    Promise.all([getMyResumes(), getMyJobPosts()]).then(([r, j]) => {
      setResumes(r.data.data)
      setJobPosts(j.data.data)
    })
  }, [])

  const handleAnalyze = async () => {
    if (!resumeId || !jobPostId) return alert('Please select a resume and a job post')
    setLoading(true)
    setResult(null)
    try {
      let res
      if (activeTab === 'match') res = await analyzeMatch(Number(resumeId), Number(jobPostId))
      else if (activeTab === 'cover') res = await generateCoverLetter(Number(resumeId), Number(jobPostId), extraContext)
      else if (activeTab === 'interview') res = await generateMockInterview(Number(resumeId), Number(jobPostId), focusArea)
      else if (activeTab === 'intro') res = await generateSelfIntro(Number(resumeId), Number(jobPostId))
      setResult(res.data.data)
    } catch (err) {
      alert(err.response?.data?.message || 'Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'match', label: 'Match Analysis' },
    { id: 'cover', label: 'Cover Letter' },
    { id: 'interview', label: 'Mock Interview' },
    { id: 'intro', label: 'Self-Intro' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">AI Analysis</h1>

        {/* Selectors */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Resume</label>
              <select
                value={resumeId}
                onChange={(e) => setResumeId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Choose a resume --</option>
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>{r.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Job Post</label>
              <select
                value={jobPostId}
                onChange={(e) => setJobPostId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Choose a job post --</option>
                {jobPosts.map((j) => (
                  <option key={j.id} value={j.id}>{j.jobTitle} @ {j.companyName}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => { setActiveTab(t.id); setResult(null) }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                  activeTab === t.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Optional inputs */}
          {activeTab === 'cover' && (
            <input
              type="text"
              value={extraContext}
              onChange={(e) => setExtraContext(e.target.value)}
              placeholder="Optional: e.g. emphasize my backend API experience"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
          {activeTab === 'interview' && (
            <input
              type="text"
              value={focusArea}
              onChange={(e) => setFocusArea(e.target.value)}
              placeholder="Optional: e.g. system design, behavioral"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate'}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">

            {/* Match Analysis */}
            {activeTab === 'match' && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-bold text-blue-600">{result.weightedMatchScore}%</div>
                  <div>
                    <p className="font-semibold text-gray-800">Match Score</p>
                    <p className="text-gray-400 text-sm">{result.fallbackUsed ? 'Keyword match' : 'AI-powered'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">✅ Matched Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {result.matchedSkills?.map((s) => (
                        <span key={s} className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">❌ Missing Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {result.missingSkills?.map((s) => (
                        <span key={s} className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Cover Letter */}
            {activeTab === 'cover' && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold text-gray-800">Cover Letter — {result.companyName}</p>
                  <button
                    onClick={() => navigator.clipboard.writeText(result.coverLetter)}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Copy
                  </button>
                </div>
                <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed font-sans">
                  {result.coverLetter}
                </pre>
              </div>
            )}

            {/* Mock Interview */}
            {activeTab === 'interview' && (
              <div className="space-y-4">
                <p className="font-semibold text-gray-800">Mock Interview — {result.companyName}</p>
                {result.questions?.map((q, i) => (
                  <div key={i} className="border border-gray-100 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">{q.category}</span>
                      <span className="text-gray-800 text-sm font-medium">Q{i + 1}</span>
                    </div>
                    <p className="text-gray-800 text-sm font-medium mb-2">{q.question}</p>
                    <p className="text-gray-500 text-xs mb-1"><span className="font-medium">Why asked:</span> {q.whyAsked}</p>
                    <p className="text-gray-500 text-xs"><span className="font-medium">Hint:</span> {q.answerHint}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Self-Intro */}
            {activeTab === 'intro' && (
              <div className="space-y-6">
                <p className="font-semibold text-gray-800">Self-Introduction — {result.companyName}</p>
                {[
                  { label: '30 Seconds', content: result.thirtySeconds },
                  { label: '1 Minute', content: result.oneMinute },
                  { label: '2 Minutes', content: result.twoMinutes },
                ].map((v) => (
                  <div key={v.label}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-700">{v.label}</p>
                      <button
                        onClick={() => navigator.clipboard.writeText(v.content)}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Copy
                      </button>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-lg p-3">{v.content}</p>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  )
}