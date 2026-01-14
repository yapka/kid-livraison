import React from 'react';
import CreateDeliveryForm from '../components/CreateDeliveryForm';

function CreateLivraison() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 20 }}>
      <h1>Créer une Livraison</h1>
      <CreateDeliveryForm />
    </div>
  );
}

export default CreateLivraison;
