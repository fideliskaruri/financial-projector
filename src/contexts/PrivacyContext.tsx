import { createContext, useContext } from "react"

interface PrivacyContextValue {
  balanceHidden: boolean
}

export const PrivacyContext = createContext<PrivacyContextValue>({ balanceHidden: false })

export const usePrivacy = () => useContext(PrivacyContext)
