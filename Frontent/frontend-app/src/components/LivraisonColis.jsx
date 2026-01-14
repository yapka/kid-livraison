import React, { useState } from "react";
import Button from "../components/ui/Button";

function LivraisonColis({ colisId, onSuccess }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleLivrer = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const response = await fetch(`/api/colis/${colisId}/livrer/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Erreur lors de la livraison.");
      }
      setSuccess(true);
      onSuccess && onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 border rounded-lg bg-white shadow">
      <h2 className="text-lg font-bold mb-2">Remise du colis</h2>
      <label className="block mb-2">
        Code de retrait&nbsp;:
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          disabled={loading}
          className="border rounded px-3 py-2 text-sm md:text-base ml-2"
        />
      </label>
      <Button onClick={handleLivrer} disabled={loading || !code}>
        Valider et livrer
      </Button>
      {error && <div className="text-red-600 mt-2">{error}</div>}
      {success && (
        <div className="text-green-600 mt-2">Colis livré avec succès !</div>
      )}
    </div>
  );
}

export default LivraisonColis;
