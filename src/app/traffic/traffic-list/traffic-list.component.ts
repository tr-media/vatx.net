import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';

import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { AppService } from '../../shared/app.service';
import { LibraryService } from '../../shared/library.service';
import { Airport } from '../../shared/model/airport';
import { Flight } from '../../shared/model/flight';
import { TrafficService } from '../traffic.service';

@Component({
    selector: '[traffic-list]',
    templateUrl: './traffic-list.component.html',
    styleUrls: ['./traffic-list.component.css'],
    changeDetection: ChangeDetectionStrategy.Default,
    encapsulation: ViewEncapsulation.None,
    animations: [
        trigger('flyInOut', [
            state('collapsed', style({ height: '24px', opacity: 1 })),
            state('expanded', style({ height: '44px', opacity: 1 })),
            transition('collapsed => expanded', animate(100)),
            transition('expanded => collapsed', animate(100)),
            transition(':enter', [
                style({ opacity: 0, height: 0 }),
                animate(250)
            ]),
            transition(':leave', [
                animate(150, style({ opacity: 0, height: 0 }))
            ])
        ])
    ]
})
export class TrafficListComponent implements OnInit {
    @Input() public type: string;
    @Input() public airport: string;
    @Input() public expandedRows: { [id: string]: boolean };
    @Output() public flightsUpdated = new EventEmitter();
    private airportName: string = '';
    private flights: Flight[] = [];

    constructor(
        private trafficService: TrafficService,
        private library: LibraryService,
        private appService: AppService
    ) { }

    public ngOnInit() {
        this.library.getAirport(this.airport).subscribe(airport => {
            this.airportName = airport.name + '    ';
        });
        // Reset counters
        this.flightsUpdated.emit({
            airport: this.airport,
            count: this.flights.length
        });
        // Register for updates
        this.trafficService.monitorTraffic(this.type, this.airport).subscribe((r) => {
            // Remove deleted entries first
            let i = 0;
            while (r.removed.length >= 0 && i < this.flights.length) {
                if (r.removed.indexOf(this.flights[i].callsign) >= 0) {
                    this.flights.splice(i, 1);
                } else {
                    i++;
                }
            }
            for (i = 0; i < r.rows.length; i++) {
                if (this.flights.length > i && r.rows[i].callsign === this.flights[i].callsign) {
                    // Entry is in the correct position in the list
                    if (r.updated.indexOf(i) >= 0) {
                        // Data for this entry has changed. Update required.
                        this.flights[i].update(r.rows[i]);
                    } else {
                        // Data is unchanged
                        continue;
                    }
                } else {
                    // get index of entry in the old list
                    let k = -1;
                    for (let j = i + 1; j < this.flights.length; j++) {
                        if (r.rows[i].callsign === this.flights[j].callsign) {
                            k = j;
                            break;
                        }
                    }
                    if (k >= 0) {
                        // Move entry to correct position
                        this.flights.splice(k, 1);
                        this.flights.splice(i, 0, new Flight(r.rows[i]));
                    } else {
                        // Insert at new position
                        this.flights.splice(i, 0, new Flight(r.rows[i]));
                    }
                }
            }
            // Notify listeners
            this.flightsUpdated.emit({
                airport: this.airport,
                count: this.flights.length
            });
        });
    }

    public getIn(callsign) {
        return this.trafficService.expanded[callsign] ? 'expanded' : 'collapsed';
    }
}
