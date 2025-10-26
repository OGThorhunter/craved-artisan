import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/cn";
import { ButtonVariant } from "@/types/core";

type Variant = ButtonVariant;
type Props = ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: Variant;
  size?: 'sm' | 'md' | 'lg' | 'icon';
  asChild?: boolean;
};

const Button = forwardRef<HTMLButtonElement, Props>(
  ({ variant="secondary", size="md", className, asChild, ...rest }, ref) => {
    const base = "rounded-xl font-medium transition";
    const sizeStyles = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
      icon: "p-2 text-sm"
    }[size];
    
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
        {...(!href && { ref })}
        className={cn(base, sizeStyles, styles, className)} 
        {...rest} 
      />
    );
  }
);

Button.displayName = "Button";

export default Button;
