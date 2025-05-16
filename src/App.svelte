<script lang="ts">
  import './styles/global.css';
  import ThemeToggle from './components/ThemeToggle.svelte';
  import LanguageSelector from './components/LanguageSelector.svelte';
  import MoneyFlow from './components/MoneyFlow.svelte';
  import { _ } from './lib/i18n';

  // Inicializa o suporte a idiomas
  import { i18n } from './lib/i18n';
  i18n.initialize();
</script>

<main class="p-10 space-y-8">
  <div class="flex justify-between items-center">
    <div class="language-selector">
      <LanguageSelector />
    </div>
    <div class="theme-toggle">
      <svelte:component this={ThemeToggle} />
    </div>
  </div>
    <div class="text-center">
    <h1 class="h1 text-3xl font-bold mb-4">{$_('moneyflow.title')}</h1>
  </div>
  
  <div class="content-container">
    <MoneyFlow />
  </div>
  
  <footer class="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
    <p class="text-sm text-gray-600 dark:text-gray-400">{$_('footer.copyright')}</p>
  </footer>
</main>
