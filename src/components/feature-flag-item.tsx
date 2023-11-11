import { memo } from "react"

import {
  FeatureFlag,
  useFeatureFlag,
  useFeatureFlagSetter,
} from "../lib/feature-flags"

interface FeatureFlagItemProps {
  flag: FeatureFlag
}

const FeatureFlagItem = memo(({ flag }: FeatureFlagItemProps) => {
  const value = useFeatureFlag(flag)
  const setValue = useFeatureFlagSetter(flag)

  return (
    <div className="mb-2 flex">
      <input
        aria-describedby="feature-flag"
        id={flag}
        type="checkbox"
        name={flag}
        onChange={() => {
          const newValue = !value
          setValue(newValue)
        }}
      />
      <label htmlFor={flag} className="ml-2">
        <div className="capitalize">
          {flag.replace("FEATURE_FLAG", "").replaceAll("_", " ").toLowerCase()}
        </div>
      </label>
    </div>
  )
})

export default FeatureFlagItem
