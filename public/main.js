window.onload = function () {
  superagent.get("/api/user_data")
    .end(function (err, res) {
      if (!!err) { console.log("error"); }
      document.getElementById("user-name").innerHTML = res.body.name;
      document.getElementById("user-screen_name").innerHTML = "@" + res.body.screen_name;
      document.getElementById("user-img").src = res.body.profile_image_url.replace(/_normal/g, "");

      // document.getElementById("loading").classList.add("clear");
    });

  superagent.get("/api/list")
    .retry(0)
    .timeout({ response: 3600000, deadline: 3600000 })
    .end(function (err, res) {
      document.getElementById("count").innerText = "取得件数: " + res.body.length + "件";
      res.body.forEach(function (user) {
        var container = document.createElement('div');
        var box = document.createElement('div');
        var boxf = document.createElement('div');
        var img = document.createElement('img');

        img.src = user.profile_image_url;
        boxf.innerHTML = user.name + ' by <a href="https://twitter.com/' + user.screen_name + '/">@' + user.screen_name + "</a> id:" + user.id;
        boxf.classList.add("box");
        boxf.classList.add("overflow-text");
        boxf.classList.add("text-float");
        box.appendChild(img);
        box.classList.add("box");

        container.classList.add("boxContainer")
        container.appendChild(box);
        container.appendChild(boxf);

        document.getElementById("text").appendChild(document.createElement('hr'));
        document.getElementById("text").appendChild(container);
      });
      $("#loading").fadeOut();
    });
};

function reload() {
  $("#loading").fadeIn();
  superagent.get("/api/reload").end(function (err, res) {
    document.getElementById("count").innerText = "取得件数: " + res.body.length + "件";
    res.body.forEach(function (user) {
      var container = document.createElement('div');
      var box = document.createElement('div');
      var boxf = document.createElement('div');
      var img = document.createElement('img');

      img.src = user.profile_image_url;
      boxf.innerHTML = user.name + ' by <a href="https://twitter.com/' + user.screen_name + '/">@' + user.screen_name + "</a> id:" + user.id;
      boxf.classList.add("box");
      boxf.classList.add("overflow-text");
      boxf.classList.add("text-float");
      box.appendChild(img);
      box.classList.add("box");

      container.classList.add("boxContainer")
      container.appendChild(box);
      container.appendChild(boxf);

      document.getElementById("text").appendChild(document.createElement('hr'));
      document.getElementById("text").appendChild(container);
    });
    $("#loading").fadeOut();
  });

}