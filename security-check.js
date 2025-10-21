// セキュリティヘッダーチェッカー（開発環境のみ）
function checkSecurityHeaders() {
    if (!isDevelopment) return;
    
    const securityTests = [
        {
            name: 'Content-Security-Policy',
            test: () => {
                const meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
                return meta && meta.content.includes('frame-ancestors');
            }
        },
        {
            name: 'X-Frame-Options',
            test: () => {
                const meta = document.querySelector('meta[http-equiv="X-Frame-Options"]');
                return meta && meta.content === 'DENY';
            }
        },
        {
            name: 'X-Content-Type-Options',
            test: () => {
                const meta = document.querySelector('meta[http-equiv="X-Content-Type-Options"]');
                return meta && meta.content === 'nosniff';
            }
        },
        {
            name: 'Subresource Integrity',
            test: () => {
                const scripts = document.querySelectorAll('script[src*="cdn"]');
                const links = document.querySelectorAll('link[href*="cdn"]');
                return Array.from(scripts).every(s => s.integrity) && 
                       Array.from(links).every(l => l.integrity);
            }
        }
    ];
    
    console.group('🔐 Security Headers Check');
    securityTests.forEach(test => {
        const result = test.test();
        console.log(`${result ? '✅' : '❌'} ${test.name}: ${result ? 'OK' : 'Missing'}`);
    });
    console.groupEnd();
}

// 開発環境でのみセキュリティチェックを実行
if (isDevelopment) {
    document.addEventListener('DOMContentLoaded', checkSecurityHeaders);
}