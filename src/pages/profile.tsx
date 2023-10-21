import { createPagesServerClient } from "@supabase/auth-helpers-nextjs"
import { GetServerSidePropsContext } from "next"

interface User {
  id: string
  email: string
  phone: string
}

export default function Profile({ user }: { user: User }) {
  return <div>Hello {user.email}</div>
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const supabase = createPagesServerClient(ctx)
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session)
    return {
      redirect: {
        destination: "/",
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
