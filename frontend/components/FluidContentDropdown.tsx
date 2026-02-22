"use client"

import * as React from "react"
import { motion, AnimatePresence, MotionConfig } from "framer-motion"
import { cn } from "@/lib/utils"
import { ChevronDown, FileText, Sheet, Code, Map, Share2, LayoutDashboard, Workflow, Grid3x3 } from "lucide-react"

interface ContentType {
  id: string
  label: string
  icon: React.ElementType
  color: string
  description: string
}

const contentTypes: ContentType[] = [
  { id: "all",       label: "All Content", icon: Grid3x3,     color: "#A06CD5", description: "All content types" },
  { id: "word",      label: "Word",        icon: FileText,    color: "#2563EB", description: "Word documents" },
  { id: "excel",     label: "Excel",       icon: Sheet,       color: "#16A34A", description: "Spreadsheets" },
  { id: "html",      label: "HTML",        icon: Code,        color: "#EA580C", description: "Code & Preview" },
  { id: "board",     label: "Board",       icon: LayoutDashboard, color: "#7C3AED", description: "Kanban & boards" },
  { id: "map",       label: "Map",         icon: Map,         color: "#0891B2", description: "Maps & locations" },
  { id: "share",     label: "ShareScreen", icon: Share2,      color: "#DB2777", description: "Screen sharing" },
  { id: "workflow",  label: "Workflow",    icon: Workflow,    color: "#CA8A04", description: "Workflows" },
  { id: "dashboard", label: "Dashboards",  icon: LayoutDashboard, color: "#4F46E5", description: "Saved dashboards" },
]

const IconWrapper = ({
  icon: Icon,
  isHovered,
  color,
}: {
  icon: React.ElementType
  isHovered: boolean
  color: string
}) => (
  <motion.div
    className="w-4 h-4 mr-2 relative flex items-center justify-center"
    initial={false}
    animate={isHovered ? { scale: 1.15 } : { scale: 1 }}
  >
    <Icon className="w-4 h-4" style={isHovered ? { color } : undefined} />
  </motion.div>
)

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren" as const,
      staggerChildren: 0.08,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
}

interface FluidContentDropdownProps {
  onSelect?: (contentType: ContentType) => void
  defaultOpen?: boolean
}

export default function FluidContentDropdown({ onSelect, defaultOpen = false }: FluidContentDropdownProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)
  const [selectedContent, setSelectedContent] = React.useState<ContentType>(contentTypes[0])
  const [hoveredContent, setHoveredContent] = React.useState<string | null>(null)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false)
    }
  }

  const handleSelect = (content: ContentType) => {
    setSelectedContent(content)
    setIsOpen(false)
    onSelect?.(content)
  }

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen])

  return (
    <MotionConfig reducedMotion="user">
      <div
        className="w-full relative"
        style={{ maxWidth: "280px" }}
        ref={dropdownRef}
        onKeyDown={handleKeyDown}
      >
        {/* Trigger button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full px-4 py-2.5 rounded-lg text-sm font-medium",
            "bg-white/5 border border-white/10 text-white/80",
            "hover:bg-white/8 hover:border-white/15 hover:text-white",
            "focus:outline-none focus:ring-2 focus:ring-white/20",
            "transition-all duration-200 ease-in-out",
            "flex items-center justify-between",
            isOpen && "bg-white/10 border-white/20 text-white"
          )}
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <span className="flex items-center gap-2">
            <IconWrapper icon={selectedContent.icon} isHovered={false} color={selectedContent.color} />
            <div className="text-left">
              <div className="font-medium text-white/90">{selectedContent.label}</div>
              <div className="text-xs text-white/40">{selectedContent.description}</div>
            </div>
          </span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center w-5 h-5"
          >
            <ChevronDown className="w-4 h-4 text-white/40" />
          </motion.div>
        </button>

        {/* Dropdown menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{
                opacity: 1,
                y: 0,
                height: "auto",
                transition: {
                  type: "spring",
                  stiffness: 500,
                  damping: 35,
                  mass: 1,
                },
              }}
              exit={{
                opacity: 0,
                y: -8,
                height: 0,
                transition: {
                  type: "spring",
                  stiffness: 500,
                  damping: 35,
                  mass: 1,
                },
              }}
              className="absolute left-0 right-0 top-full mt-2 z-50"
            >
              <motion.div
                className="w-full rounded-xl border border-white/10 bg-[#0a0a0a] shadow-2xl overflow-hidden"
                initial={{ borderRadius: 8 }}
                animate={{
                  borderRadius: 12,
                  transition: { duration: 0.2 },
                }}
                style={{ transformOrigin: "top" }}
              >
                <motion.div
                  className="py-2 relative"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {/* Hover highlight background */}
                  <motion.div
                    layoutId="content-hover-highlight"
                    className="absolute inset-x-1 bg-white/5 rounded-lg"
                    animate={{
                      y:
                        contentTypes.findIndex((c) => (hoveredContent || selectedContent.id) === c.id) * 48 +
                        (contentTypes.findIndex((c) => (hoveredContent || selectedContent.id) === c.id) > 0 ? 12 : 0),
                      height: 48,
                    }}
                    transition={{
                      type: "spring",
                      bounce: 0.15,
                      duration: 0.4,
                    }}
                  />

                  {/* Content type items */}
                  {contentTypes.map((content, idx) => (
                    <React.Fragment key={content.id}>
                      {idx === 1 && (
                        <motion.div
                          className="mx-3 my-2 border-t border-white/[0.05]"
                          variants={itemVariants}
                        />
                      )}
                      <motion.button
                        onClick={() => handleSelect(content)}
                        onHoverStart={() => setHoveredContent(content.id)}
                        onHoverEnd={() => setHoveredContent(null)}
                        className={cn(
                          "relative flex w-full items-center px-4 py-3 text-sm rounded-lg",
                          "transition-colors duration-150",
                          "focus:outline-none focus:bg-white/10",
                          selectedContent.id === content.id
                            ? "text-white/90"
                            : "text-white/60"
                        )}
                        whileTap={{ scale: 0.98 }}
                        variants={itemVariants}
                      >
                        <IconWrapper
                          icon={content.icon}
                          isHovered={hoveredContent === content.id}
                          color={content.color}
                        />
                        <div className="flex-1 text-left">
                          <div className="font-medium">{content.label}</div>
                          <div className="text-xs text-white/40">{content.description}</div>
                        </div>
                      </motion.button>
                    </React.Fragment>
                  ))}
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  )
}
