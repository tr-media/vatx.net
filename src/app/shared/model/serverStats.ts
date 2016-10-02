import * as lf from 'lf';
import * as moment from 'moment';

export class ServerStats {
    public onlinePilots: number = 0;
    public onlineAtcs: number = 0;
    public onlineAtis: number = 0;
    public onlineClients: number = 0;
    public lastStreamUpdate: Date = moment('2001-01-01T00:00:00+00:00').utc().toDate();
    public serverTime: Date = moment().utc().toDate();
    public streamAge: number = 0;
    public hasData: boolean = false;

    constructor(stats: any) {
        if (stats) {
            this.onlinePilots = stats.onlinePilots;
            this.onlineAtcs = stats.onlineAtcs;
            this.onlineAtis = stats.onlineAtis;
            this.onlineClients = stats.onlineClients;
            this.lastStreamUpdate = moment(stats.lastStreamUpdate).toDate();
            this.serverTime = moment(stats.serverTime).toDate();
            this.streamAge = stats.streamAge;
            this.hasData = true;
        }
    }

    public static createTable(schemaBuilder: lf.schema.Builder) {
        schemaBuilder.createTable('stats').
            addColumn('onlinePilots', lf.Type.NUMBER).
            addColumn('onlineAtcs', lf.Type.NUMBER).
            addColumn('onlineAtis', lf.Type.NUMBER).
            addColumn('onlineClients', lf.Type.NUMBER).
            addColumn('lastStreamUpdate', lf.Type.DATE_TIME).
            addColumn('serverTime', lf.Type.DATE_TIME).
            addColumn('streamAge', lf.Type.NUMBER).
            addPrimaryKey(['id']);
    }

    public dataIsOld() {
        return this.streamAge > 300;
    }

    public getLastStreamUpdate(format: string) {
        return moment(this.lastStreamUpdate).utc().format(format);
    }

    public isAfter(stats: ServerStats) {
        return this.lastStreamUpdate > stats.lastStreamUpdate;
    }
}
