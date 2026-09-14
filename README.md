<h1 align="center">🏷️ Gerador de Placas & Etiquetas de Preço</h1>

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Zustand-443E38?style=for-the-badge&logo=react&logoColor=white" alt="Zustand" />
</p>

<p align="center">
  Um sistema corporativo robusto para automatizar, padronizar e otimizar a criação e impressão de placas de precificação de produtos para o varejo.
</p>

---

## 🎯 Sobre o Projeto

No ambiente dinâmico do varejo, a precificação correta e rápida nas gôndolas é essencial. O **Gerador de Placas** foi idealizado para substituir processos manuais e repetitivos de diagramação de ofertas, garantindo total conformidade com a identidade visual da empresa. 

A aplicação conecta-se à base de dados para recuperar informações em tempo real sobre produtos, estoques, regras de parcelamento financeiro e seguros estendidos (garantia), permitindo a diagramação instantânea e envio direto para impressão em formato PDF de alta qualidade.

> **Nota de Demonstração:** Esta versão do portfólio inclui um sistema de *fallback* offline (Mock Database) que permite aos visitantes testar o funcionamento da plataforma e a geração de PDF em tempo real, sem a necessidade de conexão com o banco de dados interno ou API da empresa (testes disponíveis com os IDs `1010` e `2020`).

---

## ✨ Funcionalidades Principais

- **🔎 Motor de Busca Integrado:** Localização instantânea de produtos através de código e filial.
- **💰 Cálculo Inteligente de Parcelamentos:**
  - Suporte automático a planos *Com Juros* e *Sem Juros*.
  - Configuração de entradas e recálculo dinâmico.
- **🔥 Modo Promoção (De / Por):** 
  - Cálculo automático de percentual de desconto.
  - Tag de destaque para super ofertas acionável com um clique.
- **🛡️ Cross-selling de Serviços:** Adição intuitiva de seguros e garantias estendidas, com recálculo automático da parcela que engloba o serviço.
- **📄 Fila de Impressão e PDF Engine:**
  - Geração nativa de documentos PDF direto no navegador.
  - Otimização de folhas (Batch Print), reduzindo desperdício de papel nas lojas.
- **📏 Layouts Responsivos para Gôndola:**
  - Formato `8x1` (Oito placas pequenas por folha - Padrão).
  - Formato `2x1` (Eletroportáteis).
  - Formato `1x1` (Linha Branca / Grande).
  - Formato `1x2` (Placa Gigante em 2 folhas A4 interligadas).

---

## 🚀 Arquitetura e Decisões Técnicas

- **Frontend SPA de Alta Performance:** Desenvolvido em **React** (versão 19) minimizando re-renders e garantindo extrema fluidez mesmo com grandes listas de produtos no DOM.
- **Estado Global:** Utilização do **Zustand** para o gerenciamento descomplicado e direto da "Fila de Impressão" (carrinho de placas), permitindo navegação entre telas sem perda de progresso.
- **Geração Client-Side de PDF:** Integração nativa com `@react-pdf/renderer` desenhando e formatando o layout via *flexbox* puramente no client. Isso retira o processamento de imagem do servidor e garante alta resolução na impressão física (vetor/texto).
- **Tipagem Estrita:** Uso de **TypeScript** end-to-end nas interfaces para mitigar possíveis quebras na manipulação de dados sensíveis de preços, descontos e taxas financeiras.
- **Styling Moderno:** Componentização visual fluida adotando **Tailwind CSS**, permitindo que atualizações na paleta de cores corporativa sejam feitas rapidamente.

---

## ⚙️ Como Executar Localmente

Siga o passo a passo para rodar o sistema no seu ambiente:

### Pré-requisitos
- [Node.js](https://nodejs.org/) (versão 18+)
- [npm](https://www.npmjs.com/) ou yarn

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/daviteclas/gerador-placas.git
cd gerador-placas
```

2. Instale as dependências da aplicação:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

4. Acesse em seu navegador através do endereço exibido no terminal (normalmente `http://localhost:5173`).

---

<p align="center">
  <i>Desenvolvido e documentado por Davi Andrade de Souza.</i>
</p>
