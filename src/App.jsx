import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, FileText, CheckCircle2, Loader2, Send,
  Download, AlertCircle, BadgeDollarSign, ChevronDown, ChevronUp,
  User, Mail, Hash, StickyNote, Sparkles,
  Wrench, Users, Palette, Gift, UserCheck, MapPin, Calculator,
  Phone, TrendingUp, ClipboardList, RefreshCw, Calendar, CreditCard,
  FileSignature, Percent,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// 莫蘭迪色系 tokens
// ─────────────────────────────────────────────────────────────────────────────
const M = {
  bg:          '#F2EDE8',
  card:        '#FAFAF8',
  border:      '#E0D8D0',
  borderFocus: '#C4998B',
  primary:     '#B08478',
  primaryDark: '#9A6E63',
  primaryBg:   '#EDE3DF',
  primaryText: '#FAFAF8',
  sage:        '#8FA89A',
  sageDark:    '#6F8A7C',
  sageBg:      '#E4EDEA',
  accent:      '#A89880',
  textDark:    '#4A4540',
  textMid:     '#7A706A',
  textLight:   '#ABA4A0',
  error:       '#C0827A',
  errorBg:     '#F5ECEB',
  success:     '#7A9E8A',
  successBg:   '#E4EDEA',
  warning:     '#B09870',
  warningBg:   '#F2EBE0',
  internal:    '#F0EDE4',
  internalBdr: '#C8B8A8',
};

// ─────────────────────────────────────────────────────────────────────────────
// API CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const GAS_URL = import.meta.env.VITE_GAS_URL;

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const AGENT_OPTIONS = ['品客', 'Edda', 'Joe', 'Martin'];

const TRAVEL_TYPES = ['公關', '高鐵', '火車', '計程車', '伙食', '其他'];

const DEFAULT_TERMS =
`1.本委刊單簽立發票,或經雙方授權代代表人簽章後即視為正式合約，詳細合作條款可另行以合約方式簽立調整，依照雙方協議後調整之。
2.本報價一個月內有效，如延期簽約或支付款項，乙方將保有上線時間最終權利，並不保證上線時間。
3.提前解約需於30日前以書面資料通知，已付清之款項恕不退費，如途中任意取消則按委刊報價總金額50%。
4.本委刊單專案內容，甲方委任乙方執行後，甲方若有大幅度變更方向及內容，乙方再依新變更項目、內容，重新提報報價委刊單。
5.甲方應保證委刊之廣告內容，不致有侵害任何第三人之著作權、商標專用權及無其他虛偽不實或引人錯誤之情事，如有任何糾紛應自行負責解決或賠償，並對乙方負損害賠償責任，若有違法或侵權之廣告，乙方得停止刊登該廣告。
6.每月費用需於執行月份之前一月最後一日完成匯款，若款項支付時間延遲，每延遲1日應按工作日，專案總價金百分之五計算，按日賠償乙方至款項付清為止。
7.如合約委刊內容均已達成，甲方不得以任何理由延遲、少付或拒付款項，否則乙方有權依照本合約逕行向法院申請強制支付命令，甲方不得異議。
8.本委刊單經雙方簽署後即行生效，委刊期間若有爭議產生，雙方合議以台灣台中地方法院為第一審管轄法院。
9.SEO走期最低1年，顧問最低半年，其餘服務內容依照規劃期需求而定。
10.獨立女子廣告以「電子合約」及「電子發票」為主，如需「紙本合約」請與服務窗口申請，恕無紙本發票，感謝您的配合。`;

// ─────────────────────────────────────────────────────────────────────────────
// MOCK SERVICE LIBRARY (含 unitCost，實際上線後改從 GAS getServiceLibrary 讀取)
// ─────────────────────────────────────────────────────────────────────────────
const serviceLibrary = [
  {
    category: 'Meta / 社群廣告',
    items: [
      { name: 'Meta 廣告投放',  spec: 'FB / IG 廣告帳戶操作與優化',    unitPrice: 12000, unitCost: 7000,  unit: '案' },
      { name: '廣告素材企劃',   spec: '單月圖文與文案規劃',              unitPrice: 8000,  unitCost: 4500,  unit: '份' },
      { name: '再行銷設定',     spec: '像素、轉換事件與受眾設定',        unitPrice: 5000,  unitCost: 2500,  unit: '次' },
    ],
  },
  {
    category: '口碑 / 網紅',
    items: [
      { name: '微網紅合作',   spec: '1萬以下追蹤數，新品試用或評測',   unitPrice: 3500,  unitCost: 2500,  unit: '篇' },
      { name: '中網紅合作',   spec: '1-10萬追蹤數，指定主題業配',      unitPrice: 15000, unitCost: 10000, unit: '篇' },
      { name: '大網紅合作',   spec: '10萬以上追蹤數，整合行銷合作',    unitPrice: 45000, unitCost: 32000, unit: '篇' },
    ],
  },
  {
    category: '內容製作',
    items: [
      { name: '品牌圖文設計',       spec: '社群貼文主視覺設計',          unitPrice: 2500,  unitCost: 1200,  unit: '則' },
      { name: '短影音腳本',         spec: 'Reels / Shorts 腳本企劃',     unitPrice: 4500,  unitCost: 2000,  unit: '支' },
      { name: 'Landing Page 文案',  spec: '單頁式活動頁文案撰寫',        unitPrice: 9000,  unitCost: 4500,  unit: '頁' },
    ],
  },
  {
    category: '網站與數據',
    items: [
      { name: 'GA4 / GTM 追蹤建置', spec: 'GA4、GTM 與事件追蹤設定',     unitPrice: 10000, unitCost: 5000,  unit: '案' },
      { name: 'SEO 關鍵字優化',     spec: '頁面結構與關鍵字優化',         unitPrice: 15000, unitCost: 8000,  unit: '案' },
      { name: '成效報表整理',       spec: '月報、投放成效與分析建議',     unitPrice: 6000,  unitCost: 2500,  unit: '月' },
    ],
  },
  {
    category: '品牌策略',
    items: [
      { name: '品牌定位工作坊', spec: '品牌核心價值與受眾梳理',          unitPrice: 30000, unitCost: 15000, unit: '場' },
      { name: '年度行銷規劃',   spec: '年度活動節奏與投放建議',          unitPrice: 40000, unitCost: 18000, unit: '份' },
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

const todayCompact = () => {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
};

const pct = (n) => `${(n * 100).toFixed(1)}%`;

// cost row helpers
const addRow    = (setter, init) => setter(p => [...p, { ...init }]);
const updateRow = (setter, i, field, val) => setter(p => p.map((r, idx) => idx === i ? { ...r, [field]: val } : r));
const removeRow = (setter, i) => setter(p => p.filter((_, idx) => idx !== i));
const sumRows   = (rows) => rows.reduce((s, r) => s + Number(r.cost || 0), 0);

// ─────────────────────────────────────────────────────────────────────────────
// EXCEL GENERATOR
// ─────────────────────────────────────────────────────────────────────────────
function buildExcelXML(form, agents, chosenDetails, calcResult, subtotal, tax, total) {
  const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const S  = (v, id)  => `<Cell ss:StyleID="${id}"><Data ss:Type="String">${esc(v)}</Data></Cell>`;
  const N  = (v, id)  => `<Cell ss:StyleID="${id}"><Data ss:Type="Number">${Number(v) || 0}</Data></Cell>`;
  const MC = (v, id, span) => `<Cell ss:StyleID="${id}" ss:MergeAcross="${span}"><Data ss:Type="String">${esc(v)}</Data></Cell>`;
  const SP = () => `<Cell ss:StyleID="sp"/>`;

  const itemRows = [...chosenDetails.slice(0, 8)];
  while (itemRows.length < 8) itemRows.push(null);

  const fp  = calcResult ? calcResult.finalPrice : subtotal;
  const tx  = calcResult ? calcResult.taxAmt : tax;
  const tot = fp + tx;
  const agentStr = agents.filter(Boolean).join('/');

  const styleBlock = `
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
    <Style ss:ID="it"><Font ss:Size="9" ss:Name="Microsoft JhengHei"/><Interior ss:Color="#FAFAF8" ss:Pattern="Solid"/><Alignment ss:Vertical="Center"/><Borders><Border ss:Position="All" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E0D8D0"/></Borders></Style>
    <Style ss:ID="itC"><Font ss:Size="9" ss:Name="Microsoft JhengHei"/><Interior ss:Color="#FAFAF8" ss:Pattern="Solid"/><Alignment ss:Horizontal="Center" ss:Vertical="Center"/><Borders><Border ss:Position="All" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E0D8D0"/></Borders></Style>
    <Style ss:ID="mo"><Font ss:Size="9" ss:Name="Microsoft JhengHei"/><Interior ss:Color="#FAFAF8" ss:Pattern="Solid"/><Alignment ss:Horizontal="Right"/><NumberFormat ss:Format="#,##0"/><Borders><Border ss:Position="All" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E0D8D0"/></Borders></Style>
    <Style ss:ID="tl"><Font ss:Bold="1" ss:Size="9" ss:Color="#9A6E63" ss:Name="Microsoft JhengHei"/><Interior ss:Color="#EDE3DF" ss:Pattern="Solid"/><Alignment ss:Horizontal="Right" ss:Vertical="Center"/><Borders><Border ss:Position="All" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E0D8D0"/></Borders></Style>
    <Style ss:ID="gr"><Font ss:Bold="1" ss:Size="11" ss:Color="#FAFAF8" ss:Name="Microsoft JhengHei"/><Interior ss:Color="#9A6E63" ss:Pattern="Solid"/><Alignment ss:Horizontal="Right" ss:Vertical="Center"/><NumberFormat ss:Format="#,##0"/><Borders><Border ss:Position="All" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#9A6E63"/></Borders></Style>
    <Style ss:ID="profH"><Font ss:Bold="1" ss:Size="10" ss:Color="#FAFAF8" ss:Name="Microsoft JhengHei"/><Interior ss:Color="#8FA89A" ss:Pattern="Solid"/><Alignment ss:Horizontal="Center" ss:Vertical="Center"/></Style>
    <Style ss:ID="profV"><Font ss:Size="9" ss:Name="Microsoft JhengHei"/><Interior ss:Color="#F0F5F3" ss:Pattern="Solid"/><Alignment ss:Horizontal="Right"/><NumberFormat ss:Format="#,##0"/><Borders><Border ss:Position="All" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#C8D8D0"/></Borders></Style>
    <Style ss:ID="sp"><Interior ss:Color="#F2EDE8" ss:Pattern="Solid"/></Style>
  </Styles>`;

  const quoteSheet = `
  <Worksheet ss:Name="報價單">
    <Table ss:DefaultRowHeight="20">
      <Column ss:Width="100"/><Column ss:Width="160"/><Column ss:Width="48"/>
      <Column ss:Width="100"/><Column ss:Width="160"/><Column ss:Width="48"/><Column ss:Width="90"/>
      <Row ss:Height="38">${MC('獨 立 女 子｜客 戶 報 價 單', 'title', 6)}</Row>
      <Row ss:Height="6">${SP()}${SP()}${SP()}${SP()}${SP()}${SP()}${SP()}</Row>
      <Row ss:Height="20">${MC('甲方資訊', 'sHead', 2)}${SP()}${MC('乙方資訊', 'sHead', 2)}${SP()}${SP()}</Row>
      <Row ss:Height="22">${S('甲方抬頭','lb')}${S(form.clientTitle,'val')}${SP()}${S('專案名稱','lb')}${S(form.projectName,'val')}${SP()}${SP()}</Row>
      <Row ss:Height="22">${S('統一編號','lb')}${S(form.clientTaxId,'val')}${SP()}${S('負責窗口','lb')}${S(agentStr,'val')}${SP()}${SP()}</Row>
      <Row ss:Height="22">${S('窗口姓名','lb')}${S(form.clientContact,'val')}${SP()}${S('聯絡電話','lb')}${S('02-77522532 #105','val')}${SP()}${SP()}</Row>
      <Row ss:Height="22">${S('電子郵件','lb')}${S(form.clientEmail,'val')}${SP()}${S('報價日期','lb')}${S(todayStr(),'val')}${SP()}${SP()}</Row>
      <Row ss:Height="22">${S('專案走期','lb')}<Cell ss:StyleID="val" ss:MergeAcross="1"><Data ss:Type="String">${esc(form.projectDuration)}</Data></Cell>${SP()}${SP()}${SP()}${SP()}</Row>
      <Row ss:Height="8">${SP()}${SP()}${SP()}${SP()}${SP()}${SP()}${SP()}</Row>
      <Row ss:Height="22">${S('服務項目','colH')}${S('規格說明','colH')}${S('數量','colH')}${S('單價','colH')}${S('單位','colH')}${S('','colH')}${S('小計','colH')}</Row>
      ${itemRows.map(item => item
        ? `<Row ss:Height="20">${S(item.name,'it')}${S(item.spec,'it')}${N(item.qty,'itC')}${N(item.unitPrice,'mo')}${S(item.unit,'itC')}${N(1,'itC')}${N(item.subtotal,'mo')}</Row>`
        : `<Row ss:Height="20">${S('','it')}${S('','it')}${S('','itC')}${S('','mo')}${S('','itC')}${S('','itC')}${S('','mo')}</Row>`
      ).join('\n      ')}
      <Row ss:Height="8">${SP()}${SP()}${SP()}${SP()}${SP()}${SP()}${SP()}</Row>
      ${calcResult?.mgmtFeeAmt ? `<Row ss:Height="22">${SP()}${SP()}${SP()}${SP()}<Cell ss:StyleID="tl" ss:MergeAcross="1"><Data ss:Type="String">＋專案管理費 10%</Data></Cell>${N(calcResult.mgmtFeeAmt,'mo')}</Row>` : ''}
      <Row ss:Height="22">${SP()}${SP()}${SP()}${SP()}<Cell ss:StyleID="tl" ss:MergeAcross="1"><Data ss:Type="String">報價合計（未稅）</Data></Cell>${N(fp,'mo')}</Row>
      <Row ss:Height="22">${SP()}${SP()}${SP()}${SP()}<Cell ss:StyleID="tl" ss:MergeAcross="1"><Data ss:Type="String">營業稅 (5%)</Data></Cell>${N(tx,'mo')}</Row>
      <Row ss:Height="26">${SP()}${SP()}${SP()}${SP()}<Cell ss:StyleID="gr" ss:MergeAcross="1"><Data ss:Type="String">含稅總計</Data></Cell>${N(tot,'gr')}</Row>
      ${form.quoteNote ? `<Row ss:Height="8">${SP()}${SP()}${SP()}${SP()}${SP()}${SP()}${SP()}</Row><Row ss:Height="22">${S('備註','lb')}<Cell ss:StyleID="val" ss:MergeAcross="5"><Data ss:Type="String">${esc(form.quoteNote)}</Data></Cell></Row>` : ''}
    </Table>
  </Worksheet>`;

  const profitSheet = calcResult ? `
  <Worksheet ss:Name="成本毛利（內部）">
    <Table ss:DefaultRowHeight="20">
      <Column ss:Width="130"/><Column ss:Width="110"/>
      <Row ss:Height="26">${MC('成本明細 & 毛利試算（內部）', 'profH', 1)}</Row>
      <Row ss:Height="22">${S('服務成本','lb')}${N(calcResult.serviceCostSum,'profV')}</Row>
      <Row ss:Height="22">${S('工具攤提','lb')}${N(calcResult.costs.tool,'profV')}</Row>
      <Row ss:Height="22">${S('發包成本','lb')}${N(calcResult.costs.partner,'profV')}</Row>
      <Row ss:Height="22">${S('設計費','lb')}${N(calcResult.costs.design,'profV')}</Row>
      <Row ss:Height="22">${S('開案獎金','lb')}${N(calcResult.costs.bonus,'profV')}</Row>
      <Row ss:Height="22">${S('工讀費','lb')}${N(calcResult.costs.staff,'profV')}</Row>
      <Row ss:Height="22">${S('差旅費','lb')}${N(calcResult.costs.travel,'profV')}</Row>
      <Row ss:Height="22">${S('成本總計','tl')}${N(calcResult.totalCost,'mo')}</Row>
      <Row ss:Height="8"></Row>
      <Row ss:Height="22">${S('報價合計（未稅）','lb')}${N(calcResult.finalPrice,'profV')}</Row>
      <Row ss:Height="22">${S('毛利','lb')}${N(calcResult.profit,'profV')}</Row>
      <Row ss:Height="22">${S('毛利率','lb')}<Cell ss:StyleID="profV"><Data ss:Type="String">${pct(calcResult.margin)}</Data></Cell></Row>
    </Table>
  </Worksheet>` : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
          xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
${styleBlock}
${quoteSheet}
${profitSheet}
</Workbook>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
const inputSt = (err) => ({
  width: '100%', boxSizing: 'border-box',
  border: `1.5px solid ${err ? M.error : M.border}`,
  borderRadius: 10, padding: '9px 11px', fontSize: 13,
  background: err ? M.errorBg : M.card,
  color: M.textDark, outline: 'none', fontFamily: 'inherit',
});

const FormField = React.memo(function FormField({ icon: Icon, label, name, placeholder, type = 'text', required, value, error, onChange, half }) {
  return (
    <div style={half ? {} : {}}>
      <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: M.primary, marginBottom: 5 }}>
        {Icon && <Icon size={12} />}{label}{required && <span style={{ color: M.error }}>*</span>}
      </label>
      <input type={type} placeholder={placeholder} value={value} onChange={onChange}
        style={inputSt(error)}
        onFocus={e => { e.target.style.borderColor = M.borderFocus; }}
        onBlur={e => { e.target.style.borderColor = error ? M.error : M.border; }} />
      {error && <p style={{ marginTop: 3, fontSize: 11, color: M.error }}>{error}</p>}
    </div>
  );
});

function SectionHeader({ num, label }) {
  return (
    <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 900, color: M.primaryDark, margin: '0 0 18px' }}>
      {num && <span style={{ width: 24, height: 24, borderRadius: '50%', background: M.primary, color: M.primaryText, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, flexShrink: 0 }}>{num}</span>}
      {label}
    </h2>
  );
}

function InternalBox({ icon: Icon, title, children }) {
  return (
    <div style={{ background: M.internal, border: `2px dashed ${M.internalBdr}`, borderRadius: 14, padding: 18, marginTop: 4 }}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 800, color: M.primaryDark, margin: '0 0 14px' }}>
        {Icon && <Icon size={14} color={M.primary} />}{title}
      </h3>
      {children}
    </div>
  );
}

function AddBtn({ onClick, label }) {
  return (
    <button type="button" onClick={onClick}
      style={{ marginTop: 6, background: 'none', border: `1px dashed ${M.internalBdr}`, color: M.textMid, padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 12 }}>
      ＋ {label}
    </button>
  );
}

function RemoveBtn({ onClick }) {
  return (
    <button type="button" onClick={onClick}
      style={{ width: 30, height: 30, flexShrink: 0, background: M.errorBg, border: 'none', borderRadius: 8, color: M.error, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>
      ×
    </button>
  );
}

function CostRowInputs({ row, i, setter, namePlaceholder, costPlaceholder, nameType = 'text', nameOptions }) {
  const canRemove = true;
  const nameEl = nameType === 'select' ? (
    <select value={row.name} onChange={e => updateRow(setter, i, 'name', e.target.value)}
      style={{ ...inputSt(false), flex: 1 }}>
      <option value="">-- 選擇類型 --</option>
      {nameOptions.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  ) : (
    <input value={row.name} onChange={e => updateRow(setter, i, 'name', e.target.value)}
      placeholder={namePlaceholder} style={{ ...inputSt(false), flex: 1 }} />
  );
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
      {nameEl}
      <input type="number" value={row.cost} onChange={e => updateRow(setter, i, 'cost', e.target.value)}
        placeholder={costPlaceholder} style={{ ...inputSt(false), width: 120, flex: 'none' }} />
      <RemoveBtn onClick={() => removeRow(setter, i)} />
    </div>
  );
}

// Payment plan row
function PlanRow({ label, price, profit, margin, highlight }) {
  const tax = Math.round(price * 0.05);
  return (
    <tr style={{ background: highlight ? M.primaryBg : M.card }}>
      <td style={{ padding: '7px 10px', fontSize: 12, fontWeight: 600, color: M.textDark }}>{label}</td>
      <td style={{ padding: '7px 10px', fontSize: 12, textAlign: 'right', color: M.textDark }}>{currency(price)}</td>
      <td style={{ padding: '7px 10px', fontSize: 12, textAlign: 'right', color: M.textMid }}>{currency(tax)}</td>
      <td style={{ padding: '7px 10px', fontSize: 12, textAlign: 'right', fontWeight: 700, color: M.primaryDark }}>{currency(price + tax)}</td>
      <td style={{ padding: '7px 10px', fontSize: 12, textAlign: 'right', color: M.error, fontWeight: 700 }}>{currency(profit)}</td>
      <td style={{ padding: '7px 10px', fontSize: 12, textAlign: 'right', color: M.error }}>{pct(margin)}</td>
    </tr>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function AgencyQuoteApp() {

  // ── Basic form ─────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    clientTitle:      '',
    clientTaxId:      '',
    clientContact:    '',
    clientPhone:      '',
    clientEmail:      '',
    projectName:      '',
    projectDuration:  '',
    // 甲方簽約資訊
    contractContact:  '',
    contractRep:      '',
    contractTaxId:    '',
    contractPhone:    '',
    contractAddress:  '',
    // 其他
    quoteTerms:       DEFAULT_TERMS,
    quoteNote:        '',
  });

  // ── Agents & quote type ────────────────────────────────────────────────────
  const [agentChecked, setAgentChecked] = useState({ '品客': false, 'Edda': true, 'Joe': false, 'Martin': false });
  const [quoteType,    setQuoteType]    = useState('annual'); // 'annual' | 'onetime'
  const [addMgmtFee,  setAddMgmtFee]   = useState(false);
  const [contractOpen, setContractOpen] = useState(false);

  // ── Services ───────────────────────────────────────────────────────────────
  const [selectedItems, setSelectedItems] = useState({});
  const [qtyMap,        setQtyMap]        = useState({});
  const [expanded,      setExpanded]      = useState(() =>
    Object.fromEntries(serviceLibrary.map(g => [g.category, true]))
  );

  // ── Cost rows ──────────────────────────────────────────────────────────────
  const [toolRows,    setToolRows]    = useState([{ name: 'Ahrefs', cost: '' }, { name: 'OPView', cost: '' }]);
  const [partnerRows, setPartnerRows] = useState([{ name: '', cost: '' }]);
  const [designRows,  setDesignRows]  = useState([{ name: '', cost: '' }]);
  const [bonusRows,   setBonusRows]   = useState([{ name: '', cost: '' }]);
  const [staffRows,   setStaffRows]   = useState([{ name: '', cost: '' }]);
  const [travelRows,  setTravelRows]  = useState([{ name: '', cost: '' }]);

  // ── Calc & UI state ────────────────────────────────────────────────────────
  const [calcResult,  setCalcResult]  = useState(null);
  const [submitState, setSubmitState] = useState('idle');
  const [errors,      setErrors]      = useState({});
  const [successOpen, setSuccessOpen] = useState(false);
  const [topError,    setTopError]    = useState('');
  const [successData, setSuccessData] = useState(null);

  // ── Computed values ────────────────────────────────────────────────────────
  const allItemsFlat = useMemo(
    () => serviceLibrary.flatMap(g => g.items.map(i => ({ ...i, category: g.category }))), []
  );

  const chosenDetails = useMemo(() =>
    allItemsFlat
      .filter(i => selectedItems[i.name])
      .map(i => { const qty = Number(qtyMap[i.name] || 1); return { ...i, qty, subtotal: qty * i.unitPrice, costTotal: qty * i.unitCost }; }),
    [allItemsFlat, qtyMap, selectedItems]
  );

  const serviceSubtotal = chosenDetails.reduce((s, i) => s + i.subtotal, 0);
  const tax             = Math.round(serviceSubtotal * 0.05);
  const total           = serviceSubtotal + tax;

  const extraCostLive = useMemo(() => {
    return [toolRows, partnerRows, designRows, bonusRows, staffRows, travelRows]
      .reduce((s, rows) => s + sumRows(rows), 0);
  }, [toolRows, partnerRows, designRows, bonusRows, staffRows, travelRows]);

  const serviceCostLive = chosenDetails.reduce((s, i) => s + i.costTotal, 0);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const setField = useCallback((name) => (e) => {
    setForm(p => ({ ...p, [name]: e.target.value }));
    setErrors(p => { const n = { ...p }; delete n[name]; return n; });
    setCalcResult(null);
  }, []);

  // ── Run calc ────────────────────────────────────────────────────────────────
  const runCalc = () => {
    const mgmtFeeAmt  = addMgmtFee ? Math.round(serviceSubtotal * 0.1) : 0;
    const finalPrice  = serviceSubtotal + mgmtFeeAmt;
    const taxAmt      = Math.round(finalPrice * 0.05);
    const taxTotal    = finalPrice + taxAmt;
    const serviceCostSum = chosenDetails.reduce((s, i) => s + i.costTotal, 0);

    // Auto-calc bonus: 5% of service subtotal, split among bonus rows
    const bonusTotalAuto = Math.round(serviceSubtotal * 0.05);
    const perPerson = bonusRows.length > 0 ? Math.round(bonusTotalAuto / bonusRows.length) : 0;
    setBonusRows(prev => prev.map(r => ({ ...r, cost: String(perPerson) })));

    const costs = {
      tool:    sumRows(toolRows),
      partner: sumRows(partnerRows),
      design:  sumRows(designRows),
      bonus:   bonusTotalAuto,
      staff:   sumRows(staffRows),
      travel:  sumRows(travelRows),
    };
    const totalCost = serviceCostSum + Object.values(costs).reduce((s, v) => s + v, 0);
    const profit    = finalPrice - totalCost;
    const margin    = finalPrice > 0 ? profit / finalPrice : 0;

    const planCalc = (price, costShare) => {
      const p = price - costShare;
      const m = price > 0 ? p / price : 0;
      return { price, profit: p, margin: m };
    };

    setCalcResult({
      serviceSubtotal, serviceCostSum, mgmtFeeAmt, finalPrice,
      taxAmt, taxTotal, costs, totalCost, profit, margin,
      plans: {
        monthly:   planCalc(Math.round(finalPrice / 12),       Math.round(totalCost / 12)),
        quarterly: planCalc(Math.round(finalPrice * 0.95 / 4), Math.round(totalCost / 4)),
        annual:    planCalc(Math.round(finalPrice * 0.9),       totalCost),
        onetime:   planCalc(finalPrice,                         totalCost),
      },
    });

    setTimeout(() => document.getElementById('calcResultAnchor')?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  // ── Validate ────────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.clientTitle.trim())  e.clientTitle  = '必填';
    if (!form.clientEmail.trim())  e.clientEmail  = '必填';
    if (chosenDetails.length === 0) e.items        = '請至少勾選一項服務';
    if (!calcResult)                e.calc         = '請先點選「試算利潤」';
    setErrors(e);
    if (Object.keys(e).length > 0) {
      setTopError('尚有必填欄位未完成，請往上確認');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return false;
    }
    setTopError('');
    return true;
  };

  // ── Excel download ──────────────────────────────────────────────────────────
  const handleExcelDownload = () => {
    const agentList = AGENT_OPTIONS.filter(a => agentChecked[a]);
    const xml  = buildExcelXML(form, agentList, chosenDetails, calcResult, serviceSubtotal, tax, total);
    const blob = new Blob(['\uFEFF' + xml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `報價單_${form.clientTitle || '客戶'}_${todayCompact()}.xls`;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitState('loading');

    const costTotals = {
      toolCostTotal:    sumRows(toolRows),
      partnerCostTotal: sumRows(partnerRows),
      designCostTotal:  sumRows(designRows),
      bonusCostTotal:   calcResult.costs.bonus,
      staffCostTotal:   sumRows(staffRows),
      travelCostTotal:  sumRows(travelRows),
    };

    const payload = {
      clientTitle:     form.clientTitle,
      clientTaxId:     form.clientTaxId,
      clientContact:   form.clientContact,
      clientPhone:     form.clientPhone,
      clientEmail:     form.clientEmail,
      projectName:     form.projectName,
      projectDuration: form.projectDuration,
      agentName:       AGENT_OPTIONS.filter(a => agentChecked[a]).join('/'),
      quoteType:       quoteType,
      contractContact: form.contractContact,
      contractRep:     form.contractRep,
      contractTaxId:   form.contractTaxId,
      contractPhone:   form.contractPhone,
      contractAddress: form.contractAddress,
      quoteTerms:      form.quoteTerms,
      quoteNote:       form.quoteNote,
      totalPrice:      String(calcResult.finalPrice),
      selectedServices: chosenDetails.map(d => d.name),
      partnerName1:    partnerRows[0]?.name || '',
      costDataJson:    JSON.stringify(costTotals),
      ...Object.fromEntries(chosenDetails.map(d => [`qty_${d.name}`, String(d.qty)])),
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
      setSuccessData({ email: form.clientEmail, profit: calcResult.profit });
      setSuccessOpen(true);
    } catch (err) {
      setSubmitState('error');
      setTopError('送出時發生錯誤，請確認網路或 GAS 部署狀態。');
    }
  };

  // ── Reset ────────────────────────────────────────────────────────────────────
  const resetForm = () => {
    setForm({ clientTitle: '', clientTaxId: '', clientContact: '', clientPhone: '', clientEmail: '',
      projectName: '', projectDuration: '', contractContact: '', contractRep: '', contractTaxId: '',
      contractPhone: '', contractAddress: '', quoteTerms: DEFAULT_TERMS, quoteNote: '' });
    setAgentChecked({ '品客': false, 'Edda': true, 'Joe': false, 'Martin': false });
    setQuoteType('annual'); setAddMgmtFee(false);
    setSelectedItems({}); setQtyMap({});
    setToolRows([{ name: 'Ahrefs', cost: '' }, { name: 'OPView', cost: '' }]);
    setPartnerRows([{ name: '', cost: '' }]); setDesignRows([{ name: '', cost: '' }]);
    setBonusRows([{ name: '', cost: '' }]); setStaffRows([{ name: '', cost: '' }]); setTravelRows([{ name: '', cost: '' }]);
    setCalcResult(null); setSubmitState('idle'); setErrors({}); setSuccessOpen(false); setTopError('');
  };

  // ── Style tokens ─────────────────────────────────────────────────────────────
  const card = {
    background: M.card, borderRadius: 20,
    boxShadow: '0 2px 12px rgba(80,60,50,0.07)',
    border: `1px solid ${M.border}`, padding: 24,
  };
  const tableHead = { background: M.primaryBg, padding: '8px 10px', fontSize: 11, fontWeight: 700, color: M.primaryDark, borderBottom: `1px solid ${M.border}`, textAlign: 'center' };
  const tdSt      = { padding: '7px 10px', fontSize: 12, borderBottom: `1px solid ${M.border}`, verticalAlign: 'middle' };

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: M.bg, padding: '24px 16px', fontFamily: "'Microsoft JhengHei', 'PingFang TC', sans-serif", color: M.textDark }}>
      <div style={{ maxWidth: 1040, margin: '0 auto' }}>

        {/* ── HEADER ── */}
        <header style={{ marginBottom: 28, borderRadius: 24, padding: '28px 32px',
          background: `linear-gradient(135deg, ${M.primary} 0%, ${M.accent} 60%, ${M.sage} 100%)`,
          color: M.primaryText, boxShadow: '0 4px 24px rgba(160,112,96,0.18)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.15em', opacity: 0.75, marginBottom: 4 }}>獨立女子廣告｜IDW Ads</p>
              <h1 style={{ fontSize: 26, fontWeight: 900, margin: 0 }}>自動報價系統</h1>
              <p style={{ fontSize: 13, opacity: 0.7, marginTop: 4 }}>填入資訊 → 試算利潤 → 送出報價單</p>
            </div>
            <div style={{ display: 'flex', gap: 20, background: 'rgba(255,255,255,0.18)', borderRadius: 16, padding: '12px 20px', backdropFilter: 'blur(4px)' }}>
              <div>
                <p style={{ fontSize: 10, opacity: 0.7, marginBottom: 2 }}>已選項目</p>
                <p style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>{chosenDetails.length}</p>
              </div>
              <div style={{ borderLeft: '1px solid rgba(255,255,255,0.3)', paddingLeft: 16 }}>
                <p style={{ fontSize: 10, opacity: 0.7, marginBottom: 2 }}>服務小計（未稅）</p>
                <p style={{ fontSize: 17, fontWeight: 900, margin: 0 }}>{currency(serviceSubtotal)}</p>
              </div>
              {calcResult && (
                <div style={{ borderLeft: '1px solid rgba(255,255,255,0.3)', paddingLeft: 16 }}>
                  <p style={{ fontSize: 10, opacity: 0.7, marginBottom: 2 }}>預估毛利</p>
                  <p style={{ fontSize: 17, fontWeight: 900, margin: 0 }}>{currency(calcResult.profit)}</p>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── TOP ERROR ── */}
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

          {/* ══════════════════════════════════════════
              LEFT COLUMN
          ══════════════════════════════════════════ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* STEP 1: 客戶資訊 */}
            <section style={card}>
              <SectionHeader num="1" label="客戶資訊" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <FormField icon={Building2} label="甲方抬頭" name="clientTitle" placeholder="客戶公司名稱" required
                  value={form.clientTitle} error={errors.clientTitle} onChange={setField('clientTitle')} />
                <FormField icon={Hash} label="甲方統一編號" name="clientTaxId" placeholder="8碼統編（選填）"
                  value={form.clientTaxId} onChange={setField('clientTaxId')} />
                <FormField icon={User} label="窗口姓名" name="clientContact" placeholder="客戶聯絡人"
                  value={form.clientContact} onChange={setField('clientContact')} />
                <FormField icon={Phone} label="聯絡電話" name="clientPhone" placeholder="客戶聯絡電話" type="tel"
                  value={form.clientPhone} onChange={setField('clientPhone')} />
                <FormField icon={Mail} label="收件信箱" name="clientEmail" placeholder="報價單寄送 Email" required type="email"
                  value={form.clientEmail} error={errors.clientEmail} onChange={setField('clientEmail')} />
                <FormField icon={FileText} label="專案名稱" name="projectName" placeholder="例：2025 品牌年度行銷"
                  value={form.projectName} onChange={setField('projectName')} />
                <div style={{ gridColumn: '1 / -1' }}>
                  <FormField icon={Calendar} label="專案走期" name="projectDuration" placeholder="例：2025/04/01 ~ 2025/09/30"
                    value={form.projectDuration} onChange={setField('projectDuration')} />
                </div>
              </div>
            </section>

            {/* 乙方窗口 */}
            <section style={card}>
              <SectionHeader label="乙方窗口（可複選）" />
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                {AGENT_OPTIONS.map(a => (
                  <label key={a} style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', fontSize: 14, fontWeight: 600, color: agentChecked[a] ? M.primaryDark : M.textMid }}>
                    <div onClick={() => setAgentChecked(p => ({ ...p, [a]: !p[a] }))}
                      style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${agentChecked[a] ? M.primary : M.border}`, background: agentChecked[a] ? M.primary : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0 }}>
                      {agentChecked[a] && <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 5l2.5 2.5L8 2.5" stroke="#FAFAF8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </div>
                    {a}
                  </label>
                ))}
              </div>
            </section>

            {/* 報價性質 */}
            <section style={card}>
              <SectionHeader label="報價性質" />
              <div style={{ display: 'flex', gap: 28 }}>
                {[['annual', '年約（月繳／季繳／年繳）'], ['onetime', '單次／專案（一次付清）']].map(([val, label]) => (
                  <label key={val} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600, color: quoteType === val ? M.primaryDark : M.textMid }}>
                    <div onClick={() => { setQuoteType(val); setCalcResult(null); }}
                      style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${quoteType === val ? M.primary : M.border}`, background: quoteType === val ? M.primary : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0 }}>
                      {quoteType === val && <div style={{ width: 7, height: 7, borderRadius: '50%', background: M.primaryText }} />}
                    </div>
                    {label}
                  </label>
                ))}
              </div>
            </section>

            {/* 甲方簽約資訊（可收合） */}
            <section style={card}>
              <button onClick={() => setContractOpen(p => !p)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: contractOpen ? 18 : 0 }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 900, color: M.primaryDark, margin: 0 }}>
                  <FileSignature size={15} color={M.primary} />甲方簽約資訊
                  <span style={{ fontSize: 11, fontWeight: 400, color: M.textLight }}>(選填，產出合約用)</span>
                </h2>
                {contractOpen ? <ChevronUp size={16} color={M.primary} /> : <ChevronDown size={16} color={M.primary} />}
              </button>
              <AnimatePresence>
                {contractOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <FormField icon={User} label="負責人" name="contractContact" placeholder="甲方負責人姓名"
                        value={form.contractContact} onChange={setField('contractContact')} />
                      <FormField icon={User} label="代表人" name="contractRep" placeholder="法定代表人姓名"
                        value={form.contractRep} onChange={setField('contractRep')} />
                      <FormField icon={Hash} label="統一編號" name="contractTaxId" placeholder="甲方統一編號"
                        value={form.contractTaxId} onChange={setField('contractTaxId')} />
                      <FormField icon={Phone} label="聯絡電話" name="contractPhone" placeholder="甲方聯絡電話" type="tel"
                        value={form.contractPhone} onChange={setField('contractPhone')} />
                      <div style={{ gridColumn: '1 / -1' }}>
                        <FormField icon={MapPin} label="登記地址" name="contractAddress" placeholder="甲方公司登記地址"
                          value={form.contractAddress} onChange={setField('contractAddress')} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* STEP 2: 服務項目 */}
            <section style={card}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                <SectionHeader num="2" label="服務項目" />
                {errors.items && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: M.error, fontWeight: 600 }}>
                    <AlertCircle size={13} />{errors.items}
                  </span>
                )}
              </div>

              {/* 吳式廣告提醒 */}
              <div style={{ borderLeft: `4px solid ${M.error}`, background: M.errorBg, padding: '10px 14px', fontSize: 11.5, lineHeight: 1.8, color: M.textMid, borderRadius: '0 8px 8px 0', marginBottom: 14 }}>
                <b style={{ color: M.primaryDark }}>吳式廣告提醒：</b><br/>
                1. 市售價格為市場高價，業務可自行拿捏報價空間，規模大往上報（不超過市售價），規模小依需求調整。<br/>
                2. 以下所有價格皆為<b>未稅價</b>。
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
                          {/* header row */}
                          <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr 70px 40px 80px 80px', padding: '6px 14px', fontSize: 11, fontWeight: 700, color: M.primary, background: '#F8F4F1', gap: 6 }}>
                            <span />
                            <span>項目</span>
                            <span style={{ textAlign: 'center' }}>數量</span>
                            <span style={{ textAlign: 'center' }}>單位</span>
                            <span style={{ textAlign: 'right' }}>末售</span>
                            <span style={{ textAlign: 'right' }}>成本</span>
                          </div>
                          {group.items.map(item => {
                            const checked = !!selectedItems[item.name];
                            const qty     = Number(qtyMap[item.name] || 1);
                            return (
                              <div key={item.name} style={{ borderTop: `1px solid ${M.border}`, background: checked ? '#F5F0ED' : M.card }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr 70px 40px 80px 80px', padding: '10px 14px', alignItems: 'center', gap: 6 }}>
                                  {/* checkbox */}
                                  <div style={{ flexShrink: 0 }}>
                                    <div onClick={() => { setSelectedItems(p => ({ ...p, [item.name]: !checked })); setErrors(p => { const n = { ...p }; delete n.items; return n; }); setCalcResult(null); }}
                                      style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${checked ? M.primary : M.border}`, background: checked ? M.primary : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', cursor: 'pointer' }}>
                                      {checked && <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 5l2.5 2.5L8 2.5" stroke="#FAFAF8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                                    </div>
                                  </div>
                                  <div>
                                    <p style={{ fontSize: 13, fontWeight: 600, margin: 0, color: checked ? M.primaryDark : M.textDark }}>{item.name}</p>
                                    {item.spec && <p style={{ fontSize: 11, color: M.textLight, margin: '2px 0 0' }}>{item.spec}</p>}
                                  </div>
                                  {/* qty stepper */}
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                                    <button onClick={() => { setQtyMap(p => ({ ...p, [item.name]: Math.max(1, qty - 1) })); setCalcResult(null); }}
                                      style={{ width: 20, height: 20, borderRadius: '50%', border: `1px solid ${M.border}`, background: M.card, color: M.primary, fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                                    <span style={{ fontSize: 12, fontWeight: 700, minWidth: 16, textAlign: 'center', color: M.primaryDark }}>{qty}</span>
                                    <button onClick={() => { setQtyMap(p => ({ ...p, [item.name]: qty + 1 })); setCalcResult(null); }}
                                      style={{ width: 20, height: 20, borderRadius: '50%', border: `1px solid ${M.border}`, background: M.card, color: M.primary, fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                                  </div>
                                  <span style={{ fontSize: 11, color: M.textLight, textAlign: 'center' }}>{item.unit}</span>
                                  <span style={{ fontSize: 13, fontWeight: 700, color: M.primary, textAlign: 'right' }}>{currency(item.unitPrice * qty)}</span>
                                  <span style={{ fontSize: 12, color: M.textMid, textAlign: 'right' }}>{currency(item.unitCost * qty)}</span>
                                </div>
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

            {/* ── INTERNAL COST SECTIONS ── */}

            <section style={card}>
              <SectionHeader num="3" label="額外成本（內部）" />

              {/* 工具攤提 */}
              <InternalBox icon={Wrench} title="工具攤提">
                {toolRows.map((row, i) => (
                  <CostRowInputs key={i} row={row} i={i} setter={setToolRows}
                    namePlaceholder="工具名稱" costPlaceholder="攤提金額" />
                ))}
                <AddBtn onClick={() => addRow(setToolRows, { name: '', cost: '' })} label="新增工具" />
              </InternalBox>

              {/* 同行/發包 */}
              <InternalBox icon={Users} title="同行 / 發包">
                {partnerRows.map((row, i) => (
                  <CostRowInputs key={i} row={row} i={i} setter={setPartnerRows}
                    namePlaceholder="廠商名稱" costPlaceholder="發包金額" />
                ))}
                <AddBtn onClick={() => addRow(setPartnerRows, { name: '', cost: '' })} label="新增廠商" />
              </InternalBox>

              {/* 設計費/製作費 */}
              <InternalBox icon={Palette} title="設計費 / 製作費">
                {designRows.map((row, i) => (
                  <CostRowInputs key={i} row={row} i={i} setter={setDesignRows}
                    namePlaceholder="項目說明" costPlaceholder="金額" />
                ))}
                <AddBtn onClick={() => addRow(setDesignRows, { name: '', cost: '' })} label="新增項目" />
              </InternalBox>

              {/* 開案獎金 */}
              <InternalBox icon={Gift} title="開案獎金（按試算自動平分 5%）">
                {bonusRows.map((row, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                    <input value={row.name} onChange={e => updateRow(setBonusRows, i, 'name', e.target.value)}
                      placeholder="領獎人" style={{ ...inputSt(false), flex: 1 }} />
                    <input type="number" value={row.cost} readOnly placeholder="自動計算"
                      style={{ ...inputSt(false), width: 120, flex: 'none', background: '#F5F5F3', color: M.textMid }} />
                    <RemoveBtn onClick={() => removeRow(setBonusRows, i)} />
                  </div>
                ))}
                <AddBtn onClick={() => addRow(setBonusRows, { name: '', cost: '' })} label="新增領獎人" />
                <p style={{ fontSize: 11, color: M.textLight, marginTop: 6 }}>※ 獎金依末售金額 5% 自動平分，按「試算利潤」後更新</p>
              </InternalBox>

              {/* 工讀/外包費用 */}
              <InternalBox icon={UserCheck} title="工讀 / 外包費用">
                {staffRows.map((row, i) => (
                  <CostRowInputs key={i} row={row} i={i} setter={setStaffRows}
                    namePlaceholder="姓名" costPlaceholder="金額" />
                ))}
                <AddBtn onClick={() => addRow(setStaffRows, { name: '', cost: '' })} label="新增人員" />
              </InternalBox>

              {/* 公關差旅費 */}
              <InternalBox icon={MapPin} title="公關 / 差旅費">
                {travelRows.map((row, i) => (
                  <CostRowInputs key={i} row={row} i={i} setter={setTravelRows}
                    namePlaceholder="類型" costPlaceholder="金額"
                    nameType="select" nameOptions={TRAVEL_TYPES} />
                ))}
                <AddBtn onClick={() => addRow(setTravelRows, { name: '', cost: '' })} label="新增差旅" />
              </InternalBox>

              {/* Live cost bar */}
              <div style={{ marginTop: 16, padding: '12px 16px', background: M.warningBg, borderRadius: 10, border: `1px solid ${M.internalBdr}`, display: 'flex', justifyContent: 'flex-end', gap: 24, fontSize: 13, flexWrap: 'wrap' }}>
                <span>額外成本小計：<b style={{ color: M.warning }}>{currency(extraCostLive)}</b></span>
                <span>服務成本小計：<b style={{ color: M.warning }}>{currency(serviceCostLive)}</b></span>
                <span><b>成本總計：<span style={{ color: M.primaryDark }}>{currency(extraCostLive + serviceCostLive)}</span></b></span>
              </div>
            </section>

            {/* STEP 4: 備註 & 常規條款 */}
            <section style={card}>
              <SectionHeader num="4" label="備註 & 合作條款" />
              <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: M.primary, marginBottom: 5 }}>
                <StickyNote size={12} />備註（選填）
              </label>
              <textarea rows={2} value={form.quoteNote} onChange={setField('quoteNote')}
                style={{ ...inputSt(false), resize: 'vertical', marginBottom: 16 }}
                placeholder="付款方式、特殊需求或備忘事項…" />

              <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: M.primary, marginBottom: 5 }}>
                <ClipboardList size={12} />常規合作條款約定
              </label>
              <textarea rows={12} value={form.quoteTerms} onChange={setField('quoteTerms')}
                style={{ ...inputSt(false), resize: 'vertical', fontSize: 12, lineHeight: 1.8 }} />
            </section>

            {/* ── CALC BUTTON ── */}
            {errors.calc && (
              <div style={{ padding: '8px 14px', borderRadius: 10, background: M.warningBg, border: `1px solid ${M.warning}`, fontSize: 12, color: M.warning, display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertCircle size={13} />{errors.calc}
              </div>
            )}
            <button onClick={runCalc} disabled={chosenDetails.length === 0}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '16px 0', borderRadius: 16, border: 'none',
                background: `linear-gradient(135deg, ${M.sage}, ${M.sageDark})`,
                color: '#FAFAF8', fontSize: 16, fontWeight: 800, cursor: chosenDetails.length === 0 ? 'not-allowed' : 'pointer',
                opacity: chosenDetails.length === 0 ? 0.5 : 1,
                boxShadow: '0 4px 16px rgba(100,140,120,0.25)', transition: 'all 0.15s' }}>
              <Calculator size={20} />試算利潤與預覽報價
            </button>

            {/* anchor */}
            <div id="calcResultAnchor" />

            {/* ── CALC RESULT (inline preview) ── */}
            <AnimatePresence>
              {calcResult && (
                <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={card}>
                  <SectionHeader label="📋 報價預覽（含試算結果）" />

                  {/* items table */}
                  <div style={{ overflowX: 'auto', marginBottom: 20 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr>
                          {['項目', '數量', '單位', '末售', '成本'].map(h => (
                            <th key={h} style={tableHead}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {chosenDetails.map(item => (
                          <tr key={item.name} style={{ background: M.card }}>
                            <td style={{ ...tdSt, fontWeight: 600 }}>{item.name}</td>
                            <td style={{ ...tdSt, textAlign: 'center' }}>{item.qty}</td>
                            <td style={{ ...tdSt, textAlign: 'center', color: M.textLight }}>{item.unit}</td>
                            <td style={{ ...tdSt, textAlign: 'right', color: M.primary, fontWeight: 700 }}>{currency(item.subtotal)}</td>
                            <td style={{ ...tdSt, textAlign: 'right', color: M.textMid }}>{currency(item.costTotal)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr style={{ background: M.primaryBg }}>
                          <td style={{ ...tdSt, fontWeight: 700, color: M.primaryDark }} colSpan={3}>服務小計（未稅）</td>
                          <td style={{ ...tdSt, textAlign: 'right', fontWeight: 700, color: M.primaryDark }}>{currency(calcResult.serviceSubtotal)}</td>
                          <td style={{ ...tdSt, textAlign: 'right', color: M.textMid }}>{currency(calcResult.serviceCostSum)}</td>
                        </tr>
                        {calcResult.mgmtFeeAmt > 0 && (
                          <tr style={{ background: M.sageBg }}>
                            <td style={{ ...tdSt }} colSpan={3}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: M.sageDark }}>
                                <input type="checkbox" checked={addMgmtFee} onChange={e => { setAddMgmtFee(e.target.checked); setCalcResult(null); }} style={{ accentColor: M.sage }} />
                                ＋專案管理費 10%
                              </label>
                            </td>
                            <td style={{ ...tdSt, textAlign: 'right', fontWeight: 700, color: M.sageDark }}>{currency(calcResult.mgmtFeeAmt)}</td>
                            <td style={tdSt} />
                          </tr>
                        )}
                        {!calcResult.mgmtFeeAmt && (
                          <tr style={{ background: M.sageBg }}>
                            <td colSpan={5} style={{ padding: '8px 10px' }}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: M.sageDark }}>
                                <input type="checkbox" checked={addMgmtFee} onChange={e => { setAddMgmtFee(e.target.checked); setCalcResult(null); }} style={{ accentColor: M.sage }} />
                                加收專案管理費 +10%（勾選後重新試算）
                              </label>
                            </td>
                          </tr>
                        )}
                        <tr style={{ background: M.primaryBg }}>
                          <td style={{ ...tdSt, fontWeight: 700, color: M.primaryDark }} colSpan={3}>報價合計（未稅）</td>
                          <td style={{ ...tdSt, textAlign: 'right', fontWeight: 800, color: M.primaryDark, fontSize: 14 }}>{currency(calcResult.finalPrice)}</td>
                          <td style={tdSt} />
                        </tr>
                        <tr>
                          <td style={{ ...tdSt, color: M.textMid }} colSpan={3}>稅金 (5%)</td>
                          <td style={{ ...tdSt, textAlign: 'right', color: M.textMid }}>{currency(calcResult.taxAmt)}</td>
                          <td style={tdSt} />
                        </tr>
                        <tr style={{ background: `linear-gradient(90deg, ${M.primaryBg}, #fff)` }}>
                          <td style={{ ...tdSt, fontWeight: 900, color: M.primaryDark, fontSize: 14 }} colSpan={3}>含稅合計</td>
                          <td style={{ ...tdSt, textAlign: 'right', fontWeight: 900, color: M.primaryDark, fontSize: 15 }}>{currency(calcResult.taxTotal)}</td>
                          <td style={tdSt} />
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* 繳費方案 */}
                  <h3 style={{ fontSize: 13, fontWeight: 800, color: M.primaryDark, margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CreditCard size={14} color={M.primary} />繳費方案試算
                  </h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                      <thead>
                        <tr style={{ background: M.primaryBg }}>
                          {['繳費方式', '未稅金額', '稅金 (5%)', '含稅金額', '利潤', '毛利率'].map(h => (
                            <th key={h} style={{ ...tableHead, fontSize: 11 }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {quoteType === 'annual' ? <>
                          <PlanRow label="月繳（÷12）"        {...calcResult.plans.monthly}   />
                          <PlanRow label="季繳（95折÷4）"    {...calcResult.plans.quarterly} />
                          <PlanRow label="年繳（9折）"        {...calcResult.plans.annual}    highlight />
                        </> : (
                          <PlanRow label="一次付清"          {...calcResult.plans.onetime}   highlight />
                        )}
                      </tbody>
                    </table>
                  </div>
                </motion.section>
              )}
            </AnimatePresence>

            {/* ── ACTION BUTTONS ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <button onClick={handleExcelDownload} disabled={chosenDetails.length === 0}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px 0', borderRadius: 16, border: 'none',
                  background: chosenDetails.length === 0 ? '#ccc' : `linear-gradient(135deg, ${M.sage}, ${M.sageDark})`,
                  color: '#FAFAF8', fontSize: 15, fontWeight: 800, cursor: chosenDetails.length === 0 ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 16px rgba(100,140,120,0.2)' }}>
                <Download size={18} />下載 Excel 報價單
              </button>
              <button onClick={handleSubmit} disabled={submitState === 'loading'}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px 0', borderRadius: 16, border: 'none',
                  background: `linear-gradient(135deg, ${M.primary}, ${M.primaryDark})`,
                  color: '#FAFAF8', fontSize: 15, fontWeight: 800,
                  cursor: submitState === 'loading' ? 'not-allowed' : 'pointer',
                  opacity: submitState === 'loading' ? 0.6 : 1,
                  boxShadow: '0 4px 16px rgba(160,112,96,0.2)' }}>
                {submitState === 'loading' ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                產出 & 寄送報價單
              </button>
            </div>
          </div>

          {/* ══════════════════════════════════════════
              RIGHT COLUMN (sticky)
          ══════════════════════════════════════════ */}
          <div style={{ position: 'sticky', top: 20, alignSelf: 'start', display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* 報價摘要 */}
            <div style={card}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 800, color: M.primaryDark, marginTop: 0, marginBottom: 14 }}>
                <BadgeDollarSign size={15} color={M.primary} />報價摘要
              </h3>

              {chosenDetails.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <FileText size={32} color={M.border} style={{ margin: '0 auto 6px' }} />
                  <p style={{ fontSize: 12, color: M.textLight }}>尚未選擇服務項目</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                  {chosenDetails.map(item => (
                    <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 12, fontWeight: 600, margin: 0, color: M.textDark, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</p>
                        <p style={{ fontSize: 10, color: M.textLight, margin: '1px 0 0' }}>{item.unit} × {item.qty}</p>
                      </div>
                      <p style={{ fontSize: 12, fontWeight: 700, color: M.textDark, flexShrink: 0 }}>{currency(item.subtotal)}</p>
                    </div>
                  ))}
                </div>
              )}

              {chosenDetails.length > 0 && (
                <div style={{ paddingTop: 10, borderTop: `1px solid ${M.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: M.textMid, marginBottom: 4 }}>
                    <span>未稅小計</span><span style={{ fontWeight: 600 }}>{currency(serviceSubtotal)}</span>
                  </div>
                  {calcResult?.mgmtFeeAmt > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: M.textMid, marginBottom: 4 }}>
                      <span>管理費 10%</span><span style={{ fontWeight: 600 }}>{currency(calcResult.mgmtFeeAmt)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: M.textMid, marginBottom: 10 }}>
                    <span>營業稅 5%</span>
                    <span style={{ fontWeight: 600 }}>{currency(calcResult ? calcResult.taxAmt : tax)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 12, background: `linear-gradient(135deg, ${M.primary}, ${M.primaryDark})`, color: M.primaryText }}>
                    <span style={{ fontSize: 12, fontWeight: 700 }}>含稅總計</span>
                    <span style={{ fontSize: 17, fontWeight: 900 }}>{currency(calcResult ? calcResult.taxTotal : total)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* 成本 & 毛利（試算後顯示） */}
            <AnimatePresence>
              {calcResult && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={card}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 800, color: M.primaryDark, marginTop: 0, marginBottom: 14 }}>
                    <TrendingUp size={14} color={M.sage} />成本明細 & 毛利
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {[
                      ['📦 服務成本', calcResult.serviceCostSum],
                      ['🔧 工具攤提', calcResult.costs.tool],
                      ['🤝 發包成本', calcResult.costs.partner],
                      ['🎨 設計費',   calcResult.costs.design],
                      ['🎁 開案獎金', calcResult.costs.bonus],
                      ['👷 工讀費',   calcResult.costs.staff],
                      ['🚄 差旅費',   calcResult.costs.travel],
                    ].filter(([, v]) => v > 0).map(([label, val]) => (
                      <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: M.textMid }}>
                        <span>{label}</span>
                        <span style={{ fontWeight: 600 }}>{currency(val)}</span>
                      </div>
                    ))}
                    <div style={{ borderTop: `1px solid ${M.border}`, paddingTop: 8, marginTop: 4, display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, color: M.textDark }}>
                      <span>成本總計</span><span>{currency(calcResult.totalCost)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 800, color: M.error, marginTop: 4 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Percent size={12} />毛利</span>
                      <span>{currency(calcResult.profit)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: M.error }}>
                      <span>毛利率</span><span style={{ fontWeight: 700 }}>{pct(calcResult.margin)}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Info 卡 */}
            <div style={{ borderRadius: 20, padding: 20, background: `linear-gradient(135deg, ${M.accent} 0%, ${M.primary} 100%)`, color: M.primaryText, boxShadow: '0 4px 16px rgba(160,112,96,0.15)' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 800, margin: '0 0 12px' }}>
                <Sparkles size={14} />自動化流程
              </h4>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: 11, opacity: 0.85, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <li>▸ 試算後確認毛利 & 繳費方案</li>
                <li>▸ 「下載 Excel」→ 報價單 + 成本明細工作表</li>
                <li>▸ 「產出 & 寄送」→ Google Drive 歸檔 + 寄信</li>
                <li>▸ CC：newchin930 / idwomantw / jilin771112</li>
              </ul>
            </div>

            {/* Reset 按鈕 */}
            <button onClick={resetForm}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 0', borderRadius: 12, border: `1.5px solid ${M.border}`, background: M.card, color: M.textMid, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              <RefreshCw size={14} />清空重填
            </button>
          </div>
        </div>
      </div>

      {/* ── SUCCESS MODAL ── */}
      <AnimatePresence>
        {successOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(60,50,45,0.55)', backdropFilter: 'blur(4px)', padding: 16 }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              style={{ width: '100%', maxWidth: 380, borderRadius: 28, overflow: 'hidden', background: M.card, boxShadow: '0 20px 60px rgba(60,50,45,0.2)' }}>
              <div style={{ padding: '28px 0 20px', textAlign: 'center', background: `linear-gradient(135deg, ${M.primary}, ${M.sage})` }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                  <CheckCircle2 size={36} color={M.primaryText} />
                </div>
              </div>
              <div style={{ padding: '24px 28px', textAlign: 'center' }}>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: M.textDark, margin: '0 0 8px' }}>報價單已產出！</h2>
                {successData?.email && (
                  <p style={{ fontSize: 13, color: M.textMid, margin: '0 0 6px' }}>
                    已寄至 <strong style={{ color: M.primary }}>{successData.email}</strong>
                  </p>
                )}
                {successData?.profit !== undefined && (
                  <p style={{ fontSize: 13, color: M.textMid, margin: 0 }}>
                    預估公司獲利：<strong style={{ color: M.error }}>{currency(successData.profit)}</strong>
                  </p>
                )}
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

      {/* ── Responsive & animation styles ── */}
      <style>{`
        @media (max-width: 760px) { .quote-grid { grid-template-columns: 1fr !important; } }
        * { box-sizing: border-box; }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input[type=number]::-webkit-outer-spin-button,
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        textarea { font-family: inherit; }
        select { font-family: inherit; appearance: auto; }
      `}</style>
    </div>
  );
}
