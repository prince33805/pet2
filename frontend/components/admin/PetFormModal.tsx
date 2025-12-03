import React, { useState, useEffect } from 'react';
import Section from '@/components/Section';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    MenuItem,
} from '@mui/material';
import { Customer, Pet } from '@/types/models';

interface PetFormModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (pet: Pet) => void | Promise<void>;
    initialData?: Pet | null;
    mode: 'view' | 'add' | 'edit';
}

const PetFormModal: React.FC<PetFormModalProps> = ({
    open,
    onClose,
    onSubmit,
    initialData,
    mode,
}) => {
    const [formData, setFormData] = useState<Pet>({
        id: '',
        customerId: '',
        customer: null,
        name: '',
        species: '',
        breed: '',
        gender: 'MALE',
        age: '',
        weight: '',
        healthNotes: '',
    });
    const [query, setQuery] = useState('');
    const [searching, setSearching] = useState(false);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
        null,
    );
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({
                id: '',
                customerId: '',
                customer: null,
                name: '',
                species: '',
                breed: '',
                gender: 'MALE',
                age: '',
                weight: '',
                healthNotes: '',
            });
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // this is validation function example
    // Database query failed: Pet name already exists

    // generate validation function
    const validate = (): boolean => {
        const e: Record<string, string> = {};
        if (!formData.name || formData.name.trim().length === 0) {
            e.name = 'Name should not be empty';
        } else if (formData.name.trim().length < 3) {
            e.name = 'Name must be longer than or equal to 3 characters';
        }
        if (!formData.customerId || formData.customerId.trim().length === 0) {
            e.customerId = 'Customer should not be empty';
        } else if (formData.customerId.trim().length < 36) {
            e.customerId = 'Customer must be longer than or equal to 36 characters';
        } else {
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(formData.customerId.trim())) {
                e.customerId = 'CustomerId must be a UUID';
            }
        }
        if (!formData.species || formData.species.trim().length === 0) {
            e.species = 'Species should not be empty';
        } else if (formData.species.trim().length < 3) {
            e.species = 'Species must be longer than or equal to 3 characters';
        } if (!formData.breed || formData.breed.trim().length === 0) {
            e.breed = 'Breed should not be empty';
        } else if (formData.breed.trim().length < 3) {
            e.breed = 'Breed must be longer than or equal to 3 characters';
        }
        if (!formData.age || formData.age.trim().length === 0) {
            e.age = 'Age should not be empty';
        } else if (formData.age.trim().length < 1) {
            e.age = 'Age must be longer than or equal to 1 characters';
        }
        if (!formData.weight || formData.weight.trim().length === 0) {
            e.weight = 'Weight should not be empty';
        } else if (formData.weight.trim().length < 1) {
            e.weight = 'Weight must be longer than or equal to 1 characters';
        }
        if (formData.healthNotes && formData.healthNotes.trim().length < 1) {
            e.healthNotes = 'Health notes must be longer than or equal to 1 characters';
        }
        // Pet name already exists check duplicate with selected customer.pets
        if (selectedCustomer && selectedCustomer.pets) {
            const duplicate = selectedCustomer.pets.find(
                (pet) =>
                    pet.name.toLowerCase() === formData.name.trim().toLowerCase() &&
                    pet.id !== formData.id,
            );
            if (duplicate) {
                e.name = 'Pet name already exists for this customer';
            }
        }

        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            alert('Access token not found');
            return;
        }
        const method = mode === 'edit' ? 'PUT' : 'POST';
        const url = mode === 'edit' ? `/api/pet/${formData.id}` : '/api/pet';

        e?.preventDefault();
        if (!validate()) return;
        try {

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });
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
        } catch (err: unknown) {
            console.error(err);
            alert('เกิดข้อผิดพลาดในการเชื่อมต่อ API');
        }
    };

    const readOnly = mode === 'view';

    const onSearch = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSearching(true);
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) throw new Error('Please login');
            const res = await fetch(
                `/api/customer?search=${encodeURIComponent(query)}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                },
            );
            if (!res.ok) throw new Error(await res.text());
            const json = await res.json();
            setCustomers(json?.data.customers ?? []);
        } finally {
            setSearching(false);
        }
    };

    const chooseCustomer = async (c: Customer) => {
        setSelectedCustomer(c);
        setFormData((prev) => ({ ...prev, customerId: c.id }));
        const token = localStorage.getItem('accessToken');
        if (!token) throw new Error('Please login');
        setCustomers([c]);

        // if click again then remove selected customer
        if (selectedCustomer && selectedCustomer.id === c.id) {
            setSelectedCustomer(null);
            setCustomers([]);
            setFormData((prev) => ({ ...prev, customerId: '' }));
        }

        // const res = await fetch(`/api/customer/${c.id}`, { headers: { Authorization: `Bearer ${token}` } });
        // if (!res.ok) throw new Error(await res.text());
        // const json = await res.json();
        // ✅ ล้าง list เหลือแค่ customer ที่เลือก
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>
                {mode === 'add' && 'Add Pet'}
                {mode === 'edit' && 'Edit Pet'}
                {mode === 'view' && 'View Pet'}
            </DialogTitle>
            <DialogContent>
                {mode !== 'view' && (
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
                                {searching ? 'Searching...' : 'Search'}
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
                                        className={`rounded-xl border px-3 py-2 text-left hover:border-black hover:cursor-pointer 
                                            ${selectedCustomer?.id === c.id
                                                ? 'border-black bg-gray-50'
                                                : 'border-gray-200'
                                            }`}
                                    >
                                        <div className="flex justify-between">
                                            <div className="font-medium">
                                                {c.fullname} {c.phone}
                                            </div>
                                            <div>
                                                {c.pets &&
                                                    c.pets.length > 0 &&
                                                    c.pets.map((pet, index) => (
                                                        <span key={pet.id}>
                                                            {pet.name} ({pet.species}){' '}
                                                            {index !== c.pets.length - 1 ? ', ' : ''}
                                                        </span>
                                                    ))}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </Section>
                )}
                {mode === 'view' && (
                    <TextField
                        margin="dense"
                        label="Customer Name"
                        name="customer name"
                        value={formData.customer?.fullname ?? ''}
                        onChange={handleChange}
                        fullWidth
                        disabled={readOnly}
                        sx={{ marginTop: '16px' }}
                    />
                )}
                <TextField
                    margin="dense"
                    label="Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    fullWidth
                    disabled={readOnly}
                    sx={{ marginTop: '16px' }}
                />
                <TextField
                    margin="dense"
                    label="Species"
                    name="species"
                    value={formData.species}
                    onChange={handleChange}
                    fullWidth
                    disabled={readOnly}
                />
                <TextField
                    margin="dense"
                    label="Breed"
                    name="breed"
                    value={formData.breed}
                    onChange={handleChange}
                    fullWidth
                    disabled={readOnly}
                />
                <TextField
                    select
                    margin="dense"
                    label="Gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    fullWidth
                    disabled={readOnly}
                >
                    <MenuItem value="MALE">MALE</MenuItem>
                    <MenuItem value="FEMALE">FEMALE</MenuItem>
                </TextField>
                <TextField
                    margin="dense"
                    label="Age"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    fullWidth
                    disabled={readOnly}
                />
                <TextField
                    margin="dense"
                    label="Weight"
                    name="weight"
                    // type="number"
                    value={formData.weight}
                    onChange={handleChange}
                    fullWidth
                    disabled={readOnly}
                />
                <TextField
                    margin="dense"
                    label="Health Notes"
                    name="healthNotes"
                    value={formData.healthNotes}
                    onChange={handleChange}
                    fullWidth
                    disabled={readOnly}
                    multiline
                    rows={2}
                />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                {errors.customerId && <p className="mt-1 text-xs text-red-600">{errors.customerId}</p>}
                {errors.species && <p className="mt-1 text-xs text-red-600">{errors.species}</p>}
                {errors.breed && <p className="mt-1 text-xs text-red-600">{errors.breed}</p>}
                {errors.age && <p className="mt-1 text-xs text-red-600">{errors.age}</p>}
                {errors.weight && <p className="mt-1 text-xs text-red-600">{errors.weight}</p>}
                {errors.healthNotes && <p className="mt-1 text-xs text-red-600">{errors.healthNotes}</p>}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                {mode !== 'view' && (
                    <Button onClick={handleSubmit} variant="contained">
                        Save
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default PetFormModal;
