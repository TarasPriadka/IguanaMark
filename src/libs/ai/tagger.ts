const porterStemmer = require('@stdlib/nlp-porter-stemmer');

/**
 * Represents a single stored page
 */
export class Page {

    url: String;
    title: String;
    desc: String;
    words: String[];
    tags: Set<String> = new Set<String>();

    /**
     * Construct a page
     * @param url URL of the page
     * @param title Title of the page
     * @param desc Description (Page content) used to generate stemmed words
     * @param tags (optional) tags.
     */
    constructor(url: String, title: String, desc: String, tags = new Set<String>()) {
        this.url = url;
        this.title = title;
        this.desc = desc;
        this.tags = tags;

        this.words = this.desc.split(' ').map(porterStemmer);
    }

    /**
     * Converts page to string. Only including url to only have unique urls
     */
    toString() {
        return 'Page(' + this.url + ')'
    }
}

/**
 * Represents a tagger which finds tags for pages
 */
abstract class Tagger {

    /**
     * Counts tags in a set of pages. Returns in a map of tag to # of occurences
     *
     * @param community set of pages.
     */
    static getTagCounts(community: Page[]) {
        let tagCounts: Map<String, number> = new Map<String, number>()
        for (const item of community) {
            for (const tag of item.tags) {
                tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
            }
        }
        return tagCounts
    }

    /**
     * Finds tags for page based on savedPages
     *
     * @param page page to find tags for
     * @param savedPages existing tagged pages
     */
    abstract findTags(page: Page, savedPages: Page[]): Set<String>;
}

/**
 * Tagger based on a mapping and similarity functions. Map is used to convert
 * a page into some other format (for example page -> url) and similarity is
 * some function which measures similarity between some mapped pages (for example
 * could be some similarity between two arbitrary urls in the previous case).
 * This pattern is necessary to keep the similarity function lean and to not
 * recompute information many times for a given page (see code for parsedPage).
 *
 * @param T type that is mapped to and on which similarity operates
 */
abstract class MapSimilarityTagger<T> extends Tagger {

    map: (a: Page) => T;
    similarity: (a: T, b: T) => number;
    purityThresh: number;
    similarityThresh: number;

    /**
     * Constructs a MapSimilarityTagger
     * @param map function which maps page -> T
     * @param similarity similarity function between two T's
     * @param similarityThresh threshold for two pages to be considered similar
     * @param purityThresh threshold at which a community is considered to be strong or pure
     */
    constructor(
        map: (a: Page) => T,
        similarity: (a: T, b: T) => number,
        similarityThresh: number = .5,
        purityThresh: number = .7
    ) {
        super();
        this.map = map;
        this.similarity = similarity;
        this.purityThresh = purityThresh;
        this.similarityThresh = similarityThresh;
    }

    /**
     * @override
     */
    findTags(page: Page, savedPages: Page[]): Set<String> {
        let tags = new Set<String>();
        let parsedPage = this.map(page)
        let community = savedPages.filter(item => this.similarity(parsedPage, this.map(item)) > this.similarityThresh);
        let tagCounts = Tagger.getTagCounts(community);
        let sizeThresh = this.purityThresh * community.length;
        for (const [tag, tagCount] of tagCounts.entries()) {
            if (tagCount > sizeThresh) {
                tags.add(tag);
            }
        }
        return tags;
    }

}

/**
 * Tagger based on exact domain match.
 */
export class DomainTagger extends MapSimilarityTagger<string> {

    /**
     * Construct DomainTagger
     *
     * @param purityThresh threshold at which to consider a domain community to be strong or pure.
     */
    constructor(purityThresh = .7) {
        super(
            DomainTagger.getDomain,
            (a, b) => a == b ? 1 : 0,
            .5,
            purityThresh
        );
    }

    /**
     * Extract full domain name from page's url
     *
     * @param page page to extract domain from.
     */
    static getDomain(page: Page) {
        return page.url.split('://')[1].split('/')[0];
    }
}

/**
 * Tagger based on ngram similarity with existing pages
 */
export class NGramSimilarityTagger extends MapSimilarityTagger<Set<string>> {

    n: number;

    /**
     * Construct NGramSimilarityTagger
     *
     * @param similarityThresh number of minimum ngrams to consider 2 documents similar
     * @param purityThresh threshold at which to consider a domain community to be strong or pure.
     */
    constructor(similarityThresh = 5, purityThresh = .7, n = 2) {
        super(
            a => new Set<string>(),
            NGramSimilarityTagger.getNCommonStrings,
            similarityThresh,
            purityThresh
        );
        this.map = this.getNGrams;
        this.n = n;
    }

    /**
     * Gets number of common strings between two sets of strings
     *
     * @param a
     * @param b
     */
    static getNCommonStrings(a: Set<String>, b: Set<String>): number {
        let count = 0;
        for (const ngram of b) {
            if (a.has(ngram)) {
                count++;
            }
        }
        return count;
    }

    /**
     * Gets ngrams from page's words, where n words are concatenated using ';'
     *
     * @param page page to get ngrams from
     */
    getNGrams(page: Page): Set<string> {
        let inA = new Set<string>();
        for (let i = 0; i < page.words.length - this.n + 1; i++) {
            inA.add(page.words.slice(i, i + this.n).join(';'));
        }
        return inA;
    }
}

// TODO
// class TagMentionTagger extends Tagger {
//
//     allTags: string[];
//     purityThresh: number;
//
//     constructor(allTags: string[], purityThresh: number) {
//         super();
//         this.allTags = allTags;
//         this.purityThresh = purityThresh;
//     }
//
//     findTags(page: Page, savedPages: Page[]): string[] {
//         let tags = []
//         for (const tag of this.allTags) {
//             if (tag in)
//         }
//         let tags = []
//         let tag = '';
//         let community = savedPages.filter(item => item.url == page.url);
//         if (community.filter(el => tag in el.tags).length > community.length * this.thresh) {
//             tags.push(tag);
//         }
//         return tags;
//     }
// }

/**
 * Combines multiple taggers into one
 */
class ManyTagger extends Tagger {

    taggers: Tagger[];

    /**
     * Construct ManyTagger
     *
     * @param taggers taggers to combine into one
     */
    constructor(taggers: Tagger[]) {
        super();
        this.taggers = taggers;
    }

    /**
     * @override
     */
    findTags(page: Page, savedPages: Page[]): Set<String> {
        let tags = new Set<String>();
        for (const tagger of this.taggers) {
            const curTags = tagger.findTags(page, savedPages);
            for (const curTag of curTags) {
                tags.add(curTag);
            }
        }
        return tags;
    }
}

let savedPages: Page[] = []; // TODO: storage sync
export let tagger: Tagger = new ManyTagger([
    new DomainTagger(),
    new NGramSimilarityTagger(),
]);

/**
 * Tag and save new page
 *
 * @param page page to tag and save
 */
function savePage(page: Page) {
    page.tags = tagger.findTags(page, savedPages);
    savedPages.push(page)
    // TODO save pages
}

/**
 * Save new page from raw info
 *
 * @param url url of new page
 * @param title title of new page
 * @param desc description (content) of new page
 */
function savePageRaw(url: String, title: String, desc: String) {
    savePage(new Page(url, title, desc))
}