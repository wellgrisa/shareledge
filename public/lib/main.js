$(document).ready(function() {

  $('#btn-ask').popover({
    html:true
  });

  $('#btn-register').on('click', function(){
    answer();
  });

  $( "#question" ).keyup(function() {
    $.get( '/question/search/' + $('#question').val(), function(res){
      $('.list-group').html('');
      var questions = res.data;
      for (var i = 0; i < questions.length; i++) {
        $('.list-group').append(getQuestion(questions[i]));
      }
    });
  });

$( "#outstandingQuestions" ).on('click', function() {
    $.get( '/questions/outstanding', function(questions){
      $('.list-group').html('');
      for (var i = 0; i < questions.length; i++) {
        $('.list-group').append(getQuestion(questions[i]));
      }
    });
  });

$( "#outstandingQuestionsByUser" ).on('click', function() {
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
});

  refreshQuestions();

  handleListGroup();
});

function handleListGroup(){
  var listGroup = $(".list-group");

listGroup.delegate('.answer-collapsible', 'click', function(e){
  e.stopPropagation();
});

  listGroup.delegate(".answer-collapsible", "show.bs.collapse", function(){
       $('#accordion .in').collapse('hide');
  });

  listGroup.delegate(".list-group-item", "click", function(event) {
    var previous = $(event.currentTarget).closest(".list-group").children(".active");
    previous.removeClass('active');
    $(event.currentTarget).addClass('active');
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

function ask(){
 jQuery.post("/question", {
  "content": $('#question').val()
  }, function(data, textStatus, jqXHR) {
    refreshQuestions();
  });
}

function answer(){
  var url = '/question/' + questionIdentifier;

  $.get(url, function(data, textStatus, jqXHR) {
      data.solutions.push({ content : $('#textarea').val() });

      registerAnswer(data);
  });
}

function registerAnswer(question){
  var url = '/question/' + questionIdentifier;
  console.log(question);
  jQuery.ajax({
    url: url,
    type: "PUT",
    data: question,
    success: function (xhr, status, error) {
      refreshQuestions();
      $('#textarea').val('');
      $('.answer-panel').fadeOut('slow');
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
    solutionsString += solutions[i].content;
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

    html.push('<a data-target="#' + questionCollapsibleId + '" class="list-group-item" data-parent="#accordion" data-toggle="collapse" data-id="' + question._id +'">');
    html.push('  <h4 class="list-group-item-heading">' + question.content + '</h4>');
    html.push('  <p class="list-group-item-text answer-preview-text">' + getShortAnswers(question.solutions) + '</p>');

    html.push('  <div class="answer-collapsible collapse"  id="' + questionCollapsibleId + '">');
    for (var i = 0; i < question.solutions.length; i++) {
      html.push('<div class="panel panel-default">');
      html.push('<div class="panel-heading">');
      html.push('<span id="' + question.solutions[i]._id +  '" class="badge">' + question.solutions[i].useful + '</span>');
      html.push('<label>' + question.solutions[i].user.username + '</label>' + '  ' + question.solutions[i].created);
      debugger;
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

    html.push('</div>');
    html.push('</a>');



    var a = html.join('');

    console.log(a);

    return html.join('');
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