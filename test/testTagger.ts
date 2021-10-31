import {Page, DomainTagger, NGramSimilarityTagger, tagger} from "../src/libs/ai/tagger";
import {assert, expect} from "chai";

describe('Tagger Tests', () => {
    it('Checking same domain', () => {
        let domainTagger = new DomainTagger();

        let page0 = new Page(
            'http://yahoo.com/',
            'Google',
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
            new Set<String>(['bad search'])
        )
        let page1 = new Page(
            'http://google.com/',
            'Google',
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
            new Set<String>(['good search'])
        )
        let page2 = new Page(
            'https://google.com/soi',
            'Google Search',
            'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. ',
        )

        let actualTags = ['good search']
        let predictedTags = Array.from(domainTagger.findTags(page2, [page0, page1]));

        expect(actualTags).to.have.members(predictedTags)
    });

    it('Checking ngram overlap', () => {
        let ngramTagger = new NGramSimilarityTagger();

        let page0 = new Page(
            'http://yahoo.com/',
            'Google',
            'Lorem ipsum dolor perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque sed do eiusmod tempor laudantium,  Ut enim ad minim totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto',
            new Set<String>(['bad search'])
        )
        let page1 = new Page(
            'http://google.com/',
            'Google',
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
            new Set<String>(['good search'])
        )
        let page2 = new Page(
            'https://google.com/soi',
            'Google Search',
            'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. ',
        )

        let actualTags = ['bad search']
        let predictedTags = Array.from(ngramTagger.findTags(page2, [page0, page1]));

        expect(actualTags).to.have.members(predictedTags)
    });

    it('Checking combined', () => {
        let page0 = new Page(
            'http://yahoo.com/',
            'Google',
            'Lorem ipsum dolor perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque sed do eiusmod tempor laudantium,  Ut enim ad minim totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto',
            new Set<String>(['bad search'])
        )
        let page1 = new Page(
            'http://google.com/',
            'Google',
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
            new Set<String>(['good search'])
        )
        let page2 = new Page(
            'https://google.com/soi',
            'Google Search',
            'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. ',
        )

        let actualTags = ['bad search', 'good search']
        let predictedTags = Array.from(tagger.findTags(page2, [page0, page1]));

        expect(actualTags).to.have.members(predictedTags)
    });
});