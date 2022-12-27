import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {

  constructor() { }

  public masterChefAddress: any = '0xa5f8C5Dbd5F286960b9d90548680aE5ebFf07652';
  public deployedContract: any = '0xa1F54f9115c12Bd25f0dD81CC661Af8bD830D519';    //Main net factory contract deployment address
}
