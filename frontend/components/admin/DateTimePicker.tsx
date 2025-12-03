
'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import tz from 'dayjs/plugin/timezone';
dayjs.extend(utc);
dayjs.extend(tz);

type SlotItem = {
  id: string;
  startMin: number;
  endMin: number;
  remaining: number;
};

type Props = {
  availabilityUrl?: string; // default '/api/slots/availability'
  daysAhead?: number; // how many days ahead selectable (default 30)
  disabledWeekends?: boolean; // if true, grey out Sat/Sun (default false)
  onChange?: (selectedSlotId: string | null) => void; // selected slot id or null
  customKey?: number | undefined;
  initial?: string | null; // legacy initial ISO datetime (optional)
  initialSlotId?: string | null; // optionally initialize by slot id
  className?: string;
};

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Flowbite-style DateTimePicker
 * - Simple calendar month view (prev/next)
 * - Fetch availability only on selected date
 * - Show timeslots on right, choose slot to emit selectedSlotId
 */
export default function DateTimePicker({
  availabilityUrl = '/api/slots/availability',
  daysAhead = 30,
  disabledWeekends = false,
  customKey = 0,
  onChange,
  initial = null,
  initialSlotId = null,
  className,
}: Props) {
  // timezone we display/interpret dates in
  const TZ = 'Asia/Bangkok';
  const [error, setError] = useState<string | null>(null);

  // bounds
  const today = useMemo(() => dayjs().tz(TZ).startOf('day'), [TZ]);
  const maxDate = useMemo(() => today.add(daysAhead - 1, 'day'), [today, daysAhead]);

  // calendar visible month (dayjs)
  const [viewMonth, setViewMonth] = useState(() => dayjs().tz(TZ).startOf('month'));
  // selected date (dayjs in TZ)
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(
    initial ? dayjs(initial).tz(TZ).startOf('day') : null
  );
  // selected final display string in format 'YYYY-MM-DD HH:mm' (Asia/Bangkok)
  const [selectedISO, setSelectedISO] = useState<string | null>(
    initial ? dayjs(initial).tz(TZ).format('YYYY-MM-DD HH:mm') : null
  );
  // selected slot id for highlighting
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(initialSlotId ?? null);

  // slots for selected date
  const [slots, setSlots] = useState<SlotItem[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // cache for fetched dates: YYYY-MM-DD -> SlotItem[] | null (null means fetched and no slots / unavailable)
  const [cache, setCache] = useState<Record<string, SlotItem[] | null>>({});

  // helpers
  const toKey = useCallback((d: dayjs.Dayjs) => d.tz(TZ).format('YYYY-MM-DD'), [TZ]);

  // create month grid: array of dayjs for calendar cells (including leading/trailing)
  const monthGrid = useMemo(() => {
    const startOfMonth = viewMonth.startOf('month');
    const endOfMonth = viewMonth.endOf('month');
    const startGrid = startOfMonth.startOf('week'); // Sunday start
    const endGrid = endOfMonth.endOf('week');
    const days: dayjs.Dayjs[] = [];
    for (let d = startGrid.clone(); d.isBefore(endGrid) || d.isSame(endGrid, 'day'); d = d.add(1, 'day')) {
      days.push(d.clone());
    }
    return days;
  }, [viewMonth]);

  // date valid check (bounds + optional weekend block)
  const isDateSelectable = useCallback(
    (d: dayjs.Dayjs) => {
      if (d.isBefore(today, 'day')) return false;
      if (d.isAfter(maxDate, 'day')) return false;
      if (disabledWeekends) {
        const wd = d.day();
        if (wd === 0 || wd === 6) return false;
      }
      return true;
    },
    [today, maxDate, disabledWeekends]
  );

  // fetch availability for a date (YYYY-MM-DD)
  async function fetchAvailabilityForDate(d: dayjs.Dayjs) {
    const key = toKey(d);
    // already fetched
    if (cache[key] !== undefined) return cache[key];
    try {
      setLoadingSlots(true);
      const res = await fetch(`${availabilityUrl}?date=${encodeURIComponent(key)}`, { cache: 'no-store' });
      if (!res.ok) {
        setCache((prev) => ({ ...prev, [key]: null }));
        setLoadingSlots(false);
        return null;
      }
      const json = await res.json();
      const slotsResp: SlotItem[] = json?.slots ?? json?.data?.slots ?? [];
      setCache((prev) => ({ ...prev, [key]: slotsResp }));
      setLoadingSlots(false);
      return slotsResp;
    } catch (err: unknown) {
      setCache((prev) => ({ ...prev, [key]: null }));
      setLoadingSlots(false);
      setError((err as Error)?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล');
      return null;
    }
  }

  // when user selects a date cell
  const handleSelectDate = async (d: dayjs.Dayjs) => {
    if (!isDateSelectable(d)) {
      return;
    }
    setSelectedDate(d.clone().startOf('day'));
    setSelectedISO(null);
    setSelectedSlotId(null);
    onChange?.(null);
    setSlots([]);
    const fetched = await fetchAvailabilityForDate(d);
    setSlots(fetched ?? []);
  };

  // when choose slot
  const handleChooseSlot = (slot: SlotItem) => {
    if (!selectedDate) return;
    if (slot.remaining <= 0) return;

    // compute datetime in TZ from selectedDate + slot.startMin
    const dtInTz = selectedDate.startOf('day').add(slot.startMin, 'minute').tz(TZ);

    // formatted display string e.g. '2025-11-02 09:00' (Asia/Bangkok)
    const formatted = dtInTz.format('YYYY-MM-DD HH:mm');

    setSelectedSlotId(slot.id);
    setSelectedISO(formatted);
    onChange?.(slot.id);
  };

  // when month nav
  const prevMonth = () => setViewMonth((m) => m.subtract(1, 'month'));
  const nextMonth = () => setViewMonth((m) => m.add(1, 'month'));

  // pretty time label
  const minsToLabel = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  // initial effect: if initial ISO set, fetch its date and slots and try to infer slotId
  useEffect(() => {
    console.log("key", customKey)
    if (customKey > 0) {
      // reset picker state
      setSelectedDate(null);
      setSelectedISO(null);
      setSelectedSlotId(null);
      setSlots([]);
      setViewMonth(dayjs().tz(TZ).startOf('month'));
      setCache({});
      // onChange?.(null);
      return;
    }
    if (initial) {
      const d = dayjs(initial).tz(TZ).startOf('day');
      setSelectedDate(d);
      setSelectedISO(dayjs(initial).tz(TZ).format('YYYY-MM-DD HH:mm'));
      fetchAvailabilityForDate(d).then((s) => {
        setSlots(s ?? []);
        // try to infer slot id from initial datetime by matching startMin
        if (s && initial) {
          const minutes = dayjs(initial).tz(TZ).hour() * 60 + dayjs(initial).tz(TZ).minute();
          const match = s.find((sl) => sl.startMin === minutes);
          if (match) {
            setSelectedSlotId(match.id);
            onChange?.(match.id);
          } else {
            // leave selectedSlotId null
            onChange?.(null);
          }
        }
      });
      // console.log("slots",slots)
    }
    else if (initialSlotId) {
      // if initialSlotId provided, we need to fetch its date by calling availability (or rely on consumer to set selectedDate)
      // simple approach: try fetching surrounding dates up to daysAhead to locate the slotId
      const tryFindSlot = async () => {
        // search dates from today..maxDate (could be optimized if you know the date)
        for (let offset = 0; offset < daysAhead; offset++) {
          const d = today.add(offset, 'day');
          const s = await fetchAvailabilityForDate(d);
          if (s) {
            const found = s.find((sl) => sl.id === initialSlotId);
            if (found) {
              setSelectedDate(d);
              setSlots(s);
              setSelectedSlotId(found.id);
              const dtInTz = d.startOf('day').add(found.startMin, 'minute').tz(TZ);
              setSelectedISO(dtInTz.format('YYYY-MM-DD HH:mm'));
              onChange?.(found.id);
              return;
            }
          }
        }
        // not found
        onChange?.(null);
      };
      tryFindSlot();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customKey]);

  // UI rendering
  return (
    <div className={`flowbite-datetimepicker ${className ?? ''}`}>
      {/* Calendar */}
      <div className="w-[350px] bg-white rounded-lg border border-gray-200 p-4 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm text-gray-500">Select date</div>
            <div className="text-lg font-semibold">{viewMonth.format('MMMM YYYY')}</div>
          </div>
          <div className="flex gap-2">
            <button
              className="px-3 py-2 rounded border bg-white hover:bg-gray-50"
              onClick={prevMonth}
              aria-label="Previous month"
            >
              ‹
            </button>
            <button
              className="px-3 py-2 rounded border bg-white hover:bg-gray-50"
              onClick={nextMonth}
              aria-label="Next month"
            >
              ›
            </button>
          </div>
        </div>

        {/* Weekday labels */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-2">
          {WEEK_DAYS.map((wd) => (
            <div key={wd} className="py-1">
              {wd}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1">
          {monthGrid.map((d) => {
            const inMonth = d.isSame(viewMonth, 'month');
            const isPast = d.isBefore(today, 'day');
            const isAfterMax = d.isAfter(maxDate, 'day');
            const isWeekend = d.day() === 0 || d.day() === 6;
            const selectable = isDateSelectable(d);
            const key = toKey(d);
            const cached = cache[key]; // undefined = not fetched; null = fetched no slots; array = slots

            const isSelected = selectedDate && d.isSame(selectedDate, 'day');

            return (
              <button
                key={d.toString()}
                onClick={() => handleSelectDate(d)}
                disabled={!inMonth || isPast || isAfterMax || (disabledWeekends && isWeekend)}
                className={[
                  'h-10 w-full rounded-md text-sm flex items-center justify-center',
                  !inMonth ? 'text-gray-300 cursor-default bg-transparent' : '',
                  isPast || isAfterMax ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100',
                  disabledWeekends && isWeekend ? 'opacity-50 cursor-not-allowed' : '',
                  isSelected ? 'bg-blue-600 text-white' : '',
                  cached === null && inMonth && selectable ? 'bg-gray-50 opacity-70' : '',
                ].join(' ')}
              >
                <div>
                  <div className="text-sm font-medium">{d.date()}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* hint / legend */}
        <div className="mt-3 text-xs text-gray-500 space-y-1">
          <div>Click a date to load times.</div>
          {disabledWeekends && <div>Weekends disabled.</div>}
          <div>Dates without availability will show No available slots.</div>
        </div>
      </div>

      {/* Right column: availability / times */}
      <div className="flex-1 bg-white rounded-lg border border-gray-200 p-4 shadow-sm min-h-[220px] mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm text-gray-500">Available times</div>
            <div className="text-base font-semibold">{selectedDate ? selectedDate.format('YYYY-MM-DD (ddd)') : 'Select a date'}</div>
          </div>
          <div className="text-xs text-gray-400">Timezone: {TZ}</div>
        </div>

        {!selectedDate && <div className="text-sm text-gray-500">Choose a date on the left to see available times.</div>}

        {selectedDate && loadingSlots && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
              <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" className="opacity-75"></path>
            </svg>{' '}
            Loading...
          </div>
        )}

        {selectedDate && !loadingSlots && slots.length === 0 && <div className="text-sm text-gray-500">No available slots on this date.</div>}

        {selectedDate && !loadingSlots && slots.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {slots.map((s, i) => {
              const label = `${minsToLabel(s.startMin)} - ${minsToLabel(s.endMin)}`;
              const isFull = s.remaining <= 0;
              const selected = selectedSlotId === s.id;
              return (
                <div key={i} className="col-span-1">
                  <button
                    onClick={() => !isFull && handleChooseSlot(s)}
                    disabled={isFull}
                    className={[
                      'w-full text-left rounded-lg p-3 border transition',
                      isFull ? 'bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed' : '',
                      selected ? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-gray-50',
                    ].join(' ')}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm font-medium">{label}</div>
                        <div className="text-xs text-gray-500">{isFull ? 'Full' : `Available ${s.remaining}`}</div>
                      </div>
                      <div>{!isFull && <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" /></svg>}</div>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* selected display */}
        <div className="mt-4 text-sm">
          <div className="text-xs text-gray-400">Selected</div>
          {error && (
            <div className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-red-700">
              {error}
            </div>
          )}
          {selectedISO ? <div className="text-sm font-medium">{selectedISO}</div> : <div className="text-sm text-gray-500">No time selected</div>}
        </div>
      </div>
    </div>
  );
}
