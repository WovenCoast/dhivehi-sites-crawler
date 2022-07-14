require("dotenv").config();
const fs = require("fs");
const ent = require("ent");
const axios = require("axios").default;
const manifest = require("./manifest.json");

let articles = fs.existsSync("articles.json")
  ? JSON.parse(fs.readFileSync("./articles.json", { encoding: "utf-8" }))
  : [];

const headers = manifest.headers || {};

const visited = new Set();

function absoluteURL(baseUrl, url) {
  if (url.startsWith("http")) return url.split("?")[0];

  const [_, protocol, host] = baseUrl.match(/(https?):\/\/(.*?)(\/.*)?/);
  return `${protocol}://${host}${url.split("?")[0]}`;
}

async function crawl(url, regexes) {
  if (visited.has(url)) return null;
  visited.add(url);

  const response = await axios
    .get(url, { headers, responseType: "text" })
    .catch((e) => e.response);
  if (!response) return null;
  let html = response.data || "";
  if (!html) return null;
  if (typeof html !== "string") return null;

  const res = {};

  for (const [key, regex] of Object.entries(regexes)) {
    // console.log(key, regex, url, new RegExp(key).test(url));
    if (!new RegExp(key).test(url)) continue;

    Object.entries(regex).forEach(([key, value]) => {
      if (key === "metadata") {
        res[key] = value;
        return;
      }
      const match = (html.match(new RegExp(value, "g")) || []).map((x) =>
        Array.from(x.match(new RegExp(value))).slice(1)
      );

      if (match && match.length) {
        // res[key] = match.map((m) => {
        //   if (key === "url") return absoluteURL(url, m.join(" "));
        //   else return ent.decode(m.join(" "));
        // });

        match.forEach((m) => {
          if (!res[key]) res[key] = [];
          res[key].push(
            (key === "url"
              ? absoluteURL(url, m.join(" "))
              : ent.decode(m.join(", "))
            ).trim()
          );
          // key.split(" ").forEach((k, i) => {
          //   if (!res[k]) res[k] = [];
          //   res[k].push(
          //     (k === "url" ? absoluteURL(url, m[i]) : ent.decode(m[i])).trim()
          //   );
          // });
        });
      }
    });
  }

  return res;
}

async function main() {
  for (const site of manifest.sites) {
    // TODO: temporary testing
    // if (site.name !== "Raajje") continue;

    if (!site.crawlUrl) site.crawlUrl = site.baseUrl;
    if (!Array.isArray(site.crawlUrl)) site.crawlUrl = [site.crawlUrl];
    // console.log(site.name, site.crawlUrl)

    let urls = [];

    for (const crawlUrl of site.crawlUrl) {
      const initRes = await crawl(crawlUrl, site.regexes);
      // console.log(initRes);
      if (!initRes.url) continue;
      urls = [...urls, ...initRes.url];
    }
    // console.log(site.crawlUrl, urls);

    for (const branch of urls) {
      if (site.blacklist && site.blacklist.includes(branch)) continue;
      if (
        !Object.keys(site.regexes)
          .map((r) => new RegExp(r).test(branch))
          .includes(true)
      )
        continue;

      const res = (await crawl(branch, site.regexes)) || {};
      // console.log(branch, res);

      if (res.metadata && res.metadata.article) {
        // if (!res.thumbnail || !res.dvTitle) console.log(branch, res);

        const article = {};
        Object.entries(res).forEach(([k, v]) => {
          if (k === "metadata") return;
          article[k] = v.join(", ");
        });
        if (res.metadata.overrides) {
          Object.entries(res.metadata.overrides).forEach(
            ([k, v]) => (article[k] = v)
          );
        }
        article.url = branch;
        article.website = site.name;
        article.crawledOn = new Date();

        const currentArticleIndex = articles.findIndex(
          (a) => a.url === res.metadata.article
        );
        if (currentArticleIndex !== -1) articles.splice(currentArticleIndex, 1);
        articles.push(article);
        // console.log(article);
      }

      // if (res.metadata) console.log(res);
      // if (!res) continue;
    }
  }

  fs.writeFileSync("articles.json", JSON.stringify(articles, null, 2));
}

main();
// const baseUrl = "https://mihaaru.com/gallery/2893";
// const url = "/news";
// console.log(absoluteURL(baseUrl, url));
