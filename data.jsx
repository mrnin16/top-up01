// data.jsx — catalog content for the prototype
const CATEGORIES = [
  { id: "all", label: "All", icon: "Sparkle" },
  { id: "mobile", label: "Mobile games", icon: "Bolt" },
  { id: "pc", label: "PC games", icon: "Star" },
  { id: "subs", label: "Subscriptions", icon: "Gift" },
  { id: "data", label: "Mobile data", icon: "Signal" },
  { id: "gift", label: "Gift cards", icon: "Card" },
];

// Tile colors are oklch-ish stops; we render as gradient swatches
const GAMES = [
  { id: "mlbb", title: "Mobile Legends", sub: "Bang Bang", cat: "mobile", currency: "Diamonds", method: "direct", hot: true,
    grad: ["#1d4ed8", "#0ea5e9"], emblem: "ML" },
  { id: "ff",   title: "Free Fire",       sub: "MAX",      cat: "mobile", currency: "Diamonds", method: "direct", hot: true,
    grad: ["#ea580c", "#f59e0b"], emblem: "FF" },
  { id: "pubg", title: "PUBG Mobile",     sub: "Global",   cat: "mobile", currency: "UC",       method: "direct",
    grad: ["#ca8a04", "#facc15"], emblem: "PM" },
  { id: "genshin", title: "Genshin Impact", sub: "HoYoverse", cat: "pc",  currency: "Genesis Crystals", method: "direct",
    grad: ["#0f766e", "#14b8a6"], emblem: "GI" },
  { id: "valorant", title: "Valorant",    sub: "Riot Points", cat: "pc",  currency: "VP",       method: "code",
    grad: ["#9f1239", "#f43f5e"], emblem: "VL" },
  { id: "honkai", title: "Honkai: Star Rail", sub: "HoYoverse", cat: "pc", currency: "Oneiric Shards", method: "direct",
    grad: ["#7c3aed", "#c084fc"], emblem: "HSR" },
  { id: "spotify", title: "Spotify",      sub: "Premium",  cat: "subs",  currency: "Months", method: "code", new: true,
    grad: ["#15803d", "#22c55e"], emblem: "SP" },
  { id: "netflix", title: "Netflix",      sub: "Streaming", cat: "subs", currency: "Months", method: "code",
    grad: ["#7f1d1d", "#ef4444"], emblem: "NF" },
  { id: "smart",   title: "Smart",        sub: "Mobile data", cat: "data", currency: "GB",   method: "direct",
    grad: ["#0e7490", "#22d3ee"], emblem: "SM" },
  { id: "metfone", title: "Metfone",      sub: "Top-up",     cat: "data", currency: "USD",  method: "direct",
    grad: ["#1e3a8a", "#3b82f6"], emblem: "MF" },
  { id: "google",  title: "Google Play",  sub: "Gift card",  cat: "gift", currency: "USD",  method: "code",
    grad: ["#334155", "#64748b"], emblem: "GP" },
  { id: "apple",   title: "App Store",    sub: "Gift card",  cat: "gift", currency: "USD",  method: "code",
    grad: ["#111827", "#374151"], emblem: "AS" },
];

const PACKAGES = {
  mlbb: [
    { id: "p1", amount: 11,    bonus: 0,   priceUSD: 0.30 },
    { id: "p2", amount: 22,    bonus: 0,   priceUSD: 0.60 },
    { id: "p3", amount: 56,    bonus: 0,   priceUSD: 1.50 },
    { id: "p4", amount: 112,   bonus: 0,   priceUSD: 2.99, popular: true },
    { id: "p5", amount: 172,   bonus: 8,   priceUSD: 4.59 },
    { id: "p6", amount: 257,   bonus: 0,   priceUSD: 6.49 },
    { id: "p7", amount: 343,   bonus: 14,  priceUSD: 8.99 },
    { id: "p8", amount: 568,   bonus: 28,  priceUSD: 14.99, best: true },
    { id: "p9", amount: 1167,  bonus: 60,  priceUSD: 29.99 },
    { id: "p10", amount: 2398, bonus: 120, priceUSD: 59.99 },
    { id: "p11", amount: 6160, bonus: 320, priceUSD: 149.99 },
    { id: "p12", amount: 12330, bonus: 720, priceUSD: 299.99 },
  ],
};

// Default packages for any game without explicit ones
const DEFAULT_PACKAGES = PACKAGES.mlbb;

const PAYMENT_METHODS = [
  { id: "khqr",  label: "KHQR",                 sub: "Scan with any Cambodian bank app", icon: "Qr" },
  { id: "bank",  label: "Direct Bank",          sub: "ABA · ACLEDA · Wing · Chip Mong",  icon: "Bank" },
  { id: "card",  label: "Visa / Mastercard",    sub: "Credit or debit card",             icon: "Card" },
];

const BANKS = [
  { id: "aba", name: "ABA Bank", color: "#1f4eff" },
  { id: "acleda", name: "ACLEDA", color: "#0f7c4a" },
  { id: "wing", name: "Wing Bank", color: "#19a3ff" },
  { id: "chipmong", name: "Chip Mong Bank", color: "#d11f2f" },
];

window.AppData = { CATEGORIES, GAMES, PACKAGES, DEFAULT_PACKAGES, PAYMENT_METHODS, BANKS };
