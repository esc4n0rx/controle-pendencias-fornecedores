import React, { useState } from "react";
import * as XLSX from "xlsx";
import { supabase } from "../services/supabaseClient";

function AgendamentoUpload() {
  const [file, setFile] = useState(null);

  const handleUpload = async () => {
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });


      const worksheet = workbook.Sheets[workbook.SheetNames[0]];

      
      let jsonData = XLSX.utils.sheet_to_json(worksheet);

     
      jsonData = jsonData.map((row) => {
        return {
          departamento: row.departamento || row.Departamento || "",
          fornecedor: row.fornecedor || row.Fornecedor || "",
          pedido:
            row.pedido === 0 || row.pedido === "0"
              ? "SEM PEDIDO"
              : row.pedido || row.Pedido || "",
        };
      });

      jsonData = jsonData.filter(
        (row) => row.departamento && row.fornecedor && row.pedido !== undefined
      );


      const { data: supabaseData, error } = await supabase
        .from("agendamento")
        .insert(jsonData);

      if (error) {
        console.error("Erro ao inserir dados:", error);
      } else {
        alert("Agendamento importado com sucesso!");
        window.location.reload();
      }
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="bg-gray-800 p-6 rounded shadow-md text-white">
      <h2 className="text-2xl font-bold mb-4">Upload de Agendamento</h2>
      <p className="mb-4">
        Baixe o template para preencher:
        <a
          href="/template_agendamento.csv"
          download
          className="text-blue-400 hover:text-blue-300 ml-2"
        >
          Download Template
        </a>
      </p>
      <input
        type="file"
        accept=".xlsx, .xls, .csv"
        onChange={(e) => setFile(e.target.files[0])}
        className="mb-4 w-full text-white"
      />
      <button
        onClick={handleUpload}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
      >
        Enviar
      </button>
    </div>
  );
}

export default AgendamentoUpload;
