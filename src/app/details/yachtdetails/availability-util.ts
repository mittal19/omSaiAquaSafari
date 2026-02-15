export type Availability = {
  availableDates: string[]; // YYYY-MM-DD
  timesByDate: Record<string, string[]>; // date -> ["10:00","12:00"...]
};

const TIME_SLOTS = ['09:00', '11:00', '13:00', '15:00', '17:00', '19:00'];

function toYYYYMMDD(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function hashString(input: string): number {
  // simple deterministic hash
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) >>> 0;
  return h;
}

export function buildMockAvailability(yachtId: string, daysAhead = 21): Availability {
  const base = hashString(yachtId);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const availableDates: string[] = [];
  const timesByDate: Record<string, string[]> = {};

  for (let i = 0; i < daysAhead; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = toYYYYMMDD(d);

    // Mock "unavailable dates": about 30% unavailable
    const unavailable = ((base + i * 7) % 10) < 3;
    if (unavailable) continue;

    availableDates.push(dateStr);

    // Mock "unavailable time slots": remove 1-3 slots depending on date
    const slots = [...TIME_SLOTS];
    const removeCount = ((base + i) % 3) + 1; // 1..3
    for (let r = 0; r < removeCount; r++) {
      const idx = (base + i * 13 + r * 5) % slots.length;
      slots.splice(idx, 1);
    }

    timesByDate[dateStr] = slots;
  }

  return { availableDates, timesByDate };
}
