import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {

  constructor() { }

  public rewardTokenAddress: any = '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82'; // now cake as reward token
  public mlcTokenAdress:any = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'; // now wbnb as Most liquid currency(mlc)
  public masterChefAddress: any = '0xa5f8C5Dbd5F286960b9d90548680aE5ebFf07652';
  public deployedContract: any = '0xa1F54f9115c12Bd25f0dD81CC661Af8bD830D519';    //Main net factory contract deployment address
}
