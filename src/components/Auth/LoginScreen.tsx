import { Button } from "@/components/ui/button"
import { LoaderCircle } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

interface LoginScreenProps {
  loading?: boolean
  onSignIn: () => Promise<unknown>
}

function GitHubMark(props: React.ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.38 7.86 10.9.58.1.79-.25.79-.56v-2.18c-3.2.69-3.88-1.36-3.88-1.36-.52-1.31-1.27-1.66-1.27-1.66-1.04-.71.08-.69.08-.69 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.24 3.34.95.1-.74.4-1.24.72-1.53-2.55-.29-5.24-1.27-5.24-5.65 0-1.25.45-2.27 1.17-3.07-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.14 1.17a10.9 10.9 0 0 1 5.72 0c2.18-1.48 3.14-1.17 3.14-1.17.62 1.58.23 2.75.11 3.04.73.8 1.17 1.82 1.17 3.07 0 4.39-2.69 5.36-5.25 5.64.41.35.78 1.04.78 2.1v3.11c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  )
}

export default function LoginScreen({ loading = false, onSignIn }: LoginScreenProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isBusy = loading || isSubmitting

  const handleSignIn = async () => {
    if (isBusy) {
      return
    }

    setIsSubmitting(true)

    try {
      await onSignIn()
    } catch {
      toast.error("Unable to sign in with GitHub")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4 py-6 text-foreground">
      <div className="w-full max-w-md rounded-3xl border border-border/70 bg-card/95 p-8 text-center shadow-2xl shadow-black/20 backdrop-blur">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          {isBusy ? <LoaderCircle className="h-6 w-6 animate-spin" /> : <GitHubMark className="h-6 w-6" />}
        </div>
        <div className="mt-6 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">FinManager</p>
          <h1 className="text-3xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground">Track spending. Project wealth.</p>
        </div>
        <Button
          type="button"
          className="mt-8 h-11 w-full bg-zinc-950 text-white hover:bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200"
          onClick={() => void handleSignIn()}
          disabled={isBusy}
        >
          {isBusy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <GitHubMark className="h-4 w-4" />}
          {isBusy ? "Checking account" : "Continue with GitHub"}
        </Button>
      </div>
    </div>
  )
}
