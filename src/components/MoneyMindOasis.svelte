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
  import CoinsMetalSection from './sections/CoinsMetalSection.svelte';
  import PaperDigitalSection from './sections/PaperDigitalSection.svelte';
  import PhilosophySection from './sections/PhilosophySection.svelte';

  // Definir tipos explícitos para as variáveis
  let container: HTMLDivElement | null = null;
  let containerReady = false;
    // Definir variáveis que estavam faltando
  let activeSection: string = 'intro'; // Seção ativa por padrão
  // Lista de seções para monitorar durante o scroll
  const sections = ['intro', 'primitiveorigins', 'coinsmetal', 'paperdigital', 'philosophy'];
  
  // Função para rolar até uma seção específica
  function scrollToSection(sectionId: string): void {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
      activeSection = sectionId;
    }
  }
    // Observer para monitorar a visibilidade das seções
  let observer: IntersectionObserver | null = null;

  // Inicializar container imediatamente
  onMount(() => {    // Inicializar o container
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
    
    // Configurar IntersectionObserver
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            activeSection = entry.target.id;
          }
        });
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.5, // Ativa quando 50% da seção está visível
      }
    );
    
    // Observar todas as seções
    sections.forEach((sectionId) => {
      const element = document.getElementById(sectionId);
      if (element) observer?.observe(element);
    });
    
    return () => {
      // Limpar observer
      if (observer) {
        observer.disconnect();
        observer = null;
      }
      // Remover container
      if (container && container.parentNode) {
        container.parentNode.removeChild(container);
      }
    };
  });
  onDestroy(() => {
    containerReady = false;
    
    // Limpar IntersectionObserver
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    
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
  <div class="main-content">    <!-- Cena 3D -->
    {#if containerReady}
      <CoinScene {container} {activeSection} />
    {/if}    <!-- Primeira seção (introdução) com background transparente para mostrar a cena 3D -->
    <IntroSection id="intro" {container} />
    
    <!-- Seções adicionais que serão roladas -->
    <PrimitiveOriginsSection id="primitiveorigins" {scrollToSection} />
    <CoinsMetalSection id="coinsmetal" {scrollToSection} />
    <PaperDigitalSection id="paperdigital" {scrollToSection} />
    <PhilosophySection id="philosophy" {scrollToSection} />
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
