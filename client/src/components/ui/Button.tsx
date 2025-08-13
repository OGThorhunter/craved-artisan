import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary"|"secondary"|"ghost"|"success";
type Props = ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: Variant;
  asChild?: boolean;
};

const Button = forwardRef<HTMLButtonElement, Props>(
  ({ variant="secondary", className, asChild, ...rest }, ref) => {
    const base = "px-4 py-2 rounded-xl text-sm font-medium transition";
    const styles = {
      primary: "bg-accent2 text-white hover:opacity-90",
      secondary: "bg-white text-charcoal border border-charcoal/30 hover:bg-offwhite",
      ghost: "bg-transparent text-charcoal hover:bg-offwhite",
      success: "bg-accent text-white hover:opacity-90",
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
