# Guia de Testes E2E do MoneyFlow

Este guia descreve a arquitetura e a execução dos testes end-to-end (E2E) implementados para o projeto MoneyFlow.

## Visão Geral

Os testes E2E utilizam o framework **Playwright** para validar o funcionamento de toda a aplicação em diferentes navegadores. A estrutura dos testes foi inspirada no projeto LinkFlowLotus e adaptada para as necessidades específicas do MoneyFlow.

## Estrutura dos Testes

### Page Objects

A arquitetura utiliza o padrão Page Object para encapsular a interação com as páginas:

- **HomePage**: Representação básica da página inicial
- **MoneyFlowPage**: Especialização para interações com o componente MoneyFlow
- **MoneyMindPage**: Especialização para interações com o componente MoneyMind

### Helpers

Classes auxiliares que fornecem funcionalidades específicas:

- **AccessibilityHelper**: Funções para testar acessibilidade
- **AccessibilityTester**: Funções avançadas para testes de acessibilidade
- **custom-matchers**: Extensões para as asserções do Playwright

### Arquivos de Teste

Os testes estão organizados em arquivos específicos:

- **basic.spec.ts**: Funcionalidades básicas da aplicação
- **accessibility.spec.ts**: Verificações básicas de acessibilidade
- **advanced-a11y.spec.ts**: Testes avançados de acessibilidade
- **axe-a11y.spec.ts**: Testes com a biblioteca axe-core
- **i18n.spec.ts**: Testes de internacionalização
- **moneyflow.spec.ts**: Testes básicos do componente MoneyFlow
- **enhanced-moneyflow.spec.ts**: Testes avançados do MoneyFlow
- **navigation.spec.ts**: Testes de navegação entre componentes
- **enhanced-moneymind.spec.ts**: Testes avançados do MoneyMind

## Categorias de Testes

### Funcionalidades Básicas
- Carregamento inicial da aplicação
- Navegação entre MoneyFlow e MoneyMind
- Alteração de tema (claro/escuro)

### Funcionalidades do MoneyFlow
- Renderização e interação com o diagrama Sankey
- Filtros de tipo de dinheiro (físico, eletrônico, todos)
- Seleção de ano via slider
- Animações (automática e passo a passo)

### Funcionalidades do MoneyMind
- Carregamento da cena 3D
- Navegação entre seções
- Interação com o roadmap de navegação

### Internacionalização (i18n)
- Verificação de textos nos três idiomas (PT, EN, ES)
- Persistência de preferências de idioma
- Comportamento ao alternar de componente

### Acessibilidade
- Estrutura de cabeçalhos adequada
- Navegação por teclado
- Contraste de cores
- Verificações com axe-core

### Responsividade
- Comportamento em diferentes tamanhos de tela
- Adaptação para dispositivos móveis

## Como Executar os Testes

### Pré-requisitos
- Node.js instalado
- Dependências do projeto instaladas:
  ```bash
  npm install
  npm install --save-dev @axe-core/playwright
  ```
- Navegadores do Playwright instalados:
  ```bash
  npx playwright install
  ```

### Comandos

Execute todos os testes:
```bash
npm test
```

Execute apenas testes básicos:
```bash
npm run test:basic
```

Execute testes de acessibilidade:
```bash
npm run test:a11y
```

Execute testes de internacionalização:
```bash
npm run test:i18n
```

Execute testes do MoneyFlow:
```bash
npm run test:moneyflow
```

Execute testes do MoneyMind:
```bash
npm run test:moneymind
```

Veja o relatório HTML dos testes:
```bash
npm run test:report
```

Mode de depuração:
```bash
npm run test:debug
```

## Estratégias de Robustez

Os testes implementam várias técnicas para garantir estabilidade:

1. **Retentativas**: Funções específicas para repetir verificações com delays
2. **Esperas inteligentes**: Uso de waitForSelector e waitForTimeout estrategicamente
3. **Verificações resilientes**: Para lidar com partes assíncronas da aplicação
4. **Exceções para navegadores específicos**: Skipping de testes em navegadores problemáticos

## Integração com CI/CD

Os testes estão configurados para rodar em ambientes de CI com adaptações:
- Screenshots em caso de falha
- Video em primeira falha
- Retentativas para reduzir falsos negativos
- Timeouts aumentados para ambientes mais lentos

## Próximos Passos

1. Adicionar testes visuais com comparação de screenshots
2. Implementar testes de performance
3. Melhorar a cobertura de testes de acessibilidade

## Solução de Problemas Comuns

### Configurando o Ambiente de Testes

Para facilitar a configuração do ambiente de testes, use o script de preparação:

```bash
npm run prepare-tests
```

Este script:
1. Instalará o Playwright e o navegador Chromium
2. Tentará instalar as dependências do sistema necessárias
3. Iniciará o servidor de desenvolvimento
4. Executará os testes usando apenas o Chromium

### Erros comuns:

1. **Problemas com conexão ao servidor**: 
   Se os testes falham com erros como "page.goto: Target page, context or browser has been closed", verifique:
   - Se o servidor de desenvolvimento está em execução (npm run dev)
   - Se a URL base está correta no arquivo playwright.config.ts

2. **Erros de dependências no WebKit ou outros navegadores**:
   Execute o comando para instalar as dependências:
   ```bash
   sudo npx playwright install-deps
   ```

3. **Erros de timeout**:
   - Aumente os valores de timeout no arquivo playwright.config.ts
   - Verifique se o servidor está respondendo corretamente

### Executando Apenas com Chromium

Para maior compatibilidade, você pode executar os testes apenas com o navegador Chromium:

```bash
npm run e2e:chromium
```
