import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  // CORS Headers para permitir chamadas de origens de desenvolvimento locais se necessário
  response.setHeader('Access-Control-Allow-Credentials', 'true');
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  response.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const { text } = request.body;
  if (!text) {
    return response.status(400).json({ error: 'Text parameter is required' });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    // Retornamos 500 informando que a chave não está configurada (caso de desenvolvimento local sem .env completo)
    return response.status(500).json({ error: 'DeepSeek API Key not configured' });
  }

  try {
    const apiResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `Você é o classificador de intenções clínicas do ecossistema OTTO.
Sua tarefa é analisar o texto do usuário e retornar um JSON contendo a intenção classificada.

As intenções possíveis são:
1. "calc.list" - Listar ou mostrar calculadoras disponíveis.
2. "calc.open" - Abrir uma calculadora específica. Exemplos: "snot-22", "epworth", "dhi", "tnm", "house-brackmann", "comq-12", "centor".
3. "procod.search_code" - Buscar código CID, CBHPM ou TUSS de procedimentos (ex: "cid faringite", "tuss amigdalectomia").
4. "ocr.extract" - Ler laudo, PDF, imagem ou exame usando OCR.
5. "video.search" - Buscar aulas ou vídeos educativos.
6. "bottok.ask" - Perguntar dúvidas gerais sobre medicina, diagnósticos, condutas e diretrizes clínicas (ex: "red flags otite", "conduta para epistaxe").
7. "whisper.transcribe" - Transcrever consulta, ditar evolução ou usar gravador/escriba médico.
8. "autolaudo.prepare_report" - Preparar modelo de laudo por voz ou laudo IA (ex: "laudo laringoscopia").
9. "cases.create_draft" - Criar relato de caso clínico ou rascunho de caso.
10. "protto.search_protocol" - Buscar conduta, protocolo clínico ou guideline no prontuário PROTTO.
11. "concierge.help" - Ajuda sobre o sistema, lista de módulos ou manual de uso.
12. "triagem.open" - Iniciar triagem ou anamnese pré-consulta de sintomas (ex: dor de ouvido, nariz entupido).
13. "profile.open" - Configurações, conta, cadastro ou LGPD.

Retorne APENAS um objeto JSON válido, sem markdown ou blocos de código adicionais, no formato:
{
  "intentId": "id_da_intencao_ou_null",
  "confidence": 0.0 a 1.0,
  "extractedEntities": {
    "calculatorName": "nome_se_houver_ou_null",
    "searchTerm": "termo_se_houver_ou_null"
  }
}`
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' }
      })
    });

    if (!apiResponse.ok) {
      const errText = await apiResponse.text();
      return response.status(502).json({ error: `DeepSeek API error: ${errText}` });
    }

    const data = await apiResponse.json();
    const result = JSON.parse(data.choices[0].message.content);
    return response.status(200).json(result);
  } catch (error: any) {
    return response.status(500).json({ error: error.message });
  }
}
