import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { User, Contact, Pet, AdoptionForm } from '../models/management.models';

@Injectable({ providedIn: 'root' })
export class ManagementService {
    private http = inject(HttpClient);

    usersCache: any = null;
    petsCache: any = null;
    adoptionsCache: any = null;

    // ===================== Contacts =====================
    getContacts(forceRefresh = false): Observable<Contact[]> {
        return this.http.get<any>(API_ENDPOINTS.CONTACTS.LIST).pipe(map(res => res.result ?? res.Result));
    }

    getContactById(id: number): Observable<Contact> {
        return this.http.get<any>(API_ENDPOINTS.CONTACTS.BY_ID(id)).pipe(map(res => res.result ?? res.Result));
    }

    deleteContact(id: number): Observable<any> {
        return this.http.delete<any>(API_ENDPOINTS.CONTACTS.DELETE(id));
    }

    updateContactStatus(id: number, statusId: number): Observable<any> {
        return this.http.put<any>(API_ENDPOINTS.CONTACTS.UPDATE_STATUS(id), statusId);
    }

    // ===================== Users =====================
    getUsers(forceRefresh = false): Observable<User[]> {
        return this.http.get<any>(API_ENDPOINTS.USERS.LIST).pipe(map(res => res.result ?? res.Result));
    }

    deleteUser(id: number): Observable<any> {
        return this.http.delete<any>(API_ENDPOINTS.USERS.DELETE(id));
    }

    // ===================== Pets =====================
    getPets(forceRefresh = false): Observable<Pet[]> {
        return this.http.get<any>(API_ENDPOINTS.PETS.LIST).pipe(
            map(res => {
                console.log('API Response (Pets):', res);
                return res.result ?? res.Result;
            })
        );
    }

    getPetById(id: number): Observable<Pet> {
        return this.http.get<any>(API_ENDPOINTS.PETS.BY_ID(id)).pipe(
            map(res => res.result ?? res.Result)
        );
    }

    deletePet(id: number): Observable<any> {
        return this.http.delete<any>(API_ENDPOINTS.PETS.DELETE(id));
    }

    updatePetStatus(id: number, status: number): Observable<any> {
        return this.http.patch<any>(API_ENDPOINTS.PETS.UPDATE_STATUS(id), null, { params: { status: status.toString() } });
    }

    togglePetBlock(id: number, isBlocked: boolean): Observable<any> {
        return this.http.patch<any>(API_ENDPOINTS.PETS.BLOCK(id), null, { params: { isBlocked: isBlocked.toString() } });
    }

    getPetReports(): Observable<any[]> {
        return this.http.get<any>(API_ENDPOINTS.PET_REPORTS.LIST).pipe(map(res => res.result ?? res.Result));
    }

    getReportsForPet(petId: number): Observable<any[]> {
        return this.http.get<any>(API_ENDPOINTS.PET_REPORTS.BY_PET(petId)).pipe(map(res => res.result ?? res.Result));
    }

    markReportAsRead(id: number): Observable<any> {
        return this.http.patch<any>(API_ENDPOINTS.PET_REPORTS.READ(id), null);
    }

    markAllReportsAsRead(): Observable<any> {
        return this.http.post<any>(API_ENDPOINTS.PET_REPORTS.READ_ALL, null);
    }

    // ===================== Adoptions =====================
    getAdoptions(forceRefresh = false): Observable<AdoptionForm[]> {
        return this.http.get<any>(API_ENDPOINTS.ADOPTIONS.LIST).pipe(map(res => res.result ?? res.Result));
    }

    // ===================== Timeline Moderation =====================
    updatePostState(id: number, statusId: number): Observable<any> {
        return this.http.patch<any>(API_ENDPOINTS.POSTS.UPDATE_STATE(id), { id, statusId });
    }

    deletePost(id: number): Observable<any> {
        return this.http.delete<any>(API_ENDPOINTS.POSTS.DELETE(id));
    }

    getPosts(pageSize: number = 10, pageIndex: number = 1, forceRefresh = false): Observable<any> {
        return this.http.get<any>(API_ENDPOINTS.POSTS.LIST, {
            params: { pageSize: pageSize.toString(), pageIndex: pageIndex.toString() }
        });
    }

    getPostById(id: number): Observable<any> {
        return this.http.get<any>(API_ENDPOINTS.POSTS.BY_ID(id)).pipe(map(res => res.result ?? res.Result));
    }

    getPagedPosts(pageIndex: number = 1, pageSize: number = 20, search?: string, statusId?: number): Observable<any> {
        const params: any = { 
            pageIndex: pageIndex.toString(), 
            pageSize: pageSize.toString(),
            IncludeAll: 'true' 
        };
        if (search) params.Search = search;
        if (statusId !== undefined && statusId !== null) params.StatusId = statusId.toString();

        return this.http.get<any>(API_ENDPOINTS.POSTS.PAGED, { params })
            .pipe(map(res => res.result ?? res.Result));
    }

    getReportsForPost(postId: number): Observable<any> {
        return this.http.get<any>(API_ENDPOINTS.POST_REPORTS.BY_POST(postId)).pipe(map(res => res.result ?? res.Result));
    }

    getAllPostReports(): Observable<any[]> {
        return this.http.get<any>(API_ENDPOINTS.POST_REPORTS.LIST).pipe(map(res => res.result ?? res.Result));
    }

    markPostReportAsRead(id: number): Observable<any> {
        return this.http.patch<any>(API_ENDPOINTS.POST_REPORTS.READ(id), null);
    }

    markAllPostReportsAsRead(): Observable<any> {
        return this.http.post<any>(API_ENDPOINTS.POST_REPORTS.READ_ALL, null);
    }

    // ===================== Comment Moderation =====================
    getComments(forceRefresh = false): Observable<any> {
        return this.http.get<any>(API_ENDPOINTS.COMMENTS.LIST);
    }

    getPagedComments(pageIndex: number = 1, pageSize: number = 20, search?: string, statusId?: number): Observable<any> {
        const params: any = { pageIndex: pageIndex.toString(), pageSize: pageSize.toString() };
        if (search) params.Search = search;
        if (statusId !== undefined && statusId !== null) params.StatusId = statusId.toString();

        return this.http.get<any>(API_ENDPOINTS.COMMENTS.PAGED, { params })
            .pipe(map(res => res.result ?? res.Result));
    }

    updateCommentStatus(id: number, status: number): Observable<any> {
        return this.http.patch<any>(API_ENDPOINTS.COMMENTS.UPDATE_STATUS(id), { id, status });
    }

    deleteComment(id: number): Observable<any> {
        return this.http.delete<any>(API_ENDPOINTS.COMMENTS.DELETE(id));
    }

    // ===================== Engagement Tracking =====================
    getPostLikes(forceRefresh = false): Observable<any> {
        return this.http.get<any>(API_ENDPOINTS.LIKES.POST.LIST);
    }

    getPagedPostLikes(pageIndex: number = 1, pageSize: number = 5, forceRefresh = false): Observable<any> {
        return this.http.get<any>(API_ENDPOINTS.LIKES.POST.PAGED, {
            params: { pageIndex: pageIndex.toString(), pageSize: pageSize.toString() }
        }).pipe(map(res => res.result ?? res.Result));
    }

    getCommentLikes(forceRefresh = false): Observable<any> {
        return this.http.get<any>(API_ENDPOINTS.LIKES.COMMENT.LIST);
    }

    getPagedCommentLikes(pageIndex: number = 1, pageSize: number = 5, forceRefresh = false): Observable<any> {
        return this.http.get<any>(API_ENDPOINTS.LIKES.COMMENT.PAGED, {
            params: { pageIndex: pageIndex.toString(), pageSize: pageSize.toString() }
        }).pipe(map(res => res.result));
    }
}
