import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const subscribe = React.useCallback((onStoreChange: () => void) => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    mql.addEventListener("change", onStoreChange)
    return () => mql.removeEventListener("change", onStoreChange)
  }, [])

  const getSnapshot = React.useCallback(() => {
    return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`).matches
  }, [])

  const getServerSnapshot = React.useCallback(() => {
    return false
  }, [])

  const value = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  // We still use a small useEffect to update a state just to trigger the "mobile" class if needed early, 
  // but wait, useSyncExternalStore handles it.
  // The reason I used undefined before was to avoid hydration mismatches.
  // useSyncExternalStore handles hydration mismatches by returning getServerSnapshot during hydration 
  // and then getSnapshot on the first client render.

  return value
}
