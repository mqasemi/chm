import { NgModule } from '@angular/core';
import { NbMenuModule } from '@nebular/theme';

import { ThemeModule } from '../@theme/theme.module';
import { PagesComponent } from './pages.component';
import { DashboardModule } from './dashboard/dashboard.module';
import { ECommerceModule } from './e-commerce/e-commerce.module';
import { PagesRoutingModule } from './pages-routing.module';
import { MiscellaneousModule } from './miscellaneous/miscellaneous.module';
import { SharedModule } from '../shaered-modules/shared.module';
import { LoginTest } from './logintest/loginTest';
import { OAuth2CallbackComponent } from './logintest/OAuth2CallbackComponent';

@NgModule({
  imports: [
    PagesRoutingModule,
    ThemeModule,
    NbMenuModule,
    DashboardModule,
    ECommerceModule,
    MiscellaneousModule,
    SharedModule,
  ],
  declarations: [
    PagesComponent,
    LoginTest,
    OAuth2CallbackComponent,
  ],
})
export class PagesModule {
}
