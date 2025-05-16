<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, fly, slide } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import * as THREE from 'three';
  import { _ } from '../lib/i18n';
  
  let activeSection = 'origins';
  let container: HTMLDivElement;
  let scene: THREE.Scene;
  let camera: THREE.PerspectiveCamera;
  let renderer: THREE.WebGLRenderer;
  let currentAnimation: number;
  
  // Objetos 3D para cada seção
  let objects: {
    [key: string]: THREE.Object3D[];
  } = {
    origins: [],
    coins: [],
    paper: [],
    philosophy: []
  };

  function setSection(section: string) {
    // Esconder todos os objetos com transição suave
    Object.keys(objects).forEach(key => {
      if (key !== section) {
        objects[key].forEach(obj => {
          // Fade out animation
          if (obj.userData.originalOpacity === undefined) {
            obj.userData.originalOpacity = obj instanceof THREE.Mesh 
              ? (obj.material as THREE.Material).opacity 
              : 1;
          }
          
          // Marque para animação de fade out
          obj.userData.fadeOut = true;
          obj.userData.fadeTarget = 0;
        });
      }
    });
    
    // Mostrar objetos da seção selecionada com transição suave
    objects[section].forEach(obj => {
      obj.visible = true;
      
      // Configura para fade in
      if (obj.userData.originalOpacity === undefined) {
        obj.userData.originalOpacity = obj instanceof THREE.Mesh 
          ? (obj.material as THREE.Material).opacity 
          : 1;
      }
      
      // Se estava escondido, começa com opacidade 0
      if (obj.userData.fadeOut) {
        if (obj instanceof THREE.Mesh && obj.material instanceof THREE.Material) {
          obj.material.transparent = true;
          obj.material.opacity = 0;
        } else if (obj instanceof THREE.Line && obj.material instanceof THREE.Material) {
          obj.material.transparent = true;
          obj.material.opacity = 0;
        }
      }
      
      // Marque para animação de fade in
      obj.userData.fadeOut = false;
      obj.userData.fadeTarget = obj.userData.originalOpacity;
    });
    
    activeSection = section;
  }
  
  function updateObjectOpacity(delta: number) {
    const fadeSpeed = 1.5; // Velocidade de fade
    
    Object.keys(objects).forEach(key => {
      objects[key].forEach(obj => {
        if (obj.visible) {
          if (obj instanceof THREE.Mesh && obj.material instanceof THREE.Material && obj.material.transparent) {
            // Animar opacidade
            const currentOpacity = obj.material.opacity;
            const targetOpacity = obj.userData.fadeTarget !== undefined ? obj.userData.fadeTarget : 1;
            
            if (Math.abs(currentOpacity - targetOpacity) > 0.01) {
              if (targetOpacity > currentOpacity) {
                obj.material.opacity = Math.min(targetOpacity, currentOpacity + delta * fadeSpeed);
              } else {
                obj.material.opacity = Math.max(targetOpacity, currentOpacity - delta * fadeSpeed);
                
                // Esconder objeto quando completamente transparente
                if (obj.material.opacity <= 0.01 && obj.userData.fadeOut) {
                  obj.visible = false;
                }
              }
            }
          } else if (obj instanceof THREE.Line && obj.material instanceof THREE.Material && obj.material.transparent) {
            // Animar opacidade para linhas
            const currentOpacity = obj.material.opacity;
            const targetOpacity = obj.userData.fadeTarget !== undefined ? obj.userData.fadeTarget : 1;
            
            if (Math.abs(currentOpacity - targetOpacity) > 0.01) {
              if (targetOpacity > currentOpacity) {
                obj.material.opacity = Math.min(targetOpacity, currentOpacity + delta * fadeSpeed);
              } else {
                obj.material.opacity = Math.max(targetOpacity, currentOpacity - delta * fadeSpeed);
                
                // Esconder objeto quando completamente transparente
                if (obj.material.opacity <= 0.01 && obj.userData.fadeOut) {
                  obj.visible = false;
                }
              }
            }
          }
        }
      });
    });
  }
  
  // Função para criar objetos primitivos (para a seção Origens)
  function createPrimitiveObjects() {
    // Pedra (forma irregular)
    const stoneGeometry = new THREE.DodecahedronGeometry(0.5, 0);
    const stoneMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x888888,
      roughness: 0.9
    });
    
    // Criar várias pedras
    for (let i = 0; i < 8; i++) {
      const stone = new THREE.Mesh(stoneGeometry, stoneMaterial);
      stone.position.set(
        (Math.random() - 0.5) * 6, 
        (Math.random() - 0.5) * 2, 
        (Math.random() - 0.5) * 2 - 3
      );
      stone.rotation.set(
        Math.random() * Math.PI, 
        Math.random() * Math.PI, 
        Math.random() * Math.PI
      );
      stone.scale.set(
        0.5 + Math.random() * 0.5,
        0.5 + Math.random() * 0.5,
        0.5 + Math.random() * 0.5
      );
      scene.add(stone);
      objects.origins.push(stone);
    }
  }
  
  // Função para criar moedas (para a seção Moedas)
  function createCoins() {
    const coinGeometry = new THREE.CylinderGeometry(0.7, 0.7, 0.1, 32);
    const goldMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffd700, 
      metalness: 0.8,
      roughness: 0.2
    });
    const silverMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xc0c0c0, 
      metalness: 0.7,
      roughness: 0.3
    });
    const bronzeMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xcd7f32, 
      metalness: 0.6,
      roughness: 0.4
    });
    
    // Criar várias moedas de diferentes materiais
    const materials = [goldMaterial, silverMaterial, bronzeMaterial];
    
    for (let i = 0; i < 12; i++) {
      const material = materials[i % 3];
      const coin = new THREE.Mesh(coinGeometry, material);
      
      // Posicionar as moedas em uma formação circular
      const angle = (i / 12) * Math.PI * 2;
      const radius = 2.5;
      
      coin.position.set(
        Math.cos(angle) * radius,
        (Math.random() - 0.5) * 0.5,
        Math.sin(angle) * radius - 3
      );
      
      coin.rotation.x = Math.PI / 2;
      coin.rotation.z = Math.random() * Math.PI;
      
      scene.add(coin);
      objects.coins.push(coin);
    }
  }
  
  // Função para criar notas e símbolos digitais (para a seção Papel/Digital)
  function createPaperAndDigital() {
    // Criar notas de papel mais visíveis e realistas
    const noteGeometry = new THREE.BoxGeometry(2.0, 0.05, 1.0);
    const noteMaterials = [
      new THREE.MeshStandardMaterial({ color: 0x36A852, roughness: 0.5 }),  // Verde (dólar)
      new THREE.MeshStandardMaterial({ color: 0x1560BD, roughness: 0.5 }),  // Azul (euro)
      new THREE.MeshStandardMaterial({ color: 0xF44336, roughness: 0.5 }),  // Vermelho (yuan)
      new THREE.MeshStandardMaterial({ color: 0xFFA000, roughness: 0.5 }),  // Laranja (real)
      new THREE.MeshStandardMaterial({ color: 0x6A1B9A, roughness: 0.5 })   // Roxo (libra)
    ];
    
    for (let i = 0; i < 5; i++) {
      const note = new THREE.Mesh(noteGeometry, noteMaterials[i]);
      note.position.set(
        -4 + i * 2.0,
        -0.5 + i * 0.1,  // Leve elevação para separá-las visualmente
        -3
      );
      note.rotation.y = Math.PI / 6;
      note.rotation.x = Math.PI / 12; // Inclinar levemente para melhor visualização
      scene.add(note);
      objects.paper.push(note);
    }
    
    // Criar símbolos digitais mais claros e interativos
    const digitalSymbols = [
      createTextMesh('0101', 0.25, 0xFFFFFF),
      createTextMesh('₿', 0.4, 0xF7931A),  // Bitcoin em laranja
      createTextMesh('$', 0.4, 0x2E7D32),  // Dólar em verde
      createTextMesh('€', 0.4, 0x1565C0),  // Euro em azul
      createTextMesh('ETH', 0.25, 0x627EEA)  // Ethereum em azul/roxo
    ];
    
    digitalSymbols.forEach((symbol, i) => {
      symbol.position.set(
        -4 + i * 2.0,
        1.5,
        -3
      );
      // Adicionar leve rotação para parecer flutuando
      symbol.userData = { 
        floatSpeed: 0.005 + Math.random() * 0.005,
        rotationSpeed: 0.01,
        originalY: 1.5
      };
      scene.add(symbol);
      objects.paper.push(symbol);
    });
    
    // Adicionar linhas de conexão entre moedas físicas e digitais
    const lineMaterial = new THREE.LineBasicMaterial({ 
      color: 0x00ffff, 
      transparent: true, 
      opacity: 0.6 
    });
    
    for (let i = 0; i < 5; i++) {
      const points = [];
      points.push(new THREE.Vector3(-4 + i * 2.0, -0.5 + i * 0.1, -3));
      points.push(new THREE.Vector3(-4 + i * 2.0, 1.5, -3));
      
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, lineMaterial);
      scene.add(line);
      objects.paper.push(line);
    }
  }
  
  // Função auxiliar para criar textos 3D
  function createTextMesh(text: string, size: number, color: number) {
    // Criar um canvas para desenhar o texto
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    
    const context = canvas.getContext('2d');
    if (!context) return new THREE.Mesh(); // Return empty mesh if context is null
    
    context.fillStyle = '#ffffff';
    context.font = 'Bold 80px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, 64, 64);
    
    // Usar o canvas como uma textura
    const texture = new THREE.CanvasTexture(canvas);
    
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      color: new THREE.Color(color)
    });
    
    const geometry = new THREE.PlaneGeometry(size, size);
    return new THREE.Mesh(geometry, material);
  }
  
  // Função para criar a esfera filosófica
  function createPhilosophicalSphere() {
    const sphereGeometry = new THREE.SphereGeometry(1.5, 32, 32);
    const sphereMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 }
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vNormal = normal;
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          vec3 color1 = vec3(0.6, 0.2, 0.8); // Roxo
          vec3 color2 = vec3(0.1, 0.5, 0.9); // Azul
          vec3 color3 = vec3(0.9, 0.4, 0.1); // Laranja
          
          float t = sin(time * 0.5) * 0.5 + 0.5;
          float pattern = sin(vPosition.x * 5.0 + time) * 
                          sin(vPosition.y * 5.0 + time) * 
                          sin(vPosition.z * 5.0 + time);
          
          vec3 color = mix(
            mix(color1, color2, t),
            color3,
            pattern * 0.5 + 0.5
          );
          
          gl_FragColor = vec4(color, 1.0);
        }
      `
    });
    
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(0, 0, -3);
    scene.add(sphere);
    objects.philosophy.push(sphere);
    
    // Adicionar efeito de partículas ao redor da esfera
    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 500;
    const posArray = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
      // Distribuir partículas em uma forma esférica
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 1.8 + Math.random() * 1;
      
      posArray[i] = radius * Math.sin(phi) * Math.cos(theta);
      posArray[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
      posArray[i + 2] = radius * Math.cos(phi) - 3; // Ajuste para centralizar no z=-3
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.02,
      color: 0xffffff,
      transparent: true,
      opacity: 0.6
    });
    
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    particlesMesh.position.set(0, 0, 0);
    scene.add(particlesMesh);
    objects.philosophy.push(particlesMesh);
  }
  
  function animate() {
    const clock = new THREE.Clock();
    let lastTime = 0;
    
    const animateFrame = () => {
      currentAnimation = requestAnimationFrame(animateFrame);
      
      const time = clock.getElapsedTime();
      const delta = time - lastTime;
      lastTime = time;
      
      // Atualizar opacidades com transições suaves
      updateObjectOpacity(delta);
      
      // Animar objetos baseado na seção ativa
      if (activeSection === 'origins') {
        objects.origins.forEach(object => {
          object.rotation.y += 0.01;
        });
      } else if (activeSection === 'coins') {
        objects.coins.forEach(object => {
          object.rotation.z += 0.02;
        });
      } else if (activeSection === 'paper') {
        objects.paper.forEach((object, i) => {
          // Verificar se o objeto tem propriedades userData definidas para animação
          if (object.userData && object.userData.floatSpeed) {
            // Animação de flutuação para símbolos digitais
            object.position.y = object.userData.originalY + Math.sin(Date.now() * 0.001 * object.userData.floatSpeed) * 0.2;
            
            // Rotação suave
            object.rotation.y += object.userData.rotationSpeed * 0.5;
            object.rotation.x += object.userData.rotationSpeed * 0.3;
          }
        });
      } else if (activeSection === 'philosophy') {
        // Atualizar o shader da esfera filosófica
        objects.philosophy.forEach(object => {
          if (object instanceof THREE.Mesh && object.material instanceof THREE.ShaderMaterial) {
            object.material.uniforms.time.value = Date.now() * 0.001;
            object.rotation.y += 0.005;
          } else if (object instanceof THREE.Points) {
            // Rotacionar partículas em direção oposta
            object.rotation.y -= 0.002;
          }
        });
      }
      
      renderer.render(scene, camera);
    };
    
    animateFrame();
  }

  onMount(() => {
    // Configuração básica do Three.js
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 100);
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    
    // Posicionar câmera
    camera.position.z = 5;
    
    // Luz
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 2);
    scene.add(directionalLight);
    
    // Criar objetos para cada seção
    createPrimitiveObjects();
    createCoins();
    createPaperAndDigital();
    createPhilosophicalSphere();
    
    // Inicialmente mostrar apenas os objetos da seção Origins
    hideAllObjects();
    setSection('origins');
    
    // Iniciar animação com transições suaves
    animate();
    
    // Lidar com redimensionamento
    const handleResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      if (currentAnimation) {
        cancelAnimationFrame(currentAnimation);
      }
      if (renderer && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      window.removeEventListener('resize', handleResize);
    };
  });
  function openReflection() {
    const questions = [
      $_('moneymind.questions.meaning'),
      $_('moneymind.questions.life'),
      $_('moneymind.questions.value'),
      $_('moneymind.questions.ai'),
      $_('moneymind.questions.objects')
    ];
      const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    alert(`🤔 ${$_('moneymind.reflect')}: ${randomQuestion}`);
  }
</script>

<section id="history" class="min-h-screen bg-transparent text-white pt-20 pb-10 relative">
  <div class="container mx-auto px-4">
    <h2 class="text-4xl font-bold text-center mb-10" in:slide={{ duration: 800, delay: 200 }}>{$_('moneymind.history.title')}</h2>
    
    <div class="flex flex-col md:flex-row">
      <!-- Navegação -->
      <div class="md:w-1/4 mb-6 md:mb-0">
        <nav class="flex flex-col space-y-2 sticky top-24" in:fly={{ x: -50, duration: 500 }}>
          {#each ['origins', 'coins', 'paper', 'philosophy'] as section, i}
            <button 
              on:click={() => setSection(section)}
              class="btn {activeSection === section ? 'bg-purple-700' : 'bg-gray-800 hover:bg-gray-700'} text-white px-4 py-2 rounded transition-all transform duration-300 hover:translate-x-2"
              in:fly={{ x: -50, duration: 300, delay: i * 100 }}>
              {$_(`moneymind.history.${section}`)}
            </button>
          {/each}
        </nav>
      </div>
      
      <!-- Conteúdo -->
      <div class="md:w-3/4 md:pl-8">
        <!-- Canvas 3D com transição suave -->
        <div bind:this={container} class="h-60 md:h-80 mb-6 rounded-lg overflow-hidden bg-gradient-to-r from-purple-900/30 to-black/30 shadow-lg transition-all duration-500" 
             in:fade={{ duration: 800 }}></div>
        
        <!-- Texto da Seção com transições elegantes -->
        {#if activeSection === 'origins'}
          <div class="content-section" in:fly={{ y: 50, duration: 800, delay: 300, easing: quintOut }} out:fade={{ duration: 200 }}>
            <h3 class="text-2xl font-bold mb-4">{$_('moneymind.history.origins')}</h3>
            
            <h4 class="text-xl font-semibold mt-2 mb-2">As primeiras trocas</h4>
            <p class="mb-4">Há aproximadamente 10.000 anos, com o surgimento da agricultura, o sistema de trocas diretas (escambo) tornou-se a base da economia primitiva. Estas trocas de bens – uma pedra por um peixe, grãos por ferramentas – estabeleceram as fundações para todos os sistemas econômicos futuros.</p>
            
            <h4 class="text-xl font-semibold mt-6 mb-2">Desafios fundamentais</h4>
            <p class="mb-4">As economias baseadas em escambo enfrentavam problemas críticos: como garantir valor equivalente entre bens diferentes? Como transportar mercadorias volumosas para longas distâncias? E como resolver o problema da "dupla coincidência de desejos" - encontrar alguém que tenha exatamente o que você quer e queira exatamente o que você tem?</p>
            
            <h4 class="text-xl font-semibold mt-6 mb-2">Primeiras formas de dinheiro</h4>
            <p class="mb-4">Por volta de 3000 a.C., diversas sociedades começaram a usar objetos padronizados como intermediários de troca. Conchas cauris na China, contas wampum entre nativos americanos, sal na África e no Mediterrâneo, e pedras rai na ilha de Yap no Pacífico – todos funcionavam como proto-moedas.</p>
            
            <div class="backdrop-blur-sm bg-transparent border border-purple-900/30 p-4 rounded-lg mt-6">
              <p class="italic">"Em essência, as primeiras trocas baseavam-se em valor percebido, não padronizado. Uma comunidade podia valorizar sal mais que outra, criando os primeiros conceitos de mercado e valores relativos." — David Graeber, "Dívida: Os Primeiros 5.000 Anos"</p>
            </div>
            
            <div class="backdrop-blur-sm bg-transparent border border-purple-800/30 p-4 rounded-lg mt-6">
              <h5 class="font-bold mb-2">Você sabia?</h5>
              <p>Na ilha de Yap no Pacífico, enormes discos de pedra chamados rai (alguns com mais de 3,5 metros de diâmetro) eram usados como dinheiro. Devido ao seu tamanho e peso, as pedras frequentemente nem eram movidas quando trocavam de dono - todos na comunidade simplesmente reconheciam sua nova propriedade, criando um primitivo "livro-razão" mental que antecipa conceitualmente a tecnologia blockchain por milhares de anos.</p>
            </div>
          </div>        {:else if activeSection === 'coins'}
          <div class="content-section" in:fly={{ y: 50, duration: 800, delay: 300, easing: quintOut }} out:fade={{ duration: 200 }}>
            <h3 class="text-2xl font-bold mb-4">{$_('moneymind.history.coins')}</h3>
            
            <h4 class="text-xl font-semibold mt-2 mb-2">A invenção revolucionária</h4>
            <p class="mb-4">As primeiras moedas oficiais surgiram no reino da Lídia (atual oeste da Turquia) por volta de 600 a.C., cunhadas em electrum, uma liga natural de ouro e prata. Esta inovação representou um marco na história da civilização: pela primeira vez, o valor era garantido por uma autoridade central e padronizado em formato portátil.</p>
            
            <h4 class="text-xl font-semibold mt-6 mb-2">Expansão global</h4>
            <p class="mb-4">A ideia de moeda cunhada espalhou-se rapidamente. Na Grécia Antiga, as dracmas de prata de Atenas tornaram-se uma das primeiras moedas "internacionais". O Império Romano desenvolveu um sistema monetário sofisticado com áureos (ouro), denários (prata) e sestércios (bronze), estabelecendo o primeiro sistema monetário verdadeiramente abrangente.</p>
            
            <h4 class="text-xl font-semibold mt=6 mb-2">Simbolismo e poder</h4>
            <p class="mb-4">As moedas rapidamente se tornaram mais que simples meio de troca - eram símbolos de poder estatal. Os imperadores romanos usavam moedas para propagar sua imagem e ideologia pelo vasto império. A face de César nas moedas romanas pode ser considerada uma das primeiras formas de propaganda política em massa.</p>
            
            <div class="backdrop-blur-sm bg-transparent border border-purple-900/30 p-4 rounded-lg mt-6">
              <p class="italic">"Quando uma moeda é cunhada, seu valor real não está no metal em si, mas no acordo social de que ela pode ser trocada por bens e serviços. Este foi o primeiro grande ato de fé econômica da humanidade, uma ponte entre o valor material e o valor simbólico." — Glyn Davies, "História do Dinheiro"</p>
            </div>
            
            <div class="backdrop-blur-sm bg-transparent border border-purple-800/30 p-4 rounded-lg mt-6">
              <h5 class="font-bold mb-2">Marcos históricos importantes:</h5>
              <ul class="list-disc pl-5 space-y-1">
                <li><strong>600 a.C.</strong> - Primeiras moedas oficiais da Lídia</li>
                <li><strong>Século V a.C.</strong> - Dracmas atenienses tornam-se padrão no comércio mediterrâneo</li>
                <li><strong>27 a.C. a 476 d.C.</strong> - Sistema monetário do Império Romano</li>
                <li><strong>997 d.C.</strong> - Primeira cunhagem padronizada na Inglaterra sob o rei Æthelred II</li>
                <li><strong>1792</strong> - Coinage Act cria o dólar americano e o U.S. Mint</li>
              </ul>
            </div>
          </div>{:else if activeSection === 'paper'}
          <div class="content-section" in:fly={{ y: 50, duration: 800, delay: 300, easing: quintOut }} out:fade={{ duration: 200 }}>
            <h3 class="text-2xl font-bold mb-4">{$_('moneymind.history.paper')}</h3>
            <p class="mb-4">A jornada do dinheiro de papel ao digital representa uma das maiores abstrações na história econômica humana. Seria ainda real o que não podemos tocar?</p>
            
            <h4 class="text-xl font-semibold mt-6 mb-2">Origens do papel-moeda</h4>
            <p class="mb-4">A China da dinastia Tang (618-907 d.C.) introduziu o primeiro papel-moeda genuíno, conhecido como "dinheiro voador" devido à sua leveza. Conforme documentado pelo explorador Marco Polo, este sistema revolucionário permitiu ao império chinês expandir o comércio sem depender de metais pesados.</p>
            
            <h4 class="text-xl font-semibold mt-6 mb-2">A era digital</h4>
            <p class="mb-4">Hoje, aproximadamente 92% do dinheiro mundial existe apenas como registros digitais. O primeiro dinheiro verdadeiramente digital surgiu em 1971, quando o sistema bancário dos EUA começou a utilizar o sistema ACH (Automated Clearing House) para transferências eletrônicas.</p>
            
            <p class="mb-4">Em 2009, com o surgimento do Bitcoin criado por Satoshi Nakamoto, nasceu o conceito de moeda puramente digital sem nenhuma autoridade central, baseada em um livro-razão descentralizado chamado blockchain.</p>
            
            <div class="backdrop-blur-sm bg-transparent border border-purple-900/30 p-4 rounded-lg mt-6">
              <p class="italic">"O dinheiro moderno é um sistema de anotações contábeis. Quando você faz uma compra online, nenhuma moeda física se move - apenas permissões em bancos de dados são alteradas. Hoje, o dinheiro é essencialmente informação." — Yuval Noah Harari, "Sapiens: Uma breve história da humanidade"</p>
            </div>
            
            <h4 class="text-xl font-semibold mt-6 mb-2">O futuro do dinheiro</h4>
            <p class="mb-4">Estamos testemunhando a próxima evolução com Moedas Digitais de Bancos Centrais (CBDCs), onde governos estão desenvolvendo versões totalmente digitais de suas moedas nacionais, combinando a praticidade digital com o respaldo estatal.</p>
            
            <div class="backdrop-blur-sm bg-transparent border border-purple-800/30 p-4 rounded-lg mt-6">
              <h5 class="font-bold mb-2">Referências bibliográficas:</h5>
              <ul class="list-disc pl-5 space-y-1">
                <li>Ferguson, Niall. "A Ascensão do Dinheiro: Uma História Financeira do Mundo" (2008)</li>
                <li>Weatherford, Jack. "A História do Dinheiro" (1997)</li>
                <li>Vigna, Paul & Casey, Michael J. "A Era das Criptomoedas" (2015)</li>
              </ul>
            </div>
          </div>        {:else if activeSection === 'philosophy'}
          <div class="content-section" in:fly={{ y: 50, duration: 800, delay: 300, easing: quintOut }} out:fade={{ duration: 200 }}>
            <h3 class="text-2xl font-bold mb-4">{$_('moneymind.history.philosophy')}</h3>
            
            <h4 class="text-xl font-semibold mt-2 mb-2">A grande ficção humana</h4>
            <p class="mb-4">O dinheiro representa uma das construções sociais mais poderosas já criadas pela humanidade. Diferente de necessidades básicas como comida ou abrigo, o dinheiro não tem valor intrínseco além daquele que coletivamente concordamos em atribuir a ele. É um sistema que funciona apenas porque todos acreditamos nele simultaneamente.</p>
            
            <h4 class="text-xl font-semibold mt-6 mb-2">Perspectivas comparativas</h4>
            <p class="mb-4">O dinheiro faz sentido para nós, mas e para outras formas de vida ou consciência? Golfinhos, apesar de sua inteligência avançada, não acumulam conchas como "dinheiro". Uma inteligência artificial pode manipular valores financeiros com precisão, mas não "deseja" riqueza. O dinheiro existe apenas no contexto de nossas necessidades, desejos e estruturas sociais humanas.</p>
            
            <h4 class="text-xl font-semibold mt-6 mb-2">Dinheiro e consciência</h4>
            <p class="mb-4">Aristóteles distinguia entre o uso natural do dinheiro (como meio de troca) e seu uso não-natural (acumulação pela acumulação). Já Marx argumentou que o dinheiro aliena as pessoas de seu trabalho e de si mesmas. Simmel, em "A Filosofia do Dinheiro" (1900), explorou como o dinheiro transformou relações sociais e moldou a modernidade, quantificando aspectos da vida anteriormente inquantificáveis.</p>
            
            <div class="backdrop-blur-sm bg-transparent border border-purple-900/30 p-4 rounded-lg mt-6">
              <p class="italic">"O dinheiro é talvez a ficção mais poderosa que já criamos - um sistema que funciona apenas porque coletivamente acreditamos nele. Se todos parassem de acreditar simultaneamente, todo o sistema entraria em colapso. Neste sentido, economias são essencialmente sistemas de fé." — Yuval Noah Harari</p>
            </div>
            
            <div class="backdrop-blur-sm bg-transparent border border-purple-800/30 p-4 rounded-lg mt-6">
              <h5 class="font-bold mb-2">Perspectivas filosóficas importantes:</h5>
              <ul class="list-disc pl-5 space-y-2">
                <li><strong>Aristóteles</strong> - Distinguia entre o uso natural do dinheiro como facilitador de trocas e seu uso não-natural para a acumulação</li>
                <li><strong>Karl Marx</strong> - Analisou como o dinheiro aliena as pessoas de seu trabalho e cria relações de poder</li>
                <li><strong>Georg Simmel</strong> - Em "A Filosofia do Dinheiro" (1900), explorou o impacto do dinheiro na psicologia humana e nas relações sociais</li>
                <li><strong>Jean Baudrillard</strong> - Argumentou que o dinheiro moderno perdeu sua conexão com o real, tornando-se puramente simbólico</li>
              </ul>
            </div>
            
            <button 
              class="mt-6 backdrop-blur-sm bg-transparent border border-purple-700 hover:border-purple-500 text-white px-6 py-3 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/30"
              on:click={openReflection}>
              {$_('moneymind.reflect')}
            </button>
          </div>
        {/if}
      </div>
    </div>
  </div>
</section>

<style>
  .content-section {
    min-height: 300px;
  }
  
  /* Transições suaves */
  button {
    transition: all 0.3s ease;
  }
  
  button:hover {
    box-shadow: 0 5px 15px rgba(124, 58, 237, 0.4);
  }
  
  /* Modificar todo o componente para usar fundos transparentes */
  :global(.bg-purple-900), :global(.bg-purple-800), :global(.bg-gray-800), :global(.bg-purple-700) {
    background-color: transparent !important;
    backdrop-filter: blur(8px);
    border: 1px solid rgba(139, 92, 246, 0.3);
  }
  
  /* Canvas 3D com fundo transparente */
  div[bind\:this="container"] {
    background: transparent !important;
    border: 1px solid rgba(139, 92, 246, 0.2);
  }
  
  /* Estilizar scrollbar */
  :global(::-webkit-scrollbar) {
    width: 8px;
  }
  
  :global(::-webkit-scrollbar-track) {
    background: #1a1a1a;
  }
  
  :global(::-webkit-scrollbar-thumb) {
    background: #4a2c6f;
    border-radius: 4px;
  }
  
  :global(::-webkit-scrollbar-thumb:hover) {
    background: #6b2c70;
  }
</style>
