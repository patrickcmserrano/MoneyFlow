<script lang="ts">
  import { _ } from '../../lib/i18n';
  import { fade, fly } from 'svelte/transition';

  export let scrollToSection: (sectionId: string) => void;
  export let id: string = 'history';
  
  // Estrutura para marcos históricos
  const milestones = [
    { date: "600 a.C.", key: "moneymind.history.milestone_1" },
    { date: $_('moneymind.history.century_5'), key: "moneymind.history.milestone_2" },
    { date: "618 d.C.", key: "moneymind.history.milestone_3" },
    { date: "1971", key: "moneymind.history.milestone_4" },
    { date: "2009", key: "moneymind.history.milestone_5" }
  ];
</script>

<div {id} class="section min-h-screen pt-16 pb-16 bg-transparent relative section-transition">
  <div class="container mx-auto px-4" in:fly={{ y: 50, duration: 800, delay: 200 }} out:fade={{ duration: 200 }}>
    <h2 class="text-4xl font-bold text-center mb-10 text-white">{$_('moneymind.history.title')}</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div class="backdrop-blur-sm bg-transparent bg-opacity-20 border border-white/10 p-6 rounded-lg shadow-lg text-white transform transition-all duration-500 hover:scale-105">
        <h3 class="text-2xl font-bold mb-4">{$_('moneymind.history.origins')}</h3>
        <p class="mb-4">{$_('moneymind.history.origins_desc')}</p>
        <p class="mb-3">{$_('moneymind.history.origins_challenges')}</p>
      </div>
      <div class="backdrop-blur-sm bg-transparent bg-opacity-20 border border-white/10 p-6 rounded-lg shadow-lg text-white transform transition-all duration-500 hover:scale-105">
        <h3 class="text-2xl font-bold mb-4">{$_('moneymind.history.coins')}</h3>
        <p class="mb-4">{$_('moneymind.history.coins_desc')}</p>
        <p class="mb-3">{$_('moneymind.history.coins_expansion')}</p>
      </div>
      <div class="backdrop-blur-sm bg-transparent bg-opacity-20 border border-white/10 p-6 rounded-lg shadow-lg text-white transform transition-all duration-500 hover:scale-105">
        <h3 class="text-2xl font-bold mb-4">{$_('moneymind.history.paper')}</h3>
        <p class="mb-4">{$_('moneymind.history.paper_desc')}</p>
        <p class="mb-3">{$_('moneymind.history.paper_digital')}</p>
      </div>
      <div class="backdrop-blur-sm bg-transparent bg-opacity-20 border border-white/10 p-6 rounded-lg shadow-lg text-white transform transition-all duration-500 hover:scale-105">
        <h3 class="text-2xl font-bold mb-4">{$_('moneymind.history.philosophy')}</h3>
        <p class="mb-4">{$_('moneymind.history.philosophy_desc')}</p>
        <p class="mb-3">{$_('moneymind.history.philosophy_aristotle')}</p>
      </div>
    </div>
    
    <div class="backdrop-blur-sm bg-transparent border border-purple-800/30 p-4 rounded-lg mt-8">
      <h5 class="font-bold mb-2">{$_('moneymind.history.milestones')}</h5>
      <ul class="list-disc pl-5 space-y-1">
        {#each milestones as milestone}
          <li>
            <strong>{milestone.date}</strong> - {$_(milestone.key)}
          </li>
        {/each}
      </ul>
    </div>
  </div>
  <!-- Indicador de transição para a próxima seção -->
  <div class="section-transition-indicator">
    <div 
      class="scroll-indicator down" 
      on:click={() => scrollToSection('concepts')}
      on:keydown={(e) => e.key === 'Enter' && scrollToSection('concepts')}
      role="button"
      tabindex="0"
      aria-label={$_('navigation.aria.scroll_to_concepts')}
    ></div>
  </div>
</div>
