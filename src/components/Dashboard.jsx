import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import PendenciaForm from './PendenciaForm';
import EditPendenciaForm from './EditPendenciaForm';
import Settings from './Settings';

function Dashboard() {
  const [pendencias, setPendencias] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editPendencia, setEditPendencia] = useState(null);

  const fetchPendencias = async () => {
    const { data, error } = await supabase
      .from('registro_fornecedor')
      .select('*')
      .neq('status', 'RESOLVIDO');

    if (error) {
      console.error('Erro ao buscar pendências:', error);
    } else {
      setPendencias(data);
    }
  };

  useEffect(() => {
    fetchPendencias(); 


    const channel = supabase
      .channel('public:registro_fornecedor')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'registro_fornecedor' },
        (payload) => {
          console.log('Mudança recebida!', payload);

          if (payload.eventType === 'INSERT') {
            setPendencias((prevPendencias) => [...prevPendencias, payload.new]);
          } else if (payload.eventType === 'UPDATE') {
            if (payload.new.status === 'RESOLVIDO') {
              setPendencias((prevPendencias) =>
                prevPendencias.filter((p) => p.id !== payload.new.id)
              );
            } else {
              setPendencias((prevPendencias) =>
                prevPendencias.map((p) =>
                  p.id === payload.new.id ? payload.new : p
                )
              );
            }
          } else if (payload.eventType === 'DELETE') {
            setPendencias((prevPendencias) =>
              prevPendencias.filter((p) => p.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel); 
    };
  }, []);

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Controle de Pendências CD-Pavuna</h1>
      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-6 right-6 bg-custom-purple text-white p-4 rounded-full shadow-lg hover:bg-hover-custom-purple"
      >
        Abrir Pendência
      </button>
      {showForm && (
        <PendenciaForm
          onClose={() => {
            setShowForm(false);
            fetchPendencias(); 
          }}
        />
      )}
      {editPendencia && (
        <EditPendenciaForm
          pendencia={editPendencia}
          onClose={() => {
            setEditPendencia(null);
            fetchPendencias();
          }}
        />
      )}
      <button
        onClick={() => setShowSettings(true)}
        className="absolute top-6 right-6 text-custom-purple hover:text-hover-custom-purple"
      >
        ⚙️
      </button>
      {showSettings && (
        <Settings onClose={() => setShowSettings(false)} />
      )}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-custom-purple p-4 rounded shadow">
          <h2 className="text-xl font-semibold">Mercearia</h2>
          <p className="text-2xl">
            {
              pendencias.filter(
                (p) => p.departamento === 'Mercearia'
              ).length
            }
          </p>
        </div>
        <div className="bg-custom-purple p-4 rounded shadow">
          <h2 className="text-xl font-semibold">Perecíveis</h2>
          <p className="text-2xl">
            {
              pendencias.filter(
                (p) => p.departamento === 'Perecíveis'
              ).length
            }
          </p>
        </div>
      </div>
      <table className="min-w-full bg-gray-800 rounded shadow">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b border-gray-700">Departamento</th>
            <th className="py-2 px-4 border-b border-gray-700">Fornecedor</th>
            <th className="py-2 px-4 border-b border-gray-700">Pedido</th>
            <th className="py-2 px-4 border-b border-gray-700">Horário de Abertura</th>
            <th className="py-2 px-4 border-b border-gray-700">Horário de Chegada no CD</th>
            <th className="py-2 px-4 border-b border-gray-700">Status</th>
            <th className="py-2 px-4 border-b border-gray-700">Motivo</th>
            <th className="py-2 px-4 border-b border-gray-700">Ações</th>
          </tr>
        </thead>
        <tbody>
          {pendencias.map((pendencia) => (
            <tr key={pendencia.id} className="hover:bg-gray-700">
              <td className="py-2 px-4 border-b border-gray-700">
                {pendencia.departamento}
              </td>
              <td className="py-2 px-4 border-b border-gray-700">
                {pendencia.fornecedor}
              </td>
              <td className="py-2 px-4 border-b border-gray-700">
                {pendencia.pedido}
              </td>
              <td className="py-2 px-4 border-b border-gray-700">
                {pendencia.hora_abertura}
              </td>
              <td className="py-2 px-4 border-b border-gray-700">
                {pendencia.hora}
              </td>
              <td className="py-2 px-4 border-b border-gray-700">
                {pendencia.status}
              </td>
              <td className="py-2 px-4 border-b border-gray-700">
                {pendencia.motivo}
              </td>
              <td className="py-2 px-4 border-b border-gray-700">
                <button
                  className="text-blue-400 hover:text-blue-300 mr-2"
                  onClick={() => setEditPendencia(pendencia)}
                >
                  Editar
                </button>
                <button
                  className="text-red-400 hover:text-red-300"
                  onClick={async () => {
                    const { error } = await supabase
                      .from("registro_fornecedor")
                      .update({
                        status: "RESOLVIDO",
                        hora_fim: new Date(),
                      })
                      .eq("id", pendencia.id);

                    if (error) {
                      console.error("Erro ao atualizar pendência:", error);
                    } else {
                      alert("Pendência marcada como resolvida!");
                      fetchPendencias();
                    }
                  }}
                >
                  Remover
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Dashboard;
