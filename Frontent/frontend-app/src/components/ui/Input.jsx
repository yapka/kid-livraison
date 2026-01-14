import React from "react";

export default function Input({ label, icon: Icon, className = "", ...props }) {
  return (
    <label className="block">
      {label && (
        <div className="text-sm font-medium text-muted-foreground mb-2">
          {label}
        </div>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="w-5 h-5 text-muted-foreground" aria-hidden />
          </div>
        )}
        <input
          className={`w-full ${
            Icon ? "pl-10" : "pl-4"
          } pr-4 py-2 px-3 text-sm md:text-base md:py-3 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-primary outline-none bg-card text-card-foreground ${className}`}
          {...props}
        />
      </div>
    </label>
  );
}
