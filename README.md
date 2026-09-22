# CREW - AI SNS Director

CREWは、SNS運用を完全にサポートするAI SNSディレクターアプリケーション。

**コンセプト**: 「何を投稿すればいい？」「何を撮ればいい？」「どう撮ればいい？」を考えなくてもよくする

---

## 現在のフェーズ

**Phase 0: セットアップ完了** ✅

- [x] Next.js 14 プロジェクト初期化
- [x] Supabase セットアップ（DB + Auth + Storage）
- [x] Claude API 統合
- [x] API ルート基本実装
- [x] 型定義完成

**次のフェーズ**: Phase 1 基盤機能（実装予定）

---

## クイックスタート

### 1. セットアップ

```bash
# 環境変数を設定
cp .env.local.example .env.local

# Supabase 情報、Claude API キーを入力
# 詳細は SETUP_INSTRUCTIONS.md を参照
```

### 2. 開発環境起動

```bash
npm install
npm run dev
```

### 3. ブラウザでアクセス

```
http://localhost:3000
```

---

## ドキュメント

- **[セットアップ手順](./SETUP_INSTRUCTIONS.md)** - 開発環境立ち上げ
- **[Phase 0 完了報告](./PHASE_0_COMPLETION_REPORT.md)** - 実装内容詳細
- **[実装仕様書](../CREW_α版実装仕様書.pdf)** - 全体仕様

---

## ファイル構成

```
crew-app/
├── app/
│   ├── api/                    # API ルート
│   │   ├── auth/               # 認証
│   │   └── accounts/           # アカウント管理
│   ├── layout.tsx              # Root レイアウト
│   └── page.tsx                # ホームページ
├── lib/
│   ├── supabase.ts             # Supabase クライアント
│   ├── claude.ts               # Claude API 統合
│   └── types.ts                # TypeScript 型定義
├── supabase/
│   └── migrations/             # DB マイグレーション
├── public/                     # 静的ファイル
├── .env.local.example          # 環境変数テンプレート
└── README.md                   # このファイル
```

---

## 技術スタック

| レイヤー | 技術 |
|---------|------|
| **Frontend** | Next.js 14, React 19, TypeScript, Tailwind CSS |
| **Backend** | Next.js API Routes |
| **Database** | PostgreSQL (Supabase) |
| **Auth** | Supabase Auth (OTP) |
| **Storage** | Supabase Storage (Private) |
| **AI** | Claude API |
| **Deploy** | Vercel |

---

## 主な特徴

### ✅ Phase 0 で実装済み

1. **Supabase 統合**
   - PostgreSQL DB（12テーブル、RLS完備）
   - Magic Link 認証
   - Private Storage（Signed URL）

2. **Claude API 統合**
   - 動的料金管理（環境変数で制御）
   - Token 計測・記録

3. **セキュリティ**
   - Row Level Security ポリシー
   - Private Storage バケット
   - API キーの安全な管理

4. **Senior First UX**
   - 50～70代ユーザー対応設計
   - シンプルなナビゲーション
   - 進捗表示

---

## 修正内容の実装状況

| # | 修正内容 | 状態 |
|---|---------|------|
| 1 | shooting_guide_cuts テーブル新設 | ✅ |
| 2 | Private Bucket + Signed URL | ✅ |
| 3 | Trend Engine データモデル分離 | ✅ |
| 4 | reference_accounts URL 保存のみ | ✅ |
| 5 | AI モデル・料金を環境変数管理 | ✅ |

---

## 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド（型チェック含む）
npm run build

# 本番サーバー起動
npm run start

# ESLint 実行
npm run lint
```

---

## API エンドポイント（Phase 0 実装済み）

| Method | Path | 説明 |
|--------|------|------|
| POST | `/api/auth/signup` | ユーザー登録（Magic Link） |
| GET | `/api/accounts` | アカウント一覧取得 |
| POST | `/api/accounts` | アカウント作成 |

---

## Phase 1 で実装予定

- [ ] オンボーディング（Step 1-4）
- [ ] Dashboard（HOME）
- [ ] Account Strategy AI 生成
- [ ] Trend Format Library
- [ ] Trend Engine
- [ ] 企画生成
- [ ] ユーザーコンテキスト

---

## トラブルシューティング

詳細は [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md#トラブルシューティング) を参照。

---

## ライセンス

Proprietary（ハル様プロジェクト）

---

**Status**: ✅ Phase 0 Complete - Ready for Phase 1  
**Last Updated**: 2026-09-22
