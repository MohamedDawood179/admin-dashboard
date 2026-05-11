import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <!-- Premium Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div>
          <div class="flex items-center gap-2 mb-1">
             <span class="w-2 h-6 bg-primary rounded-full"></span>
             <h1 class="text-3xl font-black text-gray-900 tracking-tight uppercase italic">Intelligence Hub</h1>
          </div>
          <p class="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em] ml-5">Advanced Analytical Reports</p>
        </div>
        
        <div class="flex items-center gap-3">
           <button class="px-5 py-2.5 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-primary shadow-sm hover:bg-primary hover:text-white transition-all">
              <i class="fas fa-file-export mr-2"></i> Export PDF
           </button>
           <button class="primary-button flex items-center gap-2 shadow-lg shadow-primary/20">
              <i class="fas fa-plus"></i> New Report
           </button>
        </div>
      </div>

      <!-- Main Reports Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         <!-- Large Overview Card -->
         <div class="lg:col-span-2 card p-10 bg-gradient-to-br from-white to-gray-50/50 relative overflow-hidden group">
            <div class="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-10 transition-opacity pointer-events-none">
               <i class="fas fa-chart-line text-[15rem] -rotate-12"></i>
            </div>
            
            <div class="flex items-center justify-between mb-12 relative z-10">
               <div>
                  <h3 class="text-xl font-black text-gray-900 uppercase italic tracking-tight">Growth Projection</h3>
                  <p class="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Projected vs actual system engagement</p>
               </div>
               <div class="flex gap-2">
                  <span class="px-3 py-1 bg-green-50 text-green-500 text-[9px] font-black rounded-lg border border-green-100">+24% GROWTH</span>
               </div>
            </div>

            <!-- CSS-Based Growth Visualization -->
            <div class="h-64 flex items-end justify-between gap-4 border-b border-gray-100 pb-2 relative z-10">
               <div *ngFor="let i of [40, 65, 45, 80, 55, 90, 75]" 
                    [style.height.%]="i"
                    class="flex-1 bg-gradient-to-t from-primary/10 to-primary/40 rounded-t-2xl transition-all duration-1000 hover:from-primary hover:to-blue-400 cursor-pointer group/bar relative">
                  <span class="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-black text-primary opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap">{{i}}%</span>
               </div>
            </div>
            <div class="flex justify-between mt-4">
               <span *ngFor="let m of ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL']" class="text-[9px] font-black text-gray-300 tracking-widest">{{m}}</span>
            </div>
         </div>

         <!-- Sidestats Column -->
         <div class="space-y-6">
            <div class="card p-8 group hover:border-primary/20 transition-all cursor-pointer">
               <div class="flex items-center gap-4 mb-6">
                  <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center text-xl shadow-inner">
                     <i class="fas fa-users"></i>
                  </div>
                  <div>
                     <p class="text-[10px] text-gray-400 font-black uppercase tracking-widest">User Base</p>
                     <p class="text-2xl font-black text-gray-900">12,450</p>
                  </div>
               </div>
               <div class="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                  <div class="h-full bg-blue-500 w-3/4 rounded-full"></div>
               </div>
            </div>

            <div class="card p-8 group hover:border-orange-200 transition-all cursor-pointer">
               <div class="flex items-center gap-4 mb-6">
                  <div class="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center text-xl shadow-inner">
                     <i class="fas fa-paw"></i>
                  </div>
                  <div>
                     <p class="text-[10px] text-gray-400 font-black uppercase tracking-widest">Total Pets</p>
                     <p class="text-2xl font-black text-gray-900">8,920</p>
                  </div>
               </div>
               <div class="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                  <div class="h-full bg-orange-500 w-1/2 rounded-full"></div>
               </div>
            </div>

            <div class="card p-8 group hover:border-green-200 transition-all cursor-pointer bg-gray-900 border-none shadow-2xl">
               <div class="flex items-center gap-4 mb-6">
                  <div class="w-12 h-12 rounded-2xl bg-white/10 text-green-400 flex items-center justify-center text-xl shadow-inner">
                     <i class="fas fa-coins"></i>
                  </div>
                  <div>
                     <p class="text-[10px] text-gray-400 font-black uppercase tracking-widest text-white/40">Total Value</p>
                     <p class="text-2xl font-black text-white">$45,210</p>
                  </div>
               </div>
               <div class="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div class="h-full bg-gradient-to-r from-green-500 to-teal-400 w-2/3 rounded-full"></div>
               </div>
            </div>
         </div>
      </div>

      <!-- Secondary Data Set -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div class="card p-8">
            <h3 class="text-sm font-black text-gray-900 uppercase tracking-widest mb-8 border-b border-gray-50 pb-4 flex items-center gap-2">
               <i class="fas fa-map-marker-alt text-red-500"></i> Regional Activity
            </h3>
            <div class="space-y-6">
               <div *ngFor="let region of [{n:'Cairo', v:85, c:'bg-blue-500'}, {n:'Alexandria', v:45, c:'bg-purple-500'}, {n:'Giza', v:30, c:'bg-orange-500'}]" class="flex items-center gap-4">
                  <span class="text-[9px] font-black text-gray-500 uppercase tracking-widest w-24">{{region.n}}</span>
                  <div class="flex-1 h-3 bg-gray-50 rounded-lg overflow-hidden flex">
                     <div [style.width.%]="region.v" [class]="region.c + ' h-full transition-all duration-[2s] rounded-r-lg'"></div>
                  </div>
                  <span class="text-[10px] font-black text-gray-900">{{region.v}}%</span>
               </div>
            </div>
         </div>

         <div class="card p-8 bg-primary border-none shadow-2xl relative overflow-hidden group">
            <div class="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div class="relative z-10">
               <p class="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mb-2">Automated Insight</p>
               <h3 class="text-2xl font-black text-white italic uppercase tracking-tight mb-6 leading-tight">System performance is exceeding Q1 benchmarks by 15%.</h3>
               <button class="px-8 py-3 bg-white text-primary rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all">
                  Optimize Backend
               </button>
            </div>
         </div>
      </div>
    </div>
  `
})
export class ReportsComponent {}
