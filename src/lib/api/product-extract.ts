import { supabase } from "@/integrations/supabase/client";

export interface ExtractedProductData {
  title?: string;
  description?: string;
  price?: string;
  currency?: string;
  imageUrl?: string;
  source: "opengraph" | "schema" | "ai" | "fallback";
}

export interface ProductExtractResponse {
  success: boolean;
  data?: ExtractedProductData;
  error?: string;
  partial?: ExtractedProductData;
}

export async function extractProductData(url: string): Promise<ProductExtractResponse> {
  try {
    const { data, error } = await supabase.functions.invoke("extract-product-data", {
      body: { url },
    });

    if (error) {
      console.error("[extractProductData] Function error:", error);
      return { success: false, error: error.message };
    }

    return data as ProductExtractResponse;
  } catch (e) {
    console.error("[extractProductData] Error:", e);
    return { 
      success: false, 
      error: e instanceof Error ? e.message : "Failed to extract product data" 
    };
  }
}
