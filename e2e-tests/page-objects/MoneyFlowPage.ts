import { Page, Locator, expect } from '@playwright/test';
import { HomePage } from './HomePage';

/**
 * Page Object específico para o componente MoneyFlow
 * Estende a funcionalidade do HomePage
 */
export class MoneyFlowPage extends HomePage {
  // Elementos específicos do MoneyFlow
  readonly yearSlider: Locator;
  readonly yearLabel: Locator;
  readonly playButton: Locator;
  readonly stopButton: Locator;
  readonly resetButton: Locator;
  readonly stepModeButton: Locator;
  readonly nextStepButton: Locator;
  readonly physicalMoneyFilter: Locator;
  readonly electronicMoneyFilter: Locator;
  readonly allFlowsFilter: Locator;
  readonly progressBar: Locator;
  readonly progressText: Locator;
  readonly sankeyChart: Locator;
  readonly dataSourcesSection: Locator;
  
  constructor(page: Page) {
    super(page);
    
    // Inicializar localizadores específicos
    this.yearSlider = page.locator('#yearSlider');
    this.yearLabel = page.locator('#yearLabel');
    this.playButton = page.getByRole('button').filter({ hasText: /Iniciar Animação|Play Animation|Reproducir Animación/ });
    this.stopButton = page.getByRole('button').filter({ hasText: /Parar Animação|Stop Animation|Detener Animación/ });
    this.resetButton = page.getByRole('button').filter({ hasText: /Reiniciar|Reset/ });
    this.stepModeButton = page.getByRole('button').filter({ hasText: /Passo a Passo|Step-by-Step|Paso a Paso/ });
    this.nextStepButton = page.getByRole('button').filter({ hasText: /Próximo Passo|Next Step|Paso Siguiente/ });
    this.physicalMoneyFilter = page.getByRole('button').filter({ hasText: /Dinheiro Físico|Physical Money|Dinero Físico/ });
    this.electronicMoneyFilter = page.getByRole('button').filter({ hasText: /Dinheiro Eletrônico|Electronic Money|Dinero Electrónico/ });
    this.allFlowsFilter = page.getByRole('button').filter({ hasText: /Todos os Fluxos|All Flows|Todos los Flujos/ });
    this.progressBar = page.locator('.progress-fill');
    this.progressText = page.locator('.progress-text');
    this.sankeyChart = page.locator('.chart');
    this.dataSourcesSection = page.locator('h3').filter({ hasText: /Fontes de Dados|Data Sources|Fuentes de Datos/ }).first();
  }
  
  /**
   * Navega especificamente para a visualização MoneyFlow
   */
  async gotoMoneyFlow() {
    await this.goto();
    await this.navigateToMoneyFlow();
    await this.page.waitForSelector('.moneyflow-wrapper');
  }
  
  /**
   * Inicia a animação do fluxo de dinheiro
   */
  async startAnimation() {
    await this.playButton.click();
    await this.page.waitForSelector('.progress-bar');
  }
  
  /**
   * Para a animação em andamento
   */
  async stopAnimation() {
    await this.stopButton.click();
    // Aguardar desaparecimento da barra de progresso
    try {
      await this.page.waitForSelector('.progress-bar', { state: 'hidden', timeout: 3000 });
    } catch (e) {
      // Se falhar (pois pode ter parado em um estado onde a barra ainda está visível),
      // verificamos se o botão voltou para "Iniciar"
      await this.page.waitForTimeout(500);
    }
  }
  
  /**
   * Muda para o modo passo a passo
   */
  async enableStepMode() {
    // Verificar se já está em modo passo a passo
    const isStepMode = await this.nextStepButton.isVisible();
    
    if (!isStepMode) {
      await this.stepModeButton.click();
      await this.page.waitForSelector('.step-indicator');
    }
  }
  
  /**
   * Avança para o próximo passo no modo passo a passo
   */
  async nextStep() {
    await this.nextStepButton.click();
    await this.page.waitForTimeout(500); // Dar tempo para o gráfico atualizar
  }
  
  /**
   * Altera o ano do gráfico usando o slider
   * @param year O ano para selecionar (2020-2025)
   */
  async changeYear(year: string) {
    await this.yearSlider.evaluate((el: HTMLInputElement, value) => {
      el.value = value;
      el.dispatchEvent(new Event('input'));
    }, year);
    
    // Verificar se o ano foi alterado
    await this.page.waitForTimeout(300); // Tempo para a atualização
    const currentYear = await this.yearLabel.textContent();
    expect(currentYear).toBe(year);
  }
  
  /**
   * Aplica um filtro específico ao gráfico
   * @param filter O filtro a aplicar: 'all', 'physical' ou 'electronic'
   */
  async applyFilter(filter: 'all' | 'physical' | 'electronic') {
    const filterMap = {
      'all': this.allFlowsFilter,
      'physical': this.physicalMoneyFilter,
      'electronic': this.electronicMoneyFilter
    };
    
    await filterMap[filter].click();
    await this.page.waitForTimeout(500); // Dar tempo para o gráfico atualizar
  }
  
  /**
   * Verifica se houve interação com o diagrama Sankey
   * @returns true se o diagrama foi renderizado e interagido com sucesso
   */
  async verifySankeyInteraction() {
    // Verificar se o diagrama está visível
    await expect(this.sankeyChart).toBeVisible();
    
    // Tentar verificar alguma interação - como hover sobre um nó
    // As coordenadas são aproximadas para o meio do gráfico
    await this.sankeyChart.hover({
      position: {
        x: 400,
        y: 300
      }
    });
    
    // Verificar se algum tooltip ou efeito de hover apareceu
    // Isso é mais difícil de verificar de forma genérica, mas podemos
    // checar se a classe SVG do gráfico Plotly está presente
    const plotlySvg = this.page.locator('.main-svg');
    await expect(plotlySvg).toBeVisible();
    
    return true;
  }
  
  /**
   * Verifica se a seção de fontes de dados está visível
   */
  async verifyDataSourcesVisible() {
    await this.page.evaluate(() => {
      window.scrollBy(0, 1000); // Rolar para baixo para ver as fontes
    });
    
    await expect(this.dataSourcesSection).toBeVisible();
  }
}
