# CREW α版 Phase 0 セットアップ手順

Phase 0 のセットアップが完了しています。以下の手順で開発環境を立ち上げてください。

---

## 1. 環境変数の設定

### ステップ 1: `.env.local` ファイルを作成

```bash
cp .env.local.example .env.local
```

### ステップ 2: Supabase 情報を取得して入力

1. [Supabase 管理画面](https://app.supabase.com) にログイン
2. プロジェクトを選択
3. 左サイドバーから「Project Settings」→「API」を選択
4. 以下をコピー：
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` キー → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret` キー → `SUPABASE_SERVICE_ROLE_KEY`

### ステップ 3: Claude API キーを取得

1. [Claude API 管理ページ](https://console.anthropic.com) にログイン
2. API キーを生成
3. `.env.local` の `CLAUDE_API_KEY` に貼り付け

### ステップ 4: 環境変数の確認

```bash
# .env.local が以下のフィールドを含むか確認
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
CLAUDE_API_KEY=xxx
CLAUDE_API_MODEL=claude-3-5-sonnet-20241022
AI_PRICING_CONFIG={"claude-3-5-sonnet-20241022":{"input":0.003,"output":0.015}}
```

---

## 2. Supabase Database Setup

### ステップ 1: Migration を実行

```bash
npx supabase migration up
```

または、Supabase 管理画面で SQL エディターを開き、
`supabase/migrations/001_initial_schema.sql` の内容をコピー・実行。

### ステップ 2: Supabase Storage を設定

1. Supabase 管理画面 → Storage
2. 新規バケット作成：
   - **Name**: `crew-storage`
   - **Visibility**: `Private` ⚠️ **必須**

3. RLS ポリシーを設定：

```sql
-- Allow users to upload assets to their own folder
CREATE POLICY "Users can upload assets to their own folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'crew-storage' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to view their own assets
CREATE POLICY "Users can view their own assets"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'crew-storage' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
```

---

## 3. ローカル開発環境を起動

### ステップ 1: 依存関係をインストール

```bash
npm install
```

### ステップ 2: 開発サーバーを起動

```bash
npm run dev
```

### ステップ 3: ブラウザでアクセス

```
http://localhost:3000
```

---

## 4. ビルド・型チェック

### TypeScript 型チェック

```bash
npm run build
```

### ESLint

```bash
npm run lint
```

---

## 5. 動作確認チェックリスト

- [ ] `npm run dev` が成功
- [ ] http://localhost:3000 にアクセスできる
- [ ] Supabase にログインできる
- [ ] DB tables が Supabase 管理画面に表示されている
- [ ] `crew-storage` bucket が存在する
- [ ] `npm run build` が成功

---

## 6. Phase 1 実装前の最終確認

```bash
# すべてのセットアップが完了したか確認
npm run build && npm run lint
```

**成功メッセージ**:
```
✓ Compiled successfully
✓ ESLint check passed
```

---

## トラブルシューティング

### エラー: `NEXT_PUBLIC_SUPABASE_URL is not defined`

→ `.env.local` が存在し、正しい値が入力されているか確認

### エラー: `Failed to collect configuration for /api/auth/signup`

→ 環境変数が未設定。Step 1 を再度確認

### エラー: `Cannot find module '@anthropic-ai/sdk'`

→ `npm install` を再実行

### Supabase 接続エラー

→ Supabase プロジェクトが正常に起動しているか確認
→ API キーが正しいか確認

---

## 次のステップ

Phase 0 セットアップが完了したら、**Phase 1 基盤機能** の実装を開始してください。

**Phase 1 で実装する項目**:
- オンボーディングページ（Step 1-4）
- Dashboard（HOME）ページ
- Account Strategy AI 生成 API
- ユーザーコンテキスト・Hooks

---

## コマンド一覧

| コマンド | 説明 |
|---------|------|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | ビルド（型チェック含む） |
| `npm run start` | 本番サーバー起動 |
| `npm run lint` | ESLint 実行 |

---

**セットアップ完了後**: Phase 0 完了報告書を確認してください。
→ [PHASE_0_COMPLETION_REPORT.md](./PHASE_0_COMPLETION_REPORT.md)

---

**Status**: ✅ Ready for Phase 1