// src/features/pdf/PlacasDocument.tsx
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
import type { ItemFilaPlaca } from '../../types';

Font.register({
  family: 'Grandstander',
  fonts: [
    { 
      src: '/fonts/Grandstander-Regular.ttf', 
      fontWeight: 400 
    },
    { 
      src: '/fonts/Grandstander-Bold.ttf', 
      fontWeight: 700 
    },
    { 
      src: '/fonts/Grandstander-Black.ttf', 
      fontWeight: 900 
    }
  ]
});

Font.register({
  family: 'Montserrat',
  fonts: [
    { 
      src: '/fonts/Montserrat-Regular.ttf', 
      fontWeight: 400 
    },
    { 
      src: '/fonts/Montserrat-Bold.ttf', 
      fontWeight: 700 
    },
    { 
      src: '/fonts/Montserrat-Black.ttf', 
      fontWeight: 900 
    }
  ]
});

Font.register({
  family: 'PlaypenSans',
  fonts: [
    { 
      src: '/fonts/PlaypenSans-Regular.ttf', 
      fontWeight: 400 
    },
    { 
      src: '/fonts/PlaypenSans-Bold.ttf', 
      fontWeight: 700 
    },
    { 
      src: '/fonts/PlaypenSans-ExtraBold.ttf', 
      fontWeight: 800 
    }
  ]
});

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#ffffff',
    fontFamily: 'PlaypenSans'
  },

  // NOVO: Este vai ser o contêiner que organiza as placas
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

  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: 0.4,
    objectFit: 'cover'
  },
  
  // ESTILOS: 1x1 (PÁGINA INTEIRA)
  container1x1: { width: '100%', height: '100%', padding: 20, paddingTop: 170, flexDirection: 'column' },
  brand1x1: { fontSize: 24, fontWeight: 700, backgroundColor: '#000', color: '#FFF', padding: '4 12', alignSelf: 'flex-start', marginBottom: 10, textTransform: 'uppercase' },
  title1x1: { fontSize: 42, fontWeight: 700, lineHeight: 1.1, marginTop: 10 },
  
  priceArea1x1: { backgroundColor: '#F9FAFB', borderRadius: 12, padding: 10, marginLeft: 20 },
  vistaSmall1x1: { fontSize: 24, fontWeight: 700, color: '#4B5563', marginTop: 20, textAlign:'right' },
  parcelaRow1x1: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  parcelaLabel1x1: { fontSize: 40, fontWeight: 700, color: '#111', marginRight: 30, textAlign: 'right', lineHeight: 1 },
  totalPrazo1x1: { fontSize: 18, fontWeight: 700, color: '#666', textAlign:'right', marginTop: 25 },

  // ESTILOS: 2x1 (PAISAGEM - 2 COLUNAS)
  container2x1: { width: '48%', height: '100%', padding: 10, paddingTop: 60, flexDirection: 'column', marginLeft: 10 },
  title2x1: { fontSize: 24, fontWeight: 700, lineHeight: 1.2, maxLines: 2, marginTop: 55 },
  
  priceArea2x1: { backgroundColor: '#F9FAFB', borderRadius: 8, padding: 10, marginVertical: 10 },
  vistaSmall2x1: { fontSize: 14, fontWeight: 700, color: '#4B5563', marginBottom: 8, marginTop: 15, textAlign: 'right' },
  parcelaRow2x1: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  parcelaLabel2x1: { fontSize: 26, fontWeight: 700, color: '#111', marginRight: 8, textAlign: 'right', lineHeight: 1 },
  totalPrazo2x1: { fontSize: 12, fontWeight: 700, color: '#666', marginTop: 20, textAlign: 'right', marginBottom: 8 },

  // ESTILOS 8x1
  container8x1: { 
    width: '25%', 
    height: '50%', // Use 50% exato
    paddingHorizontal: 12,
    paddingVertical: 0,
    marginVertical: 0, 
    paddingTop: 65, // Empurra abaixo da linha azul
    flexDirection: 'column'
  },
  title8x1: { 
    fontSize: 14, // Fonte menor para caber em 2 linhas
    fontWeight: 700, 
    lineHeight: 1.1, 
    maxLines: 2,
    marginBottom: 2 // Respiro para o código do produto
  },
  priceArea8x1: { 
    backgroundColor: '#F9FAFB', 
    padding: 6, 
    marginVertical: 4 // Dá respiro em cima e em baixo para não colar
  },
  vistaSmall8x1: { 
    fontSize: 10, 
    fontWeight: 700, 
    color: '#4B5563', 
    marginBottom: 2, 
    textAlign: 'right' 
  },
  parcelaRow8x1: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  parcelaLabel8x1: { 
    fontSize: 16, 
    fontWeight: 700, 
    color: '#111', 
    marginRight: 4, 
    textAlign: 'right', 
    lineHeight: 1 
  },
  totalPrazo8x1: { 
    fontSize: 8, 
    fontWeight: 700, 
    color: '#666', 
    marginTop: 4, 
    textAlign: 'right',
  },

  // ESTILOS 1x2 (GIGANTE)
  container1x2Top: { flex: 1, width: '100%', padding: 30, paddingTop: 60, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start' },
  container1x2Bottom: { flex: 1, width: '100%', padding: 30, paddingTop: 20, flexDirection: 'column' },
  title1x2V: { fontSize: 60, fontWeight: 700, lineHeight: 1.1, maxLines: 3, textAlign: 'left' },
  
  priceArea1x2: { backgroundColor: '#F9FAFB', borderRadius: 16, padding: 15 },
  vistaSmall1x2: { fontSize: 26, fontWeight: 700, color: '#4B5563', textAlign: 'right' },
  parcelaRow1x2: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingBottom: 50 },
  parcelaLabel1x2: { fontSize: 55, fontWeight: 700, color: '#111', marginRight: 15, textAlign: 'right', lineHeight: 1 },
  totalPrazo1x2: { fontSize: 20, fontWeight: 700, color: '#666', marginTop: 24, marginBottom: 2, textAlign: 'right' },
});

const MODO_CALIBRACAO = false;

// --- FUNÇÃO AUXILIAR DE FORMATAÇÃO ---
const formatarMoeda = (valor: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
};

const filtrarDescricao = ( desc: string ) => {
  const regexCodigos = /\b[A-Za-z]+\d+[A-Za-z0-9]*\b/gi;

  let descFiltrada = desc.replace(regexCodigos, '');

  descFiltrada = descFiltrada.replace(/\s+/g, ' ').trim();

  return descFiltrada;
}

// Componente para renderizar os centavos menores no topo
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

  // Ajuste dinâmico de tamanho baseado na quantidade de dígitos da parte inteira.
  // Os tamanhos passados (tamanhoInteiro, tamanhoCentavos) são considerados como base para 4 dígitos ou mais.
  let fatorEscala = 1;
  const numDigitos = inteiro.length;

  if (numDigitos === 3) {
    fatorEscala = 1.10;
  } else if (numDigitos === 2) {
    fatorEscala = 1.3;
  } else if (numDigitos <= 1) {
    fatorEscala = 1.5;
  }

  const tamanhoInteiroCalculado = tamanhoInteiro * fatorEscala;
  const tamanhoCentavosCalculado = tamanhoCentavos * fatorEscala;

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center', padding: 0, paddingBottom: tamanhoInteiroCalculado * 0.08 }}>
      <Text style={{ fontSize: tamanhoInteiroCalculado, fontWeight: 900, color: cor, lineHeight: 1 }}>
        {inteiroComPonto}
      </Text>
      <Text style={{ fontSize: tamanhoCentavosCalculado, fontWeight: 900, color: cor }}>
        ,{centavos}
      </Text>
    </View>
  );
};

// --- SUBCOMPONENTES DE RENDERIZAÇÃO ---

const Render1x1 = ({ item }: { item: ItemFilaPlaca }) => {
  const isFinanciado = item.numParcelas > 1;
  const textoParcelas = item.comEntrada && isFinanciado
    ? `1+${item.numParcelas - 1}`
    : `${item.numParcelas}`;
  const fonte = (item as any).fonte || 'PlaypenSans';

  return (
    <View style={[styles.container1x1, { fontFamily: fonte }]}>
      <Text style={styles.title1x1}>{filtrarDescricao(item.produto.DESCRICAOPROD)} - {item.produto.FANTASIA}</Text>
      <Text style={{ fontSize: 14, color: '#666', marginTop: 8, fontWeight: 700 }}>
        Cód: {item.produto.CODPROD}
      </Text>
      
      <View style={styles.priceArea1x1}>
        {(item as any).precoDe && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 1, justifyContent: 'flex-end' }}>
            {(item as any).mostrarDesconto && (
              <View style={{ backgroundColor: '#EA580C', padding: 1, borderRadius: 6, marginRight: fonte == 'PlaypenSans' ? 170 : 110 }}>
                <Text style={{ color: '#FFF', fontSize: fonte == 'PlaypenSans' ? 16 : 20, fontWeight: 900 }}>SIPOOFERTA!</Text>
              </View>
            )}
            <Text style={{ fontSize: fonte == 'PlaypenSans' ? 16 : 20, color: '#EA580C', fontWeight: 700, marginRight: 8 }}>
              De:
            </Text>
            <Text style={{ fontSize: fonte == 'PlaypenSans' ? 16 : 20, color: '#EA580C', textDecoration: 'line-through', fontWeight: 700, marginRight: 12 }}>
              {formatarMoeda((item as any).precoDe)}
            </Text>
            {(item as any).mostrarDesconto && (
              <View style={{ backgroundColor: '#EA580C', padding: 1, borderRadius: 6 }}>
                <Text style={{ color: '#FFF', fontSize: fonte == 'PlaypenSans' ? 18 : 28, fontWeight: 900 }}>-{(item as any).percentualDesconto}%</Text>
              </View>
            )}
          </View>
        )}
        {isFinanciado ? (
          <>
            <Text style={styles.vistaSmall1x1}>A vista {formatarMoeda(item.preco.PRECO)}</Text>
            {(item as any).precoDe && (
              <Text style={{ fontSize: fonte == 'PlaypenSans' ? 26 : 36, fontWeight: 900, color: '#EA580C', lineHeight: 1 }}>POR: </Text>
            )}
            <View style={styles.parcelaRow1x1}>
              <Text style={styles.parcelaLabel1x1}>{textoParcelas}x{'\n'}DE</Text>
              <PrecoCentavosPequenos 
                valor={item.valorParcela} 
                tamanhoInteiro={175}   
                tamanhoCentavos={50}  
              />
            </View>
            <Text style={[styles.totalPrazo1x1]}>Total a prazo: {formatarMoeda(item.valorTotal)}</Text>
          </>
        ) : (
          <>
            <Text style={styles.vistaSmall1x1}>A VISTA</Text>
            {(item as any).precoDe && (
              <Text style={{ fontSize: 36, fontWeight: 900, color: '#EA580C', marginRight: 15, lineHeight: 1 }}>POR: </Text>
            )}
            <PrecoCentavosPequenos 
                valor={item.preco.PRECO} 
                tamanhoInteiro={165} 
                tamanhoCentavos={45} 
              />
            <Text style={[styles.totalPrazo1x1]}>Dinheiro ou PIX</Text>
          </>
        )}
      </View>
      
      {item.seguroSelecionado && (
        <View style={{ flex: 1, alignItems: 'flex-end', justifyContent: 'flex-end', paddingBottom: 10, marginTop: -10 }}>
          <Text style={{ fontSize: 16, fontWeight: 700 }}>PROTEJA SUA COMPRA</Text>
          <Text style={{ fontSize: 12, fontWeight: 700, marginTop: 5 }}>{(item.seguroSelecionado.DESCRICAOSEG).substring(0, 20)} POR APENAS</Text>
          
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginVertical:  fonte == 'PlaypenSans' ? 6 : 12 }}>
            {/* NOVO: TEXTO A VISTA */}
            {item.numParcelas <= 1 && (
              <Text style={{ fontSize: 16, fontWeight: 700, marginRight: 10, marginTop:  fonte == 'PlaypenSans' ? 4 : 15}}>
                A vista
              </Text>
            )}
            {item.numParcelas > 1 && (
              <Text style={{ fontSize: 25, fontWeight: 700, marginRight: 8, marginTop:  fonte == 'PlaypenSans' ? 2 : 6 }}>
                {textoParcelas}X DE
              </Text>
            )}
            <PrecoCentavosPequenos 
              valor={item.numParcelas > 1 ? (item.seguroSelecionado.PRECOSEGURO / item.numParcelas) : item.seguroSelecionado.PRECOSEGURO} 
              tamanhoInteiro={25} 
              tamanhoCentavos={12} 
            />
          </View>
          <Text style={{ 
            fontSize: 10, 
            fontWeight: 700, 
            color: '#666', 
            margin: 0, 
            padding: 5, 
            marginBottom: 10,
            opacity: isFinanciado ? 1 : 0 
          }}>Total a prazo: {formatarMoeda(item.seguroSelecionado.PRECOSEGURO)}</Text>
        </View>
      )}

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5, position: 'absolute', bottom: 20, right: 20, left: 20 }}>
        <Text style={{ fontSize: 10, color: '#666', fontWeight: 700 }}>
          {item.tipoPlano === 'COM_JUROS' ? 'CET Mensal: 1,35% | CET Anual: 17,46%' : ''}
        </Text>
        <Text style={{ fontSize: 10, color: '#666', fontWeight: 700 }}>Data: {new Date(item.preco.DATA).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</Text>
      </View>
    </View>
  );
};

const Render2x1 = ({ item }: { item: ItemFilaPlaca }) => {
  const isFinanciado = item.numParcelas > 1;
  const textoParcelas = item.comEntrada && isFinanciado
    ? `1+${item.numParcelas - 1}`
    : `${item.numParcelas}`;
  const fonte = (item as any).fonte || 'PlaypenSans';

  return (
    <View style={[styles.container2x1, { fontFamily: fonte }]}>
      <Text style={[styles.title2x1, { fontSize: fonte == 'PlaypenSans' ? 20 : 24 }]}>{filtrarDescricao(item.produto.DESCRICAOPROD)} - {item.produto.FANTASIA}</Text>
      <Text style={{ fontSize: 14, color: '#666', fontWeight: 700 }}>
        Cód: {item.produto.CODPROD}
      </Text>
      <View style={styles.priceArea2x1}>
        {(item as any).precoDe && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4, justifyContent: 'flex-end' }}>
            {(item as any).mostrarDesconto && (
              <View style={{ backgroundColor: '#EA580C', padding: 1, borderRadius: 4, marginRight: 10 }}>
                <Text style={{ color: '#FFF', fontSize: fonte == 'PlaypenSans' ? 14 : 16, fontWeight: 900 }}>SIPOOFERTA!</Text>
              </View>
            )}
            <Text style={{ fontSize:fonte == 'PlaypenSans' ? 16 : 18, color: '#EA580C', fontWeight: 700, marginRight: 6 }}>
              De:
            </Text>
            <Text style={{ fontSize:fonte == 'PlaypenSans' ? 16 : 18, color: '#EA580C', textDecoration: 'line-through', fontWeight: 700, marginRight: 16 }}>
              {formatarMoeda((item as any).precoDe)}
            </Text>
            {(item as any).mostrarDesconto && (
              <View style={{ backgroundColor: '#EA580C', padding: 1, borderRadius: 4 }}>
                <Text style={{ color: '#FFF', fontSize: fonte == 'PlaypenSans' ? 16 : 20, fontWeight: 900 }}>-{(item as any).percentualDesconto}%</Text>
              </View>
            )}
          </View>
        )}
        {isFinanciado ? (
          <>
            <Text style={styles.vistaSmall2x1}>A vista {formatarMoeda(item.preco.PRECO)}</Text>
            {(item as any).precoDe && (
              <Text style={{ fontSize: 22, fontWeight: 900, color: '#EA580C', lineHeight: 1 }}>POR: </Text>
            )}
            <View style={styles.parcelaRow2x1}>
              <Text style={styles.parcelaLabel2x1}>{textoParcelas}x{'\n'} de</Text>
              <PrecoCentavosPequenos valor={item.valorParcela} 
                tamanhoInteiro={(item as any).precoDe && fonte == 'PlaypenSans' ? 120 : ((item as any).precoDe && fonte == 'Montserrat' ? 115: 130)} 
                tamanhoCentavos={ (item as any).precoDe && fonte == 'PlaypenSans' ? 25 : 30} 
              />
            </View>
            {/* NOVO: TOTAL A PRAZO ADICIONADO AQUI */}
            <Text style={styles.totalPrazo2x1}>Total a prazo: {formatarMoeda(item.valorTotal)}</Text>
          </>
        ) : (
          <>
            <Text style={styles.vistaSmall2x1}>A VISTA</Text>
            {(item as any).precoDe && (
              <Text style={{ fontSize: 22, fontWeight: 900, color: '#EA580C', marginRight: 4, lineHeight: 1,  }}>POR:</Text>
            )}
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-start' }}>
              <PrecoCentavosPequenos valor={item.preco.PRECO} tamanhoInteiro={120} tamanhoCentavos={30} />
            </View>
            <Text style={[styles.totalPrazo2x1]}>Dinheiro ou PIX</Text>
          </>
        )}
      </View>

      {item.seguroSelecionado && (
        <View style={{ position: 'absolute', bottom: 40, marginTop: 10, right: 20, alignItems: 'flex-end', padding: 0 }}>
          <Text style={{ fontSize: 10, fontWeight: 700 }}>PROTEJA SUA COMPRA</Text>
          <Text style={{ fontSize: 8, fontWeight: 700 }}>{(item.seguroSelecionado.DESCRICAOSEG).substring(0, 20)} POR APENAS</Text>
          
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: 2 }}>
            {item.numParcelas > 1 && (
              <Text style={{ fontSize: fonte == 'PlaypenSans' ? 14 : 20, fontWeight: 700, marginRight: 5, marginTop: 6 }}>
                {textoParcelas}x de
              </Text>
            )}
            {item.numParcelas <= 1 && (
              <Text style={{ fontSize: fonte == 'PlaypenSans' ? 14 : 20, fontWeight: 700, marginRight: 4, marginTop: 6 }}>
                {'A vista '}
              </Text>
            )}
            <PrecoCentavosPequenos 
              valor={item.numParcelas > 1 ? (item.seguroSelecionado.PRECOSEGURO / item.numParcelas) : item.seguroSelecionado.PRECOSEGURO} 
              tamanhoInteiro={fonte == 'PlaypenSans' ? 16 : 26} 
              tamanhoCentavos={fonte == 'PlaypenSans' ? 10 : 12} 
            />
          </View>
          <Text style={{ fontSize: 8, fontWeight: 700, color: '#666', margin: 0, padding: 0, opacity: isFinanciado ? 1 : 0 }}>Total a prazo: {formatarMoeda(item.seguroSelecionado.PRECOSEGURO)}</Text>
        </View>
      )}

      {/* RODAPÉ JURÍDICO E DATA */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between',position:'absolute', bottom: 20, left: 24, right: 24 }}>
        <Text style={{ fontSize: 8, color: '#666', fontWeight: 700 }}>
          {item.tipoPlano === 'COM_JUROS' ? 'CET Mensal: 1,35% | CET Anual: 17,46%' : ''}
        </Text>
        <Text style={{ fontSize: 8, color: '#666', fontWeight: 700 }}>Data: {new Date(item.preco.DATA).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</Text>
      </View>
    </View>
  );
};

const Render8x1 = ({ item, index }: { item: ItemFilaPlaca, index?: number }) => {
  const isFinanciado = item.numParcelas > 1;
  const isBottomRow = index !== undefined && index >= 4;
  const textoParcelas = item.comEntrada && isFinanciado
    ? `1+${item.numParcelas - 1}`
    : `${item.numParcelas}`;
  const fonte = (item as any).fonte || 'PlaypenSans';

  return (
    <View style={[styles.container8x1, isBottomRow ? { transform: 'rotate(180deg)' } : {}, { fontFamily: fonte }]} wrap={false}>
      <Text style={styles.title8x1}>{filtrarDescricao(item.produto.DESCRICAOPROD)} - {item.produto.FANTASIA}</Text>
      
      <Text style={{ fontSize: 7, color: '#666', fontWeight: 700 }}>
        Cód: {item.produto.CODPROD}
      </Text>
      
      {/* O preço SEMPRE dentro da caixa cinza */}
      <View style={styles.priceArea8x1}>
        {(item as any).precoDe && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2, justifyContent: 'flex-end' }}>
            {(item as any).mostrarDesconto && (
              <View style={{ backgroundColor: '#EA580C', padding: 1, borderRadius: 2, marginRight: 5 }}>
                <Text style={{ color: '#FFF', fontSize:  fonte == 'PlaypenSans' ? 8 : 9, fontWeight: 900 }}>SIPOOFERTA!</Text>
              </View>
            )}
            <Text style={{ fontSize:  fonte == 'PlaypenSans' ? 7 : 8, color: '#EA580C', fontWeight: 700, marginRight: 3 }}>
              De:
            </Text>
            <Text style={{ fontSize:  fonte == 'PlaypenSans' ? 7 : 8, color: '#EA580C', textDecoration: 'line-through', fontWeight: 700, marginRight: 4 }}>
              {formatarMoeda((item as any).precoDe)}
            </Text>
            {(item as any).mostrarDesconto && (
              <View style={{ backgroundColor: '#EA580C', padding: '1 3', borderRadius: 2 }}>
                <Text style={{ color: '#FFF', fontSize: fonte == 'PlaypenSans' ? 8 : 9, fontWeight: 900 }}>-{(item as any).percentualDesconto}%</Text>
              </View>
            )}
          </View>
        )}
        {isFinanciado ? (
          <>
            <Text style={styles.vistaSmall8x1}>A vista {formatarMoeda(item.preco.PRECO)}</Text>
            {(item as any).precoDe && (
              <Text style={{ fontSize: 12, fontWeight: 900, color: '#EA580C', lineHeight: 1 }}>POR: </Text>
            )}
            <View style={styles.parcelaRow8x1}>
              <Text style={styles.parcelaLabel8x1}>{textoParcelas}x</Text>
              {/* IMPORTANTE: Reduza o tamanhoInteiro para 48, senão não cabe na caixa do 8x1 */}
              <PrecoCentavosPequenos valor={item.valorParcela} tamanhoInteiro={ fonte == 'PlaypenSans' ? 48 : 55} tamanhoCentavos={ fonte == 'PlaypenSans' ? 14 : 14} />
            </View>
            <Text style={styles.totalPrazo8x1}>Total a prazo: {formatarMoeda(item.valorTotal)}</Text>
          </>
        ) : (
          <>
            <Text style={styles.vistaSmall8x1}>A VISTA</Text>
            {/* O tamanho reduzido garante que o A vista não desaparece */}
            {(item as any).precoDe && (
              <Text style={{ fontSize: 12, fontWeight: 900, color: '#EA580C', marginRight: 4, lineHeight: 1 }}>POR: </Text>
            )}
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
              <PrecoCentavosPequenos valor={item.preco.PRECO} tamanhoInteiro={50} tamanhoCentavos={10} />
            </View>
            <Text style={styles.totalPrazo8x1}>Dinheiro ou PIX</Text>
          </>
        )}
      </View>

      {/* BLOCO DO SEGURO CORRIGIDO - Sem marginTops absurdos (30) e com alinhamento A direita */}
      {item.seguroSelecionado && (
        <View style={{ position: 'absolute', bottom: 20, right: 10, alignItems: 'flex-end' }}>
          <Text style={{ fontSize: fonte == 'PlaypenSans' ? 4 : 6, fontWeight: 700 }}>PROTEJA SUA COMPRA</Text>
          <Text style={{ fontSize: fonte == 'PlaypenSans' ? 3 : 5, fontWeight: 700 }}>{(item.seguroSelecionado.DESCRICAOSEG).substring(0, 20)} POR APENAS</Text>
          
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: 2 }}>
            {item.numParcelas > 1 && (
              <Text style={{ fontSize: 9, fontWeight: 700, marginRight: 2, marginTop: 4 }}>
                {textoParcelas}X DE
              </Text>
            )}
            {item.numParcelas <= 1 && (
              <Text style={{ fontSize: 6, fontWeight: 700, marginRight: 2, marginTop: 4 }}>
                A vista
              </Text>
            )}
            <PrecoCentavosPequenos 
              valor={item.numParcelas > 1 ? (item.seguroSelecionado.PRECOSEGURO / item.numParcelas) : item.seguroSelecionado.PRECOSEGURO} 
              tamanhoInteiro={14} 
              tamanhoCentavos={6} 
            />
          </View>
          <Text style={{ fontSize: 4, fontWeight: 700, opacity: isFinanciado ? 1 : 0 }}>Total a prazo: {formatarMoeda(item.seguroSelecionado.PRECOSEGURO)}</Text>
        </View>
      )}

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', position:'absolute', bottom: 8, left: 12, right: 12, marginTop: 5 }}>
        <Text style={{ fontSize: 4, color: '#666', fontWeight: 700 }}>
          {item.tipoPlano === 'COM_JUROS' ? 'CET M: 1,35% | A: 17,46%' : ''}
        </Text>
        <Text style={{ fontSize: 4, color: '#666', fontWeight: 700 }}>Data: {new Date(item.preco.DATA).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</Text>
      </View>
    </View>
  );
};

const Render1x2Top = ({ item }: { item: ItemFilaPlaca }) => {
  const fonte = (item as any).fonte || 'PlaypenSans';
  return (
    // ADICIONADO: wrap={false}
    <View style={[styles.container1x2Top, { fontFamily: fonte }]} wrap={false}>
      <Text style={styles.title1x2V}>{filtrarDescricao(item.produto.DESCRICAOPROD)} - {item.produto.FANTASIA}</Text>
      <Text style={{ fontSize: 24, color: '#666', marginTop: 8, fontWeight: 700 }}>
        Cód: {item.produto.CODPROD}
      </Text>
      {(item as any).precoDe && (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, justifyContent: 'flex-end' }}>
          {(item as any).mostrarDesconto && (
            <View style={{ backgroundColor: '#EA580C', padding: '6 12', borderRadius: 8, marginRight: 15 }}>
              <Text style={{ color: '#FFF', fontSize: 36, fontWeight: 900 }}>SIPOOFERTA!</Text>
            </View>
          )}
          <Text style={{ fontSize: 40, color: '#EA580C', fontWeight: 700, marginRight: 10 }}>
            De:
          </Text>
          <Text style={{ fontSize: 40, color: '#EA580C', textDecoration: 'line-through', fontWeight: 700, marginRight: 15 }}>
            {formatarMoeda((item as any).precoDe)}
          </Text>
          {(item as any).mostrarDesconto && (
            <View style={{ backgroundColor: '#EA580C', padding: '6 12', borderRadius: 8 }}>
              <Text style={{ color: '#FFF', fontSize: 44, fontWeight: 900 }}>-{(item as any).percentualDesconto}%</Text>
            </View>
          )}
        </View>
      )}
      {(item as any).precoDe && (
        <Text style={{ fontSize: 48, fontWeight: 900, color: '#EA580C', lineHeight: 1,  }}>POR: </Text>
      )}
    </View>
  );
};

const Render1x2Bottom = ({ item }: { item: ItemFilaPlaca }) => {
  const isFinanciado = item.numParcelas > 1;
  const textoParcelas = item.comEntrada && isFinanciado
    ? `1+${item.numParcelas - 1}`
    : `${item.numParcelas}`;
  const fonte = (item as any).fonte || 'PlaypenSans';

  return (
    <View style={[styles.container1x2Bottom, { fontFamily: fonte }]} wrap={false}>
      <View style={styles.priceArea1x2}>
        
        {isFinanciado ? (
          <>
            {/* <Text style={styles.vistaSmall1x2}>ou A vista {formatarMoeda(item.preco.PRECO)}</Text> */}
            
            <View style={styles.parcelaRow1x2}>
              <Text style={styles.parcelaLabel1x2}>{textoParcelas}x{'\n'}DE</Text>
              {/* O valor 180 é o limite absoluto para caber numa A4 sem vazar */}
              <PrecoCentavosPequenos valor={item.valorParcela} tamanhoInteiro={235} tamanhoCentavos={60} />
            </View>
            <Text style={styles.totalPrazo1x2}>Total a prazo: {formatarMoeda(item.valorTotal)}</Text>
          </>
        ) : (
          <>
            {/* <Text style={styles.vistaSmall1x2}>A VISTA</Text> */}
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
              <PrecoCentavosPequenos valor={item.preco.PRECO} tamanhoInteiro={235} tamanhoCentavos={60} />
            </View>
            <Text style={styles.totalPrazo1x2}>Dinheiro ou PIX</Text>
          </>
        )}
      </View>

      {item.seguroSelecionado && (
        <View style={{ alignItems: 'flex-end', marginTop: 1, bottom: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: 700 }}>PROTEJA SUA COMPRA</Text>
          <Text style={{ fontSize: 18, fontWeight: 700 }}>{(item.seguroSelecionado.DESCRICAOSEG).substring(0, 20)} POR APENAS</Text>
          
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: 5 }}>
            {item.numParcelas <= 1 && (
              <Text style={{ fontSize: 22, fontWeight: 700, marginRight: 10, marginTop: 10 }}>
                A vista
              </Text>
            )}
            {item.numParcelas > 1 && (
              <Text style={{ fontSize: 18, fontWeight: 700, marginRight: 10, marginTop: 10 }}>
                {textoParcelas}x de
              </Text>
            )}
            <PrecoCentavosPequenos 
              valor={item.numParcelas > 1 ? (item.seguroSelecionado.PRECOSEGURO / item.numParcelas) : item.seguroSelecionado.PRECOSEGURO} 
              tamanhoInteiro={32} 
              tamanhoCentavos={15} 
            />
          </View>
          <Text style={{ fontSize: 14, fontWeight: 700, opacity: isFinanciado ? 1 : 0 }}>Total a prazo: {formatarMoeda(item.seguroSelecionado.PRECOSEGURO)}</Text>
        </View>
      )}

      {/* RODAPÉ */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 'auto', marginBottom: 10 }}>
        <Text style={{ fontSize: 14, color: '#666', fontWeight: 700 }}>
          {item.tipoPlano === 'COM_JUROS' ? 'CET Mensal: 1,35% | CET Anual: 17,46%' : ''}
        </Text>
        <Text style={{ fontSize: 14, color: '#666', fontWeight: 700 }}>Data: {new Date(item.preco.DATA).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</Text>
      </View>
    </View>
  );
};

// --- DOCUMENTO PRINCIPAL ---

export function PlacasDocument({ layoutId, fila }: { layoutId: string; fila: ItemFilaPlaca[] }) {
  const isLandscape = layoutId === '8x1' || layoutId === '2x1';

  // Lógica para o layout GIGANTE (1x2)
  if (layoutId === '1x2') {
    return (
      <Document>
        {fila.flatMap((item) => [
          <Page key={`${item.id}-top`} size="A4" orientation="landscape" style={styles.page}>
            {/* GABARITO PARTE DE CIMA (Se você tiver a imagem) */}
            
            <Render1x2Top item={item} />
          </Page>,
          <Page key={`${item.id}-bottom`} size="A4" orientation="landscape" style={styles.page}>
            {/* GABARITO PARTE DE BAIXO */}
            
            <Render1x2Bottom item={item} />
          </Page>
        ])}
      </Document>
    );
  }

  // Lógica para os outros layouts (1x1, 2x1, 8x1)
  let itensPorPagina = 1;
  if (layoutId === '8x1') itensPorPagina = 8;
  if (layoutId === '2x1') itensPorPagina = 2;

  const chunkArray = (array: ItemFilaPlaca[], size: number) => {
    const chunked = [];
    for (let i = 0; i < array.length; i += size) {
      chunked.push(array.slice(i, i + size));
    }
    return chunked;
  };

  const paginas = chunkArray(fila, itensPorPagina);

  return (
    <Document style={{ margin: 0, padding: 0, border: 0 }}>
      {paginas.map((itensDaPagina, paginaIndex) => (
        <Page key={`page-${paginaIndex}`} size="A4" orientation={isLandscape ? "landscape" : "portrait"} style={styles.page}>
          
          {/* CAMADA 1: O GRID DE PLACAS */}
          {/* Envolvemos o map nesta View para isolar o layout Flexbox */}
          <View style={styles.gridContainer}>
            {itensDaPagina.map((item, index) => {
              if (layoutId === '8x1') return <Render8x1 key={item.id} item={item} index={index} />;
              if (layoutId === '2x1') return <Render2x1 key={item.id} item={item} />;
              return <Render1x1 key={item.id} item={item} />;
            })}
          </View>

          {/* CAMADA 2: O GABARITO ABSOLUTO POR CIMA DE TUDO */}
          {/* Como ele está fora do gridContainer, o top: 0 vai cravar no topo da folha A4 perfeita! */}
          {MODO_CALIBRACAO && (
            <Image 
              src={`/templates/cartaz-${layoutId}.png`} 
              style={styles.backgroundImage} 
            />
          )}

        </Page>
      ))}
    </Document>
  );
}