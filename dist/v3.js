"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecaptchaV3 = void 0;
const https = __importStar(require("https"));
class RecaptchaV3 {
    constructor(site_key, secret_key, options) {
        this._api = {
            host: 'http://10.16.60.33/https_www.google.com',
            script: '/recaptcha/api.js',
            verify: '/recaptcha/api/siteverify'
        };
        this._site_key = site_key;
        this._secret_key = secret_key;
        this._options = options || { checkremoteip: false };
        if (!this._site_key)
            throw new Error('site_key is required');
        if (!this._secret_key)
            throw new Error('secret_key is required');
    }
    get middleware() {
        return {
            render: (req, res, next) => {
                res.recaptcha = this.render();
                next();
            },
            renderWith: (optionsToOverride) => {
                let self = this;
                return function (_req, _res, _next) {
                    _res.recaptcha = self.renderWith(optionsToOverride);
                    _next();
                };
            },
            verify: (req, res, next) => {
                this.verify(req, (error, data) => {
                    req.recaptcha = { error, data };
                    next();
                });
            }
        };
    }
    render() {
        return this.renderWith({});
    }
    renderWith(optionsToOverride) {
        let query_string = '&render=' + this._site_key;
        let options = Object.assign({ action: 'homepage', callback: '' }, this._options, optionsToOverride);
        if (!options.action)
            throw new Error('action is required');
        if (!options.callback)
            throw new Error('callback is required');
        if (options.onload)
            query_string += '&onload=' + options.onload;
        if (options.hl)
            query_string += '&hl=' + options.hl;
        query_string = query_string.replace(/^&/, '?');
        return '<script src="//' + this._api.host + this._api.script + query_string + '"></script>' +
            '<script>grecaptcha.ready(function(){grecaptcha.execute(\'' + this._site_key + '\', {action: \'' + options.action + '\'}).then(' + options.callback + ');});</script>';
    }
    verify(req, cb) {
        let response = null;
        let post_options = null;
        if (!req)
            throw new Error('req is required');
        if (req.body && req.body['g-recaptcha-response'])
            response = req.body['g-recaptcha-response'];
        if (req.query && req.query['g-recaptcha-response'])
            response = req.query['g-recaptcha-response'];
        if (req.params && req.params['g-recaptcha-response'])
            response = req.params['g-recaptcha-response'];
        let query_string = 'secret=' + this._secret_key + '&response=' + response;
        if (this._options.checkremoteip) {
            let remote_ip = req.headers && req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'] : req.connection.remoteAddress;
            if (remote_ip)
                query_string += '&remoteip=' + remote_ip;
        }
        post_options = {
            host: this._api.host,
            port: '443',
            path: this._api.verify,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(query_string)
            }
        };
        let request = https.request(post_options, (res) => {
            let body = '';
            res.setEncoding('utf8');
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                let result;
                try {
                    result = JSON.parse(body);
                }
                catch (_a) {
                    return cb('invalid-json-response', null);
                }
                const error = result['error-codes'] && result['error-codes'].length > 0 ? result['error-codes'][0] : 'invalid-input-response';
                if (result.success) {
                    cb(null, { hostname: result.hostname, score: result.score, action: result.action });
                }
                else
                    cb(error, null);
            });
            res.on('error', (e) => { cb(e.message, null); });
        });
        request.on('error', (e) => cb(e.message, null));
        request.write(query_string);
        request.end();
    }
}
exports.RecaptchaV3 = RecaptchaV3;
