'use client';
import { Customer } from '@/types/models';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function CustomerPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

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
    setCustomers(data.data.customers || []);
    setCurrentPage(1);
  }

  useEffect(() => {
    fetchCustomers();
  }, []);

  const perPage = 10;
  const startIndex = (currentPage - 1) * perPage;
  const currentOrders = customers.slice(startIndex, startIndex + perPage);
  // const totalPages = Math.ceil(customers.length / perPage);

  const emptyRows = perPage - currentOrders.length;

  return (
    <div className="text-slate-500 max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-6">
        Cus<span className="font-medium text-slate-800">tomers</span>
      </h1>
      {/* Limit selector buttons */}
      <div className="flex flex-col md:flex-row items-center gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by order id..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-slate-200 rounded-lg p-3 text-sm md:text-lg w-full"
        />

        {/* <span className="text-sm text-slate-600">Items per page:</span> */}
        {/* <div className="flex rounded-lg border border-slate-300 overflow-hidden">
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
        </div> */}
      </div>

      <div className="border border-slate-200 rounded-lg overflow-x-auto">
        <table className="w-full border-collapse text-sm md:text-lg table-fixed">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Points</th>
              <th className="p-3">Actions</th>
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
            {Array.from({ length: emptyRows > 0 ? emptyRows : 0 }).map(
              (_, i) => (
                <tr
                  key={`empty-${i}`}
                  className="border-t border-slate-200 h-[53px]"
                >
                  <td colSpan={4}></td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
