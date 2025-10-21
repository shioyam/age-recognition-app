# AI年齢推定アプリ | Age Estimation AI | 나이 추정 AI | Altersschätzung KI

[🇯🇵 日本語](#japanese) | [🇺🇸 English](#english) | [🇰🇷 한국어](#korean) | [🇩🇪 Deutsch](#german)

[![Demo](https://img.shields.io/badge/Demo-Live-brightgreen)](https://shioyam.github.io/age-recognition-app/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-Face--API-orange.svg)](https://github.com/vladmandic/face-api)

---

## <a id="japanese"></a>🇯🇵 日本語

TensorFlow.jsとface-api.jsを使用した、ブラウザベースの年齢推定Webアプリケーションです。画像から顔を検出し、AI技術を使って年齢、性別、表情をリアルタイムで分析します。

### ✨ 特徴

- 🎯 **高精度AI分析**: TensorFlow.jsベースの先進的な顔検出・年齢推定
- 👥 **複数人対応**: 1枚の画像で複数の顔を同時に分析
- 🌍 **多言語対応**: 日本語、英語、韓国語、ドイツ語に対応
- 🔒 **完全プライベート**: 全ての処理はブラウザ内で完結、データは外部送信されません
- 📱 **レスポンシブ**: モバイル・デスクトップ両対応のモダンUI
- ⚡ **リアルタイム**: 画像アップロード後、瞬時に結果を表示

### 🛠️ 技術仕様

- **フロントエンド**: HTML5, CSS3, JavaScript (ES6+)
- **AI ライブラリ**: TensorFlow.js, face-api.js
- **国際化**: JSON-based i18n システム
- **デプロイ**: GitHub Pages (完全静的サイト)

---

## <a id="english"></a>🇺🇸 English

A browser-based age estimation web application using TensorFlow.js and face-api.js. Detects faces in images and analyzes age, gender, and expressions in real-time using AI technology.

### ✨ Features

- 🎯 **High-Precision AI**: Advanced face detection and age estimation with TensorFlow.js
- 👥 **Multi-Face Detection**: Simultaneously analyze multiple faces in a single image
- 🌍 **Multi-Language**: Supports Japanese, English, Korean, and German
- 🔒 **Completely Private**: All processing done in browser, no external data transmission
- 📱 **Responsive Design**: Modern UI supporting both mobile and desktop
- ⚡ **Real-Time Processing**: Instant results after image upload

### 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **AI Libraries**: TensorFlow.js, face-api.js
- **Internationalization**: JSON-based i18n system
- **Deployment**: GitHub Pages (fully static site)

---

## <a id="korean"></a>🇰🇷 한국어

TensorFlow.js와 face-api.js를 사용한 브라우저 기반 나이 추정 웹 애플리케이션입니다. 이미지에서 얼굴을 감지하고 AI 기술을 사용하여 나이, 성별, 표정을 실시간으로 분석합니다.

### ✨ 주요 기능

- 🎯 **고정밀 AI**: TensorFlow.js 기반 고급 얼굴 감지 및 나이 추정
- 👥 **다중 얼굴 감지**: 한 장의 이미지에서 여러 얼굴을 동시에 분석
- 🌍 **다국어 지원**: 일본어, 영어, 한국어, 독일어 지원
- 🔒 **완전한 프라이버시**: 모든 처리는 브라우저에서 수행, 외부 데이터 전송 없음
- 📱 **반응형 디자인**: 모바일과 데스크톱을 모두 지원하는 모던 UI
- ⚡ **실시간 처리**: 이미지 업로드 후 즉시 결과 표시

### 🛠️ 기술 스택

- **프론트엔드**: HTML5, CSS3, JavaScript (ES6+)
- **AI 라이브러리**: TensorFlow.js, face-api.js
- **국제화**: JSON 기반 i18n 시스템
- **배포**: GitHub Pages (완전 정적 사이트)

---

## <a id="german"></a>🇩🇪 Deutsch

Eine browserbasierte Altersschätzungs-Webanwendung mit TensorFlow.js und face-api.js. Erkennt Gesichter in Bildern und analysiert Alter, Geschlecht und Ausdrücke in Echtzeit mit KI-Technologie.

### ✨ Funktionen

- 🎯 **Hochpräzise KI**: Erweiterte Gesichtserkennung und Altersschätzung mit TensorFlow.js
- 👥 **Multi-Gesichtserkennung**: Gleichzeitige Analyse mehrerer Gesichter in einem Bild
- 🌍 **Mehrsprachig**: Unterstützt Japanisch, Englisch, Koreanisch und Deutsch
- 🔒 **Vollständig privat**: Alle Verarbeitung im Browser, keine externe Datenübertragung
- 📱 **Responsives Design**: Modernes UI für Mobile und Desktop
- ⚡ **Echtzeitverarbeitung**: Sofortige Ergebnisse nach Bild-Upload

### 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **KI-Bibliotheken**: TensorFlow.js, face-api.js
- **Internationalisierung**: JSON-basiertes i18n-System
- **Deployment**: GitHub Pages (vollständig statische Seite)

---

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/your-username/age-recognition-app.git
cd age-recognition-app

# Start local server (required for CORS)
python3 -m http.server 8000
# または | or | 또는 | oder
npx http-server . -p 8000

# Open in browser
open http://localhost:8000
```

## 📁 File Structure

```
age-recognition-app/
├── index.html          # Main application
├── style.css           # Modern responsive styles
├── script.js           # AI processing logic
├── translations.json   # Multi-language support
├── README.md           # This documentation
└── .github/workflows/
    └── deploy.yml      # Automated GitHub Pages deployment
```

## 🌍 Language Support

The application automatically detects browser language and supports:

| Language | Code | Status | Native Name |
|----------|------|--------|-------------|
| Japanese | `ja` | ✅ | 日本語 |
| English | `en` | ✅ | English |
| Korean | `ko` | ✅ | 한국어 |
| German | `de` | ✅ | Deutsch |

Language can be changed using the dropdown in the top-right corner.

## 🎨 Design Features

- **Modern Glass-morphism UI**: Backdrop blur effects with gradient backgrounds
- **Responsive Grid Layout**: Optimized for all screen sizes
- **Smooth Animations**: CSS transitions with cubic-bezier easing
- **Accessibility**: ARIA labels and keyboard navigation support
- **Progressive Enhancement**: Works without JavaScript for basic functionality

## 🔧 Development

### Prerequisites
- Modern web browser with ES6+ support
- Local web server (to avoid CORS restrictions)
- Internet connection (for initial model loading)

### Local Development
```bash
# Start development server
python3 -m http.server 8000

# Or use Node.js
npx http-server . -p 8000 -c-1

# Or use PHP
php -S localhost:8000
```

### Model Loading
The app loads TensorFlow.js models from CDN on first use:
- Face detection models (~2-5MB)
- Age/gender estimation models (~1-3MB)
- Expression recognition models (~1-2MB)

Models are cached by the browser after first load.

## 📊 Supported Features

### Face Detection
- Multiple faces in single image
- Various angles and lighting conditions
- Minimum face size: ~40x40 pixels
- Maximum faces per image: ~20 (performance dependent)

### Age Estimation
- Range: 0-100 years
- Accuracy: ±3-7 years (varies by image quality)
- Confidence score provided

### Gender Classification
- Binary classification (male/female)
- Confidence-based display
- Manual correction for low-confidence results

### Expression Recognition
- 7 basic emotions: neutral, happy, sad, angry, fearful, disgusted, surprised
- Real-time confidence scores
- Dominant expression highlighting

## 🌐 Browser Compatibility

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 80+ | ✅ Full Support |
| Firefox | 75+ | ✅ Full Support |
| Safari | 13+ | ✅ Full Support |
| Edge | 80+ | ✅ Full Support |

## 📝 Usage Guidelines

### Best Practices
- Use well-lit, clear images
- Face should occupy at least 20% of image
- Avoid extreme angles or occlusions
- JPEG/PNG formats recommended

### Privacy Notes
- **No data collection**: Images never leave your browser
- **No tracking**: No analytics or user tracking
- **Local processing**: All AI computations done client-side
- **Secure**: HTTPS deployment prevents man-in-the-middle attacks

## 🐛 Troubleshooting

### Common Issues

**Models not loading**
- Check internet connection
- Clear browser cache
- Ensure CORS-compatible server

**No faces detected**
- Try better lighting
- Ensure faces are clearly visible
- Check image format (JPG/PNG/WebP)

**Low accuracy**
- Use higher resolution images
- Improve lighting conditions
- Ensure faces are front-facing

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 🙏 Acknowledgments

- [TensorFlow.js](https://www.tensorflow.org/js) - Machine learning library
- [face-api.js](https://github.com/vladmandic/face-api) - Face recognition API
- [Font Awesome](https://fontawesome.com/) - Icons
- [Google Fonts](https://fonts.google.com/) - Inter font family

## 📧 Support

For technical support or questions:
- Open an issue on GitHub
- Check browser developer console for errors
- Ensure you're using a supported browser version