import clsx from "clsx"
import Link from "next/link"
import {
  ButtonHTMLAttributes,
  ComponentProps,
  DetailedHTMLProps,
  memo,
} from "react"

interface ButtonProps extends Omit<
  DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>,
  "ref"
> {
  /** A quieter outline button for the second choice next to a main one. */
  quiet?: boolean
}

const Button = memo(({ className, quiet, ...rest }: ButtonProps) => {
  return (
    <button
      className={clsx(quiet ? "btn-quiet" : "btn", className)}
      {...rest}
    />
  )
})

/** A link that looks like a button (a button inside a link is invalid). */
export function ButtonLink({
  className,
  quiet,
  ...rest
}: ComponentProps<typeof Link> & { quiet?: boolean }) {
  return (
    <Link className={clsx(quiet ? "btn-quiet" : "btn", className)} {...rest} />
  )
}

export default Button
