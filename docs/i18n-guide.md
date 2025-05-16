# Guia de Internacionalização (i18n) do MoneyFlow

Este guia descreve como funciona o sistema de internacionalização no projeto MoneyFlow e como mantê-lo.

## Nova Estrutura Modular

O sistema i18n agora utiliza uma estrutura modular baseada em seções:

```
locales/
├── en.ts            # Arquivo principal para traduções em inglês
├── es.ts            # Arquivo principal para traduções em espanhol
├── pt.ts            # Arquivo principal para traduções em português
└── sections/        # Traduções organizadas por seções
    ├── app/         # Elementos básicos da aplicação
    ├── debug/       # Mensagens de depuração
    ├── features/    # Recursos/funcionalidades
    ├── moneyflow/   # Visualização do fluxo de dinheiro
    ├── moneymind/   # MoneyMind Oasis
    └── navigation/  # Elementos de navegação
```

Os arquivos principais (en.ts, es.ts, pt.ts) agora importam e consolidam as traduções de cada seção.

## Como Usar em Componentes

Em componentes Svelte, o uso continua o mesmo:

```svelte
<script>
  import { _ } from '../lib/i18n';
</script>

<div>
  <h1>{$_('minha.chave.de.traducao')}</h1>
  <p>{$_('outra.chave')}</p>
</div>
```

## Boas Práticas

1. **Evite texto hardcoded** - Todo texto visível ao usuário deve vir dos arquivos de tradução
2. **Use chaves hierárquicas** - Organize as chaves com prefixos por seção/componente
3. **Mantenha consistência** - Todas as chaves devem existir em todos os idiomas
4. **Teste as traduções** - Verifique seu componente em todos os idiomas suportados

## Adicionando Novas Traduções

Com a nova estrutura modular:

1. Identifique a seção apropriada para sua tradução
2. Adicione a chave no arquivo da seção correspondente para cada idioma:
   - `src/lib/locales/sections/[seção]/pt.ts`
   - `src/lib/locales/sections/[seção]/en.ts`
   - `src/lib/locales/sections/[seção]/es.ts`

Exemplo:
```typescript
// Em src/lib/locales/sections/moneyflow/pt.ts
export default {
  // ...existing code...
  "moneyflow.new.feature": "Nova funcionalidade",
  // ...existing code...
};
```

## Adicionando uma Nova Seção

Se você precisar criar uma nova seção de traduções:

1. Crie um novo diretório em `src/lib/locales/sections/`
2. Adicione arquivos para cada idioma (pt.ts, en.ts, es.ts)
3. Atualize os arquivos principais para importar a nova seção

## Ferramenta de Diagnóstico

Para diagnosticar problemas de tradução, use o método `i18n.checkTranslationConsistency()` no console do navegador para identificar chaves faltantes.

## Componente de Depuração

Para testes, você pode adicionar o componente `TranslationDebugger.svelte` temporariamente em suas páginas:

```svelte
<script>
  import TranslationDebugger from './debug/TranslationDebugger.svelte';
</script>

<TranslationDebugger />
```

## Manutenção

É importante revisar periodicamente os arquivos de tradução para garantir que estejam sincronizados, especialmente após adicionar novos recursos ou componentes.

Para mais detalhes sobre o sistema modular e o processo de migração, consulte:
- [README do Sistema de Traduções](../src/lib/locales/README.md)
- [Guia de Migração de Traduções](./translation-migration-guide.md)
