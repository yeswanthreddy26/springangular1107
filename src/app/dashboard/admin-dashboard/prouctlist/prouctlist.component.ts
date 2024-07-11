import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterOutlet, ActivatedRoute, Router } from '@angular/router';
import { ProductServicesService, Product } from '../../../services/product-services.service';

@Component({
  selector: 'app-prouctlist',
  standalone: true,
  imports: [
    RouterOutlet,
    MatButton,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatToolbarModule,
    MatIconModule,
    MatIconButton,
    CommonModule,
    FormsModule,
    FormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './prouctlist.component.html',
  styleUrl: './prouctlist.component.scss'
})
export class ProductListComponent implements OnInit {
  @ViewChild('nameInput') nameInput: ElementRef | undefined;

  products: Product[] = [];

  subcategoryId!: number;
  newProduct: NewProduct = {
    name: '',
    description: '',
    subcategoryId: 0, 
    price: 0,
    imageUrl: '',
    stock: 0,
    brand: '',
    model: '',
    size: '',
    rating: 0
  };

  editingProduct: Product | null = null;

  showAddProductForm: boolean = false;

  constructor(
    private productService: ProductServicesService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const subcategoryIdStr = params.get('subcategoryId'); 
      if (subcategoryIdStr !== null) {
        this.subcategoryId = +subcategoryIdStr;
        this.getProductsBySubcategoryId(this.subcategoryId); 
      } else {
        this.getAllProducts();
      }
    });
  }

  getAllProducts(): void {
    this.productService.getAllProducts().subscribe(
      (products: Product[]) => this.products = products,
      error => console.error('Error fetching products:', error)
    );
  }

  getProductsBySubcategoryId(subcategoryId: number): void { 
    this.productService.getProductsBySubcategoryId(subcategoryId).subscribe(
      (products: Product[]) => this.products = products,
      (      error: any) => console.error('Error fetching products by subcategory:', error)
    );
  }

  toggleAddProductForm(): void {
    this.showAddProductForm = !this.showAddProductForm;
  }

  focusOnAddProductForm(): void {
    if (this.nameInput && this.nameInput.nativeElement) {
      this.nameInput.nativeElement.focus();
    }
  }

  addNewProduct(): void {
    this.newProduct.subcategoryId = this.subcategoryId;  // Ensure subcategoryId is set
    this.productService.createAllProducts(this.subcategoryId, this.newProduct).subscribe(
      (newProduct: Product) => {
        this.products.push(newProduct);
        console.log('New product added:', newProduct);
        this.resetForm();
      },
      error => {
        console.error('Error adding product:', error);
      }
    );
  }

  resetForm(): void {
    this.newProduct = {
      name: '',
      description: '',
      subcategoryId: 0,
      price: 0,
      imageUrl: '',
      stock: 0,
      brand: '',
      model: '',
      size: '',
      rating: 0
    };
  }

  editProduct(product: Product): void {
    this.editingProduct = { ...product };
  }

  updateProduct(): void {
    if (this.editingProduct) {
      this.productService.editProduct(this.editingProduct.id, this.editingProduct).subscribe(
        (updatedProduct: Product) => {
          const index = this.products.findIndex(p => p.id === updatedProduct.id);
          if (index !== -1) {
            this.products[index] = updatedProduct;
            console.log('Product updated successfully:', updatedProduct);
          } else {
            console.error('Error: Edited product not found in local array');
          }
          this.editingProduct = null;
        },
        error => {
          console.error('Error updating product:', error);
          this.editingProduct = null;
        }
      );
    }
  }

  deleteProduct(productId: number): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(productId).subscribe(() => {
        this.products = this.products.filter(p => p.id !== productId);
        console.log('Product deleted successfully:', productId);
      }, error => {
        console.error('Error deleting product:', error);
      });
    }
  }
}

export interface NewProduct {
  subcategoryId: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
  brand: string;
  model: string;
  size: string;
  rating: number;
}