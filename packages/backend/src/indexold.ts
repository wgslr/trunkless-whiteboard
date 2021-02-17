import express from 'express';
import * as utils from './utils';

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send(`Hello whiteboard! ${utils.add(3, 4)}`);
});

app.listen(port, () => {
  return console.log(`server is listening on ${port}`);
});
