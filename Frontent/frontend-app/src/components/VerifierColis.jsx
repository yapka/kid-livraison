import React, { useState } from "react";
import Button from "./ui/Button";

function VerifierColis() {
  const [numero, setNumero] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleVerifier = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await fetch(`/api/colis/?numero_suivi=${numero}`);
      const data = await response.json();
      if (!response.ok || !data.length) {
        throw new Error("Colis non trouvé.");
      }
      setResult(data[0]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow mt-8">
      <h1 className="text-xl font-bold mb-4">Vérifier un colis</h1>
      <form onSubmit={handleVerifier} className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Numéro de suivi"
          value={numero}
          onChange={(e) => setNumero(e.target.value)}
          className="flex-1 border rounded px-3 py-2 text-sm md:text-base"
          required
        />
        <Button type="submit" disabled={loading || !numero}>
          Vérifier
        </Button>
      </form>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {result && (
        <div className="border rounded p-4 bg-gray-50">
          <div>
            <b>Statut :</b> {result.statut_display || result.statut}
          </div>
          <div>
            <b>Expéditeur :</b> {result.expediteur_nom}
          </div>
          <div>
            <b>Destinataire :</b> {result.destinataire_nom}
          </div>
          <div>
            <b>Poids :</b> {result.poids} kg
          </div>
          <div>
            <b>Date création :</b>{" "}
            {new Date(result.date_creation).toLocaleString("fr-FR")}
          </div>
        </div>
      )}
    </div>
  );
}

export default VerifierColis;
