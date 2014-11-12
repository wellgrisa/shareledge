var QuestionsBox = React.createClass({
	getInitialState: function() {
    return {
			data: [],
			page: 1
		};
  },
	refreshQuestions :function(searchType){
		console.log(this.state.page);
    $.ajax({
      url: '/questions/outstandingFilter',
      dataType: 'json',			
			data: { searchType : searchType, page : this.state.page },
      success: function(data) {
				var questions = this.state.restartData ? data.records : this.state.data.concat(data.records);				
        this.setState({data: questions});								
				this.state.page ++;
				this.hasMoreItems(data.pagination.totalPages);
				NProgress.done();
				attachClipboardEvent();
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });		
	},
	hasMoreItems: function(totalPages){
		this.state.hasMore = this.state.page <= totalPages + 1;
	},
	componentDidMount: function() {		
		window.addEventListener('scroll', this.handleScroll);
		document.getElementById("main-menu").addEventListener("click", this.handleMainMenuClick);
		document.addEventListener("refreshQuestions",this.restartData);
		$('#accordion').delegate('.btn-answer', 'click', this.handleQuestionAnswered);
		this.refreshQuestions('all-questions');
		handleListGroup();
  },
	handleScroll: function(e) {    
		this.state.restartData = false;
		if ($(window).scrollTop() + $(window).height() >= $(document).height() - 100 && this.state.hasMore){			
  		this.refreshQuestions($('#main-menu li.active a').attr('id'));
    }
  },
	handleMainMenuClick: function(e){
		this.restartData();
	},
	restartData : function(){		
		this.state.restartData = true;
		this.state.page = 1;
		this.refreshQuestions($('#main-menu li.active a').attr('id'));
	},
  render: function() {
    return (
			<div onScroll={this.handleScroll} id="accordion">
					<QuestionList questions={this.state.data} />
					<div className="loading-modal"></div>
      </div>
    );
  }
});

var QuestionList = React.createClass({	
  render: function() {
		var questionNodes = this.props.questions.map(function (questionNode, i) {
			return (
				<Question key={questionNode._id} question={questionNode}/>
			);
		}, this);		
		 
    return (
      <div className="list-group-questions">
				{questionNodes}
      </div>			
    );
  }
});

var Question = React.createClass({  
	render: function(){
		var questionForAnswerObject = { 
				id : this.props.question._id,
				answers : this.props.question.solutions
		};
		return (
			<div className="list-group-item list-group-item-question" data-id={this.props.question._id} data-parent="#accordion" data-toggle="collapse">
					<QuestionBy question={this.props.question}/>
					<QuestionActions question={this.props.question}/>
					<QuestionContent content={this.props.question.content}/>
					<QuestionSubContent question={this.props.question}/>
					<AnswersBox questionForAnswer={questionForAnswerObject}/>
			</div>
		);
	}
});

var QuestionActions = React.createClass({
	handleQuestionEditClicked: function (questionId) {		
		openEditQuestionPopup(questionId);
	},
	handleQuestionDeleteClicked: function (questionId) {		
		deleteQuestion(questionId);
	},
	render: function(){		
		var floatLeft = { float : 'left' },
				isQuestionCreatedByCurrentUser = this.props.question.user.username == $('#user-name').val();

		return (
			<div style={floatLeft}>
				<span className="glyphicon glyphicon-share-alt clip question-action-copy beautify-tooltip" onclick="onCommentClicked()" data-placement="right" title="Copy to clipboard"/>
				<If condition={isQuestionCreatedByCurrentUser}>
						<span className="glyphicon glyphicon-pencil beautify-tooltip" onClick={this.handleQuestionEditClicked.bind(this, this.props.question._id)} data-placement="right" title="Edit this question?"/>								
				</If>						
				<If condition={isQuestionCreatedByCurrentUser}>
						<span className="glyphicon glyphicon-trash beautify-tooltip" data-placement="right" title="Delete this question?" onClick={this.handleQuestionDeleteClicked.bind(this, this.props.question._id)}/>	
				</If>
			</div>
		);
	}
});

var QuestionBy = React.createClass({
    render: function(){
			
				var question = this.props.question,
						questionLastUpdate = question.updated ? new Date(question.updated).getTime() : new Date(question.created).getTime(),
					  picture = "'" + question.user && question.user.google ? question.user.google.picture :"img/unknown.png",
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

var QuestionContent = React.createClass({
	toggle: function(e) {
		$(e.currentTarget).siblings('.answer-collapsible').collapse('toggle');
	},
	render: function(){	
			return (
				<h4 onClick={this.toggle} className="list-group-item-heading" dangerouslySetInnerHTML={{__html: this.props.content}}></h4>
			);
	}
});

var QuestionSubContent = React.createClass({	
    render: function(){
			var question = this.props.question, subContent;
			
			if(question.tags.length){
				return (
					<QuestionTags tags={question.tags}/>
				);
			}else{
				if(question.solutions.length){
					return (
						<p className="list-group-item-text answer-preview-text">{getShortAnswers(question.solutions)}</p>
					);
				}else{
					return (
						<br/>
					);
				}
			}			
    }
});

var QuestionTags = React.createClass({
	render: function(){
		var tagsNodes = this.props.tags.map(function (tagNode) {
			return (
				<div className="token Tryout">
					<span className={"token-label " + tagNode.replace(/\s/g, "-")}>{tagNode}</span>
				</div>
			);
		});	
			
		return (
			<div className="tags">
				{tagsNodes}
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