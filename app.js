const categoryLabels = {
  all: "全部",
  rank: "上分指揮",
  practice: "技術訓練",
  fun: "休閒陪玩",
  review: "復盤分析",
};

const shopTierRules = [
  { name: "明星魔王", minScore: 94.5, basePrice: 860, capRate: 1.4 },
  { name: "魔王", minScore: 91.5, basePrice: 720, capRate: 1.34 },
  { name: "宗師Pro", minScore: 88.5, basePrice: 590, capRate: 1.28 },
  { name: "宗師", minScore: 85, basePrice: 470, capRate: 1.22 },
  { name: "基本", minScore: 0, basePrice: 320, capRate: 1.16 },
].map((tier) => ({
  ...tier,
  maxPrice: Math.round((tier.basePrice * tier.capRate) / 10) * 10,
}));

const attributePools = {
  roles: ["指揮", "槍法", "營運", "觀念", "溝通", "心理穩定", "地圖控制", "角色池"],
  personalities: ["冷靜精準", "溫柔陪跑", "直接犀利", "氣氛活潑", "耐心拆解", "節奏明快"],
  strengths: ["團隊節奏", "單排上分", "細節復盤", "新手入門", "練槍菜單", "角色理解", "任務陪跑", "心態調整"],
};

const coachBlueprints = [
  ["nora", "Nora", "rank", ["APEX", "Valorant"], "大師"],
  ["kai", "Kai", "rank", ["LOL"], "菁英"],
  ["mika", "Mika", "practice", ["Valorant", "APEX"], "鑽石"],
  ["rio", "Rio", "practice", ["Genshin", "LOL"], "高熟練"],
  ["yuna", "Yuna", "fun", ["Minecraft", "Genshin"], "休閒達人"],
  ["sora", "Sora", "fun", ["LOL", "Minecraft", "APEX"], "氣氛組"],
  ["ren", "Ren", "rank", ["Valorant"], "神話"],
  ["luna", "Luna", "rank", ["LOL", "APEX"], "宗師"],
  ["ace", "Ace", "practice", ["APEX", "Valorant"], "大師"],
  ["hana", "Hana", "practice", ["LOL", "Genshin"], "鑽石"],
  ["mochi", "Mochi", "fun", ["Minecraft", "LOL"], "陪玩專家"],
  ["zero", "Zero", "fun", ["APEX", "Valorant", "Minecraft"], "休閒高手"],
  ["iris", "Iris", "review", ["Valorant", "LOL"], "戰術分析師"],
  ["atlas", "Atlas", "review", ["APEX", "Overwatch 2"], "數據教練"],
  ["rhea", "Rhea", "rank", ["Overwatch 2", "Valorant"], "宗師"],
  ["jin", "Jin", "practice", ["LOL", "Valorant"], "訓練官"],
  ["mei", "Mei", "fun", ["Genshin", "Minecraft"], "任務陪跑"],
  ["blaze", "Blaze", "rank", ["APEX", "Overwatch 2"], "頂獵"],
  ["echo", "Echo", "review", ["LOL", "Valorant", "APEX"], "復盤專家"],
  ["taro", "Taro", "practice", ["Minecraft", "Genshin", "LOL"], "新手教官"],
];

const styleCopy = {
  rank: [
    "擅長建立排位節奏，會直接指出決策問題並給可執行的上分路線。",
    "重視溝通、轉線與團隊判斷，適合想穩定爬分的玩家。",
  ],
  practice: [
    "會把操作拆成短訓練，陪你反覆練到能在實戰自然用出來。",
    "適合想補基本功、角色熟練度和反應速度的玩家。",
  ],
  fun: [
    "聊天自然、節奏輕鬆，能一起跑任務、解成就或開心排幾場。",
    "主打舒服陪玩，不硬教但會在你需要時提醒關鍵細節。",
  ],
  review: [
    "擅長看 VOD、抓時間軸問題，把失誤整理成下一次能練的清單。",
    "適合想知道自己為什麼卡住，並需要清楚改善方向的玩家。",
  ],
};

function hashText(text) {
  return [...text].reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) % 9973, 17);
}

function pick(seed, list, offset = 0) {
  return list[(seed + offset) % list.length];
}

function unique(values) {
  return [...new Set(values)];
}

const companions = coachBlueprints.map(([id, name, category, games, rank], index) => {
  const seed = hashText(`${id}-${name}-${category}`);
  const primary = pick(seed, attributePools.roles);
  const secondary = pick(seed, attributePools.roles, 3);
  const personality = pick(seed, attributePools.personalities, 1);
  const strength = pick(seed, attributePools.strengths, 2);
  const rating = Number((4.6 + (seed % 5) * 0.08).toFixed(1));
  const reviews = 96 + ((seed + index * 37) % 360);
  const stats = {
    aim: 68 + (seed % 29),
    macro: 66 + ((seed * 3) % 31),
    comms: 70 + ((seed * 5) % 27),
  };
  const statAverage = (stats.aim + stats.macro + stats.comms) / 3;
  const powerScore = Number(((rating * 20 * 0.35) + (stats.aim * 0.22) + (stats.macro * 0.24) + (stats.comms * 0.19)).toFixed(1));
  const shopTier = shopTierRules.find((tier) => powerScore >= tier.minScore) || shopTierRules.at(-1);
  const ratingBonus = Math.max(0, Math.round((rating - 4.6) * 80));
  const statBonus = Math.max(0, Math.round((statAverage - 80) * 4));
  const demandBonus = companionDemandBonus(category, games.length);
  const rawPrice = Math.round((shopTier.basePrice + ratingBonus + statBonus + demandBonus) / 10) * 10;
  const price = Math.min(rawPrice, shopTier.maxPrice);
  const needsUpgradeReview = rawPrice > shopTier.maxPrice;
  const priceRange = `NT$${shopTier.basePrice} - NT$${shopTier.maxPrice}`;

  return {
    id,
    name,
    category,
    categoryLabel: categoryLabels[category],
    games,
    rank,
    style: `${pick(seed, styleCopy[category])} 主要屬性是${primary}與${secondary}，教學風格偏${personality}。`,
    rating,
    reviews,
    price,
    rawPrice,
    priceRange,
    powerScore,
    shopTier: shopTier.name,
    needsUpgradeReview,
    priceBasis: "",
    online: seed % 4 !== 0,
    tags: unique([shopTier.name, primary, secondary, personality, strength]),
    stats,
  };
});

function companionDemandBonus(category, gameCount) {
  const categoryBonus = {
    rank: 50,
    review: 40,
    practice: 25,
    fun: 0,
  };
  return (categoryBonus[category] || 0) + Math.max(0, gameCount - 1) * 15;
}

const plans = [
  {
    id: "free",
    name: "Free",
    price: "NT$0",
    note: "可瀏覽教練、使用基本聊天室與預約。",
    discountRate: 1,
    campaign: "新客首購可享 88 折，2 小時以上加贈 1 小時體驗。",
    features: ["20 位教練瀏覽", "基本聊天室", "本地影片重點整理"],
  },
  {
    id: "plus",
    name: "Plus",
    price: "NT$199 / 月",
    note: "適合固定練習與想省下媒合時間的玩家。",
    discountRate: 0.95,
    campaign: "固定 95 折；平日 2 小時以上加贈 30 分鐘；每月一次主題活動券。",
    features: ["教練費 95 折", "平日加時活動", "每月 4 次影片分析", "關閉廣告"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "NT$499 / 月",
    note: "給排位衝刺、戰隊練習和長期訓練使用。",
    discountRate: 0.88,
    campaign: "固定 88 折；2 小時以上加贈 1 小時；每月明星魔王體驗券。",
    features: ["教練費 88 折", "優先排程與加時", "每月 12 次影片分析", "訓練週報"],
  },
];

const keywordAnalysisCopy = {
  diagnosis: {
    title: "弱點診斷",
    summary: "優先推薦能拆解觀念、操作和溝通問題的教練。",
    preset: "我想先找出目前最影響勝率的弱點，請幫我整理 3 個優先改善項目。",
    categories: ["practice", "review"],
    terms: ["觀念", "細節復盤", "耐心拆解", "心態調整"],
  },
  review: {
    title: "影片復盤",
    summary: "優先推薦擅長 VOD 時間軸、失誤歸因和練習清單的教練。",
    preset: "我會提供影片時間點，想知道每段失誤的原因和下一次應該怎麼處理。",
    categories: ["review", "rank"],
    terms: ["細節復盤", "數據教練", "觀念", "團隊節奏"],
  },
  "win-rate": {
    title: "提高勝率",
    summary: "優先推薦上分指揮與排位節奏強的教練。",
    preset: "我想提高排位勝率，請先幫我檢查角色池、轉線和團戰決策。",
    categories: ["rank"],
    terms: ["指揮", "單排上分", "團隊節奏", "地圖控制"],
  },
  mechanics: {
    title: "操作訓練",
    summary: "優先推薦能安排短週期訓練菜單、陪練操作細節的教練。",
    preset: "我想練操作基本功，請幫我規劃 30 分鐘可重複的訓練菜單。",
    categories: ["practice"],
    terms: ["槍法", "練槍菜單", "角色理解", "訓練官"],
  },
  chill: {
    title: "輕鬆陪玩",
    summary: "優先推薦氣氛穩、能跑任務與聊天的教練。",
    preset: "我想輕鬆玩，不需要太硬核教學，希望能順順跑任務或排幾場。",
    categories: ["fun"],
    terms: ["氣氛活潑", "任務陪跑", "溫柔陪跑", "新手入門"],
  },
};

const state = {
  category: localStorage.getItem("playmate:category") || "all",
  game: localStorage.getItem("playmate:gameFilter") || "all",
  query: "",
  selectedCompanion: localStorage.getItem("playmate:selectedCompanion") || companions[0].id,
  plan: localStorage.getItem("playmate:plan") || "free",
  customerType: localStorage.getItem("playmate:customerType") || (localStorage.getItem("playmate:lastBooking") ? "returning" : "new"),
  analysisFocus: localStorage.getItem("playmate:analysisFocus") || "",
};

const FREE_PLAN_VIDEO_URL = "https://www.youtube.com/embed/8ZM-IlFQvQ4?autoplay=1&mute=1&playsinline=1&rel=0";
const FREE_PLAN_VIDEO_INTERVAL = 20 * 1000;
let freePlanVideoTimer = null;

const elements = {
  categoryButtons: document.querySelector("#categoryButtons"),
  searchInput: document.querySelector("#searchInput"),
  gameSelect: document.querySelector("#gameSelect"),
  quickBookButton: document.querySelector("#quickBookButton"),
  keywordAnalysisPanel: document.querySelector("#keywordAnalysisPanel"),
  keywordRecommendationPanel: document.querySelector("#keywordRecommendationPanel"),
  companionGrid: document.querySelector("#companionGrid"),
  resultMeta: document.querySelector("#resultMeta"),
  bookingStatus: document.querySelector("#bookingStatus"),
  bookingSummary: document.querySelector("#bookingSummary"),
  bookingForm: document.querySelector("#bookingForm"),
  customerTypeSelect: document.querySelector("#customerTypeSelect"),
  durationSelect: document.querySelector("#durationSelect"),
  bookingNotes: document.querySelector("#bookingNotes"),
  videoForm: document.querySelector("#videoForm"),
  videoUrl: document.querySelector("#videoUrl"),
  videoNotes: document.querySelector("#videoNotes"),
  analysisResult: document.querySelector("#analysisResult"),
  planGrid: document.querySelector("#planGrid"),
  currentPlan: document.querySelector("#currentPlan"),
  currentPlanNote: document.querySelector("#currentPlanNote"),
  videoPlanPill: document.querySelector("#videoPlanPill"),
  chatCoachStatus: document.querySelector("#chatCoachStatus"),
  chatRoster: document.querySelector("#chatRoster"),
  chatThread: document.querySelector("#chatThread"),
  chatForm: document.querySelector("#chatForm"),
  chatInput: document.querySelector("#chatInput"),
  adModal: document.querySelector("#adModal"),
  adVideoSlot: document.querySelector("#adVideoSlot"),
  adCloseButton: document.querySelector("#adCloseButton"),
  toast: document.querySelector("#toast"),
};

function saveState() {
  localStorage.setItem("playmate:category", state.category);
  localStorage.setItem("playmate:gameFilter", state.game);
  localStorage.setItem("playmate:selectedCompanion", state.selectedCompanion);
  localStorage.setItem("playmate:plan", state.plan);
  localStorage.setItem("playmate:customerType", state.customerType);
  localStorage.setItem("playmate:analysisFocus", state.analysisFocus);
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function activePlan() {
  return plans.find((plan) => plan.id === state.plan) || plans[0];
}

function selectedCompanion() {
  return companions.find((companion) => companion.id === state.selectedCompanion) || companions[0];
}

function scoreCompanionForKeyword(companion, keywordId) {
  const rule = keywordAnalysisCopy[keywordId];
  if (!rule) return 0;
  const text = [companion.name, companion.categoryLabel, companion.rank, companion.style, ...companion.games, ...companion.tags].join(" ");
  let score = 0;
  if (rule.categories.includes(companion.category)) score += 32;
  if (companion.online) score += 8;
  score += Math.round(companion.rating * 4);
  score += Math.min(10, Math.floor(companion.reviews / 80));
  for (const term of rule.terms) {
    if (text.includes(term)) score += 12;
  }
  return score;
}

function getKeywordRecommendations(keywordId, sourceList) {
  return [...sourceList]
    .map((companion) => ({ companion, score: scoreCompanionForKeyword(companion, keywordId) }))
    .sort((a, b) => b.score - a.score || b.companion.rating - a.companion.rating)
    .map((item, index) => ({ ...item, rank: index + 1, recommended: index < 3 && item.score > 0 }));
}

function filteredCompanions() {
  const query = state.query.trim().toLowerCase();
  const list = companions.filter((companion) => {
    const matchCategory = state.category === "all" || companion.category === state.category;
    const matchGame = state.game === "all" || companion.games.includes(state.game);
    const text = [companion.name, companion.categoryLabel, companion.rank, companion.style, ...companion.games, ...companion.tags].join(" ").toLowerCase();
    return matchCategory && matchGame && (!query || text.includes(query));
  });

  if (state.analysisFocus) {
    return getKeywordRecommendations(state.analysisFocus, list).map((item) => item.companion);
  }
  return list;
}

function renderKeywordPreview(keywordId) {
  const keyword = keywordAnalysisCopy[keywordId];
  if (!keyword) return;
  elements.keywordAnalysisPanel.innerHTML = `
    <div class="analysis-header">
      <div>
        <p class="eyebrow">MATCH LOGIC</p>
        <h3 class="keyword-analysis-title">${escapeHTML(keyword.title)}</h3>
      </div>
      <span class="analysis-badge">已套用</span>
    </div>
    <p class="keyword-analysis-summary">${escapeHTML(keyword.summary)}</p>
    <div class="keyword-analysis-tags">
      ${keyword.terms.map((term) => `<span>${escapeHTML(term)}</span>`).join("")}
    </div>
  `;
}

function renderKeywordRecommendations(keywordId, sourceList = filteredCompanions()) {
  const rule = keywordAnalysisCopy[keywordId];
  if (!rule) return;
  const topItems = getKeywordRecommendations(keywordId, sourceList).slice(0, 3);
  elements.keywordRecommendationPanel.innerHTML = `
    <div class="recommendation-head">
      <div>
        <p class="eyebrow">COACH MATCH</p>
        <h3 class="keyword-analysis-title">推薦教練</h3>
        <p class="keyword-analysis-summary">依「${escapeHTML(rule.title)}」重新計分，優先考慮屬性、上線狀態、評分與擅長項目。</p>
      </div>
      <span class="analysis-badge">Top ${topItems.length}</span>
    </div>
    <div class="recommendation-list">
      ${topItems.map(({ companion, score, rank }) => `
        <article class="recommendation-card">
          <div class="recommendation-rank">#${rank}</div>
          <div>
            <h4>${escapeHTML(companion.name)} <span class="recommendation-badge">${escapeHTML(companion.categoryLabel)}</span></h4>
            <p>${escapeHTML(companion.style)}</p>
            <div class="recommendation-meta">
              <span>${escapeHTML(companion.games.join(" / "))}</span>
              <span>評分 ${companion.rating}</span>
              <span>${companion.online ? "可立即聊" : "稍後回覆"}</span>
              <span>分數 ${score}</span>
            </div>
          </div>
          <button class="primary-button" type="button" data-select="${companion.id}">選擇</button>
        </article>
      `).join("")}
    </div>
  `;
}

function renderCoachPhoto(companion) {
  const seed = hashText(`${companion.id}-${companion.name}`);
  const hue = seed % 360;
  const accent = (hue + 82) % 360;
  const shirt = (hue + 190) % 360;
  const hair = seed % 3 === 0 ? "#201713" : seed % 3 === 1 ? "#30231c" : "#15191f";
  const skin = seed % 4 === 0 ? "#f1c7a7" : seed % 4 === 1 ? "#d9a47e" : seed % 4 === 2 ? "#c88765" : "#f0b990";
  const initials = companion.name.slice(0, 2).toUpperCase();
  return `
    <div class="coach-photo" style="--photo-hue:${hue};--photo-accent:${accent};--photo-shirt:${shirt};--photo-hair:${hair};--photo-skin:${skin};" aria-label="${escapeHTML(companion.name)} 的教練頭像" role="img">
      <span class="photo-light"></span><span class="photo-backdrop"></span><span class="photo-neck"></span>
      <span class="photo-face"></span><span class="photo-hair"></span><span class="photo-bangs"></span>
      <span class="photo-eye left"></span><span class="photo-eye right"></span><span class="photo-smile"></span>
      <span class="photo-shirt"></span><span class="photo-badge">${escapeHTML(initials)}</span>
    </div>
  `;
}

function renderCompanionCard(companion, recommendation = {}) {
  const selected = companion.id === state.selectedCompanion ? "active" : "";
  const recommended = recommendation.recommended ? "keyword-recommended" : "";
  const rankLabel = recommendation.rank ? `#${recommendation.rank} 推薦` : "";
  return `
    <article class="companion-card ${selected} ${recommended}">
      ${renderCoachPhoto(companion)}
      <div class="profile-head">
        <div>
          <p class="eyebrow">${escapeHTML(companion.categoryLabel)}</p>
          <h3>${escapeHTML(companion.name)}</h3>
          <span class="${companion.online ? "online" : "offline"}">${companion.online ? "線上" : "離線"}</span>
          ${rankLabel ? `<span class="recommendation-badge">${rankLabel}</span>` : ""}
        </div>
      </div>
      <p class="card-copy">${escapeHTML(companion.style)}</p>
      <div class="tag-row">
        ${[...companion.games, ...companion.tags].map((tag) => `<span>${escapeHTML(tag)}</span>`).join("")}
      </div>
      <div class="stat-bars">
        <div><span>操作</span><strong style="width:${companion.stats.aim}%"></strong></div>
        <div><span>觀念</span><strong style="width:${companion.stats.macro}%"></strong></div>
        <div><span>溝通</span><strong style="width:${companion.stats.comms}%"></strong></div>
      </div>
      <div class="meta-grid">
        <span><strong>${escapeHTML(companion.rank)}</strong>段位/定位</span>
        <span><strong>${escapeHTML(companion.shopTier)}</strong>店內階級</span>
        <span><strong>${companion.rating}</strong>評分</span>
        <span><strong>${companion.powerScore}</strong>綜合分</span>
        <span><strong>${companion.reviews}</strong>評價</span>
        <span><strong>NT$${companion.price}</strong>每小時</span>
      </div>
      <button class="primary-button" type="button" data-select="${companion.id}">選擇教練</button>
    </article>
  `;
}

function renderCompanions() {
  const list = filteredCompanions();
  const ranked = state.analysisFocus
    ? getKeywordRecommendations(state.analysisFocus, list)
    : list.map((companion, index) => ({ companion, score: 0, rank: index + 1, recommended: false }));

  elements.resultMeta.textContent = `${list.length} 位教練`;
  elements.companionGrid.innerHTML = ranked.length
    ? ranked.map(({ companion, score, rank, recommended }) => renderCompanionCard(companion, { score, rank: state.analysisFocus ? rank : 0, recommended })).join("")
    : '<div class="empty-state">目前沒有符合條件的教練，請換一個屬性或遊戲試試。</div>';

  if (state.analysisFocus) renderKeywordRecommendations(state.analysisFocus, list);
}

function renderBooking() {
  const companion = selectedCompanion();
  const hours = Number(elements.durationSelect.value || 1);
  const offer = calculateBookingOffer(companion, hours);
  elements.bookingStatus.textContent = `${companion.name} / ${companion.categoryLabel}`;
  elements.bookingSummary.innerHTML = `
    <div class="booking-line"><span>教練</span><strong>${escapeHTML(companion.name)}</strong></div>
    <div class="booking-line"><span>屬性</span><strong>${escapeHTML(companion.categoryLabel)}</strong></div>
    <div class="booking-line"><span>店內階級</span><strong>${escapeHTML(companion.shopTier)} · ${companion.powerScore} 分</strong></div>
    <div class="booking-line"><span>遊戲</span><strong>${escapeHTML(companion.games.join(" / "))}</strong></div>
    <div class="booking-line"><span>原價</span><strong>NT$${offer.subtotal}</strong></div>
    <div class="booking-line"><span>優惠</span><strong>${escapeHTML(offer.discountLabel)}</strong></div>
    <div class="booking-line"><span>服務時數</span><strong>${formatHours(offer.effectiveHours)}</strong></div>
    <div class="booking-line total"><span>預估付款</span><strong>NT$${offer.total}</strong></div>
    <div class="offer-list">
      ${offer.perks.map((perk) => `<span>${escapeHTML(perk)}</span>`).join("")}
    </div>
  `;
}

function calculateBookingOffer(companion, hours) {
  const plan = activePlan();
  const subtotal = companion.price * hours;
  const planRate = plan.discountRate || 1;
  const newCustomerRate = state.customerType === "new" ? 0.88 : 1;
  const bestRate = Math.min(planRate, newCustomerRate);
  const total = Math.round((subtotal * bestRate) / 10) * 10;
  const discountPercent = Math.round((1 - bestRate) * 100);
  let bonusHours = 0;
  const perks = [];

  if (state.customerType === "new") {
    if (hours >= 2) {
      bonusHours += 1;
      perks.push("新客首購：2 小時以上加贈 1 小時體驗");
    } else {
      bonusHours += 0.5;
      perks.push("新客首購：1 小時單加贈 30 分鐘暖身");
    }
  }

  if (plan.id === "plus") {
    if (hours >= 2) {
      bonusHours += 0.5;
      perks.push("Plus 小活動：平日 2 小時以上加贈 30 分鐘");
    }
    perks.push("Plus：每月 1 張主題訓練活動券");
  }

  if (plan.id === "pro") {
    if (hours >= 2) {
      bonusHours += 1;
      perks.push("Pro 加時：2 小時以上加贈 1 小時");
    }
    perks.push("Pro：每月明星魔王體驗券與優先排程");
  }

  if (!perks.length) {
    perks.push("一般預約：可使用聊天室先確認需求");
  }

  return {
    subtotal,
    total,
    discountLabel: discountPercent ? `已套用 ${Math.round(bestRate * 100)} 折，省 NT$${subtotal - total}` : "未套用折扣",
    effectiveHours: hours + bonusHours,
    bonusHours,
    perks,
  };
}

function formatHours(hours) {
  return Number.isInteger(hours) ? `${hours} 小時` : `${hours} 小時`;
}

function chatHistoryKey() {
  return `playmate:chat:${state.selectedCompanion}`;
}

function getChatHistory() {
  try {
    return JSON.parse(localStorage.getItem(chatHistoryKey()) || "[]");
  } catch {
    return [];
  }
}

function saveChatHistory(history) {
  localStorage.setItem(chatHistoryKey(), JSON.stringify(history.slice(-40)));
}

function coachReply(companion, text) {
  const lower = text.toLowerCase();
  if (lower.includes("時間") || text.includes("有空") || text.includes("預約")) {
    return `我通常晚上比較好約。你可以先選 1 小時，我會用${companion.tags[0]}的方式幫你抓重點。`;
  }
  if (text.includes("勝率") || text.includes("上分")) {
    return `可以，我會先看你的角色池、死亡原因和關鍵團戰。以你的需求來說，${companion.games[0]} 可以從節奏和溝通先修。`;
  }
  if (text.includes("教學") || text.includes("方式")) {
    return `我的風格偏${companion.tags[2]}，會先聽你目標，再給一份短練習菜單，不會只丟抽象建議。`;
  }
  return `收到，我是 ${companion.name}。你可以告訴我目前段位、主要角色和最想改善的一件事，我會先幫你抓方向。`;
}

function renderChatRoster() {
  const candidates = companions.filter((companion) => companion.online).slice(0, 8);
  elements.chatRoster.innerHTML = candidates.map((companion) => `
    <button class="roster-item ${companion.id === state.selectedCompanion ? "active" : ""}" type="button" data-select="${companion.id}">
      <span>${escapeHTML(companion.name)}</span>
      <small>${escapeHTML(companion.categoryLabel)} · ${escapeHTML(companion.games[0])}</small>
    </button>
  `).join("");
}

function renderChat() {
  const companion = selectedCompanion();
  elements.chatCoachStatus.textContent = `${companion.name} · ${companion.online ? "線上" : "離線"}`;
  const history = getChatHistory();
  const messages = history.length ? history : [{
    role: "coach",
    text: `嗨，我是 ${companion.name}。我擅長${companion.tags.slice(0, 2).join("、")}，可以先跟我說你想練什麼。`,
    time: new Date().toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" }),
  }];
  elements.chatThread.innerHTML = messages.map((message) => `
    <div class="chat-message ${message.role}">
      <span>${escapeHTML(message.text)}</span>
      <small>${escapeHTML(message.time)}</small>
    </div>
  `).join("");
  elements.chatThread.scrollTop = elements.chatThread.scrollHeight;
  renderChatRoster();
}

function addChatMessage(text) {
  const companion = selectedCompanion();
  const now = new Date().toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" });
  const history = getChatHistory();
  history.push({ role: "user", text, time: now });
  history.push({ role: "coach", text: coachReply(companion, text), time: now });
  saveChatHistory(history);
  renderChat();
}

function renderPlans() {
  elements.planGrid.innerHTML = plans.map((plan) => {
    const active = plan.id === state.plan ? "active" : "";
    return `
      <article class="plan-card ${active}">
        <div>
          <p class="eyebrow">${plan.id.toUpperCase()}</p>
          <h3>${escapeHTML(plan.name)}</h3>
          <strong class="plan-price">${escapeHTML(plan.price)}</strong>
          <p>${escapeHTML(plan.note)}</p>
          <p class="campaign-copy">${escapeHTML(plan.campaign)}</p>
        </div>
        <ul>${plan.features.map((feature) => `<li>${escapeHTML(feature)}</li>`).join("")}</ul>
        <button class="${active ? "secondary-button" : "primary-button"}" type="button" data-plan="${plan.id}">
          ${active ? "使用中" : "切換方案"}
        </button>
      </article>
    `;
  }).join("");
}

function renderPlanState() {
  const plan = activePlan();
  elements.currentPlan.textContent = plan.name;
  elements.currentPlanNote.textContent = plan.note;
  elements.videoPlanPill.textContent = plan.id === "free" ? "Free：基本分析" : plan.id === "plus" ? "Plus：進階額度" : "Pro：完整訓練";
  updateFreePlanVideoTimer();
}

function setCategory(category) {
  state.category = category;
  document.querySelectorAll("[data-category]").forEach((button) => {
    button.classList.toggle("active", button.dataset.category === category);
  });
  saveState();
  renderCompanions();
}

function selectCompanion(id, scrollTarget = "") {
  state.selectedCompanion = id;
  saveState();
  renderCompanions();
  renderBooking();
  renderChat();
  if (scrollTarget) scrollToSection(scrollTarget);
  showToast(`已選擇 ${selectedCompanion().name}`);
}

function scrollToSection(target) {
  const section = typeof target === "string" ? document.querySelector(target) : target;
  if (!section) return;
  section.scrollIntoView({ behavior: "smooth", block: "start" });
}

function quickMatch() {
  const list = filteredCompanions();
  if (!list.length) {
    showToast("沒有符合條件的教練，請換個條件試試。");
    return;
  }
  const online = list.find((companion) => companion.online);
  selectCompanion((online || list[0]).id, "#booking");
}

function renderAnalysisCard(result) {
  return `
    <div class="analysis-header">
      <div>
        <p class="eyebrow">LOCAL ANALYSIS</p>
        <h3>${escapeHTML(result.title)}</h3>
        <p class="analysis-subtitle">${escapeHTML(result.subtitle)}</p>
      </div>
      <span class="analysis-badge">${escapeHTML(result.badge)}</span>
    </div>
    <div class="analysis-meta">${result.meta.map((item) => `<span>${escapeHTML(item)}</span>`).join("")}</div>
    <div class="analysis-block"><h4>摘要</h4><p>${escapeHTML(result.summary)}</p></div>
    <div class="analysis-grid">
      <div class="analysis-block"><h4>觀察</h4><ul>${result.highlights.map((item) => `<li>${escapeHTML(item)}</li>`).join("")}</ul></div>
      <div class="analysis-block"><h4>下一步</h4><ul>${result.actions.map((item) => `<li>${escapeHTML(item)}</li>`).join("")}</ul></div>
    </div>
  `;
}

function localAnalyze(payload) {
  const keyword = keywordAnalysisCopy[payload.keywordId] || keywordAnalysisCopy.diagnosis;
  const timestamps = (payload.notes || "").match(/\b\d{1,2}:\d{2}(?::\d{2})?\b/g) || [];
  const platform = payload.videoUrl?.includes("youtu") ? "YouTube" : payload.videoUrl?.includes("twitch") ? "Twitch" : "自訂影片";
  return {
    title: payload.mode === "keyword" ? `${keyword.title}建議` : "影片分析結果",
    subtitle: payload.mode === "keyword" ? "已依媒合需求產生練習方向" : `${platform} · ${timestamps.length ? `${timestamps.length} 個時間點` : "未標註時間點"}`,
    badge: activePlan().name,
    meta: [keyword.title, activePlan().name, selectedCompanion().name],
    summary: payload.mode === "keyword"
      ? keyword.summary
      : "建議先把最常重複的失誤整理成一個主題，不要一次修太多項目，下一場只追蹤一個指標。",
    highlights: [
      "先確認死亡或失誤是否來自資訊不足、操作失誤或團隊節奏不同步。",
      timestamps.length ? `優先檢查 ${timestamps[0]} 附近的前後 20 秒。` : "下次提供時間點會讓復盤更精準。",
      `可請 ${selectedCompanion().name} 用${selectedCompanion().tags[0]}角度陪你拆解。`,
    ],
    actions: [
      "建立 3 場內可驗證的小目標。",
      "每次練習後只記錄一個成功案例和一個待修正案例。",
      keyword.preset,
    ],
  };
}

function applyKeywordAnalysis(keywordId, button) {
  const keyword = keywordAnalysisCopy[keywordId];
  if (!keyword) return;
  state.analysisFocus = keywordId;
  elements.videoNotes.value = keyword.preset;
  saveState();
  renderKeywordPreview(keywordId);
  renderCompanions();
  document.querySelectorAll("[data-keyword-analysis]").forEach((otherButton) => {
    otherButton.classList.toggle("is-active", otherButton === button);
  });
  elements.analysisResult.innerHTML = renderAnalysisCard(localAnalyze({ mode: "keyword", keywordId }));
  showToast(`已套用「${keyword.title}」媒合`);
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => elements.toast.classList.remove("show"), 1800);
}

function openFreePlanVideo() {
  if (state.plan !== "free") return;
  elements.adVideoSlot.innerHTML = `<iframe src="${FREE_PLAN_VIDEO_URL}" title="Free 方案廣告" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
  elements.adModal.classList.add("show");
  elements.adModal.setAttribute("aria-hidden", "false");
}

function closeFreePlanVideo() {
  elements.adModal.classList.remove("show");
  elements.adModal.setAttribute("aria-hidden", "true");
  elements.adVideoSlot.innerHTML = "";
}

function updateFreePlanVideoTimer() {
  window.clearInterval(freePlanVideoTimer);
  freePlanVideoTimer = null;
  closeFreePlanVideo();
  if (state.plan === "free") freePlanVideoTimer = window.setInterval(openFreePlanVideo, FREE_PLAN_VIDEO_INTERVAL);
}

elements.categoryButtons.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (button) setCategory(button.dataset.category);
});

document.querySelectorAll("[data-jump]").forEach((button) => {
  button.addEventListener("click", () => scrollToSection(button.dataset.jump));
});

document.querySelectorAll(".nav-list a").forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");
    if (targetId?.startsWith("#")) {
      event.preventDefault();
      scrollToSection(targetId);
      history.replaceState(null, "", targetId);
    }
    document.querySelectorAll(".nav-list a").forEach((item) => item.classList.toggle("active", item === link));
  });
});

elements.searchInput.addEventListener("input", (event) => {
  state.query = event.target.value;
  renderCompanions();
});

elements.gameSelect.addEventListener("change", (event) => {
  state.game = event.target.value;
  saveState();
  renderCompanions();
});

elements.quickBookButton.addEventListener("click", quickMatch);

elements.companionGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-select]");
  if (button) selectCompanion(button.dataset.select);
});

elements.keywordRecommendationPanel.addEventListener("click", (event) => {
  const button = event.target.closest("[data-select]");
  if (button) selectCompanion(button.dataset.select, "#booking");
});

elements.chatRoster.addEventListener("click", (event) => {
  const button = event.target.closest("[data-select]");
  if (button) selectCompanion(button.dataset.select);
});

document.querySelectorAll("[data-chat-prompt]").forEach((button) => {
  button.addEventListener("click", () => addChatMessage(button.dataset.chatPrompt));
});

elements.chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = elements.chatInput.value.trim();
  if (!text) return;
  elements.chatInput.value = "";
  addChatMessage(text);
});

elements.durationSelect.addEventListener("change", renderBooking);

elements.customerTypeSelect.addEventListener("change", (event) => {
  state.customerType = event.target.value;
  saveState();
  renderBooking();
});

document.querySelectorAll("[data-keyword-analysis]").forEach((button) => {
  const runKeyword = () => applyKeywordAnalysis(button.dataset.keywordAnalysis, button);
  button.addEventListener("click", runKeyword);
  button.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      runKeyword();
    }
  });
});

elements.bookingForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const companion = selectedCompanion();
  const hours = Number(elements.durationSelect.value);
  const offer = calculateBookingOffer(companion, hours);
  const order = {
    companion: companion.name,
    category: companion.categoryLabel,
    shopTier: companion.shopTier,
    hours,
    effectiveHours: offer.effectiveHours,
    subtotal: offer.subtotal,
    total: offer.total,
    discountLabel: offer.discountLabel,
    perks: offer.perks,
    customerType: state.customerType,
    plan: state.plan,
    notes: elements.bookingNotes.value.trim(),
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem("playmate:lastBooking", JSON.stringify(order));
  state.customerType = "returning";
  elements.customerTypeSelect.value = state.customerType;
  saveState();
  renderBooking();
  showToast(`已建立 ${companion.name} 的預約，付款 NT$${offer.total}`);
});

elements.videoForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!elements.videoUrl.value.trim() && !elements.videoNotes.value.trim()) {
    showToast("請輸入影片網址或分析備註。");
    return;
  }
  const result = localAnalyze({
    mode: "video",
    videoUrl: elements.videoUrl.value.trim(),
    notes: elements.videoNotes.value.trim(),
    keywordId: state.analysisFocus || "diagnosis",
  });
  elements.analysisResult.innerHTML = renderAnalysisCard(result);
  showToast("影片分析完成");
});

elements.planGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-plan]");
  if (!button) return;
  state.plan = button.dataset.plan;
  saveState();
  renderPlans();
  renderPlanState();
  renderBooking();
  showToast(`已切換至 ${activePlan().name}`);
});

elements.adCloseButton.addEventListener("click", closeFreePlanVideo);
elements.adModal.addEventListener("click", (event) => {
  if (event.target === elements.adModal) closeFreePlanVideo();
});

elements.gameSelect.value = state.game;
elements.customerTypeSelect.value = state.customerType;
setCategory(state.category);
renderPlans();
renderPlanState();
renderBooking();
renderChat();
if (state.analysisFocus) {
  renderKeywordPreview(state.analysisFocus);
  renderKeywordRecommendations(state.analysisFocus);
}
