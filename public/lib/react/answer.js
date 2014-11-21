var AnswersBox = React.createClass({
  render: function() {
    return (
			<div className="answer-collapsible collapse" id={"answer-for-" + this.props.questionForAnswer.id}>
				<AnswerList questionForAnswer={this.props.questionForAnswer}/>        
				<AnswerPanel />
      </div>
    );
  }
});

var AnswerList = React.createClass({	
  render: function() {
		var questionId = this.props.questionForAnswer.id;
		var answerNodes = this.props.questionForAnswer.answers.map(function (answerNode) {
			var answerModel = {
				questionId : questionId,
				data : answerNode
			};
			return (
				<Answer key={answerNode._id} answer={answerModel}/>
			);
		});
		
    return (			
			<div className="list-group-answers">
				{answerNodes}
			</div>			
    );
  }
});

var Answer = React.createClass({		
    render: function(){				
        return (
					<div className="list-group">
						<div data-id={this.props.answer.data._id} className="list-group-item list-group-item-answer">
							<AnswerRating answer={this.props.answer}/>
							<AnswerActions answer={this.props.answer}/>
							<AnswerContent answer={this.props.answer}/>
						</div>
					</div>
        );
    }
});

var AnswerRating = React.createClass({
		handleThumbUp: function (answer) {
			rateUp(answer.questionId.toString(), answer.data._id.toString());
		},
		handleThumbDown: function (answer) {
			rateDown(answer.questionId.toString(), answer.data._id.toString());
		},
    render: function(){
			var float = { float : 'right' };
			return (
				<div style={float}>
					<span onClick={this.handleThumbDown.bind(this, this.props.answer)} className="glyphicon glyphicon-thumbs-down thumbs trigger-action" />				
					<span id={this.props.answer.data._id} className="badge rate-badge">{this.props.answer.data.useful}</span>
					<span onClick={this.handleThumbUp.bind(this, this.props.answer)} className="glyphicon glyphicon-thumbs-up thumbs" />
				</div>
			);
    }
});

var AnswerActions = React.createClass({
		onAnswerEditClicked: function (answerModel, e) {
			onEditAnswerClicked(answerModel.questionId.toString(), answerModel.data._id.toString());
			$(e.currentTarget).closest('.list-group-item-answer').addClass('selected');
		},
		onAnswerDeleteClicked: function (answerModel, e) {
			onDeleteAnswerClicked(answerModel.questionId.toString(), answerModel.data._id.toString());			
		},
    render: function(){	
				var answer = this.props.answer,
				 		picture = "'" + answer.data && answer.data.user && answer.data.user.google ? answer.data.user.google.picture :"img/unknown.png",
						floatLeft = { float : 'left' };
			
        return (
					<div style={floatLeft}>
						<span data-toggle="modal" onClick={this.onAnswerEditClicked.bind(this, answer)} data-target="#editAnswerModal" className="glyphicon glyphicon-pencil"/>
						<span data-toggle="modal" onClick={this.onAnswerDeleteClicked.bind(this, answer)} className="glyphicon glyphicon-trash"/>
						<img data-toggle="dropdown" className="no-collapse img-responsive answer-user beautify-tooltip img-circle" src={picture} alt="" />
					</div>
        );
    }
});

var AnswerContent = React.createClass({
    render: function(){						
				var answer = this.props.answer.data;
        return (
					<div>
						<label className="list-group-item-heading">{answer.user.username + ' ' + toDateTime(answer.created)}</label>
						<p className="list-group-item-text" dangerouslySetInnerHTML={{__html: answer.content}}></p>
					</div>
        );
    }
});

var AnswerPanel = React.createClass({
	handleAnswerClick: function(e){		
		answer();
	},
	render: function(){
		return (
			<div className="panel-answer">
				<div className="textarea" data-ph="Your answer goes here..." contenteditable="true"/>
				<div className="panel-bottom-answer">
					<button onClick={this.handleAnswerClick} className="btn btn-default btn-answer" type="submit">{ i18n.t('main-page.question-panel.register')}</button>
				</div>
			</div>
		);
	}
}); 

function rateUp(question, identifier){
	rate(question, identifier, 'up');
}

function rateDown(question, identifier){
	rate(question, identifier, 'down');
}

function rate(question, identifier, rate){
	var url = '/answer/' + question;

	jQuery.ajax({
		url: url,
		global: false,
		type: "PUT",
		data: { answer: identifier , rate: rate },
		success: function (data) {
			$('#' + data._id).html(data.useful);
			io.emit('answer-rated', { answeredBy : data.user});
			updateCounts();
			updateUserScore(true);
		}
	});
}

function onEditAnswerClicked(identifier, answerIdentifier){

	$('#editAnswerModal').modal();

	$.ajax({
		url: "/question/" + identifier,
		global: false,
	})
	.done(function( result ) {
		openEditAnswerPopup(result, answerIdentifier);
	});
}

function openEditAnswerPopup(result, answerIdentifier){
	var editQuestionModal = $('.textarea', '#editAnswerModal');
	editQuestionModal.wysiwyg();	

	var solution = _.where(result.solutions, {_id: answerIdentifier});

	editQuestionModal.html(_.first(solution).content);

	$('.edit-question-btn-save').on('click', function(){

		_.each(result.solutions, function(solution){
			if(solution._id == answerIdentifier){
				solution.content = $('.textarea', '#editAnswerModal').html();
			}
		});		

		updateQuestion({
			id : result._id,
			solutions : result.solutions
		}, onEditAnswerCompleted);
	});
}

function onDeleteAnswerClicked(question, identifier){
	var url = '/answer/' + question;

	jQuery.ajax({
		url: url,
		global: false,
		type: "DELETE",
		data: { answer: identifier },
		success: function (data) {
			updateCounts();
			dispatchRefreshQuestions();
		}
	});
}

function answer(){
	var selectedQuestion = $('.list-group-item-question.active');

	var questionIdentifier  = selectedQuestion.data("id");

	var url = '/question/' + questionIdentifier;

	$.get(url, function(data, textStatus, jqXHR) {
		data.solutions.push({ content : $('.textarea', selectedQuestion).html() });

		registerAnswer(data);
	});
}

function registerAnswer(question){
	var selectedQuestion = $('.list-group-item-question.active');

	question.read = false;

	var questionIdentifier  = selectedQuestion.data("id");

	var url = '/question/' + questionIdentifier;
	//console.log(question);
	jQuery.ajax({
		url: url,
		type: "PUT",
		data: question,
		success: function (result, status, error) {
			$('.textarea', selectedQuestion).html('');
			selectedQuestion.removeClass('active');
			$('.answer-collapsible.in').collapse('toggle');

			var questionUpdated = result.question;

			io.emit('question-answered', {
				user : $('#user-name').val(),
				question : {
					id : questionUpdated._id,
					type : questionUpdated.type,
					createdBy : questionUpdated.user.username,
					updatedBy : result.updatedBy
				}
			});

			updateCounts();

			dispatchRefreshQuestions();
		}
	});
}

function onEditAnswerCompleted(){
	onEditCompleted('#editAnswerModal');
}