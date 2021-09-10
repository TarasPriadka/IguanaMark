let levenshtein = require('fast-levenshtein');

const BIG_INTEGER = 100000

export class UrlCategorizer {

    urlMap: Record<string, string> | undefined
    levensteinThreshold: number

    /**
     * Creates a UrlCategorizer
     *
     * @param urlMap maps url host to the category
     * @param levThreshold maximum url Levenshtein distance
     */
    constructor(urlMap?: Record<string, string>, levThreshold = 5) {
        if (urlMap != undefined) {
            this.urlMap = urlMap;
        }
        this.levensteinThreshold = levThreshold;
    }

    /**
     * Use Url map to get the category of the current url
     *
     * @param url link to categorize
     * @returns string category of the URL
     */
    getUrlCategory(url: string) {
        if (this.urlMap != undefined) {
            let u = new URL(url);
            return u.host in this.urlMap ? this.urlMap[u.host] : 'Other';
        } else {
            return 'Other';
        }
    }

    /**
     * Use Levenshtein edit distance to find Url which is the closest to the `url` out of list of other urls.
     *
     * @param url base url
     * @param otherUrls list of all urls
     * @returns list of urls which are the closest to the currently bookmarked
     */
    getMostSimilarUrl(url: string, otherUrls: string[]) {
        let minDistance = BIG_INTEGER;
        let minUrls: [string, number][] = [] //array which will collect all of the urls with scores in ascending order
        for (const urlElement of otherUrls) {
            let dist: number = levenshtein.get(url, urlElement);
            if (dist <= this.levensteinThreshold && dist <= minDistance) {
                minDistance = dist;
                minUrls.unshift([urlElement, dist]);
            }
        }
        let outputUrls: string[] = [];

        if (minUrls.length > 0) {
            let min = minUrls[0][1];
            let i=0;
            for (; i < minUrls.length && minUrls[i][1] == min; i++); //find index of elem w/ distance > min
            outputUrls = minUrls.map((url) => url[0]).slice(0,i);
        }

        return outputUrls;
    }
}
