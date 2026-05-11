import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmService {
  private confirmSubject = new Subject<boolean>();
  
  // Signal to control visibility and options
  activeConfirm = signal<ConfirmOptions | null>(null);

  confirm(options: ConfirmOptions | string): Promise<boolean> {
    if (typeof options === 'string') {
      options = { message: options };
    }
    
    this.activeConfirm.set({
      title: options.title || 'Are you sure?',
      message: options.message,
      confirmText: options.confirmText || 'Confirm',
      cancelText: options.cancelText || 'Cancel',
      type: options.type || 'warning'
    });

    return new Promise((resolve) => {
      const subscription = this.confirmSubject.subscribe((result) => {
        subscription.unsubscribe();
        resolve(result);
      });
    });
  }

  resolve(result: boolean) {
    this.activeConfirm.set(null);
    this.confirmSubject.next(result);
  }
}
