import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-vault-setup',
  templateUrl: './vault-setup.component.html',
  styleUrls: ['./vault-setup.component.scss']
})
export class VaultSetupComponent implements OnInit {
customers: any;

  constructor() {
    this.customers = [
      {
        "id":1000,
        "name":"0xae345......5b1",
        "country":{
           "name":"10,000.00",
           "code":"dz"
        },
        "company":"Benton, John B Jr",
        "date":"8.12%",
        "status":"18.54%",
        "verified":true,
        "activity":17,
        "representative":{
           "name":"11,541.32",
           "image":"ionibowcher.png"
        },
        "balance":70663
     },
     {
        "id":1001,
        "name":"0xae345......5b1",
        "country":{
           "name":"10,000.00",
           "code":"eg"
        },
        "company":"Chanay, Jeffrey A Esq",
        "date":"8.12%",
        "status":"18.54%",
        "verified":true,
        "activity":0,
        "representative":{
           "name":"11,541.32",
           "image":"amyelsner.png"
        },
        "balance":82429
     },
     {
        "id":1002,
        "name":"0xae345......5b1",
        "country":{
           "name":"10,000.00",
           "code":"pa"
        },
        "company":"Chemel, James L Cpa",
        "date":"8.12%",
        "status":"18.54%",
        "verified":false,
        "activity":63,
        "representative":{
           "name":"11,541.32",
           "image":"asiyajavayant.png"
        },
        "balance":28334
     },
     {
        "id":1003,
        "name":"0xae345......5b1",
        "country":{
           "name":"10,000.00",
           "code":"si"
        },
        "company":"Feltz Printing Service",
        "date":"8.12%",
        "status":"18.54%",
        "verified":false,
        "activity":37,
        "representative":{
           "name":"11,541.32",
           "image":"xuxuefeng.png"
        },
        "balance":88521
     },
     {
        "id":1004,
        "name":"0xae345......5b1",
        "country":{
           "name":"10,000.00",
           "code":"za"
        },
        "company":"Printing Dimensions",
        "date":"8.12%",
        "status":"18.54%",
        "verified":true,
        "activity":33,
        "representative":{
           "name":"11,541.32",
           "image":"asiyajavayant.png"
        },
        "balance":93905
     },
     {
        "id":1005,
        "name":"0xae345......5b1",
        "country":{
           "name":"10,000.00",
           "code":"eg"
        },
        "company":"Chapman, Ross E Esq",
        "date":"8.12%",
        "status":"18.54%",
        "verified":false,
        "activity":68,
        "representative":{
           "name":"11,541.32",
           "image":"ivanmagalhaes.png"
        },
        "balance":50041
     }
    ]
   }

  ngOnInit(): void {
  }

}
