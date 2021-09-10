import {UrlCategorizer} from "../libs/urlCategorizer";
import {assert} from "chai";

describe('URL Categorizer Tests', () => { // the tests container
    it('Checking same url', () => { // the single test
        let categorizer = new UrlCategorizer(); // this will be your class

        let inputURL = "www.project.com/1";
        let inputOtherURLs = ["www.project.com/2", "www.youtube.com/view?", "www.google.com"]

        assert.equal(categorizer.getMostSimilarUrl(inputURL, inputOtherURLs), "www.project.com/2");
    });

    it('Checking no similar URLs', () => { // the single test
        let categorizer = new UrlCategorizer(); // this will be your class

        let inputURL = "www.project.com/1";
        let inputOtherURLs = ["www.instagram.com/helloworld", "www.facebook.com/view?user", "www.google.com"]

        assert.equal(categorizer.getMostSimilarUrl(inputURL, inputOtherURLs), "");
    });
});