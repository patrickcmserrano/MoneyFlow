<script lang="ts">
  import MoneyMindOasis from './MoneyMindOasis.svelte';
  import { onMount } from 'svelte';
  import { _ } from '../lib/i18n';
    // Verificar se é crepúsculo (16:39 -03, 16 de maio)
  let isTwilight = false;
  let showTwilightMessage = false;
  let currentDate = '';
  
  onMount(() => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    
    // Formatar a data atual de acordo com o idioma
    // O idioma será obtido automaticamente via navegador
    const dateOptions: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    // A data será formatada de acordo com o idioma atual do navegador
    currentDate = now.toLocaleDateString(undefined, dateOptions);
    
    // Verifica se o horário está próximo de 16:39 (crepúsculo mencionado)
    // ou se está entre 16:30 e 18:30 (considerando horário crepuscular)
    if ((hours === 16 && minutes >= 30) || (hours === 17) || (hours === 18 && minutes <= 30)) {
      isTwilight = true;
      
      // Mostrar a mensagem após um breve delay
      setTimeout(() => {
        showTwilightMessage = true;
      }, 3000);
    }
  });
  
  function closeTwilightMessage() {
    showTwilightMessage = false;
  }
</script>

<div class="app-container {isTwilight ? 'twilight-mode' : ''}">
  <!-- Página Inicial Imersiva -->
  <MoneyMindOasis />
  
  <!-- Conteúdo principal começa aqui, abaixo da tela de apresentação -->
  <div class="content pt-screen">
    <!-- Rodapé -->
    <footer class="py-8 text-center">
      <p class="text-sm text-white">{$_('footer.copyright')}</p>
      <p class="text-xs mt-2 text-gray-400">{$_('moneymind.footer.description')}</p>
      {#if currentDate}
        <p class="text-xs mt-2 text-purple-400">{$_('moneymind.footer.current_date')}: {currentDate}</p>
      {/if}
    </footer>
  </div>
  
  <!-- Mensagem de crepúsculo -->
  {#if showTwilightMessage}
    <div class="fixed inset-0 flex items-center justify-center z-50" role="dialog" aria-modal="true">
      <button 
        class="absolute inset-0 bg-black bg-opacity-50" 
        on:click={closeTwilightMessage}
        on:keydown={(e) => e.key === 'Escape' && closeTwilightMessage()}
        aria-label={$_('moneymind.twilight.close')}></button>
      <div 
        class="bg-gradient-to-br from-purple-900 to-indigo-900 p-6 rounded-lg max-w-md text-white shadow-lg relative z-10">
        <h3 class="text-xl font-bold mb-2">{$_('moneymind.twilight.title')}</h3>
        <p class="mb-4">{$_('moneymind.twilight.message')}</p>
        <button 
          class="bg-purple-700 hover:bg-purple-600 text-white px-4 py-2 rounded-full text-sm transition-colors"
          on:click={closeTwilightMessage}>
          {$_('moneymind.twilight.close')}
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  :global(html, body) {
    height: 100%;
    margin: 0;
    padding: 0;
    background-color: #121212; /* Fundo escuro em vez de transparente */
    color: white;
    overflow-x: hidden;
    scroll-behavior: smooth;
  }
  
  .app-container {
    min-height: 100vh;
    background: linear-gradient(to bottom, #090418, #1a0a2e, #2c0a2e); /* Gradiente escuro */
  }
  
  .twilight-mode {
    --twilight-accent: rgb(153, 102, 204);
  }
  
  .content {
    position: relative;
    z-index: 1000;
  }
  
  .pt-screen {
    padding-top: 100vh;
  }
</style>
