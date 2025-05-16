# Guia de Migração para o Novo Sistema de Traduções

Este guia descreve o processo de migração do sistema de traduções antigo para o novo sistema modular do MoneyFlow.

## Visão Geral

Estamos alterando o sistema de traduções para melhorar a organização, manutenção e escalabilidade. 
O novo sistema divide as traduções em arquivos separados por seção, o que facilita encontrar e modificar traduções específicas.

## Passos para a Migração

### 1. Execute o Script de Migração

```bash
# Navegue até o diretório de scripts
cd c:\dev\MoneyFlow\scripts

# Instale as dependências (apenas na primeira vez)
npm install

# Execute o script de migração
npm run migrate-translations
```

O script irá:
- Ler os arquivos de tradução existentes (`en.ts`, `es.ts`, `pt.ts`)
- Distribuir as traduções em arquivos por seção e idioma
- Gerar novos arquivos principais com extensão `.new.ts`

### 2. Verifique a Consistência das Traduções

```bash
# Execute o script de verificação
npm run check-translations
```

Este script irá:
- Verificar se todas as chaves existem em todos os idiomas
- Gerar um relatório detalhado de consistência
- Identificar quais chaves estão faltando em cada idioma

Se o script identificar inconsistências, corrija-as antes de prosseguir.

### 3. Verifique os Arquivos Gerados

Antes de substituir os arquivos originais, verifique se:
- Todas as traduções foram corretamente migradas
- Os arquivos por seção estão bem organizados
- Não há erros de sintaxe nos novos arquivos

### 4. Atualize os Arquivos Principais

Depois de confirmar que tudo está correto:

```bash
# Substitua os arquivos originais pelos novos
mv c:\dev\MoneyFlow\src\lib\locales\en.new.ts c:\dev\MoneyFlow\src\lib\locales\en.ts
mv c:\dev\MoneyFlow\src\lib\locales\es.new.ts c:\dev\MoneyFlow\src\lib\locales\es.ts
mv c:\dev\MoneyFlow\src\lib\locales\pt.new.ts c:\dev\MoneyFlow\src\lib\locales\pt.ts
```

### 5. Teste as Traduções

Após a migração:
- Execute a aplicação e verifique se todas as traduções estão funcionando
- Teste a alternância entre idiomas
- Verifique se não há chaves de tradução ausentes

## Nova Estrutura de Diretórios

Após a migração, a estrutura de diretórios das traduções será:

```
src/lib/locales/
├── en.ts                 # Arquivo principal inglês
├── es.ts                 # Arquivo principal espanhol
├── pt.ts                 # Arquivo principal português
└── sections/             # Diretório com seções organizadas
    ├── app/              # Traduções gerais da aplicação
    │   ├── en.ts
    │   ├── es.ts
    │   └── pt.ts
    ├── moneyflow/        # Traduções da visualização de fluxo de dinheiro
    │   ├── en.ts
    │   ├── es.ts
    │   └── pt.ts
    ├── moneymind/        # Traduções do MoneyMind Oasis
    │   ├── en.ts
    │   ├── es.ts
    │   └── pt.ts
    ├── navigation/       # Traduções da navegação
    │   ├── en.ts
    │   ├── es.ts
    │   └── pt.ts
    └── debug/            # Traduções para depuração
        ├── en.ts
        ├── es.ts
        └── pt.ts
```

## Fluxo de Trabalho Após a Migração

Após a migração, o fluxo de trabalho para adicionar ou modificar traduções será:

1. Identifique a seção apropriada para a tradução
2. Atualize os arquivos de cada idioma nessa seção
3. Execute o script de verificação para garantir consistência

```bash
# Verifique a consistência das traduções
cd c:\dev\MoneyFlow\scripts
npm run check-translations
```

## Solução de Problemas

### Erro: Traduções ausentes

Se algumas traduções estiverem ausentes após a migração:
1. Verifique se todas as seções foram importadas nos arquivos principais
2. Confirme se todas as chaves foram distribuídas corretamente nas seções
3. Execute o script de migração novamente com o flag de depuração

### Erro: Sintaxe incorreta nos arquivos

Se houver erros de sintaxe:
1. Verifique os arquivos de seção gerados
2. Corrija manualmente os problemas de sintaxe
3. Regenere os arquivos principais

## Próximos Passos

Após a migração bem-sucedida:
1. Atualize a documentação do projeto
2. Informe a equipe sobre o novo sistema
3. Atualize os guias de contribuição para explicar como trabalhar com o novo sistema de traduções
