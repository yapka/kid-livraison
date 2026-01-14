import React, { useEffect, useState } from "react";
import KpiCard from "../components/KpiCard";
import { getAllColis } from "../services/colisService";
import LoadingSpinner from "../components/LoadingSpinner";
import Button from "../components/ui/Button";
import {
  Calendar,
  Plus,
  Package,
  Filter,
  Download,
  Truck,
  MapPin,
  Clock,
  MoreVertical,
  CheckCircle,
  Check,
  FileText,
  TrendingUp,
} from "lucide-react";
import Card from "../components/ui/Card";
import LivraisonColis from "../components/LivraisonColis";
import { useAuth } from "../contexts/AuthContext";

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentColis, setRecentColis] = useState([]);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (user && recentColis.length > 0) {
      console.log("DEBUG Colis pour filtrage opérateur:", recentColis);
      console.log("DEBUG user.id:", user.id, "user.role:", user.role);
    }
  }, [user, recentColis]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllColis();

      // Filtrage opérateur : ne garder que ses colis
      let filteredData = data;
      if (user?.role === "OPERATEUR") {
        filteredData = data.filter((d) => d.utilisateur_id === user.id);
      }

      // compute basic KPIs from filteredData
      const total = filteredData.length;
      const enTransit = filteredData.filter(
        (d) =>
          d.statut === "EN_TRANSIT" ||
          d.statut_display?.toLowerCase?.().includes("transit")
      ).length;
      const enRetard = filteredData.filter(
        (d) =>
          d.en_retard ||
          (d.statut_display &&
            d.statut_display.toLowerCase().includes("retard"))
      ).length;
      const aLHeurePct = total
        ? Math.round(((total - enRetard) / total) * 100)
        : 100;

      setStats({ total, enTransit, enRetard, aLHeurePct });

      // Garder les 5 derniers colis (filtrés)
      setRecentColis(filteredData.slice(0, 5));
    } catch (error) {
      if (error.isNetworkError) {
        setError("API indisponible. Vérifiez votre connexion.");
      } else {
        setError(
          error.message || "Erreur lors du chargement des statistiques."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error)
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 font-medium mb-2">{error}</p>
          <Button onClick={fetchStats} variant="primary">
            Réessayer
          </Button>
        </div>
      </div>
    );

  // Filter recentColis for OPERATEUR to only show their own actions (example: colis assigned to them)
  let filteredRecentColis = recentColis;
  if (user?.role === "OPERATEUR") {
    filteredRecentColis = recentColis.filter(
      (colis) => colis.utilisateur_id === user.id
    );
  }

  return (
    <main className="min-h-screen bg-muted/30 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
                Tableau de bord{" "}
                {user?.role === "OPERATEUR"
                  ? "(Opérateur)"
                  : user?.role === "ADMIN"
                  ? "(Admin)"
                  : ""}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 flex items-center gap-2">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4" aria-hidden />
                <span className="hidden sm:inline">
                  {new Date().toLocaleDateString("fr-FR", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                <span className="sm:hidden">
                  {new Date().toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </p>
            </div>
          </div>

          <a href="/colis/new" className="w-full sm:w-auto">
            <Button
              variant="primary"
              className="flex items-center justify-center gap-2 px-6 py-3 shadow-md w-full"
            >
              <Plus className="w-5 h-5" aria-hidden />
              <span className="hidden sm:inline">Enregistrer un colis</span>
              <span className="sm:hidden">Nouveau colis</span>
            </Button>
          </a>
        </div>

        {/* VERSION SIMPLIFIÉE - KPIs essentiels uniquement */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <KpiCard title="Total colis" value={stats.total} />
          <KpiCard
            title="En attente"
            value={stats.total - stats.enTransit}
            color="var(--secondary)"
          />
          <KpiCard
            title="En transit"
            value={stats.enTransit}
            color="var(--accent)"
          />
        </div>

        <Card>
          <div className="p-3 sm:p-4 lg:p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <Package
                className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground"
                aria-hidden
              />
              <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-foreground">
                <span className="hidden sm:inline">
                  Derniers colis enregistrés
                </span>
                <span className="sm:hidden">Derniers colis</span>
              </h2>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 border border-border rounded-lg hover:bg-popover transition text-sm">
                <Filter className="w-4 h-4" aria-hidden />
                <span className="font-medium hidden sm:inline">Filtrer</span>
              </button>
              <a
                href="/colis"
                className="text-xs sm:text-sm text-primary hover:underline font-medium whitespace-nowrap"
              >
                Tout voir →
              </a>
            </div>
          </div>

          <div className="divide-y divide-border">
            {filteredRecentColis.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Aucun colis enregistré pour le moment</p>
              </div>
            ) : (
              filteredRecentColis.map((colis) => {
                const statusConfig = {
                  EN_ATTENTE: {
                    label: "EN ATTENTE",
                    color: "bg-yellow-100 text-yellow-800",
                    icon: Clock,
                  },
                  EN_TRANSIT: {
                    label: "EN TRANSIT",
                    color: "bg-secondary/10 text-secondary-foreground",
                    icon: Truck,
                  },
                  LIVRE: {
                    label: "LIVRÉ",
                    color: "bg-green-100 text-green-800",
                    icon: CheckCircle,
                  },
                  ANNULE: {
                    label: "ANNULÉ",
                    color: "bg-red-100 text-red-800",
                    icon: Clock,
                  },
                };

                const config =
                  statusConfig[colis.statut] || statusConfig.EN_ATTENTE;
                const StatusIcon = config.icon;

                return (
                  <div
                    key={colis.id}
                    className="p-4 sm:p-6 hover:bg-popover transition cursor-pointer"
                    onClick={() =>
                      (window.location.href = `/colis/${colis.id}`)
                    }
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                          <span className="text-base sm:text-lg font-semibold text-primary">
                            {colis.numero_suivi || `#${colis.id}`}
                          </span>
                          <span
                            className={`px-3 py-1 ${config.color} rounded-full text-xs font-medium flex items-center gap-1`}
                          >
                            <StatusIcon className="w-3 h-3" aria-hidden />
                            {config.label}
                          </span>
                        </div>
                        <div className="mb-3">
                          <div className="text-sm sm:text-base font-medium text-foreground truncate">
                            {colis.expediteur_nom || "N/A"} →{" "}
                            {colis.destinataire_nom || "N/A"}
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" aria-hidden />
                            <span className="hidden sm:inline">
                              {colis.expediteur_ville || "N/A"} →{" "}
                              {colis.destinataire_ville || "N/A"}
                            </span>
                            <span className="sm:hidden">
                              {colis.expediteur_ville || "N/A"}
                            </span>
                          </span>
                          {colis.poids && (
                            <span className="flex items-center gap-1">
                              <Package className="w-4 h-4" aria-hidden />
                              {colis.poids} kg
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" aria-hidden />
                            {new Date(colis.date_creation).toLocaleDateString(
                              "fr-FR",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              }
                            )}
                            {" à "}
                            {new Date(colis.date_creation).toLocaleTimeString(
                              "fr-FR",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = `/colis/${colis.id}`;
                          }}
                          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-95 transition"
                        >
                          <span className="hidden sm:inline">Voir détails</span>
                          <span className="sm:hidden">Détails</span>
                        </button>
                        <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-popover rounded-lg transition">
                          <MoreVertical className="w-5 h-5" aria-hidden />
                        </button>
                        {/* Remise du colis supprimée du dashboard */}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>
    </main>
  );
}

export default Dashboard;
