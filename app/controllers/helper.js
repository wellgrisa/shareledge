var SearchType = {
	SearchById: "search-by-id",
	MyQuestions: "my-questions",
	MyOutstandingQuestions: "my-outstanding-questions",
	MyAnsweredQuestions: "my-answered-questions",
	OutstandingQuestions: "outstanding-questions",
	AnsweredOutstandingQuestions: "answered-outstanding-questions",
	AllQuestions: "all-questions"
};

exports.getSearchFilter = function(query, section){	
	var searchType = query.searchType;
	switch(searchType){
		case SearchType.MyQuestions:
			return {'user' : true, type : section };			
		case SearchType.MyOutstandingQuestions:
			return {$or : [{"useful": 0}, {"solutions": {$size : 0}}], 'user' : true, type : section};
		case SearchType.MyAnsweredQuestions:
			return {"useful" : {$gt : 0 }, 'user' : true, type : section};
		case SearchType.OutstandingQuestions:
			return {$or : [{"solutions.useful": 0}, {"solutions": {$size : 0}}], type :section};
		case SearchType.AnsweredOutstandingQuestions:
			return {"useful" : {$gt : 0 } , type :section};
		case SearchType.AllQuestions:
			return {type :section};
		case SearchType.SearchById:
			return {'_id' : query.id };
		default:
			return {type :section};
	}
};
