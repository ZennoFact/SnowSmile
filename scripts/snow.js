// (function() {
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
      snowStage,
      // TODO: ほんとは必要ない変数
      fakeDiv,
      W,
      H,
      imgSnow,
      imgLandingSnow,
      imgCristal,
      imgMain,
      imgReverse,
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
        {"id":"landing_snow", "src":"./assets/landing_snow.png"},
        {"id":"cristal", "src":"./assets/cristal.png"}
      ];
      queue.loadManifest(manifest,false);
      queue.load();
      queue.addEventListener("complete",handleComplete);
    }


    function handleComplete(event){
        var result = event.target._loadedResults;
        imgSnow = result["snow"];
        imgLandingSnow = result["landing_snow"];
        imgCristal = result["cristal"];
        imgMain = imgSnow;
        imgReverse = imgCristal;
        init();
    }

    function init() {
      canvas = $("#canvas")[0];
      snowCanvas = $("#snow_canvas")[0];
      fakeDiv = $("#fake_div")[0];
      W = innerWidth;
      H = innerHeight;

      canvas.width = W;
      canvas.height = H;
      snowCanvas.width = W;
      snowCanvas.height = H - 250;
      video.width = W;
      video.height = H;

      // TODO: 消したい
      $("#fake_div").css('top', canvas.height);


      // 雪の積もった後には絵が描ける
      stage = new createjs.Stage(canvas);

      snowStage = new createjs.Stage(snowCanvas);
      snowStage.autoClear = false;
      snowStage.enableDOMEvents(true);
      createjs.Touch.enable(snowStage);
      drawingCanvas = new createjs.Shape();

      snowStage.addEventListener("stagemousedown", handleMouseDown);
      snowStage.addEventListener("stagemouseup", handleMouseUp);

      snowStage.addChild(drawingCanvas);
      snowStage.update();

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
      this.regX = size / 2;
      this.regY = size / 2;

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

      this.addEventListener( 'click', this.clicked );

      // TODO: この辺，実習作業に入れる
      // hitareaの拡張
      var hitAreaShape = new createjs.Shape();
      hitAreaShape.x = size / 2 - 80;
      hitAreaShape.y = size / 2 - 80;
      hitAreaShape.graphics.beginFill("#000000").drawEllipse(0,0,160,160);
      this.hitArea = hitAreaShape;

      this.imgMain = imgMain;
      this.imgReverse = imgReverse;

      snows.push(this);
      stage.addChild(this);
    };

    Snow.prototype.clicked = function (e) {
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
          landingCount++;
          // 雪が何個地面に振り落ちたら積もるかの設定
          if(landingCount % 1 === 0 && landingLine < canvas.height - 250) {
            landingLine++;


            // TODO: ここ，本来ならいらないはずのとこ。無理やり感
            $("#fake_div").css({
              'top': (canvas.height - landingLine) + 'px',
              'height': landingLine + 'px'
              // TODO: 境界線をきれいに見せるための方法は？
              //
              // 'background': "-webkit-gradient(linear,left top,left bottom,from(rgba(255,255,255,0.7)), color-stop(" + ((1 - (landingLine / (canvas.width - 260))) / 10) + ", rgba(255,255,255,1.0)), to(rgba(255,255,255,08)))"
            });




          }
          else {
            $('#snow_canvas').removeClass('noDisp');
            $('#fake_div').addClass('noDisp');
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
  function handleMouseDown(event) {
    oldPt = new createjs.Point(snowStage.mouseX + imgCristal.width / 2, snowStage.mouseY + imgCristal.height / 2);
    oldMidPt = oldPt;
    snowStage.addEventListener("stagemousemove" , handleMouseMove);
  }

  function handleMouseMove(event) {
    var midPt = new createjs.Point(oldPt.x + snowStage.mouseX  + imgCristal.width / 2 >> 1, oldPt.y + snowStage.mouseY + imgCristal.height / 2 >> 1);

    drawingCanvas.graphics.clear().setStrokeStyle(10, 'round', 'round').beginStroke('#70A8DA').moveTo(midPt.x, midPt.y).curveTo(oldPt.x, oldPt.y, oldMidPt.x, oldMidPt.y);

    oldPt.x = snowStage.mouseX;
    oldPt.y = snowStage.mouseY;
    oldMidPt.x = midPt.x;
    oldMidPt.y = midPt.y;

    snowStage.update();
  }

  function handleMouseUp(event) {
    snowStage.removeEventListener("stagemousemove" , handleMouseMove);
  }

  preload();
// })();
