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

## Estrutura Relevante
```
src/
  pages/
    modules/
      VideoChannels.tsx   ← canais de vídeo ORL (paciente + residentes)
  contexts/
    AuthContext.tsx       ← profile: 'medico' | 'estudante' | 'profissional' | 'paciente'
```

## Lógica de Acesso (gate)
```typescript
const isPro = profile === 'medico' || profile === 'estudante' || profile === 'profissional';
```
- Canal Paciente (OTTORRINDO E ILUSTRANDO): sempre visível
- Canal Residentes (ORL para Residentes): só para `isPro`

## Playlists YouTube
- Paciente: `PL4f19b4zuy8flHTkM-I2C3m4hKnswvUPZ`
- Residentes: `PL4f19b4zuy8fGhD1nDOG3Lqt6b28t3dYa`

## Git
- Remote: `origin` (GitHub)
- Commits recentes usaram git plumbing (NTFS) — mesmo padrão do otto-ai-triagem se necessário
