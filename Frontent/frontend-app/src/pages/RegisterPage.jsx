
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { register as apiRegister } from '../services/auth'; // Renamed to avoid conflict

function RegisterPage() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (username, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiRegister(username, email, password);
      console.log('Registration successful:', result);
      alert('Inscription réussie! Vous pouvez maintenant vous connecter.');
      navigate('/login'); // Redirect to login page on successful registration
    } catch (err) {
      console.error('Registration error:', err);
      // Handle different error formats
      if (err.username) {
        setError(`Nom d'utilisateur: ${err.username.join(', ')}`);
      } else if (err.email) {
        setError(`Email: ${err.email.join(', ')}`);
      } else if (err.password) {
        setError(`Mot de passe: ${err.password.join(', ')}`);
      } else if (err.detail) {
        setError(err.detail);
      } else if (err.message) {
        setError(err.message);
      } else if (typeof err === 'string') {
        setError(err);
      } else {
        setError('Échec de l\'inscription. Veuillez vérifier vos informations et réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <AuthForm type="register" onSubmit={handleRegister} loading={loading} error={error} />
    </div>
  );
}

export default RegisterPage;
