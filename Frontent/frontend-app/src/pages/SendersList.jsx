
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { UserCheck, Plus, Edit2, Trash2, Search, Phone, MapPin } from 'lucide-react';
import { getAllExpediteurs, deleteExpediteur } from '../services/expediteurService';
import LoadingSpinner from '../components/LoadingSpinner';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../contexts/AuthContext';

function SendersList() {
  const [senders, setSenders] = useState([]);
  const [filteredSenders, setFilteredSenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchSenders();
  }, []);

  useEffect(() => {
    filterSenders();
  }, [searchTerm, senders]);

  const fetchSenders = async () => {
    try {
      const data = await getAllExpediteurs();
      setSenders(data);
      setFilteredSenders(data);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des expéditeurs.');
    } finally {
      setLoading(false);
    }
  };

  const filterSenders = () => {
    if (searchTerm) {
      const filtered = senders.filter(s =>
        s.nom_complet?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.telephone?.includes(searchTerm) ||
        s.ville?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSenders(filtered);
    } else {
      setFilteredSenders(senders);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet expéditeur ?')) {
      try {
        await deleteExpediteur(id);
        fetchSenders();
      } catch (err) {
        setError(err.message || 'Erreur lors de la suppression de l\'expéditeur.');
      }
    }
  };

  const canManage = user?.role === 'ADMIN' || user?.role === 'OPERATEUR';

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-muted/30 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <UserCheck className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Expéditeurs</h1>
              <p className="text-muted-foreground mt-1">
                {filteredSenders.length} expéditeur(s) trouvé(s)
              </p>
            </div>
          </div>
          {canManage && (
            <Link to="/expediteurs/new">
              <Button className="flex items-center gap-2 w-full sm:w-auto">
                <Plus className="w-4 h-4" />
                Nouvel expéditeur
              </Button>
            </Link>
          )}
        </div>

        {/* Search */}
        <Card className="p-4 sm:p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="Rechercher par nom, téléphone ou ville..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
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
                  <th className="text-left p-3 sm:p-4 font-semibold text-foreground">ID</th>
                  <th className="text-left p-3 sm:p-4 font-semibold text-foreground">Nom Complet</th>
                  <th className="text-left p-3 sm:p-4 font-semibold text-foreground hidden md:table-cell">Téléphone</th>
                  <th className="text-left p-3 sm:p-4 font-semibold text-foreground hidden lg:table-cell">Ville</th>
                  <th className="text-left p-3 sm:p-4 font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredSenders.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-muted-foreground">
                      Aucun expéditeur trouvé
                    </td>
                  </tr>
                ) : (
                  filteredSenders.map((sender) => (
                    <tr key={sender.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 sm:p-4">
                        <span className="font-medium">#{sender.id}</span>
                      </td>
                      <td className="p-3 sm:p-4">
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-primary" />
                          <span className="font-medium">{sender.nom_complet}</span>
                        </div>
                        <div className="flex flex-col gap-1 mt-2 md:hidden">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {sender.telephone}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {sender.ville}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 sm:p-4 hidden md:table-cell">
                        <span className="text-sm">{sender.telephone}</span>
                      </td>
                      <td className="p-3 sm:p-4 hidden lg:table-cell">
                        <span className="text-sm">{sender.ville}</span>
                      </td>
                      <td className="p-3 sm:p-4">
                        {canManage && (
                          <div className="flex gap-2">
                            <Link to={`/expediteurs/edit/${sender.id}`}>
                              <button className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors">
                                <Edit2 className="w-4 h-4" />
                              </button>
                            </Link>
                            <button 
                              onClick={() => handleDelete(sender.id)}
                              className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
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
    </div>
  );
}

export default SendersList;
