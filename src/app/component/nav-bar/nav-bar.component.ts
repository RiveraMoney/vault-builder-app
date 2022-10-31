import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Web3Service } from 'src/app/service/web3.service';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit {
  public items: MenuItem[] = [];
  library:any;
  account: any;
  network: any;
  chainId: any;
  provider: any;

  constructor(private web3Service:Web3Service) {
    this.items = [
    //   {
    //     label:'Home',
    //     icon:'pi pi-home',
    //     routerLink: '/'
    //  },
      // {
      //     label:'Match',
      //     icon:'pi pi-user-edit',
      //     items:[
      //         {
      //             label:'Add',
      //             icon:'pi pi-fw pi-plus',
      //             url: 'http://159.65.148.113/admin/tournaments/tournamentmatches/add/'
      //         },
      //         {
      //             label:'Edit',
      //             icon:'pi pi-fw pi-pencil',
      //             routerLink: '/match'
      //         }
      //     ]
      // },
  ];
   }

  ngOnInit(): void {
    if(this.web3Service.web3Modal.cachedProvider){
      this.connectWallet();
    }
  }

  ngOnDestroy(): void{
    this.web3Service.disConnect();
  }

  public async connectWallet(){
    await this.web3Service.connectWallet().then(async e =>{
      const accounts = await e.listAccounts();
      this.account = accounts[0];
      this.network = await e.getNetwork();
      this.chainId = this.network.chainId;
    });
  }


  disConnect(){
    this.web3Service.disConnect();
  }

}
