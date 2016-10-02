import { Injectable } from '@angular/core';

import {
    Airline,
    Airport,
    Flight,
    LibraryInfo,
    Setting
} from './model';

@Injectable()
export class DbService {
    public ready: boolean = false;
    public vatxDatabase: lf.Database;
    private whenReadyCallbacks: Function[] = [];

    constructor() {
        let start = new Date().getTime();
        let vatxSchema = lf.schema.create('vatx', 3);
        Flight.createTable(vatxSchema);
        Setting.createTable(vatxSchema);
        Airport.createTable(vatxSchema);
        Airline.createTable(vatxSchema);
        LibraryInfo.createTable(vatxSchema);

        vatxSchema.connect({}).then(db => {
            this.vatxDatabase = db;
            console.log('Database ready after ' + (new Date().getTime() - start) + ' ms.');
            this.ready = true;
            while (this.whenReadyCallbacks.length) {
                this.whenReadyCallbacks.shift()();
            }
        });
    }

    public whenReady(callback: Function) {
        if (this.ready) {
            callback();
        } else {
            this.whenReadyCallbacks.push(callback);
        }
    }
}
