import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, XCircle, Star } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { PortalSidebar } from './EmployeeDashboard'
import TechBadge from '../../components/common/TechBadge'
import DifficultyBadge from '../../components/common/DifficultyBadge'
import toast from 'react-hot-toast'
import axiosInstance from '../../api/axiosInstance'

const mockPending = [
  { id: 1, title: 'What is the difference between @Component and @Bean in Spring?', body: 'I was asked this in a TCS interview. The interviewer wanted to know the difference between component scanning and explicit bean definition.', technology: 'Spring Boot', difficulty: 'MEDIUM', submittedBy: 'Ravi Kumar', date: '12 Mar 2026' },
  { id: 2, title: 'Explain Java memory model and garbage collection types.', body: 'This was asked in an Infosys technical round. They wanted to know about heap, stack, PermGen, and different GC algorithms like G1, CMS.', technology: 'Java', difficulty: 'HARD', submittedBy: 'Sneha Reddy', date: '11 Mar 2026' },
  { id: 3, title: 'How does React context API work internally?', body: 'Asked in a startup interview. They wanted a deep explanation of context propagation and when to use context vs Redux.', technology: 'React', difficulty: 'MEDIUM', submittedBy: 'Arjun Mehta', date: '10 Mar 2026' },
  { id: 4, title: 'Explain difference between SQL joins with examples.', body: 'Common SQL interview question. Asked to explain INNER, LEFT, RIGHT, FULL OUTER joins with practical examples.', technology: 'SQL', difficulty: 'EASY', submittedBy: 'Pooja Sharma', date: '9 Mar 2026' },
  { id: 5, title: 'What is the difference between Docker volumes and bind mounts?', body: 'Asked in a DevOps round at Wipro. They wanted to know data persistence options in Docker.', technology: 'DevOps', difficulty: 'MEDIUM', submittedBy: 'Kiran B.', date: '8 Mar 2026' },
]

const TutorReviewPage = () => {
  const { user } = useAuth()
  const [questions, setQuestions] = useState(mockPending)
  const [comments, setComments] = useState({})
  const [ratings, setRatings] = useState({})
  const [activeFilter, setActiveFilter] = useState('All')
  const [processing, setProcessing] = useState(null)

  const techFilters = ['All', 'Java', 'Spring Boot', 'React', 'SQL', 'DevOps', 'Python', 'Salesforce']

  const filtered = activeFilter === 'All'
    ? questions
    : questions.filter((q) => q.technology === activeFilter)

  const handleAction = async (id, action) => {
    setProcessing(id + action)
    try {
      await axiosInstance.put(`/questions/${id}/review`, {
        status: action,
        comment: comments[id] || '',
        rating: ratings[id] || 0,
      })
      setQuestions((prev) => prev.filter((q) => q.id !== id))
      toast.success(`Question ${action === 'APPROVED' ? 'approved' : 'rejected'} successfully`)
    } catch {
      toast.error('Action failed. Please try again.')
    } finally {
      setProcessing(null)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <PortalSidebar user={user} role={user?.role || 'TUTOR'} activeItem="Pending Review" />

      <main className="flex-1 p-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-serif text-3xl text-[#0A1628]">Pending Reviews</h1>
              {questions.length > 0 && (
                <span className="bg-red-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                  {questions.length}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-400 font-light">
              Review and approve or reject submitted questions
            </p>
          </div>
        </div>

        {/* Tech Filter Tabs */}
        <div className="flex items-center gap-2 flex-wrap mb-6">
          {techFilters.map((tech) => (
            <button key={tech}
              onClick={() => setActiveFilter(tech)}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                activeFilter === tech
                  ? 'bg-[#0A1628] text-white'
                  : 'bg-white border border-black/8 text-gray-500 hover:bg-gray-50'
              }`}>
              {tech}
            </button>
          ))}
        </div>

        {/* Question Cards */}
        {filtered.length > 0 ? (
          <div className="flex flex-col gap-5">
            {filtered.map((q) => (
              <div key={q.id}
                className="bg-white border border-black/8 rounded-2xl overflow-hidden">

                {/* Card Header */}
                <div className="p-6 border-b border-black/5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h3 className="text-base font-semibold text-[#0A1628] leading-snug flex-1">
                      {q.title}
                    </h3>
                    <DifficultyBadge difficulty={q.difficulty} />
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4 font-light">
                    {q.body}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <TechBadge tech={q.technology} />
                    <span>Submitted by <strong className="text-gray-600">{q.submittedBy}</strong></span>
                    <span>·</span>
                    <span>{q.date}</span>
                  </div>
                </div>

                {/* Review Actions */}
                <div className="p-5 bg-gray-50/50 flex flex-col sm:flex-row items-start sm:items-center gap-4">

                  {/* Star Rating */}
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-400 mr-1">Rate:</span>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button key={s}
                        onClick={() => setRatings({ ...ratings, [q.id]: s })}
                        className="transition-all">
                        <Star size={16}
                          className={s <= (ratings[q.id] || 0)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-gray-200 hover:text-amber-300'} />
                      </button>
                    ))}
                  </div>

                  {/* Comment Input */}
                  <input
                    type="text"
                    placeholder="Add a tutor note (optional)..."
                    value={comments[q.id] || ''}
                    onChange={(e) => setComments({ ...comments, [q.id]: e.target.value })}
                    className="flex-1 px-4 py-2 border border-black/10 rounded-xl text-xs text-gray-700 placeholder-gray-300 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-50 transition-all bg-white"
                  />

                  {/* Action Buttons */}
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleAction(q.id, 'REJECTED')}
                      disabled={processing === q.id + 'REJECTED'}
                      className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 border border-red-100 text-xs font-medium rounded-xl hover:bg-red-100 transition-all disabled:opacity-50">
                      <XCircle size={13} />
                      Reject
                    </button>
                    <button
                      onClick={() => handleAction(q.id, 'APPROVED')}
                      disabled={processing === q.id + 'APPROVED'}
                      className="flex items-center gap-1.5 px-4 py-2 bg-green-50 text-green-600 border border-green-100 text-xs font-medium rounded-xl hover:bg-green-100 transition-all disabled:opacity-50">
                      <CheckCircle size={13} />
                      Approve
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="text-lg font-semibold text-[#0A1628] mb-2">
              All caught up!
            </h3>
            <p className="text-sm text-gray-400">
              No pending questions to review right now.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

export default TutorReviewPage