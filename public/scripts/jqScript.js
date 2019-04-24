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

 });
 ;(function($){
  
  /**
   * Store scroll position for and set it after reload
   *
   * @return {boolean} [loacalStorage is available]
   */
  $.fn.scrollPosReaload = function(){
      if (localStorage) {
          var posReader = localStorage["posStorage"];
          if (posReader) {
              $(window).scrollTop(posReader);
              localStorage.removeItem("posStorage");
          }
          $(this).click(function(e) {
              localStorage["posStorage"] = $(window).scrollTop();
          });

          return true;
      }

      return false;
  }
  
  /* ================================================== */

  $(document).ready(function() {
      // Feel free to set it for any element who trigger the reload
      $('select').scrollPosReaload();
  });

}(jQuery));  

 $("inputbtn").on('click', function(event) {
  $( document ).ready(function() {
    // Add smooth scrolling to all links
 

    // Make sure this.hash has a value before overriding default behavior
    if (this.hash !== "") {
      // Prevent default anchor click behavior
      event.preventDefault();

      // Store hash
      var hash = this.hash;

      // Using jQuery's animate() method to add smooth page scroll
      // The optional number (800) specifies the number of milliseconds it takes to scroll to the specified area
      $('html, body').animate({
        scrollTop: $(hash).offset().top
      }, 800, function(){
   
        // Add hash (#) to URL when done scrolling (default click behavior)
        window.location.hash = hash;
      });
    } // End if
  });

  
  
});