import { Http } from '@angular/http';
import { Injectable, Injector } from '@angular/core';


import {
    Resource,
    ResourceAction,
    ResourceMethod,
    ResourceParams
} from 'ng2-resource-rest';

export class RestClient extends Resource {
    private baseUrl = '';

    public setBaseUrl(url: string): void {
        this.baseUrl = url;
    }

    public getUrl(methodOptions?: any): string | Promise<string> {
        let resPath = super.getUrl();
        return this.baseUrl + resPath;
    }
}


// Interfaces

export interface IQueryInput {
  page?: number;
  perPage?: number;
};


export interface IOcfResourceApi {
    di: string;
    path: string;
    rt?: string;
};


// Services

@Injectable()
@ResourceParams({
  url: ''
})
export class OcfApiService extends RestClient {
    @ResourceAction({
        isArray: true,
        path: '/'
    })
    getResources: ResourceMethod<IQueryInput, any[]>;

    @ResourceAction({
        path: '{!path}?di={!di}'
    })
    getResource: ResourceMethod<IOcfResourceApi, any>;

    constructor(public http: Http, public injector: Injector) {
        super(http, injector);
    }
}
