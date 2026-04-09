/*
	Strata by HTML5 UP
	html5up.net | @ajlkn
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/

(function($) {

	var $window = $(window),
		$body = $('body'),
		$header = $('#header'),
		$footer = $('#footer'),
		$main = $('#main'),
		settings = {

			// Parallax background effect?
				parallax: true,

			// Parallax factor (lower = more intense, higher = less intense).
				parallaxFactor: 20

		};

	// Breakpoints.
		breakpoints({
			xlarge:  [ '1281px',  '1800px' ],
			large:   [ '981px',   '1280px' ],
			medium:  [ '737px',   '980px'  ],
			small:   [ '481px',   '736px'  ],
			xsmall:  [ null,      '480px'  ],
		});

	// Play initial animations on page load.
		$window.on('load', function() {
			window.setTimeout(function() {
				$body.removeClass('is-preload');
			}, 100);
		});

	// Touch?
		if (browser.mobile) {

			// Turn on touch mode.
				$body.addClass('is-touch');

			// Height fix (mostly for iOS).
				window.setTimeout(function() {
					$window.scrollTop($window.scrollTop() + 1);
				}, 0);

		}

	// Footer.
		$footer.insertAfter($main);

	// Header.

		// Parallax background.

			// Disable parallax on IE (smooth scrolling is jerky), and on mobile platforms (= better performance).
				if (browser.name == 'ie'
				||	browser.mobile)
					settings.parallax = false;

			if (settings.parallax) {

				breakpoints.on('<=medium', function() {

					$window.off('scroll.strata_parallax');
					$header.css('background-position', '');

				});

				breakpoints.on('>medium', function() {

					$header.css('background-position', 'left 0px');

					$window.on('scroll.strata_parallax', function() {
						$header.css('background-position', 'left ' + (-1 * (parseInt($window.scrollTop()) / settings.parallaxFactor)) + 'px');
					});

				});

				$window.on('load', function() {
					$window.triggerHandler('scroll');
				});

			}

	// Main Sections: Two.

		// Lightbox gallery.
			$window.on('load', function() {

				$('#two').poptrox({
					caption: function($a) { return $a.next('h3').text(); },
					overlayColor: '#2c2c2c',
					overlayOpacity: 0.85,
					popupCloserText: '',
					popupLoaderText: '',
					selector: '.work-item a.image',
					usePopupCaption: true,
					usePopupDefaultStyling: false,
					usePopupEasyClose: false,
					usePopupNav: true,
					windowMargin: (breakpoints.active('<=small') ? 0 : 50)
				});

			});

	// One More Step audio toggle.
		(function () {
			var toggleButton = document.getElementById('one-more-step-audio-toggle');
			var gameFrame = document.getElementById('one-more-step-iframe');
			var muted = true;

			if (!toggleButton || !gameFrame) {
				return;
			}

			function syncIframeAudioState() {
				if (!gameFrame.contentWindow) {
					return;
				}
				gameFrame.contentWindow.postMessage({ type: 'oms:set-muted', muted: muted }, '*');
			}

			function updateButtonLabel() {
				toggleButton.textContent = muted ? 'Activar sonido' : 'Silenciar';
				toggleButton.setAttribute('aria-pressed', String(muted));
			}

			toggleButton.addEventListener('click', function () {
				muted = !muted;
				updateButtonLabel();
				syncIframeAudioState();
			});

			gameFrame.addEventListener('load', function () {
				syncIframeAudioState();
			});

			updateButtonLabel();
			syncIframeAudioState();
		}());

	// Puppet follower.
		(function () {
			var layer = document.getElementById('puppet-layer');
			var leftPuppet = document.getElementById('left-puppet');
			var rightPuppet = document.getElementById('right-puppet');

			if (!layer || !leftPuppet || !rightPuppet) {
				return;
			}

			var targetX = window.innerWidth * 0.5;
			var leftX = window.innerWidth * 0.28;
			var rightX = window.innerWidth * 0.72;
			var leftVx = 0;
			var rightVx = 0;
			var stopThreshold = 36;
			var puppetGap = 130;

			function clamp(value, min, max) {
				return Math.min(max, Math.max(min, value));
			}

			function updateTopAnchor() {
				var header = document.getElementById('header');
				if (!header) {
					return;
				}
				var headerRect = header.getBoundingClientRect();
				var top = clamp(headerRect.bottom - 105, 36, window.innerHeight - 120);
				leftPuppet.style.top = top + 'px';
				rightPuppet.style.top = top + 'px';
			}

			function updatePuppet(puppet, currentX, currentVx, targetPosition, accel, maxSpeed) {
				var width = puppet.offsetWidth || 72;
				var minX = 8;
				var maxX = window.innerWidth - width - 8;
				var dx = targetPosition - currentX;
				var moving = Math.abs(dx) > stopThreshold;
				var desiredSpeed = clamp(dx * 0.06, -maxSpeed, maxSpeed);
				var facingRight = currentX < targetX;

				if (moving) {
					if (currentVx < desiredSpeed) {
						currentVx = Math.min(desiredSpeed, currentVx + accel);
					} else if (currentVx > desiredSpeed) {
						currentVx = Math.max(desiredSpeed, currentVx - accel);
					}

					currentVx = clamp(currentVx, -maxSpeed, maxSpeed);
					currentX += currentVx;
					puppet.classList.add('is-moving');
				} else {
					currentVx = 0;
					puppet.classList.remove('is-moving');
				}

				currentX = clamp(currentX, minX, maxX);
				puppet.style.transform = 'translate3d(' + currentX + 'px, 0, 0) scaleX(' + (facingRight ? -1 : 1) + ')';

				return {
					x: currentX,
					vx: currentVx
				};
			}

			function animate() {
				var leftWidth = leftPuppet.offsetWidth || 72;
				var rightWidth = rightPuppet.offsetWidth || 72;
				var minLeft = 8;
				var maxLeft = window.innerWidth - leftWidth - rightWidth - puppetGap - 8;
				var minRight = leftWidth + puppetGap + 8;
				var maxRight = window.innerWidth - rightWidth - 8;

				var leftTarget = clamp(targetX - puppetGap - leftWidth, minLeft, Math.max(minLeft, maxLeft));
				var rightTarget = clamp(targetX + puppetGap, Math.max(minRight, minLeft), maxRight);

				var leftState = updatePuppet(leftPuppet, leftX, leftVx, leftTarget, 0.08, 4.7);
				leftX = leftState.x;
				leftVx = leftState.vx;

				var rightState = updatePuppet(rightPuppet, rightX, rightVx, rightTarget, 0.14, 3.8);
				rightX = rightState.x;
				rightVx = rightState.vx;
				requestAnimationFrame(animate);
			}

			function setTargetFromClientX(clientX) {
				targetX = clamp(clientX, 0, window.innerWidth);
			}

			window.addEventListener('mousemove', function (event) {
				setTargetFromClientX(event.clientX);
			});

			window.addEventListener('pointerdown', function (event) {
				setTargetFromClientX(event.clientX);
			}, { passive: true });

			window.addEventListener('pointermove', function (event) {
				setTargetFromClientX(event.clientX);
			}, { passive: true });

			window.addEventListener('touchstart', function (event) {
				if (!event.touches || !event.touches.length) {
					return;
				}
				setTargetFromClientX(event.touches[0].clientX);
			}, { passive: true });

			window.addEventListener('touchmove', function (event) {
				if (!event.touches || !event.touches.length) {
					return;
				}
				setTargetFromClientX(event.touches[0].clientX);
			}, { passive: true });

			window.addEventListener('resize', function () {
				targetX = clamp(targetX, 0, window.innerWidth);
				updateTopAnchor();
			});

			window.addEventListener('scroll', updateTopAnchor, { passive: true });

			updateTopAnchor();
			animate();
		}());

})(jQuery);
