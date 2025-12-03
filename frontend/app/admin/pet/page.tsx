'use client';
import PetFormModal from '@/components/admin/PetFormModal';
// import ServiceFormModal from '@/components/admin/ServiceFormModal';
import { Pet } from '@/types/models';
import { useEffect, useMemo, useState } from 'react';

type Mode = 'add' | 'edit' | 'view';

export default function PetPage() {
    const [pets, setPets] = useState<Pet[]>([]);
    // const [filteredPets, setFilteredPets] = useState<Pet[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [statusSort, setStatusSort] = useState('asc');

    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<Mode>('add');
    const [activePet, setActivePet] = useState<Pet | undefined>(undefined);

    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState<number>(10); // ← selectable limit
    const [totalPages, setTotalPages] = useState<number>(1); // ← selectable limit

    // build URL with query params
    const apiUrl = useMemo(() => {
        const qs = new URLSearchParams();
        qs.set('page', String(currentPage));
        qs.set('limit', String(perPage));
        qs.set('search', String(search));
        qs.set('sort', String(statusSort));
        return `/api/pet?${qs.toString()}`;
    }, [currentPage, perPage, search, statusSort]);

    useEffect(() => {
        const fetchPets = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) return alert('Please login first');
                const headers: Record<string, string> = {
                    'Content-Type': 'application/json',
                };
                if (token) headers['Authorization'] = `Bearer ${token}`;
                const res = await fetch(apiUrl, { method: 'GET', headers });
                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(text || `HTTP ${res.status}`);
                }
                const data = await res.json();
                console.log('data', data.data);
                if (data.message === 'Unauthorized') {
                    alert('Token expired or invalid');
                    return;
                }
                setTotalPages(data.data.pagination.totalPages || 1);
                // accept either single object or array
                if (Array.isArray(data.data.pets)) {
                    setPets(data.data.pets);
                    // setFilteredPets(data.data.pets);
                } else if (data.data.pets) {
                    setPets([data.data.pets]);
                    // setFilteredPets([data.data.pets]);
                } else {
                    setPets([]);
                }
            } catch (err: unknown) {
                console.error(err);
                setError((err as Error)?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล');
            } finally {
                setLoading(false);
            }
        };

        fetchPets();
    }, [apiUrl]);

    useEffect(() => {
        setCurrentPage(1);
    }, [perPage]);

    // const startIndex = (currentPage - 1) * perPage;
    // const currentPets = filteredPets.slice(startIndex, startIndex + perPage);
    // const totalPages = Math.ceil(pets.length / perPage);
    const emptyRows = perPage - pets.length;

    // let paginatedPets: Pet[] = [];
    // if (pets.length > 0) {
    //     paginatedPets = pets.slice(
    //         (currentPage - 1) * perPage,
    //         currentPage * perPage,
    //     );
    // }

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

    const limits = [5, 10];

    return (
        <div className="text-slate-500 max-w-6xl mx-auto px-4 py-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-6">
                    Pet <span className="font-medium text-slate-800">Management</span>
                </h1>
                <div className="flex items-center gap-3 mb-6">
                    {/* Limit selector buttons */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-600">Items per page:</span>
                        <div className="flex rounded-lg border border-slate-300 overflow-hidden">
                            {limits.map((n) => (
                                <button
                                    key={n}
                                    onClick={() => setPerPage(n)}
                                    className={[
                                        'px-3 py-1 text-sm border-r border-slate-300 last:border-r-0',
                                        n === perPage
                                            ? 'bg-slate-800 text-white'
                                            : 'bg-white hover:bg-slate-100 text-slate-700',
                                    ].join(' ')}
                                    aria-pressed={n === perPage}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button
                        className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 hover:cursor-pointer"
                        onClick={() => openModal('add')}
                    >
                        + Add New Pet
                    </button>
                </div>
            </div>

            {/* Loading / Error */}
            {loading && <div className="mb-4 text-slate-600">Loading...</div>}
            {error && (
                <div className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-red-700">
                    {error}
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-col md:flex-row items-center gap-3 mb-6">
                <input
                    type="text"
                    placeholder="Search by name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 border border-slate-200 rounded-lg p-3 text-sm md:text-lg w-full"
                />
                {/* <select
                    value={statusSort}
                    onChange={(e) => setStatusSort(e.target.value)}
                    className="border border-slate-200 rounded-lg p-3 text-sm md:text-lg"
                >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                </select> */}
                <div className="relative w-full md:w-auto">
                    <select
                        value={statusSort}
                        onChange={(e) => setStatusSort(e.target.value)}
                        className="border border-slate-200 rounded-lg p-3 pr-10 text-sm md:text-lg appearance-none w-full"
                    >
                        <option value="asc">Ascending</option>
                        <option value="desc">Descending</option>
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
            </div>

            {/* Table */}
            <div className="border border-slate-200 rounded-lg overflow-x-auto">
                <table className="w-full border-collapse text-sm md:text-lg table-fixed">
                    <thead className="bg-slate-100 text-slate-700">
                        <tr>
                            <th className="p-3 text-left w-[5%]">#</th>
                            <th className="p-3 text-left w-[15%]">Customer</th>
                            <th className="p-3 text-left w-[15%]">Name</th>
                            <th className="p-3 text-left w-[10%]">Gender</th>
                            <th className="p-3 text-left w-[10%]">Species</th>
                            <th className="p-3 text-left w-[10%]">Breed</th>
                            <th className="p-3 text-left w-[20%]">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pets.map((pet, index) => (
                            <tr
                                key={pet.id}
                                className="border-t border-slate-200 hover:bg-slate-50"
                            >
                                <td className="p-3">
                                    {(currentPage - 1) * perPage + index + 1}
                                </td>
                                <td className="p-3 truncate">{pet.customer?.fullname ?? ''}</td>
                                <td className="p-3 truncate">{pet.name}</td>
                                <td className="p-3 truncate">{pet.gender}</td>
                                <td className="p-3 truncate">{pet.species}</td>
                                <td className="p-3 truncate">{pet.breed}</td>
                                <td className="p-3 align-middle">
                                    <div className='flex justify-between gap-2'>
                                        <button
                                            className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 hover:cursor-pointer"
                                            onClick={() => openModal('view', pet)}
                                        >
                                            View
                                        </button>
                                        <button
                                            className="px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-700 hover:bg-yellow-200 hover:cursor-pointer"
                                            onClick={() => openModal('edit', pet)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="px-3 py-1 rounded-full text-sm bg-red-100 text-red-700 hover:bg-red-200 hover:cursor-pointer"
                                        // onClick={() => handleDelete(Number(pet).id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
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
