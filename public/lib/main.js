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
        $('.list-group').append(question(questions[i]._id, questions[i].content, getShortAnswers(questions[i].solutions)));
      }
    });
  });

  refreshQuestions();
});

function refreshQuestions(){
  $.get( '/question', function(res){
    $('.list-group').html('');
    var questions = res.data;
    for (var i = 0; i < questions.length; i++) {
      $('.list-group').append(question(questions[i]._id, questions[i].content, getShortAnswers(questions[i].solutions)));
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
      data.solutions.push({ answer : $('#textarea').val() });

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

var questionIdentifier;

function showAnswer(id){
  questionIdentifier = id;

  var url = '/question/' + questionIdentifier;

  $.get(url, function(data, textStatus, jqXHR) {
    $('#answers').html('');

    for (var i = 0; i < data.solutions.length; i++) {

      var answer = '<div class="panel panel-default">' +
                      '<div class="panel-heading">' + data.solutions[i].user.username + ' ' + data.solutions[i].created + '<a class="answer-result green" href="#"><span class="glyphicon glyphicon-remove"></span></a><a class="answer-result red" href="#"><span class="glyphicon glyphicon-ok"></span></a></div>' +
                          '<div class="panel-body">'+
                            data.solutions[i].answer +
                          '</div>' +
                    '</div>';
      $('#answers').append(answer);
    }
  });

  $('.answer-panel').fadeIn('slow');
}

function question(id, content, answers){
  return '<a onclick="showAnswer(\'' + id +'\')" href="#" class="list-group-item ">' +
  '<h4 class="list-group-item-heading">' + content + '</h4>' +
  '<p class="list-group-item-text">' + answers + '</p></a>';
}

function getShortAnswers(solutions){
  var solutionsString = '';
  for (var i = 0; i < solutions.length; i++) {
    solutionsString += solutions[i].answer;
  }
  return solutionsString.substr(0, 500);
}