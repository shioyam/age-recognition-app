# 🚀 デプロイガイド

## ローカル開発

### 1. 依存関係のインストール
```bash
npm install
```

### 2. 環境変数の設定
```bash
# .envファイルを作成（.env.exampleをコピー）
cp .env.example .env

# APIキーを設定
echo "DEEPL_API_KEY=your-api-key-here" >> .env
```

### 3. 開発サーバーの起動
```bash
# フロントエンド（静的ファイル）+ バックエンドAPI
npm start

# 開発モード（ファイル変更監視）
npm run dev
```

## 本番デプロイ

### Heroku
```bash
# Herokuアプリ作成
heroku create your-app-name

# 環境変数設定
heroku config:set DEEPL_API_KEY=your-api-key
heroku config:set NODE_ENV=production
heroku config:set ALLOWED_ORIGINS=https://your-app-name.herokuapp.com

# デプロイ
git push heroku main
```

### Vercel
```bash
# Vercelにデプロイ
vercel

# 環境変数設定
vercel env add DEEPL_API_KEY
vercel env add NODE_ENV production
vercel env add ALLOWED_ORIGINS https://your-app.vercel.app
```

### Railway
```bash
# Railwayにデプロイ
railway login
railway new

# 環境変数設定
railway variables set DEEPL_API_KEY=your-api-key
railway variables set NODE_ENV=production
```

### Docker
```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
# ビルドと実行
docker build -t age-recognition-app .
docker run -p 3000:3000 --env-file .env age-recognition-app
```

## GitHub Pages + バックエンド分離

### 1. フロントエンド（GitHub Pages）
- 静的ファイル（HTML, CSS, JS）をGitHub Pagesにデプロイ
- バックエンドAPIには別サービスを使用

### 2. バックエンドAPI（別サービス）
```javascript
// フロントエンドでAPI URLを環境に応じて設定
const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://your-api.herokuapp.com'
    : 'http://localhost:3000';
```

## 環境変数一覧

| 変数名 | 説明 | 必須 | デフォルト |
|--------|------|------|------------|
| `DEEPL_API_KEY` | DeepL API キー | ✅ | - |
| `PORT` | サーバーポート | ❌ | 3000 |
| `NODE_ENV` | 実行環境 | ❌ | development |
| `ALLOWED_ORIGINS` | CORS許可ドメイン | ❌ | localhost:8000 |

## セキュリティチェックリスト

### デプロイ前確認
- [ ] `.env`ファイルが`.gitignore`に含まれている
- [ ] APIキーがコードに直接書かれていない  
- [ ] 本番環境変数が正しく設定されている
- [ ] CORS設定が適切である
- [ ] HTTPS が有効になっている

### 本番監視
- [ ] アプリケーションログの監視
- [ ] APIレート制限の監視
- [ ] エラー率の監視
- [ ] レスポンス時間の監視

## トラブルシューティング

### よくある問題

**CORS エラー**
```javascript
// server.js で適切なオリジンを設定
origin: process.env.ALLOWED_ORIGINS?.split(',')
```

**APIキーエラー**
```bash
# 環境変数を確認
echo $DEEPL_API_KEY

# アプリケーション内で確認
console.log('API Key configured:', !!process.env.DEEPL_API_KEY);
```

**ポートエラー**
```bash
# Herokuの場合、PORTは動的に割り当てられる
const PORT = process.env.PORT || 3000;
```

## パフォーマンス最適化

### 1. キャッシュ戦略
```javascript
// 翻訳結果をLocalStorageにキャッシュ
localStorage.setItem(`translation_${lang}_${hash}`, result);
```

### 2. レート制限の調整
```javascript
// 用途に応じてレート制限を調整
const RATE_LIMIT = process.env.NODE_ENV === 'production' ? 20 : 10;
```

### 3. バッチ処理
```javascript
// 複数テキストを一度に翻訳
async function translateBatch(texts, targetLang) {
    // 実装済み
}
```

このガイドに従って安全かつ効率的にデプロイできます。