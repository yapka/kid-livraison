import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { User, Mail, Shield } from "lucide-react";

import UserForm from "./UserForm";

function ProfilePage() {
  const { user } = useAuth();
  const [editMode, setEditMode] = useState(false);

  // Badge couleur selon le rôle
  const roleBadge = (role, display) => {
    let color = "bg-gray-200 text-gray-600 border border-gray-300";
    return (
      <span
        className={`inline-block px-2 py-1 rounded text-xs font-bold ${color}`}
      >
        {display || role}
      </span>
    );
  };

  if (editMode) {
    // Utilise UserForm en mode édition, sans password obligatoire
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-2 sm:p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow p-4 sm:p-6 border border-gray-200">
          <UserForm
            id={user?.id}
            selfEdit
            onCancel={() => setEditMode(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-2 sm:p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow p-4 sm:p-6 border border-gray-200">
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 rounded-full border border-gray-300 bg-gray-100 flex items-center justify-center shadow-sm">
            <User className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="mt-4 text-xl sm:text-2xl font-bold text-gray-800 break-all">
            {user?.username}
          </h2>
          <div className="mt-1">
            {roleBadge(user?.role, user?.role_display)}
          </div>
        </div>
        <div className="space-y-4 sm:space-y-5">
          <div className="flex items-center gap-2 sm:gap-3">
            <Mail className="w-5 h-5 text-gray-400" />
            <span className="text-gray-700 text-base break-all">
              {user?.email || (
                <span className="italic text-gray-400">
                  Email non renseigné
                </span>
              )}
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="w-5 h-5 flex items-center justify-center text-gray-400 font-bold">
              N
            </span>
            <span className="text-gray-700 text-base">
              Nom :{" "}
              {user?.last_name || (
                <span className="italic text-gray-400">Non renseigné</span>
              )}
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="w-5 h-5 flex items-center justify-center text-gray-400 font-bold">
              P
            </span>
            <span className="text-gray-700 text-base">
              Prénom :{" "}
              {user?.first_name || (
                <span className="italic text-gray-400">Non renseigné</span>
              )}
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="w-5 h-5 flex items-center justify-center text-gray-400 font-bold">
              📞
            </span>
            <span className="text-gray-700 text-base">
              Contact :{" "}
              {user?.telephone || (
                <span className="italic text-gray-400">Non renseigné</span>
              )}
            </span>
          </div>
        </div>
        <button
          className="mt-8 w-full btn btn-ghost border border-gray-300 text-gray-700 font-semibold py-2 rounded-lg hover:bg-gray-100 transition"
          onClick={() => setEditMode(true)}
        >
          Modifier le profil
        </button>
      </div>
    </div>
  );
}

export default ProfilePage;
