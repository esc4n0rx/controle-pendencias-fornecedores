import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

function EditPendenciaForm({ pendencia, onClose }) {
  const [motivo, setMotivo] = useState(pendencia.motivo || '');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { error } = await supabase
      .from('registro_fornecedor')
      .update({ motivo })
      .eq('id', pendencia.id);

    if (error) {
      console.error('Erro ao atualizar pendência:', error);
    } else {
      alert('Motivo atualizado com sucesso!');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75">
      <div className="bg-gray-800 p-6 rounded shadow-md w-96 text-white">
        <h2 className="text-2xl font-bold mb-4">Editar Pendência</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1">Motivo:</label>
            <input
              type="text"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="w-full border border-gray-600 bg-gray-700 text-white p-2 rounded"
            />
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

export default EditPendenciaForm;
