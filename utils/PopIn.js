define([
	'mustache',
], function(Mustache) {

	/**
	 * Create a popin view, it can contain directly content or it can be a link to a template
	 * @param {String}  title
	 * @param {String}  content    Can be the content or the link to a template to load (in case it's a template set istemplate to true)
	 * @param {Boolean} isTemplate If true, the url will be loaded as a template, otherwise content will be directly included
	 */
	function PopIn(title, content, options) {
		this.title = title;
		this.content = content;

		options = (typeof options !== "undefined") ? options : {};
		this.classTitle = (typeof options.classTitle !== "undefined") ? options.classTitle : '';
		this.footerButtonTitle = (typeof options.footerButtonTitle !== "undefined") ? options.footerButtonTitle : 'Ok';
		if (typeof options.isTemplate !== "undefined" && options.isTemplate === true) {
			this.isTemplate = true;
			this.template = content;
		} else {
			this.isTemplate = false;
			this.content = content;
		}
		this.onSubmitFunction = (typeof options.onSubmit !== "undefined") ? options.onSubmit : undefined;
		this.backgroundOpacity = 0.5;
	}


	PopIn.prototype.render = function() {
		this.initView();
		if (this.isTemplate) {
			var self = this;
			this.renderTemplate(function() {
				self.initController();
				self.initKeyboard();
			});
		} else {
			this.initController();
			this.initKeyboard();
		}
	};

	/**
	 * Function initializes background and foreground of the popin.
	 * When content is available (in case it's not a template) it's directly inserted
	 */
	PopIn.prototype.initView = function() {
		var backgroundPopin = '<div class="backgroundPopin" style="display:none;opacity:' + this.backgroundOpacity + '"></div>';
		$(document.body).append(backgroundPopin);
		var content = '';
		if (!this.isTemplate) {
			content = this.content;
		}
		var txt = '';
		txt += '<div style="display:none" class="modal foregroundPopin ' + this.classTitle + '" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">';
		txt += '<div class="modal-dialog">';
		txt += '<div class="modal-content">';
		txt += '<div class="modal-header">';
		txt += '<button type="button" class="popin_close close" data-dismiss="modal" aria-hidden="true">&times;</button>';
		txt += '<h4 class="modal-title">' + this.title + '</h4>';
		txt += '</div>';
		txt += '<div class="modal-body contentPopIn">' + content + '</div>';

		txt += '<div class="modal-footer"><span class="modal-footer-text"></span><button type="button" class="btn btn-default popin_close">Close</button>';
		txt += ' <button type="button" class="btn btn-primary popin_close modal_submit">' + this.footerButtonTitle + '</button></div>';

		txt += '</div>';
		txt += '</div>';
		txt += '</div>';
		$(document.body).append(txt);
	};

	/**
	 * Function gets the template, render it and insert as the content
	 * @param  {Function} callback [description]
	 * @return {[type]}            [description]
	 */
	PopIn.prototype.renderTemplate = function(callback) {
		$.get(this.template, function(template) {
			var rendered = Mustache.render(template);
			$('.contentPopIn').html(rendered);
			if (typeof callback === "function") {
				callback();
			}
			return rendered;
		});
	};


	PopIn.prototype.initController = function() {
		var self = this;
		$('.backgroundPopin, .popin_close').click(function() {
			self.hide();
		});
		$('.modal_submit').click(function() {
			if(typeof self.onSubmitFunction !== "undefined"){
				self.onSubmitFunction();
			}
		});
	};

	PopIn.prototype.initKeyboard = function() {
		var self = this;
		$(document).keydown(function(evt) {
			var keyCode = (evt === null) ? event.keyCode : evt.keyCode;
			if (keyCode === 27) { // Escape touch close view
				self.hide();
			}
		});
	};

	PopIn.prototype.show = function() {
		$('.backgroundPopin').fadeIn('slow');
		$('.foregroundPopin').fadeIn('slow');
	};

	PopIn.prototype.hide = function() {
		$('.backgroundPopin').fadeOut('slow');
		$('.foregroundPopin').fadeOut('slow');
	};

	return PopIn;
});