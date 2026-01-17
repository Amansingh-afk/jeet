import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Brain, Target, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface LandingProps {
  backgroundImage?: string
}

export function Landing({ backgroundImage = '/images/sunflowers.png' }: LandingProps) {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Full-width background image */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />
      </div>

      {/* Glass TopNav */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
        <nav className="mx-auto max-w-5xl h-14 rounded-2xl glass">
          <div className="h-full px-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-yellow-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">J</span>
              </div>
              <span className="text-xl font-bold text-white">Jeet</span>
            </Link>

            <Button asChild variant="secondary" size="sm">
              <Link to="/dashboard">Sign In</Link>
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-4 pt-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Animated badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 glass rounded-full">
              <Sparkles className="h-4 w-4 text-yellow-400" />
              <span className="text-white/90 text-sm font-medium">
                SSC Exam Prep - The Smart Way
              </span>
            </div>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 drop-shadow-[0_2px_4px_rgba(255,255,255,0.5)] dark:drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
          >
            Learn Smarter.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-yellow-500">
              Score Higher
            </span>
            , Crack SSC
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-800 dark:text-white/90 mb-10 max-w-2xl mx-auto drop-shadow-[0_2px_4px_rgba(255,255,255,0.5)] dark:drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
          >
            No boring lectures. No x-y bakchodi. Just smart tricks, visuals & daily practice.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button asChild size="lg" className="group bg-yellow-500 hover:bg-yellow-600 text-black">
              <Link to="/dashboard">
                Start Free Practice
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>

            <Button asChild variant="secondary" size="lg" className="glass border-white/20 text-white bg-white/20 hover:bg-white/10">
              <Link to="/dashboard">
                Explore Topics
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why Jeet?
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              Built by toppers, for aspirants. Every trick is battle-tested in real exams.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Brain,
                title: 'Pattern Recognition',
                description: 'AI matches your question to 500+ proven patterns with tested shortcuts.',
              },
              {
                icon: Zap,
                title: 'Speed Tricks',
                description: 'Learn tricks that help you solve in 30 seconds what others solve in 2 minutes.',
              },
              {
                icon: Target,
                title: 'Hinglish Explanations',
                description: 'Natural explanations in Hinglish - the way toppers actually think and solve.',
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass rounded-2xl p-6"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-white/70">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <div className="glass-strong rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Ready to crack SSC with tricks?
            </h2>
            <p className="text-white/70 mb-8">
              Join thousands of aspirants learning the smart way.
            </p>
            <Button asChild size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black">
              <Link to="/app">
                Ask Your First Question
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-yellow-500 flex items-center justify-center">
              <span className="text-white font-bold">J</span>
            </div>
            <span className="text-white font-semibold">Jeet</span>
          </div>
          <p className="text-white/50 text-sm">
            Made with tricks in mind. SSC 2025.
          </p>
        </div>
      </footer>
    </div>
  )
}
