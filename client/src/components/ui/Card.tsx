import { cn } from "@/lib/cn";

type Props = React.HTMLAttributes<HTMLDivElement> & { 
  raised?: boolean; 
  tone?: "beige"|"offwhite"|"white" 
};

export default function Card({ 
  className, 
  children, 
  raised, 
  tone="beige", 
  ...rest 
}: Props) {
  const toneClass =
    tone === "white" ? "bg-white" :
    tone === "offwhite" ? "bg-offwhite" :
    "bg-panel/20"; // soft beige with 20% opacity
  
  return (
    <div
      className={cn("rounded-2xl border border-border", toneClass, raised && "shadow-soft", className)}
      {...rest}
    >
      {children}
    </div>
  );
}

