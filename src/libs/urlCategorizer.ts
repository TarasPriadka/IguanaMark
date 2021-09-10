export class UrlCategorizer {

    urlMap: Record<string, string> | undefined

    constructor(urlMap?: Record<string, string>) {
        if (urlMap != undefined) {
            this.urlMap = urlMap;
        }
    }

    getUrlCategory(url: string) {
        if (this.urlMap != undefined) {
            let u = new URL(url);
            return u.host in this.urlMap ? this.urlMap[u.host] : 'Other';
        } else {
            return null;
        }
    }

    getMostSimilarUrl(url: string, otherUrls: string[]) {
        // for (let urlKey in otherUrls) {
        //
        // }
        return "";
    }
}
