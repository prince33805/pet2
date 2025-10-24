"use client";

import React, { useEffect, useState } from 'react';
import { Service } from '@/types/models';

export function useServices() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function fetchServices() {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                window.location.href = '/admin/cashier';
                throw new Error('Please login')
            };
            const res = await fetch('/api/service', { headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) throw new Error(await res.text());
            const json = await res.json();
            const list: Service[] = Array.isArray(json.data) ? json.data : Array.isArray(json) ? json : [];
            console.log("useServices fetched:", list);
            setServices(list);
        } catch (err: any) {
            console.error('useServices:', err);
            setError(err?.message || 'Failed to load services');
            setServices([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { fetchServices(); }, []);
    return { services, fetchServices, loading, error };
}