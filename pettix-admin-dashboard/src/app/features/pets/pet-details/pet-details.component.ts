import { Component, OnInit, inject, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ManagementService } from '../../../core/services/management.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { Pet } from '../../../core/models/management.models';

type Tab = 'overview' | 'health' | 'ownership' | 'forms' | 'reports';

@Component({
  selector: 'app-pet-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pet-details.component.html',
  styles: [`
    .nav-tab {
      position: relative;
      transition: all 0.3s ease;
      @apply text-gray-400 font-medium text-sm py-4 px-2 cursor-pointer;
    }
    .nav-tab.active {
      @apply text-primary font-bold;
    }
    .nav-tab.active::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 0;
      width: 100%;
      height: 2px;
      @apply bg-primary rounded-t-full;
    }
  `]
})
export class PetDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private managementService = inject(ManagementService);
  private cdr = inject(ChangeDetectorRef);
  private sanitizer = inject(DomSanitizer);
  private toast = inject(ToastService);
  private confirm = inject(ConfirmService);

  petId: number = 0;
  pet = signal<Pet | null>(null);

  private router = inject(Router);

  goToUser(userId: number | undefined) {
    if (userId) {
      this.router.navigate(['/users', userId], { 
        state: { returnUrl: this.router.url } 
      });
    }
  }
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  activeTab = signal<Tab>('overview');
  reports = signal<any[]>([]);
  reportsLoading = signal<boolean>(false);

  goBack() {
    this.router.navigate(['/pets']);
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.petId = +id;
        this.loadPetDetails();
      } else {
        this.error.set('Invalid Pet ID');
        this.loading.set(false);
      }
    });
  }

  loadPetDetails() {
    this.loading.set(true);
    this.managementService.getPetById(this.petId).subscribe({
      next: (data) => {
        this.pet.set(data);
        this.loading.set(false);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load pet details', err);
        this.error.set('Failed to load pet data');
        this.loading.set(false);
        this.cdr.detectChanges();
      }
    });
  }

  setTab(tab: Tab) {
    this.activeTab.set(tab);
    if (tab === 'reports') {
      this.loadReports();
      // Also refresh pet details to update the reportsCount badge
      this.loadPetDetails();
    }
  }

  loadReports() {
    this.reportsLoading.set(true);
    this.managementService.getReportsForPet(this.petId).subscribe({
      next: (data) => {
        this.reports.set(data);
        this.reportsLoading.set(false);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load pet reports', err);
        this.reportsLoading.set(false);
        this.cdr.detectChanges();
      }
    });
  }

  markReportAsRead(report: any) {
    if (report.isRead) return;
    this.managementService.markReportAsRead(report.id).subscribe({
      next: () => {
        this.reports.update(reports => 
          reports.map(r => r.id === report.id ? { ...r, isRead: true } : r)
        );
        this.loadPetDetails();
      }
    });
  }

  async toggleBlock() {
    const currentPet = this.pet();
    if (!currentPet) return;

    const isBlocked = !!currentPet.isBlocked;
    const action = isBlocked ? 'unblock' : 'block';

    const confirmed = await this.confirm.confirm({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} Animal`,
      message: `Are you sure you want to ${action} this animal? ${isBlocked ? 'It will become visible again in the app.' : 'It will be hidden from all users.'}`,
      confirmText: `Yes, ${action}`,
      type: isBlocked ? 'warning' : 'danger'
    });

    if (confirmed) {
      this.managementService.togglePetBlock(this.petId, !isBlocked).subscribe({
        next: () => {
          this.toast.success(`Animal has been ${isBlocked ? 'unblocked' : 'blocked'} successfully`, 'Action Successful');
          this.loadPetDetails(); // Reload to refresh the IsBlocked status
        },
        error: (err) => {
          console.error(`Failed to ${action} pet`, err);
          this.toast.error(`Failed to ${action} animal. Please try again.`, 'Error');
        }
      });
    }
  }


  getStatusClass(status: number): string {
    switch (status) {
      case 0: return 'bg-gray-100 text-gray-700'; // Private
      case 1: return 'bg-green-100 text-green-700'; // Available
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  getStatusName(status: number): string {
    // Based on PetAdoptionStatus Enum in EnumTypes.cs
    switch (status) {
      case 0: return 'Private';
      case 1: return 'Available';
      default: return 'Private';
    }
  }

  getMapUrl(location?: string | null): SafeResourceUrl {
    const query = location ? encodeURIComponent(location) : 'Cairo,Egypt';
    return this.sanitizer.bypassSecurityTrustResourceUrl(`https://maps.google.com/maps?q=${query}&t=&z=13&ie=UTF8&iwloc=&output=embed`);
  }
}
