import { Component, OnInit, inject, signal, computed, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { ManagementService } from '../../../core/services/management.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { UserProfileOverview } from '../../../core/models/dashboard.models';

type Tab = 'overview' | 'pets' | 'timeline' | 'adoptions' | 'moderation';

@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-details.component.html',
  styles: [`
    .nav-tab {
      position: relative;
      transition: all 0.3s ease;
      @apply text-gray-400 font-medium text-sm py-4 px-2;
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
export class UserDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private userService = inject(UserService);
  private cdr = inject(ChangeDetectorRef);
  private sanitizer = inject(DomSanitizer);
  private toast = inject(ToastService);
  private confirm = inject(ConfirmService);

  userId: number = 0;
  profile: UserProfileOverview | null = null;
  private mgmt = inject(ManagementService);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  activeTab = signal<Tab>('overview');
  tabLoading = signal<boolean>(false);

  // Tab Data Signals
  pets = signal<any[]>([]);
  posts = signal<any[]>([]);
  comments = signal<any[]>([]);
  adoptions = signal<any[]>([]);
  ownerAdoptions = signal<any[]>([]);
  reports = signal<any[]>([]);
  likes = signal<any[]>([]);
  activeTimelineView = signal<'posts' | 'comments' | 'likes'>('posts');
  activeAdoptionView = signal<'clients' | 'owners'>('clients');

  goToPet(petId: number | undefined) {
    if (petId) this.router.navigate(['/pets', petId]);
  }

  goToPost(postId: number | undefined) {
    if (postId) this.router.navigate(['/timeline', postId]);
  }

  goBack() {
    const returnUrl = (this.location.getState() as any)?.returnUrl;
    if (returnUrl) {
      this.router.navigateByUrl(returnUrl);
    } else if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/users']);
    }
  }

  async updateStatus(statusId: number, statusLabel: string): Promise<void> {
    if (!this.profile) return;

    const isConfirmed = await this.confirm.confirm({
      title: 'Update User Status',
      message: `Are you sure you want to change the status of this user to ${statusLabel}?`,
      confirmText: `Yes, ${statusLabel}`,
      type: statusId === 5 ? 'danger' : 'warning'
    });

    if (isConfirmed) {
      this.mgmt.updateContactStatus(this.userId, statusId).subscribe({
        next: () => {
          if (this.profile) {
            this.profile.statusId = statusId;
          }
          this.toast.success(`User status updated to ${statusLabel} successfully`, 'Status Updated');
          if (statusId === 5) {
            this.goBack();
          } else {
            this.loadProfile(true);
          }
        },
        error: (err) => {
          console.error('Failed to change status', err);
          this.toast.error('Failed to update user status. Please try again.', 'System Error');
        }
      });
    }
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.userId = +id;
        this.loadProfile();
      } else {
        this.error.set('Invalid User ID');
        this.loading.set(false);
      }
    });
  }

  loadProfile(forceRefresh = false) {
    this.loading.set(true);
    // Check Cache First
    if (forceRefresh) {
      delete this.userService.userProfileCache[this.userId];
      delete this.userService.userPetsCache[this.userId];
      delete this.userService.userPostsCache[this.userId];
      delete this.userService.userCommentsCache[this.userId];
      delete this.userService.userClientFormsCache[this.userId];
      delete this.userService.userOwnerFormsCache[this.userId];
      delete this.userService.userReportsCache[this.userId];
      delete this.userService.userLikesCache[this.userId];
    } else if (this.userService.userProfileCache[this.userId]) {
      this.profile = this.userService.userProfileCache[this.userId];
      this.loading.set(false);
      return;
    }

    this.userService.getUserProfile(this.userId).subscribe({
      next: (data) => {
        this.profile = data;
        this.userService.userProfileCache[this.userId] = data; // Set Cache
        this.loading.set(false);
        this.preloadTabData();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load user profile', err);
        this.error.set('Failed to load user data');
        this.loading.set(false);
        this.cdr.detectChanges();
      }
    });
  }

  setTab(tab: Tab) {
    this.activeTab.set(tab);
    if (tab === 'overview') return;

    // Initial data load for the tab
    if (tab === 'pets') this.loadPets();
    if (tab === 'timeline') this.setTimelineView(this.activeTimelineView());
    if (tab === 'adoptions') this.setAdoptionView(this.activeAdoptionView());
    if (tab === 'moderation') this.loadReports();
  }

  setTimelineView(view: 'posts' | 'comments' | 'likes') {
    this.activeTimelineView.set(view);
    if (view === 'posts') this.loadPosts();
    else if (view === 'comments') this.loadComments();
    else this.loadLikes();
  }

  setAdoptionView(view: 'clients' | 'owners') {
    this.activeAdoptionView.set(view);
    if (view === 'clients') this.loadClientForms();
    else this.loadOwnerForms();
  }

  private loadPets() {
    if (this.userService.userPetsCache[this.userId]) {
      this.pets.set(this.userService.userPetsCache[this.userId]);
      return;
    }
    this.tabLoading.set(true);
    this.userService.getUserPets(this.userId).subscribe({
      next: (res) => {
        const data = res.data || res || [];
        this.pets.set(data);
        this.userService.userPetsCache[this.userId] = data;
        this.tabLoading.set(false);
        this.cdr.detectChanges();
      },
      error: () => this.tabLoading.set(false)
    });
  }

  private loadPosts() {
    if (this.userService.userPostsCache[this.userId]) {
      this.posts.set(this.userService.userPostsCache[this.userId]);
      return;
    }
    this.tabLoading.set(true);
    this.userService.getUserPosts(this.userId).subscribe({
      next: (res) => {
        const data = res.data || res || [];
        this.posts.set(data);
        this.userService.userPostsCache[this.userId] = data;
        this.tabLoading.set(false);
        this.cdr.detectChanges();
      },
      error: () => this.tabLoading.set(false)
    });
  }

  private loadComments() {
    if (this.userService.userCommentsCache[this.userId]) {
      this.comments.set(this.userService.userCommentsCache[this.userId]);
      return;
    }
    this.tabLoading.set(true);
    this.userService.getUserComments(this.userId).subscribe({
      next: (res) => {
        const data = res.data || res || [];
        this.comments.set(data);
        this.userService.userCommentsCache[this.userId] = data;
        this.tabLoading.set(false);
        this.cdr.detectChanges();
      },
      error: () => this.tabLoading.set(false)
    });
  }

  private loadClientForms() {
    if (this.userService.userClientFormsCache[this.userId]) {
      this.adoptions.set(this.userService.userClientFormsCache[this.userId]);
      return;
    }
    this.tabLoading.set(true);
    this.userService.getUserClientForms(this.userId).subscribe({
      next: (res) => {
        const data = res.data || res || [];
        this.adoptions.set(data);
        this.userService.userClientFormsCache[this.userId] = data;
        this.tabLoading.set(false);
        this.cdr.detectChanges();
      },
      error: () => this.tabLoading.set(false)
    });
  }

  private loadOwnerForms() {
    if (this.userService.userOwnerFormsCache[this.userId]) {
      this.ownerAdoptions.set(this.userService.userOwnerFormsCache[this.userId]);
      return;
    }
    this.tabLoading.set(true);
    this.userService.getUserOwnerForms(this.userId).subscribe({
      next: (res) => {
        const data = res.data || res || [];
        this.ownerAdoptions.set(data);
        this.userService.userOwnerFormsCache[this.userId] = data;
        this.tabLoading.set(false);
        this.cdr.detectChanges();
      },
      error: () => this.tabLoading.set(false)
    });
  }

  private loadReports() {
    if (this.userService.userReportsCache[this.userId]) {
      this.reports.set(this.userService.userReportsCache[this.userId]);
      return;
    }
    this.tabLoading.set(true);
    this.userService.getUserReports(this.userId).subscribe({
      next: (res) => {
        const data = res.data || res || [];
        this.reports.set(data);
        this.userService.userReportsCache[this.userId] = data;
        this.tabLoading.set(false);
        this.cdr.detectChanges();
      },
      error: () => this.tabLoading.set(false)
    });
  }

  private loadLikes() {
    if (this.userService.userLikesCache[this.userId]) {
      this.likes.set(this.userService.userLikesCache[this.userId]);
      return;
    }
    this.tabLoading.set(true);
    this.userService.getUserLikes(this.userId).subscribe({
      next: (res) => {
        const data = res.data || res || [];
        this.likes.set(data);
        this.userService.userLikesCache[this.userId] = data;
        this.tabLoading.set(false);
        this.cdr.detectChanges();
      },
      error: () => this.tabLoading.set(false)
    });
  }

  private preloadTabData() {
    this.loadPets();
    this.loadPosts();
    this.loadComments();
    this.loadClientForms();
    this.loadOwnerForms();
    this.loadReports();
    this.loadLikes();
  }

  getMapUrl(address?: string | null): SafeResourceUrl {
    const query = address ? encodeURIComponent(address) : 'Cairo,Egypt';
    return this.sanitizer.bypassSecurityTrustResourceUrl(`https://maps.google.com/maps?q=${query}&t=&z=13&ie=UTF8&iwloc=&output=embed`);
  }
}
