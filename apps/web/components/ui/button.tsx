import * as React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FBC549] disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2";
    const variants = {
      default: "bg-[#FBC549] text-[#1A2A6C] hover:opacity-90",
      outline: "border border-[#7D939F] text-[#7D939F] hover:bg-white/5",
      ghost: "text-[#7D939F] hover:bg-white/5",
    };
    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${className}`}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
export { Button };
