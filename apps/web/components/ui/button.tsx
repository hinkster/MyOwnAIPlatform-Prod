import * as React from "react";

const base =
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";
const sizeClasses = {
  default: "h-10 px-4 py-2",
  sm: "h-8 px-3 text-xs",
  lg: "h-11 px-6 text-base",
};
const variants = {
  default: "bg-accent text-accent-foreground hover:opacity-90",
  outline: "border border-border text-muted-foreground hover:bg-white/5",
  ghost: "text-muted-foreground hover:bg-white/5",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "default", asChild, children, ...props }, ref) => {
    const combinedClassName = `${base} ${sizeClasses[size]} ${variants[variant]} ${className}`.trim();
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<{ className?: string; ref?: React.Ref<unknown> }>, {
        className: [combinedClassName, (children.props as { className?: string }).className].filter(Boolean).join(" "),
        ref,
      });
    }
    return (
      <button ref={ref} className={combinedClassName} {...props}>
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
export { Button };
