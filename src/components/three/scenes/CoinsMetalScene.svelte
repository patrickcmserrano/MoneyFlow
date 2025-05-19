<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import * as THREE from 'three';
  
  // Props
  export let container: HTMLDivElement | null = null;
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
  let clock: THREE.Clock = new THREE.Clock();
  
  // Objetos da cena
  let coins: THREE.Mesh[] = [];
  
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
    sceneContainer = container;
    
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
      if (sceneContainer.parentNode) {
        sceneContainer.parentNode.removeChild(sceneContainer);
      }
    }
  }
  
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
      
      // Fundo histórico
      createBackground();
      
      // Moedas lídias
      createCoins();
      
      // Configuração da câmera
      camera.position.set(0, 2, 10);
      camera.lookAt(0, 0, 0);
      
      // Iniciar animação
      startAnimation();
      
      // Configurar redimensionamento
      window.addEventListener('resize', handleResize);
      
      // Inicialmente definir visibilidade
      updateVisibility(active, transitionIn, transitionOut);
      
    } catch (error) {
      console.error('Erro ao inicializar cena 3D Coins Metal:', error);
      cleanup();
    }
  }
  
  function setupLights() {
    if (!scene) return;
    
    // Luz ambiente amarelada para simular ambiente antigo
    const ambientLight = new THREE.AmbientLight(0xd9bf9f, 0.4);
    scene.add(ambientLight);
    
    // Luz direcional principal - simula sol ou tochas
    const directionalLight = new THREE.DirectionalLight(0xffe0b0, 0.7);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // Luz pontual para realçar detalhes das moedas
    const pointLight = new THREE.PointLight(0xff9c40, 0.8, 50);
    pointLight.position.set(3, 5, 3);
    scene.add(pointLight);
  }
  
  function createBackground() {
    if (!scene) return;
    
    // Criar plano de fundo grande
    const backgroundGeometry = new THREE.PlaneGeometry(100, 100);
    
    // Shader para criar um gradiente de cores de terra/areia, remetendo à antiguidade
    const backgroundMaterial = new THREE.ShaderMaterial({
      uniforms: {
        colorTop: { value: new THREE.Color('#8e6b57') },    // Marrom
        colorBottom: { value: new THREE.Color('#d8c6a9') }  // Bege
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
        
        // Função para adicionar textura de ruído
        float noise(vec2 p) {
          return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
        }
        
        void main() {
          // Gradiente base
          vec3 color = mix(colorBottom, colorTop, vUv.y);
          
          // Adicionar textura de ruído sutil para simular grãos de areia/envelhecimento
          float n = noise(vUv * 500.0) * 0.05;
          color += vec3(n);
          
          gl_FragColor = vec4(color, 1.0);
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
    
    // Base de geometria para as moedas lídias (ligeiramente irregular)
    const coinGeometry = new THREE.CylinderGeometry(0.9, 0.9, 0.2, 24);
    
    // Manipular vértices para criar irregularidade nas moedas (característica da cunhagem antiga)
    const positionAttribute = coinGeometry.getAttribute('position');
    const positions = positionAttribute.array;
    
    for (let i = 0; i < positions.length; i += 3) {
      // Deformar ligeiramente a borda para torná-la irregular (característica de moedas antigas)
      const noise = Math.random() * 0.05;
      positions[i] *= 1 + noise;
      positions[i + 2] *= 1 + noise;
    }
    
    positionAttribute.needsUpdate = true;
    coinGeometry.computeVertexNormals();
    
    // Material para electrum envelhecido (liga de ouro e prata)
    const coinMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4bc7e,            // Cor base de electrum
      metalness: 0.7,              // Alta metalicidade, mas não completamente metálica
      roughness: 0.5,              // Superfície rugosa devido à idade
      flatShading: true            // Sombreamento plano para acentuar a textura rústica
    });
    
    // Criar e posicionar moedas em formação circular
    const coinCount = 10;
    const radius = 5;
    
    for (let i = 0; i < coinCount; i++) {
      const coin = new THREE.Mesh(coinGeometry, coinMaterial.clone());
      
      // Personalizar cada material da moeda com variações sutis
      if (coin.material instanceof THREE.MeshStandardMaterial) {
        // Variar o tom de cada moeda para representar diferentes graus de desgaste/oxidação
        const hueShift = Math.random() * 0.1 - 0.05;
        const color = new THREE.Color(coin.material.color);
        color.offsetHSL(hueShift, 0, Math.random() * 0.2 - 0.1);
        coin.material.color = color;
        
        // Variar rugosidade
        coin.material.roughness = 0.4 + Math.random() * 0.3;
      }
      
      // Posicionar em círculo
      const angle = (i / coinCount) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      coin.position.set(x, 0, z);
      
      // Rotação para mostrar a face da moeda
      coin.rotation.x = Math.PI / 2;
      
      // Inclinar levemente cada moeda (variação entre moedas)
      coin.rotation.y = Math.random() * 0.2 - 0.1;
      coin.rotation.z = Math.random() * 0.2 - 0.1;
      
      // Adicionar detalhes de cunhagem (bump geometry)
      addCoinDetails(coin);
      
      // Dados para animação
      coin.userData = {
        rotationSpeed: 0.002 + Math.random() * 0.001,  // Velocidade de rotação lenta
        originAngle: angle,
        radius: radius + Math.random() * 0.5 - 0.25    // Pequena variação no raio
      };
      
      // Adicionar à cena
      scene.add(coin);
      
      // Salvar referência para a animação
      coins.push(coin);
    }
  }
  
  // Adicionar detalhes de cunhagem antigos às moedas
  function addCoinDetails(coin: THREE.Mesh) {
    // Criar geometria para detalhes de cunhagem (símbolos, marcas, etc.)
    const detailGeometry = new THREE.CircleGeometry(0.5, 16);
    detailGeometry.rotateX(-Math.PI / 2);
    
    // Material para os detalhes, com cor ligeiramente diferente
    const detailMaterial = new THREE.MeshStandardMaterial({
      color: 0xc4ac6e,
      metalness: 0.7,
      roughness: 0.4
    });
    
    // Cunhagem na frente da moeda
    const frontDetail = new THREE.Mesh(detailGeometry, detailMaterial);
    frontDetail.position.y = 0.11;  // Posicionar ligeiramente acima da face da moeda
    frontDetail.scale.set(0.7, 0.7, 0.7);
    coin.add(frontDetail);
    
    // Adicionar gravações simples (criando relevos sem texturas complexas)
    addSimpleEngravings(frontDetail);
  }
  
  // Adicionar gravuras simples às moedas
  function addSimpleEngravings(parent: THREE.Mesh) {
    // Adicionar formas geométricas simples que representam figuras ou símbolos antigos
    
    // Escolher aleatoriamente entre diferentes símbolos para cada moeda
    const symbolType = Math.floor(Math.random() * 3);
    
    if (symbolType === 0) {
      // Leão - símbolo comum em moedas lídias
      const lineGeometry = new THREE.BoxGeometry(0.5, 0.02, 0.02);
      const lineMaterial = new THREE.MeshStandardMaterial({
        color: 0xc4ac6e,
        metalness: 0.7,
        roughness: 0.4
      });
      
      // Criar forma simples que lembra um leão (linhas horizontais)
      for (let i = 0; i < 3; i++) {
        const line = new THREE.Mesh(lineGeometry, lineMaterial);
        line.position.set(0, 0, 0.1 - i * 0.1);
        parent.add(line);
      }
      
      // Cabeça do leão (círculo pequeno)
      const headGeometry = new THREE.SphereGeometry(0.1, 8, 8);
      const head = new THREE.Mesh(headGeometry, lineMaterial);
      head.position.set(0.25, 0, 0.1);
      parent.add(head);
      
    } else if (symbolType === 1) {
      // Roseta ou símbolo solar - outro símbolo comum
      const centerGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.02, 16);
      centerGeometry.rotateX(Math.PI / 2);
      
      const center = new THREE.Mesh(centerGeometry, new THREE.MeshStandardMaterial({
        color: 0xc4ac6e,
        metalness: 0.7,
        roughness: 0.4
      }));
      
      parent.add(center);
      
      // Raios/pétalas
      const rayGeometry = new THREE.BoxGeometry(0.25, 0.02, 0.05);
      
      for (let i = 0; i < 8; i++) {
        const ray = new THREE.Mesh(rayGeometry, center.material);
        const angle = (i / 8) * Math.PI * 2;
        ray.position.set(Math.cos(angle) * 0.2, 0, Math.sin(angle) * 0.2);
        ray.rotation.y = angle;
        parent.add(ray);
      }
      
    } else {
      // Touro - outro símbolo comum
      const bodyGeometry = new THREE.BoxGeometry(0.4, 0.02, 0.2);
      const body = new THREE.Mesh(bodyGeometry, new THREE.MeshStandardMaterial({
        color: 0xc4ac6e,
        metalness: 0.7,
        roughness: 0.4
      }));
      
      parent.add(body);
      
      // Cabeça
      const headGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.02, 8);
      headGeometry.rotateX(Math.PI / 2);
      
      const head = new THREE.Mesh(headGeometry, body.material);
      head.position.set(0.25, 0, 0);
      parent.add(head);
      
      // Chifres (simples)
      const hornGeometry = new THREE.BoxGeometry(0.02, 0.02, 0.15);
      
      const hornLeft = new THREE.Mesh(hornGeometry, body.material);
      hornLeft.position.set(0.25, 0, -0.1);
      parent.add(hornLeft);
      
      const hornRight = new THREE.Mesh(hornGeometry, body.material);
      hornRight.position.set(0.25, 0, 0.1);
      parent.add(hornRight);
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
        
        // Animar moedas - rotação lenta em formação circular
        coins.forEach((coin: THREE.Mesh) => {
          // Rotação lenta em torno do próprio eixo
          coin.rotation.z += coin.userData.rotationSpeed;
          
          // Movimento orbital lento ao redor do centro
          const angle = coin.userData.originAngle + time * 0.05;
          const radius = coin.userData.radius;
          
          coin.position.x = Math.cos(angle) * radius;
          coin.position.z = Math.sin(angle) * radius;
          
          // Leve flutuação para cima e para baixo
          coin.position.y = Math.sin(time * 0.7 + coin.userData.originAngle) * 0.2;
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
    
    // Atualizar renderizador
    renderer.setSize(width, height);
    
    // Atualizar câmera
    if (camera) {
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }
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
  :global(.coins-metal-scene) {
    transition: opacity 0.3s ease;
  }
</style>
