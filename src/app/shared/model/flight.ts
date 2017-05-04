/* tslint:disable: variable-name */

import * as lf from 'lovefield';
import * as moment from 'moment';

import { FlightStatus } from './flightStatus';

export class Flight {
    // Fields received from data stream
    public callsign: string = '';
    public cid: string = '';
    public realname: string = '';
    public clienttype: string = '';
    public latitude: number = 0;
    public longitude: number = 0;
    public altitude: string = '';
    public groundspeed: number = 0;
    public planned_aircraft: string = '';
    public planned_tascruise: number = 0;
    public planned_depairport: string = '';
    public planned_altitude: string = '';
    public planned_destairport: string = '';
    public server: string = '';
    public protrevision: number = 0;
    public rating: number = 0;
    public transponder: string = '';
    public planned_revision: string = '';
    public planned_flighttype: string = '';
    public planned_deptime: string = '';
    public planned_actdeptime: string = '';
    public planned_hrsenroute: string = '';
    public planned_minenroute: string = '';
    public planned_hrsfuel: string = '';
    public planned_minfuel: string = '';
    public planned_altairport: string = '';
    public planned_remarks: string = '';
    public planned_route: string = '';
    public planned_depairport_lat: number = 0;
    public planned_depairport_lon: number = 0;
    public planned_destairport_lat: number = 0;
    public planned_destairport_lon: number = 0;
    public atis_message: string = '';
    public time_last_atis_received: Date = new Date(0);
    public time_logon: Date = new Date(0);
    public heading: number = 0;
    public QNH_iHg: number = 0;
    public QNH_Mb: number = 0;
    // Calculated fields
    public no_voice: boolean = false;
    public distance_to_destination: number = 0;
    public distance_from_departure: number = 0;
    public status: number = FlightStatus.Unknown;
    public status_string: string = '';
    public estimated_time_of_arrival: Date = moment.utc([2100, 0, 1]).toDate();
    public last_update_from_stream: Date = moment.utc([2000, 0, 1]).toDate();
    public homebase: string = '';
    public sort_string: string = '';

    constructor(data?: any) {
        if (data) {
            let tmp = new Flight();
            for (let key in tmp) {
                if (this.hasOwnProperty(key) && data.hasOwnProperty(key)) {
                    if (this[key] instanceof Date) {
                        this[key] = moment(data[key]).toDate();
                    } else {
                        this[key] = data[key];
                    }
                }
            }
        }
    }

    public update(data: any) {
        if (data) {
            for (let key in data) {
                if (data.hasOwnProperty(key) && this.hasOwnProperty(key)) {
                    this[key] = data[key];
                }
            }
        }
    }

    public static createTable(schemaBuilder: lf.schema.Builder) {
        schemaBuilder.createTable('flights').
            addColumn('callsign', lf.Type.STRING).
            addColumn('cid', lf.Type.STRING).
            addColumn('realname', lf.Type.STRING).
            addColumn('clienttype', lf.Type.STRING).
            addColumn('latitude', lf.Type.NUMBER).
            addColumn('longitude', lf.Type.NUMBER).
            addColumn('altitude', lf.Type.STRING).
            addColumn('groundspeed', lf.Type.NUMBER).
            addColumn('planned_aircraft', lf.Type.STRING).
            addColumn('planned_tascruise', lf.Type.NUMBER).
            addColumn('planned_depairport', lf.Type.STRING).
            addColumn('planned_altitude', lf.Type.STRING).
            addColumn('planned_destairport', lf.Type.STRING).
            addColumn('server', lf.Type.STRING).
            addColumn('protrevision', lf.Type.NUMBER).
            addColumn('rating', lf.Type.NUMBER).
            addColumn('transponder', lf.Type.STRING).
            addColumn('planned_revision', lf.Type.STRING).
            addColumn('planned_flighttype', lf.Type.STRING).
            addColumn('planned_deptime', lf.Type.STRING).
            addColumn('planned_actdeptime', lf.Type.STRING).
            addColumn('planned_hrsenroute', lf.Type.STRING).
            addColumn('planned_minenroute', lf.Type.STRING).
            addColumn('planned_hrsfuel', lf.Type.STRING).
            addColumn('planned_minfuel', lf.Type.STRING).
            addColumn('planned_altairport', lf.Type.STRING).
            addColumn('planned_remarks', lf.Type.STRING).
            addColumn('planned_route', lf.Type.STRING).
            addColumn('planned_depairport_lat', lf.Type.NUMBER).
            addColumn('planned_depairport_lon', lf.Type.NUMBER).
            addColumn('planned_destairport_lat', lf.Type.NUMBER).
            addColumn('planned_destairport_lon', lf.Type.NUMBER).
            addColumn('atis_message', lf.Type.STRING).
            addColumn('time_last_atis_received', lf.Type.DATE_TIME).
            addColumn('time_logon', lf.Type.DATE_TIME).
            addColumn('heading', lf.Type.NUMBER).
            addColumn('QNH_iHg', lf.Type.NUMBER).
            addColumn('QNH_Mb', lf.Type.NUMBER).
            //
            addColumn('no_voice', lf.Type.BOOLEAN).
            addColumn('distance_to_destination', lf.Type.NUMBER).
            addColumn('distance_from_departure', lf.Type.NUMBER).
            addColumn('status', lf.Type.NUMBER).
            addColumn('status_string', lf.Type.STRING).
            addColumn('estimated_time_of_arrival', lf.Type.DATE_TIME).
            addColumn('last_update_from_stream', lf.Type.DATE_TIME).
            addColumn('homebase', lf.Type.STRING).
            addColumn('sort_string', lf.Type.STRING).
            addPrimaryKey(['callsign']).
            addIndex('idxArrivalAirports', ['planned_destairport', 'sort_string'], false).
            addIndex('idxDepartureAirports', ['planned_depairport', 'sort_string'], false);
    }
}
