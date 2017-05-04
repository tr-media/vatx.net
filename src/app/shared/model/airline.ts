import * as lf from 'lovefield';

export class Airline {
    public id: string = '';
    public name: string = '';
    public callsign: string = '';
    public country: string = '';

    constructor(data: any) {
        for (let key in this) {
            if (this.hasOwnProperty(key) && data.hasOwnProperty(key)) {
                this[key] = data[key];
            }
        }
    }

    public static createTable(schemaBuilder: lf.schema.Builder): lf.schema.TableBuilder {
        return schemaBuilder.createTable('airlines').
            addColumn('id', lf.Type.STRING).
            addColumn('name', lf.Type.STRING).
            addColumn('callsign', lf.Type.STRING).
            addColumn('country', lf.Type.STRING).
            addPrimaryKey(['id']).
            addIndex('idxName', ['name'], false, lf.Order.ASC).
            addIndex('idxCallsign', ['callsign'], false, lf.Order.ASC);
    }
}
