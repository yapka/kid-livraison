import os

FRONTEND_APP_DIR = "frontend-app"
PAGES_DIR = os.path.join(FRONTEND_APP_DIR, "src", "pages")

# Ensure the pages directory exists
os.makedirs(PAGES_DIR, exist_ok=True)

# Updated content for LoginPage.jsx
login_page_content = '''
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { useAuth } from '../contexts/AuthContext';

function LoginPage() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      await login(username, password);
      navigate('/'); // Redirect to home or dashboard on successful login
    } catch (err) {
      setError('Échec de la connexion. Vérifiez vos identifiants.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content"> {/* Apply the content class for consistent page layout */}
      <AuthForm type="login" onSubmit={handleLogin} loading={loading} error={error} />
    </div>
  );
}

export default LoginPage;
'''

file_path = os.path.join(PAGES_DIR, 'LoginPage.jsx')
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(login_page_content)

print(f"✅ Successfully updated {file_path} to respect the new visual style.")
