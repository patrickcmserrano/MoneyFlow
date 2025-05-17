<script lang="ts">
  import { fade } from 'svelte/transition';
  import { _ } from '../../lib/i18n';

  export let activeSection: string;
  export let scrollToSection: (sectionId: string) => void;
    // Lista de seções para o roadmap
  const sections = [
    { id: 'intro', name: $_('navigation.intro', { default: 'Introdução' }) },
    { id: 'primitiveorigins', name: $_('navigation.primitiveorigins', { default: 'Origens Primitivas' }) },
    { id: 'history', name: $_('navigation.history', { default: 'História' }) },
    { id: 'concepts', name: $_('navigation.concepts', { default: 'Conceitos' }) },
    { id: 'tools', name: $_('navigation.tools', { default: 'Ferramentas' }) },
    { id: 'practice', name: $_('navigation.practice', { default: 'Prática' }) }
  ];
</script>

<div class="roadmap" transition:fade={{ duration: 300 }}>
  <div class="roadmap-inner">
    <div class="roadmap-line"></div>
    {#each sections as section}
      <div 
        class="roadmap-item {activeSection === section.id ? 'active' : ''}" 
        on:click={() => scrollToSection(section.id)}
        on:keydown={(e) => e.key === 'Enter' && scrollToSection(section.id)}
        role="button"
        tabindex="0"
        aria-current={activeSection === section.id ? 'true' : 'false'}
      >
        <div class="roadmap-dot"></div>
        <div class="roadmap-label">{section.name}</div>
      </div>
    {/each}
  </div>
</div>

<style>
  /* Roadmap de navegação lateral */
  .roadmap {
    width: 150px;
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    z-index: 100;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    box-shadow: 2px 0 20px rgba(0, 0, 0, 0.5);
    transition: all 0.5s ease;
  }

  .roadmap-inner {
    width: 100%;
    position: relative;
    padding: 20px 0;
  }

  .roadmap-line {
    position: absolute;
    left: 30px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: rgba(255, 255, 255, 0.2);
  }

  .roadmap-item {
    position: relative;
    display: flex;
    align-items: center;
    padding: 15px 0;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .roadmap-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: white;
    margin: 0 24px;
    transition: all 0.3s ease;
  }

  .roadmap-label {
    color: white;
    font-size: 14px;
    opacity: 0.7;
    transition: all 0.3s ease;
  }

  .roadmap-item:hover .roadmap-dot {
    transform: scale(1.3);
    background: #a855f7; /* Roxo claro */
  }

  .roadmap-item:hover .roadmap-label {
    opacity: 1;
  }

  .roadmap-item.active .roadmap-dot {
    transform: scale(1.5);
    background: #a855f7; /* Roxo claro */
    box-shadow: 0 0 10px #a855f7;
  }
  .roadmap-item.active .roadmap-label {
    opacity: 1;
    font-weight: bold;
    color: #a855f7; /* Texto roxo para maior destaque */
  }
  
  /* Ajustes responsivos */
  @media (max-width: 768px) {
    .roadmap {
      width: 80px;
    }

    .roadmap-label {
      font-size: 12px;
    }

    .roadmap-dot {
      margin: 0 15px;
    }
  }

  @media (max-width: 640px) {
    .roadmap {
      width: 50px;
    }

    .roadmap-label {
      display: none;
    }

    .roadmap-dot {
      margin: 0 auto;
    }

    .roadmap-line {
      left: 25px;
    }
  }
</style>
