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
  isModalOpen: boolean = false;
  isEditMode: boolean = false;
  successMessage: string | null = null;
  // pagination
  currentPage: number = 1;
  totalPages: number = 1;
  totalBrands: number = 0;
  perPage: number = 10;

  constructor(private brandService: BrandService, private fb: FormBuilder) {
    this.brandForm = this.fb.group({
      id: [null],
      name: ['', [Validators.required, Validators.minLength(2)]],
    });
  }

  ngOnInit(): void {
    this.loadBrands(this.currentPage);
  }

  // get all brands
  loadBrands(page: number) {
    // this.brandService.getBrands().subscribe({
    //   next: (brands) => {
    //     console.log('data brands', brands);
    //     this.brands = brands;
    //   },

    //   error: (err) => {
    //     console.log('fetching data brand error: ', err);
    //   },
    // });
    this.brandService.getPaginationBrand(this.currentPage).subscribe({
      next: (response: BrandPagination) => {
        console.log('data brands', response.brands);
        this.brands = response.brands;
        this.brands = response.brands;
        this.currentPage = response.currentPage;
        this.totalPages = response.totalPages;
        this.totalBrands = response.totalBrands;
        this.perPage = response.perPage;
      },
      error: (err) => {
        console.log('fetching data brand error: ', err);
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
            console.log(`Brand with ID ${id} deleted successfully`);
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
