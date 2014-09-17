function toDateTime (string_value) {
  if (string_value == undefined) return "";

  var d = new Date(string_value);
  if (d == undefined) return "";

  return d.getDate() + '/' + d.getMonth() + '/' + d.getFullYear() + ' ' + d.getHours() + ':' + d.getMinutes();
}

$(document).ready(function() {

i18n.init(handleMultiSelect);

$("#menu-toggle").click(function(e) {
        e.preventDefault();
        $("#wrapper").toggleClass("active");
});


$('.side-nav a').on('click', sidebarClicked);

  io = io.connect();

  io.on('update-counts', function() {
    if(!$('.answer-collapsible .in').length && $('#question').val() == ""
      && !$('#outstandingQuestionsByUser').hasClass('questions-selected')){
      searchFunction();
    }
    updateCounts();
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

    searchFunction = getBySearch;

    getBySearch();

    // $.get( '/question/search/' + $('#question').val(), function(res){
    //   $('.list-group').html('');
    //   var questions = res.data;
    //   for (var i = 0; i < questions.length; i++) {
    //     $('.list-group').append(getQuestion(questions[i]));
    //   }
    // });
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

updateCounts();

initiateSearch();


function updateCounts(){
  $.get( '/counts', function(res){
    updateBadges(res.data);
  });
}

function getBySearch(){
  var pageNumber =  $('li.active > a', '.pagination').html();

  if($('#question').val() == ""){
    $(".side-nav").children(".active").removeClass('active');
    $('#all-questions').parent().addClass('active');
  }

  $.getJSON( '/question/search', {filter : { criteria : { content: { $regex: '^.*'+  $('#question').val() +'.*$', $options: 'i' }, type : $('#systems').val() }, page : pageNumber }})
  .done(function(json){
    refreshQuestionsWith(json);
  })
  .fail(function(jqxhr, textStatus, error){

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
      $('#filter').val($('#systems').val());
      initiateSearch();
      updateCounts();
    }
  });
}

  //refreshQuestions();

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

   var attr = selectedQuestion.attr('style');

    if (typeof attr !== typeof undefined && attr !== false) {
      selectedQuestion.removeAttr('style');
    }

   var questionIdentifier  = selectedQuestion.data("id");

   var urlUpdateRead = '/question/updateRead/' + questionIdentifier;
     //console.log(question);
     jQuery.ajax({
      url: urlUpdateRead,
      type: "PUT",
      success: function (xhr, status, error) {
        console.log('sucess');

        updateCounts();

      }
    });
  });

  listGroup.delegate(".list-group-item", "click", function(event) {
    var previous = $(event.currentTarget).closest(".list-group").children(".active");
    previous.removeClass('active');
    $(event.currentTarget).addClass('active');
  });

  $('.pagination').delegate('a', 'click', paginationClicked);
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

function refreshQuestionsWith(result){

  var questions = result.records;

  var pagination = $('.pagination');

  pagination.html('');

  for (var i = 1; i <= result.pagination.totalPages; i++) {

    if(result.pagination.currentPage == i)
        pagination.append($('<li/>', {'class': 'active'}).append('<a href="#">' + i + '</a></li>'));
    else
        pagination.append('<li><a href="#">' + i + '</a></li>')
  }

  $('.list-group').html('');
  for (var i = 0; i < questions.length; i++) {

    $('.list-group').append(getQuestion(questions[i]));
  }
}

function paginationClicked(){
  if(!$(this).hasClass("active")){
    var lastActive = $(this).closest(".pagination").children(".active");
    lastActive.removeClass("active");
    $(this).parent().addClass("active");
  }

  searchFunction();
}

var searchFunction;

function sidebarClicked(){
  var linkId = $(this).attr('id');

  searchFunction = getQuestionsByLink;

  if(!$(this).hasClass("active")){
    var lastActive = $(this).closest(".side-nav").children(".active");
    lastActive.removeClass("active");
    $(this).parent().addClass("active");
  }

  $(".pagination").children(".active").removeClass('active');

  getQuestionsByLink();
}

function getQuestionsByLink(){

  var linkId = $('li.active > a', '.side-nav').attr('id');

  var pageNumber =  $('li.active > a', '.pagination').html();

  if(linkId == 'my-questions'){
   getOutstandingCountByFilter({filter : { criteria : {'user' : true, type : $('#systems').val()}, page : pageNumber }}, refreshQuestionsWith);
   }else if(linkId == 'my-outstanding-questions'){
    getOutstandingCountByFilter({filter : { criteria :{$or : [{"useful": 0}, {"solutions": {$size : 0}}], 'user' : true, type :$('#systems').val()}, page : pageNumber }}, refreshQuestionsWith);
  }else if(linkId == 'my-answered-questions'){
    getOutstandingCountByFilter({filter : { criteria :{"useful" : {$gt : 0 }, 'user' : true, type : $('#systems').val()}, page : pageNumber }}, refreshQuestionsWith);
  }else if(linkId == 'outstanding-questions'){
    getOutstandingCountByFilter({filter : { criteria :{$or : [{"solutions.useful": 0}, {"solutions": {$size : 0}}], type :$('#systems').val()}, page : pageNumber }}, refreshQuestionsWith);
  }else if(linkId == 'answered-outstanding-questions'){
   getOutstandingCountByFilter({filter : { criteria :{"useful" : {$gt : 0 } , type :$('#systems').val()}, page : pageNumber }}, refreshQuestionsWith);
  }else if(linkId == 'all-questions'){
       getOutstandingCountByFilter({filter : { criteria :{type :$('#systems').val()}, page : pageNumber }}, refreshQuestionsWith);
  }
}

function getOutstandingCountByFilter(filter, callback){
    $.getJSON( '/questions/outstandingFilter', filter)
  .done(function(json){
    callback(json);
  })
  .fail(function(jqxhr, textStatus, error){

  });
}

function updateBadge(name, value){
  var elementName = '#' + name + ' .badge';

  if($(elementName).length){
    $(elementName).text(value);
  }else{
    $('#' + name).append('<span class="badge" style="margin-left: 5px">' + value + '</span>');
  }
}

function updateBadges(result){
  updateBadge('my-questions', result.myQuestions);
  updateBadge('my-answered-questions', result.myAnsweredQuestions);
  updateBadge('my-outstanding-questions', result.myOutstandingQuestions);
  updateBadge('outstanding-questions', result.outstandingQuestions);
  updateBadge('answered-outstanding-questions', result.answeredOutstandingQuestions);
  updateBadge('all-questions', result.allQuestions);
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
    $('#question').val('');

    initiateSearch();

    $('#btn-ask').popover('hide');

    io.emit('question-created');

    updateCounts();

    // Registering Google Analytics event
    ga_event('Question', 'Ask', 'Question saved as outstading');    
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

function updateCounts(){
  $.get( '/counts', function(res){
        updateBadges(res.data);
      });
}

function initiateSearch(){
  $(".side-nav").children(".active").removeClass('active');

  $('#outstanding-questions').parent().addClass('active');

  var pageNumber =  $('li.active > a', '.pagination').html();

  searchFunction = getQuestionsByLink;

  getOutstandingCountByFilter({filter : { criteria :{$or : [{"solutions.useful": 0}, {"solutions": {$size : 0}}], type : $('#filter').val()}, page : pageNumber }}, refreshQuestionsWith);
}

function registerAnswer(question){
  var selectedQuestion = $('.list-group-item.active');

  var questionIdentifier  = selectedQuestion.data("id");

  var url = '/question/' + questionIdentifier;
  //console.log(question);
  jQuery.ajax({
    url: url,
    type: "PUT",
    data: question,
    success: function (xhr, status, error) {
      $('.text-area-answer', selectedQuestion).val('');

      io.emit('question-answered');

      $.get( '/counts', function(res){
        updateBadges(res.data);
      });

      searchFunction();
    }
  });
}

function showAnswer(id){
  var questionIdentifier  = $('.list-group-item.active').data("id");

  var urlUpdateRead = '/question/updateRead/' + questionIdentifier;
  //console.log(question);
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
                      '<div class="panel-heading"><span class="badge">' + data.solutions[i].useful + 
                      '</span><label>' + data.solutions[i].user.username + '</label> ' + toDateTime(data.solutions[i].created) + '<a onclick="rateUp(\'' + data.solutions[i]._id +'\')" class="answer-result green" href="#"><span class="glyphicon glyphicon-ok"></span></a></div>' +
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
      io.emit('answer-rated');
      updateCounts();
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
    solutionsString += $($.parseHTML(solutions[i].content)).text()
  }
  return solutionsString.substr(0, 120) + "...";
}

// Refactored Functions


function configureEventHandlers() {
    var questions = $(".list-group");

    questions.delegate(".list-group-item", "click", function(event) {
        var question = $(event.currentTarget),
            url = '/question/' + question.data("id");

        //console.log(url);
        //console.log(question);

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
                answer.push('        ' + toDateTime(data.solutions[i].created));
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

    html.push('<a data-target="#' + questionCollapsibleId + '" class="list-group-item" ' + unreadStyle + ' data-parent="#accordion" data-toggle="collapse" data-id="' + question._id +'" onclick="ga_event(\'Question\', \'Open-Question-' + question._id + '\', \'Show details from question\')">');
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
      html.push('<label>' + question.solutions[i].user.username + '</label>' + '  ' + toDateTime(question.solutions[i].created));
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

    if($('#systems').val() != 'hours' && $('#systems').val() != 'peopleCare'){
      html.push(buildAnswerPanel());
    }else if($('#department').val() == 'administrative'){
      html.push(buildAnswerPanel());
    }

    html.push('</div>');
    html.push('</a>');



    var a = html.join('');

    //console.log(a);

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

  //console.log(url);
  //console.log(question);

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
      answer.push('        ' + toDateTime(data.solutions[i].created));
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
