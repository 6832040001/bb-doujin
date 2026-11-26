(function () {
  const STORAGE_BOOKMARKS = "bb_doujin_bookmarks";
  const STORAGE_HISTORY = "bb_doujin_history";
  const STORAGE_THEME = "bb_doujin_theme";
  const STORAGE_NOVEL_PREFS = "bb_doujin_novel_prefs";
  const STORAGE_CATALOG = "bb_doujin_catalog";
  const STORAGE_SETTINGS = "bb_doujin_settings";
  const STORAGE_ADMIN_AUTH = "bb_doujin_admin_auth";

  const ADMIN_USER = "Prct";
  const ADMIN_PASS = "Prct2522";

  const DEFAULT_CATALOG = JSON.parse(JSON.stringify(window.BB_CATALOG));
  const DEFAULT_SETTINGS = {
    siteName: "BB-DOUJIN",
    bannerText: "เว็บอ่านนิยาย Manhwa & Doujin 2026 อ่านฟรี โหลดไว ไม่มีโฆษณาบัง",
    bgPreset: "starfield",
    bgCustomUrl: ""
  };

  let heroIndex = 0;
  let heroTimer = null;
  let activePopularType = "all";
  let editingSeriesId = null;

  // Catalog & Settings persistence
  function loadCatalog() {
    try {
      const saved = localStorage.getItem(STORAGE_CATALOG);
      if (saved) window.BB_CATALOG = JSON.parse(saved);
    } catch (_) {}
  }

  function saveCatalog() {
    localStorage.setItem(STORAGE_CATALOG, JSON.stringify(window.BB_CATALOG));
  }

  function getSettings() {
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(STORAGE_SETTINGS) || "{}") };
    } catch (_) {
      return { ...DEFAULT_SETTINGS };
    }
  }

  function saveSettings(s) {
    localStorage.setItem(STORAGE_SETTINGS, JSON.stringify(s));
    applySiteSettings();
  }

  function applySiteSettings() {
    const s = getSettings();
    const banner = document.getElementById("topBanner");
    const logo = document.getElementById("siteLogoText");
    if (banner) banner.textContent = s.bannerText;
    if (logo) logo.textContent = s.siteName;

    document.body.classList.remove("bg-nebula", "bg-crimson", "bg-custom");
    document.body.style.backgroundImage = "";
    if (s.bgPreset === "nebula") {
      document.body.classList.add("bg-nebula");
    } else if (s.bgPreset === "crimson") {
      document.body.classList.add("bg-crimson");
    } else if (s.bgPreset === "custom" && s.bgCustomUrl) {
      document.body.classList.add("bg-custom");
      document.body.style.backgroundImage = `linear-gradient(rgba(10,10,14,0.72), rgba(10,10,14,0.82)), url('${s.bgCustomUrl}')`;
    }
  }

  function showToast(msg) {
    const el = document.createElement("div");
    el.className = "toast-msg";
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2600);
  }

  function readFileAsDataURL(file, cb) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => cb(ev.target.result);
    reader.readAsDataURL(file);
  }

  // State helpers
  const getBookmarks = () => JSON.parse(localStorage.getItem(STORAGE_BOOKMARKS) || "[]");
  const saveBookmarks = (list) => {
    localStorage.setItem(STORAGE_BOOKMARKS, JSON.stringify(list));
    updateBookmarkBadge();
  };

  const getHistory = () => JSON.parse(localStorage.getItem(STORAGE_HISTORY) || "{}");
  const markRead = (seriesId, chapter) => {
    const history = getHistory();
    if (!history[seriesId]) history[seriesId] = { last: chapter, read: [] };
    history[seriesId].last = chapter;
    if (!history[seriesId].read.includes(chapter)) {
      history[seriesId].read.push(chapter);
    }
    localStorage.setItem(STORAGE_HISTORY, JSON.stringify(history));
  };

  const getNovelPrefs = () =>
    JSON.parse(localStorage.getItem(STORAGE_NOVEL_PREFS) || '{"fontSize":18,"theme":"dark"}');
  const saveNovelPrefs = (prefs) =>
    localStorage.setItem(STORAGE_NOVEL_PREFS, JSON.stringify(prefs));

  function updateBookmarkBadge() {
    const el = document.getElementById("bookmarkCount");
    if (el) el.textContent = getBookmarks().length;
  }

  // Theme Toggle (DARK?)
  function initTheme() {
    const saved = localStorage.getItem(STORAGE_THEME) || "dark";
    document.documentElement.setAttribute("data-theme", saved);
    document.getElementById("themeToggle").addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme");
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem(STORAGE_THEME, next);
    });
  }

  // Render Stars
  function renderStars(score) {
    const full = Math.round(score / 2);
    return "★".repeat(full) + "☆".repeat(Math.max(0, 5 - full));
  }

  // Render single card (matching screenshot 7-col card)
  function createCardHTML(item) {
    return `
      <a href="#detail/${item.id}" class="series-card">
        <div class="card-cover-wrap">
          <img class="card-cover" src="${item.cover}" alt="${item.title}" loading="lazy" />
          <span class="type-badge ${item.type}">${item.type.toUpperCase()}</span>
          <span class="sub-badge">● ${item.badgeText}</span>
        </div>
        <h3 class="card-title">${item.title}</h3>
        <div class="card-chapter">ตอนที่ ${item.latestChapter}</div>
        <div class="card-rating">
          <span class="stars">${renderStars(item.rating)}</span>
          <span>${item.rating}</span>
        </div>
      </a>
    `;
  }

  // Hero Carousel
  function initHero() {
    const featured = window.BB_CATALOG.filter((s) => s.featured);
    const slider = document.getElementById("heroSlider");
    const dots = document.getElementById("heroDots");

    slider.innerHTML = featured
      .map(
        (item, idx) => `
        <div class="hero-slide ${idx === 0 ? "active" : ""}">
          <div class="hero-bg" style="background-image: url('${item.banner}')"></div>
          <div class="hero-gradient"></div>
          <div class="container hero-content">
            <a href="#detail/${item.id}">
              <h1 class="hero-title">${item.title}</h1>
            </a>
            <div class="hero-meta">
              <span class="hero-rating">${item.rating}</span>
              <span>ประเภท: <strong>${item.type}</strong></span>
              <span>• หมวดหมู่: ${item.genres.join(", ")}</span>
            </div>
            <p class="hero-synopsis">${item.synopsis}</p>
            <a href="#read/${item.id}/${item.latestChapter}" class="hero-cta">
              อ่านตอนล่าสุด (ตอนที่ ${item.latestChapter}) &rsaquo;
            </a>
          </div>
        </div>
      `
      )
      .join("");

    dots.innerHTML = featured
      .map(
        (_, idx) =>
          `<button class="hero-dot ${idx === 0 ? "active" : ""}" data-idx="${idx}" aria-label="สไลด์ ${idx + 1}"></button>`
      )
      .join("");

    const goSlide = (idx) => {
      heroIndex = (idx + featured.length) % featured.length;
      slider.querySelectorAll(".hero-slide").forEach((el, i) => el.classList.toggle("active", i === heroIndex));
      dots.querySelectorAll(".hero-dot").forEach((el, i) => el.classList.toggle("active", i === heroIndex));
    };

    document.getElementById("heroPrev").addEventListener("click", () => goSlide(heroIndex - 1));
    document.getElementById("heroNext").addEventListener("click", () => goSlide(heroIndex + 1));
    dots.addEventListener("click", (e) => {
      if (e.target.dataset.idx !== undefined) goSlide(Number(e.target.dataset.idx));
    });

    clearInterval(heroTimer);
    heroTimer = setInterval(() => goSlide(heroIndex + 1), 6000);
  }

  // Genre Bar & Filter Dropdown
  function initGenres() {
    const bar = document.getElementById("genreBarLinks");
    const select = document.getElementById("filterGenre");
    bar.innerHTML = window.BB_GENRES.slice(0, 8)
      .map((g) => `<a href="#browse/all/${encodeURIComponent(g)}" class="genre-pill">${g}</a>`)
      .join("");

    window.BB_GENRES.forEach((g) => {
      const opt = document.createElement("option");
      opt.value = g;
      opt.textContent = g;
      select.appendChild(opt);
    });
  }

  // Home Sections
  function renderPopular() {
    const grid = document.getElementById("popularGrid");
    const items = window.BB_CATALOG.filter(
      (s) => activePopularType === "all" || s.type === activePopularType
    ).slice(0, 7);
    grid.innerHTML = items.map(createCardHTML).join("");
  }

  function renderLatestAndSide() {
    const latestEl = document.getElementById("latestList");
    const latestItems = window.BB_CATALOG.slice(0, 6);
    latestEl.innerHTML = latestItems
      .map(
        (item) => `
      <div class="latest-item">
        <a href="#detail/${item.id}">
          <img class="latest-thumb" src="${item.cover}" alt="${item.title}" />
        </a>
        <div class="latest-info">
          <a href="#detail/${item.id}" class="latest-title">${item.title}</a>
          <div class="latest-chapters">
            <a href="#read/${item.id}/${item.latestChapter}" class="latest-ch-link">
              <span>ตอนที่ ${item.latestChapter}</span>
              <span>${item.updatedAt}</span>
            </a>
            <a href="#read/${item.id}/${Math.max(1, item.latestChapter - 1)}" class="latest-ch-link">
              <span>ตอนที่ ${Math.max(1, item.latestChapter - 1)}</span>
              <span>ก่อนหน้า</span>
            </a>
          </div>
        </div>
      </div>
    `
      )
      .join("");

    const sideEl = document.getElementById("sideRankList");
    const topNovelDoujin = window.BB_CATALOG.filter((s) => s.type !== "Manhwa")
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5);
    sideEl.innerHTML = topNovelDoujin
      .map(
        (item, idx) => `
      <a href="#detail/${item.id}" class="rank-item">
        <span class="rank-num">${idx + 1}</span>
        <img class="rank-thumb" src="${item.cover}" alt="${item.title}" />
        <div class="rank-info">
          <div class="rank-title">${item.title}</div>
          <div class="rank-sub">${item.type} • ตอนที่ ${item.latestChapter} • ★ ${item.rating}</div>
        </div>
      </a>
    `
      )
      .join("");
  }

  // Search
  function initSearch() {
    const input = document.getElementById("searchInput");
    const dropdown = document.getElementById("searchDropdown");

    const doFilter = () => {
      const q = input.value.trim().toLowerCase();
      if (!q) {
        dropdown.hidden = true;
        return;
      }
      const matches = window.BB_CATALOG.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.type.toLowerCase().includes(q) ||
          s.genres.some((g) => g.toLowerCase().includes(q))
      ).slice(0, 6);

      if (!matches.length) {
        dropdown.innerHTML = `<div style="padding:12px;font-size:0.84rem;color:var(--text-secondary)">ไม่พบเรื่อง "${input.value}"</div>`;
      } else {
        dropdown.innerHTML = matches
          .map(
            (m) => `
          <a href="#detail/${m.id}" class="search-item">
            <img src="${m.cover}" alt="${m.title}" />
            <div class="search-item-info">
              <div class="search-item-title">${m.title}</div>
              <div class="search-item-meta">${m.type} • ตอนที่ ${m.latestChapter} • ★ ${m.rating}</div>
            </div>
          </a>
        `
          )
          .join("");
      }
      dropdown.hidden = false;
    };

    input.addEventListener("input", doFilter);
    input.addEventListener("focus", doFilter);
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".search-box")) dropdown.hidden = true;
    });
    document.getElementById("searchBtn").addEventListener("click", () => {
      if (input.value.trim()) {
        dropdown.hidden = true;
        window.location.hash = `#browse/all/all/${encodeURIComponent(input.value.trim())}`;
      }
    });
  }

  // Browse View
  function renderBrowse(type = "all", genre = "all", query = "") {
    const typeSelect = document.getElementById("filterType");
    const genreSelect = document.getElementById("filterGenre");
    const sortSelect = document.getElementById("sortBy");

    typeSelect.value = type || "all";
    genreSelect.value = genre || "all";

    const applyFilters = () => {
      const t = typeSelect.value;
      const g = genreSelect.value;
      const sort = sortSelect.value;
      const q = query.toLowerCase();

      let list = window.BB_CATALOG.filter((s) => {
        if (t !== "all" && s.type !== t) return false;
        if (g !== "all" && !s.genres.includes(g)) return false;
        if (q && !s.title.toLowerCase().includes(q) && !s.synopsis.toLowerCase().includes(q)) return false;
        return true;
      });

      if (sort === "rating") list.sort((a, b) => b.rating - a.rating);
      else if (sort === "latest") list.sort((a, b) => b.latestChapter - a.latestChapter);

      document.getElementById("browseTitle").textContent = query
        ? `ผลการค้นหา: "${query}"`
        : t === "all"
        ? `คลังเรื่องทั้งหมด (${list.length})`
        : `${t} ทั้งหมด (${list.length})`;

      const grid = document.getElementById("browseGrid");
      const empty = document.getElementById("browseEmpty");
      grid.innerHTML = list.map(createCardHTML).join("");
      empty.hidden = list.length > 0;
    };

    typeSelect.onchange = applyFilters;
    genreSelect.onchange = applyFilters;
    sortSelect.onchange = applyFilters;
    applyFilters();
  }

  // Bookmark View
  function renderBookmarkView() {
    const ids = getBookmarks();
    const items = window.BB_CATALOG.filter((s) => ids.includes(s.id));
    document.getElementById("bookmarkGrid").innerHTML = items.map(createCardHTML).join("");
    document.getElementById("bookmarkEmpty").hidden = items.length > 0;
  }

  // Series Detail View
  function renderDetail(id) {
    const item = window.BB_CATALOG.find((s) => s.id === id);
    const container = document.getElementById("detailContainer");
    if (!item) {
      container.innerHTML = `<div class="empty-state">ไม่พบเรื่องที่ต้องการ <a href="#home" style="color:var(--accent-blue)">กลับหน้าแรก</a></div>`;
      return;
    }

    const bookmarks = getBookmarks();
    const isSaved = bookmarks.includes(item.id);
    const history = getHistory()[item.id];
    const readChapters = history ? history.read : [];
    const continueCh = history ? history.last : 1;

    // Build latest 24 chapters for clean list
    const chapters = [];
    const minCh = Math.max(1, item.latestChapter - 23);
    for (let c = item.latestChapter; c >= minCh; c--) {
      chapters.push(c);
    }

    container.innerHTML = `
      <div class="detail-card">
        <img class="detail-cover" src="${item.cover}" alt="${item.title}" />
        <div>
          <h1 class="detail-title">${item.title}</h1>
          <div class="detail-badges">
            <span class="pill">ประเภท: <strong>${item.type}</strong></span>
            <span class="pill">คะแนน: ★ ${item.rating}</span>
            <span class="pill">ตอนทั้งหมด: ${item.latestChapter}</span>
            ${item.genres.map((g) => `<a href="#browse/all/${encodeURIComponent(g)}" class="pill">${g}</a>`).join("")}
          </div>
          <p class="detail-synopsis">${item.synopsis}</p>
          <div class="detail-actions">
            <a href="#read/${item.id}/${continueCh}" class="btn-primary">
              ${history ? `อ่านต่อ (ตอนที่ ${continueCh})` : "เริ่มอ่านตอนที่ 1"}
            </a>
            <a href="#read/${item.id}/${item.latestChapter}" class="btn-secondary">
              ตอนล่าสุด (ตอนที่ ${item.latestChapter})
            </a>
            <button id="toggleBookmarkBtn" class="btn-secondary ${isSaved ? "bookmarked" : ""}" type="button">
              ${isSaved ? "✓ บันทึกใน Bookmark แล้ว" : "+ เพิ่มเข้า Bookmark"}
            </button>
          </div>
        </div>
      </div>

      <div class="panel-section">
        <div class="panel-header">
          <h2 class="panel-title">รายชื่อตอน (แสดง ${chapters.length} ตอนล่าสุด)</h2>
        </div>
        <div class="panel-body">
          <div class="chapters-grid">
            ${chapters
              .map(
                (ch) => `
              <a href="#read/${item.id}/${ch}" class="chapter-btn ${readChapters.includes(ch) ? "read" : ""}">
                <span>ตอนที่ ${ch}</span>
                <span style="font-size:0.75rem;color:var(--text-secondary)">${
                  readChapters.includes(ch) ? "อ่านแล้ว" : "อ่านเลย ›"
                }</span>
              </a>
            `
              )
              .join("")}
          </div>
        </div>
      </div>
    `;

    document.getElementById("toggleBookmarkBtn").addEventListener("click", (e) => {
      const list = getBookmarks();
      const idx = list.indexOf(item.id);
      if (idx === -1) {
        list.push(item.id);
        e.target.classList.add("bookmarked");
        e.target.textContent = "✓ บันทึกใน Bookmark แล้ว";
      } else {
        list.splice(idx, 1);
        e.target.classList.remove("bookmarked");
        e.target.textContent = "+ เพิ่มเข้า Bookmark";
      }
      saveBookmarks(list);
    });
  }

  // Reader View (Manhwa/Doujin Vertical Scroll OR Novel Text Mode)
  function renderReader(id, chNum) {
    const item = window.BB_CATALOG.find((s) => s.id === id);
    const container = document.getElementById("readerContainer");
    if (!item) {
      container.innerHTML = `<div class="empty-state">ไม่พบตอนที่ต้องการ</div>`;
      return;
    }

    const ch = Math.max(1, Math.min(item.latestChapter, Number(chNum) || 1));
    markRead(item.id, ch);

    const prevDisabled = ch <= 1 ? "disabled" : "";
    const nextDisabled = ch >= item.latestChapter ? "disabled" : "";

    let chapterOptions = "";
    const start = Math.max(1, ch - 15);
    const end = Math.min(item.latestChapter, ch + 15);
    for (let i = end; i >= start; i--) {
      chapterOptions += `<option value="${i}" ${i === ch ? "selected" : ""}>ตอนที่ ${i}</option>`;
    }

    const isNovel = item.type === "Novel";
    const prefs = getNovelPrefs();

    const novelControls = isNovel
      ? `
      <div class="reader-nav-group">
        <button class="reader-btn" id="fontDecBtn" type="button">A-</button>
        <button class="reader-btn" id="fontIncBtn" type="button">A+</button>
        <select class="reader-select" id="novelThemeSelect" aria-label="ธีมหน้าอ่านนิยาย">
          <option value="dark" ${prefs.theme === "dark" ? "selected" : ""}>พื้นหลังมืด</option>
          <option value="sepia" ${prefs.theme === "sepia" ? "selected" : ""}>กระดาษถนอมสายตา</option>
          <option value="light" ${prefs.theme === "light" ? "selected" : ""}>พื้นหลังสว่าง</option>
        </select>
      </div>`
      : "";

    const bodyHTML = isNovel
      ? `
      <article class="novel-stage ${prefs.theme}" id="novelStage" style="font-size:${prefs.fontSize}px">
        <h1 class="novel-chapter-heading">${item.title} — บทที่ ${ch}</h1>
        ${window.getSampleNovelText(item, ch).map((p) => `<p>${p}</p>`).join("")}
      </article>`
      : `
      <div class="webtoon-stage">
        ${window
          .getSampleMangaPages(item, ch)
          .map((src, i) => `<img class="webtoon-page" src="${src}" alt="หน้า ${i + 1}" />`)
          .join("")}
      </div>`;

    container.innerHTML = `
      <div class="reader-toolbar">
        <div class="container reader-toolbar-inner">
          <div class="reader-nav-group">
            <a href="#detail/${item.id}" class="reader-btn">&lsaquo; หน้ารวมตอน</a>
            <strong style="font-size:0.9rem">${item.title}</strong>
          </div>
          ${novelControls}
          <div class="reader-nav-group">
            <button class="reader-btn" id="prevChBtn" ${prevDisabled}>&lsaquo; ตอนก่อน</button>
            <select class="reader-select" id="chSelect">${chapterOptions}</select>
            <button class="reader-btn" id="nextChBtn" ${nextDisabled}>ตอนถัดไป &rsaquo;</button>
          </div>
        </div>
      </div>
      <div class="container">
        ${bodyHTML}
      </div>
    `;

    document.getElementById("prevChBtn").onclick = () => {
      if (ch > 1) window.location.hash = `#read/${item.id}/${ch - 1}`;
    };
    document.getElementById("nextChBtn").onclick = () => {
      if (ch < item.latestChapter) window.location.hash = `#read/${item.id}/${ch + 1}`;
    };
    document.getElementById("chSelect").onchange = (e) => {
      window.location.hash = `#read/${item.id}/${e.target.value}`;
    };

    if (isNovel) {
      const stage = document.getElementById("novelStage");
      document.getElementById("fontDecBtn").onclick = () => {
        prefs.fontSize = Math.max(14, prefs.fontSize - 2);
        stage.style.fontSize = prefs.fontSize + "px";
        saveNovelPrefs(prefs);
      };
      document.getElementById("fontIncBtn").onclick = () => {
        prefs.fontSize = Math.min(28, prefs.fontSize + 2);
        stage.style.fontSize = prefs.fontSize + "px";
        saveNovelPrefs(prefs);
      };
      document.getElementById("novelThemeSelect").onchange = (e) => {
        stage.classList.remove("dark", "sepia", "light");
        stage.classList.add(e.target.value);
        prefs.theme = e.target.value;
        saveNovelPrefs(prefs);
      };
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Router
  function handleRoute() {
    const hash = window.location.hash || "#home";
    const parts = hash.slice(1).split("/");
    const route = parts[0] || "home";

    document.querySelectorAll(".view").forEach((v) => (v.hidden = true));
    document.querySelectorAll(".nav-link").forEach((n) => n.classList.remove("active"));
    document.getElementById("mobileNav").hidden = true;

    if (route === "browse") {
      document.getElementById("view-browse").hidden = false;
      const type = parts[1] ? decodeURIComponent(parts[1]) : "all";
      const genre = parts[2] ? decodeURIComponent(parts[2]) : "all";
      const query = parts[3] ? decodeURIComponent(parts[3]) : "";
      const activeNav = document.querySelector(`.nav-link[data-nav="${type}"]`);
      if (activeNav) activeNav.classList.add("active");
      renderBrowse(type, genre, query);
    } else if (route === "bookmark") {
      document.getElementById("view-bookmark").hidden = false;
      document.querySelector('.nav-link[data-nav="bookmark"]')?.classList.add("active");
      renderBookmarkView();
    } else if (route === "detail") {
      document.getElementById("view-detail").hidden = false;
      renderDetail(parts[1]);
    } else if (route === "read") {
      document.getElementById("view-reader").hidden = false;
      renderReader(parts[1], parts[2]);
    } else if (route === "admin") {
      document.getElementById("view-admin").hidden = false;
      document.querySelector('.nav-link[data-nav="admin"]')?.classList.add("active");
      renderAdmin();
    } else {
      document.getElementById("view-home").hidden = false;
    }

    window.scrollTo({ top: 0 });
  }

  // Admin Dashboard
  function renderAdmin() {
    const container = document.getElementById("adminContainer");
    if (sessionStorage.getItem(STORAGE_ADMIN_AUTH) !== "true") {
      container.innerHTML = `
        <div class="admin-login-box">
          <h1 class="admin-login-title">🔐 เข้าสู่ระบบ Admin</h1>
          <p class="admin-login-sub">กรุณากรอกชื่อผู้ใช้และรหัสผ่านเพื่อจัดการระบบหลังบ้าน</p>
          <form class="admin-form" id="adminLoginForm">
            <div class="form-group">
              <label for="adminUserInput">ชื่อผู้ใช้ (Username)</label>
              <input type="text" id="adminUserInput" placeholder="กรอกชื่อผู้ใช้" autocomplete="username" required />
            </div>
            <div class="form-group">
              <label for="adminPassInput">รหัสผ่าน (Password)</label>
              <input type="password" id="adminPassInput" placeholder="กรอกรหัสผ่าน" autocomplete="current-password" required />
            </div>
            <p class="admin-login-err" id="adminLoginErr" hidden>ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง</p>
            <button type="submit" class="btn-primary" style="justify-content:center;margin-top:4px">เข้าสู่ระบบ</button>
          </form>
        </div>
      `;
      document.getElementById("adminLoginForm").addEventListener("submit", (e) => {
        e.preventDefault();
        const u = document.getElementById("adminUserInput").value.trim();
        const p = document.getElementById("adminPassInput").value;
        if (u === ADMIN_USER && p === ADMIN_PASS) {
          sessionStorage.setItem(STORAGE_ADMIN_AUTH, "true");
          renderAdmin();
          showToast("เข้าสู่ระบบ Admin สำเร็จ");
        } else {
          document.getElementById("adminLoginErr").hidden = false;
        }
      });
      return;
    }

    const settings = getSettings();
    const editingItem = editingSeriesId
      ? window.BB_CATALOG.find((s) => s.id === editingSeriesId)
      : null;

    const defaultCover =
      editingItem?.cover ||
      "data:image/svg+xml;charset=UTF-8," +
        encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="300"><rect width="200" height="300" fill="#1e293b"/><text x="100" y="155" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="14">Preview ปก</text></svg>`
        );

    container.innerHTML = `
      <div class="admin-grid">
        <!-- Left Column: Site & Background Settings + Series Form -->
        <div>
          <section class="panel-section">
            <div class="panel-header">
              <h2 class="panel-title">🎨 ตกแต่งพื้นหลัง &amp; ตั้งค่าเว็บ</h2>
              <button class="btn-sm danger" id="adminLogoutBtn" type="button">ออกจากระบบ</button>
            </div>
            <div class="panel-body">
              <form class="admin-form" id="siteSettingsForm">
                <div class="form-row">
                  <div class="form-group">
                    <label>ชื่อเว็บ (Logo)</label>
                    <input type="text" id="setSiteName" value="${settings.siteName}" required />
                  </div>
                  <div class="form-group">
                    <label>ธีมพื้นหลัง (Background)</label>
                    <select id="setBgPreset">
                      <option value="starfield" ${settings.bgPreset === "starfield" ? "selected" : ""}>Starfield (ดวงดาวอวกาศ)</option>
                      <option value="nebula" ${settings.bgPreset === "nebula" ? "selected" : ""}>Cyber Nebula (เนบิวลาน้ำเงิน-ม่วง)</option>
                      <option value="crimson" ${settings.bgPreset === "crimson" ? "selected" : ""}>Crimson Dark (แดงเข้มดาร์ก)</option>
                      <option value="custom" ${settings.bgPreset === "custom" ? "selected" : ""}>รูปภาพพื้นหลังกำหนดเอง</option>
                    </select>
                  </div>
                </div>

                <div class="form-group">
                  <label>ข้อความแถบประกาศด้านบน (Top Banner)</label>
                  <input type="text" id="setBannerText" value="${settings.bannerText}" />
                </div>

                <div class="form-group">
                  <label>URL รูปพื้นหลัง หรืออัปโหลดไฟล์รูป (ใช้เมื่อเลือก "รูปภาพพื้นหลังกำหนดเอง")</label>
                  <input type="text" id="setBgCustomUrl" placeholder="https://... หรืออัปโหลดไฟล์ด้านล่าง" value="${settings.bgCustomUrl || ""}" />
                  <input type="file" id="setBgFile" accept="image/*" />
                </div>

                <button type="submit" class="btn-primary">บันทึกการตั้งค่าเว็บ &amp; พื้นหลัง</button>
              </form>
            </div>
          </section>

          <section class="panel-section">
            <div class="panel-header">
              <h2 class="panel-title">${editingItem ? "✏️ แก้ไขเรื่อง: " + editingItem.title : "➕ เพิ่มเรื่องใหม่"}</h2>
              ${editingItem ? `<button class="btn-sm" id="cancelEditBtn" type="button">ยกเลิกแก้ไข</button>` : ""}
            </div>
            <div class="panel-body">
              <form class="admin-form" id="seriesForm">
                <div class="form-group">
                  <label>ชื่อเรื่อง</label>
                  <input type="text" id="fTitle" required placeholder="เช่น Solo Leveling" value="${editingItem ? editingItem.title : ""}" />
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>ประเภท</label>
                    <select id="fType">
                      <option value="Manhwa" ${editingItem?.type === "Manhwa" ? "selected" : ""}>Manhwa</option>
                      <option value="Novel" ${editingItem?.type === "Novel" ? "selected" : ""}>Novel (นิยาย)</option>
                      <option value="Doujin" ${editingItem?.type === "Doujin" ? "selected" : ""}>Doujin</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>ป้ายกำกับมุมล่าง (เช่น COLOR, THAI, NC)</label>
                    <input type="text" id="fBadge" value="${editingItem ? editingItem.badgeText : "COLOR"}" />
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>จำนวนตอนล่าสุด</label>
                    <input type="number" id="fChapter" min="1" value="${editingItem ? editingItem.latestChapter : 1}" required />
                  </div>
                  <div class="form-group">
                    <label>คะแนน (0 - 10)</label>
                    <input type="number" id="fRating" step="0.1" min="0" max="10" value="${editingItem ? editingItem.rating : 8.5}" required />
                  </div>
                </div>

                <div class="form-group">
                  <label>หมวดหมู่ (คั่นด้วยลูกน้ำ ,)</label>
                  <input type="text" id="fGenres" placeholder="Action, Fantasy, Romance" value="${editingItem ? editingItem.genres.join(", ") : "Action, Fantasy"}" />
                </div>

                <div class="form-group">
                  <label>รูปปก (ใส่ URL หรืออัปโหลดรูปจากเครื่อง)</label>
                  <div class="cover-preview-box">
                    <img id="fCoverPreview" src="${defaultCover}" alt="Preview" />
                    <div style="flex:1;display:flex;flex-direction:column;gap:6px">
                      <input type="text" id="fCoverUrl" placeholder="วาง URL รูปปก หรืออัปโหลดไฟล์" value="${editingItem ? editingItem.cover : ""}" />
                      <input type="file" id="fCoverFile" accept="image/*" />
                    </div>
                  </div>
                </div>

                <div class="form-group">
                  <label>เรื่องย่อ</label>
                  <textarea id="fSynopsis" rows="3" placeholder="ใส่เรื่องย่อ...">${editingItem ? editingItem.synopsis : ""}</textarea>
                </div>

                <label style="display:flex;align-items:center;gap:8px;font-size:0.85rem;cursor:pointer">
                  <input type="checkbox" id="fFeatured" ${editingItem?.featured ? "checked" : ""} />
                  แสดงในแบนเนอร์สไลด์ด้านบน (Hero Featured)
                </label>

                <button type="submit" class="btn-primary">
                  ${editingItem ? "บันทึกการแก้ไขเรื่อง" : "+ เพิ่มเรื่องเข้าคลัง"}
                </button>
              </form>
            </div>
          </section>
        </div>

        <!-- Right Column: Catalog Manager -->
        <section class="panel-section">
          <div class="panel-header">
            <h2 class="panel-title">📚 จัดการรายการเรื่องทั้งหมด (${window.BB_CATALOG.length})</h2>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              <button class="btn-sm primary" id="addNewSeriesQuickBtn" type="button">+ เพิ่มเรื่องใหม่</button>
              <button class="btn-sm" id="exportJsonBtn" type="button">Export JSON</button>
              <button class="btn-sm danger" id="resetCatalogBtn" type="button">รีเซ็ตค่าเริ่มต้น</button>
            </div>
          </div>
          <div class="panel-body">
            <div class="admin-table-list">
              ${window.BB_CATALOG.map(
                (s) => `
                <div class="admin-series-row">
                  <div class="admin-series-left">
                    <img src="${s.cover}" alt="${s.title}" />
                    <div style="min-width:0">
                      <div class="admin-series-title">${s.title}</div>
                      <div class="admin-series-meta">${s.type} • ตอนที่ ${s.latestChapter} • ★ ${s.rating} ${s.featured ? "• ⭐ Hero" : ""}</div>
                    </div>
                  </div>
                  <div class="admin-row-actions">
                    <a href="#detail/${s.id}" class="btn-sm">ดูหน้าเรื่อง</a>
                    <button class="btn-sm edit-series-btn" data-id="${s.id}" type="button">แก้ไข</button>
                    <button class="btn-sm danger del-series-btn" data-id="${s.id}" type="button">ลบ</button>
                  </div>
                </div>
              `
              ).join("")}
            </div>
          </div>
        </section>
      </div>
    `;

    // Logout
    document.getElementById("adminLogoutBtn").addEventListener("click", () => {
      sessionStorage.removeItem(STORAGE_ADMIN_AUTH);
      renderAdmin();
      showToast("ออกจากระบบ Admin แล้ว");
    });

    // Quick "+ เพิ่มเรื่องใหม่" button next to Export JSON
    document.getElementById("addNewSeriesQuickBtn").addEventListener("click", () => {
      if (editingSeriesId) {
        editingSeriesId = null;
        renderAdmin();
      }
      const formEl = document.getElementById("seriesForm");
      formEl?.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => document.getElementById("fTitle")?.focus(), 250);
    });

    // Wire Site Settings Form
    document.getElementById("setBgFile").addEventListener("change", (e) => {
      readFileAsDataURL(e.target.files[0], (dataUrl) => {
        document.getElementById("setBgCustomUrl").value = dataUrl;
        document.getElementById("setBgPreset").value = "custom";
      });
    });

    document.getElementById("siteSettingsForm").addEventListener("submit", (e) => {
      e.preventDefault();
      saveSettings({
        siteName: document.getElementById("setSiteName").value.trim() || "BB-DOUJIN",
        bannerText: document.getElementById("setBannerText").value.trim(),
        bgPreset: document.getElementById("setBgPreset").value,
        bgCustomUrl: document.getElementById("setBgCustomUrl").value.trim()
      });
      showToast("บันทึกการตั้งค่าเว็บและพื้นหลังแล้ว!");
    });

    // Wire Cover Upload & Preview
    document.getElementById("fCoverFile").addEventListener("change", (e) => {
      readFileAsDataURL(e.target.files[0], (dataUrl) => {
        document.getElementById("fCoverUrl").value = dataUrl;
        document.getElementById("fCoverPreview").src = dataUrl;
      });
    });
    document.getElementById("fCoverUrl").addEventListener("input", (e) => {
      if (e.target.value.trim()) {
        document.getElementById("fCoverPreview").src = e.target.value.trim();
      }
    });

    // Wire Cancel Edit
    document.getElementById("cancelEditBtn")?.addEventListener("click", () => {
      editingSeriesId = null;
      renderAdmin();
    });

    // Wire Add / Edit Series Form
    document.getElementById("seriesForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const title = document.getElementById("fTitle").value.trim();
      const type = document.getElementById("fType").value;
      const badgeText = document.getElementById("fBadge").value.trim() || "COLOR";
      const latestChapter = Number(document.getElementById("fChapter").value) || 1;
      const rating = Number(document.getElementById("fRating").value) || 8.0;
      const genres = document
        .getElementById("fGenres")
        .value.split(",")
        .map((g) => g.trim())
        .filter(Boolean);
      const cover = document.getElementById("fCoverUrl").value.trim() || defaultCover;
      const synopsis = document.getElementById("fSynopsis").value.trim() || "ยังไม่มีเรื่องย่อ";
      const featured = document.getElementById("fFeatured").checked;

      if (editingSeriesId) {
        const idx = window.BB_CATALOG.findIndex((s) => s.id === editingSeriesId);
        if (idx !== -1) {
          window.BB_CATALOG[idx] = {
            ...window.BB_CATALOG[idx],
            title,
            type,
            badgeText,
            latestChapter,
            rating,
            genres: genres.length ? genres : ["Action"],
            cover,
            synopsis,
            featured,
            updatedAt: "เมื่อสักครู่"
          };
        }
        editingSeriesId = null;
        showToast("อัปเดตข้อมูลเรื่องเรียบร้อย!");
      } else {
        const newId =
          title
            .toLowerCase()
            .replace(/[^a-z0-9ก-๙]+/g, "-")
            .replace(/^-|-$/g, "") +
          "-" +
          Date.now().toString(36);
        window.BB_CATALOG.unshift({
          id: newId,
          title,
          type,
          badgeText,
          latestChapter,
          rating,
          featured,
          updatedAt: "เมื่อสักครู่",
          genres: genres.length ? genres : ["Action"],
          cover,
          banner: cover,
          synopsis
        });
        showToast("เพิ่มเรื่องใหม่เข้าคลังเรียบร้อย!");
      }

      saveCatalog();
      initHero();
      renderPopular();
      renderLatestAndSide();
      renderAdmin();
    });

    // Wire Edit & Delete buttons
    container.querySelectorAll(".edit-series-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        editingSeriesId = btn.dataset.id;
        renderAdmin();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });

    container.querySelectorAll(".del-series-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!confirm("ต้องการลบเรื่องนี้ออกจากคลังใช่หรือไม่?")) return;
        window.BB_CATALOG = window.BB_CATALOG.filter((s) => s.id !== btn.dataset.id);
        if (editingSeriesId === btn.dataset.id) editingSeriesId = null;
        saveCatalog();
        initHero();
        renderPopular();
        renderLatestAndSide();
        renderAdmin();
        showToast("ลบเรื่องเรียบร้อยแล้ว");
      });
    });

    // Export & Reset
    document.getElementById("exportJsonBtn").addEventListener("click", () => {
      const blob = new Blob([JSON.stringify(window.BB_CATALOG, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "bb-doujin-catalog.json";
      a.click();
      URL.revokeObjectURL(url);
    });

    document.getElementById("resetCatalogBtn").addEventListener("click", () => {
      if (!confirm("รีเซ็ตข้อมูลเรื่องทั้งหมดและพื้นหลังกลับเป็นค่าเริ่มต้น?")) return;
      localStorage.removeItem(STORAGE_CATALOG);
      localStorage.removeItem(STORAGE_SETTINGS);
      window.BB_CATALOG = JSON.parse(JSON.stringify(DEFAULT_CATALOG));
      editingSeriesId = null;
      applySiteSettings();
      initHero();
      renderPopular();
      renderLatestAndSide();
      renderAdmin();
      showToast("รีเซ็ตข้อมูลเป็นค่าเริ่มต้นแล้ว");
    });
  }

  // Init
  document.addEventListener("DOMContentLoaded", () => {
    loadCatalog();
    applySiteSettings();
    initTheme();
    updateBookmarkBadge();
    initHero();
    initGenres();
    renderPopular();
    renderLatestAndSide();
    initSearch();

    document.getElementById("popularTabs").addEventListener("click", (e) => {
      if (!e.target.classList.contains("tab-btn")) return;
      document.querySelectorAll("#popularTabs .tab-btn").forEach((b) => b.classList.remove("active"));
      e.target.classList.add("active");
      activePopularType = e.target.dataset.type;
      renderPopular();
    });

    document.getElementById("clearBookmarksBtn").addEventListener("click", () => {
      saveBookmarks([]);
      renderBookmarkView();
    });

    document.getElementById("mobileMenuBtn").addEventListener("click", () => {
      const m = document.getElementById("mobileNav");
      m.hidden = !m.hidden;
    });

    window.addEventListener("hashchange", handleRoute);
    handleRoute();
  });
})();
