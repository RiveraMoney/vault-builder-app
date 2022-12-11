import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ValutDetilsService {
  private lpPool = new BehaviorSubject<any>({});
  selectedlpPool = this.lpPool.asObservable();
  constructor() { }

  setLPPool(lp: any) {

    this.lpPool.next(lp);
  }
}
