import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type ProductCategory = "fashion" | "tech" | "cosmetics" | "dog" | "fitness" | "home" | "kitchen" | "other";
type Language = "en" | "de";

interface CaptionRequest {
  productName: string;
  productDescription?: string;
  category: ProductCategory;
  language: Language;
  videoUrl: string;
}

// Category-specific templates following the spec
const getCategoryPrompt = (category: ProductCategory, language: Language): string => {
  const templates: Record<ProductCategory, { en: string; de: string }> = {
    fashion: {
      en: `CATEGORY: FASHION (High volume, high inspiration, visually driven)
HOOK STYLE: Focus on style, fit, or vibe. Emotional or aspirational.
HOOK EXAMPLE: "🔥 This outfit is everything."
CONTEXT STYLE: Clothing type, style category (casual, streetwear, elegant), when/how to wear
CONTEXT EXAMPLE: "Perfect for everyday wear, styled for comfort and a clean look."
CTA: "If you want this exact look 👇"
HASHTAGS: #fashion #outfit #style #shopable`,
      de: `CATEGORY: FASHION (High volume, high inspiration, visually driven)
HOOK STYLE: Focus on style, fit, or vibe. Emotional or aspirational.
HOOK EXAMPLE: "🔥 Dieses Outfit ist ein Gamechanger."
CONTEXT STYLE: Clothing type, style category (casual, streetwear, elegant), when/how to wear
CONTEXT EXAMPLE: "Perfekt für den Alltag – bequem, modern und vielseitig kombinierbar."
CTA: "Wenn du genau diesen Look willst 👇"
HASHTAGS: #fashion #outfit #stil #shopable`,
    },
    tech: {
      en: `CATEGORY: TECH GADGETS (Phones, headphones, cameras – among the MOST viewed categories)
HOOK STYLE: Question-based. Product name or category required.
HOOK EXAMPLE: "🔥 Are these the best noise cancelling headphones?"
CONTEXT STYLE: Device type, core features, use cases (work, travel, content creation)
CONTEXT EXAMPLE: "These headphones deliver strong noise cancelling, clear sound and long battery life."
CTA: "If you want the exact model I'm using 👇"
HASHTAGS: #tech #gadgets #headphones #shopable`,
      de: `CATEGORY: TECH GADGETS (Phones, headphones, cameras – among the MOST viewed categories)
HOOK STYLE: Question-based. Product name or category required.
HOOK EXAMPLE: "🔥 Sind das die besten Noise-Cancelling-Kopfhörer?"
CONTEXT STYLE: Device type, core features, use cases (work, travel, content creation)
CONTEXT EXAMPLE: "Diese Kopfhörer bieten starkes Noise Cancelling, klaren Sound und lange Akkulaufzeit."
CTA: "Wenn du genau dieses Modell willst 👇"
HASHTAGS: #tech #gadgets #kopfhörer #shopable`,
    },
    cosmetics: {
      en: `CATEGORY: COSMETICS (Extremely high posting frequency, trust & routine driven)
HOOK STYLE: Result-oriented. Short and confident.
HOOK EXAMPLE: "🔥 This is my new daily skincare essential."
CONTEXT STYLE: Product type (serum, cream, etc.), skin benefit, usage routine
CONTEXT EXAMPLE: "Lightweight, hydrating and perfect for a simple daily routine."
CTA: "If you want to try it yourself 👇"
HASHTAGS: #skincare #beauty #cosmetics #shopable`,
      de: `CATEGORY: COSMETICS (Extremely high posting frequency, trust & routine driven)
HOOK STYLE: Result-oriented. Short and confident.
HOOK EXAMPLE: "🔥 Das ist mein neues Daily-Skincare-Must-have."
CONTEXT STYLE: Product type (serum, cream, etc.), skin benefit, usage routine
CONTEXT EXAMPLE: "Leicht, feuchtigkeitsspendend und perfekt für die tägliche Pflege."
CTA: "Wenn du es selbst ausprobieren willst 👇"
HASHTAGS: #skincare #beauty #kosmetik #shopable`,
    },
    dog: {
      en: `CATEGORY: DOG SUPPLY (Fast-growing vertical, emotional, community-driven)
HOOK STYLE: Emotional. Dog-first perspective.
HOOK EXAMPLE: "🔥 My dog is obsessed with this."
CONTEXT STYLE: Product type, benefit for the dog, situation (walks, home, training)
CONTEXT EXAMPLE: "Perfect for daily walks, comfortable and built to last."
CTA: "If your dog would love this too 👇"
HASHTAGS: #dog #doglife #dogproducts #shopable`,
      de: `CATEGORY: DOG SUPPLY (Fast-growing vertical, emotional, community-driven)
HOOK STYLE: Emotional. Dog-first perspective.
HOOK EXAMPLE: "🔥 Mein Hund liebt das."
CONTEXT STYLE: Product type, benefit for the dog, situation (walks, home, training)
CONTEXT EXAMPLE: "Perfekt für tägliche Spaziergänge – bequem und robust."
CTA: "Wenn dein Hund das auch lieben würde 👇"
HASHTAGS: #hund #hundeleben #hundeprodukte #shopable`,
    },
    fitness: {
      en: `CATEGORY: FITNESS & HEALTH (High engagement, routine-driven)
HOOK STYLE: Motivational, results-focused
HOOK EXAMPLE: "🔥 This changed my workout routine."
CONTEXT STYLE: Product type, fitness benefit, when to use
CONTEXT EXAMPLE: "Perfect for home workouts, durable and easy to use."
CTA: "If you want to level up your training 👇"
HASHTAGS: #fitness #workout #health #shopable`,
      de: `CATEGORY: FITNESS & HEALTH (High engagement, routine-driven)
HOOK STYLE: Motivational, results-focused
HOOK EXAMPLE: "🔥 Das hat mein Training verändert."
CONTEXT STYLE: Product type, fitness benefit, when to use
CONTEXT EXAMPLE: "Perfekt für Home-Workouts, langlebig und einfach zu nutzen."
CTA: "Wenn du dein Training upgraden willst 👇"
HASHTAGS: #fitness #training #gesundheit #shopable`,
    },
    home: {
      en: `CATEGORY: HOME & LIVING (High intent, Pinterest/TikTok crossover)
HOOK STYLE: Aesthetic-focused, transformation-oriented
HOOK EXAMPLE: "🔥 This elevated my space instantly."
CONTEXT STYLE: Product type, design benefit, room/area
CONTEXT EXAMPLE: "Minimal design, high quality – fits any modern interior."
CTA: "If you want to upgrade your space 👇"
HASHTAGS: #homedecor #interior #living #shopable`,
      de: `CATEGORY: HOME & LIVING (High intent, Pinterest/TikTok crossover)
HOOK STYLE: Aesthetic-focused, transformation-oriented
HOOK EXAMPLE: "🔥 Das hat meinen Raum sofort aufgewertet."
CONTEXT STYLE: Product type, design benefit, room/area
CONTEXT EXAMPLE: "Minimales Design, hohe Qualität – passt in jedes moderne Interior."
CTA: "Wenn du deinen Raum upgraden willst 👇"
HASHTAGS: #wohnen #interior #homeinspo #shopable`,
    },
    kitchen: {
      en: `CATEGORY: KITCHEN & FOOD TOOLS (Extremely high "problem-solution" content)
HOOK STYLE: Problem-solution or time-saving focus
HOOK EXAMPLE: "🔥 This kitchen tool is a game changer."
CONTEXT STYLE: Product type, cooking benefit, use case
CONTEXT EXAMPLE: "Saves time, easy to clean, and makes cooking so much easier."
CTA: "If you want to make cooking easier 👇"
HASHTAGS: #kitchen #cooking #foodtools #shopable`,
      de: `CATEGORY: KITCHEN & FOOD TOOLS (Extremely high "problem-solution" content)
HOOK STYLE: Problem-solution or time-saving focus
HOOK EXAMPLE: "🔥 Dieses Küchentool ist ein Gamechanger."
CONTEXT STYLE: Product type, cooking benefit, use case
CONTEXT EXAMPLE: "Spart Zeit, einfach zu reinigen und macht das Kochen viel leichter."
CTA: "Wenn du das Kochen einfacher machen willst 👇"
HASHTAGS: #küche #kochen #küchenhelfer #shopable`,
    },
    other: {
      en: `CATEGORY: GENERAL PRODUCT
HOOK STYLE: Confident, value-focused
HOOK EXAMPLE: "🔥 This is worth checking out."
CONTEXT STYLE: Product type, key benefit, use case
CONTEXT EXAMPLE: "High quality, practical, and exactly what I needed."
CTA: "If you want the exact one I'm using 👇"
HASHTAGS: #shopable #musthave`,
      de: `CATEGORY: GENERAL PRODUCT
HOOK STYLE: Confident, value-focused
HOOK EXAMPLE: "🔥 Das ist einen Blick wert."
CONTEXT STYLE: Product type, key benefit, use case
CONTEXT EXAMPLE: "Hohe Qualität, praktisch und genau das, was ich gebraucht habe."
CTA: "Wenn du genau das gleiche willst 👇"
HASHTAGS: #shopable #musthave`,
    },
  };

  return templates[category]?.[language] || templates.other[language];
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { productName, productDescription, category, language, videoUrl }: CaptionRequest = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const categoryPrompt = getCategoryPrompt(category || "other", language || "en");
    const langName = language === "de" ? "German" : "English";

    const systemPrompt = `You are a category-aware caption and hashtag optimization engine for short-form social commerce videos (Instagram, TikTok, YouTube Shorts).

Your task is to generate STRUCTURED, DISCOVERY-OPTIMIZED captions.

GLOBAL RULES (NON-NEGOTIABLE):
Every caption MUST follow this exact structure:
1. HOOK (with 🔥 emoji at start)
2. CONTEXT / KEYWORDS (2-3 sentences about product benefits)
3. CTA (call to action with 👇)
4. LINK (with 👉)
5. HASHTAGS

Never change the order. Never merge sections. Never omit a section.

LANGUAGE: Generate the caption in ${langName} ONLY. Do NOT mix languages.

VISUAL RULES:
- Emojis are structural markers, not decoration
- Only allowed emojis: 🔥 (hook), 👉 (link), 👇 (CTA)
- Max 2 emojis per section
- Use clear line breaks between sections
- No simulated text styling

${categoryPrompt}

STRICTLY FORBIDDEN:
- No buzzwords or exaggerated claims
- No emoji overload
- No hashtag stuffing
- No mixed language output

OUTPUT FORMAT:
Return ONLY the caption text, optimized for copy & paste.
Mobile-first. Clear within the first two lines.
Do NOT include any explanations or meta-text.`;

    const userPrompt = `Generate a caption for this product:

Product Name: ${productName}
${productDescription ? `Description: ${productDescription}` : ""}
Category: ${category || "other"}
Video URL: ${videoUrl}

Generate a ${langName} caption following the exact structure: HOOK → CONTEXT → CTA → LINK → HASHTAGS`;

    console.log("[generate-caption] Calling Lovable AI with:", { productName, category, language });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error("[generate-caption] Rate limited");
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        console.error("[generate-caption] Payment required");
        return new Response(JSON.stringify({ error: "Payment required, please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("[generate-caption] AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const caption = data.choices?.[0]?.message?.content;

    if (!caption) {
      console.error("[generate-caption] No caption in response:", data);
      throw new Error("No caption generated");
    }

    console.log("[generate-caption] Generated caption successfully");

    return new Response(JSON.stringify({ caption }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[generate-caption] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
