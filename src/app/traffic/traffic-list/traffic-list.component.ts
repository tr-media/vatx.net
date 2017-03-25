import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { AppService } from '../../shared/app.service';
import { LibraryService } from '../../shared/library.service';
import { TrafficService } from '../traffic.service';

import { Airport } from '../../shared/model/airport';
import { Flight } from '../../shared/model/flight';

@Component({
    selector: '[traffic-list]',
    templateUrl: './traffic-list.component.html',
    styleUrls: ['./traffic-list.component.css'],
    changeDetection: ChangeDetectionStrategy.Default,
    encapsulation: ViewEncapsulation.None
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
        this.trafficService.monitorTraffic(this.type, this.airport).subscribe((f) => {
            this.flights = f;
            this.flightsUpdated.emit({
                airport: this.airport,
                count: this.flights.length
            });
        });
    }
}
