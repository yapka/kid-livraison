import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Truck,
  Plus,
  Edit2,
  Trash2,
  Search,
  AlertCircle,
  User,
  Phone,
  MapPin,
} from "lucide-react";
import { getAllLivreurs, deleteLivreur } from "../services/livreurService";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../contexts/AuthContext";

function LivreursList() {
  const [livreurs, setLivreurs] = useState([]);
  const [filteredLivreurs, setFilteredLivreurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const { user } = useAuth();

  const canManageLivreurs =
    user?.role === "ADMIN" || user?.role === "GESTIONNAIRE";

  useEffect(() => {
    fetchLivreurs();
  }, []);

  useEffect(() => {
    filterLivreurs();
  }, [searchTerm, statusFilter, livreurs]);

  const fetchLivreurs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllLivreurs();
      setLivreurs(data);
    } catch (err) {
      console.error("Error fetching livreurs:", err);
      if (
        err.message.includes("Failed to fetch") ||
        err.message.includes("Network")
      ) {
        setError(
          "Erreur de connexion au serveur. Vérifiez que le backend est démarré."
        );
      } else {
        setError(err.message || "Erreur lors du chargement des livreurs");
      }
    } finally {
      setLoading(false);
    }
  };

  const filterLivreurs = () => {
    let filtered = [...livreurs];

    // Filtre de recherche
    if (searchTerm) {
      filtered = filtered.filter(
        (livreur) =>
          livreur.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          livreur.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          livreur.telephone?.includes(searchTerm) ||
          livreur.matricule?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par statut
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((livreur) => livreur.statut === statusFilter);
    }

    setFilteredLivreurs(filtered);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce livreur ?")) {
      return;
    }
    try {
      await deleteLivreur(id);
      setLivreurs(livreurs.filter((l) => l.id !== id));
    } catch (err) {
      console.error("Error deleting livreur:", err);
      alert("Erreur lors de la suppression du livreur");
    }
  };

  const getStatusBadge = (statut) => {
    const styles = {
      ACTIF: "bg-green-100 text-green-800 border-green-200",
      INACTIF: "bg-gray-100 text-gray-800 border-gray-200",
      EN_MISSION: "bg-blue-100 text-blue-800 border-blue-200",
      EN_REPOS: "bg-yellow-100 text-yellow-800 border-yellow-200",
    };
    return styles[statut] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getStatusLabel = (statut) => {
    const labels = {
      ACTIF: "✓ Actif",
      INACTIF: "○ Inactif",
      EN_MISSION: "🚚 En mission",
      EN_REPOS: "⏸ En repos",
    };
    return labels[statut] || statut;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-muted/30 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Truck className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Liste des livreurs
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {filteredLivreurs.length} livreur
                {filteredLivreurs.length !== 1 ? "s" : ""} trouvé
                {filteredLivreurs.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          {canManageLivreurs && (
            <Link to="/livreurs/create" className="w-full sm:w-auto">
              <Button
                variant="primary"
                className="flex items-center justify-center gap-2 w-full"
              >
                <Plus className="w-4 h-4" />
                Nouveau livreur
              </Button>
            </Link>
          )}
        </div>

        {/* Erreur */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <div className="flex items-center gap-3 text-red-800 p-4">
              <AlertCircle className="w-5 h-5" />
              <div className="flex-1">
                <p className="font-medium">{error}</p>
              </div>
              <Button onClick={fetchLivreurs} variant="outline" size="sm">
                Réessayer
              </Button>
            </div>
          </Card>
        )}

        {/* Filtres */}
        <Card>
          <div className="p-4 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
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
                <option value="ACTIF">Actif</option>
                <option value="INACTIF">Inactif</option>
                <option value="EN_MISSION">En mission</option>
                <option value="EN_REPOS">En repos</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Livreur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Matricule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Véhicule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Statut
                  </th>
                  {canManageLivreurs && (
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {filteredLivreurs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={canManageLivreurs ? 6 : 5}
                      className="px-6 py-12 text-center"
                    >
                      <Truck className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                      <p className="text-muted-foreground">
                        {searchTerm || statusFilter !== "ALL"
                          ? "Aucun livreur ne correspond à votre recherche"
                          : "Aucun livreur enregistré"}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredLivreurs.map((livreur) => (
                    <tr
                      key={livreur.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium text-foreground">
                              {livreur.nom} {livreur.prenom}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              ID: {livreur.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span>{livreur.telephone || "-"}</span>
                        </div>
                        {livreur.email && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {livreur.email}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm">
                          {livreur.matricule || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          {livreur.vehicule ? (
                            <>
                              <div className="font-medium">
                                {livreur.vehicule.type}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {livreur.vehicule.immatriculation}
                              </div>
                            </>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(
                            livreur.statut
                          )}`}
                        >
                          {getStatusLabel(livreur.statut)}
                        </span>
                      </td>
                      {canManageLivreurs && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <Link to={`/livreurs/edit/${livreur.id}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(livreur.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
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

export default LivreursList;
