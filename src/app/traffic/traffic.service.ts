import * as lf from 'lovefield';
import * as moment from 'moment';

import {
    DbService,
    Flight,
    LibraryService,
    LovefieldHelper,
    NetworkService,
    ServerStats,
    Setting,
} from '../shared/';

import { AnalyticsService } from '../shared/analytics.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class TrafficService {
    public serverStats: ServerStats = new ServerStats(undefined);
    private clientUpdateInProgress = false;
    private expanded: { [id: string]: boolean } = {};

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

    public monitorTraffic(type: string, id: string): Observable<Flight[]> {
        return new Observable<Flight[]>(subscriber => {
            let flights: any = this.db.vatxDatabase.getSchema().table('flights');
            let query;
            if (type === 'ARRIVALS') {
                query = this.db.vatxDatabase.select().from(flights).orderBy(flights.sort_string, lf.Order.ASC).where(flights.planned_destairport.eq(id));
            } else {
                query = this.db.vatxDatabase.select().from(flights).orderBy(flights.sort_string, lf.Order.DESC).where(flights.planned_depairport.eq(id));
            }
            query.exec().then(results => {
                subscriber.next(results);
                this.db.vatxDatabase.observe(query, changes => {
                    subscriber.next(changes[0].object);
                });
            });

        });

    }

    public expand(id: string) {
        this.expanded[id] = this.expanded[id] ? false : true;
    }

    private updateClients(library: LibraryService) {
        if (this.clientUpdateInProgress) {
            return;
        }
        this.clientUpdateInProgress = true;
        this.analytics.trackEvent('traffic', 'update-clients');
        this.network.updateClientData().subscribe((flights: Flight[]) => {
            let table: any = this.db.vatxDatabase.getSchema().table('flights');
            let start = new Date().getTime();
            LovefieldHelper.insertChunks(this.db.vatxDatabase, table, flights).subscribe(status => {
                // console.log('Status: ' + Math.round(status * 100) + '%');
            }, err => {
                console.log('Failed to insert:' + err);
            }, () => {
                // console.log('Done!');
                this.db.vatxDatabase.delete().from(table).where(table.last_update_from_stream.lt(flights[0].last_update_from_stream)).exec().then(() => {
                    console.log('client update complete');
                    this.clientUpdateInProgress = false;
                });
            });
        });
    }
}
