<script lang="ts">
  import { _ } from '../../lib/i18n';
  import { fade, fly } from 'svelte/transition';

  export let scrollToSection: (sectionId: string) => void;
  export let id: string = 'practice'; // Adicionando propriedade id com valor padrão
</script>

<div {id} class="section min-h-screen pt-16 pb-16 bg-transparent relative section-transition">
  <div class="container mx-auto px-4" in:fly={{ y: 50, duration: 800, delay: 200 }} out:fade={{ duration: 200 }}>
    <h2 class="text-4xl font-bold text-center mb-10 text-white">{$_('navigation.practice', { default: 'Prática' })}</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="backdrop-blur-sm bg-transparent bg-opacity-20 border border-white/10 p-6 rounded-lg shadow-lg text-white transform transition-all duration-500 hover:scale-105">
        <h3 class="text-xl font-bold mb-3">{$_('moneymind.practice.budget', { default: 'Orçamento Pessoal' })}</h3>
        <p class="mb-3">{$_('moneymind.practice.budget_desc', { default: 'Estruturação das finanças pessoais para monitorar receitas e despesas, garantindo equilíbrio financeiro e realização de objetivos.' })}</p>
        <p>{$_('moneymind.practice.budget_habits', { default: 'Conhecer seus padrões de gastos é o primeiro passo para dominar suas finanças e desenvolver hábitos saudáveis com dinheiro.' })}</p>
      </div>
      <div class="backdrop-blur-sm bg-transparent bg-opacity-20 border border-white/10 p-6 rounded-lg shadow-lg text-white transform transition-all duration-500 hover:scale-105">
        <h3 class="text-xl font-bold mb-3">{$_('moneymind.practice.investments', { default: 'Investimentos Conscientes' })}</h3>
        <p class="mb-3">{$_('moneymind.practice.investments_desc', { default: 'Estratégias para multiplicar capital considerando perfil de risco, horizonte temporal e objetivos financeiros de curto e longo prazo.' })}</p>
        <p>{$_('moneymind.practice.investments_knowledge', { default: 'O investimento inteligente combina conhecimento do mercado com autoconhecimento sobre suas próprias tendências comportamentais.' })}</p>
      </div>
      <div class="backdrop-blur-sm bg-transparent bg-opacity-20 border border-white/10 p-6 rounded-lg shadow-lg text-white transform transition-all duration-500 hover:scale-105">
        <h3 class="text-xl font-bold mb-3">{$_('moneymind.practice.education', { default: 'Educação Financeira' })}</h3>
        <p class="mb-3">{$_('moneymind.practice.education_desc', { default: 'Processos contínuos de aprendizado sobre gestão de recursos, instrumentos financeiros e comportamento econômico.' })}</p>
        <p>{$_('moneymind.practice.education_wealth', { default: 'A verdadeira riqueza começa com investimento em conhecimento, criando bases para decisões financeiras informadas e resilientes.' })}</p>
      </div>
    </div>
    
    <div class="mt-10 backdrop-blur-sm bg-transparent bg-opacity-20 border border-white/10 p-6 rounded-lg shadow-lg text-white">
      <h3 class="text-2xl font-bold mb-4 text-center">{$_('moneymind.practice.cycle', { default: 'Ciclo Virtuoso Financeiro' })}</h3>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <div class="text-center backdrop-blur-sm bg-transparent p-4 rounded-lg border border-purple-500/30">
          <div class="text-4xl mb-2">1</div>
          <h4 class="text-xl font-semibold mb-2">{$_('moneymind.practice.cycle_1', { default: 'Consciência' })}</h4>
          <p class="text-sm">{$_('moneymind.practice.cycle_1_desc', { default: 'Reconhecer padrões atuais e estabelecer clareza sobre sua relação com dinheiro' })}</p>
        </div>
        <div class="text-center backdrop-blur-sm bg-transparent p-4 rounded-lg border border-purple-500/30">
          <div class="text-4xl mb-2">2</div>
          <h4 class="text-xl font-semibold mb-2">{$_('moneymind.practice.cycle_2', { default: 'Organização' })}</h4>
          <p class="text-sm">{$_('moneymind.practice.cycle_2_desc', { default: 'Estruturar fluxo de receitas e despesas, criando sistemas para gestão eficiente' })}</p>
        </div>
        <div class="text-center backdrop-blur-sm bg-transparent p-4 rounded-lg border border-purple-500/30">
          <div class="text-4xl mb-2">3</div>
          <h4 class="text-xl font-semibold mb-2">{$_('moneymind.practice.cycle_3', { default: 'Multiplicação' })}</h4>
          <p class="text-sm">{$_('moneymind.practice.cycle_3_desc', { default: 'Desenvolver estratégias para fazer o dinheiro trabalhar a seu favor através de investimentos' })}</p>
        </div>
        <div class="text-center backdrop-blur-sm bg-transparent p-4 rounded-lg border border-purple-500/30">
          <div class="text-4xl mb-2">4</div>
          <h4 class="text-xl font-semibold mb-2">{$_('moneymind.practice.cycle_4', { default: 'Propósito' })}</h4>
          <p class="text-sm">{$_('moneymind.practice.cycle_4_desc', { default: 'Alinhar recursos financeiros com valores pessoais e impacto positivo no mundo' })}</p>
        </div>
      </div>
    </div>
  </div>
  <!-- Indicador de transição para anterior seção -->
  <div class="section-transition-indicator">
    <div 
      class="scroll-indicator up" 
      on:click={() => scrollToSection('tools')}
      on:keydown={(e) => e.key === 'Enter' && scrollToSection('tools')}
      role="button"
      tabindex="0"
      aria-label={$_('navigation.aria.scroll_to_tools', { default: 'Scroll to tools section' })}
    ></div>
  </div>
</div>
