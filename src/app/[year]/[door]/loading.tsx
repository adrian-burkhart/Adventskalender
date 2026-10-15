import Layout from "@/components/layout"
import Loading from "@/components/loading"

// Shows right away while the door page loads, so a tap is answered at once.
export default function DoorLoading() {
  return (
    <Layout>
      <Loading />
    </Layout>
  )
}
