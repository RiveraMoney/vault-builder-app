import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Web3Service } from '../web3.service';

@Injectable({
    providedIn: 'root'
})

export class AuthGuard implements CanActivate {


    constructor(private web3Service:Web3Service, private router: Router) { }
    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

        if (!this.web3Service.web3Modal.cachedProvider) {
            this.router.navigate(['/']);
            return false;
        } else {
            return true;
        }

    }
}
