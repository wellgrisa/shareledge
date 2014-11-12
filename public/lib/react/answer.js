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
				var floatLeft = { float : 'left' };
        return (
					<div style={floatLeft}>
						<span data-toggle="modal" onClick={this.onAnswerEditClicked.bind(this, this.props.answer)} data-target="#editAnswerModal" className="glyphicon glyphicon-pencil"/>
						<span data-toggle="modal" onClick={this.onAnswerDeleteClicked.bind(this, this.props.answer)} className="glyphicon glyphicon-trash"/>
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