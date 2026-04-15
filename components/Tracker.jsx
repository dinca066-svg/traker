import { useState, useEffect } from "react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, LineChart, Line } from "recharts";

// ======= DATA LAYER (Supabase via API) =======
async function ld(category, fb = []) {
  try {
    const r = await fetch(`/api/data?category=${category}`);
    const j = await r.json();
    return j.data ?? fb;
  } catch { return fb; }
}
async function sv(category, data) {
  try {
    await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, data }),
    });
  } catch (e) { console.error(e); }
}

const td = () => new Date().toISOString().slice(0, 10);
const fD = d => { const p = d.split("-"); return `${p[2]}.${p[1]}`; };
const fDF = d => { const p = d.split("-"); return `${p[2]}.${p[1]}.${p[0]}`; };

const Delta = ({ val, unit = "кг" }) => {
  if (val == null) return <span style={{ fontSize: "11px", color: "#6b635a" }}>—</span>;
  const color = Math.abs(val) < 0.05 ? "#8a8279" : val < 0 ? "#7eb89a" : "#c47a7a";
  return <span style={{ fontSize: "12px", fontWeight: 600, color, fontFamily: "'DM Mono',monospace" }}>{val > 0 ? "+" : ""}{val.toFixed(1)} {unit}</span>;
};

// ======= SWAPS =======
const SWAPS = {
  chicken: { main: "Куриная грудка", alts: ["Индейка", "Куриное бедро б/к", "Кролик"] },
  turkey: { main: "Индейка", alts: ["Куриная грудка", "Куриное бедро б/к"] },
  cod: { main: "Треска", alts: ["Минтай", "Тилапия", "Куриная грудка", "Хек"] },
  salmon: { main: "Сёмга/форель", alts: ["Горбуша", "Треска", "Куриная грудка"] },
  beef: { main: "Говядина", alts: ["Индейка", "Куриное бедро б/к", "Свинина нежирн."] },
  trout: { main: "Форель", alts: ["Сёмга", "Горбуша", "Треска", "Минтай"] },
  pollock: { main: "Минтай", alts: ["Треска", "Хек", "Тилапия"] },
  eggs: { main: "Яйца", alts: ["Творог 2%", "Протеин. йогурт"] },
  cottage: { main: "Творог", alts: ["Протеин. йогурт", "2 яйца", "Рикотта"] },
};

// ======= MEALS (4 weeks) =======
const MEALS_4W = [
  [
    { day: "Пн", b: { items: "Бутерброд (хлеб+масло+сыр+индейка), 2 яйца", kcal: 420, prot: 28, swap: ["turkey", "eggs"] }, l: { items: "Куриная грудка 180г, салат огурец+помидор+масло, гречка 4 ст.л.", kcal: 430, prot: 40, swap: ["chicken"] }, s: { items: "Творог 2% 150г, ягоды", kcal: 170, prot: 25, swap: ["cottage"] } },
    { day: "Вт", b: { items: "Сочник, омлет из 2 яиц", kcal: 400, prot: 22, swap: ["eggs"] }, l: { items: "Треска запечённая 200г, брокколи 150г, бурый рис", kcal: 380, prot: 38, swap: ["cod"] }, s: { items: "Протеин. йогурт, миндаль 15г", kcal: 200, prot: 22, swap: [] } },
    { day: "Ср", b: { items: "Банан, творог 120г с корицей", kcal: 300, prot: 24, swap: ["cottage"] }, l: { items: "Индейка тушёная 180г, салат+огурец+помидор, чечевица", kcal: 440, prot: 42, swap: ["turkey"] }, s: { items: "2 варёных яйца, огурец", kcal: 170, prot: 14, swap: ["eggs"] } },
    { day: "Чт", b: { items: "Бутерброд (хлеб+сливоч. сыр+лосось), йогурт", kcal: 380, prot: 24, swap: ["salmon"] }, l: { items: "Куриное бедро б/к 180г, кабачок+баклажан, гречка", kcal: 420, prot: 36, swap: ["chicken"] }, s: { items: "Творог 2% 130г, 2 дольки шоколада", kcal: 200, prot: 22, swap: ["cottage"] } },
    { day: "Пт", b: { items: "Сырники 3шт, сметана 15%", kcal: 350, prot: 26, swap: ["cottage"] }, l: { items: "Сёмга 150г, руккола+черри+масло, булгур", kcal: 440, prot: 35, swap: ["salmon"] }, s: { items: "Протеин. йогурт, грецкие орехи 15г", kcal: 210, prot: 20, swap: [] } },
    { day: "Сб", b: { items: "Овсянка 40г+банан+корица, 2 яйца", kcal: 380, prot: 20, swap: ["eggs"] }, l: { items: "Говядина тушёная 150г, стручк. фасоль, бурый рис", kcal: 430, prot: 38, swap: ["beef"] }, s: { items: "Творог 2% 150г, ягоды", kcal: 180, prot: 25, swap: ["cottage"] } },
    { day: "Вс", b: { items: "Свободный завтрак + белок", kcal: 450, prot: 20, swap: [] }, l: { items: "Свободный обед (с белком и овощами)", kcal: 500, prot: 25, swap: [] }, s: { items: "По желанию", kcal: 150, prot: 10, swap: [] } },
  ],
  [
    { day: "Пн", b: { items: "Тост с авокадо и яйцом пашот", kcal: 380, prot: 18, swap: ["eggs"] }, l: { items: "Куриная грудка гриль 180г, айсберг+огурец, киноа", kcal: 420, prot: 42, swap: ["chicken"] }, s: { items: "Творог 5% 130г, грецкие орехи", kcal: 190, prot: 22, swap: ["cottage"] } },
    { day: "Вт", b: { items: "Банан, протеин. йогурт, 2 яйца", kcal: 370, prot: 30, swap: ["eggs"] }, l: { items: "Минтай 200г, цветн. капуста, гречка", kcal: 370, prot: 36, swap: ["pollock"] }, s: { items: "Яблоко, миндаль 20г", kcal: 180, prot: 6, swap: [] } },
    { day: "Ср", b: { items: "Сочник, омлет 2 яйца с зеленью", kcal: 410, prot: 22, swap: ["eggs"] }, l: { items: "Индейка запечённая 180г, помидор+перец, булгур", kcal: 430, prot: 40, swap: ["turkey"] }, s: { items: "Творог 2% 150г, корица", kcal: 160, prot: 25, swap: ["cottage"] } },
    { day: "Чт", b: { items: "Овсянка 40г + ягоды, 2 яйца", kcal: 350, prot: 20, swap: ["eggs"] }, l: { items: "Говяжий стейк 150г, брокколи+фасоль, бурый рис", kcal: 450, prot: 38, swap: ["beef"] }, s: { items: "Протеин. йогурт, 2 дольки шоколада", kcal: 200, prot: 20, swap: [] } },
    { day: "Пт", b: { items: "Бутерброд (хлеб+сыр+курица), огурец", kcal: 390, prot: 26, swap: ["chicken"] }, l: { items: "Форель 150г, руккола+помидоры, чечевица", kcal: 440, prot: 35, swap: ["trout"] }, s: { items: "2 яйца, помидор", kcal: 170, prot: 14, swap: ["eggs"] } },
    { day: "Сб", b: { items: "Сырники 3шт, сметана, ягоды", kcal: 380, prot: 26, swap: ["cottage"] }, l: { items: "Курица тушёная 180г, кабачок, гречка", kcal: 410, prot: 38, swap: ["chicken"] }, s: { items: "Творог 2% 150г, яблоко", kcal: 180, prot: 25, swap: ["cottage"] } },
    { day: "Вс", b: { items: "Свободный завтрак + белок", kcal: 450, prot: 20, swap: [] }, l: { items: "Свободный обед", kcal: 500, prot: 25, swap: [] }, s: { items: "По желанию", kcal: 150, prot: 10, swap: [] } },
  ],
  [
    { day: "Пн", b: { items: "Творожная запеканка 150г, ягоды", kcal: 320, prot: 24, swap: ["cottage"] }, l: { items: "Куриное филе 180г, салат из свёклы, бурый рис", kcal: 440, prot: 38, swap: ["chicken"] }, s: { items: "Протеин. йогурт, миндаль 15г", kcal: 200, prot: 22, swap: [] } },
    { day: "Вт", b: { items: "Бутерброд (хлеб+сливоч. сыр+лосось), 1 яйцо", kcal: 380, prot: 24, swap: ["salmon", "eggs"] }, l: { items: "Треска на пару 200г, брокколи, киноа", kcal: 370, prot: 38, swap: ["cod"] }, s: { items: "Творог 2% 130г, банан", kcal: 210, prot: 22, swap: ["cottage"] } },
    { day: "Ср", b: { items: "Овсянка 40г + яблоко, 2 яйца", kcal: 370, prot: 20, swap: ["eggs"] }, l: { items: "Говядина тушёная 150г, капуста+морковь, гречка", kcal: 430, prot: 36, swap: ["beef"] }, s: { items: "2 яйца, огурец", kcal: 170, prot: 14, swap: ["eggs"] } },
    { day: "Чт", b: { items: "Сочник, омлет 2 яйца, помидор", kcal: 420, prot: 22, swap: ["eggs"] }, l: { items: "Индейка гриль 180г, стручк. фасоль, булгур", kcal: 420, prot: 40, swap: ["turkey"] }, s: { items: "Творог 2% 150г, грецкие орехи", kcal: 190, prot: 25, swap: ["cottage"] } },
    { day: "Пт", b: { items: "Банан, протеин. йогурт, 2 яйца", kcal: 370, prot: 30, swap: ["eggs"] }, l: { items: "Сёмга 150г, айсберг+огурец, чечевица", kcal: 440, prot: 35, swap: ["salmon"] }, s: { items: "Яблоко, миндаль 15г", kcal: 160, prot: 6, swap: [] } },
    { day: "Сб", b: { items: "Сырники 3шт, сметана, ягоды", kcal: 380, prot: 26, swap: ["cottage"] }, l: { items: "Курица 180г, кабачок+баклажан, бурый рис", kcal: 430, prot: 38, swap: ["chicken"] }, s: { items: "Творог 2% 150г, корица", kcal: 160, prot: 25, swap: ["cottage"] } },
    { day: "Вс", b: { items: "Свободный завтрак + белок", kcal: 450, prot: 20, swap: [] }, l: { items: "Свободный обед", kcal: 500, prot: 25, swap: [] }, s: { items: "По желанию", kcal: 150, prot: 10, swap: [] } },
  ],
  [
    { day: "Пн", b: { items: "Тост с авокадо, 2 яйца, помидор", kcal: 400, prot: 20, swap: ["eggs"] }, l: { items: "Куриная грудка 180г, салат греческий, гречка", kcal: 450, prot: 40, swap: ["chicken"] }, s: { items: "Творог 2% 150г, ягоды", kcal: 170, prot: 25, swap: ["cottage"] } },
    { day: "Вт", b: { items: "Сочник, 2 варёных яйца", kcal: 400, prot: 22, swap: ["eggs"] }, l: { items: "Минтай 200г, капуста+брокколи, бурый рис", kcal: 380, prot: 38, swap: ["pollock"] }, s: { items: "Протеин. йогурт, грецкие орехи", kcal: 210, prot: 22, swap: [] } },
    { day: "Ср", b: { items: "Творог 5% 150г, банан, корица", kcal: 330, prot: 26, swap: ["cottage"] }, l: { items: "Говядина 150г, капуста+морковь, чечевица", kcal: 440, prot: 36, swap: ["beef"] }, s: { items: "2 яйца, огурец", kcal: 170, prot: 14, swap: ["eggs"] } },
    { day: "Чт", b: { items: "Бутерброд (хлеб+сыр+индейка), йогурт", kcal: 400, prot: 26, swap: ["turkey"] }, l: { items: "Индейка 180г, кабачок, булгур", kcal: 410, prot: 40, swap: ["turkey"] }, s: { items: "Творог 2% 130г, яблоко", kcal: 170, prot: 22, swap: ["cottage"] } },
    { day: "Пт", b: { items: "Овсянка 40г + ягоды, омлет 2 яйца", kcal: 360, prot: 20, swap: ["eggs"] }, l: { items: "Форель 150г, руккола+черри, киноа", kcal: 440, prot: 35, swap: ["trout"] }, s: { items: "Миндаль 20г, протеин. йогурт", kcal: 210, prot: 22, swap: [] } },
    { day: "Сб", b: { items: "Сырники 3шт, сметана", kcal: 350, prot: 26, swap: ["cottage"] }, l: { items: "Курица тушёная 180г, стручк. фасоль, гречка", kcal: 420, prot: 38, swap: ["chicken"] }, s: { items: "Творог 2% 150г, 2 дольки шоколада", kcal: 200, prot: 25, swap: ["cottage"] } },
    { day: "Вс", b: { items: "Свободный завтрак + белок", kcal: 450, prot: 20, swap: [] }, l: { items: "Свободный обед", kcal: 500, prot: 25, swap: [] }, s: { items: "По желанию", kcal: 150, prot: 10, swap: [] } },
  ],
];

const SHOPPING = {
  0: { protein: ["Куриная грудка 500г", "Куриное бедро 200г", "Треска/минтай 200г", "Сёмга 150г", "Говядина 150г", "Индейка 200г", "Яйца 20шт", "Творог 2% 800г", "Протеин. йогурт ×3", "Сметана 15%", "Лосось сл/с 50г"], vegs: ["Огурцы 6шт", "Помидоры 4шт", "Брокколи 200г", "Кабачок", "Баклажан", "Стручк. фасоль 200г", "Руккола", "Черри", "Бананы 3шт", "Ягоды 200г"], carbs: ["Гречка 300г", "Бурый рис 200г", "Булгур 100г", "Чечевица 200г", "Овсянка 50г", "Хлеб чёрный"], other: ["Сыр 100г", "Сливоч. сыр 50г", "Масло сл./олив.", "Миндаль 30г", "Грецк. орехи 15г", "Тёмн. шоколад", "Корица", "Сочник"] },
  1: { protein: ["Куриная грудка 400г", "Курица 200г", "Минтай 200г", "Форель 150г", "Говядина 150г", "Индейка 200г", "Яйца 20шт", "Творог 2% 600г", "Творог 5% 130г", "Протеин. йогурт ×3", "Сметана"], vegs: ["Огурцы 4шт", "Помидоры 4шт", "Перец 2шт", "Брокколи 200г", "Цветн. капуста 200г", "Кабачок", "Руккола", "Бананы 2шт", "Ягоды", "Яблоко 2шт", "Авокадо"], carbs: ["Гречка 200г", "Бурый рис 200г", "Булгур 100г", "Чечевица 200г", "Киноа 100г", "Овсянка", "Хлеб"], other: ["Сыр 100г", "Масло сл./олив.", "Миндаль 40г", "Грецк. орехи", "Шоколад", "Корица", "Сочник"] },
  2: { protein: ["Куриное филе 400г", "Курица 200г", "Треска 200г", "Сёмга 150г", "Говядина 150г", "Индейка 200г", "Яйца 20шт", "Творог 2% 750г", "Протеин. йогурт ×2", "Сметана", "Лосось сл/с 50г"], vegs: ["Огурцы 4шт", "Помидоры 4шт", "Брокколи", "Стручк. фасоль", "Кабачок", "Баклажан", "Капуста", "Морковь", "Свёкла", "Бананы 2шт", "Ягоды", "Яблоко 2шт"], carbs: ["Гречка 200г", "Бурый рис 200г", "Булгур 100г", "Чечевица 200г", "Киноа 100г", "Овсянка", "Хлеб"], other: ["Сливоч. сыр", "Масло сл./олив.", "Миндаль 30г", "Грецк. орехи", "Корица", "Сочник"] },
  3: { protein: ["Куриная грудка 400г", "Курица 200г", "Минтай 200г", "Форель 150г", "Говядина 150г", "Индейка 200г", "Яйца 20шт", "Творог 2% 600г", "Творог 5% 150г", "Протеин. йогурт ×3", "Сметана", "Фета 50г"], vegs: ["Огурцы 4шт", "Помидоры 4шт", "Перец", "Брокколи", "Цветн. капуста", "Кабачок", "Стручк. фасоль", "Капуста", "Морковь", "Руккола", "Черри", "Бананы 2шт", "Ягоды", "Яблоко 2шт", "Авокадо"], carbs: ["Гречка 200г", "Бурый рис 200г", "Булгур 100г", "Чечевица 200г", "Киноа 100г", "Овсянка", "Хлеб"], other: ["Сыр 100г", "Масло сл./олив.", "Миндаль 40г", "Грецк. орехи", "Шоколад", "Корица", "Сочник"] },
};

const ACT_TYPES = [{ id: "walk", label: "Ходьба", icon: "🚶‍♀️", min: 60 }, { id: "youtube", label: "YouTube", icon: "📺", min: 35 }, { id: "step", label: "Степ", icon: "🏃‍♀️", min: 45 }, { id: "strength", label: "Силовая", icon: "💪", min: 40 }, { id: "other", label: "Другое", icon: "⭐", min: 30 }];
const PROC_TYPES = [{ id: "vacuum", label: "Вакуумный массаж", icon: "💆‍♀️" }, { id: "lpg", label: "LPG", icon: "✨" }, { id: "pressotherapy", label: "Прессотерапия", icon: "🦵" }, { id: "ems", label: "EMS", icon: "⚡" }];
const DEF_SET = { goalWeight: 65, startWeight: 99.05 };

// ======= UI PRIMITIVES =======
const Tab = ({ label, active, onClick, icon }) => (<button onClick={onClick} style={{ background: active ? "rgba(212,168,103,0.15)" : "transparent", border: active ? "1px solid rgba(212,168,103,0.3)" : "1px solid transparent", borderRadius: "10px", padding: "7px 3px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", color: active ? "#d4a867" : "#6b635a", fontSize: "9px", fontFamily: "'DM Sans',sans-serif", fontWeight: active ? 600 : 400, flex: 1, minWidth: 0 }}><span style={{ fontSize: "16px" }}>{icon}</span><span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" }}>{label}</span></button>);
const Card = ({ children, style }) => (<div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "16px", ...style }}>{children}</div>);
const Lb = ({ children }) => (<div style={{ fontSize: "11px", color: "#8a8279", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px", fontWeight: 600 }}>{children}</div>);
const Btn = ({ children, onClick, variant = "primary", style: s, disabled }) => (<button disabled={disabled} onClick={onClick} style={{ padding: "10px 20px", borderRadius: "10px", border: "none", cursor: disabled ? "not-allowed" : "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: "14px", fontWeight: 600, opacity: disabled ? 0.4 : 1, ...(variant === "primary" ? { background: "rgba(212,168,103,0.2)", color: "#d4a867", border: "1px solid rgba(212,168,103,0.3)" } : { background: "rgba(255,255,255,0.05)", color: "#a89f94", border: "1px solid rgba(255,255,255,0.1)" }), ...s }}>{children}</button>);
const Inp = ({ value, onChange, type = "text", placeholder, style: s }) => (<input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "10px 14px", color: "#e8e4df", fontSize: "14px", fontFamily: "'DM Sans',sans-serif", outline: "none", width: "100%", boxSizing: "border-box", ...s }} />);
const XBtn = ({ onClick }) => (<button onClick={e => { e.stopPropagation(); onClick(); }} style={{ background: "none", border: "none", color: "#6b635a", cursor: "pointer", fontSize: "13px", padding: "2px 5px" }}>✕</button>);
const tts = { background: "#2a2520", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "13px", color: "#e8e4df" };

const SelBtn = ({ label, active, onClick }) => (<button onClick={onClick} style={{ padding: "7px 10px", borderRadius: "8px", fontSize: "11px", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", border: active ? "1px solid rgba(212,168,103,0.4)" : "1px solid rgba(255,255,255,0.08)", background: active ? "rgba(212,168,103,0.12)" : "rgba(255,255,255,0.03)", color: active ? "#d4a867" : "#a89f94" }}>{label}</button>);

// ======= PAGES (same logic as artifact, using sv/ld) =======
// Simplified for brevity — all pages follow the same pattern:
// Load data from API on mount, save to API on change

function DashPage({ w, act, sl, wa, set, comp }) {
  const lat = w.length ? w[w.length - 1].weight : set.startWeight;
  const lost = set.startWeight - lat;
  const rem = Math.max(0, lat - set.goalWeight);
  const tot = set.startWeight - set.goalWeight;
  const pct = tot > 0 ? Math.min(100, Math.round((lost / tot) * 100)) : 0;
  const wd = w.length >= 2 ? w[w.length - 1].weight - w[w.length - 2].weight : null;
  const l7 = act.filter(a => (new Date() - new Date(a.date)) < 7 * 864e5);
  const streak = (() => { let c = 0, d = new Date(); for (let i = 0; i < 60; i++) { const ds = d.toISOString().slice(0, 10); if (act.some(a => a.date === ds)) c++; else if (i > 0) break; d.setDate(d.getDate() - 1); } return c; })();
  const avgS = (() => { const r = sl.filter(s => (new Date() - new Date(s.date)) < 7 * 864e5); return r.length ? (r.reduce((a, b) => a + b.hours, 0) / r.length).toFixed(1) : 0; })();
  const tw = wa.find(x => x.date === td())?.glasses || 0;
  const wkD = []; for (let i = 0; i < 7; i++) { const d = new Date(); d.setDate(d.getDate() - i); wkD.push(d.toISOString().slice(0, 10)); }
  const wkC = wkD.map(d => comp.find(c => c.date === d)).filter(Boolean);
  const flw = wkC.filter(c => c.status === "yes").length;

  const ins = [];
  if (avgS && avgS < 7) ins.push({ i: "😴", t: "Сон <7ч → кортизол↑" });
  if (tw < 6) ins.push({ i: "💧", t: `${tw}/8 стаканов воды` });
  if (l7.length < 4) ins.push({ i: "🏃‍♀️", t: `${l7.length} тренировок (нужно 4-5)` });
  if (streak >= 5) ins.push({ i: "🔥", t: `${streak} дней подряд!` });
  if (flw >= 5) ins.push({ i: "🌟", t: `${flw}/7 по плану — отлично!` });
  if (w.length >= 3) { const df = w[w.length - 3].weight - w[w.length - 1].weight; if (df < 0.1 && df > -0.5) ins.push({ i: "📊", t: "Плато — добавь силовую" }); }
  if (!ins.length) ins.push({ i: "✅", t: "Всё по плану!" });
  const ch = w.slice(-14).map(x => ({ date: fD(x.date), weight: x.weight }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <div>
            <div style={{ fontSize: "30px", fontWeight: 700, color: "#e8e4df", display: "flex", alignItems: "baseline", gap: "8px" }}>{lat}<span style={{ fontSize: "15px", color: "#8a8279" }}>кг</span>{wd != null && <Delta val={wd} />}</div>
            <div style={{ fontSize: "12px", color: "#7eb89a" }}>−{lost.toFixed(1)} кг</div>
          </div>
          <div style={{ textAlign: "right" }}><div style={{ fontSize: "12px", color: "#8a8279" }}>До цели</div><div style={{ fontSize: "18px", fontWeight: 600, color: "#d4a867" }}>{rem.toFixed(1)} кг</div></div>
        </div>
        <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: "8px", height: "8px", overflow: "hidden" }}><div style={{ height: "100%", borderRadius: "8px", width: `${pct}%`, background: "linear-gradient(90deg,#7eb89a,#d4a867)" }} /></div>
        <div style={{ fontSize: "11px", color: "#8a8279", textAlign: "right", marginTop: "3px" }}>{pct}%</div>
      </Card>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
        {[{ v: streak, l: "🔥 серия" }, { v: `${l7.length}/5`, l: "🏃‍♀️ нед." }, { v: `${avgS || "—"}ч`, l: "😴 сон" }, { v: `${tw}/8`, l: "💧 вода" }, { v: `${flw}/7`, l: "🍽️ меню" }, { v: wkC.filter(c => c.status === "partial").length, l: "🟡 частич." }].map((x, i) => (
          <Card key={i} style={{ textAlign: "center", padding: "8px" }}><div style={{ fontSize: "16px", fontWeight: 600, color: "#e8e4df" }}>{x.v}</div><div style={{ fontSize: "9px", color: "#8a8279" }}>{x.l}</div></Card>
        ))}
      </div>
      {ch.length > 1 && (<Card><Lb>Вес</Lb><ResponsiveContainer width="100%" height={130}><AreaChart data={ch} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}><defs><linearGradient id="wg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7eb89a" stopOpacity={0.3} /><stop offset="100%" stopColor="#7eb89a" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" /><XAxis dataKey="date" tick={{ fill: "#6b635a", fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: "#6b635a", fontSize: 10 }} axisLine={false} tickLine={false} domain={['dataMin-1', 'dataMax+1']} /><Tooltip contentStyle={tts} /><Area type="monotone" dataKey="weight" stroke="#7eb89a" fill="url(#wg)" strokeWidth={2} /></AreaChart></ResponsiveContainer></Card>)}
      <Card><Lb>Рекомендации</Lb>{ins.map((x, i) => (<div key={i} style={{ display: "flex", gap: "8px", fontSize: "13px", color: "#c4bdb4", lineHeight: 1.5, marginBottom: "5px" }}><span style={{ fontSize: "15px", flexShrink: 0 }}>{x.i}</span><span>{x.t}</span></div>))}</Card>
    </div>
  );
}

function WtPage({ w, setW }) {
  const [val, setVal] = useState(""); const [date, setDate] = useState(td());
  const add = async () => { if (!val) return; const n = [...w.filter(x => x.date !== date), { date, weight: parseFloat(val) }].sort((a, b) => a.date.localeCompare(b.date)); setW(n); await sv("weights", n); setVal(""); };
  const rm = async d => { const n = w.filter(x => x.date !== d); setW(n); await sv("weights", n); };
  const ch = w.map(x => ({ date: fD(x.date), weight: x.weight, full: fDF(x.date) }));
  const wd = [...w].reverse().map((x, i, a) => ({ ...x, d: a[i + 1] ? x.weight - a[i + 1].weight : null }));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <Card><Lb>Записать</Lb><div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}><Inp type="date" value={date} onChange={setDate} style={{ flex: 1, minWidth: "130px" }} /><Inp type="number" value={val} onChange={setVal} placeholder="кг" style={{ width: "80px", flex: "none" }} /><Btn onClick={add} disabled={!val}>+</Btn></div></Card>
      {ch.length > 1 && (<Card><Lb>График</Lb><ResponsiveContainer width="100%" height={180}><AreaChart data={ch} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}><defs><linearGradient id="w2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7eb89a" stopOpacity={0.3} /><stop offset="100%" stopColor="#7eb89a" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" /><XAxis dataKey="date" tick={{ fill: "#6b635a", fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: "#6b635a", fontSize: 10 }} axisLine={false} tickLine={false} domain={['dataMin-1', 'dataMax+1']} /><Tooltip contentStyle={tts} formatter={v => [`${v} кг`]} labelFormatter={(l, p) => p?.[0]?.payload?.full || l} /><Area type="monotone" dataKey="weight" stroke="#7eb89a" fill="url(#w2)" strokeWidth={2} dot={{ r: 3, fill: "#7eb89a" }} /></AreaChart></ResponsiveContainer></Card>)}
      <Card><Lb>Записи</Lb><div style={{ maxHeight: "240px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "4px" }}>{wd.map((x, i) => (<div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", background: "rgba(0,0,0,0.15)", borderRadius: "8px", fontSize: "13px" }}><span style={{ color: "#8a8279" }}>{fDF(x.date)}</span><div style={{ display: "flex", alignItems: "center", gap: "10px" }}><span style={{ color: "#e8e4df", fontWeight: 600 }}>{x.weight} кг</span><Delta val={x.d} /><XBtn onClick={() => rm(x.date)} /></div></div>))}{!w.length && <div style={{ color: "#6b635a", textAlign: "center", padding: "20px" }}>Нет записей</div>}</div></Card>
    </div>
  );
}

function MealPage({ mw, setMw, comp, setComp }) {
  const [showL, setShowL] = useState(false); const [exp, setExp] = useState(-1); const [swp, setSwp] = useState(null);
  const week = MEALS_4W[mw]; const shop = SHOPPING[mw];
  const switchW = async w => { setMw(w); await sv("mealWeek", w); };
  const getD = i => { const now = new Date(); const dow = now.getDay(); const mon = new Date(now); mon.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1)); const d = new Date(mon); d.setDate(mon.getDate() + i); return d.toISOString().slice(0, 10); };
  const setC = async (i, s) => { const date = getD(i); const n = [...comp.filter(c => c.date !== date), { date, status: s }].sort((a, b) => a.date.localeCompare(b.date)); setComp(n); await sv("compliance", n); };
  const getC = i => comp.find(c => c.date === getD(i))?.status || null;
  const ci = { yes: "✅", partial: "🟡", no: "❌" }; const cl = { yes: "По плану", partial: "Частично", no: "Нарушила" }; const cc = { yes: "#7eb89a", partial: "#d4a867", no: "#c47a7a" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <Card><Lb>Неделя</Lb><div style={{ display: "flex", gap: "6px" }}>{[0, 1, 2, 3].map(i => (<Btn key={i} variant={mw === i ? "primary" : "secondary"} onClick={() => switchW(i)} style={{ padding: "8px 16px", fontSize: "13px" }}>{i + 1}</Btn>))}</div></Card>
      {week.map((d, i) => { const total = d.b.kcal + d.l.kcal + d.s.kcal; const prot = d.b.prot + d.l.prot + d.s.prot; const open = exp === i; const cp = getC(i);
        return (<Card key={i} style={{ padding: 0, overflow: "hidden" }}><div onClick={() => setExp(open ? -1 : i)} style={{ padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}><div style={{ display: "flex", alignItems: "center", gap: "8px" }}><span style={{ fontSize: "14px", fontWeight: 600, color: "#e8e4df" }}>{d.day}</span>{cp && <span>{ci[cp]}</span>}</div><div style={{ display: "flex", gap: "8px", alignItems: "center" }}><span style={{ fontSize: "11px", color: "#a89f94", background: "rgba(255,255,255,0.05)", padding: "3px 8px", borderRadius: "6px" }}>{total}</span><span style={{ fontSize: "11px", color: "#7eb89a", background: "rgba(126,184,154,0.1)", padding: "3px 8px", borderRadius: "6px" }}>{prot}г</span><span style={{ color: "#6b635a", fontSize: "11px", transform: open ? "rotate(180deg)" : "none" }}>▼</span></div></div>
          {open && (<div style={{ padding: "0 14px 12px", display: "flex", flexDirection: "column", gap: "8px" }}>
            {[{ l: "Завтрак 7:00", m: d.b, c: "#d4a867" }, { l: "Обед 12:00", m: d.l, c: "#7eb89a" }, { l: "Перекус 15:30", m: d.s, c: "#8a9bb5" }].map(({ l, m, c }, mi) => (<div key={l} style={{ background: "rgba(0,0,0,0.15)", borderRadius: "10px", padding: "10px 12px", borderLeft: `3px solid ${c}` }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}><span style={{ fontSize: "10px", fontWeight: 600, color: c, textTransform: "uppercase", letterSpacing: "0.5px" }}>{l}</span><span style={{ fontSize: "10px", color: "#8a8279" }}>{m.kcal} ккал · {m.prot}г</span></div><div style={{ fontSize: "13px", color: "#c4bdb4", lineHeight: 1.6 }}>{m.items}</div>
              {m.swap?.length > 0 && (<div style={{ marginTop: "6px" }}><button onClick={e => { e.stopPropagation(); setSwp(swp === `${i}-${mi}` ? null : `${i}-${mi}`); }} style={{ background: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", padding: "4px 10px", color: "#8a8279", fontSize: "11px", cursor: "pointer", fontFamily: "'DM Sans'" }}>🔄 Замены</button>{swp === `${i}-${mi}` && (<div style={{ marginTop: "6px", background: "rgba(0,0,0,0.2)", borderRadius: "8px", padding: "8px 10px" }}>{m.swap.map(sk => { const s = SWAPS[sk]; if (!s) return null; return (<div key={sk} style={{ marginBottom: "4px" }}><span style={{ fontSize: "11px", color: "#d4a867" }}>{s.main}</span><span style={{ fontSize: "11px", color: "#6b635a" }}> → </span><span style={{ fontSize: "11px", color: "#a89f94" }}>{s.alts.join(" / ")}</span></div>); })}</div>)}</div>)}
            </div>))}
            <div style={{ display: "flex", gap: "6px", justifyContent: "center", marginTop: "4px" }}>{["yes", "partial", "no"].map(s => (<button key={s} onClick={e => { e.stopPropagation(); setC(i, s); }} style={{ padding: "6px 12px", borderRadius: "8px", fontSize: "12px", cursor: "pointer", fontFamily: "'DM Sans'", border: cp === s ? `1px solid ${cc[s]}` : "1px solid rgba(255,255,255,0.08)", background: cp === s ? `${cc[s]}20` : "rgba(255,255,255,0.03)", color: cp === s ? cc[s] : "#8a8279" }}>{ci[s]} {cl[s]}</button>))}</div>
          </div>)}</Card>);
      })}
      <Card><Lb>Следование (неделя)</Lb><div style={{ display: "flex", gap: "4px", justifyContent: "center" }}>{week.map((d, i) => { const c = getC(i); return (<div key={i} style={{ width: "36px", height: "36px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", background: c ? `${cc[c]}20` : "rgba(255,255,255,0.05)", border: c ? `1px solid ${cc[c]}40` : "1px solid rgba(255,255,255,0.08)", fontSize: "11px", color: c ? cc[c] : "#6b635a", fontWeight: 600 }}>{c ? ci[c] : d.day}</div>); })}</div></Card>
      <Btn onClick={() => setShowL(!showL)} style={{ width: "100%" }}>{showL ? "Скрыть" : "🛒 Список покупок"}</Btn>
      {showL && (<Card><Lb>Покупки — Неделя {mw + 1}</Lb>{[{ l: "🥩 Белок", it: shop.protein }, { l: "🥬 Овощи", it: shop.vegs }, { l: "🌾 Крупы", it: shop.carbs }, { l: "🧂 Прочее", it: shop.other }].map(({ l, it }) => (<div key={l} style={{ marginBottom: "10px" }}><div style={{ fontSize: "12px", fontWeight: 600, color: "#d4a867", marginBottom: "3px" }}>{l}</div>{it.map((x, j) => (<div key={j} style={{ fontSize: "12px", color: "#c4bdb4", padding: "2px 0" }}>▪ {x}</div>))}</div>))}</Card>)}
    </div>
  );
}

function ActPage({ act, setAct }) {
  const [sel, setSel] = useState("walk"); const [dur, setDur] = useState(""); const [date, setDate] = useState(td()); const [note, setNote] = useState("");
  const add = async () => { const t = ACT_TYPES.find(a => a.id === sel); const n = [...act, { date, type: sel, label: t.label, icon: t.icon, duration: parseInt(dur) || t.min, note }].sort((a, b) => a.date.localeCompare(b.date)); setAct(n); await sv("activities", n); setDur(""); setNote(""); };
  const rm = async i => { const r = [...act].reverse(); r.splice(i, 1); const n = r.reverse(); setAct(n); await sv("activities", n); };
  const ta = act.filter(a => a.date === td()); const tm = ta.reduce((s, a) => s + a.duration, 0);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <Card><Lb>Добавить</Lb><div style={{ display: "flex", gap: "5px", flexWrap: "wrap", marginBottom: "10px" }}>{ACT_TYPES.map(t => (<SelBtn key={t.id} label={`${t.icon} ${t.label}`} active={sel === t.id} onClick={() => { setSel(t.id); setDur(String(t.min)); }} />))}</div><div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}><Inp type="date" value={date} onChange={setDate} style={{ flex: 1 }} /><Inp type="number" value={dur} onChange={setDur} placeholder="мин" style={{ width: "70px", flex: "none" }} /></div><Inp value={note} onChange={setNote} placeholder="Заметка" style={{ marginBottom: "10px" }} /><Btn onClick={add} style={{ width: "100%" }}>Записать</Btn></Card>
      <Card><div style={{ display: "flex", justifyContent: "space-between" }}><Lb>Сегодня</Lb><span style={{ fontSize: "13px", color: tm >= 30 ? "#7eb89a" : "#8a8279", fontWeight: 600 }}>{tm} мин</span></div>{ta.length ? ta.map((a, i) => (<div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "7px 10px", background: "rgba(0,0,0,0.15)", borderRadius: "8px", fontSize: "13px", marginBottom: "3px" }}><span style={{ color: "#c4bdb4" }}>{a.icon} {a.label}</span><span style={{ color: "#d4a867" }}>{a.duration} мин</span></div>)) : <div style={{ color: "#6b635a", textAlign: "center", padding: "10px", fontSize: "13px" }}>Пусто</div>}</Card>
      <Card><Lb>История</Lb><div style={{ maxHeight: "200px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "3px" }}>{[...act].reverse().slice(0, 20).map((a, i) => (<div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 10px", background: "rgba(0,0,0,0.1)", borderRadius: "8px", fontSize: "12px" }}><span style={{ color: "#8a8279" }}>{fDF(a.date)}</span><span style={{ color: "#c4bdb4" }}>{a.icon} {a.label}</span><div style={{ display: "flex", alignItems: "center", gap: "5px" }}><span style={{ color: "#d4a867" }}>{a.duration}м</span><XBtn onClick={() => rm(i)} /></div></div>))}</div></Card>
    </div>
  );
}

function ProcPage({ proc, setProc }) {
  const [sel, setSel] = useState("vacuum"); const [date, setDate] = useState(td()); const [note, setNote] = useState("");
  const add = async () => { const t = PROC_TYPES.find(p => p.id === sel); const n = [...proc, { date, type: sel, label: t.label, icon: t.icon, note }].sort((a, b) => a.date.localeCompare(b.date)); setProc(n); await sv("procedures", n); setNote(""); };
  const rm = async i => { const r = [...proc].reverse(); r.splice(i, 1); const n = r.reverse(); setProc(n); await sv("procedures", n); };
  const tm = proc.filter(p => p.date.slice(0, 7) === td().slice(0, 7));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <Card><Lb>Процедура</Lb><div style={{ display: "flex", gap: "5px", flexWrap: "wrap", marginBottom: "10px" }}>{PROC_TYPES.map(t => (<SelBtn key={t.id} label={`${t.icon} ${t.label}`} active={sel === t.id} onClick={() => setSel(t.id)} />))}</div><Inp type="date" value={date} onChange={setDate} style={{ marginBottom: "8px" }} /><Inp value={note} onChange={setNote} placeholder="Заметка" style={{ marginBottom: "10px" }} /><Btn onClick={add} style={{ width: "100%" }}>Записать</Btn></Card>
      <Card><Lb>Этот месяц</Lb><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>{PROC_TYPES.map(t => ({ ...t, count: tm.filter(p => p.type === t.id).length })).map(c => (<div key={c.id} style={{ background: "rgba(0,0,0,0.15)", borderRadius: "10px", padding: "10px", textAlign: "center" }}><div style={{ fontSize: "18px" }}>{c.icon}</div><div style={{ fontSize: "16px", fontWeight: 600, color: "#e8e4df" }}>{c.count}</div><div style={{ fontSize: "9px", color: "#8a8279" }}>{c.label}</div></div>))}</div></Card>
      <Card><Lb>История</Lb><div style={{ maxHeight: "200px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "3px" }}>{[...proc].reverse().slice(0, 20).map((p, i) => (<div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 10px", background: "rgba(0,0,0,0.1)", borderRadius: "8px", fontSize: "12px" }}><span style={{ color: "#8a8279" }}>{fDF(p.date)}</span><span style={{ color: "#c4bdb4" }}>{p.icon} {p.label}</span><XBtn onClick={() => rm(i)} /></div>))}</div></Card>
    </div>
  );
}

function SlWaPage({ sl, setSl, wa, setWa }) {
  const [sh, setSh] = useState(""); const [sd, setSd] = useState(td());
  const tw = wa.find(w => w.date === td())?.glasses || 0;
  const addS = async () => { if (!sh) return; const n = [...sl.filter(s => s.date !== sd), { date: sd, hours: parseFloat(sh) }].sort((a, b) => a.date.localeCompare(b.date)); setSl(n); await sv("sleep", n); setSh(""); };
  const rmS = async d => { const n = sl.filter(s => s.date !== d); setSl(n); await sv("sleep", n); };
  const setW = async g => { const d = td(); const n = [...wa.filter(w => w.date !== d), { date: d, glasses: g }]; setWa(n); await sv("water", n); };
  const sc = sl.slice(-14).map(s => ({ date: fD(s.date), hours: s.hours }));
  const a7 = (() => { const r = sl.filter(s => (new Date() - new Date(s.date)) < 7 * 864e5); return r.length ? (r.reduce((a, b) => a + b.hours, 0) / r.length).toFixed(1) : "—"; })();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <Card><Lb>💧 Вода</Lb><div style={{ display: "flex", gap: "6px", justifyContent: "center", marginBottom: "6px" }}>{[1, 2, 3, 4, 5, 6, 7, 8].map(g => (<button key={g} onClick={() => setW(g)} style={{ width: "34px", height: "34px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "15px", background: g <= tw ? "rgba(100,180,220,0.25)" : "rgba(255,255,255,0.05)", color: g <= tw ? "#64b4dc" : "#5a534b" }}>💧</button>))}</div><div style={{ textAlign: "center", fontSize: "13px", color: tw >= 6 ? "#7eb89a" : "#c47a7a" }}>{tw}/8{tw >= 8 ? " ✅" : ""}</div></Card>
      <Card><Lb>😴 Сон</Lb><div style={{ display: "flex", gap: "8px", alignItems: "center" }}><Inp type="date" value={sd} onChange={setSd} style={{ flex: 1 }} /><Inp type="number" value={sh} onChange={setSh} placeholder="ч" style={{ width: "65px", flex: "none" }} /><Btn onClick={addS} disabled={!sh}>+</Btn></div><div style={{ marginTop: "6px", fontSize: "12px", color: "#8a8279" }}>Среднее 7дн: <span style={{ color: a7 >= 7 ? "#7eb89a" : "#c47a7a", fontWeight: 600 }}>{a7}ч</span></div></Card>
      {sc.length > 1 && (<Card><Lb>График сна</Lb><ResponsiveContainer width="100%" height={120}><AreaChart data={sc} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}><defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8a9bb5" stopOpacity={0.3} /><stop offset="100%" stopColor="#8a9bb5" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" /><XAxis dataKey="date" tick={{ fill: "#6b635a", fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: "#6b635a", fontSize: 10 }} axisLine={false} tickLine={false} domain={[4, 10]} /><Tooltip contentStyle={tts} /><Area type="monotone" dataKey="hours" stroke="#8a9bb5" fill="url(#sg)" strokeWidth={2} /></AreaChart></ResponsiveContainer></Card>)}
      <Card><Lb>Записи</Lb><div style={{ maxHeight: "150px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "3px" }}>{[...sl].reverse().slice(0, 10).map((s, i) => (<div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 10px", background: "rgba(0,0,0,0.15)", borderRadius: "8px", fontSize: "13px" }}><span style={{ color: "#8a8279" }}>{fDF(s.date)}</span><div style={{ display: "flex", alignItems: "center", gap: "8px" }}><span style={{ color: s.hours >= 7 ? "#7eb89a" : "#c47a7a", fontWeight: 600 }}>{s.hours}ч</span><XBtn onClick={() => rmS(s.date)} /></div></div>))}</div></Card>
    </div>
  );
}

function MeasPage({ meas, setMeas }) {
  const [date, setDate] = useState(td()); const [w, setW] = useState(""); const [h, setH] = useState("");
  const add = async () => { if (!w && !h) return; const e = { date, waist: parseFloat(w) || null, hips: parseFloat(h) || null }; const n = [...meas.filter(m => m.date !== date), e].sort((a, b) => a.date.localeCompare(b.date)); setMeas(n); await sv("measurements", n); setW(""); setH(""); };
  const rm = async d => { const n = meas.filter(m => m.date !== d); setMeas(n); await sv("measurements", n); };
  const ch = meas.filter(m => m.waist || m.hips).map(m => ({ date: fD(m.date), waist: m.waist, hips: m.hips }));
  const wd = [...meas].reverse().map((m, i, a) => { const p = a[i + 1]; return { ...m, wd: p && m.waist && p.waist ? m.waist - p.waist : null, hd: p && m.hips && p.hips ? m.hips - p.hips : null }; });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <Card><Lb>📏 Замеры</Lb><Inp type="date" value={date} onChange={setDate} style={{ marginBottom: "8px" }} /><div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}><Inp type="number" value={w} onChange={setW} placeholder="Талия (см)" /><Inp type="number" value={h} onChange={setH} placeholder="Бёдра (см)" /></div><Btn onClick={add} style={{ width: "100%" }} disabled={!w && !h}>Записать</Btn></Card>
      {ch.length > 1 && (<Card><Lb>Динамика</Lb><ResponsiveContainer width="100%" height={150}><LineChart data={ch} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" /><XAxis dataKey="date" tick={{ fill: "#6b635a", fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: "#6b635a", fontSize: 10 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={tts} /><Line type="monotone" dataKey="waist" stroke="#d4a867" strokeWidth={2} dot={{ r: 3 }} name="Талия" /><Line type="monotone" dataKey="hips" stroke="#8a9bb5" strokeWidth={2} dot={{ r: 3 }} name="Бёдра" /></LineChart></ResponsiveContainer><div style={{ display: "flex", gap: "14px", justifyContent: "center", marginTop: "4px" }}><span style={{ fontSize: "11px", color: "#d4a867" }}>● Талия</span><span style={{ fontSize: "11px", color: "#8a9bb5" }}>● Бёдра</span></div></Card>)}
      <Card><Lb>Записи</Lb><div style={{ maxHeight: "200px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "4px" }}>{wd.map((m, i) => (<div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", background: "rgba(0,0,0,0.1)", borderRadius: "8px", fontSize: "12px", flexWrap: "wrap", gap: "3px" }}><span style={{ color: "#8a8279" }}>{fDF(m.date)}</span><div style={{ display: "flex", alignItems: "center", gap: "5px", flexWrap: "wrap" }}>{m.waist && <><span style={{ color: "#d4a867" }}>Т:{m.waist}</span><Delta val={m.wd} unit="см" /></>}{m.hips && <><span style={{ color: "#8a9bb5" }}>Б:{m.hips}</span><Delta val={m.hd} unit="см" /></>}<XBtn onClick={() => rm(m.date)} /></div></div>))}</div></Card>
    </div>
  );
}

function SetPage({ set, setSet }) {
  const [g, setG] = useState(String(set.goalWeight)); const [s, setS] = useState(String(set.startWeight));
  const save = async () => { const n = { goalWeight: parseFloat(g) || 65, startWeight: parseFloat(s) || 99.05 }; setSet(n); await sv("settings", n); };
  return (<Card><Lb>⚙️ Настройки</Lb><div style={{ marginBottom: "12px" }}><div style={{ fontSize: "13px", color: "#a89f94", marginBottom: "6px" }}>Начальный вес (кг)</div><Inp type="number" value={s} onChange={setS} /></div><div style={{ marginBottom: "14px" }}><div style={{ fontSize: "13px", color: "#a89f94", marginBottom: "6px" }}>Целевой вес (кг)</div><Inp type="number" value={g} onChange={setG} /></div><Btn onClick={save} style={{ width: "100%" }}>Сохранить</Btn></Card>);
}

// ======= MAIN APP =======
export default function Tracker() {
  const [tab, setTab] = useState("dash"); const [loading, setLoading] = useState(true);
  const [w, setW] = useState([]); const [act, setAct] = useState([]);
  const [sl, setSl] = useState([]); const [wa, setWa] = useState([]);
  const [meas, setMeas] = useState([]); const [proc, setProc] = useState([]);
  const [mw, setMw] = useState(0); const [set, setSet] = useState(DEF_SET);
  const [comp, setComp] = useState([]);

  useEffect(() => { (async () => {
    const [a, b, c, d, e, f, g, h, i] = await Promise.all([ld("weights"), ld("activities"), ld("sleep"), ld("water"), ld("measurements"), ld("procedures"), ld("mealWeek", 0), ld("settings", DEF_SET), ld("compliance")]);
    setW(a); setAct(b); setSl(c); setWa(d); setMeas(e); setProc(f); setMw(g); setSet(h); setComp(i); setLoading(false);
  })(); }, []);

  if (loading) return (<div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#1a1815", color: "#d4a867" }}>Загрузка...</div>);

  const tabs = [{ id: "dash", label: "Главная", icon: "📊" }, { id: "weight", label: "Вес", icon: "⚖️" }, { id: "meals", label: "Меню", icon: "🍽️" }, { id: "activity", label: "Спорт", icon: "🏃‍♀️" }, { id: "procedures", label: "Процед.", icon: "💆‍♀️" }, { id: "sleep", label: "Сон/💧", icon: "😴" }, { id: "measure", label: "Замеры", icon: "📏" }, { id: "settings", label: "⚙️", icon: "⚙️" }];

  return (
    <div style={{ background: "linear-gradient(145deg,#1a1815,#1e1b17,#1a1815)", minHeight: "100vh", fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{ padding: "12px 14px 0", maxWidth: "600px", margin: "0 auto", width: "100%", boxSizing: "border-box", textAlign: "center" }}>
        <h1 style={{ fontSize: "17px", fontWeight: 700, color: "#e8e4df", margin: "0 0 2px" }}>Мой трекер</h1>
        <p style={{ fontSize: "11px", color: "#6b635a", margin: "0 0 10px" }}>Цель: {set.goalWeight} кг</p>
      </div>
      <div style={{ padding: "0 14px 90px", maxWidth: "600px", margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
        {tab === "dash" && <DashPage w={w} act={act} sl={sl} wa={wa} set={set} comp={comp} />}
        {tab === "weight" && <WtPage w={w} setW={setW} />}
        {tab === "meals" && <MealPage mw={mw} setMw={setMw} comp={comp} setComp={setComp} />}
        {tab === "activity" && <ActPage act={act} setAct={setAct} />}
        {tab === "procedures" && <ProcPage proc={proc} setProc={setProc} />}
        {tab === "sleep" && <SlWaPage sl={sl} setSl={setSl} wa={wa} setWa={setWa} />}
        {tab === "measure" && <MeasPage meas={meas} setMeas={setMeas} />}
        {tab === "settings" && <SetPage set={set} setSet={setSet} />}
      </div>
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(26,24,21,0.95)", borderTop: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(10px)", padding: "4px 4px 8px", display: "flex", gap: "1px", justifyContent: "center", maxWidth: "600px", margin: "0 auto" }}>
        {tabs.map(t => (<Tab key={t.id} label={t.label} icon={t.icon} active={tab === t.id} onClick={() => setTab(t.id)} />))}
      </div>
    </div>
  );
}
