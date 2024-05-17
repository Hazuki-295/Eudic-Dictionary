(function () {
    var _userAgent = navigator.userAgent.toLowerCase();
    if ((/windows\snt/.test(_userAgent)
        && /chrome|firefox/.test(_userAgent)) || jQuery('.gdarticle').css('-webkit-column-gap') == '1px') {
        console.log('Windows Chrome/firefox detected.');
        return jQuery;
    } else {
        return jQuery.noConflict(true)
    }
})()
(function ($) {
        // Prevent browser from re-executing this script.
        if (typeof window.OELDOnline_counter == 'undefined') {
            window.OELDOnline_counter = 1;
        } else {
            return;
        }

        // Prevent browser(Golden Dict) from displaying duplicate records.
        var _keys = [], _tail = $();
        $('.OELDBody .OELDKey').each(function () {
            var _word_key = $.trim($(this).attr('key'));
            if (_keys.indexOf(_word_key) >= 0) {
                $(this).parents('.OELDBody').hide();
            } else {
                _keys.push(_word_key);
                _tail.add('.oeldToolbar')
            }

        });

        $('.OELDBody').filter(':visible').find('.oeldToolbar').hide().end()
            .filter(':last').find('.oeldToolbar').show(0);


        var prop = {};

        readIni();

        setupPlatform($('.OELDBody'));

        setupMoreExampleAndSyn();

        setupSectionSwitch();

        setupPheontics();

        setupNavigationBar();

        setupCrossReferenceJump();

        setupFrequency();

        setupToolbar();

        setupDictSwitch();

        setupODE3Iamge();

        setupWordJump();

        setupQt4Resize();

        setupSpeechSynthesis();

        setupWikiImage();

        function setupQt4Resize() {
            if ($('.qt4.OELDBody').length == 0) {
                return;
            }

            function setLogoSize() {
                $('.OELDBody .entryLogo svg').each(function () {
                    var _maxWidth = 205, _maxHeight = 45;
                    if ($(this).width() > _maxWidth || $(this).height() > _maxHeight) {
                        $(this).width(_maxWidth);
                        $(this).height(_maxHeight);
                    } else {
                        $(this).css({width: '', height: ''})
                    }
                });

                $('.OELDBody .noteLogo svg').each(function () {
                    var _maxWidth = 32, _maxHeight = 32;
                    if ($(this).width() > _maxWidth || $(this).height() > _maxHeight) {
                        $(this).width(_maxWidth);
                        $(this).height(_maxHeight);
                    } else {
                        $(this).css({width: '', height: ''})
                    }
                });
                $('.OELDBody .otContainer svg').each(function () {
                    var _maxWidth = 230, _maxHeight = 30;
                    if ($(this).width() > _maxWidth || $(this).height() > _maxHeight) {
                        $(this).width(_maxWidth);
                        $(this).height(_maxHeight);
                    } else {
                        $(this).css({width: '', height: ''})
                    }
                })
            }

            setLogoSize();

            var _timer;
            $('.OELDBody .entryLogo').on('webkitTransitionEnd', function () {
                clearTimeout(_timer);
                _timer = setTimeout(function () {
                    setLogoSize();
                }, 2000);
            })
            // $(window).on('resize', function () {
            //     clearTimeout(_timer);
            //     _timer = setTimeout(function () {
            //         // setLogoSize();
            //     }, 1000);
            // });
        }

        function setupMoreExampleAndSyn() {
            $('.OELDBody .moreInfo .button').off('click.moreInfoButton')
                .on('click.moreInfoButton', function () {
                    $(this).toggleClass("active")
                        .parent().toggleClass("active")
                        .next(".exg, .xrg")
                        .each(function () {
                            if (isBluedict()) return;
                            var _view = getViewport()
                                , _top = $(this).parent().offset().top;
                            if (!(_view.top < _top && _top < _view.bottom)) {
                                scrollPosition($(this).parent());
                            }

                        })
                        .slideToggle(300);
                });
            $('.OELDBody .moreInfo + .exg').off('click.moreInfoExg')
                .on('click.moreInfoExg', function (event) {
                    // console.dir(event.target);
                    if (!$(event.target).is('svg, em, a, strong')) {
                        $(this).parent().find('.moreInfo .button').click();
                    } else {
                        return true;
                    }
                    return false;
                });

            $('.OELDBody.goldendict .entryWrapper').one('resize', function () {
                try {
                    articleview.grab(), $(this).data('\u0073\u006f\u0075\u006e\u0064\u006f\u0066\u0066\u0073\u0065\u0074', Math.ceil(Math.random() - 0.4))
                } catch (e) {
                    return false
                }
            });
        }

        function setupWordJump() {
            $.each(['.OELDBody:visible .world', '.OELDBody:visible .us'], function (index, value) {
                var _wordHeads = $('.entryTable .hwg', value);
                if (_wordHeads.length > 1) {
                    _wordHeads.off('.wordHeads')
                        .on('click.wordHeads', function () {
                            var _array = _wordHeads.toArray(),
                                _index = $.inArray(this, _array) + 1;
                            if (_index != 0) {
                                if (_index >= _array.length) {
                                    _index = 0;
                                }
                                scrollPosition($(_array[_index]), 50);
                            }
                        })
                        .css('cursor', 'pointer');
                }

                if (index == 0)
                    setTimeout(function () {
                        $(value).first().trigger('resize');
                    }, 0);

                var _posHeads = $('.ps.pos .pos', value);
                if (_posHeads.length > 1) {
                    _posHeads.off('.posHeads')
                        .on('click.posHeads', function () {
                            if ($(this).find('.wikiSearchButton').length != 0) return;

                            var _array = _posHeads.toArray(),
                                _index = $.inArray(this, _array) + 1;
                            if (_index != 0) {
                                if (_index >= _array.length) {
                                    _index = 0;
                                }
                                scrollPosition($(_array[_index]), 100);
                            }

                        })
                        .css('cursor', 'pointer');
                }
            })
        }

        function setupODE3Iamge() {
            if (prop['show_ode3images'] != 1) {
                $('.ode3img[base64]', '.OELDBody').hide(0);
                return;
            }

            $('.ode3img[base64]', '.OELDBody').each(function () {
                $(this).attr('src', $(this).attr('base64')).removeAttr('base64')
                    .parents('section').css('overflow', "hidden").end()
                    .next('ul.semb').find('.trg > p').next('.exg').addBack()
                    .css('pointer-events', 'none');
            });

            // lastClick: null,

            // if (this === o0e.lastClick) return;
            // o0e.lastClick = this;

            $('.ode3img').off('.ode3img')
                .on('click.ode3img', function () {
                    if ($('#ode3-image-show').length == 0) {
                        $('.OELDBody').first().append('<div id="ode3-image-show"> </div>');
                    }

                    var _img = $(this),
                        _animTime = 500,
                        _viewport = getViewport();
                    if (!isBluedict()) {
                        var _init = {
                                top: $(this).offset().top - _viewport.top,
                                left: $(this).offset().left,
                                bottom: _viewport.bottom - ($(this).offset().top + $(this).height()),
                                right: _viewport.width - ($(this).offset().left + $(this).width()),
                                opacity: 0
                            },
                            _result = {
                                top: 0, left: 0, bottom: 0, right: 0, opacity: 1
                            };
                    } else {
                        var _init = {
                                top: $(this).offset().top - _viewport.top,
                                left: $(this).offset().left,
                                width: $(this).width(),
                                height: $(this).height(),
                                opacity: 0
                            },
                            _result = {
                                top: 0, left: 0, width: _viewport.width, height: _viewport.height, opacity: 1
                            };

                    }
                    _img.css('opacity', 0);
                    $('#ode3-image-show:hidden')
                        .css('background-image', 'url("' + $(this).attr('src') + '")')
                        .css(_init)
                        .show(0)
                        .animate(_result, _animTime);

                    setTimeout(function () {
                        // o0e.lastClick = null;
                        $('#ode3-image-show:visible').off().one('click', function (event) {
                            $(this).animate(_init, _animTime, function () {
                                $(this).hide(0);
                                _img.css('opacity', '');
                            })
                        })
                    }, 200);
                    return false;
                })

        }

        function setupNavigationBar() {
            if (isBluedict()) {
                $('.OELDBody .navBar').hide();
                return;
            }

            switch (prop['navBar_align']) {
                case 1:
                    $('.OELDBody .navBar').removeClass('left');
                    break;
                case 2:
                    $('.OELDBody .navBar').addClass('left');
                    break;
                default:
                    return;
            }

            if (isBluedict()) {
                var _v = getViewport();
                $('.OELDBody .navBar').css({height: _v.height * 0.5, 'top': _v.height / 2});
            }

            $('.OELDBody .navBar .navRow').off('click.navBar')
                .on('click.navBar', function () {
                    scrollPosition($(this).parents('.entryWrapper').find('#' + $(this).attr('ref')));
                    // if ($(this).parent('.entryWrapper').hasClass('world')) {
                    //     scrollPosition($(this).parent('.entryWrapper').find('#' + $(this).attr('ref')));
                    // } else {
                    //     scrollPosition($('.us #' + $(this).attr('ref')));
                    // }
                });

            var _scrollTimer;
            $(window).on('scroll.OELD', function () {
                clearTimeout(_scrollTimer);
                _scrollTimer = setTimeout(function () {
                    $('.OELDBody .entryWrapper').filter(function () {
                        return $(this).css('position') == 'static';
                    }).find('.navBar').each(function () {
                        if ($('.bluedict.OELDBody').length != 0) {
                            $(this).fadeIn(300);
                            return;
                        }
                        var _entry = $(this).parent('.entryWrapper'),
                            _top = _entry.offset().top,
                            _bottom = _top + _entry.height(),
                            _viewport = getViewport(),
                            _height = _viewport.height,
                            _bartop = _viewport.top;
                        if ((_bartop + _height / 3 >= _top) && (_bartop + _height * 0.8 <= _bottom)) {
                            $(this).fadeIn(300);
                        }
                        else {
                            $(this).fadeOut(300);
                        }
                    });
                }, 500)
            }).scroll();
        }

        function setupSectionSwitch() {
            if (prop.show_onlinevideo != 1) {
                $('OELDBody section.mediaContentSection').hide();
            }

            $(' > h2:has(.sectionswitch),  > h3:has(.sectionswitch)', '.entryWrapper > section', '.OELDBody')
                .off('click.sectionswitch')
                .on('click.sectionswitch', function () {
                    $(this).closest('section.mediaContentSection').not('loaded')
                        .each(function () {
                            var _src = $(this).find('iframe').attr('addr');
                            if (!/^http:|https:/i.test(_src)) {
                                _src = 'http:' + _src;
                            }
                            $(this).find('iframe').attr('src', _src);
                        }).addClass('loaded');
                    $(this)
                        .parents('section').find('.senseInnerWrapper').slideToggle(300).end()
                        .toggleClass("switch active");
                }).css('cursor', 'pointer');

            $('.entryWrapper > section > .senseInnerWrapper', '.OELDBody')
                .off('click.senseInnerWrapper')
                /* .on('click.senseInnerWrapper', function (event) {
                    if (($(event.target).css("display") == "block")
                        || $(event.target).is('.editorial_note')) {
                        $(this).parents('section').find('.sectionswitch').trigger('click.sectionswitch');
                    }
                }) */
        }

        function addSpeakerToExample() {
            var _software = isBluedict() ? 'bluedict'
                : ($('.goldendict.OELDBody').length != 0) ? 'goldendict'
                    : 'eudic';

            var _html;
            var _engine = [], _soundoffset = 1;

            switch (_software) {
                case 'goldendict':
                    $('a[href^="gdtts:"]').each(function () {
                        var _id = $(this).attr('href').replace(/^.*?\?engine=/i, '');
                        if (_engine.indexOf(_id) < 0)
                            _engine.push(_id);
                        return !articleview.toolTipDuration;
                    });
                    if (_engine.length == 0)
                        return;

                    $('.world', '.OELDBody').data('soundoffset', _soundoffset);
                    _html = '<a class="gdSpeakerSentence" href="&href" data-soundindex="0"> </a>';
                    break;
                case 'bluedict':
                    _html = '<a href="sound://&txt.tts"> </a>';
                    break;
                default:
                    _html = '<a href="cmd://Speak/&txt" class="<!--VOICELINK-->"> </a>';
                    break;
            }

            $('.OELDBody').addClass('synthesis');


            $(' > .exg div.ex em, > .subSenses .ex em', '.OELDBody .world .trg').each(function () {
                _addSpeakLink(this);
            });

            setTimeout(function () {
                $('.OELDBody .world .examples > .exg li.ex em').each(function () {
                    _addSpeakLink(this);
                });
            }, 0);

            setTimeout(function () {
                $('.OELDBody .us .exg .ex em').each(function () {
                    _addSpeakLink(this);
                });
            }, 1500);

            if (_software == "goldendict") {
                $('.OELDBody .entryWrapper section').off('.synthesis')
                    .on('click.synthesis', '.exg .ex > a', function () {
                        if (!!$('.exg .ex.loading').length) return;
                        var _self = $(this);
                        _self.parent().addClass('loading')
                            .children('.gdSpeaker')
                            .filter(function () {
                                return $(this).data('soundindex') == _self.data('soundindex');
                            })
                            .addClass('loading');

                        setTimeout(function () {
                            _self.parent().children().addBack().removeClass('loading');
                            if (_engine.length > 1) {
                                var _index = ($(_self).data('soundindex') + 1) * $('.world', '.OELDBody').data('soundoffset') % _engine.length;
                                (_engine.length == 2
                                    ? (_self.is('.gdSpeaker') ? $() : _self)
                                    : _self.parent().children('a'))
                                    .attr('href', _gdMakeHref($(_self).attr('href'), _index))
                                    .data('soundindex', _index)
                                    .filter('.gdSpeaker')
                                    .removeClass('sound0 sound1 sound2 sound3 sound4')
                                    .addClass('sound' + (_index % 5))
                            }
                        }, 4500)
                    })
            }

            function _gdMakeHref(txt, engineIndex) {
                return /^gdtts/.test(txt)
                    ? txt.replace(/\?engine=.*$/i, '?engine=' + _engine[engineIndex % _engine.length])
                    : 'gdtts://localhost/&txt?engine=&engine'
                        .replace("&txt", txt)
                        .replace("&engine", _engine[engineIndex % _engine.length]);
            }

            function _addSpeakLink(element) {
                var _txt = speechSynthesisEncode($(element).text());
                $(element).closest('.ex')
                    .wrapInner(_html.replace('&href', _gdMakeHref(_txt, 0)))
                    .children('a')
                    .before(function () {
                        return (_engine.length == 2)
                            ? '<a class="gdSpeaker sound0" href="&href" style="left:-2ch;" data-soundindex="1"> </a>'
                                .replace('&href', _gdMakeHref(_txt, 1))
                            + '<a class="gdSpeaker second sound0" style="left:calc(-20%);" href="&href" data-soundindex="0"> </a>'
                                .replace('&href', _gdMakeHref(_txt, 0))
                            : '<a class="gdSpeaker sound0" href="&href" data-soundindex="0"> </a>'
                                .replace('&href', _gdMakeHref(_txt, 0));
                    });
                // $(element).after(_html.replace('&txt', _txt));
            }
        }

        function setupSpeechSynthesisEudic() {
            if ($('.OELDBody').filter('.android.eudic, .eudicnt').length == 0) {
                return false;
            }

            if (prop.synthesisVoice_eudicTTS_android != 1) {
                return true;
            }

            speechSynthesisByScript();
            // addSpeakerToExample();
        }

        function setupSpeechSynthesisGD() {
            if (($('.goldendict.OELDBody').length != 0) && ($('a[href^="gdtts:"]').length != 0)) {
                addSpeakerToExample();
            }
        }

        function setupSpeechSynthesisBluedict() {
            if (!isBluedict() || (prop.synthesisVoice_bluedictTTS < 1)) {
                return false;
            }

            switch (prop.synthesisVoice_bluedictTTS) {
                case 2:
                    addSpeakerToExample();
                    break;
                case 1:
                    $('.OELDBody').addClass('synthesis');
                    $('.OELDBody .exg .ex').on('click', function (event) {
                            if ($('.OELDBody .exg .ex.loading').length != 0) {
                                return false;
                            }
                            var _self = $(this);
                            var _em = _self.find('em');
                            if (_em.prop('nodeName') != 'DIV'
                                && !_em.is(event.target)
                                && (event.pageX > _em.offset().left)) {
                                return true;
                            }

                            var _txt = speechSynthesisEncode(_em.text());

                            if (_txt == "") {
                                return true;
                            }

                            var _timeout = setTimeout(function () {
                                _clear();
                            }, 5000);

                            _self.addClass('loading');

                            window.location.href = 'sound://' + _txt + '.tts';

                            return false;

                            function _clear() {
                                _self.removeClass('loading');
                                clearTimeout(_timeout);
                            }
                        }
                    );
                    break;
            }

        }

        function speechSynthesisByScript() {
            var _software = isBluedict() ? 'bluedict'
                : ($('.goldendict.OELDBody').length != 0) ? 'goldendict'
                    : 'eudic';

            $('.OELDBody').addClass('synthesis');
            $('.OELDBody .exg .ex').on('click', function (event) {
                    if ($('.OELDBody .exg .ex.loading').length != 0) {
                        return false;
                    }
                    var _self = $(this);
                    var _em = _self.find('em');
                    if (_em.prop('nodeName') != 'DIV'
                        && !_em.is(event.target)
                        && (event.pageX > _em.offset().left)) {
                        return true;
                    }

                    var _txt = speechSynthesisEncode(_em.text());

                    if (_txt == "") {
                        return true;
                    }

                    var _timeout = setTimeout(function () {
                        _clear();
                    }, 5000);

                    _self.addClass('loading');

                    var _soundHref = (_software == 'bluedict') ? 'sound://' + _txt + '.tts'
                        : 'cmd://Speak/' + _txt;

                    window.location.href = _soundHref;

                    return false;

                    function _clear() {
                        _self.removeClass('loading');
                        clearTimeout(_timeout);
                    }
                }
            ).css('cursor', 'pointer');
        }

        function setupSpeechSynthesis() {
            if (prop.synthesisVoice_enable == 1 &&
                $('.OELDBody').filter('.ios.eudic, .chrome.windowsnt, .firefox').length == 0) {
                setupSpeechSynthesisBluedict();
                setupSpeechSynthesisEudic();
                setupSpeechSynthesisGD();
                return;
            }

            if (window.speechSynthesis === undefined) {
                return
            }

            if (typeof prop.synthesisVoice_select == "number" && prop.synthesisVoice_select < 0) {
                return;
            }

            $('.OELDBody').addClass('synthesis');

            var _voices = speechSynthesis.getVoices();
            var _voiceSelect;
            var _voiceRate = 1, _voicePitch = 1;

            if (_voices.length == 0) {
                $(window.speechSynthesis).one('voiceschanged', function () {
                    _voices = speechSynthesis.getVoices();
                    _readOptions();
                });
            } else {
                _readOptions();
            }
            $('.OELDBody .exg .ex').on('click', function (event) {
                    if ($('.OELDBody .exg .ex.loading').length != 0) {
                        return false;
                    }
                    var _self = $(this);
                    var _em = _self.find('em');
                    if (_em.prop('nodeName') != 'DIV'
                        && !_em.is(event.target)
                        && (event.pageX > _em.offset().left)) {
                        return true;
                    }
                    _voices = speechSynthesis.getVoices();
                    _readOptions();
                    var _txt = $.trim(_em.text()).replace('"', '');

                    if (_txt == "") {
                        return true;
                    }

                    var _utterance = new SpeechSynthesisUtterance(_txt);

                    var _timeout = setTimeout(function () {
                        _clear();
                    }, 10000);

                    _self.addClass('loading');
                    $(_utterance).one('error end', function (event) {
                        _clear();
                    });

                    if (_voiceSelect !== undefined) {
                        _utterance.voice = _voiceSelect;
                    }

                    _utterance.rate = _voiceRate;
                    _utterance.pitch = _voicePitch;

                    window.speechSynthesis.speak(_utterance);

                    return false;

                    function _clear() {
                        _self.removeClass('loading');
                        clearTimeout(_timeout);
                        $(_utterance).off();
                    }

                }
            ).css('cursor', 'pointer');

            function _readOptions() {
                if (typeof prop.synthesisVoice_rate == "number") {
                    _voiceRate = Math.min(1.5, Math.max(prop.synthesisVoice_rate, 0.5));
                }
                if (typeof prop.synthesisVoice_pitch == "number") {
                    _voicePitch = Math.min(1.5, Math.max(prop.synthesisVoice_pitch, 0.5));
                }
                var _voiceOrder = 0;
                if (typeof prop['synthesisVoice_select'] == 'number') {
                    _voiceOrder = prop['synthesisVoice_select'];
                }
                if (_voiceOrder < 0 || _voiceOrder > _voices.length) {
                    _voiceOrder = 0;
                }
                // log('rOpt-voiceOrder:' + _voiceOrder);
                if (_voiceOrder == 0) {
                    if ($('.OELDBody.ios, .OELDBody.android, .OELDBody.windowsnt').length > 0) {
                        for (var i = 0; i < _voices.length; i++) {
                            var _v = _voices[i];
                            if (/en-US/i.test(_v.lang) && _voiceSelect === undefined) {
                                _voiceSelect = _v;
                            }

                            // Zira, windows female en-US
                            // Samantha, ios female en-US
                            if (/Zira|Samantha/i.test(_v.name)) {
                                _voiceSelect = _v;
                                break;
                            }
                        }
                    }

                } else {
                    _voiceSelect = _voices[_voiceOrder - 1];
                }
            }

        }

        function speechSynthesisEncode(txt) {
            txt = $.trim(txt).replace(/\s{2,}/g, ' ');
            if (/[a-zA-Z0-9]$/.test(txt)) {
                txt += "."
            }
            return encodeURI(txt).replace(/\?$/, '%3F')
        }

        function setupDictSwitch() {
            if ($('.qt5.OELDBody').length != 0) {
                return;
            }

            $('.OELDBody .animContainer').each(function () {
                $(this).find('.entryLogo').off('.entryLogo')
                    .on('click.entryLogo', function (event) {
                        ripple(this, event);
                        // return;
                        var _container = $(this).parents('.animContainer'),
                            _containerHeight = _container.outerHeight(),
                            _currTarget = _container.find('.entryWrapper.world'),
                            _switchTarget = _container.find('.entryWrapper.us'),
                            _sign = 1;

                        if (_currTarget.css('position') == 'absolute') {
                            _currTarget = [_switchTarget, _switchTarget = _currTarget][0];
                            _sign = -1;
                        }

                        var _width = _currTarget.parents('.OELDBody').width(); //+ 20;

                        var _animTime = 500;
                        $.when(function () {
                            $('.entryWrapper .navBar').hide(0);

                            // _container.height(Math.max(_container.height(), _switchTarget.height()) + 100);
                            _container.height(_containerHeight).addClass('animating')
                                .animate({height: _switchTarget.outerHeight()}, _animTime);

                            _currTarget.width(_currTarget.width())
                                .css({'position': 'absolute', left: 0})
                                .animate({left: -_sign * _width}, _animTime);

                            _switchTarget.width(_currTarget.width())
                                .css({'position': 'absolute', display: 'block', left: _sign * _width})
                                .animate({left: 0}, _animTime);

                            return $(':animated');
                        }())
                            .done(function () {
                                _container.css({'height': ''}).removeClass('animating');
                                _switchTarget.css({'position': 'static', 'width': ''});
                                _currTarget.css({'left': -99999});

                                $(window).scroll();

                            });
                    })
            })
        }

        function ripple(element, event) {
            if (prop['dict_switch_ripple'] != 1)
                return;

            var _top = String(event.pageY - $(element).parents('.entryHead').offset().top),
                _left = String(event.pageX);
            $(element).append('<div class="ripple" style="left:{left};top:{top}"></div>'
                .replace('{left}', _left + 'px').replace('{top}', _top + 'px'))
                .find(".ripple").css('will-change', '-webkit-transform').addClass('animating')
                .on('webkitAnimationEnd', function () {
                    $(this).remove();
                });

        }

        function setupPheontics() {
            function _getPronAddr(phoneticElement) {
                var _server = prop['us_pron_server'] == 1
                    ? "https://s3.amazonaws.com/audio.oxforddictionaries.com"
                    : "http://audio.oxforddictionaries.com";
                return _server + $(phoneticElement).attr('addr');
            }

            // if (prop['us_pron_server'] == 2) {
            //     $('.OELDBody a.phoneticSymbol.us[href]').each(function () {
            //         $(this).attr('href', $(this).attr('href').replace(/http.*?\.amazonaws\.com\//i, 'http://'));
            //     })
            // }
            if ($('.OELDBody.qt4').length != 0) {
                $('.grambhead a.phoneticSymbol').each(function () {
                    $(this).attr('href', _getPronAddr(this));
                });
            }
            $('.grambhead a.phoneticSymbol:not(.loading)').off('.playsound').on('click.playsound', function () {
                var obj = this;
                $(obj).addClass('loading');

                if ($('.OELDBody.qt4').length != 0) {
                    setTimeout(function () {
                        $(obj).removeClass('loading');
                    }, 5000);
                    return true;
                }

                // var _src = $(this).attr('href');
                var _src = _getPronAddr(this);

                playSound(_src).always(function () {
                    $(obj).removeClass('loading');
                });
                // var _audio = new Audio();
                //
                // var _timeout = setTimeout(function () {
                //     $(_audio).trigger('abort');
                // }, 5000);
                //
                // var _event = 'play.play ended.play abort.play error.play progress.play';
                // $(_audio).off('.play')
                //     .on(_event, function (event) {
                //         clearTimeout(_timeout);
                //
                //         if (event.type == 'play') return;
                //
                //         $(this).off('.play').prop('autoplay', false);
                //         setTimeout(function () {
                //         }, 1500);
                //     })
                //     .prop('src', _src);
                // _audio.play();
                return false;
            });

        }

        function setupToolbar() {
            $('.oeldToolbar').addClass('middle line logoColor')
                .find('.otButton').off('click.otButton')
                .on('click.otButton', function () {
                })
        }

        function setupCrossReferenceJump() {
            $('.OELDBody .anchor .crossReference')
                .find('a')
                .each(function () {
                    var _anchor = '#' + $(this).attr('addr').split('#').pop();
                    if ($(_anchor).length == 0) {
                        $(this).attr('href', $(this).attr('addr'))
                            .parents('.crossReference').addClass('directLink');
                    } else {
                    }
                }).end()
                .not('.directLink')
                .off('click.crossReference')
                .on('click.crossReference', function () {
                    var _anchor = $('.world #' + $.trim($(this).find('a').attr('addr').split('#').pop()));
                    if (_anchor.parents('.entryWrapper').css('position') == 'static') {
                        _anchor.one('scrollEnd', _animateAnchor);
                        scrollPosition(_anchor);
                    }
                    return false;

                    function _animateAnchor() {
                        _anchor.addClass('anchorAnimating')
                            .off('webkitAnimationEnd.anchorAnimating')
                            .on('webkitAnimationEnd.anchorAnimating', function (event) {
                                if ($(event.target).is(_anchor)) {
                                    _anchor.off('webkitAnimationEnd.anchorAnimating')
                                        .removeClass('anchorAnimating');
                                }
                            });
                    }
                });
        }

        const WIKI_PLAY = '<svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" viewBox="0 0 26.458 26.458" ><path id="p_play" d="M19.479 13.23c0 .13-10.202 6.625-10.305 6.559-.104-.066-.104-13.054 0-13.12.103-.065 10.305 6.429 10.305 6.56" id="p_play" stroke-linejoin="round" stroke-width=".371" /><circle id="p_circle" r="12.834" cy="13.229" cx="13.229" id="path5681" stroke-linejoin="round"  stroke-width=".073" fill="none"/></svg>';
        const AJAX_PARA = {
            url: 'https://en.wikipedia.org/w/api.php',
            url_common: 'https://commons.wikimedia.org/w/api.php',
            dataType: 'jsonp',
            // type: 'POST',
            headers: {
                'Api-User-Agent': 'MyCoolTool/1.1 (http://example.com/MyCoolTool/; MyCoolTool@example.com) BasedOnSuperLib/1.4'
            },
            timeout: 15000
        };

        function setupWikiImage() {
            // setTimeout(function () {
            if (!!$('.qt5.OELDBody').length)
                return;

            var _wordList = [];
            $('.world section.gramb .grambhead').each(function () {
                var _pos = $(this).find('.ps.pos .pos');

                if (!/\bnoun\b/i.test(_pos.text())) {
                    return;
                }

                var _word = $(this).closest('section')
                    .prevAll('.entryHead:first')
                    .find('.hw').html().replace(/<sup>.*?<\/sup>/i, '');

                _word = _normalizeWord(_word);

                if (_wordList.indexOf(_word) < 0) {
                    _wordList.push((_word));
                    _initWiki(_pos, _word);
                }
            });

            function _initWiki(pos, word) {
                $(pos).append('<span class="wikiSearchButton"> </span>')
                    .off('click.wikiSearchButton')
                    .one('click.wikiSearchButton', function () {
                        $(this).find('.wikiSearchButton').addClass('loading');
                        $(this).trigger('ajax', word);
                    })
                    .on('ajax.wikiSearchButton', _ajaxEventWiki)
                    .each(function () {
                        $(this).data('cursor', $(this).css('cursor')).css('cursor', 'pointer');
                    });
            }

            function _ajaxEventWiki(event, titles) {
                var _self = this;

                var _screenWidth = $(this).closest('.entryWrapper').width(),
                    _columnLen = (_screenWidth >= 1000) ? 4
                        : (_screenWidth >= 720) ? 3
                            : (_screenWidth >= 500) ? 2 : 1,
                    _columnWidth = Math.round(_screenWidth / _columnLen);

                var _data = {
                    'action': 'query',
                    'titles': titles,
                    redirects: 1,
                    'format': 'json',
                    'prop': ['pageprops', 'pageimages', 'images'].join("|"),
                    'imlimit': 'max'
                };

                if ($.trim(prop.wiki_otherLangTitle) != "") {
                    _data.prop += "|langlinks";
                    _data.lllang = $.trim(prop.wiki_otherLangTitle);
                }

                var _langTitles = [];

                $.ajax({
                    url: AJAX_PARA.url,
                    data: _data,
                    dataType: AJAX_PARA.dataType,
                    headers: AJAX_PARA.headers,
                    timeout: AJAX_PARA.timeout
                }).then(function (data) {
                    var _images = [];
                    var _page_disambiguation;

                    $.each(data.query.pages, function (index, page) {
                        if (!('images' in page))
                            return;

                        if (('pageprops' in page) && ('disambiguation' in page.pageprops)) {
                            if (!!_page_disambiguation) {
                                _page_disambiguation = page;
                            }
                            return;
                        }

                        if ('langlinks' in page) {
                            $.each(page.langlinks, function () {
                                _langTitles.push(this['*']);
                            })
                        }

                        if ('pageimage' in page)
                            _images.push({"title": "File:" + page.pageimage});

                        _images = _images.concat(page.images);

                    });

                    _images = _images.filter(function (item, pos, self) {
                        return self.indexOf(item) == pos;
                    });

                    if (_images.length == 0) {
                        if (!_page_disambiguation) {
                            $.ajax({
                                url: AJAX_PARA.url,
                                data: {
                                    'action': 'parse',
                                    'page': titles,
                                    redirects: 1,
                                    'format': 'json',
                                    'prop': ['parsetree'].join("|")
                                },
                                dataType: AJAX_PARA.dataType,
                                headers: AJAX_PARA.headers,
                                timeout: AJAX_PARA.timeout
                            })
                                .done(function (data) {
                                    var _titles = [];
                                    $.each(data.parse.parsetree["*"].match(/\*\s*?\[\[.*?]]/g), function () {
                                        var _value = $.trim(this.replace(/^\*\s*?\[\[|]]/g, ''));
                                        _titles.push(_value);
                                        if (_titles.length == 3)
                                            return false;
                                    });
                                    if (_titles.length > 0) {
                                        $(_self).trigger('ajax', _titles.join("|"));
                                        return $.Deferred().reject("disambiguation");
                                    }
                                    return $.Deferred().reject("title_empty");
                                })
                                .fail(function () {
                                    return $.Deferred().reject("image_empty");
                                });

                        } else {
                            return $.Deferred().reject("image_empty");
                        }
                    }

                    var _titles = [];
                    var _deferreds = [];
                    var _sounds = [];
                    var _articleview = [];

                    $.each(_images, function (index, image) {
                        if (!_imageFilter(image.title)) {
                            if (/og[a-z]$/i.test(image.title)) {
                                _sounds.push(image.title);
                            } else {
                                _titles.push(image.title);
                            }
                        } else {
                            _articleview.push(image.title);
                        }

                        var _action = 'query';
                        if (typeof articleview != $.type()) {
                            var _xmlhttp = new XMLHttpRequest();
                            if (_xmlhttp.timeout >= 0) {
                                _action = 'parse';
                                AJAX_PARA.timeout += _xmlhttp.timeout;
                            }
                        }

                        if ((_titles.length == 5) || (index + 1 == _images.length)) {
                            _deferreds.push($.ajax({
                                url: AJAX_PARA.url_common,
                                data: {
                                    'action': _action,
                                    'titles': _titles.join('|'),
                                    'format': 'json',
                                    'prop': ['imageinfo'].join("|"),
                                    // 'prop': ['imageinfo', 'fileusage'].join("|"),
                                    // 'fulimit': 'max',
                                    'iiprop': ['url', 'size'].join("|"),
                                    'iiurlwidth': _columnWidth,
                                    'iilimit': 'max'
                                },
                                type: 'POST',
                                dataType: AJAX_PARA.dataType,
                                headers: AJAX_PARA.headers,
                                timeout: AJAX_PARA.timeout
                            }));
                            _titles.length = 0;
                        }
                    });
                    if (!!_sounds.length) {
                        var _soundTitles = [];
                        $.each(_sounds, function () {
                            if (/ogg$/i.test(this) && (_sounds.indexOf(this.replace(/ogg$/i, 'ogv')) >= 0))
                                return;
                            _soundTitles.push(this);
                        });
                        _deferreds.push($.ajax({
                            url: AJAX_PARA.url_common,
                            data: {
                                'action': 'query',
                                'titles': _soundTitles.join('|'),
                                'format': 'json',
                                'prop': ['imageinfo', 'transcodestatus'].join("|"),
                                // 'prop': ['imageinfo', 'transcodestatus', 'fileusage'].join("|"),
                                // 'fulimit': 'max',
                                'iiprop': ['url'].join("|"),
                                'iilimit': 'max'
                            },
                            type: 'POST',
                            dataType: AJAX_PARA.dataType,
                            headers: AJAX_PARA.headers,
                            timeout: AJAX_PARA.timeout
                        }))
                    }

                    return $.when.apply(null, _deferreds);

                }).then(function () {
                    if (arguments.length == 0) {
                        return $.Deferred().reject("no_image")
                    }

                    var _args = arguments.length == 3 && arguments[1] == 'success'
                        ? [arguments] : arguments;
                    var _images = [];
                    $.each(_args, function () {
                        if ((!this[0].hasOwnProperty('query')) || (!this[0].query.hasOwnProperty('pages')))
                            return;

                        $.each(this[0].query.pages, function () {
                            if (('imageinfo' in this) && this.imageinfo.length > 0
                                && (/og[a-z]$/.test(this.title)
                                    || (this.imageinfo[0].width > 120 && this.imageinfo[0].size > 500))) {
                                if (/og[a-z]$/.test(this.title) && 'transcodestatus' in this) {
                                    this.imageinfo[0].transcodestatus = this.transcodestatus;
                                }
                                _images.push(this.imageinfo[0]);
                            }
                        })
                    });

                    if (_images.length == 0) {
                        return $.Deferred().reject("no_image");
                    }

                    return _images;
                }).done(_showImage).fail(function (message) {
                    if (message == "disambiguation") {
                    }
                }).always(function (message) {
                    if (message != "disambiguation") {
                        setTimeout(function () {
                            $(_self).css('cursor', $(_self).data('cursor'))
                                .find('.wikiSearchButton').remove();
                        }, 3000);
                    }
                });


                function _showImage(data) {
                    var _sectionWiki = $(_self).closest('section').prev().nextUntil(':not(section)').last()
                        .after('<section class="wikiImage active" style="display:none">' +
                            '<h2 style="cursor: pointer;"><strong>Wiki Images</strong>' +
                            '<div class="langTitle"> </div>' +
                            '<div class="sectionswitch"> <span class="switchbutton"> <span class="switchbuttonline center"></span><span class="switchbuttonline top"></span><span class="switchbuttonline bottom"></span></span></div></h2>' +
                            '<div class="senseInnerWrapper"></div></section>')
                        .next();

                    var _langTitle;
                    if (_langTitles.length != 0) {
                        _sectionWiki.find('.langTitle').text(_langTitles.join(", "))
                            .filter(function () {
                                return $('.OELDBody.windowsnt').length != 0
                            })
                            .css('font-family', 'Microsoft Yahei');
                        if (getViewport().width < 500) {
                            _langTitle = _sectionWiki.find('.langTitle');
                        }
                    }

                    var _gallery = _sectionWiki.find('.senseInnerWrapper')
                        .append($(_langTitle))
                        .append('<div class="wikiGallery"></div>')
                        .find('.wikiGallery');

                    if (!isBluedict())
                        _gallery.css('max-height', Math.round(getViewport().height * 0.8));

                    var _columns =
                        _gallery.append(new Array(_columnLen + 1).join('<div class="galleryColumn"></div>'))
                            .find('.galleryColumn').css('width', (100 / _columnLen) + '%');

                    var _columnHeights = new Array(_columnLen);
                    $.each(_columnHeights, function (index) {
                        _columnHeights[index] = 0;
                    });

                    var _viewList = [];
                    var _viewIndex = 0;

                    $.each(data, function () {
                        var _columnNum = _columnHeights.indexOf(Math.min.apply(null, _columnHeights));

                        if (/og[a-z]$/i.test(this.url)) {
                            if (prop.wikiAudioVideo_enable != 1)
                                return;

                            var _tagMedia = /ogg$/i.test(this.url) ? "audio" : "video";
                            var _html;
                            if ($('.OELDBody.qt4').length != 0) {
                                if (_tagMedia == 'audio') {
                                    var _url = this.url.replace(/(\/commons)\//, '$1/transcoded/')
                                        .replace(/(\/([^/]*?)\.og[gv]$)/i, '$1$1.' + 'mp3');
                                    _html = ('<div class="galleryBox sound">' +
                                        '<a href="&src">'.replace("&src", _url) +
                                        '<div class="playSound">' + WIKI_PLAY + '</div></a></div>');
                                }
                            } else {
                                var _html5_player = '<&media controls="controls" >' +
                                    '<source src="&src" type="&media/ogg">'.replace('&src', this.url);

                                for (var _name in this.transcodestatus) {
                                    var _url_alter = this.url.replace(/(\/commons)\//, '$1/transcoded/')
                                        .replace(/(\/([^/]*?)\.og[gv]$)/i, '$1$1.' + _name);
                                    var _format = /mp3/i.test(_name) ? 'type="&media/mpeg"'
                                        : /webm/i.test(_name) ? 'type="&media/webm"'
                                            : /mp4/i.test(_name) ? 'type="&media/mp4"'
                                                : /avi/i.test(_name) ? 'type="&media/avi"'
                                                    : '';
                                    _html5_player += '<source src="' + _url_alter + '" ' + _format + '>';
                                }

                                _html5_player = (_html5_player + "</&media>").replace(/&media/g, _tagMedia);

                                if (_tagMedia == 'audio') {
                                    _html = ('<div class="galleryBox sound">' +
                                        '<div class="playSound">' + _html5_player + '</div></div>');
                                } else {
                                    _html = ('<div class="galleryBox video">' +
                                        _html5_player + '</div>');
                                }
                            }
                            _columns.eq(_columnNum).append(_html);
                            _columnHeights[_columnNum] += (_tagMedia == 'audio') ? 50 : this.thumbheight;
                        } else {
                            if (!isBluedict() || _viewList.length < 5) {
                                _html = '<div class="galleryBox loading"></div>';
                                var _galleryBox = _columns.eq(_columnNum)
                                    .append(_html).find('.galleryBox:last')
                                    .height(this.thumbheight);

                                _columnHeights[_columnNum] += this.thumbheight;
                                this.srcset = this.thumburl.replace(_columnWidth + 'px', (_columnWidth * 2) + 'px') + ' 2x';
                                _galleryBox.data('info', this);
                                _imageLoad(_galleryBox);
                            }
                            // if (!/\.stl$/i.test(this.url))
                            _viewList.push(this);
                        }
                    });

                    _gallery.on('click.gallery', '.galleryBox', function (event) {

                        if ($(this).hasClass('retry')) {
                            event.stopPropagation();
                            event.preventDefault();
                            _imageLoad(this);
                            return false;
                        } else if ($(this).hasClass('sound')) {
                            if ($(this).find('audio').length == 0) {
                                if ($('.OELDBody.qt4').length == 0) {
                                    event.stopPropagation();
                                    event.preventDefault();
                                    playSound($(this).find('a').data('addr'));
                                    return false;
                                }
                            }
                        } else if (!$(this).hasClass('video')) {
                            event.stopPropagation();
                            event.preventDefault();

                            _viewIndex = _viewList.indexOf($(this).data('info'));
                            imageView('wiki_view', $(this).find('img'), null, _imageViewCallback);
                        }
                    });

                    setupSectionSwitch();

                    $(_sectionWiki).slideToggle();
                    scrollPosition(_sectionWiki, 0);

                    function _imageLoad(parentBox) {
                        var _imageInfo = $(parentBox).data('info');
                        $(parentBox).removeClass('retry').addClass('loading').data('info', _imageInfo);
                        var _timeout;
                        var _image = $(new Image()).attr('src', _imageInfo.thumburl)
                            .attr('srcset', _imageInfo.srcset)
                            .one('load error timeout', function (event) {
                                clearTimeout(_timeout);
                                if (event.type == 'load') {
                                    $(parentBox).not(':has(img)')
                                        .append(this).css('height', '').removeClass('loading retry');
                                } else {
                                    $(parentBox).removeClass('loading').addClass('retry');
                                    $(this).off();
                                    delete this;
                                }
                            });
                        _timeout = setTimeout(function () {
                            _image.trigger('timeout');
                        }, 15000);
                    }

                    function _imageViewCallback(command) {
                        if (command == 'next') {
                            _viewIndex++;
                            if (_viewIndex >= _viewList.length) {
                                _viewIndex = 0
                            }
                        } else if (command == 'pre') {
                            _viewIndex--;
                            if (_viewIndex < 0) {
                                _viewIndex = _viewList.length - 1;
                            }
                        }
                        if (/\.stl/i.test(_viewList[_viewIndex].url)) {
                            return _viewList[_viewIndex].srcset.replace(' 2x', '');
                        } else {
                            return _viewList[_viewIndex].url;
                        }
                    }
                }
            }

            function _imageFilter(imageTitle) {
                return RegExp('Lock-green' +
                    '|Elementy herbu|support vote|Question.book|[^\w]Pfeil[^w]' +
                    '|Rod.of.Asclepius|Trails.jpg|AdhesiveBandage.png' +
                    '|(:Ambox[_ -].*|commons.logo|Cscr[ -_].*|-icon|[^w]icon[^w]|[a-z]+.Pencil|:Padlock[a-z _-]+?|:Wik[it][^./]*logo[^./]*|foodlogo.*' +
                    '|openclipart|ink|:p[_ ].*?|:\w+[- ]featured|:Nuvola[a-z _-]+?)|:flag[-_ ]of[-_ ]\w+|:Goblet[-_ ]Glass.*?|:symbol[-_ ].*?\.svg$'
                    , 'i')
                    .test(imageTitle);
            }

            function _normalizeWord(word) {
                if (/,/.test(word)) {
                    word = $.trim(word.replace(/(^.*?)\s*?,\s*?(.*?$)/, '$2 $1').replace(/\s{2,}/, ' '));
                    word = word.replace(/^sir\s+?/i, '');
                }


                word = $.trim(word.replace(/_|\n/g, ' ').replace(/\s{2,}/g, ' '));
                return word.slice(0, 1).toUpperCase() + word.slice(1);
                // return word.toLowerCase().replace('_', ' ').split(/\s+/).map(function (item, index) {
                //     return item.slice(0, 1).toUpperCase() + item.slice(1);
                // }).join(' ');
            }

        }

        var _lastPopup;

        function setupFrequency() {
            if ($('.qt5.OELDBody').length != 0) {
                $('.qt5.OELDBody .frequency').hide(0);
                return;
            }

            if (isBluedict())
                return;

            function _togglePopup(popup, isShow) {
                switch (prop['frequency_popup_effect']) {
                    case 1:
                        $(popup).css('overflow', 'hidden').find('.freAnimBox').each(function () {
                            var _targetMargin, _targetOpacity, _height = -$(popup).height();

                            if (isShow) {
                                $(this).css({'margin-top': _height, 'opacity': 0});
                                _targetMargin = 0;
                                _targetOpacity = 1;
                                $(popup).show(0);
                            } else {
                                _targetMargin = _height;
                                _targetOpacity = 0;
                            }
                            $(this).animate({"margin-top": _targetMargin, "opacity": _targetOpacity}, 500, function () {
                                if (!isShow) {
                                    $(popup).remove();
                                } else {
                                    $(popup).css('overflow', 'visible');
                                }
                            })
                        });
                        break;
                    case  2:
                        var _margin = 100,
                            _margin_top = 0;
                        if (isShow) {
                            $(popup).css({
                                'margin-top': _margin_top + _margin, 'opacity': 0,
                                'will-change': 'opacity, margin-top'
                            })
                                .show(0);
                        }
                        var _margin_target = isShow ? _margin_top : _margin + _margin_top,
                            _opacity = isShow ? 1 : 0;
                        $(popup).animate({'margin-top': _margin_target, 'opacity': _opacity}, 300, function () {
                            $(popup).css('will-change', '');
                            if (!isShow) {
                                $(this).remove();
                            }
                        });
                        break;
                    default:
                        if (isShow) {
                            $(popup).show();

                        } else {
                            $(popup).remove();
                        }
                }
            }

            var _gradientColor = ['#3b557a', '#4f739c', '#5c86b2', '#5c86b2', '#5c86b2'];
            $('.gramb .frequency').off('click.frequency')
                .on('click.frequency', function () {
                    var _body = $(this).parents('.OELDBody');
                    if (_body.find('#OEDFrequencyPopup').length == 0) {
                        var HTMLofFrequency = '<div id="OEDFrequencyPopup" style="display:none"><div class="freAnimBox"><div class="freArrowBox"><div class="freArrow"> </div></div><div class="freBaseBox"><div class="freTitleBox"><div class="freTitle">Frequency</div><div class="close">X</div></div><div class="freContent"></div><div class="freLogo"><div class="background"></div></div></div></div></div>';
                        // $('.OELDBody').append(HTMLofFrequency);
                        $(this).append(HTMLofFrequency);
                    }
                    var _popup = _body.find('#OEDFrequencyPopup');

                    if ($(this).is(_lastPopup)) {
                        _togglePopup(_popup, false);
                        _lastPopup = null;
                        return;
                    }
                    var _class = $(this).attr('class'),
                        _freq = parseInt(_class.substr(_class.search(/\d/), 1)) - 1,
                        _viewport = getViewport(),
                        _left = $(this).offset().left,
                        _top = 0,
                        _adjust = _viewport.width > 600
                            ? Math.min(_viewport.width - (_left + _popup.width()), 0)
                            : (_viewport.width - _popup.width()) / 2 - _left,
                        _left = _left + _adjust,
                        _margin = 20 - _adjust,
                        _color = _gradientColor[Math.floor(_margin / _popup.width() * 5)];

                    _popup.find('.freTitle').text('Frequency Band ' + (_freq + 1)).end()
                        .find('.freContent').html(infoOfFrequency[_freq].replace('\n', '<br><br>')).end()
                        .css({'left': _left, 'margin-top': _top})
                        .find('.freArrow').css({'margin-left': _margin, 'color': _color}).end()
                        .off('click.freTitleBox')
                        .on('click.freTitleBox', function (event) {
                            if ($(event.target).is('.freContent')) {
                                if ($('mobile.OELDBody').length == 0) {
                                    return false;
                                }
                            }
                            _popup.off('click.freTitleBox');
                            _togglePopup(_popup, false);
                            _lastPopup = null;
                            return false;
                        });

                    _togglePopup(_popup, true);
                    _lastPopup = $(this);
                    return false;
                })
        }

        function readIni() {
            prop = {
                frequency_popup_effect: 2,
                navBar_align: 1,
                show_ode3rhymes: 1,
                show_ode3images: 1,
                show_onlinevideo: 1,
                dict_switch_ripple: 1,
                us_pron_server: 1,
                color_sense: 0,
                color_example: 0,
                color_synonym: 0,
                speak_icon: 0,
                synthesisVoice_enable: 1,
                synthesisVoice_select: 0,
                synthesisVoice_rate: 1,
                synthesisVoice_pitch: 1,
                synthesisVoice_eudicTTS_android: 1,
                synthesisVoice_eudicTTS_iOS: 0,
                synthesisVoice_bluedictTTS: 1,
                wikiAudioVideo_enable: 1,
                wiki_otherLangTitle: "",
                base128_showDebugInfo: 0,
                base128_systemInfo: 0
            };

            for (var _propName in prop) {
                if (typeof window[_propName] == typeof prop[_propName]) {
                    prop[_propName] = window[_propName];
                }
            }
            $('.OELDBody section.rhymeSection').toggle(prop['show_ode3rhymes'] == 1);
            $('.OELDBody .ode3img').toggle(prop['show_ode3images'] == 1);

            var _color = ['', '#1954b8', '#555', '#000', '#e66e33', 'green'];

            var _index = prop['color_sense'];
            if (_index > 0 && _index < _color.length) {
                $('.OELDBody .ind').css('color', _color[_index]);
            }

            _index = prop['color_example'];
            if (_index > 0 && _index < _color.length) {
                $('.OELDBody .ex > em').css('color', _color[_index]);
            }

            _index = prop['color_synonym'];
            if (_index > 0 && _index < _color.length) {
                $('.OELDBody .exg > .exs').css('color', _color[_index]);
            }
        }

        const IMAGEVIEW_HTML_TABLE =
            '<table id="naviTable" style="width:100%; height:100%; border-collapse: collapse">' +
            '<tr class="navi top"  style="height:50px;"><td class="base128_imageView_Close" colspan="2"></td></tr>' +
            '<tr class="navitable_middle">' +
            ' <td class="navi left" style="width:50%; cursor:pointer"><div class="base128_imageView_Left"> </div></td>' +
            ' <td class="navi right" style="width:50%; cursor:pointer"><div class="base128_imageView_Right"> </div></td>' +
            '</tr>' +
            '  <tr class="navi bottom" style="height:50px;"><td colspan="2"></td></tr>' +
            '</table>';

        const IMAGEVIEW_HTML_LOADING =
            '<div class="base128_imageLoadingLogo">' +
            '<div class="base128_imageLoadingContainer">' +
            '    <span class="base128_loadingCircle n1"> </span>' +
            '    <span class="base128_loadingCircle n2"> </span>' +
            '    <span class="base128_loadingCircle n3"> </span>' +
            '</div>' +
            '</div>';

        var imageViewBuffer = [];

        function imageView(id, img, color, funcNavi) {
            id = $.trim(id.replace(/^#/, ''));
            var _isNavi = !!funcNavi;
            var _color = !!color ? color : "hsla(0, 0%, 0%, 0.95)";
            if (!_validIamge(_isNavi ? funcNavi() : $(img).attr('src'))) {
                return;
            }

            if (!$('#' + id).length) {
                var _html = '<div id="&id" class="base128_imageView">&navi_loading&navi_table</div>'
                    .replace('&id', id);
                // .replace('&style', IMAGEVIEW_STYLE);

                if (_isNavi) {
                    _html = _html.replace('&navi_table', IMAGEVIEW_HTML_TABLE)
                        .replace('&navi_loading', IMAGEVIEW_HTML_LOADING);
                } else {
                    _html = _html.replace('&navi_table', ' ')
                }

                if ($('.mobile.eudic').length != 0 && false) {
                    $('body').append(_html);

                } else
                    $('.OELDBody').filter(':visible').last().append(_html);

            }

            var _view = $('#' + id);
            var _img = $(img)
                , _animTime = 500
                , _viewport = getViewport()
                , _start, _end;

            if (!isBluedict()) {
                if (_img.length != 0) {
                    _start = {
                        top: _img.offset().top - _viewport.top,
                        left: _img.offset().left,
                        bottom: _viewport.bottom - (_img.offset().top + _img.height()),
                        right: _viewport.width - (_img.offset().left + _img.width()),
                        opacity: 0
                    }
                } else {
                    _start = {
                        top: _viewport.height / 2,
                        left: _viewport.width / 2,
                        bottom: _viewport.height / 2,
                        right: _viewport.width / 2,
                        opacity: 0
                    }
                }
                _end = {
                    top: 0, left: 0, bottom: 0, right: 0, opacity: 1
                };
            } else {
                _end = {
                    top: 0, left: 0, width: _viewport.width, height: _viewport.height, opacity: 1
                };
                if (_img.length != 0) {
                    var _ref = _img.closest('[id]');
                    if (_ref.length != 0) {
                        _end.top = _ref.offset().top;
                        scrollPosition(_ref);
                    }
                }
                _start = _end;
            }

            if (!isBluedict()) {
                _img.css('opacity', 0)
            }

            _setImage(_isNavi ? funcNavi() : _img.attr('src'));

            $('#' + id + ':hidden')
                .css('color', _color)
                .css(_start)
                .show(0);

            if (!isBluedict()) {
                $('#' + id).animate(_end, _animTime);
            }

            setTimeout(function () {
                // o0e.lastClick = null;
                if (_isNavi) {
                    $('#' + id + ':visible').off('.navi')
                        .on('click.navi', '.navi', function (event) {
                            event.stopPropagation();
                            event.preventDefault();

                            if ($(this).is('.top,.bottom')) {
                                _quitView();
                            } else if ($(this).is('.left')) {
                                _setImage(funcNavi("pre"));
                            } else if ($(this).is('.right')) {
                                _setImage(funcNavi("next"));
                            }
                        });
                } else {
                    $('#' + id + ':visible').off().one('click', _quitView);
                }
            }, 200);

            function _validIamge(src) {
                return !(!src || $.trim(src) == '');
            }

            var _loadingImg;

            function _setImage(src) {
                if (imageViewBuffer.indexOf(src) >= 0) {
                    _view.css('background-image', 'url("' + src + '")');
                    return;
                }

                $(_loadingImg).off();
                delete _loadingImg;

                _view.removeClass('base128_loaded')
                    .addClass('base128_loading')
                    .one('click.imageLoading', _cancelLoading);

                if (/\.svg/i.test(_view.css('background-image')))
                    _view.addClass('imageSVG');

                var _loadTimeout = setTimeout(function () {
                    _cancelLoading();
                }, 15000);

                _loadingImg = $(new Image()).attr('src', src)
                    .on('load error timeout', function (event) {
                        clearTimeout(_loadTimeout);
                        _view.off('.imageLoading');

                        if (event.type == 'error' || event.type == 'timeout') {
                            _cancelLoading();
                            return;
                        }

                        // var _backColor = _color;
                        // if (/svg$/.test(src))
                        //     _backColor = 'hsla(0, 0%, 100%, 0.95)';
                        _view.removeClass('base128_loading imageSVG')
                            .addClass('base128_loaded')
                            // .css('color', _backColor)
                            .css('background-image', 'url("' + src + '")')
                            .off('.imageLoading');

                        imageViewBuffer.push(src);
                    });

                function _cancelLoading() {
                    _view.removeClass('base128_loading imageSVG')
                        .addClass('base128_loaded').off('.imageLoading');

                    $(_loadingImg).off();
                    delete _loadingImg;

                    _quitView();
                }
            }

            function _quitView() {
                _view.animate(_start, _animTime, function () {
                    _view.off();
                    $(this).hide(0);
                    _img.css('opacity', '');
                })
            }
        }

        function getViewport() {
            if ($('#OELD_Dummy').length == 0) {
                var _dummy_html = !isBluedict()
                    ? '<div id="OELD_Dummy" style="position:fixed; top:0; left:0; right:0; bottom:0; margin:0; padding:0 ;z-index: -1;pointer-events:none"></div>'
                    : '<div id="OELD_Dummy" style="position:fixed; top:0; left:0; width:100vw; height:150vw; padding:0 ;z-index: -1;pointer-events:none"></div>';
                $('.OELDBody').first().append(_dummy_html);
            }
            var _dummy = $('#OELD_Dummy'),
                _offset = _dummy.offset(),
                _top = _offset.top,
                _height = _dummy.height(),
                _bottom = _top + _height,
                _width = _dummy.width();

            return {top: _top, bottom: _bottom, height: _height, width: _width};
        }

        const AUDIO_EVENT = 'play.play ended.play abort.play error.play progress.play loadeddata.play timeout.play';

        function playSound(src) {
            var _defer = $.Deferred();
            var _audio = new Audio();
            var _timeout = _setTimeout(5);

            $(_audio).off('.play')
                .on(AUDIO_EVENT, function (event) {
                        clearTimeout(_timeout);

                        switch (event.type) {
                            case 'play':
                                _timeout = _setTimeout(10);
                                break;
                            case 'loaded':
                                _timeout = _setTimeout(3);
                                break;
                            case 'progress':
                                _timeout = _setTimeout(2);
                                break;
                            case 'ended':
                            case 'error':
                            case 'abort':
                            case 'timeout':
                                $(this).off('.play').prop('autoplay', false);
                                _defer.resolve();
                                break;
                        }
                    }
                ).prop('src', src).get(0).play();

            return _defer.promise();

            function _setTimeout(delay) {
                if (delay < 100)
                    delay = delay * 1000;

                return setTimeout(function () {
                    $(_audio).trigger('timeout');
                }, delay);
            }
        }

        function setupPlatform(rootElement) {
            var _class = '';
            var _userAgent = navigator.userAgent.toLowerCase();
            if (/windows nt/i.test(_userAgent)) {
                _class += ' windowsnt desktop';
                if (/eudic/i.test(_userAgent)) {
                    _class += ' eudicnt';
                }
            } else if (/Macintosh/i.test(_userAgent)) {
                _class += ' macos desktop';
                if (/eudic/i.test(_userAgent)) {
                    _class += ' eudicnt'
                }
            } else if (/linux/i.test(_userAgent) && !(/android/i.test(_userAgent))) {
                _class += ' linux desktop';
            }

            if (_userAgent.indexOf('chrome') >= 0) {
                _class += ' chrome';
            } else if (/firefox/i.test(_userAgent)) {
                _class += ' firefox';
            }

            if (_userAgent.indexOf('goldendict') >= 0) {
                _class += ' goldendict' + ((window.HTMLTrackElement === undefined) ? ' qt4' : ' qt5');
                if (/qt5/.test(_class)) {
                    $.fx.off = true;
                }
            } else {
                if (_userAgent.indexOf('iphone') >= 0) {
                    _class += ' iphone ios mobile';
                } else if (_userAgent.indexOf('ipad') >= 0) {
                    _class += ' ipad ios mobile';
                } else if (_userAgent.indexOf('android') >= 0) {
                    _class += ' android mobile';
                }

                if ($('.expBody, .eudicExpDiv').length != 0) {
                    _class += ' eudic';
                } else if ($('.bd_body').length != 0) {
                    _class += ' bluedict';
                }
            }
            $(rootElement).addClass(_class);
            if (prop.base128_systemInfo == 1) {
                prop.base128_showDebugInfo = 1;
                systemTest();
            }
        }

        function systemTest() {
            $('.OELDBody .oeldToolbar').on('click', function () {
                log('<strong>userAnent</strong>:' + navigator.userAgent);
                var _v = getViewport();
                log('body.class:' + $('.OELDBody').attr('class'));
                log('view.top:' + _v.top + " bottom:" + _v.bottom + " w:" + _v.width + " h:" + _v.height);
                log('win.w:' + $(window).width() + " h:" + $(window).height());
                log('doc.w:' + $(document).width() + " h:" + $(document).height());
                $('.OELDBody').first().parents().each(function (index, value) {
                    log(index + ". " + value.nodeName
                        + (!value.className ? "" : "." + value.className)
                        + (!value.id ? "" : "#" + value.id));
                }).end()
                    .siblings().each(function (index, value) {
                    log(index + ". " + value.nodeName
                        + (!value.className ? "" : "." + value.className)
                        + (!value.id ? "" : "#" + value.id)
                        + (!value.href ? "" : " href=" + value.href)
                        + (!value.src ? "" : " src=" + value.src));
                })
            });
        }

        function scrollPosition(target, offset) {
            if ($(target).length == 0) return;

            if (isBluedict()) {
                var _id = $(target).attr('id');
                if (!_id) {
                    _id = 'random' + Math.round(Math.random() * 100000);
                    $(target).attr('id', _id);
                }
                // var _id = $.trim($(target).closest('[id]').attr('id'));
                if (_id !== undefined) {
                    window.location.href = 'entry://#' + _id;
                }
                $(target).trigger('scrollEnd');
                return;
            }

            if (typeof offset == "undefined") {
                offset = 160;
            }
            var _top = target.offset().top - offset,
                _time = 1000;

            if ($('.OELDBody.qt5').length == 0) {
                $('html,body').animate({scrollTop: _top}, _time, function () {
                    $(target).trigger('scrollEnd');
                });
            } else {
                window.scrollTo(0, _top);
                $(target).trigger('scrollEnd');
            }
        }

        function isBluedict() {
            return $('.bluedict.OELDBody').length != 0;
        }

        function log(info) {
            if (prop.base128_showDebugInfo != 1) {
                return;
            }
            if ($('#loginfoOELD').length == 0) {
                $('.OELDBody').last().append('<div class="pagetitle" id="loginfoOELD" style="font-size: 0.8em; color:black"></div>');
                $('#loginfoOELD').show();
            }
            var _old = $('#loginfoOELD').html();
            $('#loginfoOELD').html(_old + '<br>' + info);
        }

        var infoOfFrequency = ["Band 1 contains extremely rare words unlikely ever to appear in modern text. These may be obscure technical terms or terms restricted to occasional historical use, e.g. abaptiston, abaxile, grithbreach, gurhofite, zarnich, zeagonite.\n" +
        "\n" +
        "About 18% of all non-obsolete OED entries are in Band 1",
            "Band 2 contains words which occur fewer than 0.01 times per million words in typical modern English usage. These are almost exclusively terms which are not part of normal discourse and would be unknown to most people. Many are technical terms from specialized discourses. Examples taken from the most frequently attested part of the band include decanate, ennead, and scintillometer (nouns), geogenic, abactinal (adjectives), absterge and satinize (verbs). In the lower frequencies of the band, words are uniformly strange or exotic, e.g. smother-kiln, haver-cake, and sprunt (nouns), hidlings, unwhigged, supersubtilized, and gummose (adjectives), pantle, cloit, and stoothe (verbs), lawnly, acoast, and acicularly (adverbs), whethersoever (conjunction).\n" +
            "\n" +
            "About 45% of all non-obsolete OED entries are in Band 2.",
            "Band 3 contains words which occur between 0.01 and 0.1 times per million words in typical modern English usage. These words are not commonly found in general text types like novels and newspapers, but at the same time they are not overly opaque or obscure. Nouns include ebullition and merengue, and examples of adjectives are amortizable, prelapsarian, contumacious, agglutinative, quantized, argentiferous. In addition, adjectives include a marked number of very colloquial words, e.g. cutesy, dirt-cheap, teensy, badass, crackers. Verbs and adverbs diverge to opposite ends of the spectrum of use encompassed by this band. Verbs tend to be either colloquial or technical, e.g. emote, mosey, josh, recapitalize.\n" +
            "\n" +
            "About 20% of all non-obsolete OED entries are in Band 3.",
            "Band 4 contains words which occur between 0.1 and 1.0 times per million words in typical modern English usage. Such words are marked by much greater specificity and a wider range of register, regionality, and subject domain than those found in bands 8-5. However, most words remain recognizable to English-speakers, and are likely be used unproblematically in fiction or journalism. Examples include overhang, life support, rewrite, nutshell, candlestick, rodeo, embouchure, insectivore (nouns), astrological, egregious, insolent, Jungian, combative, bipartisan, cocksure, methylated (adjectives), intern, sequester, galvanize, cull, plop, honk, skyrocket, subpoena, pee, decelerate, befuddle, umpire (verbs), productively, methodically, lazily, pleasurably, surreptitiously, unproblematically, electrostatically, al dente, satirically (adverbs).\n" +
            "\n" +
            "About 11% of all non-obsolete OED entries are in Band 4.",
            "Band 5 contains words which occur between 1 and 10 times per million words in typical modern English usage. These tend to be restricted to literate vocabulary associated with educated discourse, although such words may still be familiar within the context of that discourse. The shift away from the everyday language found in bands 8-6 is apparent in nouns (e.g. surveillance, assimilation, tumult, penchant, paraphrase, admixture), adjectives (e.g. conditional, cumulative, arithmetic, radioactive, symptomatic, authorized, Neolithic, discontinuous, preconceived, metrical), verbs (e.g. appropriate, comprehend, presuppose, perpetuate, encircle, jeopardize, subsist, gravitate, proscribe), and adverbs (e.g. markedly, empirically, functionally, disproportionately, ad hoc, exponentially, preferentially). This band also contains the most common adjectives derived from the names of philosophers and scientists (e.g. Aristotelian, Platonic, Cartesian, Newtonian, Darwinian, Marxist, Freudian). Most words which would be seen as distinctively educated, while not being abstruse, technical, or jargon, are found in this band.\n" +
            "\n" +
            "About 4% of all non-obsolete OED entries are in Band 5",
            "Band 6 contains words which occur between 10 and 100 times per million words in typical modern English usage, including a wide range of descriptive vocabulary. It contains many nouns referring to specific objects, entities, processes, and ideas, running from dog, horse, ship, machine, mile, assessment, army, career, stress to gas, explosion, desert, parish, envelope, and headache. There is a wide range of adjectives describing the qualities of particular situations, states of affairs, etc., or people’s actions in particular contexts, as professional, traditional, happy, successful, sufficient, sophisticated, voluntary, reluctant, abundant, vain, and many more. The basic colour adjectives (red, blue, green, yellow, orange, brown, grey, purple, pink) are all in band 6 (although black and white are in band 7). The band contains a large number of adjectives and nouns relating to nationality or geographical origin (e.g. Scottish, Irish, Australian, Canadian, Asian, French, Italian, German), as well as similar words denoting major religious denominations (e.g. Christian, Christianity, Jewish, Muslim, Islam, Protestant), and words relating to important political or economic systems and ideologies (e.g. democracy, democratic, communist, socialist, capitalism).\n" +
            "\n" +
            "About 1% of all non-obsolete OED entries are in Band 6.",
            "Band 7 contains words which occur between 100 and 1000 times per million words in typical modern English usage. This includes the main semantic words which form the substance of ordinary, everyday speech and writing. Nouns include basic terms for people (e.g. man, woman, person, boy, girl), body parts (e.g. hand, eye, head, foot, blood), measurements of time (e.g. year, day, hour, month, week), general terms for common aspects of the immediate world (e.g. animal, tree, field, food, water, house, building, room), and basic vocabulary for referring to the world in abstract terms (e.g. thing, object, situation, place, point, part, quality) . Adjectives are general adjectives of number (e.g. two, three, four, second, third), of size or duration (e.g. large, high, low, small, long, old, young), and of value and judgement (e.g. good, best, true, right).\n" +
            "\n" +
            "About 0.18% of all non-obsolete OED entries are in Band 7.",
            "Band 8 contains words which occur more than 1000 times per million words in typical modern English usage. This includes the most common English words, such as determiners (the, a, an, this, that), pronouns (I, you, he, she, him, he, that, which, what, who), principal prepositions (e.g. of, to, in, on, from, with) and conjunctions (e.g. and, but, that, if). It also includes the verbs be and have, other auxiliary and modal verbs (e.g. may, can, will, would), the other most common semantic main verbs (e.g. do, make, take, use), and basic quantifying adjectives (e.g. all, some, more, one). The only noun in this band is time.\n" +
            "\n" +
            "About 0.02% of all non-obsolete OED entries are in Band 8."];
    }
)
;
