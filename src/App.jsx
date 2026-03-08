import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Building2, FileText, CheckCircle2, Loader2, Send,
  Download, AlertCircle, BadgeDollarSign, ChevronDown, ChevronUp,
  User, Mail, Hash, Globe, StickyNote, Sparkles, ReceiptText, CircleCheck
} from 'lucide-react';

// ── API CONFIG ────────────────────────────────────────────────────────────────
const GAS_URL = import.meta.env.VITE_GAS_URL;

// ── MOCK AGENCY DATABASE ──────────────────────────────────────────────────────
const agencyDB = {
  '24567891': { companyTitle: '晨曜媒體代理股份有限公司', email: 'sales@morningads.tw' },
  '50882173': { companyTitle: '北星整合行銷有限公司',     email: 'contact@northstar.tw' },
  '97431256': { companyTitle: '橙海數位廣告有限公司',     email: 'service@orangewave.tw' },
  '80652314': { companyTitle: '宇光品牌顧問股份有限公司', email: 'hello@starlightbrand.com' },
};

// ── SERVICE LIBRARY ───────────────────────────────────────────────────────────
const serviceLibrary = [
  {
    category: 'Meta / 社群廣告',
    items: [
      { name: 'Meta 廣告投放',  spec: 'FB / IG 廣告帳戶操作與優化',    unitPrice: 12000, unit: '案' },
      { name: '廣告素材企劃',   spec: '單月圖文與文案規劃',              unitPrice: 8000,  unit: '份' },
      { name: '再行銷設定',     spec: '像素、轉換事件與受眾設定',        unitPrice: 5000,  unit: '次' },
    ],
  },
  {
    category: '內容製作',
    items: [
      { name: '品牌圖文設計',       spec: '社群貼文主視覺設計',              unitPrice: 2500,  unit: '則' },
      { name: '短影音腳本',         spec: 'Reels / Shorts 腳本企劃',         unitPrice: 4500,  unit: '支' },
      { name: 'Landing Page 文案',  spec: '單頁式活動頁文案撰寫',            unitPrice: 9000,  unit: '頁' },
    ],
  },
  {
    category: '網站與數據',
    items: [
      { name: 'GA4 / GTM 追蹤建置', spec: 'GA4、GTM 與事件追蹤設定',         unitPrice: 10000, unit: '案' },
      { name: 'SEO 優化建議',       spec: '頁面結構與關鍵字優化',             unitPrice: 15000, unit: '案' },
      { name: '成效報表整理',       spec: '月報、投放成效與分析建議',         unitPrice: 6000,  unit: '月' },
    ],
  },
  {
    category: '品牌策略',
    items: [
      { name: '品牌定位工作坊', spec: '品牌核心價值與受眾梳理',          unitPrice: 30000, unit: '場' },
      { name: '年度行銷規劃',   spec: '年度活動節奏與投放建議',          unitPrice: 40000, unit: '份' },
    ],
  },
];

// ── HELPERS ───────────────────────────────────────────────────────────────────
const currency = (n) =>
  new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', maximumFractionDigits: 0 }).format(n);

const today = () => new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' });

// ── EXCEL (SpreadsheetML) GENERATOR ──────────────────────────────────────────
function buildExcel(form, chosenDetails, subtotal, tax, total) {
  const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const cell = (v, type = 'String', style = '') =>
    `<Cell${style ? ` ss:StyleID="${style}"` : ''}><Data ss:Type="${type}">${esc(v)}</Data></Cell>`;
  const num  = (v, style = '') => cell(v, 'Number', style);
  const str  = (v, style = '') => cell(v, 'String', style);
  const empty = (n = 1) => `<Cell ss:Index="${n}"/>`;

  // Fill up to 8 rows of service items
  const itemRows = [...chosenDetails.slice(0, 8)];
  while (itemRows.length < 8) itemRows.push(null);

  const rows = [
    // ── 第 1 行：標題 ──
    `<Row ss:Height="36">
      <Cell ss:MergeAcross="6" ss:StyleID="title"><Data ss:Type="String">代理商報價單</Data></Cell>
    </Row>`,
    `<Row ss:Height="8"/>`, // spacer row 2
    `<Row ss:Height="14">
      <Cell ss:MergeAcross="1" ss:StyleID="sectionHead"><Data ss:Type="String">代理商資訊</Data></Cell>
      <Cell/>
      ${str('', 'sectionHead')}<Cell ss:MergeAcross="2" ss:StyleID="sectionHead"><Data ss:Type="String">甲方資訊</Data></Cell>
    </Row>`,
    // ── B4 公司抬頭 / D4 甲方客戶名稱 ──
    `<Row ss:Height="22">
      ${str('公司抬頭', 'label')}${str(form.companyTitle, 'value')}${str('')}${str('甲方客戶名稱', 'label')}${str(form.endClientName, 'value')}
    </Row>`,
    // ── B5 窗口姓名 / D5 甲方網址 ──
    `<Row ss:Height="22">
      ${str('窗口姓名', 'label')}${str(form.clientName, 'value')}${str('')}${str('甲方網址', 'label')}${str(form.endClientUrl, 'value')}
    </Row>`,
    // ── B6 email / D6 電話 ──
    `<Row ss:Height="22">
      ${str('電子郵件', 'label')}${str(form.email, 'value')}${str('')}${str('公司電話', 'label')}${str('02-77522532 #105/#108', 'value')}
    </Row>`,
    // ── B7 統編 / D7 報價日期 ──
    `<Row ss:Height="22">
      ${str('統一編號', 'label')}${str(form.taxId, 'value')}${str('')}${str('報價日期', 'label')}${str(today(), 'value')}
    </Row>`,
    `<Row ss:Height="8"/>`, // spacer row 8
    `<Row ss:Height="8"/>`, // spacer row 9
    // ── A10:G10 表頭 ──
    `<Row ss:Height="22">
      ${str('服務項目', 'colHead')}${str('規格說明', 'colHead')}${str('數量', 'colHead')}${str('單價', 'colHead')}${str('單位', 'colHead')}${str('', 'colHead')}${str('小計', 'colHead')}
    </Row>`,
    // ── A11:G18 明細 (8 rows) ──
    ...itemRows.map((item) =>
      item
        ? `<Row ss:Height="20">
            ${str(item.name, 'item')}${str(item.spec, 'item')}${num(item.qty, 'itemNum')}${num(item.unitPrice, 'itemNum')}${str(item.unit, 'item')}${num(1, 'itemNum')}${num(item.subtotal, 'money')}
           </Row>`
        : `<Row ss:Height="20">
            ${str('')}${str('')}${str('')}${str('')}${str('')}${str('')}${str('')}
           </Row>`
    ),
    // ── G18 合計 ──
    `<Row ss:Height="22">
      ${empty(6)}${str('合計', 'totalLabel')}
    </Row>`,
    `<Row ss:Height="22">
      <Cell ss:Index="5" ss:MergeAcross="1" ss:StyleID="totalLabel"><Data ss:Type="String">未稅合計</Data></Cell>${num(subtotal, 'money')}
    </Row>`,
    // ── G19 稅金 ──
    `<Row ss:Height="22">
      <Cell ss:Index="5" ss:MergeAcross="1" ss:StyleID="totalLabel"><Data ss:Type="String">稅金 (5%)</Data></Cell>${num(tax, 'money')}
    </Row>`,
    // ── G20 總計 ──
    `<Row ss:Height="24">
      <Cell ss:Index="5" ss:MergeAcross="1" ss:StyleID="grandLabel"><Data ss:Type="String">總計含稅</Data></Cell>${num(total, 'grand')}
    </Row>`,
    // ── 備註 ──
    ...(form.otherNote
      ? [
          `<Row ss:Height="8"/>`,
          `<Row ss:Height="22">
            ${str('備註', 'label')}
            <Cell ss:MergeAcross="5" ss:StyleID="value"><Data ss:Type="String">${esc(form.otherNote)}</Data></Cell>
          </Row>`,
        ]
      : []),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
          xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
          xmlns:x="urn:schemas-microsoft-com:office:excel">
  <Styles>
    <Style ss:ID="title">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Font ss:Bold="1" ss:Size="16" ss:Color="#C2185B"/>
      <Interior ss:Color="#FCE4EC" ss:Pattern="Solid"/>
      <Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#F06292"/></Borders>
    </Style>
    <Style ss:ID="sectionHead">
      <Font ss:Bold="1" ss:Size="11" ss:Color="#FFFFFF"/>
      <Interior ss:Color="#E91E8C" ss:Pattern="Solid"/>
      <Alignment ss:Horizontal="Center"/>
    </Style>
    <Style ss:ID="label">
      <Font ss:Bold="1" ss:Size="10" ss:Color="#880E4F"/>
      <Interior ss:Color="#FCE4EC" ss:Pattern="Solid"/>
      <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
      <Borders><Border ss:Position="All" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#F48FB1"/></Borders>
    </Style>
    <Style ss:ID="value">
      <Font ss:Size="10"/>
      <Interior ss:Color="#FFFFFF" ss:Pattern="Solid"/>
      <Alignment ss:Vertical="Center"/>
      <Borders><Border ss:Position="All" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#F48FB1"/></Borders>
    </Style>
    <Style ss:ID="colHead">
      <Font ss:Bold="1" ss:Size="10" ss:Color="#FFFFFF"/>
      <Interior ss:Color="#AD1457" ss:Pattern="Solid"/>
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Borders><Border ss:Position="All" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#880E4F"/></Borders>
    </Style>
    <Style ss:ID="item">
      <Font ss:Size="10"/>
      <Interior ss:Color="#FFF9FB" ss:Pattern="Solid"/>
      <Borders><Border ss:Position="All" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#F48FB1"/></Borders>
    </Style>
    <Style ss:ID="itemNum">
      <Font ss:Size="10"/>
      <Interior ss:Color="#FFF9FB" ss:Pattern="Solid"/>
      <Alignment ss:Horizontal="Center"/>
      <Borders><Border ss:Position="All" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#F48FB1"/></Borders>
    </Style>
    <Style ss:ID="money">
      <Font ss:Size="10"/>
      <Interior ss:Color="#FFF9FB" ss:Pattern="Solid"/>
      <Alignment ss:Horizontal="Right"/>
      <NumberFormat ss:Format="#,##0"/>
      <Borders><Border ss:Position="All" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#F48FB1"/></Borders>
    </Style>
    <Style ss:ID="totalLabel">
      <Font ss:Bold="1" ss:Size="10" ss:Color="#880E4F"/>
      <Interior ss:Color="#FCE4EC" ss:Pattern="Solid"/>
      <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
      <Borders><Border ss:Position="All" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#F48FB1"/></Borders>
    </Style>
    <Style ss:ID="grandLabel">
      <Font ss:Bold="1" ss:Size="11" ss:Color="#FFFFFF"/>
      <Interior ss:Color="#C2185B" ss:Pattern="Solid"/>
      <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
      <Borders><Border ss:Position="All" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#880E4F"/></Borders>
    </Style>
    <Style ss:ID="grand">
      <Font ss:Bold="1" ss:Size="11" ss:Color="#FFFFFF"/>
      <Interior ss:Color="#C2185B" ss:Pattern="Solid"/>
      <Alignment ss:Horizontal="Right"/>
      <NumberFormat ss:Format="#,##0"/>
      <Borders><Border ss:Position="All" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#880E4F"/></Borders>
    </Style>
  </Styles>
  <Worksheet ss:Name="報價單">
    <Table ss:DefaultColumnWidth="80"
           ss:DefaultRowHeight="20">
      <Column ss:Width="120"/>
      <Column ss:Width="200"/>
      <Column ss:Width="50"/>
      <Column ss:Width="120"/>
      <Column ss:Width="200"/>
      <Column ss:Width="50"/>
      <Column ss:Width="90"/>
      ${rows.join('\n      ')}
    </Table>
  </Worksheet>
</Workbook>`;

  return xml;
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function AgencyQuoteApp() {
  const [form, setForm] = useState({
    endClientName: '',
    endClientUrl: '',
    taxId: '',
    companyTitle: '',
    clientName: '',
    email: '',
    otherNote: '',
  });
  const [selectedItems, setSelectedItems] = useState({});
  const [qtyMap, setQtyMap]               = useState({});
  const [lookupState, setLookupState]     = useState('idle'); // idle|loading|success|error
  const [lookupMessage, setLookupMessage] = useState('');
  const [submitState, setSubmitState]     = useState('idle');
  const [errors, setErrors]               = useState({});
  const [successOpen, setSuccessOpen]     = useState(false);
  const [expanded, setExpanded]           = useState(() =>
    Object.fromEntries(serviceLibrary.map((g) => [g.category, true]))
  );

  const allItemsFlat = useMemo(
    () => serviceLibrary.flatMap((g) => g.items.map((item) => ({ ...item, category: g.category }))),
    []
  );

  const chosenDetails = useMemo(
    () =>
      allItemsFlat
        .filter((item) => selectedItems[item.name])
        .map((item) => {
          const qty = Number(qtyMap[item.name] || 1);
          return { ...item, qty, subtotal: qty * item.unitPrice };
        }),
    [allItemsFlat, qtyMap, selectedItems]
  );

  const subtotal = chosenDetails.reduce((s, i) => s + i.subtotal, 0);
  const tax      = Math.round(subtotal * 0.05);
  const total    = subtotal + tax;

  // ── Lookup ──────────────────────────────────────────────────────────────────
  const handleLookup = () => {
    const id = form.taxId.trim();
    if (!id) return;
    setLookupState('loading');
    setTimeout(() => {
      const agency = agencyDB[id];
      if (agency) {
        setForm((p) => ({ ...p, companyTitle: agency.companyTitle, email: agency.email }));
        setLookupState('success');
        setLookupMessage('已自動帶入代理商資料，可手動修改。');
      } else {
        setLookupState('error');
        setLookupMessage('查無此統編，請手動填寫公司抬頭與 Email。');
      }
    }, 600);
  };

  // ── Validate ─────────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.endClientName.trim()) e.endClientName = '必填';
    if (!form.taxId.trim())         e.taxId         = '必填';
    if (!form.companyTitle.trim())  e.companyTitle  = '必填';
    if (!form.email.trim())         e.email         = '必填';
    if (chosenDetails.length === 0) e.items         = '請至少選擇一項服務';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Excel Download ────────────────────────────────────────────────────────
  const handleExcelDownload = () => {
    if (!validate()) return;
    const xml  = buildExcel(form, chosenDetails, subtotal, tax, total);
    const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `代理商報價單_${form.companyTitle}_${form.endClientName}_${today().replace(/\//g, '')}.xls`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Submit (GAS) ──────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitState('loading');
    const payload = {
      timestamp:      new Date().toLocaleString(),
      endClientName:  form.endClientName,
      endClientUrl:   form.endClientUrl,
      taxId:          form.taxId,
      companyTitle:   form.companyTitle,
      clientName:     form.clientName,
      email:          form.email,
      items:          chosenDetails.map((d) => `${d.name}（x${d.qty}）`).join('、'),
      subtotal,
      tax,
      total,
      otherNote:      form.otherNote,
    };
    try {
      if (GAS_URL && GAS_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_URL') {
        await fetch(GAS_URL, {
          method:  'POST',
          mode:    'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(payload),
        });
      }
      setSubmitState('success');
      setSuccessOpen(true);
    } catch (err) {
      console.error(err);
      setSubmitState('error');
    }
  };

  const resetForm = () => {
    setForm({ endClientName: '', endClientUrl: '', taxId: '', companyTitle: '', clientName: '', email: '', otherNote: '' });
    setSelectedItems({});
    setQtyMap({});
    setLookupState('idle');
    setLookupMessage('');
    setSubmitState('idle');
    setErrors({});
    setSuccessOpen(false);
  };

  // ── Field helper ──────────────────────────────────────────────────────────
  const Field = ({ icon: Icon, label, name, placeholder, type = 'text', required }) => (
    <div>
      <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-rose-700">
        <Icon className="h-3.5 w-3.5" />
        {label}
        {required && <span className="text-rose-500">*</span>}
      </label>
      <input
        type={type}
        className={`w-full rounded-xl border px-3 py-2.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-rose-400 ${
          errors[name] ? 'border-rose-400 bg-rose-50' : 'border-slate-200 bg-white hover:border-rose-300'
        }`}
        placeholder={placeholder}
        value={form[name]}
        onChange={(e) => {
          setForm((p) => ({ ...p, [name]: e.target.value }));
          if (errors[name]) setErrors((p) => { const n = {...p}; delete n[name]; return n; });
        }}
      />
      {errors[name] && <p className="mt-1 text-xs text-rose-500">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 p-4 font-sans text-slate-800 md:p-8">
      <div className="mx-auto max-w-5xl">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <header className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-rose-600 via-pink-600 to-fuchsia-600 p-8 text-white shadow-xl shadow-rose-200">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium tracking-widest text-rose-200">獨立女子廣告｜IDW Ads</p>
              <h1 className="mt-1 text-3xl font-black tracking-tight">代理商報價系統</h1>
              <p className="mt-1 text-sm text-pink-200">填入資訊 → 勾選服務 → 下載 Excel 報價單</p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-white/20 px-5 py-3 backdrop-blur-sm">
              <ReceiptText className="h-8 w-8 text-white" />
              <div>
                <p className="text-xs text-pink-200">已選項目</p>
                <p className="text-2xl font-black">{chosenDetails.length}</p>
              </div>
              <div className="mx-2 h-8 w-px bg-white/30" />
              <div>
                <p className="text-xs text-pink-200">含稅總計</p>
                <p className="text-lg font-black">{currency(total)}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">

          {/* ── LEFT COLUMN ────────────────────────────────────────────────── */}
          <div className="space-y-6">

            {/* ── STEP 1: 代理商資訊 ── */}
            <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-rose-100">
              <h2 className="mb-5 flex items-center gap-2 text-base font-black text-rose-700">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-600 text-xs font-black text-white">1</span>
                代理商資訊
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field icon={Building2} label="甲方客戶名稱" name="endClientName" placeholder="最終客戶公司名稱" required />
                <Field icon={Globe}     label="甲方網址"     name="endClientUrl"  placeholder="https://example.com（選填）" />
              </div>

              {/* 統編查詢 */}
              <div className="mt-4">
                <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-rose-700">
                  <Hash className="h-3.5 w-3.5" />
                  代理商統一編號
                  <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={8}
                    className={`flex-1 rounded-xl border px-3 py-2.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-rose-400 ${
                      errors.taxId ? 'border-rose-400 bg-rose-50' : 'border-slate-200 bg-white hover:border-rose-300'
                    }`}
                    placeholder="輸入 8 碼統一編號（如 80652314）"
                    value={form.taxId}
                    onChange={(e) => {
                      setForm((p) => ({ ...p, taxId: e.target.value }));
                      if (errors.taxId) setErrors((p) => { const n = {...p}; delete n.taxId; return n; });
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
                  />
                  <button
                    onClick={handleLookup}
                    disabled={lookupState === 'loading' || !form.taxId.trim()}
                    className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                  >
                    {lookupState === 'loading'
                      ? <Loader2 className="h-4 w-4 animate-spin" />
                      : <Search className="h-4 w-4" />}
                    查詢
                  </button>
                </div>
                {errors.taxId && <p className="mt-1 text-xs text-rose-500">{errors.taxId}</p>}

                {/* Lookup feedback */}
                <AnimatePresence>
                  {lookupMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className={`mt-2 flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium ${
                        lookupState === 'success'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {lookupState === 'success'
                        ? <CircleCheck className="h-3.5 w-3.5 shrink-0" />
                        : <AlertCircle className="h-3.5 w-3.5 shrink-0" />}
                      {lookupMessage}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Auto-fill fields (now editable) */}
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-rose-700">
                    <Building2 className="h-3.5 w-3.5" />
                    代理商公司抬頭
                    <span className="text-rose-500">*</span>
                    {lookupState === 'success' && (
                      <span className="ml-auto rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] text-emerald-600">自動帶入</span>
                    )}
                  </label>
                  <input
                    type="text"
                    className={`w-full rounded-xl border px-3 py-2.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-rose-400 ${
                      errors.companyTitle ? 'border-rose-400 bg-rose-50' : 'border-slate-200 bg-white hover:border-rose-300'
                    }`}
                    placeholder="代理商公司名稱（可手動修改）"
                    value={form.companyTitle}
                    onChange={(e) => {
                      setForm((p) => ({ ...p, companyTitle: e.target.value }));
                      if (errors.companyTitle) setErrors((p) => { const n = {...p}; delete n.companyTitle; return n; });
                    }}
                  />
                  {errors.companyTitle && <p className="mt-1 text-xs text-rose-500">{errors.companyTitle}</p>}
                </div>

                <div>
                  <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-rose-700">
                    <Mail className="h-3.5 w-3.5" />
                    收件人 Email
                    <span className="text-rose-500">*</span>
                    {lookupState === 'success' && (
                      <span className="ml-auto rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] text-emerald-600">自動帶入</span>
                    )}
                  </label>
                  <input
                    type="email"
                    className={`w-full rounded-xl border px-3 py-2.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-rose-400 ${
                      errors.email ? 'border-rose-400 bg-rose-50' : 'border-slate-200 bg-white hover:border-rose-300'
                    }`}
                    placeholder="agency@example.com（可手動修改）"
                    value={form.email}
                    onChange={(e) => {
                      setForm((p) => ({ ...p, email: e.target.value }));
                      if (errors.email) setErrors((p) => { const n = {...p}; delete n.email; return n; });
                    }}
                  />
                  {errors.email && <p className="mt-1 text-xs text-rose-500">{errors.email}</p>}
                </div>
              </div>

              <div className="mt-4">
                <Field icon={User} label="窗口姓名" name="clientName" placeholder="代理商聯絡人姓名（選填）" />
              </div>
            </section>

            {/* ── STEP 2: 服務選擇 ── */}
            <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-rose-100">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-base font-black text-rose-700">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-600 text-xs font-black text-white">2</span>
                  選擇服務項目
                </h2>
                {errors.items && (
                  <p className="flex items-center gap-1 text-xs font-medium text-rose-500">
                    <AlertCircle className="h-3.5 w-3.5" />{errors.items}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                {serviceLibrary.map((group) => (
                  <div key={group.category} className="overflow-hidden rounded-xl border border-rose-100">
                    {/* Category header */}
                    <button
                      onClick={() => setExpanded((p) => ({ ...p, [group.category]: !p[group.category] }))}
                      className="flex w-full items-center justify-between bg-rose-50 px-4 py-3 text-left transition hover:bg-rose-100"
                    >
                      <span className="text-sm font-bold text-rose-800">{group.category}</span>
                      <div className="flex items-center gap-2">
                        {group.items.some((i) => selectedItems[i.name]) && (
                          <span className="rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-bold text-white">
                            {group.items.filter((i) => selectedItems[i.name]).length} 選
                          </span>
                        )}
                        {expanded[group.category]
                          ? <ChevronUp className="h-4 w-4 text-rose-500" />
                          : <ChevronDown className="h-4 w-4 text-rose-500" />}
                      </div>
                    </button>

                    {/* Items */}
                    <AnimatePresence>
                      {expanded[group.category] && (
                        <motion.div
                          initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                          className="overflow-hidden"
                        >
                          {group.items.map((item) => {
                            const checked = !!selectedItems[item.name];
                            const qty     = Number(qtyMap[item.name] || 1);
                            return (
                              <div
                                key={item.name}
                                className={`border-t border-rose-50 transition-colors ${checked ? 'bg-rose-50/60' : 'bg-white hover:bg-slate-50'}`}
                              >
                                <label className="flex cursor-pointer items-start gap-3 px-4 py-3">
                                  {/* Checkbox */}
                                  <div className="mt-0.5 shrink-0">
                                    <input
                                      type="checkbox"
                                      className="hidden"
                                      checked={checked}
                                      onChange={(e) => {
                                        setSelectedItems((p) => ({ ...p, [item.name]: e.target.checked }));
                                        if (errors.items) setErrors((p) => { const n = {...p}; delete n.items; return n; });
                                      }}
                                    />
                                    <div className={`flex h-5 w-5 items-center justify-center rounded-md border-2 transition ${
                                      checked ? 'border-rose-500 bg-rose-500' : 'border-slate-300'
                                    }`}>
                                      {checked && <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                                    </div>
                                  </div>

                                  {/* Info */}
                                  <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                                      <p className={`text-sm font-semibold ${checked ? 'text-rose-800' : 'text-slate-700'}`}>
                                        {item.name}
                                      </p>
                                      <p className="text-sm font-bold text-rose-600">{currency(item.unitPrice)} / {item.unit}</p>
                                    </div>
                                    <p className="mt-0.5 text-xs text-slate-500">{item.spec}</p>
                                  </div>
                                </label>

                                {/* Qty selector (visible when checked) */}
                                <AnimatePresence>
                                  {checked && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                      className="overflow-hidden"
                                    >
                                      <div className="flex items-center justify-between border-t border-rose-100 px-4 py-2.5">
                                        <span className="text-xs text-slate-500">數量</span>
                                        <div className="flex items-center gap-2">
                                          <button
                                            onClick={() => setQtyMap((p) => ({ ...p, [item.name]: Math.max(1, qty - 1) }))}
                                            className="flex h-7 w-7 items-center justify-center rounded-full border border-rose-200 text-rose-600 transition hover:bg-rose-100"
                                          >−</button>
                                          <span className="w-8 text-center text-sm font-bold text-rose-700">{qty}</span>
                                          <button
                                            onClick={() => setQtyMap((p) => ({ ...p, [item.name]: qty + 1 }))}
                                            className="flex h-7 w-7 items-center justify-center rounded-full border border-rose-200 text-rose-600 transition hover:bg-rose-100"
                                          >+</button>
                                          <span className="ml-2 min-w-[80px] text-right text-sm font-bold text-rose-600">
                                            {currency(qty * item.unitPrice)}
                                          </span>
                                        </div>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </section>

            {/* ── STEP 3: 備註 ── */}
            <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-rose-100">
              <h2 className="mb-4 flex items-center gap-2 text-base font-black text-rose-700">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-600 text-xs font-black text-white">3</span>
                其他說明
              </h2>
              <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-rose-700">
                <StickyNote className="h-3.5 w-3.5" />
                備註（選填）
              </label>
              <textarea
                rows={3}
                className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-rose-400 hover:border-rose-300"
                placeholder="付款方式、特殊需求或備忘事項…"
                value={form.otherNote}
                onChange={(e) => setForm((p) => ({ ...p, otherNote: e.target.value }))}
              />
            </section>

            {/* ── ACTION BUTTONS ── */}
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                onClick={handleExcelDownload}
                className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 py-4 font-black text-white shadow-lg shadow-emerald-200 transition hover:from-emerald-600 hover:to-teal-600 hover:shadow-xl active:scale-95"
              >
                <Download className="h-5 w-5" />
                下載 Excel 報價單
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitState === 'loading'}
                className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 py-4 font-black text-white shadow-lg shadow-rose-200 transition hover:from-rose-700 hover:to-pink-700 hover:shadow-xl active:scale-95 disabled:opacity-50"
              >
                {submitState === 'loading'
                  ? <Loader2 className="h-5 w-5 animate-spin" />
                  : <Send className="h-5 w-5" />}
                送出並寄信通知
              </button>
            </div>
          </div>

          {/* ── RIGHT COLUMN: 報價摘要 ─────────────────────────────────────── */}
          <div className="space-y-5">

            {/* Summary card */}
            <div className="sticky top-6 space-y-4">
              <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-rose-100">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-black text-rose-700">
                  <BadgeDollarSign className="h-4 w-4" />報價摘要
                </h3>

                {chosenDetails.length === 0 ? (
                  <div className="py-8 text-center">
                    <FileText className="mx-auto mb-2 h-10 w-10 text-slate-200" />
                    <p className="text-xs text-slate-400">尚未選擇服務項目</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {chosenDetails.map((item) => (
                      <div key={item.name} className="flex items-start justify-between gap-2 text-xs">
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-700 leading-snug">{item.name}</p>
                          <p className="text-slate-400">{item.unit} × {item.qty}</p>
                        </div>
                        <p className="shrink-0 font-bold text-slate-700">{currency(item.subtotal)}</p>
                      </div>
                    ))}
                  </div>
                )}

                {chosenDetails.length > 0 && (
                  <div className="mt-4 space-y-1.5 border-t border-rose-100 pt-4">
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>未稅合計</span>
                      <span className="font-semibold">{currency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>營業稅 (5%)</span>
                      <span className="font-semibold">{currency(tax)}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 px-3 py-2.5 text-white">
                      <span className="text-xs font-bold">含稅總計</span>
                      <span className="text-lg font-black">{currency(total)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Info card */}
              <div className="rounded-2xl bg-gradient-to-br from-rose-600 to-fuchsia-700 p-5 text-white shadow-lg shadow-rose-200">
                <h4 className="mb-3 flex items-center gap-2 text-sm font-black">
                  <Sparkles className="h-4 w-4" />自動化流程
                </h4>
                <ul className="space-y-2 text-xs text-rose-100">
                  <li className="flex items-start gap-2"><span className="mt-0.5 text-rose-300">▸</span>統編查詢自動帶入公司資料（可手動修改）</li>
                  <li className="flex items-start gap-2"><span className="mt-0.5 text-rose-300">▸</span>點「下載 Excel」產生可直接交付的報價單</li>
                  <li className="flex items-start gap-2"><span className="mt-0.5 text-rose-300">▸</span>點「送出並寄信」寫入 Google Sheets 並發信</li>
                  <li className="flex items-start gap-2"><span className="mt-0.5 text-rose-300">▸</span>CC：newchin930@gmail.com</li>
                  <li className="flex items-start gap-2"><span className="mt-0.5 text-rose-300">▸</span>CC：idwomantw@gmail.com</li>
                </ul>
              </div>

              {/* Spec notice */}
              {chosenDetails.length >= 8 && (
                <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-700 ring-1 ring-amber-200">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  報價單模板最多支援 8 筆明細，超出部分將不會寫入 Google Sheets 模板（Excel 下載不受此限制）。
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Success Modal ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {successOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl"
            >
              <div className="bg-gradient-to-r from-rose-600 to-pink-600 px-8 py-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                  <CheckCircle2 className="h-9 w-9 text-white" />
                </div>
              </div>
              <div className="p-8 text-center">
                <h2 className="text-xl font-black text-slate-800">送出成功！</h2>
                <p className="mt-2 text-sm text-slate-500">
                  報價資料已寫入 Google Sheets，<br />
                  報價單連結將寄送至 <span className="font-semibold text-rose-600">{form.email}</span>
                </p>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <button
                    onClick={handleExcelDownload}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-100 py-2.5 text-sm font-bold text-emerald-700 transition hover:bg-emerald-200"
                  >
                    <Download className="h-4 w-4" />
                    下載 Excel
                  </button>
                  <button
                    onClick={resetForm}
                    className="rounded-xl bg-rose-600 py-2.5 text-sm font-bold text-white transition hover:bg-rose-700"
                  >
                    完成
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
