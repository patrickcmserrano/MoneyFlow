<script lang="ts">
  import { onMount } from 'svelte';
  import Plotly, { Layout } from 'plotly.js-dist';
  import { _ } from '../lib/i18n';

  // Props
  export let dataByYear: any;
  export const nodeLabels: string[] = [];
  
  // Estado local
  let chartEl: HTMLElement;
  let selectedMetric = 'total';
  
  // Métricas disponíveis para visualização
  const metrics = [
    { id: 'total', label: 'Fluxo Total', description: 'Volume total de dinheiro movimentado no sistema' },
    { id: 'government', label: 'Arrecadação Governamental', description: 'Total de impostos e taxas arrecadados' },
    { id: 'commerce', label: 'Atividade Comercial', description: 'Consumo e transações comerciais' },
    { id: 'electronic', label: 'Dinheiro Eletrônico', description: 'Proporção de transações eletrônicas vs. físicas' },
    { id: 'external', label: 'Comércio Exterior', description: 'Exportações e importações' }
  ];

  // Função para obter dados da métrica selecionada por ano
  function getMetricData(metricId: string) {
    const years = Object.keys(dataByYear).sort();
    const values = [];
    const additionalSeries: { [key: string]: number[] } = {};
    
    // Para cada ano, calcular o valor da métrica
    for (const year of years) {
      const yearData = dataByYear[year];
      
      if (!yearData || !yearData.link || !yearData.link.value) continue;
      
      let value = 0;
      const linkData = yearData.link;
      
      switch(metricId) {
        case 'total':
          // Soma total de todos os fluxos
          value = linkData.value.reduce((sum: number, v: number) => sum + v, 0);
          break;
          
        case 'government':
          // Fluxos relacionados ao governo (índices 5-9 nos sources/targets)
          // Receita Federal (5) -> Governo (6)
          value = linkData.value.reduce((sum: number, v: number, i: number) => {
            if ((linkData.source[i] === 5 && linkData.target[i] === 6) ||
                (linkData.source[i] === 4 && linkData.target[i] === 5) ||
                (linkData.source[i] === 3 && linkData.target[i] === 5)) {
              return sum + v;
            }
            return sum;
          }, 0);
          
          // Adicionar séries adicionais para detalhar fontes de arrecadação
          if (!additionalSeries['impostoConsumo']) additionalSeries['impostoConsumo'] = [];
          if (!additionalSeries['impostoRenda']) additionalSeries['impostoRenda'] = [];
          
          additionalSeries['impostoConsumo'].push(
            linkData.value.reduce((sum: number, v: number, i: number) => {
              if (linkData.source[i] === 4 && linkData.target[i] === 5) {
                return sum + v;
              }
              return sum;
            }, 0)
          );
          
          additionalSeries['impostoRenda'].push(
            linkData.value.reduce((sum: number, v: number, i: number) => {
              if (linkData.source[i] === 3 && linkData.target[i] === 5) {
                return sum + v;
              }
              return sum;
            }, 0)
          );
          break;
          
        case 'commerce':
          // Fluxos relacionados a comércio (4) como destino
          value = linkData.value.reduce((sum: number, v: number, i: number) => {
            if (linkData.target[i] === 4) {
              return sum + v;
            }
            return sum;
          }, 0);
          
          // Adicionar séries para consumo e contratos governamentais
          if (!additionalSeries['consumo']) additionalSeries['consumo'] = [];
          if (!additionalSeries['contratos']) additionalSeries['contratos'] = [];
          
          additionalSeries['consumo'].push(
            linkData.value.reduce((sum: number, v: number, i: number) => {
              if (linkData.source[i] === 3 && linkData.target[i] === 4) {
                return sum + v;
              }
              return sum;
            }, 0)
          );
          
          additionalSeries['contratos'].push(
            linkData.value.reduce((sum: number, v: number, i: number) => {
              if (linkData.source[i] === 6 && linkData.target[i] === 4) {
                return sum + v;
              }
              return sum;
            }, 0)
          );
          break;
          
        case 'electronic':
          // Fluxos eletrônicos vs. físicos
          // Calcular total de fluxos eletrônicos
          const electronicValue = linkData.value.reduce((sum: number, v: number, i: number) => {
            if (linkData.customdata[i] === 'electronic') {
              return sum + v;
            }
            return sum;
          }, 0);
          
          // Calcular total de fluxos físicos
          const physicalValue = linkData.value.reduce((sum: number, v: number, i: number) => {
            if (linkData.customdata[i] === 'physical') {
              return sum + v;
            }
            return sum;
          }, 0);
          
          // Valor principal: proporção eletrônico/físico
          value = electronicValue;
          
          // Séries adicionais
          if (!additionalSeries['fisico']) additionalSeries['fisico'] = [];
          additionalSeries['fisico'].push(physicalValue);
          break;
          
        case 'external':
          // Comércio exterior (exportações e importações)
          // Exportações: Comércio (4) -> Mercado Externo (7)
          // Importações: Mercado Externo (7) -> Bancos (2)
          const exports = linkData.value.reduce((sum: number, v: number, i: number) => {
            if (linkData.source[i] === 4 && linkData.target[i] === 7) {
              return sum + v;
            }
            return sum;
          }, 0);
          
          const imports = linkData.value.reduce((sum: number, v: number, i: number) => {
            if (linkData.source[i] === 7 && linkData.target[i] === 2) {
              return sum + v;
            }
            return sum;
          }, 0);
          
          // Valor principal: saldo comercial (exportações - importações)
          value = exports - imports;
          
          // Séries adicionais
          if (!additionalSeries['exportacoes']) additionalSeries['exportacoes'] = [];
          if (!additionalSeries['importacoes']) additionalSeries['importacoes'] = [];
          
          additionalSeries['exportacoes'].push(exports);
          additionalSeries['importacoes'].push(imports);
          break;
          
        default:
          value = 0;
      }
      
      values.push(value);
    }
    
    return { years, values, additionalSeries };
  }

  // Função para renderizar o gráfico de tendências
  function renderTrendChart() {
    if (!chartEl) return;
    
    const { years, values, additionalSeries } = getMetricData(selectedMetric);
    
    // Configurar séries de dados para o gráfico
    const traces = [];
    
    // Série principal
    traces.push({
      x: years,
      y: values,
      type: 'scatter',
      mode: 'lines+markers',
      name: metrics.find(m => m.id === selectedMetric)?.label || 'Valor',
      line: {
        color: '#3b82f6',
        width: 3
      },
      marker: {
        size: 8,
        color: '#2563eb'
      }
    });
    
    // Séries adicionais (se houver)
    const colors = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    const labels: { [key: string]: string } = {
      'impostoConsumo': 'Imposto sobre Consumo',
      'impostoRenda': 'Imposto sobre Renda',
      'consumo': 'Consumo',
      'contratos': 'Contratos Governamentais',
      'fisico': 'Dinheiro Físico',
      'exportacoes': 'Exportações',
      'importacoes': 'Importações'
    };
    
    let colorIndex = 0;
    for (const [key, data] of Object.entries(additionalSeries)) {
      traces.push({
        x: years,
        y: data,
        type: 'scatter',
        mode: 'lines+markers',
        name: labels[key] || key,
        line: {
          color: colors[colorIndex % colors.length],
          width: 2,
          dash: 'dot'
        },
        marker: {
          size: 6,
          color: colors[colorIndex % colors.length]
        }
      });
      colorIndex++;
    }
    
    // Detectar o tema atual (claro/escuro)
    // Detectar o tema atual (claro/escuro)
    const isDarkMode = document.documentElement.getAttribute('data-mode') === 'dark';
    
    const layout: Partial<Layout> = {
      width: chartEl.offsetWidth,
      height: 400,
      margin: { l: 50, r: 30, t: 80, b: 50 },
      font: { 
        size: 12,
        color: isDarkMode ? '#f8fafc' : '#0f172a'
      },
      paper_bgcolor: isDarkMode ? '#1e293b' : '#ffffff',
      plot_bgcolor: isDarkMode ? '#1e293b' : '#ffffff',
      xaxis: {
        title: 'Ano',
        tickmode: 'array',
        tickvals: years,
        ticktext: years,
        gridcolor: isDarkMode ? '#334155' : '#e2e8f0'
      },
      yaxis: {
        title: 'Valor (R$ bilhões)',
        gridcolor: isDarkMode ? '#334155' : '#e2e8f0'
      },
      legend: {
        orientation: 'h',
        y: 1.1,
        bgcolor: isDarkMode ? '#1e293b' : '#ffffff',
      },
      annotations: [
        {
          x: 0,
          y: 1.12,
          xref: 'paper',
          yref: 'paper',
          text: `<span style="font-size: 0.8em; color: ${isDarkMode ? '#94a3b8' : '#64748b'};">
                  ${metrics.find(m => m.id === selectedMetric)?.description}
                </span>`,
          showarrow: false,
          align: 'left',
        }
      ],
      shapes: []
    };
    
    // Adicionar linha de previsão após 2023
    if (years.includes('2024')) {
      layout.shapes.push({
        type: 'line',
        x0: '2023',
        x1: '2023',
        y0: 0,
        y1: 1,
        yref: 'paper',
        line: {
          color: isDarkMode ? '#94a3b8' : '#64748b',
          width: 1,
          dash: 'dash'
        }
      });
      
      layout.annotations.push({
        x: '2024',
        y: Math.max(...values) * 0.95,
        text: 'Projeção',
        showarrow: false,
        font: {
          color: isDarkMode ? '#94a3b8' : '#64748b',
          size: 10
        }
      });
    }
    
    Plotly.newPlot(chartEl, traces, layout, { 
      responsive: true,
      displayModeBar: false
    });
  }

  // Atualizar gráfico quando a métrica mudar
  function handleMetricChange(event: Event) {
    selectedMetric = (event.target as HTMLSelectElement).value;
    renderTrendChart();
  }

  // Inicializar o gráfico quando o componente for montado
  onMount(() => {
    if (Object.keys(dataByYear).length > 0) {
      renderTrendChart();
      
      // Ajustar gráfico quando a janela for redimensionada
      const handleResize = () => {
        renderTrendChart();
      };
      
      // Observe mudanças no tema (claro/escuro)
      const themeObserver = new MutationObserver(() => {
        renderTrendChart();
      });
      
      themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-mode']
      });
      
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        themeObserver.disconnect();
        if (chartEl) {
          Plotly.purge(chartEl);
        }
      };
    }
  });
</script>

<div class="trend-chart mt-8 p-4 bg-white dark:bg-slate-800 rounded-lg shadow-lg">
  <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
    <h2 class="text-xl font-semibold text-slate-800 dark:text-slate-100">
      Análise de Tendências (2020-2025)
    </h2>
    
    <div class="flex items-center gap-2">
      <label for="metricSelector" class="text-sm text-slate-600 dark:text-slate-300">
        Métrica:
      </label>
      <select 
        id="metricSelector" 
        bind:value={selectedMetric} 
        on:change={handleMetricChange}
        class="px-3 py-1.5 rounded border border-slate-300 dark:border-slate-600 
               bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200
               focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {#each metrics as metric}
          <option value={metric.id}>{metric.label}</option>
        {/each}
      </select>
    </div>
  </div>
  
  <div bind:this={chartEl} class="trend-chart-container" style="height: 400px;"></div>
  
  <div class="mt-4 p-3 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-100 text-sm">
    <p>Esta análise de tendências utiliza dados históricos para mostrar a evolução do fluxo de dinheiro ao longo dos anos. Valores depois de 2023 são projeções baseadas em tendências e projeções econômicas oficiais.</p>
  </div>
</div>

<style>
  .trend-chart {
    width: 100%;
  }
  
  .trend-chart-container {
    width: 100%;
  }
</style>
