import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { UserProfileOverview } from '../models/dashboard.models';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);

  // Frontend Caches for User Details
  userProfileCache: { [id: number]: UserProfileOverview } = {};
  userPetsCache: { [id: number]: any } = {};
  userPostsCache: { [id: number]: any } = {};
  userCommentsCache: { [id: number]: any } = {};
  userClientFormsCache: { [id: number]: any } = {};
  userOwnerFormsCache: { [id: number]: any } = {};
  userReportsCache: { [id: number]: any } = {};
  userLikesCache: { [id: number]: any } = {};

  getUserProfile(id: number, forceRefresh = false): Observable<UserProfileOverview> {
    return this.http.get<any>(API_ENDPOINTS.USERS.PROFILE(id))
      .pipe(map(res => res.result ?? res.Result));
  }

  getUserPets(id: number): Observable<any> {
    return this.http.get<any>(API_ENDPOINTS.PETS.ADMIN_USER_PETS(id))
      .pipe(map(res => res.result ?? res.Result));
  }

  getUserPosts(id: number): Observable<any> {
    return this.http.get<any>(API_ENDPOINTS.POSTS.ADMIN_USER_POSTS(id))
      .pipe(map(res => res.result ?? res.Result));
  }

  getUserComments(id: number): Observable<any> {
    return this.http.get<any>(API_ENDPOINTS.COMMENTS.ADMIN_USER_COMMENTS(id))
      .pipe(map(res => res.result ?? res.Result));
  }

  getUserClientForms(id: number): Observable<any> {
    return this.http.get<any>(API_ENDPOINTS.ADOPTIONS.ADMIN_CLIENT_FORMS(id))
      .pipe(map(res => res.result ?? res.Result));
  }

  getUserOwnerForms(id: number): Observable<any> {
    return this.http.get<any>(API_ENDPOINTS.ADOPTIONS.ADMIN_OWNER_FORMS(id))
      .pipe(map(res => res.result ?? res.Result));
  }

  getUserReports(id: number, pageIndex = 1, pageSize = 50): Observable<any> {
    const params = new HttpParams()
      .set('ContactId', id.toString())
      .set('PageIndex', pageIndex.toString())
      .set('PageSize', pageSize.toString());

    return this.http.get<any>(API_ENDPOINTS.DASHBOARD.REPORTS.PAGED, { params })
      .pipe(map(res => res.result ?? res.Result));
  }

  getUserLikes(id: number): Observable<any> {
    const params = new HttpParams()
      .set('ContactId', id.toString())
      .set('PageIndex', '1')
      .set('PageSize', '50');

    return this.http.get<any>(API_ENDPOINTS.LIKES.POST.PAGED, { params })
      .pipe(map(res => res.result ?? res.Result));
  }
}
