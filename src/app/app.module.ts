import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './component/home/home.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavBarComponent } from './component/nav-bar/nav-bar.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MenubarModule} from 'primeng/menubar';
import { ValutListComponent } from './component/valut-list/valut-list.component';
import {TableModule} from 'primeng/table';
import { CommonModule } from '@angular/common';
import {RadioButtonModule} from 'primeng/radiobutton';
import {DialogModule} from 'primeng/dialog';
import {ButtonModule} from 'primeng/button';
import {ToastModule} from 'primeng/toast';
import { VaultDetailsComponent } from './component/vault-details/vault-details.component';
import { MessageService } from 'primeng/api';
import { VaultSetupComponent } from './component/vault-setup/vault-setup.component';
import { NgxUiLoaderModule } from 'ngx-ui-loader';
import { ApolloModule, APOLLO_OPTIONS } from 'apollo-angular';
import { InMemoryCache } from '@apollo/client';
import { HttpLink } from 'apollo-angular/http'

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NavBarComponent,
    ValutListComponent,
    VaultDetailsComponent,
    VaultSetupComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MenubarModule,
    TableModule,
    RadioButtonModule,
    DialogModule,
    ButtonModule,
    ToastModule,
    NgxUiLoaderModule,
    ApolloModule
  ],
  providers: [MessageService,{
    provide: APOLLO_OPTIONS,
    useFactory(httpLink: HttpLink) {
      return {
        cache: new InMemoryCache(),
        link: httpLink.create({
          uri: 'https://bsc.streamingfast.io/subgraphs/name/pancakeswap/exchange-v2'
        })
      }
    },
    deps: [HttpLink]
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
