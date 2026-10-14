import clsx from "clsx"
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
} from "react"

// Same look as the Supabase Auth UI form the login page used before.

export function AuthForm({
  children,
  ...rest
}: React.FormHTMLAttributes<HTMLFormElement>) {
  return (
    <form className="flex w-[250px] flex-col" {...rest}>
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
      <label htmlFor={id} className="mb-2 block text-sm text-[gray]">
        {label}
      </label>
      <input
        id={id}
        name={id}
        className="w-full rounded border border-[lightgray] bg-transparent px-[15px] py-[10px] text-sm text-white caret-white outline-none placeholder:text-white/70 hover:border-[gray] focus:border-[gray]"
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
    <button
      type="submit"
      className="mt-6 w-full rounded border border-[darkred] bg-red-500 px-[15px] py-[10px] text-sm text-white hover:bg-[darkred] disabled:pointer-events-none disabled:opacity-70"
      {...rest}
    >
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
      className="text-[13px] text-[gray] underline hover:text-[darkgray]"
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
      className={clsx("mb-4 text-center text-sm", {
        "text-yellow-200": tone === "info",
        "text-[#ff6369]": tone === "error",
      })}
    >
      {children}
    </p>
  )
}
