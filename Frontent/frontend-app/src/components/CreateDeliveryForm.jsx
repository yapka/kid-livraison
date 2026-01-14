import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getAllColis } from "../services/colisService";
import { getAllLivreurs } from "../services/livreurService";
import { getAllUsers } from "../services/userService";
import { getAllVehicules } from "../services/vehiculeService";
import { createLivraison } from "../services/livraisonService";
import { getAllExpediteurs } from "../services/expediteurService";
import { getAllDestinataires } from "../services/destinataireService";
import Input from "./ui/Input";
import Button from "./ui/Button";
import Card from "./ui/Card";
import LoadingSpinner from "./LoadingSpinner";

const Step1 = ({ data, onChange, colis, loading, errors }) => (
  <Card className="p-6">
    <h3 className="text-lg font-semibold mb-4">Étape 1 : Sélection du colis</h3>
    {loading ? (
      <p className="text-muted-foreground">Chargement des colis...</p>
    ) : (
      <div className="space-y-4">
        <label className="block">
          <div className="text-sm font-medium text-muted-foreground mb-2">
            Colis à livrer *
          </div>
          <select
            value={data.colis_id || ""}
            onChange={(e) => onChange({ ...data, colis_id: e.target.value })}
            className={`w-full pr-4 py-2 px-3 text-sm md:text-base md:py-3 border rounded-lg focus:ring-2 focus:ring-ring focus:border-primary outline-none bg-card text-card-foreground ${
              errors.colis_id ? "border-red-500" : "border-border"
            }`}
            required
          >
            <option value="">-- Sélectionner un colis --</option>
            {colis
              .filter(
                (c) => c.statut === "EN_ATTENTE" || c.statut === "EN_TRANSIT"
              )
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.numero_suivi} - {c.description} (
                  {c.poids ? `${c.poids}kg` : "N/A"})
                </option>
              ))}
          </select>
          {errors.colis_id && (
            <p className="text-xs text-red-600 mt-1">{errors.colis_id}</p>
          )}
        </label>
        {data.colis_id && (
          <div className="p-4 bg-muted rounded-lg text-sm">
            <p>
              <strong>Numéro de suivi :</strong>{" "}
              {colis.find((c) => c.id === Number(data.colis_id))?.numero_suivi}
            </p>
            <p>
              <strong>Description :</strong>{" "}
              {colis.find((c) => c.id === Number(data.colis_id))?.description}
            </p>
          </div>
        )}
      </div>
    )}
  </Card>
);

const Step2 = ({
  data,
  onChange,
  livreurs,
  vehicules,
  loading,
  usersCount,
  errors,
}) => {
  console.debug(
    "[Step2] livreurs:",
    livreurs,
    "vehicules:",
    vehicules,
    "loading:",
    loading,
    "usersCount:",
    usersCount
  );

  // Filtrer les livreurs actifs ou disponibles
  const livreursDisponibles = livreurs.filter((l) => l.statut === "DISPONIBLE");

  // Filtrer les véhicules disponibles
  const vehiculesDisponibles = vehicules.filter(
    (v) => v.statut === "DISPONIBLE" || v.statut === "EN_SERVICE"
  );

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">
        Étape 2 : Assignation livreur et véhicule
      </h3>
      {loading ? (
        <p className="text-muted-foreground">Chargement des livreurs...</p>
      ) : livreurs.length === 0 ? (
        <div className="space-y-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800 font-medium">
            Aucun profil livreur n'est créé dans le système.
          </p>
          {usersCount > 0 ? (
            <>
              <p className="text-xs text-amber-700">
                Il existe {usersCount} utilisateur(s) avec le rôle LIVREUR. Vous
                devez maintenant créer un profil livreur en sélectionnant l'un
                de ces comptes utilisateur.
              </p>
              <Link
                to="/livreurs/create"
                className="inline-block px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 text-sm"
              >
                Créer un profil livreur
              </Link>
            </>
          ) : (
            <>
              <p className="text-xs text-amber-700">
                Pour créer un livreur, vous devez d'abord :
              </p>
              <ol className="text-xs text-amber-700 list-decimal list-inside space-y-1 ml-2">
                <li>
                  Créer un utilisateur avec le rôle <strong>LIVREUR</strong>
                </li>
                <li>Ensuite créer un profil livreur lié à cet utilisateur</li>
              </ol>
              <Link
                to="/users/new"
                className="inline-block px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 text-sm"
              >
                Créer un utilisateur LIVREUR
              </Link>
            </>
          )}
        </div>
      ) : livreursDisponibles.length === 0 ? (
        <div className="space-y-2">
          <p className="text-sm text-amber-600">
            Aucun livreur disponible (statut DISPONIBLE).
          </p>
          <p className="text-xs text-muted-foreground">
            Total de livreurs : {livreurs.length} (mais tous sont EN_MISSION,
            INDISPONIBLE ou EN_CONGE)
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <label className="block">
            <div className="text-sm font-medium text-muted-foreground mb-2">
              Livreur * ({livreursDisponibles.length} disponible(s))
            </div>
            <select
              value={data.livreur_id || ""}
              onChange={(e) =>
                onChange({ ...data, livreur_id: e.target.value })
              }
              className={`w-full pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-ring focus:border-primary outline-none bg-card text-card-foreground ${
                errors.livreur_id ? "border-red-500" : "border-border"
              }`}
              required
            >
              {errors.livreur_id && (
                <p className="text-xs text-red-600 mt-1">{errors.livreur_id}</p>
              )}
              <option value="">-- Sélectionner un livreur --</option>
              {livreursDisponibles.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.nom} {l.prenom} - {l.telephone} ({l.statut})
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <div className="text-sm font-medium text-muted-foreground mb-2">
              Véhicule * ({vehiculesDisponibles.length} disponible(s))
            </div>
            <select
              value={data.vehicule_id || ""}
              onChange={(e) =>
                onChange({ ...data, vehicule_id: e.target.value })
              }
              className={`w-full pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-ring focus:border-primary outline-none bg-card text-card-foreground ${
                errors.vehicule_id ? "border-red-500" : "border-border"
              }`}
              required
            >
              <option value="">-- Sélectionner un véhicule --</option>
              {vehiculesDisponibles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.immatriculation} - {v.modele} ({v.type_vehicule})
                </option>
              ))}
            </select>
            {vehiculesDisponibles.length === 0 && (
              <p className="text-xs text-amber-600 mt-2">
                Aucun véhicule disponible. Créez d'abord un véhicule.
                {errors.vehicule_id && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.vehicule_id}
                  </p>
                )}
              </p>
            )}
          </label>
        </div>
      )}
    </Card>
  );
};

const Step3 = ({ data, onChange }) => (
  <Card className="p-6">
    <h3 className="text-lg font-semibold mb-4">Étape 3 : Dates et notes</h3>
    <div className="space-y-4">
      <Input
        label="Date d'assignation"
        type="datetime-local"
        value={data.date_assignation || ""}
        onChange={(e) =>
          onChange({ ...data, date_assignation: e.target.value })
        }
      />
      <label className="block">
        <div className="text-sm font-medium text-muted-foreground mb-2">
          Commentaire
        </div>
        <textarea
          value={data.commentaire || ""}
          onChange={(e) => onChange({ ...data, commentaire: e.target.value })}
          className="w-full pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-primary outline-none bg-card text-card-foreground h-28 resize-vertical"
          placeholder="Instructions pour le livreur..."
        />
      </label>
    </div>
  </Card>
);

const Step4 = ({ data, colis, livreurs }) => {
  const selectedColis = colis.find((c) => c.id === Number(data.colis_id));
  const selectedLivreur = livreurs.find(
    (l) => l.id === Number(data.livreur_id)
  );
  const livreurNom = selectedLivreur
    ? `${selectedLivreur.nom} ${selectedLivreur.prenom}`
    : "N/A";

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Étape 4 : Récapitulatif</h3>
      <div className="space-y-2 text-sm">
        <p>
          <strong>Colis :</strong> {selectedColis?.numero_suivi || "N/A"}
        </p>
        <p>
          <strong>Description :</strong> {selectedColis?.description || "N/A"}
        </p>
        <p>
          <strong>Livreur :</strong> {livreurNom}
        </p>
        <p>
          <strong>Véhicule :</strong> {data.vehicule_immatriculation || "Aucun"}
        </p>
        <p>
          <strong>Date d'assignation :</strong>{" "}
          {data.date_assignation || "Maintenant"}
        </p>
        <p>
          <strong>Commentaire :</strong> {data.commentaire || "Aucun"}
        </p>
      </div>
    </Card>
  );
};

function CreateDeliveryForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ statut: "ASSIGNEE" });
  const [colis, setColis] = useState([]);
  const [livreurs, setLivreurs] = useState([]);
  const [vehicules, setVehicules] = useState([]);
  const [expediteurs, setExpediteurs] = useState([]);
  const [destinataires, setDestinataires] = useState([]);
  const [livreurUsersCount, setLivreurUsersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});
  const [showManualExpediteur, setShowManualExpediteur] = useState(false);
  const [showManualDestinataire, setShowManualDestinataire] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [
          colisData,
          livreursData,
          usersData,
          vehiculesData,
          expediteursData,
          destinatairesData,
        ] = await Promise.all([
          getAllColis(),
          getAllLivreurs(),
          getAllUsers(),
          getAllVehicules(),
          getAllExpediteurs(),
          getAllDestinataires(),
        ]);
        const livreurUsers = usersData.filter((u) => u.role === "LIVREUR");
        console.debug(
          "[CreateDeliveryForm] Loaded colis:",
          colisData.length,
          "livreurs:",
          livreursData.length,
          "users LIVREUR:",
          livreurUsers.length,
          "vehicules:",
          vehiculesData.length
        );
        setColis(colisData);
        setLivreurs(livreursData);
        setVehicules(vehiculesData);
        setExpediteurs(expediteursData);
        setDestinataires(destinatairesData);
        setLivreurUsersCount(livreurUsers.length);
      } catch (err) {
        console.error("Error loading data:", err);
        setError(`Erreur lors du chargement des données: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const next = () => {
    if (step === 1 && !formData.colis_id) {
      alert("Veuillez sélectionner un colis.");
      return;
    }
    if (step === 2 && !formData.livreur_id) {
      alert("Veuillez sélectionner un livreur.");
      return;
    }
    if (step === 2 && !formData.vehicule_id) {
      alert("Veuillez sélectionner un véhicule.");
      return;
    }
    let newErrors = {};
    if (step === 1 && !formData.colis_id) {
      newErrors.colis_id = "Veuillez sélectionner un colis.";
    }
    if (step === 2 && !formData.livreur_id) {
      newErrors.livreur_id = "Veuillez sélectionner un livreur.";
    }
    if (step === 2 && !formData.vehicule_id) {
      newErrors.vehicule_id = "Veuillez sélectionner un véhicule.";
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    setStep((s) => Math.min(4, s + 1));
  };
  const prev = () => setStep((s) => Math.max(1, s - 1));

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        colis: Number(formData.colis_id),
        livreur: Number(formData.livreur_id),
        vehicule: Number(formData.vehicule_id),
        statut: formData.statut || "ASSIGNEE",
        date_assignation: formData.date_assignation
          ? new Date(formData.date_assignation).toISOString()
          : new Date().toISOString(),
        commentaire: formData.commentaire || "",
      };
      console.debug("[CreateDeliveryForm] Submitting:", payload);
      const response = await createLivraison(payload);
      alert(`Livraison créée avec succès! ID: ${response.id}`);
      navigate("/livraisons");
    } catch (err) {
      console.error("Error creating livraison:", err);
      if (err.response?.data) {
        const details =
          typeof err.response.data === "string"
            ? err.response.data
            : JSON.stringify(err.response.data);
        setError(
          `Erreur serveur (${err.response.status}): ${details.substring(
            0,
            500
          )}`
        );
      } else {
        setError(err.message || "Erreur lors de la création de la livraison.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && step === 1) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      {error && (
        <p className="text-sm text-red-600 p-4 bg-red-50 rounded">{error}</p>
      )}
      {/* Sélection de l'expéditeur */}
      <Card className="p-4 mb-4">
        <h2 className="text-lg font-semibold mb-2">Expéditeur</h2>
        {!showManualExpediteur ? (
          <>
            <select
              className="w-full border rounded-lg p-2 mb-2"
              value={formData.expediteur_id || ""}
              onChange={(e) => {
                const val = e.target.value;
                setFormData((f) => ({ ...f, expediteur_id: val }));
                if (val === "__manual__") setShowManualExpediteur(true);
              }}
            >
              <option value="">
                -- Sélectionner un expéditeur existant --
              </option>
              {expediteurs.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nom_complet} ({e.telephone})
                </option>
              ))}
              <option value="__manual__">+ Ajouter un nouvel expéditeur</option>
            </select>
          </>
        ) : (
          <div className="mb-2">
            <Input
              type="text"
              placeholder="Nom complet de l'expéditeur"
              value={formData.expediteur_nom || ""}
              onChange={(e) =>
                setFormData((f) => ({ ...f, expediteur_nom: e.target.value }))
              }
              className="mb-2"
            />
            <Input
              type="text"
              placeholder="Téléphone de l'expéditeur"
              value={formData.expediteur_telephone || ""}
              onChange={(e) =>
                setFormData((f) => ({
                  ...f,
                  expediteur_telephone: e.target.value,
                }))
              }
              className="mb-2"
            />
            <Button
              type="button"
              onClick={() => setShowManualExpediteur(false)}
              className="mt-1"
            >
              Annuler
            </Button>
          </div>
        )}
      </Card>
      {/* Sélection du destinataire */}
      <Card className="p-4 mb-4">
        <h2 className="text-lg font-semibold mb-2">Destinataire</h2>
        {!showManualDestinataire ? (
          <>
            <select
              className="w-full border rounded-lg p-2 mb-2"
              value={formData.destinataire_id || ""}
              onChange={(e) => {
                const val = e.target.value;
                setFormData((f) => ({ ...f, destinataire_id: val }));
                if (val === "__manual__") setShowManualDestinataire(true);
              }}
            >
              <option value="">
                -- Sélectionner un destinataire existant --
              </option>
              {destinataires.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nom_complet} ({d.telephone})
                </option>
              ))}
              <option value="__manual__">
                + Ajouter un nouveau destinataire
              </option>
            </select>
          </>
        ) : (
          <div className="mb-2">
            <Input
              type="text"
              placeholder="Nom complet du destinataire"
              value={formData.destinataire_nom || ""}
              onChange={(e) =>
                setFormData((f) => ({ ...f, destinataire_nom: e.target.value }))
              }
              className="mb-2"
            />
            <Input
              type="text"
              placeholder="Téléphone du destinataire"
              value={formData.destinataire_telephone || ""}
              onChange={(e) =>
                setFormData((f) => ({
                  ...f,
                  destinataire_telephone: e.target.value,
                }))
              }
              className="mb-2"
            />
            <Button
              type="button"
              onClick={() => setShowManualDestinataire(false)}
              className="mt-1"
            >
              Annuler
            </Button>
          </div>
        )}
      </Card>

      {/* Indicateur de progression amélioré */}
      <div className="flex items-center gap-2 mb-4">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`flex-1 h-2 rounded-full transition-all duration-300 ${
              s < step
                ? "bg-primary/80"
                : s === step
                ? "bg-primary"
                : "bg-muted"
            }`}
          />
        ))}
      </div>

      {step === 1 && (
        <Step1
          data={formData}
          onChange={setFormData}
          colis={colis}
          loading={loading}
        />
      )}
      {step === 2 && (
        <Step2
          data={formData}
          onChange={setFormData}
          livreurs={livreurs}
          vehicules={vehicules}
          loading={false}
          usersCount={livreurUsersCount}
        />
      )}
      {step === 3 && <Step3 data={formData} onChange={setFormData} />}
      {step === 4 && (
        <Step4 data={formData} colis={colis} livreurs={livreurs} />
      )}
    </div>
  );
}

export default CreateDeliveryForm;
