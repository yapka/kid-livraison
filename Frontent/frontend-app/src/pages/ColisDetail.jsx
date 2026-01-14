import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getColisById } from "../services/colisService";
import LoadingSpinner from "../components/LoadingSpinner";
import DeliveryReceipt from "../components/DeliveryReceipt";
import ColisStatusUpdate from "./ColisStatusUpdate";
import { useReactToPrint } from "react-to-print";
import { useAuth } from "../contexts/AuthContext";
import {
  Package,
  ArrowLeft,
  Printer,
  User,
  MapPin,
  Weight,
  DollarSign,
  Edit,
  Clock,
} from "lucide-react";

function ColisDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [colis, setColis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showStatusUpdate, setShowStatusUpdate] = useState(false);
  const { user } = useAuth();

  // Ref for the delivery receipt component to print
  const receiptRef = useRef();

  // Hook for printing delivery receipt functionality
  const handlePrintReceipt = useReactToPrint({
    content: () => receiptRef.current,
    documentTitle: `Reçu_Colis_${colis?.numero_suivi}`,
  });

  useEffect(() => {
    const fetchColisDetail = async () => {
      try {
        setLoading(true);
        const data = await getColisById(id);
        setColis(data);
      } catch (err) {
        console.error("Error fetching colis detail:", err);
        setError(
          err.message || "Erreur lors du chargement des détails du colis."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchColisDetail();
  }, [id]);

  const handleStatusUpdated = () => {
    setShowStatusUpdate(false);
    // Recharger les données du colis
    const fetchColisDetail = async () => {
      try {
        setLoading(true);
        const data = await getColisById(id);
        setColis(data);
      } catch (err) {
        console.error("Error fetching colis detail:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchColisDetail();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          <p className="font-semibold">Erreur</p>
          <p>{error}</p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </button>
      </div>
    );
  }

  // Restriction d'accès : opérateur ne peut voir que ses propres colis
  if (
    !colis ||
    (user?.role === "OPERATEUR" && colis.utilisateur_id !== user.id)
  ) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          <p className="font-semibold">Accès refusé</p>
          <p>Vous n'avez pas le droit d'accéder à ce colis.</p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </button>
      </div>
    );
  }

  // Create livraison object format for DeliveryReceipt component (explicite pour l'impression)
  const livraisonForReceipt = {
    colis,
    expediteur: colis.expediteur || {},
    destinataire: colis.destinataire || {},
    numero_suivi: colis.numero_suivi,
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      EN_ATTENTE: "bg-yellow-100 text-yellow-800",
      EN_TRANSIT: "bg-blue-100 text-blue-800",
      LIVRE: "bg-green-100 text-green-800",
      ANNULE: "bg-red-100 text-red-800",
    };
    return statusClasses[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status) => {
    const statusLabels = {
      EN_ATTENTE: "En attente",
      EN_TRANSIT: "En transit",
      LIVRE: "Livré",
      ANNULE: "Annulé",
    };
    return statusLabels[status] || status;
  };

  // Vérifier si l'utilisateur est Admin
  const isAdmin = user?.role === "ADMIN";

  // Si le modal de mise à jour du statut est ouvert
  if (showStatusUpdate) {
    return (
      <div className="min-h-screen bg-muted/30 py-8">
        <div className="container mx-auto px-4 max-w-3xl">
          <ColisStatusUpdate
            colis={colis}
            onUpdate={handleStatusUpdated}
            onCancel={() => setShowStatusUpdate(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto px-2 sm:px-4">
        {/* Header compact, accessible, responsive */}
        <header className="bg-white border border-border rounded-xl shadow-sm mb-6 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/60 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 transition"
              aria-label="Retour à la liste"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <Package
              className="w-8 h-8 text-primary flex-shrink-0"
              aria-hidden
            />
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-muted-foreground font-medium truncate">
                Colis #{colis.id}
              </span>
              <span className="text-lg sm:text-2xl font-bold text-foreground truncate">
                {colis.numero_suivi}
              </span>
            </div>
            <span
              className={`ml-2 px-3 py-1 rounded-full text-xs font-semibold shadow-sm whitespace-nowrap ${getStatusBadgeClass(
                colis.statut
              )}`}
              aria-label={`Statut : ${getStatusLabel(colis.statut)}`}
            >
              {getStatusLabel(colis.statut)}
            </span>
          </div>
          <nav className="flex flex-wrap gap-2 sm:gap-3">
            <button
              onClick={() => navigate(`/colis/${colis.id}/suivi`)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 font-medium focus:outline-none focus:ring-2 focus:ring-primary/60"
              aria-label="Voir le suivi du colis"
            >
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">Suivi</span>
            </button>
            {(isAdmin || user?.role === "OPERATEUR") && (
              <button
                onClick={() => setShowStatusUpdate(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 font-medium focus:outline-none focus:ring-2 focus:ring-primary/60"
                aria-label="Changer le statut du colis"
              >
                <Edit className="w-4 h-4" />
                <span className="hidden sm:inline">Statut</span>
              </button>
            )}
            <button
              onClick={handlePrintReceipt}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent text-accent-foreground hover:opacity-90 font-medium focus:outline-none focus:ring-2 focus:ring-accent/60 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Imprimer le reçu du colis"
              disabled={!colis || loading}
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Imprimer</span>
            </button>
          </nav>
        </header>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Expediteur Card */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center text-foreground">
              <div className="bg-muted p-2 rounded mr-3">
                <User className="w-5 h-5 text-primary" />
              </div>
              Expéditeur
            </h2>
            <div className="space-y-3">
              <div className="flex items-start">
                <span className="font-semibold text-gray-600 min-w-[100px]">
                  Nom:
                </span>
                <span className="text-gray-900 font-medium">
                  {colis.expediteur?.nom_complet || "N/A"}
                </span>
              </div>
              <div className="flex items-start">
                <span className="font-semibold text-gray-600 min-w-[100px]">
                  Téléphone:
                </span>
                <span className="text-gray-900 font-medium">
                  {colis.expediteur?.telephone || "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Destinataire Card */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center text-foreground">
              <div className="bg-muted p-2 rounded mr-3">
                <User className="w-5 h-5 text-accent" />
              </div>
              Destinataire
            </h2>
            <div className="space-y-3">
              <div className="flex items-start">
                <span className="font-semibold text-gray-600 min-w-[100px]">
                  Nom:
                </span>
                <span className="text-gray-900 font-medium">
                  {colis.destinataire?.nom_complet || "N/A"}
                </span>
              </div>
              <div className="flex items-start">
                <span className="font-semibold text-gray-600 min-w-[100px]">
                  Téléphone:
                </span>
                <span className="text-gray-900 font-medium">
                  {colis.destinataire?.telephone || "N/A"}
                </span>
              </div>
              {colis.destinataire?.email && (
                <div className="flex items-start">
                  <span className="font-semibold text-gray-600 min-w-[100px]">
                    Email:
                  </span>
                  <span className="text-gray-900 font-medium">
                    {colis.destinataire.email}
                  </span>
                </div>
              )}
              <div className="flex items-start">
                <MapPin className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 text-green-600" />
                <div>
                  <span className="font-semibold text-gray-600">Ville:</span>
                  <span className="ml-2 text-gray-900 font-medium">
                    {colis.destinataire?.ville || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Colis Details Card */}
          <div className="bg-white shadow-lg rounded-xl p-6 border-l-4 border-purple-500 hover:shadow-xl transition-shadow">
            <h2 className="text-2xl font-bold mb-5 flex items-center text-gray-800">
              <div className="bg-purple-100 p-2 rounded-lg mr-3">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
              Informations du Colis
            </h2>
            <div className="space-y-3">
              <div className="flex items-start">
                <Weight className="w-5 h-5 mr-2 mt-0.5 text-purple-600" />
                <div>
                  <span className="font-semibold text-gray-600">Poids:</span>
                  <span className="ml-2 text-gray-900 font-medium">
                    {colis.poids} kg
                  </span>
                </div>
              </div>
              <div className="flex items-start">
                <span className="font-semibold text-gray-600 min-w-[100px]">
                  Dimensions:
                </span>
                <span className="text-gray-900 font-medium">
                  {colis.longueur} x {colis.largeur} x {colis.hauteur} cm
                </span>
              </div>
              {colis.description && (
                <div className="flex items-start">
                  <span className="font-semibold text-gray-600 min-w-[100px]">
                    Description:
                  </span>
                  <span className="text-gray-900 font-medium">
                    {colis.description}
                  </span>
                </div>
              )}
              <div className="flex items-start">
                <span className="font-semibold text-gray-600 min-w-[100px]">
                  Créé le:
                </span>
                <span className="text-gray-900 font-medium">
                  {new Date(colis.date_creation).toLocaleDateString("fr-FR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              {/* Affichage de l'agent qui a enregistré le colis, visible uniquement pour l'admin */}
              {isAdmin && (
                <div className="flex items-start">
                  <span className="font-semibold text-gray-600 min-w-[100px]">
                    Agent enregistré:
                  </span>
                  <span className="text-gray-900 font-medium">
                    {colis.agent_enregistrement?.nom_complet ||
                      colis.agent_enregistrement?.username ||
                      colis.utilisateur_id ||
                      "N/A"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Financial Details Card */}
          <div className="bg-white shadow-lg rounded-xl p-6 border-l-4 border-yellow-500 hover:shadow-xl transition-shadow">
            <h2 className="text-2xl font-bold mb-5 flex items-center text-gray-800">
              <div className="bg-yellow-100 p-2 rounded-lg mr-3">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
              Informations Financières
            </h2>
            <div className="space-y-3">
              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                <span className="font-semibold text-gray-600">
                  Frais d'envoi:
                </span>
                <span className="ml-2 text-2xl font-bold text-yellow-700">
                  {colis.frais_envoi} FCFA
                </span>
              </div>
              {colis.valeur_declaree && (
                <div className="flex items-start">
                  <span className="font-semibold text-gray-600 min-w-[130px]">
                    Valeur déclarée:
                  </span>
                  <span className="text-gray-900 font-medium">
                    {colis.valeur_declaree} FCFA
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Receipt for Printing */}
      <div style={{ display: "none" }}>
        <DeliveryReceipt ref={receiptRef} livraison={livraisonForReceipt} />
      </div>
    </div>
  );
}

export default ColisDetail;
