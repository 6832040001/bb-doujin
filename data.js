// Helper to generate stylized SVG cover artwork (offline-safe, zero broken images)
function makeCover(title, subtitle, c1, c2, accent) {
  const safeTitle = title.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const safeSub = subtitle.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${c1}"/>
        <stop offset="100%" stop-color="${c2}"/>
      </linearGradient>
      <radialGradient id="glow" cx="50%" cy="38%" r="55%">
        <stop offset="0%" stop-color="${accent}" stop-opacity="0.55"/>
        <stop offset="100%" stop-color="${c2}" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="400" height="600" fill="url(#bg)"/>
    <rect width="400" height="600" fill="url(#glow)"/>
    <circle cx="200" cy="210" r="115" fill="none" stroke="${accent}" stroke-width="2" stroke-opacity="0.45"/>
    <path d="M80 420 L200 130 L320 420 Z" fill="${accent}" fill-opacity="0.12" stroke="${accent}" stroke-opacity="0.35"/>
    <rect x="0" y="420" width="400" height="180" fill="rgba(0,0,0,0.68)"/>
    <text x="200" y="475" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="24" font-weight="800">${safeTitle}</text>
    <text x="200" y="510" text-anchor="middle" fill="${accent}" font-family="sans-serif" font-size="16" font-weight="600">${safeSub}</text>
  </svg>`;
  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}

// Helper to generate stylized SVG hero backdrop
function makeBanner(c1, c2, accent) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="420" viewBox="0 0 1400 420">
    <defs>
      <linearGradient id="b" x1="0" y1="0" x2="1" y2="0.8">
        <stop offset="0%" stop-color="${c1}"/>
        <stop offset="50%" stop-color="${c2}"/>
        <stop offset="100%" stop-color="#09090c"/>
      </linearGradient>
    </defs>
    <rect width="1400" height="420" fill="url(#b)"/>
    <circle cx="960" cy="180" r="240" fill="${accent}" fill-opacity="0.16"/>
    <path d="M700 420 L940 40 L1180 420 Z" fill="${accent}" fill-opacity="0.12"/>
    <line x1="650" y1="0" x2="650" y2="420" stroke="rgba(255,255,255,0.08)" stroke-width="4"/>
    <line x1="1080" y1="0" x2="1080" y2="420" stroke="rgba(255,255,255,0.08)" stroke-width="4"/>
  </svg>`;
  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}

// Helper to generate sample manga/doujin vertical panels
function makeMangaPage(seriesTitle, chapterNum, pageNum, accent) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="760" height="1060" viewBox="0 0 760 1060">
    <rect width="760" height="1060" fill="#12131a"/>
    <rect x="28" y="28" width="704" height="320" rx="8" fill="#1d1f2b" stroke="#33374d" stroke-width="3"/>
    <circle cx="220" cy="188" r="90" fill="${accent}" fill-opacity="0.22"/>
    <rect x="420" y="70" width="270" height="84" rx="22" fill="#ffffff"/>
    <text x="555" y="108" text-anchor="middle" fill="#111" font-family="sans-serif" font-size="20" font-weight="700">${seriesTitle}</text>
    <text x="555" y="136" text-anchor="middle" fill="#444" font-family="sans-serif" font-size="16">ตอนที่ ${chapterNum} • หน้า ${pageNum}</text>

    <rect x="28" y="370" width="340" height="320" rx="8" fill="#191b26" stroke="#33374d" stroke-width="3"/>
    <polygon points="80,650 198,420 316,650" fill="${accent}" fill-opacity="0.35"/>
    <rect x="392" y="370" width="340" height="320" rx="8" fill="#1e2030" stroke="#33374d" stroke-width="3"/>
    <rect x="430" y="420" width="250" height="72" rx="18" fill="#ffffff"/>
    <text x="555" y="462" text-anchor="middle" fill="#111" font-family="sans-serif" font-size="18" font-weight="700">"พลังนี้มัน... เกินคาด!"</text>

    <rect x="28" y="712" width="704" height="320" rx="8" fill="#161822" stroke="${accent}" stroke-width="3"/>
    <text x="380" y="885" text-anchor="middle" fill="${accent}" font-family="sans-serif" font-size="42" font-weight="900">ฟุ่บ! — ปัง!!</text>
    <text x="380" y="995" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="15">ตัวอย่างหน้าอ่าน Manhwa / Doujin (หน้า ${pageNum} / 3)</text>
  </svg>`;
  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}

window.BB_GENRES = [
  "Action", "Adult", "Adventure", "Comedy", "Drama", "Ecchi", "Fantasy", "Martial Arts", "Romance", "Sci-Fi"
];

window.BB_CATALOG = [
  {
    id: "nano-machine",
    title: "Nano Machine นาโนมาชิน",
    type: "Manhwa",
    badgeText: "COLOR",
    latestChapter: 339,
    rating: 8.1,
    featured: true,
    updatedAt: "15 นาทีที่แล้ว",
    genres: ["Action", "Adventure", "Fantasy", "Martial Arts", "Sci-Fi"],
    cover: makeCover("NANO MACHINE", "นาโนมาชิน", "#1e1b4b", "#09090b", "#38bdf8"),
    banner: makeBanner("#1e1b4b", "#31102f", "#38bdf8"),
    synopsis: "เรื่องย่อ Nano Machine นาโนมาชิน — ชอนยออู ลูกนอกสมรสแห่งพรรคมารที่ถูกดูแคลนมาตลอดชีวิต จนกระทั่งทายาทจากอนาคตได้ฉีดนาโนมาชินรุ่นที่ 7 เข้าสู่ร่างกายของเขา เปลี่ยนชะตากรรมสู่จุดสูงสุดแห่งยุทธภพ"
  },
  {
    id: "overgeared",
    title: "Overgeared จ้าวแห่งยุทธภัณฑ์",
    type: "Manhwa",
    badgeText: "COLOR",
    latestChapter: 347,
    rating: 7.8,
    featured: true,
    updatedAt: "32 นาทีที่แล้ว",
    genres: ["Action", "Adventure", "Comedy", "Fantasy"],
    cover: makeCover("OVERGEARED", "จ้าวแห่งยุทธภัณฑ์", "#3b0764", "#09090b", "#a855f7"),
    banner: makeBanner("#2e1065", "#0f172a", "#a855f7"),
    synopsis: "ชินยองอู ผู้เล่นเกม VRMMORPG ที่โชคร้ายที่สุดในโลก บังเอิญได้พบกับคลาสในตำนาน 'ผู้สืบทอดแห่งแพ็กมา' และเริ่มต้นเส้นทางช่างตีเหล็กในตำนาน"
  },
  {
    id: "unrivaled-spear-ghost",
    title: "Unrivaled Spear Ghost ยอดทวนไร้เทียมทาน",
    type: "Manhwa",
    badgeText: "COLOR",
    latestChapter: 60,
    rating: 7.0,
    featured: false,
    updatedAt: "1 ชั่วโมงที่แล้ว",
    genres: ["Action", "Martial Arts", "Drama"],
    cover: makeCover("SPEAR GHOST", "ยอดทวนไร้เทียมทาน", "#450a0a", "#09090b", "#ef4444"),
    banner: makeBanner("#450a0a", "#18181b", "#ef4444"),
    synopsis: "ยอดฝีมือผู้ใช้ทวนที่ถูกทรยศและฟื้นคืนชีพกลับมาในร่างใหม่ เพื่อทวงคืนความยุติธรรมและขึ้นสู่จุดสูงสุดแห่งเพลงทวน"
  },
  {
    id: "flowery-mountain-sect",
    title: "Return of the Flowery Mountain Sect หวนคืนสู่ฮวาซาน",
    type: "Manhwa",
    badgeText: "COLOR",
    latestChapter: 187,
    rating: 8.6,
    featured: true,
    updatedAt: "2 ชั่วโมงที่แล้ว",
    genres: ["Action", "Comedy", "Martial Arts", "Adventure"],
    cover: makeCover("HWA SAN", "หวนคืนสู่ฮวาซาน", "#500724", "#09090b", "#fb7185"),
    banner: makeBanner("#4c0519", "#1e1b4b", "#fb7185"),
    synopsis: "ชองมยอง ปรมาจารย์กระบี่รุ่นที่ 13 แห่งสำนักฮวาซาน ตื่นขึ้นมาในอีก 100 ปีข้างหน้า และพบว่าสำนักอันยิ่งใหญ่ของเขากำลังจะล่มสลาย"
  },
  {
    id: "absolute-regression",
    title: "Absolute Regression หวนคืนสู่จุดเริ่มต้น",
    type: "Manhwa",
    badgeText: "COLOR",
    latestChapter: 129,
    rating: 8.6,
    featured: false,
    updatedAt: "3 ชั่วโมงที่แล้ว",
    genres: ["Action", "Martial Arts", "Fantasy"],
    cover: makeCover("REGRESSION", "หวนคืนสู่จุดเริ่มต้น", "#431407", "#09090b", "#f59e0b"),
    banner: makeBanner("#431407", "#0f172a", "#f59e0b"),
    synopsis: "เมื่อสูญเสียทุกสิ่งไปในโลกยุทธภพ เขาใช้ศาสตร์ต้องห้ามย้อนเวลากลับมาในวัยหนุ่มเพื่อแก้ไขทุกความผิดพลาด"
  },
  {
    id: "fist-king",
    title: "Reincarnation of the Fist King ราชันหมัดหวนคืน",
    type: "Manhwa",
    badgeText: "COLOR",
    latestChapter: 77,
    rating: 9.0,
    featured: false,
    updatedAt: "4 ชั่วโมงที่แล้ว",
    genres: ["Action", "Martial Arts", "Drama"],
    cover: makeCover("FIST KING", "ราชันหมัดหวนคืน", "#172554", "#09090b", "#60a5fa"),
    banner: makeBanner("#172554", "#111827", "#60a5fa"),
    synopsis: "ราชันแห่งหมัดผู้ไร้พ่ายกลับชาติมาเกิดในร่างของเด็กหนุ่มอ่อนแอ พร้อมความทรงจำและเคล็ดวิชาทั้งหมด"
  },
  {
    id: "solo-leveling-ragnarok",
    title: "Solo Leveling: Ragnarok โซโล่เลเวลลิ่ง แร็กนาร็อก",
    type: "Manhwa",
    badgeText: "COLOR",
    latestChapter: 74,
    rating: 7.8,
    featured: true,
    updatedAt: "5 ชั่วโมงที่แล้ว",
    genres: ["Action", "Fantasy", "Adventure"],
    cover: makeCover("RAGNAROK", "Solo Leveling", "#0c4a6e", "#09090b", "#38bdf8"),
    banner: makeBanner("#0c4a6e", "#09090b", "#38bdf8"),
    synopsis: "ซองซูโฮ บุตรชายของซองจินอู ต้องปลุกพลังจักรพรรดิเงาที่หลับใหลอยู่เพื่อปกป้องโลกจากภัยคุกคามครั้งใหม่"
  },
  {
    id: "shadow-academy-novel",
    title: "บันทึกจอมเวทแห่งหอคอยทมิฬ (นิยายแปล)",
    type: "Novel",
    badgeText: "THAI",
    latestChapter: 215,
    rating: 8.9,
    featured: false,
    updatedAt: "40 นาทีที่แล้ว",
    genres: ["Fantasy", "Adventure", "Drama", "Sci-Fi"],
    cover: makeCover("SHADOW TOWER", "นิยายแปลไทย", "#1e293b", "#020617", "#818cf8"),
    banner: makeBanner("#1e293b", "#09090b", "#818cf8"),
    synopsis: "นิยายแฟนตาซีเข้มข้น ว่าด้วยเรื่องราวของนักศึกษาเวทมนตร์ที่ค้นพบบันทึกต้องห้ามใต้หอคอยชั้น 99 และต้องเอาชีวิตรอดจากเกมการเมืองของเหล่าจอมเวท"
  },
  {
    id: "villainess-reborn-novel",
    title: "นางร้ายขอลาออกจากวังหลวง (นิยาย)",
    type: "Novel",
    badgeText: "THAI",
    latestChapter: 142,
    rating: 8.7,
    featured: false,
    updatedAt: "2 ชั่วโมงที่แล้ว",
    genres: ["Romance", "Comedy", "Drama", "Fantasy"],
    cover: makeCover("LADY REBORN", "นิยายรักแฟนตาซี", "#4c0519", "#0f172a", "#f472b6"),
    banner: makeBanner("#4c0519", "#0f172a", "#f472b6"),
    synopsis: "เมื่อรู้ตัวว่าเกิดใหม่เป็นนางร้ายที่มีจุดจบอนาถ เธอจึงตัดสินใจยื่นใบลาออกจากตำแหน่งคู่หมั้นรัชทายาทแล้วหนีไปเปิดร้านขนม"
  },
  {
    id: "cyber-blade-novel",
    title: "Neon Ronin 2099 (นิยายไซไฟ)",
    type: "Novel",
    badgeText: "THAI",
    latestChapter: 88,
    rating: 8.4,
    featured: false,
    updatedAt: "6 ชั่วโมงที่แล้ว",
    genres: ["Sci-Fi", "Action", "Drama"],
    cover: makeCover("NEON RONIN", "นิยายไซไฟ", "#042f2e", "#09090b", "#2dd4bf"),
    banner: makeBanner("#042f2e", "#09090b", "#2dd4bf"),
    synopsis: "โลกไซเบอร์พังก์ปี 2099 เมื่อซามูไรรับจ้างผู้มีแขนกลต้องรับภารกิจคุ้มกันแฮกเกอร์สาวที่กุมความลับของเมกะคอร์ป"
  },
  {
    id: "midnight-cafe-doujin",
    title: "Midnight Cafe คาเฟ่เที่ยงคืน (Doujin)",
    type: "Doujin",
    badgeText: "COLOR",
    latestChapter: 18,
    rating: 8.5,
    featured: false,
    updatedAt: "1 ชั่วโมงที่แล้ว",
    genres: ["Romance", "Comedy", "Drama", "Ecchi"],
    cover: makeCover("MIDNIGHT CAFE", "Doujin แปลไทย", "#701a75", "#09090b", "#f472b6"),
    banner: makeBanner("#701a75", "#09090b", "#f472b6"),
    synopsis: "โดจินออริจินัลเรื่องราวความสัมพันธ์สุดอบอุ่นปนความลับของบาริสต้าหนุ่มกับลูกค้าสาวประจำที่แวะมาเฉพาะหลังเที่ยงคืน"
  },
  {
    id: "crimson-contract-doujin",
    title: "Crimson Contract พันธสัญญาโลหิต (Doujin)",
    type: "Doujin",
    badgeText: "NC",
    latestChapter: 24,
    rating: 8.3,
    featured: false,
    updatedAt: "3 ชั่วโมงที่แล้ว",
    genres: ["Adult", "Fantasy", "Ecchi", "Romance"],
    cover: makeCover("CRIMSON", "Doujin 18+", "#881337", "#09090b", "#fb7185"),
    banner: makeBanner("#881337", "#09090b", "#fb7185"),
    synopsis: "โดจินแฟนตาซีดาร์กโรแมนซ์ เรื่องราวของอัศวินสาวที่ต้องทำพันธสัญญาลับกับจอมมารเพื่อปกป้องอาณาจักร"
  },
  {
    id: "summer-island-doujin",
    title: "Summer Island ร้อนรักเกาะสวรรค์ (Doujin)",
    type: "Doujin",
    badgeText: "COLOR",
    latestChapter: 12,
    rating: 8.0,
    featured: false,
    updatedAt: "5 ชั่วโมงที่แล้ว",
    genres: ["Comedy", "Ecchi", "Romance", "Adult"],
    cover: makeCover("SUMMER LOVE", "Doujin สีทั้งเรื่อง", "#0e7490", "#09090b", "#22d3ee"),
    banner: makeBanner("#0e7490", "#09090b", "#22d3ee"),
    synopsis: "ทริปฤดูร้อนของชมรมถ่ายภาพบนเกาะส่วนตัวที่เต็มไปด้วยเรื่องชวนใจเต้นและความลับของสมาชิกแต่ละคน"
  },
  {
    id: "apocalypse-chef-manhwa",
    title: "Apocalypse Chef เชฟวันสิ้นโลก",
    type: "Manhwa",
    badgeText: "COLOR",
    latestChapter: 95,
    rating: 8.2,
    featured: false,
    updatedAt: "7 ชั่วโมงที่แล้ว",
    genres: ["Action", "Comedy", "Fantasy", "Adventure"],
    cover: makeCover("APOCALYPSE", "เชฟวันสิ้นโลก", "#3f6212", "#09090b", "#a3e635"),
    banner: makeBanner("#3f6212", "#09090b", "#a3e635"),
    synopsis: "เมื่อมอนสเตอร์บุกโลก มีเพียงพ่อครัวผู้ครอบครองสกิลปรุงวัตถุดิบระดับตำนานเท่านั้นที่สร้างอาหารเพิ่มบัฟให้ฮันเตอร์ได้"
  }
];

window.getSampleNovelText = function (series, chapterNum) {
  return [
    `ลมหนาวพัดผ่านยอดหอคอยในยามค่ำคืน แสงจันทร์สีเงินสาดส่องลงบนลานหินอ่อนที่เงียบสงัด บทที่ ${chapterNum} ของ "${series.title}" เริ่มต้นขึ้นท่ามกลางบรรยากาศที่ตึงเครียดยิ่งกว่าครั้งใด`,
    `เสียงฝีเท้าเบาๆ ดังขึ้นจากเงามืดเบื้องหลังเสาหิน ก่อนที่ร่างในชุดคลุมสีเข้มจะก้าวออกมา ดวงตาคมกริบกวาดมองไปรอบบริเวณราวกับกำลังประเมินสถานการณ์ทุกฝีก้าว`,
    `"เจ้ามาสายกว่าที่นัดไว้ถึงสิบนาที" เสียงทุ้มต่ำเอ่ยขึ้นทำลายความเงียบ พร้อมกับประกายพลังเวทสีครามที่ค่อยๆ ก่อตัวขึ้นบริเวณปลายนิ้ว`,
    `"เพราะระหว่างทางมีแขกไม่ได้รับเชิญโผล่ออกมานิดหน่อย" เขาตอบกลับด้วยรอยยิ้มบางๆ พลางสะบัดข้อมือเรียกดาบประจำกายออกมา ความกดดันมหาศาลแผ่กระจายไปทั่วลานประลองในพริบตา`,
    `การปะทะกันในบทนี้ไม่ใช่เพียงการวัดฝีมือธรรมดา แต่เป็นการเดิมพันด้วยความลับที่ถูกปิดบังมานานนับศตวรรษ และผลลัพธ์ของมันจะเปลี่ยนสมดุลอำนาจทั้งหมดไปตลอดกาล...`
  ];
};

window.getSampleMangaPages = function (series, chapterNum) {
  const accent = series.type === "Doujin" ? "#f472b6" : "#38bdf8";
  return [
    makeMangaPage(series.title, chapterNum, 1, accent),
    makeMangaPage(series.title, chapterNum, 2, accent),
    makeMangaPage(series.title, chapterNum, 3, accent)
  ];
};
