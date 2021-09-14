# SmartMark Manager

Have you ever felt annoyed while managing your bookmarks in Chrome? SmartMarks will improve your day-to-day interactions with your browser by intelligently storing your bookmark data using the browser's user interface. 

## Installing the extension
First, clone the repository to your computer.

Navigate to the project directory, install the dependencies and build the extension.

```
$ cd {smartmark_location}
$ npm install
$ npm start build
```

Add a newly created `dist` directory to your Chrome browser:

1. Open Chrome.
2. Navigate to `chrome://extensions`.
3. Enable _Developer mode_.
4. Click _Load unpacked_.
5. Select the `dist` directory.

You are all set!

## Running Tests

In the root folder run:
```
npm start test
```
