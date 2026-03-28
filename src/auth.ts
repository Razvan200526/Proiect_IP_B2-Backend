
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db" 

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

//   advanced: {
//     crossSubDomainCookies: {
//       enabled: true,
//       domain: ".example.com", 
//     },

//     cookiePrefix: "my-app",
//     useSecureCookies: true,
//     cookies: {
//       session_token: {
//         name: "session_token",
//         attributes: {
//           httpOnly: true,
//           secure: process.env.NODE_ENV === "production",
//           sameSite: "lax",
//           maxAge: 60 * 60 * 24 * 7, 
//           path: "/",
//         },
//       },
//     },
//   },

//     rateLimit: {
//         enabled: true,
//         window: 60 * 1000, 
//         max: 10,             
//     },

// });

// // export async function requireAuth(req: any, res: any) {
// //   const session = await auth.getSession(req, res);
// //   if (!session) {
// //     res.status(401).json({ error: "Not authenticated" });
// //     return null;
// //   }
// //   return session;
});
