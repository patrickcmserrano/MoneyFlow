<!-- filepath: c:\dev\MoneyFlow\src\components\FlowExplanation.svelte -->
<script lang="ts">
  import { _ } from '../lib/i18n';
  
  // Props
  export let flowData: {
    source: number;
    target: number;
    value: number;
    sourceNode: string;
    targetNode: string;
    year: string;
  } | null = null;
  
  // Mapeamento de combinações source-target para explicações
  const explanations: {[key: string]: {title: string, description: string, impact: string}} = {
    "0-1": {
      title: "Produção de Dinheiro Físico",
      description: "O Banco Central autoriza a Casa da Moeda a produzir dinheiro físico (cédulas e moedas). Este processo envolve impressão de alta segurança, implementação de elementos anti-falsificação e cunhagem de moedas.",
      impact: "A criação de dinheiro físico impacta diretamente a base monetária do país. O volume de impressão é calculado considerando diversos fatores como crescimento econômico, desgaste das cédulas em circulação e demanda sazonal por dinheiro em espécie."
    },
    "1-2": {
      title: "Distribuição de Dinheiro Físico",
      description: "A Casa da Moeda distribui o dinheiro recém-produzido para os bancos comerciais através de transportadoras de valores. Os bancos então o disponibilizam ao público via caixas eletrônicos e operações bancárias.",
      impact: "Representa a introdução de dinheiro físico no sistema econômico. Este fluxo é essencial para a economia informal e para setores que ainda dependem fortemente de transações em espécie."
    },
    "0-2": {
      title: "Injeção de Dinheiro Eletrônico",
      description: "O Banco Central injeta liquidez no sistema bancário de forma eletrônica através de operações como redesconto, compra de títulos públicos e empréstimos aos bancos comerciais.",
      impact: "Tem efeito multiplicador na economia, pois os bancos podem emprestar múltiplas vezes o valor recebido, criando moeda escritural. Este mecanismo é a principal forma de aumento da base monetária em economias modernas."
    },
    "2-3": {
      title: "Pagamento de Salários",
      description: "Os bancos comerciais processam pagamentos de salários aos trabalhadores, tanto do setor privado quanto público. Inclui também aposentadorias, pensões e outros rendimentos regulares.",
      impact: "Principal meio de distribuição do dinheiro para a população. Determina o poder de compra das famílias e impacta diretamente o consumo, poupança e qualidade de vida da população."
    },
    "3-4": {
      title: "Consumo",
      description: "As pessoas utilizam seu dinheiro para comprar bens e serviços de empresas e comércios. Este fluxo representa grande parte da atividade econômica visível no dia a dia.",
      impact: "Motor da economia, responsável por aproximadamente 60% do PIB brasileiro. Influencia diretamente na geração de empregos e na viabilidade de empresas de todos os tamanhos."
    },
    "4-5": {
      title: "Impostos sobre Consumo e Lucro",
      description: "Empresas e comércios recolhem e pagam diversos impostos sobre vendas e lucros, como ICMS, ISS, PIS/COFINS, CSLL e IRPJ, que são destinados aos cofres públicos.",
      impact: "Representa a maior parte da arrecadação tributária brasileira. Estes recursos são essenciais para financiar os serviços públicos e políticas governamentais."
    },
    "3-5": {
      title: "Impostos sobre Renda e Patrimônio",
      description: "Pessoas físicas pagam impostos sobre sua renda (IR), patrimônio (IPTU, IPVA, ITR) e contribuições sociais (INSS). Inclui também outras taxas e tributos diretos.",
      impact: "Além de financiar o Estado, tem papel redistributivo na sociedade. O sistema tributário progressivo visa taxar proporcionalmente mais quem tem maior capacidade contributiva."
    },
    "5-6": {
      title: "Transferência para o Governo",
      description: "A Receita Federal transfere a arrecadação tributária para o Governo Federal, que então distribui aos poderes, ministérios e entes federados conforme o orçamento aprovado.",
      impact: "Este fluxo determina a capacidade do governo de implementar políticas públicas. O volume e a eficiência desta transferência afetam diretamente o funcionamento do Estado."
    },
    "6-3": {
      title: "Benefícios Sociais",
      description: "O Governo realiza transferências diretas às pessoas através de programas sociais como Bolsa Família, BPC, auxílios emergenciais, aposentadorias e pensões do regime próprio.",
      impact: "Tem papel crucial na redução da pobreza e desigualdade. Estes programas garantem renda mínima a populações vulneráveis e estimulam a economia local em regiões mais pobres."
    },
    "6-4": {
      title: "Contratos Governamentais",
      description: "O Governo contrata serviços e adquire produtos de empresas e comércios através de licitações, pregões e outros processos de compras públicas.",
      impact: "Representa significativa parcela do mercado para diversos setores da economia. As compras governamentais podem ser utilizadas como instrumento de política econômica para estimular setores específicos."
    },
    "4-7": {
      title: "Exportações",
      description: "Empresas brasileiras vendem produtos e serviços para outros países. Principais itens de exportação incluem commodities agrícolas, minérios, produtos manufaturados e serviços especializados.",
      impact: "Gera entrada de moeda estrangeira, fortalecendo as reservas internacionais do país. Contribui para o equilíbrio da balança comercial e para o crescimento econômico."
    },
    "7-2": {
      title: "Importações",
      description: "O país adquire produtos e serviços do exterior. Os bancos intermediam estas transações internacionais, convertendo moeda nacional em estrangeira.",
      impact: "Permite acesso a bens não produzidos no país ou a preços mais competitivos. Também facilita a incorporação de tecnologias e insumos necessários para a produção nacional."
    },
    "2-8": {
      title: "Operações no Mercado Financeiro",
      description: "Bancos comerciais realizam diversas operações financeiras como investimentos, compra e venda de títulos, operações de crédito interbancário e outros produtos financeiros.",
      impact: "Estas operações têm papel fundamental na liquidez do sistema financeiro. Facilita a formação de preços de ativos e a gestão de riscos por parte das instituições financeiras."
    },
    "0-8": {
      title: "Emissão de Títulos Públicos",
      description: "O Banco Central e Tesouro Nacional emitem títulos da dívida pública que são adquiridos por investidores no mercado financeiro, como forma de financiamento do governo.",
      impact: "Principal instrumento de financiamento do déficit público. A gestão desta dívida tem impacto direto nas taxas de juros da economia e nas expectativas de inflação futura."
    }
  };
  
  // Função para obter a explicação com base no source e target
  function getExplanation() {
    if (!flowData) return null;
    
    const key = `${flowData.source}-${flowData.target}`;
    return explanations[key] || {
      title: `Fluxo de ${flowData.sourceNode} para ${flowData.targetNode}`,
      description: "Este fluxo representa a movimentação de recursos financeiros entre diferentes setores da economia.",
      impact: "Contribui para o ciclo econômico e para o equilíbrio do sistema financeiro."
    };
  }
  
  // Formatador de valores monetários
  function formatCurrency(value: number) {
    return `R$ ${value.toLocaleString('pt-BR')} bilhões`;
  }
  
  $: explanation = getExplanation();
</script>

{#if flowData && explanation}
<div class="flow-explanation p-4 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 mt-4">
  <div class="flex items-start justify-between">
    <h3 class="text-xl font-semibold text-slate-900 dark:text-slate-100">{explanation.title}</h3>
    <div class="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm font-medium">
      Ano: {flowData.year}
    </div>
  </div>
  
  <div class="mt-2 flex items-center text-lg font-medium text-slate-700 dark:text-slate-300">
    <span>{flowData.sourceNode}</span>
    <svg class="mx-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
    </svg>
    <span>{flowData.targetNode}</span>
    <div class="ml-auto px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded font-mono">
      {formatCurrency(flowData.value)}
    </div>
  </div>
  
  <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
    <div class="bg-slate-50 dark:bg-slate-700 p-3 rounded">
      <h4 class="font-medium text-slate-900 dark:text-slate-100 mb-2">O que é este fluxo?</h4>
      <p class="text-slate-700 dark:text-slate-300 text-sm">{explanation.description}</p>
    </div>
    
    <div class="bg-slate-50 dark:bg-slate-700 p-3 rounded">
      <h4 class="font-medium text-slate-900 dark:text-slate-100 mb-2">Impacto Econômico</h4>
      <p class="text-slate-700 dark:text-slate-300 text-sm">{explanation.impact}</p>
    </div>
  </div>
  
  <div class="mt-4 text-xs text-slate-500 dark:text-slate-400">
    <p>Fonte: Dados compilados do Banco Central, Tesouro Nacional e Instituto Brasileiro de Geografia e Estatística (IBGE).</p>
  </div>
</div>
{/if}