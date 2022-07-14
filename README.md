# Dhivehi Sites Crawler

### Prerequisites
- Node.js (tested on v16.13.2)
- NPM (tested on 8.1.2)
> this probably isn't very important, just make sure you can run commonjs which uses require and stuff

### Usage
- Clone this repository
```sh
git clone https://github.com/WovenCoast/dhivehi-sites-crawler
```

- Install the dependencies
```sh
npm install
# or
yarn install
# or 
pnpm install
```

- Run the script
```sh
node index.js
# or
npm start
# or
yarn start
# or - okay you get the gist of it
```
> Note: This script is meant to be used along with another script that reads the output articles.json file and store it in a database but this is done externally 

# Contributing

It is **highly advised** to not edit index.js as it's basically a black box full of black magic that makes manifest.json work 

## Documentation
manifest.json :
```js
{
  // custom headers to be attached to the HTTP requests
  "headers": {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36",
  },

  // the main attraction
  "sites": [
    {
      // required - name of the website
      "name": "Mihaaru",
      // required - base URL for the website
      "baseUrl": "https://mihaaru.com",
      // optional - logo attached to this website (unused in the script)
      "logo": "https://cdn.mihaaru.com/assets/mhr/images/logo-header.png",
      // optional - URL that gets crawled, will be baseUrl by default
      // "crawlUrl": 
      // optional - endpoints that won't be searched
      "blacklist": [
        "https://mihaaru.com/info/terms-and-conditions",
        "https://mihaaru.com/info/privacy-policy"
      ],

      // required - black magic
      "regexes": {
        // each one of these keys gets evaluated as a regular expression and crawling URLs are matched and parsed accordingly

        // required - base URL catcher
        "https://mihaaru.com": {
          // required - regex that matches URLs to crawl through
          "url": "<a href=\"(.*?)\""
        },

        // optional - branch URL catchers
        "https://mihaaru.com/(.*?)/(.*)": {
          // optional - dictates metadata that is passed through every crawl res that matches the key regex
          "metadata": {
            // optional - invokes the logic that parses articles
            // similar flags can be implemented by adding below LN136
            "article": true,
            // optional - includes data that is fixed and doesn't have to be found dynamically for every article 
            "overrides": {
              "theme": "#ff0000"
            }
          },
          // everything below this is added to the article as such
          // "[key]": "[regex] (?:which)+ [has|a] (match group) [that|gets]? (?:added)+"
          "thumbnail": "<meta property=\"og:image\" content=\"(.*?)\"",
          "enTitle": "<meta name=\"twitter:title\" content=\"(.*?)\"",
          "dvTitle": "<h1.*>(.*)</h1>",
          "publishedTime": "<meta property=\"article:published_time\" content=\"(.*?)\"",
          "publishedTimeHuman": "mx-3 mt-1 leading-none sm:mx-0 text-faseyha\">(.*)</p>",
          "category": "<meta property=\"article:section\" content=\"(.*?)\""
          // the script adds a few more properties that cannot be overridden, the code that does this is in LN126
          // "url": *the url that was crawled for this specific data*,
          // "website": *the name property of whichever site the script is crawling*
          // "crawledOn": *JS date string that was taken when this url was crawled*
        }
      }
    },
  ]
}
```
> Note: Actual JSON doesn't support comments in any way, so instead of copying this example, use the manifest.json provided in this repo


For the URL catchers, I know it's very hard to be consistent with the field names as you can set the fields to be whatever you want but here's a set of common field names to use
- `thumbnail`: Thumbnail image of the article, preferably one without branding

- `enTitle`: English title of the article, if available
- `dvTitle`: Dhivehi title of the article, if available

No, don't use `title`, if only one title is available set only the title for the correct language

- `publishedTime`: Date string or UNIX timestamp for when the article was published 
- `publishedTimeHuman`: Human readable format for the above timestamp

There are cases where only one of this can be filled but do prioritize filling `publishedTime`

- `category`: Category or comma separated list of categories
- `theme`: Hex colo~~u~~r code for the theme of the article or the website

---

index.js : *open it if you dare*


## TODO

- [ ] Add some output to every step of the script
- [ ] Optimise runtime by making the whole script actually async

> *deep breath*

- [x] Add [Mihaaru](https://mihaaru.com)
- [x] Add [Vaguthu](https://vaguthu.mv)
- [x] Add [VNews](https://vnews.mv)
- [x] Add [AvasMV](https://avas.mv/) - blocked by CloudFlare
- [x] Add [SunOnline](https://sun.mv)
- [x] Add [Raajje](https://raajje.mv/)
- [x] Add [Bonthi News](https://bonthinews.com) - thanks Ibrahim Cade :)
- [x] Add [Miadhu](https://www.miadhu.mv)
- [x] Add [Gazette](https://gazette.gov.mv)
- [x] Add [Mikal News](https://mikalnews.com)
- [x] Add [Fenvaru](https://www.fenvaru.mv)
- [x] Add [Dhen](https://dhen.mv)
- [x] Add [VoiceMV](https://voice.mv)
- [ ] Add [Adhadhu](https://adhadhu.com/)
- [ ] Add [Dhuvas](https://dhuvas.mv/)
- [ ] Add [DhiIslam](https://dhiislam.com/)
- [ ] Add [Esfiya](https://www.esfiya.com/)
- [ ] Add [ThePress](https://thepress.mv/)
- [ ] Add [Dhiyares](https://dhiyares.com/news)