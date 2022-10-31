import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ethers } from 'ethers';
import { Web3Service } from 'src/app/service/web3.service';
import Web3Modal from 'web3modal';
declare var window: any;
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

  constructor(
    private web3Service: Web3Service,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    if (this.web3Service.web3Modal.cachedProvider) {
      this.isLogin = true;
    }
  }

  public async switchNetwork() {
    try {
      await this.library.provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: this.toHex(this.network) }],
      });
      window.location.reload();
    } catch (switchError) {
      debugger;
      if (switchError === 4902) {
        try {
          const switchNetwork = this.toHex(this.network);
          await this.library.provider.request({
            method: 'wallet_addEthereumChain',
            params: [this.networkParams[switchNetwork]],
          });
        } catch (error) {
          debugger;
          // setError(error);
        }
      }
    }
  }

  handleNetwork(e: any) {
    const id = e.target.value;
    this.network = Number(id);
  }

  public toHex(num: any): string {
    const val = Number(num);
    return '0x' + val.toString(16);
  }

  public connectWallet() {
    this.web3Service.connectWallet().then((e) => {
      window.location.reload();
    });
  }
  createValut() {
    this.router.navigate(['/valut']);
  }

  public async getCakePerBlock() {
    debugger;
    //this.provider = await this.web3Modal.connect();
    //  this.web3Service.connectWallet().then(e =>{
    //   this.library = e;
    // });
    const aa = new ethers.providers.Web3Provider(window.ethereum);
    console.log('library', sessionStorage.getItem('library'));
    const cakeAddress = '0xa5f8C5Dbd5F286960b9d90548680aE5ebFf07652';
    (await this.web3Service.getAbiJSON('MasterChefV2Abi.json')).subscribe(async (e) => {
      debugger;
      this.cakeAbi = e;
      const daiContract = new ethers.Contract(cakeAddress, this.cakeAbi, aa);
      console.log('nane', await daiContract['name']());
    });
  }
}
