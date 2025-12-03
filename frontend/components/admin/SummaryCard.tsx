// SummaryCard.tsx
'use client';

import { Customer, Service, Staff } from '@/types/models';
import React from 'react';

type Option = { id: string | number; name?: string | undefined; price?: number | string | undefined };
type Card = {
  key: string;
  petId: string | '';
  petName: string | '';
  services: {
    serviceId: string | '';
    // Note: your UI toggles options by passing the whole opt object or ids.
    // We allow both forms: number/id or object with {id, name, price}
    options: Array<{ id: number | string; name?: string; price?: string }>;
  }[];
};

interface PetItemDto {
  petId: string;
  services: ServiceDto[];
}
interface ServiceDto {
  serviceId: string;
  options: {
    optionId: string | number;
  }[]
}

interface Props {
  cards: Card[];
  services: Service[]; // catalog
  selectedCustomer?: Customer | null;
  selectedStaff?: Staff | null;
  submitting?: boolean;
  onConfirm?: (body: {
    customerId: string | null;
    pets: PetItemDto[];
    staffId: Staff | null;
    status: string;
  }) => void; // callback for confirm (optional)
  // optional flags
  // showPreview?: boolean;
}

function extractOptionId(opt: Option): number | string {
  if (opt == null) return opt;
  if (typeof opt === 'number' || typeof opt === 'string') return opt;
  if (typeof opt === 'object' && 'id' in opt) return opt.id;
  return opt;
}

export default function SummaryCard({
  cards,
  services,
  selectedCustomer,
  selectedStaff,
  submitting,
  onConfirm,
  // showPreview = true,
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
            options:
              s.options && s.options.length > 0
                ? s.options.map((opt) => ({ optionId: opt.id }))
                : [],
          })),
      }));

    return {
      customerId: selectedCustomer?.id ?? null,
      pets,
      staffId: selectedStaff ?? null,
      // dateTime: new Date().toISOString(),
      status: 'SCHEDULED',
    };
  }, [cards, selectedCustomer, selectedStaff]);

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
          const catalogOpts: Option[] = (svc.options ?? (svc as Service).options) ?? [];
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
    selectedStaff?.id,
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
      } catch (err: unknown) {
        console.error(err);
        // alert('Submit failed: ' + (err?.message ?? 'unknown'));
      }
    })();
  };

  return (
    <div className="rounded-2xl border border-gray-200 p-4 bg-white h-full flex flex-col shadow-sm">
      {/* <h2 className="text-lg font-semibold mb-2">Summary</h2> */}
      <h2 className="text-2xl font-bold text-[#111713] mb-6">Order Summary</h2>

      <div className="text-lg mb-3">
        <div className="flex justify-between">
          <span>Customer</span>
          <span className="font-medium">{selectedCustomer?.fullname ?? '—'} {selectedCustomer?.phone ?? '—'}</span>
        </div>
        <div className="flex justify-between">
          <span>Staff</span>
          <span className="font-medium">{selectedStaff?.name ?? '—'}</span>
        </div>
      </div>

      <div className="space-y-2 max-h-64 overflow-auto mb-3 flex-1">
        {cards.filter(c => c.petId).length === 0 ? (
          <div className="text-sm text-gray-500">No pet selected</div>
        ) : (
          cards
            .filter((c) => c.petId)
            .map((c) => (
              <div key={c.key} className="p-2 rounded-md">
                <div className="text-xl font-medium">{c.petName}</div>
                <div className="text-medium text-gray-600 mt-1">
                  {c.services.length === 0 ? (
                    <i>No services</i>
                  ) : (
                    <ul className="list-disc ml-4">
                      {c.services.map((s, i) => {
                        const svc = services.find((sv) => String(sv.id) === String(s.serviceId));
                        return (
                          <li key={i}>
                            <div className='flex justify-between'>
                              <span className="font-medium">{svc?.name ?? s.serviceId}</span>
                              <span>
                                {svc ? ` ${svc.duration ?? '-'} min · ${svc.price} ฿` : null}
                              </span>
                            </div>
                            {s.options && s.options.length > 0 && (
                              <ul className="list-disc ml-6 text-medium text-gray-700">
                                {s.options.map((opt, idx) => {
                                  const optId = extractOptionId(opt);
                                  const optMeta = svc?.options?.find((o) => String(o.id) === String(optId));
                                  return (
                                    <li key={idx} className='flex justify-between'>
                                      <span>
                                        {optMeta?.name ?? String(optId)}
                                      </span>
                                      <span>
                                        {optMeta ? `(+ ${optMeta.price} ฿)` : null}
                                      </span>
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

      <div className="pt-6 border-t mt-auto">
        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-[#111713] ">
            <span>Total duration</span>
            <span>{totals.totalDuration} min</span>
          </div>
          {/* <div className="flex justify-between text-[#111713] ">
            <span>Subtotal</span>
            <span>{totals.totalPrice} ฿</span>
          </div>
          <div className="flex justify-between text-[#111713] ">
            <span>Discount</span>
            <span>$0.00</span>
          </div>
          <div className="flex justify-between text-[#111713] ">
            <span>Taxes (8%)</span>
            <span>$8.00</span>
          </div> */}
          <div className="flex justify-between text-[#111713] text-lg font-bold pt-2 border-t border-gray-200 dark:border-white/10 mt-2">
            <span>Total</span>
            <span>{totals.totalPrice} ฿</span>
          </div>
        </div>
      </div>

      {/* <div className="mt-auto border-t pt-3 text-sm mb-3">
        <div className="flex justify-between">
          <span>Total duration</span>
          <span className="font-medium">{totals.totalDuration} min</span>
        </div>
        <div className="flex justify-between">
          <span>Total price</span>
          <span className="font-medium">฿{totals.totalPrice}</span>
        </div>
      </div> */}

      <div className="mb-6">
        <p className="text-sm font-medium mb-2 text-[#111713] ">Payment Method</p>
        <div className="grid grid-cols-3 gap-2">
          <button className="py-2 px-3 rounded-lg border border-primary bg-primary/20 text-primary text-sm font-bold hover:bg-slate-100 hover:cursor-pointer">Cash</button>
          <button className="py-2 px-3 rounded-lg border border-gray-300 bg-background-light text-[#111713] text-sm cursor-not-allowed opacity-50">Card</button>
          <button className="py-2 px-3 rounded-lg border border-gray-300 bg-background-light text-[#111713] text-sm cursor-not-allowed opacity-50">Insurance</button>
        </div>
      </div>
      {/* <button className="w-full flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors">
        <span className="truncate">Process Payment</span>
      </button> */}

      <button
        onClick={handleConfirm}
        disabled={!canConfirm || submitting}
        className={`w-full rounded-xl bg-black py-2 text-white disabled:opacity-50 ${canConfirm ? 'hover:bg-black/80 hover:cursor-pointer' : 'cursor-not-allowed'} `}
      >
        {submitting ? 'Submitting...' : 'Confirm Order'}
      </button>

      {/* {showPreview && (
        <div className="mt-3 text-xs text-slate-500">
          <div className="font-medium mb-1">Request Body</div>
          <pre className="max-h-56 overflow-auto bg-gray-50 p-2 rounded text-xs">{JSON.stringify(body, null, 2)}</pre>
        </div>
      )} */}
    </div >
  );
}
