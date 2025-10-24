'use client';
import { Customer } from '@/types/models';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function CustomerPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  
  async function fetchCustomers() {
    const token = localStorage.getItem('accessToken');
    if (!token) return alert('Please login first');

    const res = await fetch('/api/customer', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.message === 'Unauthorized') {
      alert('Token expired or invalid');
      return;
    }
    console.log("data", data);
    setCustomers(data.data);
  }

  useEffect(() => {
    fetchCustomers();
  }, []);
  
  return (
    <div className="p-6 text-slate-600">
      <h1 className="text-2xl font-semibold text-slate-800 mb-6">Customers</h1>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Points</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers && customers.length > 0 && customers.map((cust) => (
              <tr key={cust.id} className="border-t hover:bg-slate-50">
                <td className="p-3">{cust.username}</td>
                <td className="p-3">{cust.phone}</td>
                <td className="p-3">{cust.totalPoints}</td>
                <td className="p-3 flex justify-end">
                  <Link
                    href={`/customer/${cust.id}`}
                    className="px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
