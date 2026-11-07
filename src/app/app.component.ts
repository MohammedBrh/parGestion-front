import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ToastService } from './core/toast.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="shell">
      <nav class="nav" aria-label="Navigation principale">
        <a class="brand" routerLink="/">
          <span class="brand-mark" aria-hidden="true">P</span>
          <span class="brand-name">Parc auto</span>
        </a>
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>
          <span>Accueil</span>
        </a>
        <a routerLink="/chauffeurs" routerLinkActive="active">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.5"/><path d="M12 3v6.5M4.5 15.5l6-2.5M19.5 15.5l-6-2.5"/></svg>
          <span>Chauffeurs</span>
        </a>
        <a routerLink="/voitures" routerLinkActive="active">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 16V12l2-5h10l2 5v4M3 16h18v3H3zM7 19v1.5M17 19v1.5"/><circle cx="7.5" cy="13.5" r=".6"/><circle cx="16.5" cy="13.5" r=".6"/></svg>
          <span>Voitures</span>
        </a>
        <a routerLink="/personnel" routerLinkActive="active">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 5.5a3 3 0 0 1 0 5.8M18 14.5c1.9.8 3 2.7 3 5.5"/></svg>
          <span>Personnel</span>
        </a>
      </nav>
      <main class="content"><router-outlet /></main>
    </div>

    @if (toast.toast(); as t) {
      <div class="toast" [class.error]="t.kind === 'error'" role="status" aria-live="polite">{{ t.text }}</div>
    }
  `,
})
export class AppComponent {
  toast = inject(ToastService);
}
