// 💰 SISTEMA DE ANÚNCIOS REAL - RendaFácil
// Integração Google AdSense + Monetização

const AdsSystem = {
    // Configuração
    config: {
        minWithdraw: 5.00, // R$ 5 mínimo
        pointsToReal: 1000, // 1000 pts = R$ 1
        adViewPoints: 50, // 50 pts por visualização
        adClickPoints: 200, // 200 pts por clique
        videoWatchPoints: 150 // 150 pts por vídeo completo
    },

    // Inicializar
    init() {
        console.log('🎉 Sistema de Anúncios Iniciado');
        this.loadAdSense();
        this.setupAdTracking();
        this.initRewardedAds();
    },

    // Carregar Google AdSense
    loadAdSense() {
        if (window.adsbygoogle) {
            console.log('✅ Google AdSense Carregado');
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
        script.async = true;
        script.crossOrigin = 'anonymous';
        script.setAttribute('data-ad-client', 'ca-pub-XXXXXXXXXXXXXXXXX');
        document.head.appendChild(script);

        script.onload = () => {
            console.log('✅ AdSense Script Loaded');
            this.pushAds();
        };
    },

    // Ativar anúncios
    pushAds() {
        const ads = document.querySelectorAll('.adsbygoogle');
        ads.forEach(ad => {
            try {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            } catch (e) {
                console.error('Erro ao carregar anúncio:', e);
            }
        });
    },

    // Rastrear visualizações
    setupAdTracking() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.dataset.viewed) {
                    entry.target.dataset.viewed = 'true';
                    this.rewardAdView();
                }
            });
        }, { threshold: 0.5 });

        document.querySelectorAll('.adsbygoogle').forEach(ad => {
            observer.observe(ad);
        });
    },

    // Recompensar visualização
    rewardAdView() {
        const points = this.config.adViewPoints;
        this.addPoints(points, 'Visualização de anúncio');
        console.log(`✅ +${points} pontos por visualização`);
    },

    // Adicionar pontos ao usuário
    async addPoints(points, description) {
        try {
            const response = await fetch('/api/user/add-points', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                body: JSON.stringify({ points, description })
            });

            const data = await response.json();
            
            if (data.success) {
                this.updatePointsDisplay(data.totalPoints);
            }
        } catch (error) {
            console.error('Erro ao adicionar pontos:', error);
        }
    },

    // Atualizar display de pontos
    updatePointsDisplay(totalPoints) {
        const display = document.getElementById('points-display');
        if (display) {
            display.textContent = totalPoints.toLocaleString('pt-BR');
            display.classList.add('points-bounce');
            setTimeout(() => display.classList.remove('points-bounce'), 500);
        }
    },

    // Converter pontos para reais
    pointsToMoney(points) {
        return (points / this.config.pointsToReal).toFixed(2);
    },

    // Verificar se pode sacar
    canWithdraw(points) {
        const money = this.pointsToMoney(points);
        return parseFloat(money) >= this.config.minWithdraw;
    }
};

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    AdsSystem.init();
});

// Exportar para uso global
window.AdsSystem = AdsSystem;