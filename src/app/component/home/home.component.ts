import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { BigNumber, ethers } from 'ethers';
import { MessageService } from 'primeng/api';
import { ApiService } from 'src/app/service/api.service';
import { CommonService } from 'src/app/service/common.service';
import { GlobalService } from 'src/app/service/global.service';
import { Web3Service } from 'src/app/service/web3.service';
declare var window: any;
declare var $: any;
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  networkParams: any = {
    '0x63564c40': {
      chainId: '0x63564c40',
      rpcUrls: ['https://api.harmony.one'],
      chainName: 'Harmony Mainnet',
      nativeCurrency: { name: 'ONE', decimals: 18, symbol: 'ONE' },
      blockExplorerUrls: ['https://explorer.harmony.one'],
      iconUrls: [
        'https://harmonynews.one/wp-content/uploads/2019/11/slfdjs.png',
      ],
    },
    '0xa4ec': {
      chainId: '0xa4ec',
      rpcUrls: ['https://forno.celo.org'],
      chainName: 'Celo Mainnet',
      nativeCurrency: { name: 'CELO', decimals: 18, symbol: 'CELO' },
      blockExplorerUrl: ['https://explorer.celo.org'],
      iconUrls: [
        'https://celo.org/images/marketplace-icons/icon-celo-CELO-color-f.svg',
      ],
    },
  };
  factoryAbi:any;
  lpAbi: any;
  valutAbi: any;
  // Web3modal instance
  web3Modal: any;
  library: any;
  account: any;
  network: any;
  chainId: any;
  // Chosen wallet provider given by the dialog window
  provider: any;
  // Address of the selected account
  selectedAccount: any;
  isValutCreated = false;
  cakeAbi: any;
  isLogin = false;
  isApprove = false;
  isDeposit = true;
  isDepositOrWithdrawstart = false;
  public web3Provider: any;
  public valutAddress: any;
  public valutAddressList: any[] = [];
  public displayBasic: boolean= false;
  public valutCreateForm!: FormGroup;

  constructor(
    private web3Service: Web3Service,
    private router: Router,
    private http: HttpClient,
    private globalService: GlobalService,
    private fb: FormBuilder,
    public commonService: CommonService,
    public apiService: ApiService,
    private messageService: MessageService
  ) {}

  async ngOnInit(): Promise<void> {
    this.valutCreateForm = this.fb.group({
      amount: [''],
      permission: ['private'],
    });
    if (this.web3Service.web3Modal.cachedProvider) {

      this.isLogin = true;
      await this.getAbiValue();
      await this.loadprovider();
      await this.getDeployedValut();
    }


  }

  async getAbiValue(){
    //get factory abi url from api service
    const factoryAbiUrl = this.apiService.pancakeVaultFactoryV1Abi;
    //get factory abi value from artifacts folder
    (await this.commonService.getAbiJSON(factoryAbiUrl)).subscribe(async (e) => {
      this.factoryAbi = e['abi'];
    });

    //get vault abi url from api service
    const valutAbiUrl = this.apiService.riveraAutoCompoundingVaultV1Abi;
    //get vault abi value from artifacts folder
    (await this.commonService.getAbiJSON(valutAbiUrl)).subscribe(async (e) => {
      this.valutAbi = e['abi'];
    });

    //get pancakeLps abi url from api service
    const lpAbiUrl = this.apiService.pancakeLpsAbi;
    //get pancakeLps abi value from abiLists folder
    (await this.commonService.getAbiJSON(lpAbiUrl)).subscribe(async (e) => {
      this.lpAbi = e;
    });
  }


  public connectWallet() {
    this.web3Service.connectWallet().then((e) => {
      window.location.reload();
    });
  }
  createValut() {
    this.router.navigate(['/vault']);
  }

  async loadprovider(){
      //load provider
      await this.web3Service.connectWallet().then((e) => {
        this.web3Provider = e;
        // const aa = this.web3Provider.getBalance('0xa0Ee7A142d267C1f36714E4a8F75612F20a79720').then((e: any)=>{
        //   console.log("balance",   ethers.utils.formatEther(e));
        // });
      });
  }

  async getDeployedValut(){

    const contract = this.getContract(this.globalService.deployedContract,this.factoryAbi,this.web3Provider.getSigner());

    this.valutAddressList = await contract['listAllVaults']();

    this.valutAddressList = this.valutAddressList.map(async e =>{
      const contract = this.getContract(e,this.valutAbi,this.web3Provider.getSigner());
      const balance = await contract['balance']();
      return {
        "address": e,
        "balance": balance
      };
    });

    debugger
    if(this.valutAddressList.length > 0){
      this.isValutCreated = true;
    }

    console.log("allValutList", this.valutAddressList);
  }

  async deposit(){
    const contract = this.getContract(this.valutAddress,this.valutAbi,this.web3Provider.getSigner());
    try {
      await contract['deposit'](BigNumber.from(+this.valutCreateForm.get('amount')?.value));
      this.isDepositOrWithdrawstart = true;
      // $('#depositModal').modal('hide');
    } catch (err: any) {
      this.showError(err.message)
    }
  }

  async withdraw(){
    const contract = this.getContract(this.valutAddress,this.valutAbi,this.web3Provider.getSigner());
    try {
    await contract['withdraw'](BigNumber.from(+this.valutCreateForm.get('amount')?.value));
    this.isDepositOrWithdrawstart = true;
    // $('#depositModal').modal('hide');
  } catch (err: any) {
    this.showError(err.message)
  }
  }

  async showBasicDialog(address: any, type: any) {
    this.isDeposit = type == 'deposit' ? true : false;
    // if(type == 'deposit'){
    //   this.isDeposit = true;
    // } else{
    //   this.isDeposit = false;
    // }
    this.valutAddress = address;
    this.displayBasic = true;
    // const contract = this.getContract(this.valutAddress,this.valutAbi,this.web3Provider.getSigner());
    // const balance = await contract['balance']();
    // console.log("balance", balance);

    const accountContract = this.getContract('0x804678fa97d91B974ec2af3c843270886528a9E6',this.lpAbi, this.web3Provider.getSigner());
  const allowance = await accountContract['allowance'](sessionStorage.getItem("account"),this.valutAddress);
  if(+ethers.utils.formatEther(allowance) > 0){
    this.isApprove = true;
  }
  console.log('allowance', ethers.utils.formatEther(allowance));
  console.log('allowance2', BigNumber.from(allowance));

    $('#depositModal').modal('show');
}

async approve(){
  const contract = this.getContract('0x804678fa97d91B974ec2af3c843270886528a9E6', this.lpAbi, this.web3Provider.getSigner());
  try{
  const amount = 1000000000000000;
  const withdraw = await contract['approve'](this.valutAddress, BigNumber.from(amount));
  this.isApprove = true;
} catch (err: any) {
  this.showError(err.message)
      console.log('revert reason:', err.message);
}
  // withdraw.then((e:any) =>{
  //   this.checkApproval();
  // }).catch((err: any) => alert(err));
}

async checkApproval(){
  console.log("allowance first", ethers.utils.formatEther(+this.valutCreateForm.get('amount')?.value));
  const contract = this.getContract('0x804678fa97d91B974ec2af3c843270886528a9E6',this.lpAbi, this.web3Provider.getSigner());
  const allowance = await contract['allowance'](sessionStorage.getItem("account"),this.valutAddress);
  console.log('allowance', ethers.utils.formatEther(allowance));
  console.log('allowance2', BigNumber.from(allowance));
}

closePopup() {
  $('#depositModal').modal('hide');
}


getContract(address: string, abi: any, provider: any){
 return new ethers.Contract(address,abi, provider);
}
showSuccess() {
  this.messageService.add({severity:'success', summary: 'Success', detail: 'Message Content'});
}
showError(message: any) {
  this.messageService.add({severity:'error', summary: 'Error', detail: message});
}

refresh(){
  location.reload();
}

goToSetup(){
  this.router.navigate(['/vaultSetup']);
}
}
