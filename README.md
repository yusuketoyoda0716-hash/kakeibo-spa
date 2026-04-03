# 家計簿SPA

React + Supabase で作成した家計簿アプリです。
スマホファーストのUIで、Googleアカウントでログインしてデータをクラウド保存できます。

**デモ：** [kakeibo-spa.vercel.app](https://kakeibo-spa.vercel.app)

---

## 使用技術

| カテゴリ | 技術 |
|---|---|
| フロントエンド | React 19, React Router v7, Vite |
| スタイル | CSS Modules（CSS変数によるテーマ管理） |
| グラフ | Recharts |
| バックエンド / DB | Supabase（PostgreSQL + Auth + REST API） |
| 認証 | Google OAuth 2.0（Supabase Auth経由） |
| デプロイ | Vercel |

---

## 主な機能

### ① 取引追加（電卓UI）
- テンキー入力で金額を入力
- 支出 / 収入の切り替え
- カテゴリ・メモの保存

### ② ダッシュボード
- 月ごとの収支サマリー
- 支出カテゴリの円グラフ
- 支出ランキング

### ③ 取引管理
- 月フィルターで絞り込み
- インライン編集・削除（確認モーダルあり）

### ④ カテゴリ管理
- カテゴリの追加・削除
- 初回ログイン時にデフォルトカテゴリを自動登録

### ⑤ 定期取引
- 毎月の固定費をテンプレ登録
- ワンクリックで当月の取引に一括反映

---

## 設計のポイント

### カスタムHookによる関心の分離
データ取得・更新ロジックを `useTransactions` / `useCategories` / `useRecurring` のカスタムHookに切り出し、UIコンポーネントはデータ操作の詳細を知らなくて済む設計にしています。

```js
// コンポーネント側はHookのAPIだけ使う
const { transactions, addTransaction, deleteTransaction } = useTransactions();
```

### Supabase × Row Level Security（RLS）
SupabaseのRLSポリシーにより、ログインユーザーは自分のデータにしかアクセスできません。フロントエンドから直接DBを叩く構成でも、他ユーザーのデータが漏れない設計です。

```sql
-- 自分のデータのみ操作を許可するRLSポリシー
create policy "Users can access own data"
  on transactions for all
  using (auth.uid() = user_id);
```

### React Context による認証状態の一元管理
`AuthContext` でログイン状態をグローバルに管理し、`RequireAuth` コンポーネントで未ログイン時のルートガードを実装しています。

### スマホファーストUI
- PC：左サイドバーナビ
- スマホ：画面下部のボトムナビゲーション

CSS変数とメディアクエリで両対応しています。

---

## ローカルでの動作確認

```bash
git clone https://github.com/yusuke/kakeibo-spa
cd kakeibo-spa
npm install
cp .env.example .env   # .env に実際のキーを記入
npm run dev
```

### 環境変数

`.env.example` を参考に `.env` ファイルを作成してください。

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Supabaseプロジェクトを新規作成し、以下のSQLでテーブルを作成してください。

```sql
create table transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  type text not null,
  amount numeric not null,
  category text not null,
  memo text,
  date date not null,
  created_at timestamptz default now()
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  type text not null
);

create table recurring (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  type text not null,
  amount numeric not null,
  category text not null,
  memo text
);

-- RLS有効化
alter table transactions enable row level security;
alter table categories enable row level security;
alter table recurring enable row level security;

-- ポリシー設定
create policy "own data only" on transactions for all using (auth.uid() = user_id);
create policy "own data only" on categories for all using (auth.uid() = user_id);
create policy "own data only" on recurring for all using (auth.uid() = user_id);
```

---

## 今後の改善候補

- CSVエクスポート
- PWA化（オフライン対応）
- カテゴリアイコン設定
- 月次レポートのメール送信
