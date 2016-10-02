import { Component } from '@angular/core';
import { Router }    from '@angular/router';

import { AppService } from '../app.service';

@Component({
    selector: 'menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.css']
})
export class MenuComponent {
    private appService: AppService;
    private router: Router;

    constructor(appService: AppService, router: Router) {
        this.appService = appService;
        this.router = router;
    }

    public goto(page: string) {
        this.router.navigate([page]);
        this.appService.toggleNone();
    }
}
