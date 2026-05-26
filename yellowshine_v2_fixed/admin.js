// ============================
// YELLOWSHINE ADMIN JS v2
// ============================

document.addEventListener('DOMContentLoaded', () => {

  // Guard
  if (!YS.isAdminLoggedIn()) {
    alert('Akses ditolak! Silakan login terlebih dahulu.\n\nTekan Ctrl+Shift+A di halaman utama untuk login admin.');
    window.location.href = 'index.html';
    return;
  }

  // ===== SIDEBAR TABS =====
  const sidebarBtns = document.querySelectorAll('.sidebar-btn');
  const tabs = document.querySelectorAll('.admin-tab');
  sidebarBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sidebarBtns.forEach(b => b.classList.remove('active'));
      tabs.forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
      if (btn.dataset.tab === 'dashboard') renderDashboard();
      if (btn.dataset.tab === 'products') renderProductsTable();
      if (btn.dataset.tab === 'reviews') renderReviewsTable();
      if (btn.dataset.tab === 'users') renderUsersTable();
      if (btn.dataset.tab === 'settings') renderSettings();
    });
  });

  // ===== LOGOUT =====
  document.getElementById('logoutBtn').addEventListener('click', () => {
    YS.logout(); window.location.href = 'index.html';
  });

  // ===== DASHBOARD =====
  function renderDashboard() {
    const products = YS.getProducts();
    const reviews = YS.getReviews();
    const users = YS.getUsers();
    const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '0';
    document.getElementById('dTotalProducts').textContent = products.length;
    document.getElementById('dTotalReviews').textContent = reviews.length;
    document.getElementById('dAvgRating').textContent = '⭐ ' + avgRating;
    document.getElementById('dTotalUsers').textContent = users.length;
    const el = document.getElementById('dashRecentReviews');
    el.innerHTML = reviews.slice(0, 5).map(r => `
      <div class="review-row">
        <div class="rr-avatar">${r.name.charAt(0)}</div>
        <div class="rr-info">
          <strong>${r.name}</strong> – <span>${r.product}</span>
          <div class="rr-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
          <p>"${r.text}"</p>
        </div>
      </div>`).join('') || '<p style="color:var(--text-muted)">Belum ada ulasan.</p>';
  }

  // ===== PRODUCTS TABLE =====
  let editingId = null;

  function renderProductsTable() {
    const products = YS.getProducts();
    const tbody = document.getElementById('productsTableBody');
    tbody.innerHTML = products.map(p => `
      <tr>
        <td>
          ${p.image
            ? `<img src="${p.image}" alt="${p.name}" class="admin-product-thumb"/>`
            : `<div class="admin-product-emoji">${p.emoji}</div>`
          }
        </td>
        <td><strong>${p.name}</strong></td>
        <td><span class="cat-tag">${p.category}</span></td>
        <td>${YS.formatRp(p.price)}</td>
        <td>${p.bestSeller ? '<span class="yes-badge">⭐ Ya</span>' : '<span class="no-badge">Tidak</span>'}</td>
        <td class="action-cell">
          <button class="btn btn-sm btn-edit" data-id="${p.id}">✏️ Edit</button>
          <button class="btn btn-sm btn-danger-sm" onclick="confirmDelete(${p.id})">🗑️ Hapus</button>
        </td>
      </tr>`).join('');
    document.querySelectorAll('.btn-edit').forEach(btn =>
      btn.addEventListener('click', () => openEditProduct(+btn.dataset.id)));
  }

  document.getElementById('addProductBtn').addEventListener('click', () => {
    editingId = null;
    clearProductForm();
    document.getElementById('productFormTitle').textContent = '➕ Tambah Produk Baru';
    document.getElementById('productFormCard').style.display = 'block';
    document.getElementById('productFormCard').scrollIntoView({ behavior: 'smooth' });
  });

  document.getElementById('cancelProductBtn').addEventListener('click', () => {
    document.getElementById('productFormCard').style.display = 'none';
  });

  function openEditProduct(id) {
    const p = YS.getProducts().find(x => x.id === id);
    if (!p) return;
    editingId = id;
    document.getElementById('pName').value = p.name;
    document.getElementById('pCategory').value = p.category;
    document.getElementById('pPrice').value = p.price;
    document.getElementById('pEmoji').value = p.emoji;
    document.getElementById('pDesc').value = p.desc;
    document.getElementById('pBestSeller').value = String(p.bestSeller);
    document.getElementById('pPhotoData').value = p.image || '';
    // show preview
    if (p.image) {
      document.getElementById('photoPreview').src = p.image;
      document.getElementById('photoPreview').style.display = 'block';
      document.getElementById('photoPlaceholder').style.display = 'none';
      document.getElementById('removePhotoBtn').style.display = 'inline-flex';
    } else {
      resetPhotoPreview();
    }
    document.getElementById('productFormTitle').textContent = '✏️ Edit Produk';
    document.getElementById('productFormCard').style.display = 'block';
    document.getElementById('productFormCard').scrollIntoView({ behavior: 'smooth' });
  }

  // Photo upload handler
  document.getElementById('pPhoto').addEventListener('change', function() {
    const file = this.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { showToast('⚠️ Ukuran foto maksimal 2MB!', 'warn'); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      document.getElementById('pPhotoData').value = dataUrl;
      document.getElementById('photoPreview').src = dataUrl;
      document.getElementById('photoPreview').style.display = 'block';
      document.getElementById('photoPlaceholder').style.display = 'none';
      document.getElementById('removePhotoBtn').style.display = 'inline-flex';
    };
    reader.readAsDataURL(file);
  });

  window.removePhoto = function() {
    document.getElementById('pPhotoData').value = '';
    document.getElementById('pPhoto').value = '';
    resetPhotoPreview();
  };

  function resetPhotoPreview() {
    document.getElementById('photoPreview').style.display = 'none';
    document.getElementById('photoPlaceholder').style.display = 'flex';
    document.getElementById('removePhotoBtn').style.display = 'none';
    document.getElementById('photoPreview').src = '';
  }

  document.getElementById('saveProductBtn').addEventListener('click', () => {
    const name = document.getElementById('pName').value.trim();
    const category = document.getElementById('pCategory').value.trim();
    const price = parseInt(document.getElementById('pPrice').value);
    const emoji = document.getElementById('pEmoji').value.trim() || '🍽️';
    const desc = document.getElementById('pDesc').value.trim();
    const bestSeller = document.getElementById('pBestSeller').value === 'true';
    const image = document.getElementById('pPhotoData').value;

    if (!name || !category || !price || !desc) { showToast('⚠️ Lengkapi semua field!', 'warn'); return; }

    const products = YS.getProducts();
    if (editingId) {
      const idx = products.findIndex(p => p.id === editingId);
      if (idx !== -1) products[idx] = { ...products[idx], name, category, price, emoji, desc, bestSeller, image };
      showToast('✅ Produk berhasil diperbarui!', 'success');
    } else {
      products.push({ id: Date.now(), name, category, price, emoji, desc, bestSeller, image });
      showToast('✅ Produk berhasil ditambahkan!', 'success');
    }
    YS.saveProducts(products);
    document.getElementById('productFormCard').style.display = 'none';
    clearProductForm();
    renderProductsTable();
    renderDashboard();
  });

  function clearProductForm() {
    ['pName','pCategory','pPrice','pEmoji','pDesc'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('pBestSeller').value = 'false';
    document.getElementById('pPhotoData').value = '';
    document.getElementById('pPhoto').value = '';
    resetPhotoPreview();
    editingId = null;
  }

  // ===== DELETE PRODUCT =====
  window.confirmDelete = function(id) {
    const p = YS.getProducts().find(x => x.id === id);
    showConfirm(`Hapus "${p?.name}"?`, 'Produk akan dihapus permanen.', () => {
      YS.saveProducts(YS.getProducts().filter(x => x.id !== id));
      renderProductsTable(); renderDashboard();
      showToast('🗑️ Produk dihapus!', 'success');
    });
  };

  // ===== REVIEWS TABLE =====
  function renderReviewsTable() {
    const reviews = YS.getReviews();
    document.getElementById('reviewsTableBody').innerHTML = reviews.map(r => `
      <tr>
        <td><strong>${r.name}</strong></td>
        <td>${r.product}</td>
        <td class="stars-cell">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</td>
        <td style="max-width:220px;font-size:.88rem">${r.text}</td>
        <td style="white-space:nowrap">${r.date}</td>
        <td><button class="btn btn-sm btn-danger-sm" onclick="deleteReview(${r.id})">🗑️</button></td>
      </tr>`).join('') || `<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:2rem">Belum ada ulasan.</td></tr>`;
  }

  window.deleteReview = function(id) {
    showConfirm('Hapus ulasan?', 'Ulasan akan dihapus permanen.', () => {
      YS.saveReviews(YS.getReviews().filter(r => r.id !== id));
      renderReviewsTable(); renderDashboard();
      showToast('🗑️ Ulasan dihapus!', 'success');
    });
  };

  // ===== USERS TABLE =====
  function renderUsersTable() {
    const users = YS.getUsers_admin();
    document.getElementById('usersTableBody').innerHTML = users.length ? users.map((u, i) => `
      <tr>
        <td>${i + 1}</td>
        <td><strong>${u.username}</strong></td>
        <td>${u.email}</td>
        <td style="font-size:.85rem">${new Date(u.createdAt).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' })}</td>
        <td><button class="btn btn-sm btn-danger-sm" onclick="deleteUser(${u.id})">🗑️ Hapus</button></td>
      </tr>`).join('')
      : `<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:2rem">Belum ada pengguna terdaftar.</td></tr>`;
  }

  window.deleteUser = function(id) {
    showConfirm('Hapus pengguna?', 'Data pengguna akan dihapus permanen.', () => {
      YS.saveUsers(YS.getUsers_admin().filter(u => u.id !== id));
      renderUsersTable(); renderDashboard();
      showToast('🗑️ Pengguna dihapus!', 'success');
    });
  };

  // ===== SETTINGS =====
  function renderSettings() {
    const photo = YS.getAboutPhoto();
    const wrap = document.getElementById('aboutPhotoCurrentWrap');
    wrap.innerHTML = photo
      ? `<div class="about-photo-preview-admin"><img src="${photo}" alt="About photo"/><p>Foto saat ini</p></div>`
      : `<div class="about-photo-preview-admin empty"><span>🏠</span><p>Belum ada foto (menggunakan icon)</p></div>`;
  }

  // About photo upload
  document.getElementById('aboutPhotoInput').addEventListener('change', function() {
    const file = this.files[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { showToast('⚠️ Ukuran foto maksimal 3MB!', 'warn'); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      YS.saveAboutPhoto(e.target.result);
      renderSettings();
      showToast('✅ Foto Tentang Kami berhasil diperbarui!', 'success');
    };
    reader.readAsDataURL(file);
  });

  document.getElementById('removeAboutPhoto').addEventListener('click', () => {
    showConfirm('Hapus foto?', 'Foto "Tentang Kami" akan dihapus.', () => {
      YS.saveAboutPhoto('');
      renderSettings();
      showToast('🗑️ Foto dihapus!', 'success');
    });
  });

  // ===== CONFIRM MODAL =====
  let confirmCb = null;
  function showConfirm(title, msg, cb) {
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMsg').textContent = msg;
    confirmCb = cb;
    document.getElementById('confirmModal').style.display = 'flex';
  }
  document.getElementById('confirmOkBtn').addEventListener('click', () => {
    document.getElementById('confirmModal').style.display = 'none';
    confirmCb?.(); confirmCb = null;
  });
  document.getElementById('confirmCancelBtn').addEventListener('click', () => {
    document.getElementById('confirmModal').style.display = 'none';
    confirmCb = null;
  });
  document.getElementById('confirmModal').addEventListener('click', e => {
    if (e.target === document.getElementById('confirmModal'))
      document.getElementById('confirmModal').style.display = 'none';
  });

  // ===== TOAST =====
  window.showToast = function(msg, type = 'success') {
    const t = document.getElementById('toast');
    t.textContent = msg; t.className = `toast show ${type}`;
    setTimeout(() => t.className = 'toast', 3000);
  };

  // ===== INIT =====
  renderDashboard();
  renderProductsTable();
});
