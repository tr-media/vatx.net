import { Component, ViewEncapsulation } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
    selector: 'test',
    templateUrl: './test.component.html',
    styleUrls: ['./test.component.css'],
    encapsulation: ViewEncapsulation.Native,
    animations: [
        trigger('flyInOut', [
            state('in', style({ height: '18px', opacity: 1 })),
            transition(':enter', [
                style({ opacity: 0, height: 0 }),
                animate(300)
            ]),
            transition(':leave', [
                animate(500, style({ opacity: 0, height: 0 }))
            ])
        ])
    ]
})
export class TestComponent {
    public entries: any[] = [];

    constructor(
    ) { }

    public add() {
        this.entries.splice(0, 0, { title: "Bla", show: true });
    }

    public remove() {
        if (this.entries.length) {
            this.entries.splice(Math.round(Math.random() * this.entries.length), 1);
        }
    }

    public animationDone(ev) {

    }
}
