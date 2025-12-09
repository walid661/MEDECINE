import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import OpenAI from "https://esm.sh/openai@4.20.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { module, userId, mode, userYear } = await req.json()

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    })

    // Create quiz entry
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

    if (quizError) throw new Error("Erreur DB Création Quiz: " + quizError.message);
    const quizId = quizData.id;

    // Intelligent module mapping
    let searchKeyword = module;
    let filterYear = userYear || null;

    if (module === 'Anatomie 1') searchKeyword = 'Anatomie 1';
    else if (module === 'Anatomie 2') searchKeyword = 'Anatomie l';
    else if (module.includes('Anatomie')) searchKeyword = 'Anatomie';
    else if (module.includes('Cardio')) searchKeyword = 'Cardio';
    else if (module.includes('Pneumo') || module.includes('Respiratoire')) searchKeyword = 'Respiratoire';
    else if (module.includes('Digestif') || module.includes('Gastro')) searchKeyword = 'Digestif';

    // Generate embedding
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: `QCM examen médecine sur ${module}`,
    });

    const embedding = embeddingResponse.data[0].embedding;

    // Search relevant documents
    const { data: chunks, error: rpcError } = await supabaseClient.rpc('match_documents', {
      query_embedding: embedding,
      match_threshold: 0.3,
      match_count: 8,
      filter_types: ['ANNALE', 'EXERCICE', 'EXERCICE_TP'],
      filter_module: searchKeyword,
      filter_year: filterYear
    });

    if (rpcError) {
      console.error("RPC Error:", rpcError);
      throw new Error("Erreur RPC Supabase: " + rpcError.message);
    }

    let context = chunks?.map((c: any) => c.content).join('\n---\n') || "";

    // Limit context to avoid timeouts
    if (context.length > 10000) {
      context = context.substring(0, 10000) + "...";
    }

    // Generate quiz with OpenAI
    let completion;
    try {
      const promptSystem = `Tu es un professeur de médecine.
CONTEXTE : ${context}
TÂCHE : Génère 5 questions QCM difficiles et variées sur le module "${module}".

FORMAT DE SORTIE (JSON Array strict) : [ { "question_text": "...", "options": [{"id": "A", "text": "..."}, {"id": "B", "text": "..."}], "correct_option_id": "A", "explanation": "Explication détaillée citant le contexte." }, ... ]`;

      completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: promptSystem }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      });
    } catch (openaiError: any) {
      console.error("OpenAI Error:", openaiError.message);
      throw new Error("Erreur génération OpenAI: " + openaiError.message);
    }

    let content = completion.choices[0].message.content || "[]";
    content = content.replace(/```json/g, '').replace(/```/g, '').trim();

    // Parse JSON response
    let questionsArray;
    try {
      const parsed = JSON.parse(content);
      if (!Array.isArray(parsed) && parsed.questions) {
        questionsArray = parsed.questions;
      } else if (Array.isArray(parsed)) {
        questionsArray = parsed;
      } else {
        console.error("Unexpected JSON format:", Object.keys(parsed));
        questionsArray = [];
      }
    } catch (e) {
      console.error("JSON parsing error:", e);
      throw new Error("Erreur format JSON IA");
    }

    // Save questions to database
    if (questionsArray.length > 0) {
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

      if (questionsError) {
        console.error("Insert Questions Error:", questionsError);
        throw new Error("Erreur Insert Questions: " + questionsError.message);
      }
    } else {
      throw new Error("Aucune question générée");
    }

    return new Response(JSON.stringify({ quizId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})