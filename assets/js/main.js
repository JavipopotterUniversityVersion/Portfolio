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
			var loadButton = document.getElementById('one-more-step-load');
			var toggleButton = document.getElementById('one-more-step-audio-toggle');
			var gameFrame = document.getElementById('one-more-step-iframe');
			var gameEmbed = document.querySelector('#one-more-step .game-embed');
			var muted = true;
			var isLoaded = false;

			if (!loadButton || !toggleButton || !gameFrame || !gameEmbed) {
				return;
			}

			function syncIframeAudioStateReliable() {
				syncIframeAudioState();
				window.setTimeout(syncIframeAudioState, 120);
				window.setTimeout(syncIframeAudioState, 480);
			}

			function syncIframeAudioState() {
				if (!isLoaded || !gameFrame.contentWindow) {
					return;
				}
				gameFrame.contentWindow.postMessage({ type: 'oms:set-muted', muted: muted }, '*');
			}

			function updateButtonLabel() {
				toggleButton.textContent = muted ? 'Activar sonido' : 'Silenciar';
				toggleButton.setAttribute('aria-pressed', String(muted));
			}

			function loadGame() {
				if (isLoaded) {
					return;
				}

				var gameSrc = gameFrame.getAttribute('data-src');
				if (!gameSrc) {
					return;
				}

				isLoaded = true;
				gameFrame.setAttribute('src', gameSrc);
				gameEmbed.classList.add('is-loaded');
				loadButton.textContent = 'Juego cargando...';
				loadButton.disabled = true;
			}

			loadButton.addEventListener('click', loadGame);

			toggleButton.addEventListener('click', function () {
				muted = !muted;
				updateButtonLabel();
				syncIframeAudioStateReliable();
			});

			gameFrame.addEventListener('load', function () {
				loadButton.textContent = 'Juego cargado';
				syncIframeAudioStateReliable();
			});

			updateButtonLabel();
			syncIframeAudioStateReliable();
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
			var baseTop = 0;
			var stopThreshold = 36;
			var puppetGap = 130;
			var gravity = 0.72;
			var maxFallSpeed = 18;
			var bounceDamping = 0.52;

			var leftState = {
				el: leftPuppet,
				x: window.innerWidth * 0.28,
				y: 0,
				vx: 0,
				vy: 0,
				isDragging: false,
				isFalling: false,
				dragTilt: 0,
				dragPointerId: null,
				lastPointerX: 0,
				lastPointerY: 0,
				lastPointerTs: 0,
				dragOffsetX: 0,
				dragOffsetY: 0,
				accel: 0.08,
				maxSpeed: 4.7
			};

			var rightState = {
				el: rightPuppet,
				x: window.innerWidth * 0.72,
				y: 0,
				vx: 0,
				vy: 0,
				isDragging: false,
				isFalling: false,
				dragTilt: 0,
				dragPointerId: null,
				lastPointerX: 0,
				lastPointerY: 0,
				lastPointerTs: 0,
				dragOffsetX: 0,
				dragOffsetY: 0,
				accel: 0.14,
				maxSpeed: 3.8
			};

			var puppets = [leftState, rightState];

			function clamp(value, min, max) {
				return Math.min(max, Math.max(min, value));
			}

			function updateTopAnchor() {
				var header = document.getElementById('header');
				if (!header) {
					return;
				}
				var headerRect = header.getBoundingClientRect();
				baseTop = clamp(headerRect.bottom - 105, 36, window.innerHeight - 120);

				puppets.forEach(function (puppet) {
					if (!puppet.isDragging && !puppet.isFalling) {
						puppet.y = baseTop;
					}
				});
			}

			function updatePuppet(puppet, targetPosition) {
				var width = puppet.el.offsetWidth || 72;
				var minX = 8;
				var maxX = window.innerWidth - width - 8;
				var dx = targetPosition - puppet.x;
				var moving = Math.abs(dx) > stopThreshold;
				var desiredSpeed = clamp(dx * 0.06, -puppet.maxSpeed, puppet.maxSpeed);
				var facingRight = puppet.x < targetX;
				var topLimit = baseTop + 24;

				if (puppet.isDragging) {
					puppet.isFalling = false;
					puppet.el.classList.remove('is-moving');
					puppet.y = Math.min(puppet.y, topLimit);
				} else {
					if (moving) {
						if (puppet.vx < desiredSpeed) {
							puppet.vx = Math.min(desiredSpeed, puppet.vx + puppet.accel);
						} else if (puppet.vx > desiredSpeed) {
							puppet.vx = Math.max(desiredSpeed, puppet.vx - puppet.accel);
						}

						puppet.vx = clamp(puppet.vx, -puppet.maxSpeed, puppet.maxSpeed);
					} else {
						puppet.vx *= 0.9;
						if (Math.abs(puppet.vx) < 0.04) {
							puppet.vx = 0;
						}
					}

					puppet.x += puppet.vx;
					if (moving || Math.abs(puppet.vx) > 0.08) {
						puppet.el.classList.add('is-moving');
					} else {
						puppet.el.classList.remove('is-moving');
					}

					if (puppet.isFalling) {
						puppet.vy = clamp(puppet.vy + gravity, -maxFallSpeed, maxFallSpeed);
						puppet.y += puppet.vy;
						if (puppet.y >= baseTop) {
							var impactSpeed = Math.abs(puppet.vy);
							puppet.y = baseTop;
							if (impactSpeed > 2.2) {
								puppet.vy = -(impactSpeed * bounceDamping);
								puppet.y += puppet.vy;
							} else {
								puppet.vy = 0;
								puppet.isFalling = false;
							}
						}
					} else {
						puppet.y = baseTop;
					}

					puppet.dragTilt *= 0.84;
					if (Math.abs(puppet.dragTilt) < 0.2) {
						puppet.dragTilt = 0;
					}
				}

				puppet.x = clamp(puppet.x, minX, maxX);
				puppet.y = clamp(puppet.y, 0, window.innerHeight - 36);
				puppet.el.style.top = puppet.y + 'px';
				puppet.el.style.transform = 'translate3d(' + puppet.x + 'px, 0, 0) scaleX(' + (facingRight ? -1 : 1) + ') rotate(' + puppet.dragTilt + 'deg)';
			}

			function startDrag(puppet, event) {
				event.preventDefault();
				var rect = puppet.el.getBoundingClientRect();
				puppet.isDragging = true;
				puppet.dragPointerId = event.pointerId;
				puppet.lastPointerX = event.clientX;
				puppet.lastPointerY = event.clientY;
				puppet.lastPointerTs = performance.now();
				puppet.dragOffsetX = event.clientX - rect.left;
				puppet.dragOffsetY = event.clientY - rect.top;
				puppet.vx = 0;
				puppet.vy = 0;
				puppet.isFalling = false;
				puppet.el.classList.add('is-dragging');
				targetX = event.clientX;
				if (puppet.el.setPointerCapture) {
					puppet.el.setPointerCapture(event.pointerId);
				}
				window.getSelection().removeAllRanges();
			}

			function dragMove(puppet, event) {
				if (!puppet.isDragging || puppet.dragPointerId !== event.pointerId) {
					return;
				}

				var width = puppet.el.offsetWidth || 72;
				var minX = 8;
				var maxX = window.innerWidth - width - 8;
				var maxY = window.innerHeight - 36;
				var now = performance.now();
				var dt = Math.max(1, now - puppet.lastPointerTs);
				var pointerDx = event.clientX - puppet.lastPointerX;
				var pointerDy = event.clientY - puppet.lastPointerY;

				puppet.x = clamp(event.clientX - puppet.dragOffsetX, minX, maxX);
				puppet.y = clamp(event.clientY - puppet.dragOffsetY, 0, maxY);
				puppet.dragTilt = clamp((event.clientX - puppet.lastPointerX) * 1.55, -34, 34);
				puppet.vx = clamp((pointerDx / dt) * 16.67, -8, 8);
				puppet.vy = clamp((pointerDy / dt) * 16.67, -maxFallSpeed, maxFallSpeed);
				puppet.lastPointerX = event.clientX;
				puppet.lastPointerY = event.clientY;
				puppet.lastPointerTs = now;
				targetX = event.clientX;
			}

			function endDrag(puppet, event) {
				if (!puppet.isDragging || puppet.dragPointerId !== event.pointerId) {
					return;
				}

				puppet.isDragging = false;
				puppet.dragPointerId = null;
				puppet.el.classList.remove('is-dragging');

				if (puppet.y < baseTop) {
					puppet.isFalling = true;
				} else {
					puppet.y = baseTop;
					puppet.vy = 0;
					puppet.isFalling = false;
				}

				if (puppet.el.releasePointerCapture) {
					try {
						puppet.el.releasePointerCapture(event.pointerId);
					} catch (e) {
					}
				}
			}

			function bindDrag(puppet) {
				puppet.el.addEventListener('pointerdown', function (event) {
					if (event.button !== undefined && event.button !== 0) {
						return;
					}
					startDrag(puppet, event);
				});

				puppet.el.addEventListener('pointermove', function (event) {
					dragMove(puppet, event);
				});

				puppet.el.addEventListener('pointerup', function (event) {
					endDrag(puppet, event);
				});

				puppet.el.addEventListener('pointercancel', function (event) {
					endDrag(puppet, event);
				});
			}

			function animate() {
				var leftWidth = leftState.el.offsetWidth || 72;
				var rightWidth = rightState.el.offsetWidth || 72;
				var minLeft = 8;
				var maxLeft = window.innerWidth - leftWidth - rightWidth - puppetGap - 8;
				var minRight = leftWidth + puppetGap + 8;
				var maxRight = window.innerWidth - rightWidth - 8;

				var leftTarget = clamp(targetX - puppetGap - leftWidth, minLeft, Math.max(minLeft, maxLeft));
				var rightTarget = clamp(targetX + puppetGap, Math.max(minRight, minLeft), maxRight);

				updatePuppet(leftState, leftTarget);
				updatePuppet(rightState, rightTarget);
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

			bindDrag(leftState);
			bindDrag(rightState);
			updateTopAnchor();
			animate();
		}());

})(jQuery);
