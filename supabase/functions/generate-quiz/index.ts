import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { Configuration, OpenAIApi } from "https://esm.sh/openai@3.2.1"

declare const Deno: any;

const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', }

serve(async (req) => { 
  // 1. Gestion CORS
  if (req.method === 'OPTIONS') { 
    return new Response('ok', { headers: corsHeaders }) 
  }

  try { 
    // Réception des paramètres étendus
    const { module, userId, mode } = await req.json()

    // 2. Connexion Supabase (Admin) & OpenAI
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    const configuration = new Configuration({ apiKey: Deno.env.get('OPENAI_API_KEY') }) 
    const openai = new OpenAIApi(configuration)

    // 3. Création de l'entrée Quiz en BDD
    const { data: quizData, error: quizError } = await supabaseClient
      .from('quizzes')
      .insert({
        user_id: userId,
        module: module,
        mode: mode || 'practice',
        status: 'IN_PROGRESS',
        total_questions: 5,
        score: 0
      })
      .select()
      .single();

    if (quizError) throw new Error("Erreur lors de la création du quiz: " + quizError.message);
    const quizId = quizData.id;

    // --- MAPPING INTELLIGENT (Data Cleaning à la volée) ---
    let searchKeyword = module;
    let filterYear = null; 

    // 1. Gestion ANATOMIE (S1 vs S2)
    if (module === 'Anatomie 1') {
      searchKeyword = 'Anatomie 1'; 
    } else if (module === 'Anatomie 2') {
      searchKeyword = 'Anatomie l'; 
    } else if (module.includes('Anatomie')) {
      searchKeyword = 'Anatomie';
    }
    // 2. Autres mappings
    else if (module.includes('Cardio')) searchKeyword = 'Cardio';
    else if (module.includes('Pneumo') || module.includes('Respiratoire')) searchKeyword = 'Respiratoire';
    else if (module.includes('Digestif') || module.includes('Gastro')) searchKeyword = 'Digestif';

    // 4. RAG : Recherche des documents
    const embeddingResponse = await openai.createEmbedding({
      model: 'text-embedding-3-small',
      input: `QCM examen médecine sur ${module}`,
    })
    const embedding = embeddingResponse.data.data[0].embedding
    
    const { data: chunks } = await supabaseClient.rpc('match_documents', {
      query_embedding: embedding,
      match_threshold: 0.3,
      match_count: 8, // Augmenté pour avoir assez de contexte pour 5 questions
      filter_types: ['ANNALE', 'EXERCICE', 'EXERCICE_TP'],
      filter_module: searchKeyword,
      filter_year: filterYear
    })
    
    const context = chunks?.map((c: any) => c.content).join('\n---\n') || ""

    // 5. Génération du Quiz (5 Questions)
    const promptSystem = `Tu es un professeur de médecine.
    CONTEXTE : ${context}
    TÂCHE : Génère 5 questions QCM difficiles et variées sur le module "${module}".

    FORMAT DE SORTIE (JSON Array strict) : [ { "question_text": "...", "options": [{"id": "A", "text": "..."}, {"id": "B", "text": "..."}], "correct_option_id": "A", "explanation": "Explication détaillée citant le contexte." }, ... ]`;

    const completion = await openai.createChatCompletion({
      model: "gpt-4o",
      messages: [
        { role: "system", content: promptSystem }
      ],
      temperature: 0.7
    })

    // Nettoyage et parsing de la réponse
    let content = completion.data.choices[0].message?.content || "[]";
    // Enlever les balises markdown si présentes
    content = content.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const questionsArray = JSON.parse(content);

    // 6. Sauvegarde des questions en BDD
    const questionsToInsert = questionsArray.map((q: any) => ({
      quiz_id: quizId,
      question_text: q.question_text,
      options: q.options,
      correct_option_id: q.correct_option_id,
      explanation: q.explanation
    }));

    const { error: questionsError } = await supabaseClient
      .from('quiz_questions')
      .insert(questionsToInsert);

    if (questionsError) throw new Error("Erreur lors de la sauvegarde des questions: " + questionsError.message);

    // 7. Réponse finale avec l'ID du quiz
    return new Response(JSON.stringify({ quizId }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, })

  } catch (error: any) { 
    return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400, }) 
  } 
})