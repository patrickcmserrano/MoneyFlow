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
  let bills: THREE.Group[] = [];
  
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
      // Optionally remove the container if needed, but only if it's attached
      // sceneContainer.parentNode?.removeChild(sceneContainer);
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
      
      // Fundo azul esverdeado suave (cor de dinheiro)
      createBackground();
      
      // Notas de dólar
      createBills();
      
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
      console.error('Erro ao inicializar cena 3D Paper Digital:', error);
      cleanup();
    }
  }
  
  function setupLights() {
    if (!scene) return;
    
    // Luz ambiente
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    // Luz direcional principal
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // Luzes pontuais para destacar as notas
    const pointLight1 = new THREE.PointLight(0xffffff, 0.5, 30);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0xffffff, 0.3, 30);
    pointLight2.position.set(-5, -5, 5);
    scene.add(pointLight2);
  }
  
  function createBackground() {
    if (!scene) return;
    
    // Criar plano de fundo grande
    const backgroundGeometry = new THREE.PlaneGeometry(100, 100);
    
    // Shader para criar um gradiente suave
    const backgroundMaterial = new THREE.ShaderMaterial({
      uniforms: {
        colorTop: { value: new THREE.Color('#206e4e') },    // Verde escuro
        colorBottom: { value: new THREE.Color('#85bb65') }  // Verde dólar
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
  
  function createBills() {
    if (!scene) return;
    
    // Textura base para notas de dólar (representação simplificada)
    const billTexture = new THREE.CanvasTexture(createBillTexture());
    billTexture.wrapS = THREE.RepeatWrapping;
    billTexture.wrapT = THREE.RepeatWrapping;
    
    // Criar 8 notas de dólar
    for (let i = 0; i < 8; i++) {
      // Grupo para cada nota e suas deformações
      const billGroup = new THREE.Group();
      
      // Dimensões das notas de dólar (proporção aproximada de uma nota real)
      const width = 3;
      const height = width * 0.43; // Proporção aproximada de um dólar
      
      // Criar a geometria base da nota
      const segments = 10; // Segmentos para permitir deformações
      const billGeometry = new THREE.PlaneGeometry(width, height, segments, segments);
      
      // Deformar a geometria para simular papel amassado
      const positionAttribute = billGeometry.getAttribute('position');
      const positions = positionAttribute.array;
      
      // Semente única para esta nota para deformações consistentes
      const seed = i * 100;
      
      for (let j = 0; j < positions.length; j += 3) {
        // Pular os vértices da borda para manter a forma retangular básica
        const vertexIndex = j / 3;
        const x = Math.floor(vertexIndex % (segments + 1));
        const y = Math.floor(vertexIndex / (segments + 1));
        
        if (x > 0 && x < segments && y > 0 && y < segments) {
          // Adicionar deformações apenas aos vértices internos
          positions[j] += (Math.sin(seed + x * 0.5) * 0.05);
          positions[j + 1] += (Math.cos(seed + y * 0.5) * 0.05);
          positions[j + 2] += (Math.sin(seed + x * y * 0.1) * 0.08);
        }
      }
      
      positionAttribute.needsUpdate = true;
      billGeometry.computeVertexNormals();
      
      // Material para a nota com textura de papel e detalhes
      const billMaterial = new THREE.MeshStandardMaterial({
        map: billTexture,
        roughness: 0.7,  // Papel não é muito liso
        metalness: 0.0,  // Papel não é metálico
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.95
      });
      
      // Criar a nota
      const bill = new THREE.Mesh(billGeometry, billMaterial);
      
      // Rotação inicial aleatória
      bill.rotation.x = Math.random() * 0.5 - 0.25;
      bill.rotation.y = Math.random() * 0.5 - 0.25;
      bill.rotation.z = Math.random() * 0.5 - 0.25;
      
      billGroup.add(bill);
      
      // Posicionamento inicial - notas dobradas/fechadas
      billGroup.scale.set(0.5, 0.1, 0.5);  // Inicialmente "dobradas"
      billGroup.position.set(
        Math.random() * 16 - 8,  // X: -8 a 8
        Math.random() * 12 - 6,  // Y: -6 a 6
        Math.random() * 8 - 4    // Z: -4 a 4
      );
      
      // Dados para animação
      billGroup.userData = {
        rotationSpeed: {
          x: Math.random() * 0.004 - 0.002,
          y: Math.random() * 0.004 - 0.002,
          z: Math.random() * 0.004 - 0.002
        },
        floatSpeed: {
          x: Math.random() * 0.01 - 0.005,
          y: Math.random() * 0.01 - 0.005,
          z: Math.random() * 0.01 - 0.005
        },
        unfoldDelay: i * 0.3,  // Delay para desdobramento sequencial
        targetScale: {
          x: 1,
          y: 1,
          z: 1
        },
        originalPosition: {
          x: billGroup.position.x,
          y: billGroup.position.y,
          z: billGroup.position.z
        }
      };
      
      // Adicionar à cena
      scene.add(billGroup);
      
      // Salvar referência para a animação
      bills.push(billGroup);
    }
  }
  
  // Cria uma textura para as notas de dólar usando Canvas
  function createBillTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 220; // Proporção aproximada de um dólar
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas; // Se não conseguir o contexto, retorna o canvas em branco
    
    // Cor base verde dólar
    ctx.fillStyle = '#85bb65';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Adicionar bordas e decorações
    ctx.strokeStyle = '#206e4e';
    ctx.lineWidth = 8;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
    
    // Desenhar moldura interna
    ctx.strokeStyle = '#206e4e';
    ctx.lineWidth = 4;
    ctx.strokeRect(25, 25, canvas.width - 50, canvas.height - 50);
    
    // Desenhar círculo central
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 60, 0, Math.PI * 2);
    ctx.strokeStyle = '#206e4e';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Desenhar texto "ONE" grande
    ctx.fillStyle = '#206e4e';
    ctx.font = 'bold 70px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText("$", canvas.width / 2, canvas.height / 2);
    
    // Desenhar números nos cantos
    ctx.font = 'bold 40px Arial';
    ctx.fillText("1", 40, 40);
    ctx.fillText("1", canvas.width - 40, 40);
    ctx.fillText("1", 40, canvas.height - 40);
    ctx.fillText("1", canvas.width - 40, canvas.height - 40);
    
    // Adicionar padrões complexos (linhas curvas)
    ctx.strokeStyle = '#206e4e';
    ctx.lineWidth = 1;
    
    // Padrão de linhas onduladas na parte superior
    for (let i = 0; i < 10; i++) {
      ctx.beginPath();
      ctx.moveTo(0, 80 + i * 5);
      
      for (let x = 0; x < canvas.width; x += 20) {
        ctx.lineTo(x, 80 + i * 5 + Math.sin(x * 0.05) * 3);
      }
      
      ctx.stroke();
    }
    
    // Padrão de linhas onduladas na parte inferior
    for (let i = 0; i < 10; i++) {
      ctx.beginPath();
      ctx.moveTo(0, canvas.height - 80 - i * 5);
      
      for (let x = 0; x < canvas.width; x += 20) {
        ctx.lineTo(x, canvas.height - 80 - i * 5 + Math.sin(x * 0.05) * 3);
      }
      
      ctx.stroke();
    }
    
    return canvas;
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
        
        // Animar notas - desdobramento e flutuação
        bills.forEach(bill => {
          // Verificar se já passou o tempo de atraso para esta nota
          if (time > bill.userData.unfoldDelay) {
            // Calcular progresso da animação de desdobramento
            const unfoldProgress = Math.min((time - bill.userData.unfoldDelay) * 0.5, 1);
            
            // Desdobrar gradualmente a nota
            bill.scale.x = bill.userData.targetScale.x * (0.5 + unfoldProgress * 0.5);
            bill.scale.y = bill.userData.targetScale.y * unfoldProgress;
            bill.scale.z = bill.userData.targetScale.z * (0.5 + unfoldProgress * 0.5);
            
            // Rotação suave
            bill.rotation.x += bill.userData.rotationSpeed.x;
            bill.rotation.y += bill.userData.rotationSpeed.y;
            bill.rotation.z += bill.userData.rotationSpeed.z;
            
            // Movimento de flutuação como folhas ao vento
            const floatPhase = time * 0.5 + bill.userData.unfoldDelay * 10;
            
            bill.position.x = bill.userData.originalPosition.x + Math.sin(floatPhase) * 0.5;
            bill.position.y = bill.userData.originalPosition.y + Math.cos(floatPhase * 0.7) * 0.3;
            bill.position.z = bill.userData.originalPosition.z + Math.sin(floatPhase * 0.5) * 0.2;
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
  :global(.paper-digital-scene) {
    transition: opacity 0.3s ease;
  }
</style>
