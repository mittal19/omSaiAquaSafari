import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-yachtOptions',
  standalone: true,
  imports: [CommonModule,  RouterModule],
  templateUrl: './yachtOptions.component.html',
  styleUrl: './yachtOptions.component.css'
})
export class YachtOptionsComponent {
}