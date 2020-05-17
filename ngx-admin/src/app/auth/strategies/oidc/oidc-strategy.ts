/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable, of as observableOf } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { NB_WINDOW } from '@nebular/theme';

import { NbAuthStrategy } from '../auth-strategy';
import { NbAuthIllegalTokenError, NbAuthRefreshableToken, NbAuthToken } from '../../services/token/token';
import { NbAuthResult } from '../../services/auth-result';
import {
  NbOAuth2ResponseType,
  oidcStrategyOptions,
  NbOidcGrantType, NbOidcClientAuthMethod, NbOidcAuthStrategyOptions,
} from './oidc-strategy.options';
import { NbAuthStrategyClass } from '../../auth.options';

import { User, UserManager, UserManagerSettings } from 'oidc-client';
/**
 * OAuth2 authentication strategy.
 *
 * Strategy settings:
 *
 * ```ts
 * export enum NbOAuth2ResponseType {
 *   CODE = 'code',
 *   TOKEN = 'token',
 * }
 *
 * export enum NbOAuth2GrantType {
 *   AUTHORIZATION_CODE = 'authorization_code',
 *   PASSWORD = 'password',
 *   REFRESH_TOKEN = 'refresh_token',
 * }
 *
 * export class NbOAuth2AuthStrategyOptions {
 *   name: string;
 *   baseEndpoint?: string = '';
 *   clientId: string = '';
 *   clientSecret: string = '';
 *   clientAuthMethod: string = NbOAuth2ClientAuthMethod.NONE;
 *   redirect?: { success?: string; failure?: string } = {
 *     success: '/',
 *     failure: null,
 *   };
 *   defaultErrors?: any[] = ['Something went wrong, please try again.'];
 *   defaultMessages?: any[] = ['You have been successfully authenticated.'];
 *   authorize?: {
 *     endpoint?: string;
 *     redirectUri?: string;
 *     responseType?: string;
 *     requireValidToken: true,
 *     scope?: string;
 *     state?: string;
 *     params?: { [key: string]: string };
 *   } = {
 *     endpoint: 'authorize',
 *     responseType: NbOAuth2ResponseType.CODE,
 *   };
 *   token?: {
 *     endpoint?: string;
 *     grantType?: string;
 *     requireValidToken: true,
 *     redirectUri?: string;
 *     scope?: string;
 *     class: NbAuthTokenClass,
 *   } = {
 *     endpoint: 'token',
 *     grantType: NbOAuth2GrantType.AUTHORIZATION_CODE,
 *     class: NbAuthOAuth2Token,
 *   };
 *   refresh?: {
 *     endpoint?: string;
 *     grantType?: string;
 *     scope?: string;
 *     requireValidToken: true,
 *   } = {
 *     endpoint: 'token',
 *     grantType: NbOAuth2GrantType.REFRESH_TOKEN,
 *   };
 * }
 * ```
 *
 */
@Injectable()
export class NbOidcAuthStrategy extends NbAuthStrategy {

  static setup(options: NbOidcAuthStrategyOptions): [NbAuthStrategyClass, NbOidcAuthStrategyOptions] {
    return [NbOidcAuthStrategy, options];
  }
  private user: User = null;
  private manager = new UserManager(getClientSettings());
  get responseType() {
    return this.getOption('authorize.responseType');
  }

  get clientAuthMethod() {
    return this.getOption('clientAuthMethod');
  }

  protected redirectResultHandlers: { [key: string]: Function } = {
    [NbOAuth2ResponseType.CODE]: () => {
      this.completeAuthentication()
      
      // return observableOf(this.route.snapshot.queryParams).pipe(
      //   switchMap((params: any) => {
      //     if (params.code) {
      //       return this.requestToken(params.code)
      //     }

      //     return observableOf(
      //       new NbAuthResult(
      //         false,
      //         params,
      //         this.getOption('redirect.failure'),
      //         this.getOption('defaultErrors'),
      //         [],
      //       ));
      //   }),
      // );
    },
  };

  protected redirectResults: { [key: string]: Function } = {
    [NbOAuth2ResponseType.CODE]: () => {
      return observableOf(this.route.snapshot.queryParams).pipe(
        map((params: any) => !!(params && (params.code || params.error))),
      );
    }
  };

  protected defaultOptions: NbOidcAuthStrategyOptions = oidcStrategyOptions;

  constructor(protected http: HttpClient,
              protected route: ActivatedRoute,
              @Inject(NB_WINDOW) protected window: any) {
    super();
    this.manager.getUser().then((user) => {
      this.user = user;
    });
  }

  authenticate(data?: any): Observable<NbAuthResult> {
      return this.isRedirectResult()
        .pipe(
          switchMap((result: boolean) => {
            if (!result) {
            //  this.authorizeRedirect();
            this.startAuthentication();
              return observableOf(new NbAuthResult(true));
            }
            return this.getAuthorizationResult();
          }),
        );
  }
  getAuthorizationResult(): Observable<any> {
    const redirectResultHandler = this.redirectResultHandlers[this.responseType];
    if (redirectResultHandler) {
      return redirectResultHandler.call(this);
    }

    throw new Error(`'${this.responseType}' responseType is not supported,
                      only 'token' and 'code' are supported now`);
  }

  refreshToken(token: NbAuthRefreshableToken): Observable<NbAuthResult> {
    const module = 'refresh';
    const url = this.getActionEndpoint(module);
    const requireValidToken = this.getOption(`${module}.requireValidToken`);

    let headers = this.buildAuthHeader() || new HttpHeaders() ;
    headers = headers.append('Content-Type', 'application/x-www-form-urlencoded');

    return this.http.post(url, this.buildRefreshRequestData(token), { headers: headers })
      .pipe(
        map((res) => {
          return new NbAuthResult(
            true,
            res,
            this.getOption('redirect.success'),
            [],
            this.getOption('defaultMessages'),
            this.createRefreshedToken(res, token, requireValidToken));
        }),
        catchError((res) => this.handleResponseError(res)),
      );
  }


  protected authorizeRedirect() {
    this.window.location.href = this.buildRedirectUrl();
  }

  protected isRedirectResult(): Observable<boolean> {
    return this.redirectResults[this.responseType].call(this);
  }

  protected requestToken(code: string) {
    return new NbAuthResult(
      true,
      null,
      this.getOption('redirect.success'),
      [],
      this.getOption('defaultMessages'),
     // this.createToken(res, requireValidToken)
     null
      );
  }

  protected buildCodeRequestData(code: string): any {
    const params = {
      grant_type: this.getOption('token.grantType'),
      code: code,
      redirect_uri: this.getOption('token.redirectUri'),
      client_id: this.getOption('clientId'),
    };
    return this.urlEncodeParameters(this.cleanParams(this.addCredentialsToParams(params)));
  }

  protected buildRefreshRequestData(token: NbAuthRefreshableToken): any {
    const params = {
      grant_type: this.getOption('refresh.grantType'),
      refresh_token: token.getRefreshToken(),
      scope: this.getOption('refresh.scope'),
    };
    return this.urlEncodeParameters(this.cleanParams(this.addCredentialsToParams(params)));
  }

  protected buildPasswordRequestData(username: string, password: string ): string {
    const params = {
      grant_type: this.getOption('token.grantType'),
      username: username,
      password: password,
      scope: this.getOption('token.scope'),
    };
    return this.urlEncodeParameters(this.cleanParams(this.addCredentialsToParams(params)));
  }

  protected buildAuthHeader(): any {
    if (this.clientAuthMethod === NbOidcClientAuthMethod.BASIC) {
      if (this.getOption('clientId') && this.getOption('clientSecret')) {
        return new HttpHeaders(
            {
              'Authorization': 'Basic ' + btoa(
                this.getOption('clientId') + ':' + this.getOption('clientSecret')),
            },
          );
      } else {
        throw Error('For basic client authentication method, please provide both clientId & clientSecret.');
      }
    }
  }

  protected cleanParams(params: any): any {
    Object.entries(params)
      .forEach(([key, val]) => !val && delete params[key]);
    return params;
  }

  protected addCredentialsToParams(params: any): any {
    if (this.clientAuthMethod === NbOidcClientAuthMethod.REQUEST_BODY) {
      if (this.getOption('clientId') && this.getOption('clientSecret')) {
        return {
          ... params,
          client_id: this.getOption('clientId'),
          client_secret: this.getOption('clientSecret'),
        }
      } else {
        throw Error('For request body client authentication method, please provide both clientId & clientSecret.')
      }
    }
    return params;
  }


  protected handleResponseError(res: any): Observable<NbAuthResult> {
    let errors = [];
    if (res instanceof HttpErrorResponse) {
      if (res.error.error_description) {
        errors.push(res.error.error_description);
      } else {
        errors = this.getOption('defaultErrors');
      }
    }  else if (res instanceof NbAuthIllegalTokenError ) {
      errors.push(res.message)
    } else {
        errors.push('Something went wrong.')
    };

    return observableOf(
      new NbAuthResult(
        false,
        res,
        this.getOption('redirect.failure'),
        errors,
        [],
      ));
  }

  protected buildRedirectUrl() {
    const params = {
      response_type: this.getOption('authorize.responseType'),
      client_id: this.getOption('clientId'),
      redirect_uri: this.getOption('authorize.redirectUri'),
      scope: this.getOption('authorize.scope'),
      state: this.getOption('authorize.state'),

      ...this.getOption('authorize.params'),
    };

    const endpoint = this.getActionEndpoint('authorize');
    const query = this.urlEncodeParameters(this.cleanParams(params));

    return `${endpoint}?${query}`;
  }

  protected parseHashAsQueryParams(hash: string): { [key: string]: string } {
    return hash ? hash.split('&').reduce((acc: any, part: string) => {
      const item = part.split('=');
      acc[item[0]] = decodeURIComponent(item[1]);
      return acc;
    }, {}) : {};
  }

  protected urlEncodeParameters(params: any): string {
    return Object.keys(params).map((k) => {
      return `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`;
    }).join('&');
  }

  protected createRefreshedToken(res, existingToken: NbAuthRefreshableToken, requireValidToken: boolean): NbAuthToken {
    type AuthRefreshToken = NbAuthRefreshableToken & NbAuthToken;

    const refreshedToken: AuthRefreshToken = this.createToken<AuthRefreshToken>(res, requireValidToken);
    if (!refreshedToken.getRefreshToken() && existingToken.getRefreshToken()) {
      refreshedToken.setRefreshToken(existingToken.getRefreshToken());
    }
    return refreshedToken;
  }

  register(data?: any): Observable<NbAuthResult> {
    throw new Error('`register` is not supported by `NbOAuth2AuthStrategy`, use `authenticate`.');
  }

  requestPassword(data?: any): Observable<NbAuthResult> {
    throw new Error('`requestPassword` is not supported by `NbOAuth2AuthStrategy`, use `authenticate`.');
  }

  resetPassword(data: any = {}): Observable<NbAuthResult> {
    throw new Error('`resetPassword` is not supported by `NbOAuth2AuthStrategy`, use `authenticate`.');
  }

  logout(): Observable<NbAuthResult> {
    return observableOf(new NbAuthResult(true));
  }

  startAuthentication(): Promise<void> {
    return this.manager.signinRedirect();
  }

  completeAuthentication(): Promise<void> {
    return this.manager.signinRedirectCallback().then((user) => {
      this.user = user;
    });
  }
}


export function getClientSettings(): UserManagerSettings {
  return {
    authority: 'http://localhost:5000/',
    client_id: 'chmUi',
    redirect_uri: 'http://localhost:4200/pages/auth-callback',
    post_logout_redirect_uri: 'http://localhost:4200/',
    response_type: 'code',
    scope: 'openid profile chmApi',
    filterProtocolClaims: true,
    loadUserInfo: true,
    automaticSilentRenew: true
  };
}
