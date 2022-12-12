import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { BigNumber, ethers } from 'ethers';
import { MessageService } from 'primeng/api';
import { ApiService } from 'src/app/service/api.service';
import { CommonService } from 'src/app/service/common.service';
import { GlobalService } from 'src/app/service/global.service';
import { ValutDetilsService } from 'src/app/service/valut-detils.service';
import { Web3Service } from 'src/app/service/web3.service';
declare var $: any;
@Component({
  selector: 'app-vault-details',
  templateUrl: './vault-details.component.html',
  styleUrls: ['./vault-details.component.scss']
})
export class VaultDetailsComponent implements OnInit {
  public valutCreateForm!: FormGroup;
  public web3Provider: any;
  public factoryAbi:any;
  public selectedPool: any;
  public aprValue: any;
  public isDeployed = false;
  constructor(
    private valutDetilsService: ValutDetilsService,
    private fb: FormBuilder,
    private globalService: GlobalService,
    private web3Service: Web3Service,
    public apiService: ApiService,
    public commonService: CommonService,
    private router: Router,
    private messageService: MessageService
    ) { }

  ngOnInit(): void {

    this.init();
    this.valutDetilsService.selectedlpPool.subscribe(e =>{

      this.selectedPool = e;
      if(Object.keys(this.selectedPool).length === 0){
        this.router.navigate(['/vault']);
      }
      var apr = +(this.selectedPool.apr._value);
      this.aprValue = apr.toFixed(2);
    });

    this.valutCreateForm = this.fb.group({
      vaultName: [''],
      permission: ['private'],
      vaultType: [''],
      lpPair: [''],
      protocol: [''],
      chain: [],
      apy: [],
    });


  }

  async init(){
    await this.web3Service.connectWallet().then((e) => {
      this.web3Provider = e;
    });

    //get factory abi url from api service
    const factoryAbiUrl = this.apiService.pancakeVaultFactoryV1Abi;
    //get factory abi value from artifacts folder
    (await this.commonService.getAbiJSON(factoryAbiUrl)).subscribe(async (e) => {
      this.factoryAbi = e['abi'];
    });
  }

  async deploy() {
    const contract = new ethers.Contract(
      this.globalService.deployedContract,
      this.factoryAbi,
      this.web3Provider.getSigner()
    );
    const params = {
      poolId: BigNumber.from(this.selectedPool.pid),
      approvalDelay: BigNumber.from(21600),
      rewardToLp0Route: ["0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82","0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", this.selectedPool.token.address],
      rewardToLp1Route:["0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82","0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", this.selectedPool.quoteToken.address],
      tokenName : this.valutCreateForm.get('vaultName')?.value,
      tokenSymbol: this.valutCreateForm.get('vaultName')?.value
    };
    try{
      const poolInfoByAdress = await contract['createVault'](params);
      this.isDeployed = true;
      // $('#profile').modal('hide');
      // this.showSuccess("Vault created successfully")
      // this.router.navigate(['/vault']);
    } catch (err: any) {
      this.showError(err.message)
      console.log('revert reason:', err.message);
    }
  }

  selectLp(){
    var apr = +(this.selectedPool.apr._value);
      this.aprValue = apr.toFixed(2);

     this.valutCreateForm.patchValue({
      vaultType: 'Auto-compounding',
      lpPair: this.selectedPool.lpSymbol,
      protocol: "Pancakeswap",
      chain: 'Pancakeswap',
      apy: this.aprValue
    });
    $('#profile').modal('show');
  }

  closePopup() {
    $('#profile').modal('hide');
  }

  showSuccess(message: any) {
    this.messageService.add({severity:'success', summary: 'Success', detail: message});
  }
  showError(message: any) {
    this.messageService.add({severity:'error', summary: 'Error', detail: message});
  }

  goToDashboard(){
    $('#profile').modal('hide');
    this.router.navigate(['/']);
  }
}
