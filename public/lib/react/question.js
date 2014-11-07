var QuestionsBox = React.createClass({
	getInitialState: function() {
    return {data: []};
  },
	componentDidMount: function() {
		handleListGroup();
    $.ajax({
      url: '/questions/outstandingFilter',
      dataType: 'json',
			data: {filter : { criteria :{type :'ebs'}, page : 1 }},
      success: function(data) {
        this.setState({data: data.records});
				updatePagination(data.pagination);
				NProgress.done();
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });		
  },
  render: function() {
    return (
			<div className="panel panel-default" id="accordion">
				<div id="questions-panel" className="panel-heading"> { i18n.t('main-page.question-panel.title')}</div>
				<div className="panel-body">	
					<QuestionList questions={this.state.data} />
				</div>        
      </div>
    );
  }
});

var QuestionList = React.createClass({
  render: function() {		

		var questionNodes = this.props.questions.map(function (questionNode) {
			return (
				<Question question={questionNode}/>
			);
		});		
		 
    return (
      <div className="list-group-questions">
				{questionNodes}
      </div>
    );
  }
});

var Question = React.createClass({		
  toggle: function(e) {
    $(e.currentTarget).siblings('.answer-collapsible').collapse('toggle');
  },
	render: function(){
		var questionForAnswerObject = { 
				id : this.props.question._id,
				answers : this.props.question.solutions
		};
		return (
			<div className="list-group-item list-group-item-question" data-id={this.props.question._id} data-parent="#accordion" data-toggle="collapse">
					<QuestionBy question={this.props.question}/>
					<QuestionActions question={this.props.question}/>
					<h4 onClick={this.toggle} className="list-group-item-heading">{this.props.question.content}</h4>
					<QuestionTags />
					<AnswersBox questionForAnswer={questionForAnswerObject}/>
			</div>
		);
	}
});

var QuestionActions = React.createClass({
    render: function(){		
				var floatLeft = { float : 'left' };
        return (
					<div style={floatLeft}>
						<span className="glyphicon glyphicon-share-alt clip question-action-copy beautify-tooltip" onclick="onCommentClicked()" data-placement="right" title="Copy to clipboard"/>
						<If condition={this.props.question.user.username == $('#user-name').val()}>
                <span className="glyphicon glyphicon-pencil beautify-tooltip" onclick="onEditClicked(this)" data-placement="right" title="Edit this question?" data-toggle="modal" data-target="#editQuestionModal"/>								
            </If>						
						<If condition={this.props.question.user.username == $('#user-name').val()}>
								<span className="glyphicon glyphicon-trash beautify-tooltip" data-placement="right" title="Delete this question?" onclick="deleteQuestion('545a596268e6f13200ac26f1')"/>	
            </If>
					</div>
        );
    }
});

var QuestionBy = React.createClass({
    render: function(){
			
				var question = this.props.question,
						questionLastUpdate = question.updated ? new Date(question.updated).getTime() : new Date(question.created).getTime(),
					  picture = "'" + question.user.google ? question.user.google.picture :"/img/unknown.png" + "'",
						spanStyle = { 'margin-top': '5px', float: 'left', 'margin-right': '5px' };
			
        return (
					<div className="navbar-right">						
						<span className="label label-success" style={spanStyle}>{getLastUpdate(questionLastUpdate)}</span>		
						<img data-toggle="dropdown" className="img-responsive panel-user beautify-tooltip img-circle" src={picture}
							alt="" data-placement="left" title={question.user.username} data-original-title="Tooltip on left"/>
					</div>
        );
    }
});

var QuestionTags = React.createClass({	
    render: function(){
        return (
					<div className="tags">
						<div className="token Tryout">
							<span className="token-label">Tryout </span>
						</div>
					</div>
        );
    }
});

var If = React.createClass({
    render: function() {
        if (this.props.condition) {
            return this.props.children;
        }
        else {
            return false;
        }
    }
});

React.render(
  <QuestionsBox url="/question"/>,  
  document.getElementById('example')
);
