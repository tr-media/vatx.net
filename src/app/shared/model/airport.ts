import * as lf from 'lovefield';

export class Airport {
    public id: string = '';
    public name: string = '';
    public city: string = '';
    public country: string = '';
    public lat: number = 0;
    public lon: number = 0;

    constructor(data: any) {
        for (let key in this) {
            if (this.hasOwnProperty(key) && data.hasOwnProperty(key)) {
                this[key] = data[key];
            }
        }
    }

    public static createTable(schemaBuilder: lf.schema.Builder): lf.schema.TableBuilder {
        return schemaBuilder.createTable('airports').
            addColumn('id', lf.Type.STRING).
            addColumn('name', lf.Type.STRING).
            addColumn('city', lf.Type.STRING).
            addColumn('country', lf.Type.STRING).
            addColumn('lat', lf.Type.NUMBER).
            addColumn('lon', lf.Type.NUMBER).
            addPrimaryKey(['id']).
            addIndex('idxName', ['name'], false, lf.Order.ASC).
            addIndex('idxCity', ['city'], false, lf.Order.ASC);
    }
}
