import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  AdminDashboardStats,
  ChartData,
  RecentActivity,
  TimelineStats,
  PostReportSummary
} from '../models/dashboard.models';
import { API_ENDPOINTS } from '../constants/api-endpoints';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  timelineCache: any = null; // Caches the frontend state of the timeline
  dashboardCache: any = null; // Caches the main dashboard stats

  getStats(forceRefresh = false): Observable<AdminDashboardStats> {
    return this.http.get<any>(API_ENDPOINTS.DASHBOARD.STATS).pipe(map(res => res.result ?? res.Result));
  }

  getAnalytics(months: number = 6, forceRefresh = false): Observable<ChartData> {
    const url = `${API_ENDPOINTS.DASHBOARD.ANALYTICS}?months=${months}`;
    return this.http.get<any>(url).pipe(map(res => res.result ?? res.Result));
  }

  getRecentActivities(count: number = 10, forceRefresh = false): Observable<RecentActivity[]> {
    const url = `${API_ENDPOINTS.DASHBOARD.ACTIVITIES}?count=${count}`;
    return this.http.get<any>(url).pipe(map(res => res.result ?? res.Result));
  }

  getTimelineStats(forceRefresh = false): Observable<TimelineStats> {
    return this.http.get<any>(API_ENDPOINTS.DASHBOARD.TIMELINE).pipe(map(res => res.result ?? res.Result));
  }

  getRecentReports(count: number = 10, forceRefresh = false): Observable<PostReportSummary[]> {
    const url = `${API_ENDPOINTS.DASHBOARD.REPORTS.LIST}?count=${count}`;
    return this.http.get<any>(url).pipe(map(res => res.result ?? res.Result));
  }

  getPagedRecentReports(pageIndex: number = 1, pageSize: number = 5, forceRefresh = false): Observable<any> {
    return this.http.get<any>(API_ENDPOINTS.DASHBOARD.REPORTS.PAGED, {
      params: { pageIndex: pageIndex.toString(), pageSize: pageSize.toString() }
    }).pipe(
      map(res => res.result ?? res.Result)
    );
  }
}
