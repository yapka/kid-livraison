import React from "react";

const PhoneInput = React.forwardRef(({ error, pattern, ...props }, ref) => {
  return (
    <input
      type="tel"
      ref={ref}
      className={`block w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${
        error ? "border-red-600" : "border-gray-300"
      } ${props.disabled ? "bg-gray-100" : "bg-white"}`}
      autoComplete="tel"
      required
      pattern={pattern || "^\\d{10}$"}
      {...props}
    />
  );
});

PhoneInput.displayName = "PhoneInput";

export default PhoneInput;
