
export class Profile {
    public title: string = '';
    public arrivals: string[] = [];
    public departures: string[] = [];

    constructor(data: any) {
        for (let key in this) {
            if (this.hasOwnProperty(key) && data.hasOwnProperty(key)) {
                this[key] = data[key];
            }
        }
    }
}
