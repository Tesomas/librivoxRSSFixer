import moment from "moment";
import parseFromString from "dom-parser"

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
  const id = event.pathParameters.id;
  return getFeed(id).then((feed) => {
    let increment = 0;
    console.error(feed);
    feed.getElementsByName("item").forEach(item => {
       fixFeedItem(item, increment++);
    })
    const serializer = new XMLSerializer();
    return {
      statusCode: 200,
      body: serializer.serializeToString(feed)
    };
  })

}

function fixFeedItem(item, increment){
  item.pubDate = moment("20000101", "YYYYMMDD").add(increment, 'days').format("ddd, DD MMM YYYY HH:mm:ss ZZ");
  return item;
}

async function getFeed(id){
  return fetch("https://librivox.org/rss/" + id).then((resp) => {
    return resp.text();
  }).then((resp) => {
    console.error(resp);
    return parseFromString(resp);
  });

}