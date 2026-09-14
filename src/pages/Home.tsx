// src/pages/Home.tsx
import { useNavigate } from 'react-router-dom';
import { Grid3x2, SquareSplitHorizontal, Square, SquareSplitVertical, Tags } from 'lucide-react';
import { useQueueStore } from '../store/useQueueStore';

export default function Home() {
  const navigate = useNavigate();
  const { setLayoutSelecionado, limparFila } = useQueueStore();

  const modelos = [
    { id: '8x1', nome: '8 Placas por Folha', desc: 'Placas pequenas para gôndolas', icone: Grid3x2 },
    { id: '2x1', nome: '2 Placas por Folha', desc: 'Placas médias para eletroportáteis', icone: SquareSplitHorizontal },
    { id: '1x1', nome: '1 Placa por Folha', desc: 'Placas grandes para linha branca', icone: Square },
    { id: '1x2', nome: '1 Placa em 2 Folhas', desc: 'Placa gigante (Requer montagem)', icone: SquareSplitVertical },
  ];

  const handleSelecionarModelo = (id: string) => {
    limparFila(); // Limpa a fila caso o usuário esteja voltando de outra tela
    setLayoutSelecionado(id);
    navigate(`/generator/${id}`);
  };

  return (
    <div className="h-screen bg-gray-100 flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden">
      <div className="max-w-4xl w-full flex flex-col flex-1 min-h-0">
        <div className="text-center mb-4 sm:mb-6 shrink-0">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            Gerador de Placas
          </h1>
          <p className="mt-2 sm:mt-4 text-sm sm:text-lg text-gray-600">
            Selecione o formato desejado ou gere a partir do Gerador de Etiquetas.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[clamp(0.5rem,2vh,1.5rem)] flex-1 min-h-0 auto-rows-fr">
          {modelos.map((modelo) => {
            const Icone = modelo.icone;
            return (
              <button
                key={modelo.id}
                onClick={() => handleSelecionarModelo(modelo.id)}
                className="group flex flex-col items-center justify-center p-[clamp(0.5rem,2vh,1rem)] bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 h-full min-h-0 overflow-hidden"
              >
                <div className="p-[clamp(0.25rem,1.5vh,1rem)] bg-gray-50 rounded-full group-hover:bg-blue-100 transition-colors shrink-0">
                  <Icone className="w-[clamp(1.25rem,3vh,1.5rem)] h-[clamp(1.25rem,3vh,1.5rem)] text-gray-600 group-hover:text-blue-600" />
                </div>
                <h2 className="mt-[clamp(0.25rem,2vh,1rem)] text-[clamp(1rem,3vh,1.5rem)] font-semibold text-gray-800 shrink-0">
                  {modelo.nome}
                </h2>
                <p className="mt-[clamp(0.125rem,1vh,0.5rem)] text-[clamp(0.75rem,2vh,1rem)] text-gray-500 text-center line-clamp-2 shrink-0">
                  {modelo.desc}
                </p>
                <span className="mt-[clamp(0.25rem,2vh,1rem)] inline-flex items-center text-[clamp(0.7rem,1.5vh,0.875rem)] font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  Iniciar gerador &rarr;
                </span>
              </button>
            );
          })}

          <button
            onClick={() => navigate('/gerador-etiquetas')}
            className="md:col-span-2 group flex items-center justify-center px-[clamp(1rem,3vh,1.5rem)] py-[clamp(0.5rem,2vh,1rem)] bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-200 h-20 min-h-0 overflow-hidden"
          >
            <div className="p-[clamp(0.25rem,1.5vh,0.75rem)] bg-gray-50 rounded-full group-hover:bg-indigo-100 transition-colors mr-[clamp(0.5rem,2vh,1rem)] shrink-0">
              <Tags className="w-[clamp(1.5rem,4vh,2rem)] h-[clamp(1.5rem,4vh,2rem)] text-gray-600 group-hover:text-indigo-600" />
            </div>
            <div className="text-left flex-1 min-w-0">
              <h2 className="text-[clamp(1rem,3vh,1.25rem)] font-semibold text-gray-800 truncate">
                Gerador de Etiquetas
              </h2>
              <p className="mt-[clamp(0.125rem,1vh,0.25rem)] text-[clamp(0.75rem,2vh,0.875rem)] text-gray-500 line-clamp-2">
                Geração automática baseada em parâmetros (Filial, Data, Saldo)
              </p>
            </div>
            <span className="ml-2 inline-flex items-center text-[clamp(0.7rem,1.5vh,0.875rem)] font-medium text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              Acessar gerador &rarr;
            </span>
          </button>
        </div>
      </div>
      
      {/* Marca d'água */}
      <div className="shrink-0 mt-4 text-center text-xs sm:text-sm font-medium text-black opacity-60 select-none pointer-events-none">
        © Desenvolvido pela TI 2026
      </div>
    </div>
  );
}