import Image from "next/image"
import star from "../../public/images/star.webp"
import { LOADING_TEXT } from "@/lib/texts"

/** Centered in the page: the menu's star, turning slowly. */
export default function Loading() {
  return (
    <div
      role="status"
      className="flex min-h-[40vh] w-full flex-col items-center justify-center gap-4"
    >
      <Image
        src={star}
        width={48}
        height={48}
        alt=""
        className="animate-[spin_3s_linear_infinite]"
      />
      <div>{LOADING_TEXT}</div>
    </div>
  )
}
