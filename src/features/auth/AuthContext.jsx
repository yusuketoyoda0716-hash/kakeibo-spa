import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

// Context オブジェクトを作成
// これが「アプリ全体で共有する箱」になる
const AuthContext = createContext(null);

// AuthProvider：アプリ全体をこれで囲むことで
// どのコンポーネントからでも useAuth() でログイン状態を取れる
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);       // ログイン中のユーザー情報
  const [loading, setLoading] = useState(true); // 認証状態の確認中フラグ

  useEffect(() => {
    // アプリ起動時に現在のセッション（ログイン状態）を確認する
    // ブラウザを閉じても Supabase がセッションを保持してくれるので
    // 再度開いたときに自動ログイン状態になる
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // ログイン・ログアウトのイベントを監視する
    // signIn/signOut が起きるたびに user を更新する
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    // コンポーネントが破棄されるときに監視を解除する
    return () => subscription.unsubscribe();
  }, []);

  // Googleログイン
  // supabase.auth.signInWithOAuth が Googleの認証画面へリダイレクトする
  const signInWithGoogle = () => {
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // ログイン後にトップページへ戻る
        redirectTo: window.location.origin,
      },
    });
  };

  // ログアウト
  const signOut = () => supabase.auth.signOut();

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// useAuth フック：コンポーネントから呼ぶだけで user などが取れる
// 例：const { user, signOut } = useAuth();
export function useAuth() {
  return useContext(AuthContext);
}
