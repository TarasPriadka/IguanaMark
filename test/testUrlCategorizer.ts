import {UrlCategorizer} from "../src/libs/urlCategorizer";
import {assert} from "chai";

describe('URL Categorizer Tests', () => {
    it('Checking same URL', () => {
        let categorizer = new UrlCategorizer();

        let inputURL = "www.project.com/1";
        let inputOtherURLs = ["www.project.com/2", "www.youtube.com/view?", "www.google.com"]

        // console.debug("Input URL", inputURL);
        // console.debug("Other URLs", inputOtherURLs);

        let output = categorizer.getMostSimilarUrl(inputURL, inputOtherURLs);
        // console.debug("Output: ", output);
        assert.deepEqual(output, ["www.project.com/2"], "Arrays are not equal");
    });

    it('Checking no similar URLs', () => { // the single test
        let categorizer = new UrlCategorizer(); // this will be your class

        let inputURL = "www.project.com/1";
        let inputOtherURLs = ["www.instagram.com/helloworld", "www.facebook.com/view?user", "www.google.com"]

        // console.debug("Input URL", inputURL);
        // console.debug("Other URLs", inputOtherURLs);
        let output = categorizer.getMostSimilarUrl(inputURL, inputOtherURLs);
        // console.debug("Output: ", output);

        assert.deepEqual(output, [], "Arrays are not equal");
    });

    it('Checking multiple similar URLs', () => { // the single test
        let categorizer = new UrlCategorizer(); // this will be your class

        let inputURL = "www.project.com/1";
        let inputOtherURLs = ["www.project.com/2", "www.project.com/3", "www.project.com/4", "www.youtube.com/view?", "www.google.com"]

        // console.debug("Input URL", inputURL);
        // console.debug("Other URLs", inputOtherURLs);
        let output = categorizer.getMostSimilarUrl(inputURL, inputOtherURLs);
        // console.debug("Output: ", output);

        assert.deepEqual(output, ["www.project.com/4", "www.project.com/3", "www.project.com/2"], "Arrays are not equal");
    });
});