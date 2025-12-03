"use client";

import React, { useEffect, useState } from 'react';
import { Pet } from '@/types/models';

export function useCustomerPets() {
    const [pets, setPets] = useState<Pet[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPets = async (customerId?: string) => {
        if (!customerId) { setPets([]); return; }
        setLoading(true); setError(null);
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) throw new Error('Please login');
            const res = await fetch(`/api/customer/${encodeURIComponent(customerId)}/pets`, { headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) throw new Error(await res.text());
            const json = await res.json();
            const list: Pet[] = Array.isArray(json.data) ? json.data : Array.isArray(json) ? json : [];
            console.log("loaded pets:", list);
            setPets(list);
        } catch (err: any) {
            console.error('useCustomerPets:', err);
            setError(err?.message || 'Failed to load pets');
            setPets([]);
        } finally { setLoading(false); }
    };

    return { pets, fetchPets, loading, error };
}