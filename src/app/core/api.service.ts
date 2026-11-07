import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Attribution, AttributionRequest, Car, Driver, Personnel } from './models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  // Cars
  cars = () => this.http.get<Car[]>(`${this.api}/cars`);
  availableCars = (start: string, end: string) =>
    this.http.get<Car[]>(`${this.api}/cars/available`, { params: { start, end } });
  saveCar = (c: Car) =>
    c.id ? this.http.put<Car>(`${this.api}/cars/${c.id}`, c) : this.http.post<Car>(`${this.api}/cars`, c);
  deleteCar = (id: number) => this.http.delete<void>(`${this.api}/cars/${id}`);

  // Drivers
  drivers = () => this.http.get<Driver[]>(`${this.api}/drivers`);
  availableDrivers = (start: string, end: string) =>
    this.http.get<Driver[]>(`${this.api}/drivers/available`, { params: { start, end } });
  saveDriver = (d: Driver) =>
    d.id ? this.http.put<Driver>(`${this.api}/drivers/${d.id}`, d) : this.http.post<Driver>(`${this.api}/drivers`, d);
  deleteDriver = (id: number) => this.http.delete<void>(`${this.api}/drivers/${id}`);

  // Personnel
  personnel = () => this.http.get<Personnel[]>(`${this.api}/personnel`);
  savePersonnel = (p: Personnel) =>
    p.id ? this.http.put<Personnel>(`${this.api}/personnel/${p.id}`, p) : this.http.post<Personnel>(`${this.api}/personnel`, p);
  deletePersonnel = (id: number) => this.http.delete<void>(`${this.api}/personnel/${id}`);

  // Attributions
  attributions = (status = 'ACTIVE'): Observable<Attribution[]> =>
    this.http.get<Attribution[]>(`${this.api}/attributions`, { params: { status } });
  attribution = (id: number) => this.http.get<Attribution>(`${this.api}/attributions/${id}`);
  createAttribution = (r: AttributionRequest) => this.http.post<Attribution>(`${this.api}/attributions`, r);
  completeAttribution = (id: number) => this.http.post<Attribution>(`${this.api}/attributions/${id}/complete`, {});
  cancelAttribution = (id: number) => this.http.post<Attribution>(`${this.api}/attributions/${id}/cancel`, {});
}