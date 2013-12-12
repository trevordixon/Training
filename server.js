var fs = require('fs'),
	express = require('express'),
	ncp = require('ncp'),
	app = express();

app.use(express.logger('dev'));
app.use(express.bodyParser());

app.use(function(req, res, next) {
	req.sub = req.headers.host.split('.')[0];
	
	if (!fs.existsSync(__dirname + '/sites/' + req.sub)) {
		ncp(__dirname + '/template', __dirname + '/sites/' + req.sub, function() { next(); });
	} else {
		next();
	}
});

app.get('/edit/*', function(req, res) {
	var path = __dirname + '/sites/' + req.sub + '/' + req.params[0];
	fs.readFile(path, function(err, contents) {
		res.send('<form method="POST"><textarea name="contents">' + require('escape-html')(contents) + '</textarea><button type="submit">Save</button></form>');
	});
});

app.post('/edit/*', function(req, res) {
	var path = __dirname + '/sites/' + req.sub + '/' + req.params[0];
	fs.writeFile(path, req.body.contents, function(err) {
		res.redirect('/' + req.params[0]);
	});
});

app.get('/*', function(req, res) {
	res.sendfile(__dirname + '/sites/' + req.sub + '/' + req.params[0]);
	//console.log(req);
});

app.listen(3040);