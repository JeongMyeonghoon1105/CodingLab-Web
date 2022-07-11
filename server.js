var express = require('express');
var fs = require('fs');
var app = express();
var url = require('url');
var qs = require('query-string');
var mysql = require('mysql');
var template = require('./template.js');

var db = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'audgns9809',
  database : 'codinglab'
});
db.connect();

var bodyParser = require('body-parser')
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({
  limit: '50mb',
  extended: true
}));
app.use(express.static('public'));

// 메인 페이지
app.get('/', (req, res) => {
  db.query(`SELECT id, datetime FROM post`, (err, topics) => {
    var list = `<br>`;
    if (err) throw err;
    topics.forEach((elem) => {
      list = list + `<a href="/posting?id=${elem.id}" style="width: 90%; margin: 20px 10px; padding: 10px 5px; border-bottom: 1px solid #ffdf6a; font-size: 1.5em; color: gray; text-decoration: none;">${elem.id}번 공지</a>`
    });
    var queryData = url.parse(req.url, true).query;
    var main = template.main(list);
    res.send(main)
  })
});
// 게시물 작성 페이지
app.get('/write', (req, res) => {
  res.sendFile(__dirname + "/public/html/writing.html");
});
// 게시물 페이지
app.get('/posting', (req, res) => {
  var queryData = url.parse(req.url, true).query;
  db.query(`SELECT id, content FROM post WHERE id=${queryData.id}`, (err, topics) => {
    if (err) throw err;
    var render = template.top();
    render = render + topics[0].content;
    render = render + template.bottom();
    res.send(render);
  })
});
// 게시물 업로딩 프로세스
app.post('/post', (req, res) => {
  var text = ``
  text = text + req.body.editordata;

  db.query(`INSERT INTO post(content, datetime) VALUES (?,  DATE_FORMAT(now(), '%Y-%m-%d'))`, [text], (err, topics) => {
    if (err) throw err;
    res.redirect('/');
  })
});
// 포트 지정 및 Listen
const PORT = process.env.PORT || 3000
app.listen(PORT);

// $ npm install query-string
// $ npm install mysql
// $ npm install --save body-parser