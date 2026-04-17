import { betterAuth } from "better-auth";
import { emailOTP, openAPI } from "better-auth/plugins"
import { db } from "./db";
import {sendVerificationEmail, sendSignInEmail, sendResetPasswordEmail} from "./mailers";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export const auth = betterAuth({
	database: drizzleAdapter(db, { provider: "pg" }),

	emailAndPassword: {
		enabled: true,
	},

	//   socialProviders: {
	//   google: {
	//     clientId: process.env.GOOGLE_CLIENT_ID!,
	//     clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
	//   },
	//  },

	   advanced: {
     crossSubDomainCookies: {
      enabled: true,
    },
    trustedOrigins: [
      Bun.env.CLIENT_URL,
  ],

     cookiePrefix: "my-app",
         useSecureCookies: true,
         cookies: {
               session_token: {
               name: "session_token",
	             attributes: {
               httpOnly: true,
	             secure: Bun.env.NODE_ENV === "production",
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

  plugins: [
    openAPI(),
    emailOTP({
       async sendVerificationOTP({ email, otp, type })  {
        if (type === "email-verification") {
          await sendVerificationEmail(email, otp);
        } else if (type === "sign-in") {
          await sendSignInEmail(email, otp);
        } else {
          await sendResetPasswordEmail(email, otp);
        }
      },
      expiresIn: 600,
    }),
  ],
}) ;

