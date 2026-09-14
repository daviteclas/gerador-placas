import { test, expect } from '@playwright/test';

const layouts = ['1x1', '2x1', '8x1', '1x2'];
const fontes = ['Montserrat', 'PlaypenSans'];
const pagamentos = ['À VISTA', 'PARCELADO'];
const promocoes = [false, true];
const produtos = ['505048', '448185', '456593'];

test.describe('Gerador de Placas - Todos os Layouts', () => {

  for (const layout of layouts) {
    
    test(`Simula o operador gerando o layout ${layout} com todas as combinações`, async ({ page }) => {
      // Aumenta o timeout do teste pois faremos 36 buscas na API por layout (3 fontes * 2 pagamentos * 3 produtos * 2 promocoes)
      test.setTimeout(240000); 

      // 1. Abre o nosso sistema na rota específica do layout
      await page.goto(`http://localhost:5173/generator/${layout}`);

      // 2. Preenche o número da filial
      await page.fill('input[placeholder="Ex: 1"]', '1');

      // 3. Percorre todas as possibilidades (3 fontes × 2 pagamentos × 3 produtos × 2 promoções = 36 placas)
      for (const produto of produtos) {
        for (const dePorAtivo of promocoes) {
          for (const fonte of fontes) {
            for (const pagamento of pagamentos) {
              
              // Busca o produto
              await page.fill('input[placeholder="Ex: 505048"]', produto);
              await page.click('button:has-text("Localizar")');
              
              // Aguarda a interface de edição da placa aparecer
              await page.waitForSelector('button:has-text("Adicionar Placa à Fila")');

              // Configura a Fonte
              await page.locator('label:has-text("Fonte da Placa") + select').selectOption(fonte);

              // Configura a Promoção (De/Por)
              if (dePorAtivo) {
                await page.locator('label').filter({ hasText: 'Ativar Modo De/Por (Promoção)' }).locator('input[type="checkbox"]').check();
                await page.fill('input[placeholder="Ex: 2599.90"]', '10000');
              }

              // Configura o Pagamento
              await page.click(`button:has-text("${pagamento}")`);
              if (pagamento === 'PARCELADO') {
                // Opcional: já está selecionado por padrão, mas garante que "Com Juros" será testado
                await page.click('button:has-text("Com Juros")');
              }

              await page.locator('label:has-text("Adicionar Garantia Estendida?") + select').selectOption('12');

              // Adiciona a placa configurada à fila
              await page.click('button:has-text("Adicionar Placa à Fila")');
              
              // Evita race condition aguardando o card fechar (pois onAddSuccess zera o produto)
              await page.waitForSelector('button:has-text("Adicionar Placa à Fila")', { state: 'hidden' });

              await page.evaluate(() => window.scrollTo(0,0));
            }
          }
        }
      }

      // 4. Confirma visualmente pela tag que os itens foram gerados e estão na fila
      // await expect(page.locator('.bg-blue-100.text-blue-800')).toHaveText('itens');

      // 6. Clica para gerar o PDF e captura a nova aba
      const [novaAba] = await Promise.all([
        page.waitForEvent('popup'),
        page.click('button:has-text("Gerar Placas")') 
      ]);

      // ========================================================
      // A MÁGICA: Congela o tempo para você ver o PDF na tela!
      // ========================================================
      await novaAba.pause();
    });
    
  }
});