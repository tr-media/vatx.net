import { Observable } from 'rxjs/Observable';

export class LovefieldHelper {

    public static insertChunks(database: lf.Database, table, rows: any[], chunkSize: number = 10): Observable<number> {
        return new Observable<number>(subscriber => {
            let history = [];
            subscriber.next(0);
            if (rows.length > 0 && chunkSize > 0) {
                let chunks = [];
                for (let i = 0; i < rows.length; i += chunkSize) {
                    chunks.push(rows.slice(i, i + chunkSize));
                }
                let totalChunks = chunks.length;
                let chunk = chunks.shift().map(c => {
                    return table.createRow(c);
                });
                let result = database.insertOrReplace().into(table).values(chunk).exec();
                while (chunks.length > 0) {
                    let currentChunk = totalChunks - chunks.length;
                    let chunk = chunks.shift().map(c => {
                        return table.createRow(c);
                    });
                    result = result.then(() => {
                        subscriber.next(currentChunk / totalChunks);
                        return database.insertOrReplace().into(table).values(chunk).exec();
                    });
                }
                result.then(() => {
                    subscriber.next(1);
                    subscriber.complete();
                }).catch(err => {
                    subscriber.error('Lovefield error: ' + err);
                    subscriber.complete();
                });
            } else {
                subscriber.error('Invalid number of rows');
                subscriber.complete();
            }
        });
    }

    public static getAll(database: lf.Database, tableName: string): Observable<any[]> {
        return new Observable<any[]>(subscriber => {
            let table: any = database.getSchema().table(tableName);
            database.select().from(table).exec().then(results => {
                subscriber.next(results);
            }).catch(err => {
                subscriber.error(err);
            }).then(() => {
                subscriber.complete();
            });
        });

    }

    public static insertOrReplace(database: lf.Database, tableName: string, data: any): Observable<void> {
        return new Observable<void>(subscriber => {
            let table: any = database.getSchema().table(tableName);
            let row = table.createRow(data);
            database.insertOrReplace().into(table).values([row]).exec().then(results => {
                subscriber.next(results);
            }).catch(err => {
                subscriber.error(err);
            }).then(() => {
                subscriber.complete();
            });
        });

    }

    public static getSetting(db: lf.Database, key: string): any {
        let settings: any = db.getSchema().table('settings');
        return db.select().from(settings).where(settings.key.eq(key)).exec().then((rows: any[]) => {
            if (rows.length) {
                return rows[0].value;
            }
            return undefined;
        });
    }

    public static setSetting(db: lf.Database, key: string, value: any) {
        let settings: any = db.getSchema().table('settings');
        let row = settings.createRow({
            key: key,
            value: value
        });
        db.insertOrReplace().into(settings).values([row]).exec().then(x => {
            console.log('saved');
        });
    }
}
