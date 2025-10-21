# AI年齢推定アプリ - Copilot Instructions

## アプリケーション概要
face-api.js（TensorFlow.jsベース）を使用したブラウザベースの年齢推定Webアプリ。画像から複数の顔を同時検出し、年齢・性別・表情をリアルタイムで分析する。

## アーキテクチャ
- **フロントエンド専用アプリ**: サーバー不要、完全にクライアントサイドで動作
- **CDN依存**: face-api.js とフォントはCDN経由で読み込み（`index.html` L10-11, L44）
- **モデル読み込み**: 初回起動時にTensorFlow.jsモデルを非同期で取得（`script.js` L1-18）
- **Canvas オーバーレイ**: 画像上に検出結果を直接描画する二重レイヤー構造

## 重要なワークフロー

### 開発・テスト環境
```bash
# 必須: CORS制限回避のためローカルサーバーが必要
python3 -m http.server 8000
# または
npx http-server . -p 8000
```

### 画像処理フロー
1. **ファイル選択** → `FileReader` でBase64変換
2. **プレビュー表示** → `img.onload` でモデル処理開始
3. **顔検出** → `detectAllFaces()` + `withAgeAndGender()` + `withFaceExpressions()`
4. **結果描画** → Canvas オーバーレイ + HTML結果表示

## プロジェクト固有のパターン

### エラーハンドリング戦略
- **CORS エラー**: HTMLファイル直接起動時の主要問題。必ずローカルサーバー経由を案内
- **モデル読み込み失敗**: インターネット接続確認とキャッシュクリア推奨（`script.js` L15-17）
- **顔検出失敗**: 画像品質（照明・解像度・角度）の問題として処理

### UI/UX設計思想
- **グラスモーフィズム**: `backdrop-filter: blur(40px)` + 半透明レイヤー
- **グラデーション統一**: CSS変数 `--primary`, `--secondary`, `--accent` で一貫性確保
- **レスポンシブ**: 768px/480px ブレークポイントでモバイル対応
- **アニメーション**: `cubic-bezier(0.4, 0, 0.2, 1)` で統一されたイージング

### Canvas描画の特徴
```javascript
// 高解像度対応とスケーリング処理
const scaleX = displayWidth / img.naturalWidth;
const dpr = window.devicePixelRatio || 1;
```
- 自然解像度とディスプレイサイズの比率計算が重要
- 複数人検出時は番号付きラベル表示
- グラデーション背景とシャドウエフェクトで視認性向上

## 拡張時の考慮点

### 新機能追加
- `face-api.js` の他の検出機能（年齢層分類、顔認識等）を活用可能
- `MODEL_URL` 変更で他のモデルプロバイダー対応
- `expressions` オブジェクトは7種類の感情値を含有

### パフォーマンス最適化
- `TinyFaceDetectorOptions()` は高速だが精度は中程度
- より精度が必要な場合は `SsdMobilenetv1Options()` に変更可能
- Canvas描画頻度の調整で描画性能改善

### デバッグのヒント
- ブラウザ開発者コンソールで `modelsLoaded` 状態確認
- `detection.confidence` で検出精度をチェック
- Canvas描画座標の確認は `box.x, box.y` でログ出力

## 依存関係管理
- **face-api.js**: `@vladmandic/face-api` fork版使用（本家より高機能）
- **フォント**: Google Fonts Poppins（ウェイト400-800）
- **アイコン**: Font Awesome 6.5.1（CDN経由）

コード修正時はCDNバージョン整合性とローカルサーバー起動を常に確認すること。