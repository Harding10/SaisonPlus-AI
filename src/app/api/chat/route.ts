import { ai } from '@/ai/genkit';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1];

    const { text } = await ai.generate({
      prompt: lastMessage.content,
      system: `Tu es "Génie Rural", l'assistant IA expert de la plateforme SaisonPlus AI. 
      Ton rôle est d'aider les agronomes et les agriculteurs à interpréter les données satellites et à prendre des décisions.
      
      Directives :
      1. Sois professionnel, encourageant et précis.
      2. Utilise un vocabulaire agronomique correct (NDVI, stress hydrique, biomasse, semis, etc.).
      3. Tes réponses doivent être concises et orientées vers l'action.
      4. Si l'utilisateur pose une question sur sa parcelle, mentionne que les indices actuels (NDVI/NDWI) sont essentiels pour le diagnostic.
      5. Favorise toujours les pratiques agricoles durables et la souveraineté alimentaire.`,
    });

    return NextResponse.json({
      role: 'assistant',
      content: text,
    });
  } catch (error) {
    console.error('GenieRural API Error:', error);
    return NextResponse.json(
      { error: 'Désolé, je rencontre une difficulté technique pour analyser ces données.' },
      { status: 500 }
    );
  }
}
