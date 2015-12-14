(function() {
  window.requestAnimationFrame =
  window.requestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.msRequestAnimationFrame ||
  function(cb) {
    setTimeout(cb, 17);
  };

  var CJS = createjs,
  canvas,
  stage,
  W,
  H,
  snowImg,
  snows = [],
  animationCount = 0,
  isSnowCreated = false;

  /*
   * common
   */
  function preload() {
    var preload = new CJS.LoadQueue(false);
    preload.loadFile({
      id: "snow",
      src: "./assets/snow.png"
    }, false);
    preload.load();
    preload.on("fileload", function(obj) {
      snowImg = obj.result;
    });
    preload.on("complete", init);
  }

  function init() {
    canvas = $("#canvas")[0];
    W = innerWidth;
    H = innerHeight;

    canvas.width = W;
    canvas.height = H;
    video.width = W;
    video.height = H;

    stage = new CJS.Stage(canvas);
    // CJS.Ticker.setFPS(60);
    // CJS.Ticker.addEventListener("tick", tick);
    // TODO: Step1 描画の開始
    render();

    snowInit();
  }


  // function tick() {
  //   if (isSnowCreated) snowUpdate();
  //   stage.update();
  // }



  /*
   * snow effect
   */
  function snowInit() {
    var max = Math.floor(stage.canvas.width / 40);
    var snows = [];
    var createFrameNum = 4;
    var createCount = 0;

    for (var i = 0, l = max; i < l; i++) {
      snowCreate();
    }
    isSnowCreated = true;
  }

  function snowCreate() {
    var bmp = new CJS.Bitmap(snowImg)
    // 雪の初期サイズの決定
    var size = Math.floor(stage.canvas.width / 1000 + Math.random() * 20);
    var scale = size / snowImg.width;

    bmp.width = size;
    bmp.height = size;
    bmp.scaleX = scale;
    bmp.scaleY = scale;
    bmp.x = Math.random() * stage.canvas.width;
    bmp.y = 0 - size - Math.random() * 100;

    //
    bmp.base_x = bmp.x;
    bmp.angle = 0;
    // 雪の振れ幅を決定
    bmp.vangle = (Math.random() - Math.random()) / size / 16;

    //
    bmp.isLanding = false;

    //
    bmp.vy = size * 0.05;
    //
    bmp.vx = size * 10;

    snows.push(bmp);
    stage.addChild(bmp);
  }

  function snowUpdate() {
    animationCount++;
    //
    if (animationCount % 2 == 0) {
      snowCreate();
    }

    //
    for (var i = 0; i < snows.length; i++) {
      var snow = snows[i];

      //
      if (snow.isLanding) {
        snow.alpha -= 0.0015;
        // remove
        if (snow.alpha <= 0) {
          snows.splice(i, 1);
          stage.removeChild(snow);
          i--;
        }
        continue;
      } else {
        //
        snow.angle += snow.vangle;
        snow.y += snow.vy;
        snow.x = snow.base_x + snow.vx * Math.sin(snow.angle);
      }

      // hitTest
      if (snow.y >= stage.canvas.height - snow.width) {
        snow.isLanding = true;
      }

    }

  };

  // 描画
  function render() {
    if (isSnowCreated) snowUpdate();
    // CreateJSの更新
    stage.update();
    // requestanimationframeをつかって、ブラウザの更新のタイミングに実行する
    requestAnimationFrame( render );
  }



  preload();
})();
