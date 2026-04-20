import { betterAuth } from "better-auth";
import { emailOTP, openAPI } from "better-auth/plugins"
import { db } from "./db";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { DevMailer } from "./mailers/dev.mailer";
import { ProdMailer } from "./mailers/prod.mailer";
import * as schema from "./db/auth-schema";

const mailer = process.env.NODE_ENV === "production" 
  ? new ProdMailer() 
  : new DevMailer();

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },

  advanced: {
    crossSubDomainCookies: { enabled: true },
    trustedProxies: ["127.0.0.1", "::1"],
    trustedOrigins: [
      "http://localhost:3001",
      "http://localhost:5173",
      "http://127.0.0.1:3001",
      "http://127.0.0.1:5173"
    ],
    cookiePrefix: "my-app",
    useSecureCookies: false,
    cookies: {
      session_token: {
        name: "session_token",
        attributes: {
          httpOnly: true,
          secure: false,
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7,
          path: "/",
        },
      },
    },
  },

  rateLimit: {
    enabled: true,
    window: 60 * 1000,
    max: 10,
  },

  emailVerification: {
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user }) => {
      await auth.api.sendVerificationOTP({
        body: {
          email: user.email,
          type: "email-verification",
        },
      });
    },
  },

  plugins: [
    openAPI(),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        try {
          if (type === "email-verification") {
             await mailer.sendVerificationEmail(email, otp);
          } else if (type === "sign-in") {
            await mailer.sendSignInEmail(email, otp);
          } else {
            await mailer.sendResetPasswordEmail(email, otp);
          }
        } catch (error) {
          console.error("EROARE SMTP:", error);
        }
      },
      expiresIn: 600,
    }),
  ],
});