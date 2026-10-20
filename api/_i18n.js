// 伺服器端三語輔助：短標籤（港名、來源、狀態、角色、欄位值）用字典翻譯；
// 判斷文字、摘要等長句由 _plan.js 的 *_ja / *_en 欄位提供（缺的時候才用字典退而求其次）。
export const LANGS = ["ja", "en"];
const WK = { zh: ["日", "一", "二", "三", "四", "五", "六"], ja: ["日", "月", "火", "水", "木", "金", "土"], en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] };
export const weekday = (wd, lang) => (WK[lang] || WK.zh)[wd];

// zh → [ja, en]；長的詞放前面優先比對
const DICT = [
  ["Flexport Atlas（座標取自 MyShipTracking 10:04Z）", "Flexport Atlas（座標は MyShipTracking 10:04Z）", "Flexport Atlas (position from MyShipTracking 10:04Z)"],
  ["最早到・需確認收櫃", "最早着・積めるか要確認", "Earliest · ask if it can load"],
  ["收櫃截止已過・要陽明同意晚一點進櫃", "搬入締切は経過・Yang Ming の了承が必要", "Cut-off passed · Yang Ming must accept late"],
  ["要問能否裝船・長榮表未列", "積めるか要確認・Evergreen 表に未掲載", "Ask if it can load · not on Evergreen list"],
  ["順問・長榮表未列", "併せて確認・Evergreen 表に未掲載", "Ask too · not on Evergreen list"],
  ["順問・收櫃截止已過", "併せて確認・搬入締切は経過", "Ask too · cut-off passed"],
  ["參考・趕不上", "参考・間に合わない", "Reference · too late"],
  ["最後手段", "最終手段", "Last resort"],
  ["基本盤", "本命", "Baseline"],
  ["陽明基隆靠泊表", "Yang Ming 基隆着岸予定表", "Yang Ming Keelung berth list"],
  ["陽明日本代理", "Yang Ming 日本代理店", "Yang Ming Japan agent"],
  ["德翔日本代理", "TS Lines 日本代理店", "TS Lines Japan agent"],
  ["併櫃業者船期", "混載業者スケジュール", "LCL consolidator schedule"],
  ["NOWnews（氣象署）", "NOWnews（台湾・中央気象署）", "NOWnews (Taiwan CWA)"],
  ["德翔 TS Lines", "TS Lines", "TS Lines"],
  ["陽明 Yang Ming", "Yang Ming", "Yang Ming"],
  ["長榮／萬海", "Evergreen／Wan Hai", "Evergreen / Wan Hai"],
  ["德翔官網", "TS Lines 公式", "TS Lines official"],
  ["ONE 官網", "ONE 公式", "ONE official"],
  ["長榮官網", "Evergreen 公式", "Evergreen official"],
  ["中央氣象署", "台湾・中央気象署", "Taiwan CWA"],
  ["整櫃未公布", "FCL 未発表", "FCL not published"],
  ["（即時）", "（リアルタイム）", " (live)"],
  ["未公布", "未発表", "not published"],
  ["截止已過", "締切は経過", "Cut-off passed"],
  ["已過", "経過", "passed"],
  ["未列", "未掲載", "not listed"],
  ["推估", "推定", "estimate"],
  ["快照", "スナップショット", "snapshot"],
  ["航行中", "航行中", "Under way"],
  ["靠泊中", "着岸中", "Berthed"],
  ["錨泊中", "錨泊中", "At anchor"],
  ["停留中", "停留中", "Stationary"],
  ["台北港", "台北港", "Taipei Port"],
  ["新加坡", "シンガポール", "Singapore"],
  ["名古屋", "名古屋", "Nagoya"],
  ["基隆", "基隆", "Keelung"],
  ["台中", "台中", "Taichung"],
  ["高雄", "高雄", "Kaohsiung"],
  ["神戶", "神戸", "Kobe"],
  ["大阪", "大阪", "Osaka"],
  ["東京", "東京", "Tokyo"],
  ["香港", "香港", "Hong Kong"],
  ["橫濱", "横浜", "Yokohama"],
  ["門司", "門司", "Moji"],
  ["博多", "博多", "Hakata"],
  ["釜山", "釜山", "Busan"],
  ["約 ", "約 ", "approx. "],
];
const WKZH = "日一二三四五六";
export function tr(str, lang) {
  if (str == null || lang === "zh") return str;
  if (Array.isArray(str)) return str.map((x) => tr(x, lang));
  let s = String(str).replace(/（([日一二三四五六])）/g, (_, c) => (lang === "en" ? ` (${WK.en[WKZH.indexOf(c)]}) ` : `（${WK.ja[WKZH.indexOf(c)]}）`));
  const li = lang === "ja" ? 1 : 2;
  for (const row of DICT) s = s.split(row[0]).join(row[li]);
  return lang === "en" ? s.replace(/\s{2,}/g, " ").replace(/\s+\)/g, ")").trim() : s;
}
// 加上 key_ja / key_en（已有就不覆蓋）
export function localize(obj, keys) {
  if (!obj) return obj;
  for (const k of keys) if (obj[k] != null) for (const l of LANGS) if (obj[`${k}_${l}`] == null) obj[`${k}_${l}`] = tr(obj[k], l);
  return obj;
}
export const T3 = (zh, ja, en) => ({ zh, ja, en });
// 中文方位（JMA 以日文漢字給：西北西 等）→ 英文
export function compassEn(s) {
  if (!s) return "";
  const m = { 北: "N", 東: "E", 南: "S", 西: "W" };
  return [...String(s)].every((c) => m[c]) ? [...String(s)].map((c) => m[c]).join("") : s;
}

// 長句拆成條列：陣列原樣回傳；字串依「；」「。」（英文 "; " 或句點）切開
export function bullets(s, lang = "zh") {
  if (s == null || s === "") return [];
  if (Array.isArray(s)) return s.filter(Boolean);
  const re = lang === "en" ? /;\s+|(?<=\.)\s+(?=[A-Z])/ : /[；;]\s*|(?<=。)/;
  const parts = String(s).split(re).map((x) => x.trim()).filter(Boolean);
  return lang === "en" ? parts.map((x) => x[0].toUpperCase() + x.slice(1)) : parts;
}
