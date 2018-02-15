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
    private appid: string = null;
    constructor(appid) {
        if (!appid || typeof appid !== 'string') {
            throw new TypeError('appid must be non-empty string');
        }
        this.appid = appid;
    }
    private getSimple(input: string, output = 'xml') {
        let flag: boolean = false;
        if (output != 'xml') {
            flag = true;
        }
        const baseUrl = `${baseApiUrl}v1/query?appid=${this.appid}`;
        return this.createApiParams(baseUrl, input, flag)
            .then(this.fetchResults)
            .then(this.formatResults);
    }
    // short answer from wolfram -api
    private getShort(input: string) {
        const baseUrl = `${baseApiUrl}v1/result?appid=${this.appid}`;
        return this.createApiParams(baseUrl, input)
            .then(this.fetchResults)
            .then(this.formatResults);
    }

    private getFull(input: any) {
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

    private formatResults(params: any) {
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

    private createApiParams(baseUrl: string, input: string, flag: boolean = false) {
        return new Promise((resolve, reject) => {
            switch (typeof input) {
                case 'string':
                    if (flag) {
                        resolve({ url: `${baseUrl}&input=${encodeURIComponent(input)}&output=json&format=plaintext` });
                        return;
                    }
                    resolve({ url: `${baseUrl}&input=${encodeURIComponent(input)}&format=plaintext` });
                    break;
                case 'object':
                    if (flag) {
                        resolve({ url: `${baseUrl}&input=${encodeURIComponent(input)}&output=json&format=plaintext` });
                        return;
                    }
                    resolve({ url: `${baseUrl}&input=${encodeURIComponent(input)}&format=plaintext` }); break;
                default:
                    reject(new TypeError(createApiParamsRejectMsg));
            }
        });
    }

    private fetchResults(params: any) {
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

    public query(input: string) {
        return new Promise<{ err: any, result: any }>((resolve, reject) => {
            let xmlResult: any = null, jsonResult: any = null;
            this.getSimple(input)
                .then((res) => {
                    xmlResult = res;
                    // resolve({ err: null, result: res });
                    return;
                })
                .then(() => {
                    this.getSimple(input, 'json')
                        .then((jsonRes) => {
                            jsonResult = jsonRes;
                            resolve({ err: null, result: { xmlResult: xmlResult, jsonResult: JSON.parse(jsonResult) } });
                            return;
                        })  
                })
                .catch((ex) => {
                    console.error("Error while getting the data from wolfram api : " + JSON.stringify(ex));
                    resolve({ err: ex, result: null });
                    return;
                });
        });
    }
}

