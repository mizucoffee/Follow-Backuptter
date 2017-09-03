var length = 0;
var nowPages = 1;
var pages = 0;
var loadedPages = 0;

window.onload = function () {
  superagent.get("/api/user-data")
    .end(function (err, res) {
      if (!!err) { console.log("error"); }
      document.getElementById("user-name").innerHTML = res.body.name;
      document.getElementById("user-screen_name").innerHTML = "@" + res.body.screen_name;
      document.getElementById("user-img").src = res.body.profile_image_url.replace(/_normal/g, "");
      document.getElementById("follow-count").innerText = "フォロー数: " + res.body.friends_count + "件";
      length = res.body.friends_count;
      pages = Math.ceil(length / 100);
      // document.getElementById("loading").classList.add("clear");
    });

  superagent.get("/api/load").end(null);
  load(0);
  superagent.get("/api/get-length").end(loadcheck);
};

function next() {
  if (nowPages >= pages) { alert("これ以上ありません"); return; }
  $("#loading").fadeIn();
  load(++nowPages - 1);
  document.getElementById("top-h2").innerText = "▼あなたがフォローしている人たち Page:" + nowPages;
  document.getElementById("bottom-h2").innerText = "▲あなたがフォローしている人たち Page:" + nowPages;
}

function back() {
  if (nowPages <= 0) { alert("これ以上ありません"); return; }
  $("#loading").fadeIn();
  load(--nowPages - 1);
  document.getElementById("top-h2").innerText = "▼あなたがフォローしている人たち Page:" + nowPages;
  document.getElementById("bottom-h2").innerText = "▲あなたがフォローしている人たち Page:" + nowPages;
}

function nextb() {
  if (nowPages >= pages) { alert("これ以上ありません"); return; }
  $("#loading").fadeIn();
  load(++nowPages - 1);
  document.getElementById("top-h2").innerText = "▼あなたがフォローしている人たち Page:" + nowPages;
  document.getElementById("bottom-h2").innerText = "▲あなたがフォローしている人たち Page:" + nowPages;
  location.hash = ""; location.hash = "top";
}

function backb() {
  if (nowPages <= 0) { alert("これ以上ありません"); return; }
  $("#loading").fadeIn();
  load(--nowPages - 1);
  document.getElementById("top-h2").innerText = "▼あなたがフォローしている人たち Page:" + nowPages;
  document.getElementById("bottom-h2").innerText = "▲あなたがフォローしている人たち Page:" + nowPages;
  location.hash = ""; location.hash = "top";
}

function loadcheck(err, res) {
  if (err || res.body.length != length) {
    setTimeout(() => {
      superagent.get("/api/get-length").end(loadcheck);
    }, 1000);
  }
  if (!err) {
    document.getElementById("get-count").innerText = "　取得件数: " + res.body.length + "件";
    loadedPages = res.body.pages;
    console.log("pages:" + loadedPages);
  }
};

function load(page) {
  var process = function (err, res) {
    if (err) {
      setTimeout(() => {
        superagent.get("/api/list?page=" + page).end(process);
      }, 1000);
      return;
    }
    document.getElementById("text").innerText = "";
    res.body.forEach(function (user) {
      var container = document.createElement('div');
      var boxf = document.createElement('div');
      var img = document.createElement('img');

      img.src = user.profile_image_url;
      boxf.innerHTML = user.name + ' by <a href="https://twitter.com/' + user.screen_name + '/">@' + user.screen_name + "</a> id:" + user.id;
      boxf.classList.add("overflow-text");
      boxf.classList.add("text-float");

      container.classList.add("boxContainer")
      container.appendChild(img);
      container.appendChild(boxf);

      document.getElementById("text").appendChild(document.createElement('hr'));
      document.getElementById("text").appendChild(container);

      $("#loading").fadeOut();
    });
  };
  superagent.get("/api/list?page=" + page).end(process);
}

function reload() {
  $("#loading").fadeIn();
  superagent.get("/api/load?force=true").end(function (err, res) {
    superagent.get("/api/get-length").end(loadcheck);
  });
  load(0);
}

function csv() {
  $("#loading").fadeIn();
  superagent.get("/api/csv")
    .end(function (err, res) {
      if (err) { alert("取得が終了していません。"); $("#loading").fadeOut(); return; }
      var data = "data:text/csv;charset=utf-8,\u{feff}" + res.text;
      if ( ~navigator.userAgent.indexOf("Windows") ) {
        data = data.replace(/\n/g, "\r\n").replace(/\r\r/g, "\r")
      }

      console.log(res.text);

      var link = document.createElement("a");
      link.setAttribute("href", encodeURI(data));
      link.setAttribute("download", "follow_list.csv");
      link.click();
      
      $("#loading").fadeOut();
    });
}