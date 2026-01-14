import React, { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import LoadingSpinner from "../components/LoadingSpinner";
import { getAllAgentLogs } from "../services/userService";

function AgentsLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAllAgentLogs();
        setLogs(data);
      } catch (err) {
        setError("Erreur lors du chargement des logs agents.");
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-600 p-4">{error}</div>;

  return (
    <div className="min-h-screen bg-muted/30 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <Card>
          <h1 className="text-2xl font-bold mb-4">
            Logs des actions des agents
          </h1>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Agent</th>
                  <th className="p-3 text-left">Action</th>
                  <th className="p-3 text-left">Cible</th>
                  <th className="p-3 text-left">Détails</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-6 text-center text-muted-foreground"
                    >
                      Aucun log trouvé
                    </td>
                  </tr>
                ) : (
                  logs.map((log, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-border hover:bg-muted/20"
                    >
                      <td className="p-3">
                        {new Date(log.date).toLocaleString("fr-FR")}
                      </td>
                      <td className="p-3">
                        {log.agent_nom || log.agent_username || "-"}
                      </td>
                      <td className="p-3">{log.action}</td>
                      <td className="p-3">
                        {log.target_type} #{log.target_id}
                      </td>
                      <td className="p-3">{log.details || "-"}</td>
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

export default AgentsLogPage;
