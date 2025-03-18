import { Component, OnInit } from '@angular/core';
import { Brand, BrandPagination } from '../model/brand.type';
import { BrandService } from '../services/brand/brand.service';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';
import {
  NavigationStart,
  Router,
  NavigationEnd,
  NavigationError,
  NavigationCancel,
} from '@angular/router';

@Component({
  selector: 'app-brand',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './brand.component.html',
  styleUrl: './brand.component.css',
  standalone: true,
})
export class BrandComponent implements OnInit {
  brands: Brand[] = [];
  brandForm: FormGroup;
  searchForm: FormGroup;
  isModalOpen: boolean = false;
  isEditMode: boolean = false;
  successMessage: string | null = null;
  // pagination
  currentPage: number = 1;
  totalPages: number = 1;
  totalBrands: number = 0;
  perPage: number = 10;

  // filter date and search
  noData: boolean = false;
  // loading
  loading: boolean = false;
  private routerSubscription: Subscription | undefined;
  constructor(
    private brandService: BrandService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.brandForm = this.fb.group({
      id: [null],
      name: ['', [Validators.required, Validators.minLength(2)]],
    });
    this.searchForm = this.fb.group({
      search: [''],
      date: [''],
    });
  }

  ngOnInit(): void {
    this.loadBrands(this.currentPage);
    // Subscribe to form changes for real-time search
    this.searchForm.valueChanges.subscribe(() => {
      this.currentPage = 1; // Reset to page 1 on filter change
      this.loadBrands(this.currentPage);

      // loading
      this.routerSubscription = this.router.events.subscribe((event) => {
        if (event instanceof NavigationStart) {
          this.loading = true;
        } else if (
          event instanceof NavigationEnd ||
          event instanceof NavigationError ||
          event instanceof NavigationCancel
        ) {
          this.loading = false;
          this.loadBrands(this.currentPage);
        }
      });
    });
  }
  // destroy prevent memory leak
  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
  loadBrands(page: number) {
    const search = this.searchForm.value.search || '';
    const date = this.searchForm.value.date || '';
    this.brandService.getPaginationBrand(page, search, date).subscribe({
      next: (response: BrandPagination) => {
        this.brands = response.brands; 
        this.currentPage = response.currentPage;
        this.totalPages = response.totalPages;
        this.totalBrands = response.totalBrands;
        this.perPage = response.perPage;
        this.noData = this.brands.length === 0;
      },
      error: (err) => {
        console.log('fetching data brand error: ', err);
        this.noData = true;
      },
    });
  }

  // onSave Brand
  onSaveBrand() {
    if (this.brandForm.invalid) {
      console.log('Form is invalid:', this.brandForm.errors);
      this.brandForm.markAllAsTouched();
      return;
    }
    const brandData: Brand = this.brandForm.value;

    if (this.isEditMode && this.brandForm.value) {
      this.brandService.updateBrand(brandData.id, brandData).subscribe({
        next: (updateBrand) => {
          this.loadBrands(this.currentPage);
          this.closeModal();
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Brand updated successfully!',
            timer: 2000, // Auto-close after 2 seconds
            showConfirmButton: false,
          });
        },
        error: (err) => console.error('Error updating brand:', err),
      });
    } else {
      this.brandService.createBrand(brandData).subscribe({
        next: (newBrand) => {
          this.loadBrands(this.currentPage);
          this.closeModal();
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Brand created successfully!',
            timer: 2000, // Auto-close after 2 seconds
            showConfirmButton: false,
          });
        },
        error: (err) => console.error('Error creating brand:', err),
      });
    }
  }
  // delete brand
  brandDelete(id: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.brandService.deleteBrand(id).subscribe({
          next: () => {
            this.loadBrands(this.currentPage);
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Brand has been deleted.',
              timer: 2000,
              showConfirmButton: false,
            });
          },
          error: (err) => {
            console.error('Error deleting brand:', err);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Failed to delete brand.',
            });
          },
        });
      }
    });
  }
  // search
  resetFilter() {
    this.searchForm.reset();
    this.currentPage = 1;
    this.loadBrands(this.currentPage); // Reload after reset
  }

  // pagination method
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadBrands(page);
    }
  }
  nextPage() {
    this.goToPage(this.currentPage + 1);
  }

  previousPage() {
    this.goToPage(this.currentPage - 1);
  }
  getPaginationRange(): number[] {
    const range = [];
    for (let i = 1; i <= this.totalPages; i++) {
      range.push(i);
    }
    return range;
  }
  // open modal
  openCreateModal() {
    this.brandForm.reset({ name: '' });
    this.isEditMode = false;
    this.isModalOpen = true;
    console.log('open modal');
  }

  openEditMode(brand: Brand) {
    this.brandForm.patchValue(brand);
    this.isEditMode = true;
    this.isModalOpen = true;
    console.log('Opening edit modal for brand:', brand);
  }

  closeModal() {
    this.isModalOpen = false;
    this.brandForm.reset();
  }
  // format date  // Method to format the created_at date
  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  get nameControl() {
    return this.brandForm.get('name');
  }
}
