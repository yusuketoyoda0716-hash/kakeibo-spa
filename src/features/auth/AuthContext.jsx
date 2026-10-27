import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut as fbSignOut } from "firebase/auth";
import { auth, googleProvider, isFirebaseConfigured } from "../../lib/firebase";
import { createFirestoreRepo } from "../../data/firestoreRepo";
import { createGuestRepo } from "../../data/guestRepo";

// Context オブジェクトを作成
// これが「アプリ全体で共有する箱」になる
const AuthContext = createContext(null);

// AuthProvider：アプリ全体をこれで囲むことで
// どのコンポーネントからでも useAuth() でログイン状態を取れる
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // ログイン中のユーザー情報
  // Firebase 未設定なら確認するものがないので最初から loading=false
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [guestRepo, setGuestRepo] = useState(null); // ゲストモード中だけ入る

  useEffect(() => {
    if (!auth) return;
    // ログイン状態の変化を監視する
    // ブラウザを閉じても Firebase がセッションを保持するので、再度開くと自動ログイン状態になる
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  // ログイン方法に応じてデータの保存先（リポジトリ）を切り替える
  //   ゲスト → メモリ上のサンプルデータ
  //   Googleログイン → Firestore
  // 各画面は repo の API だけを使うので、保存先の違いを意識しなくてよい
  const repo = useMemo(() => {
    if (guestRepo) return guestRepo;
    if (user) return createFirestoreRepo(user.uid);
    return null;
  }, [guestRepo, user]);

  const value = {
    user,
    loading,
    repo,
    isGuest: Boolean(guestRepo),
    canUseGoogle: isFirebaseConfigured,

    // Googleログイン（ポップアップでGoogleの認証画面を開く）
    signInWithGoogle: () => signInWithPopup(auth, googleProvider),

    // ゲストで試す（毎回サンプルデータから始まる）
    signInAsGuest: () => setGuestRepo(createGuestRepo()),

    // ログアウト／ゲストモード終了
    signOut: () => {
      if (guestRepo) return setGuestRepo(null);
      return fbSignOut(auth);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// useAuth フック：コンポーネントから呼ぶだけで user などが取れる
// 例：const { user, signOut } = useAuth();
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
