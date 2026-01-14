import React, { useState } from "react";
import PhoneInput from "./PhoneInput";

function SimplePhoneForm() {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (value) => {
    setPhone(value);
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(phone)) {
      setError(
        "Le téléphone doit comporter exactement 10 chiffres (format local, ex: 07XXXXXXXX)"
      );
      setSubmitted(false);
      return;
    }
    setError("");
    setSubmitted(true);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xs mx-auto mt-10 p-4 border rounded-xl bg-white shadow"
    >
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Téléphone <span className="text-red-500">*</span>
      </label>
      <PhoneInput
        name="telephone"
        value={phone}
        onChange={handleChange}
        placeholder="07XXXXXXXX"
      />
      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      {submitted && (
        <p className="text-green-600 text-sm mt-2">Téléphone valide !</p>
      )}
      <button
        type="submit"
        className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Valider
      </button>
    </form>
  );
}

export default SimplePhoneForm;
