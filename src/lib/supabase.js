import { createClient } from "@supabase/supabase-js";

// .env から URL と anon key を読み込む
// Vite では import.meta.env.VITE_*** で環境変数にアクセスできる
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Supabase クライアントを作成してエクスポート
// このクライアントを通じてDB操作・認証をすべて行う
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
