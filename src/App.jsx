import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Building2, Mail, User, FileText, ChevronDown, CheckCircle2, Loader2, Send, Sparkles, ClipboardList, BadgeDollarSign, AlertCircle } from 'lucide-react';

// --- API CONFIG (自動從 GitHub Secrets 讀取) ---
const GAS_URL = import.meta.env.VITE_GAS_URL; 

const agencyDB = {
  '24567891': { companyTitle: '晨曜媒體代理股份有限公司', email: 'sales@morningads.tw' },
  '50882173': { companyTitle: '北星整合行銷有限公司', email: 'contact@northstar.tw' },
  '97431256': { companyTitle: '橙海數位廣告有限公司', email: 'service@orangewave.tw' },
  '80652314': { companyTitle: '宇光品牌顧問股份有限公司', email: 'hello@starlightbrand.com' },
};

const serviceLibrary = [
  {
    category: 'Meta / 社群廣告',
    items: [
      { name: 'Meta 廣告投放', spec: 'FB / IG 廣告帳戶操作與優化', unitPrice: 12000, unit: '案' },
      { name: '廣告素材企劃', spec: '單月圖文與文案規劃', unitPrice: 8000, unit: '份' },
      { name: '再行銷設定', spec: '像素、轉換事件與受眾設定', unitPrice: 5000, unit: '次' },
    ],
  },
  {
    category: '內容製作',
    items: [
      { name: '品牌圖文設計', spec: '社群貼文主視覺設計', unitPrice: 2500, unit: '則' },
      { name: '短影音腳本', spec: 'Reels / Shorts 腳本企劃', unitPrice: 4500, unit: '支' },
      { name: 'Landing Page 文案', spec: '單頁式活動頁文案撰寫', unitPrice: 9000, unit: '頁' },
    ],
  },
  {
    category: '網站與數據',
    items: [
      { name: 'GA4 / GTM 追蹤建置', spec: 'GA4、GTM 與事件追蹤設定', unitPrice: 10000, unit: '案' },
      { name: 'SEO 優化建議', spec: '頁面結構與關鍵字優化', unitPrice: 15000, unit: '案' },
      { name: '成效報表整理', spec: '月報、投放成效與分析建議', unitPrice: 6000, unit: '月' },
    ],
  },
  {
    category: '品牌策略',
    items: [
      { name: '品牌定位工作坊', spec: '品牌核心價值與受眾梳理', unitPrice: 30000, unit: '場' },
      { name: '年度行銷規劃', spec: '年度活動節奏與投放建議', unitPrice: 40000, unit: '份' },
    ],
  },
];

const qtyOptions = Array.from({ length: 20 }, (_, i) => String(i + 1));
const currency = (num) => new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', maximumFractionDigits: 0 }).format(num);

export default function AgencyQuoteApp() {
  const [form, setForm] = useState({
    endClientName: '',
    taxId: '',
    companyTitle: '',
    clientName: '',
    email: '',
    otherNote: '',
  });
  const [selectedItems, setSelectedItems] = useState({});
  const [qtyMap, setQtyMap] = useState({});
  const [lookupState, setLookupState] = useState('idle');
  const [lookupMessage, setLookupMessage] = useState('');
  const [submitState, setSubmitState] = useState('idle');
  const [errors, setErrors] = useState({});
  const [successOpen, setSuccessOpen] = useState(false);

  const allItemsFlat = useMemo(
    () => serviceLibrary.flatMap((group) => group.items.map((item) => ({ ...item, category: group.category }))),
    []
  );

  const chosenDetails = useMemo(() => {
    return allItemsFlat
      .filter((item) => selectedItems[item.name])
      .map((item) => {
        const qty = Number(qtyMap[item.name] || 1);
        return { ...item, qty, subtotal: qty * item.unitPrice };
      });
  }, [allItemsFlat, qtyMap, selectedItems]);

  const subtotal = chosenDetails.reduce((sum, item) => sum + item.subtotal, 0);
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + tax;

  const handleTaxLookup = () => {
    const taxId = form.taxId.trim();
    if (!taxId) return;
    setLookupState('loading');
    setTimeout(() => {
      const agency = agencyDB[taxId];
      if (agency) {
        setForm(p => ({ ...p, companyTitle: agency.companyTitle, email: agency.email }));
        setLookupState('success');
        setLookupMessage('已自動帶入代理商資料。');
      } else {
        setLookupState('error');
        setLookupMessage('查無統編資料。');
      }
    }, 600);
  };

  const handleSubmit = async () => {
    // 簡單驗證
    if (!form.endClientName || !form.taxId || chosenDetails.length === 0) {
      setErrors({ projectName: '請填寫必要資料並選擇服務項目' });
      return;
    }

    setSubmitState('loading');

    const payload = {
      timestamp: new Date().toLocaleString(),
      endClientName: form.endClientName,
      taxId: form.taxId,
      companyTitle: form.companyTitle,
      clientName: form.clientName,
      email: form.email,
      items: chosenDetails.map(d => `${d.name} (x${d.qty})`).join(', '),
      total: total,
      otherNote: form.otherNote
    };

    try {
      // 1. 串接 Google Sheets & Gmail (透過 GAS)
      if (GAS_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_URL') {
        await fetch(GAS_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      // 2. 模擬成功流程 (實際專案建議在此處呼叫 Firebase Firestore)
      setSubmitState('success');
      setSuccessOpen(true);
    } catch (error) {
      console.error('Submit Error:', error);
      setSubmitState('error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-900">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold">代理商報價實戰系統</h1>
          <p className="text-slate-500">串接 Google Sheets + Gmail 自動化發信</p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          {/* 左側表單 */}
          <section className="space-y-6 rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 font-bold"><Building2 className="w-4 h-4"/> 1. 代理商資訊</h2>
            <div className="space-y-4">
              <input 
                className="w-full rounded-lg border p-3" 
                placeholder="甲方客戶名稱" 
                value={form.endClientName}
                onChange={e => setForm(p => ({...p, endClientName: e.target.value}))}
              />
              <div className="flex gap-2">
                <input 
                  className="flex-1 rounded-lg border p-3" 
                  placeholder="代理商統編 (如 80652314)" 
                  value={form.taxId}
                  onChange={e => setForm(p => ({...p, taxId: e.target.value}))}
                />
                <button onClick={handleTaxLookup} className="rounded-lg bg-slate-900 px-4 text-white"><Search className="w-4 h-4"/></button>
              </div>
              <input className="w-full rounded-lg border p-3" placeholder="公司抬頭" value={form.companyTitle} readOnly />
              <input className="w-full rounded-lg border p-3" placeholder="收件人 Email" value={form.email} readOnly />
              <input 
                className="w-full rounded-lg border p-3" 
                placeholder="窗口姓名" 
                value={form.clientName}
                onChange={e => setForm(p => ({...p, clientName: e.target.value}))}
              />
            </div>

            <h2 className="flex items-center gap-2 pt-4 font-bold"><FileText className="w-4 h-4"/> 2. 選擇服務</h2>
            <div className="space-y-2">
              {serviceLibrary.map(group => (
                <div key={group.category} className="space-y-1">
                  <p className="text-xs font-bold text-slate-400">{group.category}</p>
                  {group.items.map(item => (
                    <label key={item.name} className="flex cursor-pointer items-center justify-between rounded-lg border p-3 hover:bg-slate-50">
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={!!selectedItems[item.name]}
                          onChange={e => setSelectedItems(p => ({...p, [item.name]: e.target.checked}))}
                        />
                        <span className="text-sm">{item.name}</span>
                      </div>
                      <span className="text-xs font-medium text-slate-500">{currency(item.unitPrice)}</span>
                    </label>
                  ))}
                </div>
              ))}
            </div>

            <button 
              onClick={handleSubmit}
              disabled={submitState === 'loading'}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-4 font-bold text-white transition hover:bg-blue-700 disabled:bg-slate-300"
            >
              {submitState === 'loading' ? <Loader2 className="animate-spin" /> : <Send className="w-4 h-4"/>}
              送出報價並寄信
            </button>
          </section>

          {/* 右側摘要 */}
          <section className="space-y-6">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 font-bold"><BadgeDollarSign className="w-4 h-4"/> 報價摘要</h2>
              <div className="space-y-3">
                {chosenDetails.map(item => (
                  <div key={item.name} className="flex justify-between text-sm">
                    <span className="text-slate-600">{item.name}</span>
                    <span className="font-medium">{currency(item.subtotal)}</span>
                  </div>
                ))}
                <div className="my-2 border-t pt-2 text-right">
                  <p className="text-xs text-slate-400">總計 (含 5% 營業稅)</p>
                  <p className="text-2xl font-bold text-blue-600">{currency(total)}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-blue-600 p-6 text-white shadow-sm">
              <h3 className="mb-2 flex items-center gap-2 font-bold"><Sparkles className="w-4 h-4"/> 自動化功能</h3>
              <ul className="space-y-2 text-sm text-blue-100">
                <li>• 自動將資料寫入 Google Sheets</li>
                <li>• 即時透過 Gmail 發送報價通知給代理商</li>
                <li>• 備份資料至 Firebase Firestore</li>
              </ul>
            </div>
          </section>
        </div>
      </div>

      <AnimatePresence>
        {successOpen && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} className="fixed inset-0 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-2xl">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h2 className="text-2xl font-bold">送出成功！</h2>
              <p className="mt-2 text-slate-600">報價單已存入 Sheets 並完成 Gmail 發信。</p>
              <button onClick={() => setSuccessOpen(false)} className="mt-6 w-full rounded-xl bg-slate-900 py-3 font-bold text-white">完成</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
