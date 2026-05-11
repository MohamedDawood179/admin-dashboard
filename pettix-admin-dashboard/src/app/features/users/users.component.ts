import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ManagementService } from '../../core/services/management.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmService } from '../../core/services/confirm.service';
import { Contact } from '../../core/models/management.models';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { APP_ROUTES } from '../../core/constants/app-routes';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, LoaderComponent],
  template: `
    <div class="space-y-8 animate-fade-in">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 tracking-tight">User Management</h1>
          <p class="text-gray-500 mt-1 uppercase text-xs font-bold tracking-widest">{{filteredContacts().length}} accounts registered</p>
        </div>
        <div class="flex gap-3">
          <div class="relative">
            <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
            <input [(ngModel)]="searchQuery" (ngModelChange)="filterContacts()" 
                   placeholder="Search by name or email..." 
                   class="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 w-72 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm">
          </div>
          <select [(ngModel)]="statusFilter" (ngModelChange)="filterContacts()"
                  class="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm cursor-pointer">
            <option value="all">All Status</option>
            <option value="1">Active</option>
            <option value="2">Inactive</option>
            <option value="3">Frozen</option>
          </select>
        </div>
      </div>

      <!-- Users Table -->
      <div class="card overflow-hidden relative min-h-[400px]">
        <app-loader [loading]="loading()" message="Loading users..."></app-loader>
        <div class="overflow-x-auto -mx-6 -mb-6">
          <table class="w-full border-collapse">
            <thead>
              <tr class="text-left bg-gray-50/80">
                <th class="px-8 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">User</th>
                <th class="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Email</th>
                <th class="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Phone</th>
                <th class="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th class="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Age</th>
                <th class="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr *ngFor="let contact of filteredContacts(); let i = index" 
                  class="hover:bg-blue-50/50 transition-colors group"
                  [style.animation-delay.ms]="i * 50"
                  style="animation: slideIn 0.4s ease forwards">
                <td class="px-8 py-5 whitespace-nowrap cursor-pointer group/user" (click)="goToDetails(contact.id)">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 shadow-sm border border-gray-100 bg-gray-50 group-hover/user:border-primary transition-colors">
                      <img [src]="contact.avatar || 'https://ui-avatars.com/api/?name=' + (contact.nameEn || contact.nameAr || 'U')" 
                           class="w-full h-full object-cover"
                           (error)="$event.target.src = 'https://ui-avatars.com/api/?name=U'">
                    </div>
                    <div>
                      <p class="text-sm font-bold text-gray-900 group-hover/user:text-primary transition-colors">{{contact.nameEn || contact.nameAr || 'No Name'}}</p>
                      <p *ngIf="contact.nameAr && contact.nameEn" class="text-[10px] text-gray-400 font-medium">{{contact.nameAr}}</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-5">
                  <span class="text-sm text-gray-600">{{contact.email || '—'}}</span>
                </td>
                <td class="px-6 py-5">
                  <span class="text-sm text-gray-600 font-mono">{{contact.phone || '—'}}</span>
                </td>
                <td class="px-6 py-5">
                  <span [class]="getStatusClass(contact.statusId)" class="px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wide border">
                    {{getStatusLabel(contact.statusId)}}
                  </span>
                </td>
                <td class="px-6 py-5">
                  <span class="text-sm text-gray-500">{{contact.age || '—'}}</span>
                </td>
                <td class="px-6 py-5 text-right space-x-1">
                  <button (click)="goToDetails(contact.id)" class="w-8 h-8 text-gray-400 hover:text-primary transition-all hover:bg-white hover:shadow-sm rounded-lg" title="View Details">
                    <i class="fas fa-eye text-xs"></i>
                  </button>
                  <button (click)="onDelete(contact); $event.stopPropagation()" class="w-8 h-8 text-gray-400 hover:text-red-500 transition-all hover:bg-white hover:shadow-sm rounded-lg" title="Delete User">
                    <i class="fas fa-trash text-xs"></i>
                  </button>
                </td>
              </tr>


              <!-- Empty State -->
              <tr *ngIf="filteredContacts().length === 0 && !loading()">
                <td colspan="6" class="px-8 py-16 text-center">
                  <div class="flex flex-col items-center opacity-40">
                    <i class="fas fa-users text-5xl mb-3"></i>
                    <p class="text-sm font-bold text-gray-900">No users found</p>
                    <p class="text-xs text-gray-500 mt-1">Try adjusting your search or filters</p>
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
export class UsersComponent implements OnInit, OnDestroy {
  private mgmt = inject(ManagementService);
  private router = inject(Router);
  private toast = inject(ToastService);
  private confirm = inject(ConfirmService);

  contacts = signal<Contact[]>([]);
  filteredContacts = signal<Contact[]>([]);
  searchQuery = '';
  statusFilter = 'all';
  loading = signal(true);

  goToDetails(id: number) {
    this.router.navigate(['/users', id]);
  }

  ngOnInit(): void {
    if (this.mgmt.usersCache) {
      const cache = this.mgmt.usersCache;
      this.contacts.set(cache.contacts);
      this.filteredContacts.set(cache.filtered);
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
      this.mgmt.getContacts().subscribe({
        next: (data: Contact[]) => {
          this.contacts.set(data);
          this.filteredContacts.set(data);
          this.loading.set(false);
        },
        error: (_err: any) => { this.loading.set(false); }
      });
    }
  }

  ngOnDestroy(): void {
    const mainContainer = document.querySelector('main.overflow-y-auto');
    this.mgmt.usersCache = {
      contacts: this.contacts(),
      filtered: this.filteredContacts(),
      search: this.searchQuery,
      status: this.statusFilter,
      scrollPos: mainContainer ? mainContainer.scrollTop : 0
    };
  }

  filterContacts(): void {
    const filtered = this.contacts().filter(c => {
      const matchesSearch = !this.searchQuery || 
        (c.nameEn?.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (c.nameAr?.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (c.email?.toLowerCase().includes(this.searchQuery.toLowerCase()));
      
      const matchesStatus = this.statusFilter === 'all' || 
        c.statusId === Number(this.statusFilter);

      return matchesSearch && matchesStatus;
    });
    this.filteredContacts.set(filtered);
  }

  getStatusLabel(statusId: number | null): string {
    switch (statusId) {
      case 1: return 'Active';
      case 2: return 'Inactive';
      case 3: return 'Frozen';
      case 4: return 'Blocked';
      case 5: return 'Deleted';
      default: return 'Unknown';
    }
  }

  getStatusClass(statusId: number | null): string {
    switch (statusId) {
      case 1: return 'bg-green-50 text-green-600 border-green-100';
      case 2: return 'bg-gray-50 text-gray-500 border-gray-200';
      case 3: return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 4: return 'bg-red-50 text-red-500 border-red-100';
      case 5: return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-500 border-gray-200';
    }
  }

  async onDelete(contact: Contact): Promise<void> {
    const isConfirmed = await this.confirm.confirm({
      title: 'Delete User',
      message: `Are you sure you want to delete ${contact.nameEn || contact.nameAr}? This action cannot be undone.`,
      confirmText: 'Yes, Delete',
      type: 'danger'
    });

    if (isConfirmed) {
      this.mgmt.deleteContact(contact.id).subscribe({
        next: (_res: any) => {
          this.contacts.update(contacts => contacts.filter(c => c.id !== contact.id));
          this.filterContacts();
          this.toast.success(`User "${contact.nameEn || contact.nameAr}" has been deleted.`, 'User Deleted');
        },
        error: (err) => {
          this.toast.error('Failed to delete user. Please try again.', 'Error');
        }
      });
    }
  }
}
