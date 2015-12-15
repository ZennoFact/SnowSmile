(function() {
    window.requestAnimationFrame =
      window.requestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.msRequestAnimationFrame ||
      function(cb) {
        setTimeout(cb, 17);
      };

    var canvas,
      snowCanvas,
      stage,
      W,
      H,
      imgSnow,
      imgLandingSnow,
      snows = [],
      frameCount = 0,
      landingCount = 0,
      landingLine = 0;

    /*
     * common
     */
    function preload() {
      var queue = new createjs.LoadQueue(true);
      queue.setMaxConnections(2);
      var manifest = [
        {"id":"snow", "src":"./assets/snow.png"},
        {"id":"landing_snow", "src":"./assets/landing_snow.png"}
      ];
      queue.loadManifest(manifest,false);
      queue.load();
      queue.addEventListener("complete",handleComplete);
    }


    function handleComplete(event){
        var result = event.target._loadedResults;
        imgSnow = result["snow"];
        imgLandingSnow = result["landing_snow"];
        init();
    }

    function init() {
      canvas = $("#canvas")[0];
      snowCanvas = $("#snow_canvas");
      W = innerWidth;
      H = innerHeight;

      canvas.width = W;
      canvas.height = H;
      snowCanvas.width = W;
      video.width = W;
      video.height = H;

      stage = new createjs.Stage(canvas);
      // フレームレートと毎フレーム実行される関数をセット
      // createjs.Ticker.setFPS(60);
      // createjs.Ticker.addEventListener("tick", render);

      initSnows();

      // TODO: Step1 描画の開始
      render();
    }

    /*
     * snow effect
     */
    function initSnows() {
      var max = Math.floor(stage.canvas.width / 40);

      for (var i = 0, l = max; i < l; i++) {
        // TODO: この処理まとめれる（下にほぼ同じものが2つ）
        var size = Math.floor(stage.canvas.width / 1000 + Math.random() * 20);
        var data = createData(size);
        var snow = (new Snow(imgSnow)).create(false, data);
      }
    }

    function createData(size) {
      var data = {
        x: Math.random() * stage.canvas.width,
        y: 0 - size - Math.random() * 100,
        size: size
      };
      return data;
    }

    var Snow = function(imgSnow) {
      this.initialize(imgSnow);
    };
    var p = Snow.prototype = new createjs.Bitmap();
    Object.setPrototypeOf(Snow.prototype, createjs.Bitmap.prototype);

    Snow.prototype.create = function(isLanding, data) {
      // 雪の初期サイズの決定
      var size = data.size;
      var scale = size / imgSnow.width;

      this.width = size;
      this.height = size;
      this.scaleX = scale;
      this.scaleY = scale;
      this.x = data.x;
      this.y = data.y;

      //
      this.base_x = this.x;
      this.angle = 0;
      // 雪の振れ幅を決定
      this.vangle = (Math.random() - Math.random()) / size / 16;

      // 積もっているかどうか
      this.isLanding = isLanding;

      //　雪が降る速度
      this.vy = size * 0.05;
      //　雪が左右に舞う時の速度
      this.vx = size * 10;

      snows.push(this);
      stage.addChild(this);
    };

    Snow.prototype.update = function(i) {
      if (this.isLanding) {
        this.alpha -= 0.0015;

        // 雪が透明になったら削除する
        if (this.alpha <= 0) {
          // 地面に雪が積もるように処理
          landingCount++;
          // 雪が何個地面に振り落ちたら積もるかの設定
          if(landingCount % 10 === 0 && landingLine < canvas.height - 250) {
            landingLine++;
            $("#snow_canvas").css({
              'top': (canvas.height - landingLine) + 'px',
              'height': landingLine + 'px',
              // 'background': "-webkit-gradient(linear,left top,left bottom,from(rgba(255,255,255,0.7)), color-stop(" + ((1 - (landingLine / (canvas.width - 260))) / 10) + ", rgba(255,255,255,1.0)), to(rgba(255,255,255,08)))"
            });
          }
          snows.splice(i, 1);
          stage.removeChild(this);
        }
      } else {
        //
        this.angle += this.vangle;
        this.y += this.vy;
        this.x = this.base_x + this.vx * Math.sin(this.angle);

        // 着雪したかのチェック
        if (this.y >= stage.canvas.height - this.height / 2 - landingLine) {
          var data = createData(this.width);
          data.x = this.x;
          data.y = this.y;
          var snow = (new Snow(imgLandingSnow)).create(true, data);
          snows.splice(i, 1);
          stage.removeChild(this);
        }
      }
    };


  // 描画
  function render() {
    // TODO: この辺の処理なんとかならんかな
    frameCount++;
    //
    if (frameCount % 2 == 0) {
      var size = Math.floor(stage.canvas.width / 1000 + Math.random() * 20);
      var data = createData(size);
      var snow = (new Snow(imgSnow)).create(false, data);
    }

    snows.forEach(function(snow, i) {
      snow.update(i);
    });

    // CreateJSの更新
    stage.update();
    // requestanimationframeをつかって、ブラウザの更新のタイミングに実行する
    requestAnimationFrame(render);
  }

  preload();
})();
