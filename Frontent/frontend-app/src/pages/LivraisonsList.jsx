import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Plus,
  Eye,
  Printer,
  Search,
  Filter,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  X,
} from "lucide-react";
import { getAllLivraisons } from "../services/livraisonService";
import LoadingSpinner from "../components/LoadingSpinner";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { useAuth } from "../contexts/AuthContext";
import { useReactToPrint } from "react-to-print";

function LivraisonsList() {
  const [livraisons, setLivraisons] = useState([]);
  const [filteredLivraisons, setFilteredLivraisons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showPreview, setShowPreview] = useState(false);
  const { user } = useAuth();

  const [selected, setSelected] = useState([]);
  const printRef = useRef();
  const handleBatchPrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Labels_batch_${selected.join("_")}`,
  });

  const handlePreview = () => {
    if (selected.length === 0) {
      alert("Veuillez sélectionner au moins une livraison à prévisualiser");
      return;
    }
    setShowPreview(true);
  };

  const handlePrint = () => {
    setShowPreview(false);
    setTimeout(() => {
      handleBatchPrint();
    }, 100);
  };

  useEffect(() => {
    fetchLivraisons();
  }, []);

  useEffect(() => {
    filterLivraisons();
  }, [searchTerm, statusFilter, livraisons]);

  const fetchLivraisons = async () => {
    try {
      const data = await getAllLivraisons();
      setLivraisons(data);
      setFilteredLivraisons(data);
    } catch (err) {
      setError(err.message || "Erreur lors du chargement des livraisons.");
    } finally {
      setLoading(false);
    }
  };

  const filterLivraisons = () => {
    let filtered = [...livraisons];

    // Role-based filtering: OPERATEUR sees only their livraisons
    if (user?.role === "OPERATEUR") {
      filtered = filtered.filter((l) => l.utilisateur_id === user.id);
    }
    // ADMIN sees all

    if (searchTerm) {
      filtered = filtered.filter(
        (l) =>
          l.colis_numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          l.livreur_nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          l.destinataire_nom
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          l.id?.toString().includes(searchTerm)
      );
    }

    if (statusFilter !== "ALL") {
      filtered = filtered.filter((l) => l.statut === statusFilter);
    }

    setFilteredLivraisons(filtered);
  };

  const canViewDeliveryDetails =
    user?.role === "ADMIN" ||
    user?.role === "OPERATEUR" ||
    user?.role === "LIVREUR";
  const canCreateDelivery =
    user?.role === "ADMIN" || user?.role === "OPERATEUR";

  const handleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selected.length === filteredLivraisons.length) setSelected([]);
    else setSelected(filteredLivraisons.map((l) => l.id));
  };

  const getStatusBadge = (statut) => {
    const statusConfig = {
      ASSIGNEE: { bg: "bg-blue-100", text: "text-blue-800", label: "Assignée" },
      EN_COURS: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "En cours",
      },
      LIVREE: { bg: "bg-green-100", text: "text-green-800", label: "Livrée" },
      ANNULEE: { bg: "bg-red-100", text: "text-red-800", label: "Annulée" },
      EN_ATTENTE: {
        bg: "bg-gray-100",
        text: "text-gray-800",
        label: "En attente",
      },
    };
    const config = statusConfig[statut] || {
      bg: "bg-gray-100",
      text: "text-gray-800",
      label: statut,
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  const getStats = () => {
    const total = livraisons.length;
    const assignees = livraisons.filter((l) => l.statut === "ASSIGNEE").length;
    const enCours = livraisons.filter((l) => l.statut === "EN_COURS").length;
    const livrees = livraisons.filter((l) => l.statut === "LIVREE").length;
    const annulees = livraisons.filter((l) => l.statut === "ANNULEE").length;
    return { total, assignees, enCours, livrees, annulees };
  };

  const stats = getStats();

  if (loading) return <LoadingSpinner />;

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
                Livraisons
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {filteredLivraisons.length} livraison(s) trouvée(s)
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {selected.length > 0 && (
              <>
                <Button
                  onClick={handlePreview}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  <span className="hidden sm:inline">Prévisualiser</span>
                  <span className="sm:hidden">Prévis.</span>({selected.length})
                </Button>
                <Button
                  onClick={handleBatchPrint}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span className="hidden sm:inline">Imprimer</span>(
                  {selected.length})
                </Button>
              </>
            )}
            {canCreateDelivery && (
              <Link to="/livraisons/new" className="w-full sm:w-auto">
                <Button className="flex items-center justify-center gap-2 w-full">
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Nouvelle livraison</span>
                  <span className="sm:hidden">Nouveau</span>
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <Card className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">{stats.total}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Total
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">
                  {stats.assignees}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Assignées
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">{stats.enCours}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  En cours
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">{stats.livrees}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Livrées
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">
                  {stats.annulees}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Annulées
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-primary outline-none bg-card"
            >
              <option value="ALL">Tous les statuts</option>
              <option value="ASSIGNEE">Assignée</option>
              <option value="EN_COURS">En cours</option>
              <option value="LIVREE">Livrée</option>
              <option value="ANNULEE">Annulée</option>
              <option value="EN_ATTENTE">En attente</option>
            </select>
          </div>
        </Card>

        {/* Error */}
        {error && (
          <Card className="border-red-200 bg-red-50 p-4">
            <p className="text-red-800">{error}</p>
          </Card>
        )}

        {/* Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left p-4">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={
                        selected.length === filteredLivraisons.length &&
                        filteredLivraisons.length > 0
                      }
                      className="w-4 h-4 rounded border-gray-300"
                    />
                  </th>
                  <th className="text-left p-4 font-semibold text-foreground">
                    ID
                  </th>
                  <th className="text-left p-4 font-semibold text-foreground">
                    N° Suivi
                  </th>
                  <th className="text-left p-4 font-semibold text-foreground">
                    Livreur
                  </th>
                  <th className="text-left p-4 font-semibold text-foreground">
                    Destinataire
                  </th>
                  <th className="text-left p-4 font-semibold text-foreground">
                    Statut
                  </th>
                  <th className="text-left p-4 font-semibold text-foreground">
                    Date
                  </th>
                  <th className="text-left p-4 font-semibold text-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredLivraisons.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="p-8 text-center text-muted-foreground"
                    >
                      Aucune livraison trouvée
                    </td>
                  </tr>
                ) : (
                  filteredLivraisons.map((livraison) => (
                    <tr
                      key={livraison.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selected.includes(livraison.id)}
                          onChange={() => handleSelect(livraison.id)}
                          className="w-4 h-4 rounded border-gray-300"
                        />
                      </td>
                      <td className="p-4">
                        <span className="font-medium">#{livraison.id}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-primary" />
                          <span className="font-medium">
                            {livraison.colis_numero || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm">
                          {livraison.livreur_nom || "Non assigné"}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm">
                          {livraison.destinataire_nom || "N/A"}
                        </span>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(livraison.statut)}
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-muted-foreground">
                          {livraison.date_assignation
                            ? new Date(
                                livraison.date_assignation
                              ).toLocaleDateString("fr-FR")
                            : "N/A"}
                        </span>
                      </td>
                      <td className="p-4">
                        {canViewDeliveryDetails && (
                          <Link to={`/livraisons/${livraison.id}`}>
                            <button className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-b">
              <h2 className="text-lg sm:text-xl font-bold">
                Prévisualisation ({selected.length})
              </h2>
              <div className="flex gap-2">
                <Button
                  onClick={handlePrint}
                  className="flex items-center gap-2 flex-1 sm:flex-initial"
                >
                  <Printer className="w-4 h-4" />
                  Imprimer
                </Button>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4 sm:p-6 bg-gray-50">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {livraisons
                  .filter((l) => selected.includes(l.id))
                  .map((l) => (
                    <Card key={l.id} className="p-4 bg-white">
                      {l.colis_numero ? (
                        <div className="font-mono">
                          <div className="text-center mb-3 text-base sm:text-lg font-bold">
                            KID Livraison
                          </div>
                          <div className="text-center mb-4 text-lg sm:text-xl font-bold">
                            {l.colis_numero}
                          </div>
                          <div className="border-2 border-black p-2 mb-3">
                            <div className="text-sm font-bold">
                              Destinataire:
                            </div>
                            <div className="text-sm">
                              {l.destinataire_nom || "N/A"}
                            </div>
                          </div>
                          <div className="text-xs sm:text-sm space-y-1">
                            <div>
                              <strong>Livreur:</strong> {l.livreur_nom || "N/A"}
                            </div>
                            <div>
                              <strong>Date:</strong>{" "}
                              {l.date_assignation
                                ? new Date(
                                    l.date_assignation
                                  ).toLocaleDateString("fr-FR")
                                : "N/A"}
                            </div>
                            <div>
                              <strong>Statut:</strong>{" "}
                              {getStatusBadge(l.statut)}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm">
                          <div className="mb-2">
                            <strong>ID:</strong> #{l.id}
                          </div>
                          <div>
                            <strong>Destinataire:</strong>{" "}
                            {l.destinataire_nom || "N/A"}
                          </div>
                          <div>
                            <strong>Livreur:</strong> {l.livreur_nom || "N/A"}
                          </div>
                        </div>
                      )}
                    </Card>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden print area */}
      <div style={{ display: "none" }}>
        <div ref={printRef}>
          {livraisons
            .filter((l) => selected.includes(l.id))
            .map((l) => (
              <div
                key={l.id}
                style={{ marginBottom: "10mm", pageBreakAfter: "always" }}
              >
                {l.colis_numero ? (
                  <div
                    style={{
                      width: "102mm",
                      padding: "10mm",
                      fontFamily: "monospace",
                    }}
                  >
                    <div
                      style={{
                        textAlign: "center",
                        marginBottom: "6mm",
                        fontSize: "16px",
                        fontWeight: "bold",
                      }}
                    >
                      KID Livraison
                    </div>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: "700",
                        textAlign: "center",
                        marginBottom: "8mm",
                      }}
                    >
                      {l.colis_numero}
                    </div>
                    <div
                      style={{
                        border: "2px solid #000",
                        padding: "4mm",
                        marginBottom: "6mm",
                      }}
                    >
                      <div style={{ fontSize: "12px" }}>
                        <strong>Destinataire:</strong>
                      </div>
                      <div style={{ fontSize: "12px" }}>
                        {l.destinataire_nom || "N/A"}
                      </div>
                    </div>
                    <div style={{ fontSize: "12px" }}>
                      <div>
                        <strong>Livreur:</strong> {l.livreur_nom || "N/A"}
                      </div>
                      <div>
                        <strong>Date:</strong>{" "}
                        {l.date_assignation
                          ? new Date(l.date_assignation).toLocaleDateString(
                              "fr-FR"
                            )
                          : "N/A"}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: "8px", border: "1px solid #ccc" }}>
                    <div>
                      <strong>ID:</strong> {l.id}
                    </div>
                    <div>
                      <strong>Destinataire:</strong>{" "}
                      {l.destinataire_nom || "N/A"}
                    </div>
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default LivraisonsList;
