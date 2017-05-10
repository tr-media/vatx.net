import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import * as moment from 'moment';
import * as uuid from 'uuid/v4';

import {
    Airline,
    Airport,
    Flight,
    SearchResult,
    ServerStats
} from './model';

@Injectable()
export class NetworkService {

    private cid: string;
    private headers: Headers;

    constructor(
        private http: Http
    ) {
        // Create client ID and store in local storage.
        if (typeof (Storage) !== 'undefined') {
            this.cid = localStorage.getItem('vatx-cid');
            if (!this.cid) {
                this.cid = uuid();
                localStorage.setItem('vatx-cid', this.cid);
            }
        } else {
            this.cid = uuid();
        }
        // Create default headers
        this.headers = new Headers();
        this.headers.append('x-vatx-client-cid', this.cid);
    }

    public updateServerStats(): Observable<ServerStats> {
        return Observable.interval(5000).flatMap(() => this.http.get('https://vatx.herokuapp.com/stats', { headers: this.headers })).map(res => new ServerStats(res.json()));
    }

    public updateClientData(): Observable<Flight[]> {
        return this.http.get('https://vatx.herokuapp.com/pilots', { headers: this.headers }).map(res => {
            return res.json().map(json => new Flight(json));
        });
    }

    public getAirports(): Observable<any[]> {
        return this.http.get('https://vatx.herokuapp.com/airports?mode=list', { headers: this.headers }).map(res => {
            return res.json();
        });
    }

    public getAirlines(): Observable<any[]> {
        return this.http.get('https://vatx.herokuapp.com/airlines?mode=list', { headers: this.headers }).map(res => {
            return res.json();
        });
    }

    public getMeta(): Observable<any[]> {
        return this.http.get('https://vatx.herokuapp.com/about', { headers: this.headers }).map(res => {
            return res.json();
        });
    }
}
