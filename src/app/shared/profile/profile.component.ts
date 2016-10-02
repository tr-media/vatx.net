import { Component } from '@angular/core';
import { Router }    from '@angular/router';

import { AppService } from '../app.service';

@Component({
    selector: 'profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.css']
})
export class ProfileComponent {

    constructor(
        private app: AppService,
        private router: Router
    ) { }

    public dismissTipps() {
        this.app.hideProfileTipps = true;
    }

    public editProfiles() {
        this.router.navigate(['settings']);
        this.app.toggleNone();
    }

    public selectProfile(i: number) {
        this.app.activeProfile = i;
        this.router.navigate(['traffic']);
        this.app.toggleNone();
    }
}
