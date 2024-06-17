const express = require('express');
const { exec } = require('child_process');
const bodyParser = require('body-parser');

const { getData } = require('./owncloud.js')

const app = express();
const port = 80;

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send(`
    <html>
      <body>
        <form action="/submit-form" method="post" style="font-family: sans-serif; display: flex; align-items:center; justify-content: center; flex-direction: column; height: 100vh; width: 100%; gap: 1rem;">
          <label for="path">Bitte Owncloud Pfad angeben</label>
          <input type="text" id="path" name="path" value="/">
          <button type="submit">Generieren</button>
        </form>
      </body>
    </html>
  `);
});

app.post('/submit-form', async (req, res) => {

    try {
      const data = await getData(req.body.path);
    res.json(data);
    } catch (error) {
      console.error('Error:', error);
      res.json(false);
    }


});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
