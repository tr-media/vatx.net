import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import * as lf from 'lovefield';
import * as moment from 'moment';

import {
    DbService,
    Flight,
    LibraryService,
    LovefieldHelper,
    NetworkService,
    ServerStats,
    Setting
} from '../shared/';

import { AnalyticsService } from '../shared/analytics.service';

@Injectable()
export class TrafficService {
    public serverStats: ServerStats = new ServerStats(undefined);
    public expanded: { [id: string]: boolean } = {};
    private clientUpdateInProgress = false;

    constructor(
        private network: NetworkService,
        public library: LibraryService,
        private db: DbService,
        private analytics: AnalyticsService
    ) {
        db.whenReady(() => {
            this.network.updateServerStats().subscribe(newServerStats => {
                if (newServerStats.isAfter(this.serverStats)) {
                    this.serverStats = newServerStats;
                    this.updateClients(this.library);
                } else {
                    this.serverStats = newServerStats;
                }
            });
        });
    }

    public monitorTraffic(type: string, id: string): Observable<{ rows: Flight[], updated: number[], removed: string[] }> {
        return new Observable<{ rows: Flight[], updated: number[], removed: string[] }>(subscriber => {
            let flights: any = this.db.vatxDatabase.getSchema().table('flights');
            let query;
            if (type === 'ARRIVALS') {
                query = this.db.vatxDatabase.select().from(flights).orderBy(flights.sort_string, lf.Order.ASC).where(flights.planned_destairport.eq(id));
            } else {
                query = this.db.vatxDatabase.select().from(flights).orderBy(flights.sort_string, lf.Order.DESC).where(flights.planned_depairport.eq(id));
            }
            this.db.vatxDatabase.observe(query, changes => {
                let changeSet = {
                    rows: changes[0].object,
                    updated: [],
                    removed: []
                };
                for (let i = 0; i < changes.length; i++) {
                    // Add callsigns to removed list
                    for (let j = 0; j < changes[i].removed.length; j++) {
                        changeSet.removed.push(changes[i].removed[j].callsign);
                    }
                    // Add indeces to updated list
                    for (let j = 0; j < changes[i].addedCount; j++) {
                        changeSet.updated.push(changes[i].index + j);
                    }
                    // Check consistency
                    for (let j = 0 ; j < changeSet.updated.length; j++) {
                        let k = changeSet.removed.indexOf(changeSet.rows[changeSet.updated[j]].callsign);
                        if (k >= 0) {
                            changeSet.removed.splice(k, 1);
                        }
                    }
                }
                subscriber.next(changeSet);
            });
            query.exec();

        });

    }

    public expand(id: string) {
        this.expanded[id] = this.expanded[id] ? false : true;
    }

    private updateClients(library: LibraryService) {
        if (this.clientUpdateInProgress) {
            return;
        }
        console.log('Updating data...');
        this.clientUpdateInProgress = true;
        this.analytics.trackEvent('traffic', 'update-clients');
        this.network.updateClientData().subscribe((flights: Flight[]) => {
            let table: any = this.db.vatxDatabase.getSchema().table('flights');
            let start = new Date().getTime();

            this.db.vatxDatabase.select(table.callsign).from(table).exec().then(existingCallsigns => {
                existingCallsigns = existingCallsigns.map(c => { return c['callsign']; });
                let result = {
                    delete: [],
                    update: [],
                    insert: []
                };
                for (let i = 0; i < flights.length; i++) {
                    let j = existingCallsigns.indexOf(flights[i].callsign);
                    if (j >= 0) {
                        result.update.push(flights[i]);
                        existingCallsigns.splice(j, 1);
                    } else {
                        result.insert.push(flights[i]);
                    }
                }
                result.delete = existingCallsigns;
                return result;
            }).then(job => {
                if (job.delete.length > 0) {
                    return LovefieldHelper.deleteBulk(this.db.vatxDatabase, table, job.delete).then(() => {
                        return job;
                    });
                } else {
                    return job;
                }
            }).then(job => {
                if (job.update.length > 0) {
                    return LovefieldHelper.updateBulk(this.db.vatxDatabase, table, job.update).then(() => {
                        return job;
                    });
                } else {
                    return job;
                }
            }).then(job => {
                if (job.insert.length > 0) {
                    return LovefieldHelper.insertBulk(this.db.vatxDatabase, table, job.insert).then(() => {
                        return job;
                    });
                } else {
                    return job;
                }
            }).then(() => {
                console.log('Update complete.');
                this.clientUpdateInProgress = false;
            });
        });
    }
}
