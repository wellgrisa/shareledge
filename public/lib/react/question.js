var QuestionsBox = React.createClass({
	getInitialState: function() {
		return {
			data: [],
			page: 1,
			textSearch: false
		};
	},
	refreshQuestions :function(searchType, restartData){
		console.log(this.state.page);
		$.ajax({
			url: '/questions/outstandingFilter' + location.search,
			dataType: 'json',			
			data: { searchType : searchType, page : this.state.page },
			success: function(data) {
				var questions = restartData ? data.records : this.state.data.concat(data.records);				
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
		debugger;
		window.addEventListener('scroll', this.handleScroll);
		document.getElementById("main-menu").addEventListener("click", this.handleMainMenuClick);
		document.addEventListener("refreshQuestions",this.restartData);
		document.getElementById("question").addEventListener("keyup", this.handleQuestionKeyUp);
		$('body').delegate('.detailed-question', 'keyup', this.handleQuestionKeyUp);
		$('#accordion').delegate('.btn-answer', 'click', this.handleQuestionAnswered);
		
		var initialSearch = getParameterByName('id') ? 'search-by-id' : 'outstanding-questions';
		
		this.refreshQuestions(initialSearch);
		handleListGroup();
	},
	handleQuestionKeyUp: function(){		
		this.state.page = 1;
		this.state.textSearch = true;

		if($.xhrPool.length){
			$.xhrPool.abortAll();
		}

		if(getQuestionTrimmed() == ""){
			$(".nav-sidebar").children(".active").removeClass('active');
			$('#all-questions').parent().addClass('active');
			$('i.glyphicon-search').removeClass('hidden');
			$('img.icon-loading ').addClass('hidden');
			this.restartData();
			return;
		}		

		$('i.glyphicon-search').addClass('hidden');
		$('img.icon-loading ').removeClass('hidden');

		this.refreshQuestionsBySearch(true);
	},
	refreshQuestionsBySearch: function(restartData){
		$(".nav-sidebar").children(".active").removeClass('active');
		$('#all-questions').parent().addClass('active');
		var searchingAjax = $.ajax({
			url: "/question/search",
			data: buildSearchData(this.state.page),
			global: false,
		})
		.success(function( data ) {
			var questions = restartData ? data.records : this.state.data.concat(data.records);				
			this.setState({data: questions});								
			this.state.page ++;
			this.hasMoreItems(data.pagination.totalPages);
			NProgress.done();
			attachClipboardEvent();

			$('i.glyphicon-search').removeClass('hidden');
			$('img.icon-loading ').addClass('hidden');

			var arrayOfTags = getTags();

			jQuery.ajax({
				url: '/addSearchCount',
				type: "PUT",
				global: false,
			});

			for (var i = 0; i < arrayOfTags.length; i++) {
				$('.tags').find('.token-label').filter(function() {
					var c = $(this).attr('class');
					$(this).attr('class', c.toLowerCase());
					return $(this).hasClass(arrayOfTags[i].replace(/\s/g, "-"));
				})
				.addClass('searched-tag');
			}
		}.bind(this))
		.error(function(){
			debugger;
		});
		$.xhrPool.push(searchingAjax)
	},
	handleScroll: function(e) {    		
		if ($(window).scrollTop() + $(window).height() >= $(document).height() - 100 && this.state.hasMore){			
			if(this.state.textSearch){
				this.refreshQuestionsBySearch(false);
			}else{				
				this.refreshQuestions($('#main-menu li.active a').attr('id'), false);
			}
		}
	},
	handleMainMenuClick: function(e){
		$('#example').height(100);
		this.state.textSearch = false;
		this.restartData();
	},
	restartData : function(){				
		this.state.page = 1;
		this.refreshQuestions($('#main-menu li.active a').attr('id'), true);
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
	toggle: function(e) {
		if($(e.target).hasClass('collapsible-element')){
			$(e.currentTarget).children('.answer-collapsible').collapse('toggle');
		}		
	},
	render: function(){
		var questionForAnswerObject = { 
			id : this.props.question._id,
			answers : this.props.question.solutions
		};
		return (
			<div onClick={this.toggle} className="collapsible-element list-group-item list-group-item-question" data-id={this.props.question._id} data-parent="#accordion" data-toggle="collapse">
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
			<span className="no-collapse glyphicon glyphicon-share-alt clip question-action-copy beautify-tooltip" onclick="onCommentClicked()" data-placement="right" title="Copy to clipboard"/>
			<If condition={isQuestionCreatedByCurrentUser}>
			<span className="no-collapse glyphicon glyphicon-pencil beautify-tooltip" onClick={this.handleQuestionEditClicked.bind(this, this.props.question._id)} data-placement="right" title="Edit this question?"/>								
	</If>						
	<If condition={isQuestionCreatedByCurrentUser}>
																				<span className="no-collapse glyphicon glyphicon-trash beautify-tooltip" data-placement="right" title="Delete this question?" onClick={this.handleQuestionDeleteClicked.bind(this, this.props.question._id)}/>	
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
				<span className="no-collapse label pointer label-success beautify-tooltip" style={spanStyle} title={"Created in: " + toDateTime(question.created)} data-placement="left">{getLastUpdate(questionLastUpdate)}</span>		
				<img data-toggle="dropdown" className="no-collapse img-responsive panel-user beautify-tooltip img-circle" src={picture} alt="" data-placement="left" title={question.user.username} data-original-title="Tooltip on left"/>
		 	</div>
		);
}
});

var QuestionContent = React.createClass({	
	render: function(){	
		return (
			<h4 className="list-group-item-heading collapsible-element" dangerouslySetInnerHTML={{__html: this.props.content}}></h4>
		);
	}
});

var QuestionSubContent = React.createClass({	
	render: function(){
		var question = this.props.question, subContent;

		if(question.tags && question.tags.length){
			return (
				<QuestionTags tags={question.tags}/>
			);
		}else{
			if(question.solutions.length){
				return (
					<p className="list-group-item-text answer-preview-text collapsible-element">{getShortAnswers(question.solutions)}</p>
				);
			}else{
				return (
					<br className="collapsible-element"/>
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
				<div className="tags collapsible-element">
				{tagsNodes}
																					 </div>
																					);
		}
	});

var If = React.createClass({
	render: function() {
		if (this.props.condition) {
			return this.props.children;
		}else {
	 		return false;
	 	}
 	}
});

React.render(
	<QuestionsBox url="/question"/>,  
	document.getElementById('example')
);

function getQuestionMade(){
	if($('#main-navbar').next('div.popover.in').length){
		return {
			content : $('.detailed-question').html(),
			tags : $('.detailed-question-popover .tokenfield').length ? tidyTagsUp($('.detailed-question-popover .tokenfield').tokenfield('getTokensList').split(',')) : ""
		};
	}else{
		return {
			content : $('#question').val(),
			tags : $('.simple-question-popover .tokenfield').length ? tidyTagsUp($('.simple-question-popover .tokenfield').tokenfield('getTokensList').split(',')) : ""
		};
	}
}

function dispatchRefreshQuestions(){

	var eventRefreshQuestions = document.createEvent("Event");

	eventRefreshQuestions.initEvent("refreshQuestions",true,true);

	document.dispatchEvent(eventRefreshQuestions);
}