export type CarCategory = 'VIP' | 'SERVICE_CLASS' | 'SERVICE_NORMALE' | 'MATERIEL';
export type CarStatus = 'AVAILABLE' | 'MAINTENANCE';
export type PersonnelCategory = 'VIP' | 'GUEST' | 'EMPLOYEE';
export type DriverStatus = 'AVAILABLE' | 'OFF';
export type AttributionStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface Car {
  id?: number;
  matricule: string;
  places: number;
  type: string;
  category: CarCategory;
  status: CarStatus;
}

export interface Personnel {
  id?: number;
  name: string;
  phone: string;
  category: PersonnelCategory;
}

export interface Driver {
  id?: number;
  name: string;
  phone: string;
  licenseNumber: string;
  status: DriverStatus;
}

export interface Attribution {
  id: number;
  car: Car;
  driver: Driver;
  personnel: Personnel;
  startAt: string;
  endAt: string;
  passengers: number;
  destination: string | null;
  notes: string | null;
  status: AttributionStatus;
}

export interface AttributionRequest {
  carId: number;
  driverId: number;
  personnelId: number;
  startAt: string;
  endAt: string;
  passengers: number;
  destination: string;
  notes: string;
}
