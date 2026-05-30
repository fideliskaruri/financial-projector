import type { AllInputs } from "@/engine/types"

export function encodeInputsToUrl(inputs: AllInputs): string {
  return `#inputs=${encodeURIComponent(btoa(JSON.stringify(inputs)))}`
}

export function decodeInputsFromUrl(hash: string): AllInputs | null {
  const trimmedHash = hash.startsWith("#") ? hash.slice(1) : hash
  const encoded = trimmedHash.startsWith("inputs=") ? trimmedHash.slice("inputs=".length) : trimmedHash

  if (!encoded) {
    return null
  }

  try {
    const parsed = JSON.parse(atob(decodeURIComponent(encoded))) as unknown

    if (!parsed || typeof parsed !== "object" || !("params" in parsed)) {
      return null
    }

    return parsed as AllInputs
  } catch {
    return null
  }
}
