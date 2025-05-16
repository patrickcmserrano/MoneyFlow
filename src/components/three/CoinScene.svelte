<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import * as THREE from 'three';
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
  import SceneStyles from '../styles/SceneStyles.svelte';

  export let container: HTMLElement | null = null;
  let scene: THREE.Scene | null = null;
  let camera: THREE.PerspectiveCamera | null = null;
  let renderer: THREE.WebGLRenderer | null = null;
  let controls: OrbitControls | null = null;
  let animationFrameId: number | undefined = undefined;
  let isInitialized = false;
  let isDestroyed = false; // Flag para indicar que o componente está sendo destruído
  let sceneContainer: HTMLDivElement | null = null;
  
  // Reagir às mudanças no container
  $: if (container && !isInitialized && !isDestroyed) {
    // Pequeno timeout para garantir que o DOM esteja pronto
    setTimeout(() => {
      if (!isDestroyed) { // Verificar novamente caso o componente tenha sido destruído durante o timeout
        initScene();
        isInitialized = true;
      }
    }, 0);
  }
  
  onMount(() => {
    // Cria um container para renderização se não existe
    if (!sceneContainer) {
      sceneContainer = document.createElement('div');
      sceneContainer.className = 'scene-container';
      sceneContainer.style.position = 'fixed';
      sceneContainer.style.top = '0';
      sceneContainer.style.left = '0';
      sceneContainer.style.width = '100%';
      sceneContainer.style.height = '100%';
      sceneContainer.style.zIndex = '1'; // Alterado de -5 para 1
      sceneContainer.style.pointerEvents = 'none';
      document.body.appendChild(sceneContainer);
    }
    
    return () => {
      cleanup();
    };
  });
  
  onDestroy(() => {
    isDestroyed = true; // Marcar como destruído antes de limpar
    cleanup();
    
    // Remover o container da cena
    if (sceneContainer && sceneContainer.parentNode) {
      sceneContainer.parentNode.removeChild(sceneContainer);
    }
  });
  
  function initScene() {
    if (isDestroyed) return;
    
    try {
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
      
      // Usar o container criado no onMount
      if (sceneContainer && sceneContainer.isConnected) {
        sceneContainer.appendChild(renderer.domElement);
        
        // Garantir que os elementos da cena renderizada fiquem atrás de outros elementos
        renderer.domElement.style.position = 'absolute';
        renderer.domElement.style.zIndex = '1'; // Ajustado para ser visível
        renderer.domElement.style.pointerEvents = 'none';
      } else {
        console.warn('Container não está conectado ao DOM');
        return;
      }

      // Controles
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.rotateSpeed = 0.5;
      controls.enableZoom = true;
      controls.minDistance = 5;
      controls.maxDistance = 15;
      
      // Luzes
      setupLights();
      
      // Moedas flutuantes
      createCoins();

      // Céu crepuscular
      createSky();

      // Configuração da câmera
      camera.position.set(0, 5, 10);
      camera.lookAt(0, 0, 0);

      // Iniciar animação
      startAnimation();

      // Configurar redimensionamento
      window.addEventListener('resize', handleResize);
    } catch (error) {
      console.error('Erro ao inicializar cena 3D:', error);
      cleanup();
    }
  }
  
  function setupLights() {
    if (!scene) return;
    
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 1, 0);
    scene.add(directionalLight);
    
    // Adicionar luz focal para melhorar o brilho das moedas
    const spotLight = new THREE.SpotLight(0xffffff, 1);
    spotLight.position.set(5, 10, 5);
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.1;
    spotLight.decay = 2;
    spotLight.distance = 50;
    scene.add(spotLight);
  }
  
  function createCoins() {
    if (!scene) return;
    
    const coinGeometry = new THREE.CylinderGeometry(1, 1, 0.2, 32);
    const coinMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffd700, 
      metalness: 0.8,
      roughness: 0.2
    });
    
    // Criar várias moedas
    for (let i = 0; i < 20; i++) {
      const coin = new THREE.Mesh(coinGeometry, coinMaterial);
      coin.position.set(
        Math.random() * 20 - 10, 
        Math.random() * 10 - 5, 
        Math.random() * 20 - 10
      );
      // Rotação inicial aleatória
      coin.rotation.x = Math.PI / 2; // Para exibir a moeda na orientação correta
      coin.rotation.z = Math.random() * Math.PI * 2;
      
      // Armazene as velocidades de rotação para animação
      coin.userData = {
        rotationSpeed: 0.01 + Math.random() * 0.02,
        floatSpeed: 0.005 + Math.random() * 0.01,
        floatDirection: Math.random() > 0.5 ? 1 : -1,
        floatRange: 0.5 + Math.random()
      };
      
      scene.add(coin);
    }
  }
  
  function createSky() {
    if (!scene) return;
    
    const skyGeometry = new THREE.SphereGeometry(50, 32, 32);
    const skyMaterial = new THREE.ShaderMaterial({
      uniforms: {
        topColor: { value: new THREE.Color(0x1a0a2e) },  // Roxo escuro
        bottomColor: { value: new THREE.Color(0x6b2c70) }, // Roxo mais claro
        offset: { value: 10 },
        exponent: { value: 0.6 }
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        uniform float offset;
        uniform float exponent;
        varying vec3 vWorldPosition;
        void main() {
          float h = normalize(vWorldPosition + offset).y;
          gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
        }
      `,
      side: THREE.BackSide
    });
    
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    scene.add(sky);
  }
  
  function startAnimation() {
    if (isDestroyed) return; // Não iniciar animação se o componente foi destruído
    
    // Animação
    const animate = () => {
      if (isDestroyed) {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = undefined;
        }
        return;
      }
      
      animationFrameId = requestAnimationFrame(animate);
      
      // Animar moedas
      if (scene) {
        scene.children.forEach(child => {
          if (child instanceof THREE.Mesh && 
              child.geometry instanceof THREE.CylinderGeometry && 
              child.userData && 
              child.userData.rotationSpeed) {
            
            const userData = child.userData;
            
            // Rotação
            child.rotation.z += userData.rotationSpeed;
            
            // Movimento de flutuação
            child.position.y += userData.floatSpeed * userData.floatDirection;
            
            // Mudar direção se atingir o limite
            if (Math.abs(child.position.y) > userData.floatRange) {
              userData.floatDirection *= -1;
            }
          }
        });
      }
      
      if (controls && renderer && scene && camera) {
        controls.update();
        renderer.render(scene, camera);
      }
    };
    
    animate();
  }
  
  function handleResize() {
    if (isDestroyed || !camera || !renderer) return;
    
    // Usar dimensões da janela ao invés do container
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }
  
  function cleanup() {
    isDestroyed = true; // Garantir que a flag de destruição esteja ativada
    
    if (animationFrameId !== undefined) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = undefined;
    }
    
    window.removeEventListener('resize', handleResize);
    
    if (renderer) {
      try {
        if (renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
        renderer.dispose();
        renderer = null;
      } catch (error) {
        console.error('Erro ao limpar renderer:', error);
      }
    }
    
    if (controls) {
      controls.dispose();
      controls = null;
    }
    
    // Limpar a cena removendo todos os objetos
    if (scene) {
      while(scene.children.length > 0) { 
        const object = scene.children[0];
        scene.remove(object);
        
        // Limpar geometria e materiais se for um mesh
        if (object instanceof THREE.Mesh) {
          if (object.geometry) {
            object.geometry.dispose();
          }
          
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        }
      }
      scene = null;
    }
    
    isInitialized = false;
  }
</script>

<!-- Adicionar estilos específicos para a cena -->
<style>
  :global(.scene-container) {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1; /* Alterado de -5 para 1, para ser consistente com o JS */
    pointer-events: none;
    overflow: hidden;
  }
  
  :global(.scene-container canvas) {
    opacity: 0.8; /* Você pode ajustar este valor para diminuir a opacidade da cena 3D */
  }
</style>

<SceneStyles />
