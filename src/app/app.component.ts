import { Component, ViewEncapsulation } from '@angular/core';

import {
    AppService,
    LibraryService
} from './shared';

@Component({
    selector: 'my-app',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class AppComponent {
    constructor(
        private appService: AppService,
        private libraryService: LibraryService
    ) { }
}
