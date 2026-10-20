// 即時船期（船公司官網）與颱風（日本氣象廳／中央氣象署）。
// 每個欄位抓不到時，api/data.js 會改用 _plan.js 的快照值並標示「快照」。
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";
// 每次打開網頁（force）都重抓官網；同一個伺服器實例 30 秒內的重複請求共用同一次結果。
const TTL = 10 * 60 * 1000, FRESH_MS = 30 * 1000;
const memo = new Map();
async function cached(key, fn, force) {
  const h = memo.get(key);
  if (h && Date.now() - h.t < (force ? FRESH_MS : TTL)) return h.p;
  const p = fn();
  memo.set(key, { t: Date.now(), p });
  p.catch(() => memo.delete(key));
  return p;
}
async function get(url, opts = {}) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), opts.timeout || 10000);
  try {
    const r = await fetch(url, { ...opts, signal: ctl.signal, headers: { "User-Agent": UA, ...(opts.headers || {}) } });
    if (!r.ok) throw new Error("HTTP " + r.status);
    return r;
  } finally { clearTimeout(timer); }
}
const post = (url, body) => get(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json());
const iso = (s, off) => { const m = String(s || "").match(/(\d{4})[\/-](\d\d)[\/-](\d\d)[ T](\d\d):(\d\d)/); return m ? `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:00${off}` : null; };
const ymd = (d) => d.toISOString().slice(0, 10).replace(/-/g, "/");

const TS = "https://epd.tslines.com/v1";
// 三語文字：note → note / note_ja / note_en；錯誤 → error / error_ja / error_en
const N = (zh, ja, en) => ({ note: zh, note_ja: ja, note_en: en });
const S = (zh, ja, en) => ({ src: zh, src_ja: ja, src_en: en });
class LiveError extends Error { constructor(zh, ja, en) { super(zh); this.ja = ja; this.en = en; } }
const URLS = {
  ts: "https://www.tslines.com/hk/schedule",
  one: "https://www.one-line.com/one-ecom/schedule/vessel-schedule?vslCdParam=",
  ever: "https://www.shipmentlink.com/jp/tvs2/local_file/jpkbe/JPKBE_OA08T03.pdf",
  ymkee: "https://ymkeeweb.yangming.com/YMKEE/vslterm",
};

// 每艘船要用哪個官方來源
export const LIVE_MAP = {
  "ts-johor": { type: "tslines", name: "TS JOHOR", code: "JOHA", voyages: ["2619S", "2618N"] },
  "ts-kobe": { type: "tslines", name: "TS KOBE", code: "UKBB", voyages: ["2621S"] },
  "navios-chrysalis": { type: "one", code: "NCYT", voyageNo: "0018", voyage: "018S" },
  "green-celebrity": { type: "evergreen", match: "GREEN CELEBRITY", voyage: "S133" },
  "ever-compose": { type: "evergreen", match: "EVER COMPOSE", voyage: "2100-112S" },
  "ym-improvement": { type: "ymkee", name: "YM IMPROVEMENT", voyage: "279S" },
  // 陽明日本代理（東洋信號）各港 Voyage Detail 頁：Original ETA-ETD（表定）＋最新入港／着岸／出港；基隆用陽明基隆靠泊表
  "ym-inception": { type: "ymjp", name: "YM INCEPTION", voyage: "251S", north: "250N",
    jp: [
      { port: "東京", code: 13, id: 10381408 },
      { port: "名古屋", code: 35, id: 10381410 },
      { port: "大阪", code: 40, id: 10381412 },
      { port: "神戶", code: 41, id: 10381411 },
    ] },
};

async function tslines(c, force) {
  const p2p = await cached("ts-p2p", () => {
    const now = new Date();
    return post(`${TS}/LongTermSchedule`, { PORT_OF_LOADING: "JPUKB", PORT_OF_DISCHARGE: "TWKEL", POL_ETD_START_AT: ymd(new Date(now - 10 * 864e5)), POL_ETD_END_AT: ymd(new Date(+now + 30 * 864e5)) });
  }, force);
  const rows = c.voyages.map((v) => (p2p.docs || []).find((d) => d.VESSEL_NAME === c.name && d.VOYAGE === v)).filter(Boolean);
  if (!rows.length) throw new LiveError("德翔官網點對點船期找不到此航次", "TS Lines 公式サイトのポート間スケジュールにこの航海が見つかりません", "Voyage not found in TS Lines official point-to-point schedule");
  const withCut = rows.find((r) => r.CUTOFF), r0 = rows[0], srcUrl = URLS.ts, SRC = S("德翔官網（即時）", "TS Lines 公式（リアルタイム）", "TS Lines official (live)");
  const out = {
    cyCut: withCut
      ? { iso: iso(withCut.CUTOFF, "+09:00"), ...N(
          rows.map((r) => `${r.VOYAGE} ${r.CUTOFF ? r.CUTOFF.slice(5) + " 截止" : "未列截止"}`).join("；"),
          rows.map((r) => `${r.VOYAGE} ${r.CUTOFF ? r.CUTOFF.slice(5) + " 締切" : "締切未掲載"}`).join("、"),
          rows.map((r) => `${r.VOYAGE}: ${r.CUTOFF ? "cut-off " + r.CUTOFF.slice(5) : "no cut-off listed"}`).join("; ")), ...SRC, srcUrl }
      : { iso: null, text: "未列", ...N("官網未列截止", "公式サイトに締切の掲載なし", "No cut-off listed on official site"), ...SRC, srcUrl },
    kobeEtd: { iso: iso(r0.ETD, "+09:00"), ...N(`航程 ${r0.SALILNG} 天`, `所要 ${r0.SALILNG} 日`, `Transit ${r0.SALILNG} days`), ...SRC, srcUrl },
    twEta: { iso: iso(r0.ETA, "+08:00"), port: "基隆", ...N("點對點查詢時間", "ポート間検索の時刻", "Point-to-point search time"), ...SRC, srcUrl },
  };
  try {
    const det = await cached("ts-det-" + c.code + c.voyages[0], () => post(`${TS}/ActSalingByVesselCode`, { VESSEL_CODE: c.code, VOYAGE: c.voyages[0] }), force);
    const kel = (det.docs || []).find((d) => /Keelung/i.test(d.PORT) && d.STATUS !== "Omit");
    const via = (det.docs || []).filter((d) => d.STATUS !== "Omit").map((d) => d.PORT.split(",")[0].trim());
    const i = via.indexOf("Kobe"), j = via.findIndex((p, k) => k > i && /Keelung/.test(p));
    const mid = i >= 0 && j > i + 1 ? via.slice(i + 1, j) : [];
    if (kel) Object.assign(out.twEta, N(
      `靠港明細：${kel.ETA.slice(5)} 到、${kel.ETD.slice(5)} 開` + (mid.length ? `；神戶後經 ${mid.join("、")}` : ""),
      `寄港明細：${kel.ETA.slice(5)} 着、${kel.ETD.slice(5)} 発` + (mid.length ? `、神戸の後 ${mid.join("・")} 経由` : ""),
      `Port calls: arr ${kel.ETA.slice(5)}, dep ${kel.ETD.slice(5)}` + (mid.length ? `; via ${mid.join(", ")} after Kobe` : "")));
  } catch (e) {}
  return out;
}

async function one(c, force) {
  const d = await cached("one-" + c.code + c.voyageNo, () => get(`https://ecomm.one-line.com/api/v1/schedule/vessel/port-list?vesselCode=${c.code}&voyageNo=${c.voyageNo}`).then((r) => r.json()), force);
  const L = d.scheduleLines || [], srcUrl = URLS.one + c.code, SRC = S("ONE 官網（即時）", "ONE 公式（リアルタイム）", "ONE official (live)");
  const k = L.find((l) => l.portCode === "JPUKB" && l.consortiumVoyageNumber === c.voyage);
  if (!k) throw new LiveError("ONE 官網找不到神戶靠港", "ONE 公式サイトに神戸寄港が見つかりません", "Kobe call not found on ONE official site");
  const t = L.find((l, idx) => /^TW/.test(l.portCode) && idx > L.indexOf(k));
  const A = (s) => s === "A";
  const vgm = k.vgmCutOffDateTime ? k.vgmCutOffDateTime.slice(5) : "";
  const out = {
    cyCut: k.cargoCutOffDateTime ? { iso: iso(k.cargoCutOffDateTime, "+09:00"), ...N(
      "貨物截止" + (vgm ? `；VGM ${vgm}` : ""), "貨物締切" + (vgm ? `、VGM ${vgm}` : ""), "Cargo cut-off" + (vgm ? `; VGM ${vgm}` : "")), ...SRC, srcUrl } : null,
    kobeEtd: { iso: iso(k.departureDateTime, "+09:00"), ...N(
      `${A(k.departureStatus) ? "實際" : "預估"}；${k.arrivalDateTime.slice(5)} 到港`,
      `${A(k.departureStatus) ? "実績" : "予定"}、${k.arrivalDateTime.slice(5)} 入港`,
      `${A(k.departureStatus) ? "Actual" : "Estimated"}; arrives ${k.arrivalDateTime.slice(5)}`), ...SRC, srcUrl },
  };
  if (t) out.twEta = { iso: iso(t.arrivalDateTime, "+08:00"), port: t.portCode === "TWKEL" ? "基隆" : t.portName, ...N(
    `ONE ${A(t.arrivalStatus) ? "實際" : "預估"}`, `ONE ${A(t.arrivalStatus) ? "実績" : "予定"}`, `ONE ${A(t.arrivalStatus) ? "actual" : "estimate"}`), ...SRC, srcUrl };
  return out;
}

async function evergreen(c, force) {
  const ev = await cached("ever", async () => {
    const buf = new Uint8Array(await (await get(URLS.ever, { timeout: 15000 })).arrayBuffer());
    const { extractText, getDocumentProxy } = await import("unpdf");
    const { text } = await extractText(await getDocumentProxy(buf), { mergePages: true });
    const re = /([A-Z][A-Z0-9 .\-]+?)\s+(\S+)\s+\((\w+)\)\s+(?:-+\s+)?(\w{3}-\d\d\s+\d\d:\d\d)\s+(\w{3}-\d\d)\s+(\d\d:\d\d)\s+(\w{3}-\d\d)\s+(\w{3}-\d\d)\s+(\S+)\s+(\S+)/g;
    return { date: (text.match(/Date:(\w{3} \d+,\d{4})/) || [])[1], rows: [...text.matchAll(re)].map((m) => ({ name: m[1].trim(), voyage: m[2], cy: `${m[5]} ${m[6]}`, etd: m[8], tpe: m[9] })) };
  }, force);
  if (!ev.rows.length) throw new LiveError("長榮 PDF 解析不到船期", "Evergreen PDF からスケジュールを読み取れません", "Could not parse schedule from Evergreen PDF");
  const M = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 };
  const d = (s, off) => { const m = s.match(/(\w{3})-(\d\d)(?: (\d\d:\d\d))?/); return m ? `2026-${String(M[m[1]]).padStart(2, "0")}-${m[2]}T${m[3] || "12:00"}:00${off}` : null; };
  const row = ev.rows.find((r) => r.name === c.match && r.voyage === c.voyage);
  if (!row) {
    const rs = ev.rows.filter((r) => r.name === c.match);
    const e = new LiveError(
      `長榮官網神戶船期（${ev.date}）沒有 ${c.voyage}` + (rs.length ? `；列出 ${rs.map((r) => `${r.voyage}（CY ${r.cy}、神戶 ${r.etd} 開、台北 ${r.tpe}）`).join("、")}` : ""),
      `Evergreen 公式の神戸スケジュール（${ev.date}）に ${c.voyage} はありません` + (rs.length ? `。掲載：${rs.map((r) => `${r.voyage}（CY ${r.cy}、神戸 ${r.etd} 発、台北 ${r.tpe}）`).join("、")}` : ""),
      `${c.voyage} is not on Evergreen's official Kobe schedule (${ev.date})` + (rs.length ? `; listed: ${rs.map((r) => `${r.voyage} (CY ${r.cy}, Kobe dep ${r.etd}, Taipei ${r.tpe})`).join(", ")}` : ""));
    e.official = true;
    throw e;
  }
  const SRC = S(`長榮官網 PDF（${ev.date}）`, `Evergreen 公式 PDF（${ev.date}）`, `Evergreen official PDF (${ev.date})`), srcUrl = URLS.ever;
  return {
    cyCut: { iso: d(row.cy, "+09:00"), ...SRC, srcUrl },
    kobeEtd: { iso: d(row.etd, "+09:00"), dateOnly: true, ...SRC, srcUrl },
    twEta: { iso: d(row.tpe, "+08:00"), dateOnly: true, port: "台北港", ...SRC, srcUrl },
  };
}

async function ymkee(c, force) {
  const html = await cached("ymkee", () => get(URLS.ymkee).then((r) => r.text()), force);
  const txt = html.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ");
  const re = new RegExp(`(\\d{4}-\\d\\d-\\d\\d \\d\\d:\\d\\d)(?: \\([^)]*\\))? ${c.name} (\\S+) \\S+ \\S+ (\\d{4}-\\d\\d-\\d\\d \\d\\d:\\d\\d)(?: \\([^)]*\\))? (\\S+)`, "g");
  const calls = [...txt.matchAll(re)].map((m) => ({ voyage: m[2], eta: m[1], etd: m[3], terminal: m[4] }));
  const mine = calls.find((x) => x.voyage === c.voyage);
  const info = (f) => calls.map(f).join("；");
  if (!mine) throw new LiveError(
    `陽明基隆靠泊表尚未列出 ${c.voyage}` + (calls.length ? `（目前列：${info((x) => `${x.voyage} 基隆 ${x.eta.slice(5)} 到、${x.etd.slice(5)} 開`)}）` : ""),
    `Yang Ming 基隆着岸予定表に ${c.voyage} はまだ掲載されていません` + (calls.length ? `（現在：${info((x) => `${x.voyage} 基隆 ${x.eta.slice(5)} 着、${x.etd.slice(5)} 発`)}）` : ""),
    `${c.voyage} is not yet on Yang Ming's Keelung berth list` + (calls.length ? ` (currently: ${calls.map((x) => `${x.voyage} Keelung arr ${x.eta.slice(5)}, dep ${x.etd.slice(5)}`).join("; ")})` : ""));
  return { twEta: { iso: iso(mine.eta, "+08:00"), port: "基隆", ...N(`陽明基隆靠泊表（${mine.terminal}）`, `Yang Ming 基隆着岸予定表（${mine.terminal}）`, "Yang Ming Keelung berth list"),
    ...S("陽明基隆靠泊表（即時）", "Yang Ming 基隆着岸予定表（リアルタイム）", "Yang Ming Keelung berth list (live)"), srcUrl: URLS.ymkee } };
}

// 陽明日本代理 Voyage Detail（https://www.toyoshingo.com/yangming/certificate.php?portcode=..&id=..）
// 頁面文字依序是：Voyage | 250N / 251S … Original ETA-ETD | 2026/10/25(SUN) - 2026/10/25(SUN)
// 入港時間 Arrival | 2026/10/26 22:00、着岸時間 Berthing | …、出港時間 Departure | …、Last Update:10/20 18:38
const TOYO = "https://www.toyoshingo.com/yangming/certificate.php";
export function parseToyo(html) {
  const t = String(html).replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ");
  const dt = (label) => { const m = t.match(new RegExp(label + "[^0-9]{0,40}(\\d{4}\\/\\d\\d\\/\\d\\d \\d\\d:\\d\\d)")); return m ? m[1] : null; };
  const o = t.match(/Original ETA-ETD[^0-9]{0,40}(\d{4})\/(\d\d)\/(\d\d)\s*\([A-Z]{3}\)\s*-\s*(\d{4})\/(\d\d)\/(\d\d)/);
  const voy = (t.match(/Voyage[^0-9A-Z]{0,20}([0-9]{3}[A-Z])\s*\/\s*([0-9]{3}[A-Z])/) || []);
  const up = (t.match(/Last Update\s*:?\s*(\d\d?\/\d\d? \d\d:\d\d)/) || [])[1] || null;
  return {
    voyages: voy.length ? [voy[1], voy[2]] : [],
    origArr: o ? `${o[1]}-${o[2]}-${o[3]}` : null, origDep: o ? `${o[4]}-${o[5]}-${o[6]}` : null,
    arr: iso(dt("Arrival"), "+09:00"), berth: iso(dt("Berthing"), "+09:00"), dep: iso(dt("Departure"), "+09:00"), updated: up,
  };
}
async function ymjp(c, force) {
  const kee = cached("ymkee", () => get(URLS.ymkee).then((r) => r.text()), force).then((html) => {
    const txt = html.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ");
    const re = new RegExp(`(\\d{4}-\\d\\d-\\d\\d \\d\\d:\\d\\d)(?: \\([^)]*\\))? ${c.name} (\\S+) \\S+ \\S+ (\\d{4}-\\d\\d-\\d\\d \\d\\d:\\d\\d)(?: \\([^)]*\\))? (\\S+)`, "g");
    return [...txt.matchAll(re)].map((m) => ({ voyage: m[2], eta: m[1], etd: m[3], terminal: m[4] }));
  });
  const jp = Promise.all(c.jp.map((p) => cached(`toyo-${p.code}-${p.id}`, () => get(`${TOYO}?portcode=${p.code}&id=${p.id}`).then((r) => r.text()), force)
    .then((html) => ({ ...p, ...parseToyo(html) }), (e) => ({ ...p, error: String((e && e.message) || e) }))));
  let keeErr = null;
  const [calls, ports] = await Promise.all([kee.catch((e) => { keeErr = String((e && e.message) || e); return null; }), jp]);
  const portCalls = [], fields = {};
  const keeN = calls && calls.find((x) => x.voyage === c.north), keeS = calls && calls.find((x) => x.voyage === c.voyage);
  if (keeN) portCalls.push({ port: "基隆", voyage: c.north, arr: iso(keeN.eta, "+08:00"), dep: iso(keeN.etd, "+08:00"), terminal: keeN.terminal, src: "ymkee" });
  for (const p of ports) {
    const ok = !p.error && p.arr && p.dep && Date.parse(p.arr) <= Date.parse(p.dep) && (!p.berth || (Date.parse(p.arr) <= Date.parse(p.berth) && Date.parse(p.berth) <= Date.parse(p.dep)))
      && (!p.voyages.length || p.voyages.includes(c.voyage) || p.voyages.includes(c.north));
    if (!ok && !p.error) p.error = "讀不到時間欄位";
    if (ok) portCalls.push({ port: p.port, voyage: `${c.north}/${c.voyage}`, arr: p.arr, berth: p.berth, dep: p.dep, origArr: p.origArr, origDep: p.origDep, updated: p.updated, src: "toyo", srcUrl: `${TOYO}?portcode=${p.code}&id=${p.id}` });
  }
  if (keeS) {
    portCalls.push({ port: "基隆", voyage: c.voyage, arr: iso(keeS.eta, "+08:00"), dep: iso(keeS.etd, "+08:00"), terminal: keeS.terminal, src: "ymkee" });
    fields.twEta = { iso: iso(keeS.eta, "+08:00"), port: "基隆", ...N(`陽明基隆靠泊表（${keeS.terminal}）`, `Yang Ming 基隆着岸予定表（${keeS.terminal}）`, "Yang Ming Keelung berth list"),
      ...S("陽明基隆靠泊表（即時）", "Yang Ming 基隆着岸予定表（リアルタイム）", "Yang Ming Keelung berth list (live)"), srcUrl: URLS.ymkee };
  }
  const kobe = portCalls.find((p) => p.port === "神戶" && p.src === "toyo");
  if (kobe) fields.kobeEtd = { iso: kobe.dep, ...N(`神戶 ${kobe.arr.slice(5, 10).replace("-", "/")} ${kobe.arr.slice(11, 16)} 到、${kobe.berth ? kobe.berth.slice(11, 16) + " 靠碼頭" : ""}；表定 ${kobe.origDep ? kobe.origDep.slice(5).replace("-", "/") : "—"}`,
      `神戸 ${kobe.arr.slice(5, 10).replace("-", "/")} ${kobe.arr.slice(11, 16)} 着${kobe.berth ? "・" + kobe.berth.slice(11, 16) + " 着岸" : ""}、当初予定 ${kobe.origDep ? kobe.origDep.slice(5).replace("-", "/") : "—"}`,
      `Kobe arr ${kobe.arr.slice(5, 10).replace("-", "/")} ${kobe.arr.slice(11, 16)}${kobe.berth ? ", berth " + kobe.berth.slice(11, 16) : ""}; original schedule ${kobe.origDep ? kobe.origDep.slice(5).replace("-", "/") : "—"}`),
    ...S("陽明日本代理（即時）", "Yang Ming 日本代理店（リアルタイム）", "Yang Ming Japan agent (live)"), srcUrl: kobe.srcUrl };
  if (!fields.twEta && !fields.kobeEtd) throw new LiveError("陽明基隆靠泊表、陽明日本代理都讀不到這班船", "Yang Ming 基隆着岸予定表・日本代理店のどちらにもこの便が見つかりません", "This sailing was not found on Yang Ming's Keelung berth list or Japan agent pages");
  fields.portCalls = portCalls;
  fields.portErrors = ports.filter((p) => p.error).map((p) => `${p.port}: ${p.error}`).concat(keeErr ? [`基隆: ${keeErr}`] : (calls && !keeS ? [`基隆: 靠泊表沒有 ${c.voyage}`] : []));
  return fields;
}

const FETCH = { tslines, one, evergreen, ymkee, ymjp };
export async function liveSchedule(id, force) {
  const c = LIVE_MAP[id];
  if (!c) return { error: "沒有對應的官方即時來源", error_ja: "対応する公式リアルタイム情報源がありません", error_en: "No official live source for this vessel" };
  try { return { fields: await FETCH[c.type](c, force), fetchedAt: new Date().toISOString() }; }
  catch (e) {
    const zh = String((e && e.message) || e);
    return { error: zh, error_ja: (e && e.ja) || `公式サイトの取得に失敗：${zh}`, error_en: (e && e.en) || `Official site fetch failed: ${zh}`, fetchedAt: new Date().toISOString() };
  }
}

// JMA 半徑：方位轉成角度（北＝0、順時針）；全域＝null
const DIRS = { "北": 0, "北東": 45, "東": 90, "南東": 135, "南": 180, "南西": 225, "西": 270, "北西": 315 };
function radii(list) {
  if (!Array.isArray(list) || !list.length) return null;
  return list.map((w) => { const a = typeof w.area === "string" ? w.area : (w.area && w.area.jp) || ""; return { dir: DIRS[a] != null ? DIRS[a] : null, km: w.range && w.range.km }; }).filter((w) => typeof w.km === "number");
}
// 氣象署預報點（TY_LIST_2['C']）：「預測 10月20日20時」「中心位置在北緯 16.8 度，東經 133.1 度」「70%機率半徑 40 公里」「七級風暴風半徑 280 公里」…
// 時間是台灣時間（+08:00）。分析點取自 TY_LIST_1：「20日14時的中心位置在北緯 16.4 度，東經 134.3 度」。
export function cwaTrack(js, nowText) {
  const yr = (() => { const m = js.match(/民國(\d+)年/); return m ? 1911 + +m[1] : new Date().getUTCFullYear(); })();
  const mon0 = (() => { const m = js.match(/民國\d+年(\d+)月/); return m ? +m[1] : null; })();
  const pad = (n) => String(n).padStart(2, "0");
  const at = (mo, d, h) => `${yr}-${pad(mo)}-${pad(d)}T${pad(h)}:00:00+08:00`;
  const num = (re, t) => { const m = t.match(re); return m ? +m[1] : null; };
  const pos = (t) => { const m = t.match(/北緯\s*([\d.]+)\s*度[，,、\s]*東經\s*([\d.]+)\s*度/); return m ? [+m[1], +m[2]] : null; };
  const pts = [];
  const a = nowText && nowText.match(/(\d+)日(\d+)時的中心位置在北緯\s*([\d.]+)\s*度[，,、\s]*東經\s*([\d.]+)\s*度/);
  if (a && mon0) pts.push({ hours: 0, time: new Date(at(mon0, +a[1], +a[2])).toISOString(), lat: +a[3], lon: +a[4],
    galeKm: num(/七級風平均暴風半徑\s*(\d+)/, nowText), stormKm: num(/十級風平均暴風半徑\s*(\d+)/, nowText) });
  const m2 = js.match(/TY_LIST_2\['C'\]\s*=\s*([\s\S]*?);\s*\n/);
  if (m2) {
    const t = m2[1].replace(/'\s*\+\s*'/g, "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");
    for (const seg of t.split(/預測\s*/).slice(1)) {
      const tm = seg.match(/^(\d+)月(\d+)日(\d+)時/), p = pos(seg);
      if (!tm || !p) continue;
      const time = new Date(at(+tm[1], +tm[2], +tm[3])).toISOString();
      pts.push({ time, lat: p[0], lon: p[1], radiusKm: num(/70%[^0-9]{0,20}(\d+)\s*公里/, seg), galeKm: num(/七級風[^0-9]{0,20}(\d+)\s*公里/, seg), stormKm: num(/十級風[^0-9]{0,20}(\d+)\s*公里/, seg) });
    }
  }
  const t0 = pts.length ? Date.parse(pts[0].time) : 0;
  pts.forEach((p) => { if (p.hours == null) p.hours = Math.round((Date.parse(p.time) - t0) / 3600e3); });
  return pts;
}
export async function liveTyphoon(force) {
  return cached("typhoon", async () => {
    const out = { fetchedAt: new Date().toISOString(), jma: [], cwa: null };
    try {
      const list = await (await get("https://www.jma.go.jp/bosai/typhoon/data/targetTc.json")).json();
      for (const tc of list) {
        try {
          const spec = await (await get(`https://www.jma.go.jp/bosai/typhoon/data/${tc.tropicalCyclone}/specifications.json`)).json();
          const title = spec.find((p) => p.part === "title") || {};
          out.jma.push({
            nameEn: title.name && title.name.en, nameJp: title.name && title.name.jp, issued: title.issue && title.issue.UTC,
            issuedJst: title.issue && title.issue.JST,
            // 暴風警戒域／暴風域（stormWarning）與強風域（galeWarning）：[{ area: "北東"|"南西"|"東"|"西"|{jp:"全域"}, range:{km} }]
            points: spec.filter((p) => p.position && p.position.deg).map((p) => ({ hours: p.advancedHours || 0, lat: p.position.deg[0], lon: p.position.deg[1], pressure: p.pressure, windMs: p.maximumWind && p.maximumWind.sustained && p.maximumWind.sustained["m/s"], gustMs: p.maximumWind && p.maximumWind.gust && p.maximumWind.gust["m/s"], course: p.course, speedKmh: p.speed && p.speed["km/h"], radiusKm: p.probabilityCircleRadius && p.probabilityCircleRadius.km, storm: radii(p.stormWarning), gale: radii(p.galeWarning), intensity: p.intensity, location: p.location, time: p.validtime && p.validtime.UTC })),
          });
        } catch (e) {}
      }
    } catch (e) { out.jmaError = String(e.message); }
    try {
      const js = await (await get("https://www.cwa.gov.tw/Data/js/typhoon/TY_NEWS-Data.js")).text();
      const m = js.match(/TY_LIST_1\['C'\]\s*=\s*([\s\S]*?);\s*\n/);
      const strip = (s) => s.replace(/'\s*\+\s*'/g, "").replace(/^'|'$/g, "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
      const names = [...js.matchAll(/'([A-Z]+)':\{'Name':\{'C':'([^']+)','E':'([^']+)'\}\}/g)].map((x) => ({ zh: x[2], en: x[3] }));
      out.cwa = { time: (js.match(/TY_TIME = \{'C':'([^']*)'/) || [])[1] || null, text: m ? strip(m[1].trim()) : null, names };
      try { out.cwa.track = cwaTrack(js, m ? strip(m[1].trim()) : ""); } catch (e) { out.cwa.trackError = String(e.message); }
    } catch (e) { out.cwaError = String(e.message); }
    return out;
  }, force);
}
