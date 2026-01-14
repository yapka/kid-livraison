import React from "react";
import Input from "./ui/Input";

const PhoneInput = ({
  value = "",
  onChange,
  name,
  placeholder = "0712345678",
  disabled = false,
  className = "",
  error = false,
}) => {
  const handlePhoneChange = (e) => {
    const inputValue = e.target.value;
    // Permettre seulement les chiffres et espaces
    const cleaned = inputValue.replace(/[^\d\s]/g, "");
    onChange({ target: { name, value: cleaned } });
  };

  return (
    <div className="relative w-full">
      {/* Drapeau et indicatif */}
      <div className="absolute left-0 top-0 bottom-0 flex items-center justify-center w-20 bg-gray-50 border border-r-0 border-gray-300 rounded-l-lg pointer-events-none">
        <div className="flex items-center gap-1">
          <span className="text-xl">🇨🇮</span>
          <span className="text-xs font-bold text-gray-700">+225</span>
        </div>
      </div>

      {/* Champ de saisie */}
      <Input
        type="tel"
        name={name}
        value={value}
        onChange={handlePhoneChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`pl-24 ${className} ${error ? "border-red-500" : ""}`}
      />
    </div>
  );
};

export default PhoneInput;
