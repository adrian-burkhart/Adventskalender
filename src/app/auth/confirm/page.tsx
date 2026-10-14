import Image from "next/image"
import Link from "next/link"
import Footer from "@/components/footer"
import { AuthText } from "@/components/auth-form"
import { authErrorMessage } from "@/lib/auth/errors"
import { parseEmailOtpType } from "@/lib/auth/redirect"
import welcomeImage from "../../../../public/images/welcome.webp"
import { confirmLink } from "./actions"
import ConfirmForm from "./confirm-form"

type SearchParams = Record<string, string | string[] | undefined>

function param(params: SearchParams, name: string): string {
  const value = params[name]
  return typeof value === "string" ? value : ""
}

function errorText(code: string): string {
  if (code === "otp_expired") {
    return "Dieser Link ist abgelaufen oder wurde schon benutzt. Fordere einfach einen neuen an."
  }
  if (code === "missing") {
    return "Dieser Link ist unvollständig. Fordere bitte einen neuen an."
  }
  return authErrorMessage({ code })
}

export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const fehler = param(params, "fehler")
  const tokenHash = param(params, "token_hash")
  const type = parseEmailOtpType(param(params, "type"))
  const code = param(params, "code")
  const next = param(params, "next")

  const isRecovery = type === "recovery" || next === "/passwort-neu"
  const hasLink = (tokenHash && type) || code

  return (
    <>
      <div className="flex flex-col items-center pt-4">
        {fehler || !hasLink ? (
          <div className="flex w-[250px] flex-col items-center">
            <AuthText tone="error">{errorText(fehler || "missing")}</AuthText>
            <Link
              href="/login"
              className="text-sm text-candle/85 underline underline-offset-4 hover:text-white"
            >
              ZUM LOGIN
            </Link>
          </div>
        ) : (
          <ConfirmForm
            action={confirmLink}
            submitLabel={isRecovery ? "Weiter" : "Einloggen"}
          >
            <AuthText>
              {isRecovery
                ? "Gleich kannst du dir ein neues Passwort aussuchen."
                : "Fast geschafft! Tippe auf den Knopf, um dich einzuloggen."}
            </AuthText>
            <input type="hidden" name="token_hash" value={tokenHash} />
            <input type="hidden" name="type" value={type ?? ""} />
            <input type="hidden" name="code" value={code} />
            <input type="hidden" name="next" value={next} />
          </ConfirmForm>
        )}
        <Image src={welcomeImage} alt="" className="mt-6" />
      </div>
      <Footer />
    </>
  )
}
