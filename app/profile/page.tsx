'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, MapPin, Calendar, Users, DollarSign, Heart,
  Plus, X, Loader2, CheckCircle, AlertCircle, Cigarette,
  Wine, Activity, Save, ArrowLeft
} from 'lucide-react'

interface FamilyMember {
  id: string
  name: string
  relationship: string
  age: number
  gender: string
}

interface UserProfile {
  age: number
  gender: string
  location: string
  sumInsured: string
  familySize: number
  familyMembers: FamilyMember[]
  existingIllness: string[]
  smoking: boolean
  drinking: boolean
  otherHabits: string
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [profile, setProfile] = useState<UserProfile>({
    age: 0,
    gender: '',
    location: '',
    sumInsured: '',
    familySize: 1,
    familyMembers: [],
    existingIllness: [],
    smoking: false,
    drinking: false,
    otherHabits: '',
  })

  const [newIllness, setNewIllness] = useState('')
  const [showAddMember, setShowAddMember] = useState(false)
  const [newMember, setNewMember] = useState({
    name: '',
    relationship: '',
    age: 0,
    gender: '',
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      loadProfile()
    }
  }, [status])

  const loadProfile = async () => {
    try {
      const res = await fetch('/api/profile')
      if (res.ok) {
        const data = await res.json()
        if (data.profile) {
          setProfile(data.profile)
        }
      }
    } catch (err) {
      console.error('Failed to load profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const saveProfile = async () => {
    setSaving(true)
    setError('')
    setSuccess(false)
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save profile')
      }
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const addIllness = () => {
    if (newIllness.trim()) {
      setProfile(prev => ({
        ...prev,
        existingIllness: [...prev.existingIllness, newIllness.trim()],
      }))
      setNewIllness('')
    }
  }

  const removeIllness = (index: number) => {
    setProfile(prev => ({
      ...prev,
      existingIllness: prev.existingIllness.filter((_, i) => i !== index),
    }))
  }

  const addFamilyMember = () => {
    if (newMember.name && newMember.relationship && newMember.age > 0) {
      setProfile(prev => ({
        ...prev,
        familyMembers: [
          ...prev.familyMembers,
          { ...newMember, id: Date.now().toString() },
        ],
        familySize: prev.familyMembers.length + 2, // +1 for new member, +1 for user
      }))
      setNewMember({ name: '', relationship: '', age: 0, gender: '' })
      setShowAddMember(false)
    }
  }

  const removeFamilyMember = (id: string) => {
    setProfile(prev => ({
      ...prev,
      familyMembers: prev.familyMembers.filter(m => m.id !== id),
      familySize: Math.max(1, prev.familyMembers.length), // -1 for removed member, min 1
    }))
  }

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-blue-50 to-emerald-50">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-blue-50 to-emerald-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <motion.button
            whileHover={{ x: -2 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 bg-white border border-slate-200 hover:border-slate-300 px-4 py-2 rounded-xl transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </motion.button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden"
        >
          {/* Hero header */}
          <div className="bg-gradient-to-r from-violet-600 to-blue-600 px-8 py-8 text-white">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-black">Your Profile</h1>
                <p className="text-white/80 text-sm mt-1">
                  Help us personalize your policy recommendations
                </p>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {/* Personal Information */}
            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-violet-600" />
                Personal Information
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Age
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="number"
                      value={profile.age || ''}
                      onChange={e => setProfile(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                      placeholder="Enter your age"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Gender
                  </label>
                  <select
                    value={profile.gender}
                    onChange={e => setProfile(prev => ({ ...prev, gender: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition-all"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={profile.location}
                      onChange={e => setProfile(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="City, State, Country"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition-all"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Insurance Details */}
            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                Insurance Details
              </h2>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Desired Sum Insured
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={profile.sumInsured}
                    onChange={e => setProfile(prev => ({ ...prev, sumInsured: e.target.value }))}
                    placeholder="e.g., $500,000 or ₹10,00,000"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition-all"
                  />
                </div>
              </div>
            </section>

            {/* Family Information */}
            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Family Information
              </h2>
              
              <div className="mb-4">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Family Size (including you)
                </label>
                <input
                  type="number"
                  value={profile.familySize}
                  onChange={e => setProfile(prev => ({ ...prev, familySize: parseInt(e.target.value) || 1 }))}
                  min="1"
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition-all"
                />
              </div>

              {/* Family Members List */}
              {profile.familyMembers.length > 0 && (
                <div className="space-y-2 mb-4">
                  {profile.familyMembers.map(member => (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-xl"
                    >
                      <Heart className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900 text-sm">
                          {member.name} <span className="text-slate-500">({member.relationship})</span>
                        </p>
                        <p className="text-xs text-slate-600">
                          {member.age} years • {member.gender}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFamilyMember(member.id)}
                        className="p-1.5 rounded-lg hover:bg-red-100 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Add Family Member */}
              {!showAddMember ? (
                <button
                  onClick={() => setShowAddMember(true)}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-semibold"
                >
                  <Plus className="w-4 h-4" />
                  Add Family Member
                </button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-4 bg-slate-50 border-2 border-slate-200 rounded-xl space-y-3"
                >
                  <div className="grid sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={newMember.name}
                      onChange={e => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Name"
                      className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-violet-400"
                    />
                    <input
                      type="text"
                      value={newMember.relationship}
                      onChange={e => setNewMember(prev => ({ ...prev, relationship: e.target.value }))}
                      placeholder="Relationship (e.g., Spouse, Child)"
                      className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-violet-400"
                    />
                    <input
                      type="number"
                      value={newMember.age || ''}
                      onChange={e => setNewMember(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                      placeholder="Age"
                      className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-violet-400"
                    />
                    <select
                      value={newMember.gender}
                      onChange={e => setNewMember(prev => ({ ...prev, gender: e.target.value }))}
                      className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-violet-400"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={addFamilyMember}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Member
                    </button>
                    <button
                      onClick={() => setShowAddMember(false)}
                      className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-semibold rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </section>

            {/* Health Information */}
            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-red-600" />
                Health Information
              </h2>
              
              <div className="space-y-4">
                {/* Existing Illness */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Existing Illnesses / Pre-existing Conditions
                  </label>
                  
                  {profile.existingIllness.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {profile.existingIllness.map((illness, index) => (
                        <motion.span
                          key={index}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 text-red-700 text-sm font-medium rounded-lg"
                        >
                          {illness}
                          <button
                            onClick={() => removeIllness(index)}
                            className="hover:bg-red-200 rounded p-0.5 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </motion.span>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newIllness}
                      onChange={e => setNewIllness(e.target.value)}
                      onKeyPress={e => e.key === 'Enter' && addIllness()}
                      placeholder="Type condition and press Enter"
                      className="flex-1 px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition-all"
                    />
                    <button
                      onClick={addIllness}
                      className="px-4 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Habits */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <label className="flex items-center gap-3 p-4 bg-slate-50 border-2 border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={profile.smoking}
                      onChange={e => setProfile(prev => ({ ...prev, smoking: e.target.checked }))}
                      className="w-5 h-5 text-violet-600 rounded focus:ring-2 focus:ring-violet-400"
                    />
                    <Cigarette className="w-5 h-5 text-slate-500" />
                    <span className="font-semibold text-slate-700">Smoking</span>
                  </label>

                  <label className="flex items-center gap-3 p-4 bg-slate-50 border-2 border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={profile.drinking}
                      onChange={e => setProfile(prev => ({ ...prev, drinking: e.target.checked }))}
                      className="w-5 h-5 text-violet-600 rounded focus:ring-2 focus:ring-violet-400"
                    />
                    <Wine className="w-5 h-5 text-slate-500" />
                    <span className="font-semibold text-slate-700">Drinking</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Other Habits or Lifestyle Factors
                  </label>
                  <textarea
                    value={profile.otherHabits}
                    onChange={e => setProfile(prev => ({ ...prev, otherHabits: e.target.value }))}
                    placeholder="e.g., Regular exercise, high-risk sports, travel frequently, etc."
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition-all resize-none"
                  />
                </div>
              </div>
            </section>

            {/* Error/Success Messages */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{error}</span>
                </motion.div>
              )}
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl"
                >
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium">Profile saved successfully!</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Save Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={saveProfile}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg transition-all"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving Profile...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Profile
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
