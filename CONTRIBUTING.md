# Contributing to AI年齢推定アプリ

まず、このプロジェクトへの貢献に興味を持っていただき、ありがとうございます！🎉

## 🤝 コントリビューションの種類

以下のような貢献を歓迎します：

- 🐛 **バグ修正**
- ✨ **新機能の提案・実装**
- 📝 **ドキュメントの改善**
- 🎨 **UIデザインの改善**
- 🔧 **パフォーマンスの最適化**
- 🧪 **テストの追加**
- 🌐 **国際化・多言語対応**

## 🚀 開発環境のセットアップ

1. **リポジトリをフォーク**
   ```bash
   # GitHubでフォークボタンをクリック
   ```

2. **ローカルにクローン**
   ```bash
   git clone https://github.com/YOUR_USERNAME/age-recognition-app.git
   cd age-recognition-app
   ```

3. **開発用ブランチを作成**
   ```bash
   git checkout -b feature/your-feature-name
   # または
   git checkout -b fix/your-bug-fix
   ```

4. **ローカルサーバーを起動**
   ```bash
   python3 -m http.server 8000
   # または
   npx http-server . -p 8000
   ```

## 📋 プルリクエストのガイドライン

### 事前チェック
- [ ] コードが正常に動作する
- [ ] 既存機能に影響がない
- [ ] ブラウザで動作確認済み
- [ ] コードスタイルが統一されている

### PR作成時
1. **わかりやすいタイトル**
   ```
   ✨ Add gender change functionality
   🐛 Fix canvas drawing on mobile
   📝 Update README documentation
   ```

2. **詳細な説明**
   - 変更内容の概要
   - 変更理由
   - テスト方法
   - スクリーンショット（UI変更の場合）

3. **関連するIssueにリンク**
   ```markdown
   Closes #123
   Related to #456
   ```

## 🎯 開発のベストプラクティス

### JavaScript
- ES6+の機能を積極的に使用
- 適切なエラーハンドリング
- わかりやすい変数・関数名
- 適切なコメント

### CSS
- CSS変数の活用
- レスポンシブデザインの考慮
- ブラウザ互換性の確認
- パフォーマンスを意識したセレクタ

### コミットメッセージ
```bash
# 良い例
git commit -m "✨ Add manual gender correction feature"
git commit -m "🐛 Fix canvas scaling on high DPI displays"
git commit -m "📝 Update installation instructions"

# 悪い例
git commit -m "fix"
git commit -m "update"
```

## 🐛 バグ報告

バグを発見した場合は、以下の情報を含めてIssueを作成してください：

### 必須情報
- **ブラウザ**: Chrome 91, Firefox 89, etc.
- **OS**: Windows 10, macOS 12, etc.
- **画面サイズ**: デスクトップ、モバイル等
- **再現手順**: 1. xxx, 2. yyy, 3. zzz
- **期待する動作**: xxxが表示される
- **実際の動作**: yyyが表示される
- **エラーメッセージ**: コンソールエラーがあれば

### 追加情報（可能であれば）
- スクリーンショット
- ブラウザの開発者コンソールのログ
- 使用した画像の情報（サイズ、形式等）

## 💡 機能提案

新機能のアイデアがある場合：

1. **既存のIssueを確認**
   - 重複提案を避けるため

2. **Feature Requestを作成**
   - 提案する機能の概要
   - 使用ケース・メリット
   - 実装の難易度（わかれば）

3. **ディスカッション**
   - コミュニティでの議論
   - 技術的な実現可能性の検討

## 🎨 UI/UXの改善

デザイン改善の提案も歓迎します：

- **アクセシビリティ**: 色覚異常対応、キーボード操作等
- **ユーザビリティ**: より直感的な操作方法
- **レスポンシブ**: モバイル・タブレット対応
- **パフォーマンス**: 読み込み速度、アニメーション等

## 📞 質問・サポート

- **GitHub Discussions**: 一般的な質問や議論
- **Issues**: バグ報告・機能要望
- **Email**: 直接連絡が必要な場合

## 🏆 コントリビューター

貢献していただいた方は、README.mdのコントリビューターセクションに掲載させていただきます！

---

**Happy Coding! 🚀**