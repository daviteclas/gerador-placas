// src/features/pdf/PlacasDocument.tsx
import { Document, Page, Text as PdfText, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
import React, { createContext, useContext } from 'react';
import type { ItemFilaPlaca } from '../../types';
import layoutConfigsData from '../../config/layoutConfig.json';

Font.register({
  family: 'Grandstander',
  fonts: [
    { src: '/fonts/Grandstander-Regular.ttf', fontWeight: 400 },
    { src: '/fonts/Grandstander-Bold.ttf', fontWeight: 700 },
    { src: '/fonts/Grandstander-Black.ttf', fontWeight: 900 }
  ]
});

Font.register({
  family: 'Montserrat',
  fonts: [
    { src: '/fonts/Montserrat-Regular.ttf', fontWeight: 400 },
    { src: '/fonts/Montserrat-Bold.ttf', fontWeight: 700 },
    { src: '/fonts/Montserrat-Black.ttf', fontWeight: 900 }
  ]
});

Font.register({
  family: 'PlaypenSans',
  fonts: [
    { src: '/fonts/PlaypenSans-Regular.ttf', fontWeight: 400 },
    { src: '/fonts/PlaypenSans-Bold.ttf', fontWeight: 700 },
    { src: '/fonts/PlaypenSans-ExtraBold.ttf', fontWeight: 800 }
  ]
});

// Não permitir separação/hifenização arbitrária de palavras
Font.registerHyphenationCallback((word) => [word]);

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#ffffff',
    fontFamily: 'PlaypenSans'
  },
  gridContainer: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignContent: 'flex-start',
    margin: 0,
    padding: 0,
    border: 0,
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: -1
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    opacity: 0.4
  }
});

const FontContext = createContext<string>('PlaypenSans');

const Text = (props: any) => {
  const fonte = useContext(FontContext);
  return <PdfText {...props} style={[props.style, { fontFamily: fonte }]} />;
};

const MODO_CALIBRACAO = false;

const formatarMoeda = (valor: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
};

const filtrarDescricao = ( desc: string ) => {
  const regexCodigos = '' // /\b(?![A-Za-z0-9]{1,5}\b)[A-Za-z]+\d+[A-Za-z0-9]*\b/gi;
  let descFiltrada = desc.replace(regexCodigos, '');
  descFiltrada = descFiltrada.replace(/\s+/g, ' ').trim();
  descFiltrada = descFiltrada.replace('NULO', '').trim();
  descFiltrada = descFiltrada.replace('+', ' + ').trim();
  return descFiltrada;
}

const PrecoCentavosPequenos = ({ 
  valor, 
  tamanhoInteiro = 60, 
  tamanhoCentavos = 30,
  cor = '#000000'
}: { 
  valor: number, 
  tamanhoInteiro?: number,
  tamanhoCentavos?: number,
  cor?: string
}) => {
  const formatado = Number(valor).toFixed(2);
  const [inteiro, centavos] = formatado.split('.');
  const inteiroComPonto = parseInt(inteiro, 10).toLocaleString('pt-BR');

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center', paddingBottom: tamanhoInteiro * 0.08, marginRight: -(tamanhoInteiro * 0.2) }}>
      <View style={{ flexDirection: 'row' }}>
        {inteiroComPonto.split('.').map((part, index, arr) => (
          <React.Fragment key={index}>
            <Text style={{ fontSize: tamanhoInteiro, fontWeight: 900, color: cor, lineHeight: 1 }}>
              {part}
            </Text>
            {index < arr.length - 1 && (
              <Text style={{ fontSize: tamanhoInteiro, fontWeight: 900, color: cor, lineHeight: 1 }}>
                .
              </Text>
            )}
          </React.Fragment>
        ))}
      </View>
      <Text style={{ fontSize: tamanhoCentavos, fontWeight: 900, color: cor }}>
        ,{centavos}
      </Text>
    </View>
  );
};

const RenderCartaoBadge = ({ tipoCartao, fontSize }: { tipoCartao?: string, fontSize: number }) => {
  if (tipoCartao !== 'AFINZ' && tipoCartao !== 'AGORACRED') return null;
  const isAfinz = tipoCartao === 'AFINZ';
  const cartaoColor = '#000';
  const cartaoText = isAfinz ? 'AFINZ' : 'AGORACRED';

  return (
    <View style={{ minWidth: 'auto', backgroundColor: cartaoColor, padding: `${fontSize * 0.2} ${fontSize * 0.5}`, borderRadius: fontSize * 0.3 }}>
      <Text style={{ color: '#FFF', fontSize: fontSize, fontWeight: 900 }}>
        {cartaoText}
      </Text>
    </View>
  );
};

// Determina o tamanho da "célula" do grid baseado no layout
const getContainerStyle = (layoutId: string, isBottomRow: boolean) => {
  const base: any = { position: 'relative', overflow: 'hidden' };
  if (layoutId === '1x1') return { ...base, width: '100%', height: '100%' };
  if (layoutId === '2x1') return { ...base, width: '50%', height: '100%' };
  if (layoutId === '8x1') return { ...base, width: '25%', height: '50%', ...(isBottomRow && { transform: 'rotate(180deg)' }) };
  if (layoutId === '1x2') return { ...base, width: '100%', height: '100%' };
  return base;
}

const RenderPlacaAbsoluta = ({ item, layoutId, index, isTopPage = true, customConfig }: { item: ItemFilaPlaca, layoutId: string, index?: number, isTopPage?: boolean, customConfig?: any }) => {
  const confs = (customConfig || layoutConfigsData as any)[layoutId];
  const isBottomRow = layoutId === '8x1' && index !== undefined && index >= 4;
  const containerStyle = getContainerStyle(layoutId, isBottomRow);
  const fonte = (item as any).fonte || 'PlaypenSans';
  
  const isFinanciado = item.numParcelas > 1;
  const textoParcelas = item.comEntrada && isFinanciado ? `1+${item.numParcelas - 1}` : `${item.numParcelas}`;
  
  // No layout 1x2, a página de baixo sobe todo o conteúdo na exata altura de uma folha A4 Paisagem (595.28px)
  const yOffset = (layoutId === '1x2' && !isTopPage) ? 595.28 : 0;
  
  return (
    <FontContext.Provider value={fonte}>
      <View style={[containerStyle]}>
      
      {/* 1. Nome do Produto */}
      {(confs.nomeProduto || confs.nomeProdutoSemDePor) && (() => {
         const configAtiva = (!(item as any).precoDe && confs.nomeProdutoSemDePor) ? confs.nomeProdutoSemDePor : confs.nomeProduto;
         if (!configAtiva) return null;
         const nomeStr = `${filtrarDescricao(item.produto.DESCRICAOPROD)}${item.produto.DESCRICAOPROD?.includes('+') ? '' : ` - ${item.produto.FANTASIA}`}`;
         let numLen = nomeStr.length
         let fsNome = configAtiva.fontSize;

         return (
         <View style={{ position: 'absolute', left: configAtiva.x, top: configAtiva.y - yOffset, width: configAtiva.width, height: configAtiva.height }}>
            <Text maxLines={2} style={{ fontSize: numLen > 40 ? fsNome * 0.7 : fsNome, fontWeight: 'bold', lineHeight: 1.1, textAlign: 'left', textOverflow: 'ellipsis' }}>
               {nomeStr}
            </Text>
         </View>
         );
      })()}

      {/* 2. Código */}
      {(confs.codigo || confs.codigoSemDePor) && (() => {
         const configAtiva = (!(item as any).precoDe && confs.codigoSemDePor) ? confs.codigoSemDePor : confs.codigo;
         if (!configAtiva) return null;
         return (
         <View style={{ position: 'absolute', left: configAtiva.x, top: configAtiva.y - yOffset, width: configAtiva.width, height: configAtiva.height }}>
            <Text style={{ fontSize: configAtiva.fontSize, color: '#666', fontWeight: 'bold' }}>
               Cód: {item.produto.CODPROD}
            </Text>
         </View>
         );
      })()}

      {/* 3. Modo De/Por */}
      {confs.dePor && (item as any).precoDe && (
         <View style={{ position: 'absolute', left: confs.dePor.x, top: confs.dePor.y - yOffset, width: confs.dePor.width, height: confs.dePor.height, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
            {(item as any).mostrarDesconto && (
              <View style={{ backgroundColor: '#000', padding: '2 6', borderRadius: 4, marginRight: 8 }}>
                <Text style={{ color: '#FFF', fontSize: confs.dePor.fontSize * 0.7, fontWeight: 900 }}>OFERTA!</Text>
              </View>
            )}
            <Text style={{ fontSize: confs.dePor.fontSize, color: '#000', fontWeight: 'bold', marginRight: 4 }}>De:</Text>
            <Text style={{ fontSize: confs.dePor.fontSize, color: '#000', textDecoration: 'line-through', fontWeight: 'bold', marginRight: 8 }}>
               {formatarMoeda((item as any).precoDe)}
            </Text>
            {(item as any).mostrarDesconto && (
              <View style={{ backgroundColor: '#000', padding: '2 6', borderRadius: 4 }}>
                <Text style={{ color: '#FFF', fontSize: confs.dePor.fontSize * 0.8, fontWeight: 900 }}>-{(item as any).percentualDesconto}%</Text>
              </View>
            )}
         </View>
      )}

      {/* 4. Flag Financeira */}
      {confs.flagFinanceira && (
         <View style={{ position: 'absolute', left: confs.flagFinanceira.x, top: confs.flagFinanceira.y - yOffset, alignItems: 'flex-end' }}>
            <RenderCartaoBadge tipoCartao={(item as any).tipoCartao} fontSize={confs.flagFinanceira.fontSize} />
         </View>
      )}

      {/* 5. Texto À Vista */}
      {confs.precoAVista && (
         <View style={{ position: 'absolute', left: confs.precoAVista.x, top: confs.precoAVista.y - yOffset, width: confs.precoAVista.width, height: confs.precoAVista.height }}>
            {isFinanciado ? (
              <Text style={{ fontSize: confs.precoAVista.fontSize, color: '#4B5563', fontWeight: 'bold', textAlign: 'right' }}>
                 A vista: {formatarMoeda(item.preco.PRECO)}
              </Text>
            ) : (
              <Text style={{ fontSize: confs.precoAVista.fontSize, color: '#4B5563', fontWeight: 'bold', textAlign: 'right' }}>
                 A vista
              </Text>
            )}
         </View>
      )}

      {/* 5.5 Texto POR: */}
      {confs.textoPor && (item as any).precoDe && (
         <View style={{ position: 'absolute', left: confs.textoPor.x, top: confs.textoPor.y - yOffset, width: confs.textoPor.width, height: confs.textoPor.height }}>
            <Text style={{ fontSize: confs.textoPor.fontSize, fontWeight: 900, color: '#000', lineHeight: 1 }}>POR:</Text>
         </View>
      )}

      {/* 6. Preço Principal */}
      {confs.precoParcelado && (() => {
         const valorExibido = isFinanciado ? item.valorParcela : item.preco.PRECO;
         const digitos = parseInt(Number(valorExibido).toFixed(2).split('.')[0], 10).toString().length;
         let fsValue = confs.precoParcelado.fontSize4Digit || confs.precoParcelado.fontSize3Digit || confs.precoParcelado.fontSize2Digit || confs.precoParcelado.fontSize1Digit;
         
         if (digitos === 1) fsValue = confs.precoParcelado.fontSize1Digit;
         else if (digitos === 2) fsValue = confs.precoParcelado.fontSize2Digit || confs.precoParcelado.fontSize1Digit;
         else if (digitos === 3) fsValue = confs.precoParcelado.fontSize3Digit || confs.precoParcelado.fontSize2Digit;

        //  if (fonte == 'PlaypenSans' && layoutId != '1x1') fsValue *= 0.9;

         return (
           <View style={{ position: 'absolute', left: confs.precoParcelado.x, top: confs.precoParcelado.y - yOffset, width: confs.precoParcelado.width, height: confs.precoParcelado.height, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              {isFinanciado && (
                 <Text style={{ fontSize: confs.precoParcelado.fontSizeLabel, fontWeight: 900, color: '#111', marginRight: 2, textAlign: 'right', lineHeight: 1 }}>
                    {textoParcelas}x{'\n'}DE
                 </Text>
              )}
              <PrecoCentavosPequenos 
                 valor={valorExibido} 
                 tamanhoInteiro={fsValue} 
                 tamanhoCentavos={fsValue / 3} 
              />
           </View>
         );
      })()}

      {/* 7. Total a Prazo */}
      {confs.totalAPrazo && (
         <View style={{ position: 'absolute', left: confs.totalAPrazo.x, top: confs.totalAPrazo.y - yOffset, width: confs.totalAPrazo.width, height: confs.totalAPrazo.height }}>
            <Text style={{ fontSize: confs.totalAPrazo.fontSize, color: '#666', fontWeight: 'bold', textAlign: 'right' }}>
               {isFinanciado ? `Total a prazo: ${formatarMoeda(item.valorTotal)}` : 'Dinheiro ou PIX'}
            </Text>
         </View>
      )}

      {/* 8. Garantia */}
      {confs.garantia && item.seguroSelecionado && (() => {
         const fsPrincipal = confs.precoParcelado ? (confs.precoParcelado.fontSize2Digit || 60) : 60;
         const garantiaFsValue = layoutId == '8x1' ? fsPrincipal / 3.3 : fsPrincipal / 5;

         return (
         <View style={{ position: 'absolute', left: confs.garantia.x, top: confs.garantia.y - yOffset, width: confs.garantia.width, height: confs.garantia.height, flexDirection: 'column', alignItems: 'flex-end' }}>
            <Text style={{ fontSize: confs.garantia.fontSizeTitle, fontWeight: 'bold', marginBottom: 2 }}>PROTEJA SUA COMPRA</Text>
            <Text style={{ fontSize: confs.garantia.fontSizeDesc, fontWeight: 'bold', marginBottom: 8 }}>{(item.seguroSelecionado.DESCRICAOSEG).substring(0, 20)} POR APENAS</Text>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginBottom: 4, marginRight: 10 }}>
               <Text style={{ fontSize: confs.garantia.fontSizeTitle, fontWeight: 'bold', marginBottom: (confs.garantia.fontSizeTitle * 0.9), marginRight: 15 }}>
                 {isFinanciado ? `${textoParcelas}x de` : 'A vista'}
               </Text>
               <PrecoCentavosPequenos 
                  valor={isFinanciado ? (item.seguroSelecionado.PRECOSEGURO / item.numParcelas) : item.seguroSelecionado.PRECOSEGURO} 
                  tamanhoInteiro={garantiaFsValue} 
                  tamanhoCentavos={layoutId == '8x1'? garantiaFsValue / 3.5 :layoutId == '1x1' ? garantiaFsValue / 2.3 : garantiaFsValue / 3} 
               />
            </View>
            <Text style={{ fontSize: confs.garantia.fontSizeDesc, color: '#666', fontWeight: 'bold', opacity: isFinanciado ? 1 : 0, marginTop: layoutId == '8x1' ? 0 : 5 }}>
               Total a prazo: {formatarMoeda(item.valorTotalSeguro || item.seguroSelecionado.PRECOSEGURO)}
            </Text>
         </View>
         );
      })()}

      {/* 9. Rodapé Jurídico */}
      {confs.rodape && (
         <View style={{ position: 'absolute', left: confs.rodape.x, top: confs.rodape.y - yOffset, width: confs.rodape.width, height: confs.rodape.height, flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: confs.rodape.fontSize, color: '#666', fontWeight: 'bold' }}>
               {(item as any).tipoCartao === 'AFINZ' ? item.numParcelas < 25 ? 'AFINZ - Taxa Mensal: 4,09%' : 'AFINZ - Taxa Mensal: 4,19%' :
                (item as any).tipoCartao === 'AGORACRED' ? 'AGORACRED - Taxa Mensal: 4,99%' :
                item.tipoPlano === 'COM_JUROS' ? 'CET Mensal: 1,35% | CET Anual: 17,46%' : ''}
            </Text>
            <Text style={{ fontSize: confs.rodape.fontSize, color: '#666', fontWeight: 'bold' }}>
               Data: {new Date(item.preco.DATA).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
            </Text>
         </View>
      )}

      </View>
    </FontContext.Provider>
  );
};


// --- DOCUMENTO PRINCIPAL ---

export function PlacasDocument({ layoutId, fila, customConfig }: { layoutId?: string; fila: ItemFilaPlaca[]; customConfig?: any }) {
  // Agrupa os itens por layoutId
  const grupos = fila.reduce((acc, item) => {
    const lId = item.layoutId || layoutId || '1x1';
    if (!acc[lId]) acc[lId] = [];
    acc[lId].push(item);
    return acc;
  }, {} as Record<string, ItemFilaPlaca[]>);

  const renderPagesForLayout = (lId: string, itens: ItemFilaPlaca[]) => {
    if (!itens || itens.length === 0) return null;
    const isLandscape = lId === '8x1' || lId === '2x1' || lId === '1x2';

    if (lId === '1x2') {
      return itens.flatMap((item) => [
        <Page key={`${item.id}-top`} size="A4" orientation="landscape" style={styles.page}>
          {MODO_CALIBRACAO && (
            <View style={styles.backgroundContainer} fixed>
              <Image src={`/templates/cartaz-1x2.png`} style={styles.backgroundImage} />
            </View>
          )}
          <View style={styles.gridContainer}>
             <RenderPlacaAbsoluta item={item} layoutId={lId} isTopPage={true} customConfig={customConfig} />
          </View>
        </Page>,
        <Page key={`${item.id}-bottom`} size="A4" orientation="landscape" style={styles.page}>
          {MODO_CALIBRACAO && (
            <View style={styles.backgroundContainer} fixed>
              <Image src={`/templates/cartaz-1x2.png`} style={styles.backgroundImage} />
            </View>
          )}
          <View style={styles.gridContainer}>
             <RenderPlacaAbsoluta item={item} layoutId={lId} isTopPage={false} customConfig={customConfig} />
          </View>
        </Page>
      ]);
    }

    let itensPorPagina = 1;
    if (lId === '8x1') itensPorPagina = 8;
    if (lId === '2x1') itensPorPagina = 2;

    const chunkArray = (array: ItemFilaPlaca[], size: number) => {
      const chunked = [];
      for (let i = 0; i < array.length; i += size) {
        chunked.push(array.slice(i, i + size));
      }
      return chunked;
    };

    const paginas = chunkArray(itens, itensPorPagina);

    return paginas.map((itensDaPagina, paginaIndex) => (
      <Page key={`page-${lId}-${paginaIndex}`} size="A4" orientation={isLandscape ? "landscape" : "portrait"} style={styles.page}>
        {MODO_CALIBRACAO && (
          <View style={styles.backgroundContainer} fixed>
            <Image src={`/templates/cartaz-${lId}.png`} style={styles.backgroundImage} />
          </View>
        )}
        <View style={styles.gridContainer}>
          {itensDaPagina.map((item, index) => {
            return <RenderPlacaAbsoluta key={item.id} item={item} layoutId={lId} index={index} customConfig={customConfig} />;
          })}
        </View>
      </Page>
    ));
  };

  return (
    <Document style={{ margin: 0, padding: 0, border: 0 }}>
      {Object.entries(grupos).map(([lId, itens]) => renderPagesForLayout(lId, itens))}
    </Document>
  );
}