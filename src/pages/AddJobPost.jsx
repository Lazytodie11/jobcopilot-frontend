import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { createJobPost, createJobPostFromUrl } from '../api/jobPosts'

export default function AddJobPost() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('manual') // 'manual' | 'url'
  const [url, setUrl] = useState('')
  const [form, setForm] = useState({
    jobTitle: '', companyName: '', location: '',
    employmentType: 'FULL_TIME', description: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleManualSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await createJobPost(form)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create job post')
    } finally {
      setLoading(false)
    }
  }

  const handleUrlSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await createJobPostFromUrl(url)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to parse URL')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Add Job Post</h1>

        {/* Mode toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setMode('manual')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              mode === 'manual'
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-300 text-gray-600'
            }`}
          >
            Manual Entry
          </button>
          <button
            onClick={() => setMode('url')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              mode === 'url'
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-300 text-gray-600'
            }`}
          >
            Parse from URL
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>
        )}

        {mode === 'url' ? (
          <form onSubmit={handleUrlSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Posting URL</label>
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://jobs.company.com/..."
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Parsing...' : 'Parse & Save'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleManualSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
              <input
                type="text"
                required
                value={form.jobTitle}
                onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Software Engineer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
              <input
                type="text"
                required
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Glean"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="San Francisco, CA"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
              <textarea
                required
                rows={6}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Paste the full job description here..."
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Job Post'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}