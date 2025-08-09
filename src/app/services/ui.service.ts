import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UiService {
  private isDrawerOpen = new BehaviorSubject<boolean>(false);
  isDrawerOpen$ = this.isDrawerOpen.asObservable();

  setDrawerState(isOpen: boolean) {
    this.isDrawerOpen.next(isOpen);
  }
}
