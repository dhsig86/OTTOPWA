# OTTO PWA — Contexto Técnico de Desenvolvimento (LLM/Agente)

O **OTTO PWA** é o shell/hub principal do ecossistema OTTO. Ele atua como um orquestrador que
embarca os demais submódulos via `iframe` ou `webview` seguro, gerencia o estado global de
autenticação (Firebase Auth), hospeda o **OTTO Concierge** (copiloto inteligente de navegação
e inteligibilidade clínica) e fornece conteúdo embarcado como PeriOp, InfoPage e Vídeos.

---

## 🚀 Comandos Rápidos e Pipeline

- **Desenvolvimento Local:**
  ```bash
  npm run dev
  # Servidor local disponível em http://localhost:5173
  ```
- **Compilação de Produção:**
  ```bash
  npm run build
  # tsc -b && vite build → gera o bundle otimizado em dist/
  ```
- **Linter (ESLint):**
  ```bash
  npm run lint
  ```
- **Visualização Local do Build:**
  ```bash
  npm run preview
  ```

---

## 🛠️ Stack Tecnológica

| Camada            | Tecnologia                                    | Versão      |
|-------------------|-----------------------------------------------|-------------|
| Core              | React + TypeScript                            | 18.3 + 5.6  |
| Build             | Vite                                          | 5.4         |
| Estilização       | Tailwind CSS + @tailwindcss/forms             | v4.2        |
| Roteamento        | React Router DOM (SPA)                        | v7.14       |
| Auth/BaaS         | Firebase (Auth + Firestore)                   | v12.12      |
| Animações         | Framer Motion                                 | v12.40      |
| Ícones            | Lucide React                                  | v1.8        |
| PWA               | vite-plugin-pwa (Service Worker)              | v1.2        |
| Deploy            | Vercel                                        | —           |

---

## 📂 Estrutura de Diretórios

```
OTTO PWA/otto-pwa/
├── CLAUDE.md                    ← ESTE ARQUIVO
├── index.html                   ← Entry point (SPA)
├── package.json                 ← Dependências e scripts
├── vite.config.ts               ← Config Vite + PWA plugin
├── vercel.json                  ← CSP headers, rewrites, redirects
├── tailwind.config.js           ← Paleta OTTO + plugins
├── tsconfig.json                ← TypeScript config
├── .env                         ← Variáveis Firebase (públicas)
├── api/                         ← Vercel serverless functions
├── public/                      ← Assets estáticos (icons, manifest)
└── src/
    ├── main.tsx                 ← Bootstrap: React DOM render
    ├── App.tsx                  ← Router + AuthProvider + Routes
    ├── App.css                  ← Estilos mínimos do App
    ├── index.css                ← Global CSS + Tailwind imports
    ├── vite-env.d.ts            ← Tipos Vite
    ├── components/
    │   ├── ModuleFrame.tsx      ← iframe loader com postMessage bridge (8.7KB)
    │   ├── ModuleSplash.tsx     ← Splash screen ao carregar módulos (9KB)
    │   ├── WarmUpSplash.tsx     ← Warm-up de backends Render/Heroku (6.9KB)
    │   ├── AudioVisualizer.tsx  ← Visualizador de áudio (Zumbido)
    │   ├── ErrorBoundary.tsx    ← Error boundary global
    │   └── Shell/
    │       └── Layout.tsx       ← Shell layout (Navbar, BottomNav, Sidebar)
    ├── concierge/               ← OTTO Concierge Engine (12 arquivos, ~153KB)
    │   ├── core.ts              ← Motor de decisão (decide, simulateCommand)
    │   ├── intents.ts           ← Classificador de intenções clínicas (~14KB)
    │   ├── registry.ts          ← Registro de módulos + catálogo de calculadoras (~21KB)
    │   ├── adapters.ts          ← Adaptadores de integração por módulo (~18KB)
    │   ├── bridge.ts            ← PWA Launch Plan + Execution (~11KB)
    │   ├── capabilities_db.ts   ← Base de conhecimento dos módulos (~7KB)
    │   ├── tutorials.ts         ← 22 tutoriais step-by-step (~21KB)
    │   ├── greetings.ts         ← Motor de saudações contextuais (~5KB)
    │   ├── guardrails.ts        ← Guardrails de segurança (~3KB)
    │   ├── types.ts             ← Tipos TypeScript do Concierge (~5KB)
    │   ├── ConciergeChatBubble.tsx ← UI: balão de chat (~8KB)
    │   └── OttoConciergeDock.tsx   ← UI: dock principal do Concierge (~26KB)
    ├── config/
    │   └── modules.ts           ← Catálogo visual de módulos (ícones, tags, UI)
    ├── contexts/
    │   ├── AuthContext.tsx       ← Auth global (Firebase, perfis, premium, onboarding)
    │   └── PatientContext.tsx    ← Contexto de paciente ativo
    ├── hooks/
    │   ├── useServiceWarmUp.ts  ← Warm-up de serviços Render/Heroku (2.5KB)
    │   └── useZumbidoAudioEngine.ts ← Engine de áudio para terapia sonora
    ├── lib/
    │   ├── firebase.ts          ← Firebase init (auth + db)
    │   └── analytics.ts         ← Tracking de eventos GA4
    ├── pages/
    │   ├── Home.tsx             ← Dashboard principal (~11KB)
    │   ├── Login.tsx            ← Tela de login (Google SSO + email) (~11KB)
    │   ├── CompleteProfile.tsx  ← Completar perfil (nome, tipo) (~16KB)
    │   ├── Onboarding.tsx       ← Tour guiado do ecossistema (~14KB)
    │   ├── Profile.tsx          ← Tela de perfil do usuário (~14KB)
    │   ├── Search.tsx           ← Busca global de módulos (~5KB)
    │   ├── Notifications.tsx    ← Central de notificações (~3KB)
    │   ├── NotFound.tsx         ← Página 404
    │   └── modules/
    │       ├── PeriOp.tsx       ← Protocolos pré/pós-operatórios (~31KB)
    │       ├── InfoPage.tsx     ← OTTO Update: pílulas científicas (~39KB)
    │       ├── VideoChannels.tsx ← Acervo de vídeos ORL (~6KB)
    │       ├── Feedback.tsx     ← Formulário de feedback (~13KB)
    │       └── PremiumPage.tsx  ← Página de assinatura premium (~9KB)
    ├── styles/                  ← CSS auxiliar
    └── utils/
        └── lazyWithRetry.ts    ← Lazy loading com retry automático
```

---

## 🤖 OTTO Concierge Engine

O Concierge é o copiloto inteligente do ecossistema. Reside em `src/concierge/` (12 arquivos, ~153KB)
e opera em modo **local-first** — classificação de intenções, guardrails e roteamento acontecem
inteiramente no cliente, sem chamadas a LLM.

### Pipeline de Decisão

```
Texto do usuário
  → classifyIntent()    [intents.ts]      — NLP local com fuzzy matching
  → evaluateGuardrails() [guardrails.ts]  — perfil, auth, surface, risk
  → decide()            [core.ts]         — monta ConciergeDecision
  → runModuleAdapter()  [adapters.ts]     — adapter específico do módulo
  → createPwaLaunchPlan() [bridge.ts]     — plano de navegação seguro
  → executePwaLaunchPlan() [bridge.ts]    — execução controlada
```

### Arquivos do Concierge

| Arquivo                    | Responsabilidade                                                |
|----------------------------|-----------------------------------------------------------------|
| `core.ts`                  | Motor de decisão principal. `decide()` + `simulateCommandActivation()`. Orquestra intent → guardrail → adapter → resposta. |
| `intents.ts`               | Classificador local de intenções (~14KB). Fuzzy matching com termos clínicos em PT-BR. Threshold mínimo: `0.6`. |
| `registry.ts`              | Registro canônico dos 24 módulos + catálogo de 26 calculadoras com aliases e áreas clínicas. |
| `adapters.ts`              | Adaptadores por módulo (deeplink, mock, read_only). O adapter `cases` envia draft via `?draft=`. |
| `bridge.ts`                | Ponte PWA ↔ módulo. Converte decisões em planos de navegação (`PwaLaunchPlan`) e executa com validação de origem. |
| `capabilities_db.ts`       | Base de conhecimento de recursos dos 15+ módulos. Alimenta o help contextual do Concierge. |
| `tutorials.ts`             | 22 tutoriais step-by-step com emoji, audience, steps, tip e shortcutCommand. |
| `greetings.ts`             | Motor de saudações contextuais (hora do dia, perfil, últimas atividades, pílulas não lidas). |
| `guardrails.ts`            | Avalia perfil, autenticação, surface, risco clínico e instruções inseguras (injection guard). |
| `types.ts`                 | Tipos TypeScript: `ConciergeInput`, `ConciergeDecision`, `ModuleRegistryEntry`, `IntentRegistryEntry`, etc. |
| `ConciergeChatBubble.tsx`  | Componente UI do balão de mensagem do Concierge. |
| `OttoConciergeDock.tsx`    | Componente UI principal: drawer/dock do Concierge com chat interativo (~26KB). |

### Guardrails de Segurança

O Concierge implementa guardrails em `guardrails.ts`:

1. **Injection Guard:** Bloqueia frases como "ignore as regras", "mostre o token", "api key"
2. **Auth Check:** Módulos com `requiresAuth` bloqueiam identidades não verificadas
3. **Profile Gate:** Cada intent define `allowedProfiles` — pacientes não veem ferramentas clínicas
4. **Surface Gate:** Intenções restritas a `pwa` não executam via `zap`
5. **PHI Handoff:** Dados sensíveis no WhatsApp → redirecionamento para PWA seguro
6. **High Risk Confirm:** Ações de alto risco exigem confirmação explícita

---

## 📦 Módulos Registrados (24 no Registry)

O `registry.ts` mantém o registro canônico de todos os módulos do ecossistema:

| ID           | Display Name     | URL                                                     | Categoria         | Status | Risco      |
|--------------|------------------|---------------------------------------------------------|-------------------|--------|------------|
| `calc`       | Calculadoras     | `otto-calc-hub.vercel.app`                              | clinico           | live   | medium     |
| `procod`     | CID & TUSS       | `procod.drdariohart.com`                                | operacional       | live   | medium     |
| `ocr`        | OTTO OCR         | `otto-ocr-web.vercel.app`                               | clinico           | live   | medium     |
| `videos`     | Videos           | `/modules/videos` (interno)                             | educacao_paciente | live   | low        |
| `bottok`     | BOTTOK           | `bottok-orcin.vercel.app`                               | clinico           | live   | variable   |
| `whisper`    | OTTO Whisper     | `otto-whisper.netlify.app`                              | clinico           | beta   | high       |
| `autolaudo`  | OTTO Laudo-IA    | `otto-laudo-ia.vercel.app`                              | clinico           | beta   | medium     |
| `cases`      | OTTO Cases       | `otto-cases.vercel.app`                                 | clinico           | live   | medium     |
| `protto`     | PROTTO           | `otto-protto.vercel.app`                                | clinico           | beta   | high       |
| `aerodig`    | Aerodigestive    | `otto-aerodig.vercel.app`                               | clinico           | beta   | medium     |
| `logbook`    | OTTO Log         | `otto-log.vercel.app`                                   | clinico           | live   | low        |
| `imune`      | Imunobiológicos  | `otto-imune.vercel.app`                                 | clinico           | live   | medium     |
| `ottotests`  | OTTO Acadêmico   | `test-pg-bice.vercel.app`                               | operacional       | live   | low        |
| `check`      | OTTO Check       | `otto-check.vercel.app`                                 | clinico           | beta   | low        |
| `zumbido`    | Zumbido          | `otto-check.vercel.app/?tool=zumbido`                   | clinico           | live   | low        |
| `voice`      | Voz              | `otto-voice-one.vercel.app`                             | clinico           | live   | low        |
| `atlas`      | Atlas ORL        | `atlas.drdariohart.com`                                 | clinico           | live   | low        |
| `otoscopia`  | Otoscop.IA       | `atlas.drdariohart.com/?tab=ia&embed=true`              | clinico           | live   | medium     |
| `info`       | OTTO Update      | `/modules/info` (interno)                               | clinico           | live   | low        |
| `ottosig`    | OTTO Glossário   | `dhsig86.github.io/minidic/`                            | educacao_paciente | live   | low        |
| `periop`     | Peri-op          | `/modules/periop` (interno)                             | clinico           | live   | low        |
| `games`      | OTTO Games       | `otto-games.vercel.app`                                 | educacao_paciente | live   | low        |
| `feedback`   | Feedback         | `/modules/feedback` (interno)                           | operacional       | live   | low        |
| `triagem`    | Triagem OS       | `otto-ai-triagem-1fc48c3c292e.herokuapp.com`            | clinico           | live   | medium     |

### Categorias
- **clinico:** Ferramentas para profissionais de saúde
- **operacional:** Ferramentas de suporte (codificação, testes, feedback)
- **educacao_paciente:** Conteúdo para pacientes e público geral

---

## 🧮 Catálogo de 26 Calculadoras (CALC_HUB_CATALOG)

O `registry.ts` também mantém o catálogo completo de calculadoras clínicas, organizadas por área:

| Área           | Calculadoras                                                                 |
|----------------|------------------------------------------------------------------------------|
| Rinologia      | Sinusite, NOSE, Lund-Mackay, SNOT-22, SN-5 Pediátrico                      |
| Oncologia      | TNM Oncológico, Malignidade Cervical                                        |
| Otologia       | THI (Zumbido), DHI (Tontura), NCIQ (Implante), COMQ-12 (OMC)              |
| Hipoacusia     | HHIA-S (Desvantagem Auditiva), PTA (Média Tonal), SRT+IRF (Logoaudiometria)|
| Laringologia   | VHI-10 (Voz), EAT-10 (Disfagia), RSI (Refluxo), VoiSS (Sintomas)         |
| Sono           | Epworth (ESE), STOP-Bang                                                    |
| Intensiva      | CPSS (Pneumonia)                                                            |
| Geral          | Centor (Faringite), Doses Pediátricas                                       |
| Aerodigestivo  | Myer-Cotton (Estenose), Pedi-EAT-10, Conversor de Cânulas                  |

O Concierge usa `findCalcHubCalculator()` com Levenshtein fuzzy matching para resolver
nomes digitados pelo usuário em calculadoras específicas.

---

## 📚 22 Tutoriais Step-by-Step

O arquivo `tutorials.ts` contém tutoriais completos para cada módulo:

| ID          | Título                                    | Audience                            |
|-------------|-------------------------------------------|-------------------------------------|
| protto      | PROTTO — Prontuário ORL Inteligente       | Médicos ORL                         |
| procod      | CID & TUSS — Codificação e Faturamento    | Médicos e Faturamento               |
| whisper     | OTTO Whisper — Escriba e Ditado Médico    | Médicos e Fonos                     |
| calc        | CALC-HUB — Calculadoras Clínicas ORL     | Otorrinos, Residentes, Fonos        |
| info        | OTTO Update — Pílulas de Literatura       | Médicos, Residentes, Estudantes     |
| otoscopia   | Otoscop.IA — IA em Otoscopia             | Médicos, Pediatras, Clínicos        |
| triagem     | Triagem OS — Anamnese Digital             | Secretárias, Clínicas, Pacientes    |
| autolaudo   | AUTOLAUDO — Editor por Voz e IA           | Médicos ORL                         |
| aerodig     | Aerodigestive — Medicina Aerodigestiva    | ORL Pediátricos, Pediatras          |
| logbook     | OTTO Log — Registro Cirúrgico             | Cirurgiões, Residentes              |
| ocr         | OTTO OCR — Extrator de Laudos             | Médicos, Recepcionistas             |
| imune       | Imunobiológicos — Elegibilidade e LME     | Médicos ORL                         |
| ottotests   | OTTO Acadêmico — Simulados e MCQ          | Residentes, Estudantes              |
| bottok      | BOTTOK — Chatbot ORL com RAG              | Médicos, Estudantes                 |
| cases       | OTTO Cases — Relato de Caso Clínico       | Médicos, Residentes                 |
| videos      | Vídeos Educativos ORL                     | Médicos, Residentes, Pacientes      |
| check       | OTTO CHECK — Triagem Auditiva Digital     | Pacientes, Público Geral            |
| zumbido     | OTTO Zumbido — Terapia Sonora             | Pacientes com Tinnitus              |
| voice       | OTTO VOICE — Síntese Vocal Emocional      | Laringectomizados, Fonos            |
| atlas       | OTTO Atlas — Atlas de Otoscopia           | Médicos, Residentes, Estudantes     |
| ottosig     | Glossário ORL — Minidicionário            | Estudantes, Público Geral           |
| periop      | PeriOp — Protocolos Peri-Operatórios      | Médicos, Pacientes Cirúrgicos       |
| games       | OTTO Games — Jogos Educativos             | Crianças, Pacientes Pediátricos     |
| feedback    | Feedback — Sugestões e Bug Reports        | Todos os Usuários                   |

Cada tutorial inclui: `emoji`, `title`, `audience`, `summary`, `steps[]`, `tip`, `shortcutCommand`.
O Concierge ativa tutoriais quando detecta frases como "como funciona", "tutorial", "passo a passo".

---

## 🏥 Páginas Embarcadas de Grande Porte

### PeriOp (`src/pages/modules/PeriOp.tsx` — 31KB)

Guia completo de orientações pré e pós-operatórias para as principais cirurgias ORL:
- **Cirurgias cobertas:** Amigdalectomia, Septoplastia, Cirurgia de Ouvido, Tireoidectomia, etc.
- **Seções:** Preparo pré-operatório (jejum, medicações), Alerta GLP-1/Ozempic, Pós-operatório
- **Modo paciente:** Informações em linguagem acessível para compartilhar com pacientes
- **Acessível a todos os perfis** (incluindo pacientes)
- **Rota:** `/modules/periop` (renderizada internamente, sem iframe)

### InfoPage (`src/pages/modules/InfoPage.tsx` — 39KB)

OTTO Update — Hub de pílulas científicas de atualização clínica:
- **Formato:** Duelo de Evidências + Pílula Prática + Quiz de Fixação
- **Áreas:** Rinologia, Otologia, Laringologia, ORL Pediátrica
- **Funcionalidades:** Favoritos, progresso, ranking de leitura
- **Perfis:** Médicos, Estudantes, Profissionais
- **Rota:** `/modules/info` (renderizada internamente, sem iframe)
- **Usa IA** para geração e formatação de conteúdo

---

## 🚪 Fluxo de Onboarding

O OTTO PWA implementa um fluxo de onboarding em 3 etapas controladas pelo `AuthContext`:

### 1. Login (`/login`)
- Google SSO (Firebase Auth) ou login por email
- Após autenticação, verifica se `profileCompleted` no Firestore

### 2. Complete Profile (`/complete-profile`)
- Coleta nome, perfil (`medico` | `estudante` | `profissional` | `paciente`)
- Salva no Firestore (`users/{uid}`)
- Marca `profileCompleted = true`

### 3. Onboarding Tour (`/onboarding`)
- Tour guiado pelas funcionalidades do ecossistema (~14KB de UI)
- Marca `onboardingCompleted = true` ao finalizar
- Na próxima sessão, mostra `WarmUpSplash` (aquece backends Render/Heroku)

### WarmUp Splash
- Exibido uma vez por sessão (controlado via `sessionStorage`)
- Faz preflight requests para backends em free tier (Render, Heroku)
- Enquanto os serviços acordam, mostra animação de loading

---

## 📡 Arquitetura de Comunicação: `postMessage` API

A integração de submódulos rodando dentro de iframes é mantida por um barramento
bidirecional de mensagens baseado em `window.postMessage`.

### 1. Handshake e Envio de Contexto (`PWA Shell` → `Submódulo`)
O componente `src/components/ModuleFrame.tsx` (8.7KB) estabelece o handshake.
Ao carregar o iframe, o PWA envia o contexto do usuário e paciente em um loop de
retry de 3 iterações (a 0s, 2s e 4s) para garantir que o submódulo esteja pronto:

```json
{
  "type": "otto-context",
  "payload": {
    "userName": "Nome do Médico",
    "userId": "firebase_uid",
    "firebaseToken": "id_token_jwt",
    "patient": {
      "patientId": "id_no_firestore",
      "name": "Nome do Paciente",
      "birthDate": "1980-01-01",
      "age": 46,
      "cid10": "J32.4;J45"
    }
  }
}
```

### 2. Handshake de Resposta (`Submódulo` → `PWA Shell`)
O submódulo responde indicando que está carregado e enviando suas capacidades:
```json
{
  "type": "otto-<modulo_id>-ready",
  "payload": {
    "version": "1.0.0",
    "capabilities": ["calc", "reportDraft"]
  }
}
```

### 3. Solicitação de Atualização de Token (Refresh JWT)
Os submódulos podem enviar a mensagem `otto-request-refresh` se receberem `401 Unauthorized`
de suas APIs. O PWA intercepta, renova o token Firebase em segundo plano e reenvia via
`otto-context`.

### 4. Bridge Layer (`bridge.ts`)
O `bridge.ts` (11KB) converte decisões do Concierge em planos de navegação PWA:
- `createPwaLaunchPlan()` — avalia status, monta rota e postMessage payload
- `executePwaLaunchPlan()` — executa navegação com validação de origem
- Statuses: `ready`, `handoff_required`, `confirmation_required`, `blocked`, `idle`
- Validação de `targetOrigin` para postMessage (nunca `*`)

---

## 🩺 Controle de Acesso por Perfil (Gateways)

Os usuários do ecossistema são categorizados em quatro perfis principais em
`src/contexts/AuthContext.tsx`:

```typescript
type UserProfile = 'medico' | 'estudante' | 'profissional' | 'paciente';
```

### Gate Clínico de Segurança:
```typescript
const isPro = profile === 'medico' || profile === 'estudante' || profile === 'profissional';
```

- **Médicos/Estudantes:** Acesso completo a todos os submódulos clínicos (PROTTO, CASES,
  LOGBOOK, WHISPER, LAUDO-IA, PROCOD, OCR).
- **Pacientes/Fonoaudiólogos:** Limitação a ferramentas públicas e de reabilitação
  (Zumbido, Check, Peri-op, Games, Voz).

### Premium Gate:
- Módulos premium marcados com `premium: true` no `config/modules.ts`
- Controlado por `isPremium` + `subscriptionPlan` no AuthContext
- Gateway de pagamento não implementado ainda (desativado para MVP)

---

## ⚙️ Variáveis de Ambiente

```env
VITE_FIREBASE_API_KEY=<Firebase Console>
VITE_FIREBASE_AUTH_DOMAIN=otto-ecosystem.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=otto-ecosystem
VITE_FIREBASE_STORAGE_BUCKET=otto-ecosystem.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=<Firebase Console>
VITE_FIREBASE_APP_ID=<Firebase Console>
VITE_FIREBASE_MEASUREMENT_ID=<Firebase Console>
```

> ⚠️ Firebase Web API keys são públicas por design, mas NÃO devem ser commitadas em .md.
> Valores reais: Firebase Console → otto-ecosystem → Project Settings → Your apps

---

## 🛡️ Políticas de Segurança (CSP & Headers)

As diretivas de CSP estão definidas no `vercel.json`:

### Content Security Policy
- **frame-src:** Permitidos apenas domínios do ecossistema:
  - `*.vercel.app`, `*.drdariohart.com`, `dhsig86.github.io`, `youtube-nocookie.com`
  - `otto-whisper.netlify.app`, `tally.so`, `*.firebaseapp.com`
  - `otto-ai-triagem-*.herokuapp.com`
- **frame-ancestors:** `'self' https://*.drdariohart.com https://*.vercel.app`
- **connect-src:** Firebase APIs, Google Auth, Firestore, Analytics
- **script-src:** Google Tag Manager, Analytics, Firebase Auth, `'unsafe-inline'`

### Outros Headers
- **Cross-Origin-Opener-Policy:** `same-origin-allow-popups` (Google SSO)
- **X-Frame-Options:** `SAMEORIGIN`
- **X-Content-Type-Options:** `nosniff`

### HTTPS Redirect
Redirect permanente de HTTP → HTTPS para `otto.drdariohart.com`.

---

## 🏗️ Deploy

| Item               | Valor                                    |
|---------------------|------------------------------------------|
| Plataforma          | Vercel                                   |
| Framework           | Vite (SPA)                               |
| URL de Produção     | `https://otto.drdariohart.com`           |
| Aliases             | `ottos-plum.vercel.app`, `ottopwa.vercel.app` |
| Porta Dev           | 5173                                     |
| SPA Rewrite         | `/(.*) → /index.html`                   |
| Build Command       | `tsc -b && vite build`                   |
| Output Directory    | `dist/`                                  |

---

## 🗃️ Firestore — Coleções do PWA

| Coleção              | Descrição                                        |
|----------------------|--------------------------------------------------|
| `users/{uid}`        | Perfil do usuário (nome, profile, premium, onboarding) |

---

## 📱 Rotas da Aplicação

| Rota                   | Componente       | Auth    | Descrição                          |
|------------------------|------------------|---------|------------------------------------|
| `/login`               | Login            | Público | Tela de login                      |
| `/complete-profile`    | CompleteProfile  | Auth    | Completar perfil                   |
| `/onboarding`          | Onboarding       | Private | Tour guiado                        |
| `/`                    | Home             | Private | Dashboard principal                |
| `/search`              | Search           | Private | Busca global                       |
| `/notifications`       | Notifications    | Private | Central de notificações            |
| `/profile`             | Profile          | Private | Perfil do usuário                  |
| `/modules/webview`     | ModuleFrame      | Private | iframe loader genérico             |
| `/modules/videos`      | VideoChannels    | Private | Vídeos educativos                  |
| `/modules/feedback`    | Feedback         | Private | Formulário de feedback             |
| `/modules/periop`      | PeriOp           | Private | Protocolos peri-operatórios        |
| `/modules/info`        | InfoPage         | Private | Pílulas científicas                |
| `/modules/premium`     | PremiumPage      | Private | Página de assinatura               |

---

## 📋 Regras para Agentes

1. O PWA é o **shell central** — qualquer mudança impacta todos os módulos
2. Nunca alterar os contratos de `postMessage` sem coordenar com os submódulos
3. O Concierge opera **local-first** — não adicionar chamadas a LLM sem necessidade
4. O `registry.ts` é a **fonte da verdade** para URLs e capabilities dos módulos
5. Manter compatibilidade com os 4 perfis de usuário em toda mudança de UI
6. `frame-src` e `frame-ancestors` devem ser restritivos — nunca `*`
7. O `vercel.json` é crítico para segurança — nunca relaxar CSP sem revisão
8. Preferir patch cirúrgico a refatoração massiva
9. Todas as páginas são lazy-loaded — manter esse padrão
10. O AuthContext é complexo (~250 linhas) — testar regressão após edições
