// 影子模擬備份：用和網站 /api/data 完全相同的程式重抓一次（強制重抓），
// 把颱風預報、陽明各港船期、AIS 船位存成 public/shadow/snapshots/<id>.json，並更新 public/shadow/index.json。
// GitHub Actions 每 8 小時跑一次（.github/workflows/shadow.yml），也可以手動：node scripts/snapshot.mjs
//   --baseline            不連網，用 api/_plan.js 的快照值（人工查證過的版本）存一筆基準
//   --at=ISO --note=文字   基準的時間與說明
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIR = join(ROOT, "public", "shadow");
const SNAP_DIR = join(DIR, "snapshots");
const args = Object.fromEntries(process.argv.slice(2).map((a) => { const m = a.match(/^--([^=]+)(?:=(.*))?$/); return m ? [m[1], m[2] == null ? true : m[2]] : [a, true]; }));
const SHIP_ID = "ym-inception";

if (args.baseline) globalThis.fetch = async () => { throw new Error("offline baseline"); };
const { default: handler } = await import("../api/data.js");

function callApi() {
  return new Promise((resolve, reject) => {
    const req = { method: "GET", query: { live: "1", force: "1" } };
    const res = {
      statusCode: 200, headers: {},
      setHeader(k, v) { this.headers[k] = v; },
      status(c) { this.statusCode = c; return this; },
      json(b) { if (this.statusCode !== 200) reject(new Error("HTTP " + this.statusCode)); else resolve(b); return this; },
    };
    Promise.resolve(handler(req, res)).catch(reject);
  });
}

const body = await callApi();
const meta = body.meta || {}, ty = meta.typhoon || {};
const v = (body.vessels || []).find((x) => x.id === SHIP_ID) || {};
const live = (body.live && body.live[SHIP_ID]) || null;
const takenAt = args.at ? new Date(args.at).toISOString() : (body.serverTime || new Date().toISOString());
const tw = new Date(Date.parse(takenAt) + 8 * 3600e3);
const id = tw.toISOString().slice(0, 16).replace(/[-:]/g, "").replace("T", "-");   // 台灣時間 20261020-2249

const pickPt = (p) => {
  const o = {};
  for (const k of ["hours", "time", "lat", "lon", "pressure", "windMs", "course", "speedKmh", "radiusKm", "storm", "gale", "galeKm", "stormKm", "intensity"]) if (p[k] != null) o[k] = p[k];
  return o;
};
const jmaLive = (ty.forecastBadge || ty.badge) === "live", cwaLive = (ty.cwaTrackBadge || ty.badge) === "live";
const snap = {
  v: 1, id, takenAt, kind: args.baseline ? "baseline" : "auto",
  note: typeof args.note === "string" ? args.note : "",
  deadline: meta.deadline, deadlineTime: meta.deadlineTime, holidays: meta.holidays || [],
  ship: {
    name: v.name, voyage: v.voyage,
    portCalls: (v.portCalls || []).map((c) => ({ port: c.port, voyage: c.voyage, arr: c.arr, berth: c.berth || null, dep: c.dep, origArr: c.origArr || null, origDep: c.origDep || null, north: !!c.north, load: !!c.load, discharge: !!c.discharge, badge: args.baseline ? "verified" : c.badge, updated: c.updated || null })),
    kobeEtd: v.kobeEtd ? { iso: v.kobeEtd.iso || (v.dates && v.dates.etd), badge: args.baseline ? "verified" : v.kobeEtd.badge } : null,
    twEta: v.twEta ? { iso: v.twEta.iso || (v.dates && v.dates.etaFrom), badge: args.baseline ? "verified" : v.twEta.badge } : null,
    plant: v.dates ? { from: v.dates.plantFrom, to: v.dates.plantTo } : null,
    ais: live && live.best ? { at: live.best.at, lat: live.best.lat, lon: live.best.lon, sog: live.best.sog, cog: live.best.cog, src: live.best.src } : (args.baseline && v.live ? { at: v.live.at, lat: v.live.lat, lon: v.live.lon, sog: v.live.sog, cog: v.live.cog, src: v.live.src } : null),
    aisErrors: live && live.errors ? live.errors.slice(0, 5) : [],
    liveError: v.liveError || null,
  },
  ty: {
    name: ty.name, nameJa: ty.name_ja, nameEn: ty.name_en || ty.nameEn,
    now: typeof ty.lat === "number" ? { lat: ty.lat, lon: ty.lon, at: ty.posAt } : null,
    jma: { issued: ty.jmaIssuedJst || ty.jmaIssued || null, badge: args.baseline ? "verified" : (jmaLive ? "live" : "fallback"), points: (ty.forecast || []).map(pickPt) },
    cwa: { issued: ty.cwaTrackTime || ty.cwaTime || null, badge: args.baseline ? "verified" : (cwaLive ? "live" : "fallback"), points: (ty.cwaTrack || []).map(pickPt) },
  },
};

mkdirSync(SNAP_DIR, { recursive: true });
const file = `snapshots/${id}.json`;
writeFileSync(join(DIR, file), JSON.stringify(snap, null, 1) + "\n");

const idxPath = join(DIR, "index.json");
let index = [];
if (existsSync(idxPath)) { try { index = JSON.parse(readFileSync(idxPath, "utf8")); } catch { index = []; } }
const kee = (snap.ship.portCalls || []).filter((c) => c.port === "基隆").pop();
const kobe = (snap.ship.portCalls || []).find((c) => c.port === "神戶");
const row = {
  id, takenAt, kind: snap.kind, file, note: snap.note,
  jma: snap.ty.jma.issued, jmaBadge: snap.ty.jma.badge, cwa: snap.ty.cwa.issued, cwaBadge: snap.ty.cwa.badge,
  keeArr: kee ? kee.arr : (snap.ship.twEta && snap.ship.twEta.iso), kobeDep: kobe ? kobe.dep : (snap.ship.kobeEtd && snap.ship.kobeEtd.iso),
  ports: (snap.ship.portCalls || []).filter((c) => c.badge !== "fallback").length + "/" + (snap.ship.portCalls || []).length,
  aisAt: snap.ship.ais ? snap.ship.ais.at : null,
};
index = index.filter((r) => r.id !== id).concat([row]).sort((a, b) => Date.parse(a.takenAt) - Date.parse(b.takenAt));
writeFileSync(idxPath, JSON.stringify(index, null, 1) + "\n");
console.log(`saved ${file}: JMA ${row.jma} (${row.jmaBadge}), CWA ${row.cwa} (${row.cwaBadge}), Keelung ${row.keeArr}, ports live ${row.ports}, AIS ${row.aisAt || "none"}`);
