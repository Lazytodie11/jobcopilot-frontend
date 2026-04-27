import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { getMyResumes, deleteResume } from '../api/resumes'
import { getMyJobPosts, deleteJobPost, getRecommended } from '../api/jobPosts'

export default function Dashboard() {
  const [resumes, setResumes] = useState([])
  const [jobPosts, setJobPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedResumeId, setSelectedResumeId] = useState('')
  const [recommendations, setRecommendations] = useState(null)
  const [recLoading, setRecLoading] = useState(false)

  useEffect(() => {
    Promise.all([getMyResumes(), getMyJobPosts()])
      .then(([r, j]) => {
        setResumes(r.data.data)
        setJobPosts(j.data.data)
      })
      .finally(() => setLoading(false))
  }, [])

  const handleDeleteResume = async (id) => {
    if (!confirm('Delete this resume?')) return
    await deleteResume(id)
    setResumes(resumes.filter((r) => r.id !== id))
    if (selectedResumeId === String(id)) {
      setSelectedResumeId('')
      setRecommendations(null)
    }
  }

  const handleDeleteJob = async (id) => {
    if (!confirm('Delete this job post?')) return
    await deleteJobPost(id)
    setJobPosts(jobPosts.filter((j) => j.id !== id))
  }

  const handleGetRecommendations = async () => {
    if (!selectedResumeId) return
    setRecLoading(true)
    setRecommendations(null)
    try {
      const res = await getRecommended(selectedResumeId)
      setRecommendations(res.data.data)
    } catch (err) {
      console.error('Failed to get recommendations:', err)
    } finally {
      setRecLoading(false)
    }
  }

  const scoreColor = (score) => {
    if (score >= 0.40) return 'bg-green-100 text-green-700'
    if (score >= 0.33) return 'bg-blue-100 text-blue-700'
    if (score >= 0.25) return 'bg-yellow-100 text-yellow-700'
    return 'bg-gray-100 text-gray-500'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard</h1>

        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* Resumes */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">My Resumes</h2>
                  <Link
                    to="/upload"
                    className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700"
                  >
                    + Upload
                  </Link>
                </div>
                {resumes.length === 0 ? (
                  <div className="bg-white rounded-xl border border-dashed border-gray-300 p-8 text-center">
                    <p className="text-gray-400 text-sm">No resumes yet</p>
                    <Link to="/upload" className="text-blue-600 text-sm hover:underline mt-1 block">
                      Upload your first resume
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {resumes.map((r) => (
                      <div key={r.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-800 text-sm">{r.title}</p>
                          <p className="text-gray-400 text-xs mt-0.5">{r.candidateName} · {r.email}</p>
                          <p className="text-gray-300 text-xs mt-0.5">
                            {new Date(r.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteResume(r.id)}
                          className="text-red-400 hover:text-red-600 text-xs"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Job Posts */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">My Job Posts</h2>
                  <Link
                    to="/add-job"
                    className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700"
                  >
                    + Add Job
                  </Link>
                </div>
                {jobPosts.length === 0 ? (
                  <div className="bg-white rounded-xl border border-dashed border-gray-300 p-8 text-center">
                    <p className="text-gray-400 text-sm">No job posts yet</p>
                    <Link to="/add-job" className="text-blue-600 text-sm hover:underline mt-1 block">
                      Add your first job post
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {jobPosts.map((j) => (
                      <div key={j.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-800 text-sm">{j.jobTitle}</p>
                          <p className="text-gray-400 text-xs mt-0.5">{j.companyName} · {j.location || 'Remote'}</p>
                          <p className="text-gray-300 text-xs mt-0.5">
                            {new Date(j.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteJob(j.id)}
                          className="text-red-400 hover:text-red-600 text-xs"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* JD Recommendations */}
            <div className="mt-10">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Job Recommendations
              </h2>
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-5">
                  <select
                    value={selectedResumeId}
                    onChange={(e) => {
                      setSelectedResumeId(e.target.value)
                      setRecommendations(null)
                    }}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a resume to get recommendations</option>
                    {resumes.map((r) => (
                      <option key={r.id} value={r.id}>{r.title}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleGetRecommendations}
                    disabled={!selectedResumeId || recLoading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                  >
                    {recLoading ? 'Analyzing...' : 'Get Recommendations'}
                  </button>
                </div>

                {recommendations && (
                  recommendations.recommendedJobPosts.length === 0 ? (
                    <p className="text-gray-400 text-sm">
                      No recommendations found. Make sure your job posts have been embedded.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {recommendations.recommendedJobPosts.map((job, i) => (
                        <div key={job.jobPostId} className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                          <div className="text-lg font-bold text-gray-300 w-6 flex-shrink-0">
                            {i + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-gray-800 text-sm">{job.jobTitle}</p>
                              <span className="text-gray-400 text-xs">@</span>
                              <p className="text-gray-600 text-sm">{job.companyName}</p>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${scoreColor(job.similarityScore)}`}>
                                {Math.round(job.similarityScore * 100)}% match
                              </span>
                            </div>
                            <p className="text-gray-400 text-xs">{job.matchReason}</p>
                          </div>
                          <Link
                            to="/analysis"
                            className="text-xs text-blue-600 hover:underline flex-shrink-0"
                          >
                            Analyze →
                          </Link>
                        </div>
                      ))}
                    </div>
                  )
                )}

                {!recommendations && !recLoading && (
                  <p className="text-gray-300 text-sm">
                    Select a resume above to see which of your saved job posts best match your background.
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}