import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OWNER = "realjay2";
const REPO = "CoreServ-Holder";
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
    const { discordId, hoursToAdd } = await req.json();
    
    if (!discordId || !hoursToAdd) {
      console.error('Missing required fields:', { discordId, hoursToAdd });
      return new Response(
        JSON.stringify({ success: false, error: 'Missing discordId or hoursToAdd' }),
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

    // Find and update the user's key
    const userKeyIndex = keys.findIndex(k => k.discordID === discordId);
    
    if (userKeyIndex === -1) {
      console.error('User key not found for discordId:', discordId);
      return new Response(
        JSON.stringify({ success: false, error: 'User key not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update expiration time
    const currentExpiry = new Date(keys[userKeyIndex].expiresAt);
    const newExpiry = new Date(currentExpiry.getTime() + hoursToAdd * 60 * 60 * 1000);
    keys[userKeyIndex].expiresAt = newExpiry.toISOString();

    console.log(`Updating expiration from ${currentExpiry.toISOString()} to ${newExpiry.toISOString()}`);

    // Commit the updated file
    const updateResponse = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'CoreServ-Key-System'
        },
        body: JSON.stringify({
          message: `Update key expiration for ${discordId}`,
          content: btoa(JSON.stringify(keys, null, 2)),
          sha: fileData.sha,
          branch: BRANCH
        })
      }
    );

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error('Failed to update Keys.json:', errorText);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to update keys file' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Successfully updated key expiration');

    return new Response(
      JSON.stringify({ 
        success: true, 
        newExpiry: newExpiry.toISOString(),
        message: `Added ${hoursToAdd} hour(s) to your key` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in update-key-expiration:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
