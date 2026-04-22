'use client'

import { useState } from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import {
  Sparkles, FileText, BarChart2, ShieldOff, PlayCircle,
  ArrowRight, Zap, GitCompare, Shield, Brain, TrendingUp,
  CheckCircle, Clock, Lock, ChevronDown
} from 'lucide-react'

interface Props { onGetStarted: (mode: 'summarize' | 'compare') => void }

const features = [
  {
    icon: Sparkles, emoji: '✨',
    title: 'AI Plain-English Summary',
    desc: 'Complex legalese decoded into clear, simple language you can actually understand.',
    color: 'from-violet-500 to-purple-600',
    glow: 'rgba(124,58,237,0.3)',
    tag: 'Most Popular',
  },
  {
    icon: BarChart2, emoji: '🗺️',
    title: 'Visual Coverage Map',
    desc: 'Interactive grid showing every covered item with limits and conditions at a glance.',
    color: 'from-blue-500 to-cyan-500',
    glow: 'rgba(37,99,235,0.3)',
    tag: null,
  },
  {
    icon: ShieldOff, emoji: '🚫',
    title: 'Exclusion Risk Finder',
    desc: 'Discover hidden exclusions ranked by risk level before you need to file a claim.',
    color: 'from-red-500 to-rose-500',
    glow: 'rgba(220,38,38,0.3)',
    tag: 'Critical',
  },
  {
    icon: PlayCircle, emoji: '🤖',
    title: 'Scenario Simulator',
    desc: 'Ask "am I covered if...?" and get an instant AI-powered answer with cost estimates.',
    color: 'from-emerald-500 to-teal-500',
    glow: 'rgba(5,150,105,0.3)',
    tag: null,
  },
  {
    icon: GitCompare, emoji: '⚖️',
    title: 'Policy Comparison',
    desc: 'Compare 2–4 policies side by side. AI picks the winner and explains why.',
    color: 'from-amber-500 to-orange-500',
    glow: 'rgba(217,119,6,0.3)',
    tag: 'New',
  },
  {
    icon: TrendingUp, emoji: '📊',
    title: 'Key Facts Dashboard',
    desc: 'Deductibles, limits, copays — all your critical numbers in one clean view.',
    color: 'from-indigo-500 to-violet-500',
    glow: 'rgba(99,102,241,0.3)',
    tag: null,
  },
]

const stats = [
  { value: '< 30s', label: 'Analysis time', icon: Clock },
  { value: '100%', label: 'Plain English', icon: CheckCircle },
  { value: 'LLaMA 3.3', label: 'AI Model', icon: Brain },
  { value: 'Secure', label: 'No data stored', icon: Lock },
]

const policyTypes = ['🏥 Health Insurance', '🚗 Auto Insurance', '🏠 Home Insurance', '✈️ Travel Insurance', '⚖️ Legal Contracts', '💼 Business Policies']

export default function WelcomeScreen({ onGetStarted }: Props) {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)

  return (
    <div className="min-h-screen relative overflow-x-hidden">

      {/* ── Hero Section ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center hero-bg grid-pattern overflow-hidden">

        {/* Animated orbs */}
        <motion.div animate={{ x:[0,80,0], y:[0,-60,0], scale:[1,1.1,1] }} transition={{ duration:14, repeat:Infinity, ease:'easeInOut' }}
          className="orb w-[500px] h-[500px] bg-violet-600 top-[-150px] left-[-150px]" />
        <motion.div animate={{ x:[0,-60,0], y:[0,80,0], scale:[1,1.15,1] }} transition={{ duration:18, repeat:Infinity, ease:'easeInOut' }}
          className="orb w-[400px] h-[400px] bg-blue-600 top-[10%] right-[-100px]" />
        <motion.div animate={{ x:[0,40,0], y:[0,-40,0] }} transition={{ duration:11, repeat:Infinity, ease:'easeInOut' }}
          className="orb w-[300px] h-[300px] bg-cyan-500 bottom-[5%] left-[15%]" />
        <motion.div animate={{ x:[0,-50,0], y:[0,60,0] }} transition={{ duration:16, repeat:Infinity, ease:'easeInOut' }}
          className="orb w-[350px] h-[350px] bg-fuchsia-600 bottom-[-80px] right-[10%]" />

        {/* Floating icons */}
        {[
          { icon: '🔒', x: '8%',  y: '20%', delay: 0 },
          { icon: '📋', x: '88%', y: '15%', delay: 0.5 },
          { icon: '⚡', x: '5%',  y: '65%', delay: 1 },
          { icon: '🛡️', x: '92%', y: '60%', delay: 1.5 },
          { icon: '💡', x: '15%', y: '85%', delay: 0.8 },
          { icon: '🎯', x: '80%', y: '80%', delay: 1.2 },
        ].map((p, i) => (
          <motion.div key={i}
            className="fixed text-2xl pointer-events-none select-none opacity-20"
            style={{ left: p.x, top: p.y }}
            animate={{ y: [0, -16, 0], opacity: [0.15, 0.35, 0.15], rotate: [0, 8, 0] }}
            transition={{ duration: 5 + i * 0.8, repeat: Infinity, ease: 'easeInOut', delay: p.delay }}
          >{p.icon}</motion.div>
        ))}

        <div className="relative z-10 max-w-5xl mx-auto px-4 py-20 flex flex-col items-center text-center">

          {/* Status badge */}
          <motion.div initial={{ opacity:0, y:-16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
            className="flex items-center gap-2.5 glass-dark text-white/85 text-sm font-medium px-5 py-2.5 rounded-full mb-10 border border-white/10"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            AI Policy Intelligence Platform
            <span className="w-px h-4 bg-white/20" />
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-white/60">Powered by LLaMA 3.3</span>
          </motion.div>

          {/* Logo mark */}
          <motion.div initial={{ opacity:0, scale:0.7 }} animate={{ opacity:1, scale:1 }}
            transition={{ delay:0.15, type:'spring', stiffness:180, damping:16 }}
            className="mb-8"
          >
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-500 via-purple-500 to-blue-600 glow-violet" />
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-500 via-purple-500 to-blue-600 animate-pulse opacity-50" />
              <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-violet-500 via-purple-500 to-blue-600 flex items-center justify-center shadow-2xl">
                <FileText className="w-12 h-12 text-white" />
              </div>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1 initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
            className="text-6xl sm:text-8xl font-black text-white leading-[0.95] tracking-tight mb-6"
          >
            Policy<span className="gradient-text">Lens</span>
          </motion.h1>

          <motion.p initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.28 }}
            className="text-2xl sm:text-3xl text-white/75 font-light max-w-2xl mb-4 leading-relaxed"
          >
            Insurance policies are written by lawyers.
          </motion.p>
          <motion.p initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.34 }}
            className="text-xl text-white/50 max-w-xl mb-14 leading-relaxed"
          >
            We translate them into plain English — so you know exactly what you're paying for.
          </motion.p>

          {/* CTA buttons */}
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.42 }}
            className="flex flex-col sm:flex-row gap-4 mb-16"
          >
            <motion.button
              whileHover={{ scale:1.04, y:-2 }} whileTap={{ scale:0.97 }}
              onClick={() => onGetStarted('summarize')}
              className="btn-ripple group flex items-center gap-3 bg-gradient-to-r from-violet-600 to-blue-600 text-white font-bold text-lg px-9 py-4.5 rounded-2xl shadow-2xl glow-violet transition-all"
              style={{ paddingTop: '1.1rem', paddingBottom: '1.1rem' }}
            >
              <Sparkles className="w-5 h-5" />
              Analyze a Policy
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
            </motion.button>
            <motion.button
              whileHover={{ scale:1.04, y:-2 }} whileTap={{ scale:0.97 }}
              onClick={() => onGetStarted('compare')}
              className="btn-ripple group flex items-center gap-3 glass-dark hover:bg-white/15 text-white font-bold text-lg px-9 rounded-2xl transition-all border border-white/15"
              style={{ paddingTop: '1.1rem', paddingBottom: '1.1rem' }}
            >
              <GitCompare className="w-5 h-5" />
              Compare Policies
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
            </motion.button>
          </motion.div>

          {/* Stats row */}
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.52 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-2xl mb-16"
          >
            {stats.map((s, i) => (
              <motion.div key={i} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.55+i*0.07 }}
                className="glass-dark rounded-2xl p-4 text-center border border-white/10"
              >
                <s.icon className="w-4 h-4 text-violet-400 mx-auto mb-2" />
                <div className="text-xl font-black text-white">{s.value}</div>
                <div className="text-xs text-white/40 mt-0.5">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Policy type tags */}
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.7 }}
            className="flex flex-wrap justify-center gap-2"
          >
            {policyTypes.map((t, i) => (
              <motion.span key={i} initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.72+i*0.05 }}
                className="text-sm glass-dark text-white/60 border border-white/10 px-3 py-1.5 rounded-full font-medium hover:text-white/90 hover:border-white/25 transition-colors cursor-default"
              >{t}</motion.span>
            ))}
          </motion.div>

          {/* Scroll cue */}
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.2 }}
            className="mt-16"
          >
            <motion.div animate={{ y:[0,8,0] }} transition={{ duration:2, repeat:Infinity }}
              className="flex flex-col items-center gap-1 text-white/25 cursor-pointer hover:text-white/50 transition-colors"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior:'smooth' })}
            >
              <span className="text-xs font-medium tracking-widest uppercase">Explore Features</span>
              <ChevronDown className="w-5 h-5" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section id="features" className="bg-mesh py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
            className="text-center mb-16"
          >
            <span className="section-label">What PolicyLens Does</span>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mt-3 mb-4">
              Everything you need to <span className="gradient-text">understand any policy</span>
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">Six powerful tools. One platform. No legal degree required.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div key={i}
                initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }}
                viewport={{ once:true }} transition={{ delay:i*0.08 }}
                whileHover={{ y:-6, scale:1.02 }}
                onHoverStart={() => setHoveredFeature(i)}
                onHoverEnd={() => setHoveredFeature(null)}
                className="relative glass-card rounded-3xl p-6 cursor-default overflow-hidden group"
                style={{ boxShadow: hoveredFeature === i ? `0 20px 48px ${f.glow}` : undefined, transition: 'box-shadow 0.3s ease' }}
              >
                {f.tag && (
                  <span className={`absolute top-4 right-4 text-xs font-bold px-2.5 py-1 rounded-full
                    ${f.tag === 'Critical' ? 'bg-red-100 text-red-600' : f.tag === 'New' ? 'bg-emerald-100 text-emerald-600' : 'bg-violet-100 text-violet-600'}`}>
                    {f.tag}
                  </span>
                )}
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl mb-3">{f.emoji}</div>
                <h3 className="font-bold text-slate-900 text-base mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
            className="text-center mb-16"
          >
            <span className="section-label">How It Works</span>
            <h2 className="text-4xl font-black text-slate-900 mt-3">Three steps to clarity</h2>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { step:'01', icon:'📤', title:'Upload Your Policy', desc:'Drop any PDF or text file. We support health, auto, home, travel, and legal documents.' },
              { step:'02', icon:'🧠', title:'AI Analyzes It', desc:'LLaMA 3.3 reads every clause, identifies coverage, exclusions, and key terms in seconds.' },
              { step:'03', icon:'✅', title:'Understand Everything', desc:'Get a plain-English summary, visual maps, risk alerts, and ask any question about your coverage.' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
                viewport={{ once:true }} transition={{ delay:i*0.12 }}
                className="text-center"
              >
                <div className="relative inline-block mb-6">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-4xl shadow-inner">
                    {s.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center text-white text-xs font-black shadow-lg">
                    {s.step}
                  </div>
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">{s.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Problem / Solution ── */}
      <section className="py-24 px-4 bg-mesh">
        <div className="max-w-4xl mx-auto">
          <div className="grid sm:grid-cols-2 gap-8">
            <motion.div initial={{ opacity:0, x:-20 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }}
              className="bg-red-50 border-2 border-red-100 rounded-3xl p-8"
            >
              <div className="text-4xl mb-4">😤</div>
              <h3 className="text-xl font-black text-red-900 mb-4">The Problem</h3>
              <ul className="space-y-3">
                {[
                  'Policies average 40+ pages of dense legal text',
                  'Key exclusions are buried in fine print',
                  'Most people discover gaps only when claims are denied',
                  'Comparing multiple policies is nearly impossible',
                ].map((p, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-red-800">
                    <span className="text-red-400 mt-0.5 flex-shrink-0">✗</span>{p}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div initial={{ opacity:0, x:20 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }}
              className="bg-emerald-50 border-2 border-emerald-100 rounded-3xl p-8"
            >
              <div className="text-4xl mb-4">✅</div>
              <h3 className="text-xl font-black text-emerald-900 mb-4">The Solution</h3>
              <ul className="space-y-3">
                {[
                  'AI summarizes any policy in under 30 seconds',
                  'Exclusions ranked by risk — high, medium, low',
                  'Ask any scenario question and get a direct answer',
                  'Side-by-side comparison with a clear winner',
                ].map((p, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-emerald-800">
                    <span className="text-emerald-500 mt-0.5 flex-shrink-0">✓</span>{p}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-24 px-4 hero-bg grid-pattern relative overflow-hidden">
        <motion.div animate={{ x:[0,60,0], y:[0,-40,0] }} transition={{ duration:12, repeat:Infinity, ease:'easeInOut' }}
          className="orb w-80 h-80 bg-violet-600 top-[-80px] left-[-80px]" />
        <motion.div animate={{ x:[0,-40,0], y:[0,50,0] }} transition={{ duration:15, repeat:Infinity, ease:'easeInOut' }}
          className="orb w-64 h-64 bg-blue-600 bottom-[-60px] right-[-60px]" />

        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}>
            <div className="text-5xl mb-6">🔍</div>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
              Ready to understand<br />your policy?
            </h2>
            <p className="text-white/60 text-lg mb-10">Upload any document and get clarity in seconds.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:0.96 }}
                onClick={() => onGetStarted('summarize')}
                className="btn-ripple flex items-center justify-center gap-3 bg-white text-violet-700 font-bold text-lg px-8 py-4 rounded-2xl shadow-2xl hover:shadow-white/20 transition-all"
              >
                <Sparkles className="w-5 h-5" />
                Analyze a Policy
              </motion.button>
              <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:0.96 }}
                onClick={() => onGetStarted('compare')}
                className="btn-ripple flex items-center justify-center gap-3 glass-dark text-white font-bold text-lg px-8 py-4 rounded-2xl border border-white/15 transition-all"
              >
                <GitCompare className="w-5 h-5" />
                Compare Policies
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  )
}
