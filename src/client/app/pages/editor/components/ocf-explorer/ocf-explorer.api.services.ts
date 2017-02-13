import { Http, RequestMethod } from '@angular/http';
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

    public getHeaders(methodOptions?: any): any {
        let headers = super.getHeaders();
        if (methodOptions !== undefined && methodOptions.method > 0) {
            headers['Content-Type'] =
                'application/x-www-form-urlencoded; charset=UTF-8';
        }
        return headers;
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
        path: '/res'
    })
    getResources: ResourceMethod<IQueryInput, any[]>;

    @ResourceAction({
        path: '{!path}?di={!di}'
    })
    getResource: ResourceMethod<IOcfResourceApi, any>;

    @ResourceAction({
        method: RequestMethod.Post,
        path: '{!path}?di={!di}'
    })
    updateResource: ResourceMethod<any, any>;

    constructor(public http: Http, public injector: Injector) {
        super(http, injector);
    }
}
