/* =====================================================
   SHONEN MAGAZINE GA4 COMMAND — データエンジン（デモデータ）
   週刊少年マガジン公式＋マガポケWEBを想定した合成データ。
   すべての画面はこの単一テンソルから導出されるため、
   どの画面でも合計値・内訳が必ず一致する。
   ===================================================== */
const GA = (() => {

  /* ---------- 乱数（シード固定・決定論） ---------- */
  function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
  const R = mulberry32(20260819);
  const jit = (amp=1)=> (R()-0.5)*2*amp;

  /* ---------- カレンダー ---------- */
  const END = new Date(2026,7,18);                 // 2026-08-18（データ最終日）
  const NDAYS = 200;
  const DATES=[]; const DOW=[];
  for(let i=NDAYS-1;i>=0;i--){
    const d=new Date(END); d.setDate(d.getDate()-i);
    DATES.push(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`);
    DOW.push(d.getDay());
  }
  const IDX = Object.fromEntries(DATES.map((s,i)=>[s,i]));

  /* ---------- マスタ：チャネル（表示順＝固定・配色順） ---------- */
  const CHANNELS=[
    {id:'org', name:'自然検索',            color:'#3987E5', share:.7221, newShare:.616, paid:false},
    {id:'sem', name:'AIアシスタント',       color:'#D95926', share:.0043, newShare:.835, paid:true},
    {id:'dsp', name:'その他・未分類',       color:'#199E70', share:.0090, newShare:.113, paid:true},
    {id:'vid', name:'動画（YouTube）',      color:'#C98500', share:.0018, newShare:.633, paid:true},
    {id:'sns', name:'SNS（オーガニック）',   color:'#D55181', share:.0718, newShare:.772, paid:false},
    {id:'crm', name:'メール・LINE・プッシュ', color:'#008300', share:.0050, newShare:.08,  paid:false},
    {id:'ref', name:'外部サイト',          color:'#9085E9', share:.0396, newShare:.604, paid:false},
    {id:'dir', name:'ダイレクト',          color:'#E66767', share:.1464, newShare:.633, paid:false},
  ];  // シェア・新規率＝GA4実測（7/22〜8/18・週刊少年マガジン公式）。広告出稿は実測ゼロ

  const NC=CHANNELS.length;

  /* ---------- マスタ：作品（車種スロットを作品に転用） ----------
     base: 平常時の1日あたり作品ページセッション（千）
     cvr: 課金・登録系CVの基準転換率
     tool: 試し読み開始率 / dealer: 課金接点（ポイント・購読LP）到達率
     pps: 話ページ/セッション（読了の深さ） */
  const MODELS=[
    {id:'bluelock', name:'ブルーロック',            cat:'スポーツ',        price:'連載中・33巻', base:95, cvr:.021, tool:.44, dealer:.105, eng:.71, pps:11.8,
     mix:{org:1.05,sem:1.0,dsp:1.0,vid:1.3,sns:1.35,crm:1.0,ref:1.1,dir:1.0}, icon:'sport'},
    {id:'ippo',     name:'はじめの一歩',            cat:'スポーツ',        price:'連載中・143巻', base:38, cvr:.024, tool:.36, dealer:.115, eng:.74, pps:9.6,
     mix:{org:1.1,sem:.85,dsp:.8,vid:.8,sns:.7,crm:1.5,ref:.9,dir:1.6}, icon:'sport'},
    {id:'shanfro',  name:'シャングリラ・フロンティア', cat:'ファンタジー・ゲーム', price:'連載中・19巻', base:52, cvr:.022, tool:.42, dealer:.100, eng:.69, pps:10.9,
     mix:{org:1.0,sem:1.0,dsp:1.05,vid:1.1,sns:1.1,crm:1.0,ref:1.35,dir:1.0}, icon:'fantasy'},
    {id:'sentai',   name:'戦隊大失格',              cat:'ダークヒーロー',   price:'連載中・17巻', base:30, cvr:.019, tool:.40, dealer:.090, eng:.66, pps:9.8,
     mix:{org:.95,sem:1.0,dsp:1.05,vid:1.15,sns:1.2,crm:.95,ref:1.0,dir:.9}, icon:'dark'},
    {id:'cuckoo',   name:'カッコウの許嫁',          cat:'ラブコメ',        price:'連載中・21巻', base:34, cvr:.020, tool:.41, dealer:.092, eng:.64, pps:9.2,
     mix:{org:.95,sem:1.05,dsp:1.0,vid:1.0,sns:1.3,crm:1.05,ref:.85,dir:.95}, icon:'love'},
    {id:'mokushi',  name:'黙示録の四騎士',          cat:'ファンタジー・ゲーム', price:'連載中・20巻', base:28, cvr:.019, tool:.38, dealer:.088, eng:.65, pps:9.0,
     mix:{org:1.05,sem:.95,dsp:1.0,vid:1.05,sns:1.0,crm:1.05,ref:1.05,dir:1.0}, icon:'fantasy'},
    {id:'megami',   name:'女神のカフェテラス',       cat:'ラブコメ',        price:'連載中・18巻', base:30, cvr:.020, tool:.40, dealer:.090, eng:.63, pps:8.8,
     mix:{org:.95,sem:1.05,dsp:1.05,vid:1.0,sns:1.25,crm:1.0,ref:.85,dir:.95}, icon:'love'},
    {id:'kaoruhana',name:'薫る花は凛と咲く',        cat:'青春・コメディ',   price:'連載中・18巻', base:40, cvr:.023, tool:.46, dealer:.098, eng:.70, pps:10.4,
     mix:{org:.9,sem:1.05,dsp:1.3,vid:1.55,sns:1.4,crm:.85,ref:1.05,dir:.8}, icon:'youth'},
    {id:'seitokai', name:'生徒会にも穴はある！',     cat:'青春・コメディ',   price:'連載中・12巻', base:18, cvr:.018, tool:.38, dealer:.082, eng:.62, pps:8.2,
     mix:{org:.95,sem:.95,dsp:.95,vid:.9,sns:1.35,crm:1.0,ref:.95,dir:.95}, icon:'youth'},
    {id:'amagami',  name:'甘神さんちの縁結び',       cat:'ラブコメ',        price:'連載中・16巻', base:26, cvr:.019, tool:.39, dealer:.086, eng:.62, pps:8.6,
     mix:{org:.95,sem:1.0,dsp:1.0,vid:1.0,sns:1.25,crm:1.0,ref:.9,dir:.95}, icon:'love'},
    {id:'tokyorev', name:'東京卍リベンジャーズ',     cat:'サスペンス・ドラマ', price:'完結・全31巻', base:48, cvr:.023, tool:.34, dealer:.108, eng:.68, pps:8.4,
     mix:{org:1.25,sem:.9,dsp:.85,vid:.95,sns:.95,crm:.9,ref:1.3,dir:1.15}, icon:'suspense'},
    {id:'diamond',  name:'ダイヤのA act2',          cat:'スポーツ',        price:'完結・全34巻', base:20, cvr:.020, tool:.32, dealer:.095, eng:.66, pps:7.8,
     mix:{org:1.15,sem:.85,dsp:.8,vid:.85,sns:.8,crm:1.2,ref:.95,dir:1.3}, icon:'sport'},
    {id:'fumetsu',  name:'不滅のあなたへ',          cat:'サスペンス・ドラマ', price:'完結・全22巻', base:22, cvr:.019, tool:.33, dealer:.090, eng:.67, pps:8.0,
     mix:{org:1.1,sem:.9,dsp:.9,vid:1.05,sns:.95,crm:1.0,ref:1.1,dir:1.05}, icon:'drama'},
    {id:'bakemono', name:'化物語',                 cat:'サスペンス・ドラマ', price:'完結・全22巻', base:24, cvr:.020, tool:.33, dealer:.094, eng:.69, pps:8.7,
     mix:{org:1.15,sem:.85,dsp:.85,vid:.95,sns:.9,crm:.95,ref:1.35,dir:1.1}, icon:'drama'},
  ];
  const NM=MODELS.length;

  /* ---------- マスタ：商材・コンバージョン ----------
     内部IDは基盤共通（表示名のみ雑誌ドメイン） */
  const GOODS=[
    {id:'new',    name:'定期購読・会員',   color:'#3987E5'},
    {id:'kinto',  name:'ポイント課金',     color:'#199E70'},
    {id:'used',   name:'単行本・EC送客',   color:'#D95926'},
    {id:'service',name:'アプリ送客',       color:'#C98500'},
    {id:'acc',    name:'読書エンゲージ',   color:'#D55181'},
  ];
  const GOALS=[
    {id:'estimate', name:'試し読み 完読',            goods:'acc',    mult:1.10,  value:80,   ev:'episode_read_complete'},
    {id:'testdrive',name:'定期購読 申込完了',         goods:'new',    mult:0.032, value:5000, ev:'subscription_complete'},
    {id:'visit',    name:'講談社ID 会員登録',         goods:'new',    mult:0.052, value:700,  ev:'signup_complete'},
    {id:'catalog',  name:'アプリ誘導クリック',        goods:'service',mult:0.42,  value:250,  ev:'app_link_click'},
    {id:'kinto',    name:'ポイント購入 完了',         goods:'kinto',  mult:0.34,  value:900,  ev:'point_purchase'},
    {id:'used',     name:'プッシュ通知 許諾',         goods:'new',    mult:0.16,  value:150,  ev:'push_optin'},
    {id:'service',  name:'単行本 購入クリック（EC）',  goods:'used',   mult:0.145, value:450,  ev:'book_ec_click'},
    {id:'acc',      name:'お気に入り登録',            goods:'acc',    mult:0.30,  value:60,   ev:'favorite_add'},
  ];
  /* ゴール×チャネル係数（プッシュ・メールは購読系に強い等） */
  const GOAL_CH={
    estimate:{org:1.0,sem:1.05,dsp:.85,vid:1.15,sns:1.25,crm:1.15,ref:.95,dir:1.05},   // 試し読み完読
    testdrive:{org:1.1,sem:1.0,dsp:.45,vid:.6,sns:.7,crm:2.6,ref:.8,dir:1.35},         // 定期購読
    visit:{org:1.05,sem:1.1,dsp:.7,vid:.85,sns:1.1,crm:1.7,ref:.9,dir:1.0},            // ID登録
    catalog:{org:.85,sem:1.15,dsp:1.25,vid:1.35,sns:1.6,crm:.5,ref:1.0,dir:.55},       // アプリ誘導
    kinto:{org:1.0,sem:1.05,dsp:.6,vid:.75,sns:.85,crm:1.35,ref:.85,dir:1.5},          // ポイント購入
    used:{org:.9,sem:.9,dsp:.8,vid:.9,sns:1.1,crm:1.9,ref:.8,dir:1.15},                // プッシュ許諾
    service:{org:1.25,sem:1.0,dsp:.7,vid:.8,sns:.9,crm:1.3,ref:1.15,dir:1.2},          // 単行本EC
    acc:{org:1.0,sem:1.0,dsp:.8,vid:1.0,sns:1.2,crm:1.3,ref:.9,dir:1.1},               // お気に入り
  };
  /* 再訪/新規のCV倍率（再訪÷新規）。アプリ誘導は新規が押す＝1未満 */
  const GOAL_RET_RATIO={estimate:1.7,testdrive:4.8,visit:1.9,catalog:0.55,kinto:6.5,used:2.2,service:2.6,acc:1.5};
  /* 作品ごとの商材関心シェア（セッション帰属・合計1） */
  function goodsShare(m){
    let s={new:.13,kinto:.30,used:.13,service:.16,acc:.28};
    if(m.price.startsWith('完結')){s={new:.09,kinto:.24,used:.28,service:.12,acc:.27}}  // 完結作＝単行本強い
    if(m.id==='kaoruhana'){s={new:.11,kinto:.24,used:.12,service:.28,acc:.25}}          // アニメ新規＝アプリ強い
    if(m.id==='bluelock'){s={new:.12,kinto:.28,used:.16,service:.20,acc:.24}}
    if(m.id==='ippo'){s={new:.20,kinto:.30,used:.18,service:.06,acc:.26}}               // 固定読者＝購読強い
    if(m.id==='shanfro'){s={new:.13,kinto:.34,used:.12,service:.15,acc:.26}}
    const t=Object.values(s).reduce((a,b)=>a+b,0);Object.keys(s).forEach(k=>s[k]/=t);
    return s;
  }
  /* 単行本ECは巻数の多い完結・長寿作品で強い（service=単行本スロットのcvr補正） */
  const SERVICE_W={ippo:2.4,tokyorev:2.2,diamond:1.8,bakemono:1.6,fumetsu:1.5,bluelock:1.6,shanfro:1.2,mokushi:1.1,cuckoo:1.0,megami:.95,amagami:.9,kaoruhana:1.05,sentai:1.0,seitokai:.7};

  /* ---------- マスタ：アフィニティ／ステージ／エリア ---------- */
  const AFFINITY=[
    {id:'comic', name:'コミック・アニメファン'},
    {id:'game',  name:'ゲーマー'},
    {id:'sports',name:'スポーツファン'},
    {id:'movie', name:'映画・ドラマ好き'},
    {id:'book',  name:'読書家'},
    {id:'music', name:'音楽・ライブ好き'},
    {id:'tech',  name:'テクノロジー好き'},
    {id:'fashion',name:'ファッション・美容'},
  ];
  const AFF_CVR_MULT={comic:1.42,game:1.12,sports:.96,movie:.98,book:1.22,music:.85,tech:.92,fashion:.82};
  function affShare(m){
    const base={comic:.30,game:.12,sports:.10,movie:.12,book:.11,music:.09,tech:.08,fashion:.08};
    const t={...base};
    const boost=(k,v)=>{t[k]*=v};
    if(m.cat==='スポーツ'){boost('sports',2.0);boost('comic',.9)}
    if(m.id==='shanfro'){boost('game',2.4);boost('tech',1.3)}
    if(m.id==='mokushi'){boost('game',1.4)}
    if(m.cat==='ラブコメ'){boost('fashion',1.4);boost('music',1.15)}
    if(m.id==='kaoruhana'){boost('movie',1.3);boost('music',1.2);boost('fashion',1.3)}
    if(m.id==='tokyorev'){boost('movie',1.5);boost('fashion',1.2)}
    if(m.id==='bakemono'){boost('book',1.7);boost('movie',1.2)}
    if(m.id==='fumetsu'){boost('book',1.4);boost('movie',1.3)}
    if(m.id==='ippo'){boost('sports',1.3);boost('book',1.1)}
    const sum=Object.values(t).reduce((a,b)=>a+b,0);
    Object.keys(t).forEach(k=>t[k]/=sum);
    return t;
  }
  const STAGES=[
    {id:'aware', name:'発見・初見'},
    {id:'interest', name:'回遊・ランキング'},
    {id:'consider', name:'試し読み'},
    {id:'nego', name:'課金検討'},
  ];
  const STAGE_CH={ // チャネル→ステージ構成（合計1）
    org:[.36,.28,.26,.10], sem:[.30,.28,.30,.12], dsp:[.60,.24,.13,.03], vid:[.55,.26,.15,.04],
    sns:[.50,.26,.19,.05], crm:[.06,.20,.42,.32], ref:[.42,.30,.21,.07], dir:[.16,.24,.34,.26],
  };
  const STAGE_CV_W=[.03,.11,.44,.42];     // CVのステージ帰属
  const STAGE_LOGIN=[.06,.15,.32,.62];    // ステージ別ログイン率（講談社ID）
  const AREAS=[
    {id:'hokkaido',name:'北海道・東北'},{id:'kanto',name:'関東'},{id:'chubu',name:'中部'},
    {id:'kinki',name:'近畿'},{id:'chushi',name:'中国・四国'},{id:'kyushu',name:'九州・沖縄'},
  ];
  function areaShare(m){
    const t={hokkaido:.08,kanto:.38,chubu:.15,kinki:.20,chushi:.08,kyushu:.11};
    if(m.id==='tokyorev'){t.kanto*=1.06;t.kinki*=1.04}
    if(m.cat==='スポーツ'){t.kyushu*=1.1;t.chubu*=1.05}
    if(m.id==='kaoruhana'){t.kanto*=1.08}
    const s=Object.values(t).reduce((a,b)=>a+b,0);Object.keys(t).forEach(k=>t[k]/=s);
    return t;
  }

  /* ---------- 訪問回数（コンボ）・RF ----------
     「待てば無料」の毎日回収サイクルでコンボ倍率は自動車サイトより急峻 */
  const BUCKETS=[
    {id:'v1', name:'1回（初訪問）', share:.34, cvrMult:.30},
    {id:'v2', name:'2〜3回',      share:.26, cvrMult:.85},
    {id:'v3', name:'4〜9回',      share:.22, cvrMult:1.85},
    {id:'v4', name:'10回以上',    share:.18, cvrMult:3.60},
  ];
  const RECENCY=['当日','1〜7日前','8〜30日前','31日以上前'];
  const RF_SHARE=[
    [.12,.10,.09],[ .15,.12,.08],[ .09,.09,.05],[ .05,.04,.02]
  ];

  /* ---------- デバイス・デモグラ ---------- */
  const DEVICES=[{id:'mob',name:'モバイル'},{id:'pc',name:'PC'},{id:'tab',name:'タブレット'}];
  const DEV_CH={org:[.82,.14,.04],sem:[.84,.12,.04],dsp:[.88,.08,.04],vid:[.90,.06,.04],sns:[.93,.04,.03],crm:[.88,.08,.04],ref:[.74,.22,.04],dir:[.80,.15,.05]};
  const AGES=['18-24','25-34','35-44','45-54','55-64','65+'];
  function ageGender(m){
    let male=[.14,.16,.13,.09,.05,.02], female=[.12,.12,.09,.05,.02,.01];
    if(m.id==='ippo'||m.id==='diamond'){male=[.06,.12,.18,.20,.12,.05];female=[.03,.06,.08,.07,.02,.01]}
    if(m.cat==='ラブコメ'){male=[.18,.20,.14,.08,.04,.01];female=[.13,.11,.07,.02,.01,.01]}
    if(m.id==='bluelock'||m.id==='tokyorev'){male=[.12,.13,.10,.07,.04,.01];female=[.18,.17,.12,.04,.01,.01]}   // 女性人気
    if(m.id==='kaoruhana'){male=[.10,.10,.08,.05,.03,.01];female=[.22,.19,.14,.06,.01,.01]}
    if(m.id==='bakemono'||m.id==='fumetsu'){male=[.10,.16,.16,.11,.06,.02];female=[.08,.12,.11,.05,.02,.01]}
    const s=[...male,...female].reduce((a,b)=>a+b,0);
    return {male:male.map(v=>v/s), female:female.map(v=>v/s)};
  }

  /* ---------- イベント（スパイク） ---------- */
  const EVENTS=[
    {date:'2026-03-07', label:'アクセス急増 ①（実測 4.4万S/日）', amp:2.6, dur:2,  model:null},
    {date:'2026-03-16', label:'急増期間 ②（実測 連日3〜5万S）',   amp:2.4, dur:16, model:null},
    {date:'2026-04-10', label:'急増期間 ③（実測 2〜4万S）',      amp:2.2, dur:21, model:null},
    {date:'2026-05-29', label:'急増期間 ④（実測 3.4〜5万S）',    amp:2.4, dur:10, model:null},
    {date:'2026-07-01', label:'急増期間 ⑤（実測 2〜5.6万S）',    amp:2.5, dur:15, model:null},
  ];  // 日付・規模＝GA4実測の実スパイク（要因ラベルは中立表記）
  const WD=[1.10,.95,.92,1.38,1.08,1.00,1.12]; // 日〜土（水曜=雑誌発売日）
  /* CV日次ノイズ（決定論・セグメント間で共通のため合計整合は維持される） */
  const DN={};
  GOALS.forEach((g,gi)=>{
    DN[g.id]=new Array(NDAYS);
    for(let d=0;d<NDAYS;d++){
      const x=Math.sin((d+3)*12.9898+gi*78.233)*43758.5453;
      DN[g.id][d]=1+((x-Math.floor(x))-0.5)*0.20;
    }
  });

  /* ---------- 基幹テンソル S[d][m][c]（作品ページセッション） ---------- */
  const S=[]; const OTHER=[]; // OTHER[d][c] 作品ページ以外（TOP・ランキング・ニュース等）
  const trendAt=(d)=> 1 + 0.0007*(d-NDAYS/2);
  const eventAmp=(d,mid)=>{
    let a=1;
    for(const ev of EVENTS){
      const s=IDX[ev.date]; if(s==null||d<s||d>=s+ev.dur) continue;
      const decay = ev.dur>20 ? 1 : (1-(d-s)/ev.dur);
      const amp = 1+(ev.amp-1)*(ev.dur>20?(d-s<3?(d-s+1)/3:1):decay);
      if(ev.model===null) a*=amp;
      else if(ev.model===mid) a*=amp;
    }
    return a;
  };
  const MIXN = MODELS.map(m=>{
    const w=CHANNELS.map(c=>c.share*(m.mix[c.id]||1));
    const s=w.reduce((a,b)=>a+b,0);
    return w.map(v=>v/s);
  });
  for(let d=0;d<NDAYS;d++){
    const wd=WD[DOW[d]]*trendAt(d);
    const row=[];
    for(let mi=0;mi<NM;mi++){
      const m=MODELS[mi];
      const dayN = 1+jit(.055);
      const tot = m.base*1000*wd*eventAmp(d,m.id)*dayN;
      const cells=[];
      for(let c=0;c<NC;c++){
        let v=tot*MIXN[mi][c]*(1+jit(.06));
        if(eventAmp(d,m.id)>1.15 && (CHANNELS[c].paid)) v*=1.25;
        cells.push(v);
      }
      row.push(cells);
    }
    S.push(row);
    const oc=[];
    for(let c=0;c<NC;c++){
      const modelSum=row.reduce((a,r)=>a+r[c],0);
      const f={org:.85,sem:.30,dsp:.50,vid:.55,sns:.60,crm:1.25,ref:1.05,dir:1.30}[CHANNELS[c].id];
      oc.push(modelSum*f*.48*(1+jit(.05)));
    }
    OTHER.push(oc);
  }


  /* ========== 実測キャリブレーション（GA4: 週刊少年マガジン公式 416515828 / 2026-08-19 Windsor.ai経由取得） ========== */
  /* REAL_DAILY[d] = [sessions, users, newusers]  2026-01-31〜2026-08-18 の200日・GA4実測値 */
  const REAL_DAILY=[[3040,2820,2035],[3622,3276,2423],[3186,2893,2011],[4020,3686,2584],[8756,8115,4479],[3893,3513,2336],[3444,3202,2284],[3335,3068,2270],[3346,3040,2193],[5028,4635,3340],[10641,9638,6599],[8049,7111,4747],[7475,6947,5521],[3861,3461,2538],[14005,12680,10693],[4703,4190,2960],[5301,4771,3244],[7247,6226,4271],[9978,9080,5039],[4704,4238,2875],[3432,3075,2088],[3595,3269,2313],[3313,2974,2152],[3381,3039,2133],[3494,3163,2038],[9220,8388,4726],[4110,3753,2481],[6158,5686,4066],[4179,3768,2710],[5241,4696,3179],[6962,6464,4329],[8323,7806,5476],[10721,9974,5883],[4608,4158,2773],[8000,7629,6488],[43881,43453,40612],[18386,17485,15456],[14075,12955,10271],[14957,13935,11723],[15614,14674,10208],[5913,5388,3785],[6320,5979,4718],[7845,7335,6253],[8176,7610,6206],[32125,31183,30007],[45426,43246,40925],[36771,35197,29766],[43584,41462,38709],[42477,41700,39051],[42235,41539,37832],[40156,40934,37737],[45960,43820,40093],[48820,45971,41075],[53454,50436,43197],[47073,44531,39786],[42027,42061,37237],[45700,43783,39030],[48133,45424,40157],[45763,44069,37810],[32743,31486,27055],[13190,12289,7879],[5311,4838,2777],[3881,3552,2465],[3581,3318,2404],[3870,3567,2618],[3778,3379,2426],[3937,3649,2446],[9685,8739,4753],[4798,4347,2846],[22432,22308,20175],[26216,25336,22771],[26373,25352,22806],[23881,23784,20947],[24576,23278,20386],[30341,29130,23707],[20612,19829,16999],[29080,27942,24935],[30519,29477,25858],[29836,29343,25943],[30707,29279,25817],[34558,32803,29119],[40422,38457,31308],[32553,31709,27611],[30388,29370,25657],[37214,36798,32391],[37172,36276,31824],[33664,32513,28043],[40625,39281,32601],[29050,27947,23089],[18510,17921,15109],[4181,3840,2798],[4290,3920,2994],[4139,3816,2902],[4395,4091,3067],[4690,4398,3306],[8252,7511,5565],[5851,5535,4016],[4730,4321,3114],[4511,4075,2886],[4638,4235,2999],[3789,3531,2342],[3984,3625,2398],[9901,9122,5233],[4723,4308,2847],[4536,4157,2996],[4132,3804,2829],[4367,4037,3152],[4701,4248,3217],[4710,4431,3184],[10427,9690,5628],[5149,4697,3525],[3727,3371,2397],[3398,3143,2286],[3694,3438,2617],[3490,3125,2207],[4138,3692,2559],[10013,9273,5249],[4374,3833,2622],[33897,33137,31936],[43238,41362,39083],[43356,41378,38644],[39129,38307,35314],[37848,36327,33246],[50569,48555,41127],[38046,36767,32932],[36644,35598,32406],[37814,36876,33189],[37403,35924,32371],[6726,6440,4774],[12955,11744,9129],[13855,13008,8047],[6877,6363,4569],[5420,5108,3775],[5978,5483,4182],[5483,5226,3957],[5026,4565,3319],[4958,4580,3123],[13482,12437,7606],[5921,5389,3804],[4455,4039,2487],[4628,4275,3198],[4287,3983,2963],[9630,9350,8351],[5921,5496,4158],[11493,10616,6326],[6246,5652,4268],[5311,4928,3814],[5637,5220,4178],[5750,5337,4332],[18945,18275,16389],[21850,21193,19097],[46462,43399,37541],[30310,29621,26775],[49691,47885,44231],[55317,52746,47055],[51108,47659,42987],[44260,42153,37222],[52326,47791,41806],[56265,53406,44290],[48950,47407,40788],[40229,38566,32990],[42246,41084,35278],[43958,42798,36446],[23725,22784,19059],[20051,19253,16133],[35855,34198,26333],[10325,9781,7284],[10558,10085,7957],[4529,4019,2889],[3998,3662,2690],[3964,3586,2609],[4305,3876,2644],[13484,12249,7945],[5457,4978,3472],[4178,3778,2655],[4269,3878,2797],[3932,3545,2660],[3683,3385,2403],[4163,3734,2541],[10917,9943,5637],[5163,4601,3113],[3762,3392,2357],[4318,3839,2864],[4104,3694,2770],[4186,3840,2560],[4144,3790,2509],[11147,10202,6124],[6012,5708,4178],[4719,4269,3118],[2957,2804,1940],[4027,3740,2786],[4437,4110,2960],[5142,4609,3421],[10810,10156,7176],[5080,4624,3404],[4707,4299,3221],[4129,3800,2927],[4233,3962,3016],[5330,4788,3429],[4921,4479,3065]];
  const PV_CAL_TARGET=1.478;   // 実測 PV/セッション（直近28日）
  (function calibrate(){
    if(REAL_DAILY.length!==NDAYS) return;
    // (a) チャネル構成を実測シェアへ（直近28日の現行構成→実測構成の係数を全期間に適用）
    const target=CHANNELS.map(c=>c.share);
    const cur=new Array(NC).fill(0);
    for(let d=NDAYS-28;d<NDAYS;d++){
      for(let c=0;c<NC;c++){
        for(let mi=0;mi<NM;mi++)cur[c]+=S[d][mi][c];
        cur[c]+=OTHER[d][c];
      }
    }
    const tot=cur.reduce((a,b)=>a+b,0);
    const cAdj=target.map((t,c)=>t/Math.max(1e-9,cur[c]/tot));
    for(let d=0;d<NDAYS;d++)for(let c=0;c<NC;c++){
      for(let mi=0;mi<NM;mi++)S[d][mi][c]*=cAdj[c];
      OTHER[d][c]*=cAdj[c];
    }
    // (b) 日次合計を実測セッションへ
    for(let d=0;d<NDAYS;d++){
      let curD=0;
      for(let mi=0;mi<NM;mi++)for(let c=0;c<NC;c++)curD+=S[d][mi][c];
      for(let c=0;c<NC;c++)curD+=OTHER[d][c];
      const k=REAL_DAILY[d][0]/Math.max(1,curD);
      for(let mi=0;mi<NM;mi++)for(let c=0;c<NC;c++)S[d][mi][c]*=k;
      for(let c=0;c<NC;c++)OTHER[d][c]*=k;
    }
  })();

  /* ---------- セグメント係数 ---------- */
  function segShare(seg,c){
    const n=CHANNELS[c].newShare;
    return seg==='new'? n : seg==='ret'? 1-n : 1;
  }
  function segCvFactor(seg,gid,c){
    const n=CHANNELS[c].newShare, k=GOAL_RET_RATIO[gid];
    const newF = n/(n+(1-n)*k);
    return seg==='new'? newF : seg==='ret'? 1-newF : 1;
  }

  /* ---------- 集計（range: 日数 / seg: all|new|ret） ---------- */
  const memo={};
  function agg(range,seg){
    const key=range+'_'+seg;
    if(memo[key]) return memo[key];
    const to=NDAYS-1, from=NDAYS-range, pfrom=NDAYS-range*2, pto=from-1;
    const win=(a,b)=>({a,b});
    const cur=win(from,to), prev=win(pfrom,pto);

    function sumWindow(w){
      const byModel=MODELS.map(()=>({sessions:0,byChannel:new Array(NC).fill(0),cv:{},cvByChannel:{},daily:[]}));
      const byChannel=new Array(NC).fill(0);
      const dailySessions=[],dailyCv=[],dailyByChannel=CHANNELS.map(()=>[]);
      let other=0; const otherByChannel=new Array(NC).fill(0);
      GOALS.forEach(g=>byModel.forEach(bm=>{bm.cv[g.id]=0;bm.cvByChannel[g.id]=new Array(NC).fill(0)}));
      for(let d=w.a;d<=w.b;d++){
        let daySess=0, dayCv=0;
        const dayCh=new Array(NC).fill(0);
        for(let mi=0;mi<NM;mi++){
          const m=MODELS[mi]; let mDay=0;
          for(let c=0;c<NC;c++){
            const s0=S[d][mi][c], s=s0*segShare(seg,c);
            byModel[mi].sessions+=s; byModel[mi].byChannel[c]+=s; byChannel[c]+=s;
            daySess+=s; dayCh[c]+=s; mDay+=s;
            for(const g of GOALS){
              let rate=m.cvr*g.mult*(GOAL_CH[g.id][CHANNELS[c].id]||1);
              if(g.id==='service') rate=m.cvr*g.mult*(GOAL_CH.service[CHANNELS[c].id]||1)*(SERVICE_W[m.id]||1)*.55;
              const cv=s0*rate*segCvFactor(seg,g.id,c)*DN[g.id][d];
              byModel[mi].cv[g.id]+=cv; byModel[mi].cvByChannel[g.id][c]+=cv; dayCv+=cv;
            }
          }
          byModel[mi].daily.push(mDay);
        }
        for(let c=0;c<NC;c++){
          const o=OTHER[d][c]*segShare(seg,c);
          other+=o; otherByChannel[c]+=o; daySess+=o; dayCh[c]+=o;
        }
        dailySessions.push(daySess); dailyCv.push(dayCv);
        for(let c=0;c<NC;c++) dailyByChannel[c].push(dayCh[c]);
      }
      return {byModel,byChannel,other,otherByChannel,dailySessions,dailyCv,dailyByChannel,
              dates:DATES.slice(w.a,w.b+1)};
    }

    const A=sumWindow(cur), P=sumWindow(prev);

    function totals(X){
      const modelSessions=X.byModel.reduce((a,b)=>a+b.sessions,0);
      const sessions=modelSessions+X.other;
      const cvByGoal={}; GOALS.forEach(g=>cvByGoal[g.id]=X.byModel.reduce((a,b)=>a+b.cv[g.id],0));
      const cv=Object.values(cvByGoal).reduce((a,b)=>a+b,0);
      const value=GOALS.reduce((a,g)=>a+cvByGoal[g.id]*g.value,0);
      const freq= range<=7?1.187: range<=28?1.369:1.238;   // GA4実測（期間セッション÷期間ユニークユーザー）
      const users=sessions/freq;
      const nsAll=CHANNELS.reduce((a,c,i)=>a+(X.byChannel[i]+X.otherByChannel[i])*(seg==='all'?c.newShare:seg==='new'?1:0),0);
      const newRate= sessions? nsAll/sessions:0;
      const pv=(X.byModel.reduce((a,b,i)=>a+b.sessions*MODELS[i].pps,0)+X.other*2.4)*0.19644;  // ×較正係数 → 実測 PV/S 1.478（GA4 28日）に一致
      return {sessions,users,newRate,cv,cvByGoal,value,pv,modelSessions};
    }
    const T=totals(A), TP=totals(P);
    const engRate=A.byModel.reduce((a,b,i)=>a+MODELS[i].eng*b.sessions,0)/Math.max(1,T.modelSessions)*(seg==='ret'?1.08:seg==='new'?0.94:1)*0.7882;  // ×較正 → 実測エンゲージ率53.45%（GA4 28日）
    const avgDur=A.byModel.reduce((a,b,i)=>a+(40+MODELS[i].pps*28)*b.sessions,0)/Math.max(1,T.modelSessions)*0.3531;  // ×較正 → 実測 平均110.2秒（GA4 28日）

    const models=MODELS.map((m,mi)=>{
      const bm=A.byModel[mi], pm=P.byModel[mi];
      const cv=GOALS.reduce((a,g)=>a+bm.cv[g.id],0);
      const cvPrev=GOALS.reduce((a,g)=>a+pm.cv[g.id],0);
      const retShare=bm.byChannel.reduce((a,v,c)=>a+v*(1-CHANNELS[c].newShare),0)/Math.max(1,bm.sessions);
      const adShare=bm.byChannel.reduce((a,v,c)=>a+(CHANNELS[c].paid?v:0),0)/Math.max(1,bm.sessions);
      return {...m, mi, sessions:bm.sessions, prevSessions:pm.sessions,
        byChannel:bm.byChannel, cvGoal:bm.cv, cvByChannel:bm.cvByChannel, cv, cvPrev,
        cvr:cv/Math.max(1,bm.sessions), retShare, adShare,
        pv:bm.sessions*m.pps, daily:bm.daily,
        toolSessions:bm.sessions*m.tool, dealerSessions:bm.sessions*m.dealer};
    });
    const sorted=[...models].sort((a,b)=>b.sessions-a.sessions);
    sorted.forEach((m,i)=>{m.tier= i<2?'S': i<6?'A': i<10?'B':'C'; m.rank=i+1;});

    const channels=CHANNELS.map((c,ci)=>{
      const sess=A.byChannel[ci]+A.otherByChannel[ci];
      const prevSess=P.byChannel[ci]+P.otherByChannel[ci];
      const cv=models.reduce((a,m)=>a+GOALS.reduce((x,g)=>x+m.cvByChannel[g.id][ci],0),0);
      return {...c, ci, sessions:sess, prevSessions:prevSess, cv, cvr:cv/Math.max(1,sess),
        daily:A.dailyByChannel[ci]};
    });

    const goals=GOALS.map(g=>{
      const cv=T.cvByGoal[g.id], prev=TP.cvByGoal[g.id];
      return {...g, cv, prev, value:cv*g.value};
    });
    const goods=GOODS.map(gd=>{
      const gs=GOALS.filter(g=>g.goods===gd.id);
      const cv=gs.reduce((a,g)=>a+T.cvByGoal[g.id],0);
      const prev=gs.reduce((a,g)=>a+TP.cvByGoal[g.id],0);
      const sessions=models.reduce((a,m)=>a+m.sessions*goodsShare(m)[gd.id],0);
      const prevSessions=MODELS.reduce((a,m,mi)=>a+P.byModel[mi].sessions*goodsShare(m)[gd.id],0);
      const value=gs.reduce((a,g)=>a+T.cvByGoal[g.id]*g.value,0);
      return {...gd, cv, prev, sessions, prevSessions, value, goals:gs.map(g=>({id:g.id,name:g.name,cv:T.cvByGoal[g.id],prev:TP.cvByGoal[g.id],value:T.cvByGoal[g.id]*g.value}))};
    });

    const out={range,seg,from:DATES[from],to:DATES[to],prevFrom:DATES[pfrom],prevTo:DATES[pto],
      dates:A.dates, dailySessions:A.dailySessions, dailyCv:A.dailyCv, dailyByChannel:A.dailyByChannel,
      prevDailySessions:P.dailySessions,
      total:{...T,engRate,avgDur}, prevTotal:TP,
      models, channels, goals, goods, otherSessions:A.other};
    memo[key]=out;
    return out;
  }

  /* ---------- クロス行列 ---------- */
  const DIMS={
    model:{name:'作品', items:()=>MODELS.map(m=>m.name)},
    channel:{name:'チャネル', items:()=>CHANNELS.map(c=>c.name)},
    goods:{name:'商材', items:()=>GOODS.map(g=>g.name)},
    affinity:{name:'アフィニティ', items:()=>AFFINITY.map(a=>a.name)},
    stage:{name:'読者ステージ', items:()=>STAGES.map(s=>s.name)},
    area:{name:'エリア', items:()=>AREAS.map(a=>a.name)},
  };
  const AFF_MULT_N=MODELS.map(m=>{
    const sh=affShare(m); const denom=AFFINITY.reduce((a,af)=>a+sh[af.id]*AFF_CVR_MULT[af.id],0);
    const o={}; AFFINITY.forEach(af=>o[af.id]=AFF_CVR_MULT[af.id]/denom); return o;
  });
  function factorLen(dim){return dim==='model'?NM:dim==='channel'?NC:dim==='goods'?GOODS.length:dim==='affinity'?AFFINITY.length:dim==='stage'?STAGES.length:AREAS.length}
  function factorVec(dim, mi, ci, kind){
    const m=MODELS[mi], cid=CHANNELS[ci].id;
    switch(dim){
      case 'model':{const v=new Array(NM).fill(0);v[mi]=1;return v}
      case 'channel':{const v=new Array(NC).fill(0);v[ci]=1;return v}
      case 'goods':{
        if(kind==='sess'){const gs=goodsShare(m);return GOODS.map(g=>gs[g.id])}
        return null;
      }
      case 'affinity':{
        const sh=affShare(m);
        if(kind==='sess')return AFFINITY.map(a=>sh[a.id]);
        return AFFINITY.map(a=>sh[a.id]*AFF_MULT_N[mi][a.id]);
      }
      case 'stage':{
        const st=STAGE_CH[cid];
        if(kind==='sess')return st;
        return STAGE_CV_W;
      }
      case 'area':{
        const ar=areaShare(m);return AREAS.map(a=>ar[a.id]);
      }
    }
  }
  function pairMatrix(rowDim,colDim,metric,range,seg){
    const A=agg(range,seg);
    const nr=factorLen(rowDim), nc2=factorLen(colDim);
    const sess=Array.from({length:nr},()=>new Array(nc2).fill(0));
    const cv=Array.from({length:nr},()=>new Array(nc2).fill(0));
    const news=Array.from({length:nr},()=>new Array(nc2).fill(0));
    for(let mi=0;mi<NM;mi++){
      const M=A.models[mi];
      for(let ci=0;ci<NC;ci++){
        const s=M.byChannel[ci];
        const rS=factorVec(rowDim,mi,ci,'sess'), cS=factorVec(colDim,mi,ci,'sess');
        const rC=factorVec(rowDim,mi,ci,'cv')||null, cC=factorVec(colDim,mi,ci,'cv')||null;
        const nsh=CHANNELS[ci].newShare;
        for(let r=0;r<nr;r++)for(let c2=0;c2<nc2;c2++){
          sess[r][c2]+=s*rS[r]*cS[c2];
          news[r][c2]+=s*rS[r]*cS[c2]*nsh;
        }
        const rowIsGoods=rowDim==='goods', colIsGoods=colDim==='goods';
        for(const g of GOALS){
          const gcv=M.cvByChannel[g.id][ci];
          const gi=GOODS.findIndex(x=>x.id===g.goods);
          const rV=rowIsGoods? GOODS.map((_,i)=>i===gi?1:0) : (rC||rS);
          const cV=colIsGoods? GOODS.map((_,i)=>i===gi?1:0) : (cC||cS);
          for(let r=0;r<nr;r++)for(let c2=0;c2<nc2;c2++)cv[r][c2]+=gcv*rV[r]*cV[c2];
        }
      }
    }
    const rows=DIMS[rowDim].items(), cols=DIMS[colDim].items();
    const val=Array.from({length:nr},(_,r)=>cols.map((_,c2)=>{
      if(metric==='sessions')return sess[r][c2];
      if(metric==='cv')return cv[r][c2];
      if(metric==='cvr')return cv[r][c2]/Math.max(1,sess[r][c2]);
      if(metric==='newRate')return news[r][c2]/Math.max(1,sess[r][c2]);
    }));
    return {rows,cols,val,sess,cv};
  }

  /* ---------- サンキー（読者動線） ---------- */
  function sankey(range,seg){
    const A=agg(range,seg);
    const LP=['作品トップ','キャンペーンLP','マガポケTOP','ランキング・検索','購読・単行本LP'];
    const LP_MIX={org:[.44,.05,.22,.19,.10],sem:[.46,.16,.14,.12,.12],dsp:[.24,.58,.10,.04,.04],vid:[.26,.56,.10,.04,.04],
      sns:[.32,.46,.10,.06,.06],crm:[.44,.12,.22,.08,.14],ref:[.42,.10,.24,.16,.08],dir:[.28,.03,.44,.15,.10]};
    const MID=['最新話・話一覧','試し読みビューア','ランキング・特集 回遊','ポイント・購読ページ','離脱（回遊なし）'];
    const LP_MID=[[.28,.26,.12,.10,.24],[.18,.30,.12,.09,.31],[.20,.14,.22,.10,.34],[.16,.20,.28,.10,.26],[.12,.12,.06,.50,.20]];
    const OUT=['定期購読・会員CV','ポイント・単行本CV','アプリ誘導クリック','試し読み完読','未CVで離脱'];
    const links=[],nodes=[];
    const nodeIdx={}; const addNode=n=>{if(nodeIdx[n]==null){nodeIdx[n]=nodes.length;nodes.push({name:n})}return nodeIdx[n]};
    const lpTotals=new Array(LP.length).fill(0);
    A.channels.forEach((c)=>{
      const mix=LP_MIX[c.id];
      LP.forEach((lp,li)=>{
        const v=c.sessions*mix[li]; lpTotals[li]+=v;
        links.push({source:addNode(c.name),target:addNode(lp),value:v});
      });
    });
    const midTotals=new Array(MID.length).fill(0);
    LP.forEach((lp,li)=>{
      MID.forEach((md,mi2)=>{
        const v=lpTotals[li]*LP_MID[li][mi2]; midTotals[mi2]+=v;
        links.push({source:addNode(lp),target:addNode(md),value:v});
      });
    });
    const cvEst=A.total.cvByGoal.testdrive+A.total.cvByGoal.visit+A.total.cvByGoal.used;
    const cvVisit=A.total.cvByGoal.kinto+A.total.cvByGoal.service;
    const cvKU=A.total.cvByGoal.catalog;
    const cvSrv=A.total.cvByGoal.estimate+A.total.cvByGoal.acc;
    const outVals=[cvEst,cvVisit,cvKU,cvSrv];
    const CV_FROM=[[.16,.22,.10,.52,0],[ .12,.24,.08,.56,0],[ .26,.40,.16,.18,0],[ .22,.58,.10,.10,0]];
    MID.forEach((md,mi2)=>{
      let used=0;
      OUT.forEach((o,oi)=>{
        if(oi<4){const v=outVals[oi]*CV_FROM[oi][mi2];used+=v;links.push({source:addNode(md),target:addNode(o),value:v})}
      });
      const drop=Math.max(0,midTotals[mi2]-used);
      links.push({source:addNode(md),target:addNode('未CVで離脱'),value:drop});
    });
    return {nodes,links,lp:LP,lpTotals};
  }

  /* ---------- ステージファネル ---------- */
  function funnel(range,seg){
    const A=agg(range,seg);
    const s1=A.total.sessions;
    const s2=A.total.modelSessions;
    const s3=A.models.reduce((a,m)=>a+m.toolSessions,0);
    const s4=A.models.reduce((a,m)=>a+m.dealerSessions,0);
    const s5=A.total.cv;
    return [
      {name:'STAGE 1｜サイト流入',      v:s1, desc:'全セッション'},
      {name:'STAGE 2｜作品ページ閲覧',   v:s2, desc:'いずれかの作品に接触'},
      {name:'STAGE 3｜試し読み開始',     v:s3, desc:'ビューアで本文を読む'},
      {name:'STAGE 4｜課金・登録接点',   v:s4, desc:'ポイント・購読・会員ページ'},
      {name:'CLEAR｜コンバージョン',     v:s5, desc:'8種のCV合計'},
    ];
  }

  /* ---------- 訪問回数（コンボ）・RF ---------- */
  function comboData(range){
    const A=agg(range,'all');
    const denom=BUCKETS.reduce((a,b)=>a+b.share*b.cvrMult,0);
    const baseCvr=A.total.cv/A.total.sessions;
    return BUCKETS.map(b=>({...b,
      sessions:A.total.sessions*b.share,
      cvr: baseCvr*b.cvrMult/denom,
      cv: A.total.cv*(b.share*b.cvrMult/denom),
    }));
  }
  function rfMatrix(range){
    const A=agg(range,'ret');
    const total=A.total.sessions;
    const flat=RF_SHARE.flat(); const s=flat.reduce((a,b)=>a+b,0);
    return RECENCY.map((r,ri)=>RF_SHARE[ri].map(v=>total*v/s));
  }

  /* ---------- アフィニティ集計 ---------- */
  function affinityAgg(range,seg){
    const A=agg(range,seg);
    const sess=AFFINITY.map(()=>0), cv=AFFINITY.map(()=>0);
    A.models.forEach((m,mi)=>{
      const sh=affShare(MODELS[mi]);
      AFFINITY.forEach((af,ai)=>{
        sess[ai]+=m.sessions*sh[af.id];
        cv[ai]+=m.cv*sh[af.id]*AFF_MULT_N[mi][af.id];
      });
    });
    const totS=sess.reduce((a,b)=>a+b,0), totC=cv.reduce((a,b)=>a+b,0);
    return AFFINITY.map((af,ai)=>({...af,sessions:sess[ai],cv:cv[ai],
      cvr:cv[ai]/Math.max(1,sess[ai]),
      share:sess[ai]/totS,
      idx: (cv[ai]/Math.max(1,sess[ai]))/(totC/totS)*100 }));
  }

  /* ---------- キャンペーン（広告トラッキング） ---------- */
  const CAMPAIGNS=[
    {id:'brand_go', name:'指名検索 常時運用',          ch:'sem', src:'google', med:'cpc',  utm:'always-on_brand',        from:'2026-02-01',to:'2026-08-18', share:.30, cpc:24,  q:1.40, goal:'kinto'},
    {id:'gen_go',   name:'一般KW（マンガ無料 等）',     ch:'sem', src:'google', med:'cpc',  utm:'always-on_generic',      from:'2026-02-01',to:'2026-08-18', share:.26, cpc:52,  q:0.88, goal:'catalog'},
    {id:'brand_yh', name:'Yahoo!検索 指名',            ch:'sem', src:'yahoo',  med:'cpc',  utm:'always-on_brand-y',      from:'2026-02-01',to:'2026-08-18', share:.16, cpc:26,  q:1.25, goal:'kinto'},
    {id:'kaoru_yt', name:'薫る花 アニメ連動 YouTube',   ch:'vid', src:'youtube',med:'video', utm:'kaoruhana_anime_202607', from:'2026-07-08',to:'2026-08-18', share:.34, cpc:46,  q:1.10, goal:'estimate', model:'kaoruhana'},
    {id:'kaoru_tver',name:'薫る花 アニメ連動 TVer',     ch:'vid', src:'tver',   med:'video', utm:'kaoruhana_anime_202607', from:'2026-07-08',to:'2026-08-18', share:.26, cpc:52,  q:1.02, goal:'estimate', model:'kaoruhana'},
    {id:'blue_dsp', name:'ブルーロック 新S告知',        ch:'dsp', src:'gdn',    med:'display',utm:'bluelock_s3_202606',    from:'2026-06-25',to:'2026-07-20', share:.26, cpc:44,  q:1.05, goal:'estimate', model:'bluelock'},
    {id:'trev_x',   name:'東リベ 全巻無料 告知',        ch:'sns', src:'x',      med:'paid_social',utm:'tokyorev_free_202607',from:'2026-07-15',to:'2026-07-22',share:.20, cpc:55,  q:1.15, goal:'catalog', model:'tokyorev'},
    {id:'app_tiktok',name:'マガポケ アプリ獲得 TikTok', ch:'sns', src:'tiktok', med:'paid_social',utm:'magapoke_ua_always', from:'2026-02-01',to:'2026-08-18', share:.34, cpc:38,  q:1.22, goal:'catalog'},
    {id:'summer_dsp',name:'夏の一気読み 無料開放',      ch:'dsp', src:'yda',    med:'display',utm:'summer_binge_202608',   from:'2026-08-05',to:'2026-08-18', share:.28, cpc:40,  q:1.08, goal:'estimate'},
    {id:'sub_meta', name:'定期購読 乗り換えCP',         ch:'sns', src:'meta',   med:'paid_social',utm:'subscription_202607',from:'2026-07-01',to:'2026-08-18', share:.22, cpc:74,  q:1.18, goal:'testdrive'},
    {id:'shinkan_dsp',name:'コミックス新刊 リタゲ',     ch:'dsp', src:'criteo', med:'display',utm:'shinkan_retg_202608',   from:'2026-08-10',to:'2026-08-18', share:.20, cpc:35,  q:1.12, goal:'service'},
    {id:'id_crm',   name:'講談社ID登録 促進（CRM）',    ch:'crm', src:'crm',    med:'email', utm:'kodansha-id_202608',     from:'2026-08-01',to:'2026-08-18', share:.40, cpc:0,   q:1.55, goal:'visit'},
  ];
  function campaigns(range){
    const A=agg(range,'all');
    const chIdx=Object.fromEntries(CHANNELS.map((c,i)=>[c.id,i]));
    return CAMPAIGNS.map(cp=>{
      const w={a:Math.max(NDAYS-range,IDX[cp.from]??0), b:Math.min(NDAYS-1,IDX[cp.to]??NDAYS-1)};
      let sess=0;
      if(w.a<=w.b){
        for(let d=w.a;d<=w.b;d++){
          let chSum=0;
          for(let mi=0;mi<NM;mi++)chSum+=S[d][mi][chIdx[cp.ch]];
          chSum+=OTHER[d][chIdx[cp.ch]];
          if(cp.model){
            const mi=MODELS.findIndex(m=>m.id===cp.model);
            sess+=S[d][mi][chIdx[cp.ch]]*2.6*cp.share;
          }else{
            sess+=chSum*cp.share;
          }
        }
      }
      const g=GOALS.find(x=>x.id===cp.goal);
      const chObj=A.channels[chIdx[cp.ch]];
      const cvr=chObj.cvr*cp.q*(cp.goal==='estimate'?1.6:1);
      const cv=sess*cvr;
      const spend=sess*cp.cpc;
      const value=cv*g.value*3.0;         // LTV換算
      return {...cp, chName:CHANNELS[chIdx[cp.ch]].name, chColor:CHANNELS[chIdx[cp.ch]].color,
        sessions:sess, cv, cvr, spend, cpa:cv>0?spend/cv:0, roas:spend>0?value/spend:null,
        active: IDX[cp.to]>=NDAYS-range};
    }).filter(c=>c.sessions>500);
  }

  /* ---------- UTMサンバースト ---------- */
  function utmTree(range){
    const cps=campaigns(range);
    const bySrc={};
    cps.forEach(c=>{
      bySrc[c.src]=bySrc[c.src]||{name:c.src,children:[],value:0,med:c.med};
      bySrc[c.src].children.push({name:c.utm,value:Math.round(c.sessions),cv:c.cv,cp:c});
      bySrc[c.src].value+=c.sessions;
    });
    const A=agg(range,'all');
    const paidSess=A.channels.filter(c=>c.paid).reduce((a,c)=>a+c.sessions,0);
    const tracked=cps.reduce((a,c)=>a+c.sessions,0);
    return {tree:Object.values(bySrc),tracked,paidSess,untracked:Math.max(0,paidSess-tracked)};
  }

  /* ---------- ミッション（8月・月次目標） ---------- */
  function missions(){
    const a=IDX['2026-08-01'], b=IDX['2026-08-18'];
    const mtd={kinto:0,testdrive:0,catalog:0,newSessions:0};
    for(let d=a;d<=b;d++){
      for(let mi=0;mi<NM;mi++){
        const m=MODELS[mi];
        for(let c=0;c<NC;c++){
          const s=S[d][mi][c];
          mtd.newSessions+=s*CHANNELS[c].newShare;
          for(const gid of ['kinto','testdrive','catalog']){
            const g=GOALS.find(x=>x.id===gid);
            mtd[gid]+=s*m.cvr*g.mult*(GOAL_CH[gid][CHANNELS[c].id]||1)*DN[gid][d];
          }
        }
      }
      for(let c=0;c<NC;c++)mtd.newSessions+=OTHER[d][c]*CHANNELS[c].newShare;
    }
    const pace=18/31;
    const defs=[
      {id:'m1',name:'ポイント購入 完了',    target:MTGT.kinto,    actual:mtd.kinto,     unit:'件', icon:'target'},
      {id:'m2',name:'定期購読 申込',        target:MTGT.testdrive,actual:mtd.testdrive, unit:'件', icon:'wheel'},
      {id:'m3',name:'アプリ誘導クリック',    target:MTGT.catalog,  actual:mtd.catalog,   unit:'件', icon:'key'},
      {id:'m4',name:'新規読者の獲得',        target:MTGT.newu,     actual:mtd.newSessions/1.06, unit:'人', icon:'user'},
    ];
    return defs.map(d=>{
      const prog=d.actual/d.target;
      const vsPace=prog/pace;
      return {...d, prog, pace, vsPace,
        status: vsPace>=1.02?'ahead': vsPace>=0.92?'ontrack':'behind'};
    });
  }
  const MTGT={kinto:800,testdrive:85,catalog:1000,newu:92000}; // 月間目標＝直近実測ペース基準の仮置き（実測スケールに整合・8月は目標確定前）
  function score(){
    const ms=missions();
    const w=[.30,.28,.20,.22];
    const s=ms.reduce((a,m,i)=>a+w[i]*Math.min(1.15,m.vsPace),0)/1.15*100;
    const tier= s>=90?'S': s>=72?'A': s>=58?'B':'C';
    return {score:s, tier, missions:ms};
  }

  /* ---------- カスタムディメンション辞書 ---------- */
  const CUSTOM_DIMS=[
    {scope:'User',  disp:'会員ステータス',        param:'member_status',      fill:.98, vals:'guest / free_id / premium_sub', note:'講談社ID連携。購読状態を日次同期'},
    {scope:'User',  disp:'ログイン状態',          param:'login_status',       fill:.99, vals:'logged_in / guest', note:'全ヒットに付与。読者ステージ分析の基礎'},
    {scope:'User',  disp:'読者タイプ',            param:'reader_type',        fill:.86, vals:'light / regular / heavy / binge', note:'閲覧頻度スコアリングで日次更新'},
    {scope:'User',  disp:'推し作品',              param:'favorite_title',     fill:.58, vals:'title_code準拠', note:'お気に入り由来。取得率が低く改善対象'},
    {scope:'Event', disp:'作品コード',            param:'title_code',         fill:.97, vals:'bluelock / shanfro / …', note:'作品ページ・ビューアに付与'},
    {scope:'Event', disp:'話数',                 param:'episode_no',         fill:.94, vals:'数値＋extra区分', note:'ビューア表示以降のヒット'},
    {scope:'Event', disp:'チケット種別',          param:'ticket_type',        fill:.91, vals:'wait_free / point / premium', note:'どの権利で読んだか。課金分析の中核'},
    {scope:'Event', disp:'読了率',               param:'read_complete_rate', fill:.72, vals:'0-100（%）', note:'ビューア離脱位置。取得率が低く改善対象'},
    {scope:'Event', disp:'CPバナーID',           param:'banner_id',          fill:.93, vals:'top_kv / cp_banner_01 / …', note:'サイト内バナー・導線の効果測定キー'},
    {scope:'Event', disp:'課金種別',              param:'purchase_type',      fill:.96, vals:'point / subscription / book_ec', note:'課金・EC送客ヒット'},
    {scope:'Event', disp:'閲覧モード',            param:'view_mode',          fill:.88, vals:'vertical / horizontal / app_link', note:'縦読み/横読み。UX分析用'},
    {scope:'Event', disp:'フォームステップ',       param:'form_step',          fill:.96, vals:'step1〜3 / complete', note:'購読・会員登録のEFO分析用'},
  ];
  const EVENTS_DICT=[
    {ev:'page_view',           disp:'ページ表示（全ページ共通）',                    n:226814, scale:5},
    {ev:'session_start',       disp:'セッション開始',                              n:151608, scale:5},
    {ev:'user_engagement',     disp:'エンゲージメント（10秒以上滞在等）',            n:130860, scale:5},
    {ev:'first_visit',         disp:'初回訪問（新規ユーザー）',                     n:97048,  scale:4},
    {ev:'view_content',        disp:'コンテンツ閲覧（作品・記事詳細）',              n:70482,  scale:4},
    {ev:'scroll',              disp:'90%スクロール到達',                           n:49477,  scale:4},
    {ev:'nav_click',           disp:'グローバルナビのクリック',                     n:32504,  scale:4},
    {ev:'click',               disp:'外部リンククリック',                          n:9656,   scale:3},
    {ev:'view_search_results', disp:'サイト内検索の結果表示',                       n:9438,   scale:3},
    {ev:'form_start',          disp:'フォーム入力開始（新人賞応募・問い合わせ）',     n:3278,   scale:2},
    {ev:'form_submit',         disp:'フォーム送信完了 ＝ 実測コンバージョン',        n:2904,   scale:2},
    {ev:'file_download',       disp:'ファイルダウンロード',                        n:562,    scale:1},
    {ev:'gravure_link_click',  disp:'グラビア関連リンクのクリック',                 n:74,     scale:1},
  ];  // すべてGA4実測（7/22〜8/18・28日間の実発生数）

  /* ---------- 会員ステータス ---------- */
  function memberData(range){
    const A=agg(range,'all');
    const ranks=[
      {name:'定期購読会員',        share:.05, cvrMult:5.2},
      {name:'ポイント保有会員',     share:.09, cvrMult:3.3},
      {name:'講談社ID 無料会員',    share:.21, cvrMult:1.8},
      {name:'未ログイン',          share:.65, cvrMult:.52},
    ];
    const denom=ranks.reduce((a,r)=>a+r.share*r.cvrMult,0);
    const base=A.total.cv/A.total.sessions;
    return ranks.map(r=>({...r,sessions:A.total.sessions*r.share,cvr:base*r.cvrMult/denom,cv:A.total.cv*r.share*r.cvrMult/denom}));
  }

  /* ---------- デバイス・デモグラ集計 ---------- */
  function deviceAgg(range,seg){
    const A=agg(range,seg);
    const v=[0,0,0];
    A.channels.forEach(c=>{const d=DEV_CH[c.id];for(let i=0;i<3;i++)v[i]+=c.sessions*d[i]});
    return DEVICES.map((d,i)=>({...d,sessions:v[i]}));
  }
  function demoAgg(range){
    const A=agg(range,'all');
    const male=new Array(6).fill(0), female=new Array(6).fill(0);
    A.models.forEach((m,mi)=>{
      const g=ageGender(MODELS[mi]);
      for(let i=0;i<6;i++){male[i]+=m.sessions*g.male[i];female[i]+=m.sessions*g.female[i]}
    });
    return {ages:AGES,male,female};
  }
  function areaAgg(range){
    const A=agg(range,'all');
    const v=AREAS.map(()=>0);
    A.models.forEach((m,mi)=>{
      const ar=areaShare(MODELS[mi]);
      AREAS.forEach((a,ai)=>v[ai]+=m.sessions*ar[a.id]);
    });
    const other=A.otherSessions; const s=v.reduce((a,b)=>a+b,0);
    return AREAS.map((a,ai)=>({...a,sessions:v[ai]*(1+other/Math.max(1,s))}));
  }

  const REAL_PAGES=[["/smaga/",66242,76900],["/",14684,17703],["/series/",7835,8727],["/info/entry/20260715_magazineshop/",7541,8330],["/search/",6895,9341],["/bmaga/",5141,5892],["/info/entry/20260704_bluelock/",3995,4413],["/info/entry/202607_fairytail_cp/",3976,4370],["/info/entry/20260707_bluelock/",3942,4218],["/series/smaga/",3896,4752],["/comics/smaga/",3694,4201],["/comics/",3157,3560],["/info/entry/第116回新人漫画賞大発表/",2762,3044],["/comics/mpoke/this_month/",2428,2998],["/info/",2269,3273],["/series/mpoke/",2136,2586],["/comics/bmaga/this_month/",1985,2593],["/series/bmaga/",1821,2338],["/form_view/",1624,2319],["/info/entry/20260807_prisoners_cp/",1558,1813],["/special_page/hajimenoippo/",1536,1652],["/special_page/bluelock/",1489,1633]];  // GA4実測 上位ページ（7/22〜8/18・sessions,PV）
  return {DATES,CHANNELS,MODELS,GOODS,GOALS,AFFINITY,STAGES,AREAS,BUCKETS,RECENCY,DEVICES,AGES,EVENTS,REAL_PAGES,
    CUSTOM_DIMS,EVENTS_DICT,DIMS,STAGE_LOGIN,
    agg,pairMatrix,sankey,funnel,comboData,rfMatrix,affinityAgg,campaigns,utmTree,missions,score,
    memberData,deviceAgg,demoAgg,areaAgg,affShare,goodsShare,areaShare,ageGender};
})();
