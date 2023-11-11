import {
  createContext,
  Dispatch,
  memo,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react"

import { useEffectOnce } from "./hooks"
import { getValueFromStorage, setValueInStorage } from "./storage"

export enum FeatureFlag {
  ENABLE_TEST_MODE = "ENABLE_TEST_MODE",
}

type FeatureFlagMap = Record<FeatureFlag, boolean>
type PartialFeatureFlagMap = Partial<FeatureFlagMap>

const STORAGE_KEY = "FEATURE_FLAG_MAP"

// effectively a constant
const DEFAULT_FEATURE_FLAG_MAP: FeatureFlagMap = Object.values(
  FeatureFlag,
).reduce(
  (acc, newKey) => ({
    ...acc,
  }),
  {} as FeatureFlagMap,
)

function getFeatureFlagMapFromStorage(): PartialFeatureFlagMap {
  return getValueFromStorage({
    storage: window.localStorage,
    key: STORAGE_KEY,
    defaultValue: {},
  })
}

function getFeatureFlagMapFromStorageWithDefaults(): FeatureFlagMap {
  const map: PartialFeatureFlagMap = getFeatureFlagMapFromStorage()
  const mapWithDefaults = {
    ...DEFAULT_FEATURE_FLAG_MAP,
    ...map,
  }
  return mapWithDefaults
}

function setFeatureFlagMapInStorage(
  updateFn: (oldMap: PartialFeatureFlagMap) => PartialFeatureFlagMap,
) {
  setValueInStorage({
    storage: window.localStorage,
    key: STORAGE_KEY,
    defaultValue: {},
    updateFn,
  })
}

/**
 * Should be only used for test setups.
 */
export function overwriteFeatureFlags(map: PartialFeatureFlagMap) {
  setFeatureFlagMapInStorage((oldMap) => ({
    ...oldMap,
    ...map,
  }))
}

interface FeatureFlagMapContext {
  featureFlagMap: PartialFeatureFlagMap
  setFeatureFlagMap: Dispatch<SetStateAction<PartialFeatureFlagMap>>
}

const featureFlagMapContext = createContext<FeatureFlagMapContext>({
  featureFlagMap: {},
  setFeatureFlagMap: () => {},
})

export function getFeatureFlag(flag: FeatureFlag): boolean {
  return getFeatureFlagMapFromStorageWithDefaults()[flag]!
}

export function useFeatureFlag(flag: FeatureFlag): boolean {
  const { featureFlagMap } = useContext(featureFlagMapContext)
  return !!featureFlagMap[flag]
}

export function useFeatureFlagSetter(
  flag: FeatureFlag,
): (newValue: boolean) => void {
  const { setFeatureFlagMap } = useContext(featureFlagMapContext)
  return useCallback(
    (newValue: boolean) => {
      const updateMap = (map: PartialFeatureFlagMap) => ({
        ...map,
        [flag]: newValue,
      })

      setFeatureFlagMap(updateMap)
      setFeatureFlagMapInStorage(updateMap)
    },
    [flag, setFeatureFlagMap],
  )
}

export function useFeatureFlagMapResetter() {
  const { setFeatureFlagMap } = useContext(featureFlagMapContext)

  return useCallback(() => {
    setFeatureFlagMap(() => DEFAULT_FEATURE_FLAG_MAP)
    setFeatureFlagMapInStorage(() => ({}))
  }, [setFeatureFlagMap])
}

function useFeatureFlagMapInitialization(
  setFeatureFlagMap: Dispatch<SetStateAction<PartialFeatureFlagMap>>,
) {
  useEffectOnce(() => {
    setFeatureFlagMap(getFeatureFlagMapFromStorageWithDefaults())
  })
}

interface FeatureFlagProviderProps {
  children: ReactNode
}

export const FeatureFlagProvider = memo(
  ({ children }: FeatureFlagProviderProps) => {
    const [featureFlagMap, setFeatureFlagMap] = useState<PartialFeatureFlagMap>(
      {},
    )
    const contextValue = useMemo(
      () => ({ featureFlagMap, setFeatureFlagMap }),
      [featureFlagMap, setFeatureFlagMap],
    )

    useFeatureFlagMapInitialization(setFeatureFlagMap)

    return (
      <featureFlagMapContext.Provider value={contextValue}>
        {children}
      </featureFlagMapContext.Provider>
    )
  },
)
