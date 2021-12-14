let express = require("express");
let path    = require("path");
let app     = express();
let port    = 5686;
let favicon = Buffer.from(/*data:image/x-icon;base64,*/""+
    "AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
    "AAAAAAD/////////////////////////////////////////////////////////////////////" +
    "////////////////8vLy/+Dg4P/g4OD/+fn5///////y8vL/4ODg/+Pj4/////////////Hx8f/g" +
    "4OD/4ODg/+zs7P///////////35+fv8AAAD/AAAA/7u7u///////iIiI/wAAAP8DAwP/19fX////" +
    "//91dXX/AAAA/wAAAP9PT0////////////+oqKj/AAAA/wAAAP+Ojo7//////2hoaP8AAAD/AAAA" +
    "/15eXv//////np6e/wAAAP8AAAD/IiIi////////////1NTU/wAAAP8AAAD/YWFh//////9ISEj/" +
    "AAAA/wAAAP8EBAT/3Nzc/8vLy/8AAAD/AAAA/wICAv/y8vL///////r6+v8HBwf/AAAA/zQ0NP//" +
    "////KCgo/wAAAP8AAAD/AAAA/2ZmZv/19fX/AwMD/wAAAP8AAAD/x8fH////////////MDAw/wAA" +
    "AP8KCgr/+/v7/wkJCf8AAAD/AAAA/wAAAP8HBwf/4uLi/ycnJ/8AAAD/AAAA/5qamv//////////" +
    "/11dXf8AAAD/AAAA/8HBwf8AAAD/AAAA/wcHB/8DAwP/AAAA/25ubv9UVFT/AAAA/wAAAP9tbW3/" +
    "//////////+JiYn/AAAA/wAAAP91dXX/AAAA/wAAAP8rKyv/VlZW/wAAAP8KCgr/ampq/wAAAP8A" +
    "AAD/QUFB////////////tra2/wAAAP8AAAD/KCgo/wAAAP8AAAD/SEhI/8/Pz/8CAgL/AAAA/yUl" +
    "Jf8AAAD/AAAA/xQUFP/+/v7//////+Pj4/8AAAD/AAAA/wAAAP8AAAD/AAAA/2ZmZv//////Tk5O" +
    "/wAAAP8AAAD/AAAA/wAAAP8AAAD/5eXl///////+/v7/EhIS/wAAAP8AAAD/AAAA/wAAAP+Dg4P/" +
    "/////8nJyf8AAAD/AAAA/wAAAP8AAAD/AAAA/7i4uP///////////z8/P/8AAAD/AAAA/wAAAP8A" +
    "AAD/oaGh////////////RkZG/wAAAP8AAAD/AAAA/wAAAP+Li4v///////////9sbGz/AAAA/wAA" +
    "AP8AAAD/AAAA/76+vv///////////8HBwf8AAAD/AAAA/wAAAP8AAAD/Z2dn////////////+vr6" +
    "//f39//39/f/9/f3//f39//8/Pz/////////////////9vb2//f39//39/f/9/f3//r6+v//////" +
    "////////////////////////////////////////////////////////////////////////////" +
    "////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
    "AAAAAAAAAAAAAA==", "base64");

app.use(function (req, res, next) {
    res.header({"server": "for_layui_dropdown_local_test"});
    next();
});

// 将example目录作为静态目录。
app.use("/example", express.static(path.join(__dirname, "../example/")));

// 将dist也加入，方便调试。
app.use("/dist", express.static(path.join(__dirname, "../src/")));

// favicon.ico
app.all("/favicon.ico", (req, res) => {
    res.header({"Content-Type": "image/x-icon"});
    res.end(favicon);
});

// 重定向
app.all("/", (req, res) => {res.redirect("/example/dropdown.html")});

// 走你..
app.listen(port, () => {
    console.log("服务已开启:http://127.0.0.1:" + port + "/");
});