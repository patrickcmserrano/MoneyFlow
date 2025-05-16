<script lang="ts">  import { onMount, onDestroy } from 'svelte';
  import Plotly from 'plotly.js-dist';
  import { _ } from '../lib/i18n';
  // Importação de ícones para os botões
  import { Play, Pause, FastForward, Rewind, RotateCcw, StepForward } from '@lucide/svelte';
  // Importação do serviço de dados financeiros
  import { generateSankeyData } from '../lib/financialDataService';
  // Importação dos componentes auxiliares
  import DataSources from './DataSources.svelte';
  import TrendChart from './TrendChart.svelte';
  import FlowExplanation from './FlowExplanation.svelte';
  // Props do componente
  export let year = '2025';
  export let filter = 'all';  // Estado local
  let chartEl: HTMLElement;
  let currentFilter = filter;
  let currentYear = year;
  let isAnimating = false;
  let animationSpeed = 2000; // Velocidade da animação em ms (maior = mais lento)
  let animationInterval: number | null = null;
  let animationFrameId: number | null = null; // ID do requestAnimationFrame para controle
  let animationProgress = 0; // Progresso da animação (0-100%)
  let showHighlightedFlows = true; // Destaca os fluxos mais importantes
  let stepMode = false; // Modo de animação passo a passo
  let currentStep = 0; // Passo atual na animação
  let isLoading = true; // Estado de carregamento dos dados
  let errorMsg = ''; // Mensagem de erro, se houver
  
  // Tipo para um fluxo selecionado
  type SelectedFlow = {
    source: number;
    target: number;
    value: number;
    sourceNode: string;
    targetNode: string;
    year: string;
  } | null;
  
  let selectedFlow: SelectedFlow = null; // Flow selecionado para exibir explicações detalhadas
  
  // Tipo para o dataByYear
  type YearData = {
    link: {
      source: number[];
      target: number[];
      value: number[];
      label: string[];
      customdata: string[];
      color: string[];
    }
  };
  
  type YearDataMap = {
    [key in '2020' | '2021' | '2022' | '2023' | '2024' | '2025']: YearData;
  };
    // Dados de fluxo de dinheiro - inicializado vazio e preenchido assincronamente
  let dataByYear: YearDataMap = {} as YearDataMap;
  
  // Função para carregar dados reais da API
  async function loadRealData() {
    try {
      isLoading = true;
      errorMsg = '';
      
      // Carregar os dados de APIs reais
      const realData = await generateSankeyData();
      dataByYear = realData as YearDataMap;
      
      // Atualizar a visualização após carregar os dados
      if (chartEl) {
        renderSankey(currentYear, currentFilter);
      }
      
    } catch (error) {
      console.error("Erro ao carregar dados financeiros:", error);
      errorMsg = 'Erro ao carregar dados. Usando dados de demonstração.';
      
      // Em caso de erro, usar dados de demonstração
      dataByYear = getFallbackData();
      
      if (chartEl) {
        renderSankey(currentYear, currentFilter);
      }
    } finally {
      isLoading = false;
    }
  }
  
  // Dados de fallback em caso de falha na API
  function getFallbackData(): YearDataMap {
    return {
      2020: {
        link: {
          source: [0, 1, 0, 2, 3, 4, 4, 5, 5, 6, 6, 4, 8, 2, 0],
          target: [1, 2, 2, 3, 4, 5, 5, 6, 6, 3, 4, 7, 2, 8, 8],
          value: [40, 40, 200, 150, 100, 60, 50, 110, 80, 70, 40, 30, 80, 80, 150],
          label: [
            "Produção: R$40 bi (Físico)", 
            "Distribuição: R$40 bi (Físico)", 
            "Injeção: R$200 bi (Eletrônico)", 
            "Salários: R$150 bi", 
            "Consumo: R$100 bi", 
            "Impostos: R$60 bi", 
            "Impostos: R$50 bi", 
            "Arrecadação: R$110 bi", 
            "Arrecadação: R$80 bi", 
            "Benefícios: R$70 bi", 
            "Contratos: R$40 bi", 
            "Exportações: R$30 bi", 
            "Importações: R$80 bi", 
            "Títulos: R$80 bi", 
            "Emissão de Títulos: R$150 bi"
          ],
          customdata: [
            "physical", "physical", "electronic", "all", 
            "all", "all", "all", "all", "all", "all", 
            "all", "all", "all", "all", "electronic"
          ],
          color: [
            "#1e90ff", "#1e90ff", "#8e44ad", "#2ecc71", 
            "#2ecc71", "#e74c3c", "#e74c3c", "#e74c3c", 
            "#e74c3c", "#e74c3c", "#e74c3c", "#f1c40f", 
            "#f1c40f", "#1e90ff", "#e74c3c"
          ]
        }
      },
      2021: {
        link: {
          source: [0, 1, 0, 2, 3, 4, 4, 5, 5, 6, 6, 4, 8, 2, 0],
          target: [1, 2, 2, 3, 4, 5, 5, 6, 6, 3, 4, 7, 2, 8, 8],
          value: [45, 45, 220, 160, 110, 65, 55, 120, 85, 75, 45, 35, 85, 85, 160],
          label: [
            "Produção: R$45 bi (Físico)", 
            "Distribuição: R$45 bi (Físico)", 
            "Injeção: R$220 bi (Eletrônico)", 
            "Salários: R$160 bi", 
            "Consumo: R$110 bi", 
            "Impostos: R$65 bi", 
            "Impostos: R$55 bi", 
            "Arrecadação: R$120 bi", 
            "Arrecadação: R$85 bi", 
            "Benefícios: R$75 bi", 
            "Contratos: R$45 bi", 
            "Exportações: R$35 bi", 
            "Importações: R$85 bi", 
            "Títulos: R$85 bi", 
            "Emissão de Títulos: R$160 bi"
          ],
          customdata: [
            "physical", "physical", "electronic", "all", 
            "all", "all", "all", "all", "all", "all", 
            "all", "all", "all", "all", "electronic"
          ],
          color: [
            "#1e90ff", "#1e90ff", "#8e44ad", "#2ecc71", 
            "#2ecc71", "#e74c3c", "#e74c3c", "#e74c3c", 
            "#e74c3c", "#e74c3c", "#e74c3c", "#f1c40f", 
            "#f1c40f", "#1e90ff", "#e74c3c"
          ]
        }
      },
      2022: {
        link: {
          source: [0, 1, 0, 2, 3, 4, 4, 5, 5, 6, 6, 4, 8, 2, 0],
          target: [1, 2, 2, 3, 4, 5, 5, 6, 6, 3, 4, 7, 2, 8, 8],
          value: [50, 50, 250, 170, 120, 70, 60, 130, 90, 80, 50, 40, 90, 90, 170],
          label: [
            "Produção: R$50 bi (Físico)", 
            "Distribuição: R$50 bi (Físico)", 
            "Injeção: R$250 bi (Eletrônico)", 
            "Salários: R$170 bi", 
            "Consumo: R$120 bi", 
            "Impostos: R$70 bi", 
            "Impostos: R$60 bi", 
            "Arrecadação: R$130 bi", 
            "Arrecadação: R$90 bi", 
            "Benefícios: R$80 bi", 
            "Contratos: R$50 bi", 
            "Exportações: R$40 bi", 
            "Importações: R$90 bi", 
            "Títulos: R$90 bi", 
            "Emissão de Títulos: R$170 bi"
          ],
          customdata: [
            "physical", "physical", "electronic", "all", 
            "all", "all", "all", "all", "all", "all", 
            "all", "all", "all", "all", "electronic"
          ],
          color: [
            "#1e90ff", "#1e90ff", "#8e44ad", "#2ecc71", 
            "#2ecc71", "#e74c3c", "#e74c3c", "#e74c3c", 
            "#e74c3c", "#e74c3c", "#e74c3c", "#f1c40f", 
            "#f1c40f", "#1e90ff", "#e74c3c"
          ]
        }
      },
      2023: {
        link: {
          source: [0, 1, 0, 2, 3, 4, 4, 5, 5, 6, 6, 4, 8, 2, 0],
          target: [1, 2, 2, 3, 4, 5, 5, 6, 6, 3, 4, 7, 2, 8, 8],
          value: [55, 55, 270, 180, 130, 75, 65, 140, 95, 85, 55, 45, 95, 95, 180],
          label: [
            "Produção: R$55 bi (Físico)", 
            "Distribuição: R$55 bi (Físico)", 
            "Injeção: R$270 bi (Eletrônico)", 
            "Salários: R$180 bi", 
            "Consumo: R$130 bi", 
            "Impostos: R$75 bi", 
            "Impostos: R$65 bi", 
            "Arrecadação: R$140 bi", 
            "Arrecadação: R$95 bi", 
            "Benefícios: R$85 bi", 
            "Contratos: R$55 bi", 
            "Exportações: R$45 bi", 
            "Importações: R$95 bi", 
            "Títulos: R$95 bi", 
            "Emissão de Títulos: R$180 bi"
          ],
          customdata: [
            "physical", "physical", "electronic", "all", 
            "all", "all", "all", "all", "all", "all", 
            "all", "all", "all", "all", "electronic"
          ],
          color: [
            "#1e90ff", "#1e90ff", "#8e44ad", "#2ecc71", 
            "#2ecc71", "#e74c3c", "#e74c3c", "#e74c3c", 
            "#e74c3c", "#e74c3c", "#e74c3c", "#f1c40f", 
            "#f1c40f", "#1e90ff", "#e74c3c"
          ]
        }
      },
      2024: {
        link: {
          source: [0, 1, 0, 2, 3, 4, 4, 5, 5, 6, 6, 4, 8, 2, 0],
          target: [1, 2, 2, 3, 4, 5, 5, 6, 6, 3, 4, 7, 2, 8, 8],
          value: [60, 60, 290, 190, 140, 80, 70, 150, 100, 90, 60, 50, 100, 100, 190],
          label: [
            "Produção: R$60 bi (Físico)", 
            "Distribuição: R$60 bi (Físico)", 
            "Injeção: R$290 bi (Eletrônico)", 
            "Salários: R$190 bi", 
            "Consumo: R$140 bi", 
            "Impostos: R$80 bi", 
            "Impostos: R$70 bi", 
            "Arrecadação: R$150 bi", 
            "Arrecadação: R$100 bi", 
            "Benefícios: R$90 bi", 
            "Contratos: R$60 bi", 
            "Exportações: R$50 bi", 
            "Importações: R$100 bi", 
            "Títulos: R$100 bi", 
            "Emissão de Títulos: R$190 bi"
          ],
          customdata: [
            "physical", "physical", "electronic", "all", 
            "all", "all", "all", "all", "all", "all", 
            "all", "all", "all", "all", "electronic"
          ],
          color: [
            "#1e90ff", "#1e90ff", "#8e44ad", "#2ecc71", 
            "#2ecc71", "#e74c3c", "#e74c3c", "#e74c3c", 
            "#e74c3c", "#e74c3c", "#e74c3c", "#f1c40f", 
            "#f1c40f", "#1e90ff", "#e74c3c"
          ]
        }
      },
      2025: {
        link: {
          source: [0, 1, 0, 2, 3, 4, 4, 5, 5, 6, 6, 4, 8, 2, 0],
          target: [1, 2, 2, 3, 4, 5, 5, 6, 6, 3, 4, 7, 2, 8, 8],
          value: [65, 65, 300, 200, 150, 85, 75, 160, 110, 95, 65, 55, 110, 110, 200],
          label: [
            "Produção: R$65 bi (Físico)", 
            "Distribuição: R$65 bi (Físico)", 
            "Injeção: R$300 bi (Eletrônico)", 
            "Salários: R$200 bi", 
            "Consumo: R$150 bi", 
            "Impostos: R$85 bi", 
            "Impostos: R$75 bi", 
            "Arrecadação: R$160 bi", 
            "Arrecadação: R$110 bi", 
            "Benefícios: R$95 bi", 
            "Contratos: R$65 bi", 
            "Exportações: R$55 bi", 
            "Importações: R$110 bi", 
            "Títulos: R$110 bi", 
            "Emissão de Títulos: R$200 bi"
          ],
          customdata: [
            "physical", "physical", "electronic", "all", 
            "all", "all", "all", "all", "all", "all", 
            "all", "all", "all", "all", "electronic"
          ],
          color: [
            "#1e90ff", "#1e90ff", "#8e44ad", "#2ecc71", 
            "#2ecc71", "#e74c3c", "#e74c3c", "#e74c3c", 
            "#e74c3c", "#e74c3c", "#e74c3c", "#f1c40f", 
            "#f1c40f", "#1e90ff", "#e74c3c"
          ]
        }
      }
    } as YearDataMap;
  }

  // Configuração comum dos nós
  const nodeConfig = {
    pad: 15,
    thickness: 20,
    line: { color: "black", width: 0.5 },
    label: [
      "Banco Central", "Casa da Moeda", "Bancos Comerciais", "Pessoas", 
      "Comércio", "Receita Federal", "Governo", "Mercado Externo", "Mercado Financeiro"
    ]
  };

  // Definição dos itens da legenda
  const legendItems = [
    { color: "#1e90ff", label: $_('moneyflow.legend.financial') },
    { color: "#2ecc71", label: $_('moneyflow.legend.people') },
    { color: "#e74c3c", label: $_('moneyflow.legend.government') },
    { color: "#f1c40f", label: $_('moneyflow.legend.external') },
    { color: "#8e44ad", label: $_('moneyflow.legend.electronic') }
  ];  // Função para renderizar o diagrama Sankey
  function renderSankey(year = '2025', filter = 'all', animPhase = -1) {
    if (!chartEl) return;
    
    // Verificar se os dados existem para o ano selecionado
    if (!dataByYear[year as keyof YearDataMap]) {
      console.error(`Dados não encontrados para o ano ${year}`);
      return;
    }
    
    const yearData = dataByYear[year as keyof YearDataMap];
    
    // Validar a estrutura dos dados
    if (!yearData.link || 
        !Array.isArray(yearData.link.source) || 
        !Array.isArray(yearData.link.target) ||
        !Array.isArray(yearData.link.value)) {
      console.error('Formato de dados inválido para o Sankey diagram');
      return;
    }
    
    // Clone profundo dos dados para evitar referências
    const filteredData = {
      type: "sankey",
      orientation: "h",
      arrangement: "snap", // Melhora a organização dos nós
      node: JSON.parse(JSON.stringify(nodeConfig)),
      link: JSON.parse(JSON.stringify(yearData.link)),
      valueformat: ".0f",
      valuesuffix: " bi"
    };

    // Adicionar opcões específicas para os nós
    if (!filteredData.node.thickness) {
      filteredData.node.thickness = 20;
    }
    
    if (!filteredData.node.pad) {
      filteredData.node.pad = 15;
    }

    // Garantir que os arrays tenham o mesmo comprimento
    const minLength = Math.min(
      filteredData.link.source.length,
      filteredData.link.target.length,
      filteredData.link.value.length
    );
    
    if (minLength < filteredData.link.source.length) {
      filteredData.link.source = filteredData.link.source.slice(0, minLength);
      filteredData.link.target = filteredData.link.target.slice(0, minLength);
      filteredData.link.value = filteredData.link.value.slice(0, minLength);
      if (filteredData.link.label) filteredData.link.label = filteredData.link.label.slice(0, minLength);
      if (filteredData.link.color) filteredData.link.color = filteredData.link.color.slice(0, minLength);
      if (filteredData.link.customdata) filteredData.link.customdata = filteredData.link.customdata.slice(0, minLength);
    }

    // Verificar e corrigir valores inválidos
    for (let i = 0; i < filteredData.link.value.length; i++) {
      // Converter para número e verificar se é válido
      filteredData.link.value[i] = Number(filteredData.link.value[i]);
      if (isNaN(filteredData.link.value[i]) || filteredData.link.value[i] < 0) {
        filteredData.link.value[i] = 0.1; // Valor mínimo para evitar links invisíveis
      }
      
      // Verificar se os índices source e target são válidos
      const nodeCount = nodeConfig.label.length;
      if (filteredData.link.source[i] < 0 || filteredData.link.source[i] >= nodeCount ||
          filteredData.link.target[i] < 0 || filteredData.link.target[i] >= nodeCount) {
        console.error(`Índice inválido encontrado no link ${i}: source=${filteredData.link.source[i]}, target=${filteredData.link.target[i]}`);
        // Corrigir índices inválidos
        filteredData.link.source[i] = Math.max(0, Math.min(nodeCount - 1, Math.floor(filteredData.link.source[i] || 0)));
        filteredData.link.target[i] = Math.max(0, Math.min(nodeCount - 1, Math.floor(filteredData.link.target[i] || 0)));
      }
      
      // Remover loops (source === target)
      if (filteredData.link.source[i] === filteredData.link.target[i]) {
        console.warn(`Loop encontrado no link ${i}: source=${filteredData.link.source[i]}, target=${filteredData.link.target[i]}`);
        // Ajustar o target para evitar o loop
        filteredData.link.target[i] = (filteredData.link.target[i] + 1) % nodeCount;
      }
    }    if (filter !== 'all') {
      // Filtrar os links com base no tipo
      const filteredLinks = yearData.link.customdata
        .map((type, i) => (type === filter || type === 'all') ? i : -1)
        .filter(i => i !== -1);
      
      // Se não há links após a filtragem, mantenha todos para evitar um diagrama vazio
      if (filteredLinks.length === 0) {
        console.warn(`Nenhum link encontrado para o filtro "${filter}". Mostrando todos os links.`);
      } else {
        filteredData.link.source = filteredLinks.map(i => yearData.link.source[i]);
        filteredData.link.target = filteredLinks.map(i => yearData.link.target[i]);
        filteredData.link.value = filteredLinks.map(i => yearData.link.value[i]);
        if (filteredData.link.label) {
          filteredData.link.label = filteredLinks.map(i => yearData.link.label[i]);
        }
        if (filteredData.link.color) {
          filteredData.link.color = filteredLinks.map(i => yearData.link.color[i]);
        }
        if (filteredData.link.customdata) {
          filteredData.link.customdata = filteredLinks.map(i => yearData.link.customdata[i]);
        }
      }
    }    // Definir fluxos importantes (os de maior valor)
    const importantFlows = [];
    if (showHighlightedFlows) {
      // Ordenar os índices dos fluxos por valor e pegar os 3 maiores
      const sortedIndices = [...filteredData.link.value.keys()]
        .sort((a, b) => filteredData.link.value[b] - filteredData.link.value[a])
        .slice(0, 3);
      importantFlows.push(...sortedIndices);
    }
    
    // Adicionar tooltip mais detalhado e garantir que nenhum link seja zero para evitar nós desconectados
    filteredData.link.hoverinfo = 'none';
    filteredData.link.hoverlabel = {
      bgcolor: 'rgba(0,0,0,0.8)',
      bordercolor: 'rgba(0,0,0,0)',
      font: { size: 14, color: 'white' }
    };
    
    // Aplicar a fase de animação, se especificada
    if (animPhase >= 0) {
      // Se estamos em uma fase de animação, ajustar os valores para mostrar fluxo progressivo
      const linkCount = filteredData.link.value.length;
      
      if (stepMode) {
        // No modo passo a passo, mostramos apenas um fluxo por vez
        // Array para guardar quais links devem ser mostrados
        const visibleLinks = Array(linkCount).fill(false);
        
        // Determinar qual link corresponde ao passo atual
        let stepIndex = currentStep;
        
        // Se temos filtro, precisamos mapear corretamente o índice do passo com os links filtrados
        if (currentFilter !== 'all') {
          let filteredIndex = 0;
          let foundIndex = -1;
          
          // Percorrer todos os links e encontrar o link correspondente ao passo atual
          for (let i = 0; i < yearData.link.customdata.length; i++) {
            const type = yearData.link.customdata[i];
            if (type === currentFilter || type === 'all') {
              if (filteredIndex === currentStep) {
                foundIndex = i;
                break;
              }
              filteredIndex++;
            }
          }
          
          // Se encontramos o índice correto, usamos ele
          if (foundIndex >= 0) {
            stepIndex = foundIndex;
          }
        }
        
        // Marcar apenas o link atual como visível
        if (stepIndex < visibleLinks.length) {
          visibleLinks[stepIndex] = true;
        }
        
        // Aplicar a visibilidade
        for (let i = 0; i < linkCount; i++) {
          if (!visibleLinks[i]) {
            filteredData.link.value[i] = 0.01; // Valor mínimo para manter a estrutura
          }
          // Se for visível, mantemos o valor original
        }
      } else {
        // Modo de animação normal
        const phaseStep = 100 / linkCount;
        
        // Adicionar efeito de pulso aos nós ativos durante a animação
        const activeNodes = new Set();
        for (let i = 0; i < linkCount; i++) {
          const linkVisible = (i * phaseStep) <= animPhase;
          // Se o link ainda não deve ser mostrado, defina seu valor como 0
          if (!linkVisible) {
            filteredData.link.value[i] = 0.01; // Valor mínimo para manter a estrutura
          } else {
            // Caso contrário, calcule o valor proporcional baseado na porcentagem da animação
            const linkProgress = Math.min(100, animPhase - (i * phaseStep)) / phaseStep;
            filteredData.link.value[i] = Math.max(0.01, filteredData.link.value[i] * linkProgress);
            
            // Marcar os nós de origem e destino como ativos
            activeNodes.add(filteredData.link.source[i]);
            activeNodes.add(filteredData.link.target[i]);
          }
        }
        
        // Adicionar efeito de nó ativo (cor de borda mais vibrante para nós ativos)
        if (filteredData.node.line) {
          filteredData.node.line.color = Array(nodeConfig.label.length).fill("#cccccc");
          activeNodes.forEach(nodeIndex => {
            if (filteredData.node.line && Array.isArray(filteredData.node.line.color)) {
              // Converter nodeIndex para number antes de usar como índice
              const index = Number(nodeIndex);
              if (!isNaN(index) && index >= 0 && index < filteredData.node.line.color.length) {
                filteredData.node.line.color[index] = "#ff9500"; // Cor laranja para nós ativos
              }
            }
          });
          
          // Aumentar a espessura da linha para nós ativos
          filteredData.node.line.width = Array(nodeConfig.label.length).fill(0.5);
          activeNodes.forEach(nodeIndex => {
            if (filteredData.node.line && Array.isArray(filteredData.node.line.width)) {
              // Converter nodeIndex para number antes de usar como índice
              const index = Number(nodeIndex);
              if (!isNaN(index) && index >= 0 && index < filteredData.node.line.width.length) {
                filteredData.node.line.width[index] = 2; // Linha mais grossa para nós ativos
              }
            }
          });
        }
      }
    }
    
    // Verificar se há valores zero após as filtragens e animações
    let hasLinks = false;
    for (let i = 0; i < filteredData.link.value.length; i++) {
      if (filteredData.link.value[i] > 0.01) {
        hasLinks = true;
        break;
      }
    }
    
    // Se todos os links estiverem com valor zero, definir um valor mínimo
    if (!hasLinks && filteredData.link.value.length > 0) {
      console.warn('Todos os links com valor zero detectados, adicionando um valor mínimo para garantir a renderização');
      filteredData.link.value[0] = 0.1;
    }
    
    // Destacar os fluxos importantes usando cores mais vivas
    if (showHighlightedFlows) {
      importantFlows.forEach((idx, i) => {
        const highlightColors = ["#FF5733", "#33FF57", "#3357FF"]; // cores vibrantes
        if (filteredData.link.value[idx] > 0) { // Só destacar se o fluxo estiver visível
          filteredData.link.color[idx] = highlightColors[i % highlightColors.length];
        }
      });
    }
    
    const yearNumber = parseInt(year);
    
    // Informações adicionais para o tooltip
    filteredData.link.customdata = filteredData.link.source.map((source: number, i: number) => {
      const target = filteredData.link.target[i];
      let prevYearData: any = null;
      
      // Obter dados do ano anterior para comparação (se não for 2020)
      if (yearNumber > 2020) {
        const prevYear = (yearNumber - 1).toString();
        if (prevYear in dataByYear) {
          const prevYearLinks = dataByYear[prevYear as keyof YearDataMap].link;
          // Encontrar o mesmo fluxo no ano anterior
          for (let j = 0; j < prevYearLinks.source.length; j++) {
            if (prevYearLinks.source[j] === source && prevYearLinks.target[j] === target) {
              prevYearData = prevYearLinks.value[j];
              break;
            }
          }
        }
      }
      
      // Calcular variação percentual
      let variation = 0;
      if (prevYearData !== null) {
        variation = ((filteredData.link.value[i] - prevYearData) / prevYearData) * 100;
      }
      
      // Retornar objeto de dados personalizados (será acessível na função de tooltip)
      return {
        from: nodeConfig.label[source],
        to: nodeConfig.label[target],
        value: filteredData.link.value[i],
        prevValue: prevYearData,
        variation: variation
      };
    });
    
    // Função personalizada para tooltip
    filteredData.link.hoverlabel = {};
    filteredData.link.hovertemplate = '<b>%{customdata.from} → %{customdata.to}</b><br>' +
                                     'Valor: R$ %{customdata.value} bilhões<br>' +
                                     '<i>%{customdata.variation:.1f}% em relação ao ano anterior</i>';
      // Detectar o tema atual (claro/escuro)
    const isDarkMode = document.documentElement.getAttribute('data-mode') === 'dark';
    
    const layout = {
      title: "",
      width: chartEl.offsetWidth,
      height: 600,
      font: { 
        size: 12,
        color: isDarkMode ? '#f8fafc' : '#0f172a'
      },
      paper_bgcolor: isDarkMode ? '#1e293b' : '#ffffff',
      plot_bgcolor: isDarkMode ? '#1e293b' : '#ffffff',
      updatemenus: [],
      hovermode: 'closest',
      // Configurações adicionais para melhorar a conectividade dos nós
      sankey: {
        node: {
          pad: 15,
          thickness: 20,
          line: {
            color: "black",
            width: 0.5
          }
        },
        link: {
          colorscale: 'YlGnBu'
        }
      }
    };    // Se for a primeira renderização ou não estamos animando, crie um novo plot
    if (animPhase === -1 || !isAnimating) {
      Plotly.newPlot(chartEl, [filteredData], layout, { 
        responsive: true,
        displayModeBar: false  // Remover a barra de ferramentas do Plotly
      })        .then(() => {
          // Adicionar eventos de interação para os links
          chartEl.addEventListener('plotly_click', function(data: any) {
            // Se clicou em um link do Sankey
            if (data.points && data.points[0].link) {
              const linkIndex = data.points[0].pointNumber;
              const sourceIndex = filteredData.link.source[linkIndex];
              const targetIndex = filteredData.link.target[linkIndex];
              const value = filteredData.link.value[linkIndex];
              
              // Atualizar o estado do flow selecionado
              selectedFlow = {
                source: sourceIndex,
                target: targetIndex,
                value: value,
                sourceNode: nodeConfig.label[sourceIndex],
                targetNode: nodeConfig.label[targetIndex],
                year: currentYear
              };
              
              // Mostrar detalhes adicionais sobre o fluxo selecionado
              // Por exemplo, poderíamos destacar apenas este fluxo
              const selectedLinkData = JSON.parse(JSON.stringify(filteredData));
              for (let i = 0; i < selectedLinkData.link.value.length; i++) {
                if (i !== linkIndex) {
                  // Reduzir a opacidade dos outros fluxos
                  selectedLinkData.link.color[i] = selectedLinkData.link.color[i].replace('rgb', 'rgba').replace(')', ', 0.2)');
                }
              }
              
              Plotly.animate(chartEl, {
                data: [{ link: selectedLinkData.link }],
                traces: [0],
                layout: {}
              }, {
                transition: { duration: 300, easing: 'cubic-in-out' },
                frame: { duration: 300 }
              });
              
              // Restaurar após um tempo
              setTimeout(() => {
                Plotly.animate(chartEl, {
                  data: [{ link: filteredData.link }],
                  traces: [0],
                  layout: {}
                }, {
                  transition: { duration: 300, easing: 'cubic-in-out' },
                  frame: { duration: 300 }
                });
              }, 3000); // Aumentando para 3 segundos para dar mais tempo de leitura
            }
          });
          
          // Adicionar evento de hover para mostrar temporariamente informações sobre o fluxo
          chartEl.addEventListener('plotly_hover', function(data: any) {
            if (data.points && data.points[0].link) {
              const linkIndex = data.points[0].pointNumber;
              const sourceIndex = filteredData.link.source[linkIndex];
              const targetIndex = filteredData.link.target[linkIndex];
              const value = filteredData.link.value[linkIndex];
              
              // Destacar o link sob o mouse
              const hoverLinkData = JSON.parse(JSON.stringify(filteredData));
              for (let i = 0; i < hoverLinkData.link.value.length; i++) {
                if (i !== linkIndex) {
                  // Reduzir a opacidade dos outros fluxos
                  hoverLinkData.link.color[i] = hoverLinkData.link.color[i].replace('rgb', 'rgba').replace(')', ', 0.3)');
                } else {
                  // Aumentar a largura do fluxo sob o mouse
                  hoverLinkData.link.value[i] = hoverLinkData.link.value[i] * 1.1;
                  
                  // Mostrar informação temporária sobre o fluxo
                  const hoverInfo = document.createElement('div');
                  hoverInfo.id = 'flow-hover-info';
                  hoverInfo.style.position = 'absolute';
                  // Access the event object directly from the Plotly hover event
                  const evt = data.event as MouseEvent || (data as any).points[0].event as MouseEvent;
                  hoverInfo.style.left = `${evt.clientX + 10}px`;
                  hoverInfo.style.top = `${evt.clientY + 10}px`;
                  hoverInfo.style.padding = '8px 12px';
                  hoverInfo.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
                  hoverInfo.style.color = 'white';
                  hoverInfo.style.borderRadius = '4px';
                  hoverInfo.style.fontSize = '13px';
                  hoverInfo.style.zIndex = '1000';
                  hoverInfo.style.pointerEvents = 'none';
                  hoverInfo.innerHTML = `
                    <strong>${nodeConfig.label[sourceIndex]} → ${nodeConfig.label[targetIndex]}</strong><br>
                    Valor: R$ ${value} bilhões<br>
                    <small>Clique para detalhes</small>
                  `;
                  
                  // Remover qualquer dica anterior
                  const oldInfo = document.getElementById('flow-hover-info');
                  if (oldInfo) oldInfo.remove();
                  
                  document.body.appendChild(hoverInfo);
                }
              }
              
              Plotly.animate(chartEl, {
                data: [{ link: hoverLinkData.link }],
                traces: [0],
                layout: {}
              }, {
                transition: { duration: 50, easing: 'cubic-in-out' },
                frame: { duration: 50 }
              });
            }
          });
          
          // Restaurar o gráfico original ao sair do hover
          chartEl.addEventListener('plotly_unhover', function() {
            Plotly.animate(chartEl, {
              data: [{ link: filteredData.link }],
              traces: [0],
              layout: {}
            }, {
              transition: { duration: 100, easing: 'cubic-in-out' },
              frame: { duration: 100 }
            });
            
            // Remover a dica
            const hoverInfo = document.getElementById('flow-hover-info');
            if (hoverInfo) hoverInfo.remove();
          });
        });
    } else {
      // Caso contrário, anime a transição
      Plotly.animate(chartEl, {
        data: [{ link: filteredData.link }],
        traces: [0],
        layout: {}
      }, {
        transition: { duration: animationSpeed / 10, easing: 'cubic-in-out' },
        frame: { duration: animationSpeed / 10 }
      });
    }
  }  // Função para iniciar a animação do fluxo de dinheiro
  function startAnimation() {
    // Primeiro, garantir que qualquer animação anterior seja interrompida
    stopAnimation(); 
    
    // Definir o estado de animação
    isAnimating = true;
    animationProgress = 0;
    
    // Resetar o passo atual se estiver no modo passo a passo
    if (stepMode) {
      currentStep = 0;
      renderSankey(currentYear, currentFilter, 0);
      return; // No modo passo a passo, não usamos o intervalo de animação automática
    }
    
    // Renderizar o gráfico inicial com valores zerados
    renderSankey(currentYear, currentFilter, 0);
    
    // Usar requestAnimationFrame para animações mais suaves e com melhor controle
    let lastTimestamp = 0;
    
    function animationFrame(timestamp: number) {
      if (!isAnimating) {
        // Se a animação foi parada, não continuar
        if (animationFrameId !== null) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
        return;
      }
      
      // Controlar a velocidade da animação
      if (lastTimestamp === 0 || timestamp - lastTimestamp > 100) {
        lastTimestamp = timestamp;
        
        // Incremento lento para permitir melhor compreensão
        animationProgress += 0.2;
        
        if (animationProgress >= 100) {
          // Animação concluída
          isAnimating = false;
          animationFrameId = null;
          // Renderizar o gráfico final
          renderSankey(currentYear, currentFilter);
        } else {
          // Renderizar o próximo quadro da animação
          renderSankey(currentYear, currentFilter, animationProgress);
        }
      }
      
      // Continuar a animação se ainda estiver ativa
      if (isAnimating) {
        animationFrameId = requestAnimationFrame(animationFrame);
      }
    }
    
    // Iniciar loop de animação
    animationFrameId = requestAnimationFrame(animationFrame);
  }  // Função para parar a animação
  function stopAnimation() {
    // Cancelar o intervalo, se existir
    if (animationInterval) {
      clearInterval(animationInterval);
      animationInterval = null;
    }
    
    // Cancelar qualquer animation frame pendente
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
    
    // Atualizar estado
    isAnimating = false;
    
    // Renderizar o gráfico final quando parar a animação
    renderSankey(currentYear, currentFilter, -1); // -1 indica renderização completa
  }
  
  // Função para reiniciar a animação
  function resetAnimation() {
    stopAnimation();
    animationProgress = 0;
    currentStep = 0;
    renderSankey(currentYear, currentFilter);
  }
  // Função para avançar um passo no modo passo a passo
  function nextStep() {
    // Desativar botão para evitar cliques rápidos
    const nextStepButton = document.querySelector('.next-step-button') as HTMLButtonElement;
    if (nextStepButton) {
      nextStepButton.disabled = true;
      setTimeout(() => {
        nextStepButton.disabled = false;
      }, 1000);
    }
    
    if (!isAnimating) {
      // Iniciar o modo passo a passo se não estiver ativo
      isAnimating = true;
      stepMode = true;
      currentStep = 0;
    } else {
      // Avançar para o próximo passo
      const yearData = dataByYear[currentYear as keyof YearDataMap];
      let linkCount = 0;
      
      // Contar apenas os links válidos (que têm valor > 0)
      if (currentFilter === 'all') {
        linkCount = yearData.link.value.length;
      } else {
        // Se houver filtro, contar apenas os links relevantes
        linkCount = yearData.link.customdata.filter(
          type => type === currentFilter || type === 'all'
        ).length;
      }
      
      // Garantir que estamos dentro dos limites
      if (linkCount > 0) {
        currentStep = (currentStep + 1) % linkCount;
      } else {
        currentStep = 0;
      }
    }
    
    // Renderizar o passo atual com uma pequena animação
    // Primeiro ocultar todos os fluxos
    renderSankey(currentYear, currentFilter, 0);
    
    // Depois de um breve atraso, mostrar o fluxo atual
    setTimeout(() => {
      renderSankey(currentYear, currentFilter, 0);
    }, 300);
  }
  
  // Função para alternar o destaque dos fluxos importantes
  function toggleHighlightedFlows() {
    showHighlightedFlows = !showHighlightedFlows;
    renderSankey(currentYear, currentFilter, isAnimating ? animationProgress : -1);
  }
  
  // Função para alternar entre modo normal e passo a passo
  function toggleStepMode() {
    stepMode = !stepMode;
    resetAnimation();
  }
    // Função para ajustar a velocidade da animação
  function handleSpeedChange(event: Event) {
    // Valor direto do slider (maior = mais lento)
    animationSpeed = parseInt((event.target as HTMLInputElement).value);
    
    // Se a animação estiver em andamento, atualizamos o intervalo
    if (isAnimating && animationInterval) {
      stopAnimation();
      startAnimation();
    }
  }

  // Função para lidar com mudanças no filtro
  function handleFilterChange(newFilter: string) {
    stopAnimation(); // Parar qualquer animação em andamento
    currentFilter = newFilter;
    renderSankey(currentYear, currentFilter);
  }
  // Função para lidar com mudanças no ano
  function handleYearChange(event: Event) {
    stopAnimation(); // Parar qualquer animação em andamento
    currentYear = (event.target as HTMLInputElement).value;
    renderSankey(currentYear, currentFilter);
  }
  // Inicialização e limpeza
  onMount(() => {
    // Carregar dados reais de APIs
    loadRealData();
    
    // Função para reajustar o gráfico quando a janela for redimensionada
    const handleResize = () => {
      renderSankey(currentYear, currentFilter);
    };
    
    // Observe mudanças no tema (claro/escuro)
    const themeObserver = new MutationObserver(() => {
      renderSankey(currentYear, currentFilter);
    });
    
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-mode']
    });
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      themeObserver.disconnect();
    };
  });

  onDestroy(() => {
    stopAnimation(); // Garantir que a animação seja interrompida
    if (chartEl) {
      Plotly.purge(chartEl);
    }
  });
</script>

<div class="moneyflow-wrapper">
  <div class="slider-container">
    <label for="yearSlider" class="text-lg">{$_('moneyflow.year')}:</label>
    <input type="range" id="yearSlider" min="2020" max="2025" value={currentYear} on:input={handleYearChange} class="w-64">
    <span id="yearLabel" class="text-lg">{currentYear}</span>
  </div>  <div class="flex flex-wrap gap-4 mb-4">
    <button on:click={() => handleFilterChange('all')} 
            class="btn variant-filled-primary">{$_('moneyflow.filter.all')}</button>
    <button on:click={() => handleFilterChange('physical')} 
            class="btn variant-filled-success">{$_('moneyflow.filter.physical')}</button>
    <button on:click={() => handleFilterChange('electronic')} 
            class="btn variant-filled-secondary">{$_('moneyflow.filter.electronic')}</button>
            
    <div class="flex-grow"></div>
      <div class="flex items-center gap-2 p-2 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-600">
      <Rewind size={18} class="text-slate-600 dark:text-slate-300" />
      <span class="whitespace-nowrap text-sm">{$_('moneyflow.animation.speed')}:</span>
      <input 
        type="range" 
        min="1000" 
        max="5000" 
        step="500"
        value={animationSpeed} 
        on:input={handleSpeedChange} 
        class="w-32"
        disabled={isAnimating && !stepMode}
        title="Velocidade da animação"
      >
      <FastForward size={18} class="text-slate-600 dark:text-slate-300" />
      <span class="text-xs whitespace-nowrap">
        {animationSpeed <= 1000 ? 'Rápido' : (animationSpeed >= 4000 ? 'Lento' : 'Médio')}
      </span>
    </div>
  </div>
    <div class="flex flex-wrap gap-2 mb-4">    <button 
      on:click={stepMode ? nextStep : (isAnimating ? stopAnimation : startAnimation)} 
      class="btn {isAnimating ? 'variant-filled-error' : 'variant-filled-warning'} flex items-center gap-2 next-step-button"
      aria-label={stepMode ? $_('moneyflow.animation.next_step') : (isAnimating ? $_('moneyflow.animation.stop') : $_('moneyflow.animation.play'))}
    >
      {#if stepMode}
        <StepForward size={18} />
        <span class="text-sm md:text-base">{$_('moneyflow.animation.next_step')}</span>
      {:else if isAnimating}
        <Pause size={18} />
        <span class="text-sm md:text-base">{$_('moneyflow.animation.stop')}</span>
      {:else}
        <Play size={18} />
        <span class="text-sm md:text-base">{$_('moneyflow.animation.play')}</span>
      {/if}
    </button>
    
    <button
      on:click={resetAnimation}
      class="btn variant-filled flex items-center gap-2"
      aria-label={$_('moneyflow.animation.reset')}
      disabled={!isAnimating && animationProgress === 0}
    >
      <RotateCcw size={18} />
      <span class="text-sm md:text-base">{$_('moneyflow.animation.reset')}</span>
    </button>
    
    <button
      on:click={toggleStepMode}
      class="btn {stepMode ? 'variant-filled-secondary' : 'variant-ghost-secondary'} flex items-center gap-2"
      aria-label={$_('moneyflow.animation.step_mode')}
    >
      <StepForward size={18} />
      <span class="text-sm md:text-base">{$_('moneyflow.animation.step_mode')}</span>
    </button>
    
    <button
      on:click={toggleHighlightedFlows}
      class="btn {showHighlightedFlows ? 'variant-filled-tertiary' : 'variant-ghost-tertiary'} flex items-center gap-2"
      aria-label={$_('moneyflow.animation.highlight')}
    >
      <span class="text-sm md:text-base">{$_('moneyflow.animation.highlight')}</span>
    </button>
  </div>  {#if isAnimating && !stepMode}
    <div class="progress-container mb-4">
      <div class="progress-bar">
        <div class="progress-fill" style="width: {animationProgress}%"></div>
      </div>
      <div class="progress-text text-center mt-1 text-sm">
        Animação em andamento: {Math.round(animationProgress)}%
      </div>
      
      <div class="mt-3 p-3 bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600">
        <p class="text-sm text-slate-700 dark:text-slate-200">
          {(() => {
            // Dividir a animação em fases e mostrar uma descrição para cada fase
            if (animationProgress < 20) {
              return "Fase 1: O ciclo começa com a criação de dinheiro através do Banco Central e Casa da Moeda. Observe como o dinheiro flui do sistema bancário central para os bancos comerciais, tanto na forma física quanto eletrônica.";
            } else if (animationProgress < 40) {
              return "Fase 2: Os bancos comerciais distribuem dinheiro para as pessoas através de salários, empréstimos e outros serviços bancários. Este é um dos principais meios pelos quais o dinheiro entra na economia real.";
            } else if (animationProgress < 60) {
              return "Fase 3: As pessoas utilizam seu dinheiro para consumo, movimentando o comércio e as empresas. Ao mesmo tempo, tanto cidadãos quanto empresas pagam impostos que serão destinados ao governo.";
            } else if (animationProgress < 80) {
              return "Fase 4: O governo utiliza a arrecadação de impostos para fornecer serviços públicos, pagar benefícios sociais e investir em infraestrutura. Esse dinheiro retorna à economia através de contratos, salários e benefícios.";
            } else {
              return "Fase 5: Completando o ciclo, observamos também fluxos relacionados ao comércio exterior (importações e exportações) e ao mercado financeiro, que são vitais para a estabilidade e crescimento econômico do país.";
            }
          })()}
        </p>
      </div>
    </div>
  {/if}
    {#if stepMode}
    <div class="step-indicator mb-4 p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800">
      <div class="flex items-center justify-between">
        <span class="font-medium">Passo: {currentStep + 1}/{
          currentFilter === 'all' 
            ? dataByYear[currentYear as keyof YearDataMap].link.value.length 
            : dataByYear[currentYear as keyof YearDataMap].link.customdata.filter(
                type => type === currentFilter || type === 'all'
              ).length
        }</span>
        <span class="text-sm font-medium text-blue-600 dark:text-blue-400">
          {#if currentStep < dataByYear[currentYear as keyof YearDataMap].link.label.length}
            {(() => {
              // Encontrar o rótulo para o passo atual
              if (currentFilter === 'all') {
                return dataByYear[currentYear as keyof YearDataMap].link.label[currentStep];
              } else {
                // Encontrar o índice correto para o filtro atual
                let filteredIndex = 0;
                let foundIndex = -1;
                
                for (let i = 0; i < dataByYear[currentYear as keyof YearDataMap].link.customdata.length; i++) {
                  const type = dataByYear[currentYear as keyof YearDataMap].link.customdata[i];
                  if (type === currentFilter || type === 'all') {
                    if (filteredIndex === currentStep) {
                      foundIndex = i;
                      break;
                    }
                    filteredIndex++;
                  }
                }
                
                return foundIndex >= 0
                  ? dataByYear[currentYear as keyof YearDataMap].link.label[foundIndex]
                  : 'Fluxo desconhecido';
              }
            })()}
          {/if}
        </span>
      </div>
      
      <div class="mt-3 p-3 bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600">
        <p class="text-sm text-slate-700 dark:text-slate-200">
          {#if currentStep < dataByYear[currentYear as keyof YearDataMap].link.source.length}
            {(() => {
              // Obter source e target atuais
              let source, target;
              
              if (currentFilter === 'all') {
                source = dataByYear[currentYear as keyof YearDataMap].link.source[currentStep];
                target = dataByYear[currentYear as keyof YearDataMap].link.target[currentStep];
              } else {
                // Encontrar o índice correto para o filtro atual
                let filteredIndex = 0;
                let foundIndex = -1;
                
                for (let i = 0; i < dataByYear[currentYear as keyof YearDataMap].link.customdata.length; i++) {
                  const type = dataByYear[currentYear as keyof YearDataMap].link.customdata[i];
                  if (type === currentFilter || type === 'all') {
                    if (filteredIndex === currentStep) {
                      foundIndex = i;
                      break;
                    }
                    filteredIndex++;
                  }
                }
                
                if (foundIndex >= 0) {
                  source = dataByYear[currentYear as keyof YearDataMap].link.source[foundIndex];
                  target = dataByYear[currentYear as keyof YearDataMap].link.target[foundIndex];
                }
              }
              
              // Retornar a descrição baseada na combinação de source/target
              if (source === 0 && target === 1) {
                return "O Banco Central autoriza a Casa da Moeda a produzir dinheiro físico (cédulas e moedas). Este é o início do ciclo do dinheiro físico no sistema.";
              } else if (source === 1 && target === 2) {
                return "A Casa da Moeda distribui o dinheiro físico recém-produzido para os bancos comerciais, que então o disponibilizam para o público através de saques e operações bancárias.";
              } else if (source === 0 && target === 2) {
                return "O Banco Central injeta dinheiro no sistema bancário de forma eletrônica, através de operações como redesconto, compra de títulos e empréstimos aos bancos comerciais.";
              } else if (source === 2 && target === 3) {
                return "Os bancos comerciais realizam pagamentos de salários aos indivíduos, incluindo trabalhadores do setor privado e público. Este fluxo representa a renda do trabalho.";
              } else if (source === 3 && target === 4) {
                return "As pessoas usam seu dinheiro para consumo, comprando bens e serviços de empresas e comércios. Este fluxo representa a maior parte do PIB e movimenta a economia.";
              } else if (source === 4 && target === 5) {
                return "O comércio paga impostos sobre suas vendas e lucros para a Receita Federal, como ICMS, ISS, PIS/COFINS e outros tributos sobre consumo e atividade comercial.";
              } else if (source === 3 && target === 5) {
                return "As pessoas pagam impostos sobre sua renda e patrimônio para a Receita Federal, como Imposto de Renda (IR), IPTU, IPVA e contribuições sociais.";
              } else if (source === 5 && target === 6) {
                return "A Receita Federal transfere a arrecadação de impostos para o Governo, que utilizará estes recursos para financiar políticas públicas, investimentos e manutenção da máquina estatal.";
              } else if (source === 6 && target === 3) {
                return "O Governo realiza pagamentos de benefícios sociais às pessoas, como aposentadorias, Bolsa Família, seguro-desemprego e outros programas de assistência social.";
              } else if (source === 6 && target === 4) {
                return "O Governo contrata serviços e compra produtos do comércio e empresas, através de licitações e contratos públicos, para manter seu funcionamento e realizar investimentos.";
              } else if (source === 4 && target === 7) {
                return "Empresas brasileiras exportam produtos e serviços para outros países, gerando entrada de moeda estrangeira que fortalece a balança comercial e as reservas do país.";
              } else if (source === 7 && target === 2) {
                return "O país importa produtos e serviços do exterior, o que representa saída de moeda nacional. Os bancos comerciais intermediam estas transações internacionais.";
              } else if (source === 2 && target === 8) {
                return "Os bancos comerciais realizam operações no mercado financeiro, como investimentos, compra e venda de títulos, e empréstimos para instituições financeiras.";
              } else if (source === 0 && target === 8) {
                return "O Banco Central emite títulos da dívida pública para o mercado financeiro, como forma de controlar a liquidez da economia e financiar o deficit público.";
              } else {
                return "Este fluxo representa a movimentação de recursos entre diferentes setores da economia, contribuindo para o ciclo econômico e financeiro do país.";
              }
            })()}
          {/if}
        </p>
      </div>
      
      <div class="mt-2 text-xs text-slate-600 dark:text-slate-300">
        Clique no botão "Próximo Passo" para avançar na animação passo a passo.
      </div>
    </div>
  {/if}
    {#if isLoading}
    <div class="loading-state p-4 rounded-lg bg-blue-50 dark:bg-blue-900 text-blue-800 dark:text-blue-100 shadow">
      <svg class="animate-spin h-5 w-5 mr-3 inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8l6 3.6A10 10 0 004 12z"></path>
      </svg>
      Carregando dados do fluxo de dinheiro...
    </div>
  {:else if errorMsg}
    <div class="error-state p-4 rounded-lg bg-red-50 dark:bg-red-900 text-red-800 dark:text-red-100 shadow">
      <svg class="h-5 w-5 mr-3 inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <path stroke="currentColor" stroke-width="2" d="M12 2v10m0 0l3 3m-3-3l-3 3m9-9H3m18 0h-6"></path>
      </svg>
      Ocorreu um erro ao carregar os dados do fluxo de dinheiro. Tente novamente mais tarde.
    </div>
  {/if}
    <div bind:this={chartEl} class="chart bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
    {#if isLoading}
      <div class="flex flex-col items-center justify-center h-full">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p class="mt-4 text-slate-600 dark:text-slate-300">Carregando dados financeiros...</p>
      </div>
    {/if}
    
    {#if errorMsg}
      <div class="p-3 bg-red-50 dark:bg-red-900 text-red-800 dark:text-red-100 rounded-lg shadow mt-2">
        <p>{errorMsg}</p>
      </div>
    {/if}
  </div>    <div class="instruction-panel mt-4 p-3 bg-blue-50 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-lg shadow">
    <h3 class="font-medium text-lg mb-2">Como utilizar esta visualização:</h3>
    <ul class="list-disc pl-5 text-sm space-y-1">
      <li><strong>Velocidade da animação:</strong> A animação está configurada para ser mais lenta, permitindo que você compreenda cada fluxo.</li>
      <li><strong>Modo passo a passo:</strong> Use para visualizar cada fluxo individualmente e entender melhor cada transação.</li>
      <li><strong>Dica:</strong> Passe o mouse sobre os fluxos durante a animação para ver informações detalhadas.</li>
      <li><strong>Botão reiniciar:</strong> Caso a animação apresente algum problema, use o botão reiniciar.</li>
    </ul>
    
    <h3 class="font-medium text-lg mt-3 mb-2">Sobre os dados:</h3>
    <ul class="list-disc pl-5 text-sm space-y-1">
      <li><strong>Dados reais:</strong> Os valores apresentados são baseados em dados reais de fontes como Banco Central, Tesouro Nacional e órgãos internacionais.</li>
      <li><strong>Simplificação:</strong> Alguns fluxos foram simplificados para facilitar a visualização e compreensão.</li>
      <li><strong>Projeções:</strong> Para anos futuros (2024-2025), são utilizadas projeções baseadas em tendências históricas.</li>
      <li><strong>Fontes:</strong> PIB, comércio exterior, taxa de câmbio, arrecadação e base monetária.</li>
    </ul>
  </div>
  <div class="legend mt-4">
    {#each legendItems as item}
      <div class="legend-item">
        <div class="legend-color" style="background-color: {item.color};"></div>
        <span>{item.label}</span>
      </div>
    {/each}
  </div>
    {#if !isLoading && Object.keys(dataByYear).length > 0}
    <!-- Gráfico de tendências ao longo dos anos -->
    <TrendChart dataByYear={dataByYear} nodeLabels={nodeConfig.label} />
    
    <!-- Explicação do fluxo selecionado, se houver -->
    {#if selectedFlow}
      <FlowExplanation flowData={selectedFlow} />
    {/if}
  {/if}
  
  <!-- Componente de fontes de dados -->
  <DataSources />
</div>

<style>
  .moneyflow-wrapper {
    max-width: 1000px;
    margin: 0 auto;
  }
  
  .chart {
    width: 100%;
    height: 600px;
  }
  
  .slider-container {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
  }
  
  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-top: 1rem;
  }
  
  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .legend-color {
    width: 20px;
    height: 20px;
    border-radius: 4px;
  }
    .progress-bar {
    width: 100%;
    height: 12px;
    background-color: #e2e8f0;
    border-radius: 6px;
    overflow: hidden;
    box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
  }
  
  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%);
    transition: width 0.3s ease-out;
    box-shadow: 0 0 5px rgba(59, 130, 246, 0.5);
  }
  
  .progress-container {
    padding: 8px;
    background-color: #f8fafc;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
  }
  
  :global([data-mode="dark"]) .progress-container {
    background-color: #1e293b;
    border-color: #334155;
  }
  
  :global([data-mode="dark"]) .progress-bar {
    background-color: #334155;
  }
  
  :global([data-mode="dark"]) .progress-fill {
    background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%);
  }
  
  .step-indicator {
    transition: all 0.3s ease;
  }
  
  .step-indicator:hover {
    box-shadow: 0 0 10px rgba(59, 130, 246, 0.3);
  }
  
  .loading-state, .error-state {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 1rem;
    padding: 1rem;
    border-radius: 0.5rem;
  }
  
  .loading-state {
    background-color: #eff6ff;
    color: #1e40af;
  }
  
  .error-state {
    background-color: #fee2e2;
    color: #b91c1c;
  }
</style>
