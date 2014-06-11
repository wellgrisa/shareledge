$(document).ready(function() {

  $('#btn-ask').popover({
    html:true
  });

  $('#btn-register').on('click', function(){
    answer();
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
      data.solutions.push({ answer : 'Sei lá porra!' });

      registerAnswer(data);
  });
}

function registerAnswer(question){
  var url = '/question/' + questionIdentifier;

  jQuery.ajax({
    url: url,
    contentType: 'application/json; charset=utf-8',
    type: "PUT",
    data: JSON.stringify(question),
    success: function (data, textStatus, jqXHR) {

    }
  });
}

var questionIdentifier;

function showAnswer(id){
  questionIdentifier = id;
  $('.answer-panel').fadeIn('slow');
}

function question(id, content, answers){
  return '<a onclick="showAnswer(\'' + id +'\')" href="#" class="list-group-item ">' +
  '<h4 class="list-group-item-heading">' + content + '</h4>' +
  '<p class="list-group-item-text">' + answers + '</p></a>';
}

function getShortAnswers(solutions){
  return solutions.join().substr(0, 10);
}