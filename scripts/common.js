// ウィンドウのリサイズ
$(window).resize(function() {
  W = innerWidth;
  H = innerHeight;
  canvas.width = W;
  canvas.height = H;

  // TODO: リサイズすると描画が消える原因は？
  video.width = W;
  video.height = H;
});

// FileAPIが実行可能か調査
if (window.File && window.FileReader && window.FileList && window.Blob) {
  console.log("The File APIs are supported");
} else {
  console.log('The File APIs are not fully supported in this browser.');
}




var bgImage;
$('.fileReader').change(function() {
  // 選択されたファイルがない場合は何もせずにreturn
  if (!this.files.length) {
    return;
  }

  // Only process image files.
  if (!this.files[0].type.match('image.*')) {
    return;
  }
  var file = this.files[0];
  var fileName = file.name;
  console.log(fileName);
  var index = parseInt(fileName.substr(4, 1));
  // Step.SP2: 背景の差し替え
  display.image = backgroundList[index];
});


// Step.SP3: ビデオの起動
isStreaming = true;

var title = $('#title')[0];
var modeFlag = true;

function setModeChange() {
  title.addEventListener('click', clickTitle);
  title.addEventListener('mouseover', mouseoverTitle);
  title.addEventListener('mouseout', mouseoverTitle);
}

function clickTitle() {
  if (modeFlag) {
    $('.green').text('Snow Cristal:');
    modeFlag = false;
    imgMain = imgCristal;
    imgReverse = imgSnow;
  } else {
    $('.green').text('Falling Snow:');
    modeFlag = true;
    imgMain = imgSnow;
    imgReverse = imgCristal;
  }
}

function mouseoverTitle(event) {
  $('#title').css("opacity", (event.type == "mouseover") ? 0.8 : 1);
}



var image = new createjs.Bitmap(video);
var videoFlg = false;
$('.video').click(function() {
  if (isStreaming) {
    if (videoFlg) {
      stage.removeChild(image);
      videoFlg = false;
    } else {
      navigator.getMedia({
          video: true,
          audio: true
        },
        function(stream) {
          bgVideo.src = window.URL.createObjectURL(stream);


          // TODO: なぜかサイズがとれない
          stage.addChild(image);
          image.scaleX = -1;
          // image.scaleY = 1;
          image.width = W;
          image.x = W / 3 * 2;
          image.y = 280;
        },
        function(error) {
          console.log(error);
        }
      );
      videoFlg = true;
    }
  }
});

//soundInit();
//var file = "./assets/sounds/02AllIWantForChristmasIsYou.mp3";
//function soundInit() {
//    var loader = new createjs.LoadQueue(false);
//    loader.installPugin(createjs.Sound);
//    loader.addEventListener("fileload", soundLoaded);
//    loader.loadFile({src: file, id: "all"});
//}
//function soundLoaded(event) {
//    Sound.play(event.item["all"]);
//}

function soundLoad() {
  createjs.Sound.alternateExtensions = ["mp3"];
  createjs.Sound.on("fileload", this.loadHandler, this);
  createjs.Sound.registerSound("./assets/sounds/SilentNight.mp3", "sn");
  createjs.Sound.registerSound("./assets/sounds/JoyToTheWorld.mp3", "jw");
  createjs.Sound.registerSound("./assets/sounds/AllIWantForChristmasIsYou.mp3", "ac");
}
// var sounds = [];
function loadHandler(event) {
  if (event.id === "sn") {
    createjs.Sound.play("sn");
  }
  // This is fired for each sound that is registered.
  // var instance = createjs.Sound.play("sn"); // play using id.  Could also use full sourcepath or event.src.
  // instance.on("complete", soundHandleComplete, this);
  // instance.volume = 0.5;
  console.log(event.id);
}

// var sounds = [];
soundLoad();
