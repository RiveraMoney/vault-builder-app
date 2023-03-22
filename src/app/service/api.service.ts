import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor() { }

  riveraAutoCompoundingVaultV1Abi = 'assets/artifacts/src/vaults/RiveraAutoCompoundingVaultV1.sol/RiveraAutoCompoundingVaultV1.json'
  pancakeVaultFactoryV1Abi = 'assets/artifacts/src/PancakeVaultFactoryV1.sol/PancakeVaultFactoryV1.json'
  pancakeLpsAbi = 'assets/abiLists/pancakeLpsAbi.json'
  pancakeFarmList = 'assets/constants/farms'
  pancakeSwapFactoryV2Abi = 'assets/abiLists/pancakeSwapFactoryV2.json'
  assetsImage = 'assets/imageList/crypto.json'
}
