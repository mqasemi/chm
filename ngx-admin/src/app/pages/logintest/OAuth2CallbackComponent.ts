import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { NbAuthService } from '../../auth/services/auth.service';
import { NbAuthResult } from '../../auth/services/auth-result';

@Component({
    selector: 'nb-playground-oauth2-callback',
    template: `
      authentication...
    `,
  })
export class OAuth2CallbackComponent implements OnDestroy {

    private destroy$ = new Subject<void>();
  
    constructor(private authService: NbAuthService, private router: Router) {
      this.authService.authenticate('chmUi')
        .pipe(takeUntil(this.destroy$))
        .subscribe((authResult: NbAuthResult) => {
          if (authResult.isSuccess() && authResult.getRedirect()) {
            this.router.navigateByUrl(authResult.getRedirect());
          }
        });
    }
  
    ngOnDestroy(): void {
      this.destroy$.next();
      this.destroy$.complete();
    }
  }