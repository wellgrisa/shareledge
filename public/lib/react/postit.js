var PostItBox = React.createClass({	
	getInitialState: function() {
		return {
			data: []
		};
	},
	componentDidMount: function() {				
		document.addEventListener("refreshNotes",this.refresh);
		this.refresh();
	},
	refresh :function(){		
		$.ajax({
			url: '/notes',
			dataType: 'json',						
			success: function(notes) {		
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
	getNote: function(e){
		var noteContainer = $(e.currentTarget).parent();
		
		var note = { 
			title : noteContainer.find('.note-title span').html(),
			text : noteContainer.find('.note-text span').html()
		};
		
		var identifier = noteContainer.attr('id');
		
		if(identifier){
			note.identifier = identifier;
		}
		
		return note;
	},
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
				data: note,
				success: function (result, status, error) {
					
				}
			});
		}else{
			$.post("/notes", note)
			.done(function() {
    		dispatchRefreshNotes();
			});		
		}
	},
	deleteNote: function(e){
		var note = this.getNote(e);
		$.ajax({
			url: '/notes/' + note.identifier,
			type: "DELETE",
			success: function (result, status, error) {
				dispatchRefreshNotes();
			}
		});
	},
	refreshNotes: function(){
	},
  render: function() {	
		
		var note = this.props.note,
				noteLastUpdate = note.updated ? new Date(note.updated).getTime() : new Date(note.created).getTime();
		
    return (			
			<div id={this.props.note._id} className="quote-container">								
				<span className="glyphicon glyphicon-plus label-success post-it-icon add-post-button"></span>				
				<span onClick={this.saveNote} className="glyphicon glyphicon-ok label-success post-it-icon save-post-button"></span>				
				<If condition={this.props.note._id}>					
					<span onClick={this.deleteNote} className="glyphicon glyphicon-trash label-success add-note post-it-icon delete-post-button"></span>
				</If>				
				<If condition={this.props.note._id}>					
					<span className="label label-primary created-date-post post-it-icon">{getLastUpdate(noteLastUpdate)}</span>
				</If>
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
		$('body').delegate('.add-post-button', 'click', this.onAddClicked);				
	},
	onAddClicked: function(){
		this.props.data.push({ title : i18n.t('main-page.notes.title'), text : i18n.t('main-page.notes.text') });
		if (this.isMounted()) {
			this.setState();
		}
	},
  render: function() {
		if(!this.props.data.length){
			this.props.data.push({ title : i18n.t('main-page.notes.title'), text : i18n.t('main-page.notes.text') });
		}
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

function dispatchRefreshNotes(){

	var eventRefreshNotes = document.createEvent("Event");

	eventRefreshNotes.initEvent("refreshNotes",true,true);

	document.dispatchEvent(eventRefreshNotes);
}