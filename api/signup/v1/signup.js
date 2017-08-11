var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
 console.log('/api/signup signup.get ' + req.body);
});

/* GET home page. */
router.post('/', function(req, res, next) {
 console.log('/api/signup signup.post ' + req.body);
});

module.exports = router;
