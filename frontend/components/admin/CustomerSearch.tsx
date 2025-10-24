"use client";

import React, { useEffect, useState } from 'react';
import { Customer } from '@/types/models';
import { useCustomerSearch } from '@/hooks/useCustomerSearch';

export function CustomerSearch({ onSelect }: { onSelect: (c: Customer) => void }) {
    const [q, setQ] = useState('');
    const { results, search, loading, error } = useCustomerSearch();

    return (
        <div>
            <div className="flex gap-2">
                <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search name / phone / email"
                    className="flex-1 border border-slate-200 rounded-lg p-3 text-sm md:text-lg"
                />
                <button
                    className="px-4 bg-slate-800 text-white rounded-lg text-sm md:text-lg"
                    onClick={() => search(q)}
                    disabled={loading}
                >{loading ? 'Searching...' : 'Search'}</button>
                <button className="px-3 border rounded-lg text-sm md:text-lg" onClick={() => { setQ(''); }}>
                    Clear
                </button>
            </div>

            {error && <div className="mt-2 text-sm text-red-500">{error}</div>}

            <div className="mt-3 space-y-2 max-h-48 overflow-auto">
                {results.map((c) => (
                    <div key={c.id} className="cursor-pointer rounded-lg border p-2 hover:bg-slate-50" onClick={() => onSelect(c)}>
                        <div className="font-medium">{c.fullname}</div>
                        <div className="text-xs text-slate-500">{c.phone ?? c.email ?? c.id}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}