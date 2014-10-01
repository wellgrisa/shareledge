function toDateTime (string_value) {
  if (string_value == undefined) return "";

  var d = new Date(string_value);
  if (d == undefined) return "";


  return padLeft(d.getDate()) + '/' + padLeft(d.getMonth()) + '/' + d.getFullYear() + ' ' +
         padLeft(d.getHours()) + ':' + padLeft(d.getMinutes());
}

function padLeft(value, character, quantity)
{
  // default values
  if (character == undefined) character = "0";
  if (quantity == undefined) quantity = "2";

  var pad = "";

  for (var i = 0; i < quantity; i++) {
    pad += character;
  };

  return pad.substring(0, pad.length - value.toString().length) + value;
}

$(document).ready(function() {

  $.ajaxSetup({
    complete: function(jqXHR) { // when some of the requests completed it will splice from the array
      var index = $.xhrPool.indexOf(jqXHR);
      if (index > -1) {
        $.xhrPool.splice(index, 1);
      }
    }
  });

  $(document)
  .ajaxStart(function () {
    $('#accordion').addClass("loading");
    NProgress.inc();
  })
  .ajaxStop(function () {
    $('#accordion').removeClass("loading");
    NProgress.done();
  })
  .ajaxError(function(event, jqxhr, settings, thrownError){
    if(thrownError == "Not Found"){
      window.location = "/";
    }
  });

$('.tokenfield').tokenfield();


if (i18n) i18n.init(handleMultiSelect);

$("#menu-toggle").click(function(e) {
        e.preventDefault();
        $("#wrapper").toggleClass("active");
});

$('html').on('click', function (e) {
    if ($(e.target).data('toggle') !== 'popover'
      && $(e.target).parents('[data-toggle="popover"]').length === 0
      && $(e.target).parents('.popover.in').length === 0) {
      $('[data-toggle="popover"]').popover('hide');
  }
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

  io.on('question-created', function() {
    notificate();
  });

  var questionInput = $('#question');

  questionInput.focus();

  $('#btn-ask').popover({
    html:true
  });

configureEvents();


updateCounts();

initiateSearch();


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
    global: false,
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
  window.addEventListener("paste", processPasteEvent);
});

function processPasteEvent(e) {
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
    global: false,
    data: { img : imagePasted },
    success: function (data) {

      var img = new Image(); // : document.createElement('img');
      img.src = data.imgSrc;
      img.className  = "attached";

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

    textarea.keyup(function(e){
      if (e.ctrlKey && e.keyCode == 13) {
        answer();
      }
    });

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

     jQuery.ajax({
      url: urlUpdateRead,
      global: false,
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
    global: false,
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

function ask(hidePopover){

  var question = getQuestionMade();

  if(question == ""){
    alertUser('danger', i18n.t("main-page.messages.question-required"));
    return;
  }

  if(!$('#systems').val()){
    alertUser('danger', i18n.t("main-page.messages.system-required"));
    return;
  }

 jQuery.post("/question", {
  "content": question.content,
  "tags" : question.tags,
  "type" : $('#systems').val()
  }, function(data, textStatus, jqXHR) {
    alertUser('success', i18n.t("main-page.messages.question-successful"));
    $('#question').val('');
    $('.token').remove();
    $('.detailed-question').html('');
    if(hidePopover){
      $('#main-navbar').popover('hide');
    }

    if($('#nav-input-wonder').next().hasClass('popover')){
      $('#nav-input-wonder').popover('hide');
    }

    initiateSearch();

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
  $.ajax({
    url: "/counts",
    global: false,
  })
  .done(function( result ) {
    updateBadges(result.data);
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
    global: false,
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

  var toBeContinued = "...";
  if (solutionsString.length <= 120)
    toBeContinued = "";

  return solutionsString.substr(0, 120) + toBeContinued;
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

    html.push('<div data-target="#' + questionCollapsibleId + '" class="list-group-item" ' + unreadStyle + ' data-parent="#accordion" data-toggle="collapse" data-id="' + question._id +'" onclick="ga_event(\'Question\', \'Open-Question-' + question._id + '\', \'Show details from question\')">');
    html.push('<img data-toggle="dropdown" class="img-responsive panel-user navbar-right img-circle" src="' + picture + '" alt=""/>');
    html.push('  <h4 class="list-group-item-heading">' + question.content + '</h4>');

    if(question.tags.length){
      html.push('<div class="tags">');
      for (var i = 0; i < question.tags.length; i++) {
        html.push('<div class="token"><span class="token-label" style="max-width: 941px;">'+ question.tags[i] + ' </span></div>');
      }
      html.push('</div>');
    }else{
      if(question.solutions.length){
        html.push('  <p class="list-group-item-text answer-preview-text">' + getShortAnswers(question.solutions) + '</p>');
      }else{
        html.push('<br>');
      }
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
    html.push('</div>');



    var a = html.join('');

    //console.log(a);

    return html.join('');
}

function buildAnswerPanel(){
  var answerPanel = []
  answerPanel.push('<div class="panel-answer">');
  answerPanel.push('<div class="textarea" data-ph="Your answer goes here..."></div>');
  answerPanel.push('<div class="panel-bottom-answer">');
  answerPanel.push('<button onclick="answer()" class="btn btn-default btn-answer" type="submit">Register</button>');
  answerPanel.push('</div>');
  answerPanel.push('</div>');
  return answerPanel.join('');
}

function buildQuestionPanel(width){
  var answerPanel = []
  answerPanel.push('<div class="panel-detailed-question">');
  answerPanel.push('<div class="detailed-question textarea" data-ph="Your question goes here..."></div>');
  answerPanel.push('<div class="panel-bottom-question">');
  answerPanel.push('<div class="input-group">');
  answerPanel.push('<input type="text" id="tags" class="tokenfield" title="Tag here" class="form-control" placeholder="Tag here">');
  answerPanel.push('<span class="input-group-btn"><button onclick="ask(true)" class="btn btn-info" type="submit">'+ i18n.t("main-page.header.ask") + '</button></span>');
  answerPanel.push('</div>');
  answerPanel.push('</div>');
  return answerPanel.join('');
}

function buildTagPanel(){
  var answerPanel = []
  answerPanel.push('<div class="input-group">');
  answerPanel.push('<input type="text" class="tokenfield" name="question" title="Tag here" class="form-control" placeholder="Tag here">');

  answerPanel.push('<span class="input-group-btn"><button onclick="ask()" class="btn btn-info btn-ask">'+ i18n.t("main-page.question-panel.register") +'?</button></span>')
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

function getQuestionMade(){
  if($('#main-navbar').next('div.popover.in').length){
    return {
      content : $('.detailed-question').html(),
      tags : $('.panel-bottom-question .tokenfield').length ? tidyTagsUp($('.panel-bottom-question .tokenfield').tokenfield('getTokensList').split(',')) : ""
    };
  }else{
    return {
      content : $('#question').val(),
      tags : $('.tokenfield').length ? tidyTagsUp($('.tokenfield').tokenfield('getTokensList').split(',')) : ""
    };
  }
}

function tidyTagsUp(tags){
    for (var i = 0; i < tags.length; i++) {
      tags[i] = $.trim(tags[i]);
    }

    return tags;
}

function handleDetailedQuestionPopover(){
  var mainNavbar = $('#main-navbar');
  var questionInput = $('#question');

  mainNavbar
  .on('hide.bs.popover', function(e){
    if($('#main-navbar').next().hasClass('popover')){
      questionInput.removeAttr('disabled');
      $('#btn-ask').removeAttr('disabled', 'disabled').addClass('btn-info').removeClass('btn-default');
    }
  })
  .on('shown.bs.popover', function(e){

    if($('.panel-detailed-question').is(':visible')
      && $('.panel-detailed-question').closest('.popover.in').length){
      questionInput.attr('disabled', 'disabled');
      $('#btn-ask').attr('disabled', 'disabled').toggleClass('btn-info').toggleClass('btn-default');
    }

    var detailedQuestion = $('.detailed-question');

    detailedQuestion.wysiwyg();

    if(questionInput.val() != ""){
      detailedQuestion.html(questionInput.val());
    }

    detailedQuestion.focus();

    detailedQuestion.keyup(function(e) {
      var evtobj = window.event? event : e

      if (e.ctrlKey && e.keyCode == 13) {
        ask(true);
        return;
      }

      getBySearch();

    });
  });
}

function configureEvents(){
  handleDetailedQuestionPopover();

  $('.navbar-fixed-top')
  .on('shown.bs.popover', function(e){
      $('.tokenfield').tokenfield();
  });

  $( "#question" ).keyup(function(e) {

    var evtobj = window.event? event : e

    if (evtobj.keyCode == 13) {
      tagging();
      $('.btn-ask').focus();
    }

    searchFunction = getBySearch;

    getBySearch();
  });
}

function getBySearch(){

  if($('#question').val() == ""){
    $(".side-nav").children(".active").removeClass('active');
    $('#all-questions').parent().addClass('active');
  }

  if($.xhrPool.length){
    $.xhrPool.abortAll();
  }

  var searchingAjax = $.ajax({
    url: "/question/search",
    data: buildSearchData(),
    global: false,
  })
  .done(function( result ) {
    refreshQuestionsWith(result);
  });

  $.xhrPool.push(searchingAjax)
}

function notificate() {
  if (!("Notification" in window)) {
    alert("This browser does not support desktop notification");
  }

  else if (Notification.permission === "granted") {
    var notification = new Notification("New question created!");
  }

  else if (Notification.permission !== 'denied') {
    Notification.requestPermission(function (permission) {

      if(!('permission' in Notification)) {
        Notification.permission = permission;
      }

      if (permission === "granted") {
        var notification = new Notification("New question created!");
      }
    });
  }
}

function askDetailedQuestion(){
  var questionElement = $('#main-navbar');

  var questionWidth = $('#nav-input-wonder').width();

  if($('#nav-input-wonder').next().hasClass('popover')){
     $('#nav-input-wonder').popover('hide');
  }

  createPopover(questionElement, buildQuestionPanel(questionWidth), questionWidth);
}

function tagging(){
  var questionElement = $('#nav-input-wonder');

  var questionWidth = questionElement.width();

  createPopover($('#nav-input-wonder'), buildTagPanel(), questionWidth);
}

function createPopover(elementPopover, content, width){

  var popoverWidth = width ? 'style="max-width : ' + width + 'px; width :' + width + 'px"' : "";

  var popoverDiv = '<div class="timePickerWrapper popover"' + popoverWidth + '>';

  var popoverTemplate = [popoverDiv,
        '<div class="arrow"></div>',
        '<div class="popover-content">',
        '</div>',
        '</div>'].join('');

  elementPopover.popover({
    content: content,
    template: popoverTemplate,
    placement: 'bottom',
    html: true,
    trigger: 'manual'
  });

  elementPopover.popover('toggle');
}

$.xhrPool = [];

$.xhrPool.abortAll = function() { // our abort function
    $(this).each(function(idx, jqXHR) {
        jqXHR.abort();
    });
    $.xhrPool.length = 0
};

function getConditions(){
  var question = $.trim(getQuestionMade().content.replace(/<img [^>]+>/g, "").replace(/<br>/g, ""));

  var arrayOfSearches = question.split(' ');

  var searchesConditions = [
    {content: { $regex: '^.*'+  question +'.*$', $options: 'i' }},
    {tags: {$in : $.grep(arrayOfSearches,function(n){return(n);})}}
  ];

  for (var i = 0; i < arrayOfSearches.length; i++) {
    if(arrayOfSearches[i]){
      searchesConditions.push({content: { $regex: '^.*'+  arrayOfSearches[i] +'.*$', $options: 'i' }});
      searchesConditions.push({"solutions.content": { $regex: '^.*'+  arrayOfSearches[i] +'.*$', $options: 'i' }});
    }
  }
  return searchesConditions;
}

function buildSearchData(){
  var pageNumber =  $('li.active > a', '.pagination').html();

  var searchesConditions = getConditions();

  return {
    filter : {
      criteria :{
        $or : searchesConditions,
        type :$('#systems').val()
      }, page : pageNumber }
    };
}