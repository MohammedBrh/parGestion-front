import { Component, ElementRef, OnInit, computed, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { Driver } from '../core/models';
import { ToastService } from '../core/toast.service';
import { cleanPhone, dialNumber } from '../core/util';

const empty = (): Driver => ({ name: '', phone: '', licenseNumber: '', status: 'AVAILABLE' });

@Component({
  selector: 'app-drivers',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="page-head">
      <div>
        <h1>Chauffeurs</h1>
        <p class="sub">{{ items().length }} chauffeur(s)</p>
      </div>
      <button class="btn primary" type="button" (click)="open()">Ajouter un chauffeur</button>
    </div>

    <div class="toolbar">
      <input class="search" type="search" placeholder="Rechercher" aria-label="Rechercher"
             [value]="query()" (input)="query.set($any($event.target).value)" />
    </div>

    <div class="rows">
      @for (d of visible(); track d.id) {
        <div class="row">
          <div class="grow">
            <div class="title">{{ d.name }}</div>
            <div class="meta">{{ d.phone }} &nbsp;Permis : {{ d.licenseNumber || 'non renseigné' }}</div>
          </div>
          @if (d.status === 'OFF') { <span class="badge off">Indisponible</span> }
          <div class="actions">
            <a class="btn small" [href]="'tel:' + dial(d.phone)">Appeler</a>
            <button class="btn small" type="button" (click)="open(d)">Modifier</button>
            <button class="btn small danger" type="button" (click)="remove(d)">Supprimer</button>
          </div>
        </div>
      } @empty {
        <p class="empty"><strong>Aucun chauffeur</strong>Ajoutez votre premier chauffeur.</p>
      }
    </div>

    <dialog #dlg class="sheet">
      <div class="sheet-body">
        <h2>{{ form.id ? 'Modifier le chauffeur' : 'Nouveau chauffeur' }}</h2>
        <div class="field"><label for="d-name">Nom</label><input id="d-name" class="input" [(ngModel)]="form.name" /></div>
        <div class="field"><label for="d-phone">Téléphone</label><input id="d-phone" class="input" type="tel" inputmode="tel" [(ngModel)]="form.phone" /></div>
        <div class="field"><label for="d-lic">N° de permis</label><input id="d-lic" class="input" [(ngModel)]="form.licenseNumber" /></div>
        <div class="field">
          <label for="d-status">Statut</label>
          <select id="d-status" class="input" [(ngModel)]="form.status">
            <option value="AVAILABLE">Disponible</option>
            <option value="OFF">Indisponible (congé, absent)</option>
          </select>
        </div>
      </div>
      <div class="sheet-foot">
        <button class="btn" type="button" (click)="close()">Annuler</button>
        <button class="btn primary" type="button" (click)="save()">Enregistrer</button>
      </div>
    </dialog>
  `,
})
export class DriversComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  dlg = viewChild.required<ElementRef<HTMLDialogElement>>('dlg');

  items = signal<Driver[]>([]);
  query = signal('');
  form: Driver = empty();
  dial = dialNumber;

  visible = computed(() => {
    const q = this.query().trim().toLowerCase();
    return this.items().filter((d) => !q || (d.name + ' ' + d.phone).toLowerCase().includes(q));
  });

  ngOnInit() { this.load(); }
  load() { this.api.drivers().subscribe((l) => this.items.set(l)); }

  open(d?: Driver) {
    this.form = d ? { ...d } : empty();
    this.dlg().nativeElement.showModal();
  }
  close() { this.dlg().nativeElement.close(); }

  save() {
    this.form.phone = cleanPhone(this.form.phone);
    this.api.saveDriver(this.form).subscribe(() => {
      this.toast.ok('Chauffeur enregistré.');
      this.close();
      this.load();
    });
  }

  remove(d: Driver) {
    if (!confirm(`Supprimer ${d.name} ?`)) return;
    this.api.deleteDriver(d.id!).subscribe(() => {
      this.toast.ok('Chauffeur supprimé.');
      this.load();
    });
  }
}
