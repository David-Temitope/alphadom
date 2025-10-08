import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AdminInvitationRequest {
  email: string;
  name: string;
  role: string;
  invitationToken: string;
  baseUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, role, invitationToken, baseUrl }: AdminInvitationRequest = await req.json();

    const confirmationUrl = `${baseUrl}/admin/confirm-invitation/${invitationToken}`;

    const emailResponse = await resend.emails.send({
      from: "Admin System <onboarding@resend.dev>",
      to: [email],
      subject: "Admin Account Invitation",
      html: `
        <h1>Admin Invitation</h1>
        <p>Hello ${name},</p>
        <p>You have been invited to become an admin with the role: <strong>${role}</strong></p>
        <p>Please click the link below to confirm your account. This link will expire in 5 hours.</p>
        <a href="${confirmationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;">
          Confirm Account
        </a>
        <p>Or copy and paste this link into your browser:</p>
        <p>${confirmationUrl}</p>
        <p>Best regards,<br>The Admin Team</p>
      `,
    });

    console.log("Admin invitation email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-admin-invitation function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
