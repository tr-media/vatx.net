import { Component } from '@angular/core';
import * as moment from 'moment';

import { AppService } from '../app.service';
import { LibraryService } from '../library.service';

@Component({
    selector: 'navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
    private utcTime: string = this.getTime();
    private searchQuery: string = '';

    constructor(
        private appService: AppService,
        private libraryService: LibraryService
    ) {
        let navbarComponent = this;
        setInterval(() => {
            navbarComponent.utcTime = navbarComponent.getTime();
        }, 1000);
    }
    private getTime() {
        return moment.utc().format('HH:mm');
    }

    private updateSearch() {
        this.libraryService.find(this.searchQuery);
    }
}
