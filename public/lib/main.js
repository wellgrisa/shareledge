$(document).ready(function() {

$("#menu-toggle").click(function(e) {
        e.preventDefault();
        $("#wrapper").toggleClass("active");
});

  io = io.connect();
i18n.init();

  io.on('update-general-badge', function() {
    updateCounts();
    if(!$('.answer-collapsible .in').length && $('#question').val() == ""
      && !$('#outstandingQuestionsByUser').hasClass('questions-selected')){
      refreshQuestions();
    }
  });

  io.on('update-user-badge', function() {
    updateCounts();
    if(!$('.answer-collapsible .in').length && $('#question').val() == ""
      && !$('#outstandingQuestionsByUser').hasClass('questions-selected')){
      refreshQuestions();
    }
  });

  $('#question').focus();

  $('#btn-ask').popover({
    html:true
  });

  $( "#question" ).keyup(function(e) {

    var evtobj = window.event? event : e

    if (evtobj.keyCode == 13) {
      $('#btn-ask').popover('show');
      $('.btn-ask').focus();
    }

    $.get( '/question/search/' + $('#question').val(), function(res){
      $('.list-group').html('');
      var questions = res.data;
      for (var i = 0; i < questions.length; i++) {
        $('.list-group').append(getQuestion(questions[i]));
      }
    });
  });

$( "#outstandingQuestions" ).on('click', function() {
    $(this).addClass('questions-selected');
    $( "#outstandingQuestionsByUser" ).removeClass('questions-selected');
    $.get( '/questions/outstanding', function(questions){
      $('.list-group').html('');
      for (var i = 0; i < questions.length; i++) {
        $('.list-group').append(getQuestion(questions[i]));
      }
    });
  });

$( "#outstandingQuestionsByUser" ).on('click', function() {
    $(this).addClass('questions-selected');
    $( "#outstandingQuestions" ).removeClass('questions-selected');
    $.get( '/questionByUser', function(questions){
      $('.list-group').html('');
      for (var i = 0; i < questions.length; i++) {
        $('.list-group').append(getQuestion(questions[i]));
      }
    });
  });

$.get( '/questions/outstanding', function(res){
  if(res.length > 0){
    $('#outstandingQuestions').append('<span class="badge" style="margin-left: 5px">' + res.length + '</span>');
  }

handleMultiSelect();

updateCounts();

});

function updateCounts(){
  $.get( '/counts', function(res){
    updateBadges(res.data);
  });
}

function handleMultiSelect(){
  var sections = $('#filter').val().split(',');

  var systems = $('#systems');

  initMultiSelect(systems);

  systems.val(sections);

  systems.multiselect('refresh');
}

function initMultiSelect(element){
  element.multiselect({
    buttonWidth: '100%',
    buttonClass: 'btn btn-link',
    nonSelectedText: i18n.t("main-page.header.system-select"),
    onChange : systemChanged
  });
}

function systemChanged(element, checked){
 jQuery.ajax({
    url: '/updateFilter',
    type: "PUT",
    data : { filter : $('#systems').val() },
    success: function (xhr, status, error) {
      console.log('sucess');
      refreshQuestions();
    }
  });
}

  refreshQuestions();

  handleListGroup();

  $('.notifications span').tooltip();
  window.addEventListener("paste",processEvent);
});

function processEvent(e) {
    for (var i = 0 ; i < e.clipboardData.items.length ; i++) {

        var clipboardItem = e.clipboardData.items[i];
        var type = clipboardItem.type;

        if (type.indexOf("image") != -1) {
          var blob = clipboardItem.getAsFile();
            var reader = new FileReader();
            reader.onload = function(event){
                createImage(event.target.result); //event.target.results contains the base64 code to create the image.
              };
            reader.readAsDataURL(blob);//Convert the blob from clipboard to base64

        } else {
            console.log("Not supported: " + type);
        }

    }
}

function createImage(imagePasted){
jQuery.ajax({
    url: 'uploadImage',
    type: "POST",
    data: { img : imagePasted },
    success: function (data) {

      var img= new Image();// : document.createElement('img');
      img.src= data.imgSrc;

      doInsert(img);
    },
    error: function (xhr, status, error) {

    }
  });
}

function HandleSelectionChange() {
    var sel = window.getSelection && window.getSelection();
    if (sel && sel.rangeCount > 0) {
        savedRange = sel.getRangeAt(0);
    }
}

function doInsert(element) {
    var sel = window.getSelection && window.getSelection();

    if (sel && sel.rangeCount > 0) {
        var range = sel.getRangeAt(0);

        range.insertNode(element);
    }
}


// function insertTextAtCursor(element) {
//     var sel, range, html;
//     if (window.getSelection) {
//         sel = window.getSelection();
//         if (sel.getRangeAt && sel.rangeCount) {
//             range = sel.getRangeAt(0);
//             range.deleteContents();
//             range.insertNode(element);
//         }
//     } else if (document.selection && document.selection.createRange) {
//         //document.selection.createRange().text = text;
//     }
// }

// function insertNodeAtCursor(node) {
//   var range, html;
//   if (window.getSelection && window.getSelection().getRangeAt) {
//     range = window.getSelection().getRangeAt(0);
//     range.insertNode(node);
//   } else if (document.selection && document.selection.createRange) {
//     range = document.selection.createRange();
//     html = (node.nodeType == 3) ? node.data : node.outerHTML;
//     range.pasteHTML(html);
//   }
// }

function handleListGroup(){
  var listGroup = $(".list-group");

  listGroup.delegate('.answer-collapsible', 'click', function(e){
    e.stopPropagation();
  });

  listGroup.delegate(".answer-collapsible", "shown.bs.collapse", function(){
    var textarea = $('.textarea', $('.list-group-item.active'));

    textarea.wysiwyg();

    textarea.eq(0).focus();
  });

  listGroup.delegate(".answer-collapsible", "show.bs.collapse", function(){

   $('#accordion .in').collapse('hide');

   var selectedQuestion = $('.list-group-item.active');

   var questionIdentifier  = selectedQuestion.data("id");

   var urlUpdateRead = '/question/updateRead/' + questionIdentifier;
     console.log(question);
     jQuery.ajax({
      url: urlUpdateRead,
      type: "PUT",
      success: function (xhr, status, error) {
        console.log('sucess');
      }
    });
  });

  listGroup.delegate(".list-group-item", "click", function(event) {
    var previous = $(event.currentTarget).closest(".list-group").children(".active");
    previous.removeClass('active');
    $(event.currentTarget).addClass('active');
  });
}

function finishTour(){
  var finishTour = '/finishTour/' + $('#user-id').val();
  jQuery.ajax({
    url: finishTour,
    type: "PUT",
    success: function (xhr, status, error) {
      console.log('sucess');
    }
  });
}

function refreshQuestions(){

  $.get( '/question', function(res){
    $('.list-group').html('');
    var questions = res.data;
    for (var i = 0; i < questions.length; i++) {
      $('.list-group').append(getQuestion(questions[i]));
    }
  });
}

function getOutstandingCountByFilter(filter){
    $.getJSON( '/questions/outstandingFilter', filter)
  .done(function(json){
    return json.count;
  })
  .fail(function(jqxhr, textStatus, error){

  });
}

function updateBadge(name, value){
  var elementName = '#' + name + ' .badge';

  if($(elementName).length){
    $(elementName).html('<span class="badge" style="margin-left: 5px">' + value + '</span>');
  }else{
    $('#' + name).append('<span class="badge" style="margin-left: 5px">' + value + '</span>');
  }
}

function updateBadges(result){
  updateBadge('my-questions', result.myQuestions);
  updateBadge('my-answered-questions', result.myAnsweredQuestions);
  updateBadge('my-unread-questions', result.myUnreadQuestions);
  updateBadge('outstanding-questions', result.outstandingQuestions);
  updateBadge('answered-outstanding-questions', result.outstandingQuestions);
  updateBadge('all-questions', result.allQuestions);
}

function updateOutstandingQuestionsBadge(){
  $.getJSON( '/questions/outstandingFilter', {$or : [{"solutions.useful": 0}, {"solutions": {$size : 0}}], type : $('#filter').val()} )
  .done(function(json){
    if(json.count > 0){
      if($('#outstandingQuestions .badge').length){
        $('#outstandingQuestions .badge').html('<span class="badge" style="margin-left: 5px">' + json.count + '</span>');
      }else{
        $('#outstandingQuestions').append('<span class="badge" style="margin-left: 5px">' + json.count + '</span>');
      }
    }
  })
  .fail(function(jqxhr, textStatus, error){

  });
}

function updateOutstandingQuestionsByUserBadge(){
  $.getJSON( '/questions/outstandingFilter', {'user' : true, 'read' : false} )
  .done(function(json){
    if(json.count > 0){
      if($('#outstandingQuestionsByUser .badge').length){
        $('#outstandingQuestionsByUser .badge').html('<span class="badge" style="margin-left: 5px">' + json.count + '</span>');
      }else{
        $('#outstandingQuestionsByUser').append('<span class="badge" style="margin-left: 5px">' + json.count + '</span>');
      }
    }
  })
  .fail(function(jqxhr, textStatus, error){

  });
}

function ask(){
  if($('#question').val() == ""){
    alertUser('danger', i18n.t("main-page.messages.question-required"));
    return;
  }

  if(!$('#systems').val()){
    alertUser('danger', i18n.t("main-page.messages.system-required"));
    return;
  }

 jQuery.post("/question", {
  "content": $('#question').val(),
  "type" : $('#systems').val()
  }, function(data, textStatus, jqXHR) {
    alertUser('success', i18n.t("main-page.messages.question-successful"));
    refreshQuestions();
    $('#btn-ask').popover('hide');

    io.emit('question-created');

    $.get( '/counts', function(res){
      updateBadges(res.data);
    });
  });
}

function alertUser(type, message){
  var alertPanel = buildPanel(type, message);

  $('.alert-panel').append(alertPanel);

  setTimeout(function(){
    $('.alert', '.alert-panel').fadeOut('slow');
  } , 2000);
}

function buildPanel(type, message){
    var messageBox = [];
    messageBox.push('<div class="alert alert-' + type + '">');
    messageBox.push('<a href="#" class="close" data-dismiss="alert">&times;</a>');
    messageBox.push(message);
    messageBox.push('</div>');
    return messageBox.join('');
}

function answer(){
  var selectedQuestion = $('.list-group-item.active');

  var questionIdentifier  = selectedQuestion.data("id");

  var url = '/question/' + questionIdentifier;

  $.get(url, function(data, textStatus, jqXHR) {
      data.solutions.push({ content : $('.textarea', selectedQuestion).html() });

      registerAnswer(data);
  });
}

function registerAnswer(question){
  var selectedQuestion = $('.list-group-item.active');

  var questionIdentifier  = selectedQuestion.data("id");

  var url = '/question/' + questionIdentifier;
  console.log(question);
  jQuery.ajax({
    url: url,
    type: "PUT",
    data: question,
    success: function (xhr, status, error) {
      refreshQuestions();
      $('.text-area-answer', selectedQuestion).val('');

      io.emit('question-answered');

      $.get( '/counts', function(res){
        updateBadges(res.data);
      });
    }
  });
}

function showAnswer(id){
  var questionIdentifier  = $('.list-group-item.active').data("id");

  var urlUpdateRead = '/question/updateRead/' + questionIdentifier;
  console.log(question);
  jQuery.ajax({
    url: urlUpdateRead,
    type: "PUT",
    success: function (xhr, status, error) {
        console.log('sucess');
    }
  });

  var url = '/question/' + questionIdentifier;

  $.get(url, function(data, textStatus, jqXHR) {
    $('#answers').html('');

    for (var i = 0; i < data.solutions.length; i++) {

      var answer = '<div class="panel panel-default">' +
                      '<div class="panel-heading"><span class="badge">' + data.solutions[i].useful + '</span><label>' + data.solutions[i].user.username + '</label> ' + data.solutions[i].created + '<a onclick="rateDown(\'' + data.solutions[i]._id +'\')" class="answer-result red" href="#"><span class="glyphicon glyphicon-remove"></span></a><a onclick="rateUp(\'' + data.solutions[i]._id +'\')" class="answer-result green" href="#"><span class="glyphicon glyphicon-ok"></span></a></div>' +
                          '<div class="panel-body">'+
                            data.solutions[i].content +
                          '</div>' +
                    '</div>';
      $('#answers').append(answer);
    }
  });

  $('.answer-panel').fadeIn('slow');
}

function rateUp(identifier){
  rate(identifier, 'up');
}

function rateDown(identifier){
 rate(identifier, 'down');
}

function rate(identifier, rate){
  var url = '/answer/' + $('.list-group-item.active').data("id");

  jQuery.ajax({
    url: url,
    type: "PUT",
    data: { answer: identifier , rate: rate },
    success: function (data) {
      $('#' + data._id).html(data.useful);
    }
  });
}


function question(id, content, answers){
  return '<a onclick="showAnswer(\'' + id +'\')" href="#" class="list-group-item ">' +
  '<h4 class="list-group-item-heading">' + content + '</h4>' +
  '<p class="list-group-item-text">' + answers + '</p></a>';
}

function getShortAnswers(solutions){
  var solutionsString = '';
  for (var i = 0; i < solutions.length; i++) {
    solutionsString += solutions[i].content.replace(/<img [^>]+>/g, "").replace(/<br>/g, "");
  }
  return solutionsString.substr(0, 500);
}

// Refactored Functions


function configureEventHandlers() {
    var questions = $(".list-group");

    questions.delegate(".list-group-item", "click", function(event) {
        var question = $(event.currentTarget),
            url = '/question/' + question.data("id");

        console.log(url);
        console.log(question);

        $.get(url, function(data) {
            var answers = question.find('.answers'),
                answer;

            answers.html('');

            for (var i = 0; i < data.solutions.length; i++) {
                answer = [];

                answer.push('<div class="panel panel-default">');
                answer.push('    <div class="panel-heading">');
                answer.push('        <span class="badge">' + data.solutions[i].useful + '</span>');
                answer.push('        <label>' + data.solutions[i].user.username + '</label>');
                answer.push('        ' + data.solutions[i].created);
                answer.push('        <a onclick="rateDown(\'' + data.solutions[i]._id +'\')" class="answer-result red" href="#">');
                answer.push('            <span class="glyphicon glyphicon-remove"></span>');
                answer.push('        </a>');
                answer.push('        <a onclick="rateUp(\'' + data.solutions[i]._id +'\')" class="answer-result green" href="#">');
                answer.push('            <span class="glyphicon glyphicon-ok"></span>');
                answer.push('        </a>');
                answer.push('    </div>');
                answer.push('    <div class="panel-body">');
                answer.push('   ' + data.solutions[i].content );
                answer.push('    </div>');
                answer.push('</div>');

                answers.append(answer.join(''));
            }
        });

    });
}

function getQuestion(question){

    var html = [];

    var questionCollapsibleId = 'answer-for-' + question._id;

    var unreadStyle = "";

    if(!question.read){
      if(question.user.username == $('#user-name').val()){
        unreadStyle = 'style="background-color: #f0ad4e;"';
      }
    }

    var picture = question.user.google ? question.user.google.picture :"/img/unknown.png";

    html.push('<a data-target="#' + questionCollapsibleId + '" class="list-group-item" ' + unreadStyle + ' data-parent="#accordion" data-toggle="collapse" data-id="' + question._id +'">');
    html.push('<img data-toggle="dropdown" class="img-responsive panel-user navbar-right img-circle" src="' + picture + '" alt=""/>');
    html.push('  <h4 class="list-group-item-heading">' + question.content + '</h4>');
    if(question.solutions.length){
        html.push('  <p class="list-group-item-text answer-preview-text">' + getShortAnswers(question.solutions) + '</p>');
    }else{
        html.push('<br>');
    }

    html.push('  <div class="answer-collapsible collapse"  id="' + questionCollapsibleId + '">');
    for (var i = 0; i < question.solutions.length; i++) {
      html.push('<div class="panel panel-default">');
      html.push('<div class="panel-heading">');
      html.push('<span id="' + question.solutions[i]._id +  '" class="badge">' + question.solutions[i].useful + '</span>');
      html.push('<label>' + question.solutions[i].user.username + '</label>' + '  ' + question.solutions[i].created);
      html.push('<button onclick="rateDown(\'' + question.solutions[i]._id +'\')" class="answer-result red" href="#">');
      html.push('<span class="glyphicon glyphicon-remove"></span>');
      html.push('</button>');
      html.push('<button onclick="rateUp(\'' + question.solutions[i]._id +'\')" class="answer-result green" href="#">');
      html.push('<span class="glyphicon glyphicon-ok"></span>');
      html.push('</button>');
      html.push('</div>');
      html.push('<div class="panel-body">');
      html.push(question.solutions[i].content);
      html.push('</div>');
      html.push('</div>');
    }

    if($('#systems').val() != 'hours'){
      html.push(buildAnswerPanel());
    }else if($('#department').val() == 'administrative'){
      html.push(buildAnswerPanel());
    }

    html.push('</div>');
    html.push('</a>');



    var a = html.join('');

    console.log(a);

    return html.join('');
}

function buildAnswerPanel(){
  var answerPanel = []
  answerPanel.push('<div class="panel-answer">');
  answerPanel.push('<div class="textarea">Go ahead&hellip;</div>');
  answerPanel.push('<div class="panel-bottom-answer">');
  answerPanel.push('<button onclick="answer()" class="btn btn-default btn-answer" type="submit">Register</button>');
  answerPanel.push('</div>');
  answerPanel.push('</div>');
  return answerPanel.join('');
}

function handleCollapsibleAnswers(elementEvent){

  var question = $(elementEvent.currentTarget).parent('.list-group-item');
  var id = question.data('id');
  var url = '/question/' + id;

  console.log(url);
  console.log(question);

  $.get(url, function(data) {
    var answers = question.find('#answer-for-' + data._id),
    answer;

    answers.html('');

    for (var i = 0; i < data.solutions.length; i++) {
      answer = [];

      answer.push('<div class="panel panel-default">');
      answer.push('    <div class="panel-heading">');
      answer.push('        <span class="badge">' + data.solutions[i].useful + '</span>');
      answer.push('        <label>' + data.solutions[i].user.username + '</label>');
      answer.push('        ' + data.solutions[i].created);
      answer.push('        <a onclick="rateDown(\'' + data.solutions[i]._id +'\')" class="answer-result red" href="#">');
      answer.push('            <span class="glyphicon glyphicon-remove"></span>');
      answer.push('        </a>');
      answer.push('        <a onclick="rateUp(\'' + data.solutions[i]._id +'\')" class="answer-result green" href="#">');
      answer.push('            <span class="glyphicon glyphicon-ok"></span>');
      answer.push('        </a>');
      answer.push('    </div>');
      answer.push('    <div class="panel-body">');
      answer.push('   ' + data.solutions[i].content );
      answer.push('    </div>');
      answer.push('</div>');

      answers.append(answer.join(''));
    }
  });
}
