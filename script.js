// 画像最適化関数
function optimizeImage(src, maxWidth = 800, quality = 0.8) {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // アスペクト比を保持してリサイズ
            let { width, height } = calculateOptimalSize(img.width, img.height, maxWidth);
            
            canvas.width = width;
            canvas.height = height;
            
            // 高品質な描画設定
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            
            // 画像を描画
            ctx.drawImage(img, 0, 0, width, height);
            
            // 最適化された画像URLを返す
            const optimizedDataUrl = canvas.toDataURL('image/jpeg', quality);
            resolve(optimizedDataUrl);
        };
        
        img.onerror = function() {
            // エラーの場合は元の画像URLを返す
            resolve(src);
        };
        
        img.src = src;
    });
}

// 最適なサイズを計算
function calculateOptimalSize(originalWidth, originalHeight, maxWidth) {
    if (originalWidth <= maxWidth) {
        return { width: originalWidth, height: originalHeight };
    }
    
    const ratio = originalWidth / originalHeight;
    const width = maxWidth;
    const height = Math.round(width / ratio);
    
    return { width, height };
}

// 遅延読み込み（Lazy Loading）
function setupLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                loadOptimizedImage(img);
                observer.unobserve(img);
            }
        });
    }, {
        rootMargin: '50px'
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// 最適化された画像を読み込み
async function loadOptimizedImage(imgElement) {
    const originalSrc = imgElement.dataset.src;
    const maxWidth = imgElement.dataset.maxWidth || 800;
    const quality = imgElement.dataset.quality || 0.8;
    
    try {
        // ローディング表示
        imgElement.style.opacity = '0.5';
        imgElement.style.filter = 'blur(5px)';
        
        const optimizedSrc = await optimizeImage(originalSrc, parseInt(maxWidth), parseFloat(quality));
        
        imgElement.src = optimizedSrc;
        imgElement.style.opacity = '1';
        imgElement.style.filter = 'none';
        imgElement.style.transition = 'opacity 0.3s ease, filter 0.3s ease';
        
        // data-src属性を削除（読み込み完了の印）
        imgElement.removeAttribute('data-src');
        
    } catch (error) {
        console.error('画像の最適化に失敗しました:', error);
        // フォールバック：元の画像を表示
        imgElement.src = originalSrc;
        imgElement.style.opacity = '1';
        imgElement.style.filter = 'none';
        imgElement.removeAttribute('data-src');
    }
}

// アコーディオン機能
function toggleAccordion(index) {
    const accordionItems = document.querySelectorAll('.accordion-item');
    const currentItem = accordionItems[index];
    const content = currentItem.querySelector('.accordion-content');
    const icon = currentItem.querySelector('.accordion-icon');
    
    // 現在のアイテムがアクティブかどうかチェック
    const isActive = currentItem.classList.contains('active');
    
    // 全てのアコーディオンを閉じる
    accordionItems.forEach(item => {
        item.classList.remove('active');
        item.querySelector('.accordion-content').classList.remove('active');
        item.querySelector('.accordion-icon').textContent = '+';
    });
    
    // クリックされたアイテムがアクティブでなかった場合、開く
    if (!isActive) {
        currentItem.classList.add('active');
        content.classList.add('active');
        icon.textContent = '×';
    }
}

// 画像ギャラリー用の画像データ（imgsディレクトリ対応）
const galleryData = {
    sakura: [
        'imgs/sharehouses/sakura/exterior.jpg',
        'imgs/sharehouses/sakura/living.jpg',
        'imgs/sharehouses/sakura/garden.jpg',
        'imgs/sharehouses/sakura/room.jpg',
        'imgs/sharehouses/sakura/tea-room.jpg'
    ],
    bamboo: [
        'imgs/sharehouses/bamboo/exterior.jpg',
        'imgs/sharehouses/bamboo/irori.jpg',
        'imgs/sharehouses/bamboo/bamboo-garden.jpg',
        'imgs/sharehouses/bamboo/room.jpg',
        'imgs/sharehouses/bamboo/study.jpg'
    ],
    moon: [
        'imgs/sharehouses/moon/exterior.jpg',
        'imgs/sharehouses/moon/moon-deck.jpg',
        'imgs/sharehouses/moon/kitchen.jpg',
        'imgs/sharehouses/moon/room.jpg',
        'imgs/sharehouses/moon/meditation.jpg'
    ]
};

let currentGallery = [];
let currentImageIndex = 0;

// ギャラリーを開く（最適化対応版）
async function openGallery(houseType) {
    currentGallery = galleryData[houseType];
    currentImageIndex = 0;
    
    const modal = document.getElementById('gallery-modal');
    
    // 最初の画像を最適化して表示
    await displayOptimizedImage();
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // スクロールを無効化
    
    // ESCキーでモーダルを閉じる
    document.addEventListener('keydown', handleKeyPress);
}

// ギャラリーを閉じる
function closeGallery() {
    const modal = document.getElementById('gallery-modal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto'; // スクロールを有効化
    
    // イベントリスナーを削除
    document.removeEventListener('keydown', handleKeyPress);
}

// 最適化された画像を表示
async function displayOptimizedImage() {
    const galleryImages = document.getElementById('gallery-images');
    const originalSrc = currentGallery[currentImageIndex];
    
    // ローディング表示
    galleryImages.innerHTML = `
        <div class="loading">
            <div class="loading-spinner"></div>
            <p>読み込み中...</p>
        </div>
    `;
    
    try {
        const optimizedSrc = await optimizeImage(originalSrc, 800, 0.9);
        galleryImages.innerHTML = `<img src="${optimizedSrc}" alt="シェアハウス写真">`;
        
        // 画像のフェードイン効果
        const img = galleryImages.querySelector('img');
        img.style.opacity = '0';
        img.onload = function() {
            img.style.transition = 'opacity 0.3s ease';
            img.style.opacity = '1';
        };
        
    } catch (error) {
        console.error('画像の最適化に失敗:', error);
        galleryImages.innerHTML = `<img src="${originalSrc}" alt="シェアハウス写真">`;
    }
}

// 前の画像（最適化対応）
async function prevImage() {
    currentImageIndex = (currentImageIndex - 1 + currentGallery.length) % currentGallery.length;
    await displayOptimizedImage();
}

// 次の画像（最適化対応）
async function nextImage() {
    currentImageIndex = (currentImageIndex + 1) % currentGallery.length;
    await displayOptimizedImage();
}

// キーボード操作
function handleKeyPress(event) {
    switch(event.key) {
        case 'Escape':
            closeGallery();
            break;
        case 'ArrowLeft':
            prevImage();
            break;
        case 'ArrowRight':
            nextImage();
            break;
    }
}

// スムーズスクロール機能
function smoothScrollTo(targetId) {
    const target = document.getElementById(targetId);
    if (target) {
        target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// 画像のプリロード機能
function preloadImages(imageArray) {
    imageArray.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

// パフォーマンス監視
function measureImageLoadTime(startTime, imageSrc) {
    const endTime = performance.now();
    const loadTime = endTime - startTime;
    console.log(`画像 ${imageSrc} の読み込み時間: ${loadTime.toFixed(2)}ms`);
}

// エラーハンドリング
function handleImageError(imgElement, fallbackSrc = null) {
    imgElement.onerror = function() {
        console.error('画像の読み込みに失敗しました:', imgElement.src);
        
        if (fallbackSrc) {
            imgElement.src = fallbackSrc;
        } else {
            // デフォルトの代替画像を表示
            imgElement.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuOCpOODoeODvOOCuOOBjOiqreOBv+i+vOOBvuOBvuOBm+OCk+OBp+OBl+OBnw==</text></svg>';
        }
    };
}

// レスポンシブ画像の処理
function handleResponsiveImages() {
    const images = document.querySelectorAll('img[data-src]');
    
    images.forEach(img => {
        // 画面サイズに応じて最適な画像サイズを決定
        const screenWidth = window.innerWidth;
        let maxWidth;
        
        if (screenWidth < 768) {
            maxWidth = 400;
        } else if (screenWidth < 1200) {
            maxWidth = 600;
        } else {
            maxWidth = 800;
        }
        
        img.dataset.maxWidth = maxWidth;
    });
}

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', function() {
    // 遅延読み込みを設定
    setupLazyLoading();
    
    // レスポンシブ画像の処理
    handleResponsiveImages();
    
    // ウィンドウリサイズ時の処理
    window.addEventListener('resize', handleResponsiveImages);
    
    // モーダルの背景をクリックして閉じる
    const modal = document.getElementById('gallery-modal');
    if (modal) {
        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                closeGallery();
            }
        });
    }
    
    // ページ読み込み時のアニメーション
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // アニメーション対象の要素を監視
    const animateElements = document.querySelectorAll('.accordion-item, .section-title');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    // 重要な画像のプリロード
    const heroImages = ['imgs/hero/hero-bg.jpg'];
    preloadImages(heroImages);
    
    // パフォーマンス測定
    window.addEventListener('load', function() {
        const loadTime = performance.now();
        console.log(`ページの読み込み完了時間: ${loadTime.toFixed(2)}ms`);
    });
    
    // エラーハンドリングの設定
    const allImages = document.querySelectorAll('img');
    allImages.forEach(img => {
        handleImageError(img);
    });
    
    // スムーズスクロールのリンク設定
    const scrollLinks = document.querySelectorAll('a[href^="#"]');
    scrollLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            smoothScrollTo(targetId);
        });
    });
});

// ページ離脱時のクリーンアップ
window.addEventListener('beforeunload', function() {
    // 必要に応じてクリーンアップ処理を追加
    document.removeEventListener('keydown', handleKeyPress);
});

// デバッグ用の関数（開発時のみ使用）
function debugImageOptimization() {
    console.log('現在のギャラリー:', currentGallery);
    console.log('現在の画像インデックス:', currentImageIndex);
    console.log('遅延読み込み対象画像数:', document.querySelectorAll('img[data-src]').length);
}

// パフォーマンス監視用の関数
function getPerformanceMetrics() {
    const navigation = performance.getEntriesByType('navigation')[0];
    const metrics = {
        pageLoadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        firstPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-contentful-paint')?.startTime || 0
    };
    
    console.table(metrics);
    return metrics;
}

// 開発環境でのみデバッグ情報を表示
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.addEventListener('load', function() {
        setTimeout(() => {
            getPerformanceMetrics();
        }, 1000);
    });
}