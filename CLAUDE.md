# OTTO PWA — Contexto para Claude

## Deploy
- Plataforma: Firebase Hosting (ou Vercel — verificar config atual)
- Remote git: **`origin`**
- Branch: **`main`**
- Comando: `git push origin main`
- Build: `npm run build` → `dist/`

## Stack
- React + TypeScript + Vite
- Tailwind CSS
- Firebase Auth + Firestore

15: ## Estrutura Relevante
16: ```
17: src/
18:   config/
19:     modules.ts            ← Dicionário de metadados e tags dos módulos (busca e renderização)
20:   pages/
21:     Search.tsx            ← Tela de busca offline global (Unicode normalized / NFD)
22:     modules/
23:       VideoChannels.tsx   ← canais de vídeo ORL (paciente + residentes)
24:       Feedback.tsx        ← Central de Feedback & FAQ integrada ao Firestore
25:       InfoPage.tsx        ← OTTO Update (Pílulas Clínicas consolidadas + Quiz de fixação)
26:   contexts/
27:     AuthContext.tsx       ← profile: 'medico' | 'estudante' | 'profissional' | 'paciente'
28: ```
29: 
30: ## Lógica de Acesso (gate)
31: ```typescript
32: const isPro = profile === 'medico' || profile === 'estudante' || profile === 'profissional';
33: ```
34: - Canal Paciente (OTTORRINDO E ILUSTRANDO): sempre visível
35: - Canal Residentes (ORL para Residentes): só para `isPro`
36: 
37: ## Playlists YouTube
38: - Paciente: `PL4f19b4zuy8flHTkM-I2C3m4hKnswvUPZ`
39: - Residentes: `PL4f19b4zuy8fGhD1nDOG3Lqt6b28t3dYa`
40: 
41: ## Convenções de Desenvolvimento e Qualidade
42: 1. **Busca Offline:** Em `Search.tsx`, sempre normalizar os caracteres com `.normalize("NFD").replace(/[\u0300-\u036f]/g, "")` para pesquisas case- e accent-insensitive sobre a base de dados local.
43: 2. **Segurança de Feedback:** Em `Feedback.tsx`, persistir feedbacks sob `feedbacks/` no Firestore atrelando o `userId` e o `email` da sessão ativa.
44: 3. **OTTO Update:** A tela `InfoPage.tsx` consome dados de `otto_pills` no Firestore, permitindo que o médico salve favoritos e registre leituras diárias (progresso persistido em `users/{uid}/favoritos_news` e `users/{uid}/leituras_news`).
45: 
46: ## Git
47: - Remote: `origin` (GitHub)
48: - Commits recentes usaram git plumbing (NTFS) — mesmo padrão do otto-ai-triagem se necessário
49: 
50: ## Dev local
51: ```bash
52: npm run dev # → http://localhost:5173
53: ```

