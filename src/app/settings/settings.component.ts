import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AppService } from '../shared/app.service';
import { DbService } from '../shared/db.service';

import { Profile } from '../shared';

@Component({
    selector: 'settings',
    styleUrls: ['./settings.component.css'],
    templateUrl: './settings.component.html'
})
export class SettingsComponent {
    public airportInput: string = '';
    public expanded: boolean = false;
    public profiles: string;
    public profileValidationError = undefined;
    private editProfile: number = -1;
    private shoeExportPanel = false;
    private newProfile: Profile;

    constructor(
        private app: AppService,
        private router: Router,
        private db: DbService
    ) {
        app.whenReady(() => {
            this.profiles = JSON.stringify(app.profiles, undefined, 2);
        });
    }

    public addAirport() {
        if (this.airportInput.length === 4) {
            let apt: string = this.airportInput.toUpperCase();
            this.app.addAirportToCurrentProfile(apt);
            this.airportInput = '';
        }
    }

    public cancel() {
        this.profiles = JSON.stringify(this.app.profiles, undefined, 2);
        this.checkProfiles();
        this.shoeExportPanel = false;
    }

    public expand(id) {
        if (id === this.app.activeProfile) {
            this.expanded = !this.expanded;
        } else {
            this.app.activeProfile = id;
            this.expanded = true;
        }
    }

    public get airports() {
        let profile = this.app.profiles[this.app.activeProfile];
        let resultKeys = {};
        let results = [];
        for (let i = 0; i < profile.arrivals.length; i++) {
            if (!resultKeys.hasOwnProperty(profile.arrivals[i])) {
                results.push({
                    arr: true,
                    dep: false,
                    id: profile.arrivals[i]
                });
                resultKeys[profile.arrivals[i]] = results.length - 1;
            }
        }
        for (let i = 0; i < profile.departures.length; i++) {
            if (!resultKeys.hasOwnProperty(profile.departures[i])) {
                results.push({
                    arr: false,
                    dep: true,
                    id: profile.departures[i]
                });
            } else {
                results[resultKeys[profile.departures[i]]].dep = true;
            }
        }
        results.sort((a, b) => {
            if (a.id < b.id) {
                return -1;
            }
            if (a.id > b.id) {
                return 1;
            }
            return 0;
        });
        return results;
    }

    public saveProfiles() {
        let profiles = this.checkProfiles();
        if (!this.profileValidationError) {
            this.app.profiles = profiles;
            this.shoeExportPanel = false;
        }
    }

    public toggleMode() {
        this.shoeExportPanel = !this.shoeExportPanel;
    }

    private checkProfiles() {
        try {
            let tmp = JSON.parse(this.profiles);
            if (!Array.isArray(tmp)) {
                throw 'Input is not an array.';
            }
            for (let i = 0; i < tmp.length; i++) {
                for (let key in tmp[i]) {
                    if (key !== 'title' && key !== 'arrivals' && key !== 'departures') {
                        throw 'Invalid key: ' + key;
                    }
                }
                if (!tmp[i].hasOwnProperty('title')) {
                    throw 'Missing required field: title';
                }
                if (!tmp[i].hasOwnProperty('arrivals')) {
                    throw 'Missing required field: arrivals';
                }
                if (!tmp[i].hasOwnProperty('departures')) {
                    throw 'Missing required field: departures';
                }
                for (let arr in tmp[i].arrivals) {
                    if (tmp[i].arrivals[arr].length !== 4) {
                        throw 'Invalid airport code: ' + tmp[i].arrivals[arr];
                    }
                }
                for (let arr in tmp[i].departures) {
                    if (tmp[i].departures[arr].length !== 4) {
                        throw 'Invalid airport code: ' + tmp[i].departures[arr];
                    }
                }
            }
            this.profileValidationError = undefined;
            return tmp;
        } catch (e) {
            this.profileValidationError = e;
        }
        return undefined;
    }
}
