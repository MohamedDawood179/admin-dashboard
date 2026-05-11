import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card group hover:scale-[1.02] transition-all cursor-pointer relative overflow-hidden">
      <div class="absolute -right-4 -top-4 w-24 h-24 bg-primary opacity-[0.03] rounded-full group-hover:scale-150 transition-transform duration-500"></div>
      <div class="flex justify-between items-start mb-4">
        <div class="p-3 rounded-xl bg-primary bg-opacity-10 text-primary group-hover:bg-primary group-hover:text-white transition-all">
          <i [class]="'fas fa-' + icon + ' text-xl'"></i>
        </div>
        <div [class]="'flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ' + (isPositive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600')">
          <i [class]="'fas fa-trending-' + (isPositive ? 'up' : 'down')"></i>
          {{trend}}%
        </div>
      </div>
      <p class="text-sm font-semibold text-gray-500 uppercase tracking-wider">{{title}}</p>
      <h2 class="text-3xl font-bold mt-1 text-gray-900">{{value}}</h2>
    </div>
  `
})
export class StatCardComponent {
  @Input() title: string = '';
  @Input() value: string = '';
  @Input() trend: number = 0;
  @Input() isPositive: boolean = true;
  @Input() icon: string = '';
}
