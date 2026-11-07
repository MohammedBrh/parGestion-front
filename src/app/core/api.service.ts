import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Attribution, AttributionRequest, Car, Driver, Personnel } from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);

  // Cars
  cars = () => this.http.get<Car[]>('/api/cars');
  availableCars = (start: string, end: string) =>
    this.http.get<Car[]>('/api/cars/available', { params: { start, end } });
  saveCar = (c: Car) => (c.id ? this.http.put<Car>(`/api/cars/${c.id}`, c) : this.http.post<Car>('/api/cars', c));
  deleteCar = (id: number) => this.http.delete<void>(`/api/cars/${id}`);

  // Drivers
  drivers = () => this.http.get<Driver[]>('/api/drivers');
  availableDrivers = (start: string, end: string) =>
    this.http.get<Driver[]>('/api/drivers/available', { params: { start, end } });
  saveDriver = (d: Driver) =>
    d.id ? this.http.put<Driver>(`/api/drivers/${d.id}`, d) : this.http.post<Driver>('/api/drivers', d);
  deleteDriver = (id: number) => this.http.delete<void>(`/api/drivers/${id}`);

  // Personnel
  personnel = () => this.http.get<Personnel[]>('/api/personnel');
  savePersonnel = (p: Personnel) =>
    p.id ? this.http.put<Personnel>(`/api/personnel/${p.id}`, p) : this.http.post<Personnel>('/api/personnel', p);
  deletePersonnel = (id: number) => this.http.delete<void>(`/api/personnel/${id}`);

  // Attributions
  attributions = (status = 'ACTIVE'): Observable<Attribution[]> =>
    this.http.get<Attribution[]>('/api/attributions', { params: { status } });
  attribution = (id: number) => this.http.get<Attribution>(`/api/attributions/${id}`);
  createAttribution = (r: AttributionRequest) => this.http.post<Attribution>('/api/attributions', r);
  completeAttribution = (id: number) => this.http.post<Attribution>(`/api/attributions/${id}/complete`, {});
  cancelAttribution = (id: number) => this.http.post<Attribution>(`/api/attributions/${id}/cancel`, {});
}
