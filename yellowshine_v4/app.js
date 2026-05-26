// ============================
// YELLOWSHINE APP v2.1
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
    document.getElementById('navLogout')?.addEventListener('click', () => { YS.logout(); location.reload(); });
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

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(overlay.id); });
  });
  document.getElementById('closeLoginModal')?.addEventListener('click', () => closeModal('loginModal'));
  document.getElementById('closeRegisterModal')?.addEventListener('click', () => closeModal('registerModal'));
  document.getElementById('closeAdminLoginModal')?.addEventListener('click', () => closeModal('adminLoginModal'));
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
    } else { err.textContent = '❌ Username/email atau password salah!'; }
  });

  // ===== USER REGISTER =====
  document.getElementById('registerBtn')?.addEventListener('click', () => {
    const username = document.getElementById('regUsername').value.trim();
    const email    = document.getElementById('regEmail').value.trim();
    const pass     = document.getElementById('regPass').value;
    const pass2    = document.getElementById('regPassConfirm').value;
    const err      = document.getElementById('registerErr');
    if (!username || !email || !pass || !pass2) { err.textContent = '⚠️ Lengkapi semua field!'; return; }
    if (pass !== pass2)   { err.textContent = '❌ Password tidak cocok!'; return; }
    if (pass.length < 6)  { err.textContent = '❌ Password minimal 6 karakter!'; return; }
    const res = YS.registerUser(username, email, pass);
    if (res.ok) {
      showToast('🎉 Akun berhasil dibuat! Silakan login.', 'success');
      closeModal('registerModal');
      setTimeout(() => openModal('loginModal'), 400);
    } else { err.textContent = '❌ ' + res.msg; }
  });

  // ===== ADMIN LOGIN =====
  document.getElementById('adminLoginBtn')?.addEventListener('click', doAdminLogin);
  ['adminUser','adminPass'].forEach(id =>
    document.getElementById(id)?.addEventListener('keydown', e => { if (e.key === 'Enter') doAdminLogin(); })
  );
  function doAdminLogin() {
    const u = document.getElementById('adminUser').value.trim();
    const p = document.getElementById('adminPass').value;
    const err = document.getElementById('adminLoginErr');
    if (!u || !p) { err.textContent = '⚠️ Isi username dan password!'; return; }
    if (YS.adminLogin(u, p)) {
      showToast('✅ Login admin berhasil!', 'success');
      closeModal('adminLoginModal');
      setTimeout(() => window.location.href = 'admin.html', 700);
    } else { err.textContent = '❌ Username atau password salah!'; }
  }

  // ===== ABOUT PHOTO =====
  function renderAboutPhoto() {
    const wrap = document.getElementById('aboutPhotoWrap');
    if (!wrap) return;
    const photo = YS.getAboutPhoto();
    wrap.innerHTML = photo
      ? `<img src="${photo}" alt="Yellowshine Kitchen" class="about-main-img"/>`
      : `<div class="about-emoji-placeholder">🏠</div>`;
  }
  renderAboutPhoto();

  // ============================================================
  // HERO SLIDER — one product per slide, proper single-display
  // ============================================================
  let sliderTimer = null;

  function buildHeroSlider(items) {
    const sliderWrap = document.getElementById('heroSlider');
    const dotsWrap   = document.getElementById('sliderDots');
    if (!sliderWrap || !dotsWrap) return;

    // Clear any previous auto-timer
    if (sliderTimer) { clearInterval(sliderTimer); sliderTimer = null; }

    const list = items.length ? items : YS.getProducts().slice(0, 5);
    let idx = 0;

    // Build slides — each takes full width of the wrapper
    sliderWrap.innerHTML = list.map((p, i) => {
      const media = p.image
        ? `<img src="${p.image}" alt="${p.name}" class="slide-product-img"/>`
        : `<div class="slide-emoji">${p.emoji}</div>`;
      return `<div class="slide${i === 0 ? ' active' : ''}">${media}<p>${p.name}</p><span class="slide-price">${YS.formatRp(p.price)}</span></div>`;
    }).join('');

    // Build dots
    dotsWrap.innerHTML = list.map((_, i) =>
      `<span class="dot${i === 0 ? ' active' : ''}" data-i="${i}"></span>`).join('');

    // Dot click
    dotsWrap.querySelectorAll('.dot').forEach(d =>
      d.addEventListener('click', () => goSlide(+d.dataset.i)));

    function goSlide(n) {
      const slides = sliderWrap.querySelectorAll('.slide');
      const dots   = dotsWrap.querySelectorAll('.dot');
      slides[idx]?.classList.remove('active');
      dots[idx]?.classList.remove('active');
      idx = (n + list.length) % list.length;
      slides[idx]?.classList.add('active');
      dots[idx]?.classList.add('active');
    }

    if (list.length > 1) {
      sliderTimer = setInterval(() => goSlide(idx + 1), 2800);
    }
  }

  // ============================================================
  // RENDER MENU — with instant filter (no re-render bug)
  // ============================================================
  // Keep all products in memory so filter works without re-fetching
  let allProducts = [];
  let currentCat  = 'all';

  function renderMenu() {
    allProducts = YS.getProducts();
    const bestSellers = allProducts.filter(p => p.bestSeller);
    document.getElementById('statProducts').textContent = allProducts.length + '+';

    // Hero slider (best sellers, or all if none)
    buildHeroSlider(bestSellers.length ? bestSellers : allProducts.slice(0, 5));

    // Featured grid
    document.getElementById('featuredGrid').innerHTML =
      bestSellers.map(p => productCard(p, true)).join('');
    attachOrderBtns(document.getElementById('featuredGrid'));

    // Filter buttons — rebuild only the category buttons, keep "Semua"
    const filterBar = document.getElementById('menuFilter');
    filterBar.querySelectorAll('[data-cat]:not([data-cat="all"])').forEach(b => b.remove());
    const cats = [...new Set(allProducts.map(p => p.category))];
    cats.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'filter-btn';
      btn.dataset.cat = cat;
      btn.textContent = cat;
      filterBar.appendChild(btn);
    });

    // Wire up ALL filter buttons (including "Semua")
    filterBar.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        filterBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCat = btn.dataset.cat;
        renderMenuGrid(true); // animate filter switch
      });
    });

    // Restore active category after re-render
    const activeBtn = filterBar.querySelector(`[data-cat="${currentCat}"]`);
    if (activeBtn) {
      filterBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      activeBtn.classList.add('active');
    }

    // Initial menu grid (no fade animation on first load)
    renderMenuGrid(false);

    // Review select
    const sel = document.getElementById('reviewProduct');
    if (sel) {
      sel.innerHTML = '<option value="">Pilih Menu</option>' +
        allProducts.map(p => `<option value="${p.name}">${p.emoji} ${p.name}</option>`).join('');
    }
  }

  function renderMenuGrid(animate) {
    const filtered = currentCat === 'all'
      ? allProducts
      : allProducts.filter(p => p.category === currentCat);
    const grid = document.getElementById('menuGrid');

    function doRender() {
      grid.innerHTML = filtered.map(p => productCard(p, false)).join('');
      attachOrderBtns(grid);
      grid.classList.remove('grid-fade');
      // Re-observe new cards for animate-in (only on initial load, not filter clicks)
      if (!animate) {
        grid.querySelectorAll('.product-card').forEach(el => {
          el.classList.add('animate-in');
          cardObserver.observe(el);
        });
      }
    }

    if (animate) {
      // Filter click: fade out → swap content → fade in
      grid.classList.add('grid-fade');
      setTimeout(doRender, 160);
    } else {
      // Initial load: render immediately
      doRender();
    }
  }

  // ===== PRODUCT CARD =====
  function productCard(p, isFeatured) {
    const media = p.image
      ? `<img src="${p.image}" alt="${p.name}" class="product-img-photo"/>`
      : `<div class="product-emoji">${p.emoji}</div>`;
    return `
    <div class="product-card${isFeatured ? ' featured-card' : ''}">
      ${p.bestSeller ? '<div class="badge-star">⭐ Best Seller</div>' : ''}
      <div class="product-img-wrap">${media}</div>
      <div class="product-info">
        <span class="product-cat">${p.category}</span>
        <h3 class="product-name">${p.name}</h3>
        <p class="product-desc">${p.desc}</p>
        <div class="product-footer">
          <span class="product-price">${YS.formatRp(p.price)}</span>
          <button class="btn btn-order order-btn" data-name="${p.name}">💬 Pesan</button>
        </div>
      </div>
    </div>`;
  }

  function attachOrderBtns(container) {
    (container || document).querySelectorAll('.order-btn').forEach(btn => {
      // Remove old listener first to avoid duplicates
      btn.replaceWith(btn.cloneNode(true));
    });
    (container || document).querySelectorAll('.order-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const msg = encodeURIComponent(`Halo Yellowshine, saya mau pesan ${btn.dataset.name} 😊`);
        window.open(`https://wa.me/6288102684235?text=${msg}`, '_blank');
      });
    });
  }

  renderMenu();

  // ============================================================
  // STORAGE CHANGE — sync slider when admin updates products
  // (Useful when admin.html saves then user refreshes, but also
  //  listen for storage events if opened in two tabs)
  // ============================================================
  window.addEventListener('storage', e => {
    if (e.key === 'ys_products' || e.key === 'ys_products_updated') {
      renderMenu(); // slider + menu auto-refresh
    }
  });

  // ===== REVIEWS =====
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
        <div class="review-date">${new Date(r.date).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})}</div>
      </div>`).join('')
      : '<p style="text-align:center;color:var(--text-muted)">Belum ada ulasan. Jadilah yang pertama! 💌</p>';
  }
  renderReviews();

  // ===== REVIEW FORM =====
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
            <input type="text" id="reviewName" value="${u.username}" readonly/>
            <select id="reviewProduct"><option value="">Pilih Menu</option></select>
          </div>
          <div class="star-picker">
            <span>Rating:</span>
            <div class="stars" id="starPicker">
              <span class="star" data-val="1">★</span><span class="star" data-val="2">★</span>
              <span class="star" data-val="3">★</span><span class="star" data-val="4">★</span>
              <span class="star" data-val="5">★</span>
            </div>
            <span id="starLabel">Belum dipilih</span>
          </div>
          <textarea id="reviewText" placeholder="Ceritakan pengalamanmu..." rows="3" required></textarea>
          <button type="submit" class="btn btn-primary">Kirim Ulasan 💌</button>
        </form>`;

      const sel = document.getElementById('reviewProduct');
      YS.getProducts().forEach(p => {
        const o = document.createElement('option');
        o.value = p.name; o.textContent = p.emoji + ' ' + p.name;
        sel.appendChild(o);
      });

      let selectedRating = 0;
      const stars = wrap.querySelectorAll('.star');
      const starLabel = wrap.querySelector('#starLabel');
      const labels = ['','Buruk','Kurang','Cukup','Bagus','Sangat Bagus! 🌟'];
      stars.forEach(star => {
        star.addEventListener('mouseenter', () => hlStars(+star.dataset.val));
        star.addEventListener('mouseleave', () => hlStars(selectedRating));
        star.addEventListener('click', () => { selectedRating = +star.dataset.val; starLabel.textContent = labels[selectedRating]; hlStars(selectedRating); });
      });
      function hlStars(n) { stars.forEach(s => s.classList.toggle('active', +s.dataset.val <= n)); }

      wrap.querySelector('#reviewForm').addEventListener('submit', e => {
        e.preventDefault();
        const name    = wrap.querySelector('#reviewName').value.trim();
        const product = wrap.querySelector('#reviewProduct').value;
        const text    = wrap.querySelector('#reviewText').value.trim();
        if (!product || !selectedRating || !text) { showToast('⚠️ Lengkapi semua field & pilih rating!', 'warn'); return; }
        const reviews = YS.getReviews();
        reviews.unshift({ id: Date.now(), name, product, rating: selectedRating, text, date: new Date().toISOString().split('T')[0] });
        YS.saveReviews(reviews);
        renderReviews();
        showToast('💌 Terima kasih! Ulasanmu telah dikirim!', 'success');
        e.target.reset();
        wrap.querySelector('#reviewName').value = name;
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
  // cardObserver used for initial product card animate-in
  const cardObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        cardObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });
  // General observer for review/contact cards
  const generalObserver = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  document.querySelectorAll('.review-card, .contact-card, .vm-card').forEach(el => generalObserver.observe(el));

  // ===== TOAST =====
  window.showToast = function(msg, type = 'success') {
    const t = document.getElementById('toast');
    t.textContent = msg; t.className = `toast show ${type}`;
    setTimeout(() => t.className = 'toast', 3000);
  };

});
