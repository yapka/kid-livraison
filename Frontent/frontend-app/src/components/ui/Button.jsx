import React from "react";

const VARIANT_CLASS = {
  primary: "btn-primary",
  ghost: "btn-ghost",
};

export default function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}) {
  // Responsive: mobile (default): text-sm, py-2, px-3; md+: revert to original
  const base =
    "btn inline-flex items-center justify-center gap-2 text-sm py-2 px-3 md:text-base md:py-2.5 md:px-5";
  const variantClass = VARIANT_CLASS[variant] || VARIANT_CLASS.primary;
  return (
    <button className={`${base} ${variantClass} ${className}`} {...props}>
      {children}
    </button>
  );
}
