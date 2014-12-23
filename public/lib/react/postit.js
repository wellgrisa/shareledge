var PostItBox = React.createClass({
  render: function() {
    return (
			<div id="post-it-box">				
				<PostItContent/>
      </div>
    );
  }
});

var PostItContent = React.createClass({
  render: function() {				
    return (
			<div id="post-it-content">
				<div className="post-it">
					<div className="addbutton"></div>
					<div className="closebutton"></div>
					<div dangerouslySetInnerHTML={{__html: "<h1 contenteditable='true'>Test</h1><div contenteditable='true'/>"}} />
				</div>
      </div>
    );
  }
});

