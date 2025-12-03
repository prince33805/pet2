"use client";

import React from 'react';
// import { Pet } from '@/types/models';
// import { useCustomerSearch } from '@/hooks/useCustomerSearch';

export function PetSelect(
    // { customerId, pets, loading, error, onChange }:
    // { customerId?: string | null; pets: Pet[]; loading: boolean; error?: string | null; onChange: (pet: Pet | null) => void }
    ) {

    return (
        <div>
            <label className="block text-sm md:text-lg mb-2">Pets</label>
            {/* {loading ? (
                <div className="text-sm text-slate-500">Loading pets...</div>
            ) : error ? (
                <div className="text-sm text-red-500">{error}</div>
            ) : pets.length === 0 ? (
                <div className="text-sm text-slate-400">No pets found for this customer</div>
            ) : (
                <select className="w-full border border-slate-200 rounded-lg p-3 text-sm md:text-lg" onChange={(e) => {
                    const pet = pets.find(p => p.id === e.target.value) ?? null;
                    onChange(pet);
                }}>
                    <option value="">Select Pet</option>
                    {pets.map(p => (
                        <option key={p.id} value={p.id}>{p.name} {p.species ? `(${p.species})` : ''}</option>
                    ))}
                </select>
            )} */}
        </div>
    );
}