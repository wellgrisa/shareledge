var DashboardBox = React.createClass({
  render: function() {
    return (
			<div id="dashboard-box">
				<DashboardContent data={this.props.data}/>
				<DashboardRank users={this.props.data.users}/>
      </div>
    );
  }
});

var DashboardContent = React.createClass({
	buildTagsPanel: function(tags) {
		if (tags.length == 0){
			return <h6>No items to show</h6>
		}else{			
			return tags.map(function (tag, i) {
				return (					
					<Tag tag={tag}/>
				);
			}, this);		
		}	
	},
  render: function() {
		var tagsPanelStyle = {paddingBottom: '17px;'}
		
    return (
			<div id="dashboard-content">
				<div className="row">
						<div className="col-lg-9 col-sm-8">                    
								<div className="panel panel-default">                
										<div className="panel-heading">
												<h4>Overall question data</h4>
										</div> 

										<div className="panel-body">
												<div className="col-xs-12 col-md-4">            
														<div className="panel status panel-warning">
																<div className="panel-heading">
																		<h1 className="panel-title text-center">{this.props.data.sinceFirstRelease}</h1>
																</div>
																<div className="panel-body text-center">                        
																		Since Knowhow release
																</div>
														</div>
												</div>         
												<div className="col-xs-12 col-md-4">           
														<div className="panel status panel-success">
																<div className="panel-heading">
																		<h1 className="panel-title text-center">{this.props.data.lastMonthQuestions}</h1>
																</div>
																<div className="panel-body text-center">                        
																		Last month questions
																</div>
														</div>         
												</div>
												<div className="col-xs-12 col-md-4">          
														<div className="panel status panel-info">
																<div className="panel-heading">
																		<h1 className="panel-title text-center">{this.props.data.helpedPeople}</h1>
																</div>
																<div className="panel-body text-center">                        
																		Helped people :)
																</div>
														</div>         
												</div>
										</div>
								</div>
						</div>  
						<div className="col-lg-3 col-sm-4">                    
								<div className="panel panel-default">                
										<div className="panel-heading">
												<h4>More asked tags</h4>

												<div className="panel-actions">
														<a href="index.html#" className="btn-setting"><i className="icon-settings"></i></a>
														<a href="index.html#" className="btn-minimize"><i className="icon-arrow-up"></i></a>
														<a href="index.html#" className="btn-close"><i className="icon-close"></i></a>
												</div>

										</div>
														
										<div className="panel-body" style={tagsPanelStyle}>
											<DashboardTags tags={this.props.data.tags} />
										</div>

								</div>      
						</div>      
				</div>				
      </div>
    );
  }
});

var DashboardTags = React.createClass({
			render: function(){
				var tagsNodes = this.props.tags.map(function (tagNode) {
					return (
						<div className="token searched-tag">
							<span className="token-label">{tagNode._id + " (" + tagNode.count + ")"}</span>
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

var DashboardRank = React.createClass({
	render: function(){
		return (
			<div className="row">
					<div className="col-lg-12 col-sm-8"> 
							<div className="panel panel-default">
									<div className="panel-heading">
											<h4>Ranking</h4>
									</div>              
									<DashboardRankTable users={this.props.users}/>       
							</div>
					</div>
			</div>
		);
	}
});

var DashboardRankTable = React.createClass({
			render: function(){
				var users = this.props.users.map(function (user) {
					return (
						<tr>
								<td className="h2 description">
									{user.position}
								</td>
								<td className="description">
										<img className="img-circle img-ranking" src={user.photo} alt=""/>
										<span className="h4">{user.name}</span>
								</td>
								<td className="h2 description">
										<span className="sucess points">
											{user.points}
										</span>
								</td>
						</tr>
					 );
			});	

			return (
				<div className="table-responsive">
						<table className="table table-striped">
								<thead>
										<tr>
												<th></th>
												<th></th>
												<th>Points</th>
										</tr>
								</thead>
								<tbody>
									{users}
								</tbody>
						</table>
				</div>  
			);
	}
});