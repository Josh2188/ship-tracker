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
    "lastRunAt": "2026-10-20T18:40:00+08:00",
    "level": "watch",
    "summary": [
      "只能搭陽明 YM INCEPTION 251S。神戶 10/27（二）05:00 開（表定 10/25），基隆 10/29（四）07:00 到；照到港後第 2–3 個工作天，預估 11/2（一）–11/3（二）到龍潭廠，剛好壓在 11/2 下班前的期限上，沒有緩衝。",
      "要趕上 11/2：船最晚 10/29（四）要到基隆，而且要在到港後第 2 個工作天（11/2）當天送進工廠；能爭取到港後第 1 個工作天（10/30 五）最保險。基隆晚 1 天（10/30）就只剩「到港後第 1 個工作天」這條路。",
      "颱風薔琵：氣象廳、氣象署都預測 10/23–24 經過台灣東北方海面，這時船在往東京的路上和東京，距離很遠。",
      "要盯的是 10/25–27：氣象署 10/20 14 時預報 10/25 14 時颱風中心到四國西方，正是船停靠名古屋、大阪、神戶的時候；氣象廳 10/20 18:45 預報偏西、轉向較慢（10/25 在東海）。兩家差很多，10/25 以後都還沒有預報。",
      "颱風會不會讓船延誤：網頁照貨輪避颱的標準流程（航行中避開強風範圍＋預報誤差、日本港口第一／第二警戒、颱風過後恢復作業）每次打開都用最新預報重算，結果看下方「模擬劇本」。",
      "網頁每次打開、每次按「立即更新」都會重抓陽明、氣象廳、氣象署和 AIS 的最新資料。"
    ],
    "typhoon": {
      "at": "10/20 18:45",
      "lat": 16.7,
      "lon": 133.8,
      "name": "薔琵",
      "posAt": "2026-10-20T09:00:00Z",
      "src": "日本氣象廳、氣象署",
      "srcUrl": "https://www.jma.go.jp/bosai/map.html#contents=typhoon",
      "text": [
        "日本氣象廳 10/20 18:45 發布：18 時中心在北緯 16.7、東經 133.8 度，935 百帕，近中心最大風速每秒 55 公尺，以每小時 20 公里向西北西。預測（台灣時間）10/23 14 時北緯 23.2、東經 123.8 度，10/24 14 時北緯 26.2、東經 122.3 度（台灣東北方海面），10/25 14 時北緯 29.7、東經 124.2 度，轉向北北東。",
        "氣象署 10/20 14 時：中心北緯 16.4、東經 134.3 度，910 百帕，近中心最大風速每秒 55 公尺，以每小時 23 公里向西北西；七級風半徑平均 250 公里、十級風 120 公里。預測 10/23 14 時北緯 24.0、東經 124.6 度，10/24 14 時北緯 28.5、東經 125.1 度，10/25 14 時北緯 33.8、東經 132.1 度（四國西方）。",
        "兩家都預測 10/23–24 經過台灣東北方海面；之後氣象署偏東、轉向快（10/25 到四國附近），氣象廳偏西、轉向慢（10/25 在東海）。",
        "兩家預報都只到 10/25 下午；船 10/27–29 神戶到基隆這段還沒有官方預報。"
      ],
      "name_ja": "チャンパー",
      "name_en": "CHAMPI",
      "text_ja": [
        "気象庁 10/20 18:45 発表：18 時の中心は北緯 16.7 度・東経 133.8 度、935 hPa、最大風速 55 m/s、西北西へ時速 20 km。予報（日本時間）10/23 15 時 北緯 23.2 度・東経 123.8 度、10/24 15 時 北緯 26.2 度・東経 122.3 度（台湾の北東の海上）、10/25 15 時 北緯 29.7 度・東経 124.2 度で、北北東へ向きを変える見込み。",
        "中央気象署 10/20 14 時（台湾時間）：中心は北緯 16.4 度・東経 134.3 度、910 hPa、最大風速 55 m/s、西北西へ時速 23 km。風力 7 の半径は平均 250 km、風力 10 は 120 km。予報 10/23 14 時 北緯 24.0 度・東経 124.6 度、10/24 14 時 北緯 28.5 度・東経 125.1 度、10/25 14 時 北緯 33.8 度・東経 132.1 度（四国の西）。",
        "両者とも 10/23–24 に台湾北東の海上を通る予想。その後、中央気象署は東寄りで転向が早く（10/25 に四国付近）、気象庁は西寄りで転向が遅い（10/25 は東シナ海）。",
        "どちらの予報も 10/25 午後までで、船の神戸→基隆（10/27–29）の区間はまだ公式予報がありません。"
      ],
      "text_en": [
        "JMA, issued 10/20 18:45 JST: at 18:00 the centre was at 16.7N 133.8E, 935 hPa, max sustained wind 55 m/s, moving WNW at 20 km/h. Forecast (Taiwan time): 23.2N 123.8E at 14:00 on 10/23, 26.2N 122.3E (sea northeast of Taiwan) at 14:00 on 10/24, 29.7N 124.2E at 14:00 on 10/25, turning NNE.",
        "Taiwan CWA, 10/20 14:00: centre at 16.4N 134.3E, 910 hPa, max wind 55 m/s, moving WNW at 23 km/h; Beaufort-7 radius about 250 km, Beaufort-10 about 120 km. Forecast 24.0N 124.6E at 14:00 on 10/23, 28.5N 125.1E at 14:00 on 10/24, 33.8N 132.1E (west of Shikoku) at 14:00 on 10/25.",
        "Both forecast it to cross the sea northeast of Taiwan on 10/23–24. After that CWA is further east and turns faster (near Shikoku on 10/25); JMA is further west and turns later (East China Sea on 10/25).",
        "Both forecasts end on the afternoon of 10/25; there is no official forecast yet for the ship's Kobe → Keelung leg (10/27–29)."
      ],
      "jmaIssued": "2026-10-20T09:45:00Z",
      "jmaIssuedJst": "2026-10-20T18:45:00+09:00",
      "forecast": [
        {
          "hours": 0,
          "time": "2026-10-20T09:00:00Z",
          "lat": 16.7,
          "lon": 133.8,
          "pressure": "935",
          "windMs": "55",
          "course": "西北西",
          "speedKmh": "20",
          "radiusKm": null,
          "storm": [
            {
              "dir": 45,
              "km": 220
            },
            {
              "dir": 225,
              "km": 165
            }
          ],
          "gale": [
            {
              "dir": 45,
              "km": 650
            },
            {
              "dir": 225,
              "km": 500
            }
          ]
        },
        {
          "hours": 12,
          "time": "2026-10-20T21:00:00Z",
          "lat": 17.8,
          "lon": 131.1,
          "pressure": "925",
          "windMs": "55",
          "course": "西北西",
          "speedKmh": "25",
          "radiusKm": 45,
          "storm": [
            {
              "dir": 45,
              "km": 270
            },
            {
              "dir": 225,
              "km": 210
            }
          ],
          "gale": null
        },
        {
          "hours": 24,
          "time": "2026-10-21T09:00:00Z",
          "lat": 19.2,
          "lon": 128.7,
          "pressure": "935",
          "windMs": "55",
          "course": "西北西",
          "speedKmh": "25",
          "radiusKm": 65,
          "storm": [
            {
              "dir": 45,
              "km": 290
            },
            {
              "dir": 225,
              "km": 250
            }
          ],
          "gale": null
        },
        {
          "hours": 45,
          "time": "2026-10-22T06:00:00Z",
          "lat": 20.9,
          "lon": 125.9,
          "pressure": "935",
          "windMs": "50",
          "course": "西北西",
          "speedKmh": "15",
          "radiusKm": 100,
          "storm": [
            {
              "dir": 90,
              "km": 340
            },
            {
              "dir": 270,
              "km": 290
            }
          ],
          "gale": null
        },
        {
          "hours": 69,
          "time": "2026-10-23T06:00:00Z",
          "lat": 23.2,
          "lon": 123.8,
          "pressure": "940",
          "windMs": "45",
          "course": "北西",
          "speedKmh": "15",
          "radiusKm": 220,
          "storm": [
            {
              "dir": 90,
              "km": 460
            },
            {
              "dir": 270,
              "km": 370
            }
          ],
          "gale": null
        },
        {
          "hours": 93,
          "time": "2026-10-24T06:00:00Z",
          "lat": 26.2,
          "lon": 122.3,
          "pressure": "965",
          "windMs": "40",
          "course": "北北西",
          "speedKmh": "15",
          "radiusKm": 370,
          "storm": [
            {
              "dir": 90,
              "km": 590
            },
            {
              "dir": 270,
              "km": 520
            }
          ],
          "gale": null
        },
        {
          "hours": 117,
          "time": "2026-10-25T06:00:00Z",
          "lat": 29.7,
          "lon": 124.2,
          "pressure": "985",
          "windMs": "30",
          "course": "北北東",
          "speedKmh": "20",
          "radiusKm": 460,
          "storm": [
            {
              "dir": 90,
              "km": 570
            },
            {
              "dir": 270,
              "km": 520
            }
          ],
          "gale": null
        }
      ],
      "cwaTrackTime": "民國115年10月20日14時",
      "cwaTrack": [
        {
          "hours": 0,
          "time": "2026-10-20T06:00:00Z",
          "lat": 16.4,
          "lon": 134.3,
          "galeKm": 250,
          "stormKm": 120
        },
        {
          "hours": 6,
          "time": "2026-10-20T12:00:00Z",
          "lat": 16.8,
          "lon": 133.1,
          "radiusKm": 40,
          "galeKm": 280,
          "stormKm": 120
        },
        {
          "hours": 12,
          "time": "2026-10-20T18:00:00Z",
          "lat": 17.3,
          "lon": 131.8,
          "radiusKm": 50,
          "galeKm": 280,
          "stormKm": 120
        },
        {
          "hours": 18,
          "time": "2026-10-21T00:00:00Z",
          "lat": 17.9,
          "lon": 130.6,
          "radiusKm": 80,
          "galeKm": 280,
          "stormKm": 120
        },
        {
          "hours": 24,
          "time": "2026-10-21T06:00:00Z",
          "lat": 18.8,
          "lon": 129.5,
          "radiusKm": 90,
          "galeKm": 280,
          "stormKm": 120
        },
        {
          "hours": 36,
          "time": "2026-10-21T18:00:00Z",
          "lat": 20.2,
          "lon": 127.7,
          "radiusKm": 110,
          "galeKm": 300,
          "stormKm": 120
        },
        {
          "hours": 48,
          "time": "2026-10-22T06:00:00Z",
          "lat": 21.2,
          "lon": 126.3,
          "radiusKm": 140,
          "galeKm": 300,
          "stormKm": 120
        },
        {
          "hours": 72,
          "time": "2026-10-23T06:00:00Z",
          "lat": 24,
          "lon": 124.6,
          "radiusKm": 210,
          "galeKm": 280,
          "stormKm": 90
        },
        {
          "hours": 96,
          "time": "2026-10-24T06:00:00Z",
          "lat": 28.5,
          "lon": 125.1,
          "radiusKm": 360,
          "galeKm": 250,
          "stormKm": 80
        },
        {
          "hours": 120,
          "time": "2026-10-25T06:00:00Z",
          "lat": 33.8,
          "lon": 132.1,
          "radiusKm": 390,
          "galeKm": 180,
          "stormKm": null
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
      "利用できるのは Yang Ming の YM INCEPTION 251S のみ。神戸 10/27（火）05:00 発（当初予定 10/25）、基隆 10/29（木）07:00 着。着港後 2–3 営業日の目安で龍潭工場着は 11/2（月）–11/3（火）の見込みで、11/2 終業までの期限ぎりぎり、余裕はありません。",
      "11/2 に間に合わせるには、基隆着が 10/29（木）までで、着港後 2 営業日目（11/2）当日に工場へ搬入する必要があります。着港後 1 営業日目（10/30 金）にできれば最も安全。基隆着が 1 日遅れ（10/30）ると、「着港後 1 営業日目」しか手がありません。",
      "台風チャンパー：気象庁・中央気象署とも 10/23–24 に台湾北東の海上を通る予想。この間、船は東京へ向かう途中と東京にいて、距離は十分あります。",
      "注意すべきは 10/25–27：中央気象署 10/20 14 時の予報では 10/25 14 時に台風の中心が四国の西に達し、船が名古屋・大阪・神戸に寄港する時期と重なります。気象庁 10/20 18:45 の予報は西寄りで転向が遅い（10/25 は東シナ海）。両者の差が大きく、10/25 以降はどちらもまだ予報がありません。",
      "台風で船が遅れるか：貨物船の台風避航の標準的な流れ（航行中は強風域＋予報誤差を避ける、日本の港の第一／第二警戒体制、通過後の作業再開）に沿って、ページを開くたびに最新予報で計算し直します。結果は下の「シミュレーション」をご覧ください。",
      "このページは開くたび・「今すぐ更新」を押すたびに、Yang Ming・気象庁・中央気象署・AIS の最新データを取り直します。"
    ],
    "summary_en": [
      "Only Yang Ming's YM INCEPTION 251S is possible. Kobe departure Tue 10/27 05:00 (original schedule 10/25), Keelung arrival Thu 10/29 07:00. At 2–3 working days after arrival, it reaches the Longtan plant Mon 11/2 – Tue 11/3: right on the end-of-business 11/2 deadline, with no margin.",
      "To make 11/2: the ship must reach Keelung by Thu 10/29 and the cargo must be at the plant on the 2nd working day after arrival (11/2). The 1st working day (Fri 10/30) is the safe target. If Keelung slips one day (10/30), only the 1st-working-day route still works.",
      "Typhoon CHAMPI: JMA and CWA both forecast it to pass over the sea northeast of Taiwan on 10/23–24, while the ship is on its way to and at Tokyo, far away.",
      "The window to watch is 10/25–27: CWA's 14:00 forecast on 10/20 puts the centre west of Shikoku at 14:00 on 10/25, just as the ship calls at Nagoya, Osaka and Kobe. JMA's 18:45 forecast on 10/20 is further west and turns later (East China Sea on 10/25). The two differ a lot, and neither forecasts beyond 10/25 yet.",
      "Will the typhoon delay the ship: every time the page opens it re-runs the standard typhoon-avoidance steps for cargo ships (keep out of the gale area plus forecast error at sea, Japanese port alert levels 1 and 2, resuming work after the typhoon) on the latest forecasts; see the scenario section below.",
      "Every time the page is opened or 'Update now' is pressed, it re-fetches the latest Yang Ming, JMA, CWA and AIS data."
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
    "deadlineTime_en": "by end of business"
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
          "到基隆後約 2–3 個工作天送進龍潭廠，會加急處理；預估 11/2–11/3，期限是 11/2 下班前，沒有緩衝。",
          "船期比表定晚約 1–1.5 天（神戶表定 10/25，現在 10/27 05:00 開）。"
        ],
        "text_ja": [
          "予約済み。他の荷主の貨物と同じコンテナに積み合わせ（混載）。",
          "10/21 にトラックが日本の工場で集荷、10/22 に神戸の受け入れ倉庫へ搬入（倉庫は遅れ搬入を了承済み）。",
          "基隆着後 約 2–3 営業日で龍潭工場へ（急ぎで対応）。11/2–11/3 の見込みで、期限は 11/2 終業まで、余裕なし。",
          "当初予定より約 1–1.5 日遅れ（神戸の当初予定 10/25 → 現在 10/27 05:00 発）。"
        ],
        "text_en": [
          "Booked; the cargo shares a container with other shipments.",
          "Truck pickup at the Japan factory on 10/21, delivered to the Kobe receiving warehouse on 10/22 (the warehouse agreed to take it late).",
          "About 2–3 working days from Keelung to the Longtan plant, rushed: est. 11/2–11/3 against an end-of-business 11/2 deadline, no margin.",
          "About 1–1.5 days behind the original schedule (Kobe originally 10/25, now departing 10/27 05:00)."
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
        "etd": "2026-10-27T05:00:00+09:00",
        "etaFrom": "2026-10-29T07:00:00+08:00",
        "etaTo": null,
        "plantFrom": "2026-11-02",
        "plantTo": "2026-11-03"
      },
      "imo": "9319155",
      "kobeEtd": {
        "text": "10/27（二）05:00",
        "text_ja": "10/27（火）05:00",
        "text_en": "10/27 (Tue) 05:00",
        "src": "陽明日本代理",
        "src_ja": "Yang Ming 日本代理店",
        "src_en": "Yang Ming Japan agent",
        "note": [
          "神戶 10/26 22:00 到、23:00 靠碼頭；表定 10/25（日）"
        ],
        "note_ja": [
          "神戸 10/26 22:00 着・23:00 着岸、当初予定 10/25（日）"
        ],
        "note_en": [
          "Kobe arr 10/26 22:00, berth 23:00; original schedule Sun 10/25"
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
        "text": "11/2–3",
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
        "text": "基隆 10/29（四）07:00",
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
        "text_ja": "基隆 10/29（木）07:00",
        "text_en": "Keelung 10/29 (Thu) 07:00",
        "src_ja": "Yang Ming 基隆着岸予定表",
        "src_en": "Yang Ming Keelung berth list"
      },
      "twPort": "基隆",
      "updatedAt": "2026-10-20T18:40:00+08:00",
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
          "arr": "2026-10-23T13:00:00+09:00",
          "berth": "2026-10-23T14:00:00+09:00",
          "dep": "2026-10-24T00:01:00+09:00",
          "origArr": "2026-10-22",
          "origDep": "2026-10-22",
          "terminal": "青海 A0/A1/A2",
          "updated": "10/20 18:38",
          "srcUrl": "https://www.toyoshingo.com/yangming/certificate.php?portcode=13&id=10381408"
        },
        {
          "port": "名古屋",
          "voyage": "250N/251S",
          "arr": "2026-10-25T13:00:00+09:00",
          "berth": "2026-10-25T14:00:00+09:00",
          "dep": "2026-10-25T23:00:00+09:00",
          "origArr": "2026-10-24",
          "origDep": "2026-10-24",
          "terminal": "鍋田ふ頭 NUCT",
          "updated": "10/20 18:38",
          "srcUrl": "https://www.toyoshingo.com/yangming/certificate.php?portcode=35&id=10381410"
        },
        {
          "port": "大阪",
          "voyage": "250N/251S",
          "arr": "2026-10-26T13:00:00+09:00",
          "berth": "2026-10-26T14:00:00+09:00",
          "dep": "2026-10-26T21:00:00+09:00",
          "origArr": "2026-10-25",
          "origDep": "2026-10-25",
          "terminal": "南港 C-9",
          "updated": "10/20 18:38",
          "srcUrl": "https://www.toyoshingo.com/yangming/certificate.php?portcode=40&id=10381412"
        },
        {
          "port": "神戶",
          "voyage": "250N/251S",
          "arr": "2026-10-26T22:00:00+09:00",
          "berth": "2026-10-26T23:00:00+09:00",
          "dep": "2026-10-27T05:00:00+09:00",
          "origArr": "2026-10-25",
          "origDep": "2026-10-25",
          "terminal": "六甲アイランド RC-1/2",
          "updated": "10/20 18:38",
          "srcUrl": "https://www.toyoshingo.com/yangming/certificate.php?portcode=41&id=10381411",
          "load": true
        },
        {
          "port": "基隆",
          "voyage": "251S",
          "arr": "2026-10-29T07:00:00+08:00",
          "dep": "2026-10-29T16:00:00+08:00",
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
