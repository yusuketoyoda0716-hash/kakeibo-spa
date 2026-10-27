# 家計簿SPA

React + Firebase で作成した家計簿アプリです。
スマホファーストのUIで、Googleアカウントでログインしてデータをクラウド保存できます。
ログインせずに **「ゲストで試す」** からサンプルデータで全機能を試すこともできます。

**デモ：** [kakeibo-spa.vercel.app](https://kakeibo-spa.vercel.app)（ログイン画面の「ゲストで試す」からすぐ触れます）

<p>
  <img src="docs/screenshots/pc-dashboard.png" alt="ダッシュボード（PC）" width="64%">
  <img src="docs/screenshots/sp-add.png" alt="取引追加（スマホ）" width="23%">
</p>

> スクリーンショットはゲストモード（サンプルデータ）で撮影しています。

---

## 画面

### ログイン
Googleでログインするか、ゲストモードで試せます。

| PC | スマホ |
|---|---|
| <img src="docs/screenshots/pc-login.png" alt="ログイン画面（PC）" width="520"> | <img src="docs/screenshots/sp-login.png" alt="ログイン画面（スマホ）" width="220"> |

### ダッシュボード
今月の収入・支出・収支と、支出カテゴリの円グラフ／ランキングを表示します。

| PC | スマホ |
|---|---|
| <img src="docs/screenshots/pc-dashboard.png" alt="ダッシュボード（PC）" width="520"> | <img src="docs/screenshots/sp-dashboard.png" alt="ダッシュボード（スマホ）" width="220"> |

### 取引追加（電卓UI）
テンキーで金額を入力し、カテゴリはボトムシートから選びます。最近使ったカテゴリが上に出ます。

| 金額入力 | カテゴリ選択 |
|---|---|
| <img src="docs/screenshots/sp-add.png" alt="取引追加" width="220"> | <img src="docs/screenshots/sp-add-category.png" alt="カテゴリ選択シート" width="220"> |

### 取引一覧
月ごとに絞り込み、その場で編集・削除できます。

| PC | スマホ |
|---|---|
| <img src="docs/screenshots/pc-transactions.png" alt="取引一覧（PC）" width="520"> | <img src="docs/screenshots/sp-transactions.png" alt="取引一覧（スマホ）" width="220"> |

---

## 使用技術

| カテゴリ | 技術 |
|---|---|
| フロントエンド | React 19, React Router v7, Vite 7 |
| スタイル | プレーンCSS（CSS変数によるテーマ管理・メディアクエリ） |
| グラフ | Recharts |
| アイコン | lucide-react |
| 認証 | Firebase Authentication（Googleログイン） |
| DB | Cloud Firestore（セキュリティルールでユーザーごとにアクセス制御） |
| デプロイ | Vercel |

---

## 主な機能

### ① 取引追加（電卓UI）
- テンキー入力で金額を入力（`00` キー・1文字削除・クリアあり）
- 支出 / 収入の切り替え
- 日付・メモの入力
- カテゴリ選択はボトムシート形式。最近使ったカテゴリを上部に表示（localStorageに保存）

### ② ダッシュボード
- 今月の収入・支出・収支サマリー
- 支出カテゴリの円グラフ
- 支出カテゴリのランキング（上位8件）
- 定期取引を今月分としてまとめて反映するボタン

### ③ 取引管理
- 月フィルターで絞り込み（月ごとの収支サマリー付き）
- インライン編集（カテゴリは一覧から選択 or 新規入力）
- 削除（確認モーダルあり）

### ④ カテゴリ管理
- カテゴリの追加・削除
- 初回ログイン時にデフォルトカテゴリ（食費・日用品・交通 など10件）を自動登録

### ⑤ 定期取引
- 家賃・通信費などの固定費／給与をテンプレとして登録
- ダッシュボードのボタンで当月1日付の取引として一括反映
- 同じ月に何度押しても二重登録されない

### ⑥ ゲストモード
- ログインなしで、サンプルデータを使って全機能を操作できる
- データはメモリ上だけに置き、保存はしない（リロードでサンプルに戻る）

---

## 設計のポイント

### 機能単位のディレクトリ構成
```
src/
├── app/            # ルーティング・共通レイアウト・ルートガード
├── data/           # データの保存先（Firestore / ゲスト用）
├── features/
│   ├── auth/         # 認証（AuthContext, LoginPage）
│   ├── dashboard/    # ダッシュボード
│   ├── transactions/ # 取引の追加・一覧・TransactionsContext
│   └── settings/     # カテゴリ・定期取引（useCategories, useRecurring）
├── shared/hooks/   # 汎用Hook（useLocalStorage）
└── lib/            # Firebase初期化・日付ユーティリティ
```

### 保存先を差し替えられるリポジトリ層
データの読み書きを `data/firestoreRepo.js`（Firestore）と `data/guestRepo.js`（メモリ上のサンプルデータ）に分け、どちらも同じAPI（`listTransactions` / `addTransactions` など）を持たせています。
`AuthContext` がログイン方法に応じてどちらかを渡すので、画面側は保存先の違いを意識せずに同じコードで動きます。ゲストモードはこの仕組みで実現しています。

```js
// ログイン方法に応じて保存先を切り替える（AuthContext）
const repo = useMemo(() => {
  if (guestRepo) return guestRepo;                    // ゲスト → サンプルデータ
  if (user) return createFirestoreRepo(user.uid);     // Googleログイン → Firestore
  return null;
}, [guestRepo, user]);
```

### Context / カスタムHookによる関心の分離
取引は `TransactionsContext`、設定系は `useCategories` / `useRecurring` に処理をまとめ、UIコンポーネントはデータ操作の詳細を知らなくて済む設計にしています。
取引データはダッシュボード・一覧・追加の3画面で共有するため Context にまとめ、追加した取引がすぐ他の画面にも反映されるようにしています。

### Firestore セキュリティルールでユーザーごとにデータを分離
データは `users/{uid}/transactions` のようにユーザーごとのパスに保存し、セキュリティルールで「ログイン中の本人のパスだけ読み書きできる」ようにしています。フロントエンドから直接DBを操作する構成でも、他ユーザーのデータにはアクセスできません。取引は種別・金額・日付の形もルール側でチェックしています（`firestore.rules`）。

```
match /users/{uid}/transactions/{id} {
  allow read, delete: if isOwner(uid);
  allow create, update: if isOwner(uid) && isValidTransaction(request.resource.data);
}
```

### 定期取引の二重反映を「IDの設計」で防ぐ
定期取引から反映した取引のIDを `rec_{テンプレID}_{月}` に固定しています。同じ月に何度反映しても同じIDへの書き込みになるため、データが重複しません。

### 日付はローカル時刻で扱う
`toISOString()` はUTCになり、日本時間の0〜9時に「前日」扱いになるため、日付の計算は `lib/dates.js` にまとめてローカル時刻で行っています。

### React Context による認証状態の一元管理
`AuthContext` でログイン状態をグローバルに管理し、`RequireAuth` コンポーネントで未ログイン時はログイン画面を表示するルートガードを実装しています。

### スマホファーストUI
- PC：左サイドバーナビ
- スマホ（768px以下）：画面下部のボトムナビゲーション

CSS変数とメディアクエリで両対応しています。

### 設定がなくても落ちない作り
- Firebase の環境変数が未設定のときは、Googleログインを無効にしてゲストモードだけ使えるようにしています
- `useLocalStorage` Hook は読み書きを try/catch で包み、Safariのプライベートモードなどで localStorage が使えなくてもアプリが落ちないようにしています

---

## ローカルでの動作確認

```bash
git clone https://github.com/yusuketoyoda0716-hash/kakeibo-spa.git
cd kakeibo-spa
npm install
cp .env.example .env   # .env に Firebase の設定値を記入（未記入でもゲストモードは動きます）
npm run dev
```

### Firebase のセットアップ

1. [Firebase コンソール](https://console.firebase.google.com/) でプロジェクトを作成
2. 「Authentication」→「Sign-in method」で **Google** を有効化
3. 「Authentication」→「設定」→「承認済みドメイン」にデプロイ先のドメイン（例：`kakeibo-spa.vercel.app`）を追加
4. 「Firestore Database」を作成し、「ルール」タブに `firestore.rules` の内容を貼り付けて公開
5. 「プロジェクトの設定」→「マイアプリ」でウェブアプリを追加し、表示された設定値を `.env` に記入

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Vercel にデプロイする場合は、同じ値を Vercel の「Environment Variables」にも登録してください。

### データ構成（Firestore）

```
users/{uid}/transactions/{id}   date, type, category, amount, note, recurringId?, appliedMonth?, createdAt
users/{uid}/categories/{id}     name, order
users/{uid}/recurring/{id}      type, category, amount, note, createdAt
```

---

## 今後の改善候補

- ダッシュボードの表示月切り替え・月次推移グラフ
- CSVエクスポート
- PWA化（オフライン対応）
- カテゴリアイコン設定
