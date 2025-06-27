document.addEventListener('DOMContentLoaded', () => {
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const mobileNav = document.getElementById('desktop-nav');
    const navLinksMobile = mobileNav.querySelectorAll('a');

    hamburgerBtn.addEventListener('click', () => {
        document.body.classList.toggle('mobile-nav-active');
        mobileNav.classList.toggle('mobile-active');
    });

    // Menüdeki bir linke tıklanınca menünün kapanmasını sağla
    navLinksMobile.forEach(link => {
        link.addEventListener('click', () => {
            if (document.body.classList.contains('mobile-nav-active')) {
                document.body.classList.remove('mobile-nav-active');
                mobileNav.classList.remove('mobile-active');
            }
        });
    });
        const apiUrl = 'https://dhs-backend-g9k9.onrender.com';
        const allNavLinks = document.querySelectorAll('header a[data-target], .hero-buttons a');
        const pageSections = document.querySelectorAll('.page-section');
        const authButtonsContainer = document.getElementById('auth-buttons');
        let linesDataCache = [];
        
         const showPage = (targetId) => {
    pageSections.forEach(section => {
        section.classList.remove('active');
    });
    const targetPage = document.getElementById(targetId);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    document.querySelectorAll('header nav a').forEach(link => {
        link.classList.toggle('active', link.dataset.target === targetId);
    });

    // Her sayfa için kontrolleri ayrı ayrı yapıyoruz:
    if (targetId === 'investor' && linesDataCache.length === 0) {
        fetchLines();
    }
    if (targetId === 'home' && document.getElementById('hero-title')) {
        const heroTitle = document.getElementById('hero-title');
        if (heroTitle.textContent === '') {
            typeWriter();
        }
    }
    
    // Kampanya sayfasını kontrol et ve geri sayımı başlat
    if (targetId === 'campaign-page') {
        const countdownEl = document.getElementById('countdown');
        if(countdownEl){
            const countdownDate = new Date();
            countdownDate.setDate(countdownDate.getDate() + 30);

            const daysEl = document.getElementById('days');
            const hoursEl = document.getElementById('hours');
            const minutesEl = document.getElementById('minutes');

            if(window.countdownInterval) clearInterval(window.countdownInterval);

            function updateCountdown() {
                const now = new Date().getTime();
                const distance = countdownDate - now;

                if(distance < 0) {
                    clearInterval(window.countdownInterval);
                    countdownEl.innerHTML = "KAMPANYA SONA ERDİ!";
                    return;
                }

                if (daysEl) daysEl.innerText = Math.floor(distance / (1000 * 60 * 60 * 24));
                if (hoursEl) hoursEl.innerText = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                if (minutesEl) minutesEl.innerText = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            }

            window.countdownInterval = setInterval(updateCountdown, 1000);
            updateCountdown(); 
        }
    }
    
    // Profil sayfasını kontrol et
    if (targetId === 'profile-page') {
        fetchMyInvestments();
        fetchUserInfo();
    }
};
        allNavLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('data-target');
                if(targetId) showPage(targetId);
            });
        });

        const heroTitle = document.getElementById('hero-title');
        function typeWriter() {
            // DÜZENLEME: Metin güncellendi
            const titleText = "İstanbul'u yeniden programlıyorum.";
            let charIndex = 0;
            if (!heroTitle) return;
            heroTitle.textContent = ''; 
            function type() {
                if (charIndex < titleText.length) {
                    heroTitle.textContent += titleText.charAt(charIndex);
                    charIndex++;
                    setTimeout(type, 100);
                }
            }
            type();
        }

        const tabsContainer = document.querySelector('.tabs-container');
        if(tabsContainer){
            tabsContainer.addEventListener('click', (e) => {
                const clicked = e.target.closest('.tab-btn');
                if (!clicked) return;
                tabsContainer.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
                clicked.classList.add('active');
                document.querySelectorAll('#how-it-works .tab-content').forEach(content => content.classList.remove('active'));
                const targetContent = document.getElementById(clicked.dataset.tab);
                if(targetContent) targetContent.classList.add('active');
            });
        }
        
        const faqAccordion = document.querySelector('.faq-accordion');
        if(faqAccordion){
            faqAccordion.addEventListener('click', (e) => {
                const item = e.target.closest('.faq-item');
                if (!item) return;
                const wasActive = item.classList.contains('active');
                faqAccordion.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
                if(!wasActive) item.classList.add('active');
            });
        }
        
        const fetchLines = async () => {
            const container = document.getElementById('lines-grid-container');
            if(!container) return;
            container.innerHTML = '<p>Hatlar yükleniyor...</p>';
            try {
                const response = await fetch(`${apiUrl}/api/hatlar`);
                if (!response.ok) throw new Error('Veri çekilemedi.');
                linesDataCache = await response.json();
                if(linesDataCache.length === 0) {
                     container.innerHTML = '<p>Şu anda yatırım yapılabilecek aktif hat bulunmamaktadır.</p>';
                     return;
                }
                container.innerHTML = linesDataCache.map(line => `
                    <div class="line-card glass-effect" data-line-id="${line._id}">
                        <h3>${line.ad}</h3>
                        <div class="line-value">Hattın Değeri: <span>${(line.hat_degeri || 40000).toLocaleString('tr-TR')} TL</span></div>
                        <div class="line-progress">
                            <div class="progress-bar-container"><div class="progress-bar" style="width: ${line.satilan_pay || 0}%"></div></div>
                            <p class="progress-text">Satılan Pay: %${line.satilan_pay || 0}</p>
                        </div>
                        <div class="share-options">
                            <button class="share-btn" data-share="10">%10</button>
                            <button class="share-btn" data-share="25">%25</button>
                            <button class="share-btn" data-share="50">%50</button>
                            <button class="share-btn" data-share="100">%100</button>
                        </div>
                        <div class="investment-details">
                            <p>Lütfen bir pay seçin</p>
                            <div class="investment-amount">-</div>
                        </div>
                        <button class="btn btn-primary btn-buy-share" disabled>Pay Seç</button>
                    </div>`).join('');
            } catch (error) {
                container.innerHTML = `<p style="color: red;">Hata: ${error.message}</p>`;
            }
        };

// Mevcut fetchUserInfo ve fetchMyInvestments fonksiyonlarını silip bunları yapıştır

const fetchUserInfo = async () => {
    const welcomeMessageEl = document.getElementById('profile-welcome-message');
    const emailEl = document.getElementById('profile-user-email');
    const avatarEl = document.getElementById('user-avatar');

    const token = localStorage.getItem('jwtToken');
    if (!token) return;

    try {
        const response = await fetch(`${apiUrl}/api/kullanici/bilgilerim`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Kullanıcı bilgileri alınamadı.');

        const user = await response.json();
        
        // Kullanıcı adının ilk harfini veya e-postanın ilk harfini al
        const displayName = user.name || user.email;
        welcomeMessageEl.textContent = `Hoş Geldin, ${displayName.split('@')[0]}!`;
        emailEl.textContent = user.email;
        avatarEl.textContent = displayName.charAt(0).toUpperCase();

    } catch (error) {
        welcomeMessageEl.textContent = 'Hoş Geldin!';
        emailEl.textContent = 'E-posta bilgisi alınamadı.';
    }
};

const fetchMyInvestments = async () => {
    const container = document.getElementById('my-investments-container');
    const totalValueEl = document.getElementById('total-asset-value');
    const countEl = document.getElementById('investment-count');
    const highestShareEl = document.getElementById('highest-share');
    
    container.innerHTML = '<p>Yatırımlarınız yükleniyor...</p>';
    const token = localStorage.getItem('jwtToken');
    if (!token) { showPage('auth-page'); return; }

    try {
        const response = await fetch(`${apiUrl}/api/kullanici/yatirimlarim`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Yatırımlarınız getirilemedi.');
        
        const data = await response.json();
        const yatirimlar = data.yatirimlar;
        const ozet = data.ozet;
        
        if (!Array.isArray(yatirimlar) || !ozet) {
             throw new Error("Sunucudan beklenmedik bir formatta veri geldi.");
        }

        // Özet istatistiklerini güncelle
        totalValueEl.textContent = `${ozet.toplam_varlik.toLocaleString('tr-TR')} TL`;
        countEl.textContent = `${ozet.yatirim_sayisi} Adet`;
        highestShareEl.textContent = `%${ozet.en_yuksek_pay}`;

        if (yatirimlar.length === 0) {
            container.innerHTML = '<p>Henüz hiç yatırım yapmamışsınız.</p>';
            return;
        }

        container.innerHTML = yatirimlar.map(item => {
            const investmentDate = new Date(item.yatirim_tarihi).toLocaleDateString('tr-TR');
            const yatirimTutari = item.yatirim_tutari || 0;
            const hatDegeri = item.hat_detaylari.hat_degeri || 0;

            return `
            <div class="investment-card glass-effect">
                <h3>${item.hat_detaylari.ad || 'Bilinmeyen Hat'}</h3>
                <p><strong>Sahip Olunan Pay:</strong> %${item.yuzde || 0}</p>
                <p><strong>Yatırım Tutarı:</strong> ${yatirimTutari.toLocaleString('tr-TR')} TL</p>
                <p><strong>Hattın Mevcut Değeri:</strong> ${hatDegeri.toLocaleString('tr-TR')} TL</p>
                <p class="investment-date"><strong>Yatırım Tarihi:</strong> ${investmentDate}</p>
            </div>`;
        }).join('');

    } catch (error) {
        container.innerHTML = `<p style="color: red;">Hata: ${error.message}</p>`;
    }
};
        document.getElementById('lines-grid-container').addEventListener('click', function(e) {
            const card = e.target.closest('.line-card');
            if (!card) return;

            if (e.target.classList.contains('share-btn')) {
                const selectedBtn = e.target;
                const share = parseInt(selectedBtn.dataset.share, 10);
                card.querySelectorAll('.share-btn').forEach(btn => btn.classList.remove('selected'));
                selectedBtn.classList.add('selected');
                const lineId = card.dataset.lineId;
                const line = linesDataCache.find(l => l._id === lineId);
                const linePrice = line.hat_degeri || 40000;
                const investmentAmount = (linePrice * share) / 100;
                const details = card.querySelector('.investment-details');
                details.querySelector('p').textContent = `Seçilen Pay: %${share}`;
                details.querySelector('.investment-amount').textContent = `${investmentAmount.toLocaleString('tr-TR')} TL`;
                const buyButton = card.querySelector('.btn-buy-share');
                buyButton.textContent = `%${share}'luk Payı Satın Al`;
                buyButton.disabled = false;
            }

            if (e.target.classList.contains('btn-buy-share')) {
                const selectedShareBtn = card.querySelector('.share-btn.selected');
                if(!selectedShareBtn) {
                    alert('Lütfen önce bir pay oranı seçin.');
                    return;
                }
                const share = parseInt(selectedShareBtn.dataset.share, 10);
                const lineId = card.dataset.lineId;
                makeInvestment(lineId, share);
            }
        });

        const makeInvestment = async (lineId, share) => {
            const token = localStorage.getItem('jwtToken');
            if (!token) {
                alert('Yatırım yapmak için lütfen giriş yapın.');
                showPage('auth-page');
                return;
            }
            try {
                const response = await fetch(`${apiUrl}/api/hatlar/${lineId}/yatirim`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ yuzde: share }) // 'yuzde' olarak gönderiyoruz
                });
                const result = await response.json();
                if (!response.ok) throw new Error(result.message || 'Yatırım işlemi başarısız.');
                
                // BAŞARI MESAJI VE OTOMATİK GÜNCELLEME
                alert(`Tebrikler! ${result.hat.ad} hattına %${share} oranında yatırım yaptınız.`);
                fetchLines(); // Yatırım sonrası hat listesini otomatik olarak yenile
                
            } catch (error) {
                alert(`Hata: ${error.message}`);
            }
        };

        const loginFormContainer = document.getElementById('login-form-container');
        const registerFormContainer = document.getElementById('register-form-container');
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        const showRegisterBtn = document.getElementById('show-register');
        const showLoginBtn = document.getElementById('show-login');

        if(showRegisterBtn) showRegisterBtn.addEventListener('click', () => {
            loginFormContainer.style.display = 'none'; 
            registerFormContainer.style.display = 'block';
        });
        if(showLoginBtn) showLoginBtn.addEventListener('click', () => {
            registerFormContainer.style.display = 'none'; 
            loginFormContainer.style.display = 'block';
        });
        
        const showFormMessage = (form, message, type) => {
            const messageEl = form.querySelector('.form-message');
            if(!messageEl) return;
            messageEl.textContent = message;
            messageEl.className = `form-message ${type}`;
            messageEl.style.display = 'block';
        };

        if(registerForm) registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = Object.fromEntries(new FormData(registerForm).entries());
            try {
                const response = await fetch(`${apiUrl}/api/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const result = await response.json();
                if (!response.ok) throw new Error(result.message || 'Kayıt başarısız.');
                showFormMessage(registerForm, 'Kayıt başarılı! Lütfen giriş yapın.', 'success');
                setTimeout(() => { if(showLoginBtn) showLoginBtn.click(); }, 2000);
            } catch (error) {
                showFormMessage(registerForm, error.message, 'error');
            }
        });

        if(loginForm) loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = Object.fromEntries(new FormData(loginForm).entries());
            try {
                const response = await fetch(`${apiUrl}/api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const result = await response.json();
                if (!response.ok || !result.token) throw new Error(result.message || 'Giriş başarısız.');
                localStorage.setItem('jwtToken', result.token);
                updateAuthUI();
                showPage('investor');
                alert('Giriş başarılı! Yatırım sayfasına yönlendiriliyorsunuz.');
            } catch (error) {
                showFormMessage(loginForm, error.message, 'error');
            }
        });

        const logout = () => {
            localStorage.removeItem('jwtToken');
            updateAuthUI();
            showPage('home');
            alert('Başarıyla çıkış yaptınız.');
        };

        const updateAuthUI = () => {
        const token = localStorage.getItem('jwtToken');
        const profileLink = document.querySelector('.profile-link'); // Profil linkini seç

        if (token) {
            authButtonsContainer.innerHTML = `
                <a href="#" class="btn btn-primary" data-target="profile-page" style="margin-right: 10px;">Profilim</a>
                <button id="logout-btn" class="btn btn-secondary">Çıkış Yap</button>
            `;
            document.getElementById('logout-btn').addEventListener('click', logout);
            
            // authButtonsContainer içindeki yeni profil linkine de event listener ekle
            const profileBtn = authButtonsContainer.querySelector('a[data-target="profile-page"]');
            if (profileBtn) {
                profileBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    showPage('profile-page');
                });
            }

            if (profileLink) profileLink.style.display = 'list-item'; // Ana menüdeki linki görünür yap

        } else {
            authButtonsContainer.innerHTML = `<a href="#" class="btn btn-primary" data-target="auth-page">Giriş Yap / Kayıt Ol</a>`;
            authButtonsContainer.querySelector('a[data-target="auth-page"]').addEventListener('click', (e) => {
                e.preventDefault();
                showPage('auth-page');
            });

            if (profileLink) profileLink.style.display = 'none'; // Ana menüdeki linki gizle
        }
    };
        
        // Başlangıç Ayarları
        loginFormContainer.style.display = 'block';
        registerFormContainer.style.display = 'none';
        showPage('home');
        updateAuthUI();
     });