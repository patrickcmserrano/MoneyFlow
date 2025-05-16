<script lang="ts">
  import { _ } from '../../lib/i18n';
  import { fade, fly } from 'svelte/transition';

  export let scrollToSection: (sectionId: string) => void;
  export let id: string = 'tools'; // Adicionando propriedade id com valor padrão
</script>

<div {id} class="section min-h-screen pt-16 pb-16 bg-transparent relative section-transition">
  <div class="container mx-auto px-4" in:fly={{ y: 50, duration: 800, delay: 200 }} out:fade={{ duration: 200 }}>
    <h2 class="text-4xl font-bold text-center mb-10 text-white">{$_('navigation.tools', { default: 'Ferramentas' })}</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="backdrop-blur-sm bg-transparent bg-opacity-20 border border-white/10 p-6 rounded-lg shadow-lg text-white transform transition-all duration-500 hover:scale-105">
        <h3 class="text-xl font-bold mb-3">{$_('moneymind.tools.exchange', { default: 'Mercados de Câmbio' })}</h3>
        <p>{$_('moneymind.tools.exchange_desc', { default: 'Plataformas onde moedas são trocadas, determinando seu valor relativo e facilitando o comércio internacional.' })}</p>
      </div>
      <div class="backdrop-blur-sm bg-transparent bg-opacity-20 border border-white/10 p-6 rounded-lg shadow-lg text-white transform transition-all duration-500 hover:scale-105">
        <h3 class="text-xl font-bold mb-3">{$_('moneymind.tools.fintech', { default: 'Tecnologias Financeiras' })}</h3>
        <p class="mb-4">{$_('moneymind.tools.fintech_desc', { default: 'Inovações como blockchain, aplicativos de pagamento e bancos digitais que estão redefinindo como interagimos com o dinheiro. A era digital trouxe consigo mudanças fundamentais na economia.' })}</p>
        <p class="mb-3">{$_('moneymind.tools.fintech_bitcoin', { default: 'Em 2009, com o surgimento do Bitcoin criado por Satoshi Nakamoto, nasceu o conceito de moeda puramente digital sem nenhuma autoridade central, baseada em um livro-razão descentralizado.' })}</p>
        <p>{$_('moneymind.tools.fintech_digital', { default: 'Hoje, aproximadamente 92% do dinheiro mundial existe apenas como registros digitais.' })}</p>
      </div>
      <div class="backdrop-blur-sm bg-transparent bg-opacity-20 border border-white/10 p-6 rounded-lg shadow-lg text-white transform transition-all duration-500 hover:scale-105">
        <h3 class="text-xl font-bold mb-3">{$_('moneymind.tools.payment', { default: 'Sistemas de Pagamento' })}</h3>
        <p>{$_('moneymind.tools.payment_desc', { default: 'Infraestruturas que permitem a transferência de valores entre indivíduos e instituições, desde cartões de crédito até sistemas de pagamento instantâneo.' })}</p>
      </div>
    </div>
    
    <div class="backdrop-blur-sm bg-transparent bg-opacity-20 border border-white/10 p-6 rounded-lg shadow-lg text-white mt-8 transform transition-all duration-500 hover:scale-105">
      <h4 class="text-xl font-semibold mb-4">{$_('moneymind.tools.digital_era', { default: 'A Era Digital do Dinheiro' })}</h4>
      <p class="mb-4">{$_('moneymind.tools.digital_era_desc', { default: 'A jornada do dinheiro de papel ao digital representa uma das maiores abstrações na história econômica humana. Seria ainda real o que não podemos tocar?' })}</p>
      <p class="mb-4">{$_('moneymind.tools.digital_era_first', { default: 'O primeiro dinheiro verdadeiramente digital surgiu em 1971, quando o sistema bancário dos EUA começou a utilizar o sistema ACH (Automated Clearing House) para transferências eletrônicas.' })}</p>
      <div class="backdrop-blur-sm bg-transparent border border-purple-900/30 p-4 rounded-lg mt-6">
        <p class="italic">{$_('moneymind.tools.quote_harari_2', { default: '"O dinheiro moderno é um sistema de anotações contábeis. Quando você faz uma compra online, nenhuma moeda física se move - apenas permissões em bancos de dados são alteradas. Hoje, o dinheiro é essencialmente informação." — Yuval Noah Harari' })}</p>
      </div>
    </div>
  </div>
  <!-- Indicadores de transição para próxima/anterior seção -->
  <div class="section-transition-indicator">
    <div 
      class="scroll-indicator up" 
      on:click={() => scrollToSection('concepts')}
      on:keydown={(e) => e.key === 'Enter' && scrollToSection('concepts')}
      role="button"
      tabindex="0"
      aria-label={$_('navigation.aria.scroll_to_concepts', { default: 'Scroll to concepts section' })}
    ></div>
    <div 
      class="scroll-indicator down" 
      on:click={() => scrollToSection('practice')}
      on:keydown={(e) => e.key === 'Enter' && scrollToSection('practice')}
      role="button"
      tabindex="0"
      aria-label={$_('navigation.aria.scroll_to_practice', { default: 'Scroll to practice section' })}
    ></div>
  </div>
</div>
