import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Plus, Edit2, Trash2, Search, Download } from 'lucide-react';
import { getAllFactures, deleteFacture } from '../services/factureService';
import LoadingSpinner from '../components/LoadingSpinner';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../contexts/AuthContext';

function FacturesList() {
  const [factures, setFactures] = useState([]);
  const [filteredFactures, setFilteredFactures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const { user } = useAuth();

  useEffect(() => {
    fetchFactures();
  }, []);

  useEffect(() => {
    filterFactures();
  }, [searchTerm, statusFilter, factures]);

  const fetchFactures = async () => {
    try {
      const data = await getAllFactures();
      setFactures(data);
      setFilteredFactures(data);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des factures.');
    } finally {
      setLoading(false);
    }
  };

  const filterFactures = () => {
    let filtered = [...factures];

    if (searchTerm) {
      filtered = filtered.filter(f =>
        f.numero_facture?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.colis?.numero_suivi?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(f => f.statut_paiement === statusFilter);
    }

    setFilteredFactures(filtered);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) {
      try {
        await deleteFacture(id);
        fetchFactures();
      } catch (err) {
        setError(err.message || 'Erreur lors de la suppression de la facture.');
      }
    }
  };

  const getStatusBadge = (statut) => {
    const styles = {
      'PAYEE': 'bg-green-100 text-green-800 border-green-200',
      'EN_ATTENTE': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'ANNULEE': 'bg-red-100 text-red-800 border-red-200',
    };
    return styles[statut] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatAmount = (amount) => {
    if (!amount) return '0.00';
    return parseFloat(amount).toFixed(2);
  };

  const canManage = user?.role === 'ADMIN' || user?.role === 'GESTIONNAIRE';

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-muted/30 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Factures</h1>
              <p className="text-muted-foreground mt-1">
                {filteredFactures.length} facture(s) trouvée(s)
              </p>
            </div>
          </div>
          {canManage && (
            <Link to="/factures/new">
              <Button className="flex items-center gap-2 w-full sm:w-auto">
                <Plus className="w-4 h-4" />
                Nouvelle facture
              </Button>
            </Link>
          )}
        </div>

        {/* Filters */}
        <Card className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder="Rechercher par numéro de facture ou de suivi..."
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
              <option value="PAYEE">Payée</option>
              <option value="EN_ATTENTE">En attente</option>
              <option value="ANNULEE">Annulée</option>
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
                  <th className="text-left p-3 sm:p-4 font-semibold text-foreground">N° Facture</th>
                  <th className="text-left p-3 sm:p-4 font-semibold text-foreground hidden lg:table-cell">N° Suivi</th>
                  <th className="text-left p-3 sm:p-4 font-semibold text-foreground hidden md:table-cell">Date</th>
                  <th className="text-left p-3 sm:p-4 font-semibold text-foreground">Montant</th>
                  <th className="text-left p-3 sm:p-4 font-semibold text-foreground">Statut</th>
                  <th className="text-left p-3 sm:p-4 font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredFactures.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-muted-foreground">
                      Aucune facture trouvée
                    </td>
                  </tr>
                ) : (
                  filteredFactures.map((facture) => (
                    <tr key={facture.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 sm:p-4">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-primary" />
                          <span className="font-mono text-sm font-medium">{facture.numero_facture}</span>
                        </div>
                        {/* Informations empilées sur mobile */}
                        <div className="flex flex-col gap-1 mt-2 lg:hidden">
                          <span className="text-xs text-muted-foreground">
                            <strong>Suivi:</strong> {facture.colis?.numero_suivi || 'N/A'}
                          </span>
                          <span className="text-xs text-muted-foreground md:hidden">
                            <strong>Date:</strong> {formatDate(facture.date_emission)}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 sm:p-4 text-sm hidden lg:table-cell">
                        {facture.colis?.numero_suivi || 'N/A'}
                      </td>
                      <td className="p-3 sm:p-4 text-sm hidden md:table-cell">
                        {formatDate(facture.date_emission)}
                      </td>
                      <td className="p-3 sm:p-4">
                        <span className="font-semibold text-green-600">
                          {formatAmount(facture.montant_total)} DH
                        </span>
                      </td>
                      <td className="p-3 sm:p-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(facture.statut_paiement)}`}>
                          {facture.statut_paiement_display || facture.statut_paiement}
                        </span>
                      </td>
                      <td className="p-3 sm:p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => window.open(`/api/factures/${facture.id}/pdf/`, '_blank')}
                            className="p-2 hover:bg-green-50 rounded-lg text-green-600 transition-colors"
                            title="Télécharger PDF"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          {canManage && (
                            <>
                              <Link to={`/factures/edit/${facture.id}`}>
                                <button className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors">
                                  <Edit2 className="w-4 h-4" />
                                </button>
                              </Link>
                              <button 
                                onClick={() => handleDelete(facture.id)}
                                className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
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

export default FacturesList;
