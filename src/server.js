import sirv from 'sirv';
import polka from 'polka';
import compression from 'compression';
// eslint-disable-next-line
import * as sapper from '../__sapper__/server.js';

const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === 'development';

polka() // You can also use Express
  .use(
    compression({ threshold: 0 }),
    sirv('static', { dev }),
    sapper.middleware()
  )
  .listen(PORT, err => {
    // eslint-disable-next-line
    if (err) console.log('error', err);
  });
