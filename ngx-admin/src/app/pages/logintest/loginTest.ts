import { Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { NbAuthService } from '../../auth/services/auth.service';
import { NbAuthResult } from '../../auth/services/auth-result';

@Component({
    selector: 'nb-oauth2-login',
    template: `
      <button class="btn btn-success"  (click)="login()">Sign In with Google</button>
    `,
  })
export class LoginTest implements OnDestroy {

    private destroy$ = new Subject<void>();
    constructor(private authService: NbAuthService){
    }
    login() {
      this.authService.authenticate('chmUi')
        .pipe(takeUntil(this.destroy$))
        .subscribe(
            (authResult: NbAuthResult) => {
        });
    }
  
    ngOnDestroy(): void {
      this.destroy$.next();
      this.destroy$.complete();
    }
  }