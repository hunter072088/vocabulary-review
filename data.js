// 58 個核心單字完整資料庫 (涵蓋半導體工程、商務管理、教育職涯、口語片語)
const VOCAB_DATA = [
  // === 主題一：半導體、光學與製程工程 (Engineering & Manufacturing) ===
  {
    id: 1,
    word: "traceability",
    rawInput: "traceabilit",
    phonetic: "/ˌtreɪ.səˈbɪl.ə.t̬i/",
    pos: "n.",
    zh: "可追溯性",
    category: "engineering",
    categoryLabel: "製程與工程",
    example: "Batch traceability is critical in wafer fabrication to track down defective materials.",
    exampleZh: "批次可追溯性在晶圓製造中至關重要，以便追查缺陷材料。",
    memory: "trace（追蹤）+ -ability（能力、性質）。常用搭配：full traceability（完整可追溯性）、product traceability（產品溯源）。"
  },
  {
    id: 2,
    word: "procedure",
    phonetic: "/prəˈsiː.dʒɚ/",
    pos: "n.",
    zh: "程序、步驟 (SOP)",
    category: "engineering",
    categoryLabel: "製程與工程",
    example: "All technicians must follow the standard operating procedure strictly.",
    exampleZh: "所有技術員都必須嚴格遵守標準作業程序。",
    memory: "字根 ced（走，如 proceed 前進）。常用搭配：standard procedure（標準程序）、safety procedure（安全步驟）。"
  },
  {
    id: 3,
    word: "scratch",
    phonetic: "/skrætʃ/",
    pos: "n. / v.",
    zh: "刮痕；刮傷",
    category: "engineering",
    categoryLabel: "製程與工程",
    example: "Even a microscopic scratch on the wafer surface can ruin the entire chip.",
    exampleZh: "晶圓表面上哪怕是一道微米級的刮痕，都可能毀掉整顆晶片。",
    memory: "擬聲字（刮東西的聲音）。片語延伸：from scratch（從零開始）。"
  },
  {
    id: 4,
    word: "excessive",
    phonetic: "/ekˈses.ɪv/",
    pos: "adj.",
    zh: "過多的、過度的",
    category: "engineering",
    categoryLabel: "製程與工程",
    example: "Excessive heat during the process caused severe damage to the circuit.",
    exampleZh: "製程中過多的熱量對電路造成了嚴重損壞。",
    memory: "ex-（超出）+ cess（走）→ 走過頭了。常用搭配：excessive force/heat/cost（過度用力／過熱／過高成本）。"
  },
  {
    id: 5,
    word: "optical",
    phonetic: "/ˈɑːp.tɪ.kəl/",
    pos: "adj.",
    zh: "光學的、視覺的",
    category: "engineering",
    categoryLabel: "製程與工程",
    example: "We use an automated optical inspection (AOI) system to detect surface defects.",
    exampleZh: "我們使用自動光學檢測系統來偵測表面缺陷。",
    memory: "字根 opt（光、看，如 optimist 樂觀主義者）。常用搭配：optical fiber（光纖）、optical inspection（光學檢測）。"
  },
  {
    id: 6,
    word: "orientation",
    phonetic: "/ˌɔːr.i.enˈteɪ.ʃən/",
    pos: "n.",
    zh: "方向、晶向；職前訓練",
    category: "engineering",
    categoryLabel: "製程與工程",
    example: "Please check the crystal orientation of the silicon wafer before loading it.",
    exampleZh: "在裝載矽晶圓之前，請先檢查其晶體方向。",
    memory: "orient（東方、定向）+ -ation。除了工程上的「方向、定位」，職場上也常指 new-hire orientation（新進員工訓練）。"
  },
  {
    id: 7,
    word: "deformation",
    phonetic: "/ˌdiː.fɔːrˈmeɪ.ʃən/",
    pos: "n.",
    zh: "形變、變形",
    category: "engineering",
    categoryLabel: "製程與工程",
    example: "Thermal stress can lead to permanent mechanical deformation of the substrate.",
    exampleZh: "熱應力可能導致基板產生永久性的機械形變。",
    memory: "de-（破壞、偏離）+ form（形狀）+ -ation。常用搭配：plastic/elastic deformation（塑性／彈性形變）。"
  },
  {
    id: 8,
    word: "abnormality",
    phonetic: "/ˌæb.nɔːrˈmæl.ə.t̬i/",
    pos: "n.",
    zh: "異常、反常現象",
    category: "engineering",
    categoryLabel: "製程與工程",
    example: "The sensor immediately halted the machine when it detected a pressure abnormality.",
    exampleZh: "當感測器偵測到壓力異常時，立即停止了機台。",
    memory: "ab-（遠離）+ norm（標準、常態）+ -ality。工程縮寫常見 OOC/OOS abnormality（管制外異常）。"
  },
  {
    id: 9,
    word: "leakage",
    phonetic: "/ˈliː.kɪdʒ/",
    pos: "n.",
    zh: "洩漏、漏電流",
    category: "engineering",
    categoryLabel: "製程與工程",
    example: "Gate oxide thinning often results in high leakage current.",
    exampleZh: "閘極氧化層變薄通常會導致高漏電流。",
    memory: "leak（漏）+ -age（名詞字尾）。常用搭配：leakage current（漏電流）、gas leakage（氣體洩漏）。"
  },
  {
    id: 10,
    word: "parasitic",
    phonetic: "/ˌpær.əˈsɪt̬.ɪk/",
    pos: "adj.",
    zh: "寄生的",
    category: "engineering",
    categoryLabel: "製程與工程",
    example: "Engineers must minimize parasitic capacitance to boost high-frequency performance.",
    exampleZh: "工程師必須將寄生電容最小化，以提升高頻效能。",
    memory: "源自 parasite（寄生蟲）。在電子學中，parasitic capacitance/inductance 指「寄生電容／電感」。"
  },
  {
    id: 11,
    word: "dielectric",
    phonetic: "/ˌdaɪ.əˈlek.trɪk/",
    pos: "n. / adj.",
    zh: "介電質、介電解質",
    category: "engineering",
    categoryLabel: "製程與工程",
    example: "We are testing a new high-k dielectric material to replace silicon dioxide.",
    exampleZh: "我們正在測試一種新的高介電常數材料來取代二氧化矽。",
    memory: "dia-（穿過）+ electric（電的）。常用搭配：dielectric constant（介電常數）、dielectric breakdown（介電擊穿）。"
  },
  {
    id: 12,
    word: "synthesized",
    phonetic: "/ˈsɪn.θə.saɪzd/",
    pos: "adj. / v.",
    zh: "合成的",
    category: "engineering",
    categoryLabel: "製程與工程",
    example: "The lab successfully tested the newly synthesized polymer compound.",
    exampleZh: "實驗室成功測試了新合成的高分子化合物。",
    memory: "syn-（一起）+ thesis（放置）→ 放在一起合成。反義概念：analyze（分析、拆解）。"
  },
  {
    id: 13,
    word: "purity",
    phonetic: "/ˈpjʊr.ə.t̬i/",
    pos: "n.",
    zh: "純度、純淨",
    category: "engineering",
    categoryLabel: "製程與工程",
    example: "Semiconductor-grade silicon requires an extreme purity of 99.9999999%.",
    exampleZh: "半導體級的矽需要高達九個九的極致純度。",
    memory: "pure（純的）+ -ity（名詞字尾）。常用搭配：high purity（高純度）、chemical purity（化學純度）。"
  },
  {
    id: 14,
    word: "characterize",
    phonetic: "/ˈkær.ək.tɚ.aɪz/",
    pos: "v.",
    zh: "描述（特徵）、特性分析",
    category: "engineering",
    categoryLabel: "製程與工程",
    example: "We used an electron microscope to characterize the thin film's structure.",
    exampleZh: "我們使用電子顯微鏡來分析並描述該薄膜的結構特性。",
    memory: "character（特徵、性格）+ -ize（動詞化）。在研發中常指「材料／元件特性分析（characterization）」。"
  },
  {
    id: 15,
    word: "stimulus",
    phonetic: "/ˈstɪm.jə.ləs/",
    pos: "n.",
    zh: "刺激、激勵訊號",
    category: "engineering",
    categoryLabel: "製程與工程",
    example: "The sensor responds rapidly to any external thermal stimulus.",
    exampleZh: "該感測器對任何外部熱刺激都能快速反應。",
    memory: "複數形為 stimuli。在硬體測試中指輸入待測物的「激勵訊號」；經濟學中指 economic stimulus（經濟振興方案）。"
  },
  {
    id: 16,
    word: "Alignment",
    phonetic: "/əˈlaɪn.mənt/",
    pos: "n.",
    zh: "結盟、對準、校準",
    category: "engineering",
    categoryLabel: "製程與工程",
    example: "Precise optical alignment is essential during photolithography, and team alignment is equally vital.",
    exampleZh: "在微影製程中，精準的光學對準至關重要；此外，團隊達成共識（結盟）也同樣重要。",
    memory: "align（排成一線、對齊）+ -ment。工程上指「對位／校準」，商務上指「跨部門立場一致／結盟」。"
  },
  {
    id: 17,
    word: "component",
    phonetic: "/kəmˈpoʊ.nənt/",
    pos: "n.",
    zh: "成分、組件、零組件",
    category: "engineering",
    categoryLabel: "製程與工程",
    example: "A shortage of a single electronic component can delay the entire assembly line.",
    exampleZh: "單一電子零組件的短缺就可能延誤整條組裝線。",
    memory: "com-（一起）+ pon（放置）+ -ent → 組合在一起的零件。常用搭配：key component（關鍵組件）。"
  },
  {
    id: 18,
    word: "neutral",
    phonetic: "/ˈnuː.trəl/",
    pos: "adj.",
    zh: "中性的、中立的",
    category: "engineering",
    categoryLabel: "製程與工程",
    example: "When positive and negative charges balance out, the surface becomes electrically neutral.",
    exampleZh: "當正負電荷平衡時，表面就會變成電中性。",
    memory: "常用搭配：electrically neutral（電中性）、remain neutral（保持中立）、carbon neutral（碳中和）。"
  },
  {
    id: 19,
    word: "ionizer",
    phonetic: "/ˈaɪ.ə.naɪ.zɚ/",
    pos: "n.",
    zh: "離子產生器、靜電消除器",
    category: "engineering",
    categoryLabel: "製程與工程",
    example: "We installed an overhead ionizer to neutralize static charges in the cleanroom.",
    exampleZh: "我們在無塵室上方安裝了離子產生器，以中和靜電電荷。",
    memory: "ion（離子）+ -ize（產生）+ -er（機器）。無塵室防靜電（ESD）必備設備。"
  },
  {
    id: 20,
    word: "insulators",
    phonetic: "/ˈɪn.sə.leɪ.t̬ɚz/",
    pos: "n. (pl.)",
    zh: "絕緣體",
    category: "engineering",
    categoryLabel: "製程與工程",
    example: "Unlike conductors, insulators such as glass and ceramics retain static electricity easily.",
    exampleZh: "與導體不同，玻璃和陶瓷這類絕緣體很容易殘留靜電。",
    memory: "字根 insul（島嶼，如 peninsula 半島）→ 把電隔絕成孤島。反義詞：conductors（導體）、semiconductors（半導體）。"
  },
  {
    id: 21,
    word: "sensitive",
    phonetic: "/ˈsen.sə.t̬ɪv/",
    pos: "adj.",
    zh: "敏感的、易受損的",
    category: "engineering",
    categoryLabel: "製程與工程",
    example: "These microchips are extremely sensitive to electrostatic discharge (ESD).",
    exampleZh: "這些微晶片對靜電放電極度敏感。",
    memory: "sense（感覺）+ -itive。常用搭配：sensitive to + N.（對…敏感）、highly sensitive data（高度機密敏感資料）。"
  },

  // === 主題二：商務管理、法務與溝通分析 (Business & Operations) ===
  {
    id: 22,
    word: "ensure",
    phonetic: "/ɪnˈʃʊr/",
    pos: "v.",
    zh: "確保、保證",
    category: "business",
    categoryLabel: "商務與管理",
    example: "We must follow the checklist to ensure that all safety standards are met.",
    exampleZh: "我們必須遵循檢查表，以確保符合所有安全標準。",
    memory: "en-（使…）+ sure（確定的）。常用句型：ensure + that 子句 或 ensure + 名詞。"
  },
  {
    id: 23,
    word: "ensures",
    phonetic: "/ɪnˈʃʊrz/",
    pos: "v. (3rd sing.)",
    zh: "確保（第三人稱單數）",
    category: "business",
    categoryLabel: "商務與管理",
    example: "Strict quality control ensures that every product meets the client's standards.",
    exampleZh: "嚴格的品質管制能確保每件產品都符合客戶標準。",
    memory: "為 ensure 的第三人稱單數現在式變化（主詞為單數名詞或不可數名詞時使用）。"
  },
  {
    id: 24,
    word: "advisory",
    phonetic: "/ədˈvaɪ.zɚ.i/",
    pos: "adj. / n.",
    zh: "諮詢的；警示公告",
    category: "business",
    categoryLabel: "商務與管理",
    example: "The board set up an advisory committee to evaluate the technical risks.",
    exampleZh: "董事會成立了一個諮詢委員會來評估技術風險。",
    memory: "源自 advise（建議）。常用搭配：advisory role/service/board（諮詢角色／顧問服務／諮詢委員會）。"
  },
  {
    id: 25,
    word: "invoice",
    phonetic: "/ˈɪn.vɔɪs/",
    pos: "n. / v.",
    zh: "發票、請款單",
    category: "business",
    categoryLabel: "商務與管理",
    example: "Accounting will process the payment within 30 days of receiving the invoice.",
    exampleZh: "會計部門會在收到發票後的 30 天內處理付款。",
    memory: "注意商用 invoice 指 B2B 的「請款發票／出貨清單」，日常消費收據則用 receipt。"
  },
  {
    id: 26,
    word: "negotiated",
    phonetic: "/nəˈɡoʊ.ʃi.eɪ.t̬ɪd/",
    pos: "v. / adj.",
    zh: "協商、談判（過去式）",
    category: "business",
    categoryLabel: "商務與管理",
    example: "We successfully negotiated a 15% discount with our raw material supplier.",
    exampleZh: "我們成功與原料供應商協商到了 85 折的優惠。",
    memory: "名詞為 negotiation。常用搭配：negotiate a contract/price/agreement（協商合約／價格／協議）。"
  },
  {
    id: 27,
    word: "consultant",
    phonetic: "/kənˈsʌl.tənt/",
    pos: "n.",
    zh: "顧問",
    category: "business",
    categoryLabel: "商務與管理",
    example: "We hired an external consultant to optimize our supply chain workflow.",
    exampleZh: "我們聘請了一位外部顧問來優化我們的供應鏈流程。",
    memory: "consult（請教、諮詢）+ -ant（代表「人」的字尾，如 assistant 助理、accountant 會計師）。"
  },
  {
    id: 28,
    word: "agreement",
    phonetic: "/əˈɡriː.mənt/",
    pos: "n.",
    zh: "協定、合約、同意",
    category: "business",
    categoryLabel: "商務與管理",
    example: "Both parties signed a non-disclosure agreement (NDA) before sharing data.",
    exampleZh: "雙方在分享資料前簽署了保密協定。",
    memory: "agree（同意）+ -ment。常用搭配：reach an agreement（達成協議）、service level agreement (SLA)。"
  },
  {
    id: 29,
    word: "equivalent",
    phonetic: "/ɪˈkwɪv.ə.lənt/",
    pos: "adj. / n.",
    zh: "相等的、等效的；等同物",
    category: "business",
    categoryLabel: "商務與管理",
    example: "This domestic chemical is equivalent in quality to the imported one.",
    exampleZh: "這種國產化學品在品質上與進口品是相等的。",
    memory: "equi-（相等，如 equal）+ val（價值，如 value）+ -ent → 價值相等的。必背搭配：be equivalent to（等同於…）。"
  },
  {
    id: 30,
    word: "eliminate",
    phonetic: "/iˈlɪm.ə.neɪt/",
    pos: "v.",
    zh: "排除、消除、淘汰",
    category: "business",
    categoryLabel: "商務與管理",
    example: "Our goal is to eliminate all human errors through automation.",
    exampleZh: "我們的目標是透過自動化排除所有人為失誤。",
    memory: "e-（出）+ limin（門檻，如 limit）+ -ate → 趕出門檻外。常用搭配：eliminate root causes（排除根本原因）。"
  },
  {
    id: 31,
    word: "potential",
    phonetic: "/poʊˈten.ʃəl/",
    pos: "adj. / n.",
    zh: "潛在的；潛力、電位",
    category: "business",
    categoryLabel: "商務與管理",
    example: "We conducted a failure mode analysis to identify potential hazards.",
    exampleZh: "我們進行了失效模式分析，以找出潛在的危險。",
    memory: "字根 pot（力量）。除作「潛在的、潛力」，工程物理上作名詞也指 electric potential（電位、電勢）。"
  },
  {
    id: 32,
    word: "predictability",
    phonetic: "/prɪˌdɪk.təˈbɪl.ə.t̬i/",
    pos: "n.",
    zh: "可預測性",
    category: "business",
    categoryLabel: "商務與管理",
    example: "Standardizing the workflow greatly improves yield predictability.",
    exampleZh: "將工作流程標準化能大幅提升良率的可預測性。",
    memory: "pre-（預先）+ dict（說）+ -ability（能力）。"
  },
  {
    id: 33,
    word: "related",
    phonetic: "/rɪˈleɪ.t̬ɪd/",
    pos: "adj.",
    zh: "有關的、相關的",
    category: "business",
    categoryLabel: "商務與管理",
    example: "All quality-related issues must be reported to the supervisor immediately.",
    exampleZh: "所有與品質有關的問題都必須立即向主管報告。",
    memory: "源自 relate（使產生關聯）。常用搭配：be closely related to（與…密切相關）。"
  },
  {
    id: 34,
    word: "impact",
    phonetic: "/ˈɪm.pækt/",
    pos: "n. / v.",
    zh: "影響、衝擊",
    category: "business",
    categoryLabel: "商務與管理",
    example: "The power outage had a severe impact on our quarterly production.",
    exampleZh: "這次停電對我們的季度產量造成了嚴重影響。",
    memory: "名詞重音在第一音節 /ˈɪm.pækt/，動詞在第二音節 /ɪmˈpækt/。常用搭配：have a significant impact on（對…有重大影響）。"
  },
  {
    id: 35,
    word: "depend",
    phonetic: "/dɪˈpend/",
    pos: "v.",
    zh: "依賴、取決於",
    category: "business",
    categoryLabel: "商務與管理",
    example: "The final battery life will depend heavily on usage conditions.",
    exampleZh: "最終的電池壽命將高度取決於使用條件。",
    memory: "de-（向下）+ pend（懸掛）→ 掛在某物下面，引申為依賴。必背搭配：depend on / upon（依賴、視…而定）。"
  },
  {
    id: 36,
    word: "fundamentals",
    phonetic: "/ˌfʌn.dəˈmen.təlz/",
    pos: "n. (pl.)",
    zh: "基本面、基本原理、基礎",
    category: "business",
    categoryLabel: "商務與管理",
    example: "Before learning advanced chip design, you must master the fundamentals of physics.",
    exampleZh: "在學習進階晶片設計前，你必須精通物理學的基本原理。",
    memory: "fund（底部、基礎，如 foundation）+ -amental。財經上常指公司或市場的「基本面」。"
  },
  {
    id: 37,
    word: "necessary",
    phonetic: "/ˈnes.ə.ser.i/",
    pos: "adj.",
    zh: "必要的、必需的",
    category: "business",
    categoryLabel: "商務與管理",
    example: "Please take all necessary precautions before entering the chemical lab.",
    exampleZh: "在進入化學實驗室前，請採取所有必要的預防措施。",
    memory: "拼字口訣：一件襯衫有一個領子（1個 c）、兩隻袖子（2個 s）→ ne-c-e-ss-ary。"
  },
  {
    id: 38,
    word: "retention",
    phonetic: "/rɪˈten.ʃən/",
    pos: "n.",
    zh: "保留、留任；資料保存力",
    category: "business",
    categoryLabel: "商務與管理",
    example: "Competitive salaries and good mentorship are key to employee retention.",
    exampleZh: "具競爭力的薪資與良好的導師制度是員工留任的關鍵。",
    memory: "動詞為 retain（保留）。HR 領域指 talent retention（人才留任）；半導體記憶體指 data retention（資料保存力）。"
  },
  {
    id: 39,
    word: "risky",
    phonetic: "/ˈrɪs.ki/",
    pos: "adj.",
    zh: "有風險的、冒險的",
    category: "business",
    categoryLabel: "商務與管理",
    example: "Relying on a single vendor for critical parts is extremely risky.",
    exampleZh: "關鍵零件只依賴單一供應商是非常有風險的。",
    memory: "risk（風險）+ -y（形容詞字尾）。"
  },
  {
    id: 40,
    word: "conference",
    phonetic: "/ˈkɑːn.fɚ.əns/",
    pos: "n.",
    zh: "會議、研討會",
    category: "business",
    categoryLabel: "商務與管理",
    example: "Our team will present a technical paper at the international conference next month.",
    exampleZh: "我們團隊下個月將在國際研討會上發表一篇技術論文。",
    memory: "con-（一起）+ fer（帶來）→ 把大家聚在一起討論。常用搭配：conference call（電話會議）、press conference（記者會）。"
  },
  {
    id: 41,
    word: "obtain",
    phonetic: "/əbˈteɪn/",
    pos: "v.",
    zh: "獲得、取得",
    category: "business",
    categoryLabel: "商務與管理",
    example: "You need to obtain written approval from the director before ordering the tool.",
    exampleZh: "在訂購該機台前，你需要獲得處長的書面核准。",
    memory: "字根 tain（拿、持，如 contain, maintain）。較 get 正式，常用搭配：obtain permission/data/results。"
  },
  {
    id: 42,
    word: "distribute",
    phonetic: "/dɪˈstrɪb.juːt/",
    pos: "v.",
    zh: "散佈、分配、分發",
    category: "business",
    categoryLabel: "商務與管理",
    example: "The system is designed to distribute the workload evenly across all servers.",
    exampleZh: "該系統旨在將工作負載平均分配到所有伺服器上。",
    memory: "dis-（分開）+ tribute（給予，如 contribute 貢獻）。名詞為 distribution（分佈、配銷）。"
  },
  {
    id: 43,
    word: "establish",
    phonetic: "/ɪˈstæb.lɪʃ/",
    pos: "v.",
    zh: "建立、設立、確立",
    category: "business",
    categoryLabel: "商務與管理",
    example: "We need to establish a clear communication channel with the overseas factory.",
    exampleZh: "我們需要與海外工廠建立明確的溝通管道。",
    memory: "字根 stabl（穩定，如 stable）→ 使穩固站立，即「建立」。常用搭配：establish a baseline/standard（建立基準線／標準）。"
  },
  {
    id: 44,
    word: "comment",
    phonetic: "/ˈkɑː.ment/",
    pos: "n. / v.",
    zh: "評論、意見、註解",
    category: "business",
    categoryLabel: "商務與管理",
    example: "The reviewer left a helpful comment on my technical report.",
    exampleZh: "審稿人在我的技術報告上留下了一則很有幫助的評論。",
    memory: "常用搭配：comment on + N.（對…發表評論）、leave a comment（留言）。"
  },
  {
    id: 45,
    word: "purpose",
    phonetic: "/ˈpɜː.pəs/",
    pos: "n.",
    zh: "目的、意圖",
    category: "business",
    categoryLabel: "商務與管理",
    example: "The main purpose of this audit is to verify our safety compliance.",
    exampleZh: "這次稽核的主要目的是驗證我們的安全合規性。",
    memory: "重要片語：on purpose（故意地，反義為 by accident）、for the purpose of（為了…的目的）。"
  },

  // === 主題三：教育培訓、研發成長與活動 (Education, Career & Events) ===
  {
    id: 46,
    word: "curriculum",
    phonetic: "/kəˈrɪk.jə.ləm/",
    pos: "n.",
    zh: "課程、課綱",
    category: "career",
    categoryLabel: "培訓與職涯",
    example: "The company designed a new training curriculum for junior engineers.",
    exampleZh: "公司為初階工程師設計了一套新的培訓課程。",
    memory: "字根 curr（跑）→ 跑完的學習跑道，即學程。常見履歷縮寫 CV (Curriculum Vitae) 即源於此字。"
  },
  {
    id: 47,
    word: "enhanced",
    phonetic: "/ɪnˈhænst/",
    pos: "adj. / v.",
    zh: "增強型的、提升的",
    category: "career",
    categoryLabel: "培訓與職涯",
    example: "The latest software update features enhanced security and faster processing.",
    exampleZh: "最新的軟體更新具備增強型安全性與更快的處理速度。",
    memory: "源自動詞 enhance（提高、強化）。常用搭配：enhanced performance/version（增強型效能／強化版）。"
  },
  {
    id: 48,
    word: "acquisition",
    phonetic: "/ˌæk.wəˈzɪʃ.ən/",
    pos: "n.",
    zh: "獲得、習得；併購；資料擷取",
    category: "career",
    categoryLabel: "培訓與職涯",
    example: "Skill acquisition takes time, and high-speed data acquisition (DAQ) is vital in the lab.",
    exampleZh: "技能習得需要時間，而在實驗室中，高速資料擷取（DAQ）也同樣關鍵。",
    memory: "動詞為 acquire（取得）。三大常見情境：mergers and acquisitions (M&A)（企業併購）、data acquisition（資料擷取）、skill acquisition（技能習得）。"
  },
  {
    id: 49,
    word: "mentor",
    phonetic: "/ˈmen.tɔːr/",
    pos: "n. / v.",
    zh: "導師、良師益友",
    category: "career",
    categoryLabel: "培訓與職涯",
    example: "My senior mentor guided me patiently through my first tape-out project.",
    exampleZh: "我的資深導師耐心地指導我完成人生第一個晶片設計定案專案。",
    memory: "指導的老師稱為 mentor，受指導的學員／徒弟稱為 mentee，導師制度為 mentorship。"
  },
  {
    id: 50,
    word: "archive",
    phonetic: "/ˈɑːr.kaɪv/",
    pos: "n. / v.",
    zh: "檔案、檔案庫；封存歸檔",
    category: "career",
    categoryLabel: "培訓與職涯",
    example: "Please archive the completed project files so we can reference them in the future.",
    exampleZh: "請將已完成的專案檔案歸檔封存，以便我們未來查閱。",
    memory: "注意發音 ch 發 /k/ 的音（唸作 AR-kaiv）。常用於電腦資料歸檔與歷史檔案庫。"
  },
  {
    id: 51,
    word: "exhibition",
    phonetic: "/ˌek.səˈbɪʃ.ən/",
    pos: "n.",
    zh: "展覽、展示會",
    category: "career",
    categoryLabel: "培訓與職涯",
    example: "We will showcase our latest optical sensors at the annual trade exhibition.",
    exampleZh: "我們將在年度商業展覽會上展示我們最新的光學感測器。",
    memory: "動詞為 exhibit（展示，ex- 出來 + hibit 拿）。注意名詞發音中 h 不發音，重音在 -bi-。"
  },
  {
    id: 52,
    word: "passionate",
    phonetic: "/ˈpæʃ.ən.ət/",
    pos: "adj.",
    zh: "熱情的、熱愛的",
    category: "career",
    categoryLabel: "培訓與職涯",
    example: "She is deeply passionate about developing sustainable semiconductor solutions.",
    exampleZh: "她對開發永續半導體解決方案充滿熱情。",
    memory: "passion（熱情）+ -ate。必背搭配：be passionate about + N./V-ing（對…充滿熱情）。"
  },
  {
    id: 53,
    word: "posture",
    phonetic: "/ˈpɑːs.tʃɚ/",
    pos: "n.",
    zh: "姿勢、儀態；態勢",
    category: "career",
    categoryLabel: "培訓與職涯",
    example: "Maintaining a good sitting posture prevents back pain during long coding sessions.",
    exampleZh: "在長時間寫程式時保持良好的坐姿可以預防背痛。",
    memory: "字根 pos（放置、擺放，如 position, pose）→ 身體擺放的樣子。資安領域也常說 security posture（資安防護態勢）。"
  },
  {
    id: 54,
    word: "launch",
    phonetic: "/lɔːntʃ/",
    pos: "v. / n.",
    zh: "發射；推出（新產品）、發起",
    category: "career",
    categoryLabel: "培訓與職涯",
    example: "The company plans to launch its next-generation processor in the fourth quarter.",
    exampleZh: "公司計畫在第四季推出下一代處理器。",
    memory: "發音注意與 lunch /lʌntʃ/（午餐）區分。常用搭配：product launch（產品發表）、launch a campaign（發起活動）。"
  },
  {
    id: 55,
    word: "misery",
    phonetic: "/ˈmɪz.ɚ.i/",
    pos: "n.",
    zh: "苦難、痛苦、悲慘境遇",
    category: "career",
    categoryLabel: "培訓與職涯",
    example: "Debugging legacy code without documentation was pure misery.",
    exampleZh: "在沒有技術文件的情況下除錯舊程式碼，簡直是純粹的折磨與苦難。",
    memory: "形容詞為 miserable（悲慘的、痛苦的）。名言：Misery loves company.（同病相憐）。"
  },
  {
    id: 56,
    word: "sacrifice",
    phonetic: "/ˈsæk.rə.faɪs/",
    pos: "v. / n.",
    zh: "犧牲、奉獻",
    category: "career",
    categoryLabel: "培訓與職涯",
    example: "We must never sacrifice long-term product reliability for short-term cost savings.",
    exampleZh: "我們絕不能為了短期的成本節省而犧牲長期的產品可靠度。",
    memory: "字根 sacr（神聖的，如 sacred）→ 獻給神明的祭品，引申為「犧牲」。"
  },

  // === 主題四：高頻口語與職場片語 (Idioms & Phrasal Verbs) ===
  {
    id: 57,
    word: "fed up",
    phonetic: "/ˌfed ˈʌp/",
    pos: "phr. (adj.)",
    zh: "受夠了、厭煩透頂",
    category: "idiom",
    categoryLabel: "口語與片語",
    example: "The engineers are fed up with the constant last-minute specification changes.",
    exampleZh: "工程師們已經受夠了總是臨時更改規格。",
    memory: "feed（餵食）的過去分詞 fed + up（滿到喉嚨）→ 被餵到吐了，引申為「受夠了」。必搭介系詞：be fed up with + N.。"
  },
  {
    id: 58,
    word: "pays off",
    phonetic: "/peɪz ɔːf/",
    pos: "phr. (v.)",
    zh: "有回報、值得、奏效",
    category: "idiom",
    categoryLabel: "口語與片語",
    example: "All that hard work in the lab finally pays off when the chip passes validation.",
    exampleZh: "當晶片通過驗證時，所有在實驗室的辛勤努力終於有了回報。",
    memory: "原型為 pay off。主詞常為 hard work / effort / investment / patience。例：Hard work always pays off."
  },
  {
    id: 59,
    word: "screwed up",
    phonetic: "/skruːd ʌp/",
    pos: "phr. (v.)",
    zh: "搞砸了、出大包",
    category: "idiom",
    categoryLabel: "口語與片語",
    example: "I really screwed up the calibration settings, so we have to run the test again.",
    exampleZh: "我把校準設定徹底搞砸了，所以我們必須重新跑一次測試。",
    memory: "原型為 screw up。口語中高頻認錯說法：My bad, I screwed up. 正式場合可改用 messed up 或 made a serious error。"
  }
];

// 閱讀測驗資料
const READING_DATA = {
  title: "From Process Crisis to Triumph（從製程危機到完美逆轉）",
  paragraphs: [
    {
      en: "Before the global tech **exhibition** and product **launch**, our team was in pure **misery**. Someone had **screwed up** the standard **procedure**, causing an **abnormality** on the production line. During **optical** inspection, we found **excessive** current **leakage**, **parasitic** effects, and a tiny **scratch** with mechanical **deformation** on a **sensitive** **component**. Because **insulators** and the newly **synthesized** **dielectric** layer lacked electrical balance, static charges built up. We were **fed up** with these **risky** delays!",
      zh: "在全球科技展覽與新產品發表之前，我們團隊陷入了純粹的苦難。有人把標準作業程序搞砸了，導致產線出現異常。在光學檢測期間，我們在一個敏感的零組件上發現了過大的漏電流、寄生電容效應，以及伴隨機械形變的微小刮痕。因為絕緣體與新合成的介電質層缺乏電荷平衡，導致靜電累積。我們真的受夠了這些高風險的延誤！"
    },
    {
      en: "To **eliminate** **potential** failures and **ensure** batch **traceability**, we hired an external **consultant** in an **advisory** role. After we **negotiated** a service **agreement** and processed the **invoice**, she helped us **characterize** the material **purity** and crystal **orientation**. She pointed out that yield **predictability** **depends** on **fundamentals**: we needed an overhead **ionizer** to keep the surface **neutral** and precise **alignment** before applying any electrical **stimulus**. It was **necessary** to **obtain** **equivalent** backup parts and **establish** a strict **archive** for data **acquisition**.",
      zh: "為了排除潛在的失效風險並確保批次可追溯性，我們聘請了一位外部顧問擔任諮詢角色。在我們協商好服務協定並處理完請款發票後，她協助我們分析並描述材料純度與晶體方向的特性。她指出，良率的可預測性取決於基本功：在施加任何電氣激勵訊號之前，我們需要上方離子產生器來維持表面電中性，並確保精準的對準。此外，取得等效的備用零件，並為資料擷取建立嚴格的歸檔檔案庫也是必要的。"
    },
    {
      en: "Meanwhile, my **passionate** **mentor** designed an **enhanced** training **curriculum** to boost skill **retention** and **distribute** knowledge before the annual **conference**. Having a clear checklist **ensures** zero mistakes. Even correcting our sitting **posture** and leaving a constructive **comment** had a positive **impact** on **related** workflows. Every **sacrifice** finally **pays off** when you work with a clear **purpose**!",
      zh: "同時，我那充滿熱情的導師設計了一套增強型培訓課程，在年度研討會前提升技能留存率並分發專業知識。擁有一份明確的檢查表能確保零失誤。就連矯正我們的坐姿以及留下具建設性的評論，都對相關工作流程產生了正面的影響。當你帶著明確的目的工作時，每一分犧牲最終都會有回報！"
    }
  ],
  questions: [
    {
      id: "rq1",
      q: "1. What was the primary technical cause of the static charge buildup on the component?",
      options: [
        "(A) The external consultant forgot to process the invoice on time.",
        "(B) The insulators and the newly synthesized dielectric layer lacked electrical balance, requiring an ionizer to keep the surface neutral.",
        "(C) The team used an equivalent backup part with the wrong sitting posture.",
        "(D) The optical inspection machine was broken during the exhibition."
      ],
      answer: 1,
      explanation: "第一段提到「Because insulators and the newly synthesized dielectric layer lacked electrical balance, static charges built up.」，第二段顧問指出需安裝 ionizer（離子產生器）讓表面保持 neutral（電中性）。"
    },
    {
      id: "rq2",
      q: "2. According to the consultant, what does yield predictability heavily depend on?",
      options: [
        "(A) Sacrificing product purity to save short-term costs.",
        "(B) Mastering the fundamentals, such as using an ionizer for a neutral surface and ensuring precise alignment before applying a stimulus.",
        "(C) Eliminating all training curriculums and archives before the conference.",
        "(D) Negotiating a riskier agreement with the supplier."
      ],
      answer: 1,
      explanation: "第二段指出「yield predictability depends on fundamentals: we needed an overhead ionizer to keep the surface neutral and precise alignment before applying any electrical stimulus.」"
    },
    {
      id: "rq3",
      q: "3. How did the team's attitude change from the beginning to the end of the passage?",
      options: [
        "(A) They went from feeling passionate to being fed up and miserable.",
        "(B) They remained neutral and indifferent throughout the entire product launch.",
        "(C) They went from being in misery and fed up with risky delays to realizing that every sacrifice pays off when working with a clear purpose.",
        "(D) They decided to screw up the procedure on purpose to delay the exhibition."
      ],
      answer: 2,
      explanation: "文章開頭團隊處於 misery（苦難）且對延誤感到 fed up（受夠了），但經過顧問與導師協助後，最後體認到每一分 sacrifice（犧牲）在有明確 purpose（目的）時最終都會 pays off（有回報）。"
    }
  ]
};

// 聽力與口說訓練腳本資料
const DIALOGUE_DATA = [
  {
    speaker: "Jamie",
    role: "Junior Engineer",
    en: "Alex, I’m so fed up! I think I screwed up the test run. The optical sensor showed an abnormality—there’s a micro-scratch, slight deformation, and excessive leakage current on the wafer. This whole week has been pure misery!",
    zh: "Alex，我真的受夠了！我想我把測試搞砸了。光學感測器顯示出異常——晶圓上有一道微刮痕、輕微形變，還有過大的漏電流。這整週簡直是純粹的苦難！",
    pitch: 1.08
  },
  {
    speaker: "Alex",
    role: "Senior Mentor",
    en: "Take a deep breath and check your posture, Jamie—don't slouch! As your mentor, my purpose is to help you master the fundamentals. Let’s not sacrifice our confidence. Tell me, did you follow the standard procedure?",
    zh: "深呼吸，注意你的坐姿，Jamie——別駝背！身為你的導師，我的目的是幫你掌握基本功。別犧牲了我們的信心。告訴我，你有遵守標準作業程序嗎？",
    pitch: 0.92
  },
  {
    speaker: "Jamie",
    role: "Junior Engineer",
    en: "Yes, I checked the crystal orientation and the purity of the synthesized dielectric. However, because these insulators are super sensitive, parasitic capacitance still occurred when I applied the voltage stimulus.",
    zh: "有，我檢查了晶向以及合成介電質的純度。不過，因為這些絕緣體非常敏感，當我施加電壓激勵訊號時，還是發生了寄生電容效應。",
    pitch: 1.08
  },
  {
    speaker: "Alex",
    role: "Senior Mentor",
    en: "Ah, that’s related to static charge! Our external consultant left a comment about this in her advisory report. To eliminate potential ESD damage and ensure predictability, it is necessary to turn on the ionizer so the surface stays neutral before wafer alignment.",
    zh: "啊，那跟靜電電荷有關！我們的外部顧問在她的諮詢報告中有針對這點留下評論。為了排除潛在的靜電放電損傷並確保可預測性，在晶圓對準前，必須打開離子產生器讓表面保持電中性。",
    pitch: 0.92
  },
  {
    speaker: "Jamie",
    role: "Junior Engineer",
    en: "That makes total sense! Also, did we obtain the agreement and invoice for the equivalent backup component we negotiated last week?",
    zh: "太有道理了！另外，我們上週協商的那批等效備用零組件，已經拿到合約和發票了嗎？",
    pitch: 1.08
  },
  {
    speaker: "Alex",
    role: "Senior Mentor",
    en: "Yes! It ensures full traceability, so it’s no longer risky. I’ll archive the data acquisition files today and distribute our enhanced training curriculum before the conference and exhibition. Stay passionate—your hard work always pays off when we establish good habits and depend on each other before the big launch!",
    zh: "拿到了！這確保了完整的可追溯性，所以不再有風險了。我今天會把資料擷取檔案封存歸檔，並在研討會和展覽前分發我們強化版的培訓課程。保持熱情——只要我們在大發表前建立好習慣並互相依靠，你的努力總會有回報的！",
    pitch: 0.92
  }
];

const DICTATION_ITEMS = [
  {
    id: "d1",
    audioText: "I think I screwed up the test run. The optical sensor showed an abnormality.",
    before: "I think I",
    middle1: "the test run. The",
    middle2: "sensor showed an",
    after: ".",
    blanks: [
      { answer: "screwed up", hint: "搞砸了 (2字片語)" },
      { answer: "optical", hint: "光學的 (o開頭)" },
      { answer: "abnormality", hint: "異常 (a開頭)" }
    ]
  },
  {
    id: "d2",
    audioText: "To eliminate potential ESD damage and ensure predictability, it is necessary to turn on the ionizer so the surface stays neutral.",
    before: "To",
    middle1: "potential ESD damage and ensure predictability, it is necessary to turn on the",
    middle2: "so the surface stays",
    after: ".",
    blanks: [
      { answer: "eliminate", hint: "排除 (e開頭)" },
      { answer: "ionizer", hint: "離子產生器 (i開頭)" },
      { answer: "neutral", hint: "中性的 (n開頭)" }
    ]
  },
  {
    id: "d3",
    audioText: "Stay passionate—your hard work always pays off when we establish good habits!",
    before: "Stay",
    middle1: "—your hard work always",
    middle2: "when we",
    after: "good habits!",
    blanks: [
      { answer: "passionate", hint: "熱情的 (p開頭)" },
      { answer: "pays off", hint: "有回報 (2字片語)" },
      { answer: "establish", hint: "建立 (e開頭)" }
    ]
  }
];

// 綜合測驗題庫 (支援第一輪標準考卷 + 隨機動態抽題)
const QUIZ_BANK = {
  multipleChoice: [
    {
      q: "Because glass and ceramic materials do not conduct electricity easily, they are classified as __________, which require an ionizer to remove surface static charges.",
      options: ["consultants", "insulators", "curriculums", "exhibitions"],
      answer: "insulators",
      wordId: 20,
      explanation: "因為玻璃與陶瓷材料不易導電，它們被歸類為「絕緣體（insulators）」，需要離子產生器來移除表面靜電。"
    },
    {
      q: "Before we can pay the vendor for the newly delivered optical components, the accounting department needs to receive the official __________.",
      options: ["invoice", "posture", "misery", "stimulus"],
      answer: "invoice",
      wordId: 25,
      explanation: "會計部門付款給供應商前需要收到正式的「請款發票（invoice）」。"
    },
    {
      q: "After months of working overtime and debugging the circuit, the team's hard work finally __________ when the chip passed all qualification tests on the first try.",
      options: ["screwed up", "fed up", "pays off", "depended on"],
      answer: "pays off",
      wordId: 58,
      explanation: "主詞為 hard work（辛勤努力），當晶片通過驗證時，努力終於「有了回報（pays off / paid off）」。"
    },
    {
      q: "In semiconductor manufacturing, full batch __________ allows engineers to track the exact origin, purity, and processing history of every single wafer.",
      options: ["deformation", "traceability", "leakage", "orientation"],
      answer: "traceability",
      wordId: 1,
      explanation: "能夠追蹤每一片晶圓的確切來源、純度與製程歷史，稱為批次「可追溯性（traceability）」。"
    },
    {
      q: "The R&D director refused to __________ long-term product reliability just to meet an aggressive launch deadline.",
      options: ["characterize", "distribute", "synthesize", "sacrifice"],
      answer: "sacrifice",
      wordId: 56,
      explanation: "研發處長拒絕為了趕上緊迫的發表期限而「犧牲（sacrifice）」長期的產品可靠度。"
    }
  ],
  fillInBlank: [
    {
      sentence: "Thermal stress during packaging caused severe mechanical __________ of the thin substrate.",
      prefix: "d",
      zhHint: "形變",
      answer: "deformation",
      wordId: 7,
      explanation: "mechanical deformation 為「機械形變」。"
    },
    {
      sentence: "In high-frequency IC design, engineers work hard to minimize __________ capacitance between adjacent metal lines.",
      prefix: "p",
      zhHint: "寄生的",
      answer: "parasitic",
      wordId: 10,
      explanation: "parasitic capacitance 指「寄生電容」。"
    },
    {
      sentence: "The two companies __________ for three weeks before finally signing the mutual non-disclosure agreement.",
      prefix: "n",
      zhHint: "協商 (過去式)",
      answer: "negotiated",
      wordId: 26,
      explanation: "協商了三週，使用過去式 negotiated。"
    },
    {
      sentence: "Our senior mentor helped the HR team __________ a practical training program to improve employee retention.",
      prefix: "e",
      zhHint: "建立",
      answer: "establish",
      wordId: 43,
      explanation: "establish a training program 指「建立培訓計畫」。"
    },
    {
      sentence: "Even a microscopic __________ or excessive particle contamination can ruin a sensitive optical lens.",
      prefix: "s",
      zhHint: "刮痕",
      answer: "scratch",
      wordId: 3,
      explanation: "microscopic scratch 指「微米級刮痕」。"
    }
  ],
  sentenceMaking: [
    {
      id: "sm1",
      tag: "工程品管情境",
      promptZh: "為了確保 (ensure) 產品品質，我們必須遵循標準程序 (procedure) 來排除 (eliminate) 任何潛在的 (potential) 異常 (abnormality)。",
      requiredWords: ["ensure", "procedure", "eliminate", "potential", "abnormality"],
      sampleAnswer: "To ensure product quality, we must follow the standard procedure to eliminate any potential abnormality.",
      explanation: "句首用 To ensure... 表目的；follow the standard procedure 為固定搭配；eliminate any potential abnormality 表排除任何潛在異常。"
    },
    {
      id: "sm2",
      tag: "職場溝通情境",
      promptZh: "我已經受夠了 (fed up) 這種高風險的 (risky) 作法；在推出 (launch) 新產品之前，跨部門達成共識／對齊目標 (alignment) 是必要的 (necessary)。",
      requiredWords: ["fed up", "risky", "launch", "alignment", "necessary"],
      sampleAnswer: "I am fed up with this risky approach; before we launch the new product, achieving cross-functional alignment is necessary.",
      explanation: "注意 fed up 為形容詞片語，須搭配 be fed up with + N.；launch the new product 表推出新產品。"
    }
  ]
};

