import { Injectable, signal } from '@angular/core';

export interface Toast {
  text: string;
  kind: 'ok' | 'error';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toast = signal<Toast | null>(null);
  private timer: ReturnType<typeof setTimeout> | undefined;

  ok(text: string) {
    this.show({ text, kind: 'ok' });
  }
  error(text: string) {
    this.show({ text, kind: 'error' });
  }
  private show(t: Toast) {
    this.toast.set(t);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.toast.set(null), 5000);
  }
}
