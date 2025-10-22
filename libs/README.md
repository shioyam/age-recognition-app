# ローカルライブラリ

CDN依存を減らすため、重要なライブラリをローカルに配置できます。

## face-api.js のローカル配置

1. 以下のURLから最新版をダウンロード:
   - https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/dist/face-api.min.js

2. このディレクトリに `face-api.min.js` として保存

3. モデルファイルも同様にダウンロード可能:
   - https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model/

## 使用方法

ローカルファイルが存在する場合、自動的にCDNより優先して読み込まれます。

## 注意事項

- ライブラリファイルは定期的に更新してください
- セキュリティのため、信頼できるソースからのみダウンロードしてください
- ファイルサイズが大きいため、必要に応じて圧縮を検討してください