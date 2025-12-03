'use client';
import { useEffect, useState } from 'react';
import { Order } from '@/types/models';

export default function OrderPage() {
  // const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState<number>(10); // ← selectable limit
  const [totalPages, setTotalPages] = useState<number>(1); // ← selectable limit

  // const ordersExample: Order[] = [
  //   {
  //     id: '1',
  //     customerName: 'John Doe',
  //     employee: 'Jane Smith',
  //     totalPrice: 150.0,
  //     totalDuration: 60,
  //     createdAt: '2024-06-01T10:00:00Z',
  //     status: 'Completed',
  //   },
  //   {
  //     id: '2',
  //     customerName: 'Alice Johnson',
  //     employee: 'Bob Brown',
  //     totalPrice: 200.0,
  //     totalDuration: 90,
  //     createdAt: '2024-06-02T11:30:00Z',
  //     status: 'Pending',
  //   },
  //   {
  //     id: '3',
  //     customerName: 'Michael Lee',
  //     employee: 'Sara Davis',
  //     totalPrice: 120.0,
  //     totalDuration: 45,
  //     createdAt: '2024-06-03T14:15:00Z',
  //     status: 'Cancelled',
  //   },
  //   {
  //     id: '4',
  //     customerName: 'Emily Clark',
  //     employee: 'Tom Wilson',
  //     totalPrice: 180.0,
  //     totalDuration: 75,
  //     createdAt: '2024-06-04T09:45:00Z',
  //     status: 'Completed',
  //   },
  //   {
  //     id: '5',
  //     customerName: 'David Martinez',
  //     employee: 'Linda Taylor',
  //     totalPrice: 220.0,
  //     totalDuration: 100,
  //     createdAt: '2024-06-05T13:00:00Z',
  //     status: 'Pending',
  //   },
  //   {
  //     id: '6',
  //     customerName: 'John Doe',
  //     employee: 'Jane Smith',
  //     totalPrice: 150.0,
  //     totalDuration: 60,
  //     createdAt: '2024-06-01T10:00:00Z',
  //     status: 'Completed',
  //   },
  //   {
  //     id: '7',
  //     customerName: 'Alice Johnson',
  //     employee: 'Bob Brown',
  //     totalPrice: 200.0,
  //     totalDuration: 90,
  //     createdAt: '2024-06-02T11:30:00Z',
  //     status: 'Pending',
  //   },
  //   {
  //     id: '8',
  //     customerName: 'Michael Lee',
  //     employee: 'Sara Davis',
  //     totalPrice: 120.0,
  //     totalDuration: 45,
  //     createdAt: '2024-06-03T14:15:00Z',
  //     status: 'Cancelled',
  //   },
  //   {
  //     id: '9',
  //     customerName: 'Emily Clark',
  //     employee: 'Tom Wilson',
  //     totalPrice: 180.0,
  //     totalDuration: 75,
  //     createdAt: '2024-06-04T09:45:00Z',
  //     status: 'Completed',
  //   },
  //   {
  //     id: '10',
  //     customerName: 'David Martinez',
  //     employee: 'Linda Taylor',
  //     totalPrice: 220.0,
  //     totalDuration: 100,
  //     createdAt: '2024-06-05T13:00:00Z',
  //     status: 'Pending',
  //   },
  //   {
  //     id: '11',
  //     customerName: 'John Doe',
  //     employee: 'Jane Smith',
  //     totalPrice: 150.0,
  //     totalDuration: 60,
  //     createdAt: '2024-06-01T10:00:00Z',
  //     status: 'Completed',
  //   },
  //   {
  //     id: '12',
  //     customerName: 'Alice Johnson',
  //     employee: 'Bob Brown',
  //     totalPrice: 200.0,
  //     totalDuration: 90,
  //     createdAt: '2024-06-02T11:30:00Z',
  //     status: 'Pending',
  //   },
  // ];

  useEffect(() => {
    // Mock fetch — replace with your actual API call
    async function fetchOrders() {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/appointment', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      console.log("data", data)
      // setOrders(ordersExample);
      // setFilteredOrders(ordersExample);
      // setOrders(data.data.appointments || []);
      setFilteredOrders(data.data.appointments || []);
      setTotalPages(data.data.pagination.totalPages || 1);
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
  // const totalPages = Math.ceil(filteredOrders.length / perPage);

  const emptyRows = perPage - currentOrders.length;
  const limits = [5, 10];

  return (
    <div className="text-slate-500 max-w-6xl mx-auto px-4 py-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-6">
          Order <span className="font-medium text-slate-800">Management</span>
        </h1>
        <div className="flex items-center gap-3 mb-6">
          {/* Limit selector buttons */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Items per page:</span>
            <div className="flex rounded-lg border border-slate-300 overflow-hidden">
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
            </div>
          </div>
          <button
            className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 hover:cursor-pointer"
          >
            + Add New Service
          </button>
        </div>
      </div>
      {/* Filters */}
      <div className="flex flex-col md:flex-row items-center gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by order id..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-slate-200 rounded-lg p-3 text-sm md:text-lg w-full"
        />
        <div className="relative w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-200 rounded-lg p-3 pr-10 text-sm md:text-lg appearance-none w-full"
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            <svg
              className="w-4 h-4 text-slate-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
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
                    <td className="p-3 truncate">{o.customer?.fullname}</td>
                    <td className="p-3 truncate">{o.staff?.name ?? '-'}</td>
                    <td className="p-3 font-medium text-slate-800">
                      ฿{o.order.amount}
                    </td>
                    {/* <td className="p-3">{o.totalDuration} min</td> */}
                    <td className="p-3">min</td>
                    <td className="p-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${o.order.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-700'
                          : o.order.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                          }`}
                      >
                        {o.order.status}
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
