import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'traffic-table',
    templateUrl: './traffic-table.component.html',
    styleUrls: ['./traffic-table.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class TrafficTableComponent implements OnInit {
    @Input()
    private type: string;
    @Input()
    private airports: string[];
    private columns: string[] = [];
    private flightCountPerAirport: { [id: string]: number } = {};
    private flightCount: number = 0;

    public ngOnInit() {
        this.columns = [
            'FLIGHT',
            'PILOT',
            (this.type === 'ARRIVALS') ? 'FROM' : 'TO',
            'STATUS'
        ];
    }

    public flightsUpdated(event) {
        this.flightCountPerAirport[event.airport] = event.count;
        let tmp = 0;
        for (let key in this.flightCountPerAirport) {
            if (this.airports.indexOf(key) === -1) {
                delete this.airports[key];
            } else {
                tmp += this.flightCountPerAirport[key];
            }
        }
        this.flightCount = tmp;
    }
}
