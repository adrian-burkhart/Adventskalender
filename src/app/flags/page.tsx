"use client"

import Button from "@/components/button"
import FeatureFlagItem from "@/components/feature-flag-item"
import { FeatureFlag, useFeatureFlagMapResetter } from "@/lib/feature-flags"

export default function Flags() {
  const resetFeatureFlagMap = useFeatureFlagMapResetter()

  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="mb-6 text-3xl">{"Feature flags"}</h1>
      {Object.values(FeatureFlag).map((flag) => {
        return <FeatureFlagItem key={flag} flag={flag as FeatureFlag} />
      })}
      <Button className="mt-6" onClick={resetFeatureFlagMap}>
        {"Reset flags"}
      </Button>
    </div>
  )
}
