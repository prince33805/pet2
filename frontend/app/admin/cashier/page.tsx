'use client';

import SummaryCard from "@/components/admin/SummaryCard";
import Section from "@/components/Section";
import Pill from "@/components/ui/Pill";
import { useServices } from "@/hooks/useServices";
import { Customer, Staff, optionService, Pet, Service } from "@/types/models";
import React, { useEffect, useMemo, useState } from "react";

type OrderPayload = {
  customerId: string | null;
  pets: Array<{
    petId: string;
    services: Array<{
      serviceId: string;
      options?: optionService[];
    }>;
  }>;
  staffId: string | null;
  dateTime: string; // ISO string
  status: "draft" | "submitted" | "paid" | "cancelled";
};

export default function CashierPage() {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);


  const [pets, setPets] = useState<Pet[]>([]);
  const { services, fetchServices, loading: servicesLoading } = useServices();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);


  // Cards for pet + services/options selections
  type CardState = {
    key: string; // unique key for rendering
    petId: string | "";
    services: Array<{ serviceId: string | ""; options: optionService[] }>; // at least one service row
  };


  const [cards, setCards] = useState<CardState[]>([
    { key: crypto.randomUUID(), petId: "", services: [{ serviceId: "", options: [] }] },
  ]);


  useEffect(() => {
    const loadStatic = async () => {
      const [staffRes] = await Promise.all([
        fetch("/api/staff").then((r) => r.json()),
      ]);
      console.log("Loaded staff:", staffRes);
      setStaff(staffRes?.data ?? []);
    };
    loadStatic();
  }, []);


  // Fetch customers by search
  const onSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSearching(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('Please login');
      // const res = await fetch(`/api/customers?q=${encodeURIComponent(query)}`, { headers: { Authorization: `Bearer ${token}` } });
      // if (!res.ok) throw new Error(await res.text());
      // const json = await res.json();
      // setCustomers(json?.data ?? []);
      setCustomers([{
        "id": "21b10c86-4303-4689-8420-3b46c4d25973",
        "fullname": "aaa",
        "username": "aaa",
        "phone": "1234567890",
      }]);
    } finally {
      setSearching(false);
    }
  };


  // When a customer is chosen, fetch their pets
  const chooseCustomer = async (c: Customer) => {
    setSelectedCustomer(c);
    setSelectedStaffId(null);
    setCards([{ key: crypto.randomUUID(), petId: "", services: [{ serviceId: "", options: [] }] }]);
    setPets([]);
    const token = localStorage.getItem('accessToken');
    if (!token) throw new Error('Please login');
    const res = await fetch(`/api/customer/${c.id}/pets`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error(await res.text());
    const json = await res.json();
    setPets(json?.data ?? []);
  };


  const addCard = () => {
    setCards((prev) => [...prev, { key: crypto.randomUUID(), petId: "", services: [{ serviceId: "", options: [] }] }]);
  };


  const removeCard = (key: string) => setCards((prev) => prev.filter((c) => c.key !== key));


  const updateCardPet = (key: string, petId: string) => {
    setCards((prev) => prev.map((c) => (c.key === key ? { ...c, petId } : c)));
  };


  const addServiceRow = (key: string) => {
    setCards((prev) =>
      prev.map((c) => (c.key === key ? { ...c, services: [...c.services, { serviceId: "", options: [] }] } : c))
    );
  };


  const removeServiceRow = (key: string, idx: number) => {
    setCards((prev) =>
      prev.map((c) =>
        c.key === key
          ? { ...c, services: c.services.filter((_, i) => i !== idx) }
          : c
      )
    );
  };


  const updateService = (key: string, idx: number, serviceId: string) => {
    setCards((prev) =>
      prev.map((c) =>
        c.key === key
          ? {
            ...c,
            services: c.services.map((s, i) => (i === idx ? { ...s, serviceId, options: [] } : s)),
          }
          : c
      )
    );
  };


  const toggleOption = (key: string, idx: number, opt: optionService) => {
    setCards((prev) =>
      prev.map((c) =>
        c.key === key
          ? {
            ...c,
            services: c.services.map((s, i) =>
              i === idx
                ? {
                  ...s, options: s.options.includes(opt)
                    ? s.options.filter((o) => o !== opt)
                    : [...s.options, opt],
                }
                : s
            ),
          }
          : c
      )
    );
  };


  // Compose Summary Payload in real-time
  const payload: OrderPayload = useMemo(() => {
    return {
      customerId: selectedCustomer?.id ?? null,
      pets: cards
        .filter((c) => c.petId)
        .map((c) => ({
          petId: c.petId as string,
          services: c.services
            .filter((s) => s.serviceId)
            .map((s) => ({ serviceId: s.serviceId as string, options: s.options })),
        })),
      staffId: selectedStaffId,
      dateTime: new Date().toISOString(),
      status: "draft",
    };
  }, [cards, selectedCustomer, selectedStaffId]);


  // Submit
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<null | { ok: boolean; id?: string; error?: string }>(null);


  const canSubmit = Boolean(
    payload.customerId && payload.pets.length > 0 && payload.pets.every((p) => p.services.length > 0) && payload.staffId
  );


  const onSubmit = async () => {
    setSubmitting(true);
    setSubmitResult(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      setSubmitResult(json);
      if (json?.ok) {
        // reset to fresh draft keeping current customer & pets for convenience
        setCards([{ key: crypto.randomUUID(), petId: "", services: [{ serviceId: "", options: [] }] }]);
      }
    } catch (e: any) {
      setSubmitResult({ ok: false, error: e?.message ?? "Unknown error" });
    } finally {
      setSubmitting(false);
    }
  };


  // Helpers
  const findService = (sid: string | "") => services.find((s) => s.id === sid);


  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold">Cashier</h1>


      <div className="grid gap-6 md:grid-cols-5">
        {/* Left: 60% */}
        <div className="md:col-span-3 lg:col-span-3 xl:col-span-3">
          {/* 1. Search Customer */}
          <Section title="1) Search Customer">
            <form onSubmit={onSearch} className="flex gap-2">
              <input
                className="flex-1 rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring"
                placeholder="Search by name or phone"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button
                className="rounded-xl bg-black px-4 py-2 text-white disabled:opacity-50"
                disabled={searching}
              >
                {searching ? "Searching..." : "Search"}
              </button>
            </form>


            {/* Results */}
            {customers.length > 0 && (
              <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
                {customers.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => chooseCustomer(c)}
                    className={`rounded-xl border px-3 py-2 text-left hover:border-black ${selectedCustomer?.id === c.id ? "border-black bg-gray-50" : "border-gray-200"
                      }`}
                  >
                    <div className="font-medium">{c.fullname}</div>
                    {c.phone && <div className="text-sm text-gray-600">{c.phone}</div>}
                  </button>
                ))}
              </div>
            )}


            {selectedCustomer && (
              <div className="mt-3 flex items-center gap-3">
                <Pill>Selected: {selectedCustomer.fullname}</Pill>
              </div>
            )}
          </Section>


          {/* 2. Pets of selected customer */}
          <Section title="2) Pets of Selected Customer">
            {!selectedCustomer && <div className="text-sm text-gray-500">Select a customer first.</div>}
            {selectedCustomer && pets.length === 0 && (
              <div className="text-sm text-gray-500">No pets found for this customer.</div>
            )}
            {selectedCustomer && pets.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {pets.map((p) => (
                  <Pill key={p.id}>
                    {p.name} · {p.species}
                  </Pill>
                ))}
              </div>
            )}
          </Section>


          {/* 3–5. Pet/Service Cards */}
          <Section title="3-5) Pet & Services">
            <div className="space-y-4">
              {cards.map((card, cardIdx) => (
                <div key={card.key} className="rounded-2xl border border-gray-200 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-semibold">Card #{cardIdx + 1}</h3>
                    {cards.length > 1 && (
                      <button className="text-sm text-red-600" onClick={() => removeCard(card.key)}>
                        Remove card
                      </button>
                    )}
                  </div>


                  {/* Select Pet */}
                  <div className="mb-3 grid gap-2 md:grid-cols-2">
                    <label className="text-sm text-gray-700">Pet</label>
                    <select
                      className="rounded-xl border border-gray-300 px-3 py-2"
                      value={card.petId}
                      onChange={(e) => updateCardPet(card.key, e.target.value)}
                      disabled={!selectedCustomer || pets.length === 0}
                    >
                      <option value="">Select a pet...</option>
                      {pets.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.species})
                        </option>
                      ))}
                    </select>
                  </div>


                  {/* Services rows */}
                  <div className="space-y-3">
                    {card.services.map((svc, svcIdx) => {
                      const svcMeta = findService(svc.serviceId);
                      return (
                        <div key={svcIdx} className="rounded-xl border border-gray-200 p-3">
                          <div className="mb-2 grid gap-2 md:grid-cols-2">
                            <label className="text-sm text-gray-700">Service</label>
                            <div className="flex items-center gap-2">
                              <select
                                className="w-full rounded-xl border border-gray-300 px-3 py-2"
                                value={svc.serviceId}
                                onChange={(e) => updateService(card.key, svcIdx, e.target.value)}
                              >
                                <option value="">Select a service...</option>
                                {services.map((s) => (
                                  <option key={s.id} value={s.id}>
                                    {s.name}
                                  </option>
                                ))}
                              </select>
                              {card.services.length > 1 && (
                                <button
                                  className="text-xs text-red-600"
                                  onClick={() => removeServiceRow(card.key, svcIdx)}
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                          </div>


                          {/* Options for selected service */}
                          {!!svcMeta && svcMeta.options && (
                            <div className="mt-2 grid gap-2 md:grid-cols-2">
                              <label className="text-sm text-gray-700">Options</label>
                              <div className="flex flex-wrap gap-2">
                                {svcMeta.options.map((opt) => {
                                  const active = svc.options.includes(opt);
                                  return (
                                    <button
                                      key={opt.id}
                                      type="button"
                                      onClick={() => toggleOption(card.key, svcIdx, opt)}
                                      className={`rounded-full border px-3 py-1 text-sm ${active ? "border-black bg-black text-white" : "border-gray-300"
                                        }`}
                                    >
                                      {opt.name}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>


                  <div className="mt-3">
                    <button className="text-sm text-gray-700" onClick={() => addServiceRow(card.key)}>
                      + Add another service
                    </button>
                  </div>
                </div>
              ))}


              <div>
                <button className="rounded-xl border border-gray-300 px-4 py-2" onClick={addCard}>
                  + Add Card
                </button>
              </div>
            </div>
          </Section>


          {/* 6. Staff */}
          <Section title="6) Staff">
            <div className="grid gap-2 md:grid-cols-2">
              <label className="text-sm text-gray-700">Assign Staff</label>
              <select
                className="rounded-xl border border-gray-300 px-3 py-2"
                value={selectedStaffId ? String(selectedStaffId) : ""}
                onChange={(e) => setSelectedStaffId(e.target.value ?? null)}
              >
                <option value="">Select staff...</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} {s.role ? `(${s.role})` : ""}
                  </option>
                ))}
              </select>
            </div>
          </Section>


          {/* 8. Submit */}
          <div className="flex items-center gap-3">
            <button
              onClick={onSubmit}
              disabled={!canSubmit || submitting}
              className="rounded-xl bg-black px-5 py-2.5 text-white disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Order"}
            </button>
            {!canSubmit && (
              <span className="text-sm text-gray-500">Select customer, at least one pet/service, and staff.</span>
            )}
          </div>


          {submitResult && (
            <div className={`mt-3 rounded-xl border p-3 ${submitResult.ok ? "border-green-300 bg-green-50" : "border-red-300 bg-red-50"}`}>
              {submitResult.ok ? (
                <div>Order submitted! ID: <b>{submitResult.id}</b></div>
              ) : (
                <div>Error: {submitResult.error ?? "Unknown"}</div>
              )}
            </div>
          )}
        </div>


        {/* Right: 40% */}
        {/* <div className="md:col-span-2 lg:col-span-2 xl:col-span-2">
          <div className="sticky top-6">
            <Section title="7) Summary (request body)">
              <pre className="max-h-[70vh] overflow-auto rounded-xl bg-gray-900 p-3 text-xs text-gray-100">
                {JSON.stringify(payload, null, 2)}
              </pre>
              <div className="mt-2 text-xs text-gray-500">This is exactly what will be sent to the API.</div>
            </Section>
          </div>
        </div> */}

        {/* Right: 40% */}
        <div className="md:col-span-2 lg:col-span-2 xl:col-span-2">
          <div className="sticky top-6">
            <SummaryCard
              cards={cards}
              services={services}
              selectedCustomer={selectedCustomer ? { id: selectedCustomer.id, fullname: selectedCustomer.fullname } : null}
              selectedStaffId={selectedStaffId ?? null}
              submitting={submitting}
              onConfirm={onSubmit} // (optional) ถ้าคุณอยากให้ Summary เรียก onSubmit ของหน้า
              showPreview={true}
            />

          </div>
        </div>

      </div >
    </div >
  );
}
