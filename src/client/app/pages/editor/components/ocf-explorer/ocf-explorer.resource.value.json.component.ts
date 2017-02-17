// Core
import { AfterViewInit, Component, ElementRef, Input, OnInit,
         ViewChild } from '@angular/core';

// Own
import { OcfApiService } from './ocf-explorer.api.services';
import { OcfResource } from './ocf-explorer.resource.component';


declare var $: any;


@Component({
    moduleId: module.id,
    selector: 'sd-ocf-resource-json',
    templateUrl: 'ocf-explorer.resource.value.json.component.html',
    styleUrls: ['ocf-explorer.resource.value.json.component.css']
})
export class OcfResourceValueJsonComponent implements AfterViewInit, OnInit {
    @Input('resource') resource: OcfResource;
    @ViewChild('jsonEditor') jsonEditor: ElementRef;
    @ViewChild('textArea') textArea: ElementRef;

    public json: string;
    public updating: boolean = false;

    public constructor(private ocfApiService: OcfApiService) {
    }

    public ngOnInit() {
        this.json = JSON.stringify(this.resource.properties, null, 4);
        this.updating = false;
    }

    public ngAfterViewInit() {
        $(this.jsonEditor.nativeElement).on('shown.bs.modal', () => {
            // Update json string
            this.json = JSON.stringify(this.resource.properties, null, 4);

            // Auto resize the textarea
            this.textArea.nativeElement.style.height = '1px';
            this.textArea.nativeElement.style.height =
                (this.textArea.nativeElement.scrollHeight + 10) + 'px';
        });
    }

    public isValidJson(): boolean {
        try {
            JSON.parse(this.json);
        } catch (e) {
            return false;
        }
        return true;
    }

    public mayUpdate(): boolean {
        return this.isValidJson() && !this.updating;
    }

    public onUpdateClicked(): boolean {
        let jsonObject = JSON.parse(this.json);
        let update = Object.assign({
            path: this.resource.path,
            di: this.resource.di
        }, jsonObject);


        this.updating = true;
        this.resource.properties = jsonObject;
        this.ocfApiService.updateResource(update)
        .$observable.subscribe(() => {
            this.updating = false;
            this.hide();
        });
        return false;
    }

    public onTextareaKeyUp(): boolean {
        let el = this.textArea.nativeElement;

        if (el.clientHeight < el.scrollHeight) {
            el.style.height = el.scrollHeight + 'px';
            if (el.clientHeight < el.scrollHeight) {
                el.style.height = (el.scrollHeight * 2 - el.clientHeight) + 'px';
            }
        }

        return false;
    }

    public hide() {
        $(this.jsonEditor.nativeElement).modal('hide');
    }
}
