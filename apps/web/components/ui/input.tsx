import * as React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", type, ...props }, ref) => (
    <input
      type={type}
      className={`flex h-10 w-full rounded-md border border-[#7D939F]/40 bg-transparent px-3 py-2 text-sm text-white placeholder:text-[#7D939F]/60 focus:outline-none focus:ring-2 focus:ring-[#FBC549] ${className}`}
      ref={ref}
      {...props}
    />
  )
);
Input.displayName = "Input";
export { Input };
