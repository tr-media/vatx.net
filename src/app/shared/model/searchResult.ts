import { Airline } from './airline';
import { Airport } from './airport';

export class SearchResult {
    public id: string;
    public text: string;
    public type: string;
    public airport: Airport;
    public airline: Airline;

    constructor(row: any, type: string) {
        this.id = row.id;
        this.type = type;
        if (type === 'aln') {
            this.text = row.name + ', ' + row.country;
            this.airline = new Airline(row);
        } else {
            this.text = row.name + ', ' + row.city + ', ' + row.country;
            this.airport = new Airport(row);
        }
    }
}
