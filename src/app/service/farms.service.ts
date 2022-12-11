import { Injectable } from '@angular/core';
import { ChainId, CurrencyAmount, ERC20Token, Pair } from '@pancakeswap/sdk';
import { ethers } from 'ethers';

@Injectable({
  providedIn: 'root'
})
export class FarmsService {
  pairAbi = [
    {
      inputs: [],
      name: 'getReserves',
      outputs: [
        {
          internalType: 'uint112',
          name: 'reserve0',
          type: 'uint112',
        },
        {
          internalType: 'uint112',
          name: 'reserve1',
          type: 'uint112',
        },
        {
          internalType: 'uint32',
          name: 'blockTimestampLast',
          type: 'uint32',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
  ]
  constructor() { }

  getCakePrice = async (isTestnet: boolean, web3Provider: any) => {

    const cakeBse = new ERC20Token(
      ChainId.BSC,
      '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
      18,
      'CAKE',
      'PancakeSwap Token',
      'https://pancakeswap.finance/',
    )
    const busdBsc = new ERC20Token(
      ChainId.BSC,
      '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
      18,
      'BUSD',
      'Binance USD',
      'https://www.paxos.com/busd/',
    )

    const pairConfig = {
      address: Pair.getAddress(cakeBse, busdBsc),
      tokenA: cakeBse,
      tokenB: busdBsc,
    }

    const pairContract = new ethers.Contract(pairConfig.address, this.pairAbi, web3Provider);

    const reserves = await pairContract['getReserves']()
    const { reserve0, reserve1 } = reserves
    const { tokenA, tokenB } = pairConfig

    const [token0, token1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA]

    const pair = new Pair(
      CurrencyAmount.fromRawAmount(token0, reserve0.toString()),
      CurrencyAmount.fromRawAmount(token1, reserve1.toString()),
    )

    return pair.priceOf(tokenA)
  }
}
