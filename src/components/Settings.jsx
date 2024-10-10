import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

function Settings({ onClose }) {
  const [showAddSupplierForm, setShowAddSupplierForm] = useState(false);
  const [supplierData, setSupplierData] = useState({
    departamento: '',
    fornecedor: '',
    pedido: '',
  });

  const handleAddSupplier = async (e) => {
    e.preventDefault();

    const { error } = await supabase.from('agendamento').insert([
      {
        departamento: supplierData.departamento,
        fornecedor: supplierData.fornecedor,
        pedido: supplierData.pedido || 'SEM PEDIDO',
      },
    ]);

    if (error) {
      console.error('Erro ao adicionar fornecedor:', error);
    } else {
      alert('Fornecedor adicionado com sucesso!');
      setSupplierData({
        departamento: '',
        fornecedor: '',
        pedido: '',
      });
      setShowAddSupplierForm(false);
    }
  };

  const handleClearAgendamento = async () => {
    const confirmation = window.confirm(
      'Tem certeza que deseja limpar o agendamento? Esta ação não pode ser desfeita.'
    );
    if (confirmation) {
      const { error } = await supabase.from('agendamento').delete().neq('id', '');
      if (error) {
        console.error('Erro ao limpar agendamento:', error);
      } else {
        alert('Base de agendamento limpa com sucesso!');
      }
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75">
      <div className="bg-gray-800 p-6 rounded shadow-md w-96 text-white">
        <h2 className="text-2xl font-bold mb-4">Configurações</h2>

        <div className="mb-4">
          <button
            onClick={() => setShowAddSupplierForm(!showAddSupplierForm)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-500"
          >
            {showAddSupplierForm ? 'Cancelar' : 'Adicionar Fornecedor'}
          </button>
        </div>

        {showAddSupplierForm && (
          <form onSubmit={handleAddSupplier}>
            <div className="mb-4">
              <label className="block mb-1">Departamento:</label>
              <select
                value={supplierData.departamento}
                onChange={(e) =>
                  setSupplierData({ ...supplierData, departamento: e.target.value })
                }
                className="w-full border border-gray-600 bg-gray-700 text-white p-2 rounded"
              >
                <option value="">Selecione</option>
                <option value="Mercearia">Mercearia</option>
                <option value="Perecíveis">Perecíveis</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block mb-1">Fornecedor:</label>
              <input
                type="text"
                value={supplierData.fornecedor}
                onChange={(e) =>
                  setSupplierData({ ...supplierData, fornecedor: e.target.value })
                }
                className="w-full border border-gray-600 bg-gray-700 text-white p-2 rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1">Pedido:</label>
              <input
                type="text"
                value={supplierData.pedido}
                onChange={(e) =>
                  setSupplierData({ ...supplierData, pedido: e.target.value })
                }
                className="w-full border border-gray-600 bg-gray-700 text-white p-2 rounded"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
              >
                Salvar
              </button>
            </div>
          </form>
        )}

        <div className="mt-6">
          <button
            onClick={handleClearAgendamento}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-500"
          >
            Limpar Agendamento
          </button>
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-600 rounded text-white hover:bg-gray-700"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;
