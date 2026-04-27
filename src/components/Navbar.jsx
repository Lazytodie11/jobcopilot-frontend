import { Link, useNavigate } from 'react-router-dom'

export default function Navbar() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/signin')
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <Link to="/dashboard" className="text-xl font-bold text-blue-600">
        JobCopilot
      </Link>
      <div className="flex items-center gap-6">
        <Link to="/dashboard" className="text-gray-600 hover:text-blue-600 text-sm">
          Dashboard
        </Link>
        <Link to="/upload" className="text-gray-600 hover:text-blue-600 text-sm">
          Upload Resume
        </Link>
        <Link to="/add-job" className="text-gray-600 hover:text-blue-600 text-sm">
          Add Job
        </Link>
        <Link to="/analysis" className="text-gray-600 hover:text-blue-600 text-sm">
          Analysis
        </Link>
        <Link to="/chat" className="text-gray-600 hover:text-blue-600 text-sm">
          Chat
        </Link>
        <button
          onClick={handleLogout}
          className="text-sm text-red-500 hover:text-red-700"
        >
          Sign Out
        </button>
      </div>
    </nav>
  )
}