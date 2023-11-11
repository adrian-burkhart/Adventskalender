import clsx from "clsx"
import { ButtonHTMLAttributes, DetailedHTMLProps, memo } from "react"

interface ButtonProps
  extends Omit<
    DetailedHTMLProps<
      ButtonHTMLAttributes<HTMLButtonElement>,
      HTMLButtonElement
    >,
    "ref"
  > {
  loading?: boolean
}

const Button = memo(({ children, disabled, ...rest }: ButtonProps) => {
  return (
    <button
      className={clsx("mt-6 px-2 py-1 hover:text-white", {
        "pointer-events-none bg-gray-500 text-white": disabled,
        "bg-red-500": !disabled,
      })}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  )
})

export default Button
