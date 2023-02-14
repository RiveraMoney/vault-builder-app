import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ethers } from 'ethers';
import { Observable } from 'rxjs';
import Web3Modal from "web3modal";
declare var window: any;
@Injectable({
  providedIn: 'root',
})
export class Web3Service {

  public web3Modal: any;
  library: any;
  account: any;
  network: any;
  chainId: any;
  provider: any;

  constructor(private http: HttpClient) {
    const providerOptions: any = {
      // walletconnect: {
      //   package: window.WalletConnectProvider.default,
      //   options: {
      //     // Mikko's test key - don't copy as your mileage may vary
      //     infuraId: '8043bb2cf99347b1bfadfb233c5325c0',
      //   },
      // },
      // fortmatic: {
      //   package: window.Fortmatic,
      //   options: {
      //     // Mikko's TESTNET api key
      //     key: 'pk_live_F89672B0C7E9CC81',
      //   },
      // },
    };

    this.web3Modal = new Web3Modal({
      cacheProvider: true, // optional
      providerOptions, // required
      //disableInjectedProvider: false, // optional. For MetaMask / Brave / Opera.
    });
  }

  public async connectWallet() {
    if(window.ethereum && window.ethereum.isMetaMask) {
    console.log("Opening a dialog", this.web3Modal);
    try {
      //const instance = await this.web3Modal.connect();
      this.provider = await this.web3Modal.connect();
      this.library = new ethers.providers.Web3Provider(this.provider);
      // const libraryString = JSON.stringify(this.library);
      // sessionStorage.setItem("library", libraryString);

      // window.sessionStorage.setItem("library", libraryString);
      const accounts = await this.library.listAccounts();
      const network = await this.library.getNetwork();
      const chainId = network.chainId;
      const binanceTestChainId = '0x38'
      if (chainId != 56) {
        try {
        await this.provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: binanceTestChainId }],
        });
      } catch (switchError: any) {
        // This error code indicates that the chain has not been added to MetaMask.
        if (switchError.code === 4902) {
          try {
            await this.provider.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0x38',
                  chainName: 'Smart Chain',
                  rpcUrls: ['https://bsc-dataseed.binance.org/'] /* ... */,
                  nativeCurrency: {
                    name: "BNB",
                    symbol: "BNB",
                    decimals: 18
                },
                  blockExplorerUrls: ["https://bscscan.com"]
                },
              ],
            });
          } catch (addError) {
            // handle "add" error
          }
        }
        // handle other "switch" errors
      }
      }
      //sessionStorage.setItem("library", JSON.stringify(this.library));
      sessionStorage.setItem("account", accounts[0]);
      sessionStorage.setItem("network", network);
      sessionStorage.setItem("chainId", chainId);
      // this.account = accounts[0];
      // this.network = await this.library.getNetwork();
      // this.chainId = this.network.chainId;
      return this.library;
    } catch (e) {
      console.log("Could not get a wallet connection", e);
      return;
    }}
    else{
      return;
    }
  }

  public async disConnect() {
    await this.web3Modal.clearCachedProvider();
    sessionStorage.clear();
    window.location.reload();
  }

  public async getAccount(library: any) {
    const accounts = await library.listAccounts();
    return accounts[0];
  }

  public async getAbiJSON(fileName: any): Promise<Observable<any>> {

    const url = `./assets/json/${fileName}`;
    return this.http.get(url);
  }

  public async getLpJSON(fileName: any): Promise<Observable<any>> {
    const url = `https://farms-config.pages.dev/${fileName}`;
    return this.http.get(url);
  }


  // public getJSON(): Observable<any> {
  //   return this.http.get("./assets/mydata.json");
  // }

}
