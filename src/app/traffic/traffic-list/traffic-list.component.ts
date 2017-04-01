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
            state('in', style({ height: '18px', opacity: 1 })),
            transition(':enter', [
                style({ opacity: 0, height: 0 }),
                animate(300)
            ]),
            transition(':leave', [
                animate(500, style({ opacity: 0, height: 0 }))
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
        this.trafficService.monitorTraffic(this.type, this.airport).subscribe((f) => {
            this.flights = f;
            this.flightsUpdated.emit({
                airport: this.airport,
                count: this.flights.length
            });
        });
    }
}
