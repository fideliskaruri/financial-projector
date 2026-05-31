import { useEffect, useState } from "react"

export function useLocalStorage<T>(key: string, defaultValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key)
      if (!stored) {
        return defaultValue
      }

      const parsed = JSON.parse(stored) as T | null | undefined
      return parsed ?? defaultValue
    } catch {
      return defaultValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // localStorage full or unavailable
    }
  }, [key, value])

  return [value, setValue]
}
