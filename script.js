// 国際化システム
let currentLanguage = 'ja';
let translations = {};

// 開発環境判定
const isDevelopment = location.hostname === 'localhost' || location.hostname === '127.0.0.1';

// セキュアなログ出力
function secureLog(...args) {
    if (isDevelopment) {
        console.log(...args);
    }
}

function secureWarn(...args) {
    if (isDevelopment) {
        console.warn(...args);
    }
}

function secureError(...args) {
    if (isDevelopment) {
        console.error(...args);
    } else {
        // 本番環境では重要なエラーのみログ（個人情報は除外）
        console.error('An error occurred. Please try again.');
    }
}

// 翻訳データを読み込む
async function loadTranslations() {
    try {
        const response = await fetch('./translations.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        translations = await response.json();
        secureLog('Translation data loaded:', Object.keys(translations));
        
        // URLパラメータから言語を取得
        const urlParams = new URLSearchParams(window.location.search);
        const langParam = urlParams.get('lang');
        
        // localStorage またはブラウザ言語から初期言語を設定
        if (langParam && translations[langParam]) {
            currentLanguage = langParam;
            secureLog('Language set from URL parameter:', currentLanguage);
        } else {
            const savedLang = localStorage.getItem('preferredLanguage');
            if (savedLang && translations[savedLang]) {
                currentLanguage = savedLang;
                secureLog('Language set from localStorage:', currentLanguage);
            } else {
                // ブラウザの言語設定から判定
                const browserLang = navigator.language.substring(0, 2);
                if (translations[browserLang]) {
                    currentLanguage = browserLang;
                    secureLog('Language set from browser:', currentLanguage);
                } else {
                    currentLanguage = 'ja'; // デフォルト
                    secureLog('Language set to default:', currentLanguage);
                }
            }
        }
        
        // 言語選択を更新
        const languageSelect = document.getElementById('languageSelect');
        if (languageSelect) {
            languageSelect.value = currentLanguage;
            console.log('Language selector updated to:', currentLanguage);
        }
        
        // 翻訳を適用
        applyTranslations();
        secureLog('Translations applied for language:', currentLanguage);
        
    } catch (error) {
        secureError('翻訳データの読み込みエラー:', error);
        // フォールバック: 最小限の日本語翻訳データ
        translations = {
            ja: {
                app: { title: "年齢推定 AI", tagline: "画像から顔を検出し、AIで年齢を瞬時に推定" },
                upload: { title: "画像をアップロード", formats: "JPG、PNG、WebP形式に対応" },
                loading: { analyzing: "AI分析中..." },
                results: { 
                    title: "分析結果", person: "人物", age: "推定年齢", years: "歳",
                    gender: "性別", male: "男性", female: "女性", expression: "表情", changeGender: "性別変更"
                },
                errors: {
                    noFace: "顔が検出されませんでした。明るく、顔がはっきり写っている画像をお試しください。",
                    modelLoad: "AIモデルの読み込みに失敗しました。ページを再読み込みしてください。",
                    fileError: "ファイルの読み込みエラーが発生しました。"
                }
            }
        };
        currentLanguage = 'ja';
    }
}

// 翻訳を適用する関数
function applyTranslations() {
    const elements = document.querySelectorAll('[data-i18n]');
    secureLog(`Applying translations for ${elements.length} elements in language: ${currentLanguage}`);
    
    let appliedCount = 0;
    elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = getTranslation(key);
        if (translation && translation !== key) {
            try {
                if (element.tagName === 'INPUT' && element.type === 'file') {
                    // ファイル入力の場合はtitleとaria-labelを更新
                    element.title = translation;
                    element.setAttribute('aria-label', translation);
                } else {
                    element.textContent = translation;
                }
                appliedCount++;
            } catch (error) {
                secureWarn(`Failed to apply translation for key: ${key}`, error);
            }
        } else {
            secureWarn(`Translation not found for key: ${key}`);
        }
    });
    
    secureLog(`Applied ${appliedCount} translations successfully`);
}

// 翻訳文字列を取得する関数
function getTranslation(key) {
    const keys = key.split('.');
    let value = translations[currentLanguage];
    
    for (const k of keys) {
        if (value && value[k]) {
            value = value[k];
        } else {
            // フォールバック: 日本語
            value = translations['ja'];
            for (const k of keys) {
                if (value && value[k]) {
                    value = value[k];
                } else {
                    return key; // キーが見つからない場合はキー自体を返す
                }
            }
            break;
        }
    }
    
    return value;
}

// 動的翻訳機能（DeepL API経由）
async function translateText(text, targetLang) {
    try {
        const response = await fetch('/api/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: text,
                targetLang: targetLang
            })
        });

        if (!response.ok) {
            const error = await response.json();
            console.warn('Translation API error:', error);
            return text; // フォールバック: 元のテキストを返す
        }

        const data = await response.json();
        return data.translatedText;
    } catch (error) {
        console.warn('Translation failed:', error);
        return text; // フォールバック: 元のテキストを返す
    }
}

// バッチ翻訳機能（複数テキストを効率的に翻訳）
async function translateBatch(texts, targetLang) {
    const results = {};
    
    // 既存の翻訳がない場合のみAPI呼び出し
    for (const key of Object.keys(texts)) {
        if (!translations[targetLang] || !getTranslation(key)) {
            try {
                const translatedText = await translateText(texts[key], targetLang);
                results[key] = translatedText;
                
                // 翻訳結果をキャッシュ
                if (!translations[targetLang]) {
                    translations[targetLang] = {};
                }
                
                // ネストしたキー構造に対応
                const keys = key.split('.');
                let current = translations[targetLang];
                for (let i = 0; i < keys.length - 1; i++) {
                    if (!current[keys[i]]) {
                        current[keys[i]] = {};
                    }
                    current = current[keys[i]];
                }
                current[keys[keys.length - 1]] = translatedText;
                
            } catch (error) {
                console.warn(`Translation failed for ${key}:`, error);
                results[key] = texts[key];
            }
        }
    }
    
    return results;
}

// 言語を変更する関数（静的翻訳対応版）
function changeLanguage(lang) {
    // 翻訳データが存在する場合は即座に切り替え
    if (translations[lang]) {
        currentLanguage = lang;
        localStorage.setItem('preferredLanguage', lang);
        applyTranslations();
        
        // URL更新
        const url = new URL(window.location);
        url.searchParams.set('lang', lang);
        window.history.replaceState({}, '', url);
        
        console.log(`Language changed to: ${lang}`);
        return;
    }
    
    // 翻訳データが存在しない場合は動的翻訳を試行（サーバーが利用可能な場合）
    attemptDynamicTranslation(lang);
}

// 動的翻訳を試行する関数
async function attemptDynamicTranslation(lang) {
    const languageSelect = document.getElementById('languageSelect');
    const originalValue = languageSelect.value;
    
    try {
        // ローディング状態を表示
        languageSelect.disabled = true;
        const originalHtml = languageSelect.innerHTML;
        languageSelect.innerHTML = '<option>翻訳中...</option>';
        
        const textsToTranslate = {
            'app.title': translations.ja.app.title,
            'app.tagline': translations.ja.app.tagline,
            'upload.title': translations.ja.upload.title,
            'upload.formats': translations.ja.upload.formats,
            'loading.analyzing': translations.ja.loading.analyzing,
            'results.title': translations.ja.results.title,
            'results.person': translations.ja.results.person,
            'results.age': translations.ja.results.age,
            'results.years': translations.ja.results.years,
            'results.gender': translations.ja.results.gender,
            'results.male': translations.ja.results.male,
            'results.female': translations.ja.results.female,
            'results.expression': translations.ja.results.expression,
            'results.changeGender': translations.ja.results.changeGender,
            'features.title': translations.ja.features.title,
            'errors.noFace': translations.ja.errors.noFace,
            'errors.modelLoad': translations.ja.errors.modelLoad,
            'errors.fileError': translations.ja.errors.fileError
        };
        
        await translateBatch(textsToTranslate, lang);
        
        currentLanguage = lang;
        localStorage.setItem('preferredLanguage', lang);
        applyTranslations();
        
        // URL更新
        const url = new URL(window.location);
        url.searchParams.set('lang', lang);
        window.history.replaceState({}, '', url);
        
        // 言語選択の状態を復元
        languageSelect.disabled = false;
        languageSelect.innerHTML = originalHtml;
        languageSelect.value = currentLanguage;
        
    } catch (error) {
        console.warn('Dynamic translation failed, falling back to available languages:', error);
        
        // エラーの場合は元の言語に戻す
        currentLanguage = originalValue;
        languageSelect.disabled = false;
        languageSelect.innerHTML = `
            <option value="ja">🇯🇵 日本語</option>
            <option value="en">🇺🇸 English</option>
            <option value="ko">🇰🇷 한국어</option>
            <option value="de">🇩🇪 Deutsch</option>
        `;
        languageSelect.value = currentLanguage;
        
        // ユーザーに通知
        alert(`Sorry, dynamic translation to ${lang} is not available. Server connection required.`);
    }
}

// face-api.jsのモデルを読み込む - 複数ソース対応
const MODEL_SOURCES = [
    {
        url: './libs/models/',
        name: 'Local Models',
        priority: 1
    },
    {
        url: 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model/',
        name: 'jsDelivr CDN',
        priority: 2
    },
    {
        url: 'https://unpkg.com/@vladmandic/face-api@1.7.12/model/',
        name: 'unpkg CDN',
        priority: 3
    }
];

let modelsLoaded = false;
let currentModelSource = null;

// 利用可能なモデルソースを検出
async function detectAvailableModelSource() {
    for (const source of MODEL_SOURCES) {
        try {
            // 小さなテストファイルで接続テスト（tinyFaceDetectorの最小ファイル）
            const testResponse = await fetch(source.url + 'tiny_face_detector_model-weights_manifest.json', {
                method: 'HEAD',
                cache: 'no-cache'
            });
            
            if (testResponse.ok) {
                secureLog(`✅ Model source available: ${source.name}`);
                return source;
            }
        } catch (error) {
            secureLog(`❌ Model source unavailable: ${source.name}`);
        }
    }
    
    // フォールバック: 最初のCDNソースを返す
    return MODEL_SOURCES[1];
}

// モデルの初期化
async function loadModels() {
    try {
        // face-api.jsが利用可能かチェック
        if (typeof faceapi === 'undefined') {
            throw new Error('face-api.js library not loaded');
        }
        
        // 利用可能なモデルソースを検出
        if (!currentModelSource) {
            currentModelSource = await detectAvailableModelSource();
            secureLog(`Using model source: ${currentModelSource.name} (${currentModelSource.url})`);
        }
        
        const MODEL_URL = currentModelSource.url;
        secureLog('Loading AI models from:', MODEL_URL);
        
        // 進捗表示のためのヘルパー関数
        const updateProgress = (message, progress) => {
            if (typeof updateLoadingProgress === 'function') {
                updateLoadingProgress('models', progress);
            }
            secureLog(message);
        };
        
        updateProgress('顔検出モデルを読み込み中...', 0);
        
        // モデルを順次読み込みで進捗表示
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        updateProgress('SSDモデルを読み込み中...', 20);
        
        await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
        updateProgress('年齢・性別認識モデルを読み込み中...', 40);
        
        await faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL);
        updateProgress('顔特徴点検出モデルを読み込み中...', 60);
        
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        updateProgress('表情認識モデルを読み込み中...', 80);
        
        await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
        updateProgress('モデル読み込み完了', 100);
        
        modelsLoaded = true;
        secureLog(`✅ All models loaded successfully from ${currentModelSource.name}`);
        
        // 最終的な完了表示
        if (typeof updateLoadingProgress === 'function') {
            updateLoadingProgress('ready', 100);
        }
    } catch (error) {
        modelsLoaded = false;
        secureError(`❌ Model loading failed from ${currentModelSource?.name || 'unknown source'}:`, error);
        
        // より詳細なエラー分析
        if (error.message && error.message.includes('face-api')) {
            showError('AIライブラリの読み込みに失敗しました。ページを再読み込みしてください。');
        } else if (error.message && (error.message.includes('network') || error.message.includes('fetch'))) {
            // 他のモデルソースでリトライ
            const remainingSources = MODEL_SOURCES.filter(s => s !== currentModelSource);
            if (remainingSources.length > 0) {
                secureLog('Retrying with next model source...');
                currentModelSource = remainingSources[0];
                return loadModels(); // 再帰的にリトライ
            } else {
                showError('ネットワークエラーです。インターネット接続を確認してページを再読み込みしてください。');
            }
        } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
            showError('モデルファイルの取得に失敗しました。ネットワーク接続またはファイアウォールの設定を確認してください。');
        } else {
            showError(getTranslation('errors.modelLoad') || 'モデルの読み込みに失敗しました。');
        }
    }
}

// ページ読み込み時に初期化
window.addEventListener('load', async () => {
    secureLog('Page loaded, initializing app...');
    
    // 翻訳データを読み込み
    await loadTranslations();
    
    // 言語選択のイベントリスナーを追加
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
        languageSelect.addEventListener('change', (e) => {
            secureLog(`Language change requested: ${e.target.value}`);
            changeLanguage(e.target.value);
        });
        secureLog('Language selector event listener added');
    } else {
        secureError('Language selector element not found!');
    }
    
    // モデルを読み込み
    loadModels();
    
    secureLog('App initialization completed');
});

// 画像入力のイベントリスナー
document.addEventListener('DOMContentLoaded', () => {
    const imageInput = document.getElementById('imageInput');
    if (imageInput) {
        imageInput.addEventListener('change', handleImageUpload);
        secureLog('Image input event listener added');
    } else {
        secureError('Image input element not found!');
    }
});

async function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // ファイルタイプとサイズの検証
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!allowedTypes.includes(file.type)) {
        showError('サポートされていないファイル形式です。JPG、PNG、WebP形式のみサポートしています。');
        return;
    }
    
    if (file.size > maxSize) {
        showError('ファイルサイズが大きすぎます。10MB以下のファイルを選択してください。');
        return;
    }

    // 画像のプレビュー表示
    const reader = new FileReader();
    
    reader.onload = async (e) => {
        try {
            const img = document.getElementById('previewImg');
            if (!img) {
                throw new Error('プレビュー要素が見つかりません');
            }
            
            img.src = e.target.result;

            const preview = document.getElementById('imagePreview');
            if (!preview) {
                throw new Error('プレビューコンテナが見つかりません');
            }
            preview.classList.remove('hidden');

            // 画像が読み込まれたら年齢推定を実行
            img.onload = () => {
                detectAge(img);
            };
            
            // 画像読み込みエラーのハンドリング
            img.onerror = () => {
                secureError('画像の読み込みに失敗しました');
                showError('画像ファイルが破損しているか、サポートされていない形式です。');
                hideLoading();
            };
        } catch (error) {
            secureError('画像プレビュー処理エラー:', error);
            showError('画像の処理中にエラーが発生しました。');
            hideLoading();
        }
    };
    
    reader.onerror = () => {
        secureError('FileReader エラー:', reader.error);
        showError('ファイルの読み込み中にエラーが発生しました。ファイルが破損していないか確認してください。');
        hideLoading();
    };
    
    reader.readAsDataURL(file);

    // 以前の結果をクリア
    hideResults();
}

async function detectAge(img) {
    // モデルが読み込まれていない場合は待機
    if (!modelsLoaded) {
        showLoading();
        await loadModels();
        
        // モデル読み込みに失敗した場合は処理を中止
        if (!modelsLoaded) {
            hideLoading();
            return;
        }
    }

    showLoading();
    hideError();

    try {
        // 小さな顔も検出できるよう、より感度の高い設定で検出を試行
        let detections = await faceapi
            .detectAllFaces(img, new faceapi.TinyFaceDetectorOptions({
                inputSize: 416, // デフォルト値より大きく設定（精度向上）
                scoreThreshold: 0.3 // 閾値を下げて小さな顔も検出
            }))
            .withFaceLandmarks()
            .withAgeAndGender()
            .withFaceExpressions();

        // 小さな顔が検出されない場合、SsdMobilenetv1で再試行
        if (detections.length === 0) {
            console.log('TinyFaceDetectorで顔が検出されませんでした。SsdMobilenetv1で再試行します...');
            detections = await faceapi
                .detectAllFaces(img, new faceapi.SsdMobilenetv1Options({
                    minConfidence: 0.2 // より低い信頼度でも検出
                }))
                .withFaceLandmarks()
                .withAgeAndGender()
                .withFaceExpressions();
        }

        hideLoading();

        if (detections.length === 0) {
            showError(getTranslation('errors.noFace'));
            return;
        }

        // 性別判定の精度を改善
        const improvedDetections = improveGenderDetection(detections);

        // 結果を表示
        displayResults(improvedDetections, img);

    } catch (error) {
        hideLoading();
        secureError('検出エラー:', error);
        
        // エラーの種類に応じて適切なメッセージを表示
        if (error.message && error.message.includes('model')) {
            showError(getTranslation('errors.modelLoad'));
        } else if (error.message && error.message.includes('network')) {
            showError('ネットワークエラーが発生しました。インターネット接続を確認してください。');
        } else if (error.message && error.message.includes('canvas')) {
            showError('画像の処理中にエラーが発生しました。別の画像をお試しください。');
        } else {
            showError(getTranslation('errors.fileError'));
        }
    }
}

function displayResults(detections, img) {
    const resultsDiv = document.getElementById('results');
    const resultContent = document.getElementById('resultContent');
    
    // グローバル変数に保存
    currentDetections = detections;
    currentImage = img;

    // Canvas上に顔の位置と番号を描画
    drawFaceBoxes(detections, img);

    let html = '';

    detections.forEach((detection, index) => {
        const age = Math.round(detection.age);
        
        // 性別判定の改善 - より正確な判定のための処理
        const gender = detection.gender;
        const genderConfidence = Math.round(detection.genderProbability * 100);
        
        // 信頼度に基づく性別判定の改善
        let genderText, genderIcon, genderDisplay;
        if (genderConfidence >= 70) {
            // 高信頼度の場合
            genderText = gender === 'male' ? getTranslation('results.male') : getTranslation('results.female');
            genderIcon = gender === 'male' ? '<i class="fas fa-mars"></i>' : '<i class="fas fa-venus"></i>';
            genderDisplay = `${genderText} <span style="opacity: 0.8;">(${genderConfidence}%)</span>`;
        } else if (genderConfidence >= 55) {
            // 中程度信頼度の場合
            genderText = gender === 'male' ? getTranslation('results.male') : getTranslation('results.female');
            genderIcon = '<i class="fas fa-question-circle"></i>';
            genderDisplay = `${genderText}? <span style="opacity: 0.6;">(${genderConfidence}%)</span>`;
        } else {
            // 低信頼度の場合
            genderIcon = '<i class="fas fa-question"></i>';
            genderDisplay = `判定困難 <span style="opacity: 0.5;">(${genderConfidence}%)</span>`;
        }

        // 表情の取得
        const expressions = detection.expressions;
        const dominantExpression = getDominantExpression(expressions);

        const expressionIcon = '<i class="fas fa-smile"></i>';

        // 各検出結果に番号を表示
        const personNumber = detections.length > 1 ? `<span class="person-number" style="display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; background: linear-gradient(135deg, var(--primary), var(--secondary)); color: var(--dark); border-radius: 50%; font-weight: 700; margin-right: 12px;">${index + 1}</span>` : '';

        // 性別変更ボタン（信頼度50%以下の場合のみ表示）
        const genderChangeButton = genderConfidence <= 50 ? `
            <div class="gender-change-section">
                <p style="font-size: 0.9em; color: var(--gray-400); margin-bottom: 8px;">
                    <i class="fas fa-exclamation-triangle"></i> 性別判定の信頼度が低いため、手動で変更できます
                </p>
                <button class="gender-change-btn" onclick="changeGender(${index})" data-person="${index}">
                    <i class="fas fa-sync-alt"></i> ${getTranslation('results.changeGender')}
                </button>
            </div>
        ` : '';

        html += `
            <div class="age-result" data-person="${index}">
                <h3>${personNumber}${detections.length > 1 ? `${getTranslation('results.person')} ${index + 1}` : '<i class="fas fa-user-check"></i> 検出結果'}</h3>
                <div class="age-value" id="age-${index}">${age}<span style="font-size: 0.5em; opacity: 0.7;">${getTranslation('results.years')}</span></div>
                <div class="confidence">
                    <p id="gender-${index}">${genderIcon} <strong>${getTranslation('results.gender')}:</strong> ${genderDisplay}</p>
                    <p>${expressionIcon} <strong>${getTranslation('results.expression')}:</strong> ${dominantExpression}</p>
                </div>
                ${genderChangeButton}
            </div>
        `;
    });

    if (detections.length > 1) {
        html = `<p style="text-align: center; margin-bottom: 20px; color: var(--gray-300); font-weight: 500;"><i class="fas fa-users"></i> ${detections.length}人の顔が検出されました</p>` + html;
    }

    resultContent.innerHTML = html;
    resultsDiv.classList.remove('hidden');
}

function drawFaceBoxes(detections, img) {
    const canvas = document.getElementById('overlayCanvas');
    const ctx = canvas.getContext('2d');

    // Canvasのサイズを画像に合わせる
    canvas.width = img.width;
    canvas.height = img.height;

    // 画像の表示サイズを取得
    const displayWidth = img.offsetWidth;
    const displayHeight = img.offsetHeight;

    // スケール係数を計算
    const scaleX = displayWidth / img.naturalWidth;
    const scaleY = displayHeight / img.naturalHeight;

    // Canvasの表示サイズを設定
    canvas.style.width = displayWidth + 'px';
    canvas.style.height = displayHeight + 'px';

    // 高解像度対応
    const dpr = window.devicePixelRatio || 1;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    detections.forEach((detection, index) => {
        const box = detection.detection.box;
        const age = Math.round(detection.age);

        // 顔の枠を描画（太くして見やすく、明るいテーマに合わせた色）
        ctx.strokeStyle = '#4f46e5';
        ctx.lineWidth = 8; // 4から8に増加
        ctx.shadowColor = 'rgba(79, 70, 229, 0.8)';
        ctx.shadowBlur = 15; // シャドウも強化
        ctx.strokeRect(box.x, box.y, box.width, box.height);
        ctx.shadowBlur = 0;

        // 番号と年齢を表示する背景（大きく）
        const labelPadding = 20; // 12から20に増加
        const labelText = detections.length > 1 ? `${index + 1}: ${age}歳` : `${age}歳`;
        const fontSize = Math.max(48, Math.min(box.width * 0.2, 72)); // 動的フォントサイズ、最小48px、最大72px
        ctx.font = `bold ${fontSize}px Poppins, sans-serif`;
        const textWidth = ctx.measureText(labelText).width;
        const labelHeight = fontSize + 20; // フォントサイズに応じた高さ
        const labelY = box.y > labelHeight + 15 ? box.y - labelHeight - 8 : box.y + box.height + 8;

        // ラベル背景（グラデーション）- より大きく、明るいテーマに合わせた色
        const gradient = ctx.createLinearGradient(box.x, labelY, box.x + textWidth + labelPadding * 2, labelY + labelHeight);
        gradient.addColorStop(0, '#4f46e5');
        gradient.addColorStop(1, '#06b6d4');
        ctx.fillStyle = gradient;
        ctx.shadowColor = 'rgba(79, 70, 229, 0.4)';
        ctx.shadowBlur = 15;
        ctx.fillRect(box.x, labelY, textWidth + labelPadding * 2, labelHeight);
        ctx.shadowBlur = 0;

        // テキスト描画（大きく、白色で見やすく）
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${fontSize}px Poppins, sans-serif`;
        ctx.fillText(labelText, box.x + labelPadding, labelY + fontSize - 5);
    });
}

// 性別判定の精度を向上させる関数
function improveGenderDetection(detections) {
    return detections.map(detection => {
        const originalGender = detection.gender;
        const originalConfidence = detection.genderProbability;
        
        // 年齢と顔の特徴から性別判定を補正
        const age = detection.age;
        const landmarks = detection.landmarks;
        
        let adjustedConfidence = originalConfidence;
        
        // 年齢に基づく補正（若い人ほど性別判定が困難）
        if (age < 16) {
            // 16歳未満は性別判定の信頼度を下げる
            adjustedConfidence = Math.max(0.5, originalConfidence * 0.8);
        } else if (age > 40) {
            // 40歳以上は性別判定の信頼度を上げる
            adjustedConfidence = Math.min(1.0, originalConfidence * 1.1);
        }
        
        // 信頼度が微妙な場合（50-70%）は判定を慎重にする
        if (originalConfidence > 0.5 && originalConfidence < 0.7) {
            adjustedConfidence = originalConfidence * 0.9;
        }
        
        return {
            ...detection,
            genderProbability: adjustedConfidence
        };
    });
}

function getDominantExpression(expressions) {
    const expressionLabels = {
        neutral: getTranslation('results.expressions.neutral'),
        happy: getTranslation('results.expressions.happy'),
        sad: getTranslation('results.expressions.sad'),
        angry: getTranslation('results.expressions.angry'),
        fearful: getTranslation('results.expressions.fearful'),
        disgusted: getTranslation('results.expressions.disgusted'),
        surprised: getTranslation('results.expressions.surprised')
    };

    let maxExpression = 'neutral';
    let maxValue = 0;

    for (const [expression, value] of Object.entries(expressions)) {
        if (value > maxValue) {
            maxValue = value;
            maxExpression = expression;
        }
    }

    return expressionLabels[maxExpression] || maxExpression;
}

// グローバル変数として検出結果を保存
let currentDetections = [];
let currentImage = null;

// 性別変更機能
async function changeGender(personIndex) {
    if (!currentDetections[personIndex] || !currentImage) return;

    const detection = currentDetections[personIndex];
    
    // 性別を反転
    const newGender = detection.gender === 'male' ? 'female' : 'male';
    const newGenderText = newGender === 'male' ? getTranslation('results.male') : getTranslation('results.female');
    const newGenderIcon = newGender === 'male' ? '<i class="fas fa-mars"></i>' : '<i class="fas fa-venus"></i>';
    
    // 年齢を性別に基づいて調整（簡単な補正）
    let adjustedAge = detection.age;
    if (newGender === 'male') {
        // 男性として推定し直す場合、わずかに年齢を上げる傾向
        adjustedAge = Math.round(detection.age * 1.05);
    } else {
        // 女性として推定し直す場合、わずかに年齢を下げる傾向
        adjustedAge = Math.round(detection.age * 0.95);
    }
    
    // 結果を更新
    currentDetections[personIndex] = {
        ...detection,
        gender: newGender,
        age: adjustedAge,
        genderProbability: 0.75, // 手動変更なので中程度の信頼度
        manuallyChanged: true
    };
    
    // 表示を更新
    const ageElement = document.getElementById(`age-${personIndex}`);
    const genderElement = document.getElementById(`gender-${personIndex}`);
    
    if (ageElement) {
        ageElement.innerHTML = `${adjustedAge}<span style="font-size: 0.5em; opacity: 0.7;">${getTranslation('results.years')}</span>`;
    }
    
    if (genderElement) {
        genderElement.innerHTML = `${newGenderIcon} <strong>${getTranslation('results.gender')}:</strong> ${newGenderText} <span style="opacity: 0.7;">(手動変更)</span>`;
    }
    
    // ボタンを更新
    const button = document.querySelector(`[data-person="${personIndex}"]`);
    if (button) {
        button.innerHTML = '<i class="fas fa-check"></i> 変更済み';
        button.classList.add('changed');
        button.disabled = true;
    }
    
    // Canvas上の表示も更新
    updateCanvasDisplay();
}

// Canvas表示の更新
function updateCanvasDisplay() {
    if (currentImage && currentDetections.length > 0) {
        drawFaceBoxes(currentDetections, currentImage);
    }
}

function showLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.classList.remove('hidden');
    } else {
        secureError('Loading element not found');
    }
}

function hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.classList.add('hidden');
    }
}

function showError(message, details = null) {
    const resultsDiv = document.getElementById('results');
    const resultContent = document.getElementById('resultContent');

    if (resultsDiv && resultContent) {
        // エラーメッセージをHTMLエスケープして安全に表示
        const escapedMessage = message.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        
        let errorHtml = `
            <div class="error enhanced-error">
                <div class="error-icon">⚠️</div>
                <h3 class="error-title">エラーが発生しました</h3>
                <p class="error-message">${escapedMessage}</p>
        `;
        
        if (details) {
            errorHtml += `
                <div class="error-details">
                    <details>
                        <summary>技術的な詳細情報</summary>
                        <pre>${details.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
                    </details>
                </div>
            `;
        }
        
        errorHtml += `
                <div class="error-actions">
                    <button onclick="location.reload()" class="retry-button">
                        🔄 ページを再読み込み
                    </button>
                    <button onclick="hideError()" class="dismiss-button">
                        ✕ 閉じる
                    </button>
                </div>
            </div>
        `;
        
        resultContent.innerHTML = errorHtml;
        resultsDiv.classList.remove('hidden');
        
        // エラーログを記録（開発環境のみ）
        secureError('User error displayed:', message, details);
    } else {
        secureError('Error display elements not found');
        // フォールバック: アラートで表示
        alert(message);
    }
}

function hideError() {
    const resultContent = document.getElementById('resultContent');
    if (resultContent) {
        const errorElements = resultContent.querySelectorAll('.error');
        errorElements.forEach(el => el.remove());
    }
}

function hideResults() {
    const results = document.getElementById('results');
    if (results) {
        results.classList.add('hidden');
    }
}
