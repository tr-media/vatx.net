import { Component, Input, OnChanges } from '@angular/core';
import * as moment from 'moment';

import { AppService } from '../app.service';
import { LibraryService } from '../library.service';
import {
    Airline,
    Airport,
    Flight
} from '../model';

@Component({
    selector: 'popup',
    templateUrl: './popup.component.html',
    styleUrls: ['./popup.component.css']
})
export class PopupComponent implements OnChanges {

    @Input() private flight: Flight;
    private callsignInWords: string = 'AIR BERLIN ONE ZERO SEVEN';
    private departureAirport: Airport;
    private destinationAirport: Airport;
    private airline: Airline;

    constructor(
        private appService: AppService,
        private libraryService: LibraryService
    ) { }

    public ngOnChanges() {
        if (this.flight) {
            if (this.flight.planned_depairport) {
                this.libraryService.getAirport(this.flight.planned_depairport).subscribe((dep) => {
                    this.departureAirport = dep;
                });
            } else {
                this.departureAirport = undefined;
            }
            if (this.flight.planned_destairport) {
                this.libraryService.getAirport(this.flight.planned_destairport).subscribe((dest) => {
                    this.destinationAirport = dest;
                });
            } else {
                this.destinationAirport = undefined;
            }
            // callsign in words
            if (this.libraryService.hasAirline(this.flight.callsign)) {
                this.libraryService.getAirline(this.flight.callsign.substr(0, 3)).subscribe((aln) => {
                    this.airline = aln;
                    if (aln) {
                        this.callsignInWords = aln.callsign + this.libraryService.toIcao(this.flight.callsign.substr(3));
                    } else {
                        this.callsignInWords = this.libraryService.toIcao(this.flight.callsign);
                    }
                });
            } else {
                this.callsignInWords = this.libraryService.toIcao(this.flight.callsign);
            }
        }
    }
}
