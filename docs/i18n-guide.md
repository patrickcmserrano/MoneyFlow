# Guia de Internacionalização (i18n) do MoneyFlow

Este guia descreve como funciona o sistema de internacionalização no projeto MoneyFlow e como mantê-lo.

## Estrutura Básica

O sistema i18n é baseado em `svelte-i18n` e utiliza arquivos de tradução em TypeScript:

- `src/lib/locales/pt.ts` - Português (idioma base)
- `src/lib/locales/en.ts` - Inglês
- `src/lib/locales/es.ts` - Espanhol

## Como Usar em Componentes

Em componentes Svelte:

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

1. Primeiro adicione a tradução em `pt.ts` (idioma base)
2. Em seguida, adicione a mesma chave em `en.ts` e `es.ts`
3. Mantenha o formato e estrutura consistentes entre os arquivos

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
