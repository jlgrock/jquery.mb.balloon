/*___________________________________________________________________________________________________________________________________________________
 _ jquery.mb.components                                                                                                                             _
 _                                                                                                                                                  _
 _ file: jquery.mb.balloon.js                                                                                                                       _
 _ last modified: 30/03/15 22.50                                                                                                                    _
 _                                                                                                                                                  _
 _ Open Lab s.r.l., Florence - Italy                                                                                                                _
 _                                                                                                                                                  _
 _ email: matteo@open-lab.com                                                                                                                       _
 _ site: http://pupunzi.com                                                                                                                         _
 _       http://open-lab.com                                                                                                                        _
 _ blog: http://pupunzi.open-lab.com                                                                                                                _
 _ Q&A:  http://jquery.pupunzi.com                                                                                                                  _
 _                                                                                                                                                  _
 _ Licences: MIT, GPL                                                                                                                               _
 _    http://www.opensource.org/licenses/mit-license.php                                                                                            _
 _    http://www.gnu.org/licenses/gpl.html                                                                                                          _
 _                                                                                                                                                  _
 _ Copyright (c) 2001-2015. Matteo Bicocchi (Pupunzi);                                                                                              _
 ___________________________________________________________________________________________________________________________________________________*/

(function ($) {

	/* ------------------------------------------------------------------------------------------------------------------------------------------------
	 * Bez @VERSION
	 * http://github.com/rdallasgray/bez
	 *
	 * A plugin to convert CSS3 cubic-bezier co-ordinates to jQuery-compatible easing functions
	 *
	 * With thanks to Nikolay Nemshilov for clarification on the cubic-bezier maths
	 * See http://st-on-it.blogspot.com/2011/05/calculating-cubic-bezier-function.html
	 *
	 * Copyright @YEAR Robert Dallas Gray. All rights reserved.
	 * Provided under the FreeBSD license: https://github.com/rdallasgray/bez/blob/master/LICENSE.txt
	 */
	jQuery.extend({bez:function(a,b){if(jQuery.isArray(a)&&(b=a,a="bez_"+b.join("_").replace(/\./g,"p")),"function"!=typeof jQuery.easing[a]){var c=function(a,b){var c=[null,null],d=[null,null],e=[null,null],f=function(f,g){return e[g]=3*a[g],d[g]=3*(b[g]-a[g])-e[g],c[g]=1-e[g]-d[g],f*(e[g]+f*(d[g]+f*c[g]))},g=function(a){return e[0]+a*(2*d[0]+3*c[0]*a)},h=function(a){for(var d,b=a,c=0;++c<14&&(d=f(b,0)-a,!(Math.abs(d)<.001));)b-=d/g(b);return b};return function(a){return f(h(a),1)}};jQuery.easing[a]=function(a,d,e,f,g){return f*c([b[0],b[1]],[b[2],b[3]])(d/g)+e}}return a}});
	/*
	 * ------------------------------------------------------------------------------------------------------------------------------------------------
	 * */


	jQuery.balloon = {
		name    : "jquery.mb.balloon",
		version : "1.1",
		author  : "Matteo Bicocchi",
		defaults: {
			addclose     : false,
			addoverlay   : false,
			target       : "self",
			highlight    : true,
			justonce     : false,
			ease         : [0, .96, 0, 1.02],
			animTime     : 250,
			bgcolor      : "#333333",
			bordercolor  : "#ffffff",
			textcolor    : "#ffffff",
			oncursor     : false,
			forceposition: "auto", // or: up, down, left, right
			timer        : 0, // close the balloon after x millis (0 = never)
			balloon      : "This is an mb.balloon"
		},

		balloonTransitions: {
			slide_left : {marginLeft: -150, opacity: 0},
			slide_right: {marginLeft: 150, opacity: 0},
			slide_up   : {marginTop: -150, opacity: 0},
			slide_down : {marginTop: 150, opacity: 0}
		},

		init: function (opt) {
			jQuery("body").on("click focus", "[data-balloon]", function (e) {
				$(this).showBalloon(e, opt, true);
			});

			jQuery("body").on("blur", "[data-balloon]", function (e) {
				$(this).hideBalloon();
			});
		},

		show: function (event, opt, anim) {

			if (typeof anim == "undefined")
				anim = true;

			var $self = this;
			var self = $self[0];

			if(self.isOpened)
				return;

			if(event && event.type == "mouseover" && !self.isDelaied){
				self.isDelaied = true;
				self.delay = setTimeout(function(){
					$self.showBalloon(event,opt,anim);
				},300);
				return;
			}

			if (!self.isInit) {
				self.opt = {};
				if (typeof opt == "object") {
					jQuery.extend(self.opt, jQuery.balloon.defaults, opt, $self.data());
				} else if (typeof opt == "string") {
					self.opt.balloon = opt;
				} else {
					jQuery.extend(self.opt, jQuery.balloon.defaults, $self.data());
				}
				self.isInit = true;
				$self.addClass("mbBalloonOpener");
			} else {
				jQuery.extend(self.opt, $self.data());
			}

			if (typeof event == "undefined")
				self.opt.oncursor = false;

			if ((self.opt.justonce && self.displayed) || self.isOpened) {
				jQuery(".mbBalloonOpener").not($self).each(function () {
					if (this.displayed)
						jQuery(this).hideBalloon(null, {}, false);
				});
				return;
			}

			self.displayed = true;
			self.isOpened = true;
			self.isAjax = false;

			self.$balloonContainer = jQuery("<div/>").addClass("mbBalloon").css({opacity: 0, zIndex: 10002});

			if (self.opt.bgcolor)
				self.$balloonContainer.css({backgroundColor: self.opt.bgcolor, borderColor: self.opt.bordercolor});

			if (self.opt.textcolor)
				self.$balloonContainer.css({color: self.opt.textcolor});

			self.balloonContainer = self.$balloonContainer.get(0);
			self.balloonContainer.opener = self;
			self.balloonContainer.$opener = $self;

			// place the content
			if (typeof self.opt.balloon == "object") {

				// is a DOM element
				var content = self.opt.balloon.clone(true);
				self.$balloonContainer.append(content.show());
				$self.data("balloon", content);
				self.$balloonContainer.css({padding: 0});

			} else if (typeof self.opt.balloon == "string" && self.opt.balloon.indexOf("{ajax}") > -1) {

				self.isAjax = true;

				// is an AJAX URL
				var url = self.opt.balloon.replace("{ajax}", "");
				jQuery.get(url, function (data) {
					self.$balloonContainer.append(data);
					$self.data("balloon", data);
					$self.trigger("ajaxcontentready");
				});

			} else {

				// is a string
				self.$balloonContainer.html(self.opt.balloon);

			}

			if (self.opt.addclose) {
				self.opt.addoverlay = true;
				var close = jQuery("<div/>").addClass("mbBalloonClose");
				self.$balloonContainer.append(close);

				close.on("click", function () {
					$self.hideBalloon();
				})
			};

			if (self.opt.highlight) {
				$self.addClass("highlight");
				$self.parents().css({zIndex: "auto"});
			}

			if (self.opt.addoverlay) {
				var opacity = 0;
				if (jQuery(".mbBalloonOverlay").length) {
					jQuery(".mbBalloonOverlay").remove();
					opacity = 1;
				}

				var balloonOverlay = jQuery("<div/>").addClass("mbBalloonOverlay").css({zIndex: 1000, opacity: opacity});
				balloonOverlay.get(0).opener = $self;
				jQuery("body").append(balloonOverlay);

				balloonOverlay.append(self.$balloonContainer);

				balloonOverlay.on("click", function () {
					if (!self.opt.addclose)
						$self.hideBalloon();
				});

				if (self.opt.highlight) {
					self.position = $self.css("position");

					if ($self.css("position") == "static")
						$self.css("position", "relative");

					if ($self.css("background-color") == "transparent" || $self.css("background-color") == "rgba(0, 0, 0, 0)")
						$self.css("background-color", "inherit");
				}

			} else {

				jQuery("body").append(self.$balloonContainer);

				setTimeout(function () {
					jQuery(document).on("click.mbBalloon", function (e) {
						if ( (!jQuery(e.target).is(".mbBalloon") && !jQuery(e.target).parents().is(".mbBalloon")) && !jQuery(e.target).is($self)) {
							$self.hideBalloon();
							jQuery(document).off("click.mbBalloon");
						}
					})
				}, 100)

			}

			var target = self.opt.target != "self" ? jQuery(self.opt.target) : $self;

			var arrow = $("<div>").addClass("arrow");
			var arrowBorder = arrow.clone().addClass("border");
			arrowBorder.css({borderColor: self.opt.bgcolor});

			self.$balloonContainer.prepend(arrowBorder).prepend(arrow);

			jQuery("body").append(self.$balloonContainer);

			jQuery(window).off("resize.mbBalloon").on("resize.mbBalloon", function () {

				if(self.isOpened){
					$self.hideBalloon(null, opt, false);
					clearTimeout(self.repos);
					self.repos = setTimeout(function () {
						self.isOpened = false;
						$self.showBalloon(null, opt, false);
					}, 300)
				}
			});

			function displayBalloon() {
				self.pos = $self.setBalloonPosition(event, target);

				if (anim) {
					if (self.opt.addoverlay){

						balloonOverlay.fadeTo(self.opt.animTime, 1, function () {
							jQuery(".mbBalloonOpener").not($self).each(function () {
								if (this.displayed)
									jQuery(this).hideBalloon(null, {}, false);
							});
							jQuery("body").css({overflow: "hidden"});
							self.$balloonContainer.css(jQuery.balloon.balloonTransitions["slide_" + self.pos]);
							self.$balloonContainer.animate({marginLeft: 0, marginTop: 0, opacity: 1}, self.opt.animTime, $.bez(self.opt.ease));
						});

					} else {

						self.$balloonContainer.css(jQuery.balloon.balloonTransitions["slide_" + self.pos]);
						self.$balloonContainer.animate({marginLeft: 0, marginTop: 0, opacity: 1}, self.opt.animTime, $.bez(self.opt.ease));
						jQuery(".mbBalloonOpener").not($self).each(function () {
							if (this.displayed)
								jQuery(this).hideBalloon(null, {}, false);
						});

					}

				} else {
					self.$balloonContainer.css({opacity: 1});
					jQuery("body").css({overflow: "hidden"});
				}

				if (self.opt.timer && !self.opt.addclose)
					self.timeout = setTimeout(function () {
						$self.hideBalloon();
					}, self.opt.timer);
			}

			if (self.isAjax) {
				$self.on("ajaxcontentready", function () {displayBalloon()});
				self.isAjax = false;
			} else {
				displayBalloon();
			}

			return $self;
		},

		hide: function (anim, callBack) {

			anim = typeof anim == "undefined" ? true : anim;

			var $self = this.is(".mbBalloon") ? this[0].$opener : this;
			var self = $self[0];

			if (!self)
				return;

			self.isDelaied = false;
			self.isOpened = false;
			clearTimeout(self.timeout);
			clearTimeout(self.delay);

			var $balloon = self.$balloonContainer;

			if (!$balloon)
				return;

			$balloon.trigger("closeBalloon");

			if ($balloon && $balloon.length) {

				var overlay = jQuery(".mbBalloonOverlay").get(0);

				if (anim) {

					$balloon.animate(jQuery.balloon.balloonTransitions["slide_" + self.pos], self.opt.animTime, $.bez(self.opt.ease), function () {
						jQuery(this).remove();
						$self.removeClass("highlight");
						jQuery("body").css("overflow", "visible");

						if (overlay && overlay.opener.is($self))
							jQuery(overlay).fadeOut(self.opt.animTime, function () {
								$(this).remove();

								if (typeof callBack == "function")
									callBack();

							});

						$self.css("position", self.position);

						if (!self.$containment.is("body"))
							self.$containment.css("overflow", self.containment.overflow);
					});

				} else {

					$balloon.remove();
					$self.removeClass("highlight");

					if (overlay && overlay.opener.is($self))
						jQuery(overlay).remove();

					$self.css("position", self.position);

					jQuery("body").css("overflow", "visible");

					if (!self.$containment.is("body"))
						self.$containment.css("overflow", self.containment.overflow);
				}
			}
		},

		setPos: function (event, opener) {

			var $self = this;
			var self = $self[0];
			var arrow = self.$balloonContainer.find(".arrow");

			if (typeof event == "undefined")
				self.opt.oncursor = false;

			self.$containment = opener.parents().filter(function () {
				return jQuery(this).is("body") || (!jQuery(this).is("td, tr, table, tbody") && jQuery(this).css("overflow") != "visible");
			}).eq(0);

			self.containment = self.$containment.get(0);
			self.containment.center = {top: (self.$containment.outerHeight() / 2), left: (self.$containment.outerWidth() / 2)};

			if (self.opt.addoverlay) {
				self.containment.overflow = self.$containment.css("overflow");
				self.$containment.css("overflow", "hidden");
			}

			/* get the center of the containment */
			var centerLeft = self.$containment.outerWidth() / 2;
			var centerTop = self.$containment.outerHeight() / 2;

			var targetTop = self.opt.oncursor ? event.pageY || opener.offset().top : opener.offset().top;
			var targetLeft = self.opt.oncursor ? event.pageX || opener.offset().left : opener.offset().left;
			var targetWidth = self.opt.oncursor ? 1 : opener.outerWidth();
			var targetHeight = self.opt.oncursor ? 1 : opener.outerHeight();

			var center = {top: targetTop + (targetHeight), left: targetLeft + (targetWidth / 2)};

			if (Math.abs(center.top - centerTop) > Math.abs(center.left - centerLeft))
			//up or down?
				self.balloonPos = center.top > centerTop ? "up" : "down";
			else
			//left or right
				self.balloonPos = center.left > centerLeft ? "left" : "right";

			if(self.opt.forceposition != "auto")
				self.balloonPos = self.opt.forceposition;

			var balloonTop, balloonLeft;
			var arrowTop, arrowLeft;

			switch (self.balloonPos) {

				case "up":
					balloonTop = targetTop - self.$balloonContainer.outerHeight() - arrow.outerHeight() / 2;
					balloonLeft = (targetLeft + targetWidth / 2) - (self.$balloonContainer.outerWidth() / 2);
					arrowTop = self.$balloonContainer.outerHeight() - 1;
					arrowLeft = (self.$balloonContainer.outerWidth() / 2) - (arrow.outerWidth() / 2);
					arrow.addClass("s");
					self.$balloonContainer.addClass("s");
					break;

				case "down":
					balloonTop = targetTop + targetHeight + arrow.outerHeight() / 2;
					balloonLeft = (targetLeft + targetWidth / 2) - (self.$balloonContainer.outerWidth() / 2);
					arrowTop = -arrow.outerHeight() / 2;
					arrowLeft = self.$balloonContainer.outerWidth() / 2 - arrow.outerWidth() / 2;
					arrow.addClass("n");
					self.$balloonContainer.addClass("n");
					break;

				case "left":
					balloonTop = targetTop + (targetHeight / 2) - (self.$balloonContainer.outerHeight() / 2);
					balloonLeft = targetLeft - self.$balloonContainer.outerWidth() - arrow.outerWidth();
					arrowTop = (self.$balloonContainer.outerHeight() / 2 - arrow.outerHeight() / 2);
					arrowLeft = self.$balloonContainer.outerWidth() - 1;
					arrow.addClass("e");
					self.$balloonContainer.addClass("e");
					break;

				case "right":
					balloonTop = targetTop + (targetHeight / 2) - self.$balloonContainer.outerHeight() / 2;
					balloonLeft = (targetLeft + targetWidth) + arrow.outerWidth();
					arrowTop = (self.$balloonContainer.outerHeight() / 2 - arrow.outerHeight() / 2);
					arrowLeft = -arrow.outerWidth() / 2;
					arrow.addClass("w");
					self.$balloonContainer.addClass("w");
					break;

				default:
					balloonTop = targetTop - self.$balloonContainer.outerHeight() - arrow.outerHeight() / 2;
					balloonLeft = (targetLeft + targetWidth / 2) - (self.$balloonContainer.outerWidth() / 2);
					arrowTop = self.$balloonContainer.outerHeight() - 1;
					arrowLeft = (self.$balloonContainer.outerWidth() / 2) - (arrow.outerWidth() / 2);
					arrow.addClass("s");
					self.$balloonContainer.addClass("s");
					break;
			}

			if (balloonTop < (jQuery("body").offset().top + jQuery(window).scrollTop())) {

				if (self.balloonPos == "left" || self.balloonPos == "right") {
					var diff = self.$containment.offset().top - balloonTop;
					balloonTop = balloonTop + diff;
					arrowTop -= diff;

					arrowTop = arrowTop < 0 ? 20 : arrowTop;
				}

				if (self.balloonPos == "up") {
					balloonTop = targetTop + targetHeight + arrow.outerHeight() / 2;
					balloonLeft = (targetLeft + targetWidth / 2) - (self.$balloonContainer.outerWidth() / 2);
					arrowTop = -arrow.outerHeight();
					arrowLeft = self.$balloonContainer.outerWidth() / 2 - arrow.outerWidth() / 2;
					arrow.removeClass("n s e w");
					arrow.addClass("n");
					self.$balloonContainer.removeClass("n s e w");
					self.$balloonContainer.addClass("n");
					self.balloonPos = "down"
				}
			}

			if (balloonTop + self.$balloonContainer.outerHeight() - 50 > jQuery(window).height() + jQuery(window).scrollTop()) {

				balloonTop = targetTop - self.$balloonContainer.outerHeight() - arrow.outerHeight() / 2;
				balloonLeft = (targetLeft + targetWidth / 2) - (self.$balloonContainer.outerWidth() / 2);
				arrowTop = self.$balloonContainer.outerHeight();
				arrowLeft = (self.$balloonContainer.outerWidth() / 2) - (arrow.outerWidth() / 2);
				arrow.removeClass("n s e w");
				arrow.addClass("s");
				self.$balloonContainer.removeClass("n s e w");
				self.$balloonContainer.addClass("s");
				self.balloonPos = "up"

			}

			if (balloonLeft < 0) {

				balloonLeft = 0;

			}

			self.$balloonContainer.css({top: balloonTop, left: balloonLeft});
			arrow.css({top: arrowTop, left: arrowLeft});

			return self.balloonPos;
		},

		getBalloon: function () {
			var $self = this;
			var self = $self[0];
			return self.$balloonContainer;
		},

		getOpener: function () {
			var $self = this;
			var self = $self[0];
			return self.$opener;
		}

	};

	/* Public methods */
	jQuery.fn.showBalloon = jQuery.balloon.show;
	jQuery.fn.hideBalloon = jQuery.balloon.hide;
	jQuery.fn.setBalloonPosition = jQuery.balloon.setPos;
	jQuery.fn.getBalloon = jQuery.balloon.getBalloon;
	jQuery.fn.getOpener = jQuery.balloon.getOpener;

})(jQuery);

