<style>
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
  
  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(20px); }
  }
  
  @keyframes sectionFadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  :global(.animate-fade-in) {
    animation: fadeIn 1.5s ease-in-out;
  }
  
  :global(.animate-slide-up) {
    animation: slideUp 1.5s ease-in-out 0.5s backwards;
  }
  
  :global(.animate-pulse) {
    animation: pulse 2s ease-in-out infinite;
  }

  :global(.animate-bounce) {
    animation: bounce 2s ease-in-out infinite;
  }
  
  :global(.section) {
    scroll-margin-top: 0;
    opacity: 0;
    animation: sectionFadeIn 1s ease-in-out forwards;
    background: transparent !important;
    transition: background 0.8s ease-in-out;
  }
  
  /* Garantir que o fundo seja transparente em todos os elementos */
  :global(.section), :global(.bg-gradient-to-br), :global(.bg-black), :global(.via-purple-900), :global(.to-black) {
    background: transparent !important;
  }
  
  /* Melhorar os cards com bordas e efeitos de vidro */
  :global(.backdrop-blur-sm) {
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.3s ease;
  }
  
  :global(.backdrop-blur-sm:hover) {
    border-color: rgba(168, 85, 247, 0.4);
    box-shadow: 0 0 15px rgba(168, 85, 247, 0.2);
  }
  
  /* Transição entre seções */
  :global(.section-transition) {
    position: relative;
    z-index: 5;
    transition: all 1.2s ease-in-out;
  }

  :global(.section-transition::before) {
    content: '';
    position: absolute;
    top: -100px;
    left: 0;
    width: 100%;
    height: 100px;
    background: linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.3));
    z-index: 1;
    pointer-events: none;
  }
  
  :global(.section-transition::after) {
    content: '';
    position: absolute;
    bottom: -50px;
    left: 0;
    width: 100%;
    height: 50px;
    background: linear-gradient(to top, transparent, rgba(0, 0, 0, 0.3));
    z-index: 1;
    pointer-events: none;
  }
  
  /* Estilizar os indicadores de transição */
  :global(.section-transition-indicator) {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    bottom: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
  }

  :global(.scroll-indicator) {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  :global(.scroll-indicator:hover) {
    background: rgba(168, 85, 247, 0.4);
  }

  :global(.scroll-indicator::after) {
    content: '';
    width: 12px;
    height: 12px;
    border-right: 2px solid white;
    border-bottom: 2px solid white;
    transition: all 0.3s ease;
  }

  :global(.scroll-indicator.down::after) {
    transform: rotate(45deg);
    margin-top: -5px;
  }

  :global(.scroll-indicator.up::after) {
    transform: rotate(225deg);
    margin-top: 5px;
  }
</style>
