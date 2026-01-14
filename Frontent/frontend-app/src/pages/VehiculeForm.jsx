import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Truck, ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { createVehicule, getVehiculeById, updateVehicule } from '../services/vehiculeService';
import LoadingSpinner from '../components/LoadingSpinner';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { useAuth } from '../contexts/AuthContext';

function VehiculeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    immatriculation: '',
    marque: '',
    modele: '',
    type_vehicule: 'VOITURE',
    annee: new Date().getFullYear(),
    capacite_charge: '',
    volume_utile: '',
    statut: 'DISPONIBLE',
    kilometrage: '',
    date_derniere_revision: '',
    date_visite_technique: '',
    date_assurance: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const canManageVehicules = user?.role === 'ADMIN' || user?.role === 'GESTIONNAIRE';

  useEffect(() => {
    if (id) {
      fetchVehicule();
    }
  }, [id]);

  const fetchVehicule = async () => {
    setLoading(true);
    try {
      const vehicule = await getVehiculeById(id);
      setFormData({
        immatriculation: vehicule.immatriculation || '',
        marque: vehicule.marque || '',
        modele: vehicule.modele || '',
        type_vehicule: vehicule.type_vehicule || 'VOITURE',
        annee: vehicule.annee || new Date().getFullYear(),
        capacite_charge: vehicule.capacite_charge || '',
        volume_utile: vehicule.volume_utile || '',
        statut: vehicule.statut || 'DISPONIBLE',
        kilometrage: vehicule.kilometrage || '',
        date_derniere_revision: vehicule.date_derniere_revision || '',
        date_visite_technique: vehicule.date_visite_technique || '',
        date_assurance: vehicule.date_assurance || '',
      });
    } catch (err) {
      console.error('Error fetching vehicule:', err);
      setSubmitError('Erreur lors du chargement du véhicule');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  };

  const validateForm = () => {
    let formIsValid = true;
    let newErrors = {};

    if (!formData.immatriculation || formData.immatriculation.trim().length < 3) {
      newErrors.immatriculation = 'L\'immatriculation est requise (min 3 caractères)';
      formIsValid = false;
    }

    if (!formData.marque || formData.marque.trim().length < 2) {
      newErrors.marque = 'La marque est requise (min 2 caractères)';
      formIsValid = false;
    }

    if (!formData.modele || formData.modele.trim().length < 2) {
      newErrors.modele = 'Le modèle est requis (min 2 caractères)';
      formIsValid = false;
    }

    if (!formData.volume_utile) {
      newErrors.volume_utile = 'Le volume utile est requis';
      formIsValid = false;
    }

    if (!formData.date_visite_technique) {
      newErrors.date_visite_technique = 'La date de visite technique est requise';
      formIsValid = false;
    }

    if (!formData.date_assurance) {
      newErrors.date_assurance = 'La date d\'assurance est requise';
      formIsValid = false;
    }

    setErrors(newErrors);
    return formIsValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const dataToSubmit = {
        immatriculation: formData.immatriculation.trim(),
        marque: formData.marque.trim(),
        modele: formData.modele.trim(),
        type_vehicule: formData.type_vehicule,
        annee: parseInt(formData.annee),
        capacite_charge: formData.capacite_charge ? parseFloat(formData.capacite_charge) : null,
        volume_utile: parseFloat(formData.volume_utile),
        statut: formData.statut,
        kilometrage: formData.kilometrage ? parseInt(formData.kilometrage) : null,
        date_derniere_revision: formData.date_derniere_revision || null,
        date_visite_technique: formData.date_visite_technique,
        date_assurance: formData.date_assurance,
      };

      console.log('Submitting vehicule data:', dataToSubmit);

      if (id) {
        await updateVehicule(id, dataToSubmit);
        alert('Véhicule mis à jour avec succès!');
      } else {
        await createVehicule(dataToSubmit);
        alert('Véhicule créé avec succès!');
      }
      navigate('/vehicules');
    } catch (err) {
      console.error('Error submitting form:', err);
      console.error('Error response:', err.response);
      
      let errorMessage = 'Une erreur est survenue lors de la soumission';
      
      if (err.response?.data) {
        console.error('Error data:', err.response.data);
        
        if (typeof err.response.data === 'object' && !Array.isArray(err.response.data)) {
          const errors = [];
          for (const [field, messages] of Object.entries(err.response.data)) {
            const errorList = Array.isArray(messages) ? messages.join(', ') : messages;
            errors.push(`${field}: ${errorList}`);
          }
          errorMessage = errors.join('\n');
        } else {
          errorMessage = typeof err.response.data === 'string' 
            ? err.response.data 
            : JSON.stringify(err.response.data, null, 2);
        }
        
        setSubmitError(`Erreur ${err.response.status}: ${errorMessage}`);
      } else {
        setSubmitError(err.message || errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading && id) return <LoadingSpinner />;

  if (!canManageVehicules) {
    return (
      <div className="min-h-screen bg-muted/30 p-6 flex items-center justify-center">
        <Card className="max-w-md w-full p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Accès refusé</h2>
          <p className="text-muted-foreground mb-4">
            Vous n'avez pas la permission de gérer les véhicules.
          </p>
          <Link to="/vehicules">
            <Button variant="outline">Retour à la liste</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/vehicules">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Truck className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {id ? 'Modifier le véhicule' : 'Nouveau véhicule'}
              </h1>
              <p className="text-muted-foreground mt-1">
                {id ? 'Modifiez les informations du véhicule' : 'Créez un nouveau véhicule'}
              </p>
            </div>
          </div>
        </div>

        {/* Erreur globale */}
        {submitError && (
          <Card className="border-red-200 bg-red-50">
            <div className="p-4">
              <div className="flex items-center gap-3 text-red-800 mb-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <h3 className="font-semibold">Erreur de soumission</h3>
              </div>
              <pre className="text-sm text-red-700 whitespace-pre-wrap font-mono bg-red-100 p-3 rounded overflow-auto max-h-64">
                {submitError}
              </pre>
            </div>
          </Card>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations du véhicule */}
          <Card>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b border-border">
                <Truck className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Informations du véhicule</h2>
                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full ml-auto">Obligatoire</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Input
                    label={<span>Immatriculation <span className="text-red-500">*</span></span>}
                    type="text"
                    name="immatriculation"
                    value={formData.immatriculation}
                    onChange={handleChange}
                    placeholder="AA-1234-CI"
                    required
                  />
                  {errors.immatriculation && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.immatriculation}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Input
                    label={<span>Marque <span className="text-red-500">*</span></span>}
                    type="text"
                    name="marque"
                    value={formData.marque}
                    onChange={handleChange}
                    placeholder="Toyota"
                    required
                  />
                  {errors.marque && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.marque}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Input
                    label={<span>Modèle <span className="text-red-500">*</span></span>}
                    type="text"
                    name="modele"
                    value={formData.modele}
                    onChange={handleChange}
                    placeholder="Hilux"
                    required
                  />
                  {errors.modele && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.modele}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block">
                    <div className="text-sm font-medium text-muted-foreground mb-2">Type de véhicule <span className="text-red-500">*</span></div>
                    <select
                      name="type_vehicule"
                      value={formData.type_vehicule}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-primary outline-none bg-card"
                      required
                    >
                      <option value="VOITURE">Voiture</option>
                      <option value="MOTO">Moto</option>
                      <option value="CAMION">Camion</option>
                      <option value="CAMIONNETTE">Camionnette</option>
                      <option value="SCOOTER">Scooter</option>
                    </select>
                  </label>
                </div>

                <div className="space-y-2">
                  <Input
                    label="Année"
                    type="number"
                    name="annee"
                    value={formData.annee}
                    onChange={handleChange}
                    placeholder="2024"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                  />
                </div>

                <div className="space-y-2">
                  <Input
                    label={<span>Volume utile (m³) <span className="text-red-500">*</span></span>}
                    type="number"
                    name="volume_utile"
                    value={formData.volume_utile}
                    onChange={handleChange}
                    placeholder="15"
                    step="0.01"
                    required
                  />
                  {errors.volume_utile && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.volume_utile}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Input
                    label="Capacité de charge (kg)"
                    type="number"
                    name="capacite_charge"
                    value={formData.capacite_charge}
                    onChange={handleChange}
                    placeholder="1000"
                    step="0.01"
                  />
                </div>

                <div className="space-y-2">
                  <Input
                    label="Kilométrage"
                    type="number"
                    name="kilometrage"
                    value={formData.kilometrage}
                    onChange={handleChange}
                    placeholder="50000"
                  />
                </div>

                <div className="space-y-2">
                  <Input
                    label="Date dernière révision"
                    type="date"
                    name="date_derniere_revision"
                    value={formData.date_derniere_revision}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Input
                    label={<span>Date visite technique <span className="text-red-500">*</span></span>}
                    type="date"
                    name="date_visite_technique"
                    value={formData.date_visite_technique}
                    onChange={handleChange}
                    required
                  />
                  {errors.date_visite_technique && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.date_visite_technique}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Input
                    label={<span>Date assurance <span className="text-red-500">*</span></span>}
                    type="date"
                    name="date_assurance"
                    value={formData.date_assurance}
                    onChange={handleChange}
                    required
                  />
                  {errors.date_assurance && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.date_assurance}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block">
                    <div className="text-sm font-medium text-muted-foreground mb-2">Statut <span className="text-red-500">*</span></div>
                    <select
                      name="statut"
                      value={formData.statut}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-primary outline-none bg-card"
                      required
                    >
                      <option value="DISPONIBLE">✓ Disponible</option>
                      <option value="EN_SERVICE">🚚 En service</option>
                      <option value="EN_PANNE">❌ En panne</option>
                      <option value="EN_MAINTENANCE">🔧 En maintenance</option>
                      <option value="HORS_SERVICE">⛔ Hors service</option>
                    </select>
                  </label>
                </div>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3 sticky bottom-0 bg-background/95 backdrop-blur-sm p-4 rounded-lg border border-border">
            <Link to="/vehicules">
              <Button type="button" variant="outline">
                Annuler
              </Button>
            </Link>
            <Button type="submit" variant="primary" disabled={loading} className="flex items-center gap-2">
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {id ? 'Mettre à jour' : 'Créer'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default VehiculeForm;
