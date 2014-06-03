$(function(){
  /*scrollspy*/
  $('#sidebar,#navbar,#mobile-nav-menu').bind('click', 'ul li a', function(event) {
    $.scrollTo(event.target.hash, 250);
  });
  $('#mobile-nav-ul li a').click(function(event) {
    $.scrollTo(event.target.hash, 250);
  });

  /* Form Curriculum
  =============================*/
  $("#send-curriculum-form").validate({
    messages: {
      'nome_para' : $('#applicant-name').data('required'),
      'email' : {
        required : $('#applicant-email').data('required'),
        email : $('#applicant-email').data('invalid')
      },
      'apresentacao' : $('#application-introduce').data('required'),
      'application_custom_position' : $('#application-custom-position').data('required'),
      'linkedin' : {
        url : $('#linkedin').data('invalid')
      },
      'arquivo' : $('#application-file').data('required')
    }
  });

  $('#application-positions').change(function() {
    if ($(this).val() === $(this).data('optional')) {
      $('#application-custom-position').prop('required', true).parent().removeClass('hidden');
    } else {
      $('#application-custom-position').prop('required', false).parent().addClass('hidden');
    };
  });

  // Build Employees Carousel
  employeeCarousel();
  jobCarousel();


  // Popup
  // Get older version of this repo in order to see popup example.

});

function multiSelectTitleText(options){
  var selected = '';
  options.each(function () {
    selected += $(this).text() + ', ';
  });
  return selected.substr(0, selected.length - 2);
}

function multiSelectButtonTextFunction(options, select, button){
  if (options.length == 0) {
    return i18n.t("Opportunities.multi_select.nonSelectedText") + ' <b class="caret"></b>';
  }
  else {
    if (options.length > button.numberDisplayed) {
      return options.length + ' ' + i18n.t("Opportunities.multi_select.selectedText") + ' <b class="caret"></b>';
    }
    else {
      var selected = '';
      options.each(function() {
        var label = ($(this).attr('label') !== undefined) ? $(this).attr('label') : $(this).html();

        selected += label + ', ';
      });
      return selected.substr(0, selected.length - 2) + ' <b class="caret"></b>';
    }
  }
}

function onButtonClick(e){

  var applicationSelect = $('#application-positions');

  applicationSelect.empty();  

  $.when(getPositions(e.id)).done(function(result){     

    var positions = result;

    i18n.init(function(t) {       

      $.each(positions, function(key, value) {        
        applicationSelect
        .append($("<option></option>")         
         .text(value.translate ? i18n.t("Opportunities.multi_select." + value.position) : value.position)); 
      });

      applicationSelect.multiselect({
        buttonWidth: '100%',
        numberDisplayed: 1,
        buttonText: function(options, select) {
          return multiSelectButtonTextFunction(options, select, this);
        },
        buttonTitle: function(options, select) {
          return multiSelectTitleText(options);
        },
        includeSelectAllOption: true,
        selectAllText: i18n.t("Opportunities.multi_select.selectAll")
      });

      applicationSelect.multiselect('rebuild');
    });
  });
}  

function getPositions(id){
  return $.getJSON('/positions?id='+id);
}