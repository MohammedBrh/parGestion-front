import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { Car, Driver, Personnel } from '../core/models';
import { ToastService } from '../core/toast.service';
import { carCategoryLabel, personnelCategoryLabel, toLocalInput } from '../core/util';

const STEPS = ['Personne', 'Dates', 'Voiture', 'Chauffeur', 'Confirmation'];

@Component({
  selector: 'app-attribution-form',
  standalone: true,
  imports: [FormsModule, RouterLink, DatePipe],
  template: `
    <a class="back" routerLink="/">&larr; Annuler</a>
    <div class="steps" aria-hidden="true">
      @for (s of stepNames; track s; let i = $index) {
        <span [class.done]="i < step()" [class.current]="i === step()"></span>
      }
    </div>

    @switch (step()) {
      @case (0) {
        <h1 class="step-title">À qui attribuer la voiture ?</h1>
        <input class="search" style="width:100%" type="search" placeholder="Rechercher une personne"
               [value]="query()" (input)="query.set($any($event.target).value)" aria-label="Rechercher une personne" />
        <div class="pick">
          @for (p of filteredPersonnel(); track p.id) {
            <button type="button" [attr.aria-pressed]="personnel()?.id === p.id" (click)="personnel.set(p)">
              <span>
                <strong>{{ p.name }}</strong><br />
                <span class="hint">{{ p.phone }}</span>
              </span>
              <span class="badge" [class]="'badge ' + p.category.toLowerCase()">{{ pLabel(p.category) }}</span>
            </button>
          } @empty {
            <p class="empty"><strong>Aucune personne</strong>Ajoutez-la d'abord dans « Personnel ».</p>
          }
        </div>
      }

      @case (1) {
        <h1 class="step-title">Quand et pour quoi ?</h1>
        <div class="grid-2" style="margin-top:12px">
          <div class="field">
            <label for="start">Début</label>
            <input id="start" class="input" type="datetime-local" [(ngModel)]="start" />
          </div>
          <div class="field">
            <label for="end">Fin</label>
            <input id="end" class="input" type="datetime-local" [(ngModel)]="end" />
          </div>
          <div class="field">
            <label for="pax">Nombre de passagers</label>
            <input id="pax" class="input" type="number" min="1" inputmode="numeric" [(ngModel)]="passengers" />
          </div>
          <div class="field">
            <label for="dest">Destination (facultatif)</label>
            <input id="dest" class="input" type="text" [(ngModel)]="destination" />
          </div>
        </div>
        <div class="field">
          <label for="notes">Notes (facultatif)</label>
          <textarea id="notes" class="input" [(ngModel)]="notes"></textarea>
        </div>
        @if (dateError()) { <p class="hint" style="color:var(--red)">{{ dateError() }}</p> }
      }

      @case (2) {
        <h1 class="step-title">Choisir la voiture</h1>
        <p class="hint">Voitures libres sur cette période.</p>
        <div class="pick">
          @for (c of cars(); track c.id) {
            <button type="button" [disabled]="!!carProblem(c)" [attr.aria-pressed]="car()?.id === c.id" (click)="car.set(c)">
              <span>
                <span class="plate">{{ c.matricule }}</span>
                <span class="hint">&nbsp;{{ c.type }}, {{ c.places }} places</span>
              </span>
              <span class="badge" [class]="'badge ' + c.category.toLowerCase()">{{ cLabel(c.category) }}</span>
              @if (carProblem(c); as why) { <span class="why">{{ why }}</span> }
            </button>
          } @empty {
            <p class="empty"><strong>Aucune voiture libre</strong>Changez les dates ou ajoutez une voiture.</p>
          }
        </div>
      }

      @case (3) {
        <h1 class="step-title">Choisir le chauffeur</h1>
        <p class="hint">Chauffeurs libres sur cette période.</p>
        <div class="pick">
          @for (d of drivers(); track d.id) {
            <button type="button" [attr.aria-pressed]="driver()?.id === d.id" (click)="driver.set(d)">
              <span>
                <strong>{{ d.name }}</strong><br />
                <span class="hint">{{ d.phone }}</span>
              </span>
            </button>
          } @empty {
            <p class="empty"><strong>Aucun chauffeur libre</strong>Changez les dates ou ajoutez un chauffeur.</p>
          }
        </div>
      }

      @case (4) {
        <h1 class="step-title">Vérifier et confirmer</h1>
        <section class="panel" style="margin-top:12px">
          <dl class="kv">
            <dt>Personne</dt><dd>{{ personnel()?.name }} ({{ personnel()?.phone }})</dd>
            <dt>Voiture</dt><dd>{{ car()?.matricule }}, {{ car()?.type }}</dd>
            <dt>Chauffeur</dt><dd>{{ driver()?.name }} ({{ driver()?.phone }})</dd>
            <dt>Début</dt><dd>{{ start | date: 'EEE d MMM y, HH:mm' }}</dd>
            <dt>Fin</dt><dd>{{ end | date: 'EEE d MMM y, HH:mm' }}</dd>
            <dt>Passagers</dt><dd>{{ passengers }}</dd>
            @if (destination) { <dt>Destination</dt><dd>{{ destination }}</dd> }
            @if (notes) { <dt>Notes</dt><dd>{{ notes }}</dd> }
          </dl>
        </section>
      }
    }

    <div class="wizard-nav">
      @if (step() > 0) {
        <button class="btn" type="button" (click)="back()">Retour</button>
      }
      <span class="spacer"></span>
      @if (step() < 4) {
        <button class="btn primary" type="button" [disabled]="!canNext()" (click)="next()">Continuer</button>
      } @else {
        <button class="btn primary" type="button" [disabled]="saving()" (click)="save()">Confirmer l'attribution</button>
      }
    </div>
  `,
})
export class AttributionFormComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  private toast = inject(ToastService);

  stepNames = STEPS;
  step = signal(0);
  saving = signal(false);

  allPersonnel = signal<Personnel[]>([]);
  query = signal('');
  filteredPersonnel = computed(() => {
    const q = this.query().trim().toLowerCase();
    return this.allPersonnel().filter((p) => !q || (p.name + ' ' + p.phone).toLowerCase().includes(q));
  });

  personnel = signal<Personnel | null>(null);
  car = signal<Car | null>(null);
  driver = signal<Driver | null>(null);
  cars = signal<Car[]>([]);
  drivers = signal<Driver[]>([]);

  start = '';
  end = '';
  passengers = 1;
  destination = '';
  notes = '';

  ngOnInit() {
    const s = new Date();
    s.setMinutes(0, 0, 0);
    s.setHours(s.getHours() + 1);
    const e = new Date(s.getTime() + 2 * 3600_000);
    this.start = toLocalInput(s);
    this.end = toLocalInput(e);
    this.api.personnel().subscribe((l) => this.allPersonnel.set(l));
  }

  pLabel = personnelCategoryLabel;
  cLabel = carCategoryLabel;

  dateError(): string {
    if (!this.start || !this.end) return 'Renseignez le début et la fin.';
    if (new Date(this.end) <= new Date(this.start)) return 'La fin doit être après le début.';
    if (new Date(this.end) < new Date()) return 'La fin est déjà passée.';
    if (!this.passengers || this.passengers < 1) return 'Au moins 1 passager.';
    return '';
  }

  /** Same rules as the server (the server remains the authority). */
  carProblem(c: Car): string {
    if (c.places < this.passengers) return `Seulement ${c.places} places pour ${this.passengers} passagers.`;
    if (this.personnel()?.category === 'VIP' && c.category !== 'VIP' && c.category !== 'SERVICE_CLASS')
      return 'Une personne VIP nécessite une voiture VIP ou Service classe.';
    return '';
  }

  canNext(): boolean {
    switch (this.step()) {
      case 0: return !!this.personnel();
      case 1: return !this.dateError();
      case 2: return !!this.car();
      case 3: return !!this.driver();
      default: return true;
    }
  }

  next() {
    const s = this.step();
    if (s === 1) {
      this.car.set(null);
      this.driver.set(null);
      this.api.availableCars(this.start, this.end).subscribe((l) => {
        this.cars.set(l);
        this.step.set(2);
      });
      return;
    }
    if (s === 2) {
      this.api.availableDrivers(this.start, this.end).subscribe((l) => {
        this.drivers.set(l);
        this.step.set(3);
      });
      return;
    }
    this.step.set(s + 1);
  }

  back() {
    this.step.update((s) => Math.max(0, s - 1));
  }

  save() {
    this.saving.set(true);
    this.api
      .createAttribution({
        carId: this.car()!.id!,
        driverId: this.driver()!.id!,
        personnelId: this.personnel()!.id!,
        startAt: this.start,
        endAt: this.end,
        passengers: this.passengers,
        destination: this.destination.trim(),
        notes: this.notes.trim(),
      })
      .subscribe({
        next: () => {
          this.toast.ok('Attribution enregistrée.');
          this.router.navigate(['/']);
        },
        error: () => this.saving.set(false),
      });
  }
}
