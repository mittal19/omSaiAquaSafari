export type Yacht = {
  id: string;
  name: string;
  lengthFt: number;
  speedKnots: number;
  capacity: number;
  sleepingCapacity: number;
  cabins: number;
  crew: number;
  dayRateInr: number;
  includes: { water: boolean; food: boolean };
  heroImage: string;
  images: string[];
  description: string;
};

export const YACHTS: Yacht[] = [
  {
    id: 'ocean-pearl',
    name: 'Ocean Pearl',
    lengthFt: 42,
    speedKnots: 18,
    capacity: 12,
    sleepingCapacity: 4,
    cabins: 2,
    crew: 2,
    dayRateInr: 45000,
    includes: { water: true, food: false },
    heroImage: 'assets/yachts/ocean-pearl/hero.jpg',
    images: [
      'assets/yachts/ocean-pearl/1.jpg',
      'assets/yachts/ocean-pearl/2.jpg',
      'assets/yachts/ocean-pearl/3.jpg',
      'assets/yachts/ocean-pearl/4.jpg',
      'assets/yachts/ocean-pearl/5.jpg',
      'assets/yachts/ocean-pearl/6.jpg',
    ],
    description:
      'A comfortable 42ft yacht ideal for couples and small groups. Great for sunset rides and short parties.',
  },
  {
    id: 'blue-horizon',
    name: 'Blue Horizon',
    lengthFt: 55,
    speedKnots: 22,
    capacity: 18,
    sleepingCapacity: 6,
    cabins: 3,
    crew: 3,
    dayRateInr: 75000,
    includes: { water: true, food: true },
    heroImage: 'assets/yachts/blue-horizon/hero.jpg',
    images: [
      'assets/yachts/blue-horizon/1.jpg',
      'assets/yachts/blue-horizon/2.jpg',
      'assets/yachts/blue-horizon/3.jpg',
      'assets/yachts/blue-horizon/4.jpg',
      'assets/yachts/blue-horizon/5.jpg',
      'assets/yachts/blue-horizon/6.jpg',
      'assets/yachts/blue-horizon/7.jpg',
    ],
    description:
      'Premium 55ft experience with bigger deck space, perfect for celebrations and corporate groups.',
  },
];
