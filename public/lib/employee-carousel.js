/* Carousel
=============================*/
var employeeCarousel = function() {
  var employees = [],
    employeePicturesBox = $("#employee"),
    employeeMessagesBox = $("#employee-text");
   
   function getCenterThumb() {
       var $visible = employeePicturesBox.triggerHandler( 'currentVisible' );
       var center = $visible ? Math.floor($visible.length / 2) : 0;
       return center;
   }

  function showCurrent(){
     var pos = getCenterThumb();
     pos = pos + employeePicturesBox.triggerHandler( 'currentPosition' ) ;
     return pos;
  }

  function openItem( $item ) {
     $item.find( 'div[class*="foto"]' ).stop().css( "background-position", "bottom center" );
     $item.addClass( 'selected' );
  }

  function getEmployees(){
    return $.getJSON('/employees');
  }


  function buildHtmlEmployees(){
    for (var i = 0; i < employees.length; i++) {
      var employee = employees[i];
      if(employee) {
        // picture
        var picture = '<li><div class="foto"  style="background: url(\'' + employee.picture+'\')"></div></li>';
        employeePicturesBox.append(picture);

        // message
        var message ='<li><p class="nome">'+ employee.name +'</p><p>'+ employee.message +'</p></li>';
        employeeMessagesBox.append(message);
      }
    };
  }

  function buildCarouselPictures(startIndex){
    employeePicturesBox.carouFredSel({
      responsive:true,
       prev : "left",
       next : "right",
       width: '100%',
       items: {
         start: startIndex,
         visible: { width:120, min: 2, max: 8 }
       },
       scroll: {
         items: 1,
         duration: 1000,
         easing: 'quadratic',
         onBefore: function( data ) {
             data.items.old.find( 'div[class*="foto"]' ).stop().css( "background-position", "top center" ).fadeIn( "slow" );
             data.items.old.removeClass( 'selected' );
             employeeMessagesBox.trigger('slideTo', [ showCurrent(), { fx: 'directscroll' }, 'next' ]);
         },
         onAfter: function( data ) {
             openItem( data.items.visible.eq(  getCenterThumb() ) );
         }
       },
       onCreate: function( data ) {
           openItem( data.items.eq(  getCenterThumb() ) );
       }
    }).find("li").click(function() {
       employeePicturesBox.trigger("slideTo", [$(this),-getCenterThumb()]);
    }).css("cursor", "pointer");
  }

  function buildCarouselMsgs(startIndex){
    employeeMessagesBox.carouFredSel({
    responsive:true,
    auto:false,
    width: '100%',
    items: {
      start:(startIndex+getCenterThumb()),
      visible: { min: 1, max: 1 }
    },
    scroll: { items: 1, duration: 1000, easing: 'quadratic' }
    });
  }

  // run when has initialized
  (function init(){
    $.when(getEmployees()).done(function(data){
        employees = data;
        var rand = Math.floor((Math.random()*employees.length)+1);
        buildHtmlEmployees();
        buildCarouselPictures(rand);
        buildCarouselMsgs(rand);
    });
  }());
}