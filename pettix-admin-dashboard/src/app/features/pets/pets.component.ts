import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ManagementService } from '../../core/services/management.service';
import { Pet, PetReport } from '../../core/models/management.models';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { RouterLink, Router } from '@angular/router';
import { ConfirmService } from '../../core/services/confirm.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-pets',
  standalone: true,
  imports: [CommonModule, FormsModule, LoaderComponent, RouterLink],
  template: `
    <div class="space-y-8 animate-fade-in pb-20">
      <!-- Header & Tabs -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
             <i class="fas fa-paw text-primary"></i> 
             Pet Management
          </h1>
          <p class="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1 ml-9">Registry & Moderation</p>
        </div>

        <div class="flex bg-gray-100 p-1.5 rounded-2xl shadow-inner">
           <button (click)="onTabRegistry()" 
                   [class.bg-white]="activeTab() === 'registry'"
                   [class.shadow-md]="activeTab() === 'registry'"
                   [class.text-primary]="activeTab() === 'registry'"
                   class="px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
                   [class.text-gray-400]="activeTab() !== 'registry'">
             <i class="fas fa-list-ul mr-2"></i> Registry
           </button>
           <button (click)="onTabModeration()" 
                   [class.bg-white]="activeTab() === 'moderation'"
                   [class.shadow-md]="activeTab() === 'moderation'"
                   [class.text-red-500]="activeTab() === 'moderation'"
                   class="px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all relative"
                   [class.text-gray-400]="activeTab() !== 'moderation'">
             <i class="fas fa-shield-alt mr-2"></i> Queue
             <span *ngIf="unreadReportsCount() > 0" class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                {{ unreadReportsCount() }}
             </span>
           </button>
        </div>
      </div>

      <!-- Tab: REGISTRY -->
      <div *ngIf="activeTab() === 'registry'" class="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <!-- Search & Filters -->
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div class="flex-1"></div>
          <div class="flex gap-3">
            <div class="relative">
              <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
              <input [(ngModel)]="searchQuery" (ngModelChange)="applyFilters()" 
                     placeholder="Search by name or category..." 
                     class="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 w-72 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm">
            </div>
            <select [(ngModel)]="statusFilter" (ngModelChange)="applyFilters()"
                    class="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm cursor-pointer">
              <option value="all">All Status</option>
              <option value="0">Private</option>
              <option value="1">Available</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
        </div>

        <!-- Registry Grid -->
        <div class="relative min-h-[400px]">
          <app-loader [loading]="loading()" message="Loading pets..."></app-loader>
          
          <div *ngIf="!loading()" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <div *ngFor="let pet of filteredPets(); let i = index" (click)="goToDetails(pet.id)"
                class="card group hover:scale-[1.02] transition-all cursor-pointer relative overflow-hidden p-0 hover:border-primary/20"
                [style.animation-delay.ms]="i * 60"
                style="animation: slideUp 0.5s ease forwards">
              <!-- Image -->
              <div class="h-48 bg-gradient-to-br from-primary/10 to-blue-100 relative overflow-hidden">
                <img [src]="(pet.imageUrls && pet.imageUrls.length > 0) ? pet.imageUrls[0] : 'https://placehold.co/400x400?text=Pet'" 
                    [alt]="pet.name" 
                    class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    (error)="$event.target.src = 'https://placehold.co/400x400?text=Pet'">
                <!-- Status Badge -->
                <div class="absolute top-3 right-3 flex flex-col gap-2 items-end">
                  <span *ngIf="pet.isBlocked" class="bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-lg uppercase tracking-wider animate-pulse">
                    Blocked
                  </span>
                  <span *ngIf="pet.reportsCount > 0" class="bg-orange-500 text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-lg uppercase tracking-wider">
                    <i class="fas fa-flag mr-1"></i> {{pet.reportsCount}} New
                  </span>
                  <span [class]="pet.adoptionStatus === 1 ? 'bg-green-500' : 'bg-gray-500'" 
                        class="text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-lg uppercase tracking-wide">
                    {{pet.adoptionStatus === 1 ? 'Available' : 'Private'}}
                  </span>
                </div>
              </div>
              <!-- Info -->
              <div class="p-5">
                <div class="flex justify-between items-start mb-2">
                  <h3 class="text-lg font-bold text-gray-900 truncate">{{pet.name}}</h3>
                  <span class="text-xs text-gray-400 font-mono">#{{pet.code || pet.id}}</span>
                </div>
                <p class="text-xs text-gray-500 line-clamp-2 mb-4">{{pet.description}}</p>
                
                <div class="flex flex-wrap gap-2 mb-4">
                  <span *ngIf="pet.categoryName" class="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-lg border border-blue-100">{{pet.categoryName}}</span>
                  <span *ngIf="pet.genderName" class="px-2 py-0.5 bg-purple-50 text-purple-600 text-[10px] font-bold rounded-lg border border-purple-100">{{pet.genderName}}</span>
                  <span *ngIf="pet.colorName" class="px-2 py-0.5 bg-orange-50 text-orange-600 text-[10px] font-bold rounded-lg border border-orange-100">{{pet.colorName}}</span>
                  <span class="px-2 py-0.5 bg-gray-50 text-gray-500 text-[10px] font-bold rounded-lg border border-gray-200">{{pet.age}} yrs</span>
                </div>

                <div class="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div class="flex items-center gap-2">
                    <div class="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <i class="fas fa-user text-[8px] text-primary"></i>
                    </div>
                    <span class="text-[11px] text-gray-400 font-medium truncate max-w-[100px]">{{pet.contact?.nameEn || 'Unknown'}}</span>
                  </div>
                  <div class="flex gap-1">
                    <a [routerLink]="['/pets', pet.id]" (click)="$event.stopPropagation()" title="View Profile"
                      class="w-7 h-7 text-gray-400 hover:text-primary transition-all hover:bg-primary/10 rounded-lg flex items-center justify-center">
                      <i class="fas fa-eye text-[10px]"></i>
                    </a>
                    <button (click)="onDelete(pet); $event.stopPropagation()" title="Delete Pet"
                            class="w-7 h-7 text-gray-400 hover:text-red-500 transition-all hover:bg-red-50 rounded-lg flex items-center justify-center">
                      <i class="fas fa-trash text-[10px]"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty Registry -->
          <div *ngIf="!loading() && (!filteredPets() || filteredPets().length === 0)" class="flex justify-center py-20">
            <div class="flex flex-col items-center opacity-40">
              <i class="fas fa-paw text-5xl mb-3"></i>
              <p class="text-sm font-bold text-gray-900">No pets found</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab: MODERATION QUEUE -->
      <div *ngIf="activeTab() === 'moderation'" class="animate-in fade-in slide-in-from-bottom-2 duration-500">
         <div class="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
            <div class="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
               <h3 class="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <i class="fas fa-flag text-red-500"></i>
                  Pending Reports
               </h3>
               <div class="flex items-center gap-3">
                 <button *ngIf="unreadReportsCount() > 0" (click)="markAllAsRead()" 
                         class="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all flex items-center gap-2">
                    <i class="fas fa-check-double text-blue-500"></i> Mark All as Read
                 </button>
                 <button (click)="loadReports()" class="p-2.5 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-all">
                    <i class="fas fa-sync-alt text-gray-400 text-sm"></i>
                 </button>
               </div>
            </div>

            <div class="relative min-h-[400px]">
               <app-loader [loading]="loadingReports()" message="Loading investigation queue..."></app-loader>
               
               <div *ngIf="!loadingReports()">
                  <div *ngIf="reports().length === 0" class="flex flex-col items-center justify-center py-32 opacity-40">
                     <i class="fas fa-check-circle text-5xl mb-4 text-green-500"></i>
                     <p class="font-bold text-lg">No active reports</p>
                  </div>

                   <div *ngIf="reports().length > 0" class="divide-y divide-gray-50">
                      <div *ngFor="let report of reports()" (click)="markAsRead(report)" 
                           class="p-8 hover:bg-gray-50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 relative cursor-pointer group">
                         <!-- Unread Dot -->
                         <div *ngIf="!report.isRead" class="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                         
                         <div class="space-y-3">
                            <div class="flex items-center gap-3">
                               <span class="px-2.5 py-1 bg-red-50 text-red-600 text-[10px] font-black rounded-lg border border-red-100 uppercase tracking-widest">
                                  {{ report.reasonName }}
                               </span>
                               <span class="text-xs text-gray-400 font-medium">
                                  <i class="far fa-clock mr-1"></i> {{ report.creationDate | date:'medium' }}
                               </span>
                            </div>
                            <h4 class="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">
                               {{ report.petName }} 
                               <span class="text-xs text-gray-400 font-normal ml-2">Reported by {{ report.authorName }}</span>
                            </h4>
                            <p *ngIf="report.customReason" class="text-sm text-gray-500 italic max-w-2xl border-l-2 border-gray-200 pl-4 py-1">
                               "{{ report.customReason }}"
                            </p>
                         </div>
                         <div class="flex items-center gap-3">
                            <button (click)="goToDetails(report.petId); $event.stopPropagation()" class="px-5 py-2.5 bg-white border border-gray-200 text-primary rounded-xl text-sm font-bold hover:bg-gray-50 transition-all">
                               Review Pet
                            </button>
                            <button (click)="toggleReportedPetBlock(report); $event.stopPropagation()" class="px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-black transition-all">
                               Block Animal
                            </button>
                         </div>
                      </div>
                   </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class PetsComponent implements OnInit, OnDestroy {
  private mgmt = inject(ManagementService);
  private router = inject(Router);
  private confirm = inject(ConfirmService);
  private toast = inject(ToastService);

  activeTab = signal<'registry' | 'moderation'>('registry');
  pets = signal<Pet[]>([]);
  filteredPets = signal<Pet[]>([]);
  reports = signal<PetReport[]>([]);
  unreadReportsCount = signal<number>(0);
  searchQuery = '';
  statusFilter = 'all';
  loading = signal(true);
  loadingReports = signal(false);

  onTabRegistry() {
    if (this.activeTab() === 'moderation') {
      this.activeTab.set('registry');
      this.refreshPets(); // Refresh to update badges
    }
  }

  onTabModeration() {
    this.activeTab.set('moderation');
    this.loadReports();
  }

  refreshPets() {
    this.loading.set(true);
    this.mgmt.getPets(true).subscribe({
      next: (data) => {
        this.pets.set(data);
        this.applyFilters();
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  goToDetails(id: number) {
    this.router.navigate(['/pets', id]);
  }

  ngOnInit(): void {
    this.loadReports();
    if (this.mgmt.petsCache) {
      const cache = this.mgmt.petsCache;
      this.pets.set(cache.pets);
      this.filteredPets.set(cache.filtered);
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
      this.mgmt.getPets().subscribe({
        next: (data: Pet[]) => {
          this.pets.set(data);
          this.filteredPets.set(data);
          this.loading.set(false);
        },
        error: (_err: any) => { this.loading.set(false); }
      });
    }
  }

  loadReports() {
    this.loadingReports.set(true);
    this.mgmt.getPetReports().subscribe({
      next: (data: PetReport[]) => {
        this.reports.set(data);
        // Count unread reports for the badge
        const unreadCount = data.filter(r => !r.isRead).length;
        this.unreadReportsCount.set(unreadCount);
        this.loadingReports.set(false);
      },
      error: () => this.loadingReports.set(false)
    });
  }

  markAllAsRead() {
    this.mgmt.markAllReportsAsRead().subscribe({
      next: () => {
        this.loadReports();
        this.refreshPets(); // Update pet cards badges
        this.toast.success('All reports marked as read', 'Success');
      },
      error: () => this.toast.error('Failed to mark all as read', 'Error')
    });
  }

  markAsRead(report: PetReport) {
    if (report.isRead) return;
    this.mgmt.markReportAsRead(report.id).subscribe({
      next: () => {
        // Optimistic update
        this.reports.update(reports => 
          reports.map(r => r.id === report.id ? { ...r, isRead: true } : r)
        );
        this.unreadReportsCount.update(c => Math.max(0, c - 1));
        this.refreshPets(); // Update pet cards badges
      }
    });
  }

  ngOnDestroy(): void {
    const mainContainer = document.querySelector('main.overflow-y-auto');
    this.mgmt.petsCache = {
      pets: this.pets(),
      filtered: this.filteredPets(),
      search: this.searchQuery,
      status: this.statusFilter,
      scrollPos: mainContainer ? mainContainer.scrollTop : 0
    };
  }

  applyFilters(): void {
    const filtered = this.pets().filter(p => {
      const matchesSearch = !this.searchQuery ||
        p.name?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        p.categoryName?.toLowerCase().includes(this.searchQuery.toLowerCase());

      const matchesStatus = this.statusFilter === 'all' ||
        (this.statusFilter === 'blocked' ? p.isBlocked : (!p.isBlocked && p.adoptionStatus === Number(this.statusFilter)));

      return matchesSearch && matchesStatus;
    });
    this.filteredPets.set(filtered);
  }

  async onDelete(pet: Pet) {
    const confirmed = await this.confirm.confirm({
      title: 'Delete Pet',
      message: `Are you sure you want to delete "${pet.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      type: 'danger'
    });

    if (confirmed) {
      this.mgmt.deletePet(pet.id).subscribe({
        next: () => {
          this.pets.update(pets => pets.filter(p => p.id !== pet.id));
          this.applyFilters();
          this.toast.success('Pet deleted successfully', 'Success');
        },
        error: () => this.toast.error('Failed to delete pet', 'Error')
      });
    }
  }

  async toggleReportedPetBlock(report: PetReport) {
    const confirmed = await this.confirm.confirm({
      title: 'Block Animal',
      message: `Are you sure you want to block ${report.petName}?`,
      confirmText: 'Block',
      type: 'danger'
    });

    if (confirmed) {
      this.mgmt.togglePetBlock(report.petId, true).subscribe({
        next: () => {
          this.toast.success(`${report.petName} has been blocked`, 'Success');
          this.loadReports();
          this.mgmt.getPets().subscribe(data => {
            this.pets.set(data);
            this.applyFilters();
          });
        },
        error: () => this.toast.error('Failed to block animal', 'Error')
      });
    }
  }
}
