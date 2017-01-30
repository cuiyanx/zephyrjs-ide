import { Injectable } from '@angular/core';

import {
    Resource,
    ResourceAction,
    ResourceMethod,
    ResourceParams
} from 'ng2-resource-rest';


export class RestClient extends Resource {
    private token: string = null;

    public setToken(token: string) {
        this.token = token;
    }

    public getUrl(methodOptions?: any): string | Promise<string> {
        let resPath = super.getUrl();
        return 'https://api.github.com' + resPath;
    }

    public getHeaders(methodOptions?: any): any {
        let headers = super.getHeaders();
        headers.Authorization = 'token ' + this.token;
        return headers;
    }
}


// Interfaces

export interface IQueryInput {
  page?: number;
  perPage?: number;
};


// Services

@Injectable()
@ResourceParams({
  url: '/user'
})
export class UserService extends RestClient {
  @ResourceAction({
    path: '/'
  })
  getUser: ResourceMethod<IQueryInput, any>;

  @ResourceAction({
    isArray: true,
    path: '/repos'
  })
  getRepos: ResourceMethod<IQueryInput, any[]>;
}


@Injectable()
@ResourceParams({
  url: '/repos'
})
export class RepoService extends RestClient {
  @ResourceAction({
    isArray: true,
    path: '/{!owner}/{!repo}/branches'
  })
  getBranches: ResourceMethod<{owner: string, repo: string}, any[]>;

  @ResourceAction({
    path: '/{!owner}/{!repo}/git/trees/{!sha}'
  })
  getTree: ResourceMethod<{owner: string, repo: string, sha: string}, any>;

  @ResourceAction({
    path: '/{!owner}/{!repo}/git/blobs/{!sha}'
  })
  getBlob: ResourceMethod<{owner: string, repo: string, sha: string}, any>;
}
