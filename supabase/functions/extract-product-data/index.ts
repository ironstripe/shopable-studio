import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ProductData {
  title?: string;
  description?: string;
  price?: string;
  currency?: string;
  imageUrl?: string;
  source: "opengraph" | "schema" | "ai" | "fallback";
}

// Extract OpenGraph meta tags from HTML
function extractOpenGraph(html: string): Partial<ProductData> {
  const result: Partial<ProductData> = {};
  
  // og:title
  const titleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i) ||
                     html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i);
  if (titleMatch) result.title = decodeHtmlEntities(titleMatch[1]);
  
  // og:description
  const descMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i) ||
                    html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:description["']/i);
  if (descMatch) result.description = decodeHtmlEntities(descMatch[1]);
  
  // og:image
  const imageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
                     html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
  if (imageMatch) result.imageUrl = imageMatch[1];
  
  // og:price:amount or product:price:amount
  const priceMatch = html.match(/<meta[^>]*property=["'](?:og:price:amount|product:price:amount)["'][^>]*content=["']([^"']+)["']/i) ||
                     html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["'](?:og:price:amount|product:price:amount)["']/i);
  if (priceMatch) result.price = priceMatch[1];
  
  // og:price:currency or product:price:currency
  const currencyMatch = html.match(/<meta[^>]*property=["'](?:og:price:currency|product:price:currency)["'][^>]*content=["']([^"']+)["']/i) ||
                        html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["'](?:og:price:currency|product:price:currency)["']/i);
  if (currencyMatch) result.currency = currencyMatch[1];
  
  return result;
}

// Extract Schema.org JSON-LD Product data
function extractSchemaOrg(html: string): Partial<ProductData> {
  const result: Partial<ProductData> = {};
  
  // Find all JSON-LD scripts
  const jsonLdMatches = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  
  if (!jsonLdMatches) return result;
  
  for (const match of jsonLdMatches) {
    try {
      const jsonContent = match.replace(/<script[^>]*>|<\/script>/gi, "").trim();
      const data = JSON.parse(jsonContent);
      
      // Handle @graph structure
      const items = data["@graph"] || [data];
      
      for (const item of items) {
        if (item["@type"] === "Product" || 
            (Array.isArray(item["@type"]) && item["@type"].includes("Product"))) {
          
          if (item.name) result.title = item.name;
          if (item.description) result.description = item.description;
          if (item.image) {
            result.imageUrl = Array.isArray(item.image) ? item.image[0] : 
                             (typeof item.image === "object" ? item.image.url : item.image);
          }
          
          // Extract price from offers
          const offers = item.offers;
          if (offers) {
            const offer = Array.isArray(offers) ? offers[0] : offers;
            if (offer.price) result.price = String(offer.price);
            if (offer.priceCurrency) result.currency = offer.priceCurrency;
          }
          
          return result;
        }
      }
    } catch (e) {
      console.log("Failed to parse JSON-LD:", e);
      continue;
    }
  }
  
  return result;
}

// Extract standard meta tags as fallback
function extractMetaTags(html: string): Partial<ProductData> {
  const result: Partial<ProductData> = {};
  
  // title tag
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) result.title = decodeHtmlEntities(titleMatch[1].trim());
  
  // meta description
  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
                    html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);
  if (descMatch) result.description = decodeHtmlEntities(descMatch[1]);
  
  return result;
}

// Helper to decode HTML entities
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec));
}

// Format price with currency
function formatPrice(price: string | undefined, currency: string | undefined): string | undefined {
  if (!price) return undefined;
  
  // Clean the price string
  const cleanPrice = price.replace(/[^\d.,]/g, "");
  
  if (!currency) return cleanPrice;
  
  const currencySymbols: Record<string, string> = {
    CHF: "CHF",
    EUR: "€",
    USD: "$",
    GBP: "£",
  };
  
  const symbol = currencySymbols[currency.toUpperCase()] || currency;
  return `${symbol} ${cleanPrice}`;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: "URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[extract-product-data] Fetching URL:", url);

    // Fetch the URL with browser-like headers
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "de-CH,de;q=0.9,en-US;q=0.8,en;q=0.7",
        "Accept-Encoding": "gzip, deflate, br",
        "Cache-Control": "no-cache",
      },
    });

    if (!response.ok) {
      console.error("[extract-product-data] Fetch failed:", response.status);
      return new Response(
        JSON.stringify({ success: false, error: `Failed to fetch URL: ${response.status}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const html = await response.text();
    console.log("[extract-product-data] HTML length:", html.length);

    // Try different extraction methods in order of reliability
    let productData: ProductData = { source: "fallback" };
    
    // 1. Try Schema.org JSON-LD (most structured)
    const schemaData = extractSchemaOrg(html);
    if (schemaData.title || schemaData.price) {
      productData = { ...productData, ...schemaData, source: "schema" };
      console.log("[extract-product-data] Found Schema.org data:", schemaData);
    }
    
    // 2. Merge with OpenGraph data (good for images and descriptions)
    const ogData = extractOpenGraph(html);
    if (ogData.title || ogData.imageUrl) {
      // Don't override schema data with empty OG data
      productData = {
        ...productData,
        title: productData.title || ogData.title,
        description: productData.description || ogData.description,
        imageUrl: productData.imageUrl || ogData.imageUrl,
        price: productData.price || ogData.price,
        currency: productData.currency || ogData.currency,
        source: productData.source === "schema" ? "schema" : "opengraph",
      };
      console.log("[extract-product-data] Merged OpenGraph data:", ogData);
    }
    
    // 3. Fallback to basic meta tags
    if (!productData.title) {
      const metaData = extractMetaTags(html);
      productData = {
        ...productData,
        title: metaData.title,
        description: productData.description || metaData.description,
      };
      console.log("[extract-product-data] Using meta tag fallback:", metaData);
    }

    // Format the price with currency if available
    if (productData.price) {
      productData.price = formatPrice(productData.price, productData.currency);
    }

    // Check if we got useful data
    if (!productData.title && !productData.imageUrl) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Could not extract product data from this URL. The page may be protected or doesn't contain product information.",
          partial: productData
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[extract-product-data] Final product data:", productData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: productData 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[extract-product-data] Error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to extract product data" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
