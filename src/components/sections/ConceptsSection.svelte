<script lang="ts">
  import { _ } from '../../lib/i18n';
  import { fade, fly } from 'svelte/transition';

  export let scrollToSection: (sectionId: string) => void;
  export let id: string = 'concepts'; // Adicionando propriedade id com valor padrão
</script>

<div {id} class="section min-h-screen pt-16 pb-16 bg-transparent relative section-transition">
  <div class="container mx-auto px-4" in:fly={{ y: 50, duration: 800, delay: 200 }} out:fade={{ duration: 200 }}>
    <h2 class="text-4xl font-bold text-center mb-10 text-white">{$_('navigation.concepts', { default: 'Conceitos' })}</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div class="backdrop-blur-sm bg-transparent bg-opacity-20 border border-white/10 p-6 rounded-lg shadow-lg text-white transform transition-all duration-500 hover:scale-105">
        <h3 class="text-2xl font-bold mb-4">{$_('moneymind.concepts.value', { default: 'Valor e Riqueza' })}</h3>
        <p class="mb-4">{$_('moneymind.concepts.value_desc', { default: 'O dinheiro representa valor, mas não é a própria riqueza. Entender esta distinção é fundamental para uma relação saudável com as finanças.' })}</p>
        <p>{$_('moneymind.concepts.value_agreement', { default: 'O valor real não está no metal ou papel em si, mas no acordo social de que ele pode ser trocado por bens e serviços. Este foi o primeiro grande ato de fé econômica da humanidade.' })}</p>
      </div>
      <div class="backdrop-blur-sm bg-transparent bg-opacity-20 border border-white/10 p-6 rounded-lg shadow-lg text-white transform transition-all duration-500 hover:scale-105">
        <h3 class="text-2xl font-bold mb-4">{$_('moneymind.concepts.language', { default: 'Dinheiro como Linguagem' })}</h3>
        <p class="mb-4">{$_('moneymind.concepts.language_desc', { default: 'O dinheiro funciona como uma linguagem universal que comunica valor através de culturas, fronteiras e gerações.' })}</p>
        <p>{$_('moneymind.concepts.language_intrinsic', { default: 'Diferente de necessidades básicas como comida ou abrigo, o dinheiro não tem valor intrínseco além daquele que coletivamente concordamos em atribuir a ele.' })}</p>
      </div>
    </div>
    
    <div class="backdrop-blur-sm bg-transparent bg-opacity-20 border border-white/10 p-6 rounded-lg shadow-lg text-white mt-8 transform transition-all duration-500 hover:scale-105">
      <h3 class="text-2xl font-bold mb-4">{$_('moneymind.concepts.fiction', { default: 'A Grande Ficção Humana' })}</h3>
      <p class="mb-4">{$_('moneymind.concepts.fiction_desc', { default: 'O dinheiro representa uma das construções sociais mais poderosas já criadas pela humanidade. É um sistema que funciona apenas porque todos acreditamos nele simultaneamente.' })}</p>
      <p class="mb-4">{$_('moneymind.concepts.fiction_aristotle', { default: 'Aristóteles distinguia entre o uso natural do dinheiro (como meio de troca) e seu uso não-natural (acumulação pela acumulação). Já Marx argumentou que o dinheiro aliena as pessoas de seu trabalho e de si mesmas.' })}</p>
      <div class="backdrop-blur-sm bg-transparent border border-purple-900/30 p-4 rounded-lg mt-6">
        <p class="italic">{$_('moneymind.concepts.quote_harari', { default: '"O dinheiro é talvez a ficção mais poderosa que já criamos - um sistema que funciona apenas porque coletivamente acreditamos nele. Se todos parassem de acreditar simultaneamente, todo o sistema entraria em colapso. Neste sentido, economias são essencialmente sistemas de fé." — Yuval Noah Harari' })}</p>
      </div>
    </div>
  </div>
  <!-- Indicadores de transição para próxima/anterior seção -->
  <div class="section-transition-indicator">
    <div 
      class="scroll-indicator up" 
      on:click={() => scrollToSection('history')}
      on:keydown={(e) => e.key === 'Enter' && scrollToSection('history')}
      role="button"
      tabindex="0"
      aria-label={$_('navigation.aria.scroll_to_history', { default: 'Scroll to history section' })}
    ></div>
    <div 
      class="scroll-indicator down" 
      on:click={() => scrollToSection('tools')}
      on:keydown={(e) => e.key === 'Enter' && scrollToSection('tools')}
      role="button"
      tabindex="0"
      aria-label={$_('navigation.aria.scroll_to_tools', { default: 'Scroll to tools section' })}
    ></div>
  </div>
</div>
