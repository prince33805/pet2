'use client';

import { useEffect, useState } from 'react';
// import ServiceFormModal from '@/components/admin/ServiceFormModal';
import { Customer, optionService, Pet, Service } from '@/types/models';
import { SummaryCard } from '@/components/admin/SummaryCard';
import { CustomerSearch } from '@/components/admin/CustomerSearch';
import { useCustomerSearch } from '@/hooks/useCustomerSearch';
import { useCustomerPets } from '@/hooks/useCustomerPets';
import { PetSelect } from '@/components/admin/PetSelect';
import { ServiceList } from '@/components/admin/ServiceList';
import { useServices } from '@/hooks/useServices';
// import { useRouter } from 'next/navigation';


export default function CashierPage() {
  const { services, fetchServices, loading: servicesLoading } = useServices();

  // const [services, setServices] = useState<Service[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const { results: customerResults, search: searchCustomers } = useCustomerSearch();
  const { pets, fetchPets, loading: loadingPets } = useCustomerPets();

  // const services: Service[] = [
  //   {
  //     id: 1,
  //     name: 'Haircut and Style Cut (ผู้ชาย) หรือ (ผู้หญิง) ผู้ชาย 300 / ผู้หญิง 500 บาท',
  //     duration: 45,
  //     price: 300,
  //     options: [
  //       { id: 1, name: 'Shampoo and Conditioner', price: 50 },
  //       { id: 2, name: 'Head Massage', price: 100 },
  //     ],
  //   },
  //   {
  //     id: 2,
  //     name: 'Manicure and Pedicure (เล็บมือ เล็บเท้า) 250 บาท',
  //     duration: 30,
  //     price: 250,
  //     options: [{ id: 3, name: 'Extra Mask', price: 80 }],
  //   },
  //   {
  //     id: 3,
  //     name: 'Facial Treatment (ทรีทเมนต์หน้า) 60 นาที 500 บาท และ Extra Mask 80 บาท',
  //     duration: 60,
  //     price: 500,
  //     options: [{ id: 3, name: 'Extra Mask', price: 80 }],
  //   },
  // ];

  const employees = ['Alice', 'Bob', 'Charlie'];

  // async function fetchServices() {
  //   const token = localStorage.getItem('accessToken');
  //   if (!token) return alert('Please login first');

  //   const res = await fetch('/api/service', {
  //     headers: { Authorization: `Bearer ${token}` },
  //   });
  //   const data = await res.json();
  //   if (data.message === 'Unauthorized') {
  //     alert('Token expired or invalid');
  //     return;
  //   }
  //   setServices(data.data);
  // }

  // when customer picked -> load pets
  useEffect(() => {
    if (selectedCustomer) fetchPets(selectedCustomer.id);
  }, [selectedCustomer]);

  // Toggle service selection
  const toggleService = (service: Service) => {
    if (selectedServices.find((s) => s.id === service.id)) {
      setSelectedServices(selectedServices.filter((s) => s.id !== service.id));
    } else {
      setSelectedServices([...selectedServices, { ...service, options: [] }]);
    }
  };

  // Toggle service option
  const toggleOption = (serviceId?: string, opt?: optionService) => {
    if (!serviceId || !opt) return;
    setSelectedServices(prev => prev.map(s => {
      if (s.id !== serviceId) return s;
      const has = s.options?.some(o => o.id === opt.id);
      if (has) return { ...s, optionService: s.options?.filter(o => o.id !== opt.id) };
      return { ...s, optionService: [...(s.options || []), opt] };
    }));
  };

  // Calculate totals
  const totalDuration = selectedServices.reduce(
    (sum, s) => sum + Number(s.duration),
    0,
  );
  const totalPrice = selectedServices.reduce(
    (sum, s) =>
      sum +
      s.price +
      (s.options?.reduce((optSum, o) => optSum + o.price, 0) || 0),
    0,
  );

  // Build payload and POST
  const confirmOrder = async () => {
    if (!selectedCustomer) return alert('กรุณาเลือกลูกค้า');
    if (!selectedPet) return alert('กรุณาเลือกสัตว์เลี้ยงของลูกค้า');
    if (!selectedServices.length) return alert('กรุณาเลือกบริการอย่างน้อย 1 รายการ');
    if (!selectedEmployee) return alert('กรุณาเลือกพนักงาน');

    const token = localStorage.getItem('accessToken');
    if (!token) return alert('Please login first');

    // now as ISO string
    const now = new Date().toISOString();

    // map selectedServices -> appointmentServices
    const appointmentServices = selectedServices.map((s) => ({
      serviceId: s.id,
      optionService:
        s.options?.map((opt) => ({
          optionId: String(opt.id),
        })) || [],
    }));

    const body = {
      customerId: selectedCustomer,
      petId: selectedPet,
      staffId: selectedEmployee,
      dateTime: now,
      status: 'SCHEDULED',
      appointmentServices,
    };

    try {
      setSubmitting(true);
      const res = await fetch('/api/appointment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const txt = await res.text();
        console.error('Appointment API error:', txt);
        alert('ไม่สามารถสร้างนัดหมายได้: ' + (txt || res.statusText));
        return;
      }

      const data = await res.json();
      alert('สร้างนัดหมายสำเร็จ');
      // reset selections (ปรับตามต้องการ)
      setSelectedCustomer(null);
      setSelectedPet(null);
      setSelectedServices([]);
      setSelectedEmployee('');
      // คุณอาจจะต้องการ redirect หรือ refresh รายการที่เกี่ยวข้องที่นี่
      console.log('appointment created', data);
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className="text-slate-500 max-w-6xl mx-auto px-4 py-6 ">
      <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-6">
        Cashier <span className="text-slate-800 font-medium">Page</span>
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-[63%_35%] gap-6 mt-6">
        {/* LEFT SIDE */}
        <div className="flex flex-col gap-6">
          {/* Search Customer */}
          <div className="border border-slate-200 rounded-lg p-4">
            <p className="font-medium text-slate-700 mb-2 text-sm md:text-xl">
              Customer
            </p>
            {selectedCustomer ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between bg-slate-100 p-[13px] rounded-lg text-sm md:text-lg">
                  <span>{selectedCustomer.fullname}</span>
                  <button
                    className="text-red-500"
                    onClick={() => setSelectedCustomer(null)}
                  >
                    ✕
                  </button>
                </div>
                <div>
                  <PetSelect customerId={selectedCustomer.id} pets={pets} loading={loadingPets} error={null} onChange={(p) => setSelectedPet(p)} />
                </div>
              </div>
            ) : (
              <CustomerSearch onSelect={(c) => setSelectedCustomer(c)} />
              // <div className="flex flex-col lg:flex-row gap-2">
              //   <input
              //     type="text"
              //     placeholder="Search by phone number (John Doe 111-111-1111)"
              //     className="flex-1 border border-slate-200 rounded-lg p-3 text-sm md:text-lg"
              //   />
              //   <button
              //     className="px-4 bg-slate-800 text-white rounded-lg text-sm md:text-lg"
              //     onClick={() => setSelectedCustomer({ id: '21b10c86-4303-4689-8420-3b46c4d25973', fullname: 'aaa', phone: '1234567890' })}
              //   >
              //     Search
              //   </button>
              // </div>
            )}

            {/* {selectedCustomer && (
              <div className="mt-3">
                <label className="block text-sm md:text-lg mb-2">Pet ID</label>
                <input
                  type="text"
                  placeholder="กรอก petId หรือเลือกจากรายการ"
                  className="w-full border border-slate-200 rounded-lg p-3 text-sm md:text-lg"
                  value={selectedPet ?? ''}
                  onChange={(e) => setSelectedPet(e.target.value)}
                />
                <p className="mt-1 text-xs text-slate-400">ตัวอย่าง id: pet-456</p>
              </div>
            )} */}
          </div>

          {/* Services */}
          <div className="border border-slate-200 rounded-lg p-4">
            <ServiceList services={services} selectedServices={selectedServices} onToggleService={toggleService} onToggleOption={toggleOption} />
            {/* <p className="font-medium text-slate-700 mb-3 text-sm md:text-xl">
              Services
            </p>
            {services && services.length > 0 && services.map((service) => {
              const isSelected = selectedServices.some(
                (s) => s.id === service.id,
              );
              return (
                <div key={service.id} className="mb-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleService(service)}
                      className="h-5 w-5 shrink-0"
                    // className="mt-1 h-5 w-5 appearance-none border-2 border-slate-400 rounded-sm checked:bg-slate-800 checked:border-slate-800"
                    />
                    <span className="text-slate-500 text-sm md:text-xl leading-snug">
                      {service.name} ({service.duration} min / ฿{service.price})
                    </span>
                  </label>

                  {isSelected && service.optionService && (
                    <div className="ml-7 mt-2 flex flex-col gap-1">
                      {service.optionService.map((opt) => {
                        const hasOpt = selectedServices
                          .find((s) => s.id === service.id)
                          ?.optionService?.some((o) => o.id === opt.id);
                        return (
                          <label
                            key={opt.id}
                            className="flex items-center gap-2 cursor-pointer text-sm md:text-lg"
                          >
                            <input
                              type="checkbox"
                              checked={hasOpt}
                              onChange={() => toggleOption(String(service.id), opt)}
                              className="h-4 w-4"
                            />
                            {opt.name} (+฿{opt.price})
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })} */}
          </div>

          {/* Employee */}
          <div className="border border-slate-200 rounded-lg p-4 ">
            <p className="font-medium text-slate-700 mb-2 text-lg md:text-xl">
              Employee
            </p>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full border border-slate-200 rounded-lg p-3 text-base md:text-lg"
            >
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp} value={emp}>
                  {emp}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* RIGHT SIDE - Summary */}
        <SummaryCard selectedCustomer={selectedCustomer} selectedPet={selectedPet} selectedServices={selectedServices} selectedEmployee={selectedEmployee} totalDuration={totalDuration} totalPrice={totalPrice} onConfirm={confirmOrder} submitting={submitting} />
      </div>
    </div>
  );
}
