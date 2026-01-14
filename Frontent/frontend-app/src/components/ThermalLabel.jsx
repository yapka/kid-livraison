
// frontend-app/src/components/ThermalLabel.jsx
import React from 'react';
import Barcode from 'react-barcode';

const ThermalLabel = ({ trackingNumber }) => {
  if (!trackingNumber) {
    return <p>Numéro de suivi non disponible pour l'étiquette thermique.</p>;
  }

  return (
    <div className="thermal-label print-area" style={{
      border: '1px solid black',
      padding: '10mm',
      boxSizing: 'border-box',
      fontFamily: 'monospace', // Monospace font often used on labels
      fontSize: '10pt',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      backgroundColor: 'white',
      color: 'black',
    }}>
      <div style={{ textAlign: 'center', marginBottom: '10mm' }}>
        <h2 style={{ margin: '0', fontSize: '14pt' }}>Étiquette d'Expédition</h2>
      </div>

      <div style={{ marginBottom: '10mm' }}>
        <p style={{ margin: '0' }}><strong>Numéro de Suivi:</strong></p>
        <p style={{ margin: '0', fontSize: '12pt', fontWeight: 'bold' }}>{trackingNumber}</p>
      </div>

      <div style={{ textAlign: 'center', margin: '10mm 0' }}>
        <Barcode value={trackingNumber} width={1} height={50} displayValue={false} />
      </div>

      <div style={{ textAlign: 'center', fontSize: '8pt', marginTop: '10mm' }}>
        <p style={{ margin: '0' }}>SCANNER POUR LE SUIVI</p>
        <p style={{ margin: '0' }}>Merci d'avoir utilisé notre service</p>
      </div>
    </div>
  );
};

export default ThermalLabel;
