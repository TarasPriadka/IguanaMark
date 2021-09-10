let levenshtein = require('fast-levenshtein');

const BIG_INTEGER = 100000

export class UrlCategorizer {

    urlMap: Record<string, string> | undefined
    levensteinThreshold: number

    constructor(urlMap?: Record<string, string>, levThreshold = 5) {
        if (urlMap != undefined) {
            this.urlMap = urlMap;
        }
        this.levensteinThreshold = levThreshold;
    }

    getUrlCategory(url: string) {
        if (this.urlMap != undefined) {
            let u = new URL(url);
            return u.host in this.urlMap ? this.urlMap[u.host] : 'Other';
        } else {
            return 'Other';
        }
    }

    getMostSimilarUrl(url: string, otherUrls: string[]) {
        let minDistance = BIG_INTEGER;
        let minUrl = "";
        for (const urlElement of otherUrls) {
            let dist = levenshtein.get(url, urlElement);
            if (dist <= this.levensteinThreshold && dist < minDistance) {
                minDistance = dist;
                minUrl = urlElement;
            }
        }
        return minUrl;
    }
}
