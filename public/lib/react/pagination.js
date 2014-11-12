var dom = React.DOM;

function range(start, stop) {
  if (arguments.length <= 1) {
    stop = start || 0;
    start = 0;
  }

  var length = Math.max(stop - start, 0);
  var idx = 0;
  var arr = new Array(length);

  while(idx < length) {
    arr[idx++] = start;
    start += 1;
  }

  return arr;
}

var Paginator = React.createClass({

  getDefaultProps: function() {
    return {
      maxPages: 3
    };
  },

	getInitialState: function() {
		return {
			page: 1
		};
	},

  /**
   * Triggered by any button click within the paginator.
   *
   * @param {number} n - Page number
   */
	onClick: function(n) {
    // n is out of range, don't do anything
		if (n > this.props.numPages || n < 1) return;
    if (this.props.onClick) this.props.onClick(n);
		this.setState({ page: n });
	},

  /**
   * Returns the number of page numbers
   */
  getDisplayCount: function() {
    if (this.props.numPages > this.props.maxPages) {
      return this.props.maxPages;
    }
    return this.props.numPages;
  },

  /**
   * Returns a range [start, end]
   */
  getPageRange: function() {
		var displayCount = this.getDisplayCount();
    var page = this.state.page;

    // Check position of cursor, zero based
    var idx = (page - 1) % displayCount;

    // list should not move if cursor isn't passed this part of the range
    var start = page - idx;

    // remaining pages
    var remaining = this.props.numPages - page;

    // Don't move cursor right if the range will exceed the number of pages
    // in other words, we've reached the home stretch
    if (page > displayCount && remaining < displayCount) {
      // add 1 due to the implementation of `range`
      start = this.props.numPages - displayCount + 1;
    }

    return range(start, start + displayCount);
  },

  preventDefault: function(e) {
    e.preventDefault();
  },

	render: function() {
    var page = this.state.page;
		var prevClassName = page === 1 ? 'disabled' : '';
		var nextClassName = page >= this.props.numPages ? 'disabled' : '';

    return (
      React.DOM.ul({className: "pagination"}, 
        React.DOM.li({className: prevClassName, onClick: this.onClick.bind(this, page - 1)}, 
          React.DOM.a({href: "#", onClick: this.preventDefault}, React.DOM.i({className: "glyphicon glyphicon-chevron-left"}))
        ), 
        this.getPageRange().map(this.renderPage, this), 
        React.DOM.li({className: nextClassName, onClick: this.onClick.bind(this, page + 1)}, 
          React.DOM.a({href: "#", onClick: this.preventDefault}, React.DOM.i({className: "glyphicon glyphicon-chevron-right"}))
        )
      )
    );
	},

  renderPage: function(n, i) {
    var cls = this.state.page === n ? 'active' : '';
    return (
      React.DOM.li({key: i, className: cls, onClick: this.onClick.bind(this, n)}, 
        React.DOM.a({href: "#", onClick: this.preventDefault}, n)
      )
    );
  }
});

React.renderComponent(<Paginator maxPages="3" numPages="5" />, document.querySelector('#pagination'));