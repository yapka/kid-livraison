import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getColisById } from "../services/colisService";
import { getAllSuivis } from "../services/suiviService";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  Package,
  ArrowLeft,
  MapPin,
  Calendar,
  User,
  CheckCircle,
  Clock,
  XCircle,
  TruckIcon,
  AlertCircle,
} from "lucide-react";
import { useToast } from "../contexts/ToastContext";
import { useErrorHandler } from "../hooks/useErrorHandler";

function ColisSuivi() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [colis, setColis] = useState(null);
  const [suivis, setSuivis] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const { handleError } = useErrorHandler();

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Récupérer les détails du colis
      const colisData = await getColisById(id);
      setColis(colisData);

      // Récupérer tous les suivis et filtrer par colis
      const allSuivis = await getAllSuivis();
      const colisSuivis = allSuivis.filter((s) => s.colis === parseInt(id));
      setSuivis(colisSuivis);
    } catch (error) {
      handleError(error, {
        context: "Chargement du suivi",
        showToast: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (statut) => {
    const icons = {
      COLIS_RECEPTIONNE: <Package className="w-6 h-6" />,
      EN_PREPARATION: <Clock className="w-6 h-6" />,
      EN_TRANSIT: <TruckIcon className="w-6 h-6" />,
      EN_COURS_LIVRAISON: <MapPin className="w-6 h-6" />,
      LIVRE: <CheckCircle className="w-6 h-6" />,
      ECHEC_LIVRAISON: <XCircle className="w-6 h-6" />,
      RETOUR_EXPEDITEUR: <AlertCircle className="w-6 h-6" />,
    };
    return icons[statut] || <Package className="w-6 h-6" />;
  };

  const getStatusColor = (statut) => {
    const colors = {
      COLIS_RECEPTIONNE: "text-blue-600 bg-blue-50 border-blue-200",
      EN_PREPARATION: "text-yellow-600 bg-yellow-50 border-yellow-200",
      EN_TRANSIT: "text-indigo-600 bg-indigo-50 border-indigo-200",
      EN_COURS_LIVRAISON: "text-purple-600 bg-purple-50 border-purple-200",
      LIVRE: "text-green-600 bg-green-50 border-green-200",
      ECHEC_LIVRAISON: "text-red-600 bg-red-50 border-red-200",
      RETOUR_EXPEDITEUR: "text-orange-600 bg-orange-50 border-orange-200",
    };
    return colors[statut] || "text-gray-600 bg-gray-50 border-gray-200";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!colis) {
    return (
      <div className="min-h-screen bg-muted/30 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-lg">
            <p className="font-semibold">Colis introuvable</p>
          </div>
          <button
            onClick={() => navigate("/colis")}
            className="mt-4 flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* En-tête */}
        <div className="bg-card border border-border rounded-lg p-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-primary hover:opacity-90 mb-4 font-medium"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Retour
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 flex items-center mb-2">
                <Package className="w-8 h-8 mr-3 text-blue-600" />
                Suivi du colis
              </h1>
              <div className="flex items-center gap-3 mt-3">
                <div className="bg-blue-50 border border-blue-200 px-4 py-2 rounded-lg">
                  <span className="text-sm text-gray-600">N° de suivi:</span>
                  <span className="ml-2 font-bold text-blue-700 text-lg">
                    {colis.numero_suivi}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Informations du colis */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">Expéditeur</p>
              <p className="font-semibold text-gray-900">
                {colis.expediteur?.nom_complet || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Destinataire</p>
              <p className="font-semibold text-gray-900">
                {colis.destinataire?.nom_complet || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Destination</p>
              <p className="font-semibold text-gray-900">
                {colis.destinataire?.ville || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Statut actuel</p>
              <p className="font-semibold text-gray-900">
                {colis.statut_display || colis.statut}
              </p>
            </div>
          </div>
        </div>

        {/* Timeline du suivi */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-primary" />
            Historique du suivi
          </h2>

          {suivis.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                Aucun historique de suivi disponible
              </p>
            </div>
          ) : (
            <div className="relative">
              {/* Ligne verticale */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>

              {/* Événements de suivi */}
              <div className="space-y-6">
                {suivis.map((suivi, index) => (
                  <div key={suivi.id} className="relative flex gap-4">
                    {/* Icône */}
                    <div
                      className={`flex-shrink-0 w-12 h-12 rounded-full border-2 border-background flex items-center justify-center ${getStatusColor(
                        suivi.statut
                      )} z-10`}
                    >
                      {getStatusIcon(suivi.statut)}
                    </div>

                    {/* Contenu */}
                    <div className="flex-1 bg-muted rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-base font-semibold text-foreground">
                          {suivi.statut_display || suivi.statut}
                        </h3>
                        <span className="text-sm text-gray-500 flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(suivi.date_creation)}
                        </span>
                      </div>

                      <p className="text-gray-700 mb-2">{suivi.description}</p>

                      <div className="flex flex-wrap gap-4 text-sm">
                        {suivi.localisation && (
                          <div className="flex items-center text-gray-600">
                            <MapPin className="w-4 h-4 mr-1 text-blue-500" />
                            {suivi.localisation}
                          </div>
                        )}
                        {suivi.utilisateur_nom && (
                          <div className="flex items-center text-gray-600">
                            <User className="w-4 h-4 mr-1 text-purple-500" />
                            {suivi.utilisateur_nom}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ColisSuivi;
