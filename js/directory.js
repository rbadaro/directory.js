String.prototype.matchesParts = function(parts) {
	for(var i=0; i < parts.length; i++) {
		if(this.toLowerCase().indexOf(parts[i].toLowerCase()) < 0) {
			return false;
		}
	}
	return true;
};

String.prototype.to_id = function() {
	return this.toLowerCase().replace(/\W/g, '_');
}

var arrayFilter = (function() {
	var sections = [
		{title: 'Section 1', links: [
			{title: 'title1', url: 'http://www.google.com'},
			{title: 'title2', url: 'http://www.sapo.pt'}
		]},
		{title: 'Section 2', links: [
			{title: 'title3', url: 'http://www.reddit.com'}
		]}
	];
	
	return {		
		filter: function(text, outCallback, inCallback) {
			var parts = text.split(' '),
					$this = this;
			
			_.each(sections, function(section) {
				_.each(section.links, function(link) {
					if(link.title.matchesParts(parts)) {
						inCallback.call($this, link.title.to_id());
					} else {
						outCallback.call($this, link.title.to_id());
					}
				});
			});
			
		},
		
		sections: function() {
			return sections;
		}
	};
})();

var actions = (function() {
	list = [{prefix: "g ", action: googleAction},
					{prefix: "", action: selectAction}];

	function googleAction(text) {
		location.href = 'http://www.google.com/#q=' + text.substring(2);
	}
	
	function selectAction(text) {
		var links = $("#col0,#col1,#col2").find('li').filter(function() { return $(this).css("display") !== "none" }).find('a');
		if(links.length == 1) {
			location.href = links.attr('href');
		}
	}

	function search(pa, text) {
		if(text.indexOf(pa.prefix) === 0) {
			pa.action.call(this, text);
			return true;
		} else {
			return false;
		}
	}
						
	return {
		search: function(text) {
			for(var i=0; i<list.length; i++) {
				if(search(list[i], text))
					break;
			}
		}
	};
})();

$(function() {
	var $search = $('#search');
		
	$search.focus();
	
	attachEvents();
	addSections();
	
	
	function attachEvents() {
		$('#search_form').submit(function(e) { 
			console.debug("submit");
			e.preventDefault(); 
			actions.search($search.val());
		});

		$search.keyup(function(event) {
			var value = $(this).val();

			if(event.which !== 13) {
				arrayFilter.filter(value, filterOut, filterIn);
			}
		});
		
		function filterIn(id) {
			var $elem = $("#" + id).closest('li');
			if($elem.siblings().filter(function() { return $(this).css("display") !== "none" }).length === 0) {
				$elem.closest('.section').show();
			}
			$elem.show();
		}

		function filterOut(id) {
			var $elem = $("#" + id).closest('li');
			$elem.hide();
			if($elem.siblings().filter(function() { return $(this).css("display") !== "none" }).length === 0) {
				$elem.closest('.section').hide();
			}
		}
	}
	
	
	function addSections() {
		var sections = arrayFilter.sections();
		
		_.each(sections, function(section, i) {
			var sectionElem = $('<div class="section"></div>'),
				  ul = $('<ul></ul>');
			
			sectionElem.append('<h3>' + section.title + '</h3>');
			
			_.each(section.links, function(link) {
				ul.append('<li><a id="' + link.title.to_id() + '" href="' + link.url + '">' + link.title + '</a></li>');
			});
			
			sectionElem.append(ul);
			$('#col' + (i % 3)).append(sectionElem);
		});
	}
});
