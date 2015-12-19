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


// タイトルをアニメーション表示をしてみる
// $(function(){
//   var text = $("#title").text();
//   $("#title").empty().show(); // いったん殻にして表示
//   var array = text.split("");
//   var elements = [];
//
//   array.forEach(function (item, i) {
//     elements[i] = $("<span>" + array[i] + "</span>");
//     $("#title").append(elements[i]);
//   });
//   elements.forEach(function (item, i) {
//     elements[i]
//             .delay(40 * i)
//             .queue(function () {
//               if(i < 13) {
//                 $(this).addClass("motion green");
//               } else {
//                 $(this).addClass("motion red");
//               }
//             });
//   });
// });
