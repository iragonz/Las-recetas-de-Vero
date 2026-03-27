import { NextRequest } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json();
    // Use gemini-2.5-flash-lite — latest free tier model (15 RPM, 1000/day, supports vision)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

    if (action === 'photo-to-recipe') {
      const imagePart = {
        inlineData: {
          mimeType: data.mimeType,
          data: data.base64,
        },
      };
      const prompt = `Analiza esta imagen de comida y genera una receta completa en español.
Responde SOLO con un JSON válido (sin markdown, sin backticks) con esta estructura exacta:
{
  "nombre": "Nombre del plato",
  "ingredientes": "- ingrediente 1\n- ingrediente 2\n...",
  "categoria": ["Vitrocerámica"],
  "tipo": ["Carne/Pollo"],
  "tiempoPreparacion": 30,
  "observaciones": "Notas opcionales"
}
Las categorías posibles son: Airfryer, Vitrocerámica, Olla GM, Mambo, Sin cocinar.
Los tipos posibles son: Arroz, Carne/Pollo, Embutido, Huevos, Lácteos, Legumbres, Marisco, Pasta, Patatas, Pescado, Pizza, Queso, Setas, Sopas/Cremas, Tortilla, Verdura, Fruta.
Elige los que apliquen.`;

      const result = await model.generateContent([prompt, imagePart]);
      const text = result.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return Response.json({ error: 'No se pudo generar la receta', raw: text }, { status: 500 });
      }
      return Response.json(JSON.parse(jsonMatch[0]));
    }

    if (action === 'voice-to-recipe') {
      const result = await model.generateContent(
        `El usuario ha dictado la siguiente receta por voz. Estructura la información en un JSON válido.
Texto dictado: "${data.text}"

Responde SOLO con un JSON válido (sin markdown, sin backticks) con esta estructura exacta:
{
  "nombre": "Nombre del plato",
  "ingredientes": "- ingrediente 1\n- ingrediente 2\n...",
  "categoria": ["Vitrocerámica"],
  "tipo": ["Carne/Pollo"],
  "tiempoPreparacion": 30,
  "observaciones": "Notas opcionales"
}
Las categorías posibles son: Airfryer, Vitrocerámica, Olla GM, Mambo, Sin cocinar.
Los tipos posibles son: Arroz, Carne/Pollo, Embutido, Huevos, Lácteos, Legumbres, Marisco, Pasta, Patatas, Pescado, Pizza, Queso, Setas, Sopas/Cremas, Tortilla, Verdura, Fruta.`
      );
      const text = result.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return Response.json({ error: 'No se pudo estructurar la receta', raw: text }, { status: 500 });
      }
      return Response.json(JSON.parse(jsonMatch[0]));
    }

    if (action === 'text-to-recipe') {
      const result = await model.generateContent(
        `El usuario ha pegado el siguiente texto de una receta (probablemente generado por otra IA o copiado de internet).
Analiza el texto y extrae la información estructurada.

IMPORTANTE:
- El campo "instrucciones" debe ser el texto ORIGINAL tal cual, sin modificar ni resumir.
- Los ingredientes deben estar limpios y separados, uno por línea con guión.
- Identifica la categoría de cocción y el tipo de plato.

Texto de la receta:
"""
${data.text}
"""

Responde SOLO con un JSON válido (sin markdown, sin backticks) con esta estructura exacta:
{
  "nombre": "Nombre del plato",
  "ingredientes": "- ingrediente 1\n- ingrediente 2\n...",
  "instrucciones": "el texto original completo de las instrucciones tal cual",
  "categoria": ["Vitrocerámica"],
  "tipo": ["Carne/Pollo"],
  "tiempoPreparacion": 30,
  "observaciones": ""
}
Las categorías posibles son: Airfryer, Vitrocerámica, Olla GM, Mambo, Sin cocinar.
Los tipos posibles son: Arroz, Bebida, Caldo, Canapé, Carne/Pollo, Croquetas, Embutido, Empanadas, Fruta, Frutos secos, Hamburguesas, Huevos, Lácteos, Legumbres, Marisco, Pasta, Pastel salado, Patatas, Pescado, Pizza, Puré, Queso, Salsa, Setas, Sopas/Cremas, Tortilla, Tortitas, Verdura, Yogurt.
Elige los que apliquen. Si no estás seguro de la categoría, usa ["Vitrocerámica"].`
      );
      const text = result.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return Response.json({ error: 'No se pudo extraer la receta', raw: text }, { status: 500 });
      }
      return Response.json(JSON.parse(jsonMatch[0]));
    }

    if (action === 'suggest') {
      const result = await model.generateContent(
        `El usuario pregunta: "${data.question}"

Estas son las recetas que tiene disponibles:
${data.recipes.map((r: { nombre: string; tipo: string[]; ingredientes: string }) =>
  `- ${r.nombre} (${r.tipo.join(', ')}): ${r.ingredientes.substring(0, 100)}`
).join('\n')}

Responde de forma útil y concisa en español, sugiriendo recetas de la lista cuando sea posible.`
      );
      return Response.json({ response: result.response.text() });
    }

    return Response.json({ error: 'Acción no válida' }, { status: 400 });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Gemini API error:', err.message, err.stack);
    return Response.json({ error: `Error IA: ${err.message}` }, { status: 500 });
  }
}
