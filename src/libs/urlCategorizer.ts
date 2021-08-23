export class UrlCategorizer {

    urlMap: Record<string, string>

    constructor(urlMap: Record<string, string>) {
        this.urlMap = urlMap
    }

    getUrlCategory(url: string) {
        let u = new URL(url);
        return u.host in this.urlMap ? this.urlMap[u.host] : 'Other';
    }
}
