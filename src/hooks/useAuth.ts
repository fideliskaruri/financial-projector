import { getRedirectResult, onAuthStateChanged, signInWithPopup, signInWithRedirect, signOut, type User } from "firebase/auth"
import { useEffect, useRef, useState } from "react"
import { auth, githubProvider } from "@/lib/firebase"

const isMobile = () => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(false)
  const loadingRef = useRef(true)

  useEffect(() => {
    let cancelled = false

    async function init() {
      try {
        // First check for redirect result (mobile flow returns here after GitHub)
        const redirectResult = await getRedirectResult(auth)
        if (cancelled) return
        if (redirectResult?.user) {
          setUser(redirectResult.user)
          setLoading(false)
          loadingRef.current = false
          return
        }
      } catch {
        // No redirect result — continue with normal auth check
      }

      // Fall through to onAuthStateChanged for session persistence
      if (cancelled || !loadingRef.current) return

      // If still loading after 8s, something is wrong
      const timeout = setTimeout(() => {
        if (loadingRef.current) {
          setAuthError(true)
          setLoading(false)
          loadingRef.current = false
        }
      }, 8000)

      const unsubscribe = onAuthStateChanged(
        auth,
        (nextUser) => {
          if (cancelled) return
          setUser(nextUser)
          setLoading(false)
          loadingRef.current = false
          clearTimeout(timeout)
        },
        () => {
          if (cancelled) return
          setAuthError(true)
          setLoading(false)
          loadingRef.current = false
          clearTimeout(timeout)
        },
      )

      return () => {
        unsubscribe()
        clearTimeout(timeout)
      }
    }

    const cleanupPromise = init()

    return () => {
      cancelled = true
      void cleanupPromise
    }
  }, [])

  const signInWithGitHub = () => {
    if (isMobile()) {
      return signInWithRedirect(auth, githubProvider)
    }
    return signInWithPopup(auth, githubProvider)
  }

  const logout = () => signOut(auth)

  return { user, loading, authError, signInWithGitHub, logout }
}
