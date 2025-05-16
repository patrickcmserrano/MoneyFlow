<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { _ } from '../lib/i18n';
  
  // Componentes de base
  import RoadmapNav from './navigation/RoadmapNav.svelte';
  import CoinScene from './three/CoinScene.svelte';
  import SharedAnimations from './styles/SharedAnimations.svelte';
  
  // Importar componentes de seção
  import IntroSection from './sections/IntroSection.svelte';
  import HistorySection from './sections/HistorySection.svelte';
  import ConceptsSection from './sections/ConceptsSection.svelte';
  import ToolsSection from './sections/ToolsSection.svelte';
  import PracticeSection from './sections/PracticeSection.svelte';

  // Definir tipos explícitos para as variáveis
  let container: HTMLDivElement | null = null;
  let containerReady = false;
  let sceneDiv: HTMLDivElement | null = null;
  
  // Definir variáveis que estavam faltando
  let activeSection: string = 'intro'; // Seção ativa por padrão
  
  // Função para rolar até uma seção específica
  function scrollToSection(sectionId: string): void {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
      activeSection = sectionId;
    }
  }
  
  // Função para detectar a direção da rolagem
  function detectScrollDirection(event: Event): void {
    // Implementação da detecção de direção de rolagem se necessário
  }
  
  // Função para lidar com o evento de rolagem
  function handleScroll(event: Event): void {
    // Implementação para atualizar activeSection com base na rolagem
    const sections = ['intro', 'history', 'concepts', 'tools', 'practice'];
    
    for (const sectionId of sections) {
      const element = document.getElementById(sectionId);
      if (element) {
        const rect = element.getBoundingClientRect();
        // Se a seção está visível na tela
        if (rect.top <= 100 && rect.bottom >= 100) {
          activeSection = sectionId;
          break;
        }
      }
    }
  }

  // Inicializar container imediatamente
  onMount(() => {
    // Inicializar o container
    if (!container) {
      container = document.createElement('div');
      container.className = 'coin-scene-container';
      container.style.position = 'fixed';
      container.style.top = '0';
      container.style.left = '0';
      container.style.width = '100%';
      container.style.height = '100%';
      container.style.zIndex = '-10'; // Definir um z-index mais baixo
      document.body.appendChild(container);
    }
    
    // Indicar que o container está pronto imediatamente
    containerReady = true;
    
    // Adicionar event listeners
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('scroll', detectScrollDirection);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('scroll', detectScrollDirection);
    };
  });

  onDestroy(() => {
    containerReady = false;
    window.removeEventListener('scroll', handleScroll);
    window.removeEventListener('scroll', detectScrollDirection);
    
    // Remover o container se foi criado dinamicamente
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });
</script>

<SharedAnimations />

<div class="app-container">
  <!-- Roadmap de navegação lateral -->
  <RoadmapNav {activeSection} {scrollToSection} />
  
  <!-- Container principal com a cena 3D -->
  <div class="main-content">
    <!-- Cena 3D -->
    {#if containerReady}
      <CoinScene {container} />
    {/if}

    <!-- Primeira seção (introdução) com background transparente para mostrar a cena 3D -->
    <IntroSection id="intro" {container} />
    
    <!-- Seções adicionais que serão roladas -->
    <HistorySection id="history" {scrollToSection} />
    <ConceptsSection id="concepts" {scrollToSection} />
    <ToolsSection id="tools" {scrollToSection} />
    <PracticeSection id="practice" {scrollToSection} />
  </div>
</div>

<style>
  /* Layout principal */
  .app-container {
    display: flex;
    width: 100%;
    min-height: 100vh;
    position: relative;
    z-index: 2; /* Aumentado de 1 para 2 */
  }

  .main-content {
    flex: 1;
    position: relative;
    margin-left: 150px;
    width: calc(100% - 150px);
    z-index: 2; /* Adicionar z-index para garantir que esteja acima da cena */
  }
  
  /* Garantir comportamento de rolagem suave */
  :global(html) {
    scroll-behavior: smooth;
  }
  
  /* Ajustes responsivos */
  @media (max-width: 768px) {
    .main-content {
      margin-left: 80px;
      width: calc(100% - 80px);
    }
  }

  @media (max-width: 640px) {
    .main-content {
      margin-left: 50px;
      width: calc(100% - 50px);
    }
  }
</style>
