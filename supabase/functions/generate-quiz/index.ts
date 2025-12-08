import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { Configuration, OpenAIApi } from "https://esm.sh/openai@3.2.1"

declare const Deno: any;

const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', }

serve(async (req) => { 
  // 1. Gestion CORS (Pour que ton site Vite puisse appeler la fonction)
  if (req.method === 'OPTIONS') { 
    return new Response('ok', { headers: corsHeaders }) 
  }

  try { 
    const { module } = await req.json()

    // 2. Connexion Supabase (Admin) & OpenAI
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    const configuration = new Configuration({ apiKey: Deno.env.get('OPENAI_API_KEY') }) 
    const openai = new OpenAIApi(configuration)

    // --- MAPPING INTELLIGENT (Data Cleaning à la volée) ---
    let searchKeyword = module;
    let filterYear = null; // Pour l'instant null, mais prêt pour le futur

    // 1. Gestion ANATOMIE (S1 vs S2)
    if (module === 'Anatomie 1') {
      searchKeyword = 'Anatomie 1'; // Vise "Anatomie 1" (853 docs)
    } else if (module === 'Anatomie 2') {
      searchKeyword = 'Anatomie l'; // Vise "Anatomie ll" (OCR error) ou "Anatomie II"
    } else if (module.includes('Anatomie')) {
      searchKeyword = 'Anatomie'; // Fallback générique
    }
    // 2. Autres mappings basés sur l'audit Data
    else if (module.includes('Cardio')) searchKeyword = 'Cardio';
    else if (module.includes('Pneumo') || module.includes('Respiratoire')) searchKeyword = 'Respiratoire';
    else if (module.includes('Digestif') || module.includes('Gastro')) searchKeyword = 'Digestif';

    // 3. RAG : Recherche des documents (Fonction match_documents existante)
    const embeddingResponse = await openai.createEmbedding({
      model: 'text-embedding-3-small',
      input: `QCM examen médecine sur ${module}`,
    })
    const embedding = embeddingResponse.data.data[0].embedding
    
    // Appel RPC mis à jour avec filter_module et filter_year
    const { data: chunks } = await supabaseClient.rpc('match_documents', {
      query_embedding: embedding,
      match_threshold: 0.3,
      match_count: 5,
      filter_types: ['ANNALE', 'EXERCICE', 'EXERCICE_TP'],
      filter_module: searchKeyword,
      filter_year: filterYear
    })
    
    const context = chunks?.map((c: any) => c.content).join('\n---\n') || ""

    // 4. Génération du Quiz
    const completion = await openai.createChatCompletion({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: `Tu es un expert médical. Génère un QCM difficile sur : ${module}.
          CONTEXTE : ${context}
          FORMAT JSON STRICT :
          {
            "question": "Énoncé",
            "options": [{"id": "A", "text": "..."}, {"id": "B", "text": "..."}],
            "correct_id": "A",
            "explanation": "Explication pédagogique.",
            "source": "Basé sur les annales"
          }` 
        }
      ],
    })

    // 5. Réponse
    const quizData = JSON.parse(completion.data.choices[0].message?.content || "{}")
    return new Response(JSON.stringify(quizData), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, })

  } catch (error: any) { 
    return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400, }) 
  } 
})