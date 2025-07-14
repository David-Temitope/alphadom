import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();
    
    // Send notification to admin
    await resend.emails.send({
      from: "Pilot <onboarding@resend.dev>",
      to: ["davoeinc@gmail.com"],
      subject: "New Newsletter Subscription",
      html: `
        <h2>New Newsletter Subscription</h2>
        <p>A new user has subscribed to your newsletter:</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
      `,
    });

    // Send welcome email to subscriber
    await resend.emails.send({
      from: "Pilot <onboarding@resend.dev>",
      to: [email],
      subject: "Welcome to Pilot Newsletter!",
      html: `
        <h1>Welcome to Pilot!</h1>
        <p>Thank you for subscribing to our newsletter. You'll be the first to know about our latest products and exclusive offers.</p>
        <p>Best regards,<br>The Pilot Team</p>
      `,
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error sending newsletter email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});