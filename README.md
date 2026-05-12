# Sipo Placas - Gerador de Placas de Preço

## 🎯 Objetivo do Projeto

O **Sipo Placas** é um sistema interno desenvolvido para otimizar e padronizar a criação de placas de preço para produtos da Sipo. O projeto soluciona a necessidade de gerar placas de forma ágil e consistente, eliminando processos manuais e garantindo a conformidade com a identidade visual da empresa, especialmente em cenários de promoção (De/Por).

## ✨ Funcionalidades Principais

-   **Busca de Produtos**: Localize produtos rapidamente por código e filial.
-   **Modo De/Por (Promoção)**: Crie placas com preço original (riscado) e preço promocional em destaque.
    -   Cálculo automático do percentual de desconto.
    -   Opção para exibir ou ocultar a tag de desconto.
-   **Cálculo de Parcelamento**:
    -   Suporte para planos com e sem juros.
    -   Opção de incluir entrada no cálculo.
    -   O parcelamento é sempre calculado com base no preço promocional ("Por").
-   **Garantia Estendida**: Adicione facilmente opções de seguro e garantia estendida à placa.
-   **Layouts Flexíveis**: Suporte para múltiplos formatos de impressão para diferentes necessidades de gôndola e vitrine (1x1, 2x1, 8x1, 1x2 - gigante).
-   **Fila de Impressão**: Adicione múltiplas placas a uma fila para gerar um único documento PDF, otimizando o uso de papel.
-   **Pré-visualização em PDF**: Visualize o resultado final antes de gerar o documento para impressão.

## 🚀 Stack de Tecnologias

O projeto foi construído utilizando tecnologias modernas para garantir uma experiência de desenvolvimento e de usuário rápidas e eficientes.

-   **Frontend**: [React](https://react.dev/) com [TypeScript](https://www.typescriptlang.org/)
-   **Build Tool**: [Vite](https://vitejs.dev/)
-   **Estilização**: [Tailwind CSS](https://tailwindcss.com/)
-   **Geração de PDF**: [@react-pdf/renderer](https://react-pdf.org/)
-   **Gerenciamento de Estado**: [Zustand](https://zustand-demo.pmnd.rs/)
-   **Ícones**: [Lucide React](https://lucide.dev/)

## ⚙️ Como Rodar o Projeto Localmente

Para executar o projeto em seu ambiente de desenvolvimento, siga os passos abaixo.

### Pré-requisitos

-   [Node.js](https://nodejs.org/) (versão 18 ou superior)
-   [npm](https://www.npmjs.com/) (geralmente instalado com o Node.js)
-   O **backend** do projeto deve estar em execução para que as consultas à API funcionem.

### Passos para Instalação

1.  **Clone o repositório:**
    ```bash
    git clone https://sipolatti-dev@dev.azure.com/sipolatti-dev/APPs/_git/Sipo.Board.Generator
    cd Sipo.Board.Generator
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Execute o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```

Após executar o comando, o Vite iniciará o servidor de desenvolvimento e você poderá acessar o projeto em seu navegador, geralmente no endereço `http://localhost:5173`.
