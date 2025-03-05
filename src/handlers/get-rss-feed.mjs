import moment from "moment";
import { DOMParser, XMLSerializer } from 'xmldom';
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
  console.error("id: ", id);
  return getFeed(id).then((feed) => {
    let increment = 0;
    Array.from(feed.getElementsByTagName("item")).forEach(item => {
      // Create new element
      const newElement = feed.createElement('pubDate');

      // Add text content
      const textNode = feed.createTextNode(
          moment("20000101", "YYYYMMDD")
              .add(increment, 'days')
              .format("ddd, DD MMM YYYY HH:mm:ss ZZ")
      );
      newElement.appendChild(textNode);

      // Add to parent node
      item.appendChild(newElement);
      increment++;
       })

    const serializer = new XMLSerializer();
    return {
      statusCode: 200,
      body: serializer.serializeToString(feed)
    };
  })

}

async function getFeed(id){
  return fetch("https://librivox.org/rss/" + id).then((resp) => {
    return resp.text();
  }).then((resp) => {
    const parser = new DOMParser();
    return parser.parseFromString(resp, "text/xml");
  });

}