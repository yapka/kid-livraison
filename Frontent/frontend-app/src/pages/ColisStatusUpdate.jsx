import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { patchColis } from "../services/colisService";
import { useToast } from "../contexts/ToastContext";
import { useErrorHandler } from "../hooks/useErrorHandler";
import { RefreshCw, CheckCircle, Package, AlertTriangle } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "EN_ATTENTE", label: "En attente", color: "yellow" },
  { value: "EN_TRANSIT", label: "En transit", color: "blue" },
  { value: "EN_LIVRAISON", label: "En cours de livraison", color: "purple" },
  { value: "LIVRE", label: "Livré", color: "green" },
  { value: "RETOUR", label: "Retour", color: "orange" },
  { value: "ANNULE", label: "Annulé", color: "red" },
];

function ColisStatusUpdate({ colis, onUpdate, onCancel }) {
  const [selectedStatus, setSelectedStatus] = useState(colis.statut);
  const [commentaire, setCommentaire] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const { handleError } = useErrorHandler();

  const getStatusIcon = (status) => {
    switch (status) {
      case "EN_ATTENTE":
        return <Package className="w-5 h-5" />;
      case "EN_TRANSIT":
      case "EN_LIVRAISON":
        return <RefreshCw className="w-5 h-5" />;
      case "LIVRE":
        return <CheckCircle className="w-5 h-5" />;
      case "RETOUR":
      case "ANNULE":
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  const getColorClasses = (color) => {
    const colors = {
      yellow: "border-yellow-500 hover:bg-yellow-50",
      blue: "border-blue-500 hover:bg-blue-50",
      purple: "border-purple-500 hover:bg-purple-50",
      green: "border-green-500 hover:bg-green-50",
      orange: "border-orange-500 hover:bg-orange-50",
      red: "border-red-500 hover:bg-red-50",
    };
    return colors[color] || "border-gray-500 hover:bg-gray-50";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedStatus === colis.statut) {
      toast.warning("Veuillez sélectionner un nouveau statut");
      return;
    }

    try {
      setLoading(true);

      const updateData = {
        statut: selectedStatus,
      };

      // Si c'est une livraison ou annulation, le commentaire pourrait être utile
      if (
        commentaire &&
        (selectedStatus === "LIVRE" ||
          selectedStatus === "ANNULE" ||
          selectedStatus === "RETOUR")
      ) {
        updateData.instructions_speciales = commentaire;
      }

      await patchColis(colis.id, updateData);

      toast.success(
        `Statut mis à jour: ${
          STATUS_OPTIONS.find((s) => s.value === selectedStatus)?.label
        }`
      );

      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      handleError(error, { showToast: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">
        Modifier le statut du colis
      </h3>

      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-gray-600">Colis:</p>
        <p className="text-lg font-bold text-blue-700">{colis.numero_suivi}</p>
        <p className="text-sm text-gray-600 mt-2">Statut actuel:</p>
        <p className="text-md font-semibold">
          {STATUS_OPTIONS.find((s) => s.value === colis.statut)?.label}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sélection du statut */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Nouveau statut
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setSelectedStatus(option.value)}
                className={`flex items-center p-4 border-2 rounded-lg transition-all ${
                  selectedStatus === option.value
                    ? `${getColorClasses(
                        option.color
                      )} ring-2 ring-offset-2 ring-${option.color}-500`
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div
                  className={`mr-3 ${
                    selectedStatus === option.value
                      ? `text-${option.color}-600`
                      : "text-gray-400"
                  }`}
                >
                  {getStatusIcon(option.value)}
                </div>
                <span
                  className={`font-medium ${
                    selectedStatus === option.value
                      ? "text-gray-900"
                      : "text-gray-600"
                  }`}
                >
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Commentaire optionnel */}
        {(selectedStatus === "LIVRE" ||
          selectedStatus === "ANNULE" ||
          selectedStatus === "RETOUR") && (
          <div>
            <label
              htmlFor="commentaire"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Commentaire{" "}
              {selectedStatus === "ANNULE" ? "(requis)" : "(optionnel)"}
            </label>
            <textarea
              id="commentaire"
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ajoutez un commentaire..."
              required={selectedStatus === "ANNULE"}
            />
          </div>
        )}

        {/* Boutons d'action */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading || selectedStatus === colis.statut}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {loading ? "Mise à jour..." : "Confirmer"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:cursor-not-allowed"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}

export default ColisStatusUpdate;
