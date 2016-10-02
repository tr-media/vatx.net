import { Component } from '@angular/core';
import { Router }    from '@angular/router';

import { AppService } from '../app.service';
import { LibraryService } from '../library.service';

import { SearchResult } from '../model/searchResult';

@Component({
    selector: 'search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.css']
})
export class SearchComponent {

    private selectedResult: string = undefined;

    constructor(
        private app: AppService,
        private libraryService: LibraryService,
        private router: Router
    ) { }

    public toggle(result: SearchResult) {
        if (this.selectedResult === result.id) {
            this.selectedResult = undefined;
        } else {
            this.selectedResult = result.id;
        }
    }

    public toggleState(result: SearchResult, arrivals: boolean, departues: boolean) {
        this.app.addToCurrentProfile(result.id, arrivals, departues);
        this.router.navigate(['traffic']);
    }
}
