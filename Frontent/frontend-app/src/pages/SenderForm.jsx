import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  UserCheck,
  Save,
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Home,
} from "lucide-react";
import {
  createExpediteur,
  getExpediteurById,
  updateExpediteur,
} from "../services/expediteurService";
import LoadingSpinner from "../components/LoadingSpinner";
import PhoneInput from "../components/PhoneInput";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import ProgressBar from "../components/ui/ProgressBar";

function SenderForm() {
  const { id } = useParams();
  const navigate = useNavigate();
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
  const [submitProgress, setSubmitProgress] = useState(0);
  const [submitPhase, setSubmitPhase] = useState("");

  useEffect(() => {
    if (id) {
      const fetchSender = async () => {
        try {
          setLoading(true);
          const sender = await getExpediteurById(id);
          setFormData({
            nom_complet: sender.nom_complet,
            telephone: sender.telephone,
            email: sender.email || "",
            adresse_complete: sender.adresse_complete,
            ville: sender.ville,
            quartier: sender.quartier,
            complement_adresse: sender.complement_adresse || "",
          });
        } catch (err) {
          console.error("Error fetching sender:", err);
          setSubmitError("Échec du chargement des données de l'expediteur.");
        } finally {
          setLoading(false);
        }
      };
      fetchSender();
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
      return;
    }

    setLoading(true);
    setSubmitProgress(0);

    try {
      // Phase 1: Validation (0-30%)
      setSubmitPhase("Validation des données...");
      setSubmitProgress(10);
      await new Promise((resolve) => setTimeout(resolve, 300));
      setSubmitProgress(30);

      // Phase 2: Envoi au serveur (30-70%)
      setSubmitPhase("Envoi au serveur...");
      setSubmitProgress(40);

      if (id) {
        await updateExpediteur(id, formData);
      } else {
        await createExpediteur(formData);
      }

      setSubmitProgress(70);

      // Phase 3: Confirmation (70-100%)
      setSubmitPhase("Finalisation...");
      await new Promise((resolve) => setTimeout(resolve, 300));
      setSubmitProgress(100);

      // Petit délai pour voir 100%
      await new Promise((resolve) => setTimeout(resolve, 200));

      navigate("/expediteurs");
    } catch (err) {
      console.error("Error submitting form:", err);
      setSubmitError(
        err.message || "Une erreur est survenue lors de la soumission."
      );
      if (err.response && err.response.data) {
        setErrors(err.response.data);
      }
      setSubmitProgress(0);
      setSubmitPhase("");
    } finally {
      setLoading(false);
    }
  };

  if (loading && id) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-muted/30 p-4 sm:p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-lg">
            <UserCheck className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              {id ? "Modifier l'expediteur" : "Créer un expediteur"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {id
                ? "Modifiez les informations de l'expediteur"
                : "Ajoutez un nouvel expediteur"}
            </p>
          </div>
        </div>

        {/* Error Message */}
        {submitError && (
          <Card className="border-red-200 bg-red-50 p-4">
            <p className="text-red-800">{submitError}</p>
          </Card>
        )}

        {/* Progress Bar pendant la soumission */}
        {loading && submitProgress > 0 && (
          <Card className="p-4 sm:p-6 bg-gray-50 border-gray-900">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">
                  {submitPhase}
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {submitProgress}%
                </span>
              </div>
              <ProgressBar
                value={submitProgress}
                size="lg"
                color="gray"
                className="w-full"
              />
              <p className="text-xs text-gray-600 text-center">
                Veuillez patienter pendant l'enregistrement...
              </p>
            </div>
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
                    placeholder="Ex: Mohammed Ali"
                    value={formData.nom_complet}
                    onChange={handleChange}
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
                    placeholder="Ex: mohammed.ali@email.com"
                    value={formData.email}
                    onChange={handleChange}
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
                  <Input
                    type="text"
                    name="ville"
                    placeholder="Ex: Casablanca"
                    value={formData.ville}
                    onChange={handleChange}
                    className={errors.ville ? "border-red-500" : ""}
                  />
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
                    placeholder="Ex: Maarif"
                    value={formData.quartier}
                    onChange={handleChange}
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
                  placeholder="Ex: 123 Avenue Hassan II, Résidence Al Amal"
                  value={formData.adresse_complete}
                  onChange={handleChange}
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
                  placeholder="Ex: Appartement 5, 3ème étage"
                  value={formData.complement_adresse}
                  onChange={handleChange}
                  rows="2"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-primary outline-none bg-card text-card-foreground"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 sm:flex-none sm:min-w-[200px] flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {loading ? "Enregistrement..." : id ? "Mettre à jour" : "Créer"}
              </Button>
              <Button
                type="button"
                onClick={() => navigate("/expediteurs")}
                className="flex-1 sm:flex-none bg-gray-500 hover:bg-gray-600 flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                Annuler
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default SenderForm;
