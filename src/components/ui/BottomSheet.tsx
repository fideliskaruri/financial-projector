import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { useEffect } from "react"

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

export default function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  useEffect(() => {
    if (!open) {
      return
    }

    const originalOverflow = document.body.style.overflow
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [onClose, open])

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label="Close modal"
            className="fixed inset-0 z-40 bg-background/70 backdrop-blur-sm sm:bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "bottom-sheet-title" : undefined}
            className="fixed inset-x-0 bottom-0 z-50 flex max-h-[90dvh] w-full flex-col rounded-t-3xl border bg-card p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-2xl sm:inset-x-4 sm:top-1/2 sm:bottom-auto sm:mx-auto sm:max-h-[calc(100dvh-2rem)] sm:max-w-md sm:-translate-y-1/2 sm:rounded-3xl"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.15 }}
          >
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-muted sm:hidden" />
            <div className="mb-4 flex items-center justify-between gap-4">
              {title ? (
                <h3 id="bottom-sheet-title" className="text-lg font-semibold">
                  {title}
                </h3>
              ) : (
                <span />
              )}
              <Button type="button" variant="ghost" size="icon" className="h-11 w-11 shrink-0" onClick={onClose} aria-label="Close">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  )
}
