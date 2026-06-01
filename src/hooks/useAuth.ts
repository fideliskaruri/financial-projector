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
    const timeout = setTimeout(() => {
      if (loadingRef.current) {
        setAuthError(true)
        setLoading(false)
        loadingRef.current = false
      }
    }, 5000)

    // Handle redirect result (mobile sign-in flow)
    getRedirectResult(auth).catch(() => {
      // Redirect result not available — ignore
    })

    const unsubscribe = onAuthStateChanged(
      auth,
      (nextUser) => {
        setUser(nextUser)
        setLoading(false)
        loadingRef.current = false
      },
      () => {
        setAuthError(true)
        setLoading(false)
        loadingRef.current = false
      },
    )

    return () => {
      unsubscribe()
      clearTimeout(timeout)
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
