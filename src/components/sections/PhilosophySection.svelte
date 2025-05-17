<script lang="ts">
  import { _ } from '../../lib/i18n';
  import { fade, fly } from 'svelte/transition';

  // svelte-ignore export_let_unused
  export let scrollToSection: (sectionId: string) => void;
  export let id: string = 'philosophy';
</script>

<div {id} class="section min-h-screen pt-16 pb-16 bg-transparent relative section-transition">
  <div class="container mx-auto px-4" in:fly={{ y: 50, duration: 800, delay: 200 }} out:fade={{ duration: 200 }}>
    <h2 class="text-4xl font-bold text-center mb-10 text-white">{$_('moneymind.philosophy.title')}</h2>    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
      <div class="backdrop-blur-sm bg-transparent bg-opacity-20 border border-white/10 p-6 rounded-lg shadow-lg text-white transform transition-all duration-500 hover:scale-105">
        <h3 class="text-2xl font-bold mb-4">{$_('moneymind.philosophy.bitcoin.title')}</h3>
        <p class="mb-4">{$_('moneymind.philosophy.bitcoin.text')}</p>
      </div>
      <div class="backdrop-blur-sm bg-transparent bg-opacity-20 border border-white/10 p-6 rounded-lg shadow-lg text-white transform transition-all duration-500 hover:scale-105">
        <h3 class="text-2xl font-bold mb-4">{$_('moneymind.philosophy.debate.title')}</h3>
        <p class="mb-4">{$_('moneymind.philosophy.debate.text')}</p>
      </div>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div class="backdrop-blur-sm bg-transparent bg-opacity-20 border border-white/10 p-6 rounded-lg shadow-lg text-white transform transition-all duration-500 hover:scale-105">
        <h3 class="text-2xl font-bold mb-4">{$_('moneymind.philosophy.ethics.title')}</h3>
        <p class="mb-4">{$_('moneymind.philosophy.ethics.text')}</p>
      </div>
      <div class="backdrop-blur-sm bg-transparent bg-opacity-20 border border-white/10 p-6 rounded-lg shadow-lg text-white transform transition-all duration-500 hover:scale-105">
        <h3 class="text-2xl font-bold mb-4">{$_('moneymind.philosophy.future.title')}</h3>
        <p class="mb-4">{$_('moneymind.philosophy.future.text')}</p>
      </div>
    </div>
    

  </div>
</div>

<style>
  .section-transition {
    transition: all 0.5s ease-in-out;
  }
</style>
