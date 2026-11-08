# いどばた管理画面

## システム概要

いどばた管理画面は、いどばたプラットフォームの管理機能を提供するウェブアプリケーションです。このアプリケーションを通じて、管理者はテーマの作成・編集・削除などの操作を行うことができます。

管理画面は React と TypeScript で構築されており、バックエンドとの通信には RESTful API を使用しています。認証システムにより、許可された管理者のみがアクセスできるようになっています。

## 技術スタック

- フロントエンド: React, TypeScript, Tailwind CSS
- バックエンド: Node.js, Express, MongoDB
- 認証: JWT (JSON Web Tokens)

## 初期セットアップ

### 前提条件

- Node.js (v14 以上)
- npm または yarn
- MongoDB (バックエンドで使用)

### インストール手順

1. リポジトリをクローン

```
git clone [リポジトリURL]
```

2. 依存関係のインストール

```
cd admin
npm install
```

3. 開発サーバーの起動

```
npm run dev
```

## 初期管理ユーザーの作成方法

初期管理ユーザーを作成するには、以下のコマンドを実行してください。これは過渡期的な措置であり、本番環境では別の方法でユーザー管理を行うことを推奨します。

```bash
curl -X POST http://localhost:3000/api/auth/initialize -H "Content-Type: application/json" -d '{"email":"admin@example.com","password":"SecurePassword123","name":"Admin User"}'
```

このコマンドは、以下の情報を持つ管理者ユーザーを作成します：

- メールアドレス: admin@example.com
- パスワード: SecurePassword123
- 名前: Admin User

セキュリティ上の理由から、実際の運用では必ず強力なパスワードを設定してください。

## 機能概要

### 認証機能

- ログイン/ログアウト
- セッション管理
- 権限管理

### テーマ管理

- テーマの一覧表示
- テーマの作成
- テーマの編集
- テーマの削除

### その他の機能

- ダッシュボード: システム全体の状態を確認
- ユーザー管理: 管理者ユーザーの管理（予定）

## 開発ガイド

### プロジェクト構造

```
admin/
├── public/          # 静的ファイル
├── src/             # ソースコード
│   ├── components/  # UIコンポーネント
│   ├── contexts/    # Reactコンテキスト
│   ├── pages/       # ページコンポーネント
│   ├── services/    # APIサービス
│   └── ...
└── ...
```

### 認証の仕組み

認証は JWT (JSON Web Tokens) を使用しています。ログイン時にサーバーからトークンを取得し、それをローカルストレージに保存します。その後の API 通信ではこのトークンを Authorization ヘッダーに含めることで認証を行います。

ログアウト時には、ローカルストレージからトークンを削除し、認証状態をクリアします。

## Basic認証付きリバースプロキシでホスティングする場合

管理画面のJWTは通常 `Authorization: Bearer <JWT>` で送信します。リバースプロキシ側が同じ `Authorization` ヘッダーをHTTP Basic認証に使う構成では、管理画面のビルド時に `VITE_JWT_AUTH_HEADER=X-Idobata-JWT` を指定できます。指定しなければ従来どおり `Authorization` を使います。

Dockerイメージの場合は、`.env` だけに設定してもビルドへ渡されないことがあります。adminサービスのComposeの `build.args.VITE_JWT_AUTH_HEADER` に明示的に指定してビルドしてください。設定値はクライアントのJavaScriptへ埋め込まれますが、JWTそのものをビルド変数に指定してはいけません。

Caddyなどのプロキシ側では、管理画面と `/api/*` を含む**すべての経路**をHTTP Basic認証で保護した後、管理APIの転送時にのみ次のようにJWTヘッダーを復元します（構成例。backendのホスト名や認証設定は環境に合わせる）。

```caddyfile
route {
    basic_auth {
        admin {$ADMIN_BASIC_HASH}
    }

    handle /api/* {
        reverse_proxy backend:3000 {
            header_up Authorization {http.request.header.X-Idobata-JWT}
            header_up -X-Idobata-JWT
        }
    }

    handle /socket.io/* {
        reverse_proxy backend:3000
    }

    handle /uploads/* {
        reverse_proxy backend:3000
    }

    handle {
        reverse_proxy admin:8080
    }
}
```

`X-Idobata-JWT` はBasic認証の代わりになるものではありません。リバースプロキシを通らずbackendへ直接アクセスできる公開ポートを作らないでください。JWTを付けない、または無効なJWTを付けた管理APIのリクエストは、従来どおりbackendのJWT認証で拒否される必要があります。

### 公開前の統合テスト（VPSなどの実際のプロキシ環境で実施）

以下は**受入テスト項目**です。PRのユニットテストは管理画面の送信ヘッダーのみを検証し、Caddy自体を起動した統合テストではありません。Caddyfileは適用前に `caddy validate` を通してください。

- [ ] Basic認証なしで `/` と `/api/auth/me` にアクセスして401になる（管理画面のHTMLもAPIも返さない）。
- [ ] 誤ったBasic認証情報でも401になる。
- [ ] 正しいBasic認証で管理画面が表示できるが、JWTなしの `/api/auth/me` はbackendで401になる。
- [ ] 正しいBasic認証と無効な `X-Idobata-JWT: Bearer ...` を送ってもbackendで401になる。
- [ ] 正しいBasic認証後、管理画面内でログインして `/api/auth/me` が200になり、認証付き管理操作が動作する。
- [ ] `/socket.io/*`、`/uploads/*` などもBasic認証なしでアクセスできず、正規のブラウザからの通信は動作する。
- [ ] 別の閲覧用Basic資格情報で管理ホストを開けず、既存のホストへのアクセスは引き続き正常。

テスト時のパスワード、JWT、APIキー、`docker compose config` の展開結果をログ・PR・Issueへ貼らないでください。
