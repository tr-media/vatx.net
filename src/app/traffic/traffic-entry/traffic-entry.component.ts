import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { AppService } from '../../shared/app.service';
import { LibraryService } from '../../shared/library.service';
import { TrafficService } from '../traffic.service';

import { Flight } from '../../shared/model/flight';

@Component({
    selector: '[traffic-entry]',
    templateUrl: './traffic-entry.component.html',
    styleUrls: ['./traffic-entry.component.css'],
    changeDetection: ChangeDetectionStrategy.Default
})
export class TrafficEntryComponent implements OnInit {
    @Input() public type: string;
    @Input() public flight: Flight;

    private callsignAndType: string = '';
    private airport: string = '';
    private airportName: string = '';
    private airportCountry: string = '';
    private airportCity: string = '';

    constructor(
        private trafficService: TrafficService,
        private library: LibraryService,
        private app: AppService
    ) { }

    public ngOnInit() {
        if (this.type === 'ARRIVALS') {
            this.airport = this.flight.planned_depairport;
        } else {
            this.airport = this.flight.planned_destairport;
        }

        let aircraft = '';
        try {
            let exp = /^(?:.\/)?([A-Z0-9a-z]{2,})(?:\/.)?$/;
            aircraft = exp.exec(this.flight.planned_aircraft)[1];
        } catch (e) {
            console.log(e);
            console.log(this.flight);
            aircraft = '';
        }

        this.library.getAirport(this.airport).subscribe(airport => {
            if (airport) {
                this.airportName = airport.name;
                this.airportCity = airport.city;
                this.airportCountry = airport.country;
            }
        });
        if (this.library.hasAirline(this.flight.callsign)) {
            this.library.getAirline(this.flight.callsign.substr(0, 3)).subscribe(airline => {
                if (airline) {
                    this.callsignAndType = airline.callsign + ' | ' + aircraft;
                } else {
                    this.callsignAndType = aircraft;
                }
            }, err => {
                this.callsignAndType = aircraft;
            });
        } else {
            this.callsignAndType = aircraft;
        }
    }
}
