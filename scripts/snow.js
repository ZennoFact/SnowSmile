window.requestAnimationFrame =
  window.requestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.msRequestAnimationFrame ||
  function(cb) {
    setTimeout(cb, 17);
  };
navigator.getMedia = ( navigator.getUserMedia ||
                          navigator.webkitGetUserMedia ||
                          navigator.mozGetUserMedia ||
                          navigator.msGetUserMedia );
var canvas,
  stage,
  display,
  maskSnow,
  maskTrack,
  maskSky,
  isEditable = false,
  W,
  H,
  imgSnow,
  imgLandingSnow,
  imgCristal,
  imgMain,
  imgReverse,
  icon,
  snows = [],
  frameCount = 0,
  landingCount = 0,
  landingLine = 0,
  bgVideo,
  backgroundList = {};

/*
 * common
 */
function preload() {
  var queue = new createjs.LoadQueue(true);
  queue.setMaxConnections(2);
  var manifest = [{
      "id": "snow",
      "src": "./assets/snow.png"
    }, {
      "id": "landing_snow",
      "src": "./assets/landing_snow.png"
    }, {
      // どっち使ったらいいのかを決めなきゃね
      "id": "cristal",
      "src": "./assets/cristal.png"
    }, {
      "id": "default",
      "src": "./assets/images/default.jpg"
    }, {
      "id": "town6",
      "src": "./assets/images/town6.jpg"
    }
    // {"id":"cristal", "src":"./assets/cristal.svg"}
  ];

  queue.loadManifest(manifest, false);
  queue.load();
  queue.addEventListener("complete", handleComplete);

}


function handleComplete(event) {
  var result = event.target._loadedResults;
  imgSnow = result["snow"];
  imgLandingSnow = result["landing_snow"];
  imgCristal = result["cristal"];
  imgMain = imgSnow;
  imgReverse = imgCristal;
  backgroundList[0] = result["default"];
  backgroundList[6] = result["town" + 6];

  init();
}

function init() {
  canvas = $("#canvas")[0];
  W = innerWidth;
  H = innerHeight;

  canvas.width = W;
  canvas.height = H;
  video.width = W;
  video.height = H;
  bgVideo = document.getElementById( 'video' );
  bgVideo.width = W;
  bgVideo.height = H;


  // 雪の積もった後には絵が描ける
  stage = new createjs.Stage(canvas);


  // TODO: filterの処理を開始
  maskTrack = new createjs.Shape();
  maskTrack.graphics.drawRect(0, 0, canvas.width, canvas.height);
  maskTrack.graphics.beginFill("#ffffff").drawRect(0, 0, canvas.width, 250);

  maskSnow = new createjs.Shape();
  maskSnow.graphics.beginFill("#ffffff").drawRect(0, 0, canvas.width, 250);
  maskSnow.graphics.beginFill("#ffffff").drawRect(0, 250, canvas.width, canvas.height - 250);
  // maskSnow.graphics.beginFill("#ffffff").drawRect(0, 0, canvas.width, canvas.height);
  maskSnow.cache(0, 0, canvas.width, canvas.height);

  // 表示するべき背景の生成
  display = new createjs.Bitmap(backgroundList[6]);

  display.filters = [
    new createjs.AlphaMaskFilter(maskSnow.cacheCanvas)
  ];

  display.cache(0, 0, canvas.width, canvas.height);


  // これ，同じ画面でするなら使えない気がする
  // stage.autoClear = false;

  stage.enableDOMEvents(true);
  createjs.Touch.enable(stage);

  // drawingCanvas = new createjs.Shape();

  stage.addEventListener("stagemousedown", handleMouseDown);
  stage.addEventListener("stagemouseup", handleMouseUp);
  // stage.addEventListener("stagemousedown", startWipe);
  // stage.addEventListener("stagemouseup", stopWipe);

  // TODO: Maskの実験中
  stage.addChild(display);
  console.log(stage);

  // // お絵かきの実験中
  // stage.addChild(drawingCanvas);

  // TODO: オーディオファイルを登録


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
    var snow = (new Snow(imgMain));
    snow.create(false, data);
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

Snow.prototype = new createjs.Bitmap();
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
  // this.regX = size / 2;
  // this.regY = size / 2;

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

  if (!isLanding) {
    this.addEventListener('click', this.clicked);
  }

  // TODO: この辺，実習作業に入れる
  // hitareaの拡張
  var hitAreaShape = new createjs.Shape();
  hitAreaShape.x = size / 2 - 80;
  hitAreaShape.y = size / 2 - 80;
  hitAreaShape.graphics.beginFill("#000000").drawEllipse(0, 0, 160, 160);
  this.hitArea = hitAreaShape;

  this.imgMain = imgMain;
  this.imgReverse = imgReverse;

  snows.push(this);
  // addChildAt(child, index)では，マスクがかかっているところしか表示してくれなくなるので不可
  stage.addChild(this);
};

Snow.prototype.clicked = function(e) {
  // TODO: 音を出す処理
  // createjs.Sound.play("bell");
  e.target.image = new createjs.Bitmap(e.target.imgReverse).image;
  var tmp = e.target.imgReverse;
  e.target.imgReverse = e.target.imgMain;
  e.target.imgMain = tmp;
};

Snow.prototype.update = function(i) {
  if (this.isLanding) {
    this.alpha -= 0.0015;

    // 雪が透明になったら削除する
    if (this.alpha <= 0) {

      // 地面に雪が積もるように処理
      if(!isEditable) {
        landingCount++;

        // 雪が何個地面に振り落ちたら積もるかの設定
        // TODO: ここの設定を最適化
        if (landingCount % 1 === 0 && landingLine < canvas.height) {
          // TODO:
          landingLine++;
          console.log(landingLine);
          // landingLine = canvas.height - 250;

          // マスクの変更 境界線を美しく出すためにはどうしたらいい？
          var maskSnow = new createjs.Shape();
          maskSnow.graphics.beginFill("#ffffff").drawRect(0, 0, canvas.width, 250);
          maskSnow.graphics.beginFill("#ffffff").drawRect(0, 0, canvas.width, canvas.height - landingLine);
          maskSnow.cache(0, 0, canvas.width, canvas.height);
          maskSnow.updateCache();
          display.filters = [
            new createjs.AlphaMaskFilter(maskSnow.cacheCanvas)
          ];
          // TODO: どっちが正しいんだ？
          display.cache(0, 0, canvas.width, canvas.height);
          // display.updateCache();

          if(landingLine === canvas.height - 250) {
            isEditable = true;
          }
        }
      }
      snows.splice(i, 1);
      stage.removeChild(this);
    }
  } else {
    this.rotation++;
    //
    this.angle += this.vangle;
    this.y += this.vy;
    this.x = this.base_x + this.vx * Math.sin(this.angle);

    // 着雪したかのチェック
    if (this.y >= canvas.height - this.height / 2) {
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
    var snow = (new Snow(imgMain)).create(false, data);
  }

  snows.forEach(function(snow, i) {
    snow.update(i);
  });

  // CreateJSの更新
  stage.update();
  // requestanimationframeをつかって、ブラウザの更新のタイミングに実行する
  requestAnimationFrame(render);
}

// お絵かき用のスペース
var radius = 12;
function handleMouseDown(event) {
  console.log("MouseDown");
  oldPt = new createjs.Point(stage.mouseX , stage.mouseY );
  oldMidPt = oldPt;

  if(isEditable) {
    stage.addEventListener("stagemousemove", handleMouseMove);  
  }
}

function handleMouseMove(event) {
  console.log("MouseMove");

  var midPt = new createjs.Point(oldPt.x + stage.mouseX >> 1, oldPt.y + stage.mouseY >> 1);

  maskTrack.graphics.setStrokeStyle(30, 'round', 'round').beginStroke('#70A8DA').moveTo(midPt.x, midPt.y).curveTo(oldPt.x, oldPt.y, oldMidPt.x, oldMidPt.y);

  // TODO: マスクの合成実験
  // var tempShape = new createjs.Shape();
  // tempShape = maskSnow;
  // maskTrack.graphics.beginFill("#ffffff").draw(tempShape);

  maskTrack.cache(0, 0, canvas.width, canvas.height);
  display.filters = [
    new createjs.AlphaMaskFilter(maskTrack.cacheCanvas)
  ];
  // display.updateCache();
  display.cache(0, 0, canvas.width, canvas.height);

  oldPt.x = stage.mouseX;
  oldPt.y = stage.mouseY;
  oldMidPt.x = midPt.x;
  oldMidPt.y = midPt.y;

  stage.update();
}

function handleMouseUp(event) {
  console.log("MouseUp");
  stage.removeEventListener("stagemousemove", handleMouseMove);
}

preload();
