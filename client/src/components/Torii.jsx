import { forwardRef } from "react";

export const Torii = forwardRef(function Torii(props, ref) {
  const { className, ...rest } = props;

  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...rest}
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="5" y1="9" x2="19" y2="9" />
      <line x1="7" y1="6" x2="7" y2="20" />
      <line x1="17" y1="6" x2="17" y2="20" />
    </svg>
  );
});

Torii.displayName = "Torii";
