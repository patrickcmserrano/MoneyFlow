<script lang="ts">
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  
  // Importação das cenas
  import IntroScene from './scenes/IntroScene.svelte';
  import PrimitiveOriginsScene from './scenes/PrimitiveOriginsScene.svelte';
  import CoinsMetalScene from './scenes/CoinsMetalScene.svelte';
  import PaperDigitalScene from './scenes/PaperDigitalScene.svelte';
  import PhilosophyScene from './scenes/PhilosophyScene.svelte';
  
  // Props
  export let container: HTMLDivElement | null = null;
  
  // Estado para controlar qual cena está ativa
  export const currentSection = writable('intro');
  
  // Reagir às mudanças no estado de atividade
  $: {
    console.log('SceneManager - Seção Atual:', $currentSection, 'Transição:', $transition);
  }
  
  // Define as seções em ordem
  const sections = ['intro', 'primitiveOrigins', 'coinsMetal', 'paperDigital', 'philosophy'];
  
  // Estado de transição
  export const transition = writable({
    from: 'intro',
    to: 'intro',
    progress: 0 // 0 a 1
  });
  
  // Percentual total de scroll
  let totalScrollPercentage = 0;
  
  // Variáveis para throttling
  let lastScrollTime = 0;
  let scrollThrottleTimer: ReturnType<typeof setTimeout> | null = null;
  
  // Função para throttle do evento de scroll
  function throttledScrollHandler() {
    const now = performance.now();
    const minTimeBetweenScrolls = 50; // ms
    
    if (scrollThrottleTimer) {
      clearTimeout(scrollThrottleTimer);
    }
    
    if (now - lastScrollTime > minTimeBetweenScrolls) {
      lastScrollTime = now;
      updateSectionFromScroll();
    } else {
      // Se estiver sendo chamado muito rapidamente, agende uma chamada
      scrollThrottleTimer = setTimeout(() => {
        lastScrollTime = performance.now();
        updateSectionFromScroll();
        scrollThrottleTimer = null;
      }, minTimeBetweenScrolls);
    }
  }
  
  // Calcula qual seção deve estar ativa com base no scroll
  function updateSectionFromScroll() {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollY = window.scrollY;
    
    // Calcular percentual de scroll apenas quando necessário
    const newTotalScrollPercentage = Math.min(scrollY / scrollHeight, 1);
    
    // Otimização: sair cedo se não houver mudanças significativas no scroll
    if (Math.abs(newTotalScrollPercentage - totalScrollPercentage) < 0.005) {
      return;
    }
    
    totalScrollPercentage = newTotalScrollPercentage;
    
    // Verifica se alguma seção tem id igual aos definidos e está visível
    let foundActiveSection = false;
    for (const section of sections) {
      const element = document.getElementById(section);
      if (element) {
        const rect = element.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        // Se a seção está visível e ocupando pelo menos 30% da altura da viewport
        if (rect.top < viewportHeight * 0.7 && rect.bottom > viewportHeight * 0.3) {
          console.log(`Seção ${section} visível - top: ${rect.top}, bottom: ${rect.bottom}, viewportHeight: ${viewportHeight}`);
          currentSection.set(section);
          foundActiveSection = true;
          break;
        }
      } else {
        console.warn(`Elemento com ID ${section} não encontrado`);
      }
    }
    
    // Se nenhuma seção foi encontrada visível, calcule a seção com base no percentual de scroll
    if (!foundActiveSection) {
      const sectionCount = sections.length;
      const sectionPercentage = 1 / sectionCount;
      
      // Calcula o índice da seção atual
      const sectionIndex = Math.min(
        Math.floor(totalScrollPercentage / sectionPercentage),
        sectionCount - 1
      );
      
      const currentSectionName = sections[sectionIndex];
      
      // Calcula o progresso dentro da seção atual (0 a 1)
      const sectionProgress = (totalScrollPercentage - sectionIndex * sectionPercentage) / sectionPercentage;
      
      // Determina se estamos em transição entre seções
      if (sectionProgress > 0.85 && sectionIndex < sectionCount - 1) {
        // Transição para a próxima seção
        const nextSection = sections[sectionIndex + 1];
        transition.set({
          from: currentSectionName,
          to: nextSection,
          progress: (sectionProgress - 0.85) / 0.15 // Normaliza 0.85-1.0 para 0-1
        });
      } else if (sectionProgress < 0.15 && sectionIndex > 0) {
        // Transição da seção anterior
        const prevSection = sections[sectionIndex - 1];
        transition.set({
          from: prevSection,
          to: currentSectionName,
          progress: sectionProgress / 0.15 // Normaliza 0-0.15 para 0-1
        });
      } else {
        // Sem transição, estamos no meio da seção
        transition.set({
          from: currentSectionName,
          to: currentSectionName,
          progress: 0
        });
      }
      
      // Atualiza a seção atual
      currentSection.set(currentSectionName);
    }
  }
  
  // Função para limpar recursos não utilizados
  function cleanupUnusedScenes() {
    // Lista de seções que não estão sendo usadas nem em transição
    const activeOrTransitioning = [
      $currentSection,
      $transition.from,
      $transition.to
    ];
    
    // A cada 60 segundos, verifica se podemos liberar memória de cenas não visíveis
    const unusedSections = sections.filter(section => !activeOrTransitioning.includes(section));
    
    if (unusedSections.length > 0) {
      console.log('Limpando recursos de cenas não utilizadas:', unusedSections);
      // Nota: a limpeza efetiva é feita pelos próprios componentes de cena
      // Este log serve para debug e poderia ser expandido para outras ações
    }
  }
  
  // Verifica capacidades do dispositivo do usuário
  function detectDeviceCapabilities() {
    // Verifica se é um dispositivo móvel
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Estima a capacidade de GPU
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    let performanceLevel = 'high';
    
    if (isMobile) {
      performanceLevel = 'low';
    } else if (gl) {
      // Verifica informações do contexto WebGL para estimar capacidade
      try {
        // Cast para WebGLRenderingContext para acessar métodos específicos
        const webGL = gl as WebGLRenderingContext;
        const debugInfo = webGL.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          const renderer = webGL.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
          console.log('GPU detectada:', renderer);          // Ajusta performance com base na GPU
          if (renderer && 
              (renderer.includes('Intel') || 
              renderer.toLowerCase().includes('mobile') || 
              renderer.toLowerCase().includes('mesa'))) {
            performanceLevel = 'medium';
          }
        }
      } catch (error) {
        console.warn('Erro ao detectar GPU:', error);
      }
    }
    
    console.log('Nível de performance detectado:', performanceLevel);
    return performanceLevel;
  }
  
  // Atualizar o onMount para usar detecção de capacidades
  onMount(() => {
    // Detectar capacidades do dispositivo no início
    const performanceLevel = detectDeviceCapabilities();
    
    // Compartilhar informação de performance via data attribute para as cenas
    if (container) {
      container.dataset.performanceLevel = performanceLevel;
    }
    
    // Inicializa o handler de scroll com throttling
    window.addEventListener('scroll', throttledScrollHandler);
    
    // Chama uma vez para configurar a seção inicial
    updateSectionFromScroll();
    
    // Configurar intervalo para limpeza periódica (a cada 60 segundos)
    const cleanupInterval = setInterval(cleanupUnusedScenes, 60000);
    
    // Adiciona listener para verificar visibilidade da página
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        // Atualizar ao voltar à página
        updateSectionFromScroll();
      }
    });
    
    return () => {
      // Remove todos os listeners ao desmontar o componente
      window.removeEventListener('scroll', throttledScrollHandler);
      document.removeEventListener('visibilitychange', updateSectionFromScroll);
      clearInterval(cleanupInterval);
      
      if (scrollThrottleTimer) {
        clearTimeout(scrollThrottleTimer);
      }
    };
  });
</script>

<div class="scene-manager">
  {#if $currentSection === 'intro' || $transition.from === 'intro' || $transition.to === 'intro'}
    <IntroScene 
      {container} 
      active={$currentSection === 'intro'}
      transitionIn={$transition.to === 'intro' ? $transition.progress : 0}
      transitionOut={$transition.from === 'intro' ? $transition.progress : 0}
    />
  {/if}
  
  {#if $currentSection === 'primitiveOrigins' || $transition.from === 'primitiveOrigins' || $transition.to === 'primitiveOrigins'}
    <PrimitiveOriginsScene 
      {container}
      active={$currentSection === 'primitiveOrigins'}
      transitionIn={$transition.to === 'primitiveOrigins' ? $transition.progress : 0}
      transitionOut={$transition.from === 'primitiveOrigins' ? $transition.progress : 0}
    />
  {/if}
  
  {#if $currentSection === 'coinsMetal' || $transition.from === 'coinsMetal' || $transition.to === 'coinsMetal'}
    <CoinsMetalScene 
      {container}
      active={$currentSection === 'coinsMetal'}
      transitionIn={$transition.to === 'coinsMetal' ? $transition.progress : 0}
      transitionOut={$transition.from === 'coinsMetal' ? $transition.progress : 0}
    />
  {/if}
  
  {#if $currentSection === 'paperDigital' || $transition.from === 'paperDigital' || $transition.to === 'paperDigital'}
    <PaperDigitalScene 
      {container}
      active={$currentSection === 'paperDigital'}
      transitionIn={$transition.to === 'paperDigital' ? $transition.progress : 0}
      transitionOut={$transition.from === 'paperDigital' ? $transition.progress : 0}
    />
  {/if}
  
  {#if $currentSection === 'philosophy' || $transition.from === 'philosophy' || $transition.to === 'philosophy'}
    <PhilosophyScene 
      {container}
      active={$currentSection === 'philosophy'}
      transitionIn={$transition.to === 'philosophy' ? $transition.progress : 0}
      transitionOut={$transition.from === 'philosophy' ? $transition.progress : 0}
    />
  {/if}
</div>

<style>
  .scene-manager {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0; /* Mesmo nível do container para que as cenas apareçam */
    pointer-events: none;
    overflow: hidden; /* Garante que nada vaze para fora do container */
  }
</style>
