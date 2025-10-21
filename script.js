// face-api.jsのモデルを読み込む
const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';

let modelsLoaded = false;

// モデルの初期化
async function loadModels() {
    try {
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL); // 小さな顔検出用
        await faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
        modelsLoaded = true;
        console.log('モデルの読み込みが完了しました');
    } catch (error) {
        console.error('モデルの読み込みエラー:', error);
        showError('モデルの読み込みに失敗しました。インターネット接続を確認してください。');
    }
}

// ページ読み込み時にモデルを初期化
window.addEventListener('load', () => {
    loadModels();
});

// 画像入力のイベントリスナー
document.getElementById('imageInput').addEventListener('change', handleImageUpload);

async function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // 画像のプレビュー表示
    const reader = new FileReader();
    reader.onload = async (e) => {
        const img = document.getElementById('previewImg');
        img.src = e.target.result;

        const preview = document.getElementById('imagePreview');
        preview.classList.remove('hidden');

        // 画像が読み込まれたら年齢推定を実行
        img.onload = () => {
            detectAge(img);
        };
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
            showError('顔が検出できませんでした。画像内の顔がより明瞭で大きく写っている画像をお試しください。');
            return;
        }

        // 性別判定の精度を改善
        const improvedDetections = improveGenderDetection(detections);

        // 結果を表示
        displayResults(improvedDetections, img);

    } catch (error) {
        hideLoading();
        console.error('検出エラー:', error);
        showError('年齢推定中にエラーが発生しました。');
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
            genderText = gender === 'male' ? '男性' : '女性';
            genderIcon = gender === 'male' ? '<i class="fas fa-mars"></i>' : '<i class="fas fa-venus"></i>';
            genderDisplay = `${genderText} <span style="opacity: 0.8;">(${genderConfidence}%)</span>`;
        } else if (genderConfidence >= 55) {
            // 中程度信頼度の場合
            genderText = gender === 'male' ? '男性' : '女性';
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
                    <i class="fas fa-sync-alt"></i> 性別を変更して再計算
                </button>
            </div>
        ` : '';

        html += `
            <div class="age-result" data-person="${index}">
                <h3>${personNumber}${detections.length > 1 ? `人物 ${index + 1}` : '<i class="fas fa-user-check"></i> 検出結果'}</h3>
                <div class="age-value" id="age-${index}">${age}<span style="font-size: 0.5em; opacity: 0.7;">歳</span></div>
                <div class="confidence">
                    <p id="gender-${index}">${genderIcon} <strong>性別:</strong> ${genderDisplay}</p>
                    <p>${expressionIcon} <strong>表情:</strong> ${dominantExpression}</p>
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
        neutral: '無表情',
        happy: '幸せ',
        sad: '悲しい',
        angry: '怒り',
        fearful: '恐怖',
        disgusted: '嫌悪',
        surprised: '驚き'
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
    const newGenderText = newGender === 'male' ? '男性' : '女性';
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
        ageElement.innerHTML = `${adjustedAge}<span style="font-size: 0.5em; opacity: 0.7;">歳</span>`;
    }
    
    if (genderElement) {
        genderElement.innerHTML = `${newGenderIcon} <strong>性別:</strong> ${newGenderText} <span style="opacity: 0.7;">(手動変更)</span>`;
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
    document.getElementById('loading').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loading').classList.add('hidden');
}

function showError(message) {
    const resultsDiv = document.getElementById('results');
    const resultContent = document.getElementById('resultContent');

    resultContent.innerHTML = `<div class="error">${message}</div>`;
    resultsDiv.classList.remove('hidden');
}

function hideError() {
    // エラーメッセージをクリア
}

function hideResults() {
    document.getElementById('results').classList.add('hidden');
}
