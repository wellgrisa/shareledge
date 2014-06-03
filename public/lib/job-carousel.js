/* Carousel
=============================*/
var jobCarousel = function() {
    var jobsResult = {},
        jobBox = $("#jobBox"),
        jobPag = $("#jobPag");

    function buildCarouselJob(){
        jobBox.carouFredSel({
            responsive  : true,
            scroll      : 1,
            items       : {
                visible     : 1,
                width       : 245
            }, 
            prev: {
                button: $('.arrow-left', '.vacancy-arrows'),
                items: 1
            },              
            next:{
                button: $('.arrow-right', '.vacancy-arrows'),
                items: 1
            },
            pagination  : jobPag,
        });
    }
    
    function getJobsData(){
        return $.getJSON('/jobs');
    }
    
    function buildHtmlJobs(){
        
        var jobs = jobsResult.data;

        for (var i = 0; i < jobs.length; i++) {
            var job = jobs[i];
            if(job) {
                // picture
                var image = '\
                        <li>\n\
                            <div class="vaga blue text-center">\n\
                                <p>\n\
                                <br>\n\
                                <img class="vacancy-icon img-responsive" src="' + job.icon + '">\n\
                                <span>' + job.topTitle + '</span>\n\
                                <br>\n\
                                <strong>' + job.title + '</strong>\n\
                                <br>\n\
                                <a href="#applicationModal" onclick="onButtonClick(this)" data-toggle="modal" id=' + job._id + ' class="btn btn-lg purple white-text i-want">' + jobsResult.applyNowText + '</a>\n\
                                </p>\n\
                            </div>\n\
                        </li>';
                jobBox.append(image);
            }
        };
    } 

    
    (function init(){
        $.when(getJobsData()).done(function(result){
            jobsResult = result;
            buildHtmlJobs();
            buildCarouselJob();
        });
    }());
};