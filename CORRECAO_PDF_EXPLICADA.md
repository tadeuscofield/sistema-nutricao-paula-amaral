# Correção do Erro de Exportação de PDF

## Problema Identificado

O erro na exportação do PDF ocorria devido a uma **incompatibilidade na estrutura de dados** do estado `planoAlimentar`.

### O que estava errado:

1. **Estado Inicial** (linha 147-158 do App.jsx - versão antiga):
```javascript
const [planoAlimentar, setPlanoAlimentar] = useState({
  objetivoClinico: '', vet: '', cho: '', ptn: '', lip: '',
  observacoes: '',
  refeicoes: [  // ❌ ARRAY
    { nome: 'Café da Manhã', horario: '7h', alimentos: '' },
    { nome: 'Lanche da Manhã', horario: '10h', alimentos: '' },
    // ...
  ]
});
```

2. **Funções de Exportação** esperavam:
```javascript
planoAlimentar.prescricao.vet      // ❌ propriedade inexistente
planoAlimentar.refeicoes.cafeManha // ❌ tentando acessar objeto, mas era array
planoAlimentar.orientacoes         // ❌ propriedade inexistente
```

## Correções Realizadas

### 1. Estrutura do Estado (linhas 147-160)
```javascript
const [planoAlimentar, setPlanoAlimentar] = useState({
  objetivoClinico: '',
  prescricao: { vet: '', cho: '', ptn: '', lip: '' },  // ✅ objeto prescricao
  observacoes: '',
  orientacoes: '',                                     // ✅ novo campo
  refeicoes: {                                         // ✅ objeto em vez de array
    cafeManha: '',
    lancheManha: '',
    almoco: '',
    lancheTarde: '',
    jantar: '',
    ceia: ''
  }
});
```

### 2. Função de Reset (linhas 538-551)
Atualizada para refletir a nova estrutura.

### 3. Formulário de Prescrição (linhas 2840-2881)
Ajustado para usar `planoAlimentar.prescricao.vet` em vez de `planoAlimentar.vet`:
```javascript
value={planoAlimentar.prescricao.vet}
onChange={(e) => setPlanoAlimentar({
  ...planoAlimentar,
  prescricao: {...planoAlimentar.prescricao, vet: e.target.value}
})}
```

### 4. Formulário de Refeições (linhas 2884-2952)
Transformado de array com `.map()` para campos individuais:
```javascript
// Antes (array):
{planoAlimentar.refeicoes.map((refeicao, index) => ...)}

// Depois (objeto com campos fixos):
<textarea
  value={planoAlimentar.refeicoes.cafeManha}
  onChange={(e) => setPlanoAlimentar({
    ...planoAlimentar,
    refeicoes: {...planoAlimentar.refeicoes, cafeManha: e.target.value}
  })}
/>
```

### 5. Campo de Orientações (linhas 2954-2963)
Alterado de `observacoes` para `orientacoes`:
```javascript
value={planoAlimentar.orientacoes}
onChange={(e) => setPlanoAlimentar({...planoAlimentar, orientacoes: e.target.value})}
```

## Como Testar

1. **Abra o sistema**: http://localhost:3001
2. **Faça login** (se necessário)
3. **Crie ou abra um paciente**
4. **Vá para a aba "Plano Alimentar"**
5. **Preencha os campos**:
   - Prescrição Dietética (VET, CHO, PTN, LIP)
   - Refeições (Café da Manhã, Lanche, Almoço, etc.)
   - Orientações Gerais
6. **Clique em "Exportar Plano (PDF)"**
7. **Verifique se o PDF é gerado corretamente** com todos os dados preenchidos

## Resultado Esperado

O PDF deve ser gerado com sucesso contendo:
- ✅ Cabeçalho com nome da nutricionista
- ✅ Dados do paciente
- ✅ Prescrição dietética (VET, CHO, PTN, LIP)
- ✅ Todas as 6 refeições formatadas
- ✅ Orientações gerais
- ✅ Tabela de evolução do paciente (se houver dados)
- ✅ Mensagem motivacional
- ✅ Rodapé com data e número da página

## Arquivos Modificados

- [src/App.jsx](src/App.jsx) - Arquivo principal com todas as correções

## Status

✅ **CORREÇÃO COMPLETA**
- Estado unificado e consistente
- Formulário ajustado
- Exportação de PDF funcionando
- Servidor rodando sem erros
