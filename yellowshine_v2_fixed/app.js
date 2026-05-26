// ============================
// YELLOWSHINE APP v2
// ============================

document.addEventListener('DOMContentLoaded', () => {

  // ===== NAVBAR SCROLL =====
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => navbar.classList.toggle('scrolled', window.scrollY > 50));

  // ===== HAMBURGER =====
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  hamburger?.addEventListener('click', () => navLinks.classList.toggle('open'));

  // ===== ACTIVE NAV =====
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    let cur = '';
    sections.forEach(s => { if (window.scrollY >= s.offsetTop - 110) cur = s.id; });
    document.querySelectorAll('.nav-link').forEach(l =>
      l.classList.toggle('active', l.getAttribute('href') === '#' + cur));
  });

  // ===== SMOOTH SCROLL =====
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (a) {
      e.preventDefault();
      const t = document.querySelector(a.getAttribute('href'));
      if (t) t.scrollIntoView({ behavior: 'smooth' });
      navLinks.classList.remove('open');
    }
  });

  // ===== SECRET ADMIN SHORTCUT: Ctrl+Shift+A =====
  document.addEventListener('keydown', e => {
    if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
      e.preventDefault();
      if (YS.isAdminLoggedIn()) { window.location.href = 'admin.html'; return; }
      openModal('adminLoginModal');
    }
  });
  // Also bind hidden button in footer (for mobile workaround)
  document.getElementById('adminAccessBtn')?.addEventListener('click', () => {
    if (YS.isAdminLoggedIn()) { window.location.href = 'admin.html'; return; }
    openModal('adminLoginModal');
  });

  // ===== RENDER NAV AUTH =====
  function renderNavAuth() {
    const wrap = document.getElementById('navAuth');
    if (!wrap) return;
    if (YS.isAdminLoggedIn()) {
      wrap.innerHTML = `
        <a href="admin.html" class="btn btn-sm btn-admin">⚙️ Admin Panel</a>
        <button class="btn btn-sm btn-outline" id="navLogout">Logout</button>`;
    } else if (YS.isUserLoggedIn()) {
      const u = YS.getCurrentUser();
      wrap.innerHTML = `
        <span class="nav-user">👤 ${u.username}</span>
        <button class="btn btn-sm btn-outline" id="navLogout">Logout</button>`;
    } else {
      wrap.innerHTML = `
        <button class="btn btn-sm btn-outline" id="navLoginBtn">Masuk</button>
        <button class="btn btn-sm btn-primary" id="navRegisterBtn">Daftar</button>`;
      document.getElementById('navLoginBtn')?.addEventListener('click', () => openModal('loginModal'));
      document.getElementById('navRegisterBtn')?.addEventListener('click', () => openModal('registerModal'));
    }
    document.getElementById('navLogout')?.addEventListener('click', () => {
      YS.logout(); location.reload();
    });
  }
  renderNavAuth();

  // ===== MODAL HELPERS =====
  function openModal(id) {
    document.getElementById(id).style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
  function closeModal(id) {
    document.getElementById(id).style.display = 'none';
    document.body.style.overflow = '';
  }
  window.openModal = openModal;
  window.closeModal = closeModal;

  // close on overlay click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(overlay.id); });
  });

  // close buttons
  document.getElementById('closeLoginModal')?.addEventListener('click', () => closeModal('loginModal'));
  document.getElementById('closeRegisterModal')?.addEventListener('click', () => closeModal('registerModal'));
  document.getElementById('closeAdminLoginModal')?.addEventListener('click', () => closeModal('adminLoginModal'));

  // switch links
  document.getElementById('switchToRegister')?.addEventListener('click', e => {
    e.preventDefault(); closeModal('loginModal'); openModal('registerModal');
  });
  document.getElementById('switchToLogin')?.addEventListener('click', e => {
    e.preventDefault(); closeModal('registerModal'); openModal('loginModal');
  });

  // ===== USER LOGIN =====
  document.getElementById('loginBtn')?.addEventListener('click', () => {
    const u = document.getElementById('loginUser').value.trim();
    const p = document.getElementById('loginPass').value;
    const err = document.getElementById('loginErr');
    if (!u || !p) { err.textContent = '⚠️ Isi semua field!'; return; }
    const user = YS.userLogin(u, p);
    if (user) {
      showToast('✅ Selamat datang, ' + user.username + '!', 'success');
      closeModal('loginModal');
      setTimeout(() => location.reload(), 600);
    } else {
      err.textContent = '❌ Username/email atau password salah!';
    }
  });

  // ===== USER REGISTER =====
  document.getElementById('registerBtn')?.addEventListener('click', () => {
    const username = document.getElementById('regUsername').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const pass = document.getElementById('regPass').value;
    const pass2 = document.getElementById('regPassConfirm').value;
    const err = document.getElementById('registerErr');
    if (!username || !email || !pass || !pass2) { err.textContent = '⚠️ Lengkapi semua field!'; return; }
    if (pass !== pass2) { err.textContent = '❌ Password tidak cocok!'; return; }
    if (pass.length < 6) { err.textContent = '❌ Password minimal 6 karakter!'; return; }
    const res = YS.registerUser(username, email, pass);
    if (res.ok) {
      showToast('🎉 Akun berhasil dibuat! Silakan login.', 'success');
      closeModal('registerModal');
      setTimeout(() => openModal('loginModal'), 400);
    } else { err.textContent = '❌ ' + res.msg; }
  });

  // ===== ADMIN LOGIN =====
  document.getElementById('adminLoginBtn')?.addEventListener('click', () => {
    const u = document.getElementById('adminUser').value.trim();
    const p = document.getElementById('adminPass').value;
    const err = document.getElementById('adminLoginErr');
    if (!u || !p) { err.textContent = '⚠️ Isi username dan password!'; return; }
    if (YS.adminLogin(u, p)) {
      showToast('✅ Login admin berhasil!', 'success');
      closeModal('adminLoginModal');
      setTimeout(() => window.location.href = 'admin.html', 700);
    } else { err.textContent = '❌ Username atau password salah!'; }
  });

  // Enter key on admin modal fields
  ['adminUser', 'adminPass'].forEach(id => {
    document.getElementById(id)?.addEventListener('keydown', e => {
      if (e.key === 'Enter') document.getElementById('adminLoginBtn').click();
    });
  });

  // ===== RENDER ABOUT PHOTO =====
  function renderAboutPhoto() {
    const wrap = document.getElementById('aboutPhotoWrap');
    if (!wrap) return;
    const photo = YS.getAboutPhoto();
    if (photo) {
      wrap.innerHTML = `<img src="${photo}" alt="Yellowshine Kitchen" class="about-main-img"/>`;
    } else {
      wrap.innerHTML = `<div class="about-emoji-placeholder">🏠</div>`;
    }
  }
  renderAboutPhoto();

  // ===== RENDER PRODUCTS =====
  function renderMenu() {
    const products = YS.getProducts();
    const bestSellers = products.filter(p => p.bestSeller);
    document.getElementById('statProducts').textContent = products.length + '+';

    // HERO SLIDER — use best seller products
    buildHeroSlider(bestSellers);

    // FEATURED GRID
    const fg = document.getElementById('featuredGrid');
    fg.innerHTML = bestSellers.map(p => productCard(p, true)).join('');

    // FILTER BUTTONS
    const filterBar = document.getElementById('menuFilter');
    filterBar.querySelectorAll('[data-cat]:not([data-cat="all"])').forEach(b => b.remove());
    const cats = [...new Set(products.map(p => p.category))];
    cats.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'filter-btn'; btn.dataset.cat = cat; btn.textContent = cat;
      filterBar.appendChild(btn);
    });
    filterBar.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        filterBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const cat = btn.dataset.cat;
        const filtered = cat === 'all' ? products : products.filter(p => p.category === cat);
        document.getElementById('menuGrid').innerHTML = filtered.map(p => productCard(p, false)).join('');
        attachOrderBtns();
      });
    });

    // MENU GRID
    document.getElementById('menuGrid').innerHTML = products.map(p => productCard(p, false)).join('');
    attachOrderBtns();

    // REVIEW PRODUCT SELECT
    const sel = document.getElementById('reviewProduct');
    if (sel) {
      sel.innerHTML = '<option value="">Pilih Menu</option>' +
        products.map(p => `<option value="${p.name}">${p.emoji} ${p.name}</option>`).join('');
    }
  }

  // ===== HERO SLIDER FROM PRODUCTS =====
  function buildHeroSlider(bestSellers) {
    const sliderWrap  = document.getElementById('heroSlider');
    const dotsWrap    = document.getElementById('sliderDots');
    const counterEl   = document.getElementById('sliderCounter');
    const prevBtn     = document.getElementById('sliderPrev');
    const nextBtn     = document.getElementById('sliderNext');
    if (!sliderWrap || !dotsWrap) return;

    const items = bestSellers.length ? bestSellers : YS.getProducts().slice(0, 4);
    let idx = 0;
    let isAnimating = false;
    let autoTimer;

    // Build slides
    sliderWrap.innerHTML = items.map((p, i) => `
      <div class="slide ${i === 0 ? 'active' : ''}" data-i="${i}">
        <div class="slide-inner">
          <div class="slide-visual">
            ${p.image
              ? `<img src="${p.image}" alt="${p.name}" class="slide-product-img"/>`
              : `<div class="slide-emoji">${p.emoji}</div>`
            }
          </div>
          <div class="slide-info">
            <span class="slide-cat">${p.category || ''}</span>
            <p class="slide-name">${p.name}</p>
            <span class="slide-price">${YS.formatRp(p.price)}</span>
          </div>
        </div>
      </div>`).join('');

    // Build dots
    dotsWrap.innerHTML = items.map((_, i) =>
      `<span class="dot ${i === 0 ? 'active' : ''}" data-i="${i}"></span>`).join('');

    function updateCounter() {
      if (counterEl) counterEl.textContent = `${idx + 1} / ${items.length}`;
    }
    updateCounter();

    function goSlide(n, dir = 'next') {
      if (isAnimating || n === idx) return;
      isAnimating = true;

      const slides = sliderWrap.querySelectorAll('.slide');
      const dots   = dotsWrap.querySelectorAll('.dot');
      const current = slides[idx];
      const next    = slides[n];

      // Set enter direction
      next.classList.add(dir === 'next' ? 'entering-right' : 'entering-left');
      // Force reflow
      next.getBoundingClientRect();

      current.classList.add(dir === 'next' ? 'leaving-left' : 'leaving-right');
      current.classList.remove('active');
      next.classList.remove('entering-right', 'entering-left');
      next.classList.add('active');

      dots[idx].classList.remove('active');
      idx = n;
      dots[idx].classList.add('active');
      updateCounter();

      setTimeout(() => {
        current.classList.remove('leaving-left', 'leaving-right');
        isAnimating = false;
      }, 420);
    }

    // Dot clicks
    dotsWrap.querySelectorAll('.dot').forEach(d => {
      d.addEventListener('click', () => {
        const n = +d.dataset.i;
        goSlide(n, n > idx ? 'next' : 'prev');
        resetAuto();
      });
    });

    // Prev / Next buttons
    prevBtn?.addEventListener('click', () => {
      goSlide((idx - 1 + items.length) % items.length, 'prev');
      resetAuto();
    });
    nextBtn?.addEventListener('click', () => {
      goSlide((idx + 1) % items.length, 'next');
      resetAuto();
    });

    // Touch/swipe support
    let touchStartX = 0;
    sliderWrap.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    sliderWrap.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) {
        if (diff > 0) goSlide((idx + 1) % items.length, 'next');
        else goSlide((idx - 1 + items.length) % items.length, 'prev');
        resetAuto();
      }
    });

    // Auto play
    function startAuto() {
      if (items.length > 1) autoTimer = setInterval(() => goSlide((idx + 1) % items.length, 'next'), 3000);
    }
    function resetAuto() { clearInterval(autoTimer); startAuto(); }
    startAuto();

    // Pause on hover
    sliderWrap.closest('.floating-card')?.addEventListener('mouseenter', () => clearInterval(autoTimer));
    sliderWrap.closest('.floating-card')?.addEventListener('mouseleave', startAuto);
  }

  // ===== PRODUCT CARD =====
  function productCard(p, isFeatured) {
    const imgContent = p.image
      ? `<img src="${p.image}" alt="${p.name}" class="product-img-photo"/>`
      : `<div class="product-emoji">${p.emoji}</div>`;
    return `
    <div class="product-card ${isFeatured ? 'featured-card' : ''}">
      ${p.bestSeller ? '<div class="badge-star">⭐ Best Seller</div>' : ''}
      <div class="product-img-wrap">${imgContent}</div>
      <div class="product-info">
        <span class="product-cat">${p.category}</span>
        <h3 class="product-name">${p.name}</h3>
        <p class="product-desc">${p.desc}</p>
        <div class="product-footer">
          <span class="product-price">${YS.formatRp(p.price)}</span>
          <button class="btn btn-order order-btn" data-name="${p.name}" data-price="${p.price}">
            💬 Pesan
          </button>
        </div>
      </div>
    </div>`;
  }

  function attachOrderBtns() {
    document.querySelectorAll('.order-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const msg = encodeURIComponent(`Halo Yellowshine, saya mau pesan ${btn.dataset.name} 😊`);
        window.open(`https://wa.me/6288102684235?text=${msg}`, '_blank');
      });
    });
  }

  renderMenu();

  // ===== RENDER REVIEWS =====
  function renderReviews() {
    const reviews = YS.getReviews();
    const grid = document.getElementById('reviewGrid');
    grid.innerHTML = reviews.length ? reviews.map(r => `
      <div class="review-card">
        <div class="review-header">
          <div class="review-avatar">${r.name.charAt(0).toUpperCase()}</div>
          <div>
            <div class="review-name">${r.name}</div>
            <div class="review-product">📦 ${r.product}</div>
          </div>
          <div class="review-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</div>
        </div>
        <p class="review-text">"${r.text}"</p>
        <div class="review-date">${formatDate(r.date)}</div>
      </div>`).join('')
      : '<p style="text-align:center;color:var(--text-muted)">Belum ada ulasan. Jadilah yang pertama! 💌</p>';
  }

  function formatDate(d) {
    return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  renderReviews();

  // ===== REVIEW FORM (only for logged-in user) =====
  function renderReviewForm() {
    const wrap = document.getElementById('reviewFormWrapper');
    if (!wrap) return;
    if (YS.isUserLoggedIn()) {
      const u = YS.getCurrentUser();
      wrap.innerHTML = `
        <h3>✍️ Tulis Ulasanmu</h3>
        <p class="review-form-user">Menulis sebagai <strong>${u.username}</strong></p>
        <form class="review-form" id="reviewForm">
          <div class="form-row">
            <input type="text" id="reviewName" value="${u.username}" placeholder="Nama" readonly/>
            <select id="reviewProduct"><option value="">Pilih Menu</option></select>
          </div>
          <div class="star-picker">
            <span>Rating:</span>
            <div class="stars" id="starPicker">
              <span class="star" data-val="1">★</span>
              <span class="star" data-val="2">★</span>
              <span class="star" data-val="3">★</span>
              <span class="star" data-val="4">★</span>
              <span class="star" data-val="5">★</span>
            </div>
            <span id="starLabel">Belum dipilih</span>
          </div>
          <textarea id="reviewText" placeholder="Ceritakan pengalamanmu..." rows="3" required></textarea>
          <button type="submit" class="btn btn-primary">Kirim Ulasan 💌</button>
        </form>`;

      // populate select
      const sel = document.getElementById('reviewProduct');
      YS.getProducts().forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.name; opt.textContent = p.emoji + ' ' + p.name;
        sel.appendChild(opt);
      });

      // star picker
      let selectedRating = 0;
      const stars = document.querySelectorAll('.star');
      const starLabel = document.getElementById('starLabel');
      const labels = ['','Buruk','Kurang','Cukup','Bagus','Sangat Bagus! 🌟'];
      stars.forEach(star => {
        star.addEventListener('mouseenter', () => hlStars(+star.dataset.val));
        star.addEventListener('mouseleave', () => hlStars(selectedRating));
        star.addEventListener('click', () => { selectedRating = +star.dataset.val; starLabel.textContent = labels[selectedRating]; });
      });
      function hlStars(n) { stars.forEach(s => s.classList.toggle('active', +s.dataset.val <= n)); }

      document.getElementById('reviewForm').addEventListener('submit', e => {
        e.preventDefault();
        const name = document.getElementById('reviewName').value.trim();
        const product = document.getElementById('reviewProduct').value;
        const text = document.getElementById('reviewText').value.trim();
        if (!product || !selectedRating || !text) { showToast('⚠️ Lengkapi semua field & pilih rating!', 'warn'); return; }
        const reviews = YS.getReviews();
        reviews.unshift({ id: Date.now(), name, product, rating: selectedRating, text, date: new Date().toISOString().split('T')[0] });
        YS.saveReviews(reviews);
        renderReviews();
        showToast('💌 Terima kasih! Ulasanmu telah dikirim!', 'success');
        e.target.reset();
        document.getElementById('reviewName').value = name;
        selectedRating = 0; hlStars(0); starLabel.textContent = 'Belum dipilih';
      });
    } else {
      wrap.innerHTML = `
        <div class="review-login-prompt">
          <div class="rlp-icon">💬</div>
          <h4>Ingin memberikan ulasan?</h4>
          <p>Masuk atau daftar terlebih dahulu untuk berbagi pengalamanmu!</p>
          <div class="rlp-actions">
            <button class="btn btn-primary" onclick="openModal('loginModal')">Masuk</button>
            <button class="btn btn-outline" onclick="openModal('registerModal')">Daftar Gratis</button>
          </div>
        </div>`;
    }
  }
  renderReviewForm();

  // ===== INTERSECTION OBSERVER =====
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  document.querySelectorAll('.product-card, .review-card, .contact-card, .vm-card').forEach(el => obs.observe(el));

  // ===== TOAST =====
  window.showToast = function(msg, type = 'success') {
    const t = document.getElementById('toast');
    t.textContent = msg; t.className = `toast show ${type}`;
    setTimeout(() => t.className = 'toast', 3000);
  };

});
