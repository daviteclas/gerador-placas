// src/pages/Home.tsx
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, Layers, Square, Maximize } from 'lucide-react';
import { useQueueStore } from '../store/useQueueStore';

export default function Home() {
  const navigate = useNavigate();
  const { setLayoutSelecionado, limparFila } = useQueueStore();

  const modelos = [
    { id: '8x1', nome: '8 Placas por Folha', desc: 'Placas pequenas para gôndolas', icone: LayoutGrid },
    { id: '2x1', nome: '2 Placas por Folha', desc: 'Placas médias para eletroportáteis', icone: Layers },
    { id: '1x1', nome: '1 Placa por Folha', desc: 'Placas grandes para linha branca', icone: Square },
    { id: '1x2', nome: '1 Placa em 2 Folhas', desc: 'Placa gigante (Requer montagem)', icone: Maximize },
  ];

  const handleSelecionarModelo = (id: string) => {
    limparFila(); // Limpa a fila caso o usuário esteja voltando de outra tela
    setLayoutSelecionado(id);
    navigate(`/generator/${id}`);
  };

  return (
    <div className="h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl w-full flex flex-col h-full">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            Gerador de Placas de Preço
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Selecione o formato de impressão desejado para iniciar.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
          {modelos.map((modelo) => {
            const Icone = modelo.icone;
            return (
              <button
                key={modelo.id}
                onClick={() => handleSelecionarModelo(modelo.id)}
                className="group flex flex-col items-center p-4 bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 flex-1"
              >
                <div className="p-4 bg-gray-50 rounded-full group-hover:bg-blue-100 transition-colors">
                  <Icone className="w-10 h-10 text-gray-600 group-hover:text-blue-600" />
                </div>
                <h2 className="mt-6 text-2xl font-semibold text-gray-800">
                  {modelo.nome}
                </h2>
                <p className="mt-2 text-gray-500 text-center">
                  {modelo.desc}
                </p>
                <span className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  Iniciar gerador &rarr;
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}