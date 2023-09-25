var express = require('express');
var router = express.Router();

var api_ix_status = require('./api/ixstatus');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/api', async function(req, res, next) {
  try {
    res.setHeader('Content-Type', 'application/json');

    let statuses = await api_ix_status.data; // <-- `await` verwenden
    res.send(JSON.stringify(statuses, null, 2));
  } catch (error) {
    next(error); // Fehler an den nächsten Middleware-Handler senden
  }
});

module.exports = router;


