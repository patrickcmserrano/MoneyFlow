<script lang="ts">
  import { locale, _ } from '../../lib/i18n';
  import { i18n } from '../../lib/i18n';
  
  export let showDetails = false;
  
  function toggleLanguage() {
    const currentLang = $locale;
    const nextLang = currentLang === 'en' ? 'es' : 
                     currentLang === 'es' ? 'pt' : 'en';
    i18n.setLanguage(nextLang as any);
  }
  
  const testKeys = [
    'moneymind.history.title',
    'moneymind.history.origins',
    'moneymind.history.origins_desc',
    'debug.current_language',
    'moneymind.history.milestone_1_full'
  ];
</script>

<div class="translation-debugger fixed top-0 right-0 z-50 bg-gray-800 text-white p-2 rounded-bl-lg opacity-75 hover:opacity-100 transition-opacity">
  <div class="flex items-center">
    <div>🌐 {$_('debug.current_language')}</div>
    <button 
      class="ml-2 px-2 py-1 bg-blue-600 rounded text-xs"
      on:click={toggleLanguage}>
      {$locale.toUpperCase()} → {$locale === 'en' ? 'ES' : $locale === 'es' ? 'PT' : 'EN'}
    </button>
    <button 
      class="ml-2 px-2 py-1 bg-purple-600 rounded text-xs"
      on:click={() => showDetails = !showDetails}>
      {showDetails ? 'Ocultar' : 'Detalhes'}
    </button>
  </div>
  
  {#if showDetails}
    <div class="mt-2 text-xs">
      <div class="grid grid-cols-1 gap-1">
        {#each testKeys as key}
          <div class="p-1 border border-gray-700 rounded">
            <div class="font-bold">{key}:</div>
            <div class="pl-2">{$_(key)}</div>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>
