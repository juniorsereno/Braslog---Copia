import { TRPCError } from "@trpc/server";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const authRouter = createTRPCRouter({
  /**
   * Get current user session
   * Returns the current authenticated user or null if not authenticated
   */
  getSession: publicProcedure.query(({ ctx }) => {
    return {
      user: ctx.user,
      isAuthenticated: !!ctx.user,
    };
  }),

  /**
   * Get current user profile (protected)
   * Returns detailed user information for authenticated users only
   */
  getProfile: protectedProcedure.query(({ ctx }) => {
    return {
      id: ctx.user.id,
      email: ctx.user.email,
      createdAt: ctx.user.created_at,
      lastSignIn: ctx.user.last_sign_in_at,
    };
  }),

  /**
   * Sign out the current user
   * This procedure handles the server-side logout process
   */
  signOut: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const { error } = await ctx.supabase.auth.signOut();
      
      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao fazer logout: " + error.message,
        });
      }

      return { success: true, message: "Logout realizado com sucesso" };
    } catch (error) {
      console.error("Erro no logout:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Erro interno no servidor durante o logout",
      });
    }
  }),
});