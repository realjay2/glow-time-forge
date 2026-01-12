import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OWNER = "realjay2";
const REPO = "QuantV-Holder";
const FILE_PATH = "Keys.json";
const BRANCH = "main";

interface KeyData {
  AltGen: boolean;
  Blacklisted: boolean;
  ExecAmt: number;
  Note: string;
  accountEmail: string;
  accountPassword: string;
  createdAt: string;
  discordID: string;
  expiresAt: string;
  key: string;
  websitePurchase: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { discordId } = await req.json();
    
    if (!discordId) {
      console.error('Missing discordId');
      return new Response(
        JSON.stringify({ success: false, error: 'Missing discordId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const githubToken = Deno.env.get('GITHUB_TOKEN');
    if (!githubToken) {
      console.error('GITHUB_TOKEN not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fetching Keys.json for discordId: ${discordId}`);

    // Fetch current file
    const fileResponse = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}?ref=${BRANCH}`,
      {
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'CoreServ-Key-System'
        }
      }
    );

    if (!fileResponse.ok) {
      const errorText = await fileResponse.text();
      console.error('Failed to fetch Keys.json:', errorText);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to fetch keys file' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const fileData = await fileResponse.json();
    const content = atob(fileData.content);
    const keys: KeyData[] = JSON.parse(content);

    console.log(`Found ${keys.length} keys, searching for discordId: ${discordId}`);

    // Find the user's key
    const userKey = keys.find(k => k.discordID === discordId);
    
    if (!userKey) {
      console.log('User key not found for discordId:', discordId);
      return new Response(
        JSON.stringify({ success: true, key: null }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return key data (excluding sensitive account info)
    return new Response(
      JSON.stringify({ 
        success: true, 
        key: {
          discordID: userKey.discordID,
          expiresAt: userKey.expiresAt,
          Note: userKey.Note,
          createdAt: userKey.createdAt,
          key: userKey.key,
          AltGen: userKey.AltGen,
          Blacklisted: userKey.Blacklisted,
          ExecAmt: userKey.ExecAmt,
          websitePurchase: userKey.websitePurchase
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-user-key:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
