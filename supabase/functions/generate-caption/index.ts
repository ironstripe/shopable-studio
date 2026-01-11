import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type ProductCategory = "fashion" | "tech" | "cosmetics" | "dog" | "fitness" | "home" | "kitchen" | "other";
type Language = "en" | "de";

// Input validation schema
const VALID_CATEGORIES: ProductCategory[] = ["fashion", "tech", "cosmetics", "dog", "fitness", "home", "kitchen", "other"];
const VALID_LANGUAGES: Language[] = ["en", "de"];
const MAX_PRODUCT_NAME_LENGTH = 200;
const MAX_PRODUCT_DESCRIPTION_LENGTH = 1000;
const MAX_VIDEO_URL_LENGTH = 500;

interface ValidatedCaptionRequest {
  productName: string;
  productDescription?: string;
  productPrice?: string;
  productCurrency?: string;
  category: ProductCategory;
  language: Language;
  videoUrl: string;
  creatorId?: string;
  videoId?: string;
}

/**
 * Validate and sanitize the caption request
 */
function validateRequest(body: unknown): ValidatedCaptionRequest {
  if (!body || typeof body !== 'object') {
    throw new Error("Invalid request body");
  }

  const req = body as Record<string, unknown>;

  // Validate productName (required, string, max length)
  if (typeof req.productName !== 'string' || req.productName.trim().length === 0) {
    throw new Error("productName is required and must be a non-empty string");
  }
  if (req.productName.length > MAX_PRODUCT_NAME_LENGTH) {
    throw new Error(`productName must be at most ${MAX_PRODUCT_NAME_LENGTH} characters`);
  }

  // Validate productDescription (optional, string, max length)
  let productDescription: string | undefined;
  if (req.productDescription !== undefined && req.productDescription !== null) {
    if (typeof req.productDescription !== 'string') {
      throw new Error("productDescription must be a string");
    }
    if (req.productDescription.length > MAX_PRODUCT_DESCRIPTION_LENGTH) {
      throw new Error(`productDescription must be at most ${MAX_PRODUCT_DESCRIPTION_LENGTH} characters`);
    }
    productDescription = req.productDescription.trim() || undefined;
  }

  // Validate category (required, must be valid enum)
  const category = (req.category as string)?.toLowerCase() as ProductCategory;
  if (!VALID_CATEGORIES.includes(category)) {
    throw new Error(`category must be one of: ${VALID_CATEGORIES.join(", ")}`);
  }

  // Validate language (required, must be valid enum)
  const language = (req.language as string)?.toLowerCase() as Language;
  if (!VALID_LANGUAGES.includes(language)) {
    throw new Error(`language must be one of: ${VALID_LANGUAGES.join(", ")}`);
  }

  // Validate videoUrl (required, string, max length, basic URL format)
  if (typeof req.videoUrl !== 'string' || req.videoUrl.trim().length === 0) {
    throw new Error("videoUrl is required and must be a non-empty string");
  }
  if (req.videoUrl.length > MAX_VIDEO_URL_LENGTH) {
    throw new Error(`videoUrl must be at most ${MAX_VIDEO_URL_LENGTH} characters`);
  }
  // Basic URL validation
  try {
    new URL(req.videoUrl);
  } catch {
    throw new Error("videoUrl must be a valid URL");
  }

  // Validate creatorId (optional, uuid format)
  let creatorId: string | undefined;
  if (req.creatorId !== undefined && req.creatorId !== null) {
    if (typeof req.creatorId !== 'string') {
      throw new Error("creatorId must be a string");
    }
    // Basic UUID validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(req.creatorId)) {
      throw new Error("creatorId must be a valid UUID");
    }
    creatorId = req.creatorId;
  }

  // Validate videoId (optional, uuid format)
  let videoId: string | undefined;
  if (req.videoId !== undefined && req.videoId !== null) {
    if (typeof req.videoId !== 'string') {
      throw new Error("videoId must be a string");
    }
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(req.videoId)) {
      throw new Error("videoId must be a valid UUID");
    }
    videoId = req.videoId;
  }

  // Validate productPrice (optional, string)
  let productPrice: string | undefined;
  if (req.productPrice !== undefined && req.productPrice !== null) {
    if (typeof req.productPrice !== 'string') {
      throw new Error("productPrice must be a string");
    }
    productPrice = req.productPrice.trim() || undefined;
  }

  // Validate productCurrency (optional, string)
  let productCurrency: string | undefined;
  if (req.productCurrency !== undefined && req.productCurrency !== null) {
    if (typeof req.productCurrency !== 'string') {
      throw new Error("productCurrency must be a string");
    }
    productCurrency = req.productCurrency.trim() || undefined;
  }

  return {
    productName: req.productName.trim(),
    productDescription,
    productPrice,
    productCurrency,
    category,
    language,
    videoUrl: req.videoUrl.trim(),
    creatorId,
    videoId,
  };
}

/**
 * Sanitize text to prevent prompt injection attacks
 */
function sanitizeForPrompt(text: string): string {
  // Remove or escape characters that could break prompt structure
  return text
    .replace(/```/g, "'''") // Replace triple backticks
    .replace(/\n{3,}/g, "\n\n") // Limit consecutive newlines
    .replace(/[<>]/g, "") // Remove angle brackets
    .trim();
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
    // Parse and validate request body
    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate all input fields
    let validatedRequest: ValidatedCaptionRequest;
    try {
      validatedRequest = validateRequest(rawBody);
    } catch (validationError) {
      console.error("[generate-caption] Validation error:", validationError);
      return new Response(
        JSON.stringify({ error: validationError instanceof Error ? validationError.message : "Invalid input" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { productName, productDescription, productPrice, productCurrency, category, language, videoUrl, creatorId, videoId } = validatedRequest;
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const categoryPrompt = getCategoryPrompt(category, language);
    const langName = language === "de" ? "German" : "English";

    // Sanitize user inputs before embedding in prompt
    const sanitizedProductName = sanitizeForPrompt(productName);
    const sanitizedProductDescription = productDescription ? sanitizeForPrompt(productDescription) : undefined;
    const sanitizedVideoUrl = sanitizeForPrompt(videoUrl);
    
    // Format price for prompt (if available)
    const priceDisplay = productPrice && productCurrency 
      ? `${productPrice} ${productCurrency}` 
      : productPrice || "";

    const systemPrompt = `You are a category-aware caption and hashtag optimization engine for short-form social commerce videos (Instagram, TikTok, YouTube Shorts).

Your task is to generate STRUCTURED, DISCOVERY-OPTIMIZED captions.

GLOBAL RULES (NON-NEGOTIABLE):
Every caption MUST follow this exact structure:
1. HOOK (with 🔥 emoji at start) - short, impactful, mentions product naturally
2. CONTEXT / KEYWORDS (2-3 sentences about product benefits)${priceDisplay ? ` - mention price (${priceDisplay}) if it adds value` : ""}
3. CTA (call to action with 👇)
4. LINK (with 👉)
5. HASHTAGS (3-5 relevant hashtags)

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

Product Name: ${sanitizedProductName}
${sanitizedProductDescription ? `Description: ${sanitizedProductDescription}` : ""}
${priceDisplay ? `Price: ${priceDisplay}` : ""}
Category: ${category}
Video URL: ${sanitizedVideoUrl}

Generate a ${langName} caption following the exact structure: HOOK → CONTEXT → CTA → LINK → HASHTAGS`;

    console.log("[generate-caption] Calling Lovable AI with:", { productName: sanitizedProductName, category, language });

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

    // Track caption_generated event if creatorId and videoId are provided
    if (creatorId && videoId) {
      try {
        const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
        const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
        
        if (SUPABASE_URL && SUPABASE_ANON_KEY) {
          await fetch(`${SUPABASE_URL}/functions/v1/track-event`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              eventName: "caption_generated",
              creatorId,
              videoId,
              eventSource: "studio",
              properties: { source: "ai", language, category },
            }),
          });
          console.log("[generate-caption] Tracked caption_generated event");
        }
      } catch (trackError) {
        // Don't fail caption generation if tracking fails
        console.error("[generate-caption] Failed to track event:", trackError);
      }
    }

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
