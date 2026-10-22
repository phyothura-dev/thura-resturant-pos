import { useState } from 'react';
import { toast } from 'sonner';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Store, Receipt, Percent, Printer, Save, Sliders } from 'lucide-react';
import { getAppSettings, saveAppSettings, type AppSettings } from '../utils/settings';

export default function Settings() {
  const [settings, setSettings] = useState<AppSettings>(() => getAppSettings());
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      saveAppSettings(settings);
      toast.success('ဆိုင်သတ်မှတ်ချက်များ သိမ်းဆည်းပြီးပါပြီ');
    } catch {
      toast.error('သတ်မှတ်ချက်များ သိမ်းဆည်း၍ မရပါ');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      {/* Header */}
      <header className="flex items-center gap-3">
        <span className="rounded-xl bg-primary/10 p-2.5 text-primary">
          <Sliders size={22} />
        </span>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900">ဆိုင်သတ်မှတ်ချက်များ</h1>
          <p className="text-xs text-gray-500 mt-0.5">ဆိုင်အချက်အလက်၊ အခွန်၊ ဝန်ဆောင်ခနှင့် ပြေစာ ပရင်တာ စနစ်များ</p>
        </div>
      </header>

      <form onSubmit={handleSave} className="space-y-5">
        {/* 1. Restaurant Profile */}
        <Card className="p-5 border-gray-100 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100 text-sm font-bold text-gray-900">
            <Store size={18} className="text-primary" />
            <span>ဆိုင် အချက်အလက် (Restaurant Profile)</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">ဆိုင်အမည်</label>
              <Input
                value={settings.restaurantName}
                onChange={(e) => setSettings({ ...settings, restaurantName: e.target.value })}
                placeholder="ဥပမာ - သူရစားသောက်ဆိုင်"
                required
                className="h-10 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">ဆက်သွယ်ရန် ဖုန်းနံပါတ်</label>
              <Input
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                placeholder="ဥပမာ - 09-123456789"
                className="h-10 text-sm"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-gray-700">ဆိုင်လိပ်စာ</label>
              <Input
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                placeholder="ဥပမာ - အမှတ် (၁)၊ ဗဟိုလမ်း၊ ရန်ကုန်မြို့"
                className="h-10 text-sm"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-gray-700">ပြေစာအောက်ခြေ မှတ်ချက် (Receipt Footer)</label>
              <Input
                value={settings.receiptFooter}
                onChange={(e) => setSettings({ ...settings, receiptFooter: e.target.value })}
                placeholder="ဥပမာ - ကျေးဇူးတင်ပါသည်၊ နောက်တစ်ခေါက် ပြန်လည်ကြိုဆိုပါသည်"
                className="h-10 text-sm"
              />
            </div>
          </div>
        </Card>

        {/* 2. Tax & Service Charge Settings */}
        <Card className="p-5 border-gray-100 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100 text-sm font-bold text-gray-900">
            <Percent size={18} className="text-amber-600" />
            <span>အခွန်နှင့် ဝန်ဆောင်ခ (Tax & Service Charge)</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Commercial Tax */}
            <div className="rounded-xl border border-gray-200 p-4 space-y-3 bg-gray-50/50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">ကုန်သွယ်လုပ်ငန်းခွန် (Commercial Tax)</h3>
                  <p className="text-xs text-gray-500">အရောင်းပြေစာတွင် အခွန်ထည့်တွက်ရန်</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, enableTax: !settings.enableTax })}
                  className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                    settings.enableTax
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                      : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {settings.enableTax ? 'ဖွင့်ထားသည်' : 'ပိတ်ထားသည်'}
                </button>
              </div>

              {settings.enableTax && (
                <div className="space-y-1.5 pt-2 border-t border-gray-200">
                  <label className="text-xs font-bold text-gray-700">အခွန်နှုန်းထား (%)</label>
                  <div className="relative w-36">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      value={settings.taxRate}
                      onChange={(e) => setSettings({ ...settings, taxRate: Number(e.target.value) || 0 })}
                      className="h-9 pr-7 text-sm font-bold"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">%</span>
                  </div>
                </div>
              )}
            </div>

            {/* Service Charge */}
            <div className="rounded-xl border border-gray-200 p-4 space-y-3 bg-gray-50/50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">ဝန်ဆောင်ခ (Service Charge)</h3>
                  <p className="text-xs text-gray-500">ဆိုင်တွင်း စားသုံးမှုအတွက် ဝန်ဆောင်ခ</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, enableServiceCharge: !settings.enableServiceCharge })}
                  className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                    settings.enableServiceCharge
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {settings.enableServiceCharge ? 'ဖွင့်ထားသည်' : 'ပိတ်ထားသည်'}
                </button>
              </div>

              {settings.enableServiceCharge && (
                <div className="space-y-1.5 pt-2 border-t border-gray-200">
                  <label className="text-xs font-bold text-gray-700">ဝန်ဆောင်ခ နှုန်းထား (%)</label>
                  <div className="relative w-36">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      value={settings.serviceChargeRate}
                      onChange={(e) => setSettings({ ...settings, serviceChargeRate: Number(e.target.value) || 0 })}
                      className="h-9 pr-7 text-sm font-bold"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">%</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* 3. Printer Settings */}
        <Card className="p-5 border-gray-100 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100 text-sm font-bold text-gray-900">
            <Printer size={18} className="text-gray-700" />
            <span>ပြေစာ ပရင်တာ စံနှုန်း (Printer Settings)</span>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700">အသုံးပြုမည့် စက္ကူလိပ် အရွယ်အစား</label>
            <div className="flex gap-3 max-w-sm">
              <button
                type="button"
                onClick={() => setSettings({ ...settings, defaultPaperSize: '80mm' })}
                className={`flex-1 p-3 rounded-xl border-2 text-center transition-all cursor-pointer ${
                  settings.defaultPaperSize === '80mm'
                    ? 'border-primary bg-primary/10 text-primary font-bold shadow-2xs'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <p className="text-sm font-black">80 mm</p>
                <p className="text-[11px] opacity-75 mt-0.5">ပုံမှန် အရွယ်အစား</p>
              </button>
              <button
                type="button"
                onClick={() => setSettings({ ...settings, defaultPaperSize: '58mm' })}
                className={`flex-1 p-3 rounded-xl border-2 text-center transition-all cursor-pointer ${
                  settings.defaultPaperSize === '58mm'
                    ? 'border-primary bg-primary/10 text-primary font-bold shadow-2xs'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <p className="text-sm font-black">58 mm</p>
                <p className="text-[11px] opacity-75 mt-0.5">အကျဉ်း အရွယ်အစား</p>
              </button>
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={isSaving}
            isLoading={isSaving}
            className="h-11 px-8 rounded-xl font-bold shadow-sm"
          >
            <Save size={16} className="mr-2" />
            သတ်မှတ်ချက်များ သိမ်းဆည်းမည်
          </Button>
        </div>
      </form>
    </div>
  );
}
