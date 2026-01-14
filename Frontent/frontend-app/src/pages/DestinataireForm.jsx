import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UserX, Save, X, User, Phone, Mail, MapPin, Home } from "lucide-react";
import {
  createDestinataire,
  getDestinataireById,
  updateDestinataire,
} from "../services/destinataireService";
import LoadingSpinner from "../components/LoadingSpinner";
import PhoneInput from "../components/PhoneInput";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { useAuth } from "../contexts/AuthContext";
import { loadDepartementsData } from "../utils/departements";

function DestinataireForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth(); // Access authenticated user info

  // État pour la liste des départements
  const [departements, setDepartements] = useState([]);

  const [formData, setFormData] = useState({
    nom_complet: "",
    telephone: "",
    email: "",
    adresse_complete: "",
    ville: "",
    quartier: "",
    complement_adresse: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    // Charger les départements
    loadDepartementsData().then(setDepartements).catch(console.error);
  }, []);

  useEffect(() => {
    if (id) {
      const fetchDestinataire = async () => {
        try {
          setLoading(true);
          const destinataire = await getDestinataireById(id);
          setFormData({
            nom_complet: destinataire.nom_complet,
            telephone: destinataire.telephone,
            email: destinataire.email || "",
            adresse_complete: destinataire.adresse_complete,
            ville: destinataire.ville,
            quartier: destinataire.quartier,
            complement_adresse: destinataire.complement_adresse || "",
          });
        } catch (err) {
          console.error("Error fetching destinataire:", err);
          setSubmitError("Failed to load destinataire data.");
        } finally {
          setLoading(false);
        }
      };
      fetchDestinataire();
    }
  }, [id]);

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

    if (!formData.nom_complet) {
      newErrors.nom_complet = "Le nom complet est requis.";
      formIsValid = false;
    }
    if (!formData.telephone) {
      newErrors.telephone = "Le téléphone est requis.";
      formIsValid = false;
    }
    if (!formData.adresse_complete) {
      newErrors.adresse_complete = "L'adresse complète est requise.";
      formIsValid = false;
    }
    if (!formData.ville) {
      newErrors.ville = "La ville est requise.";
      formIsValid = false;
    }

    setErrors(newErrors);
    return formIsValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) {
      console.log("Form validation failed:", errors);
      return;
    }

    setLoading(true);
    try {
      if (id) {
        await updateDestinataire(id, formData);
        console.log("Destinataire mis à jour avec succès!");
      } else {
        await createDestinataire(formData);
        console.log("Destinataire créé avec succès!");
      }
      navigate("/destinataires");
    } catch (err) {
      console.error("Error submitting form:", err);
      setSubmitError(
        err.message || "Une erreur est survenue lors de la soumission."
      );
      if (err.response && err.response.data) {
        setErrors(err.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  // Determine if the user has permission to manage destinataires
  const canManageDestinataires =
    user?.role === "ADMIN" || user?.role === "OPERATEUR";

  if (loading && id) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-muted/30 p-4 sm:p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-lg">
            <UserX className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              {id ? "Modifier le destinataire" : "Créer un destinataire"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {id
                ? "Modifiez les informations du destinataire"
                : "Ajoutez un nouveau destinataire"}
            </p>
          </div>
        </div>

        {/* Error Message */}
        {submitError && (
          <Card className="border-red-200 bg-red-50 p-4">
            <p className="text-red-800">{submitError}</p>
          </Card>
        )}

        {/* Form */}
        <Card className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations personnelles */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <User className="w-5 h-5" />
                Informations personnelles
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Nom Complet <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="nom_complet"
                    placeholder="Ex: Fatima Zahra"
                    value={formData.nom_complet}
                    onChange={handleChange}
                    disabled={!canManageDestinataires}
                    className={errors.nom_complet ? "border-red-500" : ""}
                  />
                  {errors.nom_complet && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.nom_complet}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Téléphone <span className="text-red-500">*</span>
                  </label>
                  <PhoneInput
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                    placeholder="0712345678"
                    disabled={!canManageDestinataires}
                    error={!!errors.telephone}
                  />
                  {errors.telephone && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.telephone}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    type="email"
                    name="email"
                    placeholder="Ex: fatima.zahra@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!canManageDestinataires}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Adresse */}
            <div className="space-y-4 pt-4 border-t border-border">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Adresse
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Ville <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="ville"
                    value={formData.ville}
                    onChange={handleChange}
                    disabled={!canManageDestinataires}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-ring focus:border-primary outline-none bg-card text-card-foreground ${
                      errors.ville ? "border-red-500" : "border-border"
                    }`}
                  >
                    <option value="">-- Sélectionner un département --</option>
                    {departements.map((dept) => (
                      <option key={dept.value} value={dept.value}>
                        {dept.label}
                      </option>
                    ))}
                  </select>
                  {errors.ville && (
                    <p className="text-red-500 text-xs mt-1">{errors.ville}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Quartier
                  </label>
                  <Input
                    type="text"
                    name="quartier"
                    placeholder="Ex: Agdal"
                    value={formData.quartier}
                    onChange={handleChange}
                    disabled={!canManageDestinataires}
                  />
                  {errors.quartier && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.quartier}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Adresse Complète <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="adresse_complete"
                  placeholder="Ex: 456 Rue Mohammed V"
                  value={formData.adresse_complete}
                  onChange={handleChange}
                  disabled={!canManageDestinataires}
                  rows="3"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-ring focus:border-primary outline-none bg-card text-card-foreground ${
                    errors.adresse_complete ? "border-red-500" : "border-border"
                  }`}
                />
                {errors.adresse_complete && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.adresse_complete}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Complément d'adresse
                </label>
                <textarea
                  name="complement_adresse"
                  placeholder="Ex: Porte 12, Bâtiment B"
                  value={formData.complement_adresse}
                  onChange={handleChange}
                  disabled={!canManageDestinataires}
                  rows="2"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-primary outline-none bg-card text-card-foreground"
                />
              </div>
            </div>

            {/* Actions */}
            {canManageDestinataires && (
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 sm:flex-none sm:min-w-[200px] flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {loading
                    ? "Enregistrement..."
                    : id
                    ? "Mettre à jour"
                    : "Créer"}
                </Button>
                <Button
                  type="button"
                  onClick={() => navigate("/destinataires")}
                  className="flex-1 sm:flex-none bg-gray-500 hover:bg-gray-600 flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Annuler
                </Button>
              </div>
            )}
          </form>
        </Card>
      </div>
    </div>
  );
}

export default DestinataireForm;
