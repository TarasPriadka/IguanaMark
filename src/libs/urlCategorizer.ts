class UrlCategorizer {
        
    constructor(urlMap:object) {
        this.urlMap = urlMap
    }

    getUrlCategory(url) {
        let u = new URL(url);
        return u.host in this.urlMap ? this.urlMap[u.host] : 'Other';
    }
}