import { Component, ElementRef, OnInit, computed, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { Personnel } from '../core/models';
import { ToastService } from '../core/toast.service';
import { PERSONNEL_CATEGORIES, cleanPhone, dialNumber, personnelCategoryLabel } from '../core/util';

const empty = (): Personnel => ({ name: '', phone: '', category: 'EMPLOYEE' });

@Component({
  selector: 'app-personnel',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="page-head">
      <div>
        <h1>Personnel</h1>
        <p class="sub">{{ items().length }} personne(s)</p>
      </div>
      <button class="btn primary" type="button" (click)="open()">Ajouter une personne</button>
    </div>

    <div class="toolbar">
      <input class="search" type="search" placeholder="Rechercher" aria-label="Rechercher"
             [value]="query()" (input)="query.set($any($event.target).value)" />
      <div class="chips" role="group" aria-label="Catégorie">
        <button class="chip" type="button" [attr.aria-pressed]="cat() === ''" (click)="cat.set('')">Tous</button>
        @for (c of categories; track c.value) {
          <button class="chip" type="button" [attr.aria-pressed]="cat() === c.value" (click)="cat.set(c.value)">{{ c.label }}</button>
        }
      </div>
    </div>

    <div class="rows">
      @for (p of visible(); track p.id) {
        <div class="row">
          <div class="grow">
            <div class="title">{{ p.name }}</div>
            <div class="meta">{{ p.phone }}</div>
          </div>
          <span class="badge" [class]="'badge ' + p.category.toLowerCase()">{{ label(p.category) }}</span>
          <div class="actions">
            <a class="btn small" [href]="'tel:' + dial(p.phone)">Appeler</a>
            <button class="btn small" type="button" (click)="open(p)">Modifier</button>
            <button class="btn small danger" type="button" (click)="remove(p)">Supprimer</button>
          </div>
        </div>
      } @empty {
        <p class="empty"><strong>Aucune personne</strong>Ajoutez le personnel à qui attribuer des voitures.</p>
      }
    </div>

    <dialog #dlg class="sheet">
      <div class="sheet-body">
        <h2>{{ form.id ? 'Modifier la personne' : 'Nouvelle personne' }}</h2>
        <div class="field"><label for="p-name">Nom</label><input id="p-name" class="input" [(ngModel)]="form.name" /></div>
        <div class="field"><label for="p-phone">Téléphone</label><input id="p-phone" class="input" type="tel" inputmode="tel" [(ngModel)]="form.phone" /></div>
        <div class="field">
          <label for="p-cat">Catégorie</label>
          <select id="p-cat" class="input" [(ngModel)]="form.category">
            @for (c of categories; track c.value) { <option [value]="c.value">{{ c.label }}</option> }
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
export class PersonnelComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  dlg = viewChild.required<ElementRef<HTMLDialogElement>>('dlg');

  items = signal<Personnel[]>([]);
  query = signal('');
  cat = signal('');
  form: Personnel = empty();
  categories = PERSONNEL_CATEGORIES;
  label = personnelCategoryLabel;
  dial = dialNumber;

  visible = computed(() => {
    const q = this.query().trim().toLowerCase();
    const c = this.cat();
    return this.items().filter(
      (p) => (!c || p.category === c) && (!q || (p.name + ' ' + p.phone).toLowerCase().includes(q)),
    );
  });

  ngOnInit() { this.load(); }
  load() { this.api.personnel().subscribe((l) => this.items.set(l)); }

  open(p?: Personnel) {
    this.form = p ? { ...p } : empty();
    this.dlg().nativeElement.showModal();
  }
  close() { this.dlg().nativeElement.close(); }

  save() {
    this.form.phone = cleanPhone(this.form.phone);
    this.api.savePersonnel(this.form).subscribe(() => {
      this.toast.ok('Personne enregistrée.');
      this.close();
      this.load();
    });
  }

  remove(p: Personnel) {
    if (!confirm(`Supprimer ${p.name} ?`)) return;
    this.api.deletePersonnel(p.id!).subscribe(() => {
      this.toast.ok('Personne supprimée.');
      this.load();
    });
  }
}
