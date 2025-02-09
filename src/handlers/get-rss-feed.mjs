let Parser = require('rss-parser');
let moment = require('moment');


/**
 * A simple example includes a HTTP get method to get one item by id from a DynamoDB table.
 */
export const getRssFeedHandler = async (event) => {
  if (event.httpMethod !== 'GET') {
    throw new Error(`getMethod only accept GET method, you tried: ${event.httpMethod}`);
  }
  // All log statements are written to CloudWatch
  console.info('received:', event);
 
  // Get id from pathParameters from APIGateway because of `/{url}` at template.yaml
  const url = event.pathParameters.url;
  getFeed(url).then((feed) => {
    feed.items.forEach(item => {
      item = fixFeedItem(item, increment);
    })
  })


 
  const response = {
    statusCode: 200,
    body: JSON.stringify(feed)
  };
 
  // All log statements are written to CloudWatch
  console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
  return response;
}

function fixFeedItem(item, increment){
  item.pubDate = moment("20000101", "YYYYMMDD").add(increment, 'days').format("ddd, DD MMM YYYY HH:mm:ss ZZ");
  return item;
}

async function getFeed(url){
  let parser = new Parser();
  return await parser.parseURL(url);
}