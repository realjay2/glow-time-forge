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

function generateKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let key = 'QV-';
  for (let i = 0; i < 16; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
    if ((i + 1) % 4 === 0 && i < 15) key += '-';
  }
  return key;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { discordId, username } = await req.json();
    
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

    console.log(`Creating new key for discordId: ${discordId}`);

    // Fetch current file
    const fileResponse = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}?ref=${BRANCH}`,
      {
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'QuantV-Key-System'
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

    // Check if user already has a key
    const existingKey = keys.find(k => k.discordID === discordId);
    if (existingKey) {
      console.log('User already has a key:', discordId);
      return new Response(
        JSON.stringify({ 
          success: true, 
          key: {
            discordID: existingKey.discordID,
            expiresAt: existingKey.expiresAt,
            Note: existingKey.Note,
            createdAt: existingKey.createdAt,
            key: existingKey.key
          },
          created: false 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create new key
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
    
    const newKey: KeyData = {
      AltGen: false,
      Blacklisted: false,
      ExecAmt: 0,
      Note: `Created via website for ${username || discordId}`,
      accountEmail: '',
      accountPassword: '',
      createdAt: now.toISOString(),
      discordID: discordId,
      expiresAt: expiresAt.toISOString(),
      key: generateKey(),
      websitePurchase: true
    };

    keys.push(newKey);
    console.log(`New key created: ${newKey.key} for ${discordId}`);

    // Update GitHub file
    const updatedContent = btoa(JSON.stringify(keys, null, 2));
    
    const updateResponse = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'QuantV-Key-System'
        },
        body: JSON.stringify({
          message: `Create key for user ${discordId}`,
          content: updatedContent,
          sha: fileData.sha,
          branch: BRANCH
        })
      }
    );

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error('Failed to update Keys.json:', errorText);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to create key' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Key created successfully for:', discordId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        key: {
          discordID: newKey.discordID,
          expiresAt: newKey.expiresAt,
          Note: newKey.Note,
          createdAt: newKey.createdAt,
          key: newKey.key
        },
        created: true
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in create-user-key:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
