import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import * as moment from 'moment';

import { AnalyticsService } from './analytics.service';
import { DbService } from './db.service';
import { NetworkService } from './network.service';

import {
    Flight,
    LovefieldHelper,
    SearchResult
} from './';
import {
    Airline,
    Airport,
    LibraryInfo
} from './model';

@Injectable()
export class LibraryService {

    public updatingAirlines: number = 0;
    public updatingAirports: number = 0;

    public searchResults: SearchResult[] = [];

    constructor(
        private networkService: NetworkService,
        private db: DbService,
        private analytics: AnalyticsService
    ) {
        db.whenReady(() => {
            let start = new Date().getTime();

            let metaQuery = Observable.forkJoin(
                LovefieldHelper.getAll(this.db.vatxDatabase, 'library_info'),
                this.networkService.getMeta()
            );

            metaQuery.subscribe(results => {
                let oldLibraryInfo: LibraryInfo = new LibraryInfo(results[0][0]);
                let newLibraryInfo: LibraryInfo = new LibraryInfo(results[1]);
                oldLibraryInfo.serverVersion = newLibraryInfo.serverVersion;
                if (newLibraryInfo.airport_rev > oldLibraryInfo.airport_rev) {
                    console.log('Airports outdated');
                    // download airports
                    this.networkService.getAirports().subscribe(data => {
                        let airports: any = this.db.vatxDatabase.getSchema().table('airports');
                        LovefieldHelper.insertChunks(this.db.vatxDatabase, airports, data).subscribe(status => {
                            // console.log('Status apt: ' + Math.round(status * 100) + '%');
                            this.updatingAirports = status;
                        }, err => {
                            console.log('Failed to insert airports:' + err);
                            this.updatingAirports = 0;
                        }, () => {
                            this.updatingAirports = 0;
                            console.log('Done Airports!');
                            oldLibraryInfo.airport_rev = newLibraryInfo.airport_rev;
                            LovefieldHelper.insertOrReplace(this.db.vatxDatabase, 'library_info', oldLibraryInfo).subscribe(result => {
                                console.log('Meta data updated');
                            });
                        });
                    });
                }
                if (newLibraryInfo.airline_rev > oldLibraryInfo.airline_rev) {
                    // download airlines
                    this.networkService.getAirlines().subscribe(data => {
                        let airlines: any = this.db.vatxDatabase.getSchema().table('airlines');
                        LovefieldHelper.insertChunks(this.db.vatxDatabase, airlines, data).subscribe(status => {
                            // console.log('Status aln: ' + Math.round(status * 100) + '%');
                            this.updatingAirlines = status;
                        }, err => {
                            console.log('Failed to insert airlines:' + err);
                            this.updatingAirlines = 0;
                        }, () => {
                            console.log('Done Airlines!');
                            this.updatingAirlines = 0;
                            oldLibraryInfo.airline_rev = newLibraryInfo.airline_rev;
                            LovefieldHelper.insertOrReplace(this.db.vatxDatabase, 'library_info', oldLibraryInfo).subscribe(result => {
                                console.log('Meta data updated');
                            });
                        });
                    });
                }
            });
        });

    }

    public getAirport(id: string): Observable<Airport> {
        return new Observable<Airport>(subscriber => {
            // try db
            let airports: any = this.db.vatxDatabase.getSchema().table('airports');
            let query = this.db.vatxDatabase.select().from(airports).where(airports.id.eq(id));
            query.exec().then(results => {
                if (results.length) {
                    // found
                    subscriber.next(new Airport(results[0]));
                    subscriber.complete();
                } else {
                    subscriber.next(undefined);
                    let handler = changes => {
                        // console.log(changes[0].object[0]);
                        subscriber.next(new Airport(changes[0].object[0]));
                        subscriber.complete();
                        this.db.vatxDatabase.unobserve(query, handler);
                    };
                    this.db.vatxDatabase.observe(query, handler);
                }
            }).catch(err => {
                console.log(err);
                subscriber.error(err);
            });
        });
    }

    public getAirline(id: string): Observable<Airline> {
        return new Observable<Airline>(subscriber => {
            // try db
            let airlines: any = this.db.vatxDatabase.getSchema().table('airlines');
            let query = this.db.vatxDatabase.select().from(airlines).where(airlines.id.eq(id));
            query.exec().then(results => {
                if (results.length) {
                    // found
                    subscriber.next(new Airline(results[0]));
                    subscriber.complete();
                } else {
                    subscriber.next(undefined);
                    let handler = changes => {
                        // console.log(changes[0].object[0]);
                        subscriber.next(new Airline(changes[0].object[0]));
                        subscriber.complete();
                        this.db.vatxDatabase.unobserve(query, handler);
                    };
                    this.db.vatxDatabase.observe(query, handler);
                }
            }).catch(err => {
                console.log(err);
                subscriber.error(err);
            });
        });
    }

    public find(q: string): void {
        let maxResults = 20;
        if (!q) {
            this.searchResults = [];
            return;
        }
        let start = new Date().getTime();
        let airports: any = this.db.vatxDatabase.getSchema().table('airports');
        let airlines: any = this.db.vatxDatabase.getSchema().table('airlines');
        let regex = new RegExp('^' + q, 'i');
        let code = q.toUpperCase();
        let results: SearchResult[] = [];
        let resultkeys: string[] = [];

        this.analytics.trackEvent('search', 'query', code);

        // First: EXACT match
        this.db.vatxDatabase.select().from(airports).where(airports.id.eq(code)).exec().then(rows => {
            rows.forEach((row: any) => {
                results.push(new SearchResult(row, 'apt'));
                resultkeys.push(row.id);
            });
            this.db.vatxDatabase.select().from(airlines).where(airlines.id.eq(code)).exec().then(rows => { // tslint:disable-line:no-shadowed-variable
                rows.forEach((row: any) => {
                    results.push(new SearchResult(row, 'aln'));
                    resultkeys.push(row.id);
                });
                // Second: ID starts with
                this.db.vatxDatabase.select().from(airports).where(airports.id.match(regex)).limit(maxResults - results.length).exec().then(airportsStartingWith => {
                    this.db.vatxDatabase.select().from(airlines).where(airlines.id.match(regex)).limit(maxResults - results.length).exec().then(airlinesStartingWith => {
                        while (results.length < maxResults && (airportsStartingWith.length + airlinesStartingWith.length) > 0) {
                            if (airportsStartingWith.length > 0) {
                                let row: any = airportsStartingWith.shift();
                                if (resultkeys.indexOf(row.id) < 0) {
                                    results.push(new SearchResult(row, 'apt'));
                                    resultkeys.push(row.id);
                                }
                            }
                            if (airlinesStartingWith.length > 0) {
                                let row: any = airlinesStartingWith.shift();
                                if (resultkeys.indexOf(row.id) < 0) {
                                    results.push(new SearchResult(row, 'aln'));
                                    resultkeys.push(row.id);
                                }
                            }
                        }
                        // Third: anything else starts with
                        if (results.length === maxResults) {
                            this.searchResults = results;
                            console.log('Query time for search: ' + (new Date().getTime() - start) + ' ms');
                        } else {
                            this.db.vatxDatabase.select().from(airports).where(lf.op.or(airports.name.match(regex), airports.city.match(regex))).limit(maxResults - results.length).exec().then(airportsStartingWith => { // tslint:disable-line:no-shadowed-variable
                                this.db.vatxDatabase.select().from(airlines).where(lf.op.or(airlines.name.match(regex), airlines.callsign.match(regex))).limit(maxResults - results.length).exec().then(airlinesStartingWith => { // tslint:disable-line:no-shadowed-variable
                                    while (results.length < maxResults && (airportsStartingWith.length + airlinesStartingWith.length) > 0) {
                                        if (airportsStartingWith.length > 0) {
                                            let row: any = airportsStartingWith.shift();
                                            if (resultkeys.indexOf(row.id) < 0) {
                                                results.push(new SearchResult(row, 'apt'));
                                                resultkeys.push(row.id);
                                            }
                                        }
                                        if (airlinesStartingWith.length > 0) {
                                            let row: any = airlinesStartingWith.shift();
                                            if (resultkeys.indexOf(row.id) < 0) {
                                                results.push(new SearchResult(row, 'aln'));
                                                resultkeys.push(row.id);
                                            }
                                        }
                                    }
                                    this.searchResults = results;
                                    console.log('Extended query time for search: ' + (new Date().getTime() - start) + ' ms');
                                });
                            });
                        }
                    });
                });
            });
        });
    }

    public hasAirline(callsign: string) {
        return callsign.length > 3 && isNaN(+callsign.substr(0, 1)) && isNaN(+callsign.substr(1, 1)) && isNaN(+callsign.substr(2, 1)) && !isNaN(+callsign.substr(3, 1));
    }

    public toIcao(callsign: string) {
        let result = '';
        for (let i = 0; i < callsign.length; i++) {
            result += ' ' + this.toWord(callsign.charAt(i));
        }
        return result;
    }

    public formatDate(d): string {
        return moment.utc(d).fromNow();
    }

    private toWord(char) {
        char = char.toUpperCase();
        switch (char) {
            case '0':
                return 'ZERO';
            case '1':
                return 'ONE';
            case '2':
                return 'TWO';
            case '3':
                return 'THREE';
            case '4':
                return 'FOUR';
            case '5':
                return 'FIVE';
            case '6':
                return 'SIX';
            case '7':
                return 'SEVEN';
            case '8':
                return 'EIGHT';
            case '9':
                return 'NINER';
            case 'A':
                return 'ALPHA';
            case 'B':
                return 'BRAVO';
            case 'C':
                return 'CHARLIE';
            case 'D':
                return 'DELTA';
            case 'E':
                return 'ECHO';
            case 'F':
                return 'FOXTROTT';
            case 'G':
                return 'GOLF';
            case 'H':
                return 'HOTEL';
            case 'I':
                return 'INDIA';
            case 'J':
                return 'JULIET';
            case 'K':
                return 'KILO';
            case 'L':
                return 'LIMA';
            case 'M':
                return 'MIKE';
            case 'N':
                return 'NOVEMBER';
            case 'O':
                return 'OSCAR';
            case 'P':
                return 'PAPA';
            case 'Q':
                return 'QUEBEC';
            case 'R':
                return 'ROMEO';
            case 'S':
                return 'SIERRA';
            case 'T':
                return 'TANGO';
            case 'U':
                return 'UNIFORM';
            case 'V':
                return 'VICTOR';
            case 'W':
                return 'WHISKEY';
            case 'X':
                return 'X-RAY';
            case 'Y':
                return 'YANKEE';
            case 'Z':
                return 'ZULU';
            default:
                return char;
        }
    }
}
