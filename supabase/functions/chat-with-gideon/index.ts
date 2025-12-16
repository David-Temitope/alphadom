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
    
    const { data: vendors } = await supabaseClient
      .from('approved_vendors')
      .select('id, store_name, product_category, total_products, total_revenue, total_orders, user_id');
    
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
      image: profileMap.get(v.user_id) || ''
    })) || [];

    const platformContext = `
PLATFORM DATA (Use ONLY this information):

PRODUCTS (${productList.length} available):
${productList.map(p => `[PRODUCT_ID:${p.id}] ${p.name}: ₦${p.price} (Category: ${p.category}, Stock: ${p.stock}, Rating: ${p.rating}, Image: ${p.image || 'none'})`).join('\n')}

VENDORS (${vendorList.length} active):
${vendorList.map(v => `[VENDOR_ID:${v.id}] ${v.name} (Category: ${v.category}, Products: ${v.products}, Image: ${v.image || 'none'})`).join('\n')}

CURRENCY: All prices are in Nigerian Naira (₦).
`;

    const systemPrompt = `You are Gideon, a helpful AI assistant for Alphadom, an e-commerce platform in Nigeria.

${platformContext}

RESPONSE FORMAT RULES:
1. When mentioning products, ALWAYS include clickable product cards in this exact format:
   [[PRODUCT:product_id:product_name:product_price:product_image_url]]
   Example: [[PRODUCT:abc123:Nike Shoes:15000:/images/shoe.jpg]]

2. When mentioning vendors, ALWAYS include clickable vendor cards in this exact format:
   [[VENDOR:vendor_id:vendor_name:vendor_image_url]]
   Example: [[VENDOR:xyz789:Fashion Hub:/images/avatar.jpg]]

3. ONLY use products and vendors from the platform data above
4. Always use Nigerian Naira (₦) for prices
5. Keep answers concise and helpful
6. If asked about products in a category, show the product cards
7. If information isn't in the data, say so clearly

You help users with:
- Finding actual products on the platform (show product cards!)
- Information about real vendors
- Platform features and usage
- Product categories and availability

You DO NOT:
- Make up products or prices
- Discuss technical/coding topics
- Share confidential information`;

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