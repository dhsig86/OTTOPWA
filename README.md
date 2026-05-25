# 🌐 OTTO PWA — Shell Integrador de Prática Clínica ORL

O **OTTO PWA** é o ponto de entrada central de todo o ecossistema OTTO. Ele atua como um hub integrador, embarcando de forma fluida e segura todas as ferramentas e microserviços clínicos e operacionais utilizados pelo médico otorrinolaringologista no consultório.

---

## 🩺 Funcionalidades e Escopo Clínico

O ecossistema é projetado para operar em fluxo contínuo e integrado:

1. **Admissão e Triagem (Triagem OS):** Captação inteligente da anamnese do paciente com apoio de inteligência artificial.
2. **Escriba Médico (OTTO Whisper):** Transcrição e extração de achados clínicos durante a consulta física ou teleconsulta.
3. **Casuística Cirúrgica (OTTO Log):** Registro digital de cirurgias ORL, fornecendo estatísticas de casuística e exportação segura sem necessidade de índices complexos no Firestore.
4. **Calculadora e Elegibilidade (OTTO IMUNE):** Escore matemático estruturado para indicação de imunobiológicos na Rinossinusite Crônica, gerando rascunhos de relatórios e receitas.
5. **Codificação Cirúrgica (CID & TUSS):** Busca e faturamento cirúrgico em conformidade com as regras CBHPM.
6. **Relatos Científicos (OTTO Cases):** Editor de casos clínicos científicos alimentado por DeepSeek R1 e Whisper.
7. **Reabilitação e Terapia (Módulos de Pacientes):**
   - **OTTO Zumbido:** Terapia sonora estéreo para reabilitação de Tinnitus.
   - **OTTO Check:** Testes e triagens online de acuidade auditiva.
   - **OTTO Voice:** Exercícios de voz e reabilitação de laringectomizados.
   - **Peri-op:** Orientações estruturadas de jejum e pós-operatório (incluindo diretrizes de agonistas GLP-1/Ozempic).

---

## 🤖 OTTO Concierge: O Copiloto Integrado

O Concierge reside no canto inferior da tela e atua como guia e facilitador de fluxos.
- **Ajuda Contextual:** Digite `"abrir ajuda"` ou `"explicar Whisper"` para entender os recursos e ser direcionado com um clique ao módulo desejado.
- **DeepLinks de Contexto:** Ao pedir para o Concierge criar um relato de caso científico com base na anamnese ativa, ele automaticamente abre o `OTTO Cases` transferindo as informações de rascunho de forma segura.

---

## 🔐 Controle de Perfis e Acesso

A autenticação é unificada via Firebase Auth (Google SSO). A experiência de uso do PWA é dinâmica e se adapta de acordo com o perfil de login:
- **Médicos / Estudantes / Profissionais:** Acesso a ferramentas protegidas e confidenciais (Logs, Prontuários, Escriba, Autolaudo, etc.).
- **Pacientes:** Exibição simplificada focada em terapia sonora (Zumbido), orientações perioperatórias e exercícios de voz.

---

## 💻 Guia de Execução Local

### Pré-requisitos
- Node.js (versão 18 ou superior).
- Gerenciador de pacotes `npm`.

### Instalação
1. Clone o repositório principal e acesse o diretório:
   ```bash
   cd "OTTO PWA/otto-pwa"
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```

### Executando em Desenvolvimento
1. Crie o arquivo `.env.local` na raiz de `otto-pwa/` contendo as chaves do Firebase obtidas no Console:
   ```env
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=otto-ecosystem.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=otto-ecosystem
   VITE_FIREBASE_STORAGE_BUCKET=otto-ecosystem.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```
2. Inicie o servidor local:
   ```bash
   npm run dev
   # Acesse http://localhost:5173 no navegador
   ```

### Compilação de Produção
Para buildar a aplicação para deploy em servidores de estáticos (Vercel ou Firebase Hosting):
```bash
npm run build
# A saída será gerada no diretório dist/
```
