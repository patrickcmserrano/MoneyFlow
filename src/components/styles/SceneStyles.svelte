<!-- Estilo específico para a visualização da cena 3D -->
<style>
  :global(.scene-container) {
    width: 100%;
    height: 100vh;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1;
    pointer-events: none;
  }
  
  :global(.scene-container canvas) {
    width: 100%;
    height: 100%;
    display: block;
  }
</style>
