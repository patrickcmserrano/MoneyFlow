<script lang="ts">
  import { _ } from '../lib/i18n';
</script>

<div class="data-sources mt-8 p-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
  <h2 class="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-100">
    {$_('moneyflow.datasources.title')}
  </h2>
  
  <p class="mb-4 text-slate-600 dark:text-slate-300">
    {$_('moneyflow.datasources.intro')}
  </p>
  
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div class="p-3 bg-white dark:bg-slate-700 rounded shadow-sm">
      <h3 class="font-medium text-blue-600 dark:text-blue-400 mb-2">
        {$_('moneyflow.datasources.economic.title')}
      </h3>
      <ul class="list-disc pl-5 text-sm space-y-1 text-slate-600 dark:text-slate-300">
        <li><strong>{$_('moneyflow.datasources.gdp.label')}:</strong> <a href="https://data.worldbank.org/indicator/NY.GDP.MKTP.CD?locations=BR" target="_blank" rel="noopener" class="text-blue-600 dark:text-blue-400 hover:underline">World Bank</a></li>
        <li><strong>{$_('moneyflow.datasources.trade.label')}:</strong> <a href="https://comtrade.un.org/data/" target="_blank" rel="noopener" class="text-blue-600 dark:text-blue-400 hover:underline">UN Comtrade</a></li>
        <li><strong>{$_('moneyflow.datasources.projections.label')}:</strong> {$_('moneyflow.datasources.projections.description')}</li>
      </ul>
    </div>
    
    <div class="p-3 bg-white dark:bg-slate-700 rounded shadow-sm">
      <h3 class="font-medium text-green-600 dark:text-green-400 mb-2">
        {$_('moneyflow.datasources.monetary.title')}
      </h3>
      <ul class="list-disc pl-5 text-sm space-y-1 text-slate-600 dark:text-slate-300">
        <li><strong>{$_('moneyflow.datasources.money.label')}:</strong> <a href="https://www.bcb.gov.br/en" target="_blank" rel="noopener" class="text-blue-600 dark:text-blue-400 hover:underline">Banco Central do Brasil</a></li>
        <li><strong>{$_('moneyflow.datasources.revenue.label')}:</strong> <a href="https://www.gov.br/tesouronacional/en" target="_blank" rel="noopener" class="text-blue-600 dark:text-blue-400 hover:underline">Tesouro Nacional</a></li>
        <li><strong>{$_('moneyflow.datasources.distribution.label')}:</strong> {$_('moneyflow.datasources.distribution.description')}</li>
      </ul>
    </div>
  </div>
  
  <div class="mt-4 p-3 bg-amber-50 dark:bg-amber-900/30 rounded border border-amber-200 dark:border-amber-800">
    <h3 class="font-medium text-amber-800 dark:text-amber-300 mb-2">
      {$_('moneyflow.datasources.disclaimer.title')}
    </h3>
    <ul class="list-disc pl-5 text-sm space-y-1 text-amber-700 dark:text-amber-300">
      <li>{$_('moneyflow.datasources.disclaimer.point1')}</li>
      <li>{$_('moneyflow.datasources.disclaimer.point2')}</li>
      <li>{$_('moneyflow.datasources.disclaimer.point3')}</li>
      <li>{$_('moneyflow.datasources.disclaimer.point4')}
        <a href="https://www.bcb.gov.br/" class="text-blue-600 dark:text-blue-400 hover:underline" target="_blank">
          Banco Central
        </a>, 
        <a href="https://www.gov.br/tesouronacional/" class="text-blue-600 dark:text-blue-400 hover:underline" target="_blank">
          Tesouro Nacional
        </a>,
        <a href="https://www.ibge.gov.br/" class="text-blue-600 dark:text-blue-400 hover:underline" target="_blank">
          IBGE
        </a>
      </li>
    </ul>
  </div>
  
  <div class="mt-4 text-xs text-slate-500 dark:text-slate-400 text-center">
    {$_('moneyflow.datasources.updated')} {new Date().toLocaleDateString('pt-BR')}
  </div>
</div>

<style>
  .source-item {
    padding: 0.75rem;
    border-radius: 0.375rem;
    background-color: rgba(255, 255, 255, 0.5);
    border: 1px solid rgba(0, 0, 0, 0.05);
    transition: all 0.2s ease;
  }
  
  .source-item:hover {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    background-color: rgba(255, 255, 255, 0.7);
  }
  
  :global([data-mode="dark"]) .source-item {
    background-color: rgba(30, 41, 59, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.05);
  }
  
  :global([data-mode="dark"]) .source-item:hover {
    background-color: rgba(30, 41, 59, 0.7);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2);
  }
</style>
