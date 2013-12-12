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
		res.send('<!DOCTYPE html>\r\n<html lang=\"en\">\r\n<head>\r\n<title>ACE in Action<\/title>\r\n<script src=\"\/\/ajax.googleapis.com\/ajax\/libs\/jquery\/1.10.2\/jquery.min.js\"><\/script>\r\n<style type=\"text\/css\" media=\"screen\">\r\n    #editor { \r\n        position: absolute;\r\n        top: 0;\r\n        right: 0;\r\n        bottom: 0;\r\n        left: 0;\r\n    }\r\n\r\n#save { position: absolute; right: 20px; top: 20px; }\r\n<\/style>\r\n<\/head>\r\n<body>\r\n\r\n<form method=\"POST\" id=\"save-form\">\r\n    <textarea name=\"contents\"><\/textarea>\r\n    <div id=\"editor\">' + require('escape-html')(contents) + '<\/div>\r\n    <button type=\"submit\" id=\"save\">Save<\/button>\r\n<\/form>\r\n\r\n<script src=\"\/\/cdnjs.cloudflare.com\/ajax\/libs\/ace\/1.1.01\/ace.js\" type=\"text\/javascript\" charset=\"utf-8\"><\/script>\r\n<script>\r\n    var editor = ace.edit(\"editor\");\r\n    editor.setTheme(\"ace\/theme\/monokai\");\r\n    editor.getSession().setMode(\"ace\/mode\/javascript\");\r\nvar textarea = $(\'textarea[name=\"contents\"]\').hide();\r\n$(\'#save-form\').submit(function() {\r\ntextarea.val(editor.getSession().getValue());\r\n});\r\n<\/script>\r\n<\/body>\r\n<\/html>'); // + require('escape-html')(contents) + '</textarea><button type="submit">Save</button></form>');
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