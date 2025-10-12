# Sistema Profissional de Nutrição - Paula Amaral

Sistema completo de acompanhamento nutricional mensal desenvolvido em React.

## 📋 Pré-requisitos

- Node.js (versão 16 ou superior)
- npm ou yarn

## 🚀 Instalação e Execução

### 1. Crie a estrutura do projeto

```bash
mkdir sistema-nutricao-paula-amaral
cd sistema-nutricao-paula-amaral
```

### 2. Crie os arquivos de configuração

Crie os seguintes arquivos na raiz do projeto:

- `package.json`
- `vite.config.js`
- `tailwind.config.js`
- `postcss.config.js`
- `index.html`

### 3. Crie a pasta src e os arquivos

```bash
mkdir src
```

Dentro da pasta `src`, crie:
- `main.jsx`
- `index.css`
- `App.jsx`

### 4. Copie o conteúdo dos arquivos

Copie o conteúdo de cada arquivo que foi gerado nos artifacts acima.

**IMPORTANTE:** O arquivo `src/App.jsx` contém o código completo do sistema. Use o código completo do primeiro artifact (Sistema Profissional de Nutrição) que contém todas as abas funcionando, incluindo a nova aba de Bioimpedância.

### 5. Instale as dependências

```bash
npm install
```

### 6. Execute o projeto

```bash
npm run dev
```

O sistema abrirá automaticamente no navegador em `http://localhost:3000`

## 📦 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria a versão de produção
- `npm run preview` - Visualiza a versão de produção

## ✨ Funcionalidades

### Abas do Sistema:
1. **Cadastro** - Dados pessoais do paciente
2. **Avaliação Inicial** - Antropometria com IMC e RCQ automáticos
3. **Bioimpedância** - Análise completa de composição corporal
4. **Anamnese** - Recordatório alimentar 24h e histórico clínico
5. **Acompanhamento** - Evolução mensal do paciente
6. **Plano Alimentar** - Prescrição dietética personalizada

### Recursos:
- ✅ Cálculos automáticos (IMC, RCQ)
- ✅ Exportação de dados
- ✅ Interface responsiva
- ✅ Dados salvos no navegador
- ✅ Sistema profissional e completo

## 🔧 Tecnologias

- React 18
- Vite
- Tailwind CSS
- Lucide React (ícones)

## 👩‍⚕️ Desenvolvido para

Nutricionista Paula Amaral

## 📝 Notas

- Os dados são armazenados localmente no navegador (localStorage)
- Para uso em produção, considere implementar um backend
- O sistema funciona offline após o primeiro carregamento

## 🤝 Suporte

Para dúvidas ou sugestões, entre em contato.

---

**Versão:** 1.0.0  
**Data:** Outubro 2025
