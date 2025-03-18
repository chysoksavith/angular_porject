import { Component, OnInit } from '@angular/core';
import { Brand } from '../model/brand.type';
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

  constructor(private brandService: BrandService, private fb: FormBuilder) {
    this.brandForm = this.fb.group({
      id: [null],
      name: ['', [Validators.required, Validators.minLength(2)]],
    });
  }

  ngOnInit(): void {
    this.loadBrands();
  }

  // get all brands
  loadBrands() {
    this.brandService.getBrands().subscribe({
      next: (brands) => {
        console.log('data brands', brands);
        this.brands = brands;
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
          this.loadBrands();
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
          this.loadBrands();
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
  // 
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
