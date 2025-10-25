import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/cn";
import { ButtonVariant } from "@/types/core";

type Variant = ButtonVariant;
type Props = ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: Variant;
  asChild?: boolean;
};

const Button = forwardRef<HTMLButtonElement, Props>(
  ({ variant="secondary", className, asChild, ...rest }, ref) => {
    const base = "px-4 py-2 rounded-xl text-sm font-medium transition";
    const styles = {
      default: "bg-accent2 text-white hover:opacity-90",
      primary: "bg-accent2 text-white hover:opacity-90",
      secondary: "bg-white text-charcoal border border-charcoal/30 hover:bg-offwhite",
      destructive: "bg-red-500 text-white hover:opacity-90",
      outline: "bg-transparent text-charcoal border border-charcoal/30 hover:bg-offwhite",
      ghost: "bg-transparent text-charcoal hover:bg-offwhite",
      link: "bg-transparent text-blue-600 underline hover:text-blue-800",
    }[variant];
    
    const Component = asChild ? 'a' : 'button';
    
    return (
      <Component 
        ref={ref}
        className={cn(base, styles, className)} 
        {...rest} 
      />
    );
  }
);

Button.displayName = "Button";

export default Button;
