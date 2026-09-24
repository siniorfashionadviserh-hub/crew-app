import { createClient } from '@supabase/supabase-js';

// Validation: Check required environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
}
if (!supabasePublishableKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');
}

// Browser Client (Publishable Key + RLS)
export const supabase = createClient(supabaseUrl, supabasePublishableKey);

// Server Admin Client (Secret Key only - server-side only)
let supabaseAdmin: any;
if (typeof window === 'undefined' && process.env.SUPABASE_SECRET_KEY) {
  supabaseAdmin = createClient(
    supabaseUrl,
    process.env.SUPABASE_SECRET_KEY
  );
}
export { supabaseAdmin };

// Signed URL を生成（修正2: Private Bucket対応）
export async function getSignedUrl(storagePath: string, expiresIn: number = 3600): Promise<string> {
  const { data, error } = await supabaseAdmin.storage
    .from('logos')
    .createSignedUrl(storagePath, expiresIn);

  if (error) {
    throw new Error(`Failed to generate signed URL: ${error.message}`);
  }

  return data.signedUrl;
}