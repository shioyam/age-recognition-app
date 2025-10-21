const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
});

// Middleware
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:8000', 'https://shioyam.github.io'],
    credentials: false, // APIキーを扱うため無効化
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser with size limits
app.use(express.json({ limit: '10mb' })); // リクエストサイズ制限
app.use(express.static(path.join(__dirname)));

// レート制限（簡易版）
const rateLimitMap = new Map();
const RATE_LIMIT = 10; // 1分間に10回まで
const RATE_WINDOW = 60 * 1000; // 1分

function rateLimit(req, res, next) {
    const clientIP = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!rateLimitMap.has(clientIP)) {
        rateLimitMap.set(clientIP, { count: 1, resetTime: now + RATE_WINDOW });
        return next();
    }
    
    const rateData = rateLimitMap.get(clientIP);
    
    if (now > rateData.resetTime) {
        rateData.count = 1;
        rateData.resetTime = now + RATE_WINDOW;
        return next();
    }
    
    if (rateData.count >= RATE_LIMIT) {
        return res.status(429).json({
            error: 'Rate limit exceeded. Please try again later.',
            retryAfter: Math.ceil((rateData.resetTime - now) / 1000)
        });
    }
    
    rateData.count++;
    next();
}

// 翻訳エンドポイント
app.post('/api/translate', rateLimit, async (req, res) => {
    try {
        const { text, targetLang } = req.body;
        
        // 入力検証
        if (!text || !targetLang) {
            return res.status(400).json({
                error: 'Missing required parameters: text and targetLang'
            });
        }
        
        if (text.length > 5000) {
            return res.status(400).json({
                error: 'Text too long. Maximum 5000 characters allowed.'
            });
        }
        
        // DeepL APIキーの確認
        if (!process.env.DEEPL_API_KEY) {
            return res.status(500).json({
                error: 'DeepL API key not configured'
            });
        }
        
        // DeepL API呼び出し
        const response = await fetch('https://api-free.deepl.com/v2/translate', {
            method: 'POST',
            headers: {
                'Authorization': `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                text: text,
                target_lang: targetLang.toUpperCase(),
                source_lang: 'JA' // 日本語から翻訳
            })
        });
        
        if (!response.ok) {
            const errorData = await response.text();
            console.error('DeepL API Error:', errorData);
            return res.status(response.status).json({
                error: 'Translation service temporarily unavailable'
            });
        }
        
        const data = await response.json();
        
        if (data.translations && data.translations[0]) {
            res.json({
                translatedText: data.translations[0].text,
                detectedSourceLang: data.translations[0].detected_source_language
            });
        } else {
            res.status(500).json({
                error: 'Invalid response from translation service'
            });
        }
        
    } catch (error) {
        console.error('Translation error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

// 健康チェックエンドポイント
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// 静的ファイルのサービング（開発用）
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// サーバー起動
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🔐 DeepL API Key: ${process.env.DEEPL_API_KEY ? 'Configured' : 'Not configured'}`);
});