'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Appointment, Customer } from '@/types/models';

export default function CustomerDetailPage() {
  const { id } = useParams();
  const [customer, setCustomer] = useState<Customer>();
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  async function fetchCustomer() {
    const token = localStorage.getItem('accessToken');
    if (!token) return alert('Please login first');

    const res = await fetch(`/api/customer/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.message === 'Unauthorized') {
      alert('Token expired or invalid');
      return;
    }
    setCustomer(data.data);
  }

  async function fetchAppointments() {
    const token = localStorage.getItem('accessToken');
    if (!token) return alert('Please login first');

    const res = await fetch(`/api/appointment/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.message === 'Unauthorized') {
      alert('Token expired or invalid');
      return;
    }
    setAppointments(data.data);
  }

  async function fetchPets() {
    const token = localStorage.getItem('accessToken');
    if (!token) return alert('Please login first');

    const res = await fetch(`/api/pets/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.message === 'Unauthorized') {
      alert('Token expired or invalid');
      return;
    }
    setAppointments(data.data);
  }

  useEffect(() => {
    fetchCustomer();
    // fetchAppointments();
  }, []);

  const [dateFilter, setDateFilter] = useState<string>('');

  const filteredOrders = appointments.filter(
    (o) => !dateFilter || o.date === dateFilter,
  );

  return (
    <div className="p-6 text-slate-600">
      <h1 className="text-2xl font-semibold text-slate-800 mb-6">
        Customer Detail
      </h1>

      {/* Customer Info */}
      <div className="border rounded-lg p-4 mb-6 bg-slate-50">
        <p className="text-lg">
          <b>Name:</b> {customer?.username}
        </p>
        <p className="text-lg">
          <b>Phone:</b> {customer?.phone}
        </p>
        <p className="text-lg">
          <b>Address:</b> {customer?.address}
        </p>
        <p className="text-lg">
          <b>Points:</b> {customer?.totalPoints}
        </p>
      </div>

      {/* Date Filter */}
      <div className="flex items-center gap-3 mb-4">
        <label className="text-slate-600">Select Date:</label>
        <input
          type="date"
          className="border rounded-lg p-2"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        />
      </div>

      {/* Order History */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Service</th>
              <th className="p-3">Employee</th>
              <th className="p-3">Duration</th>
              <th className="p-3">Price</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((o) => (
                <tr key={o.id} className="border-t hover:bg-slate-50">
                  <td className="p-3">{o.date}</td>
                  {/* <td className="p-3">{o.service}</td>
                  <td className="p-3">{o.employee}</td>
                  <td className="p-3">{o.duration} min</td>
                  <td className="p-3">฿{o.price}</td> */}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-3 text-center text-slate-400">
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
