'use client';

import DateTimePicker from "@/components/admin/DateTimePicker";
import SummaryCard from "@/components/admin/SummaryCard";
import Section from "@/components/Section";
import { useServices } from "@/hooks/useServices";
import { Customer, Staff, optionService, Pet, Service } from "@/types/models";
import React, { useEffect, useMemo, useState } from "react";

type Options = {
  optionId: string;
}

type OrderPayload = {
  customerId: string | null;
  pets: Array<{
    petId: string;
    services: Array<{
      serviceId: string;
      options?: Options[];
    }>;
  }>;
  staffId: string | null;
  startSlotId: string | null; // ISO string
  status: "SCHEDULED" | "CONFIRMED" | "COMPLETED" | "CANCELED";
};

export default function CashierPage() {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const [pets, setPets] = useState<Pet[]>([]);
  const { services, loading: servicesLoading } = useServices();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [iso, setIso] = useState<string | null>(null);
  const [resetPicker, setResetPicker] = useState(0);

  // Cards for pet + services/options selections
  type CardState = {
    key: string; // unique key for rendering
    petId: string | "";
    petName: string | "";
    services: Array<{ serviceId: string | ""; options: optionService[] }>; // at least one service row
  };

  const [cards, setCards] = useState<CardState[]>([
    { key: crypto.randomUUID(), petId: "", petName: "", services: [] },
  ]);

  useEffect(() => {
    const loadStatic = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('Please login');
      const [staffRes] = await Promise.all([
        fetch("/api/staff", {
          headers: { Authorization: `Bearer ${token}` }
        }).then((r) => r.json()),
      ]);
      console.log("Loaded staff:", staffRes);
      if (staffRes?.statusCode === 401) {
        //remove invalid token
        console.log("token", token)
        localStorage.removeItem('accessToken');
        // go to login page
        window.location.href = '/login';
        // throw new Error('Session expired. Please login again.');
      }
      setStaff(staffRes?.data.staffs ?? []);
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
      const res = await fetch(
        `/api/customer?search=${encodeURIComponent(query)}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        });
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      setCustomers(json?.data.customers ?? []);
    } finally {
      setSearching(false);
    }
  };

  // When a customer is chosen, fetch their pets
  const chooseCustomer = async (c: Customer) => {
    setSelectedCustomer(c);
    setSelectedStaff(null);
    setCards([{ key: crypto.randomUUID(), petId: "", petName: "", services: [] }]);
    setPets([]);
    const token = localStorage.getItem('accessToken');
    if (!token) throw new Error('Please login');
    setCustomers([c]);
    const res = await fetch(`/api/customer/${c.id}`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error(await res.text());
    const json = await res.json();
    setPets(json?.data.pets ?? []);
    // ✅ ล้าง list เหลือแค่ customer ที่เลือก
  };

  const addCard = () => {
    setCards((prev) => {
      // ✅ จำกัดจำนวน card ตามจำนวนสัตว์เลี้ยง
      if (pets.length > 0 && prev.length >= pets.length) {
        alert(`Cannot add more cards — you have only ${pets.length} pet${pets.length > 1 ? "s" : ""}.`);
        return prev; // ไม่เพิ่ม
      }

      return [
        ...prev,
        {
          key: crypto.randomUUID(),
          petId: "",
          petName: "",
          services: [],
        },
      ];
    });
  };

  const removeCard = (key: string) => setCards((prev) => prev.filter((c) => c.key !== key));

  const updateCardPet = (key: string, petId: string) => {
    setCards((prev) => prev.map((c) => (c.key === key ? { ...c, petId, petName: findPetName(petId) } : c)));
  };

  const findPetName = (petId: string) => {
    return pets.find((pet) => pet.id === petId)?.name ?? "";
  };

  // เช็คว่า service ถูกเลือกในการ์ดหรือไม่
  const isServiceSelected = (card: CardState, serviceId: string) =>
    card.services.some((s) => s.serviceId === serviceId);

  // เลือก/ยกเลิก service (checkbox หลัก)
  const toggleService = (cardKey: string, service: Service) => {
    setCards((prev) =>
      prev.map((c) => {
        if (c.key !== cardKey) return c;
        const already = c.services.some((s) => s.serviceId === service.id);
        return already
          ? { ...c, services: c.services.filter((s) => s.serviceId !== service.id) as { serviceId: string; options: optionService[]; }[] }
          : { ...c, services: [...c.services, { serviceId: service.id, options: [] }] as { serviceId: string; options: optionService[]; }[] };
      })
    );
  };

  // เลือก/ยกเลิก option ของ service ที่ถูกเลือกไว้
  const toggleOptionForService = (cardKey: string, serviceId: string, opt: optionService) => {
    setCards((prev) =>
      prev.map((c) => {
        if (c.key !== cardKey) return c;
        return {
          ...c,
          services: c.services.map((s) => {
            if (s.serviceId !== serviceId) return s;
            const exist = s.options.some((o) => o.id === opt.id);
            return {
              ...s,
              options: exist ? s.options.filter((o) => o.id !== opt.id) : [...s.options, opt],
            };
          }),
        };
      })
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
            .map((s) => ({
              serviceId: s.serviceId as string,
              options:
                s.options && s.options.length > 0
                  ? s.options.map((opt) => ({ optionId: opt.id }))
                  : [],
            })),
        })),
      staffId: selectedStaff?.id ?? null,
      startSlotId: iso ?? null,
      status: "SCHEDULED",
    };
  }, [cards, selectedCustomer, selectedStaff, iso]);

  // Submit
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<null | { ok: boolean; id?: string; error?: string }>(null);

  const onSubmit = async () => {
    setSubmitting(true);
    setSubmitResult(null);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('Please login');
      console.log("payload", payload)
      const res = await fetch("/api/appointment", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      const raw = await res.text();            // อ่านครั้งเดียว
      let data = null;
      try { data = JSON.parse(raw); } catch { } // เผื่อไม่ใช่ JSON
      // ---- DEBUG LOG: ดูชัด ๆ ว่า backend ตอบอะไร ----
      console.log("[SUBMIT] status:", res.status, res.statusText);
      console.log("[SUBMIT] body:", data ?? raw);
      if (!res.ok) {
        setSubmitResult({
          ok: false,
          error: data?.message || data?.error || raw || `HTTP ${res.status}`,
        });
        return;
      }

      if (res.ok) {
        const extractedId =
          data?.id ??
          data?.data?.id ??
          data?.result?.id ??
          data?.orderId ??
          data?.data?.orderId ??
          null;

        setSubmitResult({ ok: true, id: extractedId ?? undefined });

        // reset form ถ้าต้องการ
        setCustomers([]);
        setSelectedCustomer(null);
        setPets([]);
        setCards([{ key: crypto.randomUUID(), petId: "", petName: "", services: [] }]);
        setSelectedStaff(null);
        setIso(null)
        setResetPicker((x) => x + 1);   // trigger reset one time

        // alert('บันทึกข้อมูลเรียบร้อย');
        // window.location.reload();
        // console.log("payload", payload)
      }
      // รองรับหลายทรงของ response: {id}, {data:{id}}, {result:{id}}, {orderId}, ฯลฯ
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      setSubmitResult({ ok: false, error: errorMessage || "Unknown error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 ">
      {/* <h1 className="mb-6 text-2xl font-bold">Cashier</h1> */}
      <p className="text-[#111713] text-3xl font-black leading-tight tracking-[-0.033em] pb-4">Point of Sale</p>
      <div className="grid gap-6 md:grid-cols-5 items-stretch">
        {/* Left: 60% */}
        <div className=" flex flex-col md:col-span-3 lg:col-span-3 xl:col-span-3">
          {/* 1. Search Customer */}
          <Section title="Search Customer">
            <form onSubmit={onSearch} className="flex gap-2">
              <input
                className="flex-1 rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring "
                placeholder="Search by name or phone"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button
                className="rounded-xl bg-black px-4 py-2 text-white disabled:opacity-50 hover:bg-black/80 hover:cursor-pointer"
                disabled={searching}
              >
                {searching ? "Searching..." : "Search"}
              </button>
            </form>

            {/* Results */}
            {customers.length > 0 && (
              // md:grid-cols-2
              <div className="mt-3 grid grid-cols-1 gap-2">
                {customers.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => chooseCustomer(c)}
                    className={`rounded-xl border px-3 py-2 text-left hover:border-black hover:cursor-pointer ${selectedCustomer?.id === c.id ? "border-black bg-gray-50" : "border-gray-200"
                      }`}
                  >
                    <div className="flex justify-between">
                      <div className="font-medium">{c.fullname} {c.phone}</div>
                      <div>
                        {c.pets && c.pets.length > 0 && c.pets.map((pet, index) => (
                          <span key={pet.id}>
                            {pet.name} ({pet.species}) {index !== c.pets.length - 1 ? ', ' : ''}
                          </span>
                        ))}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </Section>

          <div className="mb-6"></div>

          {/* 3–5. Pet/Service Cards */}
          <Section title="Pet & Services">
            <div className="space-y-1">
              {cards.map((card) => (
                <div key={card.key} className="rounded-2xl p-1">
                  <div className="rounded-xl border border-gray-200 p-4">
                    {/* Select Pet */}
                    <div className="relative w-full md:w-auto mb-3 grid gap-2 md:grid-cols-2">
                      <label className="font-medium text-[#111713] ">Pet</label>
                      <select
                        className="rounded-xl border border-gray-300 px-3 py-2 appearance-none w-full"
                        value={card.petId}
                        onChange={(e) => updateCardPet(card.key, e.target.value)}
                        disabled={!selectedCustomer || pets.length === 0}
                      >
                        <option value="">Select a pet...</option>
                        {pets
                          .filter(
                            (p) =>
                              !cards.some(
                                (c) => c.petId === p.id && c.key !== card.key // exclude already used pets in other cards
                              )
                          ).map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.species})
                            </option>
                          ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                        <svg
                          className="w-4 h-4 text-slate-500"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {/* Services (checkbox list) */}
                    <p className="mb-3 text-sm md:text-base font-medium text-slate-700">Services & Options (duration & price)</p>

                    {servicesLoading && <div className="text-sm text-gray-500">Loading services...</div>}
                    {!servicesLoading && services.length === 0 && (
                      <div className="text-sm text-gray-500">No services available.</div>
                    )}

                    {/* แสดงบริการทั้งหมดเป็น checkbox */}
                    {!servicesLoading && services.length > 0 && (
                      <div className="space-y-3">
                        {services.map((service) => {
                          const checked = isServiceSelected(card, service.id ?? '');
                          return (
                            <div key={service.id} className="mb-2">
                              <label className="items-center gap-3 cursor-pointer">

                                <div className="flex justify-between">
                                  <div className="text-slate-600 text-sm md:text-base leading-snug">
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={() => toggleService(card.key, service)}
                                      className="h-5 w-5 shrink-0 mr-4"
                                    />
                                    {service.name}
                                  </div>
                                  <div>
                                    <span className="text-slate-600 text-sm md:text-base leading-snug">
                                      ( {service.duration} min / {service.price} ฿ )
                                    </span>
                                  </div>
                                </div>

                                {/* <span className="text-slate-600 text-sm md:text-base leading-snug">
                                  {service.name}
                                  {typeof service.duration === "number" && typeof service.price === "number" && (
                                    <> ({service.duration} min / ฿{service.price})</>
                                  )}
                                </span> */}
                              </label>

                              {/* Sub options: แสดงเมื่อ service ถูกเลือก และมี options */}
                              {checked && service.options && service.options.length > 0 && (
                                <div className="ml-7 mt-2 flex flex-col gap-1">
                                  {service.options.map((opt) => {
                                    const selectedService = card.services.find((s) => s.serviceId === service.id);
                                    const hasOpt = selectedService?.options?.some((o) => o.id === opt.id) ?? false;
                                    return (
                                      <label
                                        key={opt.id}
                                        className="items-center gap-2 cursor-pointer text-slate-600 text-sm md:text-base"
                                      >
                                        <div className="flex justify-between">
                                          <div className="text-slate-600 text-sm md:text-base leading-snug">
                                            <input
                                              type="checkbox"
                                              checked={hasOpt}
                                              onChange={() => toggleOptionForService(card.key, service.id ?? '', opt)}
                                              className="h-4 w-4 mr-4"
                                            />
                                            {opt.name}
                                          </div>
                                          <div>
                                            <span className="text-slate-600 text-sm md:text-base leading-snug">
                                              (+ {opt.price} ฿)
                                            </span>
                                          </div>
                                        </div>
                                      </label>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-end">
                    {/* <h3 className="font-semibold">Card #{cardIdx + 1}</h3> */}
                    {cards.length > 1 && (
                      <button className="text-sm text-red-600" onClick={() => removeCard(card.key)}>
                        Remove card
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <div>
                {cards.length < pets.length && (
                  <button className="rounded-xl border border-gray-300 px-4 py-2" onClick={addCard}>
                    + Add Card
                  </button>
                )}
              </div>
            </div>

            <div className="grid gap-2 md:grid-cols-2 relative w-full md:w-auto">
              <label className="font-medium text-[#111713] p-2">Assign Staff</label>
              <select
                className="rounded-xl border border-gray-300 px-3 py-2 appearance-none w-full"
                value={selectedStaff?.id ?? ""}
                onChange={(e) => setSelectedStaff(staff.find((s) => s.id === e.target.value) ?? null)}
              >
                <option value="">Select staff...</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} {s.role ? `(${s.role})` : ""}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <svg
                  className="w-4 h-4 text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </Section>

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
        {/* md:col-span-2 lg:col-span-2 xl:col-span-2 */}
        <div className=" w-full lg:w-[30%] lg:min-w-[350px] flex flex-col h-full">
          {/* <div className="sticky top-6"> */}
          {/* <div className="mb-4 rounded-xl border p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium">Appointment date & time</div>
              <div className="text-xs text-slate-500">Local time</div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1">
                {selectedDateTimeISO ? (
                  <div className="text-sm">
                    {new Date(selectedDateTimeISO).toLocaleString()}
                    <div className="text-xs text-slate-500">{selectedDateTimeISO}</div>
                  </div>
                ) : (
                  <div className="text-sm text-slate-500">Not selected</div>
                )}
              </div>

              <div className="flex gap-2">
                <button onClick={openDateModal} className="rounded-xl border px-3 py-2">Select date & time</button>
                {selectedDateTimeISO && <button onClick={clearSelectedDateTime} className="rounded-xl border px-3 py-2 text-sm text-red-600">Clear</button>}
              </div>
            </div>
          </div> */}

          <DateTimePicker
            availabilityUrl="/api/slots"
            daysAhead={30}
            disabledWeekends={true} // ถ้าต้องการบล็อก ส-อา แบบ UI
            onChange={(v) => {
              console.log('picked ISO slot id:', v);
              setIso(v);
            }}
            initial={iso}
            customKey={resetPicker}
          />

          <SummaryCard
            cards={cards}
            services={services}
            // selectedCustomer={selectedCustomer ? { id: selectedCustomer.id, fullname: selectedCustomer.fullname,  } : null}
            selectedCustomer={selectedCustomer ? selectedCustomer : null}
            selectedStaff={selectedStaff ?? null}
            submitting={submitting}
            onConfirm={onSubmit} // (optional) ถ้าคุณอยากให้ Summary เรียก onSubmit ของหน้า
            // showPreview={true}
          />
          {/* </div> */}
        </div>
      </div >
    </div >
  );
}
