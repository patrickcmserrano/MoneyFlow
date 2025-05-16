# MoneyFlow

Uma aplicação Svelte que visualiza o fluxo de dinheiro no Brasil através de diagramas Sankey.

## Funcionalidades

- **Visualização Interativa**: Diagramas Sankey para visualizar o fluxo de dinheiro entre diferentes setores da economia
- **Filtros Dinâmicos**: Visualize apenas dinheiro físico, eletrônico ou todo o fluxo
- **Linha do Tempo**: Explore os dados históricos e projeções de 2020 a 2025
- **Tema Escuro/Claro**: Interface adaptável ao tema do sistema
- **Internacionalização**: Suporte a múltiplos idiomas (Português, Inglês e Espanhol)

## Creating Projects from this Template

1. **Using GitHub**
   ```bash
   # Clone this template
   gh repo create my-project --template MoneyFlow
   # or use GitHub's interface to create a new repository from this template
   ```

2. **Manually**
   ```bash
   # Clone the repository
   git clone https://github.com/patrickcmserrano/MoneyFlow.git my-project
   
   # Remove Git history
   cd my-project
   rm -rf .git
   
   # Initialize a new Git repository
   git init
   ```

## Project Creation

1. **Project Initialization**
   ```bash
   npm create vite@latest svelte-ts-skeleton-starter -- --template svelte-ts
   cd svelte-ts-skeleton-starter
   npm install
   ```

2. **Project Structure**
   ```
   📦 MoneyFlow
   ├── 📂 public/
   │   └── vite.svg
   ├── 📂 src/
   │   ├── 📂 assets/
   │   │   └── svelte.svg
   │   ├── 📂 components/
   │   │   ├── LanguageSelector.svelte
   │   │   ├── MoneyFlow.svelte
   │   │   └── ThemeToggle.svelte
   │   ├── 📂 lib/
   │   │   ├── 📂 locales/
   │   │   │   ├── en.ts
   │   │   │   ├── es.ts
   │   │   │   └── pt.ts
   │   │   └── i18n.ts
   │   ├── 📂 styles/
   │   │   └── global.css
   │   ├── app.css
   │   ├── App.svelte
   │   ├── main.ts
   │   └── vite-env.d.ts
   ├── index.html
   ├── package.json
   ├── svelte.config.js
   ├── tsconfig.json
   ├── tsconfig.node.json
   └── vite.config.ts
   ```

## Project Dependencies

### Main Dependencies
- `svelte`: ^5.23.1
- `@skeletonlabs/skeleton`: ^3.1.3
- `svelte-i18n`: ^4.0.0 # Internationalization library

### Development Dependencies
- `@sveltejs/vite-plugin-svelte`: ^5.0.3
- `@tsconfig/svelte`: ^5.0.4
- `svelte-check`: ^4.1.5
- `typescript`: ~5.7.2
- `vite`: ^6.3.1

## Available Scripts

```json
{
  "dev": "vite",          // Starts the development server
  "build": "vite build",  // Generates production build
  "preview": "vite preview", // Preview production version
  "check": "svelte-check" // Runs TypeScript type checking
}
```

## Development Environment Setup

### Recommended IDE
- Visual Studio Code with Svelte for VS Code extension
- [VS Code](https://code.visualstudio.com/)
- [Svelte Extension](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode)

### TypeScript Configuration

The project uses TypeScript with the following main configurations:
- Full TypeScript support in Svelte components
- Optimized configuration for Svelte development
- Integrated type checking

## How to Start Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/patrickcmserrano/MoneyFlow.git
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Access the project**
   The project will be available at `http://localhost:5173`

## File Structure Explained

- `/public`: Static files that will be served directly
- `/src`: Application source code
  - `/assets`: Resources such as images and icons
  - `/components`: User interface components
    - `LanguageSelector.svelte`: Component for language switching
    - `ThemeToggle.svelte`: Component for toggling between light/dark themes
  - `/lib`: Reusable components and shared functionalities
    - `i18n.ts`: Internationalization system
    - `/locales`: Translation files for different languages
      - `en.ts`: English translations
      - `pt.ts`: Portuguese translations
      - `es.ts`: Spanish translations
  - `/styles`: Global style files
  - `App.svelte`: Root application component
  - `main.ts`: Application entry point

## Technical Considerations

### Why Vite?
- Extremely fast Hot Module Replacement (HMR)
- Zero configuration to start
- Native TypeScript support
- Optimized production build

### TypeScript
The project uses TypeScript for:
- Better development experience
- Real-time type checking
- Better IDE support
- More secure and maintainable code

## Tests

This project includes a complete setup for unit and end-to-end (E2E) tests.

### Unit Tests

We use [Vitest](https://vitest.dev/) for unit tests with the following features:

- Integration with the Svelte ecosystem
- Support for Svelte components
- Code coverage report generation
- JSDOM-based test environment
- Mock tests for external modules

Available commands:

```bash
# Run tests in watch mode (development)
npm test

# Run tests once
npm run test:run

# Run tests with coverage report
npm run test:coverage
npm run coverage
```

#### Internationalization (i18n) Tests

The internationalization system has comprehensive unit tests that verify:

- Correct initialization of the i18n system
- Browser language detection
- User preferences persistence
- Loading and access to translations
- Consistency of translation keys across different languages
- Appropriate behavior when translation keys don't exist

### End-to-End (E2E) Tests

We use [Playwright](https://playwright.dev/) for E2E tests with the following features:

- Support for multiple browsers (Chrome, Firefox, Safari)
- Accessibility tests
- Detailed execution reports
- Specific tests for internationalization functionalities

Available commands:

```bash
# Run all E2E tests
npm run e2e

# Run E2E tests with visual interface
npm run e2e:ui

# View E2E test report
npm run e2e:report
```

#### E2E Internationalization Tests

The E2E tests for internationalization ensure that:

- Language selectors are present and functional in the interface
- Language changes correctly update the page content
- Language preferences are persisted between reloads
- Text elements appear correctly in the selected language
- Accessibility is maintained when switching between languages

These tests use an approach based on the role and name of elements (`getByRole`, `getByText`), which makes the tests more robust and less susceptible to breaking due to changes in HTML or CSS structure.

### Accessibility Tests

The project includes specific accessibility tests for:

- Appropriate header structure
- Keyboard navigation
- Appropriate ARIA attributes
- Color contrast
- Language selector accessibility

### Run All Tests

To run all tests (unit and E2E) at once:

```bash
npm run test:all
```

## Build and Deploy

### Local Build

To create a production build:
```bash
npm run build
```

This will generate an optimized version of the project in the `dist/` folder.

### Automated Deployment with GitHub Pages

This project is configured for deployment to GitHub Pages using GitHub Actions with a modern CI/CD approach.

#### GitHub Pages Configuration

To configure GitHub Pages in your repository:

1. In GitHub, go to your repository and click on **Settings**
2. In the sidebar menu, click on **Pages**
3. Under **Source**, select **Deploy from a branch**
4. Under **Branch**, select **gh-pages** and **/ (root)**
5. Click on **Save**

#### CI/CD Workflows

The project uses two separate workflows:

1. **Build and Test (CI)** `.github/workflows/test-coverage.yml`
   - Triggered automatically on pushes to the `main` branch
   - Triggered on pull requests to the `main` branch
   - Compiles the application and runs tests
   - Generates code coverage reports
   - Stores build artifacts for later use
   
2. **Deploy to GitHub Pages (CD)** `.github/workflows/deploy.yml`
   - Triggered **only manually** via Actions in GitHub
   - Provides complete control over when to deploy
   - Option to also publish the coverage report
   - Publishes everything to the `gh-pages` branch

#### How to Start a Manual Deployment

1. In GitHub, go to your repository and click on the **Actions** tab
2. In the sidebar menu, select the **Deploy to GitHub Pages (CD)** workflow
3. Click on the **Run workflow** button
4. Check or uncheck the "Publish coverage report" option as needed
5. Click on **Run workflow** to start the deployment process

#### Structure in the gh-pages Branch

After deployment, the `gh-pages` branch will have the following structure:
- `/` - Root with the main application
- `/coverage/` - Test coverage reports (when published)

### Branch Scheme

The project uses the following branch scheme:
- `main`: Main development branch
- `gh-pages`: Branch where the compiled site is published (do not edit manually)

#### Prevention of CI/CD Loops

Deploy commits include `[skip ci]` in the message to prevent the deployment from triggering new workflows, preventing infinite loops.

## Contributing

1. Fork the project
2. Create a branch for your feature (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Support

For questions and support, please open an issue in the project repository.

# MoneyFlow

Uma aplicação Svelte que visualiza o fluxo de dinheiro no Brasil através de diagramas Sankey.

## Funcionalidades

- **Visualização Interativa**: Diagramas Sankey para visualizar o fluxo de dinheiro entre diferentes setores da economia
- **Filtros Dinâmicos**: Visualize apenas dinheiro físico, eletrônico ou todo o fluxo
- **Linha do Tempo**: Explore os dados históricos e projeções de 2020 a 2025
- **Tema Escuro/Claro**: Interface adaptável ao tema do sistema
- **Internacionalização**: Suporte a múltiplos idiomas (Português, Inglês e Espanhol)

## Tecnologias Utilizadas

- Svelte 5 com TypeScript
- Plotly.js para visualizações de dados
- Skeleton UI para componentes de interface
- i18n para internacionalização

## Como Iniciar

1. **Instalar Dependências**
   ```bash
   npm install
   ```

2. **Executar em Desenvolvimento**
   ```bash
   npm run dev
   ```

3. **Construir para Produção**
   ```bash
   npm run build
   ```

## Estrutura do Projeto

O componente principal de visualização está em `src/components/MoneyFlow.svelte`, que contém toda a lógica para renderizar os diagramas Sankey usando Plotly.js.

---
