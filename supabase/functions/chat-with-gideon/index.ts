import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Keywords that trigger web search for external information
const WEB_SEARCH_TRIGGERS = [
  'what is', 'how to', 'latest', 'trending', 'news', 'price of',
  'compare', 'vs', 'versus', 'best', 'top', 'review', 'recommend',
  'market', 'trend', 'fashion', 'technology', 'update', 'new release'
];

// Check if user message needs web search
function needsWebSearch(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  return WEB_SEARCH_TRIGGERS.some(trigger => lowerMessage.includes(trigger));
}

// Perform Firecrawl web search
async function performWebSearch(query: string): Promise<string> {
  const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
  if (!FIRECRAWL_API_KEY) {
    console.log('Firecrawl not configured, skipping web search');
    return '';
  }

  try {
    const response = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `${query} Nigeria`,
        limit: 5,
        country: 'NG',
        lang: 'en',
      }),
    });

    if (!response.ok) {
      console.error('Firecrawl search failed:', response.status);
      return '';
    }

    const data = await response.json();
    if (data.success && data.data && Array.isArray(data.data)) {
      const webResults = data.data.slice(0, 3).map((item: any) => 
        `- ${item.title}: ${item.description || item.markdown?.slice(0, 150) || ''} (Source: ${new URL(item.url).hostname})`
      ).join('\n');
      
      return webResults ? `\nWEB SEARCH RESULTS for "${query}":\n${webResults}\n` : '';
    }
    return '';
  } catch (error) {
    console.error('Web search error:', error);
    return '';
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('ai_access_blocked')
      .eq('id', user.id)
      .single();

    if (profile?.ai_access_blocked) {
      return new Response(JSON.stringify({ error: 'Your AI access has been blocked by an administrator' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Fetch actual platform data with images
    const { data: products } = await supabaseClient
      .from('products')
      .select('id, name, price, category, stock_count, rating, image, description')
      .order('created_at', { ascending: false })
      .limit(50);
    
    // Fetch only active vendors (not closed/suspended)
    const { data: vendors } = await supabaseClient
      .from('approved_vendors')
      .select('id, store_name, product_category, total_products, total_revenue, total_orders, user_id')
      .eq('is_active', true);
    
    // Fetch vendor profile images
    const vendorUserIds = vendors?.map(v => v.user_id) || [];
    const { data: vendorProfiles } = await supabaseClient
      .from('profiles')
      .select('id, avatar_url')
      .in('id', vendorUserIds);
    
    const profileMap = new Map(vendorProfiles?.map(p => [p.id, p.avatar_url]) || []);
    
    // Build context with product data including IDs and images for clickable responses
    const productList = products?.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      category: p.category,
      stock: p.stock_count || 0,
      rating: p.rating || 'N/A',
      image: p.image,
      description: p.description?.slice(0, 100)
    })) || [];

    const vendorList = vendors?.map(v => ({
      id: v.id,
      name: v.store_name,
      category: v.product_category,
      products: v.total_products,
      orders: v.total_orders,
      image: profileMap.get(v.user_id) || '',
      user_id: v.user_id
    })) || [];

    // Check if the latest user message needs web search
    const lastUserMessage = messages.filter((m: any) => m.role === 'user').pop();
    let webSearchContext = '';
    if (lastUserMessage && needsWebSearch(lastUserMessage.content)) {
      console.log('Triggering web search for:', lastUserMessage.content);
      webSearchContext = await performWebSearch(lastUserMessage.content);
    }

    const platformContext = `
PLATFORM DATA (Use ONLY this information for platform-specific questions):

PRODUCTS (${productList.length} available):
${productList.map(p => `[PRODUCT_ID:${p.id}] ${p.name}: ₦${p.price} (Category: ${p.category}, Stock: ${p.stock}, Rating: ${p.rating}, Image: ${p.image || 'none'})`).join('\n')}

VENDORS (${vendorList.length} active):
${vendorList.map(v => `[VENDOR_ID:${v.id}] ${v.name} (Category: ${v.category}, Products: ${v.products}, Image: ${v.image || 'none'}, UserID: ${v.user_id})`).join('\n')}

CURRENCY: All prices are in Nigerian Naira (₦).
${webSearchContext}
`;

    const systemPrompt = `You are Gideon, the official AI assistant for Alphadom — a Nigerian e-commerce marketplace. 

CRITICAL CONSTRAINTS - YOU MUST FOLLOW THESE:
1. You ONLY discuss topics related to Alphadom, e-commerce, shopping, products, vendors, and online selling in Nigeria
2. You MUST REFUSE to answer questions about: politics, religion, hacking, personal advice unrelated to shopping, coding/programming, medical advice, legal advice, or any topic not related to e-commerce/shopping
3. If a user asks about topics outside your scope, politely redirect: "I'm Gideon, your Alphadom shopping assistant. I can only help with shopping, products, and vendor-related questions. How can I help you find something on Alphadom today?"
4. NEVER provide information that could harm users or the platform

${platformContext}

RESPONSE FORMAT RULES:
1. When mentioning products, ALWAYS include clickable product cards in this exact format:
   [[PRODUCT:product_id:product_name:product_price:product_image_url]]
   Example: [[PRODUCT:abc123:Nike Shoes:15000:/images/shoe.jpg]]

2. When mentioning vendors, ALWAYS include clickable vendor cards in this exact format:
   [[VENDOR:vendor_id:vendor_name:vendor_image_url:user_id]]
   Example: [[VENDOR:xyz789:Fashion Hub:/images/avatar.jpg:user123]]
   IMPORTANT: If vendor_image is 'none' or empty, use '/placeholder.svg' instead

3. ONLY use products and vendors from the platform data above
4. Always use Nigerian Naira (₦) for prices
5. Keep answers concise and helpful
6. If asked about products in a category, show the product cards
7. If information isn't in platform data, say "I don't have that information in my database"

You help users with:
- Finding products on Alphadom (show product cards!)
- Information about Alphadom vendors (show vendor cards!)
- How to buy, sell, or become a vendor on Alphadom
- Shipping and delivery questions for Alphadom orders
- Product categories and availability on Alphadom
- Nigerian e-commerce trends ONLY when relevant to shopping

You ABSOLUTELY DO NOT discuss:
- Politics, religion, or controversial topics
- Technical/coding topics
- Medical, legal, or financial advice
- Topics unrelated to e-commerce and shopping
- Made-up products or vendors`;

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
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});