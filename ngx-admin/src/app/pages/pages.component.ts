import { Component, OnInit } from '@angular/core';

import { MENU_ITEMS } from './pages-menu';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { NbMenuItem } from '@nebular/theme';

@Component({
  selector: 'ngx-pages',
  styleUrls: ['pages.component.scss'],
  template: `
    <ngx-one-column-layout>
      <nb-menu [items]="menu"></nb-menu>
      <router-outlet></router-outlet>
    </ngx-one-column-layout>
  `,
})
export class PagesComponent  implements OnInit {
  menu: NbMenuItem[];
  constructor( private translate: TranslateService ) {
  
   translate.use('fa');
    this.menu = MENU_ITEMS;
  }
  ngOnInit() {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.translateMenuItems();
    });
    this.translateMenuItems();
  }

  translateMenuItems() {
    this.menu.forEach( item => {
      this.translateMenuItem( item );
    });
  }

  translateMenuItem( menuItem: NbMenuItem ) {
    if ( menuItem.children != null ) {
      menuItem.children.forEach( item => this.translateMenuItem( item ) );
    }

    if(menuItem.data === undefined) {
      menuItem.data = menuItem.title;
      menuItem.title = this.translate.instant( menuItem.title );
    } else {
      menuItem.title = this.translate.instant( menuItem.data );
    }
  }
}
