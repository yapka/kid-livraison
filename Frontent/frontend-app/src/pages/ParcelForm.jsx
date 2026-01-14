import { Link } from "react-router-dom";
import PhoneInput from "../components/ui/PhoneInput";
import Input from "../components/ui/Input";
import Card from "../components/ui/Card";
import {
  Package,
  ArrowLeft,
  Printer,
  User,
  MapPin,
  Weight,
  DollarSign,
  Edit,
  Clock,
  ChevronRight,
  FileText,
  AlertCircle,
  Ruler,
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import { createExpediteur } from "../services/expediteurService";
import { createDestinataire } from "../services/destinataireService";
import { createColis, updateColis } from "../services/colisService";
import Button from "../components/ui/Button";
import { loadDepartementsData } from "../utils/departements";

function ParcelForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // État pour la liste des départements
  const [departements, setDepartements] = useState([]);

  const [formData, setFormData] = useState({
    // Champs expéditeur (saisie directe)
    expediteur_nom: "",
    expediteur_telephone: "",
    expediteur_ville: "Abidjan",
    // Champs destinataire (saisie directe)
    destinataire_nom: "",
    destinataire_telephone: "",
    destinataire_email: "",
    destinataire_ville: "",
    // Colis
    poids: "",
    longueur: "",
    largeur: "",
    hauteur: "",
    description: "",
    valeur_declaree: "0",
    frais_envoi: "0",
    type_colis: "STANDARD",
    statut: "EN_ATTENTE",
    priorite: "NORMALE",
    assurance: false,
    montant_assurance: "0",
    instructions_speciales: "",
    date_livraison_prevue: "",
  });
  const [currentStep, setCurrentStep] = useState(1); // 3 étapes maintenant
  const [expediteurs, setExpediteurs] = useState([]);
  const [destinataires, setDestinataires] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [createdParcel, setCreatedParcel] = useState(null);
  const receiptRef = useRef();

  // Ref pour auto-focus sur le premier champ
  const firstInputRef = useRef(null);

  useEffect(() => {
    // Charger les départements
    loadDepartementsData().then(setDepartements).catch(console.error);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Plus besoin de charger les listes (saisie directe pour les deux)
        if (id) {
          const parcel = await getColisById(id);
          setFormData({
            // Expéditeur (champs directs)
            expediteur_nom: parcel.expediteur?.nom_complet || "",
            expediteur_telephone: parcel.expediteur?.telephone || "",
            // Destinataire (champs directs)
            destinataire_nom: parcel.destinataire?.nom_complet || "",
            destinataire_telephone: parcel.destinataire?.telephone || "",
            destinataire_email: parcel.destinataire?.email || "",
            destinataire_ville: parcel.destinataire?.ville || "",
            // Colis
            poids: parcel.poids,
            longueur: parcel.longueur || "",
            largeur: parcel.largeur || "",
            hauteur: parcel.hauteur || "",
            description: parcel.description,
            valeur_declaree: parcel.valeur_declaree,
            type_colis: parcel.type_colis,
            statut: parcel.statut,
            priorite: parcel.priorite,
            assurance: parcel.assurance,
            montant_assurance: parcel.montant_assurance,
            instructions_speciales: parcel.instructions_speciales || "",
            date_livraison_prevue: parcel.date_livraison_prevue
              ? parcel.date_livraison_prevue.split("T")[0]
              : "",
          });
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setSubmitError("Failed to load form data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Auto-focus sur le premier champ
  useEffect(() => {
    if (firstInputRef.current && !id) {
      firstInputRef.current.focus();
    }
  }, [id]);

  // Supporte à la fois les events classiques et les valeurs directes (pour react-phone-input-2)
  const handleChange = (e, data) => {
    if (typeof e === "string" && data && data.name) {
      // Appel depuis react-phone-input-2
      setFormData((prev) => ({
        ...prev,
        [data.name]: e,
      }));
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[data.name];
        return newErrors;
      });
    } else if (e && e.target) {
      const { name, value, type, checked } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateField = (name, value) => {
    let newErrors = { ...errors };
    let isValid = true;

    const numValue = parseFloat(value);

    switch (name) {
      case "poids":
        if (value && (isNaN(numValue) || numValue <= 0)) {
          newErrors.poids =
            "Le poids doit être un nombre positif s'il est renseigné.";
          isValid = false;
        } else {
          delete newErrors.poids;
        }
        break;
      case "longueur":
      case "largeur":
      case "hauteur":
      case "valeur_declaree":
      case "montant_assurance":
        if (value && (isNaN(numValue) || numValue < 0)) {
          newErrors[name] = `Le champ ${name.replace(
            "_",
            " "
          )} doit être un nombre positif ou nul.`;
          isValid = false;
        } else {
          delete newErrors[name];
        }
        break;
      case "description":
        if (!value || value.length < 5) {
          newErrors.description =
            "La description doit contenir au moins 5 caractères.";
          isValid = false;
        } else {
          delete newErrors.description;
        }
        break;
      case "expediteur_nom":
        if (!value || value.trim().length < 2) {
          newErrors.expediteur_nom =
            "Le nom de l'expéditeur est requis (min. 2 caractères).";
          isValid = false;
        } else {
          delete newErrors.expediteur_nom;
        }
        break;
      case "expediteur_telephone":
        {
          let raw = value || "";
          let phone = raw.replace(/\D/g, "");
          // Si CI (225), stricte 10 chiffres
          if (raw.startsWith("+225") || raw.startsWith("225")) {
            if (phone.startsWith("225")) phone = phone.slice(3);
            if (!/^\d{10}$/.test(phone)) {
              const n = phone.length;
              newErrors.expediteur_telephone = `Le téléphone de l'expéditeur doit comporter exactement 10 chiffres (format local, ex: 07XXXXXXXX). Vous avez saisi ${n} chiffre${
                n > 1 ? "s" : ""
              }.`;
              isValid = false;
            } else {
              delete newErrors.expediteur_telephone;
            }
          } else {
            // Autres pays : format international +8 à 15 chiffres
            if (!/^\+\d{8,15}$/.test(raw.replace(/\s/g, ""))) {
              newErrors.expediteur_telephone =
                "Le téléphone doit être au format international (ex: +33612345678).";
              isValid = false;
            } else {
              delete newErrors.expediteur_telephone;
            }
          }
          break;
        }
        break;
      case "destinataire_nom":
        if (!value || value.trim().length < 2) {
          newErrors.destinataire_nom =
            "Le nom du destinataire est requis (min. 2 caractères).";
          isValid = false;
        } else {
          delete newErrors.destinataire_nom;
        }
        break;
      case "destinataire_telephone":
        if (!value || value.trim().length < 8) {
          newErrors.destinataire_telephone =
            "Le téléphone du destinataire est requis (min. 8 chiffres).";
          isValid = false;
        } else {
          delete newErrors.destinataire_telephone;
        }
        break;
      case "destinataire_ville":
        if (!value || value.trim().length < 2) {
          newErrors.destinataire_ville = "La ville de destination est requise.";
          isValid = false;
        } else {
          delete newErrors.destinataire_ville;
        }
        break;
      default:
        break;
    }
    setErrors(newErrors);
    return isValid;
  };

  // Validation par étape
  const validateStep = (step) => {
    let stepIsValid = true;
    let newErrors = {};

    if (step === 1) {
      // Étape 1: Expéditeur uniquement
      if (
        !formData.expediteur_nom ||
        formData.expediteur_nom.trim().length < 2
      ) {
        newErrors.expediteur_nom =
          "Le nom de l'expediteur est requis (min. 2 caractères).";
        stepIsValid = false;
      }
      if (
        !formData.expediteur_telephone ||
        (() => {
          let raw = formData.expediteur_telephone || "";
          let phone = raw.replace(/\D/g, "");
          if (raw.startsWith("+225") || raw.startsWith("225")) {
            if (phone.startsWith("225")) phone = phone.slice(3);
            return !/^\d{10}$/.test(phone);
          } else {
            return !/^\+\d{8,15}$/.test(raw.replace(/\s/g, ""));
          }
        })()
      ) {
        newErrors.expediteur_telephone =
          "Le téléphone de l'expéditeur doit comporter exactement 10 chiffres (format local, ex: 07XXXXXXXX).";
        stepIsValid = false;
      }
    } else if (step === 2) {
      // Étape 2: Destinataire uniquement
      if (
        !formData.destinataire_nom ||
        formData.destinataire_nom.trim().length < 2
      ) {
        newErrors.destinataire_nom =
          "Le nom du destinataire est requis (min. 2 caractères).";
        stepIsValid = false;
      }
      if (
        !formData.destinataire_telephone ||
        formData.destinataire_telephone.trim().length < 8
      ) {
        newErrors.destinataire_telephone =
          "Le téléphone du destinataire est requis (min. 8 chiffres).";
        stepIsValid = false;
      }
      if (
        !formData.destinataire_ville ||
        formData.destinataire_ville.trim().length < 2
      ) {
        newErrors.destinataire_ville = "La ville de destination est requise.";
        stepIsValid = false;
      }
    } else if (step === 3) {
      // Étape 3: Détails du Colis et validation finale
      if (!formData.description || formData.description.length < 5) {
        newErrors.description =
          "La description doit contenir au moins 5 caractères.";
        stepIsValid = false;
      }
      if (
        formData.poids &&
        (isNaN(parseFloat(formData.poids)) || parseFloat(formData.poids) <= 0)
      ) {
        newErrors.poids =
          "Le poids doit être un nombre positif s'il est renseigné.";
        stepIsValid = false;
      }
    }

    setErrors(newErrors);
    return stepIsValid;
  };

  const nextStep = () => {
    setSubmitAttempted(true);
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
      setSubmitAttempted(false);
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setSubmitAttempted(false);
  };

  const validateForm = () => {
    let formIsValid = true;
    let newErrors = {};

    // Validate all fields on submit
    // Expéditeur (champs directs)
    if (!formData.expediteur_nom || formData.expediteur_nom.trim().length < 2) {
      newErrors.expediteur_nom =
        "Le nom de l'expéditeur est requis (min. 2 caractères).";
      formIsValid = false;
    }
    if (
      !formData.expediteur_telephone ||
      formData.expediteur_telephone.trim().length < 8
    ) {
      newErrors.expediteur_telephone =
        "Le téléphone de l'expéditeur est requis (min. 8 chiffres).";
      formIsValid = false;
    }
    // Destinataire (champs directs)
    if (
      !formData.destinataire_nom ||
      formData.destinataire_nom.trim().length < 2
    ) {
      newErrors.destinataire_nom =
        "Le nom du destinataire est requis (min. 2 caractères).";
      formIsValid = false;
    }
    if (
      !formData.destinataire_telephone ||
      formData.destinataire_telephone.trim().length < 8
    ) {
      newErrors.destinataire_telephone =
        "Le téléphone du destinataire est requis (min. 8 chiffres).";
      formIsValid = false;
    }
    if (
      !formData.destinataire_ville ||
      formData.destinataire_ville.trim().length < 2
    ) {
      newErrors.destinataire_ville = "La ville de destination est requise.";
      formIsValid = false;
    }
    if (
      formData.poids &&
      (isNaN(parseFloat(formData.poids)) || parseFloat(formData.poids) <= 0)
    ) {
      newErrors.poids =
        "Le poids doit être un nombre positif s'il est renseigné.";
      formIsValid = false;
    }
    if (!formData.description || formData.description.length < 5) {
      newErrors.description =
        "La description doit contenir au moins 5 caractères.";
      formIsValid = false;
    }
    if (
      formData.valeur_declaree &&
      (isNaN(parseFloat(formData.valeur_declaree)) ||
        parseFloat(formData.valeur_declaree) < 0)
    ) {
      newErrors.valeur_declaree =
        "La valeur déclarée doit être un nombre positif ou nul.";
      formIsValid = false;
    }
    if (
      formData.longueur &&
      (isNaN(parseFloat(formData.longueur)) ||
        parseFloat(formData.longueur) < 0)
    ) {
      newErrors.longueur = "La longueur doit être un nombre positif ou nul.";
      formIsValid = false;
    }
    if (
      formData.largeur &&
      (isNaN(parseFloat(formData.largeur)) || parseFloat(formData.largeur) < 0)
    ) {
      newErrors.largeur = "La largeur doit être un nombre positif ou nul.";
      formIsValid = false;
    }
    if (
      formData.hauteur &&
      (isNaN(parseFloat(formData.hauteur)) || parseFloat(formData.hauteur) < 0)
    ) {
      newErrors.hauteur = "La hauteur doit être un nombre positif ou nul.";
      formIsValid = false;
    }
    if (
      formData.assurance &&
      (isNaN(parseFloat(formData.montant_assurance)) ||
        parseFloat(formData.montant_assurance) < 0)
    ) {
      newErrors.montant_assurance =
        "Le montant de l'assurance doit être un nombre positif ou nul si l'assurance est sélectionnée.";
      formIsValid = false;
    }

    setErrors(newErrors);
    return formIsValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitAttempted(true);

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Créer l'expéditeur d'abord (saisie directe)
      const expediteurData = {
        nom_complet: formData.expediteur_nom.trim(),
        telephone: formData.expediteur_telephone.trim(),
        ville: formData.expediteur_ville || "Abidjan",
      };
      const createdExpediteur = await createExpediteur(expediteurData);

      // Créer le destinataire (saisie directe)
      const destinataireData = {
        nom_complet: formData.destinataire_nom.trim(),
        telephone: formData.destinataire_telephone.trim(),
        ville: formData.destinataire_ville.trim(),
      };
      const createdDestinataire = await createDestinataire(destinataireData);

      // Normalize payload types to match API expectations (numbers, booleans, nullables)
      const dataToSubmit = {
        expediteur_id: createdExpediteur.id,
        destinataire_id: createdDestinataire.id,
        poids: formData.poids !== "" ? parseFloat(formData.poids) : null,
        longueur:
          formData.longueur !== "" ? parseFloat(formData.longueur) : null,
        largeur: formData.largeur !== "" ? parseFloat(formData.largeur) : null,
        hauteur: formData.hauteur !== "" ? parseFloat(formData.hauteur) : null,
        description: formData.description
          ? String(formData.description).trim()
          : "",
        valeur_declaree:
          formData.valeur_declaree !== ""
            ? parseFloat(formData.valeur_declaree)
            : 0,
        frais_envoi:
          formData.frais_envoi !== "" ? parseFloat(formData.frais_envoi) : 0,
        type_colis: formData.type_colis,
        statut: formData.statut,
        priorite: formData.priorite,
        assurance: !!formData.assurance,
        montant_assurance: formData.assurance
          ? formData.montant_assurance !== ""
            ? parseFloat(formData.montant_assurance)
            : 0
          : 0,
        instructions_speciales: formData.instructions_speciales
          ? String(formData.instructions_speciales).trim()
          : "",
        date_livraison_prevue: formData.date_livraison_prevue
          ? new Date(formData.date_livraison_prevue).toISOString()
          : null,
      };

      console.debug("[ParcelForm] Submitting payload:", dataToSubmit);

      if (id) {
        await updateColis(id, dataToSubmit);
        console.log("Colis mis à jour avec succès!");
        alert("Colis mis à jour avec succès!");
        navigate("/colis");
      } else {
        const response = await createColis(dataToSubmit);
        const newParcelId = response.id;
        const newTrackingNumber = response.numero_suivi;
        const newInvoiceNumber = response.facture?.numero_facture || "N/A";

        console.log("Colis créé - Réponse complète:", response);
        console.log("Numéro de suivi reçu:", newTrackingNumber);

        // Préparer les données pour le reçu avec les expediteur/destinataire créés
        setCreatedParcel({
          ...response,
          expediteur: createdExpediteur,
          destinataire: createdDestinataire,
          numero_suivi: newTrackingNumber || response.numero_suivi,
        });

        // Afficher le reçu pour impression
        setShowReceipt(true);

        // Lancer l'impression automatiquement après un court délai
        setTimeout(() => {
          window.print();
          // Notification de succès après impression
          setTimeout(() => {
            alert(
              `Colis enregistré avec succès!\nNuméro de suivi: ${newTrackingNumber}`
            );
            navigate("/colis");
          }, 1000);
        }, 500);
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      if (err.response) {
        try {
          const details =
            typeof err.response.data === "string"
              ? err.response.data
              : JSON.stringify(err.response.data);
          setSubmitError(
            `Erreur serveur (${err.response.status}): ${details.substring(
              0,
              500
            )}`
          );
          if (err.response.data && typeof err.response.data === "object") {
            setErrors(err.response.data);
          }
        } catch (_) {
          setSubmitError(`Erreur serveur (${err.response.status}).`);
        }
      } else {
        setSubmitError(
          err.message || "Une erreur est survenue lors de la soumission."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Fonctions pour créer expéditeur/destinataire inline
  const handleCreateExpediteur = async () => {
    setModalLoading(true);
    try {
      const created = await createExpediteur(newExpediteur);
      setExpediteurs([...expediteurs, created]);
      setFormData({ ...formData, expediteur_id: created.id });
      setNewExpediteur({
        nom_complet: "",
        telephone: "",
        email: "",
        adresse: "",
      });
      setShowExpediteurModal(false);
      alert("Expéditeur créé avec succès !");
    } catch (err) {
      console.error("Error creating expediteur:", err);
      alert("Erreur lors de la création de l'expéditeur");
    } finally {
      setModalLoading(false);
    }
  };

  const handleCreateDestinataire = async () => {
    setModalLoading(true);
    try {
      const created = await createDestinataire(newDestinataire);
      setDestinataires([...destinataires, created]);
      setFormData({ ...formData, destinataire_id: created.id });
      setNewDestinataire({
        nom_complet: "",
        telephone: "",
        adresse: "",
        ville: "",
      });
      setShowDestinataireModal(false);
      alert("Destinataire créé avec succès !");
    } catch (err) {
      console.error("Error creating destinataire:", err);
      alert("Erreur lors de la création du destinataire");
    } finally {
      setModalLoading(false);
    }
  };

  // Afficher le reçu pour impression
  if (showReceipt && createdParcel) {
    // Adapter les données pour DeliveryReceipt qui attend une structure "livraison"
    const livraisonData = {
      id: createdParcel.id,
      numero_suivi: createdParcel.numero_suivi,
      statut: createdParcel.statut,
      date_creation: createdParcel.date_creation,
      date_assignation: createdParcel.date_creation,
      colis: {
        ...createdParcel,
        numero_suivi: createdParcel.numero_suivi,
      },
      expediteur: {
        ...createdParcel.expediteur,
        adresse_complete: createdParcel.expediteur?.adresse || "",
        quartier: createdParcel.expediteur?.quartier || "",
        ville: createdParcel.expediteur?.ville || "",
      },
      destinataire: {
        ...createdParcel.destinataire,
        adresse_complete: createdParcel.destinataire?.adresse || "",
        quartier: createdParcel.destinataire?.quartier || "",
        ville: createdParcel.destinataire?.ville || "",
      },
    };

    return (
      <div className="min-h-screen bg-muted/30 p-8">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm print:hidden">
            <h2 className="text-lg font-semibold">Reçu de livraison</h2>
            <div className="flex gap-2">
              <Button
                onClick={() => window.print()}
                className="flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Imprimer
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowReceipt(false);
                  navigate("/colis");
                }}
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Fermer
              </Button>
            </div>
          </div>

          <DeliveryReceipt livraison={livraisonData} />
        </div>
      </div>
    );
  }

  const canManageParcels = user?.role === "ADMIN" || user?.role === "OPERATEUR";

  if (loading && !id) return <LoadingSpinner />;

  if (loading && expediteurs.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Package className="w-8 h-8 text-primary animate-pulse" />
          <h1 className="text-2xl font-bold">Chargement...</h1>
        </div>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Titre principal avec étape */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">
              {id ? "Modifier le Colis" : "Nouveau Colis"}
            </h1>
            <p className="text-sm text-muted-foreground">
              Étape {currentStep} sur 3
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                step === currentStep
                  ? "bg-primary text-white"
                  : step < currentStep
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {step}
            </div>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {submitError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900">
                Erreur de soumission
              </p>
              <p className="text-sm text-red-700 mt-1">{submitError}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Étape 1: Expediteur seulement */}
        {currentStep === 1 && (
          <Card className="p-6 shadow-sm">
            <div className="space-y-6">
              {/* EXPÉDITEUR */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-border">
                  <div className="p-2 bg-emerald-50 rounded-lg">
                    <User className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h2 className="text-lg font-bold text-foreground">
                    Informations Expediteur
                  </h2>
                  <span className="ml-2 text-xs bg-red-50 text-red-600 px-2.5 py-1 rounded-full font-medium">
                    Obligatoire
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nom complet */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Nom complet <span className="text-red-500">*</span>
                    </label>
                    <Input
                      ref={firstInputRef}
                      type="text"
                      name="expediteur_nom"
                      value={formData.expediteur_nom}
                      onChange={handleChange}
                      placeholder="Ex: KOUAKOU Xavier"
                      disabled={!canManageParcels}
                      required
                      className="h-11"
                    />
                    {submitAttempted && errors.expediteur_nom && (
                      <p className="text-sm text-red-600 mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.expediteur_nom}
                      </p>
                    )}
                  </div>

                  {/* Téléphone */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Téléphone <span className="text-red-500">*</span>
                    </label>
                    <PhoneInput
                      name="expediteur_telephone"
                      value={formData.expediteur_telephone}
                      onChange={handleChange}
                      placeholder="0712345678"
                      disabled={!canManageParcels}
                      error={submitAttempted && !!errors.expediteur_telephone}
                    />
                    {submitAttempted && errors.expediteur_telephone && (
                      <p className="text-sm text-red-600 mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.expediteur_telephone}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Étape 2: Destinataire seulement */}
        {currentStep === 2 && (
          <Card className="p-6 shadow-sm">
            <div className="space-y-6">
              {/* DESTINATAIRE */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-border">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-lg font-bold text-foreground">
                    Informations Destinataire
                  </h2>
                  <span className="ml-2 text-xs bg-red-50 text-red-600 px-2.5 py-1 rounded-full font-medium">
                    Obligatoire
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nom complet */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Nom complet <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      name="destinataire_nom"
                      value={formData.destinataire_nom}
                      onChange={handleChange}
                      placeholder="Ex: KOFFI Marie"
                      disabled={!canManageParcels}
                      required
                      className="h-11"
                    />
                    {submitAttempted && errors.destinataire_nom && (
                      <p className="text-sm text-red-600 mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.destinataire_nom}
                      </p>
                    )}
                  </div>

                  {/* Téléphone */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Téléphone <span className="text-red-500">*</span>
                    </label>
                    <PhoneInput
                      name="destinataire_telephone"
                      value={formData.destinataire_telephone}
                      onChange={handleChange}
                      placeholder="0712345678"
                      disabled={!canManageParcels}
                      error={submitAttempted && !!errors.destinataire_telephone}
                    />
                    {submitAttempted && errors.destinataire_telephone && (
                      <p className="text-sm text-red-600 mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.destinataire_telephone}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Email <span className="text-xs">(optionnel)</span>
                    </label>
                    <Input
                      type="email"
                      name="destinataire_email"
                      value={formData.destinataire_email}
                      onChange={handleChange}
                      placeholder="koffi@email.ci"
                      disabled={!canManageParcels}
                      className="h-11"
                    />
                  </div>

                  {/* Ville */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Ville de destination{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="destinataire_ville"
                      value={formData.destinataire_ville}
                      onChange={handleChange}
                      disabled={!canManageParcels}
                      required
                      className="w-full h-11 px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-primary outline-none bg-card text-card-foreground"
                    >
                      <option value="">
                        -- Sélectionner un département --
                      </option>
                      {departements.map((dept) => (
                        <option key={dept.value} value={dept.value}>
                          {dept.label}
                        </option>
                      ))}
                    </select>
                    {submitAttempted && errors.destinataire_ville && (
                      <p className="text-sm text-red-600 mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.destinataire_ville}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="block">
                  <div className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    Description du contenu{" "}
                    <span className="text-red-500">*</span>
                  </div>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    disabled={!canManageParcels}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-ring focus:border-primary outline-none bg-card text-card-foreground h-24 resize-vertical ${
                      errors.description ? "border-red-500" : "border-border"
                    } ${
                      !canManageParcels ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    placeholder="Décrivez le contenu du colis..."
                    required
                  />
                  {submitAttempted && errors.description && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.description}
                    </p>
                  )}
                </label>
              </div>

              {/* Détails du Colis */}
              <div className="space-y-4 pt-4 border-t border-border">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Ruler className="w-4 h-4" />
                  Détails du Colis
                </h3>

                {/* Type & Priorité */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Type de colis
                    </label>
                    <select
                      name="type_colis"
                      value={formData.type_colis}
                      onChange={handleChange}
                      disabled={!canManageParcels}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-primary outline-none bg-card text-card-foreground"
                    >
                      <option value="STANDARD">Standard</option>
                      <option value="DOCUMENT">Document</option>
                      <option value="FRAGILE">Fragile</option>
                      <option value="VOLUMINEUX">Volumineux</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Priorité
                    </label>
                    <select
                      name="priorite"
                      value={formData.priorite}
                      onChange={handleChange}
                      disabled={!canManageParcels}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-primary outline-none bg-card text-card-foreground"
                    >
                      <option value="NORMALE">Normale</option>
                      <option value="EXPRESS">Express</option>
                      <option value="URGENTE">Urgente</option>
                    </select>
                  </div>
                </div>

                {/* Dimensions */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Input
                    label="Poids (kg)"
                    type="number"
                    name="poids"
                    value={formData.poids}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    disabled={!canManageParcels}
                    placeholder="0"
                  />
                  <Input
                    label="Longueur (cm)"
                    type="number"
                    name="longueur"
                    value={formData.longueur}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    disabled={!canManageParcels}
                    placeholder="0"
                  />
                  <Input
                    label="Largeur (cm)"
                    type="number"
                    name="largeur"
                    value={formData.largeur}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    disabled={!canManageParcels}
                    placeholder="0"
                  />
                  <Input
                    label="Hauteur (cm)"
                    type="number"
                    name="hauteur"
                    value={formData.hauteur}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    disabled={!canManageParcels}
                    placeholder="0"
                  />
                </div>

                {/* Valeur déclarée & Frais d'envoi */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Valeur déclarée (FCFA)"
                    type="number"
                    name="valeur_declaree"
                    value={formData.valeur_declaree}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    disabled={!canManageParcels}
                    placeholder="15000"
                  />
                  <Input
                    label="Frais d'envoi (FCFA)"
                    type="number"
                    name="frais_envoi"
                    value={formData.frais_envoi}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    disabled={!canManageParcels}
                    placeholder="2000"
                  />
                </div>

                {/* Assurance */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      id="assurance"
                      type="checkbox"
                      name="assurance"
                      checked={formData.assurance}
                      onChange={handleChange}
                      disabled={!canManageParcels}
                      className="h-5 w-5 rounded border-border text-primary focus:ring-2 focus:ring-ring"
                    />
                    <label
                      htmlFor="assurance"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Souscrire une assurance pour ce colis
                    </label>
                  </div>

                  {formData.assurance && (
                    <div>
                      <Input
                        label="Montant de l'assurance (FCFA)"
                        type="number"
                        name="montant_assurance"
                        value={formData.montant_assurance}
                        onChange={handleChange}
                        step="0.01"
                        min="0"
                        disabled={!canManageParcels}
                        placeholder="0"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Étape 3: Verification - Style Ticket Thermique */}
        {currentStep === 3 && (
          <>
            {/* Boutons d'action - cachés à l'impression */}
            <div className="max-w-md mx-auto mb-4 print:hidden flex gap-2">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-700 transition"
              >
                <ArrowLeft size={20} />
                Modifier
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 bg-black text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-800 transition"
              >
                <Printer size={20} />
                Aperçu impression
              </button>
            </div>

            {/* Ticket de Verification */}
            <div className="max-w-md mx-auto bg-white border border-border print:border-0">
              <div className="receipt-container p-6 font-mono text-sm">
                {/* En-tête avec logo */}
                <div className="text-center mb-4">
                  <div className="flex justify-center mb-2">
                    <img
                      src="/logo-kid.jpg"
                      alt="KID Distribution"
                      className="w-16 h-16 object-contain"
                    />
                  </div>
                  <h1 className="text-xs font-bold mb-1">KID Distribution</h1>
                  <p className="text-xs text-gray-500">
                    (225) 0702000040/0702000060
                  </p>
                </div>

                {/* Numéro de suivi */}
                <div className="border-2 border-black p-2 mb-3">
                  <p className="text-center font-bold">
                    N° {createdParcel?.numero_suivi || "[Sera généré]"}
                  </p>
                </div>

                {/* Expéditeur */}
                <div className="border-2 border-black mb-3">
                  <div className="bg-gray-100 px-2 py-1 border-b-2 border-black">
                    <h2 className="font-bold text-xs">Expediteur</h2>
                  </div>
                  <div className="p-2 space-y-1 text-xs">
                    <p className="font-bold">
                      {formData.expediteur_nom || "-"}
                    </p>
                    <div className="flex justify-between">
                      <span>Telephone</span>
                      <span>{formData.expediteur_telephone || "-"}</span>
                    </div>
                    {formData.expediteur_email && (
                      <div className="flex justify-between">
                        <span>Email</span>
                        <span className="text-right truncate max-w-[60%]">
                          {formData.expediteur_email}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Adresse</span>
                      <span className="text-right">
                        {formData.expediteur_adresse || "-"}
                      </span>
                    </div>
                    {formData.expediteur_quartier && (
                      <div className="flex justify-between">
                        <span>Quartier</span>
                        <span>{formData.expediteur_quartier}</span>
                      </div>
                    )}
                    {formData.expediteur_ville && (
                      <div className="flex justify-between">
                        <span>Ville</span>
                        <span>{formData.expediteur_ville}</span>
                      </div>
                    )}
                    {formData.frais_envoi > 0 && (
                      <div className="flex justify-between pt-1 border-t border-gray-300">
                        <span>Frais d'envoi</span>
                        <span>{formData.frais_envoi} FCFA</span>
                      </div>
                    )}
                    {formData.valeur_declaree > 0 && (
                      <div className="flex justify-between">
                        <span>Valeur</span>
                        <span>{formData.valeur_declaree} FCFA</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-1 border-t border-gray-300">
                      <span>Déposé le</span>
                      <span>{new Date().toLocaleDateString("fr-FR")}</span>
                    </div>
                  </div>
                </div>

                {/* Bénéficiaire */}
                <div className="border-2 border-black mb-3">
                  <div className="bg-gray-100 px-2 py-1 border-b-2 border-black flex items-center justify-between">
                    <h2 className="font-bold text-xs">Bénéficiaire</h2>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      Modifier
                    </button>
                  </div>
                  <div className="p-2 space-y-1 text-xs">
                    <p className="font-bold">
                      {formData.destinataire_nom || "-"}
                    </p>
                    <div className="flex justify-between">
                      <span>Telephone</span>
                      <span>{formData.destinataire_telephone || "-"}</span>
                    </div>
                    {formData.destinataire_email && (
                      <div className="flex justify-between">
                        <span>Email</span>
                        <span className="text-right truncate max-w-[60%]">
                          {formData.destinataire_email}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Destination</span>
                      <span className="font-bold">
                        {formData.destinataire_ville || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Adresse</span>
                      <span className="text-right">
                        {formData.destinataire_adresse || "-"}
                      </span>
                    </div>
                    {formData.destinataire_quartier && (
                      <div className="flex justify-between">
                        <span>Quartier</span>
                        <span>{formData.destinataire_quartier}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contenu */}
                <div className="border-2 border-black mb-4">
                  <div className="bg-gray-100 px-2 py-1 border-b-2 border-black">
                    <h2 className="font-bold text-xs">Contenu</h2>
                  </div>
                  <div className="p-2 text-xs">
                    <p>{formData.description || "-"}</p>
                  </div>
                </div>

                {/* Détails du colis (Type, Poids, Dimensions) */}
                {(formData.type_colis !== "STANDARD" ||
                  formData.poids ||
                  formData.priorite !== "NORMALE") && (
                  <div className="border-2 border-black mb-4">
                    <div className="bg-gray-100 px-2 py-1 border-b-2 border-black">
                      <h2 className="font-bold text-xs">Détails</h2>
                    </div>
                    <div className="p-2 space-y-1 text-xs">
                      {formData.type_colis !== "STANDARD" && (
                        <div className="flex justify-between">
                          <span>Type</span>
                          <span>{formData.type_colis}</span>
                        </div>
                      )}
                      {formData.poids && (
                        <div className="flex justify-between">
                          <span>Poids</span>
                          <span>{formData.poids} kg</span>
                        </div>
                      )}
                      {(formData.longueur ||
                        formData.largeur ||
                        formData.hauteur) && (
                        <div className="flex justify-between">
                          <span>Dimensions (L×l×H)</span>
                          <span>
                            {formData.longueur || 0} × {formData.largeur || 0} ×{" "}
                            {formData.hauteur || 0} cm
                          </span>
                        </div>
                      )}
                      {formData.priorite !== "NORMALE" && (
                        <div className="flex justify-between">
                          <span>Priorité</span>
                          <span className="font-bold text-red-600">
                            {formData.priorite}
                          </span>
                        </div>
                      )}
                      {formData.valeur_declaree > 0 && (
                        <div className="flex justify-between">
                          <span>Valeur déclarée</span>
                          <span>{formData.valeur_declaree} FCFA</span>
                        </div>
                      )}
                      {formData.assurance && (
                        <div className="flex justify-between">
                          <span>Assurance</span>
                          <span>{formData.montant_assurance || 0} FCFA</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Note légale */}
                <div className="text-xs text-gray-500 text-center mb-4 leading-tight">
                  <p>
                    Les colis sont sous notre responsabilité jusqu'à la
                    livraison.
                  </p>
                  <p>Vérifiez le contenu avant signature.</p>
                </div>

                {/* Pied de page */}
                <div className="text-center text-xs border-t-2 border-gray-300 pt-2">
                  <p className="font-bold mb-1">
                    KID Distribution : Rapidité - Qualité - Sécurité
                  </p>
                  <p className="text-gray-500">
                    {new Date().toLocaleString("fr-FR")}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Navigation entre les étapes */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 pb-4 bg-white rounded-xl border border-border p-6 shadow-sm">
          {currentStep > 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Précédent
            </Button>
          ) : (
            <Link to="/colis">
              <Button
                type="button"
                variant="outline"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Annuler
              </Button>
            </Link>
          )}

          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <span>Étape {currentStep} sur 3</span>
            <div className="flex items-center gap-1 ml-2">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    step <= currentStep ? "bg-primary" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>

          {currentStep < 3 ? (
            <Button
              type="button"
              onClick={nextStep}
              className="flex items-center gap-2 min-w-[150px]"
            >
              Suivant
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={loading || !canManageParcels}
              className="min-w-[220px] flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Enregistrement...
                </>
              ) : (
                <>
                  <Printer className="w-4 h-4" />
                  {id ? "Mettre à jour" : "Enregistrer et Imprimer"}
                </>
              )}
            </Button>
          )}
        </div>
      </form>

      {/* Styles d'impression pour le ticket thermique */}
      <style>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          
          .receipt-container {
            width: 80mm;
            max-width: 80mm;
            margin: 0 auto;
            padding: 10mm !important;
          }
          
          @page {
            size: 80mm auto;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
}
export default ParcelForm;
