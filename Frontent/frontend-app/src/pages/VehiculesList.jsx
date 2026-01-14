import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Truck, Plus, Edit2, Trash2, Search, AlertCircle } from "lucide-react";
import { getAllVehicules, deleteVehicule } from "../services/vehiculeService";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../contexts/AuthContext";

function VehiculesList() {
  const [vehicules, setVehicules] = useState([]);
  const [filteredVehicules, setFilteredVehicules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const { user } = useAuth();

  const canManageVehicules =
    user?.role === "ADMIN" || user?.role === "GESTIONNAIRE";

  useEffect(() => {
    fetchVehicules();
  }, []);

  useEffect(() => {
    filterVehicules();
  }, [searchTerm, statusFilter, vehicules]);

  const fetchVehicules = async () => {
    setLoading(true);
    try {
      const data = await getAllVehicules();
      setVehicules(data);
      setFilteredVehicules(data);
    } catch (err) {
      console.error("Error fetching vehicules:", err);
      setError("Erreur lors du chargement des véhicules");
    } finally {
      setLoading(false);
    }
  };

  const filterVehicules = () => {
    let filtered = vehicules;

    if (searchTerm) {
      filtered = filtered.filter(
        (v) =>
          v.immatriculation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          v.modele?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          v.marque?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "ALL") {
      filtered = filtered.filter((v) => v.statut === statusFilter);
    }

    setFilteredVehicules(filtered);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce véhicule ?")) {
      return;
    }

    try {
      await deleteVehicule(id);
      fetchVehicules();
    } catch (err) {
      console.error("Error deleting vehicule:", err);
      alert("Erreur lors de la suppression du véhicule");
    }
  };

  const getStatusBadge = (statut) => {
    const statusConfig = {
      DISPONIBLE: "bg-green-100 text-green-800",
      EN_SERVICE: "bg-blue-100 text-blue-800",
      EN_PANNE: "bg-red-100 text-red-800",
      EN_MAINTENANCE: "bg-yellow-100 text-yellow-800",
      HORS_SERVICE: "bg-gray-100 text-gray-800",
    };
    return statusConfig[statut] || "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (statut) => {
    const labels = {
      DISPONIBLE: "Disponible",
      EN_SERVICE: "En service",
      EN_PANNE: "En panne",
      EN_MAINTENANCE: "En maintenance",
      HORS_SERVICE: "Hors service",
    };
    return labels[statut] || statut;
  };

  if (loading) return <LoadingSpinner />;

  if (!canManageVehicules) {
    return (
      <div className="min-h-screen bg-muted/30 p-6 flex items-center justify-center">
        <Card className="max-w-md w-full p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Accès refusé</h2>
          <p className="text-muted-foreground">
            Vous n'avez pas la permission de gérer les véhicules.
          </p>
        </Card>
      </div>
    );
  }

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
                Gestion des véhicules
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {filteredVehicules.length} véhicule(s) trouvé(s)
              </p>
            </div>
          </div>
          <Link to="/vehicules/create" className="w-full sm:w-auto">
            <Button className="flex items-center justify-center gap-2 w-full">
              <Plus className="w-4 h-4" />
              Nouveau véhicule
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
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
              <option value="DISPONIBLE">Disponible</option>
              <option value="EN_SERVICE">En service</option>
              <option value="EN_PANNE">En panne</option>
              <option value="EN_MAINTENANCE">En maintenance</option>
              <option value="HORS_SERVICE">Hors service</option>
            </select>
          </div>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <div className="flex items-center gap-3 text-red-800 p-4">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          </Card>
        )}

        {/* Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left p-4 font-semibold text-foreground">
                    Immatriculation
                  </th>
                  <th className="text-left p-4 font-semibold text-foreground">
                    Marque/Modèle
                  </th>
                  <th className="text-left p-4 font-semibold text-foreground">
                    Type
                  </th>
                  <th className="text-left p-4 font-semibold text-foreground">
                    Année
                  </th>
                  <th className="text-left p-4 font-semibold text-foreground">
                    Statut
                  </th>
                  <th className="text-left p-4 font-semibold text-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredVehicules.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="p-8 text-center text-muted-foreground"
                    >
                      Aucun véhicule trouvé
                    </td>
                  </tr>
                ) : (
                  filteredVehicules.map((vehicule) => (
                    <tr
                      key={vehicule.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Truck className="w-5 h-5 text-primary" />
                          <span className="font-medium">
                            {vehicule.immatriculation}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{vehicule.marque}</div>
                          <div className="text-sm text-muted-foreground">
                            {vehicule.modele}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm">
                          {vehicule.type_vehicule}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm">
                          {vehicule.annee || "N/A"}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                            vehicule.statut
                          )}`}
                        >
                          {getStatusLabel(vehicule.statut)}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Link to={`/vehicules/edit/${vehicule.id}`}>
                            <button className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors">
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </Link>
                          <button
                            onClick={() => handleDelete(vehicule.id)}
                            className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
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

export default VehiculesList;
