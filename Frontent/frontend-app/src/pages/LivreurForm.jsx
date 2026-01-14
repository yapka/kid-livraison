import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Truck,
  ArrowLeft,
  Save,
  User,
  Phone,
  Mail,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import {
  createLivreur,
  getLivreurById,
  updateLivreur,
} from "../services/livreurService";
import { getAllUsers } from "../services/userService";
import LoadingSpinner from "../components/LoadingSpinner";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { useAuth } from "../contexts/AuthContext";

function LivreurForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    utilisateur_id: "",
    nom: "",
    prenom: "",
    telephone: "",
    email: "",
    matricule: "",
    permis_conduire: "",
    date_validite_permis: "",
    telephone_pro: "",
    statut: "DISPONIBLE",
    zone_intervention: "",
    date_embauche: new Date().toISOString().split("T")[0],
    adresse: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const canManageLivreurs =
    user?.role === "ADMIN" || user?.role === "GESTIONNAIRE";

  useEffect(() => {
    fetchUsers();
    if (id) {
      fetchLivreur();
    }
  }, [id]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const allUsers = await getAllUsers();
      // Filtrer uniquement les utilisateurs avec le rôle LIVREUR
      const livreurUsers = allUsers.filter((u) => u.role === "LIVREUR");
      setUsers(livreurUsers);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchLivreur = async () => {
    setLoading(true);
    try {
      const livreur = await getLivreurById(id);
      setFormData({
        utilisateur_id: livreur.utilisateur_id || livreur.utilisateur?.id || "",
        nom: livreur.nom || "",
        prenom: livreur.prenom || "",
        telephone: livreur.telephone || "",
        email: livreur.email || "",
        matricule: livreur.matricule || "",
        permis_conduire: livreur.permis_conduire || "",
        date_validite_permis: livreur.date_validite_permis || "",
        telephone_pro: livreur.telephone_pro || "",
        statut: livreur.statut || "DISPONIBLE",
        zone_intervention: livreur.zone_intervention || "",
        date_embauche:
          livreur.date_embauche || new Date().toISOString().split("T")[0],
        adresse: livreur.adresse || "",
      });
    } catch (err) {
      console.error("Error fetching livreur:", err);
      setSubmitError("Erreur lors du chargement du livreur");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Si on change l'utilisateur sélectionné, pré-remplir les champs avec les infos de l'utilisateur
    if (name === "utilisateur_id" && value) {
      const selectedUser = users.find((u) => u.id === parseInt(value));
      if (selectedUser) {
        setFormData((prev) => ({
          ...prev,
          utilisateur_id: value,
          // Pré-remplir avec les infos de l'utilisateur si les champs sont vides
          nom: prev.nom || selectedUser.last_name || "",
          prenom: prev.prenom || selectedUser.first_name || "",
          email: prev.email || selectedUser.email || "",
          telephone_pro: prev.telephone_pro || selectedUser.email || "",
        }));
        return;
      }
    }

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

    if (!id && !formData.utilisateur_id) {
      newErrors.utilisateur_id = "Vous devez sélectionner un utilisateur";
      formIsValid = false;
    }

    if (!formData.matricule || formData.matricule.trim().length < 2) {
      newErrors.matricule = "Le matricule est requis (min 2 caractères)";
      formIsValid = false;
    }

    if (
      !formData.permis_conduire ||
      formData.permis_conduire.trim().length < 5
    ) {
      newErrors.permis_conduire = "Le numéro de permis est requis";
      formIsValid = false;
    }

    if (!formData.date_validite_permis) {
      newErrors.date_validite_permis =
        "La date de validité du permis est requise";
      formIsValid = false;
    }

    if (!formData.telephone_pro || formData.telephone_pro.trim().length < 8) {
      newErrors.telephone_pro = "Le téléphone professionnel est requis";
      formIsValid = false;
    }

    if (!formData.zone_intervention) {
      newErrors.zone_intervention = "La zone d'intervention est requise";
      formIsValid = false;
    }

    if (!formData.date_embauche) {
      newErrors.date_embauche = "La date d'embauche est requise";
      formIsValid = false;
    }

    if (!formData.nom || formData.nom.trim().length < 2) {
      newErrors.nom = "Le nom doit contenir au moins 2 caractères";
      formIsValid = false;
    }

    if (!formData.prenom || formData.prenom.trim().length < 2) {
      newErrors.prenom = "Le prénom doit contenir au moins 2 caractères";
      formIsValid = false;
    }

    if (!formData.telephone || formData.telephone.trim().length < 8) {
      newErrors.telephone = "Le téléphone doit contenir au moins 8 chiffres";
      formIsValid = false;
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email invalide";
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
        nom: formData.nom.trim(),
        prenom: formData.prenom.trim(),
        telephone: formData.telephone.trim(),
        email: formData.email ? formData.email.trim() : "",
        matricule: formData.matricule.trim(),
        permis_conduire: formData.permis_conduire.trim(),
        date_validite_permis: formData.date_validite_permis,
        telephone_pro: formData.telephone_pro.trim(),
        statut: formData.statut,
        zone_intervention: formData.zone_intervention.trim(),
        date_embauche: formData.date_embauche,
        adresse: formData.adresse ? formData.adresse.trim() : "",
      };

      // utilisateur_id uniquement pour la création
      if (!id) {
        dataToSubmit.utilisateur_id = parseInt(formData.utilisateur_id);
      }

      console.log("Submitting livreur data:", dataToSubmit);

      if (id) {
        await updateLivreur(id, dataToSubmit);
        alert("Livreur mis à jour avec succès!");
      } else {
        await createLivreur(dataToSubmit);
        alert("Livreur créé avec succès!");
      }
      navigate("/livreurs");
    } catch (err) {
      console.error("Error submitting form:", err);
      console.error("Error response:", err.response);

      let errorMessage = "Une erreur est survenue lors de la soumission";

      if (err.response?.data) {
        console.error("Error data:", err.response.data);

        // Si c'est un objet avec des erreurs de validation par champ
        if (
          typeof err.response.data === "object" &&
          !Array.isArray(err.response.data)
        ) {
          const errors = [];
          for (const [field, messages] of Object.entries(err.response.data)) {
            const errorList = Array.isArray(messages)
              ? messages.join(", ")
              : messages;
            errors.push(`${field}: ${errorList}`);
          }
          errorMessage = errors.join("\n");
        } else {
          // Sinon afficher le message brut
          errorMessage =
            typeof err.response.data === "string"
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

  if (!canManageLivreurs) {
    return (
      <div className="min-h-screen bg-muted/30 p-6 flex items-center justify-center">
        <Card className="max-w-md w-full p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Accès refusé</h2>
          <p className="text-muted-foreground mb-4">
            Vous n'avez pas la permission de gérer les livreurs.
          </p>
          <Link to="/livreurs">
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
          <Link to="/livreurs">
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
                {id ? "Modifier le livreur" : "Nouveau livreur"}
              </h1>
              <p className="text-muted-foreground mt-1">
                {id
                  ? "Modifiez les informations du livreur"
                  : "Créez un nouveau livreur"}
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
          {/* Sélection utilisateur (seulement pour création) */}
          {!id && (
            <Card>
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-2 pb-4 border-b border-border">
                  <User className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold">Compte utilisateur</h2>
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full ml-auto">
                    Obligatoire
                  </span>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="utilisateur_id"
                    className="block text-sm font-medium text-foreground"
                  >
                    Utilisateur avec rôle LIVREUR{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Sélectionnez le compte utilisateur à associer à ce profil
                    livreur. Les informations du compte (nom, email) seront
                    pré-remplies automatiquement.
                  </p>
                  {loadingUsers ? (
                    <p className="text-sm text-muted-foreground">
                      Chargement des utilisateurs...
                    </p>
                  ) : (
                    <select
                      id="utilisateur_id"
                      name="utilisateur_id"
                      value={formData.utilisateur_id}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                        errors.utilisateur_id
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      required
                    >
                      <option value="">
                        -- Sélectionner un utilisateur --
                      </option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.username} ({user.email})
                        </option>
                      ))}
                    </select>
                  )}
                  {errors.utilisateur_id && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.utilisateur_id}
                    </p>
                  )}
                  {users.length === 0 && !loadingUsers && (
                    <div className="mt-3 p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-2">
                      <p className="text-sm text-amber-800 font-medium flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Aucun utilisateur avec le rôle LIVREUR trouvé
                      </p>
                      <p className="text-xs text-amber-700">
                        Pour créer un profil livreur, vous devez d'abord créer
                        un compte utilisateur avec le rôle LIVREUR.
                      </p>
                      <Link
                        to="/users/new"
                        className="inline-block mt-2 px-4 py-2 bg-primary text-white text-sm rounded-md hover:bg-primary/90"
                      >
                        Créer un utilisateur LIVREUR maintenant
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Informations personnelles */}
          <Card>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b border-border">
                <User className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">
                  Informations personnelles
                </h2>
                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full ml-auto">
                  Obligatoire
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Input
                    label={
                      <span>
                        Nom <span className="text-red-500">*</span>
                      </span>
                    }
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    placeholder="Diallo"
                    required
                  />
                  {errors.nom && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.nom}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Input
                    label={
                      <span>
                        Prénom <span className="text-red-500">*</span>
                      </span>
                    }
                    type="text"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleChange}
                    placeholder="Mamadou"
                    required
                  />
                  {errors.prenom && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.prenom}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Input
                    label={
                      <span>
                        <Phone className="w-4 h-4 inline mr-1" />
                        Téléphone <span className="text-red-500">*</span>
                      </span>
                    }
                    type="tel"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                    placeholder="+225 0712345678"
                    required
                  />
                  {errors.telephone && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.telephone}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Input
                    label={
                      <span>
                        <Mail className="w-4 h-4 inline mr-1" />
                        Email
                      </span>
                    }
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="livreur@example.com"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Input
                    label={
                      <span>
                        <CreditCard className="w-4 h-4 inline mr-1" />
                        Matricule <span className="text-red-500">*</span>
                      </span>
                    }
                    type="text"
                    name="matricule"
                    value={formData.matricule}
                    onChange={handleChange}
                    placeholder="LIV-2024-001"
                    required
                  />
                  {errors.matricule && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.matricule}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Input
                    label={
                      <span>
                        <Phone className="w-4 h-4 inline mr-1" />
                        Téléphone Pro <span className="text-red-500">*</span>
                      </span>
                    }
                    type="tel"
                    name="telephone_pro"
                    value={formData.telephone_pro}
                    onChange={handleChange}
                    placeholder="+225 0798765432"
                    required
                  />
                  {errors.telephone_pro && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.telephone_pro}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Input
                    label={
                      <span>
                        Permis de conduire{" "}
                        <span className="text-red-500">*</span>
                      </span>
                    }
                    type="text"
                    name="permis_conduire"
                    value={formData.permis_conduire}
                    onChange={handleChange}
                    placeholder="ABC123456"
                    required
                  />
                  {errors.permis_conduire && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.permis_conduire}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Input
                    label={
                      <span>
                        Date validité permis{" "}
                        <span className="text-red-500">*</span>
                      </span>
                    }
                    type="date"
                    name="date_validite_permis"
                    value={formData.date_validite_permis}
                    onChange={handleChange}
                    required
                  />
                  {errors.date_validite_permis && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.date_validite_permis}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Input
                    label={
                      <span>
                        Zone d'intervention{" "}
                        <span className="text-red-500">*</span>
                      </span>
                    }
                    type="text"
                    name="zone_intervention"
                    value={formData.zone_intervention}
                    onChange={handleChange}
                    placeholder="Abidjan, Cocody"
                    required
                  />
                  {errors.zone_intervention && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.zone_intervention}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Input
                    label={
                      <span>
                        Date d'embauche <span className="text-red-500">*</span>
                      </span>
                    }
                    type="date"
                    name="date_embauche"
                    value={formData.date_embauche}
                    onChange={handleChange}
                    required
                  />
                  {errors.date_embauche && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.date_embauche}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block">
                    <div className="text-sm font-medium text-muted-foreground mb-2">
                      Statut <span className="text-red-500">*</span>
                    </div>
                    <select
                      name="statut"
                      value={formData.statut}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-primary outline-none bg-card"
                      required
                    >
                      <option value="DISPONIBLE">✓ Disponible</option>
                      <option value="EN_MISSION">🚚 En mission</option>
                      <option value="INDISPONIBLE">○ Indisponible</option>
                      <option value="EN_CONGE">⏸ En congé</option>
                    </select>
                  </label>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="block">
                    <div className="text-sm font-medium text-muted-foreground mb-2">
                      Adresse
                    </div>
                    <textarea
                      name="adresse"
                      value={formData.adresse}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-primary outline-none bg-card h-20 resize-vertical"
                      placeholder="Adresse complète du livreur..."
                    />
                  </label>
                </div>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3 sticky bottom-0 bg-background/95 backdrop-blur-sm p-4 rounded-lg border border-border">
            <Link to="/livreurs">
              <Button type="button" variant="outline">
                Annuler
              </Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {id ? "Mettre à jour" : "Créer le livreur"}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LivreurForm;
