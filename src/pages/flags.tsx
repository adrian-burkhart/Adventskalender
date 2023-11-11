import Button from "@/components/button"
import FeatureFlagItem from "@/components/feature-flag-item"
import { FeatureFlag, useFeatureFlagMapResetter } from "@/lib/feature-flags"
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs"
import { GetServerSidePropsContext } from "next"

export default function Flags() {
  const resetFeatureFlagMap = useFeatureFlagMapResetter()

  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="mb-6 text-3xl">{"Feature flags"}</h1>
      {Object.values(FeatureFlag).map((flag) => {
        return <FeatureFlagItem key={flag} flag={flag as FeatureFlag} />
      })}
      <Button onClick={resetFeatureFlagMap}>{"Reset flags"}</Button>
    </div>
  )
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const supabase = createPagesServerClient(ctx)
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session)
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    }

  return {
    props: {
      initialSession: session,
      user: session.user,
    },
  }
}
