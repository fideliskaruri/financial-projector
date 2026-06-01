import { onAuthStateChanged, signInWithPopup, signOut, type User } from "firebase/auth"
import { useEffect, useRef, useState } from "react"
import { auth, githubProvider } from "@/lib/firebase"

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

    const unsubscribe = onAuthStateChanged(
      auth,
      (nextUser) => {
        setUser(nextUser)
        setLoading(false)
        loadingRef.current = false
      },
      () => {
        // Auth service unavailable — let user through
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

  const signInWithGitHub = () => signInWithPopup(auth, githubProvider)
  const logout = () => signOut(auth)

  return { user, loading, authError, signInWithGitHub, logout }
}
