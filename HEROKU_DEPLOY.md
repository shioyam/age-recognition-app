# Heroku Deployment Guide

## 1. Heroku CLIのインストール
```bash
# macOS
brew tap heroku/brew && brew install heroku

# または公式サイトからダウンロード
# https://devcenter.heroku.com/articles/heroku-cli
```

## 2. Herokuにログイン
```bash
heroku login
```

## 3. Herokuアプリを作成
```bash
heroku create age-recognition-ai-app
```

## 4. 環境変数を設定
```bash
heroku config:set DEEPL_API_KEY=a83a2a6f-c5e0-43e8-b010-67219d20efff
heroku config:set NODE_ENV=production
heroku config:set ALLOWED_ORIGINS=https://age-recognition-ai-app.herokuapp.com
```

## 5. デプロイ
```bash
git push heroku main
```

## 6. アプリを開く
```bash
heroku open
```

## トラブルシューティング
```bash
# ログを確認
heroku logs --tail

# アプリの状況を確認
heroku ps

# 環境変数を確認
heroku config
```