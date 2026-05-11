import { Component, inject, OnInit, signal, ViewChildren, QueryList, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ManagementService } from '../../core/services/management.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmService } from '../../core/services/confirm.service';
import { finalize, forkJoin } from 'rxjs';
import { TimelineStats, PostReportSummary } from '../../core/models/dashboard.models';
import { LoaderComponent } from '../../shared/components/loader/loader.component';

interface ActivityItem {
  id: number;
  type: 'post' | 'comment' | 'report' | 'like';
  title: string;
  content: string;
  author: string;
  date: Date;
  status?: string;
  statusLabel?: string;
  postId?: number;
  reportId?: number;
  reason?: string;
  subType?: 'post-like' | 'comment-like';
  isRead?: boolean;
  images?: string[];
  authorStatus?: number;
}

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [CommonModule, FormsModule, LoaderComponent],
  template: `
    <div class="space-y-8 animate-fade-in">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 tracking-tight">Timeline Hub</h1>
          <p class="text-gray-500 mt-1 uppercase text-xs font-bold tracking-widest">
            <!-- If we are filtering, we can display the specific total, if 'all', we display all -->
            <ng-container *ngIf="loading()">Gathering Community Activities...</ng-container>
            <ng-container *ngIf="!loading()">
               Displaying {{filteredActivities().length}} of 
               {{ activeFilter === 'all' ? totalActivitiesCount() : 
                  activeFilter === 'post' ? totalPostsCount() :
                  activeFilter === 'comment' ? totalCommentsCount() :
                  activeFilter === 'report' ? totalReportsCount() :
                  totalLikesCount() }} operations
            </ng-container>
          </p>
        </div>
        
        <div class="flex items-center gap-3">
          <!-- Status Filter (Only for Posts tab) -->
          <select *ngIf="activeFilter === 'post'" [ngModel]="statusFilter()" (ngModelChange)="onStatusChange($event)"
                  class="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-primary transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
             <option [ngValue]="null">All Statuses</option>
             <option [ngValue]="1">Draft</option>
             <option [ngValue]="3">Published</option>
             <option [ngValue]="4">Blocked</option>
             <option [ngValue]="5">Deleted</option>
          </select>

          <div class="relative">
            <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
            <input [(ngModel)]="searchQuery" (ngModelChange)="onSearchChange()" 
                   placeholder="Search content or author..." 
                   class="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 w-64 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm">
          </div>
          
          <div class="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
             <button (click)="setFilter('all')" [class.bg-white]="activeFilter === 'all'" [class.shadow-sm]="activeFilter === 'all'" class="px-3 py-1 text-xs font-bold rounded-lg transition-all" [class.text-primary]="activeFilter === 'all'">All ({{totalActivitiesCount()}})</button>
             <button (click)="setFilter('post')" [class.bg-white]="activeFilter === 'post'" [class.shadow-sm]="activeFilter === 'post'" class="px-3 py-1 text-xs font-bold rounded-lg transition-all" [class.text-blue-600]="activeFilter === 'post'">Posts ({{totalPostsCount()}})</button>
             <button (click)="setFilter('comment')" [class.bg-white]="activeFilter === 'comment'" [class.shadow-sm]="activeFilter === 'comment'" class="px-3 py-1 text-xs font-bold rounded-lg transition-all" [class.text-green-600]="activeFilter === 'comment'">Comments ({{totalCommentsCount()}})</button>
             <button (click)="setFilter('report')" [class.bg-white]="activeFilter === 'report'" [class.shadow-sm]="activeFilter === 'report'" class="px-3 py-1 text-xs font-bold rounded-lg transition-all" [class.text-red-500]="activeFilter === 'report'">Reports ({{totalReportsCount()}})</button>
             <button (click)="setFilter('like')" [class.bg-white]="activeFilter === 'like'" [class.shadow-sm]="activeFilter === 'like'" class="px-3 py-1 text-xs font-bold rounded-lg transition-all" [class.text-pink-500]="activeFilter === 'like'">Likes ({{totalLikesCount()}})</button>
          </div>

          <button *ngIf="activeFilter === 'report' && totalReportsCount() > 0" (click)="markAllAsRead()" class="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm">
             <i class="fas fa-check-double text-blue-500"></i> Mark All as Read
          </button>

          <button (click)="loadData()" [disabled]="loading()" class="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center hover:text-primary transition-all shadow-sm">
            <i class="fas fa-sync-alt" [class.animate-spin]="loading()"></i>
          </button>
        </div>
      </div>

      <!-- Quick Metrics -->
      <div class="relative min-h-[100px]">
        <app-loader [loading]="loading() && !stats" message="Synchronizing Metrics..."></app-loader>
        <div *ngIf="stats" class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <div class="card p-4 border-l-4 border-blue-500 bg-white shadow-sm hover:shadow-md transition-shadow">
            <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Posts</p>
            <p class="text-2xl font-black text-gray-900 mt-1">{{stats.activePosts}}</p>
          </div>
          <div class="card p-4 border-l-4 border-indigo-500 bg-white shadow-sm hover:shadow-md transition-shadow">
            <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Posts</p>
            <p class="text-2xl font-black text-gray-900 mt-1">{{stats.totalPosts}}</p>
          </div>
          <div class="card p-4 border-l-4 border-green-500 bg-white shadow-sm hover:shadow-md transition-shadow">
            <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">New Today</p>
            <p class="text-2xl font-black text-gray-900 mt-1">{{stats.newPostsLast24H}}</p>
          </div>
          <div class="card p-4 border-l-4 border-red-500 bg-white shadow-sm hover:shadow-md transition-shadow">
            <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Open Reports</p>
            <p class="text-2xl font-black text-red-600 mt-1">{{stats.totalReports}}</p>
          </div>
          <div class="card p-4 border-l-4 border-yellow-500 bg-white shadow-sm hover:shadow-md transition-shadow">
            <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pending Review</p>
            <p class="text-2xl font-black text-yellow-600 mt-1">{{stats.pendingReports}}</p>
          </div>
        </div>
      </div>

      <!-- Activity Ledger -->
      <div class="space-y-4 relative min-h-[400px]">
         <app-loader [loading]="loading()" message="Gathering Community Activities..."></app-loader>
         <div *ngFor="let item of filteredActivities(); let i = index" 
              #activityItem
              [attr.data-index]="i"
              (click)="onItemClick(item)"
              class="bg-white border border-gray-100 rounded-2xl p-5 hover:border-primary/30 transition-all cursor-pointer group flex items-start gap-4 shadow-sm relative"
              [style.animation-delay.ms]="i * 20"
              style="animation: slideIn 0.4s ease forwards">
            
            <!-- Unread Dot -->
            <div *ngIf="item.type === 'report' && !item.isRead" class="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
            
            <!-- Type Icon -->
            <div [ngClass]="getTypeStyles(item).bg" class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0">
               <i [class]="getTypeStyles(item).icon"></i>
            </div>
            
            <div class="flex-1 min-w-0">
               <div class="flex items-center gap-3 mb-1">
                  <div class="flex items-center gap-1.5">
                     <span [ngClass]="getTypeStyles(item).text" class="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border" [ngClass]="getTypeStyles(item).border">
                        {{item.type}}
                     </span>
                     <span *ngIf="item.statusLabel" 
                           class="text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest border" 
                           [ngClass]="{
                              'bg-green-50 text-green-600 border-green-100': item.statusLabel === 'Published' || item.statusLabel === 'Promoted',
                              'bg-red-50 text-red-600 border-red-100': item.statusLabel === 'Blocked' || item.statusLabel === 'Deleted',
                              'bg-gray-50 text-gray-500 border-gray-200': !['Published', 'Promoted', 'Blocked', 'Deleted'].includes(item.statusLabel)
                           }">
                        {{item.statusLabel}}
                     </span>
                  </div>
                  <span class="text-[10px] text-gray-400 font-bold">{{item.date | date:'MMM d, HH:mm'}}</span>
                  <span class="w-1 h-1 rounded-full bg-gray-200"></span>
                  <span [class.text-red-600]="item.authorStatus === 5" class="text-[10px] text-gray-400 font-bold uppercase tracking-tight">BY {{item.author}}</span>
               </div>
               
               <p class="text-sm text-gray-900 font-semibold leading-relaxed">
                  {{item.title}}
               </p>
               
               <p class="text-sm text-gray-500 mt-1 leading-relaxed line-clamp-2 italic border-l-2 border-gray-100 pl-3 py-1 bg-gray-50/30 rounded-r-md" *ngIf="item.content">
                  {{item.content}}
               </p>

               <!-- Post Images Preview -->
               <div *ngIf="item.type === 'post' && item.images && item.images.length > 0" class="flex gap-2 mt-3 overflow-x-auto pb-2 scrollbar-hide">
                  <img *ngFor="let img of item.images" [src]="img" 
                       class="w-20 h-20 rounded-xl object-cover border border-gray-100 flex-shrink-0 shadow-sm hover:scale-105 transition-transform" 
                       (error)="$event.target.style.display='none'">
               </div>

               <div *ngIf="item.reason" class="mt-2 text-[11px] font-bold text-red-500 flex items-center gap-2">
                  <i class="fas fa-info-circle"></i>
                  <span>Violation: {{item.reason}}</span>
               </div>
            </div>
            
            <!-- Contextual Actions -->
            <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
               <button *ngIf="canModerate(item)" 
                       (click)="onToggleStatus(item); $event.stopPropagation()" 
                       class="w-8 h-8 rounded-lg bg-gray-50 text-gray-400 hover:text-primary hover:bg-white border border-transparent hover:border-gray-100 transition-all flex items-center justify-center"
                       [title]="item.status === 'Hidden' ? 'Restore' : 'Hide Content'">
                  <i [class]="item.status === 'Hidden' ? 'fas fa-eye' : 'fas fa-eye-slash'" class="text-xs"></i>
               </button>
               <button (click)="onDelete(item); $event.stopPropagation()" 
                       class="w-8 h-8 rounded-lg bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-white border border-transparent hover:border-gray-100 transition-all flex items-center justify-center"
                       title="Delete Permanently">
                  <i class="fas fa-trash-alt text-xs"></i>
               </button>
            </div>
         </div>
         
         <!-- Load More Indicator -->
         <div *ngIf="isLoadingMore()" class="flex justify-center py-6">
            <app-loader [loading]="true" message="Loading more activities..." [isOverlay]="false"></app-loader>
         </div>

         <!-- Loading / Empty state handled by base view -->
         <div *ngIf="!loading() && filteredActivities().length === 0" class="card py-16 text-center opacity-50 border-dashed">
            <i class="fas fa-stream text-4xl mb-4"></i>
            <p class="text-xs font-bold uppercase tracking-widest text-gray-400">No records found for this Sector</p>
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
export class TimelineComponent implements OnInit, AfterViewInit, OnDestroy {
  private mgmt = inject(ManagementService);
  private dashboard = inject(DashboardService);
  private router = inject(Router);
  private toastService = inject(ToastService);
  private confirmService = inject(ConfirmService);

  @ViewChildren('activityItem') activityItems!: QueryList<ElementRef>;
  private observer: IntersectionObserver | null = null;

  activities = signal<ActivityItem[]>([]);
  filteredActivities = signal<ActivityItem[]>([]);
  stats?: TimelineStats;
  loading = signal(true);
  isLoadingMore = signal(false);
  hasMoreData = signal(true);
  currentPage = signal(1);
  pageSize = 5;
  searchQuery = '';
  statusFilter = signal<number | null>(null);
  activeFilter: 'all' | 'post' | 'comment' | 'report' | 'like' = 'all';

  totalPostsCount = signal(0);
  totalCommentsCount = signal(0);
  totalReportsCount = signal(0);
  totalLikesCount = signal(0);
  totalActivitiesCount = signal(0);

  ngOnInit() {
    if (this.dashboard.timelineCache) {
      const cache = this.dashboard.timelineCache;
      this.activities.set(cache.activities);
      this.currentPage.set(cache.page);
      this.hasMoreData.set(cache.hasMore);
      this.stats = cache.stats;
      this.totalPostsCount.set(cache.counts.posts);
      this.totalCommentsCount.set(cache.counts.comments);
      this.totalReportsCount.set(cache.counts.reports);
      this.totalLikesCount.set(cache.counts.likes);
      this.totalActivitiesCount.set(cache.counts.total);
      this.applyFilters();
      this.loading.set(false);

      setTimeout(() => {
        const mainContainer = document.querySelector('main.overflow-y-auto');
        if (mainContainer) {
          mainContainer.scrollTop = cache.scrollPos;
        }
      }, 0);
    } else {
      this.loadData();
    }
  }

  ngAfterViewInit() {
    this.setupObserver();
    this.activityItems.changes.subscribe(() => {
      this.reconnectObserver();
    });
  }

  setupObserver() {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    this.observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const index = parseInt(entry.target.getAttribute('data-index') || '0', 10);
          const targetIndex = Math.max(0, this.filteredActivities().length - 10);

          if (index >= targetIndex && !this.loading() && !this.isLoadingMore() && this.hasMoreData()) {
            this.loadMore();
            break;
          }
        }
      }
    }, options);

    this.reconnectObserver();
  }

  reconnectObserver() {
    if (this.observer && this.activityItems) {
      this.observer.disconnect();
      this.activityItems.forEach(item => {
        this.observer!.observe(item.nativeElement);
      });
    }
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }

    // Save cache and exact scroll position on exit
    const mainContainer = document.querySelector('main.overflow-y-auto');
    const scrollPos = mainContainer ? mainContainer.scrollTop : 0;

    this.dashboard.timelineCache = {
      activities: this.activities(),
      page: this.currentPage(),
      hasMore: this.hasMoreData(),
      stats: this.stats,
      counts: {
        posts: this.totalPostsCount(),
        comments: this.totalCommentsCount(),
        reports: this.totalReportsCount(),
        likes: this.totalLikesCount(),
        total: this.totalActivitiesCount()
      },
      scrollPos: scrollPos
    };
  }

  loadMore() {
    this.currentPage.update(val => val + 1);
    this.loadData(true);
  }

  loadData(isLoadMore = false) {
    if (isLoadMore) {
      this.isLoadingMore.set(true);
    } else {
      this.loading.set(true);
      this.currentPage.set(1);
      this.hasMoreData.set(true);
    }

    forkJoin({
      posts: this.mgmt.getPagedPosts(this.currentPage(), this.pageSize, this.searchQuery || undefined, this.statusFilter() ?? undefined),
      reports: this.dashboard.getPagedRecentReports(this.currentPage(), this.pageSize),
      stats: this.dashboard.getTimelineStats(),
      comments: this.mgmt.getPagedComments(this.currentPage(), this.pageSize, this.searchQuery || undefined, this.statusFilter() ?? undefined),
      postLikes: this.mgmt.getPagedPostLikes(this.currentPage(), this.pageSize),
      commentLikes: this.mgmt.getPagedCommentLikes(this.currentPage(), this.pageSize)
    }).pipe(
      finalize(() => {
        this.loading.set(false);
        this.isLoadingMore.set(false);
      })
    ).subscribe({
      next: (res: any) => {
        this.stats = res.stats;

        // Store total backend counts if available
        if (res.posts?.count !== undefined) this.totalPostsCount.set(res.posts.count);
        if (res.comments?.count !== undefined) this.totalCommentsCount.set(res.comments.count);
        if (res.reports?.count !== undefined) this.totalReportsCount.set(res.reports.count);

        const plCount = res.postLikes?.count || 0;
        const clCount = res.commentLikes?.count || 0;
        if (plCount + clCount > 0) this.totalLikesCount.set(plCount + clCount);

        this.totalActivitiesCount.set(this.totalPostsCount() + this.totalCommentsCount() + this.totalReportsCount() + this.totalLikesCount());

        const posts: ActivityItem[] = (res.posts?.data || []).map((p: any) => ({
          id: p.id, type: 'post', title: `New Post created`, content: p.content,
          author: p.author?.nameEn || p.author?.nameAr || 'System', date: new Date(p.creationDate),
          status: p.statusId === 4 || p.statusId === 5 ? 'Hidden' : 'Visible',
          statusLabel: this.getStatusLabel(p.statusId),
          images: p.images,
          authorStatus: p.author?.statusId
        }));

        const reports: ActivityItem[] = (res.reports?.data || []).map((r: any) => ({
          id: r.reportId, type: 'report', title: `Report on Post #${r.postId}`, content: r.postContentSnippet,
          author: r.reporterName, date: new Date(r.reportedAt), reason: r.reason, postId: r.postId,
          isRead: r.isRead
        }));

        const comments: ActivityItem[] = (res.comments?.data || []).map((c: any) => ({
          id: c.id, type: 'comment', title: `Commented on Post #${c.postId}`, content: c.text,
          author: c.author?.nameEn || c.author?.nameAr || 'System', date: new Date(c.creationDate),
          postId: c.postId, status: c.status === 2 ? 'Hidden' : 'Visible',
          statusLabel: this.getStatusLabel(c.status),
          authorStatus: c.author?.statusId
        }));

        const postLikes: ActivityItem[] = (res.postLikes?.data || []).map((l: any) => ({
          id: l.id, type: 'like', subType: 'post-like',
          title: `Post Liked by ${l.author?.nameEn || l.author?.nameAr || 'Unknown'}`,
          content: l.postContent ? `"${l.postContent.substring(0, 50)}..."` : `On Post #${l.postId}`,
          author: l.author?.nameEn || l.author?.nameAr || 'Unknown',
          date: new Date(l.creationDate), postId: l.postId,
          authorStatus: l.author?.statusId
        }));

        const commentLikes: ActivityItem[] = (res.commentLikes?.data || []).map((l: any) => ({
          id: l.id, type: 'like', subType: 'comment-like',
          title: `Comment Liked by ${l.author?.nameEn || l.author?.nameAr || 'Unknown'}`,
          content: l.commentText ? `"${l.commentText.substring(0, 50)}..."` : `On Comment #${l.commentId}`,
          author: l.author?.nameEn || l.author?.nameAr || 'Unknown',
          date: new Date(l.creationDate), postId: l.postId,
          authorStatus: l.author?.statusId
        }));

        const newActivities = [...posts, ...reports, ...comments, ...postLikes, ...commentLikes]
          .sort((a, b) => b.date.getTime() - a.date.getTime());

        if (newActivities.length === 0 ||
          (posts.length === 0 && comments.length === 0 && reports.length === 0 && postLikes.length === 0 && commentLikes.length === 0)) {
          this.hasMoreData.set(false);
        }

        if (isLoadMore) {
          this.activities.update(curr => {
            const merged = [...curr, ...newActivities];
            // Remove duplicates based on type and id
            return merged.filter((v, i, a) => a.findIndex(t => (t.id === v.id && t.type === v.type)) === i)
              .sort((a, b) => b.date.getTime() - a.date.getTime());
          });
        } else {
          this.activities.set(newActivities);
        }

        this.applyFilters();
      }
    });
  }

  setFilter(filter: any) {
    this.activeFilter = filter;
    
    // Auto-reset status filter when switching away from Posts tab
    if (filter !== 'post' && this.statusFilter() !== null) {
      this.statusFilter.set(null);
      this.loadData();
    } else {
      this.applyFilters();
    }
  }

  onSearchChange() {
    this.loadData();
  }

  onStatusChange(statusId: number | null) {
    this.statusFilter.set(statusId);
    this.loadData();
  }

  applyFilters() {
    const filtered = this.activities().filter(a => {
      const matchesSearch = !this.searchQuery ||
        a.content.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        a.author.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        a.title.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesType = this.activeFilter === 'all' || a.type === this.activeFilter;
      return matchesSearch && matchesType;
    });
    this.filteredActivities.set(filtered);
  }

  getTypeStyles(item: ActivityItem) {
    switch (item.type) {
      case 'report': return { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100', icon: 'fas fa-flag' };
      case 'comment': return { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-100', icon: 'fas fa-comment-dots' };
      case 'like': return { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-100', icon: 'fas fa-heart' };
      default: return { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', icon: 'fas fa-paper-plane' };
    }
  }

  canModerate(item: ActivityItem) {
    return item.type === 'post' || item.type === 'comment';
  }

  onToggleStatus(item: ActivityItem) {
    // 3 = Published, 4 = Blocked
    const newStatus = item.status === 'Hidden' ? 3 : 4;
    const action$ = item.type === 'post'
      ? this.mgmt.updatePostState(item.id, newStatus)
      : this.mgmt.updateCommentStatus(item.id, newStatus);

    action$.subscribe({
      next: () => {
        item.status = newStatus === 4 ? 'Hidden' : 'Visible';
        this.toastService.success(`Status updated to ${item.status}`);
        this.loadData();
      },
      error: (err) => {
        console.error('Error toggling status:', err);
        this.toastService.error('Failed to update status.');
      }
    });
  }

  async onDelete(item: ActivityItem) {
    const confirmed = await this.confirmService.confirm({
      title: `Delete ${item.type === 'post' ? 'Post' : 'Comment'}`,
      message: `Are you sure you want to delete this ${item.type}? This action cannot be undone.`,
      confirmText: 'Yes, Delete',
      type: 'danger'
    });

    if (!confirmed) return;

    const action$ = item.type === 'post' ? this.mgmt.updatePostState(item.id, 5) : this.mgmt.updateCommentStatus(item.id, 3);
    action$.subscribe({
      next: () => {
        this.toastService.success(`${item.type === 'post' ? 'Post' : 'Comment'} deleted successfully.`);
        this.loadData();
      },
      error: (err) => {
        console.error('Error deleting record:', err);
        this.toastService.error(`Failed to delete ${item.type}.`);
      }
    });
  }

  onItemClick(item: ActivityItem) {
    if (item.type === 'report' && !item.isRead) {
      this.markAsRead(item);
    }
    this.goToPost(item);
  }

  markAsRead(item: ActivityItem) {
    if (item.type !== 'report' || item.isRead) return;

    this.mgmt.markPostReportAsRead(item.id).subscribe({
      next: () => {
        item.isRead = true;
        // Optimistically update counts if we were using them for badges here
        if (this.stats) {
          this.stats.pendingReports = Math.max(0, this.stats.pendingReports - 1);
        }
      }
    });
  }

  markAllAsRead() {
    this.mgmt.markAllPostReportsAsRead().subscribe({
      next: () => {
        this.activities.update(list =>
          list.map(a => a.type === 'report' ? { ...a, isRead: true } : a)
        );
        if (this.stats) {
          this.stats.pendingReports = 0;
        }
        this.applyFilters();
      }
    });
  }

  getStatusLabel(statusId: number): string {
    switch (statusId) {
      case 1: return 'Draft';
      case 2: return 'Scheduled';
      case 3: return 'Published';
      case 4: return 'Blocked';
      case 5: return 'Deleted';
      case 6: return 'Private';
      case 7: return 'Promoted';
      case 8: return 'Processing';
      case 9: return 'Failed';
      default: return '';
    }
  }

  goToPost(item: ActivityItem) {
    const targetId = item.postId || item.id;
    if (targetId) {
      this.router.navigate(['/timeline', targetId]);
    }
  }
}


