import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // Check if user has AI access
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

    // Check if user's AI access is blocked
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

    // Fetch actual platform data
    const { data: products } = await supabaseClient.from('products').select('*').order('created_at', { ascending: false }).limit(50);
    const { data: vendors } = await supabaseClient.from('approved_vendors').select('*');
    const { data: profiles } = await supabaseClient.from('profiles').select('id, full_name, email');
    
    // Build context with actual data
    const platformContext = `
PLATFORM DATA (Use ONLY this information to answer questions):

PRODUCTS (${products?.length || 0} available):
${products?.map(p => `- ${p.name}: ₦${p.price} (Category: ${p.category}, Stock: ${p.stock_count || 0}, Rating: ${p.rating || 'N/A'})`).join('\n') || 'No products available'}

VENDORS (${vendors?.length || 0} active):
${vendors?.map(v => `- ${v.store_name} (Category: ${v.product_category}, Products: ${v.total_products}, Revenue: ₦${v.total_revenue}, Orders: ${v.total_orders})`).join('\n') || 'No vendors available'}

CURRENCY: All prices are in Nigerian Naira (₦), never use dollars or other currencies.

IMPORTANT: Only provide information from the above data. Do not make up products, vendors, or prices. If asked about something not in this data, say "I don't have that information in our current catalog."
`;

    const systemPrompt = `You are Gideon, a helpful AI assistant for an e-commerce platform in Nigeria. 

${platformContext}

RULES:
1. ONLY use the platform data provided above
2. NEVER invent products, prices, or vendors that aren't listed
3. Always use Nigerian Naira (₦) for prices
4. When asked about "best" or "highest rated" items, use the actual data provided
5. Keep answers concise and accurate
6. If information isn't in the data, say so clearly

You help users with:
- Finding actual products on the platform
- Information about real vendors
- Platform features and usage
- Product categories and availability

You DO NOT:
- Make up products or prices
- Discuss technical/coding topics
- Share confidential information
- Answer general knowledge questions unrelated to the platform`;

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
