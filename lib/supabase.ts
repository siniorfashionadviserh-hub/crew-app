import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// クライアント側用
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// サーバー側用 (Service Role キー使用) - サーバーサイドのみで使用
let supabaseAdmin: any;
if (typeof window === 'undefined' && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  supabaseAdmin = createClient(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY
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