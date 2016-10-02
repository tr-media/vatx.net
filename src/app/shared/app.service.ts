import { Injectable } from '@angular/core';

import { AnalyticsService } from './analytics.service';

import * as Package from '../../../package.json';

import { DbService } from './db.service';
import { LovefieldHelper } from './lf.helper';
import { Flight } from './model';

@Injectable()
export class AppService {
    public version = '';
    public appName: string = 'vat:x';
    public revealLeft: boolean = false;
    public revealSearch: boolean = false;
    public revealProfiles: boolean = false;
    public popupContent: Flight = undefined;

    public get preferIcaoCodes(): boolean {
        return this._preferIcaoCodes;
    }
    public set preferIcaoCodes(value: boolean) {
        this._preferIcaoCodes = value;
        LovefieldHelper.setSetting(this.db.vatxDatabase, 'preferIcaoCodes', value);
    }

    public get hideProfileTipps(): boolean {
        return this._hideProfileTipps;
    }
    public set hideProfileTipps(value: boolean) {
        this._hideProfileTipps = value;
        LovefieldHelper.setSetting(this.db.vatxDatabase, 'hideProfileTipps', value);
    }

    public get activeProfile(): number {
        return this._activeProfile;
    }
    public set activeProfile(value: number) {
        this._activeProfile = value;
        LovefieldHelper.setSetting(this.db.vatxDatabase, 'activeProfile', value);
    }

    public get profiles(): any[] {
        return this._profiles;
    }
    public set profiles(value: any[]) {
        this._profiles = value;
        LovefieldHelper.setSetting(this.db.vatxDatabase, 'profiles', value);
    }
    private ready = false;
    private whenReadyCallbacks: Function[] = [];
    /* Settings */
    private _preferIcaoCodes: boolean = false; // tslint:disable-line
    private _hideProfileTipps: boolean = false; // tslint:disable-line
    private _activeProfile: number = 0; // tslint:disable-line
    private _profiles: any[] = []; // tslint:disable-line

    constructor(
        private db: DbService,
        private analytics: AnalyticsService
    ) {
        this.version = Package.version;
        console.log('vat:x - ' + this.version);
        db.whenReady(() => {
            LovefieldHelper.getSetting(db.vatxDatabase, 'preferIcaoCodes').then((preferIcaoCodes) => {
                this._preferIcaoCodes = preferIcaoCodes;
                return LovefieldHelper.getSetting(db.vatxDatabase, 'activeProfile').then((activeProfile) => {
                    if (typeof activeProfile === 'number') {
                        this._activeProfile = activeProfile;
                    }
                    return LovefieldHelper.getSetting(db.vatxDatabase, 'hideProfileTipps').then((hideProfileTipps) => {
                        this._hideProfileTipps = !!hideProfileTipps;
                        return LovefieldHelper.getSetting(db.vatxDatabase, 'profiles').then((profiles) => {
                            if (profiles) {
                                this._profiles = profiles;
                            } else {
                                // Load defaults
                                this._profiles = [
                                    {
                                        title: 'German Major Airports',
                                        arrivals: ['EDDB', 'EDDC', 'EDDE', 'EDDF', 'EDDG', 'EDDH', 'EDDI', 'EDDK', 'EDDL', 'EDDM', 'EDDP', 'EDDS', 'EDDT', 'EDDV', 'EDDW'],
                                        departures: ['EDDB', 'EDDC', 'EDDE', 'EDDF', 'EDDG', 'EDDH', 'EDDI', 'EDDK', 'EDDL', 'EDDM', 'EDDP', 'EDDS', 'EDDT', 'EDDV', 'EDDW']
                                    },
                                    {
                                        title: 'Berlin City',
                                        arrivals: ['EDDB', 'EDDT', 'EDDI'],
                                        departures: ['EDDB', 'EDDT', 'EDDI']
                                    },
                                    {
                                        title: 'Berlin Region',
                                        arrivals: ['EDAB', 'EDAC', 'EDAG', 'EDAH', 'EDAK', 'EDAU', 'EDAV', 'EDAY', 'EDAZ', 'EDBC', 'EDBH', 'EDBK', 'EDBM', 'EDBW', 'EDBY', 'EDCA', 'EDCD', 'EDCG', 'EDCJ', 'EDCM', 'EDCP', 'EDCS', 'EDDB', 'EDDC', 'EDDE', 'EDDI', 'EDDP', 'EDDT', 'EDOI', 'EDOP', 'EDOS', 'EDUB', 'EDUS', 'EDUW', 'ETNL', 'ETNU', 'ETSH'],
                                        departures: ['EDAB', 'EDAC', 'EDAG', 'EDAH', 'EDAK', 'EDAU', 'EDAV', 'EDAY', 'EDAZ', 'EDBC', 'EDBH', 'EDBK', 'EDBM', 'EDBW', 'EDBY', 'EDCA', 'EDCD', 'EDCG', 'EDCJ', 'EDCM', 'EDCP', 'EDCS', 'EDDB', 'EDDC', 'EDDE', 'EDDI', 'EDDP', 'EDDT', 'EDOI', 'EDOP', 'EDOS', 'EDUB', 'EDUS', 'EDUW', 'ETNL', 'ETNU', 'ETSH']
                                    },
                                    {
                                        title: 'Frankfurt',
                                        arrivals: ['EDDF'],
                                        departures: ['EDDF']
                                    }
                                ];
                            }
                            this.ready = true;
                            while (this.whenReadyCallbacks.length) {
                                this.whenReadyCallbacks.shift()();
                            }
                        });
                    });
                });
            });
        });
    }

    public toggleLeft() {
        this.revealLeft = !this.revealLeft;
        this.revealProfiles = false;
        this.revealSearch = false;
        this.popupContent = undefined;
    }
    public toggleProfiles() {
        this.revealProfiles = !this.revealProfiles;
        this.revealLeft = false;
        this.revealSearch = false;
        this.popupContent = undefined;
    }
    public toggleSearch() {
        this.revealSearch = !this.revealSearch;
        this.revealLeft = false;
        this.revealProfiles = false;
        this.popupContent = undefined;
    }
    public toggleNone() {
        this.revealSearch = false;
        this.revealProfiles = false;
        this.revealLeft = false;
        this.popupContent = undefined;
    }
    public showPopup($event: MouseEvent, flight: Flight) {
        this.popupContent = flight;
        $event.preventDefault();
        this.analytics.trackEvent('traffic', 'show-popup');
    }

    public addToCurrentProfile(id: string, arr: boolean, dep: boolean) {
        let profile = this._profiles[this._activeProfile];
        let arrIndex = profile.arrivals.indexOf(id);
        let depIndex = profile.departures.indexOf(id);
        if (arr && dep) {
            if (arrIndex !== -1 && depIndex !== -1) {
                // if on both, turn off
                profile.arrivals.splice(arrIndex, 1);
                profile.departures.splice(depIndex, 1);
            } else {
                // turn on
                if (arrIndex === -1) {
                    profile.arrivals.push(id);
                }
                if (depIndex === -1) {
                    profile.departures.push(id);
                }
            }
        } else if (arr) {
            // if on dep, remove
            if (depIndex !== -1) {
                profile.departures.splice(depIndex, 1);
                // if not on arr, add
                if (arrIndex === -1) {
                    profile.arrivals.push(id);
                }
            } else {
                // if not on arr, add
                if (arrIndex === -1) {
                    profile.arrivals.push(id);
                } else {
                    profile.arrivals.splice(arrIndex, 1);
                }
            }
        } else if (dep) {
            // if on arr, remove
            if (arrIndex !== -1) {
                profile.arrivals.splice(arrIndex, 1);
                // if not on dep, add
                if (depIndex === -1) {
                    profile.departures.push(id);
                }
            } else {
                // if not on dep, add
                if (depIndex === -1) {
                    profile.departures.push(id);
                } else {
                    profile.departures.splice(depIndex, 1);
                }
            }
        }
        profile.arrivals.sort();
        profile.departures.sort();
        LovefieldHelper.setSetting(this.db.vatxDatabase, 'profiles', this._profiles);
    }

    public setAirportOnCurrentProfile(id: string, arr: boolean, dep: boolean) {
        let changes = false;
        let profile = this._profiles[this._activeProfile];
        let arrIndex = profile.arrivals.indexOf(id);
        let depIndex = profile.departures.indexOf(id);
        if (arr === true && arrIndex === -1) {
            profile.arrivals.push(id);
            profile.arrivals.sort();
            changes = true;
        } else if (arr === false && arrIndex !== -1) {
            profile.arrivals.splice(arrIndex, 1);
            changes = true;
        }
        if (dep === true && depIndex === -1) {
            profile.departures.push(id);
            changes = true;
        } else if (dep === false && depIndex !== -1) {
            profile.departures.splice(depIndex, 1);
            profile.departures.sort();
            changes = true;
        }
        if (changes) {
            LovefieldHelper.setSetting(this.db.vatxDatabase, 'profiles', this._profiles);
        }
    }

    public isInCurrentProfile(id: string): number {
        let result = 0;
        if (this._profiles[this._activeProfile]) {
            if (this._profiles[this._activeProfile].arrivals.indexOf(id) !== -1) {
                result += 1;
            }
            if (this._profiles[this._activeProfile].departures.indexOf(id) !== -1) {
                result += 2;
            }
        }
        return result;
    }

    public deleteProfile(id: number) {
        if (id < this.profiles.length) {
            this.profiles.splice(id, 1);
            LovefieldHelper.setSetting(this.db.vatxDatabase, 'profiles', this._profiles);
            this.analytics.trackEvent('profiles', 'delete-profile');
        }
    }

    public addProfile() {
        this.profiles.push({
            title: 'New profile',
            arrivals: [],
            departures: []
        });
        LovefieldHelper.setSetting(this.db.vatxDatabase, 'profiles', this._profiles);
        this.analytics.trackEvent('profiles', 'create-profile');
    }

    public addAirportToCurrentProfile(apt: string) {
        let changes = false;
        let profile = this.profiles[this.activeProfile];
        if (profile.arrivals.indexOf(apt) === -1) {
            profile.arrivals.push(apt);
            profile.arrivals.sort();
            changes = true;
        }
        if (profile.departures.indexOf(apt) === -1) {
            profile.departures.push(apt);
            profile.departures.sort();
            changes = true;
        }
        if (changes) {
            LovefieldHelper.setSetting(this.db.vatxDatabase, 'profiles', this._profiles);
        }
    }

    public removeAirportFromCurrentProfile(airport: string) {
        let changes = false;
        let profile = this._profiles[this._activeProfile];
        let arrivalIndex = profile.arrivals.indexOf(airport);
        let departureIndex = profile.departures.indexOf(airport);
        if (arrivalIndex !== -1) {
            profile.arrivals.splice(arrivalIndex, 1);
            changes = true;
        }
        if (departureIndex !== -1) {
            profile.departures.splice(departureIndex, 1);
            changes = true;
        }
        if (changes) {
            LovefieldHelper.setSetting(this.db.vatxDatabase, 'profiles', this._profiles);
        }
    }

    public whenReady(callback: Function) {
        if (this.ready) {
            callback();
        } else {
            this.whenReadyCallbacks.push(callback);
        }
    }

    private saveProfiles() {
        LovefieldHelper.setSetting(this.db.vatxDatabase, 'profiles', this._profiles);
    }
}
