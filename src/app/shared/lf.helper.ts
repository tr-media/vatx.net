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

    public static insert(db: lf.Database, table: any, flight: any): Promise<Object[]> {
        let row = table.createRow(flight);
        return db.insert().into(table).values([row]).exec();
    }

    public static update(db: lf.Database, table: any, flight: any): Promise<Object[]> {
        let tmp: any = db.update(table);
        for (let key in flight) {
            if (flight.hasOwnProperty(key)) {
                tmp = tmp.set(table[key], flight[key]);
            }
        }
        return tmp.where(table.callsign.eq(flight.callsign)).exec().catch(err => {
            console.error('Lovefield error: ' + err);
        });
    }

    public static insertOrUpdate(db: lf.Database, table: any, flight: any): Promise<Object[]> {
        return this.insert(db, table, flight).catch(e => {
            if (e.code === 201) {
                console.log('insert failed. trying update.');
                return this.update(db, table, flight);
            } else {
                throw e;
            }
        });
    }

    public static updateOrInsert(db: lf.Database, table: any, flight: any): Promise<Object[]> {
        return this.update(db, table, flight).catch(e => {
            if (e.code === 201) {
                console.log('update failed. trying insert.');
                return this.insert(db, table, flight);
            } else {
                console.log(e.code);
                throw e;
            }
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

    public static deleteBulk(db: lf.Database, table: any, keys: string[]) {
        console.log('Deleting ' + keys.length + ' flights.');
        return db.delete().from(table).where(table.callsign.in(keys)).exec().catch(err => {
            console.error('Lovefield error: ' + err);
        });
    }

    public static updateBulk(db: lf.Database, table: any, rows: any[]) {
        console.log('Updating ' + rows.length + ' flights.');
        let result = this.update(db, table, rows[0]);
        for (let i = 1; i < rows.length; i++) {
            result = result.then(() => {
                return this.update(db, table, rows[i]);
            });
        }
        return result;
    }

    public static insertBulk(db: lf.Database, table: any, rows: any[], chunkSize: number = 10) {
        console.log('Inserting ' + rows.length + ' flights.');
        if (chunkSize > 0) {
            let chunks = [];
            for (let i = 0; i < rows.length; i += chunkSize) {
                chunks.push(rows.slice(i, i + chunkSize));
            }
            let totalChunks = chunks.length;
            let chunk = chunks.shift().map(c => {
                return table.createRow(c);
            });
            let result = db.insertOrReplace().into(table).values(chunk).exec();
            while (chunks.length > 0) {
                // Intended shadowing of chunk. Each iteration needs its own variable within its own scope.
                // tslint:disable-next-line no-shadowed-variable
                let chunk = chunks.shift().map(c => {
                    return table.createRow(c);
                });
                result = result.then(() => {
                    return db.insertOrReplace().into(table).values(chunk).exec();
                });
            }
            return result.catch(err => {
                console.error('Lovefield error: ' + err);
            });
        } else {
            throw 'Chunk size cannot be zero.';
        }
    }
}
