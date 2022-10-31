import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ethers } from 'ethers';
import { LpListService } from 'src/app/service/lp-list.service';
import { Web3Service } from 'src/app/service/web3.service';
import { FixedNumber } from '@ethersproject/bignumber'
import { parseUnits } from '@ethersproject/units';
declare var $: any;
@Component({
  selector: 'app-valut-list',
  templateUrl: './valut-list.component.html',
  styleUrls: ['./valut-list.component.scss'],
})
export class ValutListComponent implements OnInit {
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
    this.lpList = [
      {
        id: 1,
        lpPair: 'CAKE-BNB',
        protocol: 'Pancake',
        farmingAPR: '44.56%',
        liquidity: '$ 50,000',
      },
      {
        id: 2,
        lpPair: 'ETH-USDC',
        protocol: 'Pancake',
        farmingAPR: '18.56%',
        liquidity: '$ 60,000',
      },
      {
        id: 3,
        lpPair: 'CAKE-BUSD',
        protocol: 'Pancake',
        farmingAPR: '18.56%',
        liquidity: '$ 100,000',
      },
    ];
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
      console.log("ee", e);
      await this.multicallPoolInfo();
      // e.map(async (ee: any)=>{
      //   if(ee['pid'] == 0) return;
      //   console.log("ee", ee);
      //   const daiContract = new ethers.Contract(ee.lpAddress, this.cakeAbi, this.provider);
      //   const aa = await daiContract['getReserves']();
      //   console.log("aa", aa);
      // })

      // const number1 = aa['_reserve0']._hex;
      // console.log("aa", aa);
      // console.log("hex", number1);
      // console.log("big number 1", BigNumber.from(number1));


      // const totalLiquidity = FixedNumber.from(number1).mulUnsafe(
      //   FixedNumber.from("2"),
      // )

      // console.log("totalLiquidity", totalLiquidity);

      // console.log("a1",Number(aa['_reserve0']._hex));
      // const totalNumber = Number(aa['_reserve0']._hex) + Number(aa['_reserve1']._hex);
      // console.log("totalNumber", totalNumber);
      // const aaa = FixedNumber.from(aa['_reserve0']._hex).mulUnsafe(
      //   FixedNumber.from(aa['_reserve0']._hex),
      // );
      // console.log("aaa", aaa);
    });

  }

  public async multicallPoolInfo(){

    const stableFarms = this.lpList2.filter(this.isStableFarm);
    console.log("stable farms", stableFarms);

    let poolinfo = this.lpList2.map((farm: any) => this.masterChefFarmCalls(farm, "0xa5f8C5Dbd5F286960b9d90548680aE5ebFf07652"));
    poolinfo = poolinfo.filter((e: null) => e !== null);
    console.log("poolinfo", poolinfo);



    // (await this.web3Service.getAbiJSON('masterChefV2Abi.json')).subscribe(async (e) => {
    //   this.materchefAbi = e;
    // })

    // (await this.web3Service.getAbiJSON('MasterChefV2Abi.json')).subscribe(async (e) => {
    //   this.materchefAbi = e;
    // });




    poolinfo.map(async (e: any) =>{

      const contract = new ethers.Contract(e.address, this.materchefAbi, this.provider);
      const poolInfoByAdress = await contract['poolInfo'](e.params);
      //console.log("poolInfoByAdress", poolInfoByAdress);
    })

this.fetchStableFarmData(stableFarms);

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

  isStableFarm(farmConfig: any): farmConfig is any {
    return 'stableSwapAddress' in farmConfig && typeof farmConfig.stableSwapAddress === 'string'
  }

  fetchStableFarmData(farms:any){
    debugger
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
      // console.log("poolInfoByAdress", poolInfoByAdress);
      // console.log("name", e.name);
      return poolInfoByAdress;
    })

    console.log("stableFarm resut", results);
    //console.log("stableFarm with chunk", chunk(results, chunkSize));
  }
}
