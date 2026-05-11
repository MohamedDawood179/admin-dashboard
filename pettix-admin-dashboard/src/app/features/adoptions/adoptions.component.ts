import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ManagementService } from '../../core/services/management.service';
import { AdoptionForm } from '../../core/models/management.models';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-adoptions',
  standalone: true,
  imports: [CommonModule, FormsModule, LoaderComponent],
  template: `
    <div class="space-y-8 animate-fade-in">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 tracking-tight">Adoption Requests</h1>
          <p class="text-gray-500 mt-1 uppercase text-xs font-bold tracking-widest">{{filteredAdoptions().length}} applications</p>
        </div>
        <div class="flex gap-3">
          <div class="relative">
            <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
            <input [(ngModel)]="searchQuery" (ngModelChange)="applyFilters()" 
                   placeholder="Search by name or pet..." 
                   class="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 w-72 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm">
          </div>
          <select [(ngModel)]="statusFilter" (ngModelChange)="applyFilters()"
                  class="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm cursor-pointer">
            <option value="all">All Status</option>
            <option value="1">Pending</option>
            <option value="2">Approved</option>
            <option value="3">Rejected</option>
            <option value="4">Cancelled</option>
          </select>
        </div>
      </div>

      <!-- Stats Summary -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="card text-center py-4">
          <p class="text-2xl font-bold text-yellow-500">{{getCount(1)}}</p>
          <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Pending</p>
        </div>
        <div class="card text-center py-4">
          <p class="text-2xl font-bold text-green-500">{{getCount(2)}}</p>
          <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Approved</p>
        </div>
        <div class="card text-center py-4">
          <p class="text-2xl font-bold text-red-500">{{getCount(3)}}</p>
          <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Rejected</p>
        </div>
        <div class="card text-center py-4">
          <p class="text-2xl font-bold text-gray-400">{{getCount(4)}}</p>
          <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Cancelled</p>
        </div>
      </div>

      <!-- Adoptions Table -->
      <div class="card overflow-hidden relative min-h-[400px]">
        <app-loader [loading]="loading()" message="Loading applications..."></app-loader>
        <div class="overflow-x-auto -mx-6 -mb-6">
          <table class="w-full border-collapse">
            <thead>
              <tr class="text-left bg-gray-50/80">
                <th class="px-8 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Applicant</th>
                <th class="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Pet</th>
                <th class="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Contact</th>
                <th class="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Experience</th>
                <th class="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th class="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr *ngFor="let adoption of filteredAdoptions(); let i = index" (click)="goToPet(adoption.petId)"
                  class="hover:bg-blue-50/50 transition-colors group cursor-pointer hover:border-primary/20 cursor-pointer"
                  [style.animation-delay.ms]="i * 50"
                  style="animation: slideIn 0.4s ease forwards">
                <td class="px-8 py-5 whitespace-nowrap">
                  <div>
                    <p class="text-sm font-bold text-gray-900">{{adoption.fullName}}</p>
                    <p class="text-[10px] text-gray-400">{{adoption.email}}</p>
                  </div>
                </td>
                <td class="px-6 py-5">
                  <span class="px-2.5 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-lg border border-blue-100">
                    <i class="fas fa-paw mr-1"></i>{{adoption.petName || 'Pet #' + adoption.petId}}
                  </span>
                </td>
                <td class="px-6 py-5">
                  <p class="text-xs text-gray-500">{{adoption.phoneNumber}}</p>
                  <p class="text-[10px] text-gray-400">{{adoption.livingSituation || '—'}}</p>
                </td>
                <td class="px-6 py-5">
                  <span [class]="adoption.hasOwnedOrCaredForPetBefore ? 'text-green-500' : 'text-gray-400'">
                    <i [class]="adoption.hasOwnedOrCaredForPetBefore ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
                    <span class="text-xs ml-1 font-medium">{{adoption.hasOwnedOrCaredForPetBefore ? 'Experienced' : 'First-time'}}</span>
                  </span>
                </td>
                <td class="px-6 py-5">
                  <span [class]="getStatusClass(adoption.status)" class="px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wide border">
                    {{getStatusLabel(adoption.status)}}
                  </span>
                </td>
                <td class="px-6 py-5 text-right space-x-1">
                  <button (click)="goToPet(adoption.petId); $event.stopPropagation()" class="w-8 h-8 text-gray-400 hover:text-primary transition-all hover:bg-white hover:shadow-sm rounded-lg" title="View Details">
                    <i class="fas fa-eye text-xs"></i>
                  </button>
                </td>
              </tr>

              <tr *ngIf="filteredAdoptions().length === 0 && !loading()">
                <td colspan="6" class="px-8 py-16 text-center">
                  <div class="flex flex-col items-center opacity-40">
                    <i class="fas fa-heart text-5xl mb-3"></i>
                    <p class="text-sm font-bold text-gray-900">No adoption requests found</p>
                  </div>
                </td>
              </tr>

              <!-- Empty state handled by base view -->
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
  `]
})
export class AdoptionsComponent implements OnInit, OnDestroy {
  private mgmt = inject(ManagementService);
  private router = inject(Router);

  adoptions = signal<AdoptionForm[]>([]);
  filteredAdoptions = signal<AdoptionForm[]>([]);
  searchQuery = '';
  statusFilter = 'all';
  loading = signal(true);

  goToPet(petId: number | undefined): void {
    if (petId) this.router.navigate(['/pets', petId]);
  }

  ngOnInit(): void {
    if (this.mgmt.adoptionsCache) {
      const cache = this.mgmt.adoptionsCache;
      this.adoptions.set(cache.adoptions);
      this.filteredAdoptions.set(cache.filtered);
      this.searchQuery = cache.search;
      this.statusFilter = cache.status;
      this.loading.set(false);

      setTimeout(() => {
        const mainContainer = document.querySelector('main.overflow-y-auto');
        if (mainContainer) {
          mainContainer.scrollTop = cache.scrollPos;
        }
      }, 0);
    } else {
      this.mgmt.getAdoptions().subscribe({
        next: (data: AdoptionForm[]) => {
          this.adoptions.set(data);
          this.filteredAdoptions.set(data);
          this.loading.set(false);
        },
        error: (_err: any) => { this.loading.set(false); }
      });
    }
  }

  ngOnDestroy(): void {
    const mainContainer = document.querySelector('main.overflow-y-auto');
    this.mgmt.adoptionsCache = {
      adoptions: this.adoptions(),
      filtered: this.filteredAdoptions(),
      search: this.searchQuery,
      status: this.statusFilter,
      scrollPos: mainContainer ? mainContainer.scrollTop : 0
    };
  }

  applyFilters(): void {
    const filtered = this.adoptions().filter(a => {
      const matchesSearch = !this.searchQuery ||
        a.fullName?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        a.petName?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        a.email?.toLowerCase().includes(this.searchQuery.toLowerCase());

      const matchesStatus = this.statusFilter === 'all' ||
        a.status === Number(this.statusFilter);

      return matchesSearch && matchesStatus;
    });
    this.filteredAdoptions.set(filtered);
  }

  getCount(status: number): number {
    return this.adoptions().filter(a => a.status === status).length;
  }

  getStatusLabel(status: number): string {
    switch (status) {
      case 1: return 'Pending';
      case 2: return 'Approved';
      case 3: return 'Rejected';
      case 4: return 'Cancelled';
      default: return 'Unknown';
    }
  }

  getStatusClass(status: number): string {
    switch (status) {
      case 1: return 'bg-yellow-50 text-yellow-600 border-yellow-200';
      case 2: return 'bg-green-50 text-green-600 border-green-100';
      case 3: return 'bg-red-50 text-red-500 border-red-100';
      case 4: return 'bg-gray-50 text-gray-400 border-gray-200';
      default: return 'bg-gray-50 text-gray-400 border-gray-200';
    }
  }

}
