import React, { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient";

function PendenciaForm({ onClose }) {
  const [fornecedores, setFornecedores] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [formData, setFormData] = useState({
    fornecedor: "",
    pedido: "",
    hora: "",
    motivo: "",
    departamento: "",
  });

  useEffect(() => {
    const fetchFornecedores = async () => {
      const { data, error } = await supabase
        .from('agendamento')
        .select('fornecedor');
  
      if (error) {
        console.error('Erro ao buscar fornecedores:', error);
      } else {
        const uniqueFornecedores = [...new Set(data.map((item) => item.fornecedor))];
        setFornecedores(uniqueFornecedores);
      }
    };
  
    fetchFornecedores();
  
    const channel = supabase
      .channel('public:agendamento')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'agendamento' },
        (payload) => {
          const newFornecedor = payload.new.fornecedor;
          setFornecedores((prevFornecedores) => {
            if (!prevFornecedores.includes(newFornecedor)) {
              return [...prevFornecedores, newFornecedor];
            }
            return prevFornecedores;
          });
        }
      )
      .subscribe();
  
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  

  const handleFornecedorChange = async (e) => {
    const fornecedorSelecionado = e.target.value;
    setFormData({ ...formData, fornecedor: fornecedorSelecionado });

    const { data, error } = await supabase
      .from("agendamento")
      .select("pedido")
      .eq("fornecedor", fornecedorSelecionado);

    if (error) {
      console.error("Erro ao buscar pedidos:", error);
    } else {
      const uniquePedidos = [...new Set(data.map((item) => item.pedido))];
      setPedidos(uniquePedidos);
    }
  };


  const now = new Date();
  const formattedTime = now.toTimeString().split(" ")[0]; 


  const handleSubmit = async (e) => {
    e.preventDefault();

    const { error } = await supabase.from("registro_fornecedor").insert([
      {
        ...formData,
        status: "AGUARDANDO LIBERACAO",
        hora_abertura: formattedTime,
      },
    ]);

    if (error) {
      console.error("Erro ao inserir pendência:", error);
    } else {
      alert("Pendência adicionada com sucesso!");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75">
    <div className="bg-gray-800 p-6 rounded shadow-md w-96 text-white">
        <h2 className="text-2xl font-bold mb-4">Abrir Pendência</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1">Fornecedor:</label>
            <select
              value={formData.fornecedor}
              onChange={handleFornecedorChange}
              className="w-full border border-gray-600 bg-gray-700 text-white p-2 rounded"
            >
              <option value="">Selecione</option>
              {fornecedores.map((fornecedor) => (
                <option key={fornecedor} value={fornecedor}>
                  {fornecedor}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block mb-1">Pedido:</label>
            <select
              value={formData.pedido}
              onChange={(e) =>
                setFormData({ ...formData, pedido: e.target.value })
              }
              className="w-full border border-gray-600 bg-gray-700 text-white p-2 rounded"
            >
              <option value="">Selecione</option>
              {pedidos.map((pedido) => (
                <option key={pedido} value={pedido}>
                  {pedido}
                </option>
              ))}
              <option value="SEM PEDIDO">SEM PEDIDO</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block mb-1">Hora de Abertura:</label>
              <input
                type="time"
                value={formData.hora_abertura}
                onChange={(e) =>
                  setFormData({ ...formData, hora_abertura: e.target.value })
                }
                className="w-full border border-gray-600 bg-gray-700 text-white p-2 rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1">Hora de Chegada:</label>
              <input
                type="time"
                value={formData.hora}
                onChange={(e) =>
                  setFormData({ ...formData, hora: e.target.value })
                }
                className="w-full border border-gray-600 bg-gray-700 text-white p-2 rounded"
              />
            </div>
          <div className="mb-4">
            <label className="block mb-1">Motivo:</label>
            <input
              type="text"
              value={formData.motivo}
              onChange={(e) =>
                setFormData({ ...formData, motivo: e.target.value })
              }
              className="w-full border border-gray-600 bg-gray-700 text-white p-2 rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Departamento:</label>
            <select
              value={formData.departamento}
              onChange={(e) =>
                setFormData({ ...formData, departamento: e.target.value })
              }
              className="w-full border border-gray-600 bg-gray-700 text-white p-2 rounded"
            >
              <option value="">Selecione</option>
              <option value="Mercearia">Mercearia</option>
              <option value="Perecíveis">Perecíveis</option>
            </select>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
               className="mr-2 px-4 py-2 border border-gray-600 rounded text-white hover:bg-gray-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
               className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PendenciaForm;
