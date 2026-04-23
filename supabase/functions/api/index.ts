import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { fetchRequestHandler } from "npm:@trpc/server/adapters/fetch";
import { initTRPC } from "npm:@trpc/server";
import { z } from "npm:zod";
import superjson from "npm:superjson";
import { createClient } from "npm:@supabase/supabase-js";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE",
};

// Initialize tRPC
const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

// Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const supabase = createClient(supabaseUrl, supabaseKey);

// App Router
const appRouter = router({
  // Test route
  hello: publicProcedure.query(() => {
    return { message: "Hello from Supabase Edge Functions!" };
  }),

  // Bombeiros routes
  bombeiros: router({
    list: publicProcedure.query(async () => {
      const { data, error } = await supabase
        .from("bombeiros")
        .select("*")
        .order("nome", { ascending: true });
      
      if (error) throw new Error(error.message);
      return data;
    }),
    
    create: publicProcedure
      .input(z.object({
        nome: z.string(),
        equipe: z.string(),
        data: z.string(),
      }))
      .mutation(async ({ input }) => {
        const { data, error } = await supabase
          .from("bombeiros")
          .insert([input])
          .select()
          .single();
          
        if (error) throw new Error(error.message);
        return data;
      }),
      
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const { error } = await supabase
          .from("bombeiros")
          .delete()
          .eq("id", input.id);
          
        if (error) throw new Error(error.message);
        return { success: true };
      }),
  }),
  
  // Períodos routes
  periodos: router({
    list: publicProcedure.query(async () => {
      const { data, error } = await supabase
        .from("periodos")
        .select("*");
        
      if (error) throw new Error(error.message);
      return data;
    }),
    
    create: publicProcedure
      .input(z.object({
        bombeiro_id: z.number(),
        tipo: z.string(),
        data_inicio: z.string(),
        data_fim: z.string(),
      }))
      .mutation(async ({ input }) => {
        const { data, error } = await supabase
          .from("periodos")
          .insert([input])
          .select()
          .single();
          
        if (error) throw new Error(error.message);
        return data;
      }),
      
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const { error } = await supabase
          .from("periodos")
          .delete()
          .eq("id", input.id);
          
        if (error) throw new Error(error.message);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;

// Server
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Handle tRPC requests
    const url = new URL(req.url);
    
    // Check if it's a tRPC request
    if (url.pathname.includes("/trpc")) {
      // Adjust the endpoint path for the adapter
      const endpoint = url.pathname.substring(0, url.pathname.indexOf("/trpc") + 5);
      
      const response = await fetchRequestHandler({
        endpoint,
        req,
        router: appRouter,
        createContext: () => ({}),
      });
      
      // Add CORS headers to the response
      const newHeaders = new Headers(response.headers);
      for (const [key, value] of Object.entries(corsHeaders)) {
        newHeaders.set(key, value);
      }
      
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      });
    }

    // Default response for non-tRPC requests
    return new Response(
      JSON.stringify({ message: "Supabase Edge Function API is running" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
