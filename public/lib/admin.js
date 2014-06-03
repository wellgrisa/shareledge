
$(document).ready(function() {
  $('a[data-confirm]').click(function(ev) {
    var href = $(this).attr('href');

    if (!$('#dataConfirmModal').length) {
      $('body').append('<div id="dataConfirmModal" class="modal fade">'+
                                 '   <div class="modal-dialog">'+
                                 '     <div class="modal-content">'+
                                 '       <div class="modal-header">'+
                                 '         <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>'+
                                 '         <h4 class="modal-title">Confirm</h4>'+
                                 '       </div>'+
                                 '       <div class="modal-body"></div>'+
                                 '       <div class="modal-footer">'+
                                 '        <button class="btn btn-default" data-dismiss="modal" aria-hidden="true">Cancel</button>'+
                                 '        <a class="btn btn-primary" id="dataConfirmOK">OK</a>'+
                                 '       </div>'+
                                 '     </div>'+
                                 '   </div>'+
                                 ' </div>');
    } 
    $('#dataConfirmModal').find('.modal-body').text($(this).attr('data-confirm'));
    $('#dataConfirmOK').attr('href', href);
    $('#dataConfirmModal').modal({show:true});
    return false;
  });

  $('form[data-confirm]').submit(function(ev) {
    if ($('#dataConfirmModal').is(':visible')) { return true; };

    var self = $(this);
    if (!$('#dataConfirmModal').length) {
      $('body').append('<div id="dataConfirmModal" class="modal fade">'+
                                 '   <div class="modal-dialog">'+
                                 '     <div class="modal-content">'+
                                 '       <div class="modal-header">'+
                                 '         <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>'+
                                 '         <h4 class="modal-title">Confirm</h4>'+
                                 '       </div>'+
                                 '       <div class="modal-body"></div>'+
                                 '       <div class="modal-footer">'+
                                 '        <button class="btn btn-default" data-dismiss="modal" aria-hidden="true">Cancel</button>'+
                                 '        <a class="btn btn-primary" id="dataConfirmOK">OK</a>'+
                                 '       </div>'+
                                 '     </div>'+
                                 '   </div>'+
                                 ' </div>');
    } 
    $('#dataConfirmModal').find('.modal-body').text($(this).attr('data-confirm'));
    $('#dataConfirmOK').click(function(){
        self.submit();
    });
    $('#dataConfirmModal').modal({show:true});
    return false;
  });

  $('#add-position').click(function(){
    var positionsStr = $('#positionsStr').val();
    var position = $('#position').val();
    var translate = $('#translate').is(':checked');
    var btnRemove = '<input type="button" class="remove-position" />';
    $('#positions tbody').append('<tr><td>'+position+'</td><td>'+translate+'</td><td>'+btnRemove+'</td></tr>');
    positionsStr += '%%' + position + '^' + translate;
    $('#position').val('');
    $('#translate').attr('checked', false);
    $('#positionsStr').val(positionsStr);
  });

  $('#positions').on('click', '.remove-position', function(){
    $(this).parents('tr').remove();
  });
});