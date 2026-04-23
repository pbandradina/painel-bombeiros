import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE",
};

// Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const supabase = createClient(supabaseUrl, supabaseKey);

// Main server
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const pathname = url.pathname;
  console.log(`[DEBUG] Method: ${req.method}, Pathname: ${pathname}`);

  try {
    // REST API endpoints
    
    // GET /api/bombeiros - List all bombeiros
    if (pathname === "/api/bombeiros" && req.method === "GET") {
      const { data, error } = await supabase
        .from("bombeiros")
        .select("*")
        .order("nome", { ascending: true });
      
      if (error) throw new Error(error.message);
      
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST /api/bombeiros - Create bombeiro
    if (pathname === "/api/bombeiros" && req.method === "POST") {
      const body = await req.json();
      
      const { data, error } = await supabase
        .from("bombeiros")
        .insert([body])
        .select()
        .single();
        
      if (error) throw new Error(error.message);
      
      return new Response(JSON.stringify(data), {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // DELETE /api/bombeiros/:id - Delete bombeiro
    if (pathname.match(/^\/api\/bombeiros\/\d+$/) && req.method === "DELETE") {
      const id = parseInt(pathname.split("/").pop() || "0");
      
      const { error } = await supabase
        .from("bombeiros")
        .delete()
        .eq("id", id);
        
      if (error) throw new Error(error.message);
      
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // GET /api/periodos - List all periodos
    if (pathname === "/api/periodos" && req.method === "GET") {
      const { data, error } = await supabase
        .from("periodos")
        .select("*");
        
      if (error) throw new Error(error.message);
      
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST /api/periodos - Create periodo
    if (pathname === "/api/periodos" && req.method === "POST") {
      const body = await req.json();
      
      const { data, error } = await supabase
        .from("periodos")
        .insert([body])
        .select()
        .single();
        
      if (error) throw new Error(error.message);
      
      return new Response(JSON.stringify(data), {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // DELETE /api/periodos/:id - Delete periodo
    if (pathname.match(/^\/api\/periodos\/\d+$/) && req.method === "DELETE") {
      const id = parseInt(pathname.split("/").pop() || "0");
      
      const { error } = await supabase
        .from("periodos")
        .delete()
        .eq("id", id);
        
      if (error) throw new Error(error.message);
      
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Default response
    return new Response(
      JSON.stringify({ message: "Supabase Edge Function API is running" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
