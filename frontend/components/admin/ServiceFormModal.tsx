import React, { useEffect, useState } from 'react';
import { optionService, Service } from '@/types/models';

export type ServiceFormMode = 'view' | 'add' | 'edit';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit?: (service: Service) => void | Promise<void>;
  initialData?: Service | null;
  mode: ServiceFormMode;
}

const toInt = (v: string, fallback = 0) => {
  const n = Number(v);
  console.log("n", n)
  return Number.isFinite(n) ? n : fallback;
};

const emptyService = (): Service => ({
  name: '',
  description: '',
  duration: '',
  price: '',
  options: [],
});

export default function ServiceFormModal({ open, onClose, onSubmit, initialData, mode }: Props) {
  const [form, setForm] = useState<Service>(emptyService());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [durationStr, setDurationStr] = useState<string>(''); // <-- ช่องเดียว H:MM
  const isView = mode === 'view';

  useEffect(() => {
    if (mode === 'add') {
      const init = emptyService();
      setForm(init);
      // default duration 30 นาที
      setDurationStr('0:30');
      setForm(prev => ({ ...prev, duration: String(30) }));
    } else if (initialData) {
      console.log("initialData", initialData)
      setForm({ ...initialData, options: initialData.options ? [...initialData.options] : [] });
      // แปลง minutes -> H:MM
      const total = toInt(initialData.duration, 0);
      const h = Math.floor(total / 60);
      const m = total % 60;
      setDurationStr(`${h}:${m.toString().padStart(2, '0')}`);
    } else {
      const init = emptyService();
      setForm(init);
      setDurationStr('0:30');
      setForm(prev => ({ ...prev, duration: String(30) }));
    }
    setErrors({});
  }, [initialData, mode, open]);

  if (!open) return null;

  const update = <K extends keyof Service>(key: K, value: Service[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  // --- เพิ่ม helper parse/format duration ---
  const parseDurationString = (s: string): number | null => {
    // ยอมรับรูปแบบ "H:MM" หรือ "M" (เฉยๆ) ก็ได้
    const trimmed = s.trim();
    // รูปแบบ H:MM
    const m = trimmed.match(/^(\d+):([0-5]\d)$/);
    if (m) {
      const h = Number(m[1]);
      const mm = Number(m[2]);
      if (!Number.isFinite(h) || !Number.isFinite(mm)) return null;
      return h * 60 + mm;
    }
    // หรือถ้า user พิมพ์ตัวเดียวเป็นนาที (เช่น "90")
    const asNum = Number(trimmed);
    if (!Number.isNaN(asNum) && Number.isFinite(asNum) && asNum >= 0) {
      return Math.floor(asNum);
    }
    return null;
  };

  const onChangeDurationStr = (v: string) => {
    setDurationStr(v);
    const total = parseDurationString(v);
    if (total === null) {
      // ไม่สามารถ parse → ว่างค่า duration ใน form เพื่อให้ validate ตรวจจับ
      update('duration', '');
    } else {
      // อัปเดตค่าเป็น minutes (string)
      update('duration', String(total));
    }

    // ล้าง error เกี่ยวกับ duration เมื่อ user แก้
    setErrors(prev => {
      const p = { ...prev };
      delete p.duration;
      return p;
    });
  };

  const updateOption = (idx: number, patch: Partial<NonNullable<Service['options']>[number]>) => {
    const opts = (form.options ?? []).map((o, i) => (i === idx ? { ...(o as optionService), ...(patch as Service) } : o));
    setForm(prev => ({ ...prev, options: opts }));
  };

  const addOption = () => {
    const nextId = (form.options?.length ?? 0) > 0 ? Math.max(...(form.options ?? []).map(o => Number(o.id))) + 1 : 1;
    console.log("nextId", nextId)
    const opts = [...(form.options ?? []), { id: nextId, name: '', price: '' }];
    console.log("opts", opts)
    setForm(prev => ({ ...prev, options: opts as optionService[] }));
  };

  const removeOption = (idx: number) => {
    const opts = (form.options ?? []).filter((_, i) => i !== idx);
    setForm(prev => ({ ...prev, options: opts }));
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.name || form.name.trim().length < 2) e.name = 'กรุณาระบุชื่อบริการ (อย่างน้อย 3 ตัวอักษร)';
    const total = toInt(form.duration, NaN); // minutes
    if (!Number.isFinite(total) || total <= 29 || total > 360) {
      e.duration = 'ระยะเวลาต้องอยู่ระหว่าง 30 นาที ถึง 6 ชั่วโมง';
    }
    if (!Number.isFinite(Number(form.price)) || Number(form.price) < 1) e.price = 'ราคาต้องมากกว่า 0 บาท';
    (form.options ?? []).forEach((o, i) => {
      if (!o.name || o.name.trim().length < 2) e[`option_${i}`] = 'กรุณาระบุชื่อ option อย่างน้อย 3 ตัวอักษร';
      if (!Number.isFinite(Number(o.price)) || Number(o.price) < 1) e[`option_price_${i}`] = 'ราคา option ต้องมากกว่า 0 บาท';
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    console.log("form", form)
    e?.preventDefault();
    if (isView) return onClose();
    if (!validate()) return;

    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert('ไม่พบ token กรุณาเข้าสู่ระบบใหม่');
      return;
    }

    try {
      const res = await fetch('/api/service', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      console.log("res", res)

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Unknown error" }));
        console.error("API Error:", err);

        alert("ไม่สามารถบันทึกข้อมูลได้\n" + (err.message || JSON.stringify(err)));
        return;
      }

      const data = await res.json();
      if (onSubmit) await onSubmit(data);
      onClose();
      alert('บันทึกข้อมูลเรียบร้อย');
      window.location.reload();

    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ API');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <form
        className="relative z-10 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl"
        onSubmit={handleSubmit}
        onClick={e => e.stopPropagation()}
      >
        <header className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {mode === 'add' ? 'เพิ่มบริการ' : mode === 'edit' ? 'แก้ไขบริการ' : 'ดูรายละเอียดบริการ'}
          </h2>
          {/* <button type="button" className="text-sm text-gray-600" onClick={onClose}>
            ปิด
          </button> */}
        </header>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="col-span-1">
            <label className="mb-1 block text-sm font-medium">ชื่อบริการ</label>
            <input
              className={`w-full rounded border px-3 py-2 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
              value={form.name}
              onChange={e => update('name', e.target.value)}
              disabled={isView}
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
          </div>

          {/* <div className='flex gap-2'> */}
          <div className='col-span-1'>
            <label className="mb-1 block text-sm font-medium">ระยะเวลา (H:MM)</label>
            <input
              className={`w-full rounded border px-3 py-2 ${errors.duration ? 'border-red-500' : 'border-gray-300'}`}
              value={durationStr}
              onChange={e => onChangeDurationStr(e.target.value)}
              disabled={isView}
              placeholder="ตัวอย่าง: 1:30 (1 ชั่วโมง 30 นาที)"
            />
            {errors.duration && <p className="mt-1 text-xs text-red-600">{errors.duration}</p>}
            {!isView && (
              <p className="mt-1 text-xs text-gray-500">เช่น 1:30, 300</p>
            )}
          </div>
          {/* </div> */}

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium">คำอธิบาย</label>
            <textarea
              className="w-full rounded border px-3 py-2 border-gray-300"
              rows={2}
              value={form.description}
              onChange={e => update('description', e.target.value)}
              disabled={isView}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">ราคา</label>
            <input
              // type="number"
              className={`w-full rounded border px-3 py-2 ${errors.price ? 'border-red-500' : 'border-gray-300'}`}
              value={form.price}
              onChange={e => update('price', e.target.value)}
              disabled={isView}
              min={0}
              max={1000000}
            // min={0}
            // step={0.01}
            />
            {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price}</p>}
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-medium">Options</h3>
            {!isView && (
              <button type="button" className="text-sm text-blue-600" onClick={addOption}>
                + เพิ่ม option
              </button>
            )}
          </div>

          <div className=''>
            {(form.options ?? []).length === 0 && <p className="text-sm text-gray-500">ยังไม่มี option</p>}

            {(form.options ?? []).map((opt, i) => (
              <div key={opt.id} className='flex gap-4 mb-4'>
                <div className="w-full md:w-6/12">
                  <label className="mb-1 block text-sm font-medium">ชื่อ option</label>
                  {/* <div className='w-2/3 mr-2'> */}
                  <input
                    className={`flex-1 w-full rounded border px-3 py-2 ${errors[`option_${i}`] ? 'border-red-500' : 'border-gray-300'}`}
                    value={opt.name}
                    onChange={e => updateOption(i, { name: e.target.value })}
                    disabled={isView}
                  />
                  {errors[`option_${i}`] && <p className="mt-1 text-xs text-red-600">{errors[`option_${i}`]}</p>}
                  {/* </div> */}
                  {/* <div className='w-1/3'> */}
                  {/* </div> */}
                  {/* {!isView && (
                    <button type="button" className="text-sm mb-4 text-red-600" onClick={() => removeOption(i)}>
                      ลบ
                    </button>
                  )} */}
                </div>
                <div className={`w-full ${isView ? 'md:w-6/12' : 'md:w-5/12'} `}>
                  <label className="mb-1 block text-sm font-medium">ราคา </label>
                  <input
                    // type="number"
                    className={`w-full rounded border px-3 py-2 ${errors[`option_price_${i}`] ? 'border-red-500' : 'border-gray-300'}`}
                    value={opt.price}
                    onChange={e => updateOption(i, { price: e.target.value })}
                    disabled={isView}
                    min={0}
                    max={1000000}
                  // step={0.01}
                  />
                  {errors[`option_price_${i}`] && <p className="mt-1 text-xs text-red-600">{errors[`option_price_${i}`]}</p>}

                  {/* {errors.duration && <p className="mt-1 text-xs text-red-600">{errors.duration}</p>} */}
                  {/* {!isView && (
                    <p className="mt-1 text-xs text-gray-500">เช่น 1:30, 300</p>
                  )} */}
                </div>
                {!isView && (
                  <div className='w-full md:w-1 content-center mt-4'>
                    <button type="button" className="text-sm mb-4 text-red-600 cursor-pointer " onClick={() => removeOption(i)}>
                      ลบ
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <footer className="mt-6 flex justify-end gap-3">
          <button type="button" className="bg-slate-100 rounded-md px-4 py-2 text-sm cursor-pointer" onClick={onClose}>
            ปิด
          </button>

          {!isView &&
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-60 cursor-pointer"
            >
              บันทึก
            </button>
          }
        </footer>
      </form>
    </div>
  );
}
