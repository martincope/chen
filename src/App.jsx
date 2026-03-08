import React, { useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Building2, FileText, CheckCircle2, Loader2, Send,
  Download, AlertCircle, BadgeDollarSign, ChevronDown, ChevronUp,
  User, Mail, Hash, Globe, StickyNote, Sparkles, ReceiptText, CircleCheck
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// 莫蘭迪色系 tokens（可集中替換）
// ─────────────────────────────────────────────────────────────────────────────
const M = {
  bg:          '#F2EDE8',   // 頁面背景  暖米
  card:        '#FAFAF8',   // 卡片白
  border:      '#E0D8D0',   // 邊框       淺暖灰
  borderFocus: '#C4998B',   // focus ring 塵玫瑰
  primary:     '#B08478',   // 主色       塵玫瑰
  primaryDark: '#9A6E63',   // 主色深
  primaryBg:   '#EDE3DF',   // 主色淺底
  primaryText: '#FAFAF8',   // 主色上的字
  sage:        '#8FA89A',   // 輔助       鼠尾草綠
  sageDark:    '#6F8A7C',   // 鼠尾草深
  sageBg:      '#E4EDEA',   // 鼠尾草底
  accent:      '#A89880',   // 強調       暖棕
  textDark:    '#4A4540',   // 主文字
  textMid:     '#7A706A',   // 次文字
  textLight:   '#ABA4A0',   // 說明文字
  error:       '#C0827A',   // 錯誤紅
  errorBg:     '#F5ECEB',   // 錯誤底
  success:     '#7A9E8A',   // 成功綠
  successBg:   '#E4EDEA',   // 成功底
  warning:     '#B09870',   // 警告棕
  warningBg:   '#F2EBE0',   // 警告底
};

// ─────────────────────────────────────────────────────────────────────────────
// API CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const GAS_URL = import.meta.env.VITE_GAS_URL;

// ─────────────────────────────────────────────────────────────────────────────
// MOCK DB & SERVICE LIBRARY
// ─────────────────────────────────────────────────────────────────────────────
const agencyDB = {
  '24567891': { companyTitle: '晨曜媒體代理股份有限公司', email: 'sales@morningads.tw' },
  '50882173': { companyTitle: '北星整合行銷有限公司',     email: 'contact@northstar.tw' },
  '97431256': { companyTitle: '橙海數位廣告有限公司',     email: 'service@orangewave.tw' },
  '80652314': { companyTitle: '宇光品牌顧問股份有限公司', email: 'hello@starlightbrand.com' },
};

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
      { name: '品牌圖文設計',       spec: '社群貼文主視覺設計',          unitPrice: 2500,  unit: '則' },
      { name: '短影音腳本',         spec: 'Reels / Shorts 腳本企劃',     unitPrice: 4500,  unit: '支' },
      { name: 'Landing Page 文案',  spec: '單頁式活動頁文案撰寫',        unitPrice: 9000,  unit: '頁' },
    ],
  },
  {
    category: '網站與數據',
    items: [
      { name: 'GA4 / GTM 追蹤建置', spec: 'GA4、GTM 與事件追蹤設定',     unitPrice: 10000, unit: '案' },
      { name: 'SEO 優化建議',       spec: '頁面結構與關鍵字優化',         unitPrice: 15000, unit: '案' },
      { name: '成效報表整理',       spec: '月報、投放成效與分析建議',     unitPrice: 6000,  unit: '月' },
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

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const currency = (n) =>
  new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', maximumFractionDigits: 0 }).format(n);

const todayStr = () =>
  new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' });

// ─────────────────────────────────────────────────────────────────────────────
// EXCEL (SpreadsheetML) GENERATOR  ← 不需要任何外部套件
// ─────────────────────────────────────────────────────────────────────────────
function buildExcelXML(form, chosenDetails, subtotal, tax, total) {
  const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const S  = (v, id)  => `<Cell ss:StyleID="${id}"><Data ss:Type="String">${esc(v)}</Data></Cell>`;
  const N  = (v, id)  => `<Cell ss:StyleID="${id}"><Data ss:Type="Number">${Number(v) || 0}</Data></Cell>`;
  const MC = (v, id, span) => `<Cell ss:StyleID="${id}" ss:MergeAcross="${span}"><Data ss:Type="String">${esc(v)}</Data></Cell>`;
  const SP = () => `<Cell ss:StyleID="sp"/>`;

  const itemRows = [...chosenDetails.slice(0, 8)];
  while (itemRows.length < 8) itemRows.push(null);

  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
          xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Styles>
    <Style ss:ID="title">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
      <Font ss:Bold="1" ss:Size="16" ss:Color="#9A6E63" ss:Name="Microsoft JhengHei"/>
      <Interior ss:Color="#EDE3DF" ss:Pattern="Solid"/>
      <Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#C4998B"/></Borders>
    </Style>
    <Style ss:ID="sHead">
      <Font ss:Bold="1" ss:Size="10" ss:Color="#FAFAF8" ss:Name="Microsoft JhengHei"/>
      <Interior ss:Color="#B08478" ss:Pattern="Solid"/>
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
    </Style>
    <Style ss:ID="lb">
      <Font ss:Bold="1" ss:Size="9" ss:Color="#9A6E63" ss:Name="Microsoft JhengHei"/>
      <Interior ss:Color="#EDE3DF" ss:Pattern="Solid"/>
      <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
      <Borders><Border ss:Position="All" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E0D8D0"/></Borders>
    </Style>
    <Style ss:ID="val">
      <Font ss:Size="9" ss:Name="Microsoft JhengHei"/>
      <Interior ss:Color="#FAFAF8" ss:Pattern="Solid"/>
      <Alignment ss:Vertical="Center"/>
      <Borders><Border ss:Position="All" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E0D8D0"/></Borders>
    </Style>
    <Style ss:ID="colH">
      <Font ss:Bold="1" ss:Size="9" ss:Color="#FAFAF8" ss:Name="Microsoft JhengHei"/>
      <Interior ss:Color="#9A6E63" ss:Pattern="Solid"/>
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Borders><Border ss:Position="All" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#9A6E63"/></Borders>
    </Style>
    <Style ss:ID="it">
      <Font ss:Size="9" ss:Name="Microsoft JhengHei"/>
      <Interior ss:Color="#FAFAF8" ss:Pattern="Solid"/>
      <Alignment ss:Vertical="Center"/>
      <Borders><Border ss:Position="All" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E0D8D0"/></Borders>
    </Style>
    <Style ss:ID="itC">
      <Font ss:Size="9" ss:Name="Microsoft JhengHei"/>
      <Interior ss:Color="#FAFAF8" ss:Pattern="Solid"/>
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Borders><Border ss:Position="All" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E0D8D0"/></Borders>
    </Style>
    <Style ss:ID="mo">
      <Font ss:Size="9" ss:Name="Microsoft JhengHei"/>
      <Interior ss:Color="#FAFAF8" ss:Pattern="Solid"/>
      <Alignment ss:Horizontal="Right"/>
      <NumberFormat ss:Format="#,##0"/>
      <Borders><Border ss:Position="All" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E0D8D0"/></Borders>
    </Style>
    <Style ss:ID="tl">
      <Font ss:Bold="1" ss:Size="9" ss:Color="#9A6E63" ss:Name="Microsoft JhengHei"/>
      <Interior ss:Color="#EDE3DF" ss:Pattern="Solid"/>
      <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
      <Borders><Border ss:Position="All" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E0D8D0"/></Borders>
    </Style>
    <Style ss:ID="gr">
      <Font ss:Bold="1" ss:Size="11" ss:Color="#FAFAF8" ss:Name="Microsoft JhengHei"/>
      <Interior ss:Color="#9A6E63" ss:Pattern="Solid"/>
      <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
      <NumberFormat ss:Format="#,##0"/>
      <Borders><Border ss:Position="All" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#9A6E63"/></Borders>
    </Style>
    <Style ss:ID="sp"><Interior ss:Color="#F2EDE8" ss:Pattern="Solid"/></Style>
  </Styles>
  <Worksheet ss:Name="報價單">
    <Table ss:DefaultRowHeight="20">
      <Column ss:Width="100"/><Column ss:Width="160"/><Column ss:Width="48"/>
      <Column ss:Width="100"/><Column ss:Width="160"/><Column ss:Width="48"/><Column ss:Width="85"/>
      <Row ss:Height="38">${MC('代 理 商 報 價 單', 'title', 6)}</Row>
      <Row ss:Height="6">${SP()}${SP()}${SP()}${SP()}${SP()}${SP()}${SP()}</Row>
      <Row ss:Height="20">${MC('代理商資訊', 'sHead', 1)}${SP()}${MC('甲方資訊', 'sHead', 2)}${SP()}${SP()}</Row>
      <Row ss:Height="22">${S('公司抬頭','lb')}${S(form.companyTitle,'val')}${SP()}${S('甲方客戶名稱','lb')}${S(form.endClientName,'val')}${SP()}${SP()}</Row>
      <Row ss:Height="22">${S('窗口姓名','lb')}${S(form.clientName,'val')}${SP()}${S('甲方網址','lb')}${S(form.endClientUrl,'val')}${SP()}${SP()}</Row>
      <Row ss:Height="22">${S('電子郵件','lb')}${S(form.email,'val')}${SP()}${S('公司電話','lb')}${S('02-77522532 #105/#108','val')}${SP()}${SP()}</Row>
      <Row ss:Height="22">${S('統一編號','lb')}${S(form.taxId,'val')}${SP()}${S('報價日期','lb')}${S(todayStr(),'val')}${SP()}${SP()}</Row>
      <Row ss:Height="8">${SP()}${SP()}${SP()}${SP()}${SP()}${SP()}${SP()}</Row>
      <Row ss:Height="8">${SP()}${SP()}${SP()}${SP()}${SP()}${SP()}${SP()}</Row>
      <Row ss:Height="22">${S('服務項目','colH')}${S('規格說明','colH')}${S('數量','colH')}${S('單價','colH')}${S('單位','colH')}${S('','colH')}${S('小計','colH')}</Row>
      ${itemRows.map(item => item
        ? `<Row ss:Height="20">${S(item.name,'it')}${S(item.spec,'it')}${N(item.qty,'itC')}${N(item.unitPrice,'mo')}${S(item.unit,'itC')}${N(1,'itC')}${N(item.subtotal,'mo')}</Row>`
        : `<Row ss:Height="20">${S('','it')}${S('','it')}${S('','itC')}${S('','mo')}${S('','itC')}${S('','itC')}${S('','mo')}</Row>`
      ).join('\n      ')}
      <Row ss:Height="8">${SP()}${SP()}${SP()}${SP()}${SP()}${SP()}${SP()}</Row>
      <Row ss:Height="22">${SP()}${SP()}${SP()}${SP()}<Cell ss:StyleID="tl" ss:MergeAcross="1"><Data ss:Type="String">未稅合計</Data></Cell>${N(subtotal,'mo')}</Row>
      <Row ss:Height="22">${SP()}${SP()}${SP()}${SP()}<Cell ss:StyleID="tl" ss:MergeAcross="1"><Data ss:Type="String">營業稅 (5%)</Data></Cell>${N(tax,'mo')}</Row>
      <Row ss:Height="26">${SP()}${SP()}${SP()}${SP()}<Cell ss:StyleID="gr" ss:MergeAcross="1"><Data ss:Type="String">含稅總計</Data></Cell>${N(total,'gr')}</Row>
      ${form.otherNote ? `<Row ss:Height="8">${SP()}${SP()}${SP()}${SP()}${SP()}${SP()}${SP()}</Row>
      <Row ss:Height="22">${S('備註','lb')}<Cell ss:StyleID="val" ss:MergeAcross="5"><Data ss:Type="String">${esc(form.otherNote)}</Data></Cell></Row>` : ''}
    </Table>
  </Worksheet>
</Workbook>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// ★ Field 組件移到主組件外部 → 避免 React 每次 re-render 重新 mount，修復輸入跳焦問題
// ─────────────────────────────────────────────────────────────────────────────
const FormField = React.memo(function FormField({ icon: Icon, label, name, placeholder, type = 'text', required, value, error, onChange }) {
  return (
    <div>
      <label style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: M.primary }}>
        <Icon size={13} />
        {label}
        {required && <span style={{ color: M.error }}>*</span>}
      </label>
      <input
        type={type}
        style={{
          width: '100%', boxSizing: 'border-box',
          border: `1.5px solid ${error ? M.error : M.border}`,
          borderRadius: 12, padding: '10px 12px', fontSize: 14,
          background: error ? M.errorBg : M.card,
          color: M.textDark, outline: 'none',
          transition: 'border-color 0.15s',
        }}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={e => { e.target.style.borderColor = M.borderFocus; }}
        onBlur={e => { e.target.style.borderColor = error ? M.error : M.border; }}
      />
      {error && <p style={{ marginTop: 4, fontSize: 11, color: M.error }}>{error}</p>}
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function AgencyQuoteApp() {
  const [form, setForm] = useState({
    endClientName: '', endClientUrl: '', taxId: '',
    companyTitle: '', clientName: '', email: '', otherNote: '',
  });
  const [selectedItems, setSelectedItems] = useState({});
  const [qtyMap, setQtyMap]               = useState({});
  const [lookupState, setLookupState]     = useState('idle');
  const [lookupMsg, setLookupMsg]         = useState('');
  const [submitState, setSubmitState]     = useState('idle');
  const [errors, setErrors]               = useState({});
  const [successOpen, setSuccessOpen]     = useState(false);
  const [expanded, setExpanded]           = useState(() =>
    Object.fromEntries(serviceLibrary.map(g => [g.category, true]))
  );
  const [topError, setTopError]           = useState('');

  // ── useCallback handlers ──────────────────────────────────────────────────
  // 這樣傳給 FormField 的 onChange 不會每次 re-render 都是新 function
  const makeChangeHandler = useCallback((name) => (e) => {
    const val = e.target.value;
    setForm(p => ({ ...p, [name]: val }));
    setErrors(p => { const n = {...p}; delete n[name]; return n; });
  }, []);

  const allItemsFlat = useMemo(
    () => serviceLibrary.flatMap(g => g.items.map(item => ({ ...item, category: g.category }))),
    []
  );

  const chosenDetails = useMemo(
    () => allItemsFlat
      .filter(item => selectedItems[item.name])
      .map(item => { const qty = Number(qtyMap[item.name] || 1); return { ...item, qty, subtotal: qty * item.unitPrice }; }),
    [allItemsFlat, qtyMap, selectedItems]
  );

  const subtotal = chosenDetails.reduce((s, i) => s + i.subtotal, 0);
  const tax      = Math.round(subtotal * 0.05);
  const total    = subtotal + tax;

  // ── Lookup ────────────────────────────────────────────────────────────────
  const handleLookup = () => {
    const id = form.taxId.trim();
    if (!id) { setErrors(p => ({ ...p, taxId: '請先填寫統一編號' })); return; }
    setLookupState('loading');
    setTimeout(() => {
      const agency = agencyDB[id];
      if (agency) {
        setForm(p => ({ ...p, companyTitle: agency.companyTitle, email: agency.email }));
        setLookupState('success');
        setLookupMsg('已自動帶入代理商資料，欄位仍可手動修改。');
      } else {
        setLookupState('error');
        setLookupMsg('查無此統編，請手動填寫公司抬頭與 Email。');
      }
    }, 600);
  };

  // ── Validate ──────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.endClientName.trim()) e.endClientName = '必填';
    if (!form.taxId.trim())         e.taxId         = '必填';
    if (!form.companyTitle.trim())  e.companyTitle  = '必填';
    if (!form.email.trim())         e.email         = '必填';
    if (chosenDetails.length === 0) e.items         = '請至少勾選一項服務';
    setErrors(e);
    if (Object.keys(e).length > 0) {
      setTopError('尚有必填欄位未完成，請往上確認');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return false;
    }
    setTopError('');
    return true;
  };

  // ── Excel ─────────────────────────────────────────────────────────────────
  const handleExcelDownload = () => {
    if (!validate()) return;
    try {
      const xml  = buildExcelXML(form, chosenDetails, subtotal, tax, total);
      const blob = new Blob(['\uFEFF' + xml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `代理商報價單_${form.companyTitle}_${form.endClientName}_${todayStr().replace(/\//g, '')}.xls`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Excel 下載失敗:', err);
      alert('Excel 下載發生錯誤，請查看主控台。');
    }
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitState('loading');
    const payload = {
      timestamp:     new Date().toLocaleString(),
      endClientName: form.endClientName,
      endClientUrl:  form.endClientUrl,
      taxId:         form.taxId,
      companyTitle:  form.companyTitle,
      clientName:    form.clientName,
      email:         form.email,
      items:         chosenDetails.map(d => `${d.name}（x${d.qty}）`).join('、'),
      subtotal, tax, total,
      otherNote:     form.otherNote,
    };
    try {
      if (GAS_URL && GAS_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_URL') {
        await fetch(GAS_URL, {
          method: 'POST', mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      setSubmitState('success');
      setSuccessOpen(true);
    } catch (err) {
      console.error('送出失敗:', err);
      setSubmitState('error');
      setTopError('送出時發生錯誤，請確認網路或 GAS 部署狀態。');
    }
  };

  const resetForm = () => {
    setForm({ endClientName: '', endClientUrl: '', taxId: '', companyTitle: '', clientName: '', email: '', otherNote: '' });
    setSelectedItems({}); setQtyMap({}); setLookupState('idle'); setLookupMsg('');
    setSubmitState('idle'); setErrors({}); setSuccessOpen(false); setTopError('');
  };

  // ── Styles ────────────────────────────────────────────────────────────────
  const card = {
    background: M.card, borderRadius: 20,
    boxShadow: '0 2px 12px rgba(80,60,50,0.07)',
    border: `1px solid ${M.border}`, padding: 24,
  };

  return (
    <div style={{ minHeight: '100vh', background: M.bg, padding: '24px 16px', fontFamily: "'Microsoft JhengHei', 'PingFang TC', sans-serif", color: M.textDark }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>

        {/* ── HEADER ──────────────────────────────────────────────────── */}
        <header style={{
          marginBottom: 28, borderRadius: 24, padding: '28px 32px',
          background: `linear-gradient(135deg, ${M.primary} 0%, ${M.accent} 60%, ${M.sage} 100%)`,
          color: M.primaryText, boxShadow: '0 4px 24px rgba(160,112,96,0.18)',
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.15em', opacity: 0.75, marginBottom: 4 }}>獨立女子廣告｜IDW Ads</p>
              <h1 style={{ fontSize: 26, fontWeight: 900, margin: 0 }}>代理商報價系統</h1>
              <p style={{ fontSize: 13, opacity: 0.7, marginTop: 4 }}>填入資訊 → 勾選服務 → 下載 Excel 報價單</p>
            </div>
            <div style={{ display: 'flex', gap: 12, background: 'rgba(255,255,255,0.18)', borderRadius: 16, padding: '12px 20px', backdropFilter: 'blur(4px)' }}>
              <ReceiptText size={28} />
              <div style={{ borderRight: '1px solid rgba(255,255,255,0.3)', paddingRight: 12, marginRight: 4 }}>
                <p style={{ fontSize: 10, opacity: 0.7, marginBottom: 2 }}>已選項目</p>
                <p style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>{chosenDetails.length}</p>
              </div>
              <div>
                <p style={{ fontSize: 10, opacity: 0.7, marginBottom: 2 }}>含稅總計</p>
                <p style={{ fontSize: 17, fontWeight: 900, margin: 0 }}>{currency(total)}</p>
              </div>
            </div>
          </div>
        </header>

        {/* ── TOP ERROR BANNER ─────────────────────────────────────────── */}
        <AnimatePresence>
          {topError && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ marginBottom: 16, padding: '10px 16px', borderRadius: 12, background: M.errorBg,
                border: `1px solid ${M.error}`, color: M.error, fontSize: 13, fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={16} />{topError}
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'minmax(0,1fr) 320px' }} className="quote-grid">

          {/* ── LEFT COLUMN ───────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* STEP 1 */}
            <section style={card}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 900, color: M.primaryDark, marginBottom: 20, marginTop: 0 }}>
                <span style={{ width: 24, height: 24, borderRadius: '50%', background: M.primary, color: M.primaryText, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, flexShrink: 0 }}>1</span>
                代理商資訊
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <FormField icon={Building2} label="甲方客戶名稱" name="endClientName" placeholder="最終客戶公司名稱"
                  required value={form.endClientName} error={errors.endClientName}
                  onChange={makeChangeHandler('endClientName')} />
                <FormField icon={Globe} label="甲方網址" name="endClientUrl" placeholder="https://（選填）"
                  value={form.endClientUrl} error={errors.endClientUrl}
                  onChange={makeChangeHandler('endClientUrl')} />
              </div>

              {/* 統編查詢 */}
              <div style={{ marginTop: 14 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: M.primary, marginBottom: 6 }}>
                  <Hash size={13} />代理商統一編號 <span style={{ color: M.error }}>*</span>
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input maxLength={8}
                    style={{ flex: 1, border: `1.5px solid ${errors.taxId ? M.error : M.border}`, borderRadius: 12, padding: '10px 12px', fontSize: 14, background: errors.taxId ? M.errorBg : M.card, color: M.textDark, outline: 'none' }}
                    placeholder="輸入 8 碼統一編號（如 80652314）"
                    value={form.taxId}
                    onChange={makeChangeHandler('taxId')}
                    onKeyDown={e => e.key === 'Enter' && handleLookup()}
                  />
                  <button onClick={handleLookup} disabled={lookupState === 'loading'}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 18px', borderRadius: 12, border: 'none', background: M.primary, color: M.primaryText, fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.target.style.background = M.primaryDark}
                    onMouseLeave={e => e.target.style.background = M.primary}>
                    {lookupState === 'loading' ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
                    查詢
                  </button>
                </div>
                {errors.taxId && <p style={{ marginTop: 4, fontSize: 11, color: M.error }}>{errors.taxId}</p>}
                <AnimatePresence>
                  {lookupMsg && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 10, fontSize: 12, fontWeight: 600,
                        background: lookupState === 'success' ? M.successBg : M.warningBg,
                        color: lookupState === 'success' ? M.success : M.warning }}>
                      {lookupState === 'success' ? <CircleCheck size={13} /> : <AlertCircle size={13} />}
                      {lookupMsg}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 公司抬頭 & Email（可編輯） */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 }}>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: M.primary, marginBottom: 6 }}>
                    <Building2 size={13} />代理商公司抬頭 <span style={{ color: M.error }}>*</span>
                    {lookupState === 'success' && <span style={{ marginLeft: 'auto', fontSize: 10, background: M.successBg, color: M.success, padding: '1px 6px', borderRadius: 8 }}>自動帶入</span>}
                  </label>
                  <input
                    style={{ width: '100%', boxSizing: 'border-box', border: `1.5px solid ${errors.companyTitle ? M.error : M.border}`, borderRadius: 12, padding: '10px 12px', fontSize: 14, background: errors.companyTitle ? M.errorBg : M.card, color: M.textDark, outline: 'none' }}
                    placeholder="自動帶入或手動輸入"
                    value={form.companyTitle}
                    onChange={makeChangeHandler('companyTitle')}
                    onFocus={e => e.target.style.borderColor = M.borderFocus}
                    onBlur={e => e.target.style.borderColor = errors.companyTitle ? M.error : M.border}
                  />
                  {errors.companyTitle && <p style={{ marginTop: 4, fontSize: 11, color: M.error }}>{errors.companyTitle}</p>}
                </div>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: M.primary, marginBottom: 6 }}>
                    <Mail size={13} />收件人 Email <span style={{ color: M.error }}>*</span>
                    {lookupState === 'success' && <span style={{ marginLeft: 'auto', fontSize: 10, background: M.successBg, color: M.success, padding: '1px 6px', borderRadius: 8 }}>自動帶入</span>}
                  </label>
                  <input type="email"
                    style={{ width: '100%', boxSizing: 'border-box', border: `1.5px solid ${errors.email ? M.error : M.border}`, borderRadius: 12, padding: '10px 12px', fontSize: 14, background: errors.email ? M.errorBg : M.card, color: M.textDark, outline: 'none' }}
                    placeholder="自動帶入或手動輸入"
                    value={form.email}
                    onChange={makeChangeHandler('email')}
                    onFocus={e => e.target.style.borderColor = M.borderFocus}
                    onBlur={e => e.target.style.borderColor = errors.email ? M.error : M.border}
                  />
                  {errors.email && <p style={{ marginTop: 4, fontSize: 11, color: M.error }}>{errors.email}</p>}
                </div>
              </div>

              <div style={{ marginTop: 14 }}>
                <FormField icon={User} label="窗口姓名" name="clientName" placeholder="代理商聯絡人姓名（選填）"
                  value={form.clientName} onChange={makeChangeHandler('clientName')} />
              </div>
            </section>

            {/* STEP 2 */}
            <section style={card}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 900, color: M.primaryDark, margin: 0 }}>
                  <span style={{ width: 24, height: 24, borderRadius: '50%', background: M.primary, color: M.primaryText, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900 }}>2</span>
                  選擇服務項目
                </h2>
                {errors.items && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: M.error, fontWeight: 600 }}>
                    <AlertCircle size={13} />{errors.items}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {serviceLibrary.map(group => (
                  <div key={group.category} style={{ border: `1px solid ${M.border}`, borderRadius: 14, overflow: 'hidden' }}>
                    <button onClick={() => setExpanded(p => ({ ...p, [group.category]: !p[group.category] }))}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: M.primaryBg, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: M.primaryDark }}>
                      <span>{group.category}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {group.items.some(i => selectedItems[i.name]) && (
                          <span style={{ background: M.primary, color: M.primaryText, fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 10 }}>
                            {group.items.filter(i => selectedItems[i.name]).length} 選
                          </span>
                        )}
                        {expanded[group.category] ? <ChevronUp size={15} color={M.primary} /> : <ChevronDown size={15} color={M.primary} />}
                      </div>
                    </button>

                    <AnimatePresence>
                      {expanded[group.category] && (
                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} style={{ overflow: 'hidden' }}>
                          {group.items.map(item => {
                            const checked = !!selectedItems[item.name];
                            const qty     = Number(qtyMap[item.name] || 1);
                            return (
                              <div key={item.name} style={{ borderTop: `1px solid ${M.border}`, background: checked ? '#F5F0ED' : M.card }}>
                                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px', cursor: 'pointer' }}>
                                  {/* Custom checkbox */}
                                  <div style={{ flexShrink: 0, marginTop: 2 }}>
                                    <input type="checkbox" style={{ display: 'none' }} checked={checked}
                                      onChange={e => {
                                        setSelectedItems(p => ({ ...p, [item.name]: e.target.checked }));
                                        setErrors(p => { const n = {...p}; delete n.items; return n; });
                                      }} />
                                    <div style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${checked ? M.primary : M.border}`, background: checked ? M.primary : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
                                      {checked && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 2.5" stroke="#FAFAF8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                                    </div>
                                  </div>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
                                      <span style={{ fontSize: 13, fontWeight: 600, color: checked ? M.primaryDark : M.textDark }}>{item.name}</span>
                                      <span style={{ fontSize: 13, fontWeight: 700, color: M.primary }}>{currency(item.unitPrice)} / {item.unit}</span>
                                    </div>
                                    <p style={{ fontSize: 11, color: M.textLight, margin: '3px 0 0' }}>{item.spec}</p>
                                  </div>
                                </label>

                                {/* Qty row */}
                                <AnimatePresence>
                                  {checked && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                                      <div style={{ borderTop: `1px solid ${M.border}`, padding: '8px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#EDE8E4' }}>
                                        <span style={{ fontSize: 11, color: M.textMid }}>數量</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                          <button onClick={() => setQtyMap(p => ({ ...p, [item.name]: Math.max(1, qty - 1) }))}
                                            style={{ width: 26, height: 26, borderRadius: '50%', border: `1.5px solid ${M.border}`, background: M.card, color: M.primary, fontWeight: 700, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>−</button>
                                          <span style={{ fontSize: 13, fontWeight: 700, color: M.primaryDark, minWidth: 24, textAlign: 'center' }}>{qty}</span>
                                          <button onClick={() => setQtyMap(p => ({ ...p, [item.name]: qty + 1 }))}
                                            style={{ width: 26, height: 26, borderRadius: '50%', border: `1.5px solid ${M.border}`, background: M.card, color: M.primary, fontWeight: 700, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>+</button>
                                          <span style={{ fontSize: 13, fontWeight: 700, color: M.primaryDark, minWidth: 72, textAlign: 'right' }}>{currency(qty * item.unitPrice)}</span>
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

            {/* STEP 3 */}
            <section style={card}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 900, color: M.primaryDark, marginBottom: 16, marginTop: 0 }}>
                <span style={{ width: 24, height: 24, borderRadius: '50%', background: M.primary, color: M.primaryText, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900 }}>3</span>
                其他說明
              </h2>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: M.primary, marginBottom: 6 }}>
                <StickyNote size={13} />備註（選填）
              </label>
              <textarea rows={3}
                style={{ width: '100%', boxSizing: 'border-box', border: `1.5px solid ${M.border}`, borderRadius: 12, padding: '10px 12px', fontSize: 14, color: M.textDark, background: M.card, outline: 'none', resize: 'none', fontFamily: 'inherit' }}
                placeholder="付款方式、特殊需求或備忘事項…"
                value={form.otherNote}
                onChange={makeChangeHandler('otherNote')}
                onFocus={e => e.target.style.borderColor = M.borderFocus}
                onBlur={e => e.target.style.borderColor = M.border}
              />
            </section>

            {/* ACTION BUTTONS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <button onClick={handleExcelDownload}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px 0', borderRadius: 16, border: 'none', background: `linear-gradient(135deg, ${M.sage}, ${M.sageDark})`, color: '#FAFAF8', fontSize: 15, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 16px rgba(100,140,120,0.2)', transition: 'all 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                <Download size={18} />下載 Excel 報價單
              </button>
              <button onClick={handleSubmit} disabled={submitState === 'loading'}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px 0', borderRadius: 16, border: 'none', background: `linear-gradient(135deg, ${M.primary}, ${M.primaryDark})`, color: '#FAFAF8', fontSize: 15, fontWeight: 800, cursor: submitState === 'loading' ? 'not-allowed' : 'pointer', opacity: submitState === 'loading' ? 0.6 : 1, boxShadow: '0 4px 16px rgba(160,112,96,0.2)', transition: 'all 0.15s' }}
                onMouseEnter={e => { if (submitState !== 'loading') e.currentTarget.style.opacity = '0.88'; }}
                onMouseLeave={e => e.currentTarget.style.opacity = submitState === 'loading' ? '0.6' : '1'}>
                {submitState === 'loading' ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                送出並寄信通知
              </button>
            </div>
          </div>

          {/* ── RIGHT COLUMN ──────────────────────────────────────────── */}
          <div style={{ position: 'sticky', top: 20, alignSelf: 'start', display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* 摘要卡 */}
            <div style={card}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 800, color: M.primaryDark, marginTop: 0, marginBottom: 16 }}>
                <BadgeDollarSign size={15} color={M.primary} />報價摘要
              </h3>

              {chosenDetails.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <FileText size={36} color={M.border} style={{ margin: '0 auto 8px' }} />
                  <p style={{ fontSize: 12, color: M.textLight }}>尚未選擇服務項目</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {chosenDetails.map(item => (
                    <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 600, color: M.textDark, margin: 0 }}>{item.name}</p>
                        <p style={{ fontSize: 11, color: M.textLight, margin: '2px 0 0' }}>{item.unit} × {item.qty}</p>
                      </div>
                      <p style={{ fontSize: 12, fontWeight: 700, color: M.textDark, flexShrink: 0 }}>{currency(item.subtotal)}</p>
                    </div>
                  ))}
                </div>
              )}

              {chosenDetails.length > 0 && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${M.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: M.textMid, marginBottom: 6 }}>
                    <span>未稅合計</span><span style={{ fontWeight: 600 }}>{currency(subtotal)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: M.textMid, marginBottom: 10 }}>
                    <span>營業稅 (5%)</span><span style={{ fontWeight: 600 }}>{currency(tax)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 12, background: `linear-gradient(135deg, ${M.primary}, ${M.primaryDark})`, color: M.primaryText }}>
                    <span style={{ fontSize: 12, fontWeight: 700 }}>含稅總計</span>
                    <span style={{ fontSize: 18, fontWeight: 900 }}>{currency(total)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Info 卡 */}
            <div style={{ borderRadius: 20, padding: 20, background: `linear-gradient(135deg, ${M.accent} 0%, ${M.primary} 100%)`, color: M.primaryText, boxShadow: '0 4px 16px rgba(160,112,96,0.15)' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 800, margin: '0 0 12px' }}>
                <Sparkles size={14} />自動化流程
              </h4>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: 11, opacity: 0.85, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <li>▸ 統編查詢自動帶入（可手動修改）</li>
                <li>▸ 「下載 Excel」→ 產生報價單檔案</li>
                <li>▸ 「送出並寄信」→ 寫入 Sheets + 發信</li>
                <li>▸ CC：newchin930@gmail.com</li>
                <li>▸ CC：idwomantw@gmail.com</li>
              </ul>
            </div>

            {chosenDetails.length >= 8 && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 14px', borderRadius: 12, background: M.warningBg, border: `1px solid ${M.warning}`, fontSize: 11, color: M.warning }}>
                <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                Google Sheets 模板最多寫入 8 筆明細，超出部分不寫入（Excel 不受此限）。
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── SUCCESS MODAL ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {successOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(60,50,45,0.55)', backdropFilter: 'blur(4px)', padding: 16 }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              style={{ width: '100%', maxWidth: 360, borderRadius: 28, overflow: 'hidden', background: M.card, boxShadow: '0 20px 60px rgba(60,50,45,0.2)' }}>
              <div style={{ padding: '28px 0 20px', textAlign: 'center', background: `linear-gradient(135deg, ${M.primary}, ${M.sage})` }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                  <CheckCircle2 size={36} color={M.primaryText} />
                </div>
              </div>
              <div style={{ padding: '24px 28px', textAlign: 'center' }}>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: M.textDark, margin: '0 0 8px' }}>送出成功！</h2>
                <p style={{ fontSize: 13, color: M.textMid, margin: 0 }}>
                  報價資料已記錄，報價單連結將寄至<br />
                  <strong style={{ color: M.primary }}>{form.email}</strong>
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 20 }}>
                  <button onClick={handleExcelDownload}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 0', borderRadius: 12, border: 'none', background: M.sageBg, color: M.sageDark, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                    <Download size={14} />下載 Excel
                  </button>
                  <button onClick={resetForm}
                    style={{ padding: '10px 0', borderRadius: 12, border: 'none', background: M.primary, color: M.primaryText, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                    完成
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 響應式 grid fallback ─────────────────────────────────────────── */}
      <style>{`
        @media (max-width: 720px) {
          .quote-grid { grid-template-columns: 1fr !important; }
        }
        * { box-sizing: border-box; }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
