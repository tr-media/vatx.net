import { Component } from '@angular/core';

@Component({
    selector: 'about',
    styleUrls: ['./about.component.css'],
    templateUrl: './about.component.html'
})
export class AboutComponent {
    public contact = '@tr-';
    constructor() {
        this.contact = 'vatx' + this.contact;
        this.contact += 'media.org';
    }
}
