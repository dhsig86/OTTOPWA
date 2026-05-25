# OTTO PWA — Contexto Técnico de Desenvolvimento (LLM/Agente)

O **OTTO PWA** é o shell/hub principal do ecossistema. Ele atua como um orquestrador que embarca os demais submódulos via `iframe` ou `webview` seguro, gerencia o estado global de autenticação (Firebase Auth) e hospeda o **OTTO Concierge** (o copiloto inteligente de inteligibilidade clínica e navegação).

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
  # Gera o bundle otimizado em dist/
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

- **Core:** React 18 + TypeScript + Vite.
- **Estilização:** Tailwind CSS v4.
- **Roteamento:** React Router DOM (roteamento SPA).
- **Backend-as-a-Service:** Firebase Auth (Google SSO + login por email) e Firestore.
- **PWA Capabilities:** Service Worker configurado via `vite-plugin-pwa`.
- **Animações:** Framer Motion (transições de telas, drawer e concierge).

---

## 📡 Arquitetura de Comunicação: `postMessage` API

A integração de submódulos rodando dentro de iframes é mantida por um barramento bidirecional de mensagens baseado em `window.postMessage`.

### 1. Handshake e Envio de Contexto (`PWA Shell` → `Submódulo`)
O componente `src/components/ModuleFrame.tsx` estabelece o handshake. Ao carregar o iframe, o PWA envia o contexto do usuário e paciente em um loop de retry de 3 iterações (a 0s, 2s e 4s) para garantir que o submódulo esteja pronto para capturar:

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
O submódulo responde indicando que está carregado e enviando suas capacidades funcionais:
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
Os submódulos podem enviar a mensagem `otto-request-refresh` se receberem `401 Unauthorized` de suas próprias APIs. O PWA intercepta, renova o token Firebase em segundo plano e reenvia via `otto-context`.

---

## 🩺 Controle de Acesso por Perfil (Gateways)

Os usuários do ecossistema são categorizados em quatro perfis principais em `src/contexts/AuthContext.tsx`:
`'medico' | 'estudante' | 'profissional' | 'paciente'`.

### Gate Clínico de Segurança:
```typescript
const isPro = profile === 'medico' || profile === 'estudante' || profile === 'profissional';
```
- **Médicos/Estudantes:** Acesso completo a todos os submódulos clínicos (`PROTTO`, `CASES`, `LOGBOOK`, `WHISPER`, `LAUDO-IA`, `PROCOD`, `OCR`).
- **Pacientes/Fonoaudiólogos:** Limitação a ferramentas públicas e de reabilitação (`Zumbido`, `Check`, `Peri-op`, `Games`, `Voz`).

---

## 🤖 OTTO Concierge: Orquestração e Lógica

O Concierge reside em `src/concierge/` e atua em modo híbrido local.

### Estrutura de Arquivos:
- [registry.ts](file:///c:/Users/drdhs/OneDrive/Documentos/AOTTO%20ECOSYSTEM/OTTO%20PWA/otto-pwa/src/concierge/registry.ts): Cadastro estático das URLs canônicas e capacidades dos módulos.
- [intents.ts](file:///c:/Users/drdhs/OneDrive/Documentos/AOTTO%20ECOSYSTEM/OTTO%20PWA/otto-pwa/src/concierge/intents.ts): Definição de intenções clínicas e termos correspondentes.
- [capabilities_db.ts](file:///c:/Users/drdhs/OneDrive/Documentos/AOTTO%20ECOSYSTEM/OTTO%20PWA/otto-pwa/src/concierge/capabilities_db.ts): Base de conhecimento de recursos dos 15 módulos clínicos/pacientes para alimentar o fluxo de ajuda do Concierge.
- [core.ts](file:///c:/Users/drdhs/OneDrive/Documentos/AOTTO%20ECOSYSTEM/OTTO%20PWA/otto-pwa/src/concierge/core.ts): Motor de classificação local. Captura intenções com threshold mínimo de `0.6` e intercepta `concierge.help` para guiar o usuário em linguagem amigável (técnica para médicos, simples para pacientes).
- [adapters.ts](file:///c:/Users/drdhs/OneDrive/Documentos/AOTTO%20ECOSYSTEM/OTTO%20PWA/otto-pwa/src/concierge/adapters.ts): Adaptadores de tráfego de dados. O adaptador `'cases'` usa `'deeplink'` para enviar a queixa capturada via query parameters `?draft=` ao editor do Cases.

---

## 🛡️ Políticas de Segurança (CORS & CSP)

As diretivas de CSP e iframe estão definidas no [vercel.json](file:///c:/Users/drdhs/OneDrive/Documentos/AOTTO%20ECOSYSTEM/OTTO%20PWA/otto-pwa/vercel.json):
- **frame-src:** Permitidos apenas os domínios do ecossistema (`*.vercel.app`, `*.drdariohart.com`, `netlify.app`, `github.io`, `youtube-nocookie.com`).
- **frame-ancestors:** Restrito a `'self'` e origens autorizadas da clínica para evitar ataques de Clickjacking.
- **Cross-Origin-Opener-Policy (COOP):** Configurado como `same-origin-allow-popups` para permitir o fluxo do Google SSO Firebase.
