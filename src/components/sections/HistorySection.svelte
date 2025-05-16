<script lang="ts">
  import { _ } from '../../lib/i18n';
  import { fade, fly } from 'svelte/transition';

  export let scrollToSection: (sectionId: string) => void;
  export let id: string = 'history'; // Adicionando propriedade id com valor padrão
</script>

<div {id} class="section min-h-screen pt-16 pb-16 bg-transparent relative section-transition">
  <div class="container mx-auto px-4" in:fly={{ y: 50, duration: 800, delay: 200 }} out:fade={{ duration: 200 }}>
    <h2 class="text-4xl font-bold text-center mb-10 text-white">{$_('moneymind.history.title')}</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div class="backdrop-blur-sm bg-transparent bg-opacity-20 border border-white/10 p-6 rounded-lg shadow-lg text-white transform transition-all duration-500 hover:scale-105">
        <h3 class="text-2xl font-bold mb-4">{$_('moneymind.history.origins')}</h3>
        <p class="mb-4">{$_('moneymind.history.origins_desc', { default: 'Há aproximadamente 10.000 anos, com o surgimento da agricultura, o sistema de trocas diretas (escambo) tornou-se a base da economia primitiva. Estas trocas de bens estabeleceram as fundações para todos os sistemas econômicos futuros.' })}</p>
        <p class="mb-3">{$_('moneymind.history.origins_challenges', { default: 'As economias baseadas em escambo enfrentavam problemas críticos: como garantir valor equivalente entre bens diferentes? Como transportar mercadorias volumosas para longas distâncias?' })}</p>
      </div>
      <div class="backdrop-blur-sm bg-transparent bg-opacity-20 border border-white/10 p-6 rounded-lg shadow-lg text-white transform transition-all duration-500 hover:scale-105">
        <h3 class="text-2xl font-bold mb-4">{$_('moneymind.history.coins')}</h3>
        <p class="mb-4">{$_('moneymind.history.coins_desc', { default: 'As primeiras moedas oficiais surgiram no reino da Lídia (atual oeste da Turquia) por volta de 600 a.C., cunhadas em electrum, uma liga natural de ouro e prata. Esta inovação representou um marco na história da civilização.' })}</p>
        <p class="mb-3">{$_('moneymind.history.coins_expansion', { default: 'A ideia de moeda cunhada espalhou-se rapidamente. Na Grécia Antiga, as dracmas de prata de Atenas tornaram-se uma das primeiras moedas "internacionais".' })}</p>
      </div>
      <div class="backdrop-blur-sm bg-transparent bg-opacity-20 border border-white/10 p-6 rounded-lg shadow-lg text-white transform transition-all duration-500 hover:scale-105">
        <h3 class="text-2xl font-bold mb-4">{$_('moneymind.history.paper')}</h3>
        <p class="mb-4">{$_('moneymind.history.paper_desc', { default: 'A China da dinastia Tang (618-907 d.C.) introduziu o primeiro papel-moeda genuíno, conhecido como "dinheiro voador" devido à sua leveza. Este sistema revolucionário permitiu ao império chinês expandir o comércio sem depender de metais pesados.' })}</p>
        <p class="mb-3">{$_('moneymind.history.paper_digital', { default: 'Hoje, aproximadamente 92% do dinheiro mundial existe apenas como registros digitais. O primeiro dinheiro verdadeiramente digital surgiu em 1971, quando o sistema bancário dos EUA começou a utilizar o sistema ACH.' })}</p>
      </div>
      <div class="backdrop-blur-sm bg-transparent bg-opacity-20 border border-white/10 p-6 rounded-lg shadow-lg text-white transform transition-all duration-500 hover:scale-105">
        <h3 class="text-2xl font-bold mb-4">{$_('moneymind.history.philosophy')}</h3>
        <p class="mb-4">{$_('moneymind.history.philosophy_desc', { default: 'O dinheiro representa uma das construções sociais mais poderosas já criadas pela humanidade. Diferente de necessidades básicas como comida ou abrigo, o dinheiro não tem valor intrínseco além daquele que coletivamente concordamos em atribuir a ele.' })}</p>
        <p class="mb-3">{$_('moneymind.history.philosophy_aristotle', { default: 'Aristóteles distinguia entre o uso natural do dinheiro (como meio de troca) e seu uso não-natural (acumulação pela acumulação). O dinheiro aliena as pessoas ou as empodera?' })}</p>
      </div>
    </div>
    
    <div class="backdrop-blur-sm bg-transparent border border-purple-800/30 p-4 rounded-lg mt-8">
      <h5 class="font-bold mb-2">{$_('moneymind.history.milestones', { default: 'Marcos históricos importantes:' })}</h5>
      <ul class="list-disc pl-5 space-y-1">
        <li><strong>600 a.C.</strong> - {$_('moneymind.history.milestone_1', { default: 'Primeiras moedas oficiais da Lídia' })}</li>
        <li><strong>{$_('moneymind.history.century_5', { default: 'Século V a.C.' })}</strong> - {$_('moneymind.history.milestone_2', { default: 'Dracmas atenienses tornam-se padrão no comércio mediterrâneo' })}</li>
        <li><strong>618 d.C.</strong> - {$_('moneymind.history.milestone_3', { default: 'China introduz o primeiro papel-moeda genuíno' })}</li>
        <li><strong>1971</strong> - {$_('moneymind.history.milestone_4', { default: 'Primeiro sistema de transferência eletrônica de fundos (ACH) nos EUA' })}</li>
        <li><strong>2009</strong> - {$_('moneymind.history.milestone_5', { default: 'Satoshi Nakamoto cria o Bitcoin, primeira criptomoeda descentralizada' })}</li>
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
      aria-label={$_('navigation.aria.scroll_to_concepts', { default: 'Scroll to concepts section' })}
    ></div>
  </div>
</div>
