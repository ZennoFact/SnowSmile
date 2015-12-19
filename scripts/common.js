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


// TODO: この辺の変数とか整理する(この下のクリックの操作は毎回入ってダサいとは思うが，何とかならんだろうか)
var bgImage;
// ファイル読み込み
$('.fileReader').change(function() {
  // 選択されたファイルがない場合は何もせずにreturn
  if (!this.files.length) {
    return;
  }

  // Only process image files.
  if (!this.files[0].type.match('image.*')) {
    return;
  }

  var file = this.files[0],
    fileReader = new FileReader();

  // callback
  fileReader.onload = function(event) {
    bgImage = event.target.result;
    // $("#canvas").css({
    //   "background-image": "url(" + bgImage + ")",
    //   "background-position": "center center",
    //   "background-repeat": "no-repeat",
    //   "background-attachment": "fixed",
    //   "background-size": "cover"
    // });
    // $('#video').addClass("noDisp");
    display = new createjs.Bitmap(bgImage);
  };

  // get imageFile
  fileReader.readAsDataURL(file);
});

$('.fileReader').click(function() {
  // $("body").css({
  //   "background-image": "url(" + bgImage + ")",
  //   "background-position": "center center",
  //   "background-repeat": "no-repeat",
  //   "background-attachment": "fixed",
  //   "background-size": "cover"
  // });
  // $('#video').addClass("noDisp");
});

// TODO: 個々の処理，addEventListenerにして，参加者に一行だけ書かせる
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
  // // 動画を取得
  // navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || window.navigator.mozGetUserMedia;
  // window.URL = window.URL || window.webkitURL;
  //
  // var video = document.getElementById('video');
  // var localStream = null;
  // navigator.getUserMedia({
  //     video: true,
  //     audio: false
  //   },
  //   function(stream) { // for success case
  //     $("body").css({
  //       "background-image": "none"
  //     });
  //     video.src = window.URL.createObjectURL(stream);
  //
  //     $('#video').toggleClass("noDisp");
  //   },
  //   function(err) { // for error case
  //     console.log(err);
  //   }
  // );
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
        image.scaleX = 1;
        image.scaleY = 1;
        image.x = W / 3;
        image.y = 250;
      },
      function(error) {
        console.log(error);
      }
    );
    videoFlg = false;
  }
});
