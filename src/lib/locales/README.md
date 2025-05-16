# Sistema de Traduções Refatorado

Este diretório contém os arquivos de tradução utilizados pelo sistema de i18n da aplicação MoneyFlow.

## Estrutura

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

## Como funciona

1. As traduções estão divididas em seções por contexto/componente
2. Cada seção tem arquivos separados por idioma (en.ts, es.ts, pt.ts)
3. Os arquivos principais (en.ts, es.ts, pt.ts) importam e combinam todas as seções

## Como usar o script de migração

Foi criado um script para facilitar a migração das traduções do formato antigo para o novo:

```bash
# Navegue até o diretório de scripts
cd c:\dev\MoneyFlow\scripts

# Instale as dependências (apenas na primeira vez)
npm install

# Execute o script de migração
npm run migrate-translations
```

O script fará:
1. Ler os arquivos de tradução atuais (`en.ts`, `es.ts`, `pt.ts`)
2. Distribuir as traduções em arquivos separados por seção
3. Criar novos arquivos principais (`en.new.ts`, `es.new.ts`, `pt.new.ts`)

Após verificar que as traduções foram migradas corretamente, renomeie os arquivos `.new.ts` para substituir os originais.

## Como adicionar ou modificar traduções

### Adicionar uma nova string de tradução
1. Identifique a seção apropriada para a nova string
2. Adicione a string em todos os arquivos de idioma dessa seção
3. Use uma convenção de nomenclatura consistente (ex: "component.context.element")

### Adicionar uma nova seção
1. Crie um novo diretório dentro de `sections/`
2. Crie arquivos para cada idioma suportado (en.ts, es.ts, pt.ts)
3. Importe a nova seção nos arquivos principais

### Adicionar um novo idioma
1. Crie arquivos para o novo idioma em cada seção
2. Crie um arquivo principal para o novo idioma que importe todas as seções
3. Atualize o arquivo `i18n.ts` para incluir o novo idioma

## Validação de traduções

Para garantir a consistência entre os idiomas, é recomendável verificar regularmente:

1. Se todas as chaves presentes em um idioma estão presentes nos outros
2. Se há strings não traduzidas (placeholders temporários)
3. Se as traduções estão atualizadas em relação ao desenvolvimento

## Vantagens deste sistema

- Facilita a manutenção e expansão das traduções
- Melhora a organização do código
- Permite que desenvolvedores e o Copilot encontrem e modifiquem traduções mais facilmente
- Evita conflitos de merge quando múltiplos desenvolvedores estão trabalhando no mesmo arquivo
- Proporciona um melhor controle de versão, tornando mais claras as mudanças em cada tradução

## Estrutura recomendada para chaves de tradução

Para manter a consistência e facilitar a manutenção:

- Use o formato `seção.contexto.elemento` (ex: `moneyflow.animation.play`)
- Agrupe elementos relacionados com o mesmo prefixo (ex: `moneyflow.animation.*`)
- Use camelCase para nomes compostos
- Evite caracteres especiais nas chaves
- Mantenha as chaves em inglês, independentemente do idioma da tradução
