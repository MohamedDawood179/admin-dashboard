import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { DashboardService } from '../../core/services/dashboard.service';
import { ManagementService } from '../../core/services/management.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmService } from '../../core/services/confirm.service';
import { 
  AdminDashboardStats, 
  ChartData, 
  RecentActivity, 
  TimelineStats, 
  PostReportSummary 
} from '../../core/models/dashboard.models';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { ActivityItemComponent } from '../../shared/components/activity-item/activity-item.component';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, StatCardComponent, ActivityItemComponent, LoaderComponent, RouterModule],
  template: `
    <div class="space-y-8 animate-fade-in relative min-h-[400px]">
      <!-- Loading Spinner -->
      <app-loader [loading]="loading()"></app-loader>

      <!-- Welcome Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 tracking-tight">System Overview</h1>
          <p class="text-gray-500 mt-1 uppercase text-xs font-bold tracking-widest">Real-time performance metrics</p>
        </div>
        <div class="flex gap-3">
          <button class="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center gap-2 shadow-sm">
            <i class="far fa-calendar-alt text-primary"></i> Last 30 Days
          </button>
          <button (click)="onNewCampaign()" class="primary-button flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 active:scale-95">
            <i class="fas fa-plus-circle"></i> New Campaign
          </button>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ng-container *ngIf="stats">
          <app-stat-card *ngFor="let stat of stats.stats"
            [title]="stat.title"
            [value]="stat.value"
            [trend]="stat.percentageChange"
            [isPositive]="stat.isPositiveTrend"
            [icon]="stat.icon">
          </app-stat-card>
        </ng-container>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Adoption Analytics Chart -->
        <div class="lg:col-span-2 card relative overflow-hidden">
          <div class="absolute top-0 right-0 p-8 opacity-5">
             <i class="fas fa-chart-area text-8xl text-primary"></i>
          </div>
          <div class="flex items-center justify-between mb-8 relative z-10">
            <div>
              <h3 class="text-lg font-bold text-gray-900">Adoption Success Rate</h3>
              <p class="text-sm text-gray-400">Monthly conversion of applications to adoptions</p>
            </div>
            <div class="flex bg-gray-50 p-1 rounded-xl">
               <button (click)="setChartInterval('Monthly')" [class.bg-white]="currentInterval === 'Monthly'" class="px-3 py-1.5 text-xs font-bold rounded-lg shadow-sm text-primary">Monthly</button>
               <button (click)="setChartInterval('Weekly')" [class.bg-white]="currentInterval === 'Weekly'" class="px-3 py-1.5 text-xs font-bold rounded-lg text-gray-400 hover:text-gray-600">Weekly</button>
            </div>
          </div>
          <div class="h-80 w-full bg-gray-50 rounded-2xl flex items-center justify-center relative group">
             <!-- Real Data bound to CSS Bars (Enhanced fallback until Chart.js) -->
             <div class="absolute bottom-6 left-12 right-12 flex items-end justify-between h-48 border-b border-gray-200">
                <ng-container *ngIf="analytics?.datasets?.[0]?.data as chartData">
                  <div *ngFor="let val of chartData; let i = index" 
                       [style.height.%]="(val / (getMaxValue(chartData) || 1)) * 100" 
                       [style.transition-delay.ms]="i * 100"
                       class="w-12 bg-gradient-to-t from-primary to-blue-400 rounded-t-xl transition-all duration-700 relative group/bar active:scale-110">
                       <span class="absolute -top-10 left-1/2 -translate-x-1/2 glass text-gray-900 text-[10px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover/bar:opacity-100 transition-all shadow-xl whitespace-nowrap scale-50 group-hover/bar:scale-100">
                          {{val}} {{analytics?.datasets?.[0]?.label}}
                       </span>
                       <span class="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[9px] font-bold text-gray-400 uppercase tracking-tighter whitespace-nowrap rotate-45 md:rotate-0">
                          {{analytics?.labels?.[i] || ''}}
                       </span>
                  </div>
                </ng-container>
             </div>
             <!-- Legend -->
             <div class="absolute top-4 left-4 flex gap-4">
                <div class="flex items-center gap-2">
                   <span class="w-3 h-3 rounded-full bg-primary shadow-sm shadow-primary/40"></span>
                   <span class="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Completed</span>
                </div>
                <div class="flex items-center gap-2">
                   <span class="w-3 h-3 rounded-full bg-gray-200"></span>
                   <span class="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Pending</span>
                </div>
             </div>
          </div>
        </div>

        <!-- Recent Activities -->
        <div class="card flex flex-col glass border-white">
          <h3 class="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span class="w-2 h-6 bg-primary rounded-full"></span>
            Recent Activities
          </h3>
          <div class="flex-1 space-y-6 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
            <app-activity-item *ngFor="let activity of recentActivities" [activity]="activity">
            </app-activity-item>
            
            <div *ngIf="recentActivities.length === 0" class="text-center py-12 text-gray-400">
               <i class="fas fa-ghost text-4xl mb-3 opacity-20 animate-bounce"></i>
               <p class="text-sm font-medium">Monitoring system active...</p>
            </div>
          </div>
          <button class="mt-6 w-full py-3 bg-white border border-gray-100 text-primary rounded-xl text-sm font-bold hover:bg-primary hover:text-white hover:shadow-lg hover:shadow-primary/20 transition-all shadow-sm">
            Interactive Logs
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <!-- Timeline Monitoring -->
        <div class="card overflow-hidden">
          <div class="flex items-center justify-between mb-8 px-2">
             <div class="flex items-center gap-3">
               <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
                  <i class="fas fa-shield-halved"></i>
               </div>
               <div>
                  <h3 class="text-lg font-bold text-gray-900">Community Safety</h3>
                  <p class="text-xs text-gray-400 font-bold uppercase tracking-widest">Active content filters</p>
               </div>
             </div>
             <div class="flex items-center gap-2">
               <span class="px-3 py-1.5 bg-red-50 text-red-500 text-[11px] font-bold rounded-xl border border-red-100 animate-pulse">
                 {{timelineStats?.pendingReports || 0}} Active Reports
               </span>
               <a routerLink="/timeline" class="px-3 py-1.5 bg-primary/10 text-primary text-[11px] font-bold rounded-xl border border-primary/20 hover:bg-primary/20 transition-colors flex items-center gap-1">
                 <i class="fas fa-external-link-alt text-[9px]"></i> View All
               </a>
             </div>
          </div>
          <div class="overflow-x-auto -mx-6">
            <table class="w-full border-collapse">
              <thead>
                <tr class="text-left bg-gray-50/50">
                  <th class="px-8 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Auditor</th>
                  <th class="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Category</th>
                  <th class="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Insight</th>
                  <th class="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right">Control</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                <tr *ngFor="let report of recentReports" class="hover:bg-blue-50/50 transition-colors group cursor-pointer">
                  <td class="px-8 py-5 whitespace-nowrap">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-[11px] font-bold text-gray-600 shadow-sm">
                        {{(report.reporterName || '').substring(0,2).toUpperCase()}}
                      </div>
                      <span class="text-sm font-bold text-gray-700">{{report.reporterName}}</span>
                    </div>
                  </td>
                  <td class="px-6 py-5">
                    <span class="px-2.5 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-lg uppercase tracking-wide border border-gray-200 transition-colors group-hover:bg-white">
                      {{report.reason}}
                    </span>
                  </td>
                  <td class="px-6 py-5">
                    <p class="text-sm text-gray-400 italic max-w-xs truncate group-hover:text-gray-900 transition-colors">"{{report.postContentSnippet}}"</p>
                  </td>
                  <td class="px-6 py-5 text-right space-x-1">
                    <button (click)="onViewReport(report)" 
                            class="w-8 h-8 text-gray-400 hover:text-primary transition-all hover:bg-white hover:shadow-sm rounded-lg" title="View Detail">
                      <i class="fas fa-eye text-xs"></i>
                    </button>
                    <button (click)="onModeratePost(report, 'block')"
                            class="w-8 h-8 text-gray-400 hover:text-red-500 transition-all hover:bg-white hover:shadow-sm rounded-lg" title="Moderate Content">
                      <i class="fas fa-hammer text-xs"></i>
                    </button>
                  </td>
                </tr>
                <tr *ngIf="recentReports.length === 0">
                  <td colspan="4" class="px-8 py-10 text-center">
                    <div class="opacity-20 flex flex-col items-center">
                       <i class="fas fa-check-circle text-4xl mb-2 text-green-500"></i>
                       <p class="text-sm font-bold text-gray-900">Queue is empty</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Community Engagement -->
        <div class="card border-none bg-gradient-to-br from-[#2D3748] to-[#1A202C] text-white shadow-2xl relative overflow-hidden">
           <div class="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
              <i class="fas fa-rocket text-[12rem] rotate-12"></i>
           </div>
           
           <h3 class="text-lg font-bold mb-8 flex items-center gap-2 relative z-10">
             <i class="fas fa-chart-pie text-blue-400"></i> Performance Intelligence
           </h3>
           
           <div class="space-y-8 relative z-10">
              <div *ngFor="let metric of timelineStats?.engagementMetrics" class="space-y-3">
                 <div class="flex justify-between items-end">
                    <div class="flex items-center gap-2">
                       <i [class]="'fas fa-' + metric.icon + ' text-blue-400'"></i>
                       <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">{{metric.title}}</span>
                    </div>
                    <div class="text-right">
                       <span class="text-2xl font-bold tracking-tight">{{metric.value}}</span>
                       <span [class]="'ml-2 text-xs font-bold px-2 py-0.5 rounded-lg ' + (metric.isPositiveTrend ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400')">
                          {{metric.percentageChange}}%
                       </span>
                    </div>
                 </div>
                 <div class="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div [style.width.%]="metric.percentageChange * 5 > 100 ? 100 : metric.percentageChange * 5" 
                         class="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-[1.5s] shadow-lg shadow-blue-500/20"></div>
                 </div>
              </div>
           </div>
           
           <div class="mt-12 p-6 rounded-2xl glass relative group cursor-pointer hover:bg-white/10 transition-colors">
             <div class="flex items-center justify-between mb-2">
                <span class="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em]">Alpha Recommendation</span>
                <i class="fas fa-arrow-right text-xs text-blue-400 group-hover:translate-x-2 transition-transform"></i>
             </div>
             <p class="text-sm font-medium leading-relaxed">Engagement is optimized for evening slots. Automate community highlights for 19:00 UTC.</p>
           </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .custom-scrollbar::-webkit-scrollbar { width: 5px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e0; border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #a0aec0; }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  stats?: AdminDashboardStats;
  analytics?: ChartData;
  recentActivities: RecentActivity[] = [];
  timelineStats?: TimelineStats;
  recentReports: PostReportSummary[] = [];
  loading = signal(true);

  currentDateFilter = 'Last 30 Days';
  currentInterval = 'Monthly';

  constructor(
    private dashboardService: DashboardService,
    private managementService: ManagementService,
    private toast: ToastService,
    private confirm: ConfirmService,
    private cdr: ChangeDetectorRef
  ) { 
    console.log('[DashboardComponent] Constructor hit');
  }

  ngOnInit(): void {
    console.log('[DashboardComponent] ngOnInit hit');
    if (this.dashboardService.dashboardCache) {
      const cache = this.dashboardService.dashboardCache;
      this.stats = cache.stats;
      this.analytics = cache.analytics;
      this.recentActivities = cache.recentActivities;
      this.timelineStats = cache.timelineStats;
      this.recentReports = cache.recentReports;
      this.currentDateFilter = cache.currentDateFilter;
      this.currentInterval = cache.currentInterval;
      this.loading.set(false);

      setTimeout(() => {
        const mainContainer = document.querySelector('main.overflow-y-auto');
        if (mainContainer) {
          mainContainer.scrollTop = cache.scrollPos;
        }
      }, 0);
    } else {
      this.refreshDashboard();
    }
  }

  ngOnDestroy(): void {
    const mainContainer = document.querySelector('main.overflow-y-auto');
    this.dashboardService.dashboardCache = {
      stats: this.stats,
      analytics: this.analytics,
      recentActivities: this.recentActivities,
      timelineStats: this.timelineStats,
      recentReports: this.recentReports,
      currentDateFilter: this.currentDateFilter,
      currentInterval: this.currentInterval,
      scrollPos: mainContainer ? mainContainer.scrollTop : 0
    };
  }

  refreshDashboard(): void {
    console.log('[DashboardComponent] refreshDashboard started');
    this.loading.set(true);

    forkJoin({
      stats: this.dashboardService.getStats(),
      analytics: this.dashboardService.getAnalytics(),
      activities: this.dashboardService.getRecentActivities(),
      timeline: this.dashboardService.getTimelineStats(),
      reports: this.dashboardService.getRecentReports(10)
    }).subscribe({
      next: (data) => {
        console.log('[DashboardComponent] forkJoin next hit with data:', data);
        this.stats = data.stats;
        this.analytics = data.analytics;
        this.recentActivities = data.activities || [];
        this.timelineStats = data.timeline;
        this.recentReports = data.reports || [];
        console.log('[DashboardComponent] State updated. stats:', this.stats);
        
        // Use a small timeout to allow UI rendering
        setTimeout(() => {
          this.loading.set(false);
          this.cdr.detectChanges();
          console.log('[DashboardComponent] Loading set to false and CDR triggered');
        }, 100);
      },
      error: (err) => {
        console.error('[DashboardComponent] forkJoin error hit:', err);
        this.loading.set(false);
        this.cdr.detectChanges();
      },
      complete: () => {
        console.log('[DashboardComponent] forkJoin complete hit');
      }
    });
  }

  onViewReport(report: PostReportSummary): void {
    this.toast.info(`Reason: ${report.reason}\nContent: "${report.postContentSnippet}..."`, `Post #${report.postId} Report`);
  }

  async onModeratePost(report: PostReportSummary, action: 'block' | 'delete'): Promise<void> {
    const isConfirmed = await this.confirm.confirm({
      title: `${action === 'delete' ? 'Delete' : 'Block'} Content`,
      message: `Are you sure you want to ${action} this post? This action is irreversible.`,
      confirmText: action === 'delete' ? 'Yes, Delete' : 'Yes, Block',
      type: action === 'delete' ? 'danger' : 'warning'
    });

    if (isConfirmed) {
      if (action === 'delete') {
        this.managementService.deletePost(report.postId).subscribe(() => {
          this.recentReports = this.recentReports.filter(r => r.postId !== report.postId);
          this.toast.success('Post deleted successfully', 'Moderation Action');
          this.dashboardService.dashboardCache = null;
          this.refreshDashboard();
        });
      } else {
        this.managementService.updatePostState(report.postId, 2).subscribe(() => {
          this.recentReports = this.recentReports.filter(r => r.postId !== report.postId);
          this.toast.success('Post blocked successfully', 'Moderation Action');
          this.dashboardService.dashboardCache = null;
          this.refreshDashboard();
        });
      }
    }
  }

  setChartInterval(interval: string): void {
    this.currentInterval = interval;
    this.dashboardService.getAnalytics(interval === 'Monthly' ? 6 : 1).subscribe(data => {
      this.analytics = data;
    });
  }

  setDateFilter(filter: string): void {
    this.currentDateFilter = filter;
    this.refreshDashboard();
  }

  onNewCampaign(): void {
    this.toast.warning('Campaign builder is under maintenance. Please try again later.', 'Under Maintenance');
  }

  getMaxValue(data: number[]): number {
    return data && data.length > 0 ? Math.max(...data) : 0;
  }

}
