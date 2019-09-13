const { readFile, writeFile } = require("./lib");
const convert = require("xml-js").json2xml;
const axios = require("axios");

const endpoint = "https://eztv.io/api/get-torrents?limit=100&imdb_id=2149175";
const filename = "torrents.rss";
(async () => {
  const base = {
    _declaration: {
      _attributes: {
        version: "1.0",
        encoding: "utf-8"
      }
    },
    rss: {
      _attributes: {
        version: "2.0"
      },
      channel: {
        title: {
          _text: "The Americans EZTV"
        },
        link: {
          _text: "http://eztv.io"
        },
        item: {}
      }
    }
  };
  console.log(`Fetching torrents from ${endpoint}`);
  const { data } = await axios(endpoint);

  console.log(`Parsing ${data.torrents.length} torrents`);

  const items = data.torrents.map(torrent => {
    const obj = {
      title: { _text: torrent.title },
      guid: { _text: torrent.hash },
      enclosure: {
        _attributes: {
          url: torrent.torrent_url,
          type: "application/x-bittorrent"
        }
      }
    };
    return obj;
  });

  base.rss.channel.item = items;
  const finalJSON = base;
  const rss = convert(JSON.stringify(finalJSON), {
    compact: true,
    ignoreComment: true,
    spaces: 4
  });
  await writeFile(filename, rss);
  console.log(`RSS written in ${filename}`);
})();
