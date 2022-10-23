import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './component/home/home.component';
import { ValutListComponent } from './component/valut-list/valut-list.component';
import { AuthGuard } from './service/authGuard/auth.guard';

const routes: Routes = [{
  path:'', component: HomeComponent,},
  {path: 'valut', component: ValutListComponent, canActivate: [AuthGuard]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
