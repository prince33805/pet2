// SummaryCard.tsx
'use client';

import { Service } from '@/types/models';
import React from 'react';

type Option = { id: number; name: string; price: number };
type Card = {
  key: string;
  petId: string | '';
  services: {
    serviceId: string | '';
    // Note: your UI toggles options by passing the whole opt object or ids.
    // We allow both forms: number/id or object with {id, name, price}
    options: Array<number | string | { id: number | string; name?: string; price?: number }>;
  }[];
};

interface Props {
  cards: Card[];
  services: Service[]; // catalog
  selectedCustomer?: { id: string; fullname?: string } | null;
  selectedStaffId?: string | null;
  submitting?: boolean;
  onConfirm?: (body: any) => void; // callback for confirm (optional)
  // optional flags
  showPreview?: boolean;
}

function extractOptionId(opt: any): number | string {
  if (opt == null) return opt;
  if (typeof opt === 'number' || typeof opt === 'string') return opt;
  if (typeof opt === 'object' && 'id' in opt) return opt.id;
  return opt;
}

export default function SummaryCard({
  cards,
  services,
  selectedCustomer,
  selectedStaffId,
  submitting,
  onConfirm,
  showPreview = true,
}: Props) {
  // Build body according to requested shape
  const body = React.useMemo(() => {
    const pets = cards
      .filter((c) => c.petId) // only include cards with selected pet
      .map((c) => ({
        petId: c.petId,
        services: c.services
          .filter((s) => s.serviceId)
          .map((s) => ({
            serviceId: s.serviceId,
            options: (s.options || []).map((opt) => extractOptionId(opt)),
          })),
      }));

    return {
      customerId: selectedCustomer?.id ?? null,
      pets,
      staffId: selectedStaffId ?? null,
      dateTime: new Date().toISOString(),
      status: 'SCHEDULED',
    };
  }, [cards, selectedCustomer, selectedStaffId]);

  // Compute totals
  const totals = React.useMemo(() => {
    let totalPrice = 0;
    let totalDuration = 0;

    for (const c of cards) {
      for (const svcEntry of c.services) {
        if (!svcEntry.serviceId) continue;
        const svc = services.find((s) => String(s.id) === String(svcEntry.serviceId));
        if (!svc) continue;
        totalPrice += Number(svc.price || 0);
        totalDuration += Number(svc.duration || 0);

        // options: svcEntry.options may be array of ids or objects
        for (const opt of (svcEntry.options || [])) {
          const optId = extractOptionId(opt);
          // try to find option in svc.optionService or svc.options
          const catalogOpts: Option[] = (svc.options ?? (svc as any).options) ?? [];
          const found = catalogOpts.find((o) => String(o.id) === String(optId));
          if (found) totalPrice += Number(found.price || 0);
          else {
            // If catalog not found, and option is number price? skip
          }
        }
      }
    }

    return { totalPrice, totalDuration };
  }, [cards, services]);

  const canConfirm = Boolean(
    selectedCustomer?.id &&
      cards.some((c) => c.petId) &&
      cards.some((c) => c.services && c.services.some((s) => s.serviceId)) &&
      selectedStaffId,
  );

  const handleConfirm = () => {
    if (!canConfirm) return;
    if (onConfirm) {
      onConfirm(body);
      return;
    }

    // default behavior: POST to /api/appointment
    (async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert('Please login');
        return;
      }
      try {
        const res = await fetch('/api/appointment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || res.statusText);
        }
        const json = await res.json();
        alert('Order submitted: ' + (json.id ?? 'OK'));
      } catch (err: any) {
        console.error(err);
        alert('Submit failed: ' + (err?.message ?? 'unknown'));
      }
    })();
  };

  return (
    <div className="rounded-2xl border border-gray-200 p-4 bg-white">
      <h2 className="text-lg font-semibold mb-2">Summary</h2>

      <div className="text-sm mb-3">
        <div className="flex justify-between">
          <span>Customer</span>
          <span className="font-medium">{selectedCustomer?.fullname ?? selectedCustomer?.id ?? '—'}</span>
        </div>
        <div className="flex justify-between">
          <span>Staff</span>
          <span className="font-medium">{selectedStaffId ?? '—'}</span>
        </div>
      </div>

      <div className="space-y-2 max-h-64 overflow-auto mb-3">
        {cards.filter(c => c.petId).length === 0 ? (
          <div className="text-sm text-gray-500">No pet selected</div>
        ) : (
          cards
            .filter((c) => c.petId)
            .map((c) => (
              <div key={c.key} className="p-2 border rounded-md">
                <div className="text-sm font-medium">Pet: {c.petId}</div>
                <div className="text-xs text-gray-600 mt-1">
                  {c.services.length === 0 ? (
                    <i>No services</i>
                  ) : (
                    <ul className="list-disc ml-4">
                      {c.services.map((s, i) => {
                        const svc = services.find((sv) => String(sv.id) === String(s.serviceId));
                        return (
                          <li key={i}>
                            <div>
                              <span className="font-medium">{svc?.name ?? s.serviceId}</span>
                              {svc ? ` — ฿${svc.price} · ${svc.duration ?? '-'} min` : null}
                            </div>
                            {s.options && s.options.length > 0 && (
                              <ul className="list-disc ml-6 text-xs text-gray-700">
                                {s.options.map((opt, idx) => {
                                  const optId = extractOptionId(opt);
                                  const optMeta = svc?.options?.find((o) => String(o.id) === String(optId));
                                  return (
                                    <li key={idx}>
                                      {optMeta?.name ?? String(optId)} {optMeta ? `(+฿${optMeta.price})` : null}
                                    </li>
                                  );
                                })}
                              </ul>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
            ))
        )}
      </div>

      <div className="border-t pt-3 text-sm mb-3">
        <div className="flex justify-between">
          <span>Total duration</span>
          <span className="font-medium">{totals.totalDuration} min</span>
        </div>
        <div className="flex justify-between">
          <span>Total price</span>
          <span className="font-medium">฿{totals.totalPrice}</span>
        </div>
      </div>

      <button
        onClick={handleConfirm}
        disabled={!canConfirm || submitting}
        className="w-full rounded-xl bg-black py-2 text-white disabled:opacity-50"
      >
        {submitting ? 'Submitting...' : 'Confirm Order'}
      </button>

      {showPreview && (
        <div className="mt-3 text-xs text-slate-500">
          <div className="font-medium mb-1">Request Body</div>
          <pre className="max-h-56 overflow-auto bg-gray-50 p-2 rounded text-xs">{JSON.stringify(body, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
