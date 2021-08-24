/* JS by
Jason Lockhart
Erik Miller */

//global variables
var accessDOM = {},
		// accessProps = {},
		resourceInputs = {},
		breadcrumbInputs = {},
		subnavInputs = {},
		navInputs = {},
		accessInputs = {},
		pageScrollLoc = {},
		vtfChoices = [],
		vtFundOutput = {};

// modal timers
var eventStartTime = (window.eventStartYear && window.eventStartMonth && window.eventStartDay) 
		? (Date.UTC(window.eventStartYear, window.eventStartMonth - 1, window.eventStartDay)) : undefined,
	eventEndTime = (window.eventEndYear && window.eventEndMonth && window.eventEndDay) 
		? (Date.UTC(window.eventEndYear, window.eventEndMonth - 1, window.eventEndDay)) : undefined;


// accessProps.navWasOpen = 0;

//get cookie value function
function getCookie(cname) {
	var name = cname + "=";
	var decodedCookie = decodeURIComponent(document.cookie);
	var ca = decodedCookie.split(';');
	for(var i = 0; i <ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) === ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) === 0) {
			return c.substring(name.length, c.length);
		}
	}
	return "";
}

function setCookie(cname, cvalue, exdays) {
	var d = new Date();
	d.setTime(d.getTime() + (exdays*24*60*60*1000));
	var expires = "expires="+d.toUTCString();
	document.cookie = cname + "=" + cvalue + "; " + expires + "; path=/";
}

//universal access mode
function accessMode() {
	//if window width <768
	if (window.innerWidth < 768 && $(".vt-one-preHeader > .vt-universal-access").length > 0) {
		accessDOM = $(".vt-universal-access").detach();
		$(".header").not("table .header").prepend(accessDOM);
		$(".vt-universal-access").addClass("mobile");
		$(".vt-universal-access .vt-access-toggle").wrap('<div class="vt-access-toggle-wrapper"></div>');
	} else if (window.innerWidth >= 768 && $(".vt-one-preHeader > .vt-universal-access").length == 0) {
		$(".vt-universal-access .vt-access-toggle").unwrap();
		$(".header").not("table .header").remove("> .vt-universal-access");
		$(".vt-one-preHeader").prepend(accessDOM);
		$(".vt-universal-access").removeClass("mobile");
	}
}

//universal access toggle -- LEAVE COMMENTED BITS IN CASE CHANGES NEEDED LATER
function accessToggle() {

	if($( ".vt-search-wrapper" ).is( ":visible" )) {
		searchToggle();
	}
	
	if ($(".vt-nav-toggle").attr("aria-expanded") === "true") {
		navToggle();
	}

	if($(".vt-access-dialog-wrapper").is( ":hidden" )) {
		// if ($(".vt-nav-toggle").attr("aria-expanded") === "true") {
		// 	accessProps.navWasOpen = 1;
		// 	navToggle();
		// }
		// var elScroll = document.getElementById("vt_access_dialog");
		pageScrollLoc.position = window.pageYOffset;
		$(document).scrollTop(0);
		$(".vt-universal-access, .vt-access-dialog-wrapper").addClass("open");
		$(".vt-access-toggle-wrapper").addClass("d-none");
		$("#vt_access_dialog").attr("aria-hidden", "false");
		$(".vt-access-toggle, .vt-access-dialog-label, .vt-actions-header, .vt-one-headerRow, .vt-page-path, main, footer").attr("aria-hidden", "true");
		$("body").addClass("vt-bodyNoScroll");
		disableBodyScroll(true, '#vt_access_dialog');
		$("#vt_access_dialog").css("-webkit-overflow-scrolling", "touch");
		$("#vt_access_dialog a, #vt_access_dialog button").removeAttr("tabindex");
		$(".vt-access-dialog-close").focus();
		accessInputs = $("#vt_access_dialog.open").find('a, button').filter(':visible');
	}	else {
		window.scrollTo(0, pageScrollLoc.position);
		$(".vt-universal-access, .vt-access-dialog-wrapper").removeClass("open");
		$(".vt-access-toggle-wrapper").removeClass("d-none");
		$("#vt_access_dialog").attr("aria-hidden", "true");
		$(".vt-access-toggle, .vt-access-dialog-label, .vt-actions-header, .vt-one-headerRow, .vt-page-path, main, footer").removeAttr("aria-hidden");
		$("#vt_access_dialog a, #vt_access_dialog button").attr("tabindex", "-1");
		$("body").removeClass("vt-bodyNoScroll");
		$("#vt_offcanvas_nav").css("-webkit-overflow-scrolling", "auto");
		$(".vt-access-toggle").focus();
		disableBodyScroll(false);
		// if(accessProps.navWasOpen > 0) {
		// 	navToggle();
		// 	accessProps.navWasOpen = 0;
		// }
	}
}

//link underline toggle
function linkUnderlineToggle() {
	if (getCookie("underlineToggle") == 0) {
		setCookie("underlineToggle", 1, 365);
		$("head").append('<link rel="stylesheet" id="vt_underline_links_css" href="//www.assets.cms.vt.edu/css/underlineLinks.css" type="text/css">');
		$(".vt-access-options").addClass("vt-underline");
		$("#vt_ua_underlineLinks").attr("aria-pressed", "true");
	} else {
		$("#vt_underline_links_css").remove();
		$(".vt-access-options").removeClass("vt-underline");
		setCookie("underlineToggle", 0, 365);
		$("#vt_ua_underlineLinks").attr("aria-pressed", "false");
	}
}
		

function givingToggle(){

	accessToggle();
	$(".vt-access-dialog").hide();
	var modal = $("<div class='vt-basicModal vt-bg-light'><div class='vt-giving-radioUI'></div></div>").css({
		"opacity": "0",
		"margin-top": "20px",
	});
	var button = $('<button class="vt-basicModal-closeBtn" tabindex="-1" aria-label="Close giving form dialog"><span class="far fa-times" focusable="false" aria-hidden="true"></span><span class="sr-only">Close giving form dialog</span></button>');
	modal.append(button);
	$(".vt-access-dialog-wrapper").append(modal);
	modal.animate({
		opacity: 1,
		"margin-top": "-=20"
	}, 300);
	button.click(function(){
		accessToggle();
		$(".vt-access-dialog").show();
		$(".vt-basicModal").hide();
		//setCookie(cname, cvalue, exdays)
		setCookie("noGift", "true", 1);
	});


}


//resources for toggle
function resourcesToggle() {
	if($(".vt-one-preHeader .vt-resources-toggle").attr("aria-expanded") === "false" && $("#vt_offcanvas_nav .vt-resources-for-wrapper").is(":visible") === false) {
		$(".vt-one-preHeader .vt-resources-toggle").attr("aria-expanded","true");
		$("#vt_header_resources_options").attr("aria-hidden","false");
		$(".vt-one-preHeader .vt-resources-options").removeClass("closed").addClass("open");
		resourceInputs = $(".vt-one-preHeader .vt-resources-options").find('a').filter(':visible');
		$(resourceInputs.first()).focus();
	} else {
		$(".vt-one-preHeader .vt-resources-toggle").attr("aria-expanded","false");
		$("#vt_header_resources_options").attr("aria-hidden","true");
		$(".vt-one-preHeader .vt-resources-options").removeClass("open").addClass("closed");
		$(".vt-one-preHeader .vt-resources-toggle").focus();
	}

	if($("#vt_offcanvas_nav .vt-resources-toggle").attr("aria-expanded") === "false" && $(".vt-one-preHeader").is(":visible") === false) {
		$("#vt_offcanvas_nav .vt-resources-toggle").attr("aria-expanded","true");
		$("#vt_nav_resources_options a").removeAttr("tabindex");
		$("#vt_offcanvas_nav .vt-resources-toggle .fa-times").removeClass("rotate");
		$("#vt_nav_resources_options").attr("aria-hidden","false");
		$("#vt_offcanvas_nav .vt-resources-options").removeClass("closed").addClass("open");
		navInputs = $("#vt_offcanvas_nav.open").find('a, button').filter(':visible');
	} else if($("#vt_offcanvas_nav .vt-resources-toggle").attr("aria-expanded") === "true" && $(".vt-one-preHeader").is(":visible") === false) {
		$("#vt_offcanvas_nav .vt-resources-toggle").attr("aria-expanded","false");
		$("#vt_nav_resources_options a").attr("tabindex", "-1");
		$("#vt_offcanvas_nav .vt-resources-toggle .fa-times").addClass("rotate");
		$("#vt_nav_resources_options").attr("aria-hidden","true");
		$("#vt_offcanvas_nav .vt-resources-options").removeClass("open").addClass("closed");
		navInputs = $("#vt_offcanvas_nav.open").find('a, button').filter(':visible');
	}
}

//nav toggle
function navToggle() {
	if ($(".vt-nav-toggle").attr("aria-expanded") === "false") {

		if($( ".vt-search-wrapper" ).is( ":visible" )) {
			setTimeout(function() {
			}, 200);
			$(document).scrollTop(0);
			searchToggle();
		}

		$(document).scrollTop(0);
		$( "main, footer" ).animate({
			"left" : "-=320px",
	 	 },200);
	 	$( ".vt-page-path" ).animate({
		"left" : "-=320px",
		"margin-right" : "0"
  		},200);
		$(".vt-nav-toggle").attr("aria-expanded", "true");
		$(".vt-nav-toggle .menu-open").addClass("d-none");
		$(".vt-nav-toggle .menu-close").removeClass("d-none");
		$(".vt-universal-access, .vt-access-dialog-wrapper").addClass("menuOpen");
		$(".vt-nav-toggle, #vt_offcanvas_nav, #vt_nav").addClass("open");
		$("body").addClass("vt-bodyNoScroll");
		$('.vt-page-path > .gateway, .vt-page-path > .vt-subnav, main > div[class*="-content"], main > .row, footer > .row').attr("aria-hidden", "true");
		$("#vt_offcanvas_nav").attr("aria-hidden", "false");
		$("#vt_offcanvas_nav").show();
		navInputs = $("#vt_offcanvas_nav.open").find('a, button').filter(':visible');
		$("#vt_offcanvas_nav, #vt_offcanvas_nav a:not('.vt-option-link'), #vt_offcanvas_nav button").removeAttr("tabindex");
		disableBodyScroll(true, '#vt_offcanvas_nav');
		$("#vt_offcanvas_nav").css("-webkit-overflow-scrolling", "touch");
		$(".vt-nav-toggle").focus();
		$(".vt-page-path").append('<section class="vt-pageContext-modal" aria-label="Disabled Main Content"><button class="vt-modal-close" aria-controls="menuDrawer searchDrawer" onclick="javascript:modalToggle();">Close Menu or Search drawer to access content</button></section>');
		$("main").append('<section class="vt-body-modal" aria-label="Disabled Main Content"><button class="vt-modal-close" aria-controls="menuDrawer searchDrawer" onclick="javascript:modalToggle();">Close Menu or Search drawer to access content</button></section>');
		$("footer").append('<section class="vt-footer-modal" aria-label="Disabled Footer Content"><button class="vt-modal-close" aria-controls="menuDrawer searchDrawer" onclick="javascript:modalToggle();">Close Menu or Search drawer to access content</button></section>');
	} else {
		$(".vt-nav-toggle, .fold-icon").attr("aria-expanded", "false");
		$(".vt-nav-toggle .menu-open").removeClass("d-none");
		$(".vt-nav-toggle .menu-close").addClass("d-none");
		$("#vt_offcanvas_nav, #vt_offcanvas_nav a, #vt_offcanvas_nav button").attr("tabindex", "-1");
		$('.vt-page-path > .gateway, .vt-page-path > .vt-subnav, main > div[class*="-content"], main > .row, footer > .row').removeAttr("aria-hidden");
		$("body").removeClass("vt-bodyNoScroll");
		$(".vt-universal-access, .vt-access-dialog-wrapper").removeClass("menuOpen");
		$("#vt_offcanvas_nav, .vt-nav-toggle, #vt_nav").removeClass("open");
		$("#vt_offcanvas_nav").attr("aria-hidden", "true");
		$( "main, footer" ).animate({
			"left" : "+=320px"
	  }, 200, function() {
	    $("#vt_offcanvas_nav").hide();
	  });
	  $( ".vt-page-path" ).animate({
		"left" : "+=320px",
		"margin-right" : "-15px"
  	  }, 200, function() {
		$("#vt_offcanvas_nav").hide();
  	  });
		$(".vt-body-modal, .vt-footer-modal, .vt-pageContext-modal").remove();
		$(".has-submenu .link-wrapper").removeClass("active");
		disableBodyScroll(false);
		$("#vt_offcanvas_nav").css("-webkit-overflow-scrolling", "auto");
		$(".vt-nav-toggle").focus();
	}
}

//nav fold-icon toggle
function foldAction(clicked) {
	if ($(clicked).attr("aria-expanded") === "true") {
		$(clicked).attr("aria-expanded", "false");
		$(clicked).parent().removeClass("active");
		navInputs = $("#vt_offcanvas_nav.open").find('a, button').filter(':visible');
	} else {
		$("#vt_main_nav .fold-icon").attr("aria-expanded", "false");
		$(".link-wrapper").removeClass("active");
		$(clicked).attr("aria-expanded", "true");
		$(clicked).parent().addClass("active");
		navInputs = $("#vt_offcanvas_nav.open").find('a, button').filter(':visible');
	}
}

//search toggle
function searchToggle() {

	if ($(".vt-nav-toggle").attr("aria-expanded") === "true") {
		$(document).scrollTop(0);
		navToggle();
	}

	if ( $( "#vt_header_search_form" ).is( ":hidden" ) ) {
		$(".vt-search-toggle").attr("aria-expanded", "true");
		$("#vt_header_search").addClass("open");
		$( ".vt-search-wrapper" ).slideDown( "fast" );
		$(".vt-search-toggle .search-open").addClass("d-none");
		$(".vt-search-toggle .search-close").removeClass("d-none");
		$("body").addClass("vt-bodyNoScroll");
		$('.vt-page-path > .gateway, .vt-page-path > .vt-subnav, main > div[class*="-content"], main > .row, footer > .row').attr("aria-hidden", "true");
		$(".vt-page-path").append('<section class="vt-pageContext-modal" aria-label="Disabled Main Content"><button class="vt-modal-close" aria-controls="menuDrawer searchDrawer" onclick="javascript:modalToggle();">Close Menu or Search drawer to access content</button></section>');
		$("main").append('<section class="vt-body-modal" aria-label="Disabled Main Content"><button class="vt-modal-close" aria-controls="menuDrawer searchDrawer" onclick="javascript:modalToggle();">Close Menu or Search drawer to access content</button></section>');
		$("footer").append('<section class="vt-footer-modal" aria-label="Disabled Footer Content"><button class="vt-modal-close" aria-controls="menuDrawer searchDrawer" onclick="javascript:modalToggle();">Close Menu or Search drawer to access content</button></section>');
		$(".vt-page-path, main, footer").addClass("vt-searchOpen");
		$("#vt_search_box").focus();
		setTimeout(function() {
		}, 600);
	} else {
		setTimeout(function() {
		}, 200);
		$(".vt-search-toggle").attr("aria-expanded", "false");
		$( ".vt-search-wrapper" ).slideUp("fast");
		$("#vt_header_search").removeClass("open");
		$(".vt-search-toggle .search-close").addClass("d-none");
		$(".vt-search-toggle .search-open").removeClass("d-none");
		$(".vt-body-modal, .vt-footer-modal, .vt-pageContext-modal").remove();
		$('.vt-page-path > .gateway, .vt-page-path > .vt-subnav, main > div[class*="-content"], main > .row, footer > .row').removeAttr("aria-hidden");
		$("body").removeClass("vt-bodyNoScroll");
		$(".vt-page-path, main, footer").removeClass("vt-searchOpen");
		$(".vt-search-toggle").focus();
	}
}

//modal click to close nav or search
function modalToggle() {

	if ($(".vt-nav-toggle").attr("aria-expanded") === "true") {
		$(document).scrollTop(0);
		navToggle();
	}

	if($( ".vt-search-wrapper" ).is( ":visible" )) {
		setTimeout(function() {
		}, 200);
		$(document).scrollTop(0);
		searchToggle();
	}

}

function breadcrumbMode() {
	//if window width <768
	if (window.innerWidth < 768 && $(".vt-breadcrumbs-mobileToggle").length == 0) {
		$(".gateway").append('<button class="vt-breadcrumbs-mobileToggle" aria-controls="vt_navtrail" aria-expanded="false" onclick="javascript:breadcrumbToggle();" aria-label="Breadcrumb toggle"> <span class="vt-breadcrumbs-toggleLabel sr-only">Breadcrumb toggle</span> <span class="vt-breadcrumbs-open" aria-hidden="true" focusable="false" role="img">&#183;&#183;&#183;</span> <span class="vt-breadcrumbs-close d-none" aria-hidden="true" focusable="false" role="img">X</span></button>');
		$("#vt_navtrail a").attr("tabindex", "-1");
		$("#vt_navtrail .vt-breadcrumbs-item:first-of-type .vt-breadcrumbs-link").removeAttr("tabindex");
	} else if (window.innerWidth >= 768){
		$(".vt-breadcrumbs-mobileToggle").remove();
		$("#vt_navtrail a").removeAttr("tabindex");
		$("#vt_navtrail").removeClass("open");
	}

	//hide all but main site if custom-errors
	if ($("#vt_navtrail").find('a[href*="custom-errors"]').length > 0) {
		$("#vt_navtrail").find('a[href*="custom-errors"]').parent().addClass("d-none");
		$(".vt-breadcrumbs-item").filter(":visible").last().find(".breadcrumb-slash").addClass("d-none");

		//hide custom erros in Explore menu also
		if ($(".vt-subnav").find("a[href*='custom-errors']").length > 0) {
			$(".vt-subnav").find("a[href*='custom-errors']").parent().remove();
		}
	}
}

function breadcrumbToggle() {
	if ($(".vt-breadcrumbs-mobileToggle").attr("aria-expanded") === "false") {

	  $(".vt-breadcrumbs-mobileToggle").attr("aria-expanded", "true");
	  $(".vt-breadcrumbs-mobileToggle .vt-breadcrumbs-open").addClass("d-none");
	  $(".vt-breadcrumbs-mobileToggle .vt-breadcrumbs-close").removeClass("d-none");
	  $("#vt_navtrail").addClass("open");
	  $("#vt_navtrail a").removeAttr("tabindex");
		breadcrumbInputs = $(".gateway").find('a, button').filter(':visible');
	  $(".vt-breadcrumbs-mobileToggle").focus();

	} else {

	  $(".vt-breadcrumbs-mobileToggle").attr("aria-expanded", "false");
	  $(".vt-breadcrumbs-mobileToggle .vt-breadcrumbs-close").addClass("d-none");
	  $(".vt-breadcrumbs-mobileToggle .vt-breadcrumbs-open").removeClass("d-none");
	  $("#vt_navtrail").removeClass("open");
	  $("#vt_navtrail a").attr("tabindex", "-1");
		$("#vt_navtrail .vt-breadcrumbs-item:first-of-type .vt-breadcrumbs-link").removeAttr("tabindex");
	  $(".vt-breadcrumbs-mobileToggle").focus();

	}
}

function subnavToggle() {
	var elArr = [".vt-subnav", ".vt-subnav-droplist-title", ".vt-subnav-droplist-control", ".vt-subnav-droplist, .vt-subnav-symbol-container, .vt-subnav-page-title"];

	if(!$(".vt-subnav-droplist-control").hasClass("open")) {
		addClassNameToSet(elArr, "open");
		$(".vt-subnav-droplist-control").attr("aria-expanded", true);
		subnavInputs = $("#vt_subnav.open").find('a, button').filter(':visible');
	} else {
		removeClassNameFromSet(elArr, "open");
		$(".vt-subnav-droplist-control").attr("aria-expanded", false);
	}
}


//get the fund numbers associated with tags on page and put into body form pulldown
function vtGiveFundNumbers(choices) {
	var vtFundChoices = choices,
			vtFundOutputIndex = [];

	vtFundChoices.forEach(function(item, index, array) {
		var thisItem = item;
		vtFundNumbers.forEach(function(item, index, array) {
			if (thisItem == item) {
				vtFundOutputIndex.push(index);
			}
		});
	});
	
	vtFundOutputIndex.forEach(function(item, index, array) {
		vtFundOutput.select += '<option value="'+vtFundNumbers[vtFundOutputIndex[index]]+'">'+vtFundNames[vtFundOutputIndex[index]]+'</option>';
	});
	
		var vtFundUnmatched = (((vtFundOutput.select).match(/undefined/g) || []).length) - 1;
		console.log(vtFundUnmatched); //error checking in case a tag fails, number in console should be zero if all is well
	vtFundOutput.select = (vtFundOutput.select).replace("undefined", "");

	return vtFundOutput.select;
}


//check table that will be used for sorter or data table and format correctly - make tables responsive
function checkTable() {

    $("table").not(".vt-list table, .vt-deans-list table, #metadata_table table").each(function() {

			//new class addition to parent parbase element
			if ($(this).hasClass("table") === "true") {
				$(this).parents(".parbase").addClass("vt-table-margin");
			} else {
				$(this).addClass("table");
				$(this).parents(".parbase").addClass("vt-table-margin");
			}

      if (!$(this).parent().hasClass("vt-c-table-noPostProcess")) {
          $(this).attr("width", "100%");

          var pageTables = $(this),
              pageTableList = new Array(),
              pageTableRow = new Array(),
							pageTablesThead = new Array(),
							pageTablesTheadRow = new Array(),
							pageTablesTfoot = new Array(),
							pageTablesTfootRow = new Array(),
							theadCount = 0,
							tfootCount = 0;

					//check to see if a thead exists
					if ($(pageTables).children("thead").length > 0 ) {
						pageTablesThead.push(
						$(this).children("thead").children("tr").each(function(){ //put each row from a datatable into the table array
								pageTablesTheadRow.push($(this).children("th"));
						}));
						theadCount = 1;
					}
					
					//check to see if a tfoot exists
					if ($(pageTables).children("tfoot").length > 0 ) {
						pageTablesTfoot.push(
						$(this).children("tfoot").children("tr").each(function(){ //put each row from a datatable into the table array
								pageTablesTfootRow.push($(this).children("td"));
						}));
						tfootCount = 1;
					}

          $(pageTables).children("tbody").each(function() { //make an array entry for each datatable
              pageTableList.push(
              $(this).children("tr").each(function(){ //put each row from a datatable into the table array
                  pageTableRow.push($(this).children("td"));
              }));
          });

          //remove the current table body sections
          $(pageTables).children("tbody").remove();

					if (theadCount > 0) {
						$(pageTables).children("thead").remove();
					}
					
					if (tfootCount > 0) {
						$(pageTables).children("tfoot").remove();
					}

          //repopulate table
          var tableCounter = 0;
          var tableListLength = pageTableList.length;
          $(pageTables).each(function() {
              if (tableCounter < tableListLength) {
                  $(this).append("<thead></thead>");
                  $(this).append("<tbody></tbody>");
                  
                  //add a tfoot if it exists
                  if (tfootCount > 0) {
                  	$(this).append("<tfoot></tfoot>");
                  	
										//put the tfoot back
										var footerTemp = pageTablesTfoot[tableCounter][0];
										var footerNames = [];

										$(this).children("tfoot").append($(footerTemp));
                  }
                  

                  for (j = 0; j < pageTableList[tableCounter].length; j++) { //loop through the rows
										if (theadCount == 0) {
											//put the first row in as th in the thead of the current datatable
											var headerTemp = pageTableList[tableCounter][0];
											var headerNames = [];
											//capture the header names to an array for data-labels and put the th tags on each item
											headerText = String(headerTemp.innerHTML);

											//change any <td> tags in header to <th> tags
											var headerReplace = headerText.replace(/<td/g,'<th');
													headerReplace = headerReplace.replace(/<\/td/g,'</th');
											$(headerTemp).html(headerReplace);

											$(headerTemp).find("th").each(function(){ //put each row from a datatable into the table array
													headerNames.push($(this).text());
											});

											$(this).children("thead").append($(headerTemp));
											
											//put remaining rows into tbody
											var rowTemp = pageTableList[tableCounter][j];
											var rowColWidth = "";

											$(rowTemp).find("td").each(function(index) {
												$(this).prepend('<span class="vt-table-headerTitle" aria-hidden="true">'+headerNames[index]+'</span><br />')
											});

											$(this).children("tbody").append($(rowTemp));

										} else if (theadCount > 0) {
											//existing thead case
											//put the first row in as th in the thead of the current datatable
											var headerTemp = pageTablesThead[tableCounter][j];
											var headerNames = [];
											//capture the header names to an array for data-labels and put the th tags on each item
											$(headerTemp).find("th").each(function(){ //put each row from a datatable into the table array
													headerNames.push($(this).text());
											});

											$(this).children("thead").append($(headerTemp));
											
											//put remaining rows into tbody
											var rowTemp = pageTableList[tableCounter][j];
											var rowColWidth = "";

											$(rowTemp).find("td").each(function(index) {
												$(this).prepend('<span class="vt-table-headerTitle" aria-hidden-"true">'+headerNames[index]+'</span><br />')
											});

											$(this).children("tbody").append($(rowTemp));

										}
                  }

                  
                  tableCounter++;
              }else{
                  return false;
              }
          });

				$(this).attr("role", "table");
        $(this).find("thead, tbody, tfoot").attr("role", "rowgroup");
				$(this).find("th").attr("role", "columnheader");
				$(this).find("tr").attr("role", "row");
				$(this).find("td").attr("role", "cell");
      }
    });
}

//end checkTable

function accordionTabs() {

	/*function to add turndown glyphs to accordion components*/
	$(".vtAccordion .panel-heading, .vtTab .panel-heading").each(function(){
	    var myParent = $(this).get(0).parentNode;

	    if ($(myParent).attr('class').indexOf('vtAccordion') > -1) {

	        var nextPleatId = $(this).next("div").attr("id"),
	            pleatName = $(this).find("h4").find("a").text(),
	            whatToAppend = '<a class="toggle collapsed" data-toggle="collapse" data-parent="#accordion" href="#' + nextPleatId + '" aria-expanded="'+ $(this).next('.panel-collapse').attr('aria-expanded') +'" aria-controls="' + nextPleatId + '" role="button"><span class="far fa-times" focusable="false"></span><span class="sr-only">'+ pleatName +' toggle</span></a>';
	        $(this).append(whatToAppend);

	    } else {

	        var nextPleatId = $(this).find('a').attr("href"),
	            pleatName = $(this).find("a").text(),
	            myData = $(this).find('a').data('parent'),
	            whatToAppend = '<a class="toggle collapsed" data-toggle="collapse" data-parent="' + myData + '" href="' + nextPleatId + '" aria-expanded="'+ $(this).next('.panel-collapse').attr('aria-expanded') +'" aria-controls="' + nextPleatId + '" role="button"><span class="far fa-times" focusable="false"></span><span class="sr-only">'+ pleatName +' toggle</span></a>';
	        $(this).append(whatToAppend);

	    }

	});

	/* Link to specific tab and accordion pleats.
	*  #select=[tab number]
	* */
	$.fx.off = true;
	// Setup for tabs and accordion
	// prevent scrolling if already clicked on
	var accordionOrTabClicked = false;
	if (jQuery.isFunction(jQuery.fn.accordion)){
			$(".vtAccordion").accordion({heightStyle: "content", collapsible: true, activate: function(evt, ui) {
					// enable default browser behavior
					//runEqualHeights();  - Not used in Moss template
					if (!accordionOrTabClicked) {
							$.fx.off = true;
							if (ui.newHeader.get(0)) {
									ui.newHeader.get(0).scrollIntoView(true);
							}
							$.fx.off = false;
					}
			}});
			$('.vtAccordion.vtAccordion_closed').accordion({active: false});
	}
	if (jQuery.isFunction(jQuery.fn.tabs)){
			$(".vtTab").tabs({activate: function(evt, ui) {
					// enable default browser behavior
					if (!accordionOrTabClicked) {
							if (ui.newTab.get(0)) {
									ui.newTab.get(0).scrollIntoView(true);
							}
					}
			}});
	}
	// add links to anchors similar to tabs
	$(".vtAccordion h4 > a[href='#']").each(function(i, elem) {
			$(elem).attr("href", "#pleat-" + (i + 1));
			$(elem).click(function() {
					accordionOrTabClicked = true;
			});
	});
	$(".vtTab ul.tab-list li").each(function(i, elem) {
			$(elem).mousedown(function(evt) {
					accordionOrTabClicked = true;
			});
	});
	// end setup

	$(window).bind('hashchange', function(){
			var hash = window.location.hash;
			if (!accordionOrTabClicked) {
					$(".vtTab a[href^='"+hash+"']").click();
					$(".vtAccordion h4[aria-selected='false'] > a[href='"+hash+"']").click();

					// enable select=
					// note: "#select=" is 8 characters
					if ("select=" === hash.slice(1,8)) {
							var itemToSelect = parseInt(hash.substring(8), 10);

							if (itemToSelect > 0 ) {
									$(".vtTab ul.tab-list > li > a, .vtAccordion h4 > a").each(function(i, elem) {
											if (i === (itemToSelect - 1)) {
													//check for IE11 or earlier and hide the offcanvas nav panel
													$(".offcanvas").css("display", "none");
// 													elem.scrollIntoView(true); //not going to work because it scrolls relative to parent

													//get pleats parent ID
													var scrollToThis = $(this).parents(".panel-heading").attr("id");
													location.hash = scrollToThis;

													// now account for fixed header
// 													var scrolledY = window.pageYOffset;
// 
// 													if (scrolledY){
// 														window.scroll(0, scrolledY - 120);
// 													}

													// check for open accordion pleat
													if ($(elem).parent().attr("aria-selected") !== 'true') {
															$(elem).click();

													}
											}
									});
							}

					}
			}
			accordionOrTabClicked = false;
	});
	// run once for page load
	$(window).trigger( 'hashchange' );
	$.fx.off = false;
	$(".offcanvas").css("display", "block");


	//default accordion fold and tab opener
	if ($('div[class*="vt-c-mta-select-"]').length > 0) {

			//execute a click on accordion fold
			if ($('.vtAccordion').length > 0) {
					$('.vtAccordion').each(function() {
							//get the number of the fold to open from the class
							if ($(this).parents('div[class*="vt-c-mta-select-"]').length > 0) {
									var openNum = Number($(this).parents('div[class*="vt-c-mta-select-"]').attr("class").replace( /^\D+/g, '')),
											openSelector = ".vt-c-mta-select-"+openNum;
									$(openSelector+" .panel-heading .toggle").eq(openNum - 1).trigger("click");
							}
					});
			}

			//execute click on tab
			if ($('.vtTab').length > 0) {
					$('.vtTab').each(function() {
							//get the number of the fold to open from the class
							if ($(this).parents('div[class*="vt-c-mta-select-"]').length > 0) {
									var openNum = Number($(this).parents('div[class*="vt-c-mta-select-"]').attr("class").replace( /^\D+/g, '')),
											openSelector = ".vt-c-mta-select-"+openNum;
									$(openSelector+" .tab-list li a").eq(openNum - 1).trigger("click");
							}
					});
			}
	}

}

//evaluate text component to determine whether it has only a heading in it and add a class to change text component margins on pages w/o right col
function checkHeaderOnly() {
	$(':not(".rightcol") #vt_body_col .parbase.text').each(function(index) {
		if ($(this).find(".vt-text").children("h1, h2, h3, h4, h5, h6").length == 1 && $(this).find(".vt-text").children(":not('h1, h2, h3, h4, h5, h6')").length == 0) {
			$(this).addClass("vt-heading-only");
		}
	});
}

//check inherited footer for content and hide if none
function checkFooter() {

	if ($('footer .vt-analytics').length > 0) {
		$('footer .vt-analytics').each(function() {
			$(this).addClass("vt-footer-hide");
		});
	}

	if ($(".vt-footer-inPage-items > .parbase").children(':not(".vt-footer-hide")').length > 0 || ($(".footer-briefs").children().length > 0 && $(".footer-briefs > div").children(':not(".vt-footer-hide")').length > 0) && (window.location.href.indexOf("wcmmode=disabled") > 0 || getCookie('cq-editor-layer') !== "Edit")) {
		$("footer > .row:nth-child(1), .footer-content").addClass("active");
	} else {
		$("footer > .row:nth-child(1), .footer-content").removeClass("active");
	}
}

//disable runEqualHeights function
function runEqualHeights() {}

/** duringEvent
 * @precondition params must be epoch timestamp in milliseconds
 * @param eventStartTime -- the start time
 * @param eventEndTime -- the end time
 * @return boolean
 */
function duringEvent(eventStartTime, eventEndTime){
	if ($.now() > eventStartTime && $.now() < eventEndTime) {
		return true;
	}
	else{
		return false;
	}
}

/** util namespace
 * creates a location for various utilities
 */
var util = window.util || {};
(function(u){

	u.buildExperiment = function(experiment){
		var a = experiment.a;
		var b = experiment.b;
		var expName = experiment.expName;
		var expireOn = Date.UTC(experiment.endYear, experiment.endMonth - 1, experiment.endDay);
		var testPrefix = experiment.testPrefix;

		var expObj = {
			expName: expName,
			config: {
				tests: {},
				expireOn: expireOn
			}
		};

		expObj.config.tests[testPrefix + "A"] = a;
		expObj.config.tests[testPrefix + "B"] = b;

		return expObj;
	};

	/** A/B testing
	 * @param expName -- the string name of the experiment
	 * @param config -- configuration object containing key: test name, val: value to use in test, and expiration for cookie
	 * config = {
	 * 	tests: {
	 * 		lowSet: [25, 50, 100, "Other"],
	 * 		highSet: [100, 200, 300, "Other"],
	 * 	}
	 * 	expire: 1543498628000 -- epoch time stamp in milliseconds
	 * }
	 * @return new obj with test key/val pair
	 * {
	 * 	testVal: [25, 50, 100, "Other"]
	 * }
	 */
	u.a_b = function(expObj){
		// get experiment length of time
		var expLength = new Date(expObj.config.expireOn).getUTCDate() - new Date($.now()).getDate();
		// console.log(new Date(expObj.config.expireOn).getUTCDate());
			// grab expire from config and subtract current timestamp from it
		// loop over config for tests and test values
		for(var test in expObj.config.tests){

		}
		// set cookie with expName with test key as cookie value, for length of time
		// return new obj with test name/test value for use in UI
	};

	u.getRandomInt = function(min, max){
		return Math.floor(Math.random() * (max - min + 1) + min);
	};

})(util);
/** end util namespace */

//because Safari is non-standard with focus
$(function() {
	$(this).focus(function() {
		$(this).addClass("vt-hasFocus");
	})
});


$(document).ready(function() {

	// if(window.experiment){
	// 	util.a_b(util.buildExperiment(window.experiment));
	// }

	//get page tags
	if ($(".vt-tag-link").length > 0) {
		$('.vt-one-content-area > .vt-tags .vt-tag-link').each(function () {
				//initialize variables
				var vtfClassList = $(this).attr('href').split("/"), //get the class list for the item
						vtfTagID = vtfClassList[vtfClassList.length - 1]; //set the tag ID to the last class
				vtfChoices.push(vtfTagID);
		});
	}

	/* universal access mobile check */
	accessMode();

	/* breadcrumb mobile check */
	breadcrumbMode();

	/* find header element only text components */
	checkHeaderOnly();

	/* check for underline cookie */
	if (typeof(getCookie("underlineToggle")) == "undefined") {
		setCookie("underlineToggle", 0, 365);
	}

	// dev for giving modal
	if((eventStartTime && eventEndTime) && duringEvent(eventStartTime, eventEndTime)){
		if(!getCookie("noGift")){
			givingToggle();
		}
	}

	/* find vt-text-margins class and apply to parent */
	if ($(".vt-text-margins").length > 0) {
		$(".vt-text-margins").each(function() {
			$(this).parent().addClass("vt-text-margins");
			$(this).removeClass("vt-text-margins");
		});
	}

	/* check for visible inherited footer content */
	checkFooter();

	/* check for jwPlayer and deactivate the bootstrap padding for video */
	$(".jwplayer").each(function() {
		$(this).parent().addClass("vt-jwPlayer-noPseudo");
	});

	/* vt-embed-map */
	//customization location via sitePrefs
	// if(typeof(sitePrefs) !== 'undefined') {
	//   var vtLocation = "Virginia+Tech,Blacksburg+VA";
	//
	//   if(sitePrefs.location !== "" && typeof(sitePrefs.location) !== 'undefined') {
	//     vtLocation = sitePrefs.location.replace(/ /g, "+");
	//   }
	//
	//   $(".vt-embed-map").removeClass("default-map");
	//   $(".vt-embed-map").prepend('<iframe class="vt-google-map" frameborder="0" style="border:0" src="https://www.google.com/maps/embed/v1/place?key=AIzaSyApzqbJUklqJtvkSmC4qCNHicj2-NJPuEg&q='+vtLocation+'" allowfullscreen></iframe>');
	// } else {
	//   $(".vt-embed-map").addClass("default-map");
	// }

	/* remove inherited right column div if nothing inherited */
	if($(".nav-briefs").children().length > 0 || $(".vt-nav-briefs > .parbase").length > 0) {
		$("#vt_right_col .vt-nav-briefs").addClass("active");
	} else {
		$("#vt_right_col .vt-nav-briefs").remove();
	}

	/* turn off other right column if empty	*/
	if($(".vt-rightcol-content").children().length == 0 && (window.location.href.indexOf("wcmmode=disabled") > 0 || getCookie('cq-editor-layer') !== "Edit")) {
		$("#vt_right_col .vt-rightcol-content").remove();
	}

	/* remove shadow if right column completely empty */
	if($(".nav-briefs").children().length == 0 && $(".vt-nav-briefs > .parbase").length == 0 && $(".vt-rightcol-content").children().length == 0 && $("#vt_right_col .vt-programStudy-contact").length == 0) {
		$("#vt_right_col").addClass("vt-noContent");
	} else {
		$("#vt_right_col").removeClass("vt-noContent");
	}

	/* show hide alerts */
  if ($('#vt_alert_wrapper').length > 0){
      $('#vt_alert_wrapper').append('<button id="vt_alert_hide_show" type="button"><span>Close</span></button>');
      $('#vt_alert_wrapper').prepend('<span class="fal fa-exclamation-triangle"></span>');
      $('#vt_alert_hide_show').click(function(){
          $('#vt_alert_wrapper').toggleClass("vt-close-alert");
          $(this).html(function(i, v){
              return v === '<span>Open</span>' ? '<span>Close</span>' : '<span>Open</span>'
          })
      });
  }

	//universal access keyboard nav
	$(".vt-access-dialog-close").on("keydown", function (e) {
		var i = $(":focus").get(0);
		var j = accessInputs.index(i);

		// if ($(".vt-access-dialog-wrapper").attr("aria-hidden") === "false") {
		if ($(".vt-access-dialog-wrapper").hasClass("open")) {
			if ((e.which === 9 && e.shiftKey))  {
				e.preventDefault();
				$(accessInputs.last()).focus();
			}
		}
	});

	$(".vt-access-options").on("keydown", function (e) {
		var i = $(":focus").get(0);
		var j = accessInputs.index(i);

		if ($(".vt-access-dialog-wrapper").hasClass("open")) {
			if ((e.which === 9 && !e.shiftKey) && j === (accessInputs.length - 1))  {
				e.preventDefault();
				$(accessInputs.first()).focus();
			}
		}
	});

	//resources for keyboard nav
	$(".vt-one-preHeader .vt-resources-toggle").on('keydown', function(e) {
		if (e.which === 40 || e.which === 32 || e.which === 13) {
			e.stopPropagation();
			e.preventDefault();
			resourcesToggle();
			$(resourceInputs.first()).focus();
		}

		if (e.which === 38) {
			e.stopPropagation();
			e.preventDefault();
			resourcesToggle();
			$(resourceInputs.last()).focus();
		}
	});

	$(".vt-one-preHeader .vt-resources-options").on('keydown', function(e) {
		var i = $(":focus").get(0);
		var j = resourceInputs.index(i);

		if ($(".vt-one-preHeader .vt-resources-options").attr("aria-hidden") === "false") {

			//up arrow
			if (e.which === 38 && resourceInputs.index(j) !== resourceInputs.first())  {
				e.stopPropagation();
				e.preventDefault();
				$(resourceInputs.eq(j - 1)).focus();
			} else if(e.which === 38 && resourceInputs.first()) {
				e.stopPropagation();
				e.preventDefault();
				$(resourceInputs.last()).focus();
			}

			//down arrow
			if (e.which === 40 && j < (resourceInputs.length - 1))  {
				e.stopPropagation();
				e.preventDefault();
				$(resourceInputs.eq(j + 1)).focus();
			} else if (e.which === 40 && j === (resourceInputs.length - 1)) {
				e.stopPropagation();
				e.preventDefault();
				$(resourceInputs.first()).focus();
			}

			//home
			if (e.which === 36) {
				e.stopPropagation();
				e.preventDefault();
				$(resourceInputs.first()).focus();
			}

			//end
			if(e.which === 35) {
				e.stopPropagation();
				e.preventDefault();
				$(resourceInputs.last()).focus();
			}

			if ($(resourceInputs.first()) && (e.which === 9 && e.shiftKey))  {
				resourcesToggle();
			}

			if ($(resourceInputs.last()) && (e.which === 9 && !e.shiftKey))  {
				resourcesToggle();
			}

		}
	});


	$('.vt-resources-toggle').click(function(event){
	    event.stopPropagation();
			resourcesToggle();
	});

	//trap the keyboard navigation inside the nav container
	$(".vt-nav-toggle").on('keydown', function(e) {
		if ($(".vt-nav-toggle").attr("aria-expanded") === "true") {
			if ((e.which === 9 && e.shiftKey))  {
				e.preventDefault();
				$(navInputs.last()).focus();
			}
		}
	});

	$("#vt_offcanvas_nav").on('keydown', function (e) {
			var i = $(":focus").get(0);
			var j = navInputs.index(i);

		if ((e.which === 9 && !e.shiftKey) && j === (navInputs.length - 1))  {
			e.preventDefault();
			$(".vt-nav-toggle").focus();
		}
	});

	//header search keyboard nav
	$(".vt-search-toggle").on("keydown", function (e) {
		if ($(".vt-search-toggle").attr("aria-expanded") === "true") {
			if ((e.which === 9 && e.shiftKey))  {
				e.preventDefault();
				$(".vt-search-button").focus();
			}
		}
	});

	$(".vt-search-button").on("keydown", function (e) {
		if ($(".vt-search-toggle").attr("aria-expanded") === "true") {
			if ((e.which === 9 && !e.shiftKey))  {
				e.preventDefault();
				$(".vt-search-toggle").focus();
			}
		}
	});

	//mobile breadcrumb tab order
	$(".gateway").on("keydown", function (e) {

		if ($("#vt_navtrail").hasClass("open")) {
			var i = $(":focus").get(0);
			var j = breadcrumbInputs.index(i);

			if ((e.which === 9 && !e.shiftKey) && j === (breadcrumbInputs.length - 1))  {
				e.preventDefault();
				breadcrumbInputs.eq(0).focus();
			} else if ((e.which === 9 && e.shiftKey) && j === (breadcrumbInputs.length - 1))  {
				breadcrumbToggle();
			}

			if ((e.which === 9 && !e.shiftKey) && j === (breadcrumbInputs.length - 2))  {
				breadcrumbToggle();
			}

			if ((e.which === 9 && e.shiftKey) && j == 0)  {
				e.preventDefault();
				breadcrumbInputs.last().focus();
			}
		}
	});

	//escape key behaviors
	$(window).on("keydown", function (e) {

		if(e.which === 27) {
			if ($(".vt-nav-toggle").attr("aria-expanded") === "true") {
				navToggle();
			}

			if ($(".vt-search-toggle").attr("aria-expanded") === "true") {
				searchToggle();
			}

			if($(".vt-one-preHeader .vt-resources-toggle").attr("aria-expanded") === "true") {
				resourcesToggle();
			}

			if($("#vt_access_dialog").is(":visible")) {
				accessToggle();
			}

			if($(".vt-subnav-droplist-control").attr("aria-expanded") === "true") {
				subnavToggle();
			}
		}
	});

	//fix for !important on media component jwplayer default aspect
	if ($(".jw-aspect.jw-reset").attr("style") == "padding-top: 56.25%;") {
	  $(".jw-aspect.jw-reset").attr({style: "padding-top: 56.25%!important;"})
	}

	//search box scripts
	// $("#vt_header_search_form").on("submit", function() {
	//
	// 	if($(".vt-search-scopeSelect option:selected").val() === "search-site") {
	// 		var siteURL = $("div[data-name='siteURL']").attr("data-value"),
	// 				siteSearch = "site:" + siteURL + " " + $(".vt-search-box").val();
	// 		$(".vt-search-box").val(siteSearch);
	// 	}
	//
	// 	return true;
	// });

	//responsive and data - sortable tables
	checkTable();

	//accordion and tabs functions
	if ($(".vtmultitab").length > 0) {
		accordionTabs();
	}

	//move active state on <li> elements along with link
	$(".vtTab .nav-link").on('click', function() {
		var tabID = $(this).parents(".vtTab").attr("id"),
				tabIDSelector = "#"+tabID;
		setTimeout(function() {
			$(tabIDSelector).find(".nav-item").removeClass("active");
			$(tabIDSelector).find(".nav-link.active").parent().addClass("active");
		}, 200);
	});

	//Trigger dataTable on a table with class .vt-datatable (table must have thead and tbody defined) ***SHOULD BE IN LOCAL ASSETS
	var o_vt_dataTable = null;
	if ($(".vt-datatable > table, .vt-datatable-formatted > table").length > 0) {

		// loading necessary javascript files for validation, wysiwyg editor, datepicker
		if (!(jQuery.isFunction(jQuery.fn.dataTable))){
			$('head').prepend('<script type="text/javascript" src="/global_assets/js/datatables/jquery.dataTables.min.js"></script>');
		}
				$(".vt-datatable >table, .vt-datatable-formatted >table").each(function() {
						o_vt_dataTable = $('.vt-datatable >table, .vt-datatable-formatted >table').dataTable( {
								"bJQueryUI": true,
								"aLengthMenu":[[25, 50, 100, -1],[25, 50, 100, "All"]],
								"sPaginationType": "full_numbers",
								"aaSorting":[[0,'asc']],
								"iDisplayLength": 25,
								"oSearch": {"sSearch": "", "bRegex":false, "bSmart": false}
						});
				});
				$(".vt-datatable >table, .vt-datatable-formatted >table").attr("summary","This is a searchable and sortable table. Click a heading title to change sort column and sort order.");
	}

	if ($(".vt-datatable").length > 0) {
			$(".vt-datatable").each(function() {
					$(".dataTables_filter input").addClass("form-control");
			});
	}

	// Include necessary code for table sorting
	if ($(".vt-tablesorter >table, .vt-tablesorter-formatted >table").length > 0) {
	if (!(jQuery.isFunction(jQuery.fn.tablesorter))) {
		$('head').prepend('<script type="text/javascript" src="/global_assets/js/tablesort/jquery.tablesorter.js"></script>');
		$('head').prepend('<link rel="stylesheet" type="text/css" href="/global_assets/js/tablesort/vt_tablesorter.css"/>');
			}
			$(".vt-tablesorter-formatted >table").each(function() {
					$(".vt-tablesorter-formatted >table").tablesorter( {sortList: [[0,0]]} ); //sorts based on first column only by default
					$(".vt-tablesorter-formatted >table").attr("summary","This is a sortable table. Click a heading title to change sort column and sort order.");
			});
			$(".vt-tablesorter >table").each(function() {
					$(".vt-tablesorter >table").tablesorter( {sortList: [[0,0]]} ); //sorts based on first column only by default
					$(".vt-tablesorter >table").attr("summary","This is a sortable table. Click a heading title to change sort column and sort order.");
			});
	}

	// Change chevron icons to arrow icons
	if($(".vt-carousel-control-belowImage, .vt-carousel-control-default").length > 0){
		$(".vt-carousel-control-belowImage .carousel-control, .vt-carousel-control-default .carousel-control").each(function(){
			$(this).children(".glyphicon").remove();
			if($(this).hasClass("left")){
				$(this).prepend(
					'<i class="far fa-arrow-left" focusable="false">&nbsp;</i>'
				);
			}
			else{
				if($(this).hasClass('right')){
					$(this).prepend(
						'<i class="far fa-arrow-right" focusable="false">&nbsp;</i>'
					);
				}

			}
		});
	}

	// 1. Force display of the carousel to 16:9 aspect ratio
	// 2. Set the top position of the controls to near the top of the image
	// 3. Listen for the BS "slid" event and update the position of the indicators so that it is always at the bottom of the image
	if($(".vt-carousel").length > 0){

		$(".vt-carousel").each(function(){
			var firstItem = $(this).find(".carousel-item:eq(0) .item-image");

			// 1
			$(this).find(".carousel-item").each(function(){
				var itemImage = $(this).children(".item-image");
				itemImage.css({
					"height": "0",
					"padding-bottom": "56.25%"
				});

				// force the carousel to be as tall as the tallest carousel-item
				var items = $(this).parent(".carousel-inner").find(".carousel-item");
				var maxHeight = 0;
				items.each(function(){
					maxHeight = ($(this).innerHeight() >= maxHeight) ? $(this).innerHeight() : maxHeight;
				});
				$(this).parent(".carousel-inner").height(maxHeight);


			});

			// Position the controls at the bottom of the image
			$(this).find(".vt-carousel-control-belowImage").each(function(){
				var height = 0;
				if($(firstItem).innerHeight() <= 0){
					height = firstItem.width() * 0.5625;
				}
				else{
					height = $(firstItem).innerHeight();
				}
				$(this).css({
					"top": (height - $(this).innerHeight())
				})
			});

			$(this).find(".vt-carousel-indicator-default").each(function(){
				var height = 0;
				if($(firstItem).innerHeight() <= 0){
					height = firstItem.width() * 0.5625;
				}
				else{
					height = $(firstItem).innerHeight();
				}
				$(this).css({
					"top": (height - $(this).innerHeight())
				})
			});

			// position the left and right controls in the middle of the image
			$(this).find(".vt-carousel-control-belowImage .carousel-control").each(function(){
				$(this).css({
					"height": (firstItem.innerHeight()),
					"top": -(firstItem.innerHeight() - 50)
				})
			});

			$(this).find(".vt-carousel-control-default .carousel-control").each(function(){
				$(this).css({
					"height": (firstItem.innerHeight()),
					"top": -(firstItem.innerHeight() - 50)
				})
			});

			// Listen for the BS "slid" event and update the position of the indicators so that it is always at the bottom of the image
			// equal height code makes this unnecessary
			// $('.carousel').on('slid.bs.carousel', function(){
			// 	var captionHeight = $(".carousel-item.active > .carousel-caption").height();
			// 	console.log(captionHeight);
			// 	$(".vt-carousel-control-belowImage").css({
			// 		"bottom": captionHeight
			// 	});
			// });

			// apply bootstrap carousel-fade class
			if($(".vt-carousel").length > 0){
				$(".vt-carousel").find(".carousel").addClass("carousel-fade");
			}


		});
	}

	// if carousel is in accordion, need to do the proportion script on open
	$(".collapse").on("shown.bs.collapse", function(){
		if($(this).find(".vt-carousel").length > 0){
			if(!$(this).find(".vt-carousel").hasClass("accordion-carousel-init")){
				$(this).find(".vt-carousel").each(resizeCarousel);
				$(this).find(".vt-carousel").addClass("accordion-carousel-init");
			}
		}
	});

	// gallery
	// enhance lbgallery grid with added span with background
	if($("[class*=lbgallery]").length > 0){
		$("[class*=lbgallery]").each(function(){
			if($(this).find(".gallery-thumbnails .thumbnail").length > 0){
				$(this).find(".gallery-thumbnails .thumbnail").each(function(){
					var imgSrc = $(this).find("img").attr("src");
					var span = $("<span></span>").css({
						"background": "url(" + imgSrc + ")",
						"position": "absolute",
						"background-size": "cover",
						"background-position": "center",
						"z-index": "2",
						"width": "100%",
						"height": "100%"
					}).attr("aria-hidden", "true");
					$(this).prepend(span);
				});
			}
		});
	}
	// end gallery

	// vt-list
	// change the default bootstrap grid classes
	if($(".vt-list").length > 0){
		$(".vt-list").find(".item").each(function(){
			// Add extra markup for tags so that we can do the rounded edges with pseudo elements
			var tags = $(this).find(".vt-list-tags a");
			tags.each(function(){
				var text = $(this).text();
				$(this).text("");
				$(this).append("<span>" + text + "</span>");
			})
		});
		// replace grid for default, right aligned images
		if($(".vt-list").find(".image-format-positionRight")){
			$(".vt-list").find(".image-format-positionRight").each(function(){
				$(this).find(".item").each(function(){
					$(this).find("> .row > li:first-child").removeClass("col-sm-8").addClass("col-sm-7");
					$(this).find("> .row > li:last-child").removeClass("col-sm-4").addClass("col-sm-5");
				})
			})
		}
		// replace grid for hidden images
// 		if($(".vt-list").find(".image-format-hide")){
// 			$(".vt-list").find(".image-format-hide").each(function(){
// 				$(this).find(".item").each(function(){
// 					$(this).find("> .row > li:first-child").removeClass("col-sm-12").addClass("col-sm-7 col-md-8");
// 				})
// 			})
// 		}
		// check for two-col
		if($(".vt-list").find(".vt-num-col-2").find(".image-format-positionLeft")){
			listColFullWidth($(".vt-list").find(".vt-num-col-2").find(".image-format-positionLeft"), ["col-sm-12"]);
		}
		if($(".vt-list").find(".vt-num-col-2").find(".image-format-positionRight")){
			listColFullWidth($(".vt-list").find(".vt-num-col-2").find(".image-format-positionRight"), ["col-sm-12"]);
		}
		if($(".vt-list").find(".vt-num-col-2").find(".image-format-hide")){
			listColFullWidth($(".vt-list").find(".vt-num-col-2").find(".image-format-hide"), ["col-sm-12"]);
		}
		// check for three-col
		if($(".vt-list").find(".vt-num-col-3").find(".image-format-positionLeft")){
			listColFullWidth($(".vt-list").find(".vt-num-col-3").find(".image-format-positionLeft"), ["col-sm-12"]);
		}
		if($(".vt-list").find(".vt-num-col-3").find(".image-format-positionRight")){
			listColFullWidth($(".vt-list").find(".vt-num-col-3").find(".image-format-positionRight"), ["col-sm-12"]);
		}
		if($(".vt-list").find(".vt-num-col-3").find(".image-format-hide")){
			listColFullWidth($(".vt-list").find(".vt-num-col-3").find(".image-format-hide"), ["col-sm-12"]);
		}
		// check for four-col
		if($(".vt-list").find(".vt-num-col-4").find(".image-format-positionLeft")){
			listColFullWidth($(".vt-list").find(".vt-num-col-4").find(".image-format-positionLeft"), ["col-sm-12"]);
		}
		if($(".vt-list").find(".vt-num-col-4").find(".image-format-positionRight")){
			listColFullWidth($(".vt-list").find(".vt-num-col-4").find(".image-format-positionRight"), ["col-sm-12"]);
		}
		if($(".vt-list").find(".vt-num-col-4").find(".image-format-hide")){
			listColFullWidth($(".vt-list").find(".vt-num-col-4").find(".image-format-hide"), ["col-sm-12"]);
		}
		// check for six-col
		if($(".vt-list").find(".vt-num-col-6").find(".image-format-positionLeft")){
			listColFullWidth($(".vt-list").find(".vt-num-col-6").find(".image-format-positionLeft"), ["col-sm-12"]);
		}
		if($(".vt-list").find(".vt-num-col-6").find(".image-format-positionRight")){
			listColFullWidth($(".vt-list").find(".vt-num-col-6").find(".image-format-positionRight"), ["col-sm-12"]);
		}
		if($(".vt-list").find(".vt-num-col-6").find(".image-format-hide")){
			listColFullWidth($(".vt-list").find(".vt-num-col-6").find(".image-format-hide"), ["col-sm-12"]);
		}

		// replace grid for default, left aligned images
		if($(".vt-list").find(".image-format-positionLeft")){
			$(".vt-list").find(".image-format-positionLeft").each(function(){
				$(this).find(".item").each(function(){
					$(this).find("> .row > li:first-child").removeClass("col-sm-4").addClass("col-sm-5");
					$(this).find("> .row > li:last-child").removeClass("col-sm-8").addClass("col-sm-7");
					var lastChild = $(this).find("> .row > li:last-child");
					if(lastChild[0].innerHTML.trim() === ""){
						lastChild.remove();
						$(this).find("> .row > li:first-child").removeClass().addClass("col-sm-12 list-no-text");
					}
				})
			})
		}

		if($(".vt-list").hasClass("vt-list-listOfLinks")){
			if(
				$(".vt-list-listOfLinks").hasClass("block-dividers") ||
				$(".vt-list-listOfLinks").hasClass("little-dividers") ||
				$(".vt-list-listOfLinks").hasClass("button-dividers")
			){
				$(".vt-list-listOfLinks.block-dividers").each(function(){
					$(this).find(".item").each(function(){
						$(this).find("> .row > li:first-child").removeClass().addClass("col-sm-12");
					})
				})
				$(".vt-list-listOfLinks.little-dividers").each(function(){
					$(this).find(".item").each(function(){
						$(this).find("> .row > li:first-child").removeClass().addClass("col-sm-12");
					})
				})
				$(".vt-list-listOfLinks.button-dividers").each(function(){
					$(this).find(".item").each(function(){
						$(this).find("> .row > li:first-child").removeClass().addClass("col-sm-12");
					})
				})
			}
		}

		// if not positionTop or positionBottom, remove the layout from the image's containing column if there is no page image
		if($(".vt-list").find(".vt-list-item-no-image")){
			$(".vt-list").find(".vt-list-item-no-image").each(function(){
				if($(this).parents(".image-format-positionTop").length === 0 && $(this).parents(".image-format-positionBottom").length === 0){
					$(this).parent("li").siblings("li").removeClass().addClass("col-sm-7 col-md-8");
					$(this).parent("[class*='col']").css({
						"width" : "0",
						"height" : "0",
						"position" : "absolute"
					})
				}
			})
		}

		// go find all the figures and set the bg images to enforce the image aspect ratio
		if($(".vt-list").find(".image-format-positionTop")){
			var figure = $(".vt-list").find(".image-format-positionTop .item figure");
			listTopAlignBGImage(figure);
		}

		if($(".vt-llist").find(".image-format-positionBottom")){
			var figure = $(".vt-list").find(".image-format-positionBottom .item figure");
			listTopAlignBGImage(figure);
		}

		if($(".vt-list").find(".image-format-positionLeft")){
			var figures = $(".vt-list").find(".image-format-positionLeft .item .vt-list-item-img figure");
			listTopAlignBGImage(figures);
		}

		if($(".vt-list").find(".image-format-positionLeftMedium")){
			var figures = $(".vt-list").find(".image-format-positionLeftMedium .item .vt-list-item-img figure");
			listTopAlignBGImage(figures);
		}

		if($(".vt-list").find(".image-format-positionLeftLarge")){
			var figures = $(".vt-list").find(".image-format-positionLeftLarge .item .vt-list-item-img figure");
			listTopAlignBGImage(figures);
		}

		if($(".vt-list").find(".image-format-positionRight")){
			var figures = $(".vt-list").find(".image-format-positionRight .item .vt-list-item-img figure");
			listTopAlignBGImage(figures);
		}

		if($(".vt-list").find(".image-format-positionRightMedium")){
			var figures = $(".vt-list").find(".image-format-positionRightMedium .item .vt-list-item-img figure");
			listTopAlignBGImage(figures);
		}

		if($(".vt-list").find(".image-format-positionRightLarge")){
			var figures = $(".vt-list").find(".image-format-positionRightLarge .item .vt-list-item-img figure");
			listTopAlignBGImage(figures);
		}
		//

		if($(".vt-list").hasClass("vt-contentList")){
			$(".vt-contentList").each(function(){
				if(
					$(this).find(".image-format-positionLeft").length > 0 ||
					$(this).find(".image-format-positionTop").length > 0  ||
					$(this).find(".image-format-positionLeftMedium").length > 0  ||
					$(this).find(".image-format-positionLeftLarge").length > 0
				)
				{
					$(this).find(".item [class*='col']:first-child")
					.removeClass()
					.addClass("col-sm-12")

					$(this).find(".item [class*='col']:last-child")
					.removeClass()
					.addClass("col-xl-8 col-sm-12")
				}
				if($(this).find(".image-format-positionRight").length > 0 || $(this).find(".image-format-positionBottom").length > 0)
				{
					$(this).find(".item [class*='col']:last-child")
					.removeClass()
					.addClass("col-sm-12")

					$(this).find(".item [class*='col']:first-child")
					.removeClass()
					.addClass("col-xl-8 col-sm-12")
				}
			})
		}
	// vt-list

	//list component filtering via curated list ("not" function)
	//requires that the list to be pruned item limit be set to desired number of items plus the number of curated articles
	//****> MUST ADD vt-c-list-curated class to the featured list(s), and vt-c-list-pruned class to the automated list(s)

		$('.vt-c-list-pruned').each(function () {

			//initialize variables
			var removeIndex = new Array(),
				prePrunedList = new Array(),
				prunedList = new Array(),
				removeNegative = new Number(),
				colNum = new Array();

			//get num of columns in current list to be pruned
			colNum = Number($(this).find('div[class*="vt-num-col-"]').attr("class").replace( /^\D+/g, ''));

			//create array of list items
			$(this).find('.item').each(function () {
				prePrunedList.push($(this).get(0).outerText);
			});

			//create array of curated items
			$('.vt-c-list-curated').each(function () {
				$(this).find('.item').each(function () {
					removeIndex.push($.inArray($(this).get(0).outerText, prePrunedList));
				});
			});

			//remove unmatched item positions from removeIndex
			removeNegative = removeIndex.indexOf(-1);

			while (removeNegative > -1) {
				removeIndex.splice(removeNegative, 1);
				removeNegative = removeIndex.indexOf(-1);
			}

			//sort the removeIndex from lowest position number to highest
			removeIndex.sort(function(a, b){return a-b});

			//filter out the duplicate(s) within the list items from curated items
			for(i=0; i < removeIndex.length; i++) {
				$(this).find('.item').eq(removeIndex[i] - i).remove();
			}

			//make new array of list items sans the removed item(s)
			$(this).find('.item').each(function () {
				prunedList.push($(this).get(0));
			});

			//remove all list items from the original list
			$(this).find('.item').remove();

			//replace the list items with the new array items
			$(this).find('li.row ul').each(function () {

				//put the items from the new list into the DOM
				for(i=0; i < colNum; i++) {
					$(this).append(prunedList[i]);
				}
				//delete those items once placed
				prunedList.splice(0,colNum);

			});

			//remove the last row
			while($(this).find('.item').length % colNum > 0) {
				$(this).find('li.row').last().remove();
			}
		});
	//end list filtering function

	// vt-feedreader
	if($(".vt-feedreader").length > 0) {
		$(".vt-feedreader").find(".vt_feed_items li").each(function() {
			var html = $(this).html();
			$(this).html("<div class='col-sm-8'>" + html + "</div>")
		});
	}
	// vt-feedreader

	}

	// vt-subnav
	if($(".vt-subnav").length > 0) {
		$(".vt-subnav-droplist-control").click(function () {
			subnavToggle();
		});
	}

	$(".vt-subnav").on("keydown", function (e) {

		if ($(".vt-subnav-droplist-control").hasClass("open")) {
			var i = $(":focus").get(0);
			var j = subnavInputs.index(i);

			if ((e.which === 9 && e.shiftKey) && j == 0)  {
				subnavToggle();
			}

			if ((e.which === 9 && !e.shiftKey) && j === (subnavInputs.length - 1))  {
				subnavToggle();
			}
		}
	});

	// vt-subnav

	// vt-callToAction
	// if($(".vt-callToAction").length > 0){

		// var callToAction = $(".vt-callToAction");

		// $(".vt-callToAction").remove();

		// $("#vt_main").prepend(callToAction);

		// $(".vt-callToAction").each(function(){
		// 	$(this).find("> .row > [class*='col']:first-child").removeClass().addClass("col-12 col-md-6 col-lg-6 vt-callToAction-message");
		// 	$(this).find("> .row > [class*='col']:last-child").removeClass().addClass("col-12 col-md-6 vt-callToAction-supplement");
		// });

        // var supplement = $(".vt-callToAction-supplement");

        // var imgSrc = $(supplement).find("img").attr("src");

		// var imgSrcSet = $(supplement).find("img").attr("srcset");

		// var bgImage = $("<div class='vt-callToAction-supplement-fig' aria-hidden='true'></div>").css({
		// 	"background-image": "url(" + findImgSize(imgSrcSet) + ")"
		// });

		// supplement.prepend(bgImage);

		// grab and store header
		// var $header = $(".vt-callToAction-message-heading > h3");
		// set display to none
		// $header.hide();

		// var headerText =
		// 	fragmentHTML($header.html().trim(), {
		// 		tagName: "span",
		// 		attributes: {
		// 			class: "vt-callToAction-message-header-fragment"
		// 		}
		// 	});

		// $header.html(
		// 	"<h3>" + headerText.join(" ") + "</h3>"
		// );

		// $header.show();

		// var $links = $(".vt-callToAction-message-secondary-link a");
		// $links.each(function(){
		// 	$(this).append("<span class='fas fa-arrow-right'></span>");
		// });

	// 	$(".vt-callToAction-message .vt-col > div:last-child").addClass("vt-callToAction-message-secondary-container");

    // $(".vt-callToAction-supplement figure").addClass("vt-callToAction-supplement-image");

//   }
	// vt-callToAction

	// vt-listStripe
	if($(".vt-listStripe").length > 0){
		$(".vt-listStripe").each(function(){
			$(".vt-listStripe-button a").append("<span class='far fa-arrow-right'></span>");
		});
	}
	// vt-listStripe

	// vt-upcomingEvents
	if($(".vt-upcomingEvents").length > 0){
		var upcomingEvents = $(".vt-upcomingEvents");
		upcomingEvents.each(function(){
			$(this).find(".vt_feed_items").children("li").each(function(){
				$(this).addClass("vt-upcomingEvents-event");
				var $date = $(this).find(".vt_feed_iDate");
				$date.html(
					fragmentHTML($date.html(), {})
				);
				// var $title = $(this).find(".vt_feed_iTitle");
				// $title.html(
				// 	fragmentHTML($title.html(), {
				// 		attributes: {
				// 			"class": "vt-upcomingEvents-titleHighlight"
				// 		},
				// 		child: {
				// 			tagName: "span",
				// 			attributes: {
				// 				"class": "vt-upcomingEvents-titleHighlight-fore"
				// 			}
				// 		}
				// 	})
				// );
				$(this).prepend("<div class='col-sm-3 vt-upcomingEvents-event-date'>" + $date[0].outerHTML + "</div>");
				$date.remove();
			});

			// find cTitle link
			var $cTitle = $(this).find(".vt_feed_cTitle").parent();
			// grab its href
			var cTitleHref = $cTitle.attr("href");
			// hide it
			$cTitle.remove();
			// insert a new link with new class and href
			$(this).append(
				"<a href='" + cTitleHref + "' class='vt-upcomingEvents-viewMore'>" +
					"<span class='vt-upcomingEvents-viewMore-icon'><span class='fas fa-arrow-right'></span></span>" +
					"<span class='vt-upcomingEvents-viewMore-text'>View More</span>" +
				"</a>"
			);

			// get multicolumn
			var $multicolumn = $(this).find(".vt-multicolumn");
			// update the classes
			$multicolumn.find(".row  > [class*='col']:first-child").removeClass().addClass("col-12 col-xl-2");
			$multicolumn.find(".row  > [class*='col']:last-child").removeClass().addClass("col-12 col-lg-11 col-xl-9");

		});
	}
	// vt-upcomingEvents

	//featured video overlay click toggle
	if($(".vt-featured-media").length > 0) {
		$(".vt-featured-media").each(function() {
			var tempID = $(".vt-featured-media").find(".vt-video > div[id*=vt_video]").attr("id"),
					tempTitle = $(".vt-featured-media").find(".vt-featured-media-title p").text().trim();

			//kaltura player init needs
			if($(this).find(".vt-featured-media-video").hasClass("vt-video-kaltura-player")) {
				$(this).addClass("kaltura");
	    }

			//jwplayer init needs
			if($(".vt-featured-media .jwplayer").length > 0) {
				jwplayer(tempID).setControls(false);
			}

			$(".vt-featured-media > .vt-vtcontainer-content").append('<button class="vt-featured-media-play">Play the ' + tempTitle + ' video</button>');
		});
	}

	// $(".vt-featured-media-title, vt-featured-media-info, .vt-featured-media-play").on('click', function() {
	$(".vt-featured-media-play").on('click', function() {
		var tempID = $(this).closest(".vt-vtcontainer-content").find(".vt-video > div[id*=vt_video]").attr("id");

		$(".vt-featured-media-title, .vt-featured-media-info, .vt-featured-media-play").hide();
		$(".vt-featured-media").addClass("open");
		$(".vt-featured-media-action").addClass("open");
		$(".vt-featured-media-assets").addClass("open");
		$(".vt-featured-media-collapse").show();

		$(this).closest(".vt-vtcontainer-content").find(".jw-aspect").addClass("active");

		if($(".vt-featured-media .jwplayer").length > 0) {
			if(jwplayer(tempID).getState() === "idle" || jwplayer(tempID).getState() === "paused") {
				jwplayer(tempID).play();
			}
		}

		if($(this).closest(".vt-vtcontainer-content").find(".mediaexternal").find(".vt-video").hasClass("vt-video-kaltura-player")) {
			kWidget.addReadyCallback( function( playerId ){
				var kdp = document.getElementById( playerId );
					kdp.sendNotification( "doPlay" );
			});
		}
	});

	$(".vt-featured-media-collapse").on('click', function() {
		var tempID = $(this).closest(".vt-vtcontainer-content").find(".vt-video > div[id*=vt_video]").attr("id");

		$(".vt-featured-media-title, .vt-featured-media-play").show();

		if (window.innerWidth >= 992) {
			$(".vt-featured-media-info").show();
		}

		$(".vt-featured-media").removeClass("open");
		$(".vt-featured-media-action").removeClass("open");
		$(".vt-featured-media-assets").removeClass("open");
		$(".vt-featured-media-collapse").hide();

		$(this).closest(".vt-vtcontainer-content").find(".jw-aspect").removeClass("active");

		if($(".vt-featured-media .jwplayer").length > 0) {
			if(jwplayer(tempID).getState() === "playing") {
				jwplayer(tempID).pause();
			}
		}

		if($(this).parents(".vt-featured-media").find(".mediaexternal").find(".vt-video").hasClass("vt-video-kaltura-player")) {
			kWidget.addReadyCallback( function( playerId ){
				var kdp = document.getElementById( playerId );
					kdp.sendNotification( "doPause" );
			});
		}
	});

	//Our Vision link wrap script
	$(".vt-our-vison-link a").each(function() {
		var visionLink = $(this).get(0),
				visionLinkTitle = $(this).closest(".vt-vtcontainer-content").find(".vt-our-vision-articleTitle").text();

		$(this).addClass("vt-vision-link");

		$(this).closest(".vt-vtcontainer-content").find(".vt-our-vision-2col > .row").wrap(visionLink);

		$(this).closest(".vt-vtcontainer-content").find(".vt-our-vision-2col").append('<span class="sr-only">Read more about ' + visionLinkTitle + '</span>');

		$(this).remove();

	});
	
	//custom multicolumn classes
  //.vt-multicolumn.vt-2col-md-6-only
  if($('.vt-multicolumn.vt-2col-md-6-only')) {
      $('.vt-multicolumn.vt-2col-md-6-only').each(function () {
          $(this).find('.row >div').removeClass('col-sm-6');
          $(this).find('.row >div:first-of-type').addClass('col-sm-12');
          $(this).find('.row >div:last-of-type').addClass('col-sm-12');
      });
  }
  //.vt-2col-7-4-offset-1
  if($('.vt-multicolumn.vt-2col-7-4-offset-1')) {
      $('.vt-multicolumn.vt-2col-7-4-offset-1').each(function () {
          $(this).find('.row >div').removeClass('col-md-6 col-sm-6');
          $(this).find('.row >div:first-of-type').addClass('col-lg-7');
          $(this).find('.row >div:last-of-type').addClass('col-lg-4 col-lg-offset-1');
      });
  }

  //.vt-2col-4-7-offset-1
  if($('.vt-multicolumn.vt-2col-4-7-offset-1')) {
      $('.vt-multicolumn.vt-2col-4-7-offset-1').each(function () {
          $(this).find('.row >div').removeClass('col-md-6 col-sm-6');
          $(this).find('.row >div:first-of-type').addClass('col-lg-4');
          $(this).find('.row >div:last-of-type').addClass('col-lg-7 col-lg-offset-1');
      });
  }

  //.vt-2col-7-5
  if($('.vt-multicolumn.vt-2col-7-5')) {
      $('.vt-multicolumn.vt-2col-7-5').each(function () {
          $(this).find('.row >div').removeClass('col-md-6 col-sm-6');
          $(this).find('.row >div:first-of-type').addClass('col-lg-7');
          $(this).find('.row >div:last-of-type').addClass('col-lg-5');
      });
  }

  //.vt-2col-5-7
  if($('.vt-multicolumn.vt-2col-5-7')) {
      $('.vt-multicolumn.vt-2col-5-7').each(function () {
          $(this).find('.row >div').removeClass('col-md-6 col-sm-6');
          $(this).find('.row >div:first-of-type').addClass('col-lg-5');
          $(this).find('.row >div:last-of-type').addClass('col-lg-7');
      });
  }

  //.vt-2col-8-4
  if($('.vt-multicolumn.vt-2col-8-4')) {
      $('.vt-multicolumn.vt-2col-8-4').each(function () {
          $(this).find('.row >div').removeClass('col-md-6 col-sm-6');
          $(this).find('.row >div:first-of-type').addClass('col-lg-8');
          $(this).find('.row >div:last-of-type').addClass('col-lg-4');
      });
  }

  //.vt-2col-4-8
  if($('.vt-multicolumn.vt-2col-4-8')) {
      $('.vt-multicolumn.vt-2col-4-8').each(function () {
          $(this).find('.row >div').removeClass('col-md-6 col-sm-6');
          $(this).find('.row >div:first-of-type').addClass('col-lg-4');
          $(this).find('.row >div:last-of-type').addClass('col-lg-8');
      });
  }

  //.vt-2col-9-3
  if($('.vt-multicolumn.vt-2col-9-3')) {
      $('.vt-multicolumn.vt-2col-9-3').each(function () {
          $(this).find('.row >div').removeClass('col-md-6 col-sm-6');
          $(this).find('.row >div:first-of-type').addClass('col-lg-9');
          $(this).find('.row >div:last-of-type').addClass('col-lg-3');
      });
  }

  //.vt-2col-3-9
  if($('.vt-multicolumn.vt-2col-3-9')) {
      $('.vt-multicolumn.vt-2col-3-9').each(function () {
          $(this).find('.row >div').removeClass('col-md-6 col-sm-6');
          $(this).find('.row >div:first-of-type').addClass('col-lg-3');
          $(this).find('.row >div:last-of-type').addClass('col-lg-9');
      });
  }

	/* begin feature grid scripts */

  $(".vt-feature-grid").parent().addClass("vt-nomargin-bottom");

  $(".fg-big-2x2, .fg-mixed-2x2, .fg-mixed-3x2, .fg-mixed-5x2, .fg-wide-2x1, .fg-wide-2x1-holder, .fg-tall-1x2, .fg-grid-item-image, .fg-grid-item-info").each(function() {

    if($(this).hasClass("fg-big-2x2")) {
      $(this).removeClass("fg-big-2x2");
      $(this).parent().addClass("fg-big-2x2");
    }

    if($(this).hasClass("fg-mixed-2x2")) {
      $(this).removeClass("fg-mixed-2x2");
      $(this).parent().addClass("fg-mixed-2x2");
    }

    if($(this).hasClass("fg-mixed-3x2")) {
      $(this).removeClass("fg-mixed-3x2");
      $(this).parent().addClass("fg-mixed-3x2");
    }

		if($(this).hasClass("fg-mixed-5x2")) {
      $(this).removeClass("fg-mixed-5x2");
      $(this).parent().addClass("fg-mixed-5x2");
    }

    if($(this).hasClass("fg-wide-2x1")) {
      $(this).removeClass("fg-wide-2x1");
      $(this).parent().addClass("fg-wide-2x1");
    }

    if($(this).hasClass("fg-wide-2x1-holder")) {
      $(this).removeClass("fg-wide-2x1-holder");
      $(this).parent().addClass("fg-wide-2x1-holder");
    }

    if($(this).hasClass("fg-tall-1x2")) {
      $(this).removeClass("fg-tall-1x2");
      $(this).parent().addClass("fg-tall-1x2");
    }

    if($(this).hasClass("fg-grid-item-image")) {
      $(this).removeClass("fg-grid-item-image");
      $(this).parent().addClass("fg-grid-item-image");
    }

    if($(this).hasClass("fg-grid-item-info")) {
      $(this).removeClass("fg-grid-item-info");
      $(this).parent().addClass("fg-grid-item-info");
    }
  });

  $(".fg-mixed-2x2-row .fg-grid-item, .fg-mixed-3x2-row .fg-grid-item, .fg-mixed-5x2-row .fg-grid-item").each(function() {
    $(this).removeClass("fg-grid-item");
    $(this).parent().addClass("fg-grid-item");
  });

  $(".fg-mixed-2x2-row .fg-grid-item-center, .fg-mixed-3x2-row .fg-grid-item-center, .fg-mixed-5x2-row .fg-grid-item-center").each(function() {
    $(this).removeClass("fg-grid-item-center");
    $(this).parent().addClass("fg-grid-item-center");
  });

	$(".fg-grid-item .fg-grid-item-info .vt-text.instagram p:nth-child(2)").append('<span class="fab fa-instagram social-icon"></span>');

  $(".vt-feature-grid").show();

  /* end feature grid scripts */

	//utility class to add target="_blank" to all links within a component
	$("#vt_main .vt-open-newTab").each(function() {
		if ($(this).hasClass("vt-ctaLink")) {
			$(this).attr("target", "_blank");
		} else {
			$(this).find("a").each(function() {
				$(this).attr("target", "_blank");
			});
		}
	});

	/**
	 * Begin Giving UI
	 * This ui presents four radio choices to the user with dollar amount options to give.
	 * It can be placed anywhere on a page, and can have multiple per page.
	 * Relies on two global variables:
	 * - window.givingRadioUIConfig -- config object with values
	 * -- primaryText: (string) the large text in the UI
	 * -- btnText: (string) the text of the call to action button
	 * -- hasRadio: (boolean) whether the radio buttons show up or not
	 * -- givingAmounts: (array) override values for the radio buttons
	 * 
	 * Use: apply css class "vt-giving-radioUI" to any container, call to action, or html component
	 */
	if($(".vt-giving-radioUI, .vt-giving-radioUIwithSelect").length > 0){

		var $radioUI = $(".vt-giving-radioUI, .vt-giving-radioUIwithSelect");

		$radioUI.each(function(index){
			// build and then append conditionally
			var config = JSON.parse(JSON.stringify(window.givingRadioUIConfig)) || {};
			if($(this).hasClass("vt-giving-radioUIwithSelect")){
				config.withSelect = true;
			}
			var primaryText = $("<h2 class='vt-giving-radioUI-primaryText'></h2>");
			primaryText.html(config.primaryText || "Your gift makes the difference");
			var form = $("<form></form>");
			var radioFieldset, radioLegend, values;
			config.hasRadio = (!config.hasRadio) ? config.hasRadio : true;
			if(config.hasRadio){
				radioFieldset = $("<fieldset class='vt-giving-radioUI-fieldset'></fieldset>");
				radioLegend = $("<legend class='vt-giving-radioUI-legend'>Choose an amount:</legend>");
				values = config.givingAmounts || [100, 250, 500, "Other"];
			}
			var textField = $("<div class='input-group'><div class='input-group-prepend'><div class='input-group-text'>$</div><input type='text' name='other' placeholder='10.50' class='vt-giving-radioUI-textField form-control'></div>");
			if(config.hasRadio){
				textField.hide();
			}
			var closeBtn = $("<button class='vt-giving-radioUI-btn'><span class='far fa-times-circle'></span><span class='vt-giving-radioUI-btnClose'>Close</span></button>").hide();

			var message = $("<p class='vt-giving-radioUI-message hide'></p>").hide();

			if(values){
				var labels = values.map(function(curr){
					return curr + "";
				});
			}
			var btnText = config.btnText || "Give Today";
			var btn = $("<button class='vt-ctaLink maroon gineso uppercase w-100 btn-shadow'>" + btnText + "</button>");

			var div = $("<div class='labelholder'></div>");

			if(radioFieldset && radioLegend){
				radioFieldset.append(radioLegend);

				radioFieldset.append(div);
				radioFieldset.append(message);
				for(i = 0; i < values.length; i++){
					div.append("<input class='vt-giving-radioUI-radioInput' id='" + (labels[i] + "-" + index) + "' type='radio' name='giving' value='" + values[i] + "'>");
					if(labels[i] === "Other"){
						div.append("<label for='" + (labels[i] + "-" + index) + "'>" + labels[i] + "</label>");
					}
					else{
						div.append("<label for='" + (labels[i] + "-" + index) + "'>$" + labels[i] + "</label>");
					}
				}
			}
			
			div.append(textField);
			div.append(closeBtn);

			//add the select fund pulldown if class matches
			if ($(this).hasClass("vt-giving-radioUIwithSelect") && vtfChoices.length > 0) {
				//build select fund number pulldown
				var fundFieldset = $('<fieldset class="vt-giving-funds-fieldset"><legend class="vt-giving-radioUI-legend">Choose a possibility:</legend></fieldset>');
				var fundNumberSelect = $('<select id="vt_giving_funds" name="fund" class="form-control"></select>');

				$(fundNumberSelect).append(vtGiveFundNumbers(vtfChoices));

				fundFieldset.append(fundNumberSelect);
				form.append(fundFieldset);
				form.append(radioFieldset);
			} else {
				form.append(radioFieldset);
			}

			if(!config.hasRadio){
				form.append(div.addClass("vt-giving-radioUI-topSpace").append(message));
			}

			
			var $this = $(this);

			// insert on the page
			if($this.hasClass("vt-callToAction")){
				// if cta, find vtcontainer
				var $vtcontainer = $this.find(".vt-callToAction-message-heading");
				$vtcontainer.append(form);
				$vtcontainer.append(btn);
			}
			else{
				$this.append(primaryText);
				$this.append(form);
				$this.append(btn);
			}

			form = $(this).find("form");

			// apply all event listeners and handlers
			form.find(".labelholder").children("input").each(function(){
				var textFieldContainer = $(this).siblings(".input-group");
				var closeBtn = $(this).siblings(".vt-giving-radioUI-btn");
				var $this = $(this);
				if($(this).attr("id").split("-")[0] === "Other"){
					var otherLabel = $(this).next("label");
					otherLabel.addClass("vt-giving-radioUI-other");
					$(this).click(function(){
						$(this).siblings().toggle();
						textField.show().focus();
						textFieldContainer.find(".vt-giving-radioUI-textField").show().focus();
						$(this).parent().find(".active").removeClass("active");
						closeBtn.show();
					});
					closeBtn.click(function(e){
						e.preventDefault();
						otherLabel.show();
						$this.siblings().show();
						textFieldContainer.hide();
						$(this).hide();
						$(this).siblings(".vt-giving-radioUI-other").focus();
						textFieldContainer.find(".vt-giving-radioUI-textField").val("");
					});
				}
				else{
					$(this).click(function(){
						$(this).focus();
						$(this).parent().find(".active").removeClass("active");
						$(this).next("label").addClass("active");
					});
				}
			});

			// text input submit on enter
			$(this).find(".vt-giving-radioUI-textField").on("keypress", function(e){
				if(e.which === 13){
					e.preventDefault();
					form.trigger("submit");
				}
			});

			// submit button
			$(this).find(".vt-ctaLink").click(function(){
				form.trigger("submit");
			});


			// radio input submit on enter
			$(this).find("form").find("input[type=radio]").each(function(){
				$(this).on("keypress", function(e){
					if(e.which === 13){
						e.preventDefault();
						form.trigger("submit");
					}
				});
			});

			// form submission
			form.on("submit", function(e){
				e.preventDefault();
				var form = $(this);
				var amount = 0;
				var fund = 873181;
				var formValueIdx = 0;
				var formValue = form.serialize();

				// grab the fund number if it exists
				if(config.withSelect){
					formValue = formValue.split("&");
					fund = formValue[formValueIdx].split("=")[1];
					formValueIdx++;
				}

				// parse out the dollar amount or "other" from the radios
				formValue = formValue[formValueIdx].split("=")[1];

				// retrieve text input and assign it to amount, or just assign the radio value to amount
				if(!config.hasRadio || formValue === "Other"){
					amount = getValidNumber(form.find(".vt-giving-radioUI-textField").val()) || amount;
				}
				else{
					amount = formValue;
				}

				// validate the input, build query string and redirect
				if((amount < 1 || amount > 50000) || isNaN(amount)){
					form.find(".vt-giving-radioUI-textField").addClass("text-danger is-invalid");
					form.find(".vt-giving-radioUI-textField").prev(".input-group-text").addClass("text-danger is-invalid");
					message.addClass("text-danger").text("Please enter an amount between $1 and $50,000.").show();
				}
				else{
					form.find(".vt-giving-radioUI-textField").removeClass("text-danger is-invalid");
					message.hide();
					form.find(".vt-giving-radioUI-textField").prev(".input-group-text").removeClass("text-danger is-invalid");

					amount = parseFloat(amount).toFixed(2);

					// ex: https://webapps.es.vt.edu/givingto/gift?fund=873181&amount=10
					var url = "https://webapps.es.vt.edu/givingto/gift?fund=" + fund + "&amount=" + amount + "&utm_source=GivingTo_A&utm_medium=Web&utm_campaign=Lightbox&campaign=lightbox";
					window.location = url;
				}
			});

		});
	}
	/**
	 * End Giving UI
	 */

}); /* end document.ready */

/**
 * Takes a string and parses out a valid number, stripped of commas
 */
function getValidNumber(val){
	return parseFloat(val.replace(/,/g, ''));
}


/**
 * Takes a string of html, splits it on the spaces, and wraps a dom element
 * around each word. Applies any extra attributes that exist in the options object
 * @param {string} text
 * @param {obj} options
 * @return array of strings
 */
function fragmentHTML(text, options){

	text = (text && (text !== " ")) ? text : "";
        // parse and split html by spaces
        var htmlArray = text.split(" ").map(function(val, i, text){
            // wrap each word in span or otherwise specified in config
            var tagName = (options.tagName) ? options.tagName : "span";

            var childNode = "";

            if(options.child)
                childNode = fragmentHTML(val, options.child);

            return "<" + tagName + ">" + (childNode || val) + "</" + tagName + ">";
        });

        // apply any attrs in config
        var headerText = htmlArray.map(function(val, i, htmlArray){
            if(options.attributes){
                for(var prop in options.attributes){
                    val = $(val).attr(prop, options.attributes[prop]);
                }
            }
            return val[0].outerHTML || val;
        });

        return headerText;
}

/**
 * Takes the image srcset attribute and determines the image to display based on the browser width. To be used when
 * you need to put a background image on something via JS.
 * @param {string} imgSrcSet - the srcset attribute of the img element
 */
function findImgSize(imgSrcSet){
	// split the string on the comma
	var imgSources = imgSrcSet.split(",").map(function(sourceStr, i, imgSources){
		// split those strings on the space
		return sourceStr.trim().split(" ");
	});

	// poll the window width
	var windowWidth = window.innerWidth;

	// if window size is gte src size, use that one
	return imgSources.reduce(function(src, curr, i, imgSources){
		// parse and store the int
		var imgWidth = parseInt(curr[1], 10);
		if(imgWidth >= windowWidth){
			src = curr;
		}

		return src;

	})[0];
}


/**
 * Takes an array of selectors and adds the specified class name
 * @param {*} elArr
 * @param {*} className
 */
function addClassNameToSet(elArr, className){
	$(elArr).each(function(i){
		$(elArr[i]).addClass(className);
	})
}

/**
 * Takes an array of selectors and removes the specified class name
 * @param {*} elArr
 * @param {*} className
 */
function removeClassNameFromSet(elArr, className){
	$(elArr).each(function(i){
		$(elArr[i]).removeClass(className);
	})
}

/**
 * Takes a set of figures from a list component and sets a bg image
 * in css to be the the img src from its img child. This is needed
 * to enforce the aspect ratio.
 * @param figures - a set of figures in a list item - jquery obj
 */
function listTopAlignBGImage(figures){
	figures.each(function(){
		var img = $(this).find("img");
		$(this).css({
			"background-image": "url(" + img.attr("src") + ")"
		})
	})
}

/**
 * Takes a set of list items and replaces the grid classes with the specified class
 * @param columns - a set of columns - jquery obj
 * @param addClass - the class(es) to add - array
*/
function listColFullWidth(columns, addClass){
	columns.find(".item").each(function(i){
		var cols = $(this).find("> .row > li");
		cols.each(function(i){
			var newCol = addClass[i] || addClass[0];
			$(this).removeClass().addClass(newCol);
		})
	})
}

$(window).click(function() {
	//hide resources for on click off of it
		if($(".vt-one-preHeader .vt-resources-toggle").attr("aria-expanded") === "true" && $(".vt-nav-toggle").attr("aria-expanded") === "false") {
			resourcesToggle();
		}
});

$(window).on('load', function() {

	//temp fix for bidagent image
	$('img[src*="http://bidagent"]').addClass("vt-bidagent-image");

	/* search page relevance tab index & role */
	if ($("body.vt-search .gsc-selected-option-container").length > 0) {
		$(".gsc-selected-option-container").attr({
			"tabindex" : "0",
			"role" : "button"
		})
	}

	//begin image class script
  $(".vt-image img, .vt-list-item-img figure img").each(function() {

      var actualWidth = this.naturalWidth,
          actualHeight = this.naturalHeight,
          imgPageWidth = this.width,
          imgPageHeight = this.height,
          refWidth = $(this).parents("figure").width(),
          refHeight = $(this).parents("figure").height();

    if($(this).closest(".vt-callToAction-supplement").length <= 0) {

			if (this.height == this.width && $(this).parents(".vt-transparent-bg").length == 0) {

        //begin image component portrait image treatment

          $(this).parents(".vt-image, .vt-list-item-img").addClass("vt-square");

          $(this).parents("figure").addClass("vt-image-portraitFigure");
          $(this).parents("picture").addClass("vt-image-portraitPicture");
          $(this).addClass("vt-image-portraitImage");

          if ($(this).parents(".vt-image-portraitFigure").find("> a").length > 0) {
            $(this).parents(".vt-image-portraitFigure").find("> a").addClass("vt-image-portraitWrapper");
          } else if ($(this).parents(".vt-image-portraitFigure").find("> picture").length > 0) {
            $(this).parents(".vt-image-portraitFigure").find("> picture").wrap('<div class="vt-image-portraitWrapper"></div>');
          }

          $(this).parents("picture").prepend('<svg preserveAspectRatio="xMinYMin meet" class="vt-image-blurHolder" viewBox="0 0 '+actualWidth+' '+actualHeight+'"><defs><filter id="blur"><feGaussianBlur stdDeviation="20" /></filter></defs><g opacity="0.8"><image class="blur-image" xlink:href="'+$(this).attr("src")+'" width="'+actualWidth+'" height="'+actualHeight+'" filter="url(#blur)"></image></g></svg>');

        //end image component portrait image treatment

      } else if (this.height > this.width && $(this).parents(".vt-transparent-bg").length == 0) {

        //begin image component portrait image treatment

          $(this).parents(".vt-image, .vt-list-item-img").addClass("vt-portrait");

          $(this).parents("figure").addClass("vt-image-portraitFigure");
          $(this).parents("picture").addClass("vt-image-portraitPicture");
          $(this).addClass("vt-image-portraitImage");

          if ($(this).parents(".vt-image-portraitFigure").find("> a").length > 0) {
            $(this).parents(".vt-image-portraitFigure").find("> a").addClass("vt-image-portraitWrapper");
          } else if ($(this).parents(".vt-image-portraitFigure").find("> picture").length > 0) {
            $(this).parents(".vt-image-portraitFigure").find("> picture").wrap('<div class="vt-image-portraitWrapper"></div>');
          }

          $(this).parents("picture").prepend('<svg preserveAspectRatio="xMinYMin meet" class="vt-image-blurHolder" viewBox="0 0 '+actualWidth+' '+actualHeight+'"><defs><filter id="blur"><feGaussianBlur stdDeviation="20" /></filter></defs><g opacity="0.8"><image class="blur-image" xlink:href="'+$(this).attr("src")+'" width="'+actualWidth+'" height="'+actualHeight+'" filter="url(#blur)"></image></g></svg>');

        //end image component portrait image treatment

      } else if($(this).parents(".vt-transparent-bg").length === 0) {
          $(this).parents(".vt-list-item-img, .vt-image").addClass("vt-landscape");
      }
    }

  });
  //end image class each script


	$(".vt-callToAction .vt-image-portraitFigure").removeClass("vt-image-portraitFigure");
	$(".vt-callToAction .vt-image-portraitPicture").removeClass("vt-image-portraitPicture");

	if (getCookie("underlineToggle") == 1) {
		$("head").append('<link rel="stylesheet" id="vt_underline_links_css" href="//www.assets.cms.vt.edu/css/underlineLinks.css" type="text/css">');
		$(".vt-access-options").addClass("vt-underline");
	} else {
		$("#vt_underline_links_css").remove();
		$(".vt-access-options").removeClass("vt-underline");
	}

});

$(window).resize(function() {

	/* universal access mobile check */
	accessMode();

	//breadcrumb toggle
	breadcrumbMode();

	//update nav item list
	navInputs = $("#vt_offcanvas_nav.open").find('a, button').filter(':visible');

	//hide resources for on resize
	if($(".vt-one-preHeader .vt-resources-toggle").attr("aria-expanded") === "true" && $(".vt-one-preHeader .vt-nav-toggle").attr("aria-expanded") === "false") {
		resourcesToggle();
	}

	//featured media resize function
	if (window.innerWidth >= 992) {
		$(".vt-featured-media-info").show();
	}

	if($(".vt-carousel").length > 0){
		$(".vt-carousel").each(resizeCarousel);
	}
});

function resizeCarousel(i, vtcarousel){

	var $vtcarousel = $(vtcarousel);

	// var firstItem = $(".carousel-item:eq(0) .item-image");
	var firstItem = $vtcarousel.find(".carousel-item:eq(0) .item-image");

	// 1
	$vtcarousel.find(".carousel-item").each(function(){
		var itemImage = $(this).children(".item-image");
		itemImage.css({
			"height": "0",
			"padding-bottom": "56.25%"
		});

		// force the carousel to be as tall as the tallest carousel-item
		// var items = $(".carousel").find(".carousel-item");
		var items = $vtcarousel.find(".carousel .carousel-item");
		var maxHeight = 0;
		items.each(function(){
			maxHeight = ($(this).innerHeight() >= maxHeight) ? $(this).innerHeight() : maxHeight;
		});

		$vtcarousel.find(".carousel-inner").height(maxHeight);

		// Position the controls at the bottom of the image
		$vtcarousel.find(".vt-carousel-control-belowImage").each(function(){
			var height = 0;
			if($(firstItem).innerHeight() <= 0){
				height = firstItem.width() * 0.5625;
			}
			else{
				height = $(firstItem).innerHeight();
			}
			$(this).css({
				"top": (height - $(this).innerHeight())
			})
		});

		$vtcarousel.find(".vt-carousel-indicator-default").each(function(){
			var height = 0;
			if($(firstItem).innerHeight() <= 0){
				height = firstItem.width() * 0.5625;
			}
			else{
				height = $(firstItem).innerHeight();
			}
			$(this).css({
				"top": (height - $(this).innerHeight())
			})
		});

	});

	// position the left and right controls in the middle of the image
	// $(".vt-carousel-control-belowImage").find(".carousel-control").each(function(){
	$vtcarousel.find(".vt-carousel-control-belowImage .carousel-control").each(function(){
		$(this).css({
			"height": (firstItem.innerHeight()),
			"top": -(firstItem.innerHeight() - 50)
		})
	});

	$vtcarousel.find(".vt-carousel-control-default .carousel-control").each(function(){
		$(this).css({
			"height": (firstItem.innerHeight()),
			"top": -(firstItem.innerHeight() - 50)
		})
	});
}

$(window).on('scroll', function() {

	//hide resources for on scroll
		if($(".vt-one-preHeader .vt-resources-toggle").attr("aria-expanded") === "true" && $(".vt-nav-toggle").attr("aria-expanded") === "false") {
			resourcesToggle();
		}

});

/**
 * Prevent body scroll and overscroll.
 * Tested on mac, iOS chrome / Safari, Android Chrome.
 *
 * Based on: https://benfrain.com/preventing-body-scroll-for-modals-in-ios/
 *           https://stackoverflow.com/a/41601290
 *
 * Use in combination with:
 * html, body {overflow: hidden;}
 *
 * and: -webkit-overflow-scrolling: touch; for the element that should scroll.
 *
 * disableBodyScroll(true, '.i-can-scroll');
 */
var disableBodyScroll = (function () {

    /**
     * Private variables
     */
    var _selector = false,
        _element = false,
        _clientY;

    /**
     * Polyfills for Element.matches and Element.closest
     */
    if (!Element.prototype.matches)
        Element.prototype.matches = Element.prototype.msMatchesSelector ||
        Element.prototype.webkitMatchesSelector;

    if (!Element.prototype.closest)
        Element.prototype.closest = function (s) {
            var ancestor = this;
            if (!document.documentElement.contains(el)) return null;
            do {
                if (ancestor.matches(s)) return ancestor;
                ancestor = ancestor.parentElement;
            } while (ancestor !== null);
            return el;
        };

    /**
     * Prevent default unless within _selector
     *
     * @param  event object event
     * @return void
     */
    var preventBodyScroll = function (event) {
        if (false === _element || !event.target.closest(_selector)) {
            event.preventDefault();
        }
    };

    /**
     * Cache the clientY co-ordinates for
     * comparison
     *
     * @param  event object event
     * @return void
     */
    var captureClientY = function (event) {
        // only respond to a single touch
        if (event.targetTouches.length === 1) {
            _clientY = event.targetTouches[0].clientY;
        }
    };

    /**
     * Detect whether the element is at the top
     * or the bottom of their scroll and prevent
     * the user from scrolling beyond
     *
     * @param  event object event
     * @return void
     */
    var preventOverscroll = function (event) {
        // only respond to a single touch
	    if (event.targetTouches.length !== 1) {
	    	return;
	    }

	    var clientY = event.targetTouches[0].clientY - _clientY;

	    // The element at the top of its scroll,
	    // and the user scrolls down
	    if (_element.scrollTop === 0 && clientY > 0) {
	        event.preventDefault();
	    }

	    // The element at the bottom of its scroll,
	    // and the user scrolls up
		// https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollHeight#Problems_and_solutions
		if ((_element.scrollHeight - _element.scrollTop <= _element.clientHeight) && clientY < 0) {
	        event.preventDefault();
	    }

    };

    /**
     * Disable body scroll. Scrolling with the selector is
     * allowed if a selector is porvided.
     *
     * @param  boolean allow
     * @param  string selector Selector to element to change scroll permission
     * @return void
     */
    return function (allow, selector) {
    	if (typeof selector !== "undefined") {
	        _selector = selector;
	        _element = document.querySelector(selector);
    	}

        if (true === allow) {
        	if (false !== _element) {
	            _element.addEventListener('touchstart', captureClientY, false);
	            _element.addEventListener('touchmove', preventOverscroll, false);
        	}
            document.body.addEventListener("touchmove", preventBodyScroll, false);
        } else {
        	if (false !== _element) {
	            _element.removeEventListener('touchstart', captureClientY, false);
	            _element.removeEventListener('touchmove', preventOverscroll, false);
	        }
            document.body.removeEventListener("touchmove", preventBodyScroll, false);
        }
    };
}());
