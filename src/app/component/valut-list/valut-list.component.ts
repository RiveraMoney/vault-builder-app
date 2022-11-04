import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ethers } from 'ethers';
import { LpListService } from 'src/app/service/lp-list.service';
import { Web3Service } from 'src/app/service/web3.service';
import { FixedNumber, BigNumber, BigNumberish } from '@ethersproject/bignumber'
import { parseUnits } from '@ethersproject/units';
import { chunk, memoize } from 'lodash';
import { formatUnits } from '@ethersproject/units';
import Big from 'big.js';
import { Table } from 'primeng/table';
declare var $: any;
enum ChainId {
  ETHEREUM = 1,
  RINKEBY = 4,
  GOERLI = 5,
  BSC = 56,
  BSC_TESTNET = 97
}
@Component({
  selector: 'app-valut-list',
  templateUrl: './valut-list.component.html',
  styleUrls: ['./valut-list.component.scss'],
})
export class ValutListComponent implements OnInit {
  loading: boolean = true;
  BigNumber = require('big-number');
  public nativeStableLpMap = {
    [ChainId.ETHEREUM]: {
      address: '0x2E8135bE71230c6B1B4045696d41C09Db0414226',
      wNative: 'WETH',
      stable: 'USDC',
    },
    [ChainId.GOERLI]: {
      address: '0xf5bf0C34d3c428A74Ceb98d27d38d0036C587200',
      wNative: 'WETH',
      stable: 'tUSDC',
    },
    [ChainId.BSC]: {
      address: '0x58F876857a02D6762E0101bb5C46A8c1ED44Dc16',
      wNative: 'WBNB',
      stable: 'BUSD',
    },
    [ChainId.BSC_TESTNET]: {
      address: '0x4E96D2e92680Ca65D58A0e2eB5bd1c0f44cAB897',
      wNative: 'WBNB',
      stable: 'BUSD',
    },
  }
  public publicFarmAbi = [
    {
      constant: true,
      inputs: [
        {
          name: '_owner',
          type: 'address',
        },
      ],
      name: 'balanceOf',
      outputs: [
        {
          name: 'balance',
          type: 'uint256',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: true,
      inputs: [],
      name: 'totalSupply',
      outputs: [
        {
          name: '',
          type: 'uint256',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
  ]
  public stableSwapAbi = [
    {
      inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      name: 'coins',
      outputs: [{ internalType: 'address', name: '', type: 'address' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      name: 'balances',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        { internalType: 'uint256', name: 'i', type: 'uint256' },
        { internalType: 'uint256', name: 'j', type: 'uint256' },
        { internalType: 'uint256', name: 'dx', type: 'uint256' },
      ],
      name: 'get_dy',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
  ]
  public masterChefV2Abi = [
    {
      inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      name: 'poolInfo',
      outputs: [
        { internalType: 'uint256', name: 'accCakePerShare', type: 'uint256' },
        { internalType: 'uint256', name: 'lastRewardBlock', type: 'uint256' },
        { internalType: 'uint256', name: 'allocPoint', type: 'uint256' },
        { internalType: 'uint256', name: 'totalBoostedShare', type: 'uint256' },
        { internalType: 'bool', name: 'isRegular', type: 'bool' },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'poolLength',
      outputs: [{ internalType: 'uint256', name: 'pools', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'totalRegularAllocPoint',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'totalSpecialAllocPoint',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'bool', name: '_isRegular', type: 'bool' }],
      name: 'cakePerBlock',
      outputs: [{ internalType: 'uint256', name: 'amount', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
  ]
  public valutCreateForm!: FormGroup;
  public lpList: any;
  public selectedCar: any;
  public cakeAbi:any;
  public provider:any;
  public lpList2: any;
  public materchefAbi: any = [
    {
      "inputs": [
        {
          "internalType": "contract IMasterChef",
          "name": "_MASTER_CHEF",
          "type": "address"
        },
        { "internalType": "contract IBEP20", "name": "_CAKE", "type": "address" },
        { "internalType": "uint256", "name": "_MASTER_PID", "type": "uint256" },
        { "internalType": "address", "name": "_burnAdmin", "type": "address" }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "pid",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "allocPoint",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "contract IBEP20",
          "name": "lpToken",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "isRegular",
          "type": "bool"
        }
      ],
      "name": "AddPool",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "pid",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "Deposit",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "pid",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "EmergencyWithdraw",
      "type": "event"
    },
    { "anonymous": false, "inputs": [], "name": "Init", "type": "event" },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "pid",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "allocPoint",
          "type": "uint256"
        }
      ],
      "name": "SetPool",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "boostContract",
          "type": "address"
        }
      ],
      "name": "UpdateBoostContract",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "pid",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "oldMultiplier",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newMultiplier",
          "type": "uint256"
        }
      ],
      "name": "UpdateBoostMultiplier",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "oldAdmin",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newAdmin",
          "type": "address"
        }
      ],
      "name": "UpdateBurnAdmin",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "burnRate",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "regularFarmRate",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "specialFarmRate",
          "type": "uint256"
        }
      ],
      "name": "UpdateCakeRate",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "pid",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "lastRewardBlock",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "lpSupply",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "accCakePerShare",
          "type": "uint256"
        }
      ],
      "name": "UpdatePool",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "isValid",
          "type": "bool"
        }
      ],
      "name": "UpdateWhiteList",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "pid",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "Withdraw",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "ACC_CAKE_PRECISION",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "BOOST_PRECISION",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "CAKE",
      "outputs": [
        { "internalType": "contract IBEP20", "name": "", "type": "address" }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "CAKE_RATE_TOTAL_PRECISION",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "MASTERCHEF_CAKE_PER_BLOCK",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "MASTER_CHEF",
      "outputs": [
        { "internalType": "contract IMasterChef", "name": "", "type": "address" }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "MASTER_PID",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "MAX_BOOST_PRECISION",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "uint256", "name": "_allocPoint", "type": "uint256" },
        {
          "internalType": "contract IBEP20",
          "name": "_lpToken",
          "type": "address"
        },
        { "internalType": "bool", "name": "_isRegular", "type": "bool" },
        { "internalType": "bool", "name": "_withUpdate", "type": "bool" }
      ],
      "name": "add",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "boostContract",
      "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "burnAdmin",
      "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "bool", "name": "_withUpdate", "type": "bool" }
      ],
      "name": "burnCake",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "bool", "name": "_isRegular", "type": "bool" }
      ],
      "name": "cakePerBlock",
      "outputs": [
        { "internalType": "uint256", "name": "amount", "type": "uint256" }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "cakePerBlockToBurn",
      "outputs": [
        { "internalType": "uint256", "name": "amount", "type": "uint256" }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "cakeRateToBurn",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "cakeRateToRegularFarm",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "cakeRateToSpecialFarm",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "uint256", "name": "_pid", "type": "uint256" },
        { "internalType": "uint256", "name": "_amount", "type": "uint256" }
      ],
      "name": "deposit",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "uint256", "name": "_pid", "type": "uint256" }
      ],
      "name": "emergencyWithdraw",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "address", "name": "_user", "type": "address" },
        { "internalType": "uint256", "name": "_pid", "type": "uint256" }
      ],
      "name": "getBoostMultiplier",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "harvestFromMasterChef",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "contract IBEP20",
          "name": "dummyToken",
          "type": "address"
        }
      ],
      "name": "init",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "lastBurnedBlock",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "name": "lpToken",
      "outputs": [
        { "internalType": "contract IBEP20", "name": "", "type": "address" }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "massUpdatePools",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "uint256", "name": "_pid", "type": "uint256" },
        { "internalType": "address", "name": "_user", "type": "address" }
      ],
      "name": "pendingCake",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "name": "poolInfo",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "accCakePerShare",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "lastRewardBlock",
          "type": "uint256"
        },
        { "internalType": "uint256", "name": "allocPoint", "type": "uint256" },
        {
          "internalType": "uint256",
          "name": "totalBoostedShare",
          "type": "uint256"
        },
        { "internalType": "bool", "name": "isRegular", "type": "bool" }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "poolLength",
      "outputs": [
        { "internalType": "uint256", "name": "pools", "type": "uint256" }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "uint256", "name": "_pid", "type": "uint256" },
        { "internalType": "uint256", "name": "_allocPoint", "type": "uint256" },
        { "internalType": "bool", "name": "_withUpdate", "type": "bool" }
      ],
      "name": "set",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalRegularAllocPoint",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalSpecialAllocPoint",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "address", "name": "newOwner", "type": "address" }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_newBoostContract",
          "type": "address"
        }
      ],
      "name": "updateBoostContract",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "address", "name": "_user", "type": "address" },
        { "internalType": "uint256", "name": "_pid", "type": "uint256" },
        { "internalType": "uint256", "name": "_newMultiplier", "type": "uint256" }
      ],
      "name": "updateBoostMultiplier",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "address", "name": "_newAdmin", "type": "address" }
      ],
      "name": "updateBurnAdmin",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "uint256", "name": "_burnRate", "type": "uint256" },
        {
          "internalType": "uint256",
          "name": "_regularFarmRate",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_specialFarmRate",
          "type": "uint256"
        },
        { "internalType": "bool", "name": "_withUpdate", "type": "bool" }
      ],
      "name": "updateCakeRate",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "uint256", "name": "_pid", "type": "uint256" }
      ],
      "name": "updatePool",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "accCakePerShare",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "lastRewardBlock",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "allocPoint",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "totalBoostedShare",
              "type": "uint256"
            },
            { "internalType": "bool", "name": "isRegular", "type": "bool" }
          ],
          "internalType": "struct MasterChefV2.PoolInfo",
          "name": "pool",
          "type": "tuple"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "address", "name": "_user", "type": "address" },
        { "internalType": "bool", "name": "_isValid", "type": "bool" }
      ],
      "name": "updateWhiteList",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "uint256", "name": "", "type": "uint256" },
        { "internalType": "address", "name": "", "type": "address" }
      ],
      "name": "userInfo",
      "outputs": [
        { "internalType": "uint256", "name": "amount", "type": "uint256" },
        { "internalType": "uint256", "name": "rewardDebt", "type": "uint256" },
        {
          "internalType": "uint256",
          "name": "boostMultiplier",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
      "name": "whiteList",
      "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "uint256", "name": "_pid", "type": "uint256" },
        { "internalType": "uint256", "name": "_amount", "type": "uint256" }
      ],
      "name": "withdraw",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];
  public masterChefAddress: any = "0xa5f8C5Dbd5F286960b9d90548680aE5ebFf07652";
  public stableFarmsResults: any;
  public poolInfos: any;
  public lpDataResults: any;
  public totalRegularAllocPoint: any;
  public totalSpecialAllocPoint: any;
  public cakePerBlock: any;
  public poolLength: any;
  public cakePriceBusd: any = "4.667043177918";
  FIXED_ZERO = FixedNumber.from(0);
  FIXED_ONE = FixedNumber.from(1)
  FIXED_TWO = FixedNumber.from(2);
  BIG_TEN = BigNumber.from(10);
  FIXED_100 = FixedNumber.from(100)
  BSC_BLOCK_TIME = 3
  BLOCKS_PER_YEAR = (60 / this.BSC_BLOCK_TIME) * 60 * 24 * 365 // 10512000

  public getFullDecimalMultiplier = memoize((decimals: number): BigNumber => {
    const aa = this.BIG_TEN.pow(decimals);

    return aa
  })
  constructor(private fb: FormBuilder,private web3Service: Web3Service, private lpListService: LpListService) {}

  ngOnInit(): void {
    this.valutCreateForm = this.fb.group({
      vaultName: [''],
      permission:[''],
      vaultType: [''],
      lpPair: [''],
      protocol: [''],
      chain: []
    });
    // this.lpList = [
    //   {
    //     id: 1,
    //     lpPair: 'CAKE-BNB',
    //     protocol: 'Pancake',
    //     farmingAPR: '44.56%',
    //     liquidity: '$ 50,000',
    //   },
    //   {
    //     id: 2,
    //     lpPair: 'ETH-USDC',
    //     protocol: 'Pancake',
    //     farmingAPR: '18.56%',
    //     liquidity: '$ 60,000',
    //   },
    //   {
    //     id: 3,
    //     lpPair: 'CAKE-BUSD',
    //     protocol: 'Pancake',
    //     farmingAPR: '18.56%',
    //     liquidity: '$ 100,000',
    //   },
    // ];
    this.init();
  }

  selectProduct(lp: any) {
    this.selectedCar = lp;
    console.log('product', lp);
    this.valutCreateForm.patchValue({
      vaultType: 'Auto-compounding',
      lpPair: lp.lpPair,
      protocol: lp.protocol,
      chain: 'Binance Smart Chain',
    })
    $('#profile').modal('show');
  }

  closePopup() {
    $('#profile').modal('hide');
  }
  deploy(){
    console.log("form", this.valutCreateForm);
  }
  public async init() {

    //load abi
    (await this.web3Service.getAbiJSON('lpAbi.json')).subscribe(async (e) => {
      this.cakeAbi = e;
    })

    //load provider
    await this.web3Service.connectWallet().then(e =>{
      this.provider = e;
    });

    //get farm list
    (await this.web3Service.getLpJSON('56.json')).subscribe(async (e)=>{
      this.lpList2 = e;
      // this.fetchMasterChefV2Data();
     this.setupPooldata();
    });

  }

  public async fetchMasterChefV2Data(){
    const calls =  [
      {
        address: this.masterChefAddress,
        name: 'poolLength',
      },
      {
        address: this.masterChefAddress,
        name: 'totalRegularAllocPoint',
      },
      {
        address: this.masterChefAddress,
        name: 'totalSpecialAllocPoint',
      },
      {
        address: this.masterChefAddress,
        name: 'cakePerBlock',
        params: [true],
      },
    ];
    const result = calls.map(async e=>{
      const contract = new ethers.Contract(e.address, this.masterChefV2Abi, this.provider);
      let poolInfoByAdress: any;
      if(e.params){
        poolInfoByAdress = await contract[e.name](e.params);
      } else{
        poolInfoByAdress = await contract[e.name]();
      }
      console.log("poolInfoByAdress", poolInfoByAdress);
      return poolInfoByAdress;
    });
    const finalResult = await Promise.all(result);

    this.poolLength = finalResult[0].toNumber();
    this.totalRegularAllocPoint = finalResult[1];
    this.totalSpecialAllocPoint = finalResult[2];
    this.cakePerBlock = +(this.formatEther(finalResult[3]));
    console.log("fetchMasterChefV2Data", finalResult);
  }

  public async setupPooldata(){


    //fetchMasterChefV2Data
    await this.fetchMasterChefV2Data();

    //fetch masterchef data
    await this.fetchMasterChefData();

    //fetch stable farm data
    let stableFarms = this.lpList2.filter(this.isStableFarm) as any[];
    await this.fetchStableFarmData(stableFarms);

    //fetch public farm data
    await this.fetchPublicFarmsData(this.lpList2);
    const stableFarmsData = (this.stableFarmsResults as any[]).map(this.formatStableFarm)


    const stableFarmsDataMap = stableFarms.reduce<Record<number, any>>((map, farm, index) => {
      return {
        ...map,
        [farm.pid]: stableFarmsData[index],
      }
    }, {})

    const lpData = this.lpDataResults.map(this.formatClassicFarmResponse);
    console.log("lpData", lpData);

    const farmsData = this.lpList2.map((farm: any, index: any) => {
      try {

        let val;
        if(stableFarmsDataMap[farm.pid]){
          val = this.getStableFarmDynamicData({
            ...lpData[index],
            ...stableFarmsDataMap[farm.pid],
            token0Decimals: farm.token.decimals,
            token1Decimals: farm.quoteToken.decimals,
            price1: stableFarmsDataMap[farm.pid].price1,
          });
        } else{
          val = this.getClassicFarmsDynamicData({
            ...lpData[index],
            ...stableFarmsDataMap[farm.pid],
            token0Decimals: farm.token.decimals,
            token1Decimals: farm.quoteToken.decimals,
          });
        }


        const val3 = this.getFarmAllocation({
          allocPoint: this.poolInfos[index]?.allocPoint,
          isRegular: this.poolInfos[index]?.isRegular,
          totalRegularAllocPoint: this.totalRegularAllocPoint,
          totalSpecialAllocPoint: this.totalSpecialAllocPoint,
        });
        const obj = {
          ...farm, ...val,...val3,
        };
        return obj;
      } catch (error) {
        console.error(error, farm, index, {
          allocPoint: this.poolInfos[index]?.allocPoint,
          isRegular: this.poolInfos[index]?.isRegular,
          token0Decimals: farm.token.decimals,
          token1Decimals: farm.quoteToken.decimals,
          totalRegularAllocPoint: this.totalRegularAllocPoint,
          totalSpecialAllocPoint: this.totalSpecialAllocPoint,
        })
        throw error
      }
    })

    console.log("farmsData farmsData", farmsData);

    console.log("farmsData farmsData with liqudity", farmsData);

    this.getFarmsPrices(farmsData, ChainId.BSC);

  }

  public async fetchMasterChefData(){
    let poolinfo = this.lpList2.map((farm: any) => this.masterChefFarmCalls(farm, this.masterChefAddress));
    poolinfo = poolinfo.filter((e: null) => e !== null);
    const result = poolinfo.map(async (e: any) =>{
      const contract = new ethers.Contract(e.address, this.materchefAbi, this.provider);
      const poolInfoByAdress = await contract['poolInfo'](e.params);
      return poolInfoByAdress;
    })
    const finalResult = await Promise.all(result);
    this.poolInfos = finalResult;
    console.log("fetchMasterChefData", finalResult);
  }


  async fetchStableFarmData(farms:any){

    const calls = farms.flatMap((f: { stableSwapAddress: any; token: { decimals: any; }; quoteToken: { decimals: any; }; }) => [
      {
        address: f.stableSwapAddress,
        name: 'balances',
        params: [0],
      },
      {
        address: f.stableSwapAddress,
        name: 'balances',
        params: [1],
      },
      {
        address: f.stableSwapAddress,
        name: 'get_dy',
        params: [0, 1, parseUnits('1', f.token.decimals)],
      },
      {
        address: f.stableSwapAddress,
        name: 'get_dy',
        params: [1, 0, parseUnits('1', f.quoteToken.decimals)],
      },
    ]);
    const chunkSize = calls.length / farms.length;

    const results = calls.map(async (e:any) =>{
      const contract = new ethers.Contract(e.address, this.stableSwapAbi, this.provider);
      const poolInfoByAdress = await contract[e.name].apply(this,e.params);
      return poolInfoByAdress;
    })
    const finalResult = await Promise.all(results);
    const chunkReturn = chunk(finalResult, chunkSize);
    this.stableFarmsResults = chunkReturn;
    console.log("fetchMasterChefData", chunkReturn);
    // console.log("fetchMasterChefData", chunkReturn);
  }


  public publicFetchFarmCalls = (farm: any, masterChefAddress: string, vaultAddress?: string) => {
  const { lpAddress, token, quoteToken } = farm
  return [
    // Balance of token in the LP contract
    {
      address: token.address,
      name: 'balanceOf',
      params: [lpAddress],
    },
    // Balance of quote token on LP contract
    {
      address: quoteToken.address,
      name: 'balanceOf',
      params: [lpAddress],
    },
    // Balance of LP tokens in the master chef contract
    {
      address: lpAddress,
      name: 'balanceOf',
      params: [this.masterChefAddress],
    },
    // Total supply of LP tokens
    {
      address: lpAddress,
      name: 'totalSupply',
    },
  ]
}

  public async fetchPublicFarmsData(farms:any){

  const farmCalls = farms.flatMap((farm: any) => this.publicFetchFarmCalls(farm, this.masterChefAddress, "0xE6c904424417D03451fADd6E3f5b6c26BcC43841"));
  const chunkSize = farmCalls.length / farms.length
  const results = farmCalls.map(async (e:any) =>{
    const contract = new ethers.Contract(e.address, this.publicFarmAbi, this.provider);
    const poolInfoByAdress = await contract[e.name].apply(this,e.params);
   return poolInfoByAdress;
  });
  const finalResult = await Promise.all(results);
  const chunkReturn = chunk(finalResult, chunkSize);
  this.lpDataResults = chunkReturn;
  console.log("fetchPublicFarmsData", chunkReturn);
}



masterChefFarmCalls = (farm: any, masterChefAddress: string) => {
  const { pid } = farm
  return pid || pid === 0
    ? {
        address: masterChefAddress,
        name: 'poolInfo',
        params: [pid],
      }
    : null
}

formatStableFarm = (stableFarmData: any): any => {
  const [balance1, balance2, _, _price1] = stableFarmData
  const result = {
    tokenBalanceLP: FixedNumber.from(balance1),
    quoteTokenBalanceLP: FixedNumber.from(balance2),
    price1: _price1,
  }
  return result;
}

formatClassicFarmResponse = (farmData: any): any => {
  const [tokenBalanceLP, quoteTokenBalanceLP, lpTokenBalanceMC, lpTotalSupply] = farmData;
  const result = {
    tokenBalanceLP: FixedNumber.from(tokenBalanceLP),
    quoteTokenBalanceLP: FixedNumber.from(quoteTokenBalanceLP),
    lpTokenBalanceMC: FixedNumber.from(lpTokenBalanceMC),
    lpTotalSupply: FixedNumber.from(lpTotalSupply),
  };
  return result;
}

isStableFarm(farmConfig: any): farmConfig is any {
  return 'stableSwapAddress' in farmConfig && typeof farmConfig.stableSwapAddress === 'string'
}

getTokenAmount = (balance: FixedNumber, decimals: number) => {

  const aa = this.getFullDecimalMultiplier(decimals);
  const tokenDividerFixed = FixedNumber.from(aa)
  return balance.divUnsafe(tokenDividerFixed)
}

getStableFarmDynamicData = ({
  lpTokenBalanceMC,
  lpTotalSupply,
  quoteTokenBalanceLP,
  tokenBalanceLP,
  token0Decimals,
  token1Decimals,
  price1,
}: any & {
  token1Decimals: number
  token0Decimals: number
  price1: BigNumber
}) => {

  // Raw amount of token in the LP, including those not staked
  const tokenAmountTotal = this.getTokenAmount(tokenBalanceLP, token0Decimals)
  const quoteTokenAmountTotal = this.getTokenAmount(quoteTokenBalanceLP, token1Decimals)

  // Ratio in % of LP tokens that are staked in the MC, vs the total number in circulation
  const lpTokenRatio =
    !lpTotalSupply.isZero() && !lpTokenBalanceMC.isZero() ? lpTokenBalanceMC.divUnsafe(lpTotalSupply) : this.FIXED_ZERO

  const tokenPriceVsQuote = formatUnits(price1, token1Decimals)

  // Amount of quoteToken in the LP that are staked in the MC
  const quoteTokenAmountMcFixed = quoteTokenAmountTotal.mulUnsafe(lpTokenRatio)

  // Amount of token in the LP that are staked in the MC
  const tokenAmountMcFixed = tokenAmountTotal.mulUnsafe(lpTokenRatio)

  const quoteTokenAmountMcFixedByTokenAmount = tokenAmountMcFixed.mulUnsafe(FixedNumber.from(tokenPriceVsQuote))

  const lpTotalInQuoteToken = quoteTokenAmountMcFixed.addUnsafe(quoteTokenAmountMcFixedByTokenAmount)

  return {
    tokenAmountTotal: tokenAmountTotal.toString(),
    quoteTokenAmountTotal: quoteTokenAmountTotal.toString(),
    lpTotalSupply: lpTotalSupply.toString(),
    lpTotalInQuoteToken: lpTotalInQuoteToken.toString(),
    tokenPriceVsQuote,
  }
}

getClassicFarmsDynamicData = ({
  lpTokenBalanceMC,
  lpTotalSupply,
  quoteTokenBalanceLP,
  tokenBalanceLP,
  token0Decimals,
  token1Decimals,
}: any & {
  token0Decimals: number
  token1Decimals: number
}) => {

  // Raw amount of token in the LP, including those not staked
  const tokenAmountTotal = this.getTokenAmount(tokenBalanceLP, token0Decimals)
  const quoteTokenAmountTotal = this.getTokenAmount(quoteTokenBalanceLP, token1Decimals)

  // Ratio in % of LP tokens that are staked in the MC, vs the total number in circulation
  const lpTokenRatio =
    !lpTotalSupply.isZero() && !lpTokenBalanceMC.isZero() ? lpTokenBalanceMC.divUnsafe(lpTotalSupply) : this.FIXED_ZERO

  // // Amount of quoteToken in the LP that are staked in the MC
  const quoteTokenAmountMcFixed = quoteTokenAmountTotal.mulUnsafe(lpTokenRatio)

  // // Total staked in LP, in quote token value
  const lpTotalInQuoteToken = quoteTokenAmountMcFixed.mulUnsafe(this.FIXED_TWO)

  return {
    tokenAmountTotal: tokenAmountTotal.toString(),
    quoteTokenAmountTotal: quoteTokenAmountTotal.toString(),
    lpTotalSupply: lpTotalSupply.toString(),
    lpTotalInQuoteToken: lpTotalInQuoteToken.toString(),
    tokenPriceVsQuote:
      !quoteTokenAmountTotal.isZero() && !tokenAmountTotal.isZero()
        ? quoteTokenAmountTotal.divUnsafe(tokenAmountTotal).toString()
        : this.FIXED_ZERO.toString(),
  }

}

getFarmAllocation = ({
  allocPoint,
  isRegular,
  totalRegularAllocPoint,
  totalSpecialAllocPoint,
}: any) => {

  const _allocPoint = allocPoint ? FixedNumber.from(allocPoint) : this.FIXED_ZERO
  const totalAlloc = isRegular ? totalRegularAllocPoint : totalSpecialAllocPoint
  const poolWeight =
    !totalAlloc.isZero() && !_allocPoint.isZero() ? _allocPoint.divUnsafe(FixedNumber.from(totalAlloc)) : this.FIXED_ZERO

  return {
    poolWeight: poolWeight.toString(),
    multiplier: !_allocPoint.isZero() ? `${+_allocPoint.divUnsafe(FixedNumber.from(100)).toString()}X` : `0X`,
  }
}

// getFullDecimalMultiplier(decimals: number): any {
//   throw new Error('Function not implemented.');
// }

// getFullDecimalMultiplier = memoize((decimals: number): BigNumber => {
//   return BIG_TEN.pow(decimals)
// }

formatEther(wei: BigNumberish): string {
  return formatUnits(wei, 18);
}


//farm price start

getFarmsPrices(farms:any, chainId: number){
  farms = farms.filter((e: any) => e.pid !== 0);
  const nativeStableFarm = farms.find((farm: any) => this.equalsIgnoreCase(farm.lpAddress,  this.nativeStableLpMap[ChainId.BSC].address));
  const nativePriceUSD =
    +(nativeStableFarm?.tokenPriceVsQuote) !== 0
      ? this.FIXED_ONE.divUnsafe(FixedNumber.from(nativeStableFarm.tokenPriceVsQuote))
      : this.FIXED_ZERO;
      debugger
      console.log("nativePriceUSD", nativePriceUSD );

      const farmsWithPrices = farms.map((farm: any) => {

        const quoteTokenFarm = this.getFarmFromTokenAddress(farms, farm.quoteToken.address, [
          this.nativeStableLpMap[ChainId.BSC].wNative,
          this.nativeStableLpMap[ChainId.BSC].stable,
        ])

        const quoteTokenPriceBusd = this.getFarmQuoteTokenPrice(
          farm,
          quoteTokenFarm,
          nativePriceUSD,
          this.nativeStableLpMap[ChainId.BSC].wNative,
          this.nativeStableLpMap[ChainId.BSC].stable,
        )

        const tokenPriceBusd = this.getFarmBaseTokenPrice(
          farm,
          quoteTokenFarm,
          nativePriceUSD,
          this.nativeStableLpMap[ChainId.BSC].wNative,
          this.nativeStableLpMap[ChainId.BSC].stable,
          quoteTokenPriceBusd,
        )
        // const lpTokenPrice = farm?.stableSwapAddress
        //   ? getStableLpTokenPrice(
        //       FixedNumber.from(farm.lpTotalSupply),
        //       FixedNumber.from(farm.tokenAmountTotal),
        //       tokenPriceBusd,
        //       FixedNumber.from(farm.quoteTokenAmountTotal),
        //       // Assume token is busd, tokenPriceBusd is tokenPriceVsQuote
        //       FixedNumber.from(farm.tokenPriceVsQuote),
        //     )
        //   : getLpTokenPrice(
        //       FixedNumber.from(farm.lpTotalSupply),
        //       FixedNumber.from(farm.lpTotalInQuoteToken),
        //       FixedNumber.from(farm.tokenAmountTotal),
        //       tokenPriceBusd,
        //     )
        const result = {
          ...farm,
          tokenPriceBusd: tokenPriceBusd.toString(),
          quoteTokenPriceBusd: quoteTokenPriceBusd.toString()
        };
        return result;
      })

    const aaa = farmsWithPrices.map((farm:any) =>{
        let cakeRewardsAprAsString = '0'
        if (!this.cakePriceBusd) {
          return cakeRewardsAprAsString
        }
      const totalLiquidity = FixedNumber.from((farm.lpTotalInQuoteToken)).mulUnsafe(
        FixedNumber.from(farm.quoteTokenPriceBusd),
      );

      const poolWeight = FixedNumber.from(farm.poolWeight)
  if (totalLiquidity.isZero() || poolWeight.isZero()) {
    return cakeRewardsAprAsString
  }
  const yearlyCakeRewardAllocation = poolWeight
    ? poolWeight.mulUnsafe(FixedNumber.from(this.BLOCKS_PER_YEAR).mulUnsafe(FixedNumber.from(String(this.cakePerBlock))))
    : this.FIXED_ZERO;
    debugger
  const cakePriceBusd = FixedNumber.from(this.cakePriceBusd);
  const cakeRewardsApr = yearlyCakeRewardAllocation
    .mulUnsafe(cakePriceBusd)
    .divUnsafe(totalLiquidity)
    .mulUnsafe(this.FIXED_100)
  if (!cakeRewardsApr.isZero()) {
    cakeRewardsAprAsString = cakeRewardsApr.toUnsafeFloat().toFixed(2)
  }

      farm.liquidity = totalLiquidity;
      farm.apr = cakeRewardsApr;
      return farm;
    });
      console.log("farmsWithPrices quteToke", aaa.filter((e:any) => e != "0" || e.pid !== 0));
this.lpList = aaa.filter((e:any) => e != "0");
this.loading = false;
}

equalsIgnoreCase = (a?: string, b?: string) => {
  if (!a || !b) return false
  return a.localeCompare(b, undefined, { sensitivity: 'accent' }) === 0
}

getFarmFromTokenAddress = (
  farms: any[],
  tokenAddress: string,
  preferredQuoteTokens?: string[],
): any => {

  const farmsWithTokenSymbol = farms.filter((farm) => this.equalsIgnoreCase(farm.token.address, tokenAddress))
  const filteredFarm = this.filterFarmsByQuoteToken(farmsWithTokenSymbol, preferredQuoteTokens)
  return filteredFarm
}

filterFarmsByQuoteToken = (
  farms: any[],
  preferredQuoteTokens: string[] = ['BUSD', 'WBNB'],
): any => {

  const preferredFarm = farms.find((farm) => {
    return preferredQuoteTokens.some((quoteToken) => {
      return farm.quoteToken.symbol === quoteToken
    })
  })
  return preferredFarm || farms[0]
}

getFarmQuoteTokenPrice = (
  farm: any,
  quoteTokenFarm: any,
  nativePriceUSD: FixedNumber,
  wNative: string,
  stable: string,
): FixedNumber => {

  if (farm.quoteToken.symbol === stable) {
    return this.FIXED_ONE
  }

  if (farm.quoteToken.symbol === wNative) {
    return nativePriceUSD
  }

  if (!quoteTokenFarm) {
    return this.FIXED_ZERO
  }

  if (quoteTokenFarm.quoteToken.symbol === wNative) {
    return quoteTokenFarm.tokenPriceVsQuote
      ? nativePriceUSD.mulUnsafe(FixedNumber.from(quoteTokenFarm.tokenPriceVsQuote))
      : this.FIXED_ZERO
  }

  if (quoteTokenFarm.quoteToken.symbol === stable) {
    return quoteTokenFarm.tokenPriceVsQuote ? FixedNumber.from(quoteTokenFarm.tokenPriceVsQuote) : this.FIXED_ZERO
  }

  return this.FIXED_ZERO
}

getFarmBaseTokenPrice = (
  farm: any,
  quoteTokenFarm: any,
  nativePriceUSD: FixedNumber,
  wNative: string,
  stable: string,
  quoteTokenInBusd: any,
): FixedNumber => {

  const hasTokenPriceVsQuote = Boolean(farm.tokenPriceVsQuote)

  if (farm.quoteToken.symbol === stable) {
    return hasTokenPriceVsQuote ? FixedNumber.from(farm.tokenPriceVsQuote) : this.FIXED_ONE
  }

  if (farm.quoteToken.symbol === wNative) {
    return hasTokenPriceVsQuote ? nativePriceUSD.mulUnsafe(FixedNumber.from(farm.tokenPriceVsQuote)) : this.FIXED_ONE
  }

  // We can only calculate profits without a quoteTokenFarm for BUSD/BNB farms
  if (!quoteTokenFarm) {
    return this.FIXED_ZERO
  }

  // Possible alternative farm quoteTokens:
  // UST (i.e. MIR-UST), pBTC (i.e. PNT-pBTC), BTCB (i.e. bBADGER-BTCB), ETH (i.e. SUSHI-ETH)
  // If the farm's quote token isn't BUSD or WBNB, we then use the quote token, of the original farm's quote token
  // i.e. for farm PNT - pBTC we use the pBTC farm's quote token - BNB, (pBTC - BNB)
  // from the BNB - pBTC price, we can calculate the PNT - BUSD price
  if (quoteTokenFarm.quoteToken.symbol === wNative || quoteTokenFarm.quoteToken.symbol === stable) {
    return hasTokenPriceVsQuote && quoteTokenInBusd
      ? FixedNumber.from(farm.tokenPriceVsQuote).mulUnsafe(quoteTokenInBusd)
      : this.FIXED_ONE
  }

  // Catch in case token does not have immediate or once-removed BUSD/WBNB quoteToken
  return this.FIXED_ZERO
}

//farm price end

clear(table: Table) {
  table.clear();
}
}



