import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { createUser, getUserById, updateUser } from "../services/userService";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../contexts/AuthContext";
import {
  User,
  Mail,
  Lock,
  Phone,
  Shield,
  AlertCircle,
  ArrowLeft,
  Save,
  UserPlus,
} from "lucide-react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

function UserForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    telephone: "",
    role: "OPERATEUR",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    if (id) {
      const fetchUser = async () => {
        try {
          setLoading(true);
          const userData = await getUserById(id);
          setFormData({
            username: userData.username,
            email: userData.email,
            password: "",
            first_name: userData.first_name || "",
            last_name: userData.last_name || "",
            telephone: userData.telephone || "",
            role: userData.role,
          });
        } catch (err) {
          console.error("Error fetching user:", err);
          setSubmitError("Failed to load user data.");
        } finally {
          setLoading(false);
        }
      };
      fetchUser();
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

    if (!formData.username) {
      newErrors.username = "Le nom d'utilisateur est requis.";
      formIsValid = false;
    }
    if (!formData.email) {
      newErrors.email = "L'email est requis.";
      formIsValid = false;
    } else if (
      !/^[\w-]+(\.[\w-]+)*@[\w-]+\.[a-zA-Z]{2,7}$/.test(formData.email)
    ) {
      newErrors.email = "Format d'email invalide.";
      formIsValid = false;
    }

    if (!id && !formData.password) {
      newErrors.password = "Le mot de passe est requis pour la création.";
      formIsValid = false;
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password =
        "Le mot de passe doit contenir au moins 6 caractères.";
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
      if (id) {
        const dataToSubmit = formData.password
          ? formData
          : { ...formData, password: undefined };
        await updateUser(id, dataToSubmit);
      } else {
        await createUser(formData);
      }
      navigate("/users");
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

  if (loading && id) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/users">
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Retour
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                {id ? (
                  <>
                    <User className="w-8 h-8 text-primary" />
                    Modifier l'utilisateur
                  </>
                ) : (
                  <>
                    <UserPlus className="w-8 h-8 text-primary" />
                    Créer un utilisateur
                  </>
                )}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {id
                  ? "Modifiez les informations de l'utilisateur"
                  : "Ajoutez un nouvel utilisateur au système"}
              </p>
            </div>
          </div>
        </div>

        {submitError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-sm text-red-800">{submitError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6 shadow-sm">
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-3 border-b border-border">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-lg font-bold text-foreground">
                  Informations du compte
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Nom d'utilisateur <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      disabled={user?.role !== "ADMIN"}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-ring focus:border-primary outline-none bg-card text-card-foreground ${
                        errors.username ? "border-red-500" : "border-border"
                      } ${
                        user?.role !== "ADMIN"
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      placeholder="ex: jkouassi"
                      required
                    />
                  </div>
                  {errors.username && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.username}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={user?.role !== "ADMIN"}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-ring focus:border-primary outline-none bg-card text-card-foreground ${
                        errors.email ? "border-red-500" : "border-border"
                      } ${
                        user?.role !== "ADMIN"
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      placeholder="ex: jean@kid.ci"
                      required
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              {!id && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Mot de passe <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      disabled={user?.role !== "ADMIN"}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-ring focus:border-primary outline-none bg-card text-card-foreground ${
                        errors.password ? "border-red-500" : "border-border"
                      } ${
                        user?.role !== "ADMIN"
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      placeholder="Minimum 6 caractères"
                      required
                    />
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.password}
                    </p>
                  )}
                </div>
              )}

              {id && user?.role === "ADMIN" && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-ring focus:border-primary outline-none bg-card text-card-foreground ${
                        errors.password ? "border-red-500" : "border-border"
                      }`}
                      placeholder="Laisser vide si inchangé"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Laissez ce champ vide pour conserver le mot de passe actuel
                  </p>
                  {errors.password && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.password}
                    </p>
                  )}
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6 shadow-sm">
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-3 border-b border-border">
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <User className="w-5 h-5 text-emerald-600" />
                </div>
                <h2 className="text-lg font-bold text-foreground">
                  Informations personnelles
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Prénom
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    disabled={user?.role !== "ADMIN"}
                    className={`w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-primary outline-none bg-card text-card-foreground ${
                      user?.role !== "ADMIN"
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    placeholder="ex: Jean"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Nom
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    disabled={user?.role !== "ADMIN"}
                    className={`w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-primary outline-none bg-card text-card-foreground ${
                      user?.role !== "ADMIN"
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    placeholder="ex: Kouassi"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Téléphone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                    disabled={user?.role !== "ADMIN"}
                    className={`w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-primary outline-none bg-card text-card-foreground ${
                      user?.role !== "ADMIN"
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    placeholder="ex: 0701020304"
                  />
                </div>
              </div>

              {user?.role === "ADMIN" && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Rôle <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-primary outline-none bg-card text-card-foreground appearance-none"
                      required
                    >
                      <option value="ADMIN"> Administrateur</option>
                      <option value="OPERATEUR">Agent</option>
                      <option value="LIVREUR">Livreur</option>
                    </select>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Définissez le niveau d'accès de l'utilisateur
                  </p>
                </div>
              )}
            </div>
          </Card>

          {user?.role === "ADMIN" && (
            <div className="flex items-center justify-end gap-3 pt-4">
              <Link to="/users">
                <Button type="button" variant="outline">
                  Annuler
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={loading}
                className="min-w-[180px] flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Traitement...
                  </>
                ) : (
                  <>
                    {id ? (
                      <>
                        <Save className="w-4 h-4" />
                        Mettre à jour
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        Créer l'utilisateur
                      </>
                    )}
                  </>
                )}
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default UserForm;
