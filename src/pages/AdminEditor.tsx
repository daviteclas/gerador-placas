import { useState } from 'react';
import { PDFViewer, pdf } from '@react-pdf/renderer';
import { ArrowLeft, Save, Copy, Printer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import layoutConfigsData from '../config/layoutConfig.json';
import { PlacasDocument } from '../features/pdf/PlacasDocument';
import type { ItemFilaPlaca } from '../types';

const dummyItem: ItemFilaPlaca = {
  id: 'dummy-1',
  produto: {
    CODPROD: '501569',
    DESCRICAOPROD: 'LAVADORA AUTOM. 13KGfff 110V BRANCO - CONSUL asdfasdf asdfsadf',
    FANTASIA: 'BRITANIA',
    codbarra: '7891234567890',
    QTMAXPARCELA: 24,
  },
  preco: {
    PRECO: 3999.99,
    DATA: new Date().toISOString(),
    CODSITPROD: 'A',
  },
  seguroSelecionado: {
    TEMPOGARANTIA: 12,
    DESCRICAOSEG: 'ROUBO E FURTO QUALIFICADO',
    PRECOSEGURO: 499.99,
  },
  formaPagamentoSelecionada: 'Cartão AFINZ',
  valorParcela: 199.99,
  valorTotal: 4799.76,
  numParcelas: 24,
  tipoPlano: 'COM_JUROS',
  comEntrada: false,
  valorParcelaSeguro: 20.83,
  valorTotalSeguro: 5299.75,
  precoDe: 4599.99,
  percentualDesconto: 13,
  mostrarDesconto: true,
  fonte: 'PlaypenSans',
  tipoCartao: 'AFINZ',
  layoutId: '1x1'
};

export default function AdminEditor() {
  const navigate = useNavigate();
  const [config, setConfig] = useState<any>(JSON.parse(JSON.stringify(layoutConfigsData)));
  const [selectedLayout, setSelectedLayout] = useState<string>('1x1');
  const [selectedFont, setSelectedFont] = useState<string>('PlaypenSans');
  const [selectedDigits, setSelectedDigits] = useState<number>(3);
  const [isModoDePor, setIsModoDePor] = useState<boolean>(true);

  const layouts = Object.keys(config);
  
  const handleConfigChange = (layout: string, element: string, property: string, value: number) => {
    setConfig((prev: any) => {
      const newConfig = { ...prev };
      newConfig[layout] = { ...newConfig[layout] };
      newConfig[layout][element] = { ...newConfig[layout][element] };
      newConfig[layout][element][property] = value;
      return newConfig;
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    alert('Configuração copiada para a área de transferência!');
  };

  const handleUpdateLayout = async () => {
    try {
      const response = await fetch('/api/save-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config, null, 2)
      });
      if (response.ok) {
        alert('Layout atualizado com sucesso no arquivo layoutConfig.json!');
      } else {
        alert('Erro ao atualizar layout. Verifique o console.');
      }
    } catch (error) {
      console.error(error);
      alert('Erro de rede ao atualizar layout.');
    }
  };

  const handlePrintTest = async () => {
    try {
      const doc = <PlacasDocument layoutId={selectedLayout} fila={dummyFila} customConfig={config} />;
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (error) {
      console.error("Erro ao gerar PDF de teste:", error);
      alert("Houve um erro ao preparar o PDF para impressão de teste.");
    }
  };

  const currentConfig = config[selectedLayout];

  // A fila precisa de múltiplos itens para o layout 8x1 e 2x1 mostrar adequadamente
  let dummyFila: ItemFilaPlaca[] = [];
  const baseItem = { ...dummyItem, fonte: selectedFont };
  if (selectedDigits === 1) {
    baseItem.valorParcela = 9.99;
    baseItem.preco = { ...baseItem.preco, PRECO: 9.99 };
  } else if (selectedDigits === 2) {
    baseItem.valorParcela = 99.99;
    baseItem.preco = { ...baseItem.preco, PRECO: 99.99 };
  } else if (selectedDigits === 3) {
    baseItem.valorParcela = 999.99;
    baseItem.preco = { ...baseItem.preco, PRECO: 999.99 };
  } else if (selectedDigits === 4) {
    baseItem.valorParcela = 9999.99;
    baseItem.preco = { ...baseItem.preco, PRECO: 9999.99 };
  }
  
  if (!isModoDePor) {
    baseItem.precoDe = undefined;
    baseItem.mostrarDesconto = false;
  }
  if (selectedLayout === '1x1' || selectedLayout === '1x2') {
    dummyFila = [{...baseItem, layoutId: selectedLayout}];
  } else if (selectedLayout === '2x1') {
    dummyFila = [{...baseItem, layoutId: selectedLayout, id: '1'}, {...baseItem, layoutId: selectedLayout, id: '2'}];
  } else if (selectedLayout === '8x1') {
    dummyFila = Array.from({length: 8}).map((_, i) => ({...baseItem, layoutId: selectedLayout, id: String(i)}));
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
            title="Voltar"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              Editor de Layout (Admin)
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg p-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={isModoDePor} 
              onChange={e => setIsModoDePor(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            Modo De/Por
          </label>
          <select 
            value={selectedDigits} 
            onChange={e => setSelectedDigits(Number(e.target.value))}
            className="border border-gray-300 rounded-lg p-2 font-medium bg-white"
          >
            <option value={1}>1 Dígito</option>
            <option value={2}>2 Dígitos</option>
            <option value={3}>3 Dígitos</option>
            <option value={4}>4 Dígitos</option>
          </select>
          <select 
            value={selectedFont} 
            onChange={e => setSelectedFont(e.target.value)}
            className="border border-gray-300 rounded-lg p-2 font-medium bg-white"
          >
            <option value="PlaypenSans">PlaypenSans</option>
            <option value="Montserrat">Montserrat</option>
            <option value="Grandstander">Grandstander</option>
          </select>
          <select 
            value={selectedLayout} 
            onChange={e => setSelectedLayout(e.target.value)}
            className="border border-gray-300 rounded-lg p-2 font-medium bg-white"
          >
            {layouts.map(l => (
              <option key={l} value={l}>Layout {l}</option>
            ))}
          </select>
          <button
            onClick={handlePrintTest}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" /> Imprimir Teste
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Copy className="w-4 h-4" /> Copiar JSON
          </button>
          <button
            onClick={handleUpdateLayout}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" /> Atualizar Layout
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar (Editor) */}
        <div className="w-96 bg-white border-r border-gray-200 overflow-y-auto shrink-0 flex flex-col">
          <div className="p-4 bg-gray-100 border-b border-gray-200 font-semibold text-gray-700">
            Ajustes para {selectedLayout}
          </div>
          <div className="p-4 space-y-6">
            {(() => {
              const orderedKeys = [
                'nomeProduto',
                'nomeProdutoSemDePor',
                'codigo',
                'codigoSemDePor'
              ];
              const sortedElementKeys = Object.keys(currentConfig).sort((a, b) => {
                const indexA = orderedKeys.indexOf(a);
                const indexB = orderedKeys.indexOf(b);
                if (indexA !== -1 && indexB !== -1) return indexA - indexB;
                if (indexA !== -1) return -1;
                if (indexB !== -1) return 1;
                return 0;
              });

              return sortedElementKeys.map(elementKey => (
              <div key={elementKey} className="border border-gray-200 rounded-lg p-4 bg-gray-50 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-3 capitalize">{elementKey}</h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.keys(currentConfig[elementKey]).map(propKey => {
                    const val = currentConfig[elementKey][propKey];
                    if (typeof val === 'number') {
                      return (
                        <div key={propKey} className="flex flex-col gap-1">
                          <label className="text-xs text-gray-600 font-medium capitalize">{propKey}</label>
                          <input 
                            type="number" 
                            step={propKey === 'opacity' ? 0.1 : 1}
                            value={val}
                            onChange={(e) => handleConfigChange(selectedLayout, elementKey, propKey, parseFloat(e.target.value) || 0)}
                            className="border border-gray-300 rounded p-1 text-sm bg-white"
                          />
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            ));
            })()}
          </div>
        </div>

        {/* Right Panel (PDF Live Preview) */}
        <div className="flex-1 bg-gray-200 relative overflow-hidden">
          <PDFViewer width="100%" height="100%" className="border-none w-full h-full" showToolbar={false}>
            <PlacasDocument layoutId={selectedLayout} fila={dummyFila} customConfig={config} />
          </PDFViewer>
        </div>
      </div>
    </div>
  );
}
