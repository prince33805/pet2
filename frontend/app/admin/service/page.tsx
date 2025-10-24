'use client';
import ServiceFormModal from '@/components/admin/ServiceFormModal';
import { Service } from '@/types/models';
import { useEffect, useState } from 'react';

type Mode = 'add' | 'edit' | 'view';

export default function ServicePage() {
  const [services, setServices] = useState<Service[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<Mode>('add');
  const [activeService, setActiveService] = useState<Service | undefined>(undefined);

  const [currentPage, setCurrentPage] = useState(1);

  async function fetchServices() {
    const token = localStorage.getItem('accessToken');
    if (!token) return alert('Please login first');

    const res = await fetch('/api/service', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.message === 'Unauthorized') {
      alert('Token expired or invalid');
      return;
    }
    setServices(data.data);
  }

  useEffect(() => {
    fetchServices();
  }, []);

  const pageSize = 5;
  const totalPages = Math.ceil(services.length / pageSize);

  let paginatedServices: Service[] = [];
  if (services.length > 0){
    paginatedServices = 
    services.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize,
    );
  }

  const handleDelete = (id: number) => {
    setServices(services.filter((s) => Number(s.id) !== Number(id)));
  };

  const openModal = (mode: Mode, service?: Service) => {
    setModalMode(mode);
    setActiveService(service);
    setModalOpen(true);
    console.log("modalMode",modalMode);
    console.log("activeService",activeService);
  };

  const handleSave = (service: Service) => {
    if (modalMode === 'edit' && activeService) {
      setServices(
        services.map((s) =>
          s.id === activeService.id ? { ...s, ...service } : s,
        ),
      );
    } else if (modalMode === 'add') {
      setServices([...services, { ...service, id: Date.now().toString() }]);
    }
  };

  return (
    <div className="text-slate-500 max-w-6xl mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-6">
          Service <span className="font-medium text-slate-800">Management</span>
        </h1>
        <button
          className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700"
          onClick={() => openModal('add')}
        >
          + Add New Service
        </button>
      </div>

      {/* Table */}
      <div className="border border-slate-200 rounded-lg overflow-x-auto">
        <table className="w-full border-collapse text-sm md:text-lg table-fixed">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="p-3 text-left w-[5%]">#</th>
              <th className="p-3 text-left w-[20%]">Name</th>
              <th className="p-3 text-left w-[10%]">Duration</th>
              <th className="p-3 text-left w-[10%]">Price</th>
              <th className="p-3 text-left w-[20%]">Description</th>
              <th className="p-3 text-left w-[20%]">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedServices.map((service, index) => (
              <tr
                key={service.id}
                className="border-t border-slate-200 hover:bg-slate-50"
              >
                <td className="p-3">
                  {(currentPage - 1) * pageSize + index + 1}
                </td>
                <td className="p-3 truncate">{service.name}</td>
                <td className="p-3 truncate">{service.duration} min</td>
                <td className="p-3">฿{service.price}</td>
                <td className="p-3 text-slate-500">{service.description}</td>
                <td className="p-3 text-left flex justify-between gap-2">
                  <button
                    className="px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={() => openModal('view', service)}
                  >
                    View
                  </button>
                  <button
                    className="px-2 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    onClick={() => openModal('edit', service)}
                  >
                    Edit
                  </button>
                  <button
                    className="px-2 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                    onClick={() => handleDelete(Number(service.id))}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-2 mt-6">
        <button
          className="px-3 py-1 rounded-lg border border-slate-300 hover:bg-slate-100 disabled:opacity-40"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
        >
          Prev
        </button>
        <span className="text-slate-600">
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="px-3 py-1 rounded-lg border border-slate-300 hover:bg-slate-100 disabled:opacity-40"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
        >
          Next
        </button>
      </div>

      {/* Popup */}
      <ServiceFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSave}
        initialData={activeService}
        mode={modalMode}
      />
    </div>
  );
}
