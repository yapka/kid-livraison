import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Search,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { getAllColis, deleteColis } from "../services/colisService";
import { useErrorHandler } from "../hooks/useErrorHandler";
import { useToast } from "../contexts/ToastContext";
import LoadingSpinner from "../components/LoadingSpinner";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { useAuth } from "../contexts/AuthContext";
import ColisStatusUpdate from "./ColisStatusUpdate";

function ParcelsList() {
  // Fonction d'export CSV
  const exportToCSV = () => {
    const headers = [
      "Numéro",
      "Expéditeur",
      "Destinataire",
      "Statut",
      "Agent",
      "Frais envoi",
      "Date création",
    ];
    const rows = filteredParcels.map((parcel) => [
      parcel.numero_suivi || "",
      parcel.expediteur_nom || "",
      parcel.destinataire_nom || "",
      parcel.statut_display || parcel.statut || "",
      parcel.agent_enregistrement?.nom_complet ||
        parcel.agent_enregistrement?.username ||
        "",
      parcel.frais_envoi || "",
      parcel.date_creation
        ? new Date(parcel.date_creation).toLocaleString("fr-FR")
        : "",
    ]);
    const csvContent = [headers, ...rows]
      .map((e) => e.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "colis.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const [parcels, setParcels] = useState([]);
  const [filteredParcels, setFilteredParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedColis, setSelectedColis] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const { user } = useAuth();
  const { handleError } = useErrorHandler();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchParcels();
  }, []);

  useEffect(() => {
    filterParcels();
  }, [parcels, searchTerm, statusFilter]);

  const fetchParcels = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllColis();
      setParcels(data);
      // Calcul du nombre de colis réellement affichés après filtrage rôle
      let filteredCount = data.length;
      if (user?.role === "OPERATEUR") {
        filteredCount = data.filter((p) => p.utilisateur_id === user.id).length;
      }
      toast.success(`${filteredCount} colis chargé(s)`, "Chargement réussi");
    } catch (err) {
      const enrichedError = handleError(err, {
        context: "Chargement des colis",
        showToast: true,
      });
      setError(
        enrichedError.userMessage || "Erreur lors du chargement des colis."
      );
    } finally {
      setLoading(false);
    }
  };

  const filterParcels = () => {
    let filtered = [...parcels];

    // Role-based filtering: OPERATEUR sees only their parcels
    if (user?.role === "OPERATEUR") {
      filtered = filtered.filter((p) => p.utilisateur_id === user.id);
    }
    // ADMIN sees all

    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.numero_suivi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.expediteur_nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.destinataire_nom
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "ALL") {
      filtered = filtered.filter((p) => p.statut === statusFilter);
    }

    setFilteredParcels(filtered);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce colis ?")) {
      try {
        await deleteColis(id);
        toast.success("Colis supprimé avec succès");
        fetchParcels();
      } catch (err) {
        handleError(err, {
          context: "Suppression du colis",
          showToast: true,
        });
      }
    }
  };

  const handleChangeStatus = (colis) => {
    setSelectedColis(colis);
    setShowStatusModal(true);
  };

  const handleStatusUpdated = () => {
    setShowStatusModal(false);
    setSelectedColis(null);
    fetchParcels();
  };

  const handleCloseModal = () => {
    setShowStatusModal(false);
    setSelectedColis(null);
  };

  const getStatusBadge = (statut) => {
    const styles = {
      EN_ATTENTE: "bg-yellow-100 text-yellow-800 border-yellow-200",
      EN_TRANSIT: "bg-blue-100 text-blue-800 border-blue-200",
      LIVRE: "bg-green-100 text-green-800 border-green-200",
      EN_RETOUR: "bg-orange-100 text-orange-800 border-orange-200",
      ANNULE: "bg-red-100 text-red-800 border-red-200",
    };
    return styles[statut] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  // ADMIN : tout ; OPERATEUR : lecture, ajout, changement de statut
  const canAddParcels = user?.role === "ADMIN" || user?.role === "OPERATEUR";
  const canManageParcels = user?.role === "ADMIN";
  const canChangeStatus = user?.role === "ADMIN" || user?.role === "OPERATEUR";
  const isAdmin = user?.role === "ADMIN";

  if (loading) return <LoadingSpinner />;

  // Modal de changement de statut
  if (showStatusModal && selectedColis) {
    return (
      <div className="min-h-screen bg-muted/30 py-8">
        <div className="container mx-auto px-4 max-w-3xl">
          <ColisStatusUpdate
            colis={selectedColis}
            onUpdate={handleStatusUpdated}
            onCancel={handleCloseModal}
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
        <p className="text-red-600 font-medium mb-3">{error}</p>
        <Button onClick={fetchParcels}>Réessayer</Button>
      </div>
    );
  }

  // Calculer la somme totale des frais
  const totalFrais = filteredParcels.reduce((sum, parcel) => {
    const frais = parseFloat(parcel.frais_envoi) || 0;
    return sum + frais;
  }, 0);

  return (
    <div className="min-h-screen bg-muted/30 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Package className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Liste des colis
              </h1>
              <p className="text-muted-foreground mt-1">
                {filteredParcels.length} colis trouvé(s)
              </p>
              <p className="text-primary font-semibold mt-1">
                Total frais:{" "}
                {totalFrais.toLocaleString("fr-FR", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}{" "}
                FCFA
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {isAdmin && (
              <Button
                onClick={exportToCSV}
                className="flex items-center justify-center gap-2 w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg px-4 py-2 transition focus:outline-none focus:ring-2 focus:ring-green-400"
                aria-label="Exporter la liste des colis en CSV"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span className="inline">Export CSV</span>
              </Button>
            )}
            {canAddParcels && (
              <Link to="/colis/new" className="w-full sm:w-auto">
                <Button
                  className="flex items-center justify-center gap-2 w-full sm:w-auto bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg px-4 py-2 transition focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label="Ajouter un nouveau colis"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden xs:inline">Nouveau colis</span>
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Filters */}
        <Card className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder="Numéro de suivi, expéditeur, destinataire..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-primary outline-none bg-card text-card-foreground"
            >
              <option value="ALL">Tous les statuts</option>
              <option value="EN_ATTENTE">En attente</option>
              <option value="EN_TRANSIT">En transit</option>
              <option value="LIVRE">Livré</option>
              <option value="EN_RETOUR">En retour</option>
              <option value="ANNULE">Annulé</option>
            </select>
          </div>
        </Card>

        {/* Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left p-3 sm:p-4 font-semibold text-foreground">
                    Numéro
                  </th>
                  <th className="text-left p-3 sm:p-4 font-semibold text-foreground hidden md:table-cell">
                    Expéditeur
                  </th>
                  <th className="text-left p-3 sm:p-4 font-semibold text-foreground hidden lg:table-cell">
                    Destinataire
                  </th>
                  <th className="text-left p-3 sm:p-4 font-semibold text-foreground">
                    Statut
                  </th>
                  <th className="text-left p-3 sm:p-4 font-semibold text-foreground hidden sm:table-cell">
                    Agent
                  </th>
                  {(canManageParcels || canChangeStatus) && (
                    <th className="text-left p-3 sm:p-4 font-semibold text-foreground">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredParcels.length === 0 ? (
                  <tr>
                    <td
                      colSpan={canManageParcels ? 6 : 5}
                      className="p-8 text-center text-muted-foreground"
                    >
                      Aucun colis trouvé
                    </td>
                  </tr>
                ) : (
                  filteredParcels.map((parcel) => (
                    <tr
                      key={parcel.id}
                      className="hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => navigate(`/colis/${parcel.id}`)}
                    >
                      <td className="p-3 sm:p-4">
                        <Link
                          to={`/colis/${parcel.id}`}
                          className="flex items-center gap-2 hover:text-primary transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Package className="w-4 h-4 text-primary" />
                          <span className="font-mono text-sm font-medium underline decoration-primary/30 hover:decoration-primary">
                            {parcel.numero_suivi || "N/A"}
                          </span>
                        </Link>
                        {/* Informations empilées sur mobile */}
                        <div className="flex flex-col gap-1 mt-2 md:hidden">
                          <span className="text-xs text-muted-foreground">
                            <strong>Exp:</strong>{" "}
                            {parcel.expediteur_nom || "N/A"}
                          </span>
                          <span className="text-xs text-muted-foreground lg:hidden">
                            <strong>Dest:</strong>{" "}
                            {parcel.destinataire_nom || "N/A"}
                          </span>
                          <span className="text-xs text-muted-foreground sm:hidden">
                            <strong>Agent:</strong>{" "}
                            {parcel.agent_enregistrement?.nom_complet ||
                              parcel.agent_enregistrement?.username ||
                              "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 sm:p-4 text-sm hidden md:table-cell">
                        {parcel.expediteur_nom || "N/A"}
                      </td>
                      <td className="p-3 sm:p-4 text-sm hidden lg:table-cell">
                        {parcel.destinataire_nom || "N/A"}
                      </td>
                      <td className="p-3 sm:p-4">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(
                            parcel.statut
                          )}`}
                        >
                          {parcel.statut_display || parcel.statut}
                        </span>
                      </td>
                      <td className="p-3 sm:p-4 text-sm hidden sm:table-cell">
                        {parcel.agent_enregistrement?.nom_complet ||
                          parcel.agent_enregistrement?.username ||
                          "N/A"}
                      </td>
                      {(canManageParcels || canChangeStatus) && (
                        <td
                          className="p-3 sm:p-4"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex flex-wrap gap-2 justify-start">
                            {canChangeStatus && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleChangeStatus(parcel);
                                }}
                                className="p-2 rounded-lg text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-300"
                                title="Changer le statut"
                                aria-label="Changer le statut du colis"
                              >
                                <RefreshCw className="w-4 h-4" />
                              </button>
                            )}
                            {isAdmin && (
                              <>
                                <Link
                                  to={`/colis/edit/${parcel.id}`}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    className="p-2 rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
                                    aria-label="Modifier le colis"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                </Link>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(parcel.id);
                                  }}
                                  className="p-2 rounded-lg text-red-700 bg-red-50 hover:bg-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-red-300"
                                  aria-label="Supprimer le colis"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default ParcelsList;
