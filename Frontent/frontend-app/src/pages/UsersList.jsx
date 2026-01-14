import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, Plus, Edit2, Trash2, Search, Shield } from "lucide-react";
import { getAllUsers, deleteUser } from "../services/userService";
import LoadingSpinner from "../components/LoadingSpinner";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { useAuth } from "../contexts/AuthContext";

function UsersList() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const { user } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, roleFilter, users]);

  const fetchUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
      setFilteredUsers(data);
    } catch (err) {
      setError(err.message || "Erreur lors du chargement des utilisateurs.");
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(
        (u) =>
          u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter !== "ALL") {
      filtered = filtered.filter((u) => u.role === roleFilter);
    }

    setFilteredUsers(filtered);
  };

  const handleDelete = async (id) => {
    if (
      window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")
    ) {
      try {
        await deleteUser(id);
        fetchUsers();
      } catch (err) {
        setError(
          err.message || "Erreur lors de la suppression de l'utilisateur."
        );
      }
    }
  };

  const getRoleBadge = (role) => {
    const config = {
      ADMIN: { bg: "bg-red-100", text: "text-red-800", label: "Admin" },
      GESTIONNAIRE: {
        bg: "bg-purple-100",
        text: "text-purple-800",
        label: "Gestionnaire",
      },
      OPERATEUR: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        label: "Opérateur",
      },
      LIVREUR: { bg: "bg-green-100", text: "text-green-800", label: "Livreur" },
    };
    const c = config[role] || {
      bg: "bg-gray-100",
      text: "text-gray-800",
      label: role,
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}
      >
        {c.label}
      </span>
    );
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-muted/30 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Utilisateurs
              </h1>
              <p className="text-muted-foreground mt-1">
                {filteredUsers.length} utilisateur(s) trouvé(s)
              </p>
            </div>
          </div>
          {user?.role === "ADMIN" && (
            <Link to="/users/new">
              <Button className="flex items-center gap-2 w-full sm:w-auto">
                <Plus className="w-4 h-4" />
                Nouvel utilisateur
              </Button>
            </Link>
          )}
        </div>

        {/* Filters */}
        <Card className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder="Rechercher par nom d'utilisateur ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-primary outline-none bg-card"
            >
              <option value="ALL">Tous les rôles</option>
              <option value="ADMIN">Admin</option>
              <option value="GESTIONNAIRE">Gestionnaire</option>
              <option value="OPERATEUR">Opérateur</option>
              <option value="LIVREUR">Livreur</option>
            </select>
          </div>
        </Card>

        {/* Error */}
        {error && (
          <Card className="border-red-200 bg-red-50 p-4">
            <p className="text-red-800">{error}</p>
          </Card>
        )}

        {/* Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left p-2 sm:p-3 lg:p-4 font-semibold text-foreground text-sm">
                    ID
                  </th>
                  <th className="text-left p-2 sm:p-3 lg:p-4 font-semibold text-foreground text-sm">
                    Utilisateur
                  </th>
                  <th className="text-left p-2 sm:p-3 lg:p-4 font-semibold text-foreground text-sm hidden md:table-cell">
                    Email
                  </th>
                  <th className="text-left p-2 sm:p-3 lg:p-4 font-semibold text-foreground text-sm">
                    Rôle
                  </th>
                  <th className="text-left p-2 sm:p-3 lg:p-4 font-semibold text-foreground text-sm">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="p-8 text-center text-muted-foreground"
                    >
                      Aucun utilisateur trouvé
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((userItem) => (
                    <tr
                      key={userItem.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-3 sm:p-4">
                        <span className="font-medium">#{userItem.id}</span>
                      </td>
                      <td className="p-3 sm:p-4">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-primary" />
                          <span className="font-medium">
                            {userItem.username}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground sm:hidden block mt-1">
                          {userItem.email}
                        </span>
                      </td>
                      <td className="p-3 sm:p-4 hidden sm:table-cell">
                        <span className="text-sm">{userItem.email}</span>
                      </td>
                      <td className="p-3 sm:p-4">
                        {getRoleBadge(userItem.role)}
                      </td>
                      <td className="p-3 sm:p-4">
                        {user?.role === "ADMIN" && (
                          <div className="flex gap-2">
                            <Link to={`/users/edit/${userItem.id}`}>
                              <button className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors">
                                <Edit2 className="w-4 h-4" />
                              </button>
                            </Link>
                            <button
                              onClick={() => handleDelete(userItem.id)}
                              className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default UsersList;
