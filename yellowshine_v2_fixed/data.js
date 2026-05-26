// ============================
// YELLOWSHINE DATA LAYER v2
// ============================

const YS = {
  get(key) { try { return JSON.parse(localStorage.getItem('ys_' + key)); } catch { return null; } },
  set(key, val) { localStorage.setItem('ys_' + key, JSON.stringify(val)); },

  defaultProducts: [
    { id: 1, name: "Korean Corndog Original", category: "Corndog", price: 12000, emoji: "🌭", image: "", desc: "Corndog klasik dengan sosis crispy berlapis adonan tepung istimewa, tekstur luar renyah dalam lembut.", bestSeller: true },
    { id: 2, name: "Korean Corndog Mozarella", category: "Corndog", price: 15000, emoji: "🧀", image: "", desc: "Corndog isi mozarella leleh yang super stretchy! Favoritnya anak-anak dan pecinta keju.", bestSeller: true },
    { id: 3, name: "Tteokbokki Original", category: "Tteokbokki", price: 13000, emoji: "🍢", image: "", desc: "Kue beras kenyal dalam saus gochujang pedas manis khas Korea, disajikan panas dan segar.", bestSeller: true },
    { id: 4, name: "Tteokbokki Keju", category: "Tteokbokki", price: 15000, emoji: "🧡", image: "", desc: "Tteokbokki pedas manis topped dengan keju leleh yang gurih, paduan sempurna!", bestSeller: false },
    { id: 5, name: "Hotteok Coklat", category: "Hotteok", price: 8000, emoji: "🥞", image: "", desc: "Pancake Korea berisi coklat manis hangat, renyah di luar lembut di dalam.", bestSeller: false },
    { id: 6, name: "Hotteok Kacang", category: "Hotteok", price: 8000, emoji: "🥜", image: "", desc: "Pancake Korea isi kacang tanah cincang manis, camilan favorit musim dingin Korea.", bestSeller: false },
    { id: 7, name: "Ramyeon Kuah", category: "Ramyeon", price: 18000, emoji: "🍜", image: "", desc: "Mie instan Korea original dengan kuah kaldu yang rich dan topping seblak.", bestSeller: false },
    { id: 8, name: "Eomuk (Fishcake)", category: "Snack", price: 5000, emoji: "🐟", image: "", desc: "Kue ikan Korea tusuk dalam kaldu hangat, camilan jalanan paling populer di Korea.", bestSeller: false },
    { id: 9, name: "Kimbap Mini", category: "Kimbap", price: 12000, emoji: "🍱", image: "", desc: "Nasi gulung Korea mini isi sayuran dan telur, makan siang yang ringan dan mengenyangkan.", bestSeller: false },
    { id: 10, name: "Gyeranppang", category: "Snack", price: 7000, emoji: "🍳", image: "", desc: "Roti telur Korea - telur matang di dalam roti manis hangat, breakfast klasik Korea.", bestSeller: true },
    { id: 11, name: "Banana Milk Korea", category: "Minuman", price: 8000, emoji: "🍌", image: "", desc: "Susu pisang Korea yang creamy dan manis, minuman ikonik yang populer di seluruh Asia.", bestSeller: false },
    { id: 12, name: "Dalgona Coffee", category: "Minuman", price: 10000, emoji: "☕", image: "", desc: "Kopi whip viral asal Korea yang creamy dan bittersweet, cocok di segala suasana.", bestSeller: true },
  ],

  defaultReviews: [
    { id: 1, name: "Siti Rahayu", product: "Korean Corndog Mozarella", rating: 5, text: "Wah kejunya meleleh banget! Enak parah, langsung jadi favorit 😍", date: "2025-04-01" },
    { id: 2, name: "Budi Santoso", product: "Tteokbokki Original", rating: 5, text: "Pedesnya pas, kenyal-kenyal enak. Beli lagi pasti!", date: "2025-04-10" },
    { id: 3, name: "Aulia Putri", product: "Dalgona Coffee", rating: 4, text: "Kopi dalgona-nya mantap, mirip yang viral di TikTok hehe 🙌", date: "2025-04-15" },
    { id: 4, name: "Rizky Firmansyah", product: "Gyeranppang", rating: 5, text: "Murah meriah, rasanya authentic banget! Udah 3x beli 😄", date: "2025-04-20" },
    { id: 5, name: "Dina Fitriani", product: "Korean Corndog Original", rating: 5, text: "Renyahnya perfect! Recommended banget buat yang belum coba ✨", date: "2025-04-28" },
  ],

  getProducts() { return this.get('products') || this.defaultProducts; },
  saveProducts(p) { this.set('products', p); },
  getReviews() { return this.get('reviews') || this.defaultReviews; },
  saveReviews(r) { this.set('reviews', r); },
  getAboutPhoto() { return this.get('about_photo') || ''; },
  saveAboutPhoto(d) { this.set('about_photo', d); },
  formatRp(n) { return 'Rp ' + Number(n).toLocaleString('id-ID'); },

  // ===== ADMIN AUTH =====
  ADMIN_USER: 'admin',
  ADMIN_PASS: 'yellowshine123',
  isAdminLoggedIn() { return sessionStorage.getItem('ys_admin') === 'true'; },
  adminLogin(u, p) {
    if (u === this.ADMIN_USER && p === this.ADMIN_PASS) {
      sessionStorage.setItem('ys_admin', 'true');
      sessionStorage.removeItem('ys_user');
      return true;
    }
    return false;
  },

  // ===== USER AUTH =====
  getUsers() { return this.get('users') || []; },
  saveUsers(u) { this.set('users', u); },
  registerUser(username, email, password) {
    const users = this.getUsers();
    if (users.find(u => u.username === username || u.email === email)) return { ok: false, msg: 'Username atau email sudah dipakai!' };
    users.push({ id: Date.now(), username, email, password, createdAt: new Date().toISOString() });
    this.saveUsers(users);
    return { ok: true };
  },
  userLogin(usernameOrEmail, password) {
    const user = this.getUsers().find(u => (u.username === usernameOrEmail || u.email === usernameOrEmail) && u.password === password);
    if (user) {
      sessionStorage.setItem('ys_user', JSON.stringify({ id: user.id, username: user.username, email: user.email }));
      sessionStorage.removeItem('ys_admin');
      return user;
    }
    return null;
  },
  getCurrentUser() { try { return JSON.parse(sessionStorage.getItem('ys_user')); } catch { return null; } },
  isUserLoggedIn() { return !!this.getCurrentUser(); },
  logout() { sessionStorage.removeItem('ys_admin'); sessionStorage.removeItem('ys_user'); },
  getUsers_admin() { return this.get('users') || []; }
};
