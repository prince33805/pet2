import React, { useEffect, useState } from 'react';
import { Service } from '@/types/models';

export type ServiceFormMode = 'view' | 'add' | 'edit';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit?: (service: Service) => void | Promise<void>;
  initialData?: Service | null;
  mode: ServiceFormMode;
}

const emptyService = (): Service => ({
  name: '',
  description: '',
  duration: '30',
  price: 0,
  optionService: [],
});

export default function ServiceFormModal({ open, onClose, onSubmit, initialData, mode }: Props) {
  const [form, setForm] = useState<Service>(emptyService());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isView = mode === 'view';

  useEffect(() => {
    if (mode === 'add') {
      setForm(emptyService());
    } else if (initialData) {
      setForm({ ...initialData, optionService: initialData.optionService ? [...initialData.optionService] : [] });
    } else {
      setForm(emptyService());
    }
    setErrors({});
  }, [initialData, mode, open]);

  if (!open) return null;

  const update = <K extends keyof Service>(key: K, value: Service[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const updateOption = (idx: number, patch: Partial<NonNullable<Service['optionService']>[number]>) => {
    const opts = (form.optionService ?? []).map((o, i) => (i === idx ? { ...(o as any), ...(patch as any) } : o));
    setForm(prev => ({ ...prev, optionService: opts }));
  };

  const addOption = () => {
    const nextId = (form.optionService?.length ?? 0) > 0 ? Math.max(...(form.optionService ?? []).map(o => o.id)) + 1 : 1;
    const opts = [...(form.optionService ?? []), { id: nextId, name: '', price: 0 }];
    setForm(prev => ({ ...prev, optionService: opts }));
  };

  const removeOption = (idx: number) => {
    const opts = (form.optionService ?? []).filter((_, i) => i !== idx);
    setForm(prev => ({ ...prev, optionService: opts }));
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.name || form.name.trim().length < 2) e.name = 'กรุณาระบุชื่อบริการ (อย่างน้อย 2 ตัวอักษร)';
    if (!form.duration || form.duration.trim().length < 2) e.duration = 'ระบุระยะเวลาเป็นจำนวนเต็มนาทีที่มากกว่า 0';
    if (!Number.isFinite(form.price) || form.price < 0) e.price = 'ราคาต้องไม่เป็นค่าลบ';
    (form.optionService ?? []).forEach((o, i) => {
      if (!o.name || o.name.trim() === '') e[`option_${i}`] = 'ชื่อ option ห้ามว่าง';
      if (!Number.isFinite(o.price) || o.price < 0) e[`option_price_${i}`] = 'ราคา option ต้องไม่เป็นค่าลบ';
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
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

      if (!res.ok) {
        const errText = await res.text();
        console.error('API Error:', errText);
        alert('ไม่สามารถบันทึกข้อมูลได้\n' + errText);
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
          <button type="button" className="text-sm text-gray-600" onClick={onClose}>
            ปิด
          </button>
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

          <div>
            <label className="mb-1 block text-sm font-medium">ระยะเวลา (นาที)</label>
            <input
              type="number"
              className={`w-full rounded border px-3 py-2 ${errors.duration ? 'border-red-500' : 'border-gray-300'}`}
              value={form.duration}
              onChange={e => update('duration', String(e.target.value))}
              disabled={isView}
              min={1}
            />
            {errors.duration && <p className="mt-1 text-xs text-red-600">{errors.duration}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium">คำอธิบาย</label>
            <textarea
              className="w-full rounded border px-3 py-2 border-gray-300"
              rows={4}
              value={form.description}
              onChange={e => update('description', e.target.value)}
              disabled={isView}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">ราคา</label>
            <input
              type="number"
              className={`w-full rounded border px-3 py-2 ${errors.price ? 'border-red-500' : 'border-gray-300'}`}
              value={form.price}
              onChange={e => update('price', Number(e.target.value))}
              disabled={isView}
              min={0}
              step={0.01}
            />
            {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price}</p>}
          </div>
        </div>

        <section className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-medium">Options</h3>
            {!isView && (
              <button type="button" className="text-sm text-blue-600" onClick={addOption}>
                + เพิ่ม option
              </button>
            )}
          </div>

          <div className="space-y-3">
            {(form.optionService ?? []).length === 0 && <p className="text-sm text-gray-500">ยังไม่มี option</p>}

            {(form.optionService ?? []).map((opt, i) => (
              <div key={opt.id} className="flex items-center gap-2">
                <input
                  className={`flex-1 rounded border px-3 py-2 ${errors[`option_${i}`] ? 'border-red-500' : 'border-gray-300'}`}
                  value={opt.name}
                  onChange={e => updateOption(i, { name: e.target.value })}
                  disabled={isView}
                />
                <input
                  type="number"
                  className={`w-32 rounded border px-3 py-2 ${errors[`option_price_${i}`] ? 'border-red-500' : 'border-gray-300'}`}
                  value={opt.price}
                  onChange={e => updateOption(i, { price: Number(e.target.value) })}
                  disabled={isView}
                  min={0}
                  step={0.01}
                />
                {!isView && (
                  <button type="button" className="text-sm text-red-600" onClick={() => removeOption(i)}>
                    ลบ
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        <footer className="mt-6 flex justify-end gap-3">
          <button type="button" className="rounded-md px-4 py-2 text-sm" onClick={onClose}>
            ยกเลิก
          </button>

          {isView ? (
            <button type="button" className="rounded-md border px-4 py-2 text-sm" onClick={onClose}>
              ปิด
            </button>
          ) : (
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-60"
            >
              บันทึก
            </button>
          )}
        </footer>
      </form>
    </div>
  );
}
