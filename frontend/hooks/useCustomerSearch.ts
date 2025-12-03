"use client";

import { Customer } from '@/types/models';
import React, { useEffect, useState } from 'react';

export function useCustomerSearch() {
    const [results, setResults] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // const customerExample: Customer = {
    //     id: '21b10c86-4303-4689-8420-3b46c4d25973',
    //     fullname: "John Doe",
    //     username: "johndoe",
    //     phone: "123-456-7890",
    //     email: "mZiZP@example.com",
    //     address: "123 Main St, Anytown, USA",
    //     membershipTier: "Gold",
    //     totalPoints: 1000,
    // };

    const search = async (q?: string) => {
        if (!q || q.trim().length === 0) { setResults([]); return; }
        setLoading(true); setError(null);
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) throw new Error('Please login');
            const res = await fetch(`/api/customer?search=${encodeURIComponent(q)}`, { headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) throw new Error(await res.text());
            const json = await res.json();
            const list: Customer[] = Array.isArray(json.data) ? json.data : Array.isArray(json) ? json : [];
            setResults(list);
        } catch (err: any) {
            console.error('useCustomerSearch:', err);
            setError(err?.message || 'Search failed');
            setResults([]);
        } finally { setLoading(false); }
    };

    return { results, search, loading, error, setResults };
}