$(document).ready(function() {

  $('#question-link').on( "click", function() {
    $('.answer-panel').fadeIn('slow');
  });

  $('.parent .child a').on('click', function(e){
    e.preventDefault();
    window.location = $(this).attr('href') + '/' + $('#wondering').val();
  });

  $('#btn-ask').popover({
    html:true
  });

  // $('#user-avatar').popover({
  //   html : true,
  //   placement : 'bottom',
  //   title: function() {
  //     return "Test";
  //   },
  //   content: function() {
  //     return $("#popover-content").html();
  //   }
// });

});