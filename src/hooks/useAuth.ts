import { onAuthStateChanged, signInWithPopup, signOut, type User } from "firebase/auth"
import { useEffect, useState } from "react"
import { auth, githubProvider } from "@/lib/firebase"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signInWithGitHub = () => signInWithPopup(auth, githubProvider)
  const logout = () => signOut(auth)

  return { user, loading, signInWithGitHub, logout }
}
