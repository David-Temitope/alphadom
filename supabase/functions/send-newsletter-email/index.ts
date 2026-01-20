import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// HTML escape function to prevent XSS
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();
    
    // Validate email format to prevent injection attacks
    if (!email || typeof email !== 'string' || !emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Additional validation: max length to prevent overflow attacks
    if (email.length > 254) {
      return new Response(
        JSON.stringify({ error: 'Email address too long' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    
    if (!RESEND_API_KEY) {
      // Don't expose configuration details in production
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Sanitize email for HTML display
    const safeEmail = escapeHtml(email);

    // Send notification to admin with sanitized content
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Alphadom <onboarding@resend.dev>",
        to: ["davoeinc@gmail.com"],
        subject: "New Newsletter Subscription",
        html: `
          <h2>New Newsletter Subscription</h2>
          <p>A new user has subscribed to your newsletter:</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          <p><strong>Date:</strong> ${new Date().toISOString()}</p>
        `,
      }),
    });

    // Send welcome email to subscriber (email already validated)
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Alphadom <onboarding@resend.dev>",
        to: [email],
        subject: "Welcome to Alphadom Newsletter!",
        html: `
          <h1>Welcome to Alphadom!</h1>
          <p>Thank you for subscribing to our newsletter. You'll be the first to know about our latest products and exclusive offers.</p>
          <p>Best regards,<br>The Alphadom Team</p>
        `,
      }),
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    // Generic error message - don't expose internal details
    return new Response(
      JSON.stringify({ error: 'An error occurred. Please try again.' }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
