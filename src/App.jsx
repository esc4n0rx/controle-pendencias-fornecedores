import React, { useEffect, useState } from "react";
import { supabase } from "./services/supabaseClient";
import Dashboard from "./components/Dashboard";
import AgendamentoUpload from "./components/AgendamentoUpload";

function App() {
  const [hasAgendamento, setHasAgendamento] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const checkAgendamento = async () => {
      const { data, error } = await supabase
      // const darkModePreference = localStorage.getItem("darkMode") === "true";
      // setDarkMode(darkModePreference);

        .from("agendamento")
        .select("id")
        .limit(1);

      if (error) {
        console.error("Erro ao verificar agendamentos:", error);
        setHasAgendamento(false);
      } else {
        setHasAgendamento(data.length > 0);
      }
    };

    checkAgendamento();
  }, []);

  if (hasAgendamento === null) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-purple-600 text-white">
      {hasAgendamento ? (
        <Dashboard />
      ) : (
        <div className="flex flex-col items-center justify-center h-screen">
          <p className="text-xl font-semibold mb-4">
            Atenção: Não encontrei nenhum agendamento. Deseja subir um novo?
          </p>
          <AgendamentoUpload />
        </div>
      )}
    </div>
  );
}

export default App;
