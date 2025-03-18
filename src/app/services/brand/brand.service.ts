import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Brand, BrandPagination } from '../../model/brand.type';

@Injectable({
  providedIn: 'root',
})
export class BrandService {
  private apiUrl = 'http://localhost:5000/api/brands';
  constructor(private http: HttpClient) {}

  getBrands(page: number): Observable<Brand[]> {
    console.log('Fetching brands from:', `${this.apiUrl}?page=${page}`);

    return this.http
      .get<BrandPagination>(`${this.apiUrl}?=page=${page}`)
      .pipe(map((response) => response.brands));
  }
  getPaginationBrand(page: number = 1): Observable<BrandPagination> {
    const url = `${this.apiUrl}?page=${page}`; // Correctly construct URL
    console.log('Fetching brands from:', url); // Log the exact URL for debugging
    return this.http.get<BrandPagination>(url); // Use the constructed URL
  }
  getBrandById(id: number): Observable<Brand> {
    return this.http.get<Brand>(`${this.apiUrl}/${id}`);
  }
  createBrand(brand: Brand): Observable<Brand> {
    return this.http.post<Brand>(this.apiUrl.toString(), brand);
  }
  updateBrand(id: number, brand: Brand): Observable<Brand> {
    return this.http.put<Brand>(`${this.apiUrl}/${id}`, brand);
  }
  deleteBrand(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
