<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import * as THREE from 'three';
  
  // Props
  export let container: HTMLElement | null = null;
  export let active: boolean = false;
  export let transitionIn: number = 0;
  export let transitionOut: number = 0;
  
  // Propriedades da cena
  let scene: THREE.Scene | null = null;
  let camera: THREE.PerspectiveCamera | null = null;
  let renderer: THREE.WebGLRenderer | null = null;
  let animationFrameId: number | undefined = undefined;
  let isInitialized = false;
  let isDestroyed = false;
  let sceneContainer: HTMLDivElement | null = null;
  
  // Objetos da cena
  let coins: THREE.Mesh[] = [];
  
  // Variáveis para controle de debounce
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let initializationInProgress = false;
  
  // Reagir às mudanças no container
  $: if (container && !isInitialized && !isDestroyed && !initializationInProgress) {
    initializationInProgress = true;
    
    // Debounce para evitar múltiplas inicializações
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    
    debounceTimer = setTimeout(() => {
      if (!isDestroyed) {
        console.log('IntroScene - Iniciando...');
        initScene();
        isInitialized = true;
      }
      initializationInProgress = false;
      debounceTimer = null;
    }, 300);
  }
  
  // Reagir às mudanças no estado de atividade
  $: if (isInitialized && !isDestroyed) {
    console.log('IntroScene - active:', active, 'transitionIn:', transitionIn, 'transitionOut:', transitionOut);
    updateVisibility(active, transitionIn, transitionOut);
  }
  
  onMount(() => {
    // Usa o container passado como prop em vez de criar um novo
    sceneContainer = container as HTMLDivElement;
    
    // Se o container já existe, inicializa a cena
    if (container && !isInitialized) {
      initScene();
      isInitialized = true;
    }
    
    // Configurar visibilidade inicial
    updateVisibility(active, transitionIn, transitionOut);
    
    return () => {
      cleanup();
    };
  });
  
  onDestroy(() => {
    isDestroyed = true;
    cleanup();
  });
  
  function cleanup() {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = undefined;
    }
    
    // Liberar memória do Three.js
    if (renderer) {
      renderer.dispose();
      renderer = null;
    }
    
    if (scene) {
      scene.clear();
      scene = null;
    }
    
    // Não removemos o container pois ele é compartilhado entre as cenas
    // Apenas tornamos a cena invisível
    if (sceneContainer) {
      sceneContainer.style.opacity = '0';
    }
  }
  
  function initScene() {
    if (isDestroyed) return;
    
    try {
      // Log para debug
      console.log('Inicializando IntroScene - container:', sceneContainer);
      if (sceneContainer) {
        console.log('Container já conectado ao DOM:', sceneContainer.isConnected);
      }
      
      // Configuração da cena
      scene = new THREE.Scene();
      
      // Obtém as dimensões da janela para a câmera e renderizador
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      renderer = new THREE.WebGLRenderer({ 
        alpha: true, 
        antialias: true 
      });
      
      renderer.setSize(width, height);
      renderer.setClearColor(0x000000, 0); // Fundo transparente
      
      // Usar o container compartilhado
      if (sceneContainer && sceneContainer.isConnected) {
        sceneContainer.appendChild(renderer.domElement);
        renderer.domElement.style.position = 'absolute';
        renderer.domElement.style.top = '0';
        renderer.domElement.style.left = '0';
        renderer.domElement.style.width = '100%';
        renderer.domElement.style.height = '100%';
        renderer.domElement.style.zIndex = '1';
        renderer.domElement.style.pointerEvents = 'none';
      } else {
        console.warn('Container não está conectado ao DOM');
        return;
      }
      
      // Luzes
      setupLights();
      
      // Fundo roxo gradiente
      createBackground();
      
      // Moedas de ouro brilhantes
      createCoins();
      
      // Configuração da câmera
      camera.position.set(0, 0, 10);
      camera.lookAt(0, 0, 0);
      
      // Iniciar animação
      startAnimation();
      
      // Configurar redimensionamento
      window.addEventListener('resize', handleResize);
      
      // Inicialmente definir visibilidade
      updateVisibility(active, transitionIn, transitionOut);
      
    } catch (error) {
      console.error('Erro ao inicializar cena 3D Intro:', error);
      cleanup();
    }
  }
  
  function setupLights() {
    if (!scene) return;
    
    // Luz ambiente suave
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);
    
    // Luz direcional para destaque das moedas
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // Luz pontual para brilho nas moedas
    const pointLight = new THREE.PointLight(0xffcc00, 1, 50);
    pointLight.position.set(0, 5, 5);
    scene.add(pointLight);
    
    // Segunda luz pontual para destacar o outro lado das moedas
    const pointLight2 = new THREE.PointLight(0xffaa00, 0.5, 50);
    pointLight2.position.set(-5, -3, 5);
    scene.add(pointLight2);
  }
  
  function createBackground() {
    if (!scene) return;
    
    // Criar plano de fundo grande
    const backgroundGeometry = new THREE.PlaneGeometry(100, 100);
    
    // Shader para criar um gradiente roxo
    const backgroundMaterial = new THREE.ShaderMaterial({
      uniforms: {
        colorTop: { value: new THREE.Color('#4b0082') },    // Índigo
        colorBottom: { value: new THREE.Color('#9400d3') }  // Violeta
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 colorTop;
        uniform vec3 colorBottom;
        varying vec2 vUv;
        void main() {
          gl_FragColor = vec4(mix(colorBottom, colorTop, vUv.y), 1.0);
        }
      `,
      side: THREE.BackSide
    });
    
    const background = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
    background.position.z = -10;
    scene.add(background);
  }
  
  function createCoins() {
    if (!scene) return;
    
    // Carregador de texturas está implícito no THREE.TextureLoader().load abaixo
    
    // Textura metálica para as moedas
    const goldTexture = new THREE.TextureLoader().load(
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAIAAABMXPacAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1zbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1zbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RDY0MTMzNTM2QUQzMTFFQTk0QUU4RDk4NkE5RjMwRTgiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RDY0MTMzNTQ2QUQzMTFFQTk0QUU4RDk4NkE5RjMwRTgiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpENjQxMzM1MTZBRDMxMUVBOTRBRThEOTg2QTlGMzBFOCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpENjQxMzM1MjZBRDMxMUVBOTRBRThEOTg2QTlGMzBFOCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pmwppb0AAAAJcEhZcwAACxIAAAsS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'
    );

    // Normal map para adicionar detalhes de relevo
    const normalMap = new THREE.TextureLoader().load(
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAIAAABMXPacAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1zbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1zbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1zbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1zbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QTAwQTgzMkZBQUQ3MTFFQUI0QkVGRUZENDA4NkMwNzgiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QTAwQTgzMzBBQUQ3MTFFQUI0QkVGRUZENDA4NkMwNzgiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpBMDBBODMyREFBRDcxMUVBQjRCRUZFRkQ0MDg2QzA3OCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpBMDBBODMyRUFBRDcxMUVBQjRCRUZFRkQ0MDg2QzA3OCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PnvLvKkAAApWSURBVHja7J1rUxs5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'
    );
    
    // Criar geometria para a moeda
    const coinGeometry = new THREE.CylinderGeometry(1, 1, 0.2, 32);
    
    // Material com textura metálica dourada e propriedades de brilho
    const coinMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd700,             // Cor dourada
      metalness: 1.0,              // Metalicidade máxima
      roughness: 0.2,              // Baixa rugosidade para brilho
      map: goldTexture,            // Textura dourada
      normalMap: normalMap,        // Mapa normal para detalhes
      normalScale: new THREE.Vector2(1, 1),
      envMapIntensity: 1.0,        // Intensidade do reflexo
    });
    
    // Criar 15 moedas
    for (let i = 0; i < 15; i++) {
      const coin = new THREE.Mesh(coinGeometry, coinMaterial);
      
      // Posicionar aleatoriamente em um volume
      coin.position.set(
        Math.random() * 16 - 8,  // X: -8 a 8
        Math.random() * 12 - 6,  // Y: -6 a 6
        Math.random() * 8 - 4    // Z: -4 a 4
      );
      
      // Rotação inicial da moeda (para exibir a face)
      coin.rotation.x = Math.PI / 2; // Paralelo ao plano horizontal
      coin.rotation.y = Math.random() * Math.PI;
      coin.rotation.z = Math.random() * Math.PI;
      
      // Dados para animação
      coin.userData = {
        rotationSpeed: {
          x: Math.random() * 0.02 - 0.01,  // Velocidade de rotação X entre -0.01 e 0.01
          y: Math.random() * 0.02 - 0.01,  // Velocidade de rotação Y entre -0.01 e 0.01
          z: Math.random() * 0.02 - 0.01   // Velocidade de rotação Z entre -0.01 e 0.01
        },
        floatSpeed: 0.005 + Math.random() * 0.01,
        floatDirection: Math.random() > 0.5 ? 1 : -1,
        floatRange: 0.3 + Math.random() * 0.5,
        initialY: 0 // Será definido logo abaixo
      };
      
      // Salvar a posição Y inicial para efeito de flutuação suave
      coin.userData.initialY = coin.position.y;
      
      // Adicionar à cena
      scene.add(coin);
      
      // Salvar referência para a animação
      coins.push(coin);
    }
  }
  
  function startAnimation() {
    if (isDestroyed || animationFrameId) return;
    
    const animate = () => {
      if (isDestroyed) {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = undefined;
        }
        return;
      }
      
      animationFrameId = requestAnimationFrame(animate);
      
      // Animar moedas apenas se a cena estiver visível e se o container for visível
      const isVisible = sceneContainer && 
                        parseFloat(sceneContainer.style.opacity || '0') > 0.05 &&
                        document.visibilityState === 'visible';
      
      if (isVisible) {
        // Animar moedas
        coins.forEach(coin => {
          // Rotação contínua em eixos aleatórios
          coin.rotation.x += coin.userData.rotationSpeed.x;
          coin.rotation.y += coin.userData.rotationSpeed.y;
          coin.rotation.z += coin.userData.rotationSpeed.z;
          
          // Movimento de flutuação suave usando função seno
          const floatOffset = Math.sin(Date.now() * 0.001 * coin.userData.floatSpeed) * coin.userData.floatRange;
          coin.position.y = coin.userData.initialY + floatOffset;
        });
        
        // Renderizar a cena
        if (renderer && scene && camera) {
          renderer.render(scene, camera);
        }
      }
    };
    
    animate();
  }
  
  function handleResize() {
    if (!renderer || !camera) return;
    
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Atualizar câmera
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    
    // Atualizar renderizador
    renderer.setSize(width, height);
  }
  
  function updateVisibility(isActive: boolean, transIn: number, transOut: number) {
    if (!sceneContainer) return;
    
    // Garantir que o container esteja visível para renderização
    sceneContainer.style.display = 'block';
    
    // Se a cena está ativa ou em transição, torne-a visível
    if (isActive) {
      console.log('IntroScene ativa');
      sceneContainer.style.opacity = '1';
    } else if (transIn > 0) {
      // Entrando na cena
      console.log('IntroScene entrando:', transIn);
      sceneContainer.style.opacity = transIn.toString();
    } else if (transOut > 0) {
      // Saindo da cena
      console.log('IntroScene saindo:', transOut);
      sceneContainer.style.opacity = (1 - transOut).toString();
    } else {
      // Completamente inativa
      sceneContainer.style.opacity = '0';
    }
  }
</script>

<style>
  :global(.intro-scene) {
    transition: opacity 0.3s ease;
  }
</style>
