# Fast Managment

Uma aplicação web moderna para gestão de oficinas mecânicas chamada Fast Managment, com um assistente de diagnóstico alimentado por IA para ajudar a identificar problemas em veículos. Permite a gestão de peças, serviços, clientes, viaturas e faturação.

## Deploy no Netlify

Siga estas instruções para fazer o deploy da aplicação no Netlify.

### 1. Conectar ao Git

Conecte o seu repositório do GitHub, GitLab ou Bitbucket à sua conta Netlify.

### 2. Configurações de Build

Configure as seguintes definições no painel do Netlify, em **Site settings > Build & deploy**:

- **Build command:** `npm run build`
- **Publish directory:** `dist`

### 3. Variáveis de Ambiente

Vá para **Site settings > Build & deploy > Environment variables** e clique em **"Add a variable"** para adicionar as seguintes variáveis:

- `VITE_SUPABASE_URL`: O URL do seu projeto Supabase. (Encontrado em *Project Settings > API*)
- `VITE_SUPABASE_ANON_KEY`: A chave anónima (anon key) do seu projeto Supabase. (Encontrado em *Project Settings > API*)
- `VITE_API_KEY`: A sua chave de API para o Google Gemini.

**Importante:** O prefixo `VITE_` é necessário para que as variáveis sejam expostas ao código do lado do cliente durante o processo de build do Vite.

### 4. Configurações Avançadas de Build (Recomendado)

Em **Site settings > Build & deploy > Environment variables**, adicione também:

- `NODE_VERSION`: `18` (ou uma versão mais recente suportada pelo Netlify)
- `NPM_FLAGS`: `--legacy-peer-deps` (para evitar possíveis problemas de compatibilidade entre dependências durante o build)

### 5. Deploy

Clique em **"Deploy site"** no seu painel do Netlify. O Netlify irá construir e fazer o deploy da sua aplicação.
