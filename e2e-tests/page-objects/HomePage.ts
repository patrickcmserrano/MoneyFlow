import { Page, Locator, expect } from '@playwright/test';

type Language = 'en' | 'pt' | 'es';

export class HomePage {
  readonly page: Page;
  
  // Seletores de elementos
  readonly languageSelector: {
    english: Locator;
    portuguese: Locator;
    spanish: Locator;
  };
  
  readonly subtitle: Locator;
  readonly moneyFlowTitle: Locator;
  readonly moneyFlowWrapper: Locator;
  readonly moneyMindWrapper: Locator;
  readonly switchToMoneyMindButton: Locator;
  readonly switchToMoneyFlowButton: Locator;
  readonly themeToggle: Locator;
  readonly yearSlider: Locator;
  readonly yearLabel: Locator;
  readonly chartContainer: Locator;
  readonly playButton: Locator;
  readonly stopButton: Locator;
  readonly roadmapNav: Locator;
  
  // Textos esperados em cada idioma
  readonly expectedTexts = {
    en: {
      title: 'MoneyMind',
      subtitle: 'Explore the meaning of money',
      'moneyflow.title': 'Money Flow in Brazil',
      'moneyflow.year': 'Year',
      'moneyflow.filter.all': 'All Flows',
      'moneyflow.filter.physical': 'Physical Money',
      'moneyflow.filter.electronic': 'Electronic Money',
      'moneyflow.animation.play': 'Play Animation',
      'moneyflow.animation.stop': 'Stop Animation',
      'moneymind.switch_to': 'Switch to MoneyMind Oasis',
      'moneymind.switch_back': 'Back to Money Flow'
    },
    pt: {
      title: 'MoneyMind',
      subtitle: 'Explore o significado do dinheiro',
      'moneyflow.title': 'Fluxo do Dinheiro no Brasil',
      'moneyflow.year': 'Ano',
      'moneyflow.filter.all': 'Todos os Fluxos',
      'moneyflow.filter.physical': 'Dinheiro Físico',
      'moneyflow.filter.electronic': 'Dinheiro Eletrônico',
      'moneyflow.animation.play': 'Iniciar Animação',
      'moneyflow.animation.stop': 'Parar Animação',
      'moneymind.switch_to': 'Alternar para MoneyMind Oasis',
      'moneymind.switch_back': 'Voltar para Fluxo do Dinheiro'
    },
    es: {
      title: 'MoneyMind',
      subtitle: 'Explora el significado del dinero',
      'moneyflow.title': 'Flujo de Dinero en Brasil',
      'moneyflow.year': 'Año',
      'moneyflow.filter.all': 'Todos los Flujos',
      'moneyflow.filter.physical': 'Dinero Físico',
      'moneyflow.filter.electronic': 'Dinero Electrónico',
      'moneyflow.animation.play': 'Reproducir Animación',
      'moneyflow.animation.stop': 'Detener Animación',
      'moneymind.switch_to': 'Alternar para MoneyMind Oasis', 
      'moneymind.switch_back': 'Volver para Flujo del Dinero'
    }
  };

  constructor(page: Page) {
    this.page = page;
    
    this.languageSelector = {
      english: page.getByRole('button', { name: 'English' }),
      portuguese: page.getByRole('button', { name: 'Português' }),
      spanish: page.getByRole('button', { name: 'Español' })
    };
    
    this.subtitle = page.locator('[data-testid="subtitle"]');
    this.moneyFlowTitle = page.locator('h1').filter({ hasText: /Fluxo do Dinheiro|Money Flow|Flujo de Dinero/ });
    this.moneyFlowWrapper = page.locator('.moneyflow-wrapper');
    this.moneyMindWrapper = page.locator('.moneymind-wrapper');
    this.switchToMoneyMindButton = page.getByRole('button').filter({ hasText: /MoneyMind Oasis/ });
    this.switchToMoneyFlowButton = page.getByRole('button').filter({ hasText: /Fluxo do Dinheiro|Money Flow|Flujo del Dinero/ });
    this.themeToggle = page.getByLabel(/alternar tema|toggle theme/i);
    this.yearSlider = page.locator('#yearSlider');
    this.yearLabel = page.locator('#yearLabel');
    this.chartContainer = page.locator('.chart');
    this.playButton = page.getByRole('button').filter({ hasText: /Iniciar Animação|Play Animation|Reproducir Animación/ });
    this.stopButton = page.getByRole('button').filter({ hasText: /Parar Animação|Stop Animation|Detener Animación/ });
    this.roadmapNav = page.locator('.roadmap-nav');
  }

  async goto() {
    // Tentativas múltiplas para lidar com possíveis falhas intermitentes
    const maxRetries = 3;
    let lastError = null;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // Use navegação com espera de rede
        await this.page.goto('/', { waitUntil: 'networkidle', timeout: 30000 });
        
        // Verificação adicional para garantir que a página está carregada
        await this.page.waitForSelector('body', { state: 'visible', timeout: 10000 });
        
        // Se chegou aqui, a navegação foi bem-sucedida
        return;
      } catch (error) {
        console.log(`Tentativa ${attempt + 1} falhou: ${error.message}`);
        lastError = error;
        
        // Espera antes de tentar novamente
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }
    
    // Se chegou aqui, todas as tentativas falharam
    console.error('Falha após múltiplas tentativas de navegação');
    throw lastError;
  }

  async changeLanguage(language: Language) {
    const langButtonMap = {
      en: this.languageSelector.english,
      pt: this.languageSelector.portuguese,
      es: this.languageSelector.spanish
    };
    
    // Verificar se o botão está visível
    await expect(langButtonMap[language]).toBeVisible({ timeout: 5000 });
    
    // Clicar e verificar que o clique foi processado
    await langButtonMap[language].click();
    
    // Aguardar para garantir que o idioma foi alterado
    // Using setTimeout instead of page.waitForTimeout
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Verificação adicional para garantir que a mudança de idioma foi aplicada
    const currentLang = await this.getCurrentLanguage();
    if (currentLang !== language) {
      console.log(`Aviso: Idioma esperado era ${language}, mas ainda está ${currentLang}. Tentando novamente...`);
      await langButtonMap[language].click();
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  async getCurrentLanguage(): Promise<Language> {
    // Tentar identificar o idioma atual baseado em algum texto visível
    const pageContent = await this.page.content();
    
    if (pageContent.includes('Fluxo do Dinheiro no Brasil')) {
      return 'pt';
    } else if (pageContent.includes('Money Flow in Brazil')) {
      return 'en';
    } else if (pageContent.includes('Flujo de Dinero en Brasil')) {
      return 'es';
    }
    
    // Se não conseguir identificar, assume inglês como padrão
    return 'en';
  }

  async expectTextsInLanguage(language: Language) {
    const expectedTexts = this.expectedTexts[language];
    
    // Verificar o título da página
    const pageTitle = await this.page.title();
    expect(pageTitle).toContain(expectedTexts.title);
    
    // Verificar o subtítulo se estiver em MoneyMind
    if (await this.moneyMindWrapper.isVisible()) {
      await this.verifyText(this.subtitle, expectedTexts.subtitle);
    }
    
    // Verificar o título do MoneyFlow se estiver em MoneyFlow
    if (await this.moneyFlowWrapper.isVisible()) {
      await this.verifyText(
        this.moneyFlowTitle, 
        expectedTexts['moneyflow.title']
      );
    }
  }

  async navigateToMoneyFlow() {
    // Se já estiver no MoneyFlow, não faz nada
    if (await this.moneyFlowWrapper.isVisible()) {
      return;
    }
    
    // Se estiver no MoneyMind, alterna para MoneyFlow
    if (await this.moneyMindWrapper.isVisible()) {
      await this.switchToMoneyFlowButton.click();
      await this.page.waitForSelector('.moneyflow-wrapper');
    }
  }

  async navigateToMoneyMind() {
    // Se já estiver no MoneyMind, não faz nada
    if (await this.moneyMindWrapper.isVisible()) {
      return;
    }
    
    // Se estiver no MoneyFlow, alterna para MoneyMind
    if (await this.moneyFlowWrapper.isVisible()) {
      await this.switchToMoneyMindButton.click();
      await this.page.waitForSelector('.moneymind-wrapper');
    }
  }

  async expectKeyboardNavigableRoadmap() {
    // Verificar se o roadmap está visível
    await expect(this.roadmapNav).toBeVisible();
    
    // Navegar por todos os links usando o teclado
    await this.page.keyboard.press('Tab');
    
    // Pressionar Tab várias vezes e verificar se conseguimos navegar através do roadmap
    let roadmapItemFocused = false;
    
    for (let i = 0; i < 10; i++) {
      await this.page.keyboard.press('Tab');
      
      const focusedElement = await this.page.evaluate(() => {
        const active = document.activeElement;
        return active?.closest('.roadmap-nav') != null;
      });
      
      if (focusedElement) {
        roadmapItemFocused = true;
        break;
      }
    }
    
    expect(roadmapItemFocused).toBeTruthy();
  }

  async verifyText(locator: Locator, expectedText: string, retries = 3) {
    // Função resiliente para verificar texto com retentativas
    let attempt = 0;
    let lastError = null;
    
    while (attempt < retries) {
      try {
        // Verificar se o elemento está visível primeiro
        await expect(locator).toBeVisible({ timeout: 5000 });
        
        const text = await locator.textContent();
        expect(text).toContain(expectedText);
        return; // Se não lançar erro, sai do loop
      } catch (error) {
        lastError = error;
        attempt++;
        
        if (attempt < retries) {
          // Espera um pouco antes de tentar novamente, mas usa setTimeout
          // em vez do page.waitForTimeout para evitar erros se a página fechar
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    // Se chegou aqui, falhou em todas as tentativas
    throw lastError;
  }

  async verifyWithRetry(
    assertion: () => Promise<void>,
    retries = 3,
    delay = 1000
  ) {
    for (let i = 0; i < retries; i++) {
      try {
        await assertion();
        return;
      } catch (e) {
        if (i === retries - 1) throw e;
        await new Promise(res => setTimeout(res, delay));
      }
    }
  }
}
