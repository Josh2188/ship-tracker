// GET /api/data            → 船期（官網即時，抓不到的欄位改用 _plan.js 快照）、判斷、颱風（即時）
// GET /api/data?live=1     → 另外即時抓各船 AIS 船位
// GET /api/data?live=1&force=1 → 略過快取
import { PLAN } from "./_plan.js";
import { liveFor } from "./_ais.js";
import { liveSchedule, liveTyphoon } from "./_live.js";
import { tr, localize, weekday, compassEn, bullets } from "./_i18n.js";

// ISO with offset → port-local parts (string is already in port local time)
function parts(isoStr) {
  const m = String(isoStr || "").match(/(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d)(?::\d\d)?([+-]\d\d:\d\d)/);
  if (!m) return null;
  const wd = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])).getUTCDay();
  return { y: +m[1], mo: +m[2], d: +m[3], hh: m[4], mm: m[5], off: m[6], wd };
}
const md = (p) => `${p.mo}/${p.d}`;
function fmtLocal(isoStr, dateOnly, lang = "zh") {
  const p = parts(isoStr); if (!p) return null;
  const w = weekday(p.wd, lang);
  if (lang === "en") return `${md(p)} (${w})` + (dateOnly ? "" : ` ${p.hh}:${p.mm}`);
  return `${md(p)}（${w}）` + (dateOnly ? "" : `${p.hh}:${p.mm}`);
}
const L3 = ["zh", "ja", "en"], sfx = (l) => (l === "zh" ? "" : "_" + l);
function taipeiHM(isoStr) {
  const n = Date.parse(isoStr); if (isNaN(n)) return "";
  const d = new Date(n + 8 * 3600e3);
  return `${d.getUTCMonth() + 1}/${d.getUTCDate()} ${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
}
const taipeiDay = (isoStr) => { const d = new Date(Date.parse(isoStr) + 8 * 3600e3); return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()); };
const dayStr = (ms) => new Date(ms).toISOString().slice(0, 10);
// Non-working days for customs clearance / container release / trucking: weekends + PLAN.meta.holidays (YYYY-MM-DD,
// Taiwan weekday holidays such as the 10/26 make-up day). meta.nonWorkingDays is still accepted as an alias.
const offDays = () => new Set([...((PLAN.meta && PLAN.meta.holidays) || []), ...((PLAN.meta && PLAN.meta.nonWorkingDays) || [])]);
export const isWorkday = (ms) => { const w = new Date(ms).getUTCDay(); return w !== 0 && w !== 6 && !offDays().has(dayStr(ms)); };
function nextBiz(ms) { let d = ms + 864e5; while (!isWorkday(d)) d += 864e5; return d; }
// 到港後約 2–3 個工作天送進工廠（會加急）：從到港日起算第 2、第 3 個工作天；到港是範圍時，晚的那天也照算。
function addBiz(ms, n) { let d = ms; for (let i = 0; i < n; i++) d = nextBiz(d); return d; }
export function plantRange(etaFromIso, etaToIso) {
  const a = taipeiDay(etaFromIso), p1 = addBiz(a, 2), p2 = Math.max(addBiz(a, 3), etaToIso ? addBiz(taipeiDay(etaToIso), 3) : 0);
  return { from: dayStr(p1), to: dayStr(p2) };
}

export function mergeVessel(v, L) {
  const out = JSON.parse(JSON.stringify(v));
  const fAll = (L && L.fields) || {};
  // officialContradicted.fields: official values that tracking (AIS) shows can't happen. They are shown as
  // "officialLive" next to the snapshot estimate and never replace the snapshot text, dates or plant.
  const contra = new Set((v.officialContradicted && v.officialContradicted.fields) || []);
  const f = Object.fromEntries(Object.entries(fAll).filter(([k]) => !contra.has(k)));
  const changes = [];
  const ch = (zh, ja, en) => changes.push({ zh, ja, en });
  out.liveError = L && L.error ? L.error : null;
  out.liveError_ja = L && L.error ? L.error_ja || tr(L.error, "ja") : null;
  out.liveError_en = L && L.error ? L.error_en || tr(L.error, "en") : null;
  out.liveAt = L && L.fetchedAt;
  const snap = (k) => localize({ text: v[k] && v[k].text, src: v[k] && v[k].src, note: v[k] && v[k].note }, ["text", "src"]);
  for (const k of ["cyCut", "kobeEtd", "twEta"]) {
    const x = fAll[k];
    if (!x) { out[k] = { ...v[k], badge: "fallback" }; continue; }
    const state = k === "cyCut" && x.iso ? (Date.parse(x.iso) < Date.now() ? "passed" : "open") : v[k] && v[k].state;
    const port = x.port || v.twPort;
    out[k] = { srcUrl: x.srcUrl, badge: "live", iso: x.iso, state, snapshot: snap(k) };
    for (const l of L3) {
      let text = x.iso ? (k === "twEta" ? `${tr(port, l)} ` : "") + fmtLocal(x.iso, x.dateOnly, l) : tr(x.text || "未列", l);
      if (k === "cyCut" && x.iso && state === "passed") text += { zh: " 已過", ja: " 経過", en: " (passed)" }[l];
      const tp = x.iso && k !== "twEta" && !x.dateOnly ? { zh: "台北時間 ", ja: "台湾時間 ", en: "Taipei time " }[l] + taipeiHM(x.iso) : "";
      const xn = x["note" + sfx(l)] != null ? x["note" + sfx(l)] : tr(x.note, l);
      out[k]["text" + sfx(l)] = text;
      let bl = bullets(xn, l);
      // 日文即時註記用「、」連接；若依「、」切開後條數與中文相同，就照中文分條
      if (l === "ja" && bl.length === 1) { const nz = bullets(x.note, "zh").length, alt = String(xn).split("、"); if (nz > 1 && alt.length === nz) bl = alt; }
      out[k]["note" + sfx(l)] = [tp, ...bl].filter(Boolean);
      out[k]["src" + sfx(l)] = x["src" + sfx(l)] || tr(x.src, l);
    }
    if (contra.has(k)) {
      const lv = out[k], ol = { srcUrl: lv.srcUrl, iso: lv.iso };
      for (const l of L3) { ol["text" + sfx(l)] = lv["text" + sfx(l)]; ol["src" + sfx(l)] = lv["src" + sfx(l)]; }
      out[k] = { ...v[k], badge: "fallback", officialContradicted: true, officialLive: ol };
      continue;
    }
    if (k === "twEta" && x.port) out.twPort = x.port;
  }
  // change detection vs. snapshot dates
  const d = v.dates || {};
  if (f.kobeEtd && f.kobeEtd.iso && d.etd) {
    const a = parts(f.kobeEtd.iso), b = parts(d.etd);
    if (a && b && md(a) !== md(b)) ch(`神戶開航：快照 ${md(b)} → 官網 ${md(a)}`, `神戸出港：スナップショット ${md(b)} → 公式 ${md(a)}`, `Kobe departure: snapshot ${md(b)} → official ${md(a)}`);
  }
  if (f.twEta && f.twEta.iso && d.etaFrom) {
    const live = taipeiDay(f.twEta.iso), lo = taipeiDay(d.etaFrom), hi = d.etaTo ? taipeiDay(d.etaTo) : lo;
    if (live < lo || live > hi) ch(`台灣到港：快照 ${v.twEta.text} → 官網 ${out.twEta.text}`, `台湾着：スナップショット ${tr(v.twEta.text, "ja")} → 公式 ${out.twEta.text_ja}`, `Taiwan arrival: snapshot ${tr(v.twEta.text, "en")} → official ${out.twEta.text_en}`);
  }
  if (f.cyCut && f.cyCut.iso) {
    const p = parts(f.cyCut.iso);
    if (!String(v.cyCut && v.cyCut.text || "").includes(md(p))) ch(`CY 截止：快照「${v.cyCut.text}」→ 官網 ${out.cyCut.text}`, `CY 締切：スナップショット「${tr(v.cyCut.text, "ja")}」→ 公式 ${out.cyCut.text_ja}`, `CY cut-off: snapshot "${tr(v.cyCut.text, "en")}" → official ${out.cyCut.text_en}`);
  }
  // dates / plant from live values
  out.dates = { ...d };
  if (f.kobeEtd && f.kobeEtd.iso) out.dates.etd = f.kobeEtd.iso;
  if (f.twEta && f.twEta.iso) {
    out.dates.etaFrom = f.twEta.iso; out.dates.etaTo = null;
    const pr = plantRange(f.twEta.iso), p1 = Date.parse(pr.from + "T00:00:00Z"), p2 = Date.parse(pr.to + "T00:00:00Z");
    out.dates.plantFrom = dayStr(p1); out.dates.plantTo = dayStr(p2);
    const a = new Date(p1), b = new Date(p2);
    const text = `${a.getUTCMonth() + 1}/${a.getUTCDate()}–${b.getUTCMonth() === a.getUTCMonth() ? b.getUTCDate() : (b.getUTCMonth() + 1) + "/" + b.getUTCDate()}`;
    out.plant = { text, text_ja: text, text_en: text, note: ["依官網到港日推算：到港後約 2–3 個工作天（週末、假日不算），會加急處理"], note_ja: ["公式の着港日から推定：着港後 約 2–3 営業日（週末・祝日は数えない）、急ぎで対応"], note_en: ["From the official arrival: about 2–3 working days after arrival (weekends and holidays don't count), rushed"], badge: "live", snapshot: { text: v.plant && v.plant.text, note: v.plant && v.plant.note } };
    if (v.plant && v.plant.text && v.plant.text !== text) ch(`預估到廠：快照 ${v.plant.text} → ${text}`, `工場着予定：スナップショット ${v.plant.text} → ${text}`, `Est. factory arrival: snapshot ${v.plant.text} → ${text}`);
  } else out.plant = { ...v.plant, badge: "fallback" };
  // 各港靠港時間（表定 vs 最新）：官網抓到的那港用即時值，其餘用快照
  if (Array.isArray(v.portCalls)) {
    const lp = Array.isArray(fAll.portCalls) ? fAll.portCalls : [];
    out.portCalls = v.portCalls.map((s) => {
      const l = lp.find((x) => x.port === s.port && (x.voyage === s.voyage || String(x.voyage).split("/").includes(String(s.voyage).split("/").pop())));
      if (!l) return { ...s, badge: "fallback" };
      const m = { ...s, arr: l.arr || s.arr, berth: l.berth || s.berth, dep: l.dep || s.dep, origArr: l.origArr || s.origArr, origDep: l.origDep || s.origDep, updated: l.updated || s.updated, srcUrl: l.srcUrl || s.srcUrl, badge: "live" };
      if (s.arr && l.arr && Date.parse(s.arr) !== Date.parse(l.arr)) ch(`${s.port} 到港：快照 ${taipeiHM(s.arr)} → 官網 ${taipeiHM(l.arr)}（台北時間）`, `${tr(s.port, "ja")} 入港：スナップショット ${taipeiHM(s.arr)} → 公式 ${taipeiHM(l.arr)}（台湾時間）`, `${tr(s.port, "en")} arrival: snapshot ${taipeiHM(s.arr)} → official ${taipeiHM(l.arr)} (Taipei time)`);
      return m;
    });
  }
  // 快照欄位與短標籤補上 _ja / _en
  for (const k of ["cyCut", "kobeEtd", "twEta", "plant"]) localize(out[k], ["text", "note", "src"]);
  localize(out, ["role", "carrier", "twPort"]);
  if (out.alert) localize(out.alert, ["text"]);
  if (out.live) localize(out.live, ["status", "where", "last", "next", "src"]);
  (out.links || []).forEach((l) => localize(l, ["label"]));
  out.changes = changes.map((c) => c.zh);
  out.changes_ja = changes.map((c) => c.ja);
  out.changes_en = changes.map((c) => c.en);
  return out;
}

function typhoonMeta(ty, snap) {
  if (!ty || (!ty.jma.length && !(ty.cwa && ty.cwa.text))) return localize({ ...snap, badge: "fallback" }, ["name", "text", "src"]);
  const tc = ty.jma[0], cur = tc && tc.points && tc.points[0];
  const zh = ty.cwa && ty.cwa.names && ty.cwa.names[0] && ty.cwa.names[0].zh;
  const en = tc && tc.nameEn ? tc.nameEn.toUpperCase() : (ty.cwa && ty.cwa.names && ty.cwa.names[0] && ty.cwa.names[0].en) || "";
  const jmaLine = (l) => !cur ? "" : l === "en"
    ? `JMA analysis: ${cur.lat}°N ${cur.lon}°E, ${cur.course ? `moving ${compassEn(cur.course)}, ` : ""}${cur.pressure} hPa, max sustained wind ${cur.windMs} m/s.`
    : `気象庁の解析：北緯 ${cur.lat}°、東経 ${cur.lon}°、${cur.course ? cur.course + "へ進行、" : ""}中心気圧 ${cur.pressure} hPa、最大風速 ${cur.windMs} m/s。`;
  return {
    badge: "live",
    name: zh || en || snap.name,
    name_ja: (tc && tc.nameJp) || en || snap.name,
    name_en: en || snap.name,
    nameEn: tc && tc.nameEn,
    text_ja: bullets(jmaLine("ja"), "ja"), text_en: bullets(jmaLine("en"), "en"),
    forecastCourse: tc ? tc.points.map((p) => ({ ja: p.course, en: compassEn(p.course) })) : [],
    lat: cur ? cur.lat : null, lon: cur ? cur.lon : null, posAt: cur ? cur.time : null,
    text: ty.cwa && ty.cwa.text ? bullets(ty.cwa.text, "zh") : [],
    cwaTime: ty.cwa && ty.cwa.time,
    jmaIssued: tc ? tc.issued : snap.jmaIssued, jmaIssuedJst: tc ? tc.issuedJst : snap.jmaIssuedJst,
    forecast: tc ? tc.points : (snap.forecast || []), forecastBadge: tc ? "live" : "fallback",
    cwaTrack: ty.cwa && ty.cwa.track && ty.cwa.track.length > 1 ? ty.cwa.track : (snap.cwaTrack || []),
    cwaTrackBadge: ty.cwa && ty.cwa.track && ty.cwa.track.length > 1 ? "live" : "fallback", cwaTrackTime: ty.cwa && ty.cwa.track && ty.cwa.track.length > 1 ? ty.cwa.time : snap.cwaTrackTime,
    src: "中央氣象署", src_ja: "台湾・中央気象署", src_en: "Taiwan CWA", srcUrl: "https://www.cwa.gov.tw/V8/C/P/Typhoon/TY_NEWS.html",
    jmaUrl: "https://www.jma.go.jp/bosai/map.html#contents=typhoon",
    snapshot: { text: snap.text, text_ja: snap.text_ja, text_en: snap.text_en, at: snap.at, src: snap.src, src_ja: tr(snap.src, "ja"), src_en: tr(snap.src, "en"), srcUrl: snap.srcUrl },
    fetchedAt: ty.fetchedAt,
  };
}

// Vercel 函式上限 25 秒：每組來源最多等 BUDGET_MS，逾時就先用快照回應，避免整頁 504。
const BUDGET_MS = 12000;
function within(p, ms, fallback) {
  let timer;
  return Promise.race([
    Promise.resolve(p).catch(() => fallback()),
    new Promise((r) => { timer = setTimeout(() => r(fallback()), ms); }),
  ]).finally(() => clearTimeout(timer));
}

// force=1（每次打開網頁、按「立即更新」）一律重抓官網；_live.js／_ais.js 會讓 30 秒內的重複請求共用同一次結果，
// 不會因為很多人同時開網頁而狂抓來源網站。

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") return res.status(405).json({ error: "只接受 GET。" });
  const q = req.query || {};
  const force = q.force === "1";
  const now = () => new Date().toISOString();
  const slowSched = () => ({ error: "官網回應太慢，先顯示快照", error_ja: "公式サイトの応答が遅いため、スナップショットを表示", error_en: "Official site too slow; showing snapshot", fetchedAt: now() });
  const slowAis = () => ({ best: null, errors: ["AIS 來源回應太慢"], fetchedAt: now() });

  // 船期、颱風、AIS 同時抓（原本是船期抓完才抓 AIS，最慢會超過 25 秒）
  const [sched, ty, ais] = await Promise.all([
    Promise.all(PLAN.vessels.map(async (v) => [v.id, await within(liveSchedule(v.id, force), BUDGET_MS, slowSched)])),
    within(liveTyphoon(force), BUDGET_MS, () => null),
    q.live === "1"
      // 已排除的船班（noGo）不再抓 AIS，減少對 AIS 網站的請求、也讓網頁更快
      ? Promise.all(PLAN.vessels.filter((v) => !v.noGo).map(async (v) => [v.id, await within(liveFor(v, { force }), BUDGET_MS, slowAis)]))
      : Promise.resolve(null),
  ]);
  const S = Object.fromEntries(sched);
  const vessels = PLAN.vessels.map((v) => mergeVessel(v, S[v.id]));
  const meta = { ...PLAN.meta, typhoon: typhoonMeta(ty, PLAN.meta.typhoon), scheduleAt: now(), fresh: force };
  localize(meta, ["title", "eyebrow", "subtitle", "summary"]);
  const body = { meta, vessels, live: ais ? Object.fromEntries(ais) : null, serverTime: now() };
  return res.status(200).json(body);
}
