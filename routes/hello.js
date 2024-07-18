var express = require('express');
var router = express.Router();

/* GET hello page. */
router.get('/:string', function(req, res) {
  var string = req.params.string;
  res.send('Hello + ' + string);
});

module.exports = router;