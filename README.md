# SmartMark Manager

Have you ever felt annoyed while managing your bookmarks in Chrome? SmartMarks will improve your day-to-day interactions with your browser by intelligently storing your bookmark data using the browser's user interface. 

## Installing the extension
First, clone the repository to your computer.

Navigate to the project directory, install the dependencies and build the extension.

```
cd {smartmark_location}
npm install
npm run build
```

Results are loaded into the `dist` directory, which you can load in Chrome:

1. Open Chrome.
2. Navigate to `chrome://extensions`.
3. Enable _Developer mode_.
4. Click _Load unpacked_.
5. Select the `dist` directory.
6. Pin SmartMark on the right of the search bar under _Extensions_ (puzzle icon)

You are all set!

## Running Tests

In the root folder run:
```
npm run test
```
