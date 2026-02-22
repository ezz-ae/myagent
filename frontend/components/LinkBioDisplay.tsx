"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Globe, Mail, ShoppingBag, Zap, ExternalLink } from "lucide-react"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"

interface Link {
  id: string
  title: string
  description: string
  href: string
  icon: string
  color: string
  requires_auth?: boolean
}

interface LinkBioDisplayProps {
  sessionId: string
  profile?: {
    name: string
    bio: string
    image?: string
  }
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 350,
      damping: 25,
    },
  },
}

const iconMap: Record<string, React.ReactNode> = {
  Globe: <Globe className="w-5 h-5" />,
  Mail: <Mail className="w-5 h-5" />,
  ShoppingBag: <ShoppingBag className="w-5 h-5" />,
  Zap: <Zap className="w-5 h-5" />,
}

export default function LinkBioDisplay({ sessionId, profile }: LinkBioDisplayProps) {
  const [links, setLinks] = useState<Link[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLinks()
  }, [sessionId])

  const loadLinks = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}/v1/sessions/${sessionId}/links`)
      if (res.ok) {
        const data = await res.json()
        setLinks(data.links || [])
      }
    } catch (err) {
      console.error("Error loading links:", err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <p className="text-white/25">Loading…</p>
      </div>
    )
  }

  return (
    <main className="relative min-h-screen px-6 py-10 flex flex-col overflow-hidden bg-[#0a0a0a]">
      {/* Animated Background Orbs */}
      <motion.div
        className="fixed z-0 w-[500px] h-[500px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(255, 255, 255, 0.03) 0%, transparent 70%)",
          filter: "blur(60px)",
          top: "-10%",
          left: "-10%",
        }}
        animate={{
          x: [0, 100, 50, 0],
          y: [0, 50, 100, 0],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{
          duration: 20,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="fixed z-0 w-[600px] h-[600px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(255, 255, 255, 0.02) 0%, transparent 70%)",
          filter: "blur(80px)",
          top: "30%",
          right: "-20%",
        }}
        animate={{
          x: [0, -80, -40, 0],
          y: [0, 80, -40, 0],
          scale: [1, 0.85, 1.15, 1],
        }}
        transition={{
          duration: 25,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      {/* Content */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative z-10 mx-auto max-w-[400px] w-full flex flex-col flex-1 justify-between"
      >
        {/* Profile */}
        {profile && (
          <motion.div variants={itemVariants} className="pt-2 text-center">
            {profile.image && (
              <img
                src={profile.image}
                alt={profile.name}
                className="w-20 h-20 rounded-full border border-white/20 mx-auto mb-3"
              />
            )}
            <h1 className="text-2xl font-bold text-white/90">{profile.name}</h1>
            <p className="text-sm text-white/40 mt-1">{profile.bio}</p>
          </motion.div>
        )}

        {/* Links */}
        <motion.div className="space-y-3 py-8" variants={containerVariants}>
          {links.length === 0 ? (
            <motion.div
              variants={itemVariants}
              className="text-center py-8 text-white/25"
            >
              No links yet
            </motion.div>
          ) : (
            links.map((link) => (
              <motion.a
                key={link.id}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`block p-4 rounded-lg border border-white/10 hover:border-white/20 transition-all group bg-white/[0.02] hover:bg-white/[0.05]`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-white/85 group-hover:text-white transition-colors flex items-center gap-2">
                      {iconMap[link.icon] || iconMap["Globe"]}
                      {link.title}
                    </h3>
                    <p className="text-xs text-white/40 mt-1">{link.description}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-white/25 group-hover:text-white/50 transition-colors shrink-0 ml-2" />
                </div>
              </motion.a>
            ))
          )}
        </motion.div>

        {/* Footer */}
        <motion.div variants={itemVariants} className="pb-2 text-center text-xs text-white/20">
          <p>Powered by LocalAgent</p>
        </motion.div>
      </motion.div>
    </main>
  )
}
