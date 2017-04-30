import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';

import { Airport } from '../../shared/model/airport';
import { AppService } from '../../shared/app.service';
import { Flight } from '../../shared/model/flight';
import { LibraryService } from '../../shared/library.service';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
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
        this.trafficService.monitorTraffic(this.type, this.airport).subscribe((r) => {
            // Remove deleted entries first
            let i = 0;
            while (r.removed.length >= 0 && i < this.flights.length) {
                if (r.removed.indexOf(this.flights[i].callsign) >= 0) {
                    console.log(this.flights[i].callsign + ' deleted.');
                    this.flights.splice(i, 1);
                } else {
                    i++;
                }
            }
            //neue liste durchgehen
            for (i = 0; i < r.rows.length; i++) {
                //ist eintrag an der korrekten position in der alten liste
                if (this.flights.length > i && r.rows[i].callsign === this.flights[i].callsign) {
                    if (r.updated.indexOf(i) >= 0) {
                        console.log(r.rows[i].callsign + ' updated.');
                        this.flights[i].update(r.rows[i]);
                        // update in place
                    } else {
                        continue;
                    }
                } else {
                    //get index from old list
                    let k = -1;
                    for (let j = i + 1; j < this.flights.length; j++) {
                        if (r.rows[i].callsign === this.flights[j].callsign) {
                            k = j;
                            break;
                        }
                    }
                    //If items is not in old list
                    if (k >= 0) {
                        //Remove from old position
                        console.log(r.rows[i].callsign + ' moved.');
                        this.flights.splice(k, 1);
                        this.flights.splice(i, 0, r.rows[i]);
                    } else {
                        // Insert at new position
                        console.log(r.rows[i].callsign + ' added.');
                        this.flights.splice(i, 0, new Flight(r.rows[i]));
                    }
                }
            }
            // ist eintrag an gleicher stelle? dann
            
            // sonst
            //  entferne aus alter liste
            //  insert in alte liste
            //sonst
            // insert in alte list
            // fertig
            // hat alte liste zu viele einträge lösche überhang

            // Adjust sort order if required
            // for (let i = 0; i < r.updated.length; i++) {
            //     this.flights.splice(r.updated[i], 0, r.rows[r.updated[i]]);
            // }
            //console.log(this.airport + ': ' + this.flights.length);
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
