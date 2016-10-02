import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import * as moment from 'moment';

import {
    Airline,
    Airport,
    Flight,
    SearchResult,
    ServerStats
} from './model';

@Injectable()
export class NetworkService {

    constructor(
        private http: Http
    ) { }

    public updateServerStats(): Observable<ServerStats> {
        return Observable.interval(5000).flatMap(() => this.http.get('https://vatx.herokuapp.com/stats')).map(res => new ServerStats(res.json()));
    }

    public updateClientData(): Observable<Flight[]> {
        return this.http.get('https://vatx.herokuapp.com/pilots').map(res => {
            return res.json().map(json => new Flight(json));
        });
    }

    public getAirports(): Observable<any[]> {
        return this.http.get('https://vatx.herokuapp.com/airports?mode=list').map(res => {
            return res.json();
        });
    }

    public getAirlines(): Observable<any[]> {
        return this.http.get('https://vatx.herokuapp.com/airlines?mode=list').map(res => {
            return res.json();
        });
    }

    public getMeta(): Observable<any[]> {
        return this.http.get('https://vatx.herokuapp.com/about').map(res => {
            return res.json();
        });
    }
}
