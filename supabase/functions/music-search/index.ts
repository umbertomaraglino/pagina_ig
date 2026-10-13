import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const url = new URL(req.url)
  const term = url.searchParams.get('term') ?? 'pop hits 2024'

  const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=music&limit=25`
  const res = await fetch(itunesUrl)
  const json = await res.json()

  return new Response(JSON.stringify(json), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
