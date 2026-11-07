import { Component, ElementRef, OnInit, computed, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { Car } from '../core/models';
import { ToastService } from '../core/toast.service';
import { CAR_CATEGORIES, carCategoryLabel } from '../core/util';

const empty = (): Car => ({ matricule: '', places: 4, type: '', category: 'SERVICE_NORMALE', status: 'AVAILABLE' });

@Component({
  selector: 'app-cars',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="page-head">
      <div>
        <h1>Voitures</h1>
        <p class="sub">{{ items().length }} voiture(s)</p>
      </div>
      <button class="btn primary" type="button" (click)="open()">Ajouter une voiture</button>
    </div>

    <div class="toolbar">
      <input class="search" type="search" placeholder="Rechercher une matricule ou un type" aria-label="Rechercher"
             [value]="query()" (input)="query.set($any($event.target).value)" />
      <div class="chips" role="group" aria-label="Catégorie">
        <button class="chip" type="button" [attr.aria-pressed]="cat() === ''" (click)="cat.set('')">Toutes</button>
        @for (c of categories; track c.value) {
          <button class="chip" type="button" [attr.aria-pressed]="cat() === c.value" (click)="cat.set(c.value)">{{ c.label }}</button>
        }
      </div>
    </div>

    <div class="rows">
      @for (c of visible(); track c.id) {
        <div class="row">
          <span class="plate">{{ c.matricule }}</span>
          <div class="grow">
            <div class="title">{{ c.type }}</div>
            <div class="meta">{{ c.places }} places</div>
          </div>
          <span class="badge" [class]="'badge ' + c.category.toLowerCase()">{{ label(c.category) }}</span>
          @if (c.status === 'MAINTENANCE') { <span class="badge off">En maintenance</span> }
          <div class="actions">
            <button class="btn small" type="button" (click)="open(c)">Modifier</button>
            <button class="btn small danger" type="button" (click)="remove(c)">Supprimer</button>
          </div>
        </div>
      } @empty {
        <p class="empty"><strong>Aucune voiture</strong>Ajoutez votre première voiture.</p>
      }
    </div>

    <dialog #dlg class="sheet">
      <div class="sheet-body">
        <h2>{{ form.id ? 'Modifier la voiture' : 'Nouvelle voiture' }}</h2>
        <div class="field"><label for="c-mat">Matricule</label><input id="c-mat" class="input" [(ngModel)]="form.matricule" /></div>
        <div class="grid-2">
          <div class="field"><label for="c-type">Type</label><input id="c-type" class="input" placeholder="Berline, 4x4, minibus…" [(ngModel)]="form.type" /></div>
          <div class="field"><label for="c-places">Nombre de places</label><input id="c-places" class="input" type="number" min="1" inputmode="numeric" [(ngModel)]="form.places" /></div>
        </div>
        <div class="field">
          <label for="c-cat">Catégorie</label>
          <select id="c-cat" class="input" [(ngModel)]="form.category">
            @for (c of categories; track c.value) { <option [value]="c.value">{{ c.label }}</option> }
          </select>
        </div>
        <div class="field">
          <label for="c-status">Statut</label>
          <select id="c-status" class="input" [(ngModel)]="form.status">
            <option value="AVAILABLE">Disponible</option>
            <option value="MAINTENANCE">En maintenance</option>
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
export class CarsComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  dlg = viewChild.required<ElementRef<HTMLDialogElement>>('dlg');

  items = signal<Car[]>([]);
  query = signal('');
  cat = signal('');
  form: Car = empty();
  categories = CAR_CATEGORIES;
  label = carCategoryLabel;

  visible = computed(() => {
    const q = this.query().trim().toLowerCase();
    const c = this.cat();
    return this.items().filter(
      (x) => (!c || x.category === c) && (!q || (x.matricule + ' ' + x.type).toLowerCase().includes(q)),
    );
  });

  ngOnInit() { this.load(); }
  load() { this.api.cars().subscribe((l) => this.items.set(l)); }

  open(c?: Car) {
    this.form = c ? { ...c } : empty();
    this.dlg().nativeElement.showModal();
  }
  close() { this.dlg().nativeElement.close(); }

  save() {
    this.form.matricule = this.form.matricule.trim().toUpperCase();
    this.api.saveCar(this.form).subscribe(() => {
      this.toast.ok('Voiture enregistrée.');
      this.close();
      this.load();
    });
  }

  remove(c: Car) {
    if (!confirm(`Supprimer la voiture ${c.matricule} ?`)) return;
    this.api.deleteCar(c.id!).subscribe(() => {
      this.toast.ok('Voiture supprimée.');
      this.load();
    });
  }
}
