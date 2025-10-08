import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AdminPasswordRequest {
  email: string;
  name: string;
  password: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, password }: AdminPasswordRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "Admin System <onboarding@resend.dev>",
      to: [email],
      subject: "Your Admin Access Code",
      html: `
        <h1>Admin Access Code</h1>
        <p>Hello ${name},</p>
        <p>Your admin account has been confirmed. Below is your secure access code:</p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 2px;">
          ${password}
        </div>
        <p><strong>Important:</strong> Keep this code secure and do not share it with anyone.</p>
        <p>Use this code along with your email to log in to the admin panel.</p>
        <p>Best regards,<br>The Admin Team</p>
      `,
    });

    console.log("Admin password email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-admin-password function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
