import { Component, Input, OnChanges } from '@angular/core';

@Component({
    selector: 'progress-bar',
    templateUrl: './progress-bar.component.html',
    styleUrls: ['./progress-bar.component.css']
})
export class ProgressBarComponent implements OnChanges {
    @Input() private progress: number = 0.2;
    @Input() private label: string = 'Dummy';

    private progressString = '0%';

    public ngOnChanges() {
        this.progressString = Math.round(100 * this.progress) + '%';
    }

}
