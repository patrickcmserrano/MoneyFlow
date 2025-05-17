<script lang="ts">
  import { _ } from '../../lib/i18n';
  import { onMount } from 'svelte';

  export let container;
  export let id: string = 'intro'; // Adicionando propriedade id com valor padrão
  
  // Função para rolar até a próxima seção
  function scrollToNextSection() {
    document.getElementById('primitiveorigins')?.scrollIntoView({ behavior: 'smooth' });
  }

  onMount(() => {
    // Garantir que o container seja renderizado corretamente
    if (container) {
      // Removendo o background para permitir que a cena 3D seja visível
      container.style.background = 'transparent';
    }
  });
</script>

<div {id} class="section h-screen relative">
  <!-- Removendo o fundo fixo para permitir que a cena 3D seja visível -->
  <div class="absolute inset-0 flex flex-col items-center justify-center text-white text-center z-10 p-4">    <h1 class="text-5xl md:text-7xl font-bold animate-fade-in">{$_('moneymind.title')}</h1>
    <p class="mt-4 text-xl md:text-2xl animate-slide-up">{$_('moneymind.subtitle')}</p>
    <button class="mt-8 px-6 py-2 bg-purple-700 hover:bg-purple-600 rounded-full text-white animate-pulse" 
            on:click={scrollToNextSection}>
      {$_('moneymind.start_journey')}
    </button>
    
    <!-- Seta animada indicando para baixo -->
    <div class="absolute bottom-12 left-0 right-0 flex justify-center animate-bounce">
      <svg class="w-10 h-10 text-white" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor">
        <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
      </svg>
    </div>
  </div>
</div>

<style>
  /* Adicionando um filtro gradiente sutil para melhorar a legibilidade do texto sobre a cena 3D */
  .section {
    background: linear-gradient(to bottom, rgba(9, 4, 24, 0.3), rgba(26, 10, 46, 0.3));
  }
</style>
