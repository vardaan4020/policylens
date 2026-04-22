'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calculator, TrendingUp, TrendingDown, Info, Sparkles, Users, MapPin, Calendar, Heart, Cigarette, Activity } from 'lucide-react'

interface Props {
  policyType: string
}

interface CalculatorInputs {
  age: number
  gender: 'male' | 'female' | 'other'
  sumInsured: number
  location: 'metro' | 'tier1' | 'tier2' | 'tier3'
  familySize: number
  preExisting: boolean
  smoking: boolean
  tenure: number
}

export default function PremiumCalculator({ policyType }: Props) {
  const [inputs, setInputs] = useState<CalculatorInputs>({
    age: 30,
    gender: 'male',
    sumInsured: 500000,
    location: 'metro',
    familySize: 1,
    preExisting: false,
    smoking: false,
    tenure: 1,
  })

  const [calculated, setCalculated] = useState(false)

  // Base premium calculation logic
  const calculatePremium = () => {
    let basePremium = 5000

    // Age factor
    if (inputs.age < 25) basePremium *= 0.8
    else if (inputs.age < 35) basePremium *= 1.0
    else if (inputs.age < 45) basePremium *= 1.3
    else if (inputs.age < 55) basePremium *= 1.7
    else basePremium *= 2.2

    // Gender factor
    if (inputs.gender === 'female') basePremium *= 0.95

    // Sum insured factor
    basePremium *= (inputs.sumInsured / 500000)

    // Location factor
    const locationMultiplier = {
      metro: 1.2,
      tier1: 1.0,
      tier2: 0.9,
      tier3: 0.8,
    }
    basePremium *= locationMultiplier[inputs.location]

    // Family size factor
    if (inputs.familySize === 2) basePremium *= 1.5
    else if (inputs.familySize === 3) basePremium *= 1.8
    else if (inputs.familySize === 4) basePremium *= 2.0
    else if (inputs.familySize > 4) basePremium *= 2.3

    // Pre-existing conditions
    if (inputs.preExisting) basePremium *= 1.4

    // Smoking
    if (inputs.smoking) basePremium *= 1.3

    // Multi-year discount
    if (inputs.tenure === 2) basePremium *= 0.95
    else if (inputs.tenure === 3) basePremium *= 0.90

    return Math.round(basePremium)
  }

  const premium = calculatePremium()
  const monthlyPremium = Math.round(premium / 12)
  const gstAmount = Math.round(premium * 0.18)
  const totalPremium = premium + gstAmount

  const handleCalculate = () => {
    setCalculated(true)
  }

  const getFactorImpact = (factor: string): { impact: string; color: string; icon: any } => {
    switch (factor) {
      case 'age':
        if (inputs.age < 35) return { impact: 'Low premium', color: 'text-emerald-600', icon: TrendingDown }
        if (inputs.age < 50) return { impact: 'Moderate premium', color: 'text-amber-600', icon: TrendingUp }
        return { impact: 'Higher premium', color: 'text-red-600', icon: TrendingUp }
      case 'smoking':
        return inputs.smoking
          ? { impact: '+30% increase', color: 'text-red-600', icon: TrendingUp }
          : { impact: 'No impact', color: 'text-slate-500', icon: Info }
      case 'preExisting':
        return inputs.preExisting
          ? { impact: '+40% increase', color: 'text-red-600', icon: TrendingUp }
          : { impact: 'No impact', color: 'text-slate-500', icon: Info }
      case 'location':
        if (inputs.location === 'metro') return { impact: '+20% increase', color: 'text-amber-600', icon: TrendingUp }
        if (inputs.location === 'tier3') return { impact: '-20% discount', color: 'text-emerald-600', icon: TrendingDown }
        return { impact: 'Standard rate', color: 'text-slate-500', icon: Info }
      default:
        return { impact: 'Standard', color: 'text-slate-500', icon: Info }
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <span className="section-label">Estimate Your Premium</span>
        <h2 className="text-xl font-black text-slate-900 mt-1">🧮 Premium Calculator</h2>
        <p className="text-slate-500 mt-0.5 text-xs">
          Get an estimated premium based on your profile and coverage needs
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Input Section */}
        <div className="space-y-3">
          {/* Age */}
          <div className="bg-white border-2 border-slate-200 rounded-xl p-3">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              Age
            </label>
            <input
              type="range"
              min="18"
              max="75"
              value={inputs.age}
              onChange={(e) => setInputs({ ...inputs, age: parseInt(e.target.value) })}
              className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between items-center mt-1">
              <span className="text-2xl font-black text-blue-600">{inputs.age} years</span>
              <span className={`text-xs font-semibold ${getFactorImpact('age').color}`}>
                {getFactorImpact('age').impact}
              </span>
            </div>
          </div>

          {/* Gender */}
          <div className="bg-white border-2 border-slate-200 rounded-xl p-3">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
              <Users className="w-4 h-4 text-purple-500" />
              Gender
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['male', 'female', 'other'] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setInputs({ ...inputs, gender: g })}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                    inputs.gender === g
                      ? 'bg-purple-500 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Sum Insured */}
          <div className="bg-white border-2 border-slate-200 rounded-xl p-3">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              Sum Insured
            </label>
            <select
              value={inputs.sumInsured}
              onChange={(e) => setInputs({ ...inputs, sumInsured: parseInt(e.target.value) })}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value={300000}>₹3 Lakh</option>
              <option value={500000}>₹5 Lakh</option>
              <option value={1000000}>₹10 Lakh</option>
              <option value={1500000}>₹15 Lakh</option>
              <option value={2000000}>₹20 Lakh</option>
              <option value={2500000}>₹25 Lakh</option>
              <option value={5000000}>₹50 Lakh</option>
            </select>
          </div>

          {/* Location */}
          <div className="bg-white border-2 border-slate-200 rounded-xl p-3">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
              <MapPin className="w-4 h-4 text-orange-500" />
              Location
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'metro', label: 'Metro City' },
                { value: 'tier1', label: 'Tier 1' },
                { value: 'tier2', label: 'Tier 2' },
                { value: 'tier3', label: 'Tier 3' },
              ].map((loc) => (
                <button
                  key={loc.value}
                  onClick={() => setInputs({ ...inputs, location: loc.value as any })}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                    inputs.location === loc.value
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {loc.label}
                </button>
              ))}
            </div>
            <span className={`text-xs font-semibold mt-1 block ${getFactorImpact('location').color}`}>
              {getFactorImpact('location').impact}
            </span>
          </div>

          {/* Family Size */}
          <div className="bg-white border-2 border-slate-200 rounded-xl p-3">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
              <Users className="w-4 h-4 text-cyan-500" />
              Family Members
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setInputs({ ...inputs, familySize: Math.max(1, inputs.familySize - 1) })}
                className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold text-slate-700"
              >
                -
              </button>
              <span className="flex-1 text-center text-2xl font-black text-cyan-600">{inputs.familySize}</span>
              <button
                onClick={() => setInputs({ ...inputs, familySize: Math.min(6, inputs.familySize + 1) })}
                className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold text-slate-700"
              >
                +
              </button>
            </div>
          </div>

          {/* Health Factors */}
          <div className="bg-white border-2 border-slate-200 rounded-xl p-3 space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <Heart className="w-4 h-4 text-red-500" />
              Health Factors
            </label>
            
            <label className="flex items-center justify-between p-2 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-red-500" />
                <span className="text-xs font-semibold text-slate-700">Pre-existing Conditions</span>
              </div>
              <input
                type="checkbox"
                checked={inputs.preExisting}
                onChange={(e) => setInputs({ ...inputs, preExisting: e.target.checked })}
                className="w-4 h-4 accent-red-500"
              />
            </label>
            {inputs.preExisting && (
              <span className={`text-xs font-semibold block pl-2 ${getFactorImpact('preExisting').color}`}>
                {getFactorImpact('preExisting').impact}
              </span>
            )}

            <label className="flex items-center justify-between p-2 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100">
              <div className="flex items-center gap-2">
                <Cigarette className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-semibold text-slate-700">Smoking/Tobacco Use</span>
              </div>
              <input
                type="checkbox"
                checked={inputs.smoking}
                onChange={(e) => setInputs({ ...inputs, smoking: e.target.checked })}
                className="w-4 h-4 accent-amber-500"
              />
            </label>
            {inputs.smoking && (
              <span className={`text-xs font-semibold block pl-2 ${getFactorImpact('smoking').color}`}>
                {getFactorImpact('smoking').impact}
              </span>
            )}
          </div>

          {/* Policy Tenure */}
          <div className="bg-white border-2 border-slate-200 rounded-xl p-3">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
              <Calendar className="w-4 h-4 text-indigo-500" />
              Policy Tenure
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((t) => (
                <button
                  key={t}
                  onClick={() => setInputs({ ...inputs, tenure: t })}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                    inputs.tenure === t
                      ? 'bg-indigo-500 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {t} Year{t > 1 ? 's' : ''}
                  {t > 1 && <div className="text-xs text-emerald-300">Save {(t - 1) * 5}%</div>}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleCalculate}
            className="w-full bg-gradient-to-r from-violet-600 to-blue-600 text-white font-bold py-3 rounded-xl shadow-lg hover:scale-105 transition-transform flex items-center justify-center gap-2"
          >
            <Calculator className="w-5 h-5" />
            Calculate Premium
          </button>
        </div>

        {/* Results Section */}
        <div className="space-y-3">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: calculated ? 1 : 0.5, scale: calculated ? 1 : 0.95 }}
            className="bg-gradient-to-br from-violet-50 to-blue-50 border-2 border-violet-200 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-violet-600" />
              </div>
              <h3 className="font-black text-violet-800">Estimated Premium</h3>
            </div>

            <div className="space-y-3">
              <div className="bg-white/60 rounded-lg p-3">
                <p className="text-xs text-slate-600 mb-1">Base Premium</p>
                <p className="text-3xl font-black text-slate-900">₹{premium.toLocaleString('en-IN')}</p>
                <p className="text-xs text-slate-500 mt-1">₹{monthlyPremium.toLocaleString('en-IN')}/month</p>
              </div>

              <div className="bg-white/60 rounded-lg p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Base Premium</span>
                  <span className="font-bold text-slate-900">₹{premium.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">GST (18%)</span>
                  <span className="font-bold text-slate-900">₹{gstAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between">
                  <span className="font-bold text-slate-700">Total Premium</span>
                  <span className="font-black text-violet-600 text-lg">₹{totalPremium.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Premium Factors */}
          <div className="bg-white border-2 border-slate-200 rounded-xl p-4">
            <h3 className="font-bold text-slate-800 text-sm mb-3">💡 Premium Factors</h3>
            <div className="space-y-2">
              {[
                { label: 'Age', value: `${inputs.age} years`, ...getFactorImpact('age') },
                { label: 'Sum Insured', value: `₹${(inputs.sumInsured / 100000).toFixed(0)}L`, impact: 'Base factor', color: 'text-slate-600', icon: Info },
                { label: 'Family Size', value: `${inputs.familySize} member${inputs.familySize > 1 ? 's' : ''}`, impact: inputs.familySize > 1 ? `+${(inputs.familySize - 1) * 50}%` : 'Individual', color: inputs.familySize > 1 ? 'text-amber-600' : 'text-slate-600', icon: Info },
                { label: 'Location', value: inputs.location.charAt(0).toUpperCase() + inputs.location.slice(1), ...getFactorImpact('location') },
              ].map((factor, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-xs font-bold text-slate-700">{factor.label}</p>
                    <p className="text-xs text-slate-500">{factor.value}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <factor.icon className={`w-3.5 h-3.5 ${factor.color}`} />
                    <span className={`text-xs font-semibold ${factor.color}`}>{factor.impact}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-3">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-800 mb-1">Disclaimer</p>
                <p className="text-xs text-amber-700">
                  This is an estimated premium based on typical market rates. Actual premium may vary based on insurer, 
                  medical tests, specific policy features, and underwriting decisions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
