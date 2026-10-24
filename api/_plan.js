// 船期、判斷與颱風資料（快照）。更新這個檔案後重新部署即可。
// 船位會由 api/data.js 即時抓取，不必改這裡。
// 文字有三種語言：欄位名（中文）+ _ja（日文）+ _en（英文），三種都要一起改。
// meta.summary 第一條會放大顯示成「結論」，其餘條列為下一步與風險。
// alert.text 第一條寫「要做什麼／結論」，後面寫依據。
// meta.deadline 是到廠期限（YYYY-MM-DD），網頁的倒數、時間軸與每班的「最晚也比期限早 N 天」都依它計算。
// 船班加 "officialContradicted": {"fields":["kobeEtd","twEta"],"by":"AIS","since":"YYYY-MM-DD"} 時，那些欄位的官網日期只在旁邊標「AIS 顯示做不到」，不覆蓋這裡的推估日期（sync 也不改寫）。
// meta.holidays 是台灣平日的休假日（週末自動跳過）；預估到廠＝到港後第 2–3 個工作天（data.js 的 plantRange，會加急），手寫推估也要照這規則。
// meta.backupDeadline（可省略）：備案可接受的最晚到廠日；目前不設，11/2 下班前是硬期限（meta.deadlineTime）。
// meta.typhoon.forecast（氣象廳）／cwaTrack（氣象署）是颱風預報點的快照，即時抓不到時地圖改用它。
// 船班 portCalls：各港 表定（origArr／origDep，日期）與最新 到港／靠泊／開船（arr／berth／dep，含時區）；地圖的預測航線依它內插。
// meta.mode 是預設出貨方式（LCL／FCL）；每班的 lcl／fcl 寫該方式能不能排（status）、標籤與說明，lcl.cut 是併櫃進倉截止。
export const PLAN = {
  "meta": {
    "deadline": "2026-11-02",
    "lastRunAt": "2026-10-25T05:05:00+08:00",
    "level": "watch",
    "summary": [
      "陽明 YM INCEPTION 251S 又延後：神戶 10/27（二）23:00（日本時間，台北 22:00）開，基隆 10/30（五）07:00 到（10/25 05:05 陽明官網複核，沒變）。照到港後第 2–3 個工作天是 11/3（二）–11/4（三），趕不上 11/2；只有爭取到「到港後第 1 個工作天」11/2（一）當天清關、送廠，才趕得上。",
      "要做的事：請報關行在船到港前就備好報關文件，10/30（五）到港當天或週末完成拆櫃和放行準備，11/2（一）一早放行、當天卡車送龍潭。",
      "颱風：薔琵已減弱成低氣壓等級（氣象廳 10/25 03:45 預報 10/27 02:00 在室戶岬南方、1002 百帕，台北時間），比船 10/27 05:00 到大阪早，大阪、神戶頂多停工半天。煙花（IN-FA）在馬紹爾群島附近往西北走，10/30 02:00 預報點離基隆還有約 3,400 公里，預報期間內不影響神戶→基隆這段。",
      "到貨預測（10/25 05:05 第 4 輪，官網船期複核後結論不變）：照現在船期最快 11/2、11/3 下班前應趕得上；日本港口再晚 12–48 小時，因為碰到週末，最快仍是 11/2 但更難做到；晚 72 小時以上（11/2 才到基隆）就一定趕不上。細節見下方「到貨預測第 4 輪」。",
      "網頁每次打開、每次按「立即更新」都會重抓陽明、氣象廳、氣象署和 AIS 的最新資料。"
    ],
    "typhoon": {
      "at": "10/22 22:45",
      "lat": 21.3,
      "lon": 124.8,
      "name": "薔琵",
      "posAt": "2026-10-22T13:00:00Z",
      "src": "日本氣象廳、氣象署",
      "srcUrl": "https://www.jma.go.jp/bosai/map.html#contents=typhoon",
      "text": [
        "日本氣象廳 10/22 22:45（日本時間）發布：22 時中心在北緯 21.3、東經 124.8 度，940 百帕，近中心最大風速每秒 45 公尺，向西北。預測 10/23 21 時（日本時間）到與那國島西方約 60 公里（北緯 24.5、東經 122.4 度），10/24 21 時東海（北緯 27.8、東經 123.4 度，980 百帕），10/25 21 時九州西方（992 百帕），10/26 21 時東海地方（北緯 34.6、東經 136.6 度，998 百帕、每秒 18 公尺，已減弱）。",
        "中度颱風 薔琵 編號第 29 號 國際命名 CHAMPI 22日20時的中心位置在北緯 21.2 度，東經 124.9 度，以每小時17公里速度，向北北西進行。",
        "中心氣壓 940 百帕 ， 近中心最大風速每秒 45 公尺 ，瞬間最大陣風每秒 55 公尺，七級風平均暴風半徑 320 公里(西北側 350 公里、東北側 350 公里、西南側 290 公里、東南側 300 公里)，十級風平均暴風半徑 140 公里(西北側 140 公里、東北側 140 公里、西南側 140 公里、東南側 140 公里)。",
        "氣象署 10/22 20 時預測：10/23 20 時北緯 24.4、東經 122.8 度（台灣東方近海），10/24 20 時北緯 27.6、東經 123.4 度，10/25 20 時北緯 31.7、東經 127.2 度，10/26 20 時北緯 33.6、東經 132.3 度（四國西方附近）。",
        "兩家都預測 10/23–24 最接近台灣（東方近海），之後轉向東北往日本；10/26 颱風（已減弱）在名古屋、大阪附近，正好是船停名古屋（10/26）、大阪（10/27）的時候。船 10/27 晚上神戶開到 10/30 基隆這段，颱風已遠離，預報沒顯示新的颱風。"
      ],
      "name_ja": "チャンパー",
      "name_en": "CHAMPI",
      "text_ja": [
        "気象庁 10/22 22:45 発表：22 時 北緯 21.3 度・東経 124.8 度、940 hPa、最大風速 45 m/s、北西へ。予報 10/23 21 時 与那国島の西約 60 km（北緯 24.5・東経 122.4）、10/24 21 時 東シナ海（980 hPa）、10/25 21 時 九州の西（992 hPa）、10/26 21 時 東海地方（北緯 34.6・東経 136.6、998 hPa、18 m/s に弱まる）。",
        "中央気象署 10/22 20 時（台湾時間）：中心 北緯 21.2 度・東経 124.9 度、940 hPa、最大風速 45 m/s、北北西へ時速 17 km。風力 7 の半径 平均 320 km、風力 10 は 140 km。予報 10/23 20 時 北緯 24.4・東経 122.8（台湾東方近海）、10/26 20 時 北緯 33.6・東経 132.3。",
        "両者とも 10/23–24 に台湾へ最接近し、その後北東へ転向。10/26 には弱まった台風が名古屋・大阪付近にあり、船の名古屋（10/26）・大阪（10/27）寄港と重なる。神戸発（10/27 夜）→基隆（10/30）の区間は台風が遠ざかり、新しい台風の予報はない。"
      ],
      "text_en": [
        "JMA, issued 10/22 22:45 JST: at 22:00 the centre was at 21.3N 124.8E, 940 hPa, max wind 45 m/s, moving NW. Forecast: ~60 km W of Yonaguni at 21:00 10/23 (24.5N 122.4E), East China Sea 21:00 10/24 (980 hPa), W of Kyushu 21:00 10/25 (992 hPa), Tokai region 21:00 10/26 (34.6N 136.6E, 998 hPa, 18 m/s, weakened).",
        "Taiwan CWA, 20:00 10/22 (Taiwan time): centre 21.2N 124.9E, 940 hPa, max wind 45 m/s, moving NNW at 17 km/h; gale radius avg 320 km, storm radius 140 km. Forecast 24.4N 122.8E at 20:00 10/23 (off eastern Taiwan), 33.6N 132.3E at 20:00 10/26.",
        "Both agencies: closest to Taiwan 10/23–24, then recurving NE toward Japan. On 10/26 the weakened storm is near Nagoya/Osaka, exactly when the ship calls Nagoya (10/26) and Osaka (10/27). On Kobe (night 10/27) → Keelung (10/30) the storm has moved away; no new typhoon is in the forecasts."
      ],
      "jmaIssued": "2026-10-22T13:45:00Z",
      "jmaIssuedJst": "2026-10-22T22:45:00+09:00",
      "forecast": [
        {
          "hours": 0,
          "lat": 21.3,
          "lon": 124.8,
          "pressure": "940",
          "windMs": "45",
          "gustMs": "65",
          "course": "北西",
          "speedKmh": "15",
          "storm": [
            {
              "dir": 315,
              "km": 390
            },
            {
              "dir": 135,
              "km": 280
            }
          ],
          "gale": [
            {
              "dir": null,
              "km": 650
            }
          ],
          "intensity": "非常に強い",
          "location": "沖縄の南",
          "time": "2026-10-22T13:00:00Z"
        },
        {
          "hours": 1,
          "lat": 21.4,
          "lon": 124.7,
          "pressure": "940",
          "windMs": "45",
          "gustMs": "65",
          "course": "北西",
          "speedKmh": "15",
          "storm": [
            {
              "dir": 315,
              "km": 390
            },
            {
              "dir": 135,
              "km": 280
            }
          ],
          "gale": [
            {
              "dir": null,
              "km": 650
            }
          ],
          "intensity": "非常に強い",
          "location": "沖縄の南",
          "time": "2026-10-22T14:00:00Z"
        },
        {
          "hours": 2,
          "lat": 21.5,
          "lon": 124.7,
          "pressure": "950",
          "windMs": "45",
          "gustMs": "60",
          "course": "北北西",
          "speedKmh": "15",
          "radiusKm": 30,
          "storm": [
            {
              "dir": 315,
              "km": 360
            },
            {
              "dir": 135,
              "km": 310
            }
          ],
          "gale": null,
          "intensity": "非常に強い",
          "time": "2026-10-22T15:00:00Z"
        },
        {
          "hours": 5,
          "lat": 21.9,
          "lon": 124.4,
          "pressure": "950",
          "windMs": "45",
          "gustMs": "60",
          "course": "北北西",
          "speedKmh": "20",
          "radiusKm": 35,
          "storm": [
            {
              "dir": 315,
              "km": 370
            },
            {
              "dir": 135,
              "km": 310
            }
          ],
          "gale": null,
          "intensity": "非常に強い",
          "time": "2026-10-22T18:00:00Z"
        },
        {
          "hours": 8,
          "lat": 22.4,
          "lon": 124.1,
          "pressure": "950",
          "windMs": "45",
          "gustMs": "60",
          "course": "北北西",
          "speedKmh": "20",
          "radiusKm": 40,
          "storm": [
            {
              "dir": 315,
              "km": 370
            },
            {
              "dir": 135,
              "km": 310
            }
          ],
          "gale": null,
          "intensity": "非常に強い",
          "time": "2026-10-22T21:00:00Z"
        },
        {
          "hours": 11,
          "lat": 22.9,
          "lon": 123.8,
          "pressure": "955",
          "windMs": "40",
          "gustMs": "60",
          "course": "北北西",
          "speedKmh": "20",
          "radiusKm": 45,
          "storm": [
            {
              "dir": null,
              "km": 320
            }
          ],
          "gale": null,
          "intensity": "強い",
          "location": "西表島の南約160km",
          "time": "2026-10-23T00:00:00Z"
        },
        {
          "hours": 14,
          "lat": 23.4,
          "lon": 123.5,
          "pressure": "955",
          "windMs": "40",
          "gustMs": "60",
          "course": "北北西",
          "speedKmh": "20",
          "radiusKm": 50,
          "storm": [
            {
              "dir": null,
              "km": 320
            }
          ],
          "gale": null,
          "intensity": "強い",
          "time": "2026-10-23T03:00:00Z"
        },
        {
          "hours": 17,
          "lat": 23.9,
          "lon": 123.2,
          "pressure": "955",
          "windMs": "40",
          "gustMs": "60",
          "course": "北北西",
          "speedKmh": "20",
          "radiusKm": 55,
          "storm": [
            {
              "dir": null,
              "km": 330
            }
          ],
          "gale": null,
          "intensity": "強い",
          "time": "2026-10-23T06:00:00Z"
        },
        {
          "hours": 20,
          "lat": 24.3,
          "lon": 122.8,
          "pressure": "955",
          "windMs": "40",
          "gustMs": "60",
          "course": "北西",
          "speedKmh": "20",
          "radiusKm": 60,
          "storm": [
            {
              "dir": null,
              "km": 330
            }
          ],
          "gale": null,
          "intensity": "強い",
          "time": "2026-10-23T09:00:00Z"
        },
        {
          "hours": 23,
          "lat": 24.5,
          "lon": 122.4,
          "pressure": "965",
          "windMs": "40",
          "gustMs": "55",
          "course": "北西",
          "speedKmh": "20",
          "radiusKm": 65,
          "storm": [
            {
              "dir": 90,
              "km": 340
            },
            {
              "dir": 270,
              "km": 230
            }
          ],
          "gale": null,
          "intensity": "強い",
          "location": "与那国島の西約60km",
          "time": "2026-10-23T12:00:00Z"
        },
        {
          "hours": 47,
          "lat": 27.8,
          "lon": 123.4,
          "pressure": "980",
          "windMs": "30",
          "gustMs": "45",
          "course": "北北東",
          "speedKmh": "15",
          "radiusKm": 155,
          "storm": [
            {
              "dir": 90,
              "km": 310
            },
            {
              "dir": 270,
              "km": 230
            }
          ],
          "gale": null,
          "intensity": "-",
          "location": "東シナ海",
          "time": "2026-10-24T12:00:00Z"
        },
        {
          "hours": 71,
          "lat": 31.8,
          "lon": 127.3,
          "pressure": "992",
          "windMs": "23",
          "gustMs": "35",
          "course": "北東",
          "speedKmh": "25",
          "radiusKm": 300,
          "storm": null,
          "gale": null,
          "intensity": "-",
          "location": "九州の西",
          "time": "2026-10-25T12:00:00Z"
        },
        {
          "hours": 95,
          "lat": 34.6,
          "lon": 136.6,
          "pressure": "998",
          "windMs": "18",
          "gustMs": "25",
          "course": "東北東",
          "speedKmh": "40",
          "radiusKm": 370,
          "storm": null,
          "gale": null,
          "intensity": "-",
          "location": "東海地方",
          "time": "2026-10-26T12:00:00Z"
        }
      ],
      "cwaTrackTime": "民國115年10月22日20時",
      "cwaTrack": [
        {
          "hours": 0,
          "time": "2026-10-22T12:00:00.000Z",
          "lat": 21.2,
          "lon": 124.9,
          "galeKm": 320,
          "stormKm": 140
        },
        {
          "time": "2026-10-22T18:00:00.000Z",
          "lat": 22,
          "lon": 124.4,
          "radiusKm": 30,
          "galeKm": 320,
          "stormKm": 140,
          "hours": 6
        },
        {
          "time": "2026-10-23T00:00:00.000Z",
          "lat": 22.8,
          "lon": 123.8,
          "radiusKm": 50,
          "galeKm": 320,
          "stormKm": 140,
          "hours": 12
        },
        {
          "time": "2026-10-23T06:00:00.000Z",
          "lat": 23.7,
          "lon": 123.2,
          "radiusKm": 80,
          "galeKm": 320,
          "stormKm": 120,
          "hours": 18
        },
        {
          "time": "2026-10-23T12:00:00.000Z",
          "lat": 24.4,
          "lon": 122.8,
          "radiusKm": 90,
          "galeKm": 320,
          "stormKm": 120,
          "hours": 24
        },
        {
          "time": "2026-10-24T00:00:00.000Z",
          "lat": 25.7,
          "lon": 122.6,
          "radiusKm": 100,
          "galeKm": 300,
          "stormKm": 100,
          "hours": 36
        },
        {
          "time": "2026-10-24T12:00:00.000Z",
          "lat": 27.6,
          "lon": 123.4,
          "radiusKm": 130,
          "galeKm": 280,
          "stormKm": 90,
          "hours": 48
        },
        {
          "time": "2026-10-25T12:00:00.000Z",
          "lat": 31.7,
          "lon": 127.2,
          "radiusKm": 210,
          "galeKm": 180,
          "stormKm": null,
          "hours": 72
        },
        {
          "time": "2026-10-26T12:00:00.000Z",
          "lat": 33.6,
          "lon": 132.3,
          "radiusKm": 360,
          "galeKm": null,
          "stormKm": null,
          "hours": 96
        }
      ]
    },
    "title": "定盤海運船班追蹤",
    "eyebrow": "定盤 2,340 kg · 併櫃海運（和其他貨拼同一個貨櫃）· 賣方訂艙",
    "subtitle": "日本工廠 → 神戶 → 基隆 → 龍潭廠。產線期限：11/2（一）下班前到龍潭廠。",
    "title_ja": "定盤 海上輸送 船便トラッカー",
    "title_en": "Lapping plate shipment tracker",
    "eyebrow_ja": "定盤 2,340 kg · 混載（他の貨物と同じコンテナ）· 売主手配",
    "eyebrow_en": "Lapping plate 2,340 kg · shared container (consolidated) · booked by the seller",
    "subtitle_ja": "日本の工場 → 神戸 → 基隆 → 龍潭工場。生産ラインの期限：11/2（月）終業までに龍潭工場着。",
    "subtitle_en": "Japan factory → Kobe → Keelung → Longtan plant. Production deadline: at the Longtan plant by end of business Mon 11/2.",
    "summary_ja": [
      "Yang Ming YM INCEPTION 251S がさらに遅れ：神戸 10/27（火）23:00（日本時間、台湾 22:00）発、基隆 10/30（金）07:00 着（10/25 05:05 公式で再確認、変更なし）。着港後 2–3 営業日なら 11/3（火）–11/4（水）で 11/2 に間に合わない。「着港後 1 営業日目」の 11/2（月）に通関・搬入できた場合のみ間に合う。",
      "やること：通関業者に着港前から書類を準備してもらい、10/30（金）着港当日または週末にコンテナの荷降ろしと許可の準備、11/2（月）朝に許可、当日トラックで龍潭へ。",
      "台風：CHAMPI は弱まり（気象庁 10/25 03:45 発表、10/27 03 時 日本時間に室戸岬の南・1002 hPa）、船の大阪着（10/27 06 時 日本時間）より前に通過。大阪・神戸の停止は最大半日程度。IN-FA はマーシャル諸島付近を北西進、10/30 03 時（日本時間）の予報点でも基隆から約 3,400 km で、予報期間内は神戸→基隆に影響なし。",
      "到着予測（10/25 05:05 第 4 回、公式再確認で結論変わらず）：現行スケジュールで最短 11/2。日本の港でさらに 12–48 時間遅れても週末を挟むため最短は 11/2 のままだが難しくなる。72 時間以上遅れ（基隆着 11/2）なら間に合わない。詳細は下の「到着予測 第 3 回」。",
      "ページを開くたび・「今すぐ更新」を押すたびに Yang Ming、気象庁、中央気象署、AIS の最新データを取り直します。"
    ],
    "summary_en": [
      "YM INCEPTION 251S has slipped again: departs Kobe Tue 10/27 23:00 JST (22:00 Taipei), arrives Keelung Fri 10/30 07:00 (re-checked on Yang Ming's official site 10/25 05:05, unchanged). At 2–3 working days after arrival that is 11/3–11/4, missing 11/2; only clearing and delivering on the first working day after arrival (Mon 11/2) makes it.",
      "To do: have the customs broker prepare the paperwork before arrival, get the container unloaded and release prepared on 10/30 or over the weekend, release first thing Mon 11/2 and truck to Longtan the same day.",
      "Typhoons: CHAMPI has weakened (JMA 03:45 JST 10/25: south of Cape Muroto at 1002 hPa by 03:00 JST 10/27), passing before the ship reaches Osaka (06:00 JST 10/27); at most about half a day of stoppage at Osaka/Kobe. IN-FA is near the Marshall Islands heading NW; its last forecast point (10/30) is still ~3,400 km from Keelung, so no impact on Kobe → Keelung within the forecast period.",
      "Arrival forecast (round 4, 10/25 05:05, unchanged after official re-check): earliest 11/2 on the current schedule; a further 12–48 h delay in Japan still gives 11/2 at best because of the weekend, but it gets harder; 72 h or more (Keelung on 11/2) misses the deadline. See 'Arrival forecast round 3' below.",
      "Every page load and every 'Refresh now' re-fetches the latest Yang Ming, JMA, CWA and AIS data."
    ],
    "mode": "LCL",
    "modeNote": "貨物和其他人的貨拼同一個貨櫃（併櫃）運送，已訂陽明 YM INCEPTION 251S。",
    "modeNote_ja": "他の荷主の貨物と同じコンテナに積み合わせて（混載）輸送。Yang Ming の YM INCEPTION 251S を予約済み。",
    "modeNote_en": "Shipping in a shared container with other cargo, booked on Yang Ming's YM INCEPTION 251S.",
    "holidays": [
      "2026-10-26"
    ],
    "deadlineTime": "下班前",
    "deadlineTime_ja": "終業まで",
    "deadlineTime_en": "by end of business",
    "forecastRound": {
      "at": "2026-10-25T05:05:00+08:00",
      "round": 4,
      "title": "到貨預測第 4 輪（陽明官網船期複核＋薔琵、煙花）",
      "title_ja": "到着予測 第 4 回（Yang Ming 公式スケジュール再確認＋CHAMPI・IN-FA）",
      "title_en": "Arrival forecast round 4 (Yang Ming official schedule re-check + CHAMPI, IN-FA)",
      "officialSchedule": {
        "checkedAt": "2026-10-25T05:05:00+08:00",
        "url": "https://www.yangming.com/en/esolution/schedule/vessel_schedule",
        "ports": [
          {"port": "東京", "arr": "10/24 15:55", "dep": "10/25 04:30", "status": "實際"},
          {"port": "橫濱", "arr": "10/25 06:00", "dep": "10/25 15:00", "status": "預估"},
          {"port": "名古屋", "arr": "10/26 04:00", "dep": "10/26 16:00", "status": "預估"},
          {"port": "大阪", "arr": "10/27 05:00", "dep": "10/27 14:00", "status": "預估"},
          {"port": "神戶", "arr": "10/27 15:00", "dep": "10/27 22:00", "status": "預估"},
          {"port": "基隆", "arr": "10/30 07:00", "dep": "10/30 16:00", "status": "預估"}
        ],
        "tz": "台北時間"
      },
      "history": [
        {"round": 3, "at": "2026-10-22T22:21:00+08:00", "kobe": "10/27（二）22:00", "kee": "10/30（五）07:00", "result": "最快 11/2；11/3 下班前應趕得上"}
      ],
      "scenarios": [
        {
          "kobe": "10/27（二）22:00",
          "kee": "10/30（五）07:00",
          "sea": "57",
          "first": "11/2（一）",
          "std": "11/3–11/4",
          "ok": "fast",
          "ok3": "yes",
          "zh": [
            "A. 照現在船期（颱風不再造成延誤）",
            "陽明官網 10/25 05:05 複核：神戶 10/27 23:00（日本時間）開＝台北 22:00，基隆 10/30 07:00 到，和第 3 輪相同。"
          ],
          "ja": [
            "A. 現行スケジュール（台風による追加遅れなし）",
            "Yang Ming 公式 10/25 05:05 再確認：神戸 10/27 23:00（日本時間）発＝台湾 22:00、基隆 10/30 07:00 着で第 3 回と同じ。"
          ],
          "en": [
            "A. Current schedule (no further typhoon delay)",
            "Yang Ming official, re-checked 10/25 05:05: Kobe dep 10/27 23:00 JST = 22:00 Taipei, Keelung arr 10/30 07:00 — same as round 3."
          ]
        },
        {
          "kobe": "10/28（三）10:00",
          "kee": "10/30（五）19:00",
          "sea": "57",
          "first": "11/2（一）",
          "std": "11/3–11/4",
          "ok": "fast",
          "ok3": "yes",
          "zh": [
            "B. 大阪、神戶停工 12 小時",
            "薔琵已減弱，氣象廳預報 10/27 02:00 在室戶岬南方、只剩 1002 百帕；船 10/27 05:00 才到大阪，影響應該很小。保守算第一警戒 0–12 小時，取上限。"
          ],
          "ja": [
            "B. 大阪・神戸が 12 時間止まる",
            "CHAMPI は弱まり、気象庁予報で 10/27 03 時（日本時間）室戸岬の南・1002 hPa。船の大阪着は 10/27 06 時（日本時間）で影響は小さい見込み。保守的に第一警戒 0–12 時間の上限。"
          ],
          "en": [
            "B. Osaka/Kobe work halted 12 h",
            "CHAMPI has weakened; JMA has it south of Cape Muroto at 1002 hPa by 03:00 JST 10/27, before the ship reaches Osaka (06:00 JST). Conservatively a first-level alert, 0–12 h, upper end."
          ]
        },
        {
          "kobe": "10/28（三）22:00",
          "kee": "10/31（六）07:00",
          "sea": "57",
          "first": "11/2（一）",
          "std": "11/3–11/4",
          "ok": "hard",
          "ok3": "buffer",
          "zh": [
            "C. 船出港避颱、延誤 24 小時",
            "颱風路徑偏北或偏強，港口第二警戒，船出港避難再回來排隊。週六到港，拆櫃和放行準備要靠週末加班。"
          ],
          "ja": [
            "C. 港外避難で 24 時間遅れ",
            "台風が北寄り・強めの場合、第二警戒体制で港外へ避難し再入港。土曜着、週末の作業が必要。"
          ],
          "en": [
            "C. Ship leaves port to shelter, 24 h delay",
            "Track further north or stronger: second-level port alert, ship shelters outside and re-queues. Saturday arrival; needs weekend work."
          ]
        },
        {
          "kobe": "10/29（四）22:00",
          "kee": "11/1（日）07:00",
          "sea": "57",
          "first": "11/2（一）",
          "std": "11/3–11/4",
          "ok": "hard",
          "ok3": "buffer",
          "zh": [
            "D. 延誤 48 小時（避颱＋排隊靠碼頭）",
            "避颱後港口塞船，再多等一天。週日到港，11/2 當天要完成拆櫃、放行、送廠，幾乎沒有餘地。"
          ],
          "ja": [
            "D. 48 時間遅れ（避難＋着岸待ち）",
            "避難後の混雑でさらに 1 日。日曜着、11/2 当日に荷降ろし・許可・搬入まで必要で余地はほぼない。"
          ],
          "en": [
            "D. 48 h delay (shelter + berth queue)",
            "Port congestion after the storm adds a day. Sunday arrival; unloading, release and delivery all on 11/2 — almost no room."
          ]
        },
        {
          "kobe": "10/30（五）22:00",
          "kee": "11/2（一）07:00",
          "sea": "57",
          "first": "11/3（二）",
          "std": "11/4–11/5",
          "ok": "no",
          "ok3": "tight",
          "zh": [
            "E. 延誤 72 小時以上（目前預報沒有這種情況；煙花預報期間內離台灣還很遠）",
            "例如另有新颱風或基隆港管制。11/2 當天才到港，趕不上。"
          ],
          "ja": [
            "E. 72 時間以上の遅れ（現在の予報にはない）",
            "新たな台風や基隆港の規制など。11/2 着港では間に合わない。"
          ],
          "en": [
            "E. 72 h+ delay (not in current forecasts)",
            "E.g. a new typhoon or Keelung port closure. Arriving on 11/2 itself misses the deadline."
          ]
        }
      ],
      "watch": {
        "level": "緊盯",
        "from": "2026-10-26T00:00:00+08:00",
        "to": "2026-10-28T12:00:00+08:00",
        "title": "重點監控：神戶／大阪港可能因颱風管制",
        "title_ja": "重点監視：台風で神戸・大阪港が規制される可能性",
        "title_en": "Close watch: Kobe / Osaka port controls from the typhoon",
        "text": "薔琵 10/26–27 減弱後，會從神戶南方的海上往東走。如果神戶或大阪港因此管制（停止作業或船要出港避難），YM INCEPTION 251S 原定 10/27 22:00 離開神戶、10/30 07:00 到基隆，可能再延後。這段時間每天盯港口公告和船期，有變動就更新預測表（對應情境 B–D）。",
        "text_ja": "CHAMPI は 10/26–27 に弱まった後、神戸南方の海上を東へ進む見込み。神戸港・大阪港が規制（荷役停止や港外避難）になれば、YM INCEPTION 251S（神戸発 10/27 22:00、基隆着 10/30 07:00 予定、台湾時間）はさらに遅れる可能性。この期間は毎日、港の発表と船期を確認し、変更があれば予測表（シナリオ B–D）を更新。",
        "text_en": "After weakening on 10/26–27, CHAMPI is expected to move east over the sea south of Kobe. If Kobe or Osaka ports impose controls (work halted or ships sent out to shelter), YM INCEPTION 251S (planned to leave Kobe 10/27 22:00, reach Keelung 10/30 07:00, Taiwan time) could be delayed further. Check port notices and the schedule daily in this window; the forecast table (scenarios B–D) will be updated on any change.",
        "track": [[134.2,32.6],[135.0,33.0],[136.0,33.3],[137.2,33.6],[138.6,34.0]]
      },
      "assumptions": [
        "船公司官網的最新時間為準；港與港之間的航行時間照陽明船期（神戶開→基隆到 57 小時，台灣時間計），延誤時航行時間不變、整段往後推。",
        "到港後送廠：照網站規則，到港後第 2–3 個工作天（一般），最快第 1 個工作天（要報關行事先備好文件、到港後儘快拆櫃放行、當天派車）。週六、週日不算工作天；10/26 是台灣休假日，已不影響這班。",
        "這班貨和別人的貨拼同一個貨櫃，到港後要先卸櫃、拆櫃才能放行，所以「到港當天」不算第 1 個工作天。",
        "基隆到龍潭廠卡車約 1.5–2 小時；11/2 當天放行就能在下班前送到。",
        "颱風延誤照網站「貨輪避颱的標準流程」：日本港口第一警戒 0–12 小時、第二警戒船出港避難（本輪假設 24–48 小時）；颱風過後加 6 小時恢復作業。預報只到 10/26 晚上，之後沒有預報，不外推。",
        "台灣海上／陸上颱風警報：薔琵 10/23–24 最接近台灣，這時船在東京附近，不影響航程；警報狀態以氣象署公告為準（本次自動抓取無法讀到警報頁的即時狀態）。"
      ],
      "assumptions_ja": [
        "船会社サイトの最新時刻を基準。神戸発→基隆着は 57 時間（台湾時間）で、遅れても航海時間は変えず全体を後ろへずらす。",
        "着港後の搬入：通常 2–3 営業日目、最短 1 営業日目（通関業者が事前に書類準備、着港後すぐ荷降ろし・許可、当日配車）。土日は営業日に含めない。10/26 の台湾休日はこの便に影響しない。",
        "混載貨物のため、着港後にコンテナの荷降ろしが必要で、着港当日は 1 営業日目に数えない。",
        "基隆→龍潭のトラックは約 1.5–2 時間。11/2 当日に許可が出れば終業前に搬入可能。",
        "台風遅延はサイトの「台風避難の標準手順」に従う：第一警戒 0–12 時間、第二警戒で港外避難（今回 24–48 時間と仮定）、通過後 6 時間で作業再開。予報は 10/26 夜までで、外挿しない。",
        "台湾の海上・陸上台風警報：10/23–24 の最接近時、船は東京付近で航路に影響なし。警報状況は中央気象署の発表に従う（今回の自動取得では警報ページの状況を読めず）。"
      ],
      "assumptions_en": [
        "Latest carrier times rule. Kobe departure → Keelung arrival is 57 h (Taiwan time); delays shift everything later, sea time unchanged.",
        "Arrival → plant: normally the 2nd–3rd working day after arrival, fastest the 1st (broker prepares papers in advance, container unloaded and released quickly, truck same day). Weekends are not working days; Taiwan's 10/26 holiday no longer affects this sailing.",
        "The cargo shares a container, which must be unloaded and unpacked first, so the arrival day itself does not count as the 1st working day.",
        "Keelung → Longtan by truck is about 1.5–2 h, so release on 11/2 still allows delivery before close of business.",
        "Typhoon delays follow the site's 'standard typhoon procedure': first-level port alert 0–12 h, second-level alert ship shelters outside (assumed 24–48 h this round), +6 h to resume work. Forecasts end on the evening of 10/26 and are not extrapolated.",
        "Taiwan sea/land typhoon warnings: CHAMPI is closest to Taiwan on 10/23–24 while the ship is near Tokyo, so the voyage is unaffected; warning status per CWA (the automated fetch could not read the live warning page this time)."
      ],
      "sources": [
        {
          "label": "陽明官網 船期查詢 YM INCEPTION（官網船期更新時間 10/25 05:05 查）",
          "label_ja": "Yang Ming 公式 船舶スケジュール（10/25 05:05 確認）",
          "label_en": "Yang Ming official vessel schedule (checked 10/25 05:05)",
          "url": "https://www.yangming.com/en/esolution/schedule/vessel_schedule",
          "at": "10/25 05:05"
        },
        {
          "label": "陽明日本代理 神戶船期（Voyage Detail）",
          "label_ja": "Yang Ming 日本代理店 神戸",
          "label_en": "Yang Ming Japan agent, Kobe",
          "url": "https://www.toyoshingo.com/yangming/certificate.php?portcode=41&id=10381411",
          "at": "10/25 05:05"
        },
        {
          "label": "陽明日本代理 東京／名古屋／大阪",
          "label_ja": "同 東京・名古屋・大阪",
          "label_en": "Same, Tokyo / Nagoya / Osaka",
          "url": "https://www.toyoshingo.com/yangming/index.php?port=41&week=4",
          "at": "10/25 05:05"
        },
        {
          "label": "陽明基隆靠泊表",
          "label_ja": "Yang Ming 基隆着岸予定表",
          "label_en": "Yang Ming Keelung berth list",
          "url": "https://ymkeeweb.yangming.com/YMKEE/vslterm",
          "at": "10/25 05:05"
        },
        {
          "label": "日本氣象廳 颱風資訊（薔琵 10/25 03:45、煙花 04:10 日本時間發布）",
          "label_ja": "気象庁 台風情報（CHAMPI 10/25 03:45・IN-FA 04:10 発表）",
          "label_en": "JMA typhoon info (CHAMPI 03:45, IN-FA 04:10 JST 10/25)",
          "url": "https://www.jma.go.jp/bosai/map.html#contents=typhoon",
          "at": "10/25 05:05"
        },
        {
          "label": "中央氣象署 颱風消息（10/25 02 時）",
          "label_ja": "中央気象署 台風情報（10/25 02 時）",
          "label_en": "Taiwan CWA typhoon news (10/25 02:00)",
          "url": "https://www.cwa.gov.tw/V8/C/P/Typhoon/TY_NEWS.html",
          "at": "10/25 05:05"
        },
        {
          "label": "中央氣象署 颱風警報頁（自動抓取讀不到即時狀態）",
          "label_ja": "中央気象署 台風警報（自動取得では状況を読めず）",
          "label_en": "Taiwan CWA typhoon warnings (live status not readable by the automated fetch)",
          "url": "https://www.cwa.gov.tw/V8/C/P/Typhoon/TY_WARN.html",
          "at": "10/25 05:05"
        }
      ],
      "note": "官網船期更新時間：10/25 05:05（台北時間）查陽明官網 YM INCEPTION 251S，神戶 10/27 22:00 開、基隆 10/30 07:00 到（台北時間），和第 3 輪（10/22 22:21）相同；官網上的日本港口時間是日本時間，比台北快 1 小時。規則推算，不是船公司或報關行的承諾；船期以陽明公告為準。",
      "note_ja": "公式スケジュール確認：10/25 05:05（台湾時間）Yang Ming 公式で YM INCEPTION 251S は神戸 10/27 22:00 発・基隆 10/30 07:00 着（台湾時間）、第 3 回（10/22 22:21）と同じ。公式サイトの日本の港は日本時間（台湾より 1 時間進み）。ルールに基づく推計で、船会社・通関業者の確約ではありません。",
      "note_en": "Official schedule checked 10/25 05:05 Taipei on Yang Ming's site: YM INCEPTION 251S departs Kobe 10/27 22:00, arrives Keelung 10/30 07:00 (Taipei time), unchanged from round 3 (10/22 22:21). Japanese port times on the official site are JST (1 h ahead of Taipei). A rule-based estimate, not a commitment by the carrier or broker."
    }
  },
  "vessels": [
    {
      "alert": {
        "level": "alert",
        "text": [
          "神戶收貨截止 10/20，日本端貨最快 10/21 才能取貨，且未訂到艙位、無法另辦出口報關"
        ],
        "text_ja": [
          "神戸の搬入締切は 10/20 だが、日本側の集荷は最短 10/21。スペースも予約できておらず、輸出通関も別に手配できない"
        ],
        "text_en": [
          "The Kobe warehouse deadline was 10/20, but the goods could only be picked up in Japan on 10/21 at the earliest; no space was booked and export customs could not be arranged separately"
        ]
      },
      "carrier": "ONE",
      "cyCut": {
        "note": [
          "台北時間 10/20 15:30",
          "ONE 官網貨物截止；VGM 截止 10/22 17:00"
        ],
        "src": "ONE 官網",
        "state": "open",
        "text": "10/20（二）16:30",
        "note_ja": [
          "台湾時間 10/20 15:30",
          "ONE 公式の貨物締切。VGM 締切は 10/22 17:00"
        ],
        "note_en": [
          "Taipei time 10/20 15:30",
          "ONE official cargo cut-off; VGM cut-off 10/22 17:00"
        ]
      },
      "dates": {
        "etaFrom": "2026-10-26T17:00:00+08:00",
        "etaTo": null,
        "etd": "2026-10-24T07:30:00+09:00",
        "plantFrom": "2026-10-28",
        "plantTo": "2026-10-29"
      },
      "imo": "9345960",
      "kobeEtd": {
        "note": [
          "台北時間 10/24 06:30",
          "預估",
          "10-23 12:30 到港"
        ],
        "src": "ONE 官網",
        "text": "10/24（六）07:30",
        "note_ja": [
          "台湾時間 10/24 06:30",
          "予定",
          "10-23 12:30 入港"
        ],
        "note_en": [
          "Taipei time 10/24 06:30",
          "Estimated",
          "Arrives 10-23 12:30"
        ]
      },
      "links": [
        {
          "label": "AIS-catcher",
          "url": "https://www.aiscatcher.org/ship/details/636018364"
        },
        {
          "label": "MyShipTracking",
          "url": "https://www.myshiptracking.com/vessels/navios-chrysalis-mmsi-636018364-imo-9345960"
        },
        {
          "label": "Flexport",
          "url": "https://atlas.flexport.com/vessel/imo:9345960/mmsi:636018364/name:navios-chrysalis"
        }
      ],
      "live": {
        "at": "2026-10-20T00:05:28Z",
        "cog": null,
        "last": "東京",
        "lat": 35.6128,
        "lon": 139.7627,
        "next": "神戶",
        "nextEta": "2026-10-22T20:00:00Z",
        "sog": 0,
        "src": "VesselFinder",
        "srcUrl": "https://www.vesselfinder.com/vessels/details/9345960",
        "status": "停靠中",
        "where": "東京港（ONE：10/20 15:00 開，經橫濱往神戶）",
        "where_ja": "東京港（ONE：10/20 15:00 発、横浜経由で神戸へ）",
        "where_en": "Port of Tokyo (ONE: departs 10/20 15:00 for Kobe via Yokohama)",
        "status_ja": "停泊中",
        "status_en": "In port",
        "next_ja": "神戸",
        "next_en": "Kobe",
        "last_ja": "東京",
        "last_en": "Tokyo"
      },
      "mmsi": "636018364",
      "name": "NAVIOS CHRYSALIS",
      "order": 2,
      "plant": {
        "note": [
          "到港後約 2–3 個工作天，會加急處理"
        ],
        "text": "10/28–29",
        "note_ja": [
          "着港後 約 2–3 営業日、急ぎで対応"
        ],
        "note_en": [
          "About 2–3 working days after arrival, rushed"
        ]
      },
      "role": "無法搭乘",
      "tier": "ref",
      "track": [],
      "twEta": {
        "note": [
          "ONE 預估"
        ],
        "src": "ONE 官網",
        "text": "基隆 10/26（一）17:00",
        "note_ja": [
          "ONE 予定"
        ],
        "note_en": [
          "ONE estimate"
        ]
      },
      "twPort": "基隆",
      "updatedAt": "2026-10-20T11:46:05+08:00",
      "voyage": "018S",
      "id": "navios-chrysalis",
      "voyage_ja": "018S",
      "voyage_en": "018S",
      "role_ja": "利用不可",
      "role_en": "Not possible",
      "lcl": {
        "status": "na",
        "label": "無法搭乘",
        "label_ja": "利用不可",
        "label_en": "Not possible",
        "note": "神戶收貨截止 10/20，日本端貨最快 10/21 才能取貨，且未訂到艙位、無法另辦出口報關",
        "note_ja": "神戸の搬入締切は 10/20 だが、日本側の集荷は最短 10/21。スペースも予約できておらず、輸出通関も別に手配できない",
        "note_en": "The Kobe warehouse deadline was 10/20, but the goods could only be picked up in Japan on 10/21 at the earliest; no space was booked and export customs could not be arranged separately",
        "cut": {
          "text": "10/20（二）16:30",
          "text_ja": "10/20（火）16:30",
          "text_en": "10/20 (Tue) 16:30",
          "src": "ONE 官網",
          "src_ja": "ONE 公式",
          "src_en": "ONE official",
          "state": "open",
          "note": [
            "目標是讓貨在 10/20 當天就送到神戶港（請日本端派專車直送，或請 ONE 同意晚一點進倉）"
          ],
          "note_ja": [
            "目標は貨物を 10/20 当日に神戸港へ届けること（日本側に専用トラックでの直送を依頼、または ONE に遅れ搬入を依頼中）"
          ],
          "note_en": [
            "Aiming to get the cargo to the Kobe warehouse on 10/20 itself (asking the Japan side to send a dedicated truck, or asking ONE to allow it in late)"
          ]
        }
      },
      "fcl": {
        "status": "possible",
        "label": "整櫃：若 10/20 準時進港也來得及，但這批貨用併櫃更合適",
        "label_ja": "FCL：10/20 に間に合えば使えるが、この荷量には混載の方が適切",
        "label_en": "FCL: also workable if the cargo reaches the port on time on 10/20, but LCL suits this small shipment better",
        "note": "進倉截止同樣是 10/20（二）16:30",
        "note_ja": "搬入締切は混載と同じ 10/20（火）16:30",
        "note_en": "Same warehouse deadline as LCL: 10/20 (Tue) 16:30"
      },
      "noGo": "工廠到神戶約 200 km，10/20 派不到卡車。賣方條件是工廠交貨，日本出口報關沒人辦，也沒訂到艙位。",
      "noGo_ja": "工場から神戸まで約 200 km で、10/20 はトラックが手配できなかった。売主の条件は工場渡しで、日本の輸出通関の担当がおらず、スペースも取れていない。",
      "noGo_en": "The factory is about 200 km from Kobe and no truck was available on 10/20. The seller only hands over at the factory, so nobody could do Japan export customs, and no space was booked."
    },
    {
      "alert": {
        "level": "alert",
        "text": [
          "併櫃艙位已滿"
        ],
        "text_ja": [
          "混載のスペースが満杯"
        ],
        "text_en": [
          "No room left in the shared container"
        ]
      },
      "carrier": "陽明 Yang Ming",
      "cyCut": {
        "note": [
          "船延到 10/21 才開",
          "收櫃截止時間已過，要請陽明同意晚一點進櫃（late come），才裝得上這班船"
        ],
        "src": "",
        "state": "passed",
        "text": "截止已過",
        "note_ja": [
          "出港が 10/21 に延びた",
          "搬入締切はすでに過ぎており、陽明海運に遅れ搬入（レイトカム）を認めてもらえれば積める"
        ],
        "note_en": [
          "Departure slipped to 10/21",
          "The container cut-off has passed; it can only go on this ship if Yang Ming agrees to accept the container late (late come)"
        ],
        "text_ja": "締切は経過",
        "text_en": "Cut-off passed"
      },
      "dates": {
        "etaFrom": "2026-10-24T07:00:00+08:00",
        "etaTo": null,
        "etd": "2026-10-21T23:00:00+09:00",
        "plantFrom": "2026-10-28",
        "plantTo": "2026-10-29"
      },
      "imo": "9334014",
      "kobeEtd": {
        "text": "10/21（三）23:00",
        "text_ja": "10/21（水）23:00",
        "text_en": "10/21 (Wed) 23:00",
        "src": "陽明日本代理",
        "src_ja": "Yang Ming 日本代理店",
        "src_en": "Yang Ming Japan agent",
        "note": [
          "神戶 10/21 17:00 到",
          "大阪 10/21 07:00–15:00"
        ],
        "note_ja": [
          "神戸 10/21 17:00 着",
          "大阪 10/21 07:00–15:00"
        ],
        "note_en": [
          "Arrives Kobe 10/21 17:00",
          "Osaka 10/21 07:00–15:00"
        ]
      },
      "links": [
        {
          "label": "MyShipTracking",
          "url": "https://www.myshiptracking.com/vessels/ym-improvement-mmsi-636013121-imo-9334014"
        },
        {
          "label": "AIS-catcher",
          "url": "https://www.aiscatcher.org/ship/details/636013121"
        },
        {
          "label": "陽明日本代理",
          "url": "https://www.toyoshingo.com/yangming/index.php?port=41&week=4"
        }
      ],
      "live": {
        "at": "2026-10-19T23:48:44Z",
        "lat": 35.0232,
        "lon": 136.7956,
        "sog": 0,
        "cog": null,
        "last": "名古屋",
        "next": "大阪",
        "src": "VesselFinder",
        "srcUrl": "https://www.vesselfinder.com/vessels/details/9334014",
        "status": "停靠中",
        "where": "名古屋港",
        "where_ja": "名古屋港",
        "where_en": "Port of Nagoya",
        "nextEta": "2026-10-20T22:00:00Z",
        "status_ja": "停泊中",
        "status_en": "In port",
        "last_ja": "名古屋",
        "last_en": "Nagoya",
        "next_ja": "大阪",
        "next_en": "Osaka"
      },
      "mmsi": "636013121",
      "name": "YM IMPROVEMENT",
      "order": 2,
      "plant": {
        "note": [
          "到港後約 2–3 個工作天，會加急處理"
        ],
        "text": "10/28–29",
        "note_ja": [
          "着港後 約 2–3 営業日、急ぎで対応"
        ],
        "note_en": [
          "About 2–3 working days after arrival, rushed"
        ]
      },
      "role": "併櫃已滿・整櫃要陽明同意晚一點進櫃",
      "tier": "ask",
      "track": [
        {
          "lat": 33.568,
          "lon": 136.7914,
          "t": "2026-10-17T02:54:00Z"
        },
        {
          "lat": 35.4361,
          "lon": 139.6811,
          "t": "2026-10-18T10:54:06Z"
        }
      ],
      "twEta": {
        "note": "陽明基隆靠泊表",
        "src": "陽明基隆靠泊表",
        "text": "基隆 10/24（六）07:00",
        "note_ja": "Yang Ming 基隆着岸予定表",
        "note_en": "Yang Ming Keelung berth list"
      },
      "twPort": "基隆",
      "updatedAt": "2026-10-20T11:46:06+08:00",
      "voyage": "279S",
      "id": "ym-improvement",
      "role_ja": "混載は満杯・FCL は Yang Ming の遅れ搬入の了承が必要",
      "role_en": "LCL full · FCL needs Yang Ming to accept late",
      "lcl": {
        "status": "full",
        "label": "併櫃已滿・排不上",
        "label_ja": "混載枠満杯・積載不可",
        "label_en": "LCL full · not available",
        "note": "10/19 截止；貨代確認排不上（10/19 回覆）",
        "note_ja": "10/19 締切。フォワーダーが積めないと確認（10/19 回答）",
        "note_en": "Cut-off 10/19; the forwarder confirmed there is no space (10/19)",
        "cut": {
          "text": "10/19 截止・已滿",
          "text_ja": "10/19 締切・満杯",
          "text_en": "Cut-off 10/19 · full",
          "src": "賣方（貨代確認）",
          "src_ja": "売主（フォワーダー確認）",
          "src_en": "Seller (forwarder)",
          "state": "passed"
        }
      },
      "fcl": {
        "status": "possible",
        "label": "整櫃：截止已過，要陽明同意晚一點進櫃",
        "label_ja": "FCL：締切経過、Yang Ming の遅れ搬入の了承が必要",
        "label_en": "FCL: cut-off passed, Yang Ming must accept late",
        "note": "神戶 10/21 23:00 開",
        "note_ja": "神戸 10/21 23:00 発",
        "note_en": "Departs Kobe 10/21 23:00"
      },
      "noGo": "這班 10/21 23:00 就從神戶開走，貨 10/21 才離開工廠，來不及進倉。而且併櫃位子已經滿了。",
      "noGo_ja": "この船は 10/21 23:00 に神戸を出るが、貨物は 10/21 に工場を出るので倉庫に間に合わない。混載の枠も満杯。",
      "noGo_en": "It leaves Kobe at 23:00 on 10/21, but the cargo only leaves the factory that day and can't reach the warehouse in time. The shared container is also full."
    },
    {
      "alert": {
        "level": "alert",
        "text": [
          "貨代併櫃不走長榮，且該航次已不在長榮船期表"
        ],
        "text_ja": [
          "フォワーダーの混載は Evergreen を使わず、この航海は Evergreen のスケジュールからも消えている"
        ],
        "text_en": [
          "The forwarder's shared containers don't go with Evergreen, and this voyage is no longer on Evergreen's schedule"
        ]
      },
      "carrier": "長榮／萬海",
      "cyCut": {
        "note": [
          "長榮官網神戶船期未列此班",
          "要請長榮／萬海確認這班還能不能讓我們的貨櫃上船"
        ],
        "src": "長榮官網",
        "state": "unknown",
        "text": "未公布",
        "note_ja": [
          "Evergreen 公式の神戸スケジュールにこの便は未掲載。",
          "このコンテナを積めるか Evergreen／Wan Hai に要確認"
        ],
        "note_en": [
          "Not on Evergreen's official Kobe schedule",
          "Check with Evergreen / Wan Hai whether our container can still go on this ship"
        ]
      },
      "dates": {
        "etd": "2026-10-21T06:15:00+09:00",
        "etaFrom": "2026-10-25T12:00:00+08:00",
        "etaTo": "2026-10-26T12:00:00+08:00",
        "plantFrom": "2026-10-27",
        "plantTo": "2026-10-28"
      },
      "imo": "9859923",
      "kobeEtd": {
        "note": [
          "10/20 17:30 靠神戶",
          "長榮官網未列"
        ],
        "src": "陽明日本代理",
        "text": "10/21（三）06:15",
        "note_ja": [
          "10/20 17:30 神戸着",
          "Evergreen 公式には未掲載"
        ],
        "note_en": [
          "Arrives Kobe 10/20 17:30",
          "Not listed by Evergreen"
        ]
      },
      "links": [
        {
          "label": "MyShipTracking",
          "url": "https://www.myshiptracking.com/vessels/green-celebrity-mmsi-355224000-imo-9859923"
        },
        {
          "label": "Flexport",
          "url": "https://atlas.flexport.com/vessel/imo:9859923/mmsi:355224000/name:green-celebrity"
        },
        {
          "label": "陽明日本代理",
          "url": "https://www.toyoshingo.com/yangming/index.php?port=41&week=4"
        }
      ],
      "live": {
        "at": "2026-10-20T00:04:32Z",
        "cog": null,
        "last": "台北港",
        "lastAt": "2026-10-17T11:27:00Z",
        "lat": 34.6647,
        "lon": 135.2347,
        "next": null,
        "nextEta": null,
        "sog": 0.1,
        "src": "VesselFinder",
        "srcUrl": "https://www.vesselfinder.com/vessels/details/9859923",
        "status": "停靠中",
        "where": "神戶港",
        "where_ja": "神戸港",
        "where_en": "Port of Kobe",
        "status_ja": "停泊中",
        "status_en": "In port",
        "next_ja": null,
        "next_en": null
      },
      "mmsi": "355224000",
      "name": "GREEN CELEBRITY",
      "order": 3,
      "plant": {
        "note": [
          "到港後約 2–3 個工作天，會加急處理"
        ],
        "text": "10/27–28",
        "note_ja": [
          "着港後 約 2–3 営業日、急ぎで対応"
        ],
        "note_en": [
          "About 2–3 working days after arrival, rushed"
        ],
        "text_ja": "10/27–28",
        "text_en": "10/27–28"
      },
      "role": "併櫃排不到・整櫃要問能否裝船",
      "tier": "ask",
      "track": [
        {
          "lat": 25.1653,
          "lon": 121.3928,
          "t": "2026-10-17T07:38:00Z"
        }
      ],
      "twEta": {
        "text": "台北港 約 10/25–26",
        "text_ja": "台北港 10/25–26 ごろ",
        "text_en": "Taipei Port around 10/25–26",
        "src": "推估",
        "src_ja": "推定",
        "src_en": "estimate",
        "note": [
          "上一趟神戶→門司→博多→台北港約 4.6 天"
        ],
        "note_ja": [
          "前航海の神戸→門司→博多→台北港は約 4.6 日"
        ],
        "note_en": [
          "Previous trip Kobe → Moji → Hakata → Taipei took about 4.6 days"
        ]
      },
      "twPort": "台北港",
      "updatedAt": "2026-10-19T12:10:00+08:00",
      "voyage": "S133",
      "id": "green-celebrity",
      "role_ja": "混載不可・FCL は積めるか要確認",
      "role_en": "No LCL · FCL: ask if it can load",
      "lcl": {
        "status": "na",
        "label": "併櫃排不到（貨代不走長榮／萬海）",
        "label_ja": "混載不可（Evergreen／Wan Hai 不使用）",
        "label_en": "No LCL (forwarder does not use Evergreen / Wan Hai)",
        "note": "賣方日本端只配合一家貨代（走陽明）",
        "note_ja": "売主の日本側はフォワーダー 1 社（Yang Ming 利用）のみ",
        "note_en": "The seller's Japan side uses one forwarder (Yang Ming)"
      },
      "fcl": {
        "status": "possible",
        "label": "整櫃：要長榮／萬海同意讓貨櫃上船",
        "label_ja": "FCL：Evergreen／Wan Hai の了承が必要",
        "label_en": "FCL: Evergreen / Wan Hai must agree to take it",
        "note": "神戶 10/21 06:15 開，貨要 10/20 進港",
        "note_ja": "神戸 10/21 06:15 発、10/20 までに搬入が必要",
        "note_en": "Departs Kobe 10/21 06:15; cargo must be at port by 10/20"
      },
      "noGo": "這班 10/21 清晨就從神戶開走，貨要 10/20 前到港才上得了，來不及。貨代的併櫃也不走這家船公司。",
      "noGo_ja": "この船は 10/21 早朝に神戸を出るため、10/20 までに港に着く必要があり間に合わない。フォワーダーの混載もこの船会社を使わない。",
      "noGo_en": "It leaves Kobe early on 10/21, so the cargo had to be at the port by 10/20, which wasn't possible. The forwarder's shared containers don't use this line either."
    },
    {
      "id": "ever-compose",
      "order": 4,
      "name": "EVER COMPOSE",
      "tier": "ask",
      "voyage": "112S（長榮 2100-112S）",
      "voyage_ja": "112S（Evergreen 2100-112S）",
      "voyage_en": "112S (Evergreen 2100-112S)",
      "carrier": "長榮 Evergreen（NSA）",
      "carrier_ja": "Evergreen（NSA）",
      "carrier_en": "Evergreen (NSA)",
      "twPort": "台北港",
      "twPort_ja": "台北港",
      "twPort_en": "Taipei Port",
      "imo": "9913810",
      "mmsi": "352978183",
      "role": "整櫃・長榮官網 10/27 到台北港，最快剛好 10/28",
      "role_ja": "FCL・Evergreen 公式で 10/27 台北港着、最速で 10/28 ちょうど",
      "role_en": "FCL · Evergreen: Taipei Port 10/27, 10/28 at best",
      "cyCut": {
        "text": "10/16（五）16:30 已過",
        "state": "passed",
        "src": "長榮官網 PDF（Oct 15,2026）",
        "note": [
          "台北時間 10/16 15:30",
          "收櫃截止時間已過，要請長榮同意晚一點進櫃（late come），才裝得上這班船"
        ],
        "note_ja": [
          "台湾時間 10/16 15:30",
          "搬入締切はすでに過ぎており、Evergreen に遅れ搬入（レイトカム）を認めてもらえれば積める"
        ],
        "note_en": [
          "Taipei time 10/16 15:30",
          "The cut-off has passed; it can only go on this ship if Evergreen agrees to accept the container late (late come)"
        ]
      },
      "kobeEtd": {
        "text": "10/22（四）",
        "src": "長榮官網 PDF（Oct 15,2026）",
        "note": [
          "長榮官網：10/22 到神戶、同一天開",
          "大阪 10/21 到（AIS 預計）"
        ],
        "note_ja": [
          "Evergreen 公式：10/22 神戸着、同日出港",
          "大阪 10/21 着（AIS の予定）"
        ],
        "note_en": [
          "Evergreen official: arrives and leaves Kobe on 10/22",
          "Osaka 10/21 (AIS ETA)"
        ]
      },
      "twEta": {
        "text": "台北港 10/27（二）",
        "src": "長榮官網 PDF（Oct 15,2026）",
        "note": [
          "長榮官網只列日期，沒有時間",
          "這條航線不靠基隆"
        ],
        "note_ja": [
          "Evergreen 公式は日付のみで時刻なし",
          "この航路は基隆に寄港しません"
        ],
        "note_en": [
          "Evergreen lists the date only, no time",
          "This route does not call Keelung"
        ]
      },
      "plant": {
        "text": "10/29–30",
        "note": [
          "到港後約 2–3 個工作天，會加急處理"
        ],
        "note_ja": [
          "着港後 約 2–3 営業日、急ぎで対応"
        ],
        "note_en": [
          "About 2–3 working days after arrival, rushed"
        ]
      },
      "dates": {
        "etd": "2026-10-22T12:00:00+09:00",
        "etaFrom": "2026-10-27T12:00:00+08:00",
        "etaTo": null,
        "plantFrom": "2026-10-29",
        "plantTo": "2026-10-30"
      },
      "alert": {
        "level": "alert",
        "text": [
          "收貨截止 10/16 已過，貨代併櫃不走長榮"
        ],
        "text_ja": [
          "搬入締切 10/16 は経過、フォワーダーの混載は Evergreen を使わない"
        ],
        "text_en": [
          "The 10/16 cargo deadline has passed, and the forwarder's shared containers don't go with Evergreen"
        ]
      },
      "live": {
        "at": "2026-10-18T19:41:00Z",
        "lat": 25.63,
        "lon": 121.32,
        "sog": 16.9,
        "cog": 62,
        "status": "航行中",
        "status_ja": "航行中",
        "status_en": "Under way",
        "where": "台灣北部外海（淡水外海），往大阪",
        "where_ja": "台湾北部の沖（淡水沖）、大阪へ",
        "where_en": "Off northern Taiwan (off Tamsui), bound for Osaka",
        "next": "大阪",
        "next_ja": "大阪",
        "next_en": "Osaka",
        "nextEta": "2026-10-21T02:00:00Z",
        "last": "蛇口",
        "last_ja": "蛇口",
        "last_en": "Shekou",
        "lastAt": "2026-10-17T12:47:00Z",
        "src": "VesselFinder／AIS-catcher",
        "srcUrl": "https://www.vesselfinder.com/vessels/details/9913810"
      },
      "links": [
        {
          "label": "長榮神戶船期 PDF",
          "label_ja": "Evergreen 神戸スケジュール PDF",
          "label_en": "Evergreen Kobe schedule PDF",
          "url": "https://www.shipmentlink.com/jp/tvs2/local_file/jpkbe/JPKBE_OA08T03.pdf"
        },
        {
          "label": "Flexport",
          "url": "https://atlas.flexport.com/vessel/imo:9913810/mmsi:352978183/name:ever-compose"
        },
        {
          "label": "MyShipTracking",
          "url": "https://www.myshiptracking.com/vessels/ever-compose-mmsi-352978183-imo-9913810"
        },
        {
          "label": "博多港航線一覽",
          "label_ja": "博多港 航路一覧",
          "label_en": "Hakata port route list",
          "url": "https://www.city.fukuoka.lg.jp/kowan/shinko/hakata-port/documents/eng20261001internationalllinercontainerroutesathakata1.pdf"
        }
      ],
      "track": [],
      "updatedAt": "2026-10-20T11:46:08+08:00",
      "lcl": {
        "status": "na",
        "label": "併櫃排不到（貨代不走長榮）",
        "label_ja": "混載不可（Evergreen 不使用）",
        "label_en": "No LCL (forwarder does not use Evergreen)",
        "note": "賣方日本端只配合一家貨代（走陽明）",
        "note_ja": "売主の日本側はフォワーダー 1 社（Yang Ming 利用）のみ",
        "note_en": "The seller's Japan side uses one forwarder (Yang Ming)"
      },
      "fcl": {
        "status": "possible",
        "label": "整櫃：截止已過，要長榮同意晚一點進櫃",
        "label_ja": "FCL：締切経過、Evergreen の遅れ搬入の了承が必要",
        "label_en": "FCL: cut-off passed, Evergreen must accept late",
        "note": "長榮官網：112S，10/22 神戶開、10/27 到台北港；截止 10/16 已過",
        "note_ja": "Evergreen 公式：112S、10/22 神戸発、10/27 台北港着。締切 10/16 は経過",
        "note_en": "Evergreen official: 112S, Kobe dep 10/22, Taipei Port 10/27; cut-off 10/16 passed"
      },
      "noGo": "收貨截止 10/16 已過，貨 10/21 才能出工廠。貨代的併櫃也不走長榮。",
      "noGo_ja": "搬入締切の 10/16 は過ぎており、貨物は 10/21 にしか工場を出られない。フォワーダーの混載も Evergreen を使わない。",
      "noGo_en": "The 10/16 cargo deadline had passed and the cargo can only leave the factory on 10/21. The forwarder's shared containers don't use Evergreen either."
    },
    {
      "alert": {
        "level": "watch",
        "text": [
          "已訂艙，貨物和其他人的貨拼同一個貨櫃（併櫃）。",
          "10/21 卡車到日本工廠取貨，10/22 送到神戶收貨倉庫（倉庫已同意延後收貨）。",
          "到基隆後約 2–3 個工作天送進龍潭廠，會加急處理；船到港改成 10/30（五），照 2–3 個工作天是 11/3–11/4，要趕 11/2 只剩「到港後第 1 個工作天」（11/2 一）這條路。",
          "船期比表定晚約 2.5 天（神戶表定 10/25，現在 10/27 23:00（日本時間）開，比 10/20 查的又晚 18 小時）。"
        ],
        "text_ja": [
          "予約済み。他の荷主の貨物と同じコンテナに積み合わせ（混載）。",
          "10/21 にトラックが日本の工場で集荷、10/22 に神戸の受け入れ倉庫へ搬入（倉庫は遅れ搬入を了承済み）。",
          "基隆着後 約 2–3 営業日で龍潭工場へ（急ぎ対応）。着港が 10/30（金）に遅れ、2–3 営業日なら 11/3–11/4。11/2 に間に合うのは「着港後 1 営業日目」（11/2 月）のみ。",
          "当初予定より約 2.5 日遅れ（神戸の当初予定 10/25 → 現在 10/27 23:00 発。10/20 時点よりさらに 18 時間遅れ）。"
        ],
        "text_en": [
          "Booked; the cargo shares a container with other shipments.",
          "Truck pickup at the Japan factory on 10/21, delivered to the Kobe receiving warehouse on 10/22 (the warehouse agreed to take it late).",
          "About 2–3 working days from Keelung to the Longtan plant, rushed. Arrival has slipped to Fri 10/30, so 2–3 working days means 11/3–11/4; only the 'first working day after arrival' path (Mon 11/2) meets the deadline.",
          "About 2.5 days behind the original schedule (Kobe originally 10/25, now departing 10/27 23:00 — another 18 hours later than on 10/20)."
        ]
      },
      "carrier": "陽明 Yang Ming",
      "cyCut": {
        "text": "整櫃未公布",
        "text_ja": "FCL 未発表",
        "text_en": "FCL not published",
        "src": "陽明",
        "src_ja": "Yang Ming",
        "src_en": "Yang Ming",
        "state": "unknown",
        "note": "",
        "note_ja": "",
        "note_en": ""
      },
      "dates": {
        "etd": "2026-10-27T23:00:00+09:00",
        "etaFrom": "2026-10-30T07:00:00+08:00",
        "etaTo": null,
        "plantFrom": "2026-11-03",
        "plantTo": "2026-11-04"
      },
      "imo": "9319155",
      "kobeEtd": {
        "text": "10/27（二）23:00",
        "text_ja": "10/27（火）23:00",
        "text_en": "10/27 (Tue) 23:00",
        "src": "陽明日本代理",
        "src_ja": "Yang Ming 日本代理店",
        "src_en": "Yang Ming Japan agent",
        "note": [
          "台北時間 10/27 22:00；神戶 10/27 16:00 到、17:00 靠碼頭；表定 10/25（日）"
        ],
        "note_ja": [
          "台湾時間 10/27 22:00、神戸 10/27 16:00 着・17:00 着岸、当初予定 10/25（日）"
        ],
        "note_en": [
          "Taipei time 10/27 22:00; Kobe arr 10/27 16:00, berth 17:00; original schedule Sun 10/25"
        ],
        "badge": "fallback"
      },
      "links": [
        {
          "label": "AIS-catcher",
          "url": "https://www.aiscatcher.org/ship/details/636012795"
        },
        {
          "label": "MyShipTracking",
          "url": "https://www.myshiptracking.com/vessels/ym-inception-mmsi-636012795-imo-9319155"
        },
        {
          "label": "陽明日本代理",
          "url": "https://www.toyoshingo.com/yangming/index.php?port=41&week=4"
        }
      ],
      "live": {
        "at": "2026-10-20T00:06:30Z",
        "lat": 25.003,
        "lon": 120.8776,
        "sog": 20.4,
        "cog": 33,
        "last": "台中",
        "next": "基隆",
        "nextEta": "2026-10-20T04:00:00Z",
        "src": "VesselFinder",
        "srcUrl": "https://www.vesselfinder.com/vessels/details/9319155",
        "status": "航行中",
        "where": "新竹外海，北上往基隆（北向航次，不是我們這班）",
        "where_ja": "新竹沖、北上して基隆へ（北航の便で、当方の便ではない）",
        "where_en": "Off Hsinchu, heading north to Keelung (northbound trip, not our sailing yet)",
        "status_ja": "航行中",
        "status_en": "Under way",
        "last_ja": "台中",
        "last_en": "Taichung",
        "next_ja": "基隆",
        "next_en": "Keelung"
      },
      "mmsi": "636012795",
      "name": "YM INCEPTION",
      "order": 1,
      "plant": {
        "text": "11/3–4",
        "note": [
          "到港後約 2–3 個工作天；最快第 1 個工作天＝11/2（一）"
        ],
        "note_ja": [
          "着港後 約 2–3 営業日、最短 1 営業日目＝11/2（月）"
        ],
        "note_en": [
          "About 2–3 working days after arrival; fastest (1st working day) = Mon 11/2"
        ]
      },
      "role": "已訂艙",
      "tier": "base",
      "track": [
        {
          "lat": 22.7368,
          "lon": 120.047,
          "t": "2026-10-18T10:55:45Z"
        }
      ],
      "twEta": {
        "text": "基隆 10/30（五）07:00",
        "src": "陽明基隆靠泊表",
        "note": [
          "陽明基隆靠泊表（基隆聯興碼頭）"
        ],
        "note_ja": [
          "Yang Ming 基隆着岸予定表（基隆聯興碼頭）"
        ],
        "note_en": [
          "Yang Ming Keelung berth list"
        ],
        "text_ja": "基隆 10/30（金）07:00",
        "text_en": "Keelung 10/30 (Fri) 07:00",
        "src_ja": "Yang Ming 基隆着岸予定表",
        "src_en": "Yang Ming Keelung berth list"
      },
      "twPort": "基隆",
      "updatedAt": "2026-10-25T05:05:00+08:00",
      "voyage": "251S",
      "id": "ym-inception",
      "role_ja": "予約済み",
      "role_en": "Booked",
      "lcl": {
        "status": "confirmed",
        "label": "併櫃：已訂艙",
        "label_ja": "混載：予約済み",
        "label_en": "Shared container: booked",
        "note": "10/21 日本工廠取貨，10/22 送到神戶收貨倉庫",
        "note_ja": "10/21 日本の工場で集荷、10/22 神戸の受け入れ倉庫へ搬入",
        "note_en": "Pickup in Japan 10/21, at the Kobe warehouse 10/22",
        "cut": {
          "text": "10/22 送到神戶倉庫",
          "text_ja": "10/22 神戸の倉庫へ搬入",
          "text_en": "At the Kobe warehouse 10/22",
          "src": "貨代",
          "src_ja": "フォワーダー",
          "src_en": "Forwarder",
          "state": "open",
          "note": [
            "倉庫已同意延後收貨"
          ],
          "note_ja": [
            "倉庫は遅れ搬入を了承済み"
          ],
          "note_en": [
            "The warehouse agreed to take it late"
          ]
        }
      },
      "fcl": {
        "status": "possible",
        "label": "整櫃 CY 截止未公布",
        "label_ja": "FCL の CY 締切は未発表",
        "label_en": "FCL CY cut-off not published",
        "note": "要問陽明",
        "note_ja": "Yang Ming に要確認",
        "note_en": "Ask Yang Ming"
      },
      "portCalls": [
        {
          "port": "基隆",
          "voyage": "250N",
          "arr": "2026-10-20T12:15:00+08:00",
          "dep": "2026-10-21T00:15:00+08:00",
          "terminal": "基隆聯興碼頭",
          "origArr": null,
          "origDep": null,
          "north": true,
          "srcUrl": "https://ymkeeweb.yangming.com/YMKEE/vslterm"
        },
        {
          "port": "東京",
          "voyage": "250N/251S",
          "arr": "2026-10-24T12:00:00+09:00",
          "berth": "2026-10-24T13:00:00+09:00",
          "dep": "2026-10-24T23:00:00+09:00",
          "origArr": "2026-10-22",
          "origDep": "2026-10-22",
          "terminal": "青海 A0/A1/A2",
          "updated": "10/22 23:08",
          "srcUrl": "https://www.toyoshingo.com/yangming/certificate.php?portcode=13&id=10381408"
        },
        {
          "port": "名古屋",
          "voyage": "250N/251S",
          "arr": "2026-10-26T07:00:00+09:00",
          "berth": "2026-10-26T08:00:00+09:00",
          "dep": "2026-10-26T17:00:00+09:00",
          "origArr": "2026-10-24",
          "origDep": "2026-10-24",
          "terminal": "鍋田ふ頭 NUCT",
          "updated": "10/22 23:08",
          "srcUrl": "https://www.toyoshingo.com/yangming/certificate.php?portcode=35&id=10381410"
        },
        {
          "port": "大阪",
          "voyage": "250N/251S",
          "arr": "2026-10-27T07:00:00+09:00",
          "berth": "2026-10-27T08:00:00+09:00",
          "dep": "2026-10-27T15:00:00+09:00",
          "origArr": "2026-10-25",
          "origDep": "2026-10-25",
          "terminal": "南港 C-9",
          "updated": "10/22 23:08",
          "srcUrl": "https://www.toyoshingo.com/yangming/certificate.php?portcode=40&id=10381412"
        },
        {
          "port": "神戶",
          "voyage": "250N/251S",
          "arr": "2026-10-27T16:00:00+09:00",
          "berth": "2026-10-27T17:00:00+09:00",
          "dep": "2026-10-27T23:00:00+09:00",
          "origArr": "2026-10-25",
          "origDep": "2026-10-25",
          "terminal": "六甲アイランド RC-1/2",
          "updated": "10/22 23:08",
          "srcUrl": "https://www.toyoshingo.com/yangming/certificate.php?portcode=41&id=10381411",
          "load": true
        },
        {
          "port": "基隆",
          "voyage": "251S",
          "arr": "2026-10-30T07:00:00+08:00",
          "dep": "2026-10-30T16:00:00+08:00",
          "terminal": "基隆聯興碼頭",
          "origArr": null,
          "origDep": null,
          "prevArr": "2026-10-28T07:00:00+08:00",
          "prevAt": "2026-10-19T13:10:00+08:00",
          "discharge": true,
          "srcUrl": "https://ymkeeweb.yangming.com/YMKEE/vslterm"
        }
      ]
    },
    {
      "alert": {
        "level": "alert",
        "text": [
          "船改走香港，官網日本航班不可信，且貨代併櫃不走此船公司"
        ],
        "text_ja": [
          "船は香港経由に変更され、公式の日本寄港予定は当てにならない。フォワーダーの混載もこの船会社を使わない"
        ],
        "text_en": [
          "The ship was rerouted via Hong Kong, so its official Japan schedule can't be trusted, and the forwarder's shared containers don't go with this line"
        ]
      },
      "carrier": "德翔 TS Lines",
      "cyCut": {
        "note": [
          "官網：2619S 截止已過；2618N 未列截止",
          "收櫃截止時間已過，要請德翔同意晚一點進櫃（late come），才裝得上這班船"
        ],
        "src": "德翔官網",
        "state": "passed",
        "text": "10/15（四）16:30 已過",
        "note_ja": [
          "公式：2619S の締切は経過、2618N は締切未掲載",
          "搬入締切はすでに過ぎており、德翔海運に遅れ搬入（レイトカム）を認めてもらえれば積める"
        ],
        "note_en": [
          "Official: 2619S cut-off has passed; 2618N lists none",
          "The container cut-off has passed; it can only go on this ship if TS Lines agrees to accept the container late (late come)"
        ]
      },
      "dates": {
        "etd": "2026-10-24T00:00:00+09:00",
        "etaFrom": "2026-10-26T00:00:00+08:00",
        "etaTo": "2026-10-27T00:00:00+08:00",
        "plantFrom": "2026-10-27",
        "plantTo": "2026-10-28"
      },
      "imo": "9955430",
      "kobeEtd": {
        "text": "約 10/24（推估）",
        "src": "陽明日本代理（推估）",
        "note": [
          "陽明日本代理 10/18 更新：大阪 10/23、神戶 10/24",
          "德翔官網的 10/21 19:00 依 AIS 做不到（船 10/19 才到香港）"
        ],
        "note_ja": [
          "Yang Ming 日本代理店（10/18 更新）：大阪 10/23、神戸 10/24",
          "TS Lines 公式の 10/21 19:00 は AIS 上不可能（10/19 に香港着）"
        ],
        "note_en": [
          "Yang Ming Japan agent (updated 10/18): Osaka 10/23, Kobe 10/24",
          "TS Lines' official 10/21 19:00 can't happen per AIS (the ship only reaches Hong Kong 10/19)"
        ]
      },
      "links": [
        {
          "label": "AIS-catcher",
          "url": "https://www.aiscatcher.org/ship/details/538010792"
        },
        {
          "label": "德翔日本代理",
          "url": "https://www.toyoshingo.com/tslines/certificate.php?portcode=41&id=10376851"
        }
      ],
      "live": {
        "at": "2026-10-20T00:03:43Z",
        "lat": 22.3307,
        "lon": 114.125,
        "sog": 0.8,
        "cog": null,
        "last": "香港",
        "next": "蛇口",
        "nextEta": "2026-10-20T02:00:00Z",
        "src": "VesselFinder",
        "srcUrl": "https://www.vesselfinder.com/vessels/details/9955430",
        "status": "停靠中",
        "where": "香港葵涌貨櫃碼頭，下一站蛇口（還沒往日本開）",
        "where_ja": "香港・葵涌コンテナ埠頭、次は蛇口（まだ日本へ向かっていない）",
        "where_en": "Kwai Chung terminal, Hong Kong; next stop Shekou (not yet heading to Japan)",
        "status_ja": "停泊中",
        "status_en": "In port",
        "last_ja": "香港",
        "last_en": "Hong Kong",
        "lastAt": "2026-10-19T06:00:00Z",
        "next_ja": "蛇口",
        "next_en": "Shekou"
      },
      "mmsi": "538010792",
      "name": "TS JOHOR",
      "order": 6,
      "plant": {
        "text": "10/27–28",
        "note": [
          "到港後約 2–3 個工作天，會加急處理"
        ],
        "note_ja": [
          "着港後 約 2–3 営業日、急ぎで対応"
        ],
        "note_en": [
          "About 2–3 working days after arrival, rushed"
        ]
      },
      "role": "併櫃排不到・整櫃：官網日期做不到（AIS）",
      "tier": "check",
      "track": [
        {
          "lat": 24.7352,
          "lon": 120.6452,
          "t": "2026-10-17T09:35:00Z"
        },
        {
          "lat": 24.6488,
          "lon": 120.59224,
          "t": "2026-10-17T10:04:00Z"
        },
        {
          "lat": 22.9715,
          "lon": 117.1895,
          "t": "2026-10-18T10:38:29Z"
        }
      ],
      "twEta": {
        "text": "基隆 約 10/26–27（推估）",
        "src": "推估（AIS＋日本代理）",
        "note": [
          "依神戶 10/24 開推估，不是德翔官網日期",
          "上一趟神戶→基隆約 5 天（經光陽、釜山）；照那個航程會到 10/29 左右"
        ],
        "note_ja": [
          "神戸 10/24 発から推定、TS Lines 公式の日程ではありません",
          "前航海は神戸→基隆が約 5 日（光陽・釜山経由）。同じ航程なら 10/29 ごろ"
        ],
        "note_en": [
          "Estimated from a Kobe departure on 10/24; not a TS Lines official date",
          "The previous trip took about 5 days Kobe→Keelung (via Gwangyang, Busan); at that pace it would be around 10/29"
        ]
      },
      "twPort": "基隆",
      "updatedAt": "2026-10-19T12:10:00+08:00",
      "voyage": "2618N／2619S",
      "id": "ts-johor",
      "role_ja": "混載不可・FCL：公式日程は AIS 上不可能",
      "role_en": "No LCL · FCL: official dates not achievable (AIS)",
      "officialContradicted": {
        "fields": [
          "kobeEtd",
          "twEta"
        ],
        "by": "AIS",
        "since": "2026-10-18",
        "reason": "AIS：10/18 從台中往西開往香港（預計 10/19 下午到），10/21 到不了神戶",
        "reason_ja": "AIS：10/18 台中を出て西の香港へ（10/19 午後着予定）、10/21 の神戸出港は不可能",
        "reason_en": "AIS: left Taichung on 10/18 heading west to Hong Kong (due 10/19 afternoon), so it can't leave Kobe on 10/21"
      },
      "lcl": {
        "status": "na",
        "label": "併櫃排不到（貨代不走德翔）",
        "label_ja": "混載不可（TS Lines 不使用）",
        "label_en": "No LCL (forwarder does not use TS Lines)",
        "note": "賣方日本端只配合一家貨代（走陽明）",
        "note_ja": "売主の日本側はフォワーダー 1 社（Yang Ming 利用）のみ",
        "note_en": "The seller's Japan side uses one forwarder (Yang Ming)"
      },
      "fcl": {
        "status": "possible",
        "label": "整櫃：要德翔給實際日期並同意晚一點進櫃",
        "label_ja": "FCL：TS Lines に実際の日程と遅れ搬入の了承が必要",
        "label_en": "FCL: TS Lines must confirm dates and accept late",
        "note": "官網日期和陽明代理、AIS 紀錄不一致",
        "note_ja": "公式の日程が Yang Ming 代理店・AIS 記録と不一致",
        "note_en": "Official dates disagree with the Yang Ming agent and AIS"
      },
      "noGo": "貨 10/21 才離開工廠，趕不上這班。船也改走香港，日本的船期不可靠。",
      "noGo_ja": "貨物は 10/21 に工場を出るので間に合わない。船は香港経由に変わり、日本の予定も当てにならない。",
      "noGo_en": "The cargo only leaves the factory on 10/21, too late for this ship. It was also rerouted via Hong Kong, so its Japan schedule can't be trusted."
    },
    {
      "alert": {
        "level": "alert",
        "text": [
          "11/4 才到基隆，比已訂的這班還晚"
        ],
        "text_ja": [
          "基隆着は 11/4 で、予約済みの便より遅い"
        ],
        "text_en": [
          "Only reaches Keelung on 11/4, later than the booked sailing"
        ]
      },
      "carrier": "德翔 TS Lines",
      "cyCut": {
        "note": "",
        "src": "德翔官網",
        "state": "open",
        "text": "10/22（四）16:30",
        "note_ja": "",
        "note_en": ""
      },
      "dates": {
        "etaFrom": "2026-11-04T22:30:00+08:00",
        "etaTo": null,
        "etd": "2026-10-23T19:00:00+09:00",
        "plantFrom": "2026-11-06",
        "plantTo": "2026-11-09"
      },
      "imo": "9868182",
      "kobeEtd": {
        "note": "",
        "src": "德翔官網",
        "text": "10/23（五）19:00",
        "note_ja": "",
        "note_en": ""
      },
      "links": [
        {
          "label": "VesselFinder",
          "url": "https://www.vesselfinder.com/vessels/details/9868182"
        }
      ],
      "live": {},
      "mmsi": "538010175",
      "name": "TS KOBE",
      "order": 7,
      "plant": {
        "note": [
          "到港後約 2–3 個工作天，會加急處理"
        ],
        "text": "11/6–9",
        "note_ja": [
          "着港後 約 2–3 営業日、急ぎで対応"
        ],
        "note_en": [
          "About 2–3 working days after arrival, rushed"
        ]
      },
      "role": "趕不上・參考",
      "tier": "ref",
      "track": [],
      "twEta": {
        "note": "",
        "src": "德翔官網",
        "text": "基隆 11/4（三）22:30",
        "note_ja": "",
        "note_en": ""
      },
      "twPort": "基隆",
      "updatedAt": "2026-10-20T11:46:10+08:00",
      "voyage": "2621S",
      "id": "ts-kobe",
      "role_ja": "間に合わない・参考",
      "role_en": "Too late · reference",
      "lcl": {
        "status": "na",
        "label": "併櫃排不到（貨代不走德翔）",
        "label_ja": "混載不可（TS Lines 不使用）",
        "label_en": "No LCL (forwarder does not use TS Lines)",
        "note": "賣方日本端只配合一家貨代（走陽明）",
        "note_ja": "売主の日本側はフォワーダー 1 社（Yang Ming 利用）のみ",
        "note_en": "The seller's Japan side uses one forwarder (Yang Ming)"
      },
      "fcl": {
        "status": "possible",
        "label": "整櫃可訂但太晚",
        "label_ja": "FCL 可だが遅すぎる",
        "label_en": "FCL possible but too late"
      },
      "noGo": "要 11/4 才到基隆，比已訂的這班還晚。貨代的併櫃也不走這家船公司。",
      "noGo_ja": "基隆着は 11/4 で、予約済みの便より遅い。フォワーダーの混載もこの船会社を使わない。",
      "noGo_en": "It only reaches Keelung on 11/4, later than the booked sailing. The forwarder's shared containers don't use this line either."
    }
  ]
};
