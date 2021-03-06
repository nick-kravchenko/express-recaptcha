/// <reference path="typings/express-recaptcha.d.ts" />
import { Request } from 'express';
import { RecaptchaMiddleware, RecaptchaOptionsV2, RecaptchaResponseDataV2 } from './interfaces';
export declare class RecaptchaV2 {
    private _api;
    private _site_key;
    private _secret_key;
    private _options;
    constructor(site_key: string, secret_key: string, options?: RecaptchaOptionsV2);
    readonly middleware: RecaptchaMiddleware;
    render(): string;
    renderWith(optionsToOverride: RecaptchaOptionsV2): string;
    verify(req: Request, cb: (error?: string | null, data?: RecaptchaResponseDataV2 | null) => void): void;
}
