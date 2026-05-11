import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_ENDPOINTS } from '../constants/api-endpoints';

export interface SearchResult {
  id: number;
  title: string;
  subtitle: string;
  type: 'User' | 'Pet' | 'Adoption' | 'Report' | 'Post' | 'Comment' | 'Like';
  imageUrl?: string;
  route: string;
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private http = inject(HttpClient);

  search(query: string, forceRefresh = false): Observable<SearchResult[]> {
    return this.http.get<any>(`${API_ENDPOINTS.SEARCH.GLOBAL}`, {
      params: { query }
    }).pipe(
      map(response => (response.result ?? response.Result) || [])
    );
  }
}
