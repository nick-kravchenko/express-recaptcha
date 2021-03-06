/// <reference path="typings/express-recaptcha.d.ts" />
import { Request } from 'express';
import { RecaptchaMiddleware, RecaptchaOptionsV3, RecaptchaResponseDataV3 } from './interfaces';
export declare class RecaptchaV3 {
    private _api;
    private _site_key;
    private _secret_key;
    private _options;
    constructor(site_key: string, secret_key: string, options?: RecaptchaOptionsV3);
    readonly middleware: RecaptchaMiddleware;
    render(): string;
    renderWith(optionsToOverride: RecaptchaOptionsV3): string;
    verify(req: Request, cb: (error?: string | null, data?: RecaptchaResponseDataV3 | null) => void): void;
}
