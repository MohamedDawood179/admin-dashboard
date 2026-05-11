import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints';

export interface Notification {
  id: number;
  title: string;
  body: string;
  date: string;
  sentBy: string;
  isRead: boolean;
  notificationTypeId: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);

  getNotifications(pageSize: number = 10, pageIndex: number = 1, isRead?: boolean, forceRefresh = false): Observable<any> {
    const params: any = { 
      PageSize: pageSize, 
      PageIndex: pageIndex
    };
    if (isRead !== undefined) {
      params.isRead = isRead;
    }
    return this.http.get<any>(API_ENDPOINTS.NOTIFICATIONS.SEARCH, { params });
  }

  markAsRead(id: number): Observable<any> {
    return this.http.put<any>(API_ENDPOINTS.NOTIFICATIONS.READ(id), {});
  }

  markAllAsRead(): Observable<any> {
    return this.http.put<any>(API_ENDPOINTS.NOTIFICATIONS.READ_ALL, {});
  }
}
