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
  public btn_loader = false;
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
    this.btn_loader = true;
    const contract = new ethers.Contract(
      this.globalService.deployedContract,
      this.factoryAbi,
      this.web3Provider.getSigner()
    );
    let lpTokenList = this.arrangeTokens(this.selectedPool.token.address, this.selectedPool.quoteToken.address);
    const params = {
      poolId: BigNumber.from(this.selectedPool.pid),
      approvalDelay: BigNumber.from(21600),
      rewardToLp0Route: this.getVaultCreateRoute(lpTokenList[0]),
      rewardToLp1Route: this.getVaultCreateRoute(lpTokenList[1]),
      tokenName : this.valutCreateForm.get('vaultName')?.value,
      tokenSymbol: this.valutCreateForm.get('vaultName')?.value
    };
    console.log("vault param", params);
    try{
      const crVltTxtx = await contract['createVault'](params);

      await crVltTxtx.wait().then(() =>{
        this.btn_loader = false;
        this.isDeployed = true;
      });
      // $('#profile').modal('hide');
      // this.showSuccess("Vault created successfully")
      // this.router.navigate(['/vault']);
    } catch (err: any) {
      this.btn_loader = false;
      this.showError(err.message)
      console.log('revert reason:', err.message);
    }
  }

  arrangeTokens(tokenA: string, tokenB: string): [string, string]{
    return tokenA.toLowerCase() < tokenB.toLowerCase() ? [tokenA, tokenB] : [tokenB, tokenA];
  }

  getVaultCreateRoute(lpToken: any){
    if(lpToken == this.globalService.rewardTokenAddress){
      return [this.globalService.rewardTokenAddress];
    } else if(lpToken == this.globalService.mlcTokenAdress){
      return [this.globalService.rewardTokenAddress, this.globalService.mlcTokenAdress];
    } else if(this.globalService.rewardTokenAddress == this.globalService.mlcTokenAdress){
     return [this.globalService.rewardTokenAddress, lpToken];
    } else{
      return [this.globalService.rewardTokenAddress, this.globalService.mlcTokenAdress, lpToken];
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
