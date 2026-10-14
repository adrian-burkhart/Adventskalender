import clsx from "clsx"
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
} from "react"

// The login, sign-up and password forms. Labels and fields are large and
// high-contrast: many players are older.

export function AuthForm({
  children,
  ...rest
}: React.FormHTMLAttributes<HTMLFormElement>) {
  return (
    <form className="flex w-full max-w-[20rem] flex-col" {...rest}>
      {children}
    </form>
  )
}

export function AuthFields({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-4">{children}</div>
}

export function AuthField({
  label,
  id,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { label: string; id: string }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-base text-candle">
        {label}
      </label>
      <input
        id={id}
        name={id}
        className="w-full rounded-lg border border-gold/50 bg-black/30 px-4 py-3 text-base text-white caret-white outline-hidden placeholder:text-white/60 hover:border-gold focus:border-gold focus:ring-2 focus:ring-gold/40"
        {...rest}
      />
    </div>
  )
}

export function AuthSubmit({
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="submit" className="btn mt-6 w-full" {...rest}>
      {children}
    </button>
  )
}

export function AuthLinks({ children }: { children: ReactNode }) {
  return <div className="mt-6 flex flex-col items-center gap-2">{children}</div>
}

export function AuthLink({
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className="text-sm text-candle/85 underline underline-offset-4 hover:text-white"
      {...rest}
    >
      {children}
    </button>
  )
}

export function AuthText({
  children,
  tone = "info",
}: {
  children: ReactNode
  tone?: "info" | "error"
}) {
  return (
    <p
      role={tone === "error" ? "alert" : undefined}
      className={clsx("mb-4 text-center text-base", {
        "text-yellow-200": tone === "info",
        "text-[#ff6369]": tone === "error",
      })}
    >
      {children}
    </p>
  )
}
