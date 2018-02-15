/**
 * @module wolfram-alpha-api
 */

const https = require('https');
const querystring = require('querystring');

const baseApiUrl = 'https://api.wolframalpha.com/';
const createApiParamsRejectMsg = 'method only receives string or object';

/**
 * Wolfram-Alpha API NPM Library
 */
export class wolframAlpha {
    appid: string = null;
    constructor(appid) {
        if (!appid || typeof appid !== 'string') {
            throw new TypeError('appid must be non-empty string');
        }
        this.appid = appid;
    }
    public getSimple(input) {
        const baseUrl = `${baseApiUrl}v1/simple?appid=${this.appid}`;
        return this.createApiParams(baseUrl, input)
            .then(this.fetchResults)
            .then(this.formatResults);
    }
    // short answer from wolfram -api
    public getShort(input) {
        const baseUrl = `${baseApiUrl}v1/result?appid=${this.appid}`;
        return this.createApiParams(baseUrl, input)
            .then(this.fetchResults)
            .then(this.formatResults);
    }

    public getFull(input) {
        const baseUrl = `${baseApiUrl}v2/query?appid=${this.appid}`;
        return new Promise((resolve, reject) => {
            switch (typeof input) {
                case 'string':
                    resolve({
                        url: `${baseUrl}&input=${encodeURIComponent(input)}&output=json`,
                        output: 'json',
                    });
                    break;
                case 'object': {
                    const options = Object.assign({ output: 'json' }, input);
                    if (options.input == null && options.i != null) {
                        options.input = options.i;
                        delete options.i;
                    }
                    resolve({
                        url: `${baseUrl}&${querystring.stringify(options)}`,
                        output: options.output,
                    });
                    break;
                }
                default:
                    reject(new TypeError(createApiParamsRejectMsg));
            }
        })
            .then(this.fetchResults)
            .then(this.formatResults);
    }

    private formatResults(params) {
        const { data, output, statusCode, contentType } = params;
        return new Promise((resolve, reject) => {
            if (statusCode === 200) {
                switch (output) {
                    case 'json':
                        try {
                            resolve(JSON.parse(data).queryresult);
                        } catch (e) {
                            reject(
                                new Error('Temporary problem in parsing JSON, please try again.'),
                            );
                        }
                        break;
                    case 'image':
                        resolve(`data:${contentType};base64,${data}`);
                        break;
                    default:
                        resolve(data);
                }
                // if statusCode !== 200
            } else if (/^text\/html/.test(contentType)) {
                reject(new Error('Temporary problem with the API, please try again.'));
            } else {
                // empty, ambiguous, or otherwise invalid.
                reject(new Error(data));
            }
        });
    }


    private createApiParams(baseUrl, input, output = 'string') {
        return new Promise((resolve, reject) => {
            switch (typeof input) {
                case 'string':
                    resolve({ url: `${baseUrl}&i=${encodeURIComponent(input)}`, output });
                    break;
                case 'object':
                    resolve({ url: `${baseUrl}&${querystring.stringify(input)}`, output });
                    break;
                default:
                    reject(new TypeError(createApiParamsRejectMsg));
            }
        });
    }

    private fetchResults(params) {
        const { url, output } = params;
        return new Promise((resolve, reject) => {
            https
                .get(url, (res) => {
                    const statusCode = res.statusCode;
                    const contentType = res.headers['content-type'];
                    if (output === 'image' && statusCode === 200) {
                        res.setEncoding('base64'); // API returns binary data, we want base64 for the Data URI
                    } else {
                        res.setEncoding('utf8');
                    }
                    let data = '';
                    res.on('data', (chunk) => {
                        data += chunk;
                    });
                    res.on('end', () => {
                        resolve({ data, output, statusCode, contentType });
                    });
                })
                .on('error', (e) => {
                    reject(e);
                });
        });
    }

}

