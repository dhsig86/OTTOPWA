#!/usr/bin/env node
/**
 * OTTO UPDATE — Gerador de Pílulas Científicas
 *
 * Busca artigos reais no PubMed via E-utilities (gratuito, sem chave),
 * gera resumos interpretados com GPT-4o-mini e grava no Firestore.
 *
 * Uso:
 *   node scripts/generate-pills.mjs                  # 1 pílula
 *   node scripts/generate-pills.mjs --count 3        # 3 pílulas
 *   node scripts/generate-pills.mjs --tema Rinologia # tema específico
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// ─── Firebase Admin init ─────────────────────────────────────────────────────
const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
if (!serviceAccountJson) {
  console.error('❌ Defina FIREBASE_SERVICE_ACCOUNT_JSON como variável de ambiente.');
  process.exit(1);
}
const serviceAccount = JSON.parse(serviceAccountJson);
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

// ─── OpenAI config ───────────────────────────────────────────────────────────
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error('❌ Defina OPENAI_API_KEY como variável de ambiente.');
  process.exit(1);
}

// ─── Temas ORL curados ───────────────────────────────────────────────────────
const ORL_TOPICS = [
  { area: 'Rinologia', queries: [
    'chronic rhinosinusitis treatment', 'nasal polyps biologics',
    'allergic rhinitis management', 'endoscopic sinus surgery outcomes',
    'epistaxis management', 'olfactory dysfunction COVID',
  ]},
  { area: 'Otologia', queries: [
    'sudden sensorineural hearing loss', 'chronic otitis media treatment',
    'cochlear implant outcomes', 'tinnitus management',
    'cholesteatoma surgery', 'otosclerosis stapedectomy',
    'benign paroxysmal positional vertigo', 'Meniere disease treatment',
  ]},
  { area: 'Laringologia', queries: [
    'vocal fold paralysis treatment', 'laryngopharyngeal reflux',
    'spasmodic dysphonia botulinum', 'voice therapy dysphonia',
    'laryngeal cancer early diagnosis', 'subglottic stenosis treatment',
  ]},
  { area: 'Cabeça e Pescoço', queries: [
    'thyroid nodule management', 'parotid tumor surgery',
    'head neck squamous cell carcinoma immunotherapy',
    'obstructive sleep apnea surgery', 'tracheostomy outcomes',
  ]},
  { area: 'Pediatria ORL', queries: [
    'adenotonsillectomy children outcomes', 'pediatric hearing screening',
    'pediatric airway obstruction', 'otitis media with effusion management',
    'pediatric obstructive sleep apnea',
  ]},
  { area: 'Vestibular', queries: [
    'vestibular rehabilitation', 'vestibular neuritis treatment',
    'vestibular migraine diagnosis', 'superior canal dehiscence',
  ]},
  { area: 'Vanguarda ORL', queries: [
    'artificial intelligence otolaryngology', 'gene therapy hearing loss',
    '3D printing otolaryngology', 'robotic surgery head neck',
    'telemedicine ENT', 'regenerative medicine inner ear',
  ]},
];

// ─── PubMed E-utilities ──────────────────────────────────────────────────────
const PUBMED_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

async function searchPubMed(queryTerm) {
  const params = new URLSearchParams({
    db: 'pubmed',
    term: `${queryTerm} AND (Review[pt] OR Meta-Analysis[pt] OR Randomized Controlled Trial[pt]) AND ("last 3 years"[PDat])`,
    retmax: '8',
    sort: 'relevance',
    retmode: 'json',
  });

  const res = await fetch(`${PUBMED_BASE}/esearch.fcgi?${params}`);
  const data = await res.json();
  return data.esearchresult?.idlist || [];
}

async function fetchArticleDetails(pmids) {
  if (!pmids.length) return [];
  const params = new URLSearchParams({
    db: 'pubmed',
    id: pmids.join(','),
    retmode: 'xml',
    rettype: 'abstract',
  });

  const res = await fetch(`${PUBMED_BASE}/efetch.fcgi?${params}`);
  const xml = await res.text();

  // Parse XML manually (no external deps)
  const articles = [];
  const articleBlocks = xml.split('<PubmedArticle>').slice(1);

  for (const block of articleBlocks) {
    try {
      const title = block.match(/<ArticleTitle>([\s\S]*?)<\/ArticleTitle>/)?.[1]?.replace(/<[^>]+>/g, '').trim() || '';
      const journal = block.match(/<Title>([\s\S]*?)<\/Title>/)?.[1]?.trim() || '';
      const year = block.match(/<PubDate>[\s\S]*?<Year>(\d{4})<\/Year>/)?.[1] || '';
      const pmid = block.match(/<PMID[^>]*>(\d+)<\/PMID>/)?.[1] || '';
      const abstractText = block.match(/<AbstractText[^>]*>([\s\S]*?)<\/AbstractText>/g)
        ?.map(t => t.replace(/<[^>]+>/g, '').trim())
        .join(' ') || '';

      // Extract first 3 authors
      const authorMatches = [...block.matchAll(/<LastName>(.*?)<\/LastName>[\s\S]*?<Initials>(.*?)<\/Initials>/g)];
      const authors = authorMatches.slice(0, 3).map(m => `${m[1]} ${m[2]}`).join(', ');
      const authorStr = authorMatches.length > 3 ? `${authors}, et al.` : authors;

      if (title && pmid) {
        articles.push({
          titulo: title,
          revista: journal,
          ano: year,
          autores: authorStr,
          link: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
          pmid,
          abstract: abstractText.slice(0, 1500),
        });
      }
    } catch (e) {
      // Skip malformed entries
    }
  }

  return articles;
}

// ─── GPT-4o-mini sumarização ─────────────────────────────────────────────────
async function generatePillContent(articles, area) {
  const articleSummaries = articles.map((a, i) =>
    `ARTIGO ${i + 1}:\nTítulo: ${a.titulo}\nRevista: ${a.revista} (${a.ano})\nAutores: ${a.autores}\nResumo: ${a.abstract}`
  ).join('\n\n');

  const systemPrompt = `Você é um especialista em Otorrinolaringologia e Cirurgia de Cabeça e Pescoço, criando pílulas de conhecimento científico para médicos otorrinolaringologistas brasileiros. Responda SEMPRE em português brasileiro médico formal.`;

  const userPrompt = `Com base nos artigos abaixo da área de ${area}, gere uma pílula científica no formato JSON com EXATAMENTE esta estrutura:

${articleSummaries}

Retorne APENAS um JSON válido (sem markdown, sem \`\`\`):
{
  "tema": "Título conciso e impactante da pílula (max 80 caracteres)",
  "especialidade": "${area}",
  "tempo_leitura_min": 5,
  "consenso_cientifico": "Análise crítica integrando os achados dos artigos. 3-5 frases com dados quantitativos quando disponíveis. Mencione nível de evidência.",
  "pratica_clinica": "Takeaway prático para o consultório do otorrino. Conduta específica, dose se aplicável, e dica de implementação imediata. 2-3 frases.",
  "revelacao_central": "A conclusão-chave em no máximo 15 palavras",
  "insight_grafico": {
    "tipo": "comparacao",
    "titulo": "Título curto do gráfico",
    "dados": [
      { "label": "Grupo/Tratamento A", "valor": 75, "unidade": "%" },
      { "label": "Grupo/Tratamento B", "valor": 45, "unidade": "%" }
    ]
  },
  "quiz_curiosidade": {
    "pergunta": "Pergunta clínica baseada no conteúdo da pílula",
    "alternativas": ["A) ...", "B) ...", "C) ...", "D) ..."],
    "resposta_correta": "A alternativa correta, copiada exatamente",
    "explicacao": "Explicação breve e didática da resposta"
  }
}

REGRAS:
- insight_grafico.tipo pode ser "comparacao" (2-4 barras), "percentual" (1 valor principal 0-100), ou "timeline" (2-4 marcos temporais com valor numérico)
- Para "timeline", use { "label": "Ano/Fase", "valor": número }
- Valores numéricos devem ser realistas e baseados nos dados dos artigos
- O quiz deve ter exatamente 4 alternativas
- revelacao_central deve ser memorável e impactante`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    }),
  });

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new Error(`GPT retornou vazio. Response: ${JSON.stringify(data)}`);
  }

  // Parse JSON (handle possible markdown wrapper)
  let cleaned = content;
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }

  return JSON.parse(cleaned);
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function generateOnePill(forcedArea) {
  // Pick random topic
  const topicGroup = forcedArea
    ? ORL_TOPICS.find(t => t.area.toLowerCase() === forcedArea.toLowerCase()) || ORL_TOPICS[Math.floor(Math.random() * ORL_TOPICS.length)]
    : ORL_TOPICS[Math.floor(Math.random() * ORL_TOPICS.length)];

  const queryTerm = topicGroup.queries[Math.floor(Math.random() * topicGroup.queries.length)];

  console.log(`\n🔍 Buscando PubMed: "${queryTerm}" (${topicGroup.area})...`);

  // Search PubMed
  const pmids = await searchPubMed(queryTerm);
  if (pmids.length < 2) {
    console.log(`⚠️  Poucos resultados para "${queryTerm}". Tentando query mais ampla...`);
    const broadPmids = await searchPubMed(queryTerm.split(' ').slice(0, 2).join(' ') + ' otolaryngology review');
    pmids.push(...broadPmids);
  }

  const selectedPmids = pmids.slice(0, 3);
  console.log(`📄 PMIDs encontrados: ${selectedPmids.join(', ')}`);

  // Fetch article details
  const articles = await fetchArticleDetails(selectedPmids);
  if (articles.length < 1) {
    throw new Error('Nenhum artigo com dados suficientes encontrado.');
  }
  console.log(`📚 ${articles.length} artigos com abstract carregados.`);

  // Generate pill content with GPT
  console.log(`🤖 Gerando pílula com GPT-4o-mini...`);
  const pillContent = await generatePillContent(articles, topicGroup.area);

  // Compose final document
  const today = new Date().toISOString().slice(0, 10);
  const pillId = `pill_${today}_${Date.now()}`;

  const pillDoc = {
    ...pillContent,
    id: pillId,
    data_exibicao: today,
    artigos: articles.map(a => ({
      titulo: a.titulo,
      revista: a.revista,
      ano: a.ano,
      autores: a.autores,
      link: a.link,
    })),
    pmids: articles.map(a => a.pmid),
    fonte: 'pubmed_real',
    gerado_em: new Date().toISOString(),
  };

  // Save to Firestore
  console.log(`💾 Gravando no Firestore (otto_pills/${pillId})...`);
  await db.collection('otto_pills').doc(pillId).set(pillDoc);

  console.log(`✅ Pílula gerada com sucesso!`);
  console.log(`   Tema: ${pillDoc.tema}`);
  console.log(`   Área: ${pillDoc.especialidade}`);
  console.log(`   Revelação: ${pillDoc.revelacao_central}`);
  console.log(`   Artigos: ${pillDoc.artigos.length}`);
  console.log(`   PMIDs: ${pillDoc.pmids.join(', ')}`);

  return pillDoc;
}

// ─── CLI ─────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const countIdx = args.indexOf('--count');
const count = countIdx !== -1 ? parseInt(args[countIdx + 1], 10) || 1 : 1;
const temaIdx = args.indexOf('--tema');
const tema = temaIdx !== -1 ? args[temaIdx + 1] : null;

console.log(`\n🧬 OTTO UPDATE — Gerador de Pílulas Científicas`);
console.log(`   Gerando ${count} pílula(s)${tema ? ` na área "${tema}"` : ' com tema aleatório'}...\n`);

let successCount = 0;
let failCount = 0;

for (let i = 0; i < count; i++) {
  try {
    console.log(`\n━━━ Pílula ${i + 1}/${count} ━━━`);
    await generateOnePill(tema);
    successCount++;
    // Delay between generations to respect rate limits
    if (i < count - 1) {
      console.log('⏳ Aguardando 2s antes da próxima...');
      await new Promise(r => setTimeout(r, 2000));
    }
  } catch (err) {
    console.error(`❌ Erro ao gerar pílula ${i + 1}:`, err.message);
    failCount++;
  }
}

console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`📊 Resultado: ${successCount} sucesso(s), ${failCount} falha(s)`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

process.exit(failCount > 0 ? 1 : 0);
