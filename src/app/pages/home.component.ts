import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { Attribution } from '../core/models';
import { TIMING_LABEL, Timing, carCategoryLabel, personnelCategoryLabel, timing } from '../core/util';

type Filter = 'ALL' | Timing;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, DatePipe],
  template: `
    <div class="page-head">
      <div>
        <h1>Attributions</h1>
        <p class="sub">{{ items().length }} en cours ou à venir</p>
      </div>
    </div>

    <div class="toolbar">
      <input class="search" type="search" placeholder="Rechercher un nom, un chauffeur, une matricule"
             [value]="query()" (input)="query.set($any($event.target).value)" aria-label="Rechercher" />
      <div class="chips" role="group" aria-label="Filtrer">
        @for (f of filters; track f.value) {
          <button class="chip" type="button" [attr.aria-pressed]="filter() === f.value" (click)="filter.set(f.value)">
            {{ f.label }}
          </button>
        }
      </div>
    </div>

    @if (loading()) {
      <p class="empty">Chargement…</p>
    } @else if (visible().length === 0) {
      <div class="empty">
        <strong>Aucune attribution</strong>
        Appuyez sur « Ajouter » pour attribuer une voiture à une personne.
      </div>
    } @else {
      <div class="cards">
        @for (a of visible(); track a.id) {
          <a class="card" [class]="'card c-' + a.car.category.toLowerCase()" [routerLink]="['/attributions', a.id]">
            <div class="card-top">
              <span class="plate">{{ a.car.matricule }}</span>
              <span class="badge" [class]="'badge ' + timingKey(a)">{{ timingLabel(a) }}</span>
            </div>
            <div class="card-name">{{ a.personnel.name }}</div>
            <div class="card-line">
              <span class="badge" [class]="'badge ' + a.personnel.category.toLowerCase()">{{ personnelLabel(a.personnel.category) }}</span>
              &nbsp;{{ carLabel(a.car.category) }}, {{ a.car.type }}
            </div>
            <div class="card-line">Chauffeur : {{ a.driver.name }}</div>
            <div class="card-time">
              {{ a.startAt | date: 'EEE d MMM, HH:mm' }} &rarr; {{ a.endAt | date: sameDay(a) ? 'HH:mm' : 'EEE d MMM, HH:mm' }}
            </div>
          </a>
        }
      </div>
    }

    <a class="btn primary fab" routerLink="/attributions/new">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
      Ajouter
    </a>
  `,
})
export class HomeComponent implements OnInit {
  private api = inject(ApiService);

  items = signal<Attribution[]>([]);
  loading = signal(true);
  query = signal('');
  filter = signal<Filter>('NOW');

  filters: { value: Filter; label: string }[] = [
    { value: 'ALL', label: 'Toutes' },
    { value: 'NOW', label: 'En cours' },
    { value: 'SOON', label: 'À venir' },
    { value: 'OVERDUE', label: 'À clôturer' },
  ];

  visible = computed(() => {
    const q = this.query().trim().toLowerCase();
    const f = this.filter();
    return this.items().filter((a) => {
      if (f !== 'ALL' && timing(a) !== f) return false;
      if (!q) return true;
      return [a.personnel.name, a.driver.name, a.car.matricule, a.destination ?? '']
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  });

  ngOnInit() {
    this.api.attributions().subscribe({
      next: (list) => {
        this.items.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  timingKey = (a: Attribution) => timing(a).toLowerCase();
  timingLabel = (a: Attribution) => TIMING_LABEL[timing(a)];
  personnelLabel = personnelCategoryLabel;
  carLabel = carCategoryLabel;
  sameDay = (a: Attribution) => new Date(a.startAt).toDateString() === new Date(a.endAt).toDateString();
}
