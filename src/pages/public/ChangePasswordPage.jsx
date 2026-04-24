import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { HiEye, HiEyeSlash, HiExclamationTriangle, HiShieldCheck, HiArrowPath } from "react-icons/hi2";
import { useAuth } from '../../context/AuthContext'
import { changePassword } from '../../api/authApi'
import toast from 'react-hot-toast'

const getPasswordStrength = (password) => {
  if (password.length === 0) return { score: 0, label: '', color: '' }
  if (password.length < 6) return { score: 1, label: 'Weak', color: 'bg-red-400' }
  if (password.length < 10 || !/[A-Z]/.test(password) || !/[0-9]/.test(password))
    return { score: 2, label: 'Medium', color: 'bg-amber-400' }
  return { score: 3, label: 'Strong', color: 'bg-green-500' }
}

const ChangePasswordPage = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [show, setShow] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [loading, setLoading] = useState(false)
  const { user, login, token } = useAuth()
  const navigate = useNavigate()

  const strength = getPasswordStrength(formData.newPassword)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const toggleShow = (field) => {
    setShow({ ...show, [field]: !show[field] })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    if (strength.score < 2) {
      toast.error('Please choose a stronger password')
      return
    }
    if (formData.currentPassword === formData.newPassword) {
      toast.error('New password must be different from current password')
      return
    }

    setLoading(true)
    try {
      const response = await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      })

      // Update user in context — isFirstLogin is now false
      const updatedUser = { ...user, isFirstLogin: false }
      login(updatedUser, token)

      toast.success('Password changed successfully! Welcome aboard.')

      // Redirect based on role
      if (user?.role === 'ADMIN') navigate('/portal/admin')
      else if (user?.role === 'TUTOR') navigate('/portal/review')
      else if (user?.role === 'EMPLOYEE') navigate('/portal/dashboard')
      else navigate('/dashboard')

    } catch (error) {
      const message = error.response?.data?.message || 'Failed to change password. Try again.'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-12 font-sans portal-modern">
      <div className="w-full max-w-md">

        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-3 mb-10">
          <div className="w-10 h-10 bg-[#0A1628] rounded-xl flex items-center justify-center">
            <span className="text-white text-sm font-bold tracking-wide">AIP</span>
          </div>
          <div>
            <div className="text-sm font-semibold text-[#0A1628] leading-tight">
              Aja Interview Vault
            </div>
            <div className="text-xs text-gray-400 leading-tight">
              Interview Question Bank
            </div>
          </div>
        </Link>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-black/8 p-8 shadow-sm">

          {/* Warning Banner */}
          <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
            <HiExclamationTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-amber-800 mb-1">
                Action Required — Cannot Skip
              </p>
              <p className="text-xs text-amber-700 leading-relaxed">
                Welcome! For your security, you must set a new password
                before continuing. This screen cannot be skipped.
              </p>
            </div>
          </div>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <HiShieldCheck size={20} className="text-[#2563EB]" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-[#0A1628]">
                Set Your New Password
              </h1>
              <p className="text-xs text-gray-400">
                Hi {user?.fullName?.split(" ")[0] || user?.name || 'there'}, secure your account now
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* Current Password */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Current Password
              </label>
              <p className="text-xs text-gray-400 mb-2">
                The temporary password your administrator gave you
              </p>
              <div className="relative">
                <input
                  type={show.current ? 'text' : 'password'}
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  placeholder="Enter temporary password"
                  required
                  className="w-full px-4 py-3 border border-black/10 rounded-xl text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-50 transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => toggleShow('current')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600 transition-colors">
                  {show.current ? <HiEyeSlash size={16} /> : <HiEye size={16} />}
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-black/5" />

            {/* New Password */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={show.new ? 'text' : 'password'}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  required
                  className="w-full px-4 py-3 border border-black/10 rounded-xl text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-50 transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => toggleShow('new')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600 transition-colors">
                  {show.new ? <HiEyeSlash size={16} /> : <HiEye size={16} />}
                </button>
              </div>

              {/* Strength Bar */}
              {formData.newPassword.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3].map((s) => (
                      <div key={s}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          s <= strength.score ? strength.color : 'bg-gray-100'
                        }`} />
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${
                    strength.score === 1 ? 'text-red-500' :
                    strength.score === 2 ? 'text-amber-500' :
                    'text-green-600'
                  }`}>
                    {strength.label} password
                  </p>
                </div>
              )}

              {/* Password Rules */}
              <div className="mt-3 flex flex-col gap-1">
                {[
                  { rule: formData.newPassword.length >= 8, text: 'At least 8 characters' },
                  { rule: /[A-Z]/.test(formData.newPassword), text: 'One uppercase letter' },
                  { rule: /[0-9]/.test(formData.newPassword), text: 'One number' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      item.rule ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                    <span className={`text-xs ${
                      item.rule ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={show.confirm ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat your new password"
                  required
                  className={`w-full px-4 py-3 border rounded-xl text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-50 transition-all pr-12 ${
                    formData.confirmPassword.length > 0 &&
                    formData.confirmPassword !== formData.newPassword
                      ? 'border-red-300 focus:border-red-400'
                      : 'border-black/10 focus:border-[#2563EB]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => toggleShow('confirm')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600 transition-colors">
                  {show.confirm ? <HiEyeSlash size={16} /> : <HiEye size={16} />}
                </button>
              </div>
              {formData.confirmPassword.length > 0 &&
                formData.confirmPassword !== formData.newPassword && (
                  <p className="text-xs text-red-500 mt-1">
                    Passwords do not match
                  </p>
                )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#0A1628] text-white text-sm font-medium rounded-xl hover:bg-[#0F2340] transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <HiArrowPath className="animate-spin" size={16} />
                  Updating password...
                </span>
              ) : 'Set New Password & Continue →'}
            </button>

          </form>
        </div>

        <p className="text-center text-xs text-gray-300 mt-6">
          © 2026 Aja Consultancy. All rights reserved.
        </p>

      </div>
    </div>
  )
}

export default ChangePasswordPage
