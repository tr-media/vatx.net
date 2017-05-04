import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, ViewEncapsulation } from '@angular/core';
import * as lf from 'lovefield';

import {
    DbService,
    Flight,
    LovefieldHelper
} from '../shared/';

@Component({
    selector: 'test',
    templateUrl: './test.component.html',
    styleUrls: ['./test.component.css'],
    encapsulation: ViewEncapsulation.Native,
    animations: [
        trigger('flyInOut', [
            state('in', style({ height: '24px', opacity: 1 })),
            transition(':enter', [
                style({ opacity: 0, height: 0 }),
                animate(300)
            ]),
            transition(':leave', [
                animate(500, style({ opacity: 0, height: 0 }))
            ])
        ])
    ]
})
export class TestComponent {
    public entries: any[] = [];

    constructor(
        private db: DbService
    ) { }

    public add() {
        this.entries.splice(0, 0, { title: 'Bla', show: true });
    }

    public remove() {
        if (this.entries.length) {
            this.entries.splice(Math.round(Math.random() * this.entries.length), 1);
        }
    }

    public addDb() {
        let flights: any = this.db.vatxDatabase.getSchema().table('flights');
        let testData: Flight = new Flight({
            callsign: 'BER107',
            cid: '111111',
            realname: 'Tobey Fox',
            planned_depairport: 'EDDT',
            planned_destairport: 'EDDB'
        });
        LovefieldHelper.insertOrUpdate(this.db.vatxDatabase, flights, testData).then(results => {
            console.log('done');
            console.log(results);
        }).catch(e => {
            console.log('Error: ' + e);
        });
    }

    public removeDb() {
        let flights: any = this.db.vatxDatabase.getSchema().table('flights');
        this.db.vatxDatabase.delete().from(flights).where(flights.callsign.eq('BER107')).exec().then(results => {
            console.log('deleted?');
        });
    }
}
