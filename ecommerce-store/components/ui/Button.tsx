import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export interface ButtonProps
     extends React.ButtonHTMLAttributes<HTMLButtonElement> { }

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
     className,
     children,
     disabled,
     type = "button",
     ...props
}, ref) => {
     return (
          <>
               <button className={cn(`w-auto rounded-full bg-black px-5 py-3 disabled:cursor-not-allowed disabled:opacity-50 text-white font-semibold transition-all`,className)} ref={ref}>
                    {children}
               </button>
          </>
     )
})
Button.displayName = "Button"

export default Button;