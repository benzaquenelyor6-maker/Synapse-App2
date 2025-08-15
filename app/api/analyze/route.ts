import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

function getPrompt(action: string, courseText: string, subject: string) {
  const baseInstruction = `Tu es un expert dans l'analyse de textes académiques, spécialisé en ${subject || 'général'}. Analyse le texte de cours suivant.`;
  const textBlock = `Le texte du cours est le suivant :\n--- \n${courseText}\n---`;

  if (action === 'keywords') {
    return `
      ${baseInstruction}
      Extrais les 5 à 7 mots-clés ou concepts les plus importants. Pour chaque mot-clé, fournis une définition claire et concise (1-2 phrases maximum).
      ${textBlock}
      Réponds impérativement sous la forme d'un objet JSON. L'objet doit contenir une seule clé "keywords" qui est un tableau d'objets (chaque objet avec les clés "term" et "definition").
    `;
  }

  if (action === 'summary') {
    return `
      ${baseInstruction}
      Rédige un résumé clair, structuré et facile à comprendre du texte.
      ${textBlock}
      Réponds impérativement sous la forme d'un objet JSON. L'objet doit contenir une seule clé "summary" qui est une chaîne de caractères.
    `;
  }

  if (action === 'quiz') {
    return `
      ${baseInstruction}
      Génère un quiz de 5 questions à choix multiples (QCM) pour tester la compréhension du texte. Chaque question doit avoir 4 options de réponse, dont une seule est correcte.
      ${textBlock}
      Réponds impérativement sous la forme d'un objet JSON. L'objet doit contenir une seule clé "quiz" qui est un tableau d'objets. Chaque objet doit avoir trois clés : "question" (la question), "options" (un tableau de 4 chaînes de caractères), et "correctAnswer" (la chaîne de caractères de la bonne réponse).
    `;
  }

  throw new Error('Action non valide.');
}

export async function POST(req: Request) {
  try {
    const { courseText, subject, action } = await req.json();
    
    // --- LIGNE DE DÉBOGAGE ---
    console.log("Action reçue par le backend:", action);

    if (!courseText || !action) {
      return NextResponse.json({ error: "Le texte du cours ou l'action est manquant." }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = getPrompt(action, courseText, subject);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const jsonResponse = JSON.parse(cleanedText);

    return NextResponse.json(jsonResponse);

  } catch (error: any) {
    console.error("[API Route Error]:", error);
    if (error.message && error.message.includes('503')) {
        return NextResponse.json({ error: "Le service IA est actuellement surchargé. Veuillez réessayer dans quelques instants." }, { status: 503 });
    }
    return NextResponse.json({ error: "Une erreur est survenue lors de l'analyse." }, { status: 500 });
  }
}
