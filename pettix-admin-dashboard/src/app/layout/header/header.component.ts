import { Component, inject, OnInit, OnDestroy, HostListener, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, switchMap, tap, finalize, Subject, takeUntil, interval, startWith } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { SearchService, SearchResult } from '../../core/services/search.service';
import { NotificationService, Notification } from '../../core/services/notification.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <header class="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-[100] transition-all">
      <!-- Search Section -->
      <div class="flex items-center gap-4 flex-1">
        <div class="relative w-96 group">
          <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors"></i>
          <input type="text" 
                 [formControl]="searchControl"
                 placeholder="Search for users, pets, adoptions..." 
                 (focus)="onFocus()"
                 class="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-sm font-medium">
          
          <!-- Search Results Dropdown -->
          <div *ngIf="showResults && (searchResults.length > 0 || isSearching || searchControl.value)" 
               class="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[110]">
            
            <div *ngIf="isSearching" class="p-8 text-center bg-white">
              <div class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p class="text-xs text-gray-400 italic">Searching everything...</p>
            </div>

            <div *ngIf="!isSearching && searchResults.length > 0" class="max-h-[400px] overflow-y-auto py-2 bg-white">
              <div *ngFor="let result of searchResults" 
                   (click)="navigateToResult(result)"
                   class="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3 transition-colors border-b border-gray-50 last:border-none">
                <div class="w-10 h-10 rounded-xl bg-gray-100 flex-shrink-0 style-overflow-hidden flex items-center justify-center">
                  <img *ngIf="result.imageUrl" [src]="result.imageUrl" class="w-full h-full object-cover rounded-xl"
                       onerror="this.style.display='none'">
                  <i *ngIf="!result.imageUrl" [class]="getIcon(result.type) + ' text-gray-400 text-lg'"></i>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between">
                    <p class="text-sm font-bold text-gray-900 truncate">{{result.title}}</p>
                    <span class="text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter" [ngClass]="getTypeClass(result.type)">
                      {{result.type}}
                    </span>
                  </div>
                  <p class="text-xs text-gray-500 truncate">{{result.subtitle}}</p>
                </div>
              </div>
            </div>

            <div *ngIf="!isSearching && searchResults.length === 0 && searchControl.value && searchControl.value.length >= 2" 
                 class="p-8 text-center bg-white border-t border-gray-50">
              <i class="fas fa-search-minus text-3xl text-gray-100 mb-3 block"></i>
              <p class="text-sm font-medium text-gray-400">No results found for "{{searchControl.value}}"</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions Section -->
      <div class="flex items-center gap-6">
        <div class="flex items-center gap-2">
          <!-- Notification Bell -->
          <div class="relative">
            <button (click)="toggleNotifications()" 
                    class="w-11 h-11 rounded-2xl hover:bg-gray-50 flex items-center justify-center relative transition-all group border border-transparent hover:border-gray-100">
              <i class="far fa-bell text-gray-500 text-lg group-hover:text-primary"></i>
              <span *ngIf="unreadCount > 0" 
                    class="absolute top-3 right-3 w-4 h-4 bg-red-500 text-white text-[9px] flex items-center justify-center rounded-full border-2 border-white shadow-sm shadow-red-500/40 animate-pulse font-black">
                {{unreadCount}}
              </span>
            </button>

            <!-- Notifications Dropdown -->
            <div *ngIf="showNotifications" 
                 class="absolute top-full right-0 w-80 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[120] animate-in fade-in slide-in-from-top-2 duration-200">
              <div class="px-4 py-3 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                <span class="text-xs font-black uppercase tracking-widest text-gray-600">Notifications</span>
                <button (click)="markAllAsRead()" class="text-[10px] text-primary font-bold hover:underline">Mark all as read</button>
              </div>

              <div class="max-h-[350px] overflow-y-auto">
                <div *ngIf="notifications.length === 0" class="p-8 text-center">
                  <i class="far fa-bell-slash text-2xl text-gray-200 mb-2 block"></i>
                  <p class="text-xs text-gray-400">No new notifications</p>
                </div>
                <div *ngFor="let note of notifications" (click)="markAsRead(note)" class="px-4 py-4 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-none group">
                  <div class="flex items-start gap-3">
                    <div class="w-2 h-2 rounded-full mt-1.5" [ngClass]="note.isRead ? 'bg-transparent' : 'bg-primary shadow-sm'"></div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors">{{note.title}}</p>
                      <p class="text-xs text-gray-500 line-clamp-2">{{note.body}}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="p-2 border-t border-gray-50 bg-gray-50/30">
                <button (click)="goToTimeline()" class="w-full py-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-primary transition-colors">View All Activities</button>
              </div>
            </div>
          </div>

          <!-- Chat Trigger -->
          <div class="relative">
            <button (click)="toggleChat()" 
                    class="w-11 h-11 rounded-2xl hover:bg-gray-50 flex items-center justify-center relative transition-all group border border-transparent hover:border-gray-100">
              <i class="far fa-comment-dots text-gray-500 text-lg group-hover:text-primary"></i>
              <span class="absolute top-3 right-3 w-4 h-4 bg-teal-500 text-white text-[9px] flex items-center justify-center rounded-full border-2 border-white shadow-sm font-black">
                3
              </span>
            </button>

            <!-- Chat Dropdown (Mock UI) -->
            <div *ngIf="showChatDropdown" 
                 class="absolute top-full right-0 w-80 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[120] animate-in fade-in slide-in-from-top-2 duration-200">
              <div class="px-4 py-3 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                <span class="text-xs font-black uppercase tracking-widest text-gray-600">Recent Messages</span>
                <button class="text-[10px] text-primary font-bold hover:underline">New Chat</button>
              </div>
              <div class="max-h-[350px] overflow-y-auto">
                <div *ngFor="let chat of mockChats" class="px-4 py-4 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-none group flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    <img [src]="chat.avatar" class="w-full h-full object-cover">
                  </div>
                  <div class="flex-1 min-w-0">
                     <div class="flex justify-between items-center mb-0.5">
                        <p class="text-sm font-bold text-gray-900 truncate">{{chat.name}}</p>
                        <span class="text-[9px] text-gray-400 font-medium">{{chat.time}}</span>
                     </div>
                     <p class="text-xs text-gray-500 truncate">{{chat.lastMsg}}</p>
                  </div>
                  <div *ngIf="chat.unread" class="w-2 h-2 rounded-full bg-teal-500"></div>
                </div>
              </div>
              <div class="p-2 border-t border-gray-50 bg-gray-50/30">
                <button class="w-full py-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-primary transition-colors">Go to Messages</button>
              </div>
            </div>
          </div>
        </div>

        <div class="h-8 w-px bg-gray-100 mx-2"></div>

        <!-- Admin Identity -->
        <div class="flex items-center gap-3 p-1.5 pr-3 rounded-2xl border border-transparent">
          <div class="text-right hidden sm:block">
            <p class="text-xs font-extrabold text-[#1A202C]">{{user()?.name}}</p>
            <p class="text-[9px] text-gray-400 uppercase font-black tracking-widest">{{user()?.role}}</p>
          </div>
          <div class="w-11 h-11 rounded-xl bg-gray-50 p-0.5 shadow-sm border border-gray-200 overflow-hidden">
            <img [src]="user()?.avatar || 'https://ui-avatars.com/api/?name=' + user()?.name + '&background=4A5D8A&color=fff'" 
                 class="w-full h-full rounded-[9px] object-cover" 
                 [alt]="user()?.name">
          </div>
        </div>
      </div>
    </header>
  `
})
export class HeaderComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private searchService = inject(SearchService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private elementRef = inject(ElementRef);
  private cdRef = inject(ChangeDetectorRef);
  
  user = this.authService.currentUser;
  
  // Search state
  searchControl = new FormControl('');
  searchResults: SearchResult[] = [];
  isSearching = false;
  showResults = false;

  // Notification state
  notifications: Notification[] = [];
  unreadCount = 0;
  showNotifications = false;

  // Chat state
  showChatDropdown = false;
  mockChats = [
    { name: 'Dr. Sarah Smith', lastMsg: 'I have reviewed the report on Pet #102...', time: '12:45 PM', avatar: 'https://i.pravatar.cc/150?u=sarah', unread: true },
    { name: 'Khaled Omar', lastMsg: 'Thank you for approving my adoption request!', time: 'Yesterday', avatar: 'https://i.pravatar.cc/150?u=khaled', unread: true },
    { name: 'Pettix Support', lastMsg: 'The server update is scheduled for 2 AM.', time: '2 days ago', avatar: 'https://i.pravatar.cc/150?u=support', unread: false }
  ];

  private destroy$ = new Subject<void>();

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.showResults = false;
      this.showNotifications = false;
      this.showChatDropdown = false;
      this.cdRef.detectChanges();
    }
  }

  ngOnInit() {
    this.initSearch();
    this.initNotifications();
  }

  private initSearch() {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap((query) => {
        if (query && query.length >= 2) {
          this.isSearching = true;
          this.showResults = true;
        } else {
          this.searchResults = [];
          this.isSearching = false;
          this.showResults = false;
        }
        this.cdRef.detectChanges();
      }),
      switchMap(query => {
        if (!query || query.length < 2) return Promise.resolve([]);
        return this.searchService.search(query).pipe(
          finalize(() => {
            this.isSearching = false;
            this.cdRef.detectChanges();
          })
        );
      }),
      takeUntil(this.destroy$)
    ).subscribe(results => {
      this.searchResults = results || [];
      this.isSearching = false;
      this.showResults = true;
      this.cdRef.detectChanges();
    });
  }

  private initNotifications() {
    interval(30000).pipe(
      startWith(0),
      switchMap(() => this.notificationService.getNotifications(5, 1, false)),
      takeUntil(this.destroy$)
    ).subscribe(response => {
      this.notifications = response.result?.data || [];
      this.unreadCount = response.result?.metaData?.totalCount || 0;
      this.cdRef.detectChanges();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onFocus() {
    if (this.searchControl.value && this.searchControl.value.length >= 2) {
      this.showResults = true;
      this.cdRef.detectChanges();
    }
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
    this.showResults = false;
    this.showChatDropdown = false;
    this.cdRef.detectChanges();
  }

  toggleChat() {
    this.showChatDropdown = !this.showChatDropdown;
    this.showResults = false;
    this.showNotifications = false;
    this.cdRef.detectChanges();
  }

  goToTimeline() {
    this.showNotifications = false;
    this.router.navigate(['/timeline']);
  }

  markAsRead(note: Notification) {
    if (!note.isRead) {
      this.notificationService.markAsRead(note.id).subscribe(() => {
        note.isRead = true;
        this.unreadCount = Math.max(0, this.unreadCount - 1);
        this.cdRef.detectChanges();
      });
    }
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead().subscribe(() => {
      this.notifications.forEach(n => n.isRead = true);
      this.unreadCount = 0;
      this.cdRef.detectChanges();
    });
  }

  navigateToResult(result: SearchResult) {
    this.showResults = false;
    this.searchControl.setValue('', { emitEvent: false });
    this.router.navigate([result.route], { queryParams: { id: result.id } });
  }

  getIcon(type: string): string {
    switch (type) {
      case 'User': return 'fas fa-user';
      case 'Pet': return 'fas fa-paw';
      case 'Adoption': return 'fas fa-file-contract';
      case 'Report': return 'fas fa-exclamation-triangle';
      case 'Post': return 'fas fa-newspaper';
      case 'Comment': return 'fas fa-comments';
      default: return 'fas fa-search';
    }
  }

  getTypeClass(type: string): string {
    switch (type) {
      case 'User': return 'bg-blue-50 text-blue-600 border border-blue-100';
      case 'Pet': return 'bg-orange-50 text-orange-600 border border-orange-100';
      case 'Adoption': return 'bg-green-50 text-green-600 border border-green-100';
      case 'Report': return 'bg-red-50 text-red-600 border border-red-100';
      case 'Post': return 'bg-purple-50 text-purple-600 border border-purple-100';
      case 'Comment': return 'bg-pink-50 text-pink-600 border border-pink-100';
      default: return 'bg-gray-50 text-gray-600 border border-gray-100';
    }
  }
}
