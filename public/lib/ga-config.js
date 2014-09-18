var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-54929836-1']);
_gaq.push(['_trackPageview']);

function ga_event(category, action, opt_label){      
  _gaq.push(['_trackEvent', category, action, opt_label]);
  console.log("*********** Tracking event: " + category + ", " + action + ", " + opt_label);
}

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);      

  // Mapping all elements which have GA Events
  // data-gacategory="Login" data-gaaction="Register" data-galabel="Register new user"
  $('*[data-gacategory]').each(function() {
    var cat = $(this).data("gacategory");
    var action = $(this).data("gaaction");
    var label = $(this).data("galabel");

    var defaultEvent = "click";
    if ($(this).prop("tagName") == "SELECT"){
       defaultEvent = "change";
    }

    $(this).on(defaultEvent, function() {
      ga_event(cat, action, label);
    });

  });

})();