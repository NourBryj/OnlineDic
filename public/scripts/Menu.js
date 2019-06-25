

function copyToClipboard(element) {
  var $temp = $("<input>");
  $("body").append($temp);
  $temp.val($(element).text()).select();
  document.execCommand("copy");
  $temp.remove();
}

function increaseFontSize(id, increaseFactor){
  
     txt = document.getElementById(id);
     style = window.getComputedStyle(txt, null).getPropertyValue('font-size');
     currentSize = parseFloat(style);
     txt.style.fontSize = (currentSize + increaseFactor) + 'px';
}

function getfocus(){
focustext= document.getElementById('dic');
focustext.focus();


}
