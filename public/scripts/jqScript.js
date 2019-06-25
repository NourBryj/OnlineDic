


// We need this function if text is pasted arbitrarily.
  $(document).ready(function(e) {   
$.fn.getCursorPosition = function() {
    var input = this.get(0);
    if (!input) return; // No (input) element found
    if ('selectionStart' in input) {
        // Standard-compliant browsers
        return input.selectionStart;
    } else if (document.selection) {
        // IE
        input.focus();
        var sel = document.selection.createRange();
        var selLen = document.selection.createRange().text.length;
        sel.moveStart('character', -input.value.length);
        return sel.text.length - selLen;
    }
};
$("input[type=text]").focus(function() {
  $(this).select();
});
// This function will allow us to return to the proper cursor position after a paste.
$.fn.setCursorPosition = function(pos) {
  return this.each(function(index, elem) {
    if (elem.setSelectionRange) {
      elem.setSelectionRange(pos, pos);
    } else if (elem.createTextRange) {
      var range = elem.createTextRange();
      range.collapse(true);
      range.moveEnd('character', pos);
      range.moveStart('character', pos);
      range.select();
    }
  });
};

$('#nospace').bind('paste', function(event){
    event.preventDefault();
    var clipboardData = event.originalEvent.clipboardData.getData('text/plain');
    str = clipboardData.replace(/\s/g,'');
    var currentCursorPos = $(this).getCursorPosition();
    var output = [$(this).val().slice(0, currentCursorPos), str, $(this).val().slice(currentCursorPos)].join('');
    $(this).val(output);
    $(this).setCursorPosition(currentCursorPos + str.length);
}); 

$('#nospace').bind('keydown', function(event){
    return event.which !== 32;
});
$(window).scroll(function() {
  sessionStorage.scrollTop = $(this).scrollTop();
});

$(document).ready(function() {
  if (sessionStorage.scrollTop != "undefined") {
    $(window).scrollTop(sessionStorage.scrollTop);
  }
});
 });;