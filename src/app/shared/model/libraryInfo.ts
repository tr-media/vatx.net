/* tslint:disable: variable-name */

export class LibraryInfo {
    public id: number = 0;
    public serverVersion: string = '';
    public airport_rev: number = 0;
    public airline_rev: number = 0;

    constructor(data: any) {
        if (data) {
            this.serverVersion = data.version;
            if (data.meta) {
                this.airport_rev = data.meta.airport_rev;
                this.airline_rev = data.meta.airline_rev;
            } else {
                this.airport_rev = data.airport_rev;
                this.airline_rev = data.airline_rev;
            }
        }
    }

    public static createTable(schemaBuilder: lf.schema.Builder): lf.schema.TableBuilder {
        return schemaBuilder.createTable('library_info').
            addColumn('id', lf.Type.NUMBER).
            addColumn('serverVersion', lf.Type.STRING).
            addColumn('airport_rev', lf.Type.NUMBER).
            addColumn('airline_rev', lf.Type.NUMBER).
            addPrimaryKey(['id']);
    }
}
