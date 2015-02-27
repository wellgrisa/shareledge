var PostItBox = React.createClass({	
	getInitialState: function() {
		return {
			data: []
		};
	},
	componentDidMount: function() {				
		this.refresh();
	},
	refresh :function(){		
		$.ajax({
			url: '/notes',
			dataType: 'json',						
			success: function(notes) {
				debugger;
				this.setState({data: notes});
				
				NProgress.done();
				
			}.bind(this),
			error: function(xhr, status, err) {
				console.error(this.props.url, status, err.toString());
			}.bind(this)
		});		
	},
  render: function() {
    return (
			<div id="post-it-box">				
				<Notes data={this.state.data}/>
      </div>
    );
  }
});

var PostItContent = React.createClass({
	saveNote: function(e){
		var noteContainer = $(e.currentTarget).parent();
		
		var note = { 
			title : noteContainer.find('.note-title span').html(),
			text : noteContainer.find('.note-text span').html()
		};
		
		var identifier = noteContainer.attr('id');
		
		if(identifier){
			var url = '/notes/' + identifier;

			$.ajax({
				url: url,
				type: "PUT",
				data: note
			});
		}else{
			$.post("/notes", note);		
		}
	},
	onClick: function(){
		this.props.test(this);
	},
  render: function() {				
    return (			
			<div id={this.props.note._id} className="quote-container">
				<If condition={this.props.note._id}>
					<div className="closebutton"></div>
				</If>				
				<div onClick={this.saveNote} className="closebutton addbutton"></div>
				<i className="pin"></i>
				<div className="note yellow">					
					<div className="note-title" dangerouslySetInnerHTML={{__html: "<span contenteditable='true'>" + this.props.note.title + "</span>"}} />
					<div className="note-text" dangerouslySetInnerHTML={{__html: "<span contenteditable='true'>" + this.props.note.text + "</span>"}} />
				</div>
			</div>			
    );
  }
});

var Notes = React.createClass({		
	componentDidMount: function() {		
		$('body').delegate('.add-note', 'click', this.onAddClicked);				
	},
	onAddClicked: function(){
		this.props.data.push({ title : 'Title', text : 'Put your text here' });
		this.setState();
	},
  render: function() {		
		
		var notes = this.props.data.map(function (note) {			
			return (
				<PostItContent test={this.onAddClicked} key={note._id} note={note}/>
			);
		}, this);
		
    return (			
			<div className="notes">
				{notes}
			</div>			
    );
  }
});