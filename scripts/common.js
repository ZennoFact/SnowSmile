// ウィンドウのリサイズ
$(window).resize(function() {
  W = innerWidth;
  H = innerHeight;
  canvas.width = W;
  canvas.height = H;

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
    $("body").css({
      "background-image": "url(" + bgImage + ")",
      "background-position": "center center",
      "background-repeat": "no-repeat",
      "background-attachment": "fixed",
      "background-size": "cover"
    });
    $('#video').addClass("noDisp");
  };

  // get imageFile
  fileReader.readAsDataURL(file);
});

$('.fileReader').click(function() {
  $("body").css({
    "background-image": "url(" + bgImage + ")",
    "background-position": "center center",
    "background-repeat": "no-repeat",
    "background-attachment": "fixed",
    "background-size": "cover"
  });
  $('#video').addClass("noDisp");
});

// 背景画像の読み込みがここでできたらいいな
$('h1').click(function() {

});


$('.video').click(function() {
  // 動画を取得
  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || window.navigator.mozGetUserMedia;
  window.URL = window.URL || window.webkitURL;

  var video = document.getElementById('video');
  var localStream = null;
  navigator.getUserMedia({
      video: true,
      audio: false
    },
    function(stream) { // for success case
      $("body").css({
        "background-image": "none"
      });
      video.src = window.URL.createObjectURL(stream);

      $('#video').toggleClass("noDisp");
    },
    function(err) { // for error case
      console.log(err);
    }
  );
});
