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
        this.createDatabase();
    }

    public whenReady(callback: Function) {
        if (this.ready) {
            callback();
        } else {
            this.whenReadyCallbacks.push(callback);
        }
    }

    private createDatabase() {
        let start = new Date().getTime();
        let vatxSchema = lf.schema.create('vatx', 3);
        Flight.createTable(vatxSchema);
        Setting.createTable(vatxSchema);
        Airport.createTable(vatxSchema);
        Airline.createTable(vatxSchema);
        LibraryInfo.createTable(vatxSchema);

        return vatxSchema.connect({}).then(db => {
            this.vatxDatabase = db;
            console.log('Database ready after ' + (new Date().getTime() - start) + ' ms.');
            this.ready = true;
            while (this.whenReadyCallbacks.length) {
                this.whenReadyCallbacks.shift()();
            }
        }).catch(err => {
            console.log('Database integrity failed. Trying to recover.');
            this.resetDatabase();
        });
    }

    private resetDatabase() {
        let request = window.indexedDB.deleteDatabase('vatx');
        request.onerror = event => {
            console.log('Error deleting database.');
        };

        request.onsuccess = event => {
            console.log('Database deleted successfully');
            this.createDatabase();
        };
    }
}
