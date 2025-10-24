import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
} from '@mui/material';
import { Pet } from '@/types/models';

interface PetFormModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (pet: Pet) => void | Promise<void>;
    initialData?: Pet | null;
    mode: 'view' | 'add' | 'edit';
}

const PetFormModal: React.FC<PetFormModalProps> = ({ open, onClose, onSubmit, initialData, mode }) => {
    const [formData, setFormData] = useState<Pet>({
        name: '',
        species: '',
        breed: '',
        gender: 'MALE',
        age: '',
        weight: 0,
        healthNotes: '',
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({
                name: '',
                species: '',
                breed: '',
                gender: 'MALE',
                age: '',
                weight: 0,
                healthNotes: '',
            });
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value, weight: name === 'weight' ? Number(value) : prev.weight }));
    };

    const handleSubmit = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            alert('Access token not found');
            return;
        }

        const method = mode === 'edit' ? 'PUT' : 'POST';
        const url = mode === 'edit' ? `/api/pet/${formData.id}` : '/api/pet';

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error('Failed to save pet');
            const result = await response.json();
            if (onSubmit) await onSubmit(result);
            onClose();
            alert('บันทึกข้อมูลเรียบร้อย');
            window.location.reload();
        } catch (error) {
            console.error(error);
            alert('Error saving pet');
        }
    };

    const readOnly = mode === 'view';

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>
                {mode === 'add' && 'Add Pet'}
                {mode === 'edit' && 'Edit Pet'}
                {mode === 'view' && 'View Pet'}
            </DialogTitle>
            <DialogContent>
                <TextField
                    margin="dense"
                    label="Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    fullWidth
                    disabled={readOnly}
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
                    margin="dense"
                    label="Gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    fullWidth
                    disabled={readOnly}
                />
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
                    type="number"
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
                    rows={3}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                {mode !== 'view' && <Button onClick={handleSubmit} variant="contained">Save</Button>}
            </DialogActions>
        </Dialog>
    );
};

export default PetFormModal;
