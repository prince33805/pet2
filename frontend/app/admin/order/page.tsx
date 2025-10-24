'use client';
import { useEffect, useState } from 'react';
import { Order } from '@/types/models';

export default function OrderPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  const ordersExample: Order[] = [
    {
      id: '1',
      customerName: 'John Doe',
      employee: 'Jane Smith',
      totalPrice: 150.0,
      totalDuration: 60,
      createdAt: '2024-06-01T10:00:00Z',
      status: 'Completed',
    },
    {
      id: '2',
      customerName: 'Alice Johnson',
      employee: 'Bob Brown',
      totalPrice: 200.0,
      totalDuration: 90,
      createdAt: '2024-06-02T11:30:00Z',
      status: 'Pending',
    },
    {
      id: '3',
      customerName: 'Michael Lee',
      employee: 'Sara Davis',
      totalPrice: 120.0,
      totalDuration: 45,
      createdAt: '2024-06-03T14:15:00Z',
      status: 'Cancelled',
    },
    {
      id: '4',
      customerName: 'Emily Clark',
      employee: 'Tom Wilson',
      totalPrice: 180.0,
      totalDuration: 75,
      createdAt: '2024-06-04T09:45:00Z',
      status: 'Completed',
    },
    {
      id: '5',
      customerName: 'David Martinez',
      employee: 'Linda Taylor',
      totalPrice: 220.0,
      totalDuration: 100,
      createdAt: '2024-06-05T13:00:00Z',
      status: 'Pending',
    },
    {
      id: '6',
      customerName: 'John Doe',
      employee: 'Jane Smith',
      totalPrice: 150.0,
      totalDuration: 60,
      createdAt: '2024-06-01T10:00:00Z',
      status: 'Completed',
    },
    {
      id: '7',
      customerName: 'Alice Johnson',
      employee: 'Bob Brown',
      totalPrice: 200.0,
      totalDuration: 90,
      createdAt: '2024-06-02T11:30:00Z',
      status: 'Pending',
    },
    {
      id: '8',
      customerName: 'Michael Lee',
      employee: 'Sara Davis',
      totalPrice: 120.0,
      totalDuration: 45,
      createdAt: '2024-06-03T14:15:00Z',
      status: 'Cancelled',
    },
    {
      id: '9',
      customerName: 'Emily Clark',
      employee: 'Tom Wilson',
      totalPrice: 180.0,
      totalDuration: 75,
      createdAt: '2024-06-04T09:45:00Z',
      status: 'Completed',
    },
    {
      id: '10',
      customerName: 'David Martinez',
      employee: 'Linda Taylor',
      totalPrice: 220.0,
      totalDuration: 100,
      createdAt: '2024-06-05T13:00:00Z',
      status: 'Pending',
    },
    {
      id: '11',
      customerName: 'John Doe',
      employee: 'Jane Smith',
      totalPrice: 150.0,
      totalDuration: 60,
      createdAt: '2024-06-01T10:00:00Z',
      status: 'Completed',
    },
    {
      id: '12',
      customerName: 'Alice Johnson',
      employee: 'Bob Brown',
      totalPrice: 200.0,
      totalDuration: 90,
      createdAt: '2024-06-02T11:30:00Z',
      status: 'Pending',
    },
  ];

  useEffect(() => {
    // Mock fetch — replace with your actual API call
    async function fetchOrders() {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/appointment', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setOrders(ordersExample);
      setFilteredOrders(ordersExample);
      // setOrders(data.data || []);
      // setFilteredOrders(data.data || []);
    }
    fetchOrders();
  }, []);

  // useEffect(() => {
  //   let filtered = orders.filter((o) =>
  //     o.customerName.toLowerCase().includes(search.toLowerCase()),
  //   );
  //   if (statusFilter) {
  //     filtered = filtered.filter((o) => o.status === statusFilter);
  //   }
  //   setFilteredOrders(filtered);
  //   setCurrentPage(1);
  // }, [search, statusFilter, orders]);

  const startIndex = (currentPage - 1) * perPage;
  const currentOrders = filteredOrders.slice(startIndex, startIndex + perPage);
  const totalPages = Math.ceil(filteredOrders.length / perPage);

  const emptyRows = perPage - currentOrders.length;

  return (
    <div className="text-slate-500 max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-6">
        Order <span className="font-medium text-slate-800">Management</span>
      </h1>

      {/* Filters */}
      <div className="flex flex-col md:flex-row items-center gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by customer name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-slate-200 rounded-lg p-3 text-sm md:text-lg w-full"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-slate-200 rounded-lg p-3 text-sm md:text-lg"
        >
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      <div className="border border-slate-200 rounded-lg overflow-x-auto">
        <table className="w-full border-collapse text-sm md:text-lg table-fixed">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="p-3 text-left w-[5%]">#</th>
              <th className="p-3 text-left w-[20%]">Customer</th>
              <th className="p-3 text-left w-[20%]">Employee</th>
              <th className="p-3 text-left w-[10%]">Total (฿)</th>
              <th className="p-3 text-left w-[10%]">Duration</th>
              <th className="p-3 text-left w-[15%]">Status</th>
              <th className="p-3 text-left w-[20%]">Date</th>
            </tr>
          </thead>
          <tbody>
            {
            // currentOrders.length > 0 ? 
              (
                currentOrders.map((o, idx) => (
                  <tr
                    key={o.id}
                    className="border-t border-slate-200 hover:bg-slate-50"
                  >
                    <td className="p-3">{startIndex + idx + 1}</td>
                    <td className="p-3 truncate">{o.customerName}</td>
                    <td className="p-3 truncate">{o.employee}</td>
                    <td className="p-3 font-medium text-slate-800">
                      ฿{o.totalPrice.toFixed(2)}
                    </td>
                    <td className="p-3">{o.totalDuration} min</td>
                    <td className="p-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          o.status === 'Completed'
                            ? 'bg-green-100 text-green-700'
                            : o.status === 'Pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="p-3">
                      {new Date(o.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) 
            // : (
            //   <tr className="border-t border-slate-200 h-[53px]">
            //     <td colSpan={7} className="text-center py-4 text-slate-600">
            //       No orders found.
            //     </td>
            //   </tr>
            // )
            }

            {/* Empty placeholder rows to keep 10 rows */}
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
      {/* {totalPages > 1 && ( */}
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
      {/* )} */}
    </div>
  );
}
