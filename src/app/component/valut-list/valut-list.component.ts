import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
declare var $: any;
@Component({
  selector: 'app-valut-list',
  templateUrl: './valut-list.component.html',
  styleUrls: ['./valut-list.component.scss'],
})
export class ValutListComponent implements OnInit {
  public valutCreateForm!: FormGroup;
  public lpList: any;
  public selectedCar: any;
  constructor(private fb: FormBuilder) {}

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
}
