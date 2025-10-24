'use client';
import PetFormModal from '@/components/admin/PetFormModal';
// import ServiceFormModal from '@/components/admin/ServiceFormModal';
import { Pet } from '@/types/models';
import { useEffect, useState } from 'react';

type Mode = 'add' | 'edit' | 'view';

export default function PetPage() {
    const [pets, setPets] = useState<Pet[]>([]);
    const [filteredPets, setFilteredPets] = useState<Pet[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<Mode>('add');
    const [activePet, setActivePet] = useState<Pet | undefined>(undefined);

    const [currentPage, setCurrentPage] = useState(1);

    const fetchPets = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('accessToken');
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const res = await fetch('/api/pet', { method: 'GET', headers });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || `HTTP ${res.status}`);
            }

            const data = await res.json();
            console.log('data', data.data);
            // accept either single object or array
            if (Array.isArray(data.data)) {
                setPets(data.data);
                setFilteredPets(data.data);
            } else if (data.data) {
                setPets([data.data]);
                setFilteredPets([data.data]);
            } else {
                setPets([]);
            }
        } catch (err: any) {
            console.error(err);
            setError(err?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPets();
    }, []);

    const perPage = 5;

    const startIndex = (currentPage - 1) * perPage;
    const currentPets = filteredPets.slice(startIndex, startIndex + perPage);
    const totalPages = Math.ceil(pets.length / perPage);
    const emptyRows = perPage - currentPets.length;

    let paginatedPets: Pet[] = [];
    if (pets.length > 0) {
        paginatedPets = pets.slice(
            (currentPage - 1) * perPage,
            currentPage * perPage,
        );
    }

    //   const handleDelete = (id: number) => {
    //     setServices(services.filter((s) => Number(s.id) !== Number(id)));
    //   };

    const openModal = (mode: Mode, pet?: Pet) => {
        setModalMode(mode);
        setActivePet(pet);
        setModalOpen(true);
        console.log('modalMode', modalMode);
        console.log('activePet', activePet);
    };

      const handleSave = (pet: Pet) => {
        if (modalMode === 'edit' && activePet) {
          setPets(
            pets.map((s) =>
              s.id === activePet.id ? { ...s, ...pet } : s,
            ),
          );
        } else if (modalMode === 'add') {
          setPets([...pets, { ...pet, id: Date.now().toString() }]);
        }
      };

    return (
        <div className="text-slate-500 max-w-6xl mx-auto px-4 py-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-6">
                    Pet <span className="font-medium text-slate-800">Management</span>
                </h1>
                <button
                    className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700"
                    onClick={() => openModal('add')}
                >
                    + Add New Pet
                </button>
            </div>

            {/* Table */}
            <div className="border border-slate-200 rounded-lg overflow-x-auto">
                <table className="w-full border-collapse text-sm md:text-lg table-fixed">
                    <thead className="bg-slate-100 text-slate-700">
                        <tr>
                            <th className="p-3 text-left w-[10%]">#</th>
                            <th className="p-3 text-left w-[15%]">Name</th>
                            <th className="p-3 text-left w-[15%]">Gender</th>
                            <th className="p-3 text-left w-[20%]">Species</th>
                            <th className="p-3 text-left w-[20%]">Breed</th>
                            <th className="p-3 text-left w-[20%]">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedPets.map((pet, index) => (
                            <tr
                                key={pet.id}
                                className="border-t border-slate-200 hover:bg-slate-50"
                            >
                                <td className="p-3">
                                    {(currentPage - 1) * perPage + index + 1}
                                </td>
                                <td className="p-3 truncate">{pet.name}</td>
                                <td className="p-3 truncate">{pet.gender}</td>
                                <td className="p-3 truncate">{pet.species}</td>
                                <td className="p-3 truncate">{pet.breed}</td>
                                <td className="p-3 text-left flex justify-between gap-2">
                                    <button
                                        className="px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                                        onClick={() => openModal('view', pet)}
                                    >
                                        View
                                    </button>
                                    <button
                                        className="px-2 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
                                        onClick={() => openModal('edit', pet)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="px-2 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                                    // onClick={() => handleDelete(Number(pet.id))}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {Array.from({ length: emptyRows > 0 ? emptyRows : 0 }).map(
                            (_, i) => (
                                <tr
                                    key={`empty-${i}`}
                                    className="border-t border-slate-200 h-[53px]"
                                >
                                    <td colSpan={7}></td>
                                </tr>
                            ),
                        )}
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
            <PetFormModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleSave}
                initialData={activePet}
                mode={modalMode}
            />
        </div>
    );
}
