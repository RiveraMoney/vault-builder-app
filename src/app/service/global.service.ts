import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {

  constructor() { }

  public masterChefAddress: any = '0xa5f8C5Dbd5F286960b9d90548680aE5ebFf07652';
  public deployedContract: any = '0x44b3532E500Fa10Db045801e143F43182C23A7cF';
}
