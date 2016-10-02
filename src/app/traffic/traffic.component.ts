import { Component, ViewEncapsulation  } from '@angular/core';

import {
    AppService,
    DbService,
    LibraryService
} from '../shared';
import { TrafficService } from './traffic.service';

@Component({
    selector: 'traffic',
    templateUrl: './traffic.component.html',
    styleUrls: ['./traffic.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class TrafficComponent {
    public airports: string[] = [];
    private expandedRows: { [id: string]: boolean } = {};

    constructor(
        private trafficService: TrafficService,
        private app: AppService,
        private dbService: DbService,
        private libraryService: LibraryService
    ) { }
}
