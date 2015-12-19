// CreateJSでは本来tickを使用するけれど，今回は自分で実装
window.requestAnimationFrame =
  window.requestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.msRequestAnimationFrame ||
  function(cb) {
    setTimeout(cb, 17);
  };
// 今回はchrome限定での使用を考えて作成したけれど，本来Webカメラのキャプチャを使用したい場合はこういった記述が必要
navigator.getMedia = ( navigator.getUserMedia ||
                          navigator.webkitGetUserMedia ||
                          navigator.mozGetUserMedia ||
                          navigator.msGetUserMedia );

// 事前に画像ファイルを読み込むよ
preload();

/*
 * プログラムに使用するパラメータ類の設定。
 * データには名前を付けなきゃなんの名前か分からないよね？
 * ここでは，データの入れ物に名前を付けています。目印は，「var」
 */
var canvas, // 画面にものを表示する部分。絵を描くときにキャンバスを使用するでしょ？そのキャンバス
  stage, // CreateJS独自のもの。ものを設置するのは舞台。だから舞台上に部品を置いておきます
  display, // 舞台上に映像を投影するディスプレイを設置。テレビのモニターって言ってもいいもの
  snowMask, // 顔に付ける仮面は英語でMask。覆い隠すもの。雪を表現するためにdisplayに被せます
  mouseMoveMask, // snowMaskと同じく，displayに被せます。これは，マウスの軌跡を記録するよ
  // TODO: ↓これ，使い道を模索中。マスク同士の結合ができない限り出番はない
  skyMask, //　アルファマスクは本来切り出すために存在します。空を空として表示するために被せるマスク。
  W, // ブラウザの横幅を保持するためのもの
  H, // ブラウザの高さを保持します
  imgSnow, // 雪の画像データをここに入れて管理します。imgはimageの省略形
  imgLandingSnow, // 地面に触れたときの雪は潰れて大地を覆います。潰れた雪の塊の画像データを管理
  imgCristal, // 雪の結晶の画像データを管理
  imgMain, // 今回は雪モードと雪の結晶モードの二つのモードがあります。現在のモードにふさわしい画像データを管理
  imgReverse, // 現在のモードと異なるものを管理。モードが変わればimgSnowの中身と入れ替えます
  icon, // 雪の結晶のアイコンを管理するためのもの
  snows = [], // ホワイトクリスマスを再現するために，画面に降る雪を降らせます。その雪たちをまとめて管理するためのもの
  snowAngles = {
    0: -2,
    1: -1,
    2: 1,
    3: 2
  }, // 雪の回転角を決定するときに使用します
  frameCount = 0, // 時間を数えるための単位の一つにフレームという概念があります。このプログラムが始まってからどれくらいの時間が経過したのかを計測します
  landingCount = 0, // 地面に降り注いだ雪の数を計測します
  landingLine = 0, // 現在の空と積もった雪の境界線の高さを管理します
  isEditable = false, // 現在の雪が編集可能かを管理します。お楽しみに
  bgVideo, // Webカメラから取得した映像を管理します
  backgroundList = []; // 背景画像の一覧を取得するよ。

// TODO: filters test
var filtersList = [];

function startApp() {
  // Step.1 描画の開始
  render();
}

// Step.5: タイトルの文字に対して，まとめて処理を行う操作（定義はcommon.js参照）
setModeChange();
/*
 * Snow Effect
 */
function initSnows() {
  var max = Math.floor(canvas.width / 40);

  // Step.2-1#2-1: コメントの解除によってループを実行
  for (var i = 0, l = max; i < l; i++) {
    var size = Math.floor(canvas.width / 1000 + Math.random() * 20);
    var data = createData(size);
    // Step.2-1#1: 雪の生成
    var snow = (new Snow(imgMain)).create(false, data);
  // Step.2-1#2-2: コメントの解除によってループを実行
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
  this.regX = size / 2;
  this.regY = size / 2;
  this.rotation = 0;
  this.rAngle = snowAngles[parseInt(Math.random() * 4)];

  this.base_x = this.x;
  this.angle = 0;
  // 雪の振れ幅を決定
  this.vangle = (Math.random() - Math.random()) / size / 16;
  //　雪が降る速度
  this.vy = size * 0.05;
  //　雪が左右に舞う時の速度
  this.vx = size * 10;

  // 積もっているかどうか
  this.isLanding = isLanding;
  if (!isLanding) {
    // Step.4: 空中を舞っている間は，雪をクリック可能
    this.addEventListener('click', this.clicked);
  }

  // TODO: この辺，実習作業に入れる?
  // hitareaの拡張
  this.hitArea = createHitArea(size);

  this.imgMain = imgSnow;
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
Snow.prototype.rotate = function() {
  this.rotation += this.rAngle;
}
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
          // Step.3: 雪がどこまで積もったかの位置を変更します。画面の下(bottom)から何px(ピクセル)の高さまで積もったかを設定。
          landingLine++;

          // マスクの変更 境界線を美しく出すためにはどうしたらいい？
          var snowMask = new createjs.Shape();
          snowMask.graphics.beginFill("#ffffff").drawRect(0, 0, canvas.width, 250);
          snowMask.graphics.beginFill("#ffffff").drawRect(0, 0, canvas.width, canvas.height - landingLine);
          snowMask.cache(0, 0, canvas.width, canvas.height);
          snowMask.updateCache();
          display.filters = [
            new createjs.AlphaMaskFilter(snowMask.cacheCanvas)
          ];

          display.cache(0, 0, canvas.width, canvas.height);

          if(landingLine === canvas.height - 250) {
            isEditable = true;
            // 舞台上でマウスのボタンを押し込んだ時に呼び出す命令を設定するよ。「押した」と「離した」を設定

            // Step.SP1: マル秘機能の搭載
            specialFunc();
          }
        }
      }
      snows.splice(i, 1);
      stage.removeChild(this);
    }
  } else {
    this.rotate();
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
  // Step.2-2: 時間経過とともに，雪を降らせる
  frameCount++;
  //
  if (frameCount % 2 == 1) {
    // TODO: この処理まとめれるけど，まとめると模擬授業での画面移動が多すぎて断念
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

  mouseMoveMask.graphics.setStrokeStyle(30, 'round', 'round').beginStroke('#70A8DA').moveTo(midPt.x, midPt.y).curveTo(oldPt.x, oldPt.y, oldMidPt.x, oldMidPt.y);

  // TODO: マスクの合成実験
  // var tempShape = new createjs.Shape();
  // tempShape = snowMask;
  // mouseMoveMask.graphics.beginFill("#ffffff").draw(tempShape);

  mouseMoveMask.cache(0, 0, canvas.width, canvas.height);
  display.filters = [
    new createjs.AlphaMaskFilter(mouseMoveMask.cacheCanvas)
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

function specialFunc() {
  stage.addEventListener("stagemouseup", handleMouseUp);
  stage.addEventListener("stagemousedown", handleMouseDown);
  $("#canvas").addClass("editable");
}

// hitAreaの作成
function createHitArea(size) {
  var hitAreaShape = new createjs.Shape();
  hitAreaShape.x = size / 2 - 80;
  hitAreaShape.y = size / 2 - 80;
  hitAreaShape.graphics.beginFill("#000000").drawEllipse(0, 0, 160, 160);
}

// プログラム内で読み込む画像データなどをここで手元に置いておくことにします。「あらかじめ」やることをまとめるよ命令です
function preload() {
  var queue = new createjs.LoadQueue(false);
  queue.setMaxConnections(2);
  // どの画像をどんな名前で管理するかを決定するよ。「id」は「識別子」，誰ともかぶることのない，独自の番号（名前）。「src」は「source（源）」の略
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
      "id": "town0",
      "src": "./assets/images/town0.jpg"
    }, {
      "id": "town1",
      "src": "./assets/images/town1.jpg"
    }, {
      "id": "town2",
      "src": "./assets/images/town2.jpg"
    }, {
      "id": "town3",
      "src": "./assets/images/town3.jpg"
    }, {
      "id": "town4",
      "src": "./assets/images/town4.jpg"
    }, {
      "id": "town5",
      "src": "./assets/images/town5.jpg"
    }, {
      "id": "town6",
      "src": "./assets/images/town6.jpg"
    }, {
      "id": "town7",
      "src": "./assets/images/town7.jpg"
    }
    //, {"id":"cristal", "src":"./assets/cristal.svg"}
  ];
  // 指定したリスト（マニフェスト）に従って画像を読み込むよー
  queue.loadManifest(manifest, false);
  queue.load();
  // 読み込みが完了したら「handleComplete」って命令を起動するよ
  queue.addEventListener("complete", handleComplete);

}

// 読み込みが完了したよ，万歳。取得した情報は「event」という名前で取得することにします
function handleComplete(event) {
  // 読み込み完了に伴い，その結果を保存します
  var result = event.target._loadedResults;
  // 決めてあった箱に画像データを入れていくよ。
  // プログラムで「=」は，左辺のものに右辺のものを入れます意味です。イコールじゃないから要注意
  imgSnow = result["snow"];
  imgLandingSnow = result["landing_snow"];
  imgCristal = result["cristal"];
  imgMain = imgSnow;
  imgReverse = imgCristal;
  for(var i = 0; i < 8; i++) {
    backgroundList[i] = result["town" + i];
  }

  // よし，事前情報は集まった。いざ，このプログラムの初期化を初期化するよ
  init();
}

// 初期化（initialize）するための命令です。必要な情報を箱に詰め込んでいきます
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

  // さあ，いよいよ僕らの舞台を作成するよ。「canvas」を使って舞台を作って保存！
  stage = new createjs.Stage(canvas);

  // 舞台に被せるための「マスク」を作っておきましょう
  mouseMoveMask = new createjs.Shape();
  mouseMoveMask.graphics.drawRect(0, 0, canvas.width, canvas.height);
  mouseMoveMask.graphics.beginFill("#ffffff").drawRect(0, 0, canvas.width, 250);

  snowMask = new createjs.Shape();
  snowMask.graphics.beginFill("#ffffff").drawRect(0, 0, canvas.width, 250);
  snowMask.graphics.beginFill("#ffffff").drawRect(0, 250, canvas.width, canvas.height - 250);
  snowMask.cache(0, 0, canvas.width, canvas.height);
  filtersList.push(snowMask);
  filtersList.push(skyMask);


  // 「舞台」の中にものを映し出す「画面」に画像を設定します（0~6で設定しておくつもり）
  display = new createjs.Bitmap(backgroundList[2]);
  // 「画面」にマスクをくっつけます
  display.filters = [
    new createjs.AlphaMaskFilter(snowMask.cacheCanvas)
  ];
  display.cache(0, 0, canvas.width, canvas.height);
  stage.enableDOMEvents(true);
  // 今回の「舞台」を「タッチ（クリック）」「可能」にします
  createjs.Touch.enable(stage);

  // 舞台に画面を「備品として追加」するよ
  stage.addChild(display);

  // TODO: 音楽再生に関することを盛り込みたい

  // 雪の生成をします
  initSnows();

  startApp();
}
