# SHONEN MAGAZINE GA4 COMMAND — 週マガ・マガポケ デジタル計測ボード

週刊少年マガジン公式＋マガポケWEBを想定した GA4 データを **作品 × 課金 × 動線 × 再訪 × アフィニティ × カスタムディメンション × 広告トラッキング** でクロス分析する、ゲームUIのダッシュボード。

**▶ 公開URL: https://ketrketr2.github.io/shonen-magazine-ga-board/**

姉妹ボード：[TOYOTA GA4 COMMAND](https://ketrketr2.github.io/toyota-ga-board/) ／ [AI Visibility KPI Board（GEO）](https://github.com/ketrketr2/toyota-geo-board)

> ⚠️ 本ボードは **合成デモデータ** で動作する非公式の技術デモです（講談社・週刊少年マガジンとは無関係）。実データ接続の設計は下記「GA4への接続」参照。

---

## 8つのセクター

| # | ビュー | 見えるもの |
|---|---|---|
| 00 | **編集部HQ** | サイトスコア（Lv・ティア）／8月ミッションボード（ポイント購入・定期購読・アプリ誘導・新規読者）／KPI HUD／セッション・CV指数トレンド（毎週水曜=発売日のスパイクとアニメ・キャンペーン注釈）／チャネル構成 |
| 01 | **連載ラインナップ** | 14作品のキャラカード（ティアS〜C・集客力/転換力/再訪率/広告依存・ジャンルアイコン・スパークライン）→ クリックで詳細カルテ／作品マップ（面積=流入・色=CVR）／伸び率ランキング／リーグ表 |
| 02 | **課金・CV** | 定期購読・ポイント課金・単行本EC・アプリ送客・読書エンゲージの5商材／8種CVスコアボード／商材×チャネル構成比／課金・登録ファネル／作品×主要CVヒート |
| 03 | **読者動線マップ** | STAGE1〜CLEARのステージクリア型ファネル／サンキー図（流入→LP→試し読み→課金。CVへ向かう金色の帯）／LP別回遊内訳／試し読み利用×CVR |
| 04 | **集客・プロモ** | チャネル成績表／キャンペーンリーグ（🥇メダル・UTM・CPA・ROAS）／utm_source→campaign サンバースト／広告費×CVバブル |
| 05 | **読者オーディエンス** | 新規×再訪／再訪コンボ（「待てば無料」の毎日回収でCVR ×1.0→×12）／RFヒート／アフィニティ8セグメント／年齢×性別／会員ステータス×CVR／エリア |
| 06 | **クロス分析ラボ** | 6ディメンション（作品・チャネル・商材・アフィニティ・読者ステージ・エリア）× 4指標を自由にクロスするヒートマップ＋自動インサイト／作品対戦モード（VSレーダー） |
| 07 | **計測設計** | カスタムディメンション台帳（`title_code` `ticket_type` `read_complete_rate` 等12本・取得率アラート）／イベント辞書／UTM命名規約 |

共通操作：**期間（7日/28日/90日）× セグメント（全体/新規/再訪）** をヘッダで切替 → 全ビュー再計算。**⌘K / Ctrl+K** で作品・キャンペーン横断ジャンプ。

## 数値が絶対にズレない設計

すべての画面は `src/data.js` の単一テンソル `S[日][作品][チャネル]`（200日分・水曜発売日サイクル込み）から**その場で集計**して描画される。前期比・新規/再訪分解・商材/ステージ/アフィニティへの按分はすべて周辺和を保存し、クロス表の行計・列計は必ず他画面の合計と一致（Node で検算済み）。

## GA4への接続（本番化）

| ボード上の軸 | GA4側 |
|---|---|
| チャネル | `sessionDefaultChannelGroup` |
| 作品・話数 | カスタムディメンション `title_code` / `episode_no` |
| チケット・課金種別 | カスタムディメンション `ticket_type` / `purchase_type` |
| アフィニティ | Googleシグナル `brandingInterest` |
| 再訪コンボ | `newVsReturning` + セッション数バケット |
| 広告 | `sessionSource / sessionMedium / sessionCampaignName`（UTM） |
| CV | キーイベント（`point_purchase` `subscription_complete` 等8種） |

## 開発

```bash
python3 build.py                  # src/ → index.html を組み立て
python3 -m http.server 8902       # → http://localhost:8902
```

構成は `index.html`（単一ファイル成果物）＋ `assets/echarts.min.js`（CDNフォールバック）＋ `src/`（data / render×2 / style / app / body）。配色はカラーユニバーサル検証を全チェック通過したカテゴリカル8色、フォントは BIZ UDPGothic + JetBrains Mono。

---

出典・定義：[GA4 Data API](https://developers.google.com/analytics/devguides/reporting/data/v1?hl=ja) ／ [GA4 ディメンションと指標](https://support.google.com/analytics/answer/9143382?hl=ja) ／ [アフィニティカテゴリ](https://support.google.com/analytics/answer/2819950?hl=ja)
