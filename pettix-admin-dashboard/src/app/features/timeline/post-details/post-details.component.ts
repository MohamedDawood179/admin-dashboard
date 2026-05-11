import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { ManagementService } from '../../../core/services/management.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { forkJoin, of, catchError } from 'rxjs';

export interface PostDto {
  id: number;
  content: string;
  creationDate: string;
  modifyDate: string | null;
  author: any;
  comments: any[];
  likes: any[];
  images: string[];
  statusId: number;
}

@Component({
  selector: 'app-post-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './post-details.component.html',
  styleUrl: './post-details.component.css'
})
export class PostDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private managementService = inject(ManagementService);
  private location = inject(Location);
  private toastService = inject(ToastService);
  private confirmService = inject(ConfirmService);

  post = signal<PostDto | null>(null);
  reports = signal<any[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  activeTab = signal<'comments' | 'likes' | 'reports'>('comments');

  ngOnInit(): void {
    const postId = this.route.snapshot.paramMap.get('id');
    if (postId) {
      this.loadPost(Number(postId));
    } else {
      this.error.set('Invalid post ID.');
      this.loading.set(false);
    }
  }

  loadPost(id: number): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      post: this.managementService.getPostById(id),
      reports: this.managementService.getReportsForPost(id).pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ post, reports }) => {
        this.post.set(post);
        this.reports.set(reports || []);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error fetching post details:', err);
        this.error.set('Failed to load post details.');
        this.loading.set(false);
      }
    });
  }

  private router = inject(Router);

  goToUser(userId: number | undefined) {
    if (userId) {
      this.router.navigate(['/users', userId]);
    }
  }

  goBack(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/timeline']);
    }
  }

  setTab(tab: 'comments' | 'likes' | 'reports'): void {
    this.activeTab.set(tab);
  }

  async updateStatus(statusId: number, statusLabel: string): Promise<void> {
    const currentPost = this.post();
    if (!currentPost) return;

    const confirmed = await this.confirmService.confirm({
      message: `Are you sure you want to change this post status to ${statusLabel}?`,
      title: 'Update Status',
      confirmText: 'Update'
    });

    if (!confirmed) return;

    this.loading.set(true);
    this.managementService.updatePostState(currentPost.id, statusId).subscribe({
      next: () => {
        this.toastService.success(`Status updated to ${statusLabel}`);
        this.loadPost(currentPost.id);
      },
      error: (err) => {
        console.error('Error updating post status:', err);
        this.toastService.error('Failed to update post status.');
        this.loading.set(false);
      }
    });
  }

  async deletePost(): Promise<void> {
    const currentPost = this.post();
    if (!currentPost) return;

    const confirmed = await this.confirmService.confirm({
      title: 'Delete Post',
      message: 'Are you sure you want to delete this post? This action cannot be undone.',
      confirmText: 'Yes, Delete',
      type: 'danger'
    });

    if (!confirmed) return;

    this.loading.set(true);
    this.managementService.updatePostState(currentPost.id, 5).subscribe({
      next: () => {
        this.toastService.success('Post has been deleted successfully.', 'Post Deleted');
        this.router.navigate(['/timeline']);
      },
      error: (err) => {
        console.error('Error deleting post:', err);
        this.toastService.error('Failed to delete post. Please try again.', 'Error');
        this.loading.set(false);
      }
    });
  }
}
