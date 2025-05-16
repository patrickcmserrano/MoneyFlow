<script lang="ts">
  import './styles/global.css';
  import ThemeToggle from './components/ThemeToggle.svelte';
  import LanguageSelector from './components/LanguageSelector.svelte';
  import MoneyFlow from './components/MoneyFlow.svelte';
  import MoneyMindOasisMain from './components/MoneyMindOasisMain.svelte';
  import { _ } from './lib/i18n';
  import { writable } from 'svelte/store';
  import { onMount } from 'svelte';

  // Inicializa o suporte a idiomas
  import { i18n } from './lib/i18n';
  
  // Estado para controle da inicialização da aplicação
  let appReady = false;
  
  // Estado para rastrear qual visualização mostrar - agora inicializa com 'moneymind'
  const viewMode = writable('moneymind'); // 'moneyflow' ou 'moneymind'
  
  // Função para alternar entre visões
  function toggleView() {
    viewMode.update(current => current === 'moneyflow' ? 'moneymind' : 'moneyflow');
  }
  
  onMount(() => {
    // Inicializar o suporte a idiomas após a montagem do componente
    i18n.initialize();
    
    // Marcar aplicação como pronta
    setTimeout(() => {
      appReady = true;
    }, 100);
  });
</script>

{#if appReady}
  {#if $viewMode === 'moneyflow'}
    <main class="p-10 space-y-8">
      <div class="flex justify-between items-center">
        <div class="language-selector">
          <LanguageSelector />
        </div>
        <div class="theme-toggle flex items-center space-x-4">
          <button 
            on:click={toggleView} 
            class="px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white rounded-full text-sm transition-colors">
            {$_('moneymind.switch_to')}
          </button>
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
    </main>  {:else}
    <div class="moneymind-wrapper">
      <div class="fixed top-4 right-4 z-50 flex space-x-4">
        <button 
          on:click={toggleView} 
          class="px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white rounded-full text-sm transition-colors shadow-lg">
          {$_('moneymind.switch_back')}
        </button>
        <div class="language-selector">
          <LanguageSelector />
        </div>
      </div>
      <MoneyMindOasisMain />
    </div>
  {/if}
{:else}
  <div class="loading-screen flex items-center justify-center h-screen">
    <div class="text-center">
      <div class="spinner inline-block w-8 h-8 border-4 border-t-purple-600 border-r-transparent border-b-purple-600 border-l-transparent rounded-full animate-spin mb-4"></div>
      <p>Carregando aplicação...</p>
    </div>
  </div>
{/if}

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    min-height: 100vh;
  }
  
  :global(body.dark) {
    background-color: #111827;
    color: #f9fafb;
  }
  
  :global(.dark) {
    color-scheme: dark;
  }
  
  .moneymind-wrapper {
    min-height: 100vh;
    background: linear-gradient(to bottom, #090418, #1a0a2e, #2c0a2e);
    position: relative;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .animate-spin {
    animation: spin 1s linear infinite;
  }
  
  .loading-screen {
    background: linear-gradient(to bottom, #090418, #1a0a2e, #2c0a2e);
    color: white;
  }
</style>
