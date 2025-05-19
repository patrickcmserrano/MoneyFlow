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
  let shells: THREE.Mesh[] = [];
  let clock: THREE.Clock;
  
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
        console.log('PrimitiveOriginsScene - Iniciando...');
        initScene();
        isInitialized = true;
      }
      initializationInProgress = false;
      debounceTimer = null;
    }, 300);
  }
  
  // Reagir às mudanças no estado de atividade
  $: if (isInitialized && !isDestroyed) {
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
    
    // Inicializar clock
    clock = new THREE.Clock();
    
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
      // Inicializar o clock para animações baseadas em tempo
      clock = new THREE.Clock();
      
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
      
      // Fundo aquático
      createBackground();
      
      // Conchas cauri
      createShells();
      
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
      console.error('Erro ao inicializar cena 3D Primitive Origins:', error);
      cleanup();
    }
  }
  
  function setupLights() {
    if (!scene) return;
    
    // Luz ambiente suave
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);
    
    // Luz direcional principal - simula sol através da água
    const directionalLight = new THREE.DirectionalLight(0x74ccf4, 0.7);
    directionalLight.position.set(1, 2, 1);
    scene.add(directionalLight);
    
    // Luz pontual para simular reflexos na água
    const pointLight = new THREE.PointLight(0x74ccf4, 0.5, 50);
    pointLight.position.set(-5, 5, 5);
    scene.add(pointLight);
    
    // Segunda luz pontual para equilíbrio
    const pointLight2 = new THREE.PointLight(0xffffff, 0.3, 50);
    pointLight2.position.set(5, -3, 5);
    scene.add(pointLight2);
  }
  
  function createBackground() {
    if (!scene) return;
    
    // Criar plano de fundo grande
    const backgroundGeometry = new THREE.PlaneGeometry(100, 100);
    
    // Shader para criar um gradiente azul aquático
    const backgroundMaterial = new THREE.ShaderMaterial({
      uniforms: {
        colorTop: { value: new THREE.Color('#1a4d6e') },    // Azul escuro
        colorBottom: { value: new THREE.Color('#38a8d0') },  // Azul claro
        time: { value: 0.0 }
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
        uniform float time;
        varying vec2 vUv;
        
        // Função para simular ondas suaves na água
        float wave(vec2 p, float t) {
          return 0.05 * sin(p.x * 10.0 + t) * sin(p.y * 10.0 + t * 0.7);
        }
        
        void main() {
          // Gradiente base
          vec3 color = mix(colorBottom, colorTop, vUv.y);
          
          // Adicionar efeito de ondas suaves
          float waveEffect = wave(vUv, time);
          color += vec3(waveEffect, waveEffect, waveEffect * 1.5);
          
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      side: THREE.BackSide
    });
    
    const background = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
    background.position.z = -10;
    scene.add(background);
    
    // Adicionar partículas flutuantes para simular água
    createWaterParticles();
  }
  
  function createWaterParticles() {
    if (!scene) return;
    
    // Geometria para as partículas
    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 200;
    
    // Criar posições aleatórias para as partículas
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = Math.random() * 40 - 20;     // X: -20 a 20
      positions[i + 1] = Math.random() * 40 - 20; // Y: -20 a 20
      positions[i + 2] = Math.random() * 20 - 15; // Z: -15 a 5
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    // Material para as partículas
    const particlesMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.05,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending
    });
    
    // Criar sistema de partículas
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    particles.userData = { isWaterParticles: true };
    scene.add(particles);
  }
  
  function createShells() {
    if (!scene) return;
    
    // Geometria para a concha cauri
    // Vamos criar uma forma básica semelhante a uma concha com deformações
    const shellGeometry = new THREE.SphereGeometry(0.7, 16, 16);
    
    // Deformar a geometria para simular concha
    const positionAttribute = shellGeometry.getAttribute('position');
    const positions = positionAttribute.array;
    
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const y = positions[i + 1];
      const z = positions[i + 2];
      
      // Achatar parte inferior
      if (y < 0) {
        positions[i + 1] = y * 0.5; 
      }
      
      // Alongar ligeiramente
      positions[i] = x * 1.2;
      
      // Adicionar textura à superfície
      const noise = Math.sin(x * 10) * 0.05 + Math.cos(z * 10) * 0.05;
      positions[i] += noise;
      positions[i + 2] += noise;
    }
    
    positionAttribute.needsUpdate = true;
    shellGeometry.computeVertexNormals();
    
    // Material com textura perolada
    const shellMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xf5f0e6,
      roughness: 0.2,
      metalness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.2,
      sheenColor: new THREE.Color(0xfff0e0),
      sheen: 1.0
    });
    
    // Criar 12 conchas
    for (let i = 0; i < 12; i++) {
      const shell = new THREE.Mesh(shellGeometry, shellMaterial);
      
      // Posicionar aleatoriamente em um volume
      shell.position.set(
        Math.random() * 14 - 7,  // X: -7 a 7
        -5 + Math.random() * 2,  // Y: inicialmente abaixo da "água"
        Math.random() * 6 - 3    // Z: -3 a 3
      );
      
      // Rotação aleatória
      shell.rotation.x = Math.random() * Math.PI;
      shell.rotation.y = Math.random() * Math.PI * 2;
      shell.rotation.z = Math.random() * Math.PI;
      
      // Dados para animação
      shell.userData = {
        targetY: Math.random() * 8 - 4,  // Y final: -4 a 4 (após emergir)
        emergeSpeed: 0.01 + Math.random() * 0.02,
        rotationSpeed: {
          x: Math.random() * 0.005,
          y: Math.random() * 0.005,
          z: Math.random() * 0.005
        },
        wobbleSpeed: 0.5 + Math.random(),
        wobbleAmount: 0.05 + Math.random() * 0.1,
        emergeDelay: i * 0.5  // Delay para que emerjam em sequência
      };
      
      // Adicionar à cena
      scene.add(shell);
      
      // Salvar referência para a animação
      shells.push(shell);
    }
  }
  
  function startAnimation() {
    if (isDestroyed) return;
    
    const animate = () => {
      if (isDestroyed) {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
        return;
      }
      
      animationFrameId = requestAnimationFrame(animate);
      
      // Animar apenas se a cena estiver visível
      if (sceneContainer && parseFloat(sceneContainer.style.opacity || '0') > 0) {
        const time = clock.getElapsedTime();
        
        // Atualizar o efeito de ondas no shader do fundo
        if (scene) {
          scene.traverse((object) => {
            if (object instanceof THREE.Mesh && 
                object.material instanceof THREE.ShaderMaterial && 
                object.material.uniforms.time !== undefined) {
              object.material.uniforms.time.value = time;
            }
            
            // Atualizar partículas de água
            if (object instanceof THREE.Points && object.userData && object.userData.isWaterParticles) {
              const positions = object.geometry.getAttribute('position');
              
              for (let i = 0; i < positions.count; i++) {
                const x = positions.getX(i);
                const y = positions.getY(i);
                
                // Movimento suave de ondulação
                positions.setY(i, y + Math.sin(time + x) * 0.01);
                positions.setX(i, x + Math.cos(time + y) * 0.01);
              }
              
              positions.needsUpdate = true;
            }
          });
        }
        
        // Animar conchas - emergindo da água e balançando
        shells.forEach(shell => {
          // Verificar se já passou o tempo de atraso para esta concha
          if (time > shell.userData.emergeDelay) {
            // Fazer a concha emergir até sua posição alvo
            if (shell.position.y < shell.userData.targetY) {
              shell.position.y += shell.userData.emergeSpeed;
            }
            
            // Rotação lenta contínua
            shell.rotation.x += shell.userData.rotationSpeed.x;
            shell.rotation.y += shell.userData.rotationSpeed.y;
            shell.rotation.z += shell.userData.rotationSpeed.z;
            
            // Movimento de balanço como se estivesse flutuando na água
            const wobble = Math.sin(time * shell.userData.wobbleSpeed) * shell.userData.wobbleAmount;
            shell.position.y += wobble;
            shell.position.x += Math.sin(time * shell.userData.wobbleSpeed * 0.7) * shell.userData.wobbleAmount * 0.5;
          }
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
      sceneContainer.style.opacity = '1';
    } else if (transIn > 0) {
      // Entrando na cena
      sceneContainer.style.opacity = transIn.toString();
    } else if (transOut > 0) {
      // Saindo da cena
      sceneContainer.style.opacity = (1 - transOut).toString();
    } else {
      // Completamente inativa
      sceneContainer.style.opacity = '0';
    }
  }
</script>

<style>
  :global(.primitive-origins-scene) {
    transition: opacity 0.3s ease;
  }
</style>
