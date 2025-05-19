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
  let clock: THREE.Clock;
  
  // Objetos da cena
  let bitcoins: THREE.Mesh[] = [];
  let particleSystem: THREE.Points | null = null;
  let connections: THREE.Line[] = [];
  
  // Reagir às mudanças no container
  $: if (container && !isInitialized && !isDestroyed) {
    // Pequeno timeout para garantir que o DOM esteja pronto
    setTimeout(() => {
      if (!isDestroyed) {
        initScene();
        isInitialized = true;
      }
    }, 0);
  }
  
  // Reagir às mudanças no estado de atividade
  $: if (isInitialized && !isDestroyed) {
    updateVisibility(active, transitionIn, transitionOut);
  }
  
  onMount(() => {
    // Usa o container passado como prop em vez de criar um novo
    sceneContainer = container as HTMLDivElement | null;
    
    // Se o container já existe, inicializa a cena
    if (container && !isInitialized) {
      initScene();
      isInitialized = true;
    }
    
    // Configurar visibilidade inicial
    updateVisibility(active, transitionIn, transitionOut);
    
    // Inicializar clock para animações baseadas em tempo
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
      // Log para debug
      console.log('Inicializando PhilosophyScene - container:', sceneContainer);
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
      
      // Fundo digital
      createBackground();
      
      // Sistema de partículas para "rede blockchain"
      createNetworkParticles();
      
      // Símbolos de Bitcoin
      createBitcoins();
      
      // Configuração da câmera
      camera.position.set(0, 0, 20);
      camera.lookAt(0, 0, 0);
      
      // Iniciar animação
      startAnimation();
      
      // Configurar redimensionamento
      window.addEventListener('resize', handleResize);
      
      // Inicialmente definir visibilidade
      updateVisibility(active, transitionIn, transitionOut);
      
    } catch (error) {
      console.error('Erro ao inicializar cena 3D Philosophy:', error);
      cleanup();
    }
  }
  
  function setupLights() {
    if (!scene) return;
    
    // Luz ambiente para iluminação básica
    const ambientLight = new THREE.AmbientLight(0x222222, 0.5);
    scene.add(ambientLight);
    
    // Luz direcional principal
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // Luzes pontuais coloridas para efeito digital/tecnológico
    const pointLight1 = new THREE.PointLight(0x0088ff, 1, 50);
    pointLight1.position.set(10, 5, 5);
    scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0xffaa00, 1, 50);
    pointLight2.position.set(-10, -5, 5);
    scene.add(pointLight2);
  }
  
  function createBackground() {
    if (!scene) return;
    
    // Criar plano de fundo grande
    const backgroundGeometry = new THREE.PlaneGeometry(100, 100);
    
    // Shader para criar um fundo digital com gradiente
    const backgroundMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        colorTop: { value: new THREE.Color('#0a0a2a') },    // Azul escuro
        colorBottom: { value: new THREE.Color('#1a1a4a') }  // Azul médio
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
        
        // Função para criar grade/matriz digital
        float grid(vec2 p, float res) {
          vec2 grid = fract(p * res);
          return (step(0.98, grid.x) + step(0.98, grid.y)) * 0.5;
        }
        
        // Função para ruído simples
        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
        }
        
        void main() {
          // Gradiente base
          vec3 color = mix(colorBottom, colorTop, vUv.y);
          
          // Adicionar grade/matriz digital sutil
          float gridValue = grid(vUv, 100.0) * 0.15;
          color += vec3(gridValue);
          
          // Adicionar pontos aleatórios que piscam (bits)
          vec2 pixelPos = vUv * 200.0;
          vec2 id = floor(pixelPos);
          float h = hash(id);
          float blink = step(0.996, sin(time + h * 100.0) * 0.5 + 0.5);
          color += blink * vec3(0.3, 0.4, 1.0) * step(0.99, h);
          
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      side: THREE.BackSide
    });
    
    const background = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
    background.position.z = -15;
    scene.add(background);
  }
  
  function createNetworkParticles() {
    if (!scene) return;
    
    // Criar sistema de partículas para representar a rede blockchain
    const particleCount = 200;
    const particlesGeometry = new THREE.BufferGeometry();
    
    // Posições das partículas em formato de esfera
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    const radius = 15;
    
    for (let i = 0; i < particleCount; i++) {
      // Distribuir partículas em uma esfera
      const phi = Math.acos(-1 + (2 * i) / particleCount);
      const theta = Math.sqrt(particleCount * Math.PI) * phi;
      
      positions[i * 3] = radius * Math.cos(theta) * Math.sin(phi);
      positions[i * 3 + 1] = radius * Math.sin(theta) * Math.sin(phi);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      
      // Cores variando entre azul e dourado
      const colorMix = Math.random();
      colors[i * 3] = 0.3 + colorMix * 0.7;              // R: 0.3-1.0
      colors[i * 3 + 1] = 0.3 + colorMix * 0.4;          // G: 0.3-0.7
      colors[i * 3 + 2] = 0.8 - colorMix * 0.7;          // B: 0.1-0.8
      
      // Tamanhos variados
      sizes[i] = Math.random() * 0.1 + 0.05;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particlesGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    // Material para as partículas
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    
    // Criar sistema de partículas
    particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particleSystem);
    
    // Criar conexões entre pontos para representar a rede blockchain
    createNetworkConnections(positions, particleCount);
  }
  
  function createNetworkConnections(positions: Float32Array, particleCount: number) {
    if (!scene) return;
    
    // Criar linha conectando pontos próximos (representando a rede blockchain)
    const linesMaterial = new THREE.LineBasicMaterial({
      color: 0x4488ff,
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending
    });
    
    // Conectar partículas próximas
    const maxDistance = 5; // Distância máxima para criar uma conexão
    
    for (let i = 0; i < particleCount; i++) {
      for (let j = i + 1; j < particleCount; j++) {
        const x1 = positions[i * 3];
        const y1 = positions[i * 3 + 1];
        const z1 = positions[i * 3 + 2];
        
        const x2 = positions[j * 3];
        const y2 = positions[j * 3 + 1];
        const z2 = positions[j * 3 + 2];
        
        // Calcular distância entre pontos
        const dist = Math.sqrt(
          Math.pow(x2 - x1, 2) +
          Math.pow(y2 - y1, 2) +
          Math.pow(z2 - z1, 2)
        );
        
        // Se pontos estiverem próximos, criar uma conexão
        if (dist < maxDistance && Math.random() > 0.85) {
          const lineGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(x1, y1, z1),
            new THREE.Vector3(x2, y2, z2)
          ]);
          
          const line = new THREE.Line(lineGeometry, linesMaterial);
          
          // Dados para animação
          line.userData = {
            opacity: Math.random() * 0.3 + 0.05, // Opacidade base
            pulseSpeed: Math.random() * 2 + 0.5  // Velocidade do pulso
          };
          
          scene.add(line);
          connections.push(line);
        }
      }
    }
  }
  
  function createBitcoins() {
    if (!scene) return;
    
    // Criar simbolos de Bitcoin (forma simplificada com ฿)
    // Vamos usar cilindros para o corpo e detalhes para o símbolo
    
    for (let i = 0; i < 10; i++) {
      // Grupo para cada bitcoin e seus componentes
      const bitcoinGroup = new THREE.Group();
      
      // Corpo circular da moeda
      const bitcoinBody = new THREE.CylinderGeometry(1, 1, 0.2, 32);
      
      // Material dourado com brilho digital
      const bitcoinMaterial = new THREE.MeshStandardMaterial({
        color: 0xf7931a,  // Cor laranja do Bitcoin
        metalness: 0.8,
        roughness: 0.2,
        emissive: 0xf7931a,
        emissiveIntensity: 0.2
      });
      
      const bitcoin = new THREE.Mesh(bitcoinBody, bitcoinMaterial);
      bitcoin.rotation.x = Math.PI / 2; // Orientar a face para a frente
      
      // Adicionar símbolo ฿
      addBitcoinSymbol(bitcoin);
      
      bitcoinGroup.add(bitcoin);
      
      // Posicionar em pontos estratégicos da rede
      const angle = (i / 10) * Math.PI * 2;
      const radius = 8 + Math.random() * 3;
      
      bitcoinGroup.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        Math.random() * 6 - 3
      );
      
      // Rotação inicial
      bitcoinGroup.rotation.x = Math.random() * Math.PI;
      bitcoinGroup.rotation.y = Math.random() * Math.PI;
      bitcoinGroup.rotation.z = Math.random() * Math.PI;
      
      // Dados para animação
      bitcoinGroup.userData = {
        rotationSpeed: {
          x: Math.random() * 0.01 - 0.005,
          y: Math.random() * 0.01 - 0.005,
          z: Math.random() * 0.01 - 0.005
        },
        pulseSpeed: Math.random() * 2 + 1,
        pulseAmplitude: Math.random() * 0.1 + 0.05,
        initialScale: 1 + Math.random() * 0.3
      };
      
      // Escala inicial
      bitcoinGroup.scale.set(
        bitcoinGroup.userData.initialScale,
        bitcoinGroup.userData.initialScale,
        bitcoinGroup.userData.initialScale
      );
      
      scene.add(bitcoinGroup);
      bitcoins.push(bitcoinGroup as unknown as THREE.Mesh);
    }
  }
  
  function addBitcoinSymbol(bitcoin: THREE.Mesh) {
    // Criar forma de ฿ usando geometrias simples
    const symbolMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 0.5
    });
    
    // Barra vertical
    const verticalBar = new THREE.BoxGeometry(0.1, 0.9, 0.05);
    const vBar = new THREE.Mesh(verticalBar, symbolMaterial);
    vBar.position.set(0, 0, 0.11);
    bitcoin.add(vBar);
    
    // Barras horizontais (símbolo do B)
    const horizontalBarTop = new THREE.BoxGeometry(0.5, 0.1, 0.05);
    const hBarTop = new THREE.Mesh(horizontalBarTop, symbolMaterial);
    hBarTop.position.set(0.2, 0.25, 0.11);
    bitcoin.add(hBarTop);
    
    const horizontalBarBottom = new THREE.BoxGeometry(0.5, 0.1, 0.05);
    const hBarBottom = new THREE.Mesh(horizontalBarBottom, symbolMaterial);
    hBarBottom.position.set(0.2, -0.25, 0.11);
    bitcoin.add(hBarBottom);
    
    // Parte curva superior do B
    const curveTop = new THREE.TorusGeometry(0.2, 0.05, 8, 12, Math.PI);
    const cTop = new THREE.Mesh(curveTop, symbolMaterial);
    cTop.position.set(0.4, 0.1, 0.11);
    cTop.rotation.z = Math.PI;
    bitcoin.add(cTop);
    
    // Parte curva inferior do B
    const curveBottom = new THREE.TorusGeometry(0.2, 0.05, 8, 12, Math.PI);
    const cBottom = new THREE.Mesh(curveBottom, symbolMaterial);
    cBottom.position.set(0.4, -0.1, 0.11);
    cBottom.rotation.z = Math.PI;
    bitcoin.add(cBottom);
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
        
        // Atualizar shader do fundo
        if (scene) {
          scene.traverse((object) => {
            if (object instanceof THREE.Mesh && 
                object.material instanceof THREE.ShaderMaterial && 
                object.material.uniforms.time !== undefined) {
              object.material.uniforms.time.value = time;
            }
          });
        }
        
        // Rotação suave do sistema de partículas
        if (particleSystem) {
          particleSystem.rotation.y = time * 0.05;
          particleSystem.rotation.x = Math.sin(time * 0.03) * 0.1;
        }
        
        // Animar conexões (pulso)
        connections.forEach(connection => {
          if (connection.material instanceof THREE.LineBasicMaterial) {
            const opacity = connection.userData.opacity + 
                            Math.sin(time * connection.userData.pulseSpeed) * 0.1;
            connection.material.opacity = Math.max(0.05, Math.min(0.3, opacity));
          }
        });
        
        // Animar bitcoins - rotação e pulsação
        bitcoins.forEach(bitcoin => {
          // Rotação contínua
          bitcoin.rotation.x += bitcoin.userData.rotationSpeed.x;
          bitcoin.rotation.y += bitcoin.userData.rotationSpeed.y;
          bitcoin.rotation.z += bitcoin.userData.rotationSpeed.z;
          
          // Pulsação (escala)
          const pulse = Math.sin(time * bitcoin.userData.pulseSpeed) * bitcoin.userData.pulseAmplitude;
          const scale = bitcoin.userData.initialScale + pulse;
          
          bitcoin.scale.set(scale, scale, scale);
          
          // Efeito brilho/emissão pulsante
          bitcoin.traverse((object) => {
            if (object instanceof THREE.Mesh && 
                object.material instanceof THREE.MeshStandardMaterial) {
              object.material.emissiveIntensity = 0.2 + Math.sin(time * 2) * 0.1;
            }
          });
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
  :global(.philosophy-scene) {
    transition: opacity 0.3s ease;
  }
</style>
