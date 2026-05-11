import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecentActivity } from '../../../core/models/dashboard.models';

@Component({
  selector: 'app-activity-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex gap-4 group animate-slide-in">
      <div class="relative">
        <div class="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-100 border-2 border-white shadow-sm group-hover:scale-110 transition-transform">
          <img [src]="activity.imageUrl || 'https://ui-avatars.com/api/?name=' + activity.type" class="w-full h-full object-cover">
        </div>
        <div class="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary border-2 border-white flex items-center justify-center">
          <i class="fas fa-paw text-[8px] text-white"></i>
        </div>
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex justify-between items-start">
          <p class="text-sm font-bold text-gray-900 truncate">{{activity.title}}</p>
          <span class="text-[10px] font-bold text-gray-400 whitespace-nowrap ml-2">{{activity.time | date:'shortTime'}}</span>
        </div>
        <p class="text-xs text-gray-500 mt-0.5 line-clamp-2">{{activity.description}}</p>
      </div>
    </div>
  `
})
export class ActivityItemComponent {
  @Input({ required: true }) activity!: RecentActivity;
}
