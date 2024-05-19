/* ======================================================================
LDOCE 5++
======================================================================= */

(function () {
    var _userAgent = navigator.userAgent.toLowerCase();
    if ((/windows\snt/.test(_userAgent)
        && /chrome|firefox/.test(_userAgent)) || jQuery('.gdarticle').css('-webkit-column-gap') == '1px') {
        console.log('Windows Chrome/firefox detected.');
        if (/windows\snt/.test(_userAgent) && /chrome|firefox/.test(_userAgent))
            $("a.speaker").click(function () {
                fSound = $(this).attr('href');
                fSound = fSound.replace('sound://', '');
                (new Audio(fSound)).play();
            });
        return jQuery;
    } else {
        return jQuery.noConflict(true)
    }
})()
(function ($) {
    const TAGSWITCHCN = '.LDOCE_switch_lang';
    const TAGSWITCHCNALL = '.LDOCE_switch_lang.switch_all';
    const TAGSWITCHCNCHILDREN = '.LDOCE_switch_lang.switch_children';
    const TAGSWITCHCNSIBLINGS = '.LDOCE_switch_lang.switch_siblings';
    const TAGSWITCHCNTAG = '.LDOCE_switch_lang.switch_children, .LDOCE_switch_lang.switch_siblings'

    const TAGSENSEFOLD = '.LDOCE5pp_sensefold';
    const TAGSENSEFOLDOTHER = '.LDOCE5pp_sensefold_other';
    const TAGCROSSSENSE = '.cross_sense';
    const TAGWORDFAMILY = '.LDOCE_word_family';

    const TAGCHINESSTEXT = '.cn_txt';

    var lm5pp_pagetype = 3;
    var lm5pp_clickDealy = 200;

    var prop = {};


    if (/\bTrident\b/i.test(navigator.userAgent)) {
        $('.lm5ppbody')
            .before('<div style="color:red; font-size: 40px">This Dictionary BE INCOMPATIBLE with Mdict</div>')
            .hide();
        return;
    }

    (function init() {
        if (typeof window.lm5pp_pageCount == 'undefined') {
            window.lm5pp_pageCount = 0
        }
        window.lm5pp_pageCount += 1;
        if (window.lm5pp_pageCount > 1) return;

        // remove duplicate records
        var _titleArray = [];
        $('.lm5ppbody').each(function (index) {
            var _tag = $(this).find('.pagetitle');
            var _pagetitle = $.trim(_tag.text() + _tag.attr('pagetype'));
            if (_titleArray.indexOf(_pagetitle) < 0) {
                _titleArray.push(_pagetitle)
                if (!hasElement('.expBody') && (index > 0)) {
                    $(this).addClass('notfirst');
                }
                if ((_tag.attr('pagetype') == '2') && $(this).find('.Sense.LDOCEVERSION_new').length != 0){
                    var _online = $(this).find('.Sense:not(.LDOCEVERSION_new)').length == 0;
                    if (_online){
                        $(this).find('.lm5ppMenu').addClass('online')
                            .find('#lm5ppMenu_logo')
                            .addClass('goldlogo')
                            .removeClass('switch_version');
                        $(this).find('.Sense.LDOCEVERSION_new').show().removeClass('LDOCEVERSION_new')
                            .find('.LDOCEVERSIONLOGO_new').hide();

                    } else {
                        $(this).find('.lm5ppMenu').addClass('goldlogo')
                            .find('#lm5ppMenu_logo')
                            .addClass('halfgold goldlogo');

                        if (!$(this).find('.switch_online').length)
                            $(this).find('#menu_quit').before('<span class="lm5pp_popupitem upperBorder"><div class="switch_title">LDOCE Online</div>\n' +
                                '<label class="switch"><input id="switch_online" type="checkbox"><span class="slider round"></span></label></span>');
                    }
                }
            } else {
                $(this).css('display', 'none');
            }
        })

        checkPlatform('.lm5ppbody');

        extendJQuery();

        readIni();

        loadImage();

        removePictureAndSound();

        // ********************************************
        topicSetup();

        multiwordsSetup();

        // ********************************************
        $('h1.pagetitle').each(function () {
            lm5pp_pagetype =
                Math.min(lm5pp_pagetype, $(this).attr('pagetype') === undefined ? 0 : parseInt($(this).attr('pagetype')));
        });

        // hook tags for visibility of cross senses(phrase verbs)
        senseSetup();
        $('.Sense > .foldsign_fold').toggleClass('foldsign_fold').siblings().filter(senseFilter).filter(versionFilter).lm5pp_toggle();

        $('.wordfams > ' + TAGSENSEFOLD)
            .off().on("click", function () {
            $(this).toggleClass('foldsign_fold');
            $(this).nextAll('.LDOCE_word_family').first().lm5pp_toggle();
        })


        // pagetype=3: online page
        if (lm5pp_pagetype != 3) {
            setTimeout(switchChineseSetup, 0);
            // lm5pp_switchChineseSetup();
        }
        setTimeout(imageSetup, 0);
        // ...box show/hide,
        setTimeout(boxSetup, 0);

        // version
        versionSetup();

        // ***************** menu ********************
        menuSetup();
        floatmenuSetup();
        if ($('#switch_online').length > 0) {
          $('.lm5pp_popup').addClass('switch_version');
          $('.lm5pp_popup, .lm5ppMenu, #lm5ppMenu_logo').addClass('goldlogo');
        }

        // ***************** proncodes ***************
        HWDSetup();

        // ***************** proncodes ***************
        pronCodeSetup();

        // ***************** Tips window ***************
        // lm5pp_tipsSetup();

        // ***************** East Egg ***************
        easteggSetup();

        // ********************************************
        onlinePronSetup();

        anchorSetup();

        // double click setup
        setTimeout(dblSetup, 0);

        setTimeout(bussDictLinkFix, 1400);
        
        // click event triggered by hover
        if (prop.ini_menuHover > 0 && !hasElement('.mobile.lm5ppbody')) {
            setTimeout(hoverDelaySetup, 1400);
        }

        // trigger float logo
        $(window).scroll();
    })()

    function checkPlatform(rootElement) {
        var _class = '';
        var _userAgent = navigator.userAgent.toLowerCase();
        if (/windows nt/i.test(_userAgent)) {
            _class += ' windowsnt desktop';
            if (/eudic/i.test(_userAgent)) {
                _class += ' eudicnt';
            }
        } else if (_userAgent.indexOf('ipad') > -1 && navigator.maxTouchPoints === 0) {
            _class += ' macos_ipad_sim';
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

            if (hasElement('.expBody, .eudicExpDiv')) {
                _class += ' eudic';
            } else if (hasElement('.bd_body')) {
                _class += ' bluedict';
            }
        }

        $('.Sense.Subentry').css('-webkit-animation', '');

        // Add border and shadow in the context of non-white background theme being selected.
        if (/goldendict/i.test(_class) && (!/rgba?\(255,\s*255,\s*255\b/i.test($('body').css('background-color')))) {
            _class += ' not-white'
        }
        ;

        // debug
        // _class = 'mobile bluedict android';
        $(rootElement).addClass(_class);
    }

    function multiwordsSetup() {
        if (!isMultiwords()) {
            return;
        }

        // remove duplicate images
        var _images = new Array();
        $('.ldoce-show-image[src]').each(function () {
            var _src = $(this).attr('src');
            _src = _src.substring(_src.search('media'));
            if (_images.indexOf(_src) >= 0) {
                $(this).hide();
            } else {
                _images.push(_src);
            }
        });

        // merge menu items
        var _target_popup = $('.lm5ppbody').last().find('.lm5pp_popup');
        _target_popup
            .prepend('<span></span>')
            .children('span:first')
            .append(
                $('.lm5pp_popupitem:has(.Head)'))
            .append($('.lm5pp_popupitem:has(#switch_online):first'))
            .append($('.lm5pp_popupitem:has(#switch_cn):first'))
            .append($('.lm5pp_popupitem:has(#switch_syllable):first'))
            .append($('.lm5pp_popupitem:has(#switch_corpus):first'))
            .append($('.lm5pp_popupitem:has(.lm5pp_icon):first'))
            .append($('.lm5ppMenu_floatlogo:first'));

        _target_popup.children('span').last().remove();
        // .find('#menu_quit:first').nextAll('.lm5pp_popupitem').remove();


        // $('.lm5ppbody:lt(-1)').find('.lm5pp_popup').remove();
        $('.lm5ppbody .lm5pp_popup').not(_target_popup).remove();

        var _entry = $('.entry_content').not('.topic'),
            _target_intro = _entry.find('.dictionary_intro').first();

        if (_entry.find('.dictionary_intro .lm5ppMenu').not('.online').length) {
            _target_intro.find('.lm5ppMenu').removeClass('online')
                .find('.goldlogo').removeClass('goldlogo');
        }

        if (_entry.find('.dictionary_intro .lm5ppMenu .lm5ppMenu_title').not('.en_show').length) {
            _target_intro.find('.lm5ppMenu .lm5ppMenu_title').removeClass('en_show');
        }

        _entry.find('.dictentry:not(.bussdict) .dictionary_intro').not(_target_intro).remove();
        // $('.entry_content').not('.topic').filter(function (index) {
        //     return index != 0;
        // }).find('.dictionary_intro').remove();

        // remove duplicate records of 'word family'
        var _titles = [];
        $('.wordfams').filter(function () {
            var _title = $(this).find('.w').first().attr('title');
            if (_titles.indexOf(_title) >= 0) {
                return true;
            } else {
                _titles.push(_title);
                return false;
            }
        }).remove();

    }

    function isMultiwords() {
        return ($('.lm5ppbody > .entry_content:not(.topic)').length > 1);
    }

    function menuSetup() {
        // initialize checked boxes
        $('#switch_syllable').prop("checked", $('.HWD .HYP').is(":visible"));
        $('#switch_corpus').prop("checked", $('.asset.corpus:visible').is(":visible"));

        if (!isChineseSwitch()) {
            $('#switch_cn').closest('.lm5pp_popupitem').hide();
        } else {
            $('#switch_cn').prop("checked", $('.ldoceEntry .Sense .cn_txt').is(":visible"));
        }

        if (!hasElement('.ldoceEntry .LDOCEVERSION_new')) {
            $('#switch_online').closest('.item').remove();
        } else {
            $('#switch_online').prop("checked", $('.ldoceEntry .LDOCEVERSION_new').is(":visible"));

            $('#lm5ppMenu_logo')
                .addClass("switch_version")
                .on('click.lm5ppMenu', toggleVersion);
        }

        // prevent default event handlers
        $('#switch_syllable, #switch_online, #switch_cn, #switch_corpus')
            .off('.itemClick').on('click.itemClick', false);

        $('.lm5pp_popupitem a[href]').off('.itemClick').on('click.itemClick', function (event) {
            event.stopImmediatePropagation();
            event.preventDefault();
            scrollPosition($($(event.currentTarget).attr('href')));
        })

        $('#menu_quit').off('.itemClick').on('click.itemClick', function (event) {

            var _x = event.pageX - $('#icon_senseFold').offset().left
            if ((_x > 0)
                && (_x < $('#icon_senseFold').outerWidth() + 10)) {

                toggleAllCrossense();
                return;
            }
            _x = event.pageX - $('#icon_boxFold').offset().left
            if ((_x > 0)
                && (_x < $('#icon_boxFold').outerWidth() + 10)) {

                toggleAllBoxes();
                return;
            }
        })

        $('.lm5ppbody:last .lm5pp_popup').off('.itemClick')
            .on('click.itemClick', '.lm5pp_popupitem', function (event) {
                if ($(this).has('#switch_syllable').length) {
                    switchSyllable();
                } else if ($(this).has('#switch_cn').length) {
                    toggleChineseAll();
                } else if ($(this).has('#switch_online').length) {
                    toggleVersion();
                } else if ($(this).has('#switch_corpus').length) {
                    toggleCorpus();
                } else if ($(this).has('a[href]').length) {
                    $(this).find('a[href]').first().trigger('click');
                }
                menuHide();
                // lm5pp_menuHide();
            });
    }

    function menuHide() {
        if (!isMenuShow())
            return;

        $('.lm5ppbody:last .active.lm5pp_popup').fadeTo(250, 0.1, function () {
            $(this).removeClass('active').css({'opacity': '', 'visibility': ''});
            $(window).off('.monitorFloatMenu');
            $(window).scroll();
        });
    }

    function menuShow() {
        if (!isMenuShow())
            return;

        $('.lm5ppbody:last .lm5pp_popup:not(.active)')
            .css({'opacity': 0, 'visibility': 'visible'})
            .fadeTo(250, 1, function () {
                $(this).addClass('active').css({'opacity': '', 'visibility': ''});

                $(window).off('.monitorFloatMenu').on("click.monitorFloatMenu", function (event) {
                    if ($(event.target).closest('.lm5pp_popup').length == 0) {
                        menuHide();
                    }
                });

                $('.desktop .lm5pp_popup').one({
                    'mouseleave.monitorFloatMenu': function () {
                        menuHide();
                    }
                });
            });
    }

    var lm5pp_scrollTimer;
    const lm5pp_MENUSHOWHIDE = 1000;

    function floatmenuSetup() {
        if (lm5pp_pagetype != 0) {
            return;
        }

        $('.lm5ppbody').first().append('<span id="location_zero" style="position: fixed; top:0; left:0"></span>')
            .append('<span id="location_zero_bottom" style="position: fixed; bottom:0; right:0"></span>');

        if (!isMenuShow()) {

        }

        $('#logo_float').prepend('<span class="float_effect"></span>');

        $('.entry_content:last').css('position', 'relative');
        var _originalBottom = parseInt($('.entry_content:last .lm5pp_popup').css('bottom'));
        var _originalRight = parseInt($('.entry_content:last .lm5pp_popup').css('right'));

        $(window).scroll(function () {
            clearTimeout(lm5pp_scrollTimer);
            lm5pp_scrollTimer = setTimeout(function () {
                menuHide();

                if (!isMenuShow()) {
                    $('#logo_float.show').removeClass('show');
                    return;
                }

                var _entryHeight = getDictHeight();

                var _top = $('.entry_content:visible').first().offset().top;
                var _bottomOffset = 0;

                var _bottom = _top + _entryHeight + _bottomOffset;
                var _zero_top = $('#location_zero').offset().top;

                var _menu = $('.entry_content:visible:last .lm5pp_popup'),
                    _menu_height = _menu.height();

                var _locate = _menu.offset().top + _menu_height;
                var _zero_bottom = $('#location_zero_bottom').offset().top;

                var _flag_show = ((_bottom - _zero_top) >= (_menu_height + 60));
                if (_flag_show) {
                    _flag_show = ((_top < _zero_top)
                        || (_top >= _zero_top && (_zero_bottom - _top) >= (_menu_height + 60)))
                }

                if (_flag_show) {
                    var _offset = _zero_bottom - _bottom + 20
                    if (isBluedict()) {
                        _menu.css({
                            'right': '', position: 'fixed',
                            bottom: 'initial', top: _top + _menu_height + 20
                        });
                        $(window).off('scroll');

                    } else if (_offset < _originalBottom) {
                        _offset = _originalBottom;
                        if (_menu.css('position') != 'fixed')
                            _menu.css({"right": '', "position": "", "bottom": ""});
                    } else {
                        if (_menu.css('position') == 'fixed') {
                            var _right = $('#location_zero_bottom').offset().left
                                - ($('.entry_content:last').offset().left + $('.entry_content:last').outerWidth());
                            _menu.css({"right": _originalRight - _right, "bottom": '10px', "position": "absolute"})
                        }

                    }
                    // else {
                    //     _offset = _zero_bottom - _bottom - 10;
                    // }
                    $('#logo_float').not('.show').addClass('show');
                } else {
                    $('#logo_float.show').removeClass('show');
                }

                $('#logo_float').off('.logo_float').on('click.logo_float', function () {
                    ($(this).closest('.active.lm5pp_popup').length) ? menuHide() : menuShow();

                    return false;
                });
            }, 300);
        });
    }

    function pronCodeSetup() {
        // click proncodes to pronounce
        if (!isMDDExisting() && !isMobile() && !hasElement('.lm5ppbody.chrome.desktop')) {
            $('.ldoceEntry > .Head > a.PronCodes')
                .css('cursor', 'default').attr('href', '#')
                .on('click', function () {
                    return false;
                });
            return;
        }

        $('.ldoceEntry > .Head > a.PronCodes')
            .each(function () {
                var _selector = 'a.speaker[href!="{}"]'.replace('{}', $(this).attr('href'));
                if ($(this).siblings(_selector).length > 0) {
                    $(this).attr('hrefalt', $(this).siblings(_selector).attr('href'))
                }
            })
            .on('click.pronCode', function () {
                var _href = $(this).attr('href');
                if ($(this).is('[hrefalt]')) {
                    // var _selector = 'a.speaker[href!="{}"]'.replace('{}', $(this).attr('href'));

                    setTimeout(function (element, href) {
                        $(element).attr('href', href);
                    }, 200, this, $(this).attr('hrefalt'));

                    $(this).attr('hrefalt', _href);

                }
                if (isOnlinePron()) {
                    var _selector = 'a.speaker[href="{}"]'.replace('{}', _href);
                    $(this).siblings(_selector).trigger('click');
                    return false;
                }
            });
    }

    function versionSetup() {
        // $('.ldoceEntry').find('.LDOCEVERSION_new, .LDOCEVERSIONLOGO_5, .LDOCEVERSIONLOGO_new').hide();
    }

    function HWDSetup() {
        if (isMenuShow() && $('.ldoceEntry > .Head > .HWD').length > 1) {
            $('.ldoceEntry > .Head > .HWD').css('cursor', 'pointer')
                .on('click.HWD', function () {
                    var _$HWDs = $('.ldoceEntry > .Head > .HWD:visible');
                    if (_$HWDs.length > 1) {
                        var _index = _$HWDs.index(this);
                        if (_index >= 0) {
                            _index += 1;
                            if (_index >= _$HWDs.length)
                                _index = 0;

                            scrollPosition(_$HWDs.eq(_index));
                        }
                    }
                })
        } else {
            $('.ldoceEntry > .Head > .HWD:has(.HYP)').css('cursor', 'pointer')
                .on('click.HWD', function () {
                    switchSyllable();
                })
        }
    }

    function switchChineseSetup() {
        if (!isChineseSwitch())
            return;

        // $('.lm5ppMenu_title').addClass('en_show');

        if (hasElement('.ldoceEntry .cn_txt')) {
            $('.lm5ppMenu_title').addClass('intro_active')
                .add(TAGSWITCHCNALL)
                .off('.lm5pp_lang')
                .on('click.lm5pp_lang', showChineseAll);

            $('.ldoceEntry').addClass('langSwitch').off('.lm5pp_lang')
                .on('click.lm5pp_lang entry.lm5pp_lang', TAGSWITCHCNTAG
                    , function (event) {
                        if (hasElement('.lm5ppMenu_title.en_show'))
                            return;

                        event.stopImmediatePropagation();
                        event.preventDefault();
                        $.proxy(switchChinese, this)();
                    });
        }

        if (hasElement('.topicCloud .cn_txt')) {
            $('.lm5ppTopic_title').addClass('intro_active')
                .off('.lm5pp_lang')
                .on('click.lm5pp_lang', function () {
                    $('.entry_content.topic .cn_txt').lm5pp_toggle();
                });
        }
    }

    function onlinePronSetup() {

        if (!isOnlinePron()) return;

        $('a.speaker[href$=".spx"]')
            .closest('.EXAMPLE.speaker').removeClass('speaker').end()
            .remove();

        $('.ldoceEntry').on('click.onlinePron', 'a.speaker[href$="mp3"][href*="media"]:not(.loading)', function () {
            /*  by author of Bluedict */
            if (isBluedict() && false) {
                var _src = $(this).attr('href');
                _src = 'http://www.ldoceonline.com/' + _src.substring(_src.search('media'));
                var _audio = new Audio();
                _audio.src = _src;
                _audio.play();
                return;
            }
            /* END END END END */

            var _src = $(this).addClass('loading').attr('href');

            _src = 'http://www.ldoceonline.com/' + _src.substring(_src.search('media'));

            var _audio = new Audio();

            var _timeout = setTimeout(function (audioObj, loadingTag) {

                $(audioObj).trigger('abort', {timeout: null, loadingTag: loadingTag});
            }, 5000, _audio, this);

            /* networkState
            0 = NETWORK_EMPTY - audio/video has not yet been initialized
            1 = NETWORK_IDLE - audio/video is active and has selected a resource, but is not using the network
            2 = NETWORK_LOADING - browser is downloading data
            3 = NETWORK_NO_SOURCE - no audio/video source found

            readyState
            0 = HAVE_NOTHING - no information whether or not the audio/video is ready
            1 = HAVE_METADATA - metadata for the audio/video is ready
            2 = HAVE_CURRENT_DATA - data for the current playback position is available, but not enough data to play next frame/millisecond
            3 = HAVE_FUTURE_DATA - data for the current and at least the next frame is available
            4 = HAVE_ENOUGH_DATA - enough data available to start playing
            */
            var _event = 'play.play ended.play abort.play error.play';
            $(_audio)
                .on(_event, {timeout: _timeout, loadingTag: this}, function (event) {

                    //     + this.networkState + " ready:" + this.readyState);

                    clearTimeout(event.data.timeout);

                    if (event.type == 'play') return;

                    $(event.data.loadingTag).removeClass('loading');
                    $(this).off('.play').prop('autoplay', false);
                })
                // .prop('autoplay', true)
                .prop('src', _src);
            _audio.play();

            return false;
        });
    }

    function isChineseSwitch() {
        return ($('.pagetitle').css('background-repeat') == 'repeat-y'
            && hasElement('.ldoceEntry .cn_txt, .cloud .cn_txt'));
    }

    function hoverDelaySetup() {
        var _timeout_hover, _timeout_lock = false
            , _timeout_duration = prop['ini_menuHover_delay'];

        $('.lm5pp_popup, .lm5ppMenu').on('click.hover', function () {

            clearTimeout(_timeout_hover);
        });

        var _items = $('.lm5pp_popupitem').has('.HWD, .switch');
        _items.add('.lm5pp_icon')
            .add('.lm5pp_popupitem .Head').has(':not(.HWD)')
            .hover(function (event) {
                var _self = $(this);
                clearTimeout(_timeout_hover);
                _timeout_hover = setTimeout(function () {
                    var _event = $.Event('click');
                    _event.pageX = event.pageX;
                    if (_self.is('.lm5pp_icon')) {
                        $('#menu_quit').trigger(_event);
                    } else {
                        _self.trigger(_event);
                    }
                }, _timeout_duration)
            }, function () {
                clearTimeout(_timeout_hover);
            })

        $('#logo_float').on('mouseenter mouseleave click', function (event) {
                if (event.type == 'mouseenter') {
                    clearTimeout(_timeout_hover);
                    if (!$(this).closest('.active.lm5pp_popup').length) {
                        _timeout_hover = setTimeout(function () {
                            $('#logo_float').trigger('click');

                        }, _timeout_duration)
                    }
                } else if (event.type == 'mouseleave' || event.type == 'click') {
                    clearTimeout(_timeout_hover);
                }
            }
        );

        // title bar
        $('.lm5ppMenu').on('mouseenter mouseleave'
            , '.switch_version, .asset_intro, .intro_active'
            , _processHover);

        function _processHover(event) {
            if (event.type == 'mouseenter') {
                clearTimeout(_timeout_hover);

                var _self = $(event.target);
                if (_self.is('.switch_version') && _timeout_lock) {
                    return;
                }

                _timeout_hover = setTimeout(function () {
                    _self.trigger('click');

                    _timeout_lock = true;
                    setTimeout(function () {
                        _timeout_lock = false;
                    }, 5000);
                }, _timeout_duration)

                return false;
            } else if (event.type == 'mouseleave') {
                clearTimeout(_timeout_hover);
            } else if (event.type == 'click') {
                clearTimeout(_timeout_hover);
            }
        }
    }

    var lm5pp_lastdblSetupClick = null;

    function dblSetup() {
        // return;

        $('.lm5ppbody').off('.lm5ppbody').on('click.lm5ppbody', function (event) {

            if (lm5pp_lastdblSetupClick === event.target) return;
            lm5pp_lastdblSetupClick = event.target;
            setTimeout(function () {
                lm5pp_lastdblSetupClick = null;
            }, 500)

            if ($(event.target).closest('.ldoce-show-image').length) return false;

            $('.lm5ppBox, .Sense, .Subsense')
                .each(function () {
                    if (($(this).offset().top < event.pageY)
                        && (($(this).offset().top + $(this).outerHeight()) > event.pageY)) {
                        var _element = $(this);
                        if (_element.is('.lm5ppBox')) {
                            if ($(event.target).filter('.EXAMPLE, .Exponent, .Collocate')
                                .first()
                                .children(TAGSWITCHCNTAG)
                                .first().trigger('entry').length > 0) return false;

                            _element.children('.LDOCE5pp_sensefold')
                                .each(function () {
                                    if ($(this).offset().top < event.pageY
                                        && $(this).offset().top + $(this).outerHeight() >= event.pageY) {
                                        $(this).trigger('entry');
                                        return false;
                                    }
                                });
                        } else if (_element.is('.Sense, .Subsense')) {
                            if ($(event.target)
                                .filter('.EXAMPLE, .ErrorBox, .ColloExa, .GramExa, .Sense, .Subsense')
                                .first()
                                .children(TAGSWITCHCNTAG)
                                .first()
                                .trigger('entry').length > 0
                            ) return false;

                            if ($(event.target)
                                .filter('.Sense, .Subsense')
                                .first()
                                .children(TAGSENSEFOLD)
                                .first()
                                .trigger('entry').length > 0
                            ) return false;

                            _element.children(TAGSENSEFOLD).each(function () {


                                if ($(this).offset().left > event.pageX
                                    && $(this).offset().top < event.pageY
                                    && $(this).offset().top + $(this).outerHeight() >= event.pageY) {

                                    $(this).trigger('entry');
                                    return false;
                                }

                            })
                            // lm5pp_toggleAllCrossense(_element);
                        }
                        // return false;
                    }
                });
        });
    }

    function switchSyllable() {
        $('.HWD .HYP').lm5pp_toggle();
        $('#switch_syllable').prop('checked', function (index, val) {
            return !val;
        });
    }

    var lm5pp_lastClick;
    var imageShowHTML =
        '<style>' +
        '.ldoce5pp-image-button{' +
        'width: 20px; height: 20px; display:inline-block; ' +
        'cursor: pointer;' +
        'margin-left: 10px; padding: 8px; border-radius: 50%;' +
        'background-color:rgba(33, 150, 243, 0.5);' +
        '-webkit-transition: background-color .3s, -webkit-transform .5s;' +
        '}' +
        '.desktop .ldoce5pp-image-button:hover{' +
        'background-color:rgba(33, 150, 243, 1);' +
        '-webkit-transform:rotate(180deg);' +
        '}' +
        '.ldoce5pp-image-show.zoom .svgzoomout{display:none;}' +
        '.ldoce5pp-image-show:not(.zoom) .svgzoomin{display:none;}' +
        '.ldoce5pp-image-show{' +
        'display:none;' +
        'position:fixed;' +
        'cursor:zoom-in; ' +
        'cursor:-webkit-zoom-in; ' +
        'box-sizing: border-box;' +
        'color: rgba(0, 0, 0, 0.3);' +
        'overflow: auto;' +
        'z-index: 99999;' +
        'border: 4px solid currentColor;' +
        '}' +
        '.ldoce5pp-image-show.x8{cursor:zoom-out;cursor:-webkit-zoom-out}' +
        '.ldoce5pp-image-show::-webkit-scrollbar{' +
        '    width: 0px;' +
        '    height: 0px;' +
        '* background: transparent; */' +
        '}' +
        'ldoce5pp-image-show::-webkit-scrollbar-thumb{' +
        'background: rgba(33, 150, 243, 0.7);' +
        '/* background: transparent; */' +
        '}' +
        'ldoce5pp-image-show::-webkit-scrollbar-track{' +
        '    background: rgba(33, 150, 243, 0.5);' +
        '    display:none;' +
        '}' +
        '.ldoce5pp-image-toolbar{position:fixed; right:20px; height:40px;overflow: hidden;}' +
        '.mobile .ldoce5pp-image-toolbar{top: 20px;}' +
        '.ldoce5pp-image-show.bluedict .ldoce5pp-image-toolbar{display:none}' +
        '.ldoce5pp-image-container{' +
        'width:100%; height:100%;' +
        'background-color:currentColor;' +
        'background-size:contain;' +
        'background-repeat:no-repeat;' +
        'background-position:center;' +
        'background-clip:padding-box;' +
        '}' +
        '.ldoce5pp-image-show.zoom .ldoce5pp-image-container{' +
        'width:200%; height:200%;' +
        'background-color:currentColor;' +
        'background-size:contain;' +
        'background-repeat:no-repeat;' +
        'background-position:center;' +
        'background-clip:padding-box;' +
        '}' +
        '.ldoce5pp-image-show.zoom.x4 .ldoce5pp-image-container{' +
        'width:400%; height:400%;' +
        'background-color:currentColor;' +
        'background-size:contain;' +
        'background-repeat:no-repeat;' +
        'background-position:center;' +
        'background-clip:padding-box;' +
        '}' +
        '.ldoce5pp-image-show.zoom.x8 .ldoce5pp-image-container{' +
        'width:800%; height:800%;' +
        'background-color:currentColor;' +
        'background-size:contain;' +
        'background-repeat:no-repeat;' +
        'background-position:center;' +
        'background-clip:padding-box;' +
        '}' +
        '</style>' +
        '<div class="ldoce5pp-image-show">' +
        '<div class="ldoce5pp-image-toolbar">' +
        '<span class="ldoce5pp-image-button svgzoomin">' +
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="100%" height="100%"><path d="M791.993 935.156V867.72h137.31V728.53H1000v206.682zm137.31-802.818h-137.31V64.846H1000v206.683h-70.697zM70.813 271.471H0V64.788h208.235v67.494H70.813zm0 596.242h137.422v67.437H0V728.465h70.813z" fill="#fefffc"/><text style="line-height:1.25;-inkscape-font-specification:\'sans-serif, Normal\';font-variant-ligatures:normal;font-variant-caps:normal;font-variant-numeric:normal;font-feature-settings:normal;text-align:start" x="224.24" y="649.645" font-weight="400" font-size="403.253" font-family="sans-serif" letter-spacing="0" word-spacing="0" fill="#fffeff" stroke="#fffeff" stroke-width="10.081"><tspan x="224.24" y="649.645" style="-inkscape-font-specification:\'sans-serif, Normal\';font-variant-ligatures:normal;font-variant-caps:normal;font-variant-numeric:normal;font-feature-settings:normal;text-align:start">2X</tspan></text></svg>'
        // '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="100%" height="100%"><path d="M791.993 935.156V867.72h137.31V728.53H1000v206.682zm137.31-802.818h-137.31V64.846H1000v206.683h-70.697zM70.813 271.471H0V64.788h208.235v67.494H70.813zm128.11-17.221h602.213v491.315H198.922zm58.772 435.47h484.782V310.042H257.695zM70.813 867.713h137.422v67.437H0V728.465h70.813z" fill="#fefffc"/></svg>'
        + '</span>' +
        '<span class="ldoce5pp-image-button svgzoomout">' +
        '<svg id="" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="100%" height="100%"><path d="M217.275 87.74H143.28v146.288H0v70.873h217.275zm782.1 142.54H853.2V87.001h-70.873v217.332h217.048zm-216.65 465.16V912.43h73.94V766.142H1000V695.44zM.795 769.777H146.97v143.222h70.873V695.781H.795zM304.674 652.45h390.595V348.401H304.674z" fill="#fffeff"/></svg>'
        + '</span>' +
        '<span class="ldoce5pp-image-button svgzoomclose">' +
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="100%" height="100%"><g stroke-miterlimit="10" fill="none" stroke="#fff" stroke-width="94.401" stroke-linecap="round"><path d="M104.537 104.507l790.926 790.986M895.463 104.507L104.537 895.493" stroke-width="82.53385029"/></g></svg>'
        + '</span>' +
        '</div>' +
        '<div class="ldoce5pp-image-container"></div>' +
        '</div>';

    function imageSetup() {
        $('.ldoce-show-image').on('click.dictimage', function (event) {
            event.stopPropagation();
            event.preventDefault();
            showImage(this);
        })
            .filter(function () {
                return hasElement('.desktop')
            })
            .hover(function () {
                $(this).siblings().css('pointer-events', 'none');
            }, function () {
                $(this).siblings().css('pointer-events', '');
            });
    }

    function showImage(target) {
        var _bluedict = isBluedict();
        var _img = $(target);
        var _viewport = getViewport();

        if (!_bluedict) {
            if (_img.length != 0) {
                _start = {
                    top: _img.offset().top - _viewport.top, left: _img.offset().left,
                    bottom: _viewport.bottom - (_img.offset().top + _img.height()),
                    right: _viewport.width - (_img.offset().left + _img.width()),
                    opacity: 0
                }
            } else {
                _start = {
                    top: _viewport.height / 2, left: _viewport.width / 2,
                    bottom: _viewport.height / 2, right: _viewport.width / 2,
                    opacity: 0
                }
            }
            _end = {top: 0, left: 0, bottom: 0, right: 0, opacity: 1};
        } else {
            _end = {top: 0, left: 0, width: _viewport.width, height: _viewport.height, opacity: 1};
            if (_img.length != 0) {
                _end.top = _img.offset().top - 40;
            }
            _start = _end;
        }

        var _$view = $('.ldoce5pp-image-show').removeClass('zoom');
        var _src = _img.attr('src') || _img.find('[src]').attr('src');
        var clicked = false, clickX, clickY;
        if (!_$view.length) {
            // $('.lm5ppbody').last().append('<div class="ldoce5pp-image-show"> </div>');
            $('body').append(imageShowHTML);
            _$view = $('.ldoce5pp-image-show');
        }

        _$view.find('.svgzoomclose').off('.imgShow')
            .on('click.imgShow', function () {
            // $('.ldoce5pp-image-show').trigger('click');
            imgZoom_quit();
            return false;
        }).end()
            .find('.svgzoomout,.svgzoomin').off('.imgShow')
            .on('click.imgShow', function () {
                imgZoom_zoom(hasElement('.ldoce5pp-image-show.zoom') ? 1 : 2);
                return false;
            });

        var dragFlag = false;
        _$view
            .off('click.imgShow').on('click.imgShow', function (e) {
            if (/^http.*?wallhaven\.cc/i.test(_src)
                && (e.pageX > _$view.width() - 50
                    && (e.pageY - _$view.offset().top) > _$view.height() - 100)) {
                copyToClipboard(_src);
            }

            if (isBluedict()) {
                imgZoom_quit();
            } else if (hasElement('.lm5ppbody.desktop')) {
                if (dragFlag) return;
                imgZoom_zoom();
            } else if (hasElement('.lm5ppbody.mobile.eudic')) {
                if (e.pageX < _$view.width() / 2) {
                    _$view.scrollLeft(_$view.scrollLeft() - 120);
                } else {
                    return true;
                }
            } else {
                return true;
            }
            e.stopImmediatePropagation();
            e.preventDefault();
        })
            .toggleClass('mobile', hasElement('.lm5ppbody.mobile'))
            .toggleClass('bluedict', hasElement('.lm5ppbody.bluedict'))
            .toggleClass('desktop', hasElement('.lm5ppbody.desktop'))
            .filter('.desktop').find('.ldoce5pp-image-container').off('.imgShow').on({
            'mousemove.imgShow': function (e) {
                if (!clicked) return;
                e.preventDefault();
                e.stopImmediatePropagation();
                dragFlag = true;
                _$view.scrollTop(_$view.scrollTop() + (clickY - e.pageY))
                    .scrollLeft(_$view.scrollLeft() + (clickX - e.pageX));
                clickY = e.pageY;
                clickX = e.pageX;
                return false;
            },
            'mousedown.imgShow': function (e) {
                // console.log(e);
                if (hasElement('.ldoce5pp-image-show.zoom')) {
                    dragFlag = false;
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    clicked = true;
                    clickX = e.pageX;
                    clickY = e.pageY;
                    _$view.add(this).css('cursor', 'all-scroll');
                    return false;
                }
            },
            'mouseup.imgShow mouseleave.imgShow': function (e) {
                if (hasElement('.ldoce5pp-image-show.zoom')) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    clicked = false;
                    _$view.add(this).css('cursor', '');
                    return false;
                }
            }
        });
        var _animTime = 500;

        if (/^ldoce4/.test(_src)) {
            _src = $('#' + _src).attr('src');
        }

        $('#lm5pp_wallpaper_copy').hide();

        _$view.find('.ldoce5pp-image-container').css('background-image', 'url(' + _src + ')');

        var _src_anim = !_bluedict && _img.is('img');
        if (_src_anim) {
            _img.css('opacity', 0)
        }

        _$view.filter(':hidden')
            .css(_start)
            .show(0);

        if (!_bluedict) {
            _$view.animate(_end, _animTime);
        }

        return false;

        function imgZoom_zoom(magnification) {
            var _magification = 1;
            if (hasElement('.ldoce5pp-image-show.x8'))
                _magification = 1
            else if (hasElement('.ldoce5pp-image-show.x4'))
                _magification = 8
            else if (hasElement('.ldoce5pp-image-show.zoom'))
                _magification = 4
            else
                _magification = 2;

            if (_magification != 1) {
                $('.ldoce5pp-image-show .svgzoomin svg text').text('' + _magification + 'X');
            }

            $('.ldoce5pp-image-show').removeClass('x2 x4 x8').toggleClass('zoom', _magification != 1)
                .filter('.zoom').each(function () {
                var _container = $(this), _img = $('.ldoce5pp-image-container');
                _container.addClass('x' + _magification);
                setTimeout(function () {
                    _container.scrollTop((_img.height() - _container.height()) / 2);
                    _container.scrollLeft((_img.width() - _container.width()) / 2);
                    _container.focus();
                });
                // $('.ldoce5pp-image-show .ldoce5pp-image-container').focus();
            });
        }

        function imgZoom_quit() {
            event.stopPropagation();
            event.preventDefault();

            var _splitTime = 0.8;
            if (isBluedict()) {
                _$view.hide();
                return;
            }
            _$view.animate(_start, {duration: _animTime, queue: false})
                .delay(_animTime * _splitTime)
                .animate({opacity: 0}, _animTime * (1 - _splitTime))
                .promise().done(function () {
                _$view.hide();
            });
            if (_src_anim)
                _img.delay(_animTime * _splitTime)
                    .animate({'opacity': 1}, _animTime * (1 - _splitTime));
        }

        function copyToClipboard(str) {
            if (document.queryCommandSupported('copy')) {
                var el = $('<textarea id="lm5pp_wallpaper_copy" ' +
                    'style="left:-9999px;position:absolute max-width:80%;"></textarea>')
                    .appendTo('body').val(str);
                if (hasElement('.lm5ppbody.ios')) {
                    el[0].setSelectionRange(0, 9999);
                } else {
                    el[0].select();
                }
                var s = document.execCommand('copy');
                el.remove();
            } else {
                var el = $('#lm5pp_wallpaper_copy');
                if (!el.length) {
                    el = $('<textarea id="lm5pp_wallpaper_copy" ' +
                        ' readonly style="left:0; top:50%; right:0; max-height:50px;position:fixed"></textarea>')
                        .appendTo(_$view);
                }
                el.val(str).show();
                el[0].focus();
                el[0].setSelectionRange(0, 9999);
            }
        };


    }

    var lm5pp_clickTimer;

    function boxSetup() {
        $('.ldoceEntry').off('.boxControl')
            .on("click.boxControl entry.boxControl", '.lm5ppBox .lm5ppBoxHead'
                , function (event) {
                    event.stopImmediatePropagation();
                    toggleBox($(this));
                    return false;
                });
    }

    var lm5pp_switchBox;

    function toggleBox($obj, actionUnfold) {
        var $box = $obj.closest('.lm5ppBox');
        if ($box.length) {
            if ($box.length == 1) {
                var _box = $box.get(0);
                if (lm5pp_switchBox === _box) {
                    return;
                } else {
                    lm5pp_switchBox = _box;
                }
            }

            if (actionUnfold === undefined)
                actionUnfold = $box.hasClass('BoxHide');

            var _duration = ($box.length > 5) || (!isApplyEffect()) ? 0 : lm5pp_slideDuration;
            $box
                .filter(function () {
                    return actionUnfold == $(this).hasClass('BoxHide')
                })
                .toggleClass('BoxHide', !actionUnfold).children('.BoxPanel')
                .each(function () {
                    $(this).animate({height: 'toggle', opacity: 'toggle'}, _duration, function () {

                    });

                }).end()
                .find('.LDOCE5pp_sensefold').toggleClass('foldsign_fold');

            setTimeout(function () {
                lm5pp_switchBox = null;
            }, 300);

            $(window).scroll();
        }
    }

    var lm5pp_boxes;

    function toggleAllBoxes($obj) {
        if (lm5pp_boxes === undefined)
            lm5pp_boxes = $('.ldoceEntry .lm5ppBox');

        var _$target = lm5pp_boxes;
        var _actionUnfold;

        if (lm5pp_boxes.length == 0)
            return;

        if ($obj === undefined || !($obj instanceof jQuery)) {
            _actionUnfold = lm5pp_boxes.filter('.BoxHide').length / lm5pp_boxes.length >= 0.5;
        } else {
            _actionUnfold = !$obj.hasClass('BoxHide');

            if ($obj.get(0) === lm5pp_switchBox) {
                _$target = _$target.not($obj);
                _actionUnfold = !_actionUnfold;
            }
        }

        savePosition();
        toggleBox(_$target, _actionUnfold);
    }

    function toggleVersion() {
        $('#switch_online').prop('checked', function (index, val) {

            $('#lm5ppMenu_logo, .lm5pp_popup, .lm5ppMenu_title,.lm5ppMenu')
                .toggleClass('goldlogo', !val);

            $('.dictentry.LDOCEVERSION_new').lm5pp_toggle(!val);

            $('.ldoceEntry.LDOCEVERSION_new, .ldoceEntry .LDOCEVERSION_new').filter(controlFilter)
                .add('.ldoceEntry [class*=LDOCEVERSIONLOGO_]')
                .lm5pp_toggle(!val);

            $('.lm5pp_popup').toggleClass('switch_version');

            $(window).scroll();
            return !val;
        });
    }

    function toggleCorpus() {
        $('#switch_corpus').prop('checked', function (index, val) {
            $('.lm5ppMenu .corpusegg').toggle(val);
            $('.corpus').lm5pp_slideToggle(!val).promise().done(function () {
                isInView($('.corpus'), true);
                $(window).scroll();
            });
            return !val;
        });
    }

    function topicSetup() {
        if (hasElement('.entry_content.topic')) {
            $('a.topic_other').attr('href', '').off('.topic').on('click.topic', function () {
                var _self = $(this);
                $('.cloud').slideToggle().promise().done(function () {
                    _self.toggleClass('full');
                    scrollPosition($('.lm5ppbody .topicCloud'));
                });
                return false;
            });

        }
    }

    function senseFilter(index) {
        return !$(this).is('.merge_sense') && $(this).is('.EXAMPLE, .GramExa, .ColloExa, ' +
            '.Crossref, .F2NBox, .Thesref, .GramBox, .Subsense, .Hint, .UsageBox, .Sense, .ErrorBox');
    }


    var lm5pp_senseTimer;
    var lm5pp_senseTimerFlag = false;

    function senseSetup() {
        $('.ldoceEntry')
            .off('.senseFold')
            .on("click.senseFold entry.senseFold"
                , TAGSENSEFOLD + ':not(.fixed), ' + TAGSENSEFOLDOTHER, function (event) {
                    if ($(this).parent().hasClass('lm5ppBox')) {
                        return;
                    }

                    event.stopImmediatePropagation();
                    event.preventDefault();

                    if ($(this).parent().hasClass('SpokenSect')) {
                        $(this).toggleClass('foldsign_fold');
                        $(this).siblings('.Sense').lm5pp_toggle();
                        return false;
                    }

                    toggleCrosssense(this);
                    return false;
                })
    }

    var lm5pp_switchSense;

    function toggleCrosssense(obj) {
        if ($(obj).is(TAGSENSEFOLDOTHER)) {
            obj = $(obj).siblings(TAGSENSEFOLD)
        }

        var _sense = $(obj).closest('.Sense').get(0);

        if (lm5pp_switchSense === _sense) {
            return;
        } else {
            lm5pp_switchSense = _sense;
        }

        $(obj).siblings().filter(senseFilter).filter(versionFilter).lm5pp_toggle();
        $(obj).filter(versionFilter).toggleClass('foldsign_fold');

        setTimeout(function () {
            lm5pp_switchSense = null;
        }, 200);

    }

    var lm5pp_allSenses;

    function toggleAllCrossense(obj) {
        if (lm5pp_allSenses === undefined)
            lm5pp_allSenses = $('.ldoceEntry .Sense > ' + TAGSENSEFOLD);

        var _actionUnfold;
        var _sense;

        var _$target = lm5pp_allSenses;

        if (obj === undefined || !(obj instanceof jQuery)) {
            _actionUnfold = (_$target.filter('.foldsign_fold').length / _$target.length >= 0.5);
        } else {
            _actionUnfold = obj.is('.foldsign_fold');
            _sense = obj.closest('.Sense').get(0);
            if (_sense === lm5pp_switchSense) {
                _$target = _$target.not($(obj));
                lm5pp_switchSense = null;
                _actionUnfold = !_actionUnfold;
            }
        }

        if (_actionUnfold) {
            _$target = _$target.filter('.foldsign_fold');
        } else {
            _$target = _$target.not('.foldsign_fold');
        }

        var _collection = _$target.siblings().filter(senseFilter)
            .filter(versionFilter);

        savePosition();
        var _promise = ((_collection.length > 30) || !isApplyEffect())
            ? _collection.toggle(_actionUnfold).promise()
            : _collection.lm5pp_toggle(_actionUnfold).promise();

        _promise.done(function () {
            _$target
                .filter(versionFilter).toggleClass('foldsign_fold', !_actionUnfold);
            restorePosition();
        })
    }

    var _middleElement;

    function savePosition() {
        if (isBluedict()) return;

        _middleElement = undefined;
        var _viewport = getViewport()
            , _scrollTop = $('body').scrollTop() + _viewport.height / 2;
        var _element;
        $('.ldoceEntry').children(':visible').each(function () {
            if ($(this).offset().top > _scrollTop) {
                return false;
            }
            _element = this;
        });
        $(_element).children('.Subsense, .Sense').each(function () {
            if ($(this).offset().top > _scrollTop) {
                return false;
            }
            _element = this;
        });
        _middleElement = _element;
    }

    function restorePosition() {
        if (!_middleElement || $(_middleElement).is(':hidden')) return;

        var _viewport = getViewport()
            , _centerLine = $('body').scrollTop() + _viewport.height / 2
            , _top = $(_middleElement).offset().top
            , _position = Math.max(_top - _viewport.height / 2, 0);


        if ((_position >= 0) && (Math.abs(_top - _centerLine) > _viewport.height / 4)) {
            $('html,body').animate({scrollTop: _position}, 500);
        }
    }

    function versionFilter(index) {
        return !($(this).is('.LDOCEVERSION_new') && !$('#switch_online').is(':checked'));
    }

    function controlFilter(index) {
        if ($(this).parent().is('.Sense, .Subsense')) {

            return $(this).siblings('.foldsign_fold').length == 0;
        }
        return true;
    }

    var lm5pp_lastSwitchElement;

    function switchChinese(event) {
        if (this === lm5pp_lastSwitchElement)
            return;

        if ($(this).is(TAGSWITCHCNSIBLINGS)) {
            $(this).siblings().children(TAGCHINESSTEXT).lm5pp_toggle();
            $(this).children(TAGCHINESSTEXT).lm5pp_toggle();
        } else {
            $(this).children(TAGCHINESSTEXT).lm5pp_toggle();
            $(this).find('.en_txt > .cn_txt').lm5pp_toggle();
        }

        if ($('.ldoceEntry .cn_txt:hidden').length == 0)
            showChineseAll();

        $(window).scroll();

        setTimeout(function () {
            lm5pp_lastSwitchElement = null;
        }, 200);
    }

    function showChineseAll() {
        toggleChineseAll(true);
    }

    function toggleChineseAll(option) {
        // option: true/false - show/hide
        $('#switch_cn').prop('checked', function (index, val) {

            if (option !== undefined && typeof option == 'boolean')
                val = !option;

            var _target = $(TAGCHINESSTEXT);

            savePosition();
            var _promise = (_target.length > 100)
                ? _target.toggle(!val).promise()
                : _target.lm5pp_toggle(!val).promise();

            _promise.done(function () {
                $('.lm5ppbody').toggleClass('langSwitch', val)

                $('.lm5ppMenu_title').toggleClass('en_show', !val)
                    .add('.lm5ppTopic_title')
                    .toggleClass('intro_active', val)
                    .not('.intro_active')
                    .off('.lm5pp_lang');

                if (val) {
                    switchChineseSetup();
                } else {
                    $(TAGSWITCHCNALL).add(TAGSWITCHCNTAG)
                        .off('.lm5pp_lang')
                        .css('cursor', 'auto');
                }
                restorePosition();
            });

            $(window).scroll();
            return !val;
        });


    }

    function anchorSetup() {
        if (isGoldendict()) {
            _match = document.location.href.match(/gdanchor=.*?_.*?_(.*?)__a/)
            if (_match) {
                $('#' + _match[1]).each(function () {
                    if ($(this).closest('.lm5ppbody .SpokenSect').children('.foldsign_fold')
                        .toggleClass('foldsign_fold')
                        .siblings('.Sense').show().length) {
                        scrollPosition($(this));
                    }
                });
            }
        }
    }

    var lm5pp_tipsTimer;

    function lm5pp_tipsSetup($element, func) {
        return;
    }

    function easteggSetup() {
        setTimeout(function () {
            if (hasElement('.corpus')) {
                $('.lm5ppMenu .corpusegg').on('click', toggleCorpus);
            } else {
                $('.lm5ppMenu .corpusegg').hide();
            }

            if (hasElement('.bussdict')) {
                $('.lm5ppMenu .bussdictegg').on('click', function () {
                    $(this).hide();
                    $('.bussdict').lm5pp_slideToggle().promise().done(function () {
                        isInView($('.bussdict'), true);
                        $(window).scroll();
                    });
                });
            } else {
                $('.lm5ppMenu .bussdictegg').hide();
            }

        }, 3000);
    }

    function isMenuShow() {
        var _height = getDictHeight();
        return ($('.lm5ppBox').length != 0) || isBluedict()
            || _height > $('.lm5pp_popup').outerHeight() * 1.8;
    }

    function getDictHeight() {
        var _height = 0;
        $('.entry_content:visible').each(function () {
            _height += $(this).outerHeight();
        });
        return _height;
    }

    function isMobile() {
        return $('.lm5ppbody').is('.iphone, .android, .ipad') || isBluedict();
    }

    function isMDDExisting() {
        var _flag = $('.pagetitle').css('border-top-style');
        return _flag ? _flag.toLowerCase() === 'double' : false;
    }

    function isOnlinePron() {
        if (isBluedict())
            return !hasElement('.MddExist');

        return (hasElement('.lm5ppbody.chrome.desktop') || (!isMDDExisting() && isMobile()));
    }

    function isGoldendict() {
        return hasElement('.goldendict');
    }

    function isBluedict() {
        return hasElement('.bd_body, .lm5ppbody.bluedict');
    }

    function isEudic() {
        // search for eudic(欧陆)
        var _ss = document.styleSheets;
        for (var i = 0, max = _ss.length; i < max; i++) {
            if (_ss[i].href && (_ss[i].href.toLowerCase().indexOf('main.css') >= 0)) {
                return true;
            }
        }
        return (document.getElementsByClassName('expBody').length != 0);
    }


    function toggleWordFamily() {
        $(TAGWORDFAMILY).lm5pp_toggle();
    }

    function removePictureAndSound() {
        if (!isMDDExisting()) {
            if (!isMobile()) {
                $('a.speaker, .fa-volume-up').remove();
                $('.EXAMPLE.speaker').removeClass('speaker');
            }
            $('.Crossref.ldoce4img.mdd').remove();
        }
    }

    function bussDictLinkFix() {
        $('.bussdictEntry.Entry a.crossRef').each(function (index) {
            $(this).attr('href', $(this).attr('href').replace('-', ' '));
        })
    }
    var imgBuffer = [];
    var imgTimer;

    function wallpaperSetup() {
        if (imgBuffer.length == 0) {
            var imgQueue = [];
            for (var i = 0; i < 20; i++) {
                var _name = 'https://wallpapers.wallhaven.cc/wallpapers/full/wallhaven-'
                    + Math.floor(Math.random() * 1000000);
                var _img = new Image();
                _img.src = _name + '.jpg';
                _img.onload = onloadimg;
                imgQueue.push(_img);
            }
        } else {
            layupImage();
        }

        function onloadimg() {
            imgBuffer.push(this);
            this.onload = null;
            clearTimeout(imgTimer);
            imgTimer = setTimeout(layupImage, 1000);
        }

        function layupImage() {
            $.each(imgQueue, function () {
                if (imgBuffer.indexOf(this) < 0)
                    this.src = '';
            });
            var _img = imgBuffer.shift();
            if (!hasElement('.wallpaperPanel')) {
                var _entry = $('.entry_content:has(.lm5ppMenu:visible)').css('position', 'relative');
                var _top = _entry.find('.lm5ppMenu').offset().top - _entry.offset().top
                    + _entry.find('.lm5ppMenu').height() + 10;
                $('<div class="wallpaperPanel"></div>').append(_img)
                    .css('top', _top)
                    .appendTo(_entry)
                    .on('click', function () {
                        showImage($(this));
                    });
            } else {
                _img.onload = null;
                $('.wallpaperPanel img').attr('src', _img.src);
            }
            if (prop.ini_wallpaper_interval > 0) {

                setTimeout(wallpaperSetup, Math.max(30, prop.ini_wallpaper_interval) * 1000);
            }

        }

        function onerrorimg() {

        }
    }

    function scrollPosition(target, offset) {
        if ($(target).length == 0) return;

        if (isBluedict()) {
            var _id = $(target).attr('id');
            if (!_id) {
                _id = 'random' + Math.round(Math.random() * 100000);
                $(target).attr('id', _id);
            }
            if (_id !== undefined) {
                window.location.href = 'entry://#' + _id;
            }
            return;
        }

        if (typeof offset == "undefined") {
            offset = 160;
        } else if (offset < 1) {
            var _view = getViewport();
            offset = _view.height * offset;
        }

        var _top = target.offset().top - offset,
            _time = 1000;

        if (!hasElement('.qt5')) {
            $('html,body').animate({scrollTop: _top}, _time, function () {
            });
        } else {
            window.scrollTo(0, _top);
        }

    }

    var lm5pp_slideDuration = 300;
    var lm5pp_effect = true;

    function isApplyEffect() {
        return lm5pp_effect && !isBluedict() && (typeof ($.fn.fadeIn) == "function");
    }

    function extendJQuery() {
        $.fn.extend({
            lm5pp_show: function () {
                var _duration = (arguments.length > 0) && (typeof arguments[0] === 'number')
                    ? arguments[0] : lm5pp_slideDuration;

                return this.each(function () {
                    if (!isApplyEffect() || _duration <= 0) {
                        $(this).show();
                    } else {
                        if ($(this).css('display') == 'block') {
                            $(this)
                                .fadeIn({duration: _duration, queue: false})
                                .slideDown(_duration);
                        } else {
                            $(this)
                                .fadeIn({duration: _duration});
                        }
                    }
                });
            },
            lm5pp_hide: function () {
                var _duration = (arguments.length > 0) && (typeof arguments[0] === 'number')
                    ? arguments[0] : lm5pp_slideDuration;

                return this.each(function () {
                    if (!isApplyEffect() || _duration <= 0) {
                        $(this).hide();
                    } else {
                        if ($(this).css('display') == 'block') {
                            $(this)
                                .fadeOut({duration: _duration, queue: false})
                                .slideUp(_duration);
                        } else {
                            $(this)
                                .fadeOut({duration: _duration});
                        }
                    }
                });
            },
            lm5pp_toggle: function (option) {
                return this.each(function (index, element) {
                    if ((typeof (option) != 'undefined') ? option : !$(this).is(":visible")) {
                        $(this).lm5pp_show();
                    } else {
                        $(this).lm5pp_hide();
                    }
                });
            },
            lm5pp_slideToggle: function (option) {
                return this.each(function (index, element) {
                    if (typeof ($.fn.slideToggle) == "undefined") {
                        $(this).toggle(option);
                    } else {
                        $(this).slideToggle(option);
                    }
                });
            },
        });


    }

    function hasElement(selector) {
        return !!document.querySelector(selector);
    }

    function getViewport() {
        var e = window,
            a = 'inner';
        if (!('innerWidth' in window)) {
            a = 'client';
            e = document.documentElement || document.body;
        }
        var _top = $(window).scrollTop(),
            _height = e[a + 'Height'];
        return {
            top: _top,
            bottom: _top + _height,
            width: e[a + 'Width'],
            height: isBluedict() ? e[a + 'Width'] * 1.6 : _height
        }
    }

    function isInView(element, scrollTo) {
        var _visible = $(element).filter(':visible').first();
        if (!_visible.length ) {
            return false;
        }
        var _view = getViewport(), _offset = _visible.offset()
            , _result = _offset.top > _view.top && _offset.top < _view.bottom;
        if (!_result && scrollTo) {
            scrollPosition(_visible, 0.20);
        }
        return _result;
    }

    function readIni() {
        prop = {
            ini_menuHover: 1,
            ini_menuHover_delay: 1500,
            ini_colorExample: 0,
            ini_etymology_hide: 0,
            ini_wordfamily_hide: 0,
            ini_wallpaper: 0,
            ini_wallpaper_interval: 60
        }
        ;

        for (var _propName in prop) {
            if (typeof window[_propName] == typeof prop[_propName]) {
                prop[_propName] = window[_propName];
            }
        }

        var _add_class = '';
        if (prop.ini_colorExample == 1) {
            _add_class += 'Example_blue' + ' ';
        }

        if (prop.ini_etymology_hide == 1) {
            _add_class += 'Etym_disable' + ' ';
        }

        if (prop.ini_wallpaper == 1429748708) {
            setTimeout(wallpaperSetup, 1000);
        }

        if (prop.ini_wordfamily_hide == 1) {
            _add_class += 'Wordfamily_disable' + ' ';
        }

        $('.lm5ppbody').addClass(_add_class);
    }

    function loadImage() {
        var svg_logo = '<svg id="longman_logo" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 280 60"><g id="ldoce_logo"><path d="M2.005 50.607L2 43.072s36.359-.014 36.356-.01c-6.369 4.597-6.934 12.871-6.934 12.871-13.464.367-17.113-8.479-29.417-5.326z"/><path d="M27.177 39.491s2.087-1.084 4.258-1.084c2.307 0 3.479 1.096 3.479 1.096s2.084-1.871 2.084-5.44c0-3.84-2.57-7.409-6.96-7.409-1.181 0-2.341.26-2.892.469 2.429 4.591 1.677 8.555.031 12.368z"/><path d="M2.631 39.491s2.088-1.084 4.259-1.084c2.305 0 3.477 1.096 3.477 1.096s2.085-1.871 2.085-5.44c0-3.84-2.567-7.409-6.962-7.409-1.18 0-2.338.26-2.889.469 2.429 4.591 1.677 8.555.03 12.368z"/><path d="M13.064 39.909s2.808-1.459 5.731-1.459c3.111 0 4.684 1.475 4.684 1.475s2.811-2.519 2.811-7.327c0-5.167-3.461-9.979-9.379-9.979-1.588 0-3.15.354-3.889.636 3.274 6.181 2.26 11.522.042 16.654z"/><path d="M13.921 20.958s2.084-1.082 4.256-1.082c2.308 0 3.477 1.096 3.477 1.096s2.086-1.871 2.086-5.441c0-3.838-2.57-7.406-6.961-7.406-1.183 0-2.343.26-2.893.47 2.432 4.592 1.68 8.552.035 12.363z"/><path d="M3.8 24.585s1.707-.887 3.483-.887c1.892 0 2.851.897 2.851.897s1.707-1.531 1.707-4.456c0-3.143-2.104-6.067-5.702-6.067-.968 0-1.917.216-2.366.386 1.992 3.76 1.373 7.006.027 10.127z"/><path d="M25.782 24.585s1.707-.887 3.486-.887c1.892 0 2.85.897 2.85.897s1.709-1.531 1.709-4.456c0-3.143-2.105-6.067-5.705-6.067-.965 0-1.916.216-2.366.386 1.991 3.76 1.376 7.006.026 10.127z"/><path d="M14.536 6.472c.885-1.256 1.402-3.397-.217-4.805 3.537-1.053 5.648-1.325 9.825-.389.468.67.715 1.575.599 2.455 4.544 1.748 7.674.345 9.557-.829 0 2.06-2.219 6.024-6.468 6.024-2.459 0-4.526-1.172-4.526-1.172.375-.535.564-1.271.361-2.148-3.381-1.07-6.574-.421-9.131.864z"/></g><g id="ldoce_title"><g id="letter_l"><path d="M61.466 46.514V14.985h7.182v24.65h10.237v6.879H61.466z"/></g><g id="letter_ongman"><path d="M110.133 30.666c0 5.318-1.181 9.361-3.542 12.129-2.362 2.768-5.82 4.151-10.373 4.151-4.489 0-7.93-1.392-10.324-4.173-2.395-2.781-3.591-6.832-3.591-12.15 0-5.261 1.19-9.278 3.572-12.053 2.381-2.774 5.842-4.162 10.383-4.162 4.554 0 8.005 1.376 10.354 4.129 2.347 2.754 3.521 6.796 3.521 12.129zm-19.689 0c0 6.111 1.925 9.167 5.774 9.167 1.957 0 3.409-.742 4.354-2.228.946-1.483 1.419-3.797 1.419-6.939 0-3.156-.479-5.488-1.438-6.994-.959-1.506-2.391-2.259-4.296-2.259-3.875 0-5.813 3.084-5.813 9.253z"/><path d="M142.545 46.514h-10.139l-10.452-22.269h-.176c.248 3.502.372 6.176.372 8.021v14.248h-6.85V14.905h10.099l10.412 21.966h.118c-.183-3.186-.274-5.744-.274-7.675V14.905h6.89v31.609z"/><path d="M160.218 28.007h12.351v17.036c-3.354 1.27-7.04 1.903-11.059 1.903-4.41 0-7.819-1.413-10.227-4.237-2.407-2.825-3.61-6.854-3.61-12.086 0-5.103 1.317-9.073 3.953-11.913s6.328-4.259 11.078-4.259c1.8 0 3.5.188 5.098.562 1.599.375 2.991.851 4.179 1.427l-2.446 6.703c-2.062-1.125-4.325-1.687-6.791-1.687-2.258 0-4.003.811-5.236 2.432-1.232 1.622-1.849 3.938-1.849 6.951 0 2.955.558 5.208 1.673 6.757s2.724 2.324 4.824 2.324c1.148 0 2.205-.123 3.171-.368v-4.95h-5.108v-6.595z"/><path d="M190.867 46.514l-5.852-22.766h-.176c.273 3.877.41 6.889.41 9.038v13.729h-6.85v-31.61h10.295l5.969 22.441h.157l5.852-22.441h10.314v31.608h-7.104V32.655c0-.721.01-1.521.029-2.4.02-.879.107-3.034.265-6.464H204l-5.773 22.723h-7.36z"/><path d="M234.709 46.514L233.3 40.59h-9.297l-1.448 5.924h-8.494l9.336-31.738h10.314l9.453 31.738h-8.455zm-3.015-12.929l-1.232-5.189a206.708 206.708 0 0 1-1.048-4.475c-.41-1.831-.682-3.142-.812-3.935-.118.735-.35 1.946-.695 3.632-.346 1.686-1.112 5.009-2.3 9.967h6.087z"/><path d="M273.5 46.514h-10.138L252.91 24.245h-.176c.248 3.502.372 6.176.372 8.021v14.248h-6.851V14.905h10.1l10.412 21.966h.117c-.183-3.186-.273-5.744-.273-7.675V14.905h6.889v31.609z"/></g></g></svg>';
        var _icon_sense = '<svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 1024 1024"  id="svg2042"><defs id="defs2022"><style id="style2020"/></defs><path d="M233.216 220.416h711.168c15.693 0 28.416-12.723 28.416-28.416s-12.723-28.416-28.416-28.416H233.216c-15.693 0-28.416 12.723-28.416 28.416s12.723 28.416 28.416 28.416z" id="path2024"/><path d="M112.627 163.584H77.713c-5.662 0-10.253 12.723-10.253 28.416s4.59 28.416 10.253 28.416h34.914c5.662 0 10.253-12.723 10.253-28.416s-4.59-28.416-10.253-28.416z" id="path2026" stroke-width=".601"/><path d="M944.384 445.184H233.216c-15.693 0-28.416 12.723-28.416 28.416s12.723 28.416 28.416 28.416h711.168c15.693 0 28.416-12.723 28.416-28.416s-12.723-28.416-28.416-28.416z" id="path2028"/><path d="M112.627 445.184H77.713c-5.662 0-10.253 12.723-10.253 28.416s4.59 28.416 10.253 28.416h34.914c5.662 0 10.253-12.723 10.253-28.416s-4.59-28.416-10.253-28.416z" id="path2030" stroke-width=".601"/><path d="M534.784 726.784H233.216c-15.693 0-28.416 12.723-28.416 28.39 0 15.693 12.723 28.442 28.416 28.442h301.568c15.693 0 28.416-12.749 28.416-28.442 0-15.667-12.723-28.39-28.416-28.39z" id="path2036"/><path d="M112.627 726.784H77.713c-5.662 0-10.253 12.723-10.253 28.39 0 15.693 4.59 28.442 10.253 28.442h34.914c5.662 0 10.253-12.749 10.253-28.442 0-15.667-4.59-28.39-10.253-28.39z" id="path2038" stroke-width=".601"/><path d="M944.384 729.626H822.016V607.258c0-15.693-12.723-28.416-28.39-28.416-15.693 0-28.416 12.723-28.416 28.416v122.368H642.816c-15.693 0-28.416 12.723-28.416 28.416 0 15.667 12.723 28.39 28.416 28.39h122.342V908.8c0 15.693 12.724 28.416 28.416 28.416 15.668 0 28.39-12.723 28.39-28.416V786.458h122.369c15.693 0 28.416-12.724 28.416-28.39.05-15.72-12.672-28.442-28.365-28.442z" id="path2040"/></svg>';
        var _icon_close = '<svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 1024 1024" id="svg1440"><defs id="defs1434"><style id="style1432"/></defs><path d="M176.662 817.173c-8.19 8.471-7.96 21.977.51 30.165 8.472 8.19 21.978 7.96 30.166-.51l618.667-640c8.189-8.472 7.96-21.978-.511-30.166-8.471-8.19-21.977-7.96-30.166.51l-618.666 640z" id="path1436"/><path d="M795.328 846.827c8.19 8.471 21.695 8.7 30.166.511 8.471-8.188 8.7-21.694.511-30.165l-618.667-640c-8.188-8.471-21.694-8.7-30.165-.511-8.471 8.188-8.7 21.694-.511 30.165l618.666 640z" id="path1438"/></svg>';
        var _icon_box = '<svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 1024 1024" id="svg2628"><defs id="defs2616"><style id="style2614"/></defs><g id="layer1"><path d="M189.35 148.68c-70.724 0-129.813 56.456-127.91 125.65v504.56c0 69.22 57.186 125.65 127.91 125.65h424.83c14.295 0 25.58-11.287 25.58-24.83 0-13.543-11.285-24.83-25.58-24.83H189.35c-31.361 0-77.172-57.6-76.75-75.24 4.531-189.263.081-428.197 0-505.31 0-41.381 34.62-74.65 76.75-75.24h655.54c42.117 1.192 76.75 33.859 76.75 75.24v288.01c0 13.543 11.285 24.83 25.58 24.83 14.295 0 25.58-11.287 25.58-24.83V274.33c0-69.22-57.186-125.65-127.91-125.65z" id="path2618"/><path d="M944.384 709.146H822.016V586.778c0-15.693-12.723-28.416-28.39-28.416-15.693 0-28.416 12.723-28.416 28.416v122.368H642.816c-15.693 0-28.416 12.723-28.416 28.416 0 15.667 12.723 28.39 28.416 28.39h122.342V888.32c0 15.693 12.724 28.416 28.416 28.416 15.668 0 28.39-12.723 28.39-28.416V765.978h122.369c15.693 0 28.416-12.724 28.416-28.39.051-15.72-12.672-28.442-28.365-28.442z" id="path2040-9"/></g></svg>';

        function _loadSVG(element, svgString) {
            if ($(element).find("svg").length != 0) {
                $(element).find("svg").remove();
            } else {
                $(element).text('');
                $(element).append(svgString);
            }
            return
        }

        if (hasElement('#lm5ppMenu_logo.halfgold')) {
            svg_logo += svg_logo;
        }
        _loadSVG('#lm5ppMenu_logo', svg_logo);

        _loadSVG('#logo_float', svg_logo);
        $('#logo_float svg').attr('preserveAspectRatio', 'xMinYMin slice');

        _loadSVG('#icon_senseFold', _icon_sense);
        _loadSVG('#icon_quit', _icon_close);
        _loadSVG('#icon_boxFold', _icon_box);

    }

    function log5p(info) {
        if ($('#loginfo5p').length == 0) {
            $('.entry_content:last').after('<h1 class="pagetitle" id="loginfo5p" style="font-size: 0.8em;"></h1>');
            $('#loginfo5p').show();
        }
        var _old = $('#loginfo5p').text();
        $('#loginfo5p').text(_old + '\n' + info);
    }
})