import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {

  constructor() { }

  public masterChefAddress: any = '0xa5f8C5Dbd5F286960b9d90548680aE5ebFf07652';
  public deployedContract: any = '0x700b6A60ce7EaaEA56F065753d8dcB9653dbAD35';
}
