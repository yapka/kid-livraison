import React, { forwardRef } from "react";

const DeliveryReceipt = forwardRef(({ livraison }, ref) => {
  if (!livraison) {
    return <p>Aucune donnée de livraison fournie.</p>;
  }

  const { colis, expediteur, destinataire } = livraison;

  return (
    <div
      ref={ref}
      className="print-area receipt"
      style={{
        fontFamily: "'Courier New', Courier, monospace",
        fontSize: "11px",
        lineHeight: "1.3",
        color: "#000",
        backgroundColor: "#fff",
        width: "80mm",
        padding: "4mm",
        margin: "0 auto",
        boxSizing: "border-box",
      }}
    >
      {/* En-tête avec logo */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "6px",
          paddingBottom: "6px",
          borderBottom: "2px solid #000",
        }}
      >
        {/* Logo centré */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "4px",
          }}
        >
          <img
            src="/logo-kid.jpg"
            alt="KID Distribution"
            style={{
              width: "40mm",
              height: "auto",
              objectFit: "contain",
              maxHeight: "25mm",
            }}
          />
        </div>

        {/* Nom de l'entreprise */}
        <div
          style={{
            fontSize: "16px",
            fontWeight: "900",
            marginBottom: "2px",
            color: "#000",
            letterSpacing: "1px",
          }}
        >
          KID DISTRIBUTION
        </div>

        {/* Contacts */}
        <div style={{ fontSize: "9px", lineHeight: "1.2", marginTop: "3px" }}>
          <p style={{ margin: "1px 0" }}>Tél: +225 07 02 00 00 40</p>
          <p style={{ margin: "1px 0" }}>+225 07 02 00 00 60</p>
          <p style={{ margin: "1px 0" }}>Abidjan, Côte d'Ivoire</p>
        </div>
      </div>

      {/* Type de document */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "8px",
          padding: "4px 0",
          backgroundColor: "#000",
          color: "#fff",
        }}
      >
        <p
          style={{
            fontSize: "12px",
            fontWeight: "900",
            margin: 0,
            letterSpacing: "1px",
          }}
        >
          REÇU D'INSCRIPTION
        </p>
      </div>

      {/* Numéro de suivi - mis en évidence */}
      {colis && (
        <div
          style={{
            marginBottom: "8px",
            textAlign: "center",
            padding: "6px",
            border: "3px double #000",
            backgroundColor: "#f5f5f5",
          }}
        >
          <p
            style={{ fontSize: "9px", margin: "0 0 2px 0", fontWeight: "700" }}
          >
            N° DE SUIVI
          </p>
          <p
            style={{
              fontSize: "16px",
              fontWeight: "900",
              margin: 0,
              letterSpacing: "2px",
            }}
          >
            {colis.numero_suivi || livraison.numero_suivi || "EN ATTENTE"}
          </p>
        </div>
      )}

      {/* Date et heure */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "8px",
          paddingBottom: "6px",
          borderBottom: "1px dashed #000",
          fontSize: "9px",
        }}
      >
        <span>
          Date:{" "}
          {new Date().toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </span>
        <span>
          Heure:{" "}
          {new Date().toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>

      {/* Expéditeur - Format compact */}
      {expediteur && (
        <div
          style={{
            marginBottom: "8px",
            padding: "5px",
            border: "1px solid #000",
            backgroundColor: "#f9f9f9",
          }}
        >
          <div
            style={{
              fontSize: "10px",
              fontWeight: "900",
              marginBottom: "3px",
              textTransform: "uppercase",
              borderBottom: "1px solid #ddd",
              paddingBottom: "2px",
            }}
          >
            EXPÉDITEUR
          </div>
          <div style={{ fontSize: "10px", lineHeight: "1.4" }}>
            <p style={{ margin: "2px 0", fontWeight: "700" }}>
              {expediteur.nom_complet || expediteur.nom || "N/A"}
            </p>
            <p style={{ margin: "2px 0" }}>
              Tél: {expediteur.telephone || "N/A"}
            </p>
            {expediteur.ville && (
              <p style={{ margin: "2px 0" }}>Ville: {expediteur.ville}</p>
            )}
          </div>
        </div>
      )}

      {/* Destinataire - Format compact */}
      {destinataire && (
        <div
          style={{
            marginBottom: "8px",
            padding: "5px",
            border: "1px solid #000",
            backgroundColor: "#f9f9f9",
          }}
        >
          <div
            style={{
              fontSize: "10px",
              fontWeight: "900",
              marginBottom: "3px",
              textTransform: "uppercase",
              borderBottom: "1px solid #ddd",
              paddingBottom: "2px",
            }}
          >
            DESTINATAIRE
          </div>
          <div style={{ fontSize: "10px", lineHeight: "1.4" }}>
            <p style={{ margin: "2px 0", fontWeight: "700" }}>
              {destinataire.nom_complet || destinataire.nom || "N/A"}
            </p>
            <p style={{ margin: "2px 0" }}>
              Tél: {destinataire.telephone || "N/A"}
            </p>
            <p style={{ margin: "2px 0" }}>
              Dest: {destinataire.ville || destinataire.adresse || "N/A"}
            </p>
          </div>
        </div>
      )}

      {/* Détails du colis */}
      {colis && (
        <div
          style={{
            marginBottom: "8px",
            padding: "5px",
            border: "1px solid #000",
          }}
        >
          <div
            style={{
              fontSize: "10px",
              fontWeight: "900",
              marginBottom: "3px",
              textTransform: "uppercase",
              borderBottom: "1px solid #ddd",
              paddingBottom: "2px",
            }}
          >
            DÉTAILS COLIS
          </div>
          <div style={{ fontSize: "10px", lineHeight: "1.4" }}>
            <p style={{ margin: "2px 0" }}>
              <span style={{ fontWeight: "700" }}>Contenu:</span>{" "}
              {colis.description || colis.contenu || "N/A"}
            </p>
            {colis.poids && (
              <p style={{ margin: "2px 0" }}>
                <span style={{ fontWeight: "700" }}>Poids:</span> {colis.poids}{" "}
                kg
              </p>
            )}
            {(colis.valeur_declaree || colis.valeur) && (
              <p style={{ margin: "2px 0" }}>
                <span style={{ fontWeight: "700" }}>Valeur:</span>{" "}
                {(colis.valeur_declaree || colis.valeur).toLocaleString()} FCFA
              </p>
            )}
            {colis.type_colis && (
              <p style={{ margin: "2px 0" }}>
                <span style={{ fontWeight: "700" }}>Type:</span>{" "}
                {colis.type_colis}
              </p>
            )}
            {colis.priorite && (
              <p style={{ margin: "2px 0" }}>
                <span style={{ fontWeight: "700" }}>Priorité:</span>{" "}
                {colis.priorite}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Montant - Mis en évidence */}
      {colis && (colis.frais_envoi || colis.frais) && (
        <div
          style={{
            marginBottom: "8px",
            padding: "6px",
            backgroundColor: "#000",
            color: "#fff",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: "9px", margin: "0 0 2px 0" }}>
            FRAIS DE LIVRAISON
          </p>
          <p
            style={{
              fontSize: "18px",
              fontWeight: "900",
              margin: 0,
              letterSpacing: "1px",
            }}
          >
            {(colis.frais_envoi || colis.frais).toLocaleString()} FCFA
          </p>
        </div>
      )}

      {/* Instructions spéciales */}
      {colis?.instructions_speciales && (
        <div
          style={{
            marginBottom: "8px",
            padding: "5px",
            border: "1px dashed #666",
            fontSize: "9px",
            fontStyle: "italic",
          }}
        >
          <p style={{ margin: 0, fontWeight: "700" }}>Instructions:</p>
          <p style={{ margin: "2px 0" }}>{colis.instructions_speciales}</p>
        </div>
      )}

      {/* Signature */}
      <div
        style={{
          marginTop: "10px",
          paddingTop: "6px",
          borderTop: "1px dashed #000",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "9px",
            marginBottom: "15mm",
          }}
        >
          <div style={{ width: "35mm", textAlign: "center" }}>
            <p style={{ margin: "0 0 3px 0", fontWeight: "700" }}>Client</p>
            <div
              style={{
                borderTop: "1px solid #000",
                marginTop: "12mm",
                paddingTop: "2px",
              }}
            >
              Signature
            </div>
          </div>
          <div style={{ width: "35mm", textAlign: "center" }}>
            <p style={{ margin: "0 0 3px 0", fontWeight: "700" }}>Agent</p>
            <div
              style={{
                borderTop: "1px solid #000",
                marginTop: "12mm",
                paddingTop: "2px",
              }}
            >
              Signature
            </div>
          </div>
        </div>
      </div>

      {/* Pied de page */}
      <div
        style={{
          textAlign: "center",
          paddingTop: "6px",
          borderTop: "2px solid #000",
          marginTop: "6px",
        }}
      >
        <p
          style={{
            fontSize: "10px",
            fontWeight: "700",
            margin: "3px 0",
          }}
        >
          Merci pour votre confiance
        </p>
        <p
          style={{
            fontSize: "8px",
            margin: "2px 0",
            fontStyle: "italic",
          }}
        >
          Rapidité - Qualité - Sécurité
        </p>
        <p style={{ fontSize: "8px", margin: "2px 0" }}>
          www.kid-distribution.ci
        </p>
      </div>
    </div>
  );
});

export default DeliveryReceipt;
