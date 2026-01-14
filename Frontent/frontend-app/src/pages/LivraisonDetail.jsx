
import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getLivraisonById } from '../services/livraisonService';
import LoadingSpinner from '../components/LoadingSpinner';
import DeliveryReceipt from '../components/DeliveryReceipt';
import ThermalLabel from '../components/ThermalLabel'; // Import ThermalLabel
import { useReactToPrint } from 'react-to-print';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth

function LivraisonDetail() {
  const { id } = useParams();
  const [livraison, setLivraison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth(); // Access authenticated user info

  // Ref for the delivery receipt component to print
  const receiptRef = useRef();
  // Ref for the thermal label component to print
  const thermalLabelRef = useRef();

  // Hook for printing delivery receipt functionality
  const handlePrintReceipt = useReactToPrint({
    content: () => receiptRef.current,
    documentTitle: `Reçu_Livraison_${id}`,
  });

  // Hook for printing thermal label functionality
  const handlePrintThermalLabel = useReactToPrint({
    content: () => thermalLabelRef.current,
    documentTitle: `Ticket_Colis_${livraison?.colis?.numero_suivi}`,
  });

  // Preview modal state
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [previewType, setPreviewType] = React.useState('receipt');

  const openPreview = (type) => {
    setPreviewType(type);
    setPreviewOpen(true);
  };

  const closePreview = () => setPreviewOpen(false);

  useEffect(() => {
    const fetchLivraisonDetail = async () => {
      try {
        setLoading(true);
        const data = await getLivraisonById(id);
        setLivraison(data);
      } catch (err) {
        console.error("Error fetching livraison detail:", err);
        setError(err.message || "Erreur lors du chargement des détails de livraison.");
      } finally {
        setLoading(false);
      }
    };

    fetchLivraisonDetail();
  }, [id]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <p style={{ color: 'red' }}>Erreur: {error}</p>;
  }

  if (!livraison) {
    return <p>Aucune livraison trouvée.</p>;
  }

  // Utility: Download thermal label as PDF using html2canvas + jsPDF (client-side fallback)
  const downloadLabelPDF = async (liv) => {
    try {
      // dynamic import to avoid bundling when not needed
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf')
      ]);

      // render label in an offscreen container
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.left = '-10000px';
      document.body.appendChild(container);

      const temp = document.createElement('div');
      container.appendChild(temp);

      // render a ThermalLabel into temp using React DOM
      // We'll use a simple approach: set innerHTML from server-side render or from component outerHTML
      // Simpler: create a minimal HTML representation
      temp.innerHTML = `
        <div style="width:102mm;height:152mm;display:flex;flex-direction:column;justify-content:space-between;padding:10mm;font-family:monospace;">
          <div style="text-align:center;margin-bottom:10mm;"><h2 style="margin:0;font-size:14pt;">Étiquette d'Expédition</h2></div>
          <div style="margin-bottom:10mm;"><p style="margin:0"><strong>Numéro de Suivi:</strong></p><p style="margin:0;font-size:12pt;font-weight:bold;">${liv.colis?.numero_suivi || ''}</p></div>
          <div style="text-align:center;margin:10mm 0;"><svg><!-- barcode placeholder --></svg></div>
          <div style="text-align:center;font-size:8pt;margin-top:10mm;"><p style="margin:0">SCANNER POUR LE SUIVI</p></div>
        </div>
      `;

      const canvas = await html2canvas(temp, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ unit: 'mm', format: [102, 152] });
      pdf.addImage(imgData, 'PNG', 0, 0, 102, 152);
      pdf.save(`label_${liv.id || 'ticket'}.pdf`);

      document.body.removeChild(container);
    } catch (err) {
      console.error('Erreur génération PDF:', err);
      alert('Impossible de générer le PDF client-side. Vérifie l’installation de jspdf/html2canvas ou utilise l’aperçu & imprimer.');
    }
  };
  // Determine if the user has permission to print the receipt or thermal label
  const canPrint = user?.role === 'ADMIN' || user?.role === 'OPERATEUR' || user?.role === 'LIVREUR';

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>Détails de la Livraison #{livraison.id}</h1>

      {/* Print Buttons - Conditionally rendered */}
      {canPrint && (
        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
          <button onClick={handlePrintReceipt} style={{
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px'
          }}>
            Imprimer le Reçu
          </button>
          <button onClick={() => openPreview('receipt')} style={{
            padding: '10px 14px',
            fontSize: '14px',
            cursor: 'pointer'
          }}>
            Aperçu Reçu
          </button>
          {livraison.colis?.numero_suivi && (
            <>
              <button onClick={handlePrintThermalLabel} style={{
                padding: '10px 20px',
                fontSize: '16px',
                cursor: 'pointer',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px'
              }}>
                Imprimer Ticket Colis
              </button>
              <button onClick={() => openPreview('label')} style={{
                padding: '10px 14px',
                fontSize: '14px',
                cursor: 'pointer'
              }}>
                Aperçu Étiquette
              </button>
              <button onClick={() => downloadLabelPDF(livraison)} style={{
                padding: '10px 12px',
                fontSize: '14px',
                cursor: 'pointer'
              }}>
                Télécharger PDF
              </button>
            </>
          )}
        </div>
      )}

      {/* Delivery Receipt Component wrapped with ref */}
      <div ref={receiptRef}>
        <DeliveryReceipt livraison={livraison} />
      </div>

      {/* Thermal Label Component wrapped with ref (displayed conditionally) */}
      {livraison.colis?.numero_suivi && (
        <div style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }} ref={thermalLabelRef}>
          <h2 style={{ textAlign: 'center', color: '#333' }}>Ticket Colis</h2>
          <ThermalLabel trackingNumber={livraison.colis.numero_suivi} />
        </div>
      )}

    </div>
  );
}

export default LivraisonDetail;
