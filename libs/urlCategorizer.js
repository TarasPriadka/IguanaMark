class UrlCategorizer {    
    constructor(urlMap) {
        this.urlMap = urlMap
    }

    getUrlCategory(url) {
        let u = new URL(url);
        return u.host in this.urlMap ? this.urlMap[u.host] : 'Other';
    }
}