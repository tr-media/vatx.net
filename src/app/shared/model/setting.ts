export class Setting {
    public key: string = '';
    public value: any = {};

    constructor(data: any) {
        for (let key in this) {
            if (this.hasOwnProperty(key) && data.hasOwnProperty(key)) {
                this[key] = data[key];
            }
        }
    }

    public static createTable(schemaBuilder: lf.schema.Builder): lf.schema.TableBuilder {
        return schemaBuilder.createTable('settings').
            addColumn('key', lf.Type.STRING).
            addColumn('value', lf.Type.OBJECT).
            addPrimaryKey(['key']);
    }
}
