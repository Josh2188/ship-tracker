// 伺服器端抓取公開 AIS 頁面並解析船位。
// 每次打開網頁都重抓；同一個伺服器實例 30 秒內的重複請求共用同一次結果，避免同時多人開網頁時狂抓對方網站。

const UA = "shipment-vessel-tracker/1.0 (low-volume personal shipment tracking)";
const CACHE_MS = 3 * 60 * 1000;
const FRESH_MS = 30 * 1000;
const TIMEOUT_MS = 8000;
const cache = new Map();

const MON = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };

export function htmlToText(html) {
  return String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, "\n")
    .replace(/&nbsp;/g, " ")
    .replace(/&deg;|&#176;|&#xB0;/gi, "°")
    .replace(/&middot;|&#183;|&#xB7;/gi, "·")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"").replace(/&#39;|&apos;/g, "'")
    .replace(/[ \t\r]+/g, " ")
    .replace(/\s*\n\s*/g, "\n");
}

function metaDescription(html) {
  const a = html.match(/<meta[^>]+name=["']description["'][^>]*content=["']([^"']*)["']/i);
  if (a) return a[1];
  const b = html.match(/<meta[^>]+content=["']([^"']*)["'][^>]*name=["']description["']/i);
  return b ? b[1] : "";
}

function relToIso(s, now = Date.now()) {
  const units = { second: 1e3, minute: 6e4, hour: 36e5, day: 864e5, week: 6048e5 };
  let ms = 0;
  String(s).replace(/(\d+)\s+(second|minute|hour|day|week)s?/g, (_, n, u) => { ms += Number(n) * units[u]; return ""; });
  return ms ? new Date(now - ms).toISOString() : null;
}

const NAV = /\b(Under way using engine|Under way sailing|Moored|At anchor|Not under command|Restricted manoeuvrability|Aground)\b/;

export function parseAisCatcher(html) {
  const text = htmlToText(html);
  const meta = metaDescription(html);
  const num = (re) => { const m = text.match(re); return m ? parseFloat(m[1]) : null; };

  let lat = num(/Latitude\s+(-?\d{1,2}\.\d+)/);
  let lon = num(/Longitude\s+(-?\d{1,3}\.\d+)/);
  let at = null;
  const pr = text.match(/Position received\s+(\d{1,2})\s+([A-Z][a-z]{2})\s+(\d{4})\s*·?\s*(\d{1,2}):(\d{2})\s*UTC/);
  if (pr && MON[pr[2]] != null) at = new Date(Date.UTC(+pr[3], MON[pr[2]], +pr[1], +pr[4], +pr[5])).toISOString();

  if (lat == null || lon == null) {
    const m = meta.match(/position near\s+(-?\d+(?:\.\d+)?)°,\s*(-?\d+(?:\.\d+)?)°/);
    if (m) { lat = +m[1]; lon = +m[2]; }
  }
  if (!at) {
    const r = meta.match(/last reported\s+(.+?)\s+ago/);
    if (r) at = relToIso(r[1]);
  }
  if (lat == null || lon == null || !at) return null;

  const nav = text.match(NAV);
  const nx = text.match(/Next\s+([^\n]+?)\s+ETA\s+(\d{1,2})\s+([A-Z][a-z]{2})\s+(\d{1,2}):(\d{2})\s*UTC/);
  let nextEta = null;
  if (nx && MON[nx[3]] != null) nextEta = new Date(Date.UTC(new Date(at).getUTCFullYear(), MON[nx[3]], +nx[2], +nx[4], +nx[5])).toISOString();
  const dest = (meta.match(/bound for\s+([^.]+)\./) || [])[1] || null;

  return {
    lat, lon, at,
    sog: num(/Speed\s+(\d+(?:\.\d+)?)\s*kn/),
    cog: num(/Course\s+(\d+(?:\.\d+)?)\s*°/),
    navStatus: nav ? nav[1] : null,
    next: nx ? nx[1].trim() : (dest || null),
    nextEta,
  };
}

export function parseMyShipTracking(html) {
  const text = htmlToText(html);
  const m = text.match(/coordinates\s+(-?\d+(?:\.\d+)?)°\s*\/\s*(-?\d+(?:\.\d+)?)°\s+as reported on\s+(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})/);
  if (!m) return null;
  const at = new Date(Date.UTC(+m[3], +m[4] - 1, +m[5], +m[6], +m[7])).toISOString();
  const sog = (text.match(/current speed is\s+(\d+(?:\.\d+)?)\s*Knots/) || [])[1];
  const port = (text.match(/inside the port of\s+([A-Z][A-Z .'-]+?)\s*[.\n]/) || [])[1];
  const nav = text.match(/Status\s+(Under way using engine|Under way sailing|Moored|At anchor|Not under command)/);
  return {
    lat: +m[1], lon: +m[2], at,
    sog: sog != null ? +sog : null,
    cog: null,
    navStatus: nav ? nav[1] : null,
    inPort: port ? port.trim() : null,
  };
}

// VesselFinder 公開地圖資料（二進位）：取指定 MMSI 的最新船位。
async function vesselFinder(mmsi, expectName) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), TIMEOUT_MS);
  try {
    const r = await fetch(`https://www.vesselfinder.com/api/pub/mp2?bbox=0,0,1,1&zoom=8&mmsi=${mmsi}`, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0 Safari/537.36" }, signal: ctl.signal });
    if (!r.ok) throw new Error("HTTP " + r.status);
    const b = Buffer.from(await r.arrayBuffer());
    const key = Buffer.alloc(4); key.writeUInt32BE(Number(mmsi));
    const i = b.indexOf(key, 9);
    if (i < 0 || b.length < i + 20) return null;
    const lat = b.readInt32BE(i + 4) / 600000, lon = b.readInt32BE(i + 8) / 600000;
    // 時間戳取自「這艘船」記錄的結尾：名稱長度在 i+19，名稱之後 4 bytes 是回報時間。
    // 另外要求回應裡只有這一筆記錄、且記錄內船名相符；不符就不採用 VesselFinder。
    const nl = b[i + 19];
    if (b.length !== i + 24 + nl) return null;
    const ts = b.readUInt32BE(i + 20 + nl);
    if (!(Math.abs(lat) <= 90 && Math.abs(lon) <= 180) || ts < 1.7e9 || ts > Date.now() / 1000 + 3600) return null;
    const sog = b.readUInt16BE(i + 14) / 10;
    const recName = b.slice(i + 20, i + 20 + nl).toString("latin1").trim().toUpperCase();
    if (expectName && recName !== String(expectName).trim().toUpperCase()) return null;
    let next = null, nextEta = null;
    try {
      const c = await (await fetch(`https://www.vesselfinder.com/api/pub/click/${mmsi}`, { headers: { "User-Agent": "Mozilla/5.0 Chrome/130.0" }, signal: ctl.signal })).json();
      if (c && c.dest) next = String(c.dest).trim();
      // AIS 目的港 ETA（船員自行輸入）：只收合理範圍內的時間
      if (c && Number.isFinite(c.etaTS) && c.etaTS > ts - 864e3 && c.etaTS < ts + 60 * 864e2) nextEta = new Date(c.etaTS * 1000).toISOString();
    } catch (e) {}
    return { lat, lon, at: new Date(ts * 1000).toISOString(), sog, cog: b.readUInt16BE(i + 12) / 10, navStatus: null, next, nextEta };
  } finally { clearTimeout(timer); }
}

async function fetchText(url) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), TIMEOUT_MS);
  try {
    const r = await fetch(url, { headers: { "User-Agent": UA, "Accept": "text/html", "Accept-Language": "en" }, signal: ctl.signal, redirect: "follow" });
    if (!r.ok) throw new Error("HTTP " + r.status);
    return await r.text();
  } finally {
    clearTimeout(timer);
  }
}

function slug(name) {
  return String(name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function liveFor(v, { force = false } = {}) {
  if (!/^\d{9}$/.test(String(v.mmsi)) || !/^\d{7}$/.test(String(v.imo))) return { best: null, errors: ["缺少 MMSI／IMO"], fetchedAt: new Date().toISOString() };
  const key = String(v.mmsi);
  const hit = cache.get(key);
  if (hit && Date.now() - hit.t < (force ? FRESH_MS : CACHE_MS)) return { ...(await hit.v), cached: true };

  const job = fetchAll(v);
  cache.set(key, { t: Date.now(), v: job });
  try { return await job; } catch (e) { cache.delete(key); throw e; }
}

async function fetchAll(v) {
  const sources = [
    { name: "AIS-catcher", url: `https://www.aiscatcher.org/ship/details/${v.mmsi}`, parse: parseAisCatcher },
    { name: "MyShipTracking", url: `https://www.myshiptracking.com/vessels/${slug(v.name)}-mmsi-${v.mmsi}-imo-${v.imo}`, parse: parseMyShipTracking },
  ];
  sources.push({ name: "VesselFinder", url: `https://www.vesselfinder.com/vessels/details/${v.imo}`, direct: () => vesselFinder(v.mmsi, v.name) });
  const results = await Promise.all(sources.map(async (s) => {
    try {
      const p = s.direct ? await s.direct() : s.parse(await fetchText(s.url));
      return p ? { ...p, src: s.name, srcUrl: s.url } : { error: `${s.name}：讀不到船位欄位` };
    } catch (e) {
      return { error: `${s.name}：${e && e.name === "AbortError" ? "連線逾時" : (e && e.message) || "連線失敗"}` };
    }
  }));
  const ok = results.filter((r) => !r.error).sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
  return { best: ok[0] || null, errors: results.filter((r) => r.error).map((r) => r.error), fetchedAt: new Date().toISOString() };
}
