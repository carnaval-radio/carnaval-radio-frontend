import NextAuth from "next-auth";
import Email from "next-auth/providers/email";
import { SupabaseAdapter } from "@auth/supabase-adapter";
import nodemailer from "nodemailer";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const nextAuthSecret = process.env.NEXTAUTH_SECRET || "dev-secret-for-build";

// Only initialize NextAuth if we have required env vars
// During build, these might be missing, but that's okay since we use force-dynamic
let authConfig: any = null;

try {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase credentials missing for NextAuth adapter.");
  }

  authConfig = NextAuth({
    adapter: SupabaseAdapter({
      url: supabaseUrl,
      secret: supabaseKey,
    }),
    session: {
      strategy: "jwt",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    providers: [
      Email({
        server: {
          host: process.env.EMAIL_SERVER_HOST || "localhost",
          port: process.env.EMAIL_SERVER_PORT ? parseInt(process.env.EMAIL_SERVER_PORT) : 587,
          auth: {
            user: process.env.EMAIL_SERVER_USER || "",
            pass: process.env.EMAIL_SERVER_PASSWORD || "",
          },
        },
        from: process.env.EMAIL_FROM || "noreply@carnaval-radio.nl",
        async sendVerificationRequest({ identifier: email, url, provider }) {
          // Send verification email
          const transporter = nodemailer.createTransport(provider.server);

          try {
            await transporter.sendMail({
              to: email,
              from: provider.from,
              subject: "Sign in to Carnaval Radio",
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2>Welcome to Carnaval Radio! 🎉</h2>
                  <p>Click the link below to sign in to your account:</p>
                  <p>
                    <a href="${url}" style="background-color: #FF6B35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                      Sign In to Carnaval Radio
                    </a>
                  </p>
                  <p style="font-size: 12px; color: #666;">
                    Or copy this link:<br/>
                    ${url}
                  </p>
                  <p style="font-size: 12px; color: #999; margin-top: 20px;">
                    This link expires in 24 hours. If you didn't request this, you can safely ignore this email.
                  </p>
                </div>
              `,
              text: `Sign in to Carnaval Radio:\n\n${url}\n\nThis link expires in 24 hours.`,
            });
          } catch (error) {
            console.error("Failed to send verification email:", error);
            throw new Error("Failed to send verification email");
          }
        },
      }),
    ],
    callbacks: {
      async session({ session }) {
        return session;
      },
      async redirect({ url, baseUrl }) {
        // Ensure redirects are always to the same origin, or to root
        if (url.startsWith("/")) return `${baseUrl}${url}`;
        else if (new URL(url).origin === baseUrl) return url;
        return baseUrl;
      },
    },
    pages: {
      signIn: "/auth/signin",
      error: "/auth/error",
      verifyRequest: "/auth/verify-email",
    },
    debug: process.env.NODE_ENV === "development",
  });
} catch (error) {
  console.warn("Warning: NextAuth initialization failed, this is okay during build:", error);
}

export const handlers = authConfig?.handlers || {
  GET: () => Response.json({ error: "Auth not configured" }, { status: 503 }),
  POST: () => Response.json({ error: "Auth not configured" }, { status: 503 }),
};
export const auth = authConfig?.auth || (() => null);
export const signIn = authConfig?.signIn || (() => null);
export const signOut = authConfig?.signOut || (() => null);

