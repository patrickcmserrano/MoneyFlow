<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { _ } from '../lib/i18n';
  
  // Componentes de base
  import RoadmapNav from './navigation/RoadmapNav.svelte';
  import CoinScene from './three/CoinScene.svelte';
  import SharedAnimations from './styles/SharedAnimations.svelte';
    // Importar componentes de seção
  import IntroSection from './sections/IntroSection.svelte';
  import PrimitiveOriginsSection from './sections/PrimitiveOriginsSection.svelte';
  import HistorySection from './sections/HistorySection.svelte';
  import ConceptsSection from './sections/ConceptsSection.svelte';
  import ToolsSection from './sections/ToolsSection.svelte';
  import PracticeSection from './sections/PracticeSection.svelte';

  // Definir tipos explícitos para as variáveis
  let container: HTMLDivElement | null = null;
  let containerReady = false;
    // Definir variáveis que estavam faltando
  let activeSection: string = 'intro'; // Seção ativa por padrão
  
  // Lista de seções para monitorar durante o scroll
  const sections = ['intro', 'primitiveorigins', 'history', 'concepts', 'tools', 'practice'];
  
  // Função para rolar até uma seção específica
  function scrollToSection(sectionId: string): void {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
      activeSection = sectionId;
    }
  }
  
  // Função para detectar qual seção está visível
  function updateActiveSection(): void {
    const scrollPosition = window.scrollY;
    const viewportHeight = window.innerHeight;
    const middleViewport = scrollPosition + viewportHeight / 2;
    
    // Verificar cada seção e determinar qual está mais visível
    for (const sectionId of sections) {
      const element = document.getElementById(sectionId);
      if (element) {
        const rect = element.getBoundingClientRect();
        const sectionTop = scrollPosition + rect.top;
        const sectionBottom = scrollPosition + rect.bottom;
        
        // Se o ponto médio da viewport estiver dentro desta seção
        if (middleViewport >= sectionTop && middleViewport <= sectionBottom) {
          if (activeSection !== sectionId) {
            activeSection = sectionId;
          }
          break; // Encontrou a seção, sair do loop
        }
      }
    }
  }
  
  // Throttling para melhor desempenho
  let ticking = false;
  function handleScroll(): void {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateActiveSection();
        ticking = false;
      });
      ticking = true;
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
    
    // Adicionar evento de scroll
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Verificar seção inicial após o carregamento da página
    setTimeout(updateActiveSection, 200);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  });

  onDestroy(() => {
    containerReady = false;
    window.removeEventListener('scroll', handleScroll);
    
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
    {/if}    <!-- Primeira seção (introdução) com background transparente para mostrar a cena 3D -->
    <IntroSection id="intro" {container} />
    
    <!-- Seções adicionais que serão roladas -->
    <PrimitiveOriginsSection id="primitiveorigins" {scrollToSection} />
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
