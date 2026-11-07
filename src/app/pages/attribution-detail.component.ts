import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { Attribution } from '../core/models';
import { ToastService } from '../core/toast.service';
import { TIMING_LABEL, carCategoryLabel, dialNumber, personnelCategoryLabel, timing } from '../core/util';

@Component({
  selector: 'app-attribution-detail',
  standalone: true,
  imports: [RouterLink, DatePipe],
  template: `
    <a class="back" routerLink="/">&larr; Retour aux attributions</a>

    @if (a(); as a) {
      <div class="page-head">
        <div>
          <h1><span class="plate">{{ a.car.matricule }}</span></h1>
          <p class="sub">{{ timingLabel() }}, du {{ a.startAt | date: 'EEE d MMM, HH:mm' }} au {{ a.endAt | date: 'EEE d MMM, HH:mm' }}</p>
        </div>
      </div>

      <section class="panel">
        <h2>Personne attribuée</h2>
        <div class="big">{{ a.personnel.name }}</div>
        <dl class="kv">
          <dt>Catégorie</dt><dd>{{ personnelLabel(a.personnel.category) }}</dd>
          <dt>Téléphone</dt><dd>{{ a.personnel.phone }}</dd>
          <dt>Passagers</dt><dd>{{ a.passengers }}</dd>
          @if (a.destination) { <dt>Destination</dt><dd>{{ a.destination }}</dd> }
        </dl>

        <div class="contact-actions">
          <a class="btn dark" [href]="'tel:' + dial(a.personnel.phone)">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg>
            Appeler
          </a>
          <a class="btn primary" [href]="smsLink()">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z"/></svg>
            Envoyer un message
          </a>
        </div>
        <a class="link-quiet" [href]="whatsappLink()" target="_blank" rel="noopener">Envoyer par WhatsApp</a>
      </section>

      <section class="panel">
        <h2>Chauffeur</h2>
        <div class="big">{{ a.driver.name }}</div>
        <dl class="kv"><dt>Téléphone</dt><dd>{{ a.driver.phone }}</dd></dl>
        <div class="contact-actions">
          <a class="btn" [href]="'tel:' + dial(a.driver.phone)">Appeler le chauffeur</a>
        </div>
      </section>

      <section class="panel">
        <h2>Voiture</h2>
        <dl class="kv">
          <dt>Matricule</dt><dd>{{ a.car.matricule }}</dd>
          <dt>Type</dt><dd>{{ a.car.type }}</dd>
          <dt>Catégorie</dt><dd>{{ carLabel(a.car.category) }}</dd>
          <dt>Places</dt><dd>{{ a.car.places }}</dd>
          @if (a.notes) { <dt>Notes</dt><dd>{{ a.notes }}</dd> }
        </dl>
      </section>

      <div class="contact-actions">
        <button class="btn" type="button" (click)="finish()">Terminer</button>
        <button class="btn danger" type="button" (click)="cancel()">Annuler l'attribution</button>
      </div>
    } @else if (!loading()) {
      <p class="empty"><strong>Attribution introuvable</strong></p>
    }
  `,
})
export class AttributionDetailComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);

  a = signal<Attribution | null>(null);
  loading = signal(true);

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.attribution(id).subscribe({
      next: (x) => {
        this.a.set(x);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  timingLabel = computed(() => {
    const a = this.a();
    return a ? TIMING_LABEL[timing(a)] : '';
  });

  dial = dialNumber;
  personnelLabel = personnelCategoryLabel;
  carLabel = carCategoryLabel;

  /** Message sent to the person: who their driver is and how to reach him. */
  private message(): string {
    const a = this.a()!;
    const start = new Date(a.startAt).toLocaleString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    return (
      `Bonjour ${a.personnel.name}, votre chauffeur est ${a.driver.name}, ` +
      `tél. ${dialNumber(a.driver.phone)}. Voiture : ${a.car.matricule}. Départ : ${start}.`
    );
  }

  smsLink = () => `sms:${dialNumber(this.a()!.personnel.phone)}?&body=${encodeURIComponent(this.message())}`;
  whatsappLink = () =>
    `https://wa.me/${dialNumber(this.a()!.personnel.phone).replace('+', '')}?text=${encodeURIComponent(this.message())}`;

  finish() {
    this.api.completeAttribution(this.a()!.id).subscribe(() => {
      this.toast.ok('Attribution terminée.');
      this.router.navigate(['/']);
    });
  }

  cancel() {
    if (!confirm('Annuler cette attribution ?')) return;
    this.api.cancelAttribution(this.a()!.id).subscribe(() => {
      this.toast.ok('Attribution annulée.');
      this.router.navigate(['/']);
    });
  }
}
