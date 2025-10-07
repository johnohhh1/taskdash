import { NextRequest } from "next/server";
import { encrypt } from "@/lib/calendar";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  if (!code) {
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
      response_type: "code",
      access_type: "offline",
      scope: process.env.GOOGLE_OAUTH_SCOPES!,
      prompt: "consent"
    });
    return Response.redirect(
      `https://accounts.google.com/o/oauth2/v2/auth?${params}`
    );
  }

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
      grant_type: "authorization_code"
    })
  });

  const tokens = await tokenRes.json();
  if (!tokenRes.ok) return Response.json(tokens, { status: 400 });

  const refresh = tokens.refresh_token;
  if (!refresh) return Response.json({ error: "No refresh token" }, { status: 400 });

  return new Response("Authorized. Refresh token saved in cookie.", {
    status: 200,
    headers: {
      "Set-Cookie": `gcal_refresh=${encodeURIComponent(
        encrypt(refresh)
      )}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=31536000`,
      "content-type": "text/plain"
    }
  });
}
