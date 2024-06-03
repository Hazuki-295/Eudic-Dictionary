/// remove Eudict header info
setTimeout(function(){var e=document.getElementById('wordInfoHead');e&&e.remove()},0);

////////////////////////////////== Settings ==\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
/// @个性设置: 默认例句发音: 1:英式, 2:美式
var _OALD9_DEFAULT_PRON = 1;

/// @个性设置: O9 滑出视野后自动隐藏词性切换按钮: 1:开启, 0:关闭
var _OALD9_AUTO_TABSHIDE_ON = 1;

/// @个性设置: 默认中文显示级别: 0:不显示, 1:显示释义中文, 2:显示释义中文+例句中文
var _OALD9_TRANS_LEVEL = 2;

/// @个性设置: 例句中文换行： 0:不换行, 1:换行
var _OALD9_BREAK_EXPCN = 1;

/// @个性设置: 字体大小: 1:较小, 2:适中, 3:较大
var _OALD9_FONTSIZE = 2;

/// @个性设置: 主题色彩: 1:白，2:棕褐色, 3:绿色护眼
var _OALD9_THEME = 1;

/// @Hazuki_Debug: Custom Console: 0:隐藏, 1:显示
var _OALD9_CUSTOM_CONSOLE = 0;

var _OALD9_SCROLLTOP_POS = 50; // 回滚顶部位置: iPhoneX:50, iPhone11:54, iPhone:28
var _OALD9_AUTO_TABSHIDE_POS = 160; // 如果启用自动隐藏词性切换功能，此值用于设置当 O9 显示在屏幕可视区域内的高度(px)小于此值时，自动隐藏词性切换按钮
var _OALD9_APPEND_TABS = 1; // 0：不添加，1：添加；查询到多个词条时，是否为单词性词条添加滑动导航按钮（斜条纹底色按钮）
var _OALD9_MAX_TABS = 9; // 查询到多个词条时，如果词条数超过此值，则不为单词性词条添加滑动导航按钮（典型如 O9 词头扩充版下查询`is`）
var _OALD9_PICS = 1; // 是否显示图片：0:不显示，1：显示；由于图片未处理为背景透明，当使用非白色背景主题时，可选择不显示图片，以取得最佳观感效果
///----------------------------------------------------------------------------

/* Hazuki Debug */
const getAncestorId = (dictName, innerNodeSelector) => {
    const dictString = `(Dictionary '${dictName}')`;

    // Dictionary root element
    const innerNode = document.querySelector(innerNodeSelector);
    if (!innerNode) {
        console.warn(`[Hazuki] ${dictString} Inner node with selector '${innerNodeSelector}' not found.`);
        return null;
    }

    // Eudic ancestor node
    const ancestor = innerNode.closest(Hazuki_DEBUG.EUDIC_ANCESTOR_CLASS);
    if (!ancestor) {
        console.warn(`[Hazuki] ${dictString} Ancestor with class '${Hazuki_DEBUG.EUDIC_ANCESTOR_CLASS}' not found.`);
        return null;
    }

    // Eudic dictionary id
    const ancestorId = ancestor.id;
    console.log(`[Hazuki] ${dictString} Ancestor found:`, ancestorId);
    return ancestorId;
}

var Hazuki_DEBUG = {
    // User agent and platform
    USER_AGENT: navigator.userAgent.toLowerCase(),
    IOS: function () { return this.USER_AGENT.indexOf('iphone') > -1; },
    IPAD: function () { return this.USER_AGENT.indexOf('ipad') > -1; },
    ANDROID: function () { return this.USER_AGENT.indexOf('android') > -1; },
    WINDOWS: function () { return this.USER_AGENT.indexOf('windows nt') > -1; },
    MACOS_IPAD_SIM: function () { return this.USER_AGENT.indexOf('ipad') > -1 && navigator.maxTouchPoints === 0; },

    // Application: Eudic
    EUDIC: function () { return this.USER_AGENT.indexOf('eudic') > -1; },
    EUDIC_ANCESTOR_CLASS: '.explain_wrap_styleless', // Eudic

    // Dictionary information
    DICT_OALD9: { name: 'OALD9', rootElement: '.OALD9_online', id: '' },
    DICT_VOCABULARY: { name: 'Vocabulary.com', rootElement: '.definitionsContainer', id: '' },

    CONSOLE_ENABLED: false,

    initialize: function () {
        this.IOS = this.IOS();
        this.IPAD = this.IPAD();
        this.ANDROID = this.ANDROID();
        this.WINDOWS = this.WINDOWS();
        this.MACOS_IPAD_SIM = this.MACOS_IPAD_SIM();

        this.EUDIC = this.EUDIC();

        if (this.CONSOLE_ENABLED) {
            const CustomConsoleInstance = new CustomConsole('.OALD9_online');
            CustomConsoleInstance.initialize();
        }

        console.info(`[Hazuki] User agent: ${this.USER_AGENT}`);

        if (this.EUDIC) {
            console.log('[Hazuki] Eudic detected.');
            this.DICT_OALD9.id = getAncestorId(this.DICT_OALD9.name, this.DICT_OALD9.rootElement);
            this.DICT_VOCABULARY.id = getAncestorId(this.DICT_VOCABULARY.name, this.DICT_VOCABULARY.rootElement);
        } else {
            console.log('[Hazuki] Eudic not detected.');
        }
        console.log('[Hazuki] Debugging initialized.');
    },

    functionStats: {},

    trackFunction: function (func, name) {
        return new Proxy(func, {
            apply: (target, thisArg, argumentsList) => {
                // Initialize stats object for this function if it doesn't exist
                if (!this.functionStats[name]) {
                    this.functionStats[name] = { callCount: 0 };
                }

                // Update stats
                this.functionStats[name].callCount++;

                console.log(`[Hazuki] Function call: ${name}() ${this.functionStats[name].callCount} call(s)`);

                return target.apply(thisArg, argumentsList);
            }
        });
    },

    extractScriptContent: async function () {
        let allScriptsContent = '';
        const scripts = document.querySelectorAll('script');
        const fetchPromises = [];

        scripts.forEach((script, index) => {
            const scriptBoundaries = (content, src = '') => `
            // --- Start of Script ${index + 1} ${src} ---
            ${content}
            // --- End of Script ${index + 1} ---
            `;

            if (script.src) {
                fetchPromises.push(
                    fetch(script.src)
                        .then(response => response.text())
                        .then(data => {
                            allScriptsContent += scriptBoundaries(data, `(${script.src})`);
                        })
                        .catch(error => console.error(`[Hazuki] Error fetching ${script.src}:`, error))
                );
            } else {
                allScriptsContent += scriptBoundaries(script.textContent);
            }
        });

        await Promise.all(fetchPromises);
        return allScriptsContent;
    },

    copyScriptContent: function () {
        this.extractScriptContent().then(scriptsContent => {
            if (copyToClipboard(scriptsContent)) {
                console.log('[Hazuki] Copied script content to clipboard.');
            };
        });
    },
};

class CustomConsole {
    constructor(ancestorSelector) {
        this.container = document.createElement('div');
        this.container.innerHTML = `
        <div id="customConsole" class="hidden">
            <div id="consoleOutput"></div>
            <div id="consoleInput""></div>
            <div class="buttons">
                <button id="clearButton">Clear</button>
                <div class="spacer" style="flex-grow: 1;"></div>
                <button id="executeButton">Execute</button>
            </div>
            <div class="buttons">
                <div class="toggle-buttons">
                    <button id="autocompleteButton">Autocomplete</button>
                    <button id="loadButton">Load Code</button>
                </div>
                <div class="spacer" style="flex-grow: 1;"></div>
                <button id="copyConsoleTextButton">Copy Console</button>
                <button id="copyButton">Copy HTML</button>
            </div>
        </div>
        `;

        this.consoleOutput = this.container.querySelector('#consoleOutput');
        this.consoleInput = this.container.querySelector('#consoleInput');

        this.originalConsole = {
            log: console.log,
            warn: console.warn,
            error: console.error,
            info: console.info,
            trace: console.trace,
        };

        this.overrideConsoleMethods();

        const ancestor = document.querySelector(ancestorSelector);
        if (ancestor) {
            ancestor.insertBefore(this.container, ancestor.firstChild);
            console.log('[Hazuki] Custom console initialized.');
        } else {
            console.error('[Hazuki] Custom console initialization failed.');
            console.error(`[Hazuki] Ancestor with selector '${ancestorSelector}' not found.`);
        }
    }

    overrideConsoleMethods() {
        const logTypes = ['log', 'warn', 'error', 'info'];
        logTypes.forEach(type => {
            console[type] = (...args) => {
                // Call the original console method
                this.originalConsole[type].apply(console, args);

                // Create and append a new message element
                this.createAndAppendMessage(args, type);
            };
        });

        console.trace = () => {
            console.info('[Hazuki] Trace:');
            let stack = new Error().stack;
            // Remove the first line, as it contains the error message which is not needed
            stack = stack.split('\n').slice(1).join('\n');
            this.originalConsole.trace(stack); // Call the original console.trace
            this.createAndAppendMessage([stack], 'trace');
        };
    }

    createMessage(message, type) {
        const newMessage = document.createElement('div');
        newMessage.className = `custom-${type}`;
        newMessage.textContent = message;

        const copyButton = document.createElement('button');
        copyButton.className = 'append-button copy';
        copyButton.addEventListener('click', () => {
            copyToClipboard(message);
            copyButton.classList.add('copied');
            setTimeout(() => copyButton.classList.remove('copied'), 2000);
        });

        newMessage.appendChild(copyButton);
        newMessage.addEventListener('mouseover', () => copyButton.style.display = 'block');
        newMessage.addEventListener('mouseout', () => copyButton.style.display = 'none');

        return newMessage;
    }

    createAndAppendMessage(args, type) {
        const message = args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg))).join(' ');
        const newMessage = this.createMessage(message, type);
        this.consoleOutput.appendChild(newMessage);
        this.consoleOutput.scrollTop = this.consoleOutput.scrollHeight;
    }

    appendToConsoleOutput(message, type) {
        this.createAndAppendMessage([message], type);
    }

    setupConsole() {
        this.consoleInput = CodeMirror(this.consoleInput, {
            lineNumbers: true,
            lineWrapping: true,
            mode: 'javascript',
            extraKeys: {
                'Tab': 'autocomplete'
            }
        });

        const codeMirror = this.container.querySelector('.CodeMirror');
        codeMirror.style.maxHeight = '100%';
        codeMirror.style.maxWidth = '100%';

        const executeButton = this.container.querySelector('#executeButton');

        // Execute code from the input field
        executeButton.addEventListener('click', () => {
            const code = this.consoleInput.getValue().trim();
            if (code) {
                this.appendToConsoleOutput(code, 'input');
                try {
                    const result = eval(code);
                    this.appendToConsoleOutput(result, result === undefined ? 'undefined' : 'output');
                } catch (error) {
                    console.error('[Hazuki] Execution error:', error.message || 'Unknown error');
                }
                this.consoleInput.setValue('');
            }
        });
    }

    setupToggleButtons() {
        const autocompleteButton = this.container.querySelector('#autocompleteButton');
        const loadButton = this.container.querySelector('#loadButton');

        if (!Hazuki_DEBUG.MACOS_IPAD_SIM) {
            autocompleteButton.classList.add('active');
            autocompleteButton.addEventListener('click', () => {
                event.preventDefault();
                this.consoleInput.showHint({ completeSingle: false });
                this.consoleInput.focus();
            });
        } else {
            loadButton.classList.add('active');
            loadButton.addEventListener('click', () => {
                const staticUrl = 'console.txt';
                fetch(staticUrl)
                    .then(response => {
                        if (!response.ok && response.status !== 0) {
                            throw new Error(`HTTP error status ${response.status}`);
                        } else {
                            return response.text();
                        }
                    })
                    .then(text => {
                        this.consoleInput.setValue(text.trim());
                        console.log(`[Hazuki] Loaded code from ${staticUrl}`);
                    })
                    .catch(error => {
                        console.error('[Hazuki] Loading code error:', error.message || 'Unknown error');
                    });
            });
        }
    }

    setupClearAndCopyButtons() {
        const clearButton = this.container.querySelector('#clearButton');
        const copyButton = this.container.querySelector('#copyButton');
        const copyConsoleTextButton = this.container.querySelector('#copyConsoleTextButton');

        // Clear all console messages
        clearButton.addEventListener('click', () => {
            while (this.consoleOutput.firstChild) {
                this.consoleOutput.removeChild(this.consoleOutput.firstChild);
            }
            this.consoleInput.setValue('');
        });

        // Copy the entire HTML content
        copyButton.addEventListener('click', () => {
            const htmlContent = document.documentElement.outerHTML;
            copyToClipboard(htmlContent);
            console.log('[Hazuki] Copied HTML content to clipboard.');
        });

        // Copy the entire console content
        copyConsoleTextButton.addEventListener('click', () => {
            const consoleDivs = Array.from(this.consoleOutput.children);
            const consoleText = consoleDivs.map(div => div.innerText).join('\n');
            copyToClipboard(consoleText);
            console.log('[Hazuki] Copied console text to clipboard.');
        });
    }

    initialize() {
        this.loadResources().then(() => {
            this.setupConsole();
            this.setupToggleButtons();
            this.setupClearAndCopyButtons();
        }).catch((error) => {
            console.error('[Hazuki] Error loading resources:', error.message || 'Unknown error');
        });
    }

    loadResources() {
        // Configuration for different resource types
        const resourceConfig = {
            js: { element: 'script', attribute: 'src' },
            css: { element: 'link', attribute: 'href', rel: 'stylesheet' }
        };

        // Function to load a resource of a given type from a URL
        const loadResource = (type, url) => new Promise((resolve, reject) => {
            const config = resourceConfig[type];
            const element = document.createElement(config.element);
            element[config.attribute] = url;

            // Set up event listeners for load and error events
            element.onload = resolve;
            element.onerror = reject;

            // If the resource type has a 'rel' attribute, set it
            if (config.rel) element.rel = config.rel;

            // Append the new element to the head of the document
            document.head.appendChild(element);
        });

        return loadResource('css', 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.58.3/codemirror.min.css')
            .then(() => loadResource('js', 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.58.3/codemirror.min.js'))
            .then(() => loadResource('js', 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.58.3/mode/javascript/javascript.min.js'))
            .then(() => loadResource('js', 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.58.3/addon/hint/show-hint.min.js'))
            .then(() => loadResource('js', 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.58.3/addon/hint/javascript-hint.min.js'))
            .then(() => loadResource('css', 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.58.3/addon/hint/show-hint.min.css'));
    }
}
/* Hazuki Debug */

/// Actual start point of the script
(function () {
    document.addEventListener('DOMContentLoaded', () => {
        if (Hazuki_DEBUG.OALD9_SCRIPT_RUNED_ONCE === undefined) {
            Hazuki_DEBUG.OALD9_SCRIPT_RUNED_ONCE = true;

            Hazuki_DEBUG.initialize();

            console.info(`[Hazuki] Detect 'DOMContentLoaded' event is fired.`)

            _setupGears();

            oald9();
            oald9_collapse();

            modifyElements();
            if (Hazuki_DEBUG.EUDIC && Hazuki_DEBUG.MACOS_IPAD_SIM) {
                addNoteCopyButton();
            }
        }
    });
})();

async function copyToClipboard(text) {
    if (Hazuki_DEBUG.MACOS_IPAD_SIM) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);

        // Select the content and copy it to the clipboard
        textarea.select();
        document.execCommand('copy');

        // Remove the temporary textarea element
        document.body.removeChild(textarea);
        return;
    }

    try {
        await navigator.clipboard.writeText(text);
    } catch (err) {
        console.error('[Hazuki] Copy to clipboard failed:', err);
    }
}

function oald9_collapse() {
    // Expand all collapsible elements with the specified title
    document.querySelectorAll('.collapse[title="Oxford Collocations Dictionary"] .heading')
        .forEach(headingElement => headingElement.click());

    // Definition selector
    const definitionSelector = `${Hazuki_DEBUG.DICT_OALD9.rootElement} .def`;

    // Collapsible elements selector
    const collapsibleSelector = '.x-gs, .collapse';

    // Attend buttons to the definitions
    function createButton(className, clickHandler) {
        const button = document.createElement('button');
        button.classList.add('append-button', className);
        button.addEventListener('click', clickHandler);
        return button;
    }

    document.querySelectorAll(definitionSelector).forEach(definition => {
        const collapsibleElements = definition.parentElement.querySelectorAll(collapsibleSelector);
        const autoHideCollapsible = false; // Hide by default

        // Copy Button Logic
        const copyButton = createButton('copy', function () {
            copyToClipboard(definition.textContent);
            this.classList.add('copied');
            setTimeout(() => this.classList.remove('copied'), 2000);
        });

        definition.appendChild(copyButton);

        // Collapse Button Logic
        if (collapsibleElements.length > 0) {
            const collapseButton = createButton(autoHideCollapsible ? 'collapsed' : 'expanded', function () {
                const isCollapsed = this.classList.contains('collapsed');
                collapsibleElements.forEach(e => e.style.display = isCollapsed ? 'block' : 'none');
                this.className = `append-button ${isCollapsed ? 'expanded' : 'collapsed'}`;
            });

            if (autoHideCollapsible) {
                collapsibleElements.forEach(e => e.style.display = 'none');
            }

            definition.appendChild(collapseButton);
        }
    });

    // Add click event listener to the gear menu icon
    const gearMenu = document.getElementById('_OALD9_gear');
    if (gearMenu) {
        const gearHead = gearMenu.querySelector('._gear-ico');
        if (gearHead) {
            gearHead.addEventListener('click', function () {
                const collapsedButtons = document.querySelectorAll('.append-button.collapsed');
                const expandedButtons = document.querySelectorAll('.append-button.expanded');
                if (collapsedButtons.length > 0) {
                    collapsedButtons.forEach(button => button.click());
                } else { // Collapse all definitions
                    expandedButtons.forEach(button => button.click());
                }
            });
        }
    }
}

function addNoteCopyButton() {
    var expCustomNote = document.getElementById('expCustomNote');
    if (expCustomNote) {
        addCopyButton(expCustomNote);
    } else {
        var observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.addedNodes) {
                    mutation.addedNodes.forEach(function (node) {
                        if (node.id === 'expCustomNote') {
                            addCopyButton(node);
                            observer.disconnect(); // Stop observing when we found the node
                        }
                    });
                }
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }
}

function addCopyButton(expCustomNote) {
    var eudicNoteHead = expCustomNote.querySelector('.eudic_note_head');
    var newButton = document.createElement('button');
    newButton.textContent = '复制';
    newButton.classList.add('editNote');
    newButton.style.marginLeft = '10px';
    newButton.addEventListener('click', function () {
        var div = document.getElementById("customeNoteText");
        var innerHTML = div.innerHTML.replace(/<br\s*\/?>/gi, '\n');
        var tempDiv = document.createElement("div");
        tempDiv.innerHTML = innerHTML;
        var plainNote = tempDiv.textContent;
        copyToClipboard(plainNote);
    })
    eudicNoteHead.appendChild(newButton);
}

// http://iamdustan.com/smoothscroll/
// https://github.com/iamdustan/smoothscroll
!function(){"use strict";function o(){var o=window,t=document;if(!("scrollBehavior"in t.documentElement.style&&!0!==o.__forceSmoothScrollPolyfill__)){var l,e=o.HTMLElement||o.Element,r=468,i={scroll:o.scroll||o.scrollTo,scrollBy:o.scrollBy,elementScroll:e.prototype.scroll||n,scrollIntoView:e.prototype.scrollIntoView},s=o.performance&&o.performance.now?o.performance.now.bind(o.performance):Date.now,c=(l=o.navigator.userAgent,new RegExp(["MSIE ","Trident/","Edge/"].join("|")).test(l)?1:0);o.scroll=o.scrollTo=function(){void 0!==arguments[0]&&(!0!==f(arguments[0])?h.call(o,t.body,void 0!==arguments[0].left?~~arguments[0].left:o.scrollX||o.pageXOffset,void 0!==arguments[0].top?~~arguments[0].top:o.scrollY||o.pageYOffset):i.scroll.call(o,void 0!==arguments[0].left?arguments[0].left:"object"!=typeof arguments[0]?arguments[0]:o.scrollX||o.pageXOffset,void 0!==arguments[0].top?arguments[0].top:void 0!==arguments[1]?arguments[1]:o.scrollY||o.pageYOffset))},o.scrollBy=function(){void 0!==arguments[0]&&(f(arguments[0])?i.scrollBy.call(o,void 0!==arguments[0].left?arguments[0].left:"object"!=typeof arguments[0]?arguments[0]:0,void 0!==arguments[0].top?arguments[0].top:void 0!==arguments[1]?arguments[1]:0):h.call(o,t.body,~~arguments[0].left+(o.scrollX||o.pageXOffset),~~arguments[0].top+(o.scrollY||o.pageYOffset)))},e.prototype.scroll=e.prototype.scrollTo=function(){if(void 0!==arguments[0])if(!0!==f(arguments[0])){var o=arguments[0].left,t=arguments[0].top;h.call(this,this,void 0===o?this.scrollLeft:~~o,void 0===t?this.scrollTop:~~t)}else{if("number"==typeof arguments[0]&&void 0===arguments[1])throw new SyntaxError("Value could not be converted");i.elementScroll.call(this,void 0!==arguments[0].left?~~arguments[0].left:"object"!=typeof arguments[0]?~~arguments[0]:this.scrollLeft,void 0!==arguments[0].top?~~arguments[0].top:void 0!==arguments[1]?~~arguments[1]:this.scrollTop)}},e.prototype.scrollBy=function(){void 0!==arguments[0]&&(!0!==f(arguments[0])?this.scroll({left:~~arguments[0].left+this.scrollLeft,top:~~arguments[0].top+this.scrollTop,behavior:arguments[0].behavior}):i.elementScroll.call(this,void 0!==arguments[0].left?~~arguments[0].left+this.scrollLeft:~~arguments[0]+this.scrollLeft,void 0!==arguments[0].top?~~arguments[0].top+this.scrollTop:~~arguments[1]+this.scrollTop))},e.prototype.scrollIntoView=function(){if(!0!==f(arguments[0])){var l=function(o){for(;o!==t.body&&!1===(e=p(l=o,"Y")&&a(l,"Y"),r=p(l,"X")&&a(l,"X"),e||r);)o=o.parentNode||o.host;var l,e,r;return o}(this),e=l.getBoundingClientRect(),r=this.getBoundingClientRect();l!==t.body?(h.call(this,l,l.scrollLeft+r.left-e.left,l.scrollTop+r.top-e.top),"fixed"!==o.getComputedStyle(l).position&&o.scrollBy({left:e.left,top:e.top,behavior:"smooth"})):o.scrollBy({left:r.left,top:r.top,behavior:"smooth"})}else i.scrollIntoView.call(this,void 0===arguments[0]||arguments[0])}}function n(o,t){this.scrollLeft=o,this.scrollTop=t}function f(o){if(null===o||"object"!=typeof o||void 0===o.behavior||"auto"===o.behavior||"instant"===o.behavior)return!0;if("object"==typeof o&&"smooth"===o.behavior)return!1;throw new TypeError("behavior member of ScrollOptions "+o.behavior+" is not a valid value for enumeration ScrollBehavior.")}function p(o,t){return"Y"===t?o.clientHeight+c<o.scrollHeight:"X"===t?o.clientWidth+c<o.scrollWidth:void 0}function a(t,l){var e=o.getComputedStyle(t,null)["overflow"+l];return"auto"===e||"scroll"===e}function d(t){var l,e,i,c,n=(s()-t.startTime)/r;c=n=n>1?1:n,l=.5*(1-Math.cos(Math.PI*c)),e=t.startX+(t.x-t.startX)*l,i=t.startY+(t.y-t.startY)*l,t.method.call(t.scrollable,e,i),e===t.x&&i===t.y||o.requestAnimationFrame(d.bind(o,t))}function h(l,e,r){var c,f,p,a,h=s();l===t.body?(c=o,f=o.scrollX||o.pageXOffset,p=o.scrollY||o.pageYOffset,a=i.scroll):(c=l,f=l.scrollLeft,p=l.scrollTop,a=n),d({scrollable:c,method:a,startTime:h,startX:f,startY:p,x:e,y:r})}}"object"==typeof exports&&"undefined"!=typeof module?module.exports={polyfill:o}:o()}();


function toggle_active(ctl) {
    ctl.parentElement.classList.toggle('is-active');
    //ctl.parentElement.parentElement.classList.toggle('is-parent-active');

    /is-active/.test(ctl.parentElement.className) && break_line_chn(ctl.parentNode);
}

function toggle_enlarger(ctl) {
    var fullsize = ctl.children[0].children[0],
        thumb = ctl.children[0].children[1];

    if (fullsize.style.display == 'none') {
        ctl.className = "enlarged";
        fullsize.style.display = 'block';
        thumb.style.display = 'none';
    } else {
        ctl.className = "";
        fullsize.style.display = 'none';
        thumb.style.display = 'block';
    }
}

function switch_entry_old(ctl) { // bug: `last`
    if (event.target == ctl) {return;}

    var i;
    var x = document.getElementsByClassName('OALD9_entry');
    var ctl_id = ctl.id.substr(4);
    for (i = 0; i < x.length; i++) {
        if (x[i].id.substr(0, ctl_id.length) === ctl_id) {
            x[i].style.display = 'none';
        }
    }
    var target = event.target;
    while (target.tagName != 'BUTTON') {target = target.parentElement;}
    target.style.backgroundColor = '#4577bf';
    document.getElementById(target.id.substring(4)).style.display = 'block';

    for (i = 0; i < ctl.children.length; i++) {
        if (ctl.children[i] == target) {
            continue;
        }
        ctl.children[i].removeAttribute('style');//ctl.children[i].style.backgroundColor = '';
    }
}

/* for @topic dt */
function toggle_hide(ctl) {
    ctl.classList.toggle('hide');
}

/*function toggle_chn_old() {
    var x = document.getElementsByClassName('OALECD_chn');
    for (i = 0; i < x.length; i++) {
        if (x[i].style.display == 'inline') {
            x[i].style.display='none';
        } else {
            x[i].style.display='inline';
        }
    }
    x = document.getElementsByClassName('OALECD_tx');
    for (i = 0; i < x.length; i++) {
        if (x[i].style.display == 'inline') {
            x[i].style.display='none';
        } else {
            x[i].style.display='inline';
        }
    }
}*/

function oald9(){
    var oalds = document.getElementsByClassName('OALD9_online');

    _OALD9_AUTO_TABSHIDE_ON && setTimeout(_cbScrollToHideTabs, 0);

    if (Hazuki_DEBUG.CONSOLE_ENABLED) {
        const customConsole = document.getElementById('customConsole');
        customConsole.className = 'customConsole ' + (_OALD9_CUSTOM_CONSOLE === 1 ? 'visible' : 'hidden');
    }

    for (var i=0, l=oalds.length; i<l; ++i){
        if (Hazuki_DEBUG.MACOS_IPAD_SIM) {
            oalds[i].classList.add('macos_ipad_sim');
        }

        wordFinderConfigeration(oalds[i]);
        translationIndividual(oalds[i]);

        if (_OALD9_DEFAULT_PRON > 1) {
            oalds[i].setAttribute('data-pron', _OALD9_DEFAULT_PRON);
        }
        if (_OALD9_TRANS_LEVEL > 0) {
            oalds[i].setAttribute('data-transl', _OALD9_TRANS_LEVEL);
            break_line_chn(oalds[i].querySelector('.OALD9_entry') || oalds[i]);
        }
        if (_OALD9_BREAK_EXPCN > 0) {
            oalds[i].setAttribute('data-brtx', 1);
        }
        if (_OALD9_FONTSIZE === 1 || _OALD9_FONTSIZE === 3) {
            oalds[i].setAttribute('data-fz', _OALD9_FONTSIZE);
        }
        if (_OALD9_THEME !== 1) {
            oalds[i].setAttribute('data-theme', _OALD9_THEME);
        }
        if (_OALD9_PICS !== 1) {
            oalds[i].setAttribute('data-pic', 0);
        }
    }

    setTimeout(function(){
        var i = 0, es = document.querySelectorAll('.OALD9_online'), l = es.length;
        for (; i < l; i++) { es[i].setAttribute('data-tabbed', 1) }
    }, 240);

    // for `_calcDicCoord()`
    var a = document.createElement('span'), b = document.createElement('span');
    a.id = '_posA'; a.style.position = 'absolute';
    b.id = '_posZ'; b.style.position = 'absolute';
    oalds[0].parentNode.insertBefore(a, oalds[0]);
    oalds[0].parentNode.appendChild(b);

    if (!window.__OALD9_scrollHideTabs && _OALD9_AUTO_TABSHIDE_ON > 0) {
        window.__OALD9_scrollHideTabs = true;
        window.addEventListener('scroll', _evScrollToHideTabs);
    }

    window.addEventListener('click', function(e){
        var t = e.target;
        if (t.classList.contains('trans_blank')) {
            e.stopPropagation();
            t.style.display='none';
            t.nextSibling.style.display='inline';
            t.nextSibling.classList.contains('OALECD_chn') && break_line_chn(null, [t.nextSibling]);
        }
    });

    pos_tabs();
}

function wordFinderConfigeration(oald){
    var word_finders = oald.querySelectorAll('.collapse[title="Wordfinder"]');
    for (var j=0; j<word_finders.length; ++j){
        var hd=word_finders[j].getElementsByClassName('heading')[0];
        if(!hd.hasAttribute('assigned')){
            var h_word=document.createElement('wordfinder-word');
            h_word.textContent=word_finders[j].getElementsByClassName('h1')[0].childNodes[0].textContent;
            hd.appendChild(h_word);
            hd.setAttribute('assigned', 1);
        }
    }
}

function translationIndividual(oald){
    if(!(translationIndividualByClassName(oald, 'OALECD_chn', 'inline')|
    translationIndividualByClassName(oald, 'OALECD_tx', 'inline'))){
        translation_button_remove(oald);
    }
}

function translationIndividualByClassName(oald, classN, disp){
    var i = 0, cns = oald.getElementsByClassName(classN), l = cns.length, e;
    if(!l) return false;

    var parentN, trans_blk, p;
    for (; i < l; i++) {
        e = cns[i];
        if (e.classList.contains('_trans')) continue;

        e.classList.add('_trans');
        parentN=e.parentNode;
        parentN.classList.add('translation_individual');
        trans_blk=document.createElement('span');
        trans_blk.className='trans_blank';
        parentN.insertBefore(trans_blk, e);

        if (classN == 'OALECD_tx') {
            p = trans_blk.previousSibling;
            if (p && !p.tagName) p = p.previousSibling; // #text
            if (p && p.classList && p.classList.contains('x')) p.classList.add('_tx');
        }

        parentN.innerHTML = parentN.innerHTML.replace(/something/g, 'sth.').replace(/somebody/g, 'sb.');
    }

    return true;
}

function translation_button_remove(oald){
    var btns=oald.getElementsByClassName('OALECD_trans');
    for(var i=0; i<btns.length; ++i){
        btns[i].style.display='none';
    }
}

//new loggle_chn
function toggle_chn_old(){
    var btn = document.querySelector('.OALECD_trans');
    if(btn.hasAttribute('trans')){
        btn.removeAttribute('trans');
        toggle_chn_class('OALECD_chn', 'none');
        toggle_chn_class('OALECD_tx', 'none');
        toggle_chn_class('trans_blank', '');
    }
    else{
        btn.setAttribute('trans', '');
        toggle_chn_class('OALECD_chn', 'inline');
        toggle_chn_class('OALECD_tx', 'inline');
        toggle_chn_class('trans_blank', 'none');
    }
}

function toggle_chn_class_old(classN, disp){
    var eles=document.getElementsByClassName(classN);
    for(var i=0; i<eles.length; ++i)
        eles[i].style.display=disp;
}

function scroll_to_entry(ctl) {
    var _entry = ctl, n = 20;
    while (n > 0 && _entry && !/^OALD9_online/.test(_entry.className)) { n--; _entry = _entry.parentNode }
    if (_entry && /^OALD9_online/.test(_entry.className)) {
        // window.scrollTo(0, _entry.offsetTop-50);
        window.scrollTo({left:0, top:_entry.offsetTop-_OALD9_SCROLLTOP_POS, behavior:'smooth'});
    }
}

function entry_walkman(ctl) {
    var slf = ctl.parentNode;
    if (!slf.classList.contains('OALD9_online')) return false;

    var tg = slf.nextSibling;

    if ('DIV' !== tg.tagName) tg = tg.nextSibling;
    if (tg && tg.classList && tg.classList.contains('OALD9_online')) {
        scroll_to_entry(tg);
    } else {
        scroll_to_entry(document.querySelector('.OALD9_online'));
    }
}

function switch_entry(ctl) {
    if (event.target == ctl) {return;}

    scroll_to_entry(ctl);

    var i, entryId,
        x = ctl.parentNode.getElementsByClassName('OALD9_entry'),
        btns = ctl.children,
        target = event.target;
    while (target.tagName != 'BUTTON') target = target.parentElement;
    entryId = target.id.substr(4);

    for (i = 0; i < x.length; i++) {
        x[i].style.display = (x[i].id == entryId) ? 'block' : 'none';
        if (x[i].id == entryId) {
            btns[i].style.backgroundColor = '#4577bf';
            _OALD9_TRANS_LEVEL > 0 && break_line_chn(x[i]);
        } else btns[i].removeAttribute('style');
    }
}

function switch_entry_dots(ctl, idx) {
    var p = ctl.parentNode.parentNode.parentNode; // .OALD9_online
    var entries = p.querySelectorAll('.OALD9_entry');
    var tabs = p.querySelectorAll('.OALD9_tab button');

    scroll_to_entry(p);

    for (var i = 0, l = entries.length; i < l; i++) {
        entries[i].style.display = idx == i ? 'block' : 'none';
        if (idx == i) {
            tabs[i].style.backgroundColor = '#4577bf';
            _OALD9_TRANS_LEVEL > 0 && break_line_chn(entries[i]);
        } else tabs[i].removeAttribute('style');
    }
}

function toggle_chn_class(classN, disp, scope){
    scope = scope || document;
    var eles = scope.getElementsByClassName(classN), e, p;
    for(var i = 0; i < eles.length; i++) {
        e = eles[i]; p = e.previousSibling;
        e.style.display = disp;
        if (classN == 'trans_blank' && !disp && p && p.className == '_br') { e.parentNode.removeChild(p) }
        if (classN == 'OALECD_chn' && disp == 'none') { e.classList.remove('_bred') }
    }
}

function break_line_chn(scope, specElements) {
    var i = 0, e, es = (specElements ? specElements : scope.querySelectorAll('.OALECD_chn')), l = es.length;
    var h, p;
    for (; i < l; i++) {
        e = es[i];
        e.innerText = e.innerText
            .replace(/（/g,' ⟨')
            .replace(/）/g,'⟩ ')
            .replace(/／/g,'/')
            .replace(/([：。\s]$)|(^\s)/,'')
            .replace(/\s*([；。，、：])+\s*/g, `$1`); // `view`

        h = e.offsetHeight;
        // 14:.8em, 18:1em
        if ( /*e.innerText.length < 26 &&*/ h > 25 && !/(shcut)|(dtxt)|(use)/.test(e.parentNode.className) && !e.classList.contains('_bred')) {
            // .dtxt: `can`:Idioms
            // .use: `have`
            p = document.createElement('p');
            p.className = '_br';
            e.classList.add('_bred');
            e.parentNode.insertBefore(p, e.previousSibling.className=='trans_blank'?e.previousSibling:e);
        }
    }
}

function toggle_chn(type){
    var scope = document;
    var evt = window.event || arguments.callee.caller.arguments[0];
    if (evt) {
        var p = evt.target, n = 20;
        while (n > 0 && p && 'entryContent' != p.id) { n--; p = p.parentNode }
        if (p && 'entryContent' == p.id) scope = p;
    }

    var btn = scope.querySelector('.OALECD_trans');

    if (type === 'word' && scope.id == 'entryContent') {
        var o9 = scope.parentNode;
        o9 = o9.classList.contains('OALD9_online') ? o9 : o9.parentNode;
        var translAttr = o9 ? o9.getAttribute('data-transl') : null;
        translAttr && o9.removeAttribute('data-transl');

        if (!scope.classList.contains('_trans_def') && !btn.hasAttribute('trans') && !translAttr) {
            scope.classList.add('_trans_def');
            break_line_chn(scope);
            scroll_to_entry(scope);

            // force re-layout (gist.github.com/paulirish/5d52fb081b3570c81e3a)
            // toggle_chn_class('OALECD_chn', 'block', scope);
            // return scope.offsetHeight;
            return false;
        } else {
            scope.classList.remove('_trans_def');
        }
    }

    scope.id == 'entryContent' && scroll_to_entry(scope);

    if (2 == translAttr) return false;

    if (btn.hasAttribute('trans')) {
        btn.removeAttribute('trans');
        toggle_chn_class('OALECD_chn', 'none', scope);
        toggle_chn_class('OALECD_tx', 'none', scope);
        toggle_chn_class('trans_blank', '', scope);
    } else {
        btn.setAttribute('trans', '');
        toggle_chn_class('OALECD_chn', 'inline', scope);
        toggle_chn_class('OALECD_tx', 'inline', scope);
        toggle_chn_class('trans_blank', 'none', scope);
    }

    return false;
}

/// auto hide/show tabs
var __OALD9_scrollTickTimer = null;
var __OALD9_appHeight = document.body.clientHeight;

function _evScrollToHideTabs() {
    clearTimeout(__OALD9_scrollTickTimer);
    __OALD9_scrollTickTimer = setTimeout(_cbScrollToHideTabs, 300);
}

function _cbScrollToHideTabs() {
    var coord = _calcDicCoord();
    _toggleTabs(coord.top < -coord.height+_OALD9_AUTO_TABSHIDE_POS || coord.top > __OALD9_appHeight-_OALD9_AUTO_TABSHIDE_POS);
}

function _calcDicCoord() {
    var a = document.getElementById('_posA'), z = document.getElementById('_posZ');
    return { top:a.getBoundingClientRect().top, height:z.offsetTop-a.offsetTop }
}

function _toggleTabs(onoff) {
    // true:hide, false:show
    var oalds = document.querySelectorAll('.OALD9_online'), i = 0, l = oalds.length;
    for (; i < l; i++) {
        if (onoff) oalds[i].setAttribute('data-hidetabs', 1);
        else oalds[i].removeAttribute('data-hidetabs');
    }
}

/// GUI settings
function _setupGears() {
    if (!_checkLDB()) return;

    var G = _getGear();
    _OALD9_TRANS_LEVEL = G.transLevel;
    _OALD9_BREAK_EXPCN = G.breakCN;
    _OALD9_AUTO_TABSHIDE_ON = G.autoHideTabs;
    _OALD9_FONTSIZE = G.fontSize;
    _OALD9_THEME = G.theme;
    _OALD9_DEFAULT_PRON = G.pron;
    _OALD9_CUSTOM_CONSOLE = G.customConsole;

    _setupGearMenu();
}

function _getGear(key) {
    const db = window.localStorage;
    if (!key) return {
        autoHideTabs: null === db.getItem('o9ol_1') ? _OALD9_AUTO_TABSHIDE_ON : parseInt(db.getItem('o9ol_1')),
        transLevel: null === db.getItem('o9ol_2') ? _OALD9_TRANS_LEVEL : parseInt(db.getItem('o9ol_2')),
        breakCN: null === db.getItem('o9ol_3') ? _OALD9_BREAK_EXPCN : parseInt(db.getItem('o9ol_3')),
        fontSize: null === db.getItem('o9ol_4') ? _OALD9_FONTSIZE : parseInt(db.getItem('o9ol_4')),
        theme: null === db.getItem('o9ol_5') ? _OALD9_THEME : parseInt(db.getItem('o9ol_5')),
        pron: null === db.getItem('o9ol_6') ? _OALD9_DEFAULT_PRON : parseInt(db.getItem('o9ol_6')),
        customConsole: null === db.getItem('o9ol_7') ? _OALD9_CUSTOM_CONSOLE : parseInt(db.getItem('o9ol_7'))
    };

    switch (key) {
        case 'autoHideTabs': return null === db.getItem('o9ol_1') ? _OALD9_AUTO_TABSHIDE_ON : parseInt(db.getItem('o9ol_1'));
        case 'transLevel': return null === db.getItem('o9ol_2') ? _OALD9_TRANS_LEVEL : parseInt(db.getItem('o9ol_2'));
        case 'breakCN': return null === db.getItem('o9ol_3') ? _OALD9_BREAK_EXPCN : parseInt(db.getItem('o9ol_3'));
        case 'fontSize': return null === db.getItem('o9ol_4') ? _OALD9_FONTSIZE : parseInt(db.getItem('o9ol_4'));
        case 'theme': return null === db.getItem('o9ol_5') ? _OALD9_THEME : parseInt(db.getItem('o9ol_5'));
        case 'pron': return null === db.getItem('o9ol_6') ? _OALD9_DEFAULT_PRON : parseInt(db.getItem('o9ol_6'));
        case 'customConsole': return null === db.getItem('o9ol_7') ? _OALD9_CUSTOM_CONSOLE : parseInt(db.getItem('o9ol_7'));
    }

    return null;
}

function _setGear(key, value) {
    const db = window.localStorage;
    var i, o9, o9s = document.querySelectorAll('.OALD9_online'), l = o9s.length;
    switch (key) {
        case 'breakCN':
            db.setItem('o9ol_3', ''+value);
            _OALD9_BREAK_EXPCN = value;
            if (value > 0) for (i = 0; i < l; i++) { o9s[i].setAttribute('data-brtx', 1) }
            else for (i = 0; i < l; i++) { o9s[i].removeAttribute('data-brtx') }
            break;
        case 'transLevel':
            db.setItem('o9ol_2', ''+value);
            _OALD9_TRANS_LEVEL = value;
            if (value <= 0) for (i = 0; i < l; i++) { o9s[i].removeAttribute('data-transl') }
            else for (i = 0; i < l; i++) {
                o9s[i].setAttribute('data-transl', value);
                break_line_chn(o9s[i].querySelector('.OALD9_entry') || o9s[i])
            }
            break;
        case 'autoHideTabs':
            db.setItem('o9ol_1', ''+value);
            _OALD9_AUTO_TABSHIDE_ON = value;
            clearTimeout(__OALD9_scrollTickTimer);
            if (value <= 0) {
                _toggleTabs(false); // show
                window.__OALD9_scrollHideTabs = false;
                window.removeEventListener('scroll', _evScrollToHideTabs);
            } else {
                window.__OALD9_scrollHideTabs = true;
                window.addEventListener('scroll', _evScrollToHideTabs);
                _cbScrollToHideTabs(); // check & show OR hide
            }
            break;
        case 'customConsole':
            db.setItem('o9ol_7', ''+value);
            _OALD9_CUSTOM_CONSOLE = value;
            if (Hazuki_DEBUG.CONSOLE_ENABLED) {
                const customConsole = document.getElementById('customConsole');
                customConsole.className = 'customConsole ' + (value === 1 ? 'visible' : 'hidden');
            }
            break;
        case 'fontSize':
            db.setItem('o9ol_4', ''+value);
            _OALD9_FONTSIZE = value;
            if (2===value) for (i = 0; i < l; i++) { o9s[i].removeAttribute('data-fz') }
            else for (i = 0; i < l; i++) { o9s[i].setAttribute('data-fz', value) }
            break;
        case 'theme':
            db.setItem('o9ol_5', ''+value);
            _OALD9_THEME = value;
            if (1===value) for (i = 0; i < l; i++) { o9s[i].removeAttribute('data-theme') }
            else for (i = 0; i < l; i++) { o9s[i].setAttribute('data-theme', value) }
            break;
        case 'pron':
            db.setItem('o9ol_6', ''+value);
            _OALD9_DEFAULT_PRON = value;
            if (1===value) for (i = 0; i < l; i++) { o9s[i].removeAttribute('data-pron') }
            else for (i = 0; i < l; i++) { o9s[i].setAttribute('data-pron', value) }
    }
}

function _checkLDB() {
    const db = window.localStorage;
    if (db && db.getItem) return true;
    return false
}

function _setupGearMenu() {
    const G = _getGear();
    var o9 = document.querySelector('.OALD9_online');
    var menu = document.createElement('div');
    menu.id = '_OALD9_gear';
    menu.className = '_OALD9_gear';
    menu.style.position = 'absolute';
    menu.innerHTML =
        '<div class="_gear-head">' +
            '<div data-cmd="pron" class="_gear-brand"'+(G.pron===2?' data-pron="2"':'')+'>' +
                '<div class="_gear-dicname"><span class="_gear-abbv">OALD</span><span class="_gear-ver"> 9th </span><span class="_gear-ol">online</span></div>' +
                '<div class="_gear-dicarts">—— Artworks from OXFORD</div>' +
            '</div>' +
            '<div class="_gear-ico"></div>' +
        '</div>' +
        '<div class="_gear-body">' +
            '<div class="_gear-g trans-level">' +
                '<div class="_gear-lb">translations</div>' +
                '<div class="_gear-igs">' +
                    '<span data-cmd="transLevel" data-v="0"'+(G.transLevel===0?' data-checked="1"':'')+'>none</span>' +
                    '<span data-cmd="transLevel" data-v="1"'+(G.transLevel===1?' data-checked="1"':'')+'>defs</span>' +
                    '<span data-cmd="transLevel" data-v="2"'+(G.transLevel===2?' data-checked="1"':'')+'>all</span>' +
                '</div>' +
            '</div>' +
            '<div class="_gear-g break-cn">' +
                '<div class="_gear-lb">new line for trans</div>' +
                '<div class="_gear-igs">' +
                    '<span data-cmd="breakCN" data-v="1"'+(G.breakCN===1?' data-checked="1"':'')+'>yes</span>' +
                    '<span data-cmd="breakCN" data-v="0"'+(G.breakCN===0?' data-checked="1"':'')+'>no</span>' +
                '</div>' +
            '</div>' +
            '<div class="_gear-g auto-tabs">' +
                '<div class="_gear-lb">auto hide tabs</div>' +
                '<div class="_gear-igs">' +
                    '<span data-cmd="autoHideTabs" data-v="1"'+(G.autoHideTabs===1?' data-checked="1"':'')+'>yes</span>' +
                    '<span data-cmd="autoHideTabs" data-v="0"'+(G.autoHideTabs===0?' data-checked="1"':'')+'>no</span>' +
                '</div>' +
            '</div>' +
            (Hazuki_DEBUG.CONSOLE_ENABLED ?
            '<div class="_gear-g custom-console">' +
                '<div class="_gear-lb">show custom console</div>' +
                '<div class="_gear-igs">' +
                    '<span data-cmd="customConsole" data-v="1"'+(G.customConsole===1?' data-checked="1"':'')+'>yes</span>' +
                    '<span data-cmd="customConsole" data-v="0"'+(G.customConsole===0?' data-checked="1"':'')+'>no</span>' +
                '</div>' +
            '</div>' : '') +
            '<div class="_gear-g auto-tabs">' +
                '<div class="_gear-lb">theme & font size</div>' +
                '<div class="_gear-igs _multi">' +
                    '<div class="_gear-theme">' +
                        '<span data-cmd="theme" data-v="1"'+(G.theme===1?' data-checked="1"':'')+'></span>' +
                        '<span data-cmd="theme" data-v="2"'+(G.theme===2?' data-checked="2"':'')+'></span>' +
                        '<span data-cmd="theme" data-v="3"'+(G.theme===3?' data-checked="3"':'')+'></span>' +
                    '</div>' +
                    '<div class="_gear-font">' +
                        '<span data-cmd="fontSize" data-v="1"'+(G.fontSize===1?' data-checked="1"':'')+'></span>' +
                        '<span data-cmd="fontSize" data-v="2"'+(G.fontSize===2?' data-checked="2"':'')+'></span>' +
                        '<span data-cmd="fontSize" data-v="3"'+(G.fontSize===3?' data-checked="3"':'')+'></span>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>';

    o9.insertBefore(menu, o9.firstChild);

    menu.onclick = function(e) {
        var t = e.target, cmd, v;

        cmd = t.getAttribute ? t.getAttribute('data-cmd') : null, v;

        while (t && !cmd) {
            t = t.parentNode;
            cmd = t && t.getAttribute ? t.getAttribute('data-cmd') : null;
        }

        if (!cmd) return false;

        if ('pron' === cmd) {
            if (t.getAttribute('data-pron')) { t.removeAttribute('data-pron'); _setGear('pron', 1) }
            else { t.setAttribute('data-pron', 2); _setGear('pron', 2) }
            return false;
        }

        v = parseInt(t.getAttribute('data-v'));
        e.stopPropagation();

        if (_getGear(cmd) === v) return false;
        _setGear(cmd, v);
        var spans = t.parentNode.querySelectorAll('span'), i = 0, l = spans.length, span;
        for (; i < l; i++) {
            span = spans[i];
            if (span.getAttribute('data-v') == ''+v) span.setAttribute('data-checked', 1);
            else span.removeAttribute('data-checked');
        }
    }

    menu = null;
    return false;
}

/// pos tabs
function pos_tabs() {
    var i, entries = document.getElementsByClassName('OALD9_online'), l = entries.length;
    if (!l) return;

    // infos marker
    var tabStocks = document.getElementsByClassName('OALD9_tab');
    var _pend_tab = _OALD9_APPEND_TABS && l <= _OALD9_MAX_TABS && tabStocks.length && l > 1; // test words: `in`,`camping`,`driving`,`could`,`issue`,`last`
    var entry, tabs, btn, lb;
    if (l > 1 && tabStocks.length) for (i = 0; i < l; i++) {
        entry = entries[i];
        tabs = entry.getElementsByClassName('OALD9_tab');
        if (!tabs.length && _pend_tab) {
            // if (!_pend_tab) continue;
            var ntab = document.createElement('div'),
                nb = document.createElement('button'),
                np = document.createElement('span'),
                pos = entry.querySelector('.webtop-g .pos'),
                oxford = entry.querySelector('.webtop-g .oxford3000'),
                aca = entry.querySelector('.webtop-g .academic');
            ntab.className = 'OALD9_tab _append';
            ntab.setAttribute('onclick', 'scroll_to_entry(this);');
            if (oxford) { oxford = document.createElement('a'); oxford.className='oxford3000'; oxford.setAttribute('href','entry://@oxford3000'); nb.appendChild(oxford) }
            if (aca) { aca = document.createElement('a'); aca.className='academic'; aca.setAttribute('href','entry://@academic'); nb.appendChild(aca) }
            np.className = 'pos';
            np.innerText = pos ? pos.innerText : '●';
            // nb.style = "background-color:#4577bf;";
            nb.appendChild(np);
            ntab.appendChild(nb);
            try { entry.insertBefore(ntab, entry.firstChild.nextSibling) } catch(e) { entry.appendChild(ntab) }
            tabs = [ntab];
        }

        if (tabs && tabs.length) {
            btn = tabs[0].getElementsByTagName('button')[0];
            lb = btn.getElementsByClassName('grade');
            if (lb && lb.length) lb[0].innerText = (i+1)+''+l;
            else {
                lb = document.createElement('i');
                lb.innerText = (i+1)+''+l;
                lb.className = 'grade';
                btn.appendChild(lb);
            }
        }

        // grade
        var num = document.createElement('div');
        num.className = '_entries_num _'+(i+1);
        num.innerHTML = '<b></b>'.repeat(i+1);
        entry.insertBefore(num, entry.children[0]);
        num.setAttribute('onclick', 'entry_walkman(this)');
    }

    // posit tabs; set multi-syntactic markers
    var j, k, ma = [];
    l = tabStocks.length;
    if (!l) return;
    for (i = 0; i < l; i++) {
        tabs = tabStocks[i].getElementsByTagName('button'), k = tabs.length;
        ma.push(k);
        // insert markers, test words: `in`,`camping`,`driving`,`could`,`issue`,`last`
        if (k > 1) {
            Array.prototype.filter.call(tabStocks[i].parentNode.querySelectorAll('.webtop-g'), function(top,idx,tops){
                if (top.className == 'webtop-g _multi_syn') return;
                var i, l = tops.length;
                var html = '', span = document.createElement('span');
                span.className = '_syns _'+l;
                for (i = 0; i < l; i++) html += i === idx ? '<b class="_"></b>' : '<b></b>';
                span.innerHTML = html;
                top.insertBefore(span, top.querySelector('.z'));
                top.className = 'webtop-g _multi_syn';
                span = null;
                // bottom paginator
                var pre = idx > 0 ? idx - 1 : l - 1;
                var nxt = idx < l - 1 ? idx + 1 : 0;
                span = document.createElement('div');
                span.className = '_multi_syn_indicator';
                span.innerHTML = '<span onclick="switch_entry_dots(this,'+pre+')"></span>'+html+'<span onclick="switch_entry_dots(this,'+nxt+')"></span>';
                var entry = top.parentNode;
                while (entry && !entry.classList.contains('OALD9_entry')) entry = entry.parentNode;
                if (entry && entry.classList.contains('OALD9_entry')) entry.insertBefore(span, entry.children[0]);
            });
        }
    }
    var na, s;
    for (i = 0; i < l-1; i++) {
        na = ma.slice(i+1);
        s = 0;
        for (j = 0; j < na.length; j++) s += na[j];
        tabStocks[i].style = 'margin-bottom:'+(40*s + (l-i-1)*6)+'px';
    }
}

// post-processing functions
function modifyElements() {
    /// click head word to toggle trans
    (function () {
        var i = 0, es = document.querySelectorAll('.webtop-g > .h'), l = es.length;
        for (; i < l; i++) es[i].setAttribute('onclick', 'toggle_chn("word")')
    })();

    /// modify internal labels
    (function () {
        var i, l, c, t, xr, xrs = document.getElementsByClassName('xr-gs');
        if (!xrs || !xrs.length) return;

        for (i = 0, l = xrs.length; i < l; i++) {
            xr = xrs[i];
            if (xr.getAttribute('xref_type') !== 'internal') continue;
            c = xr.children[0];
            if (!c || !c.classList.contains('prefix')) continue;
            t = c.innerText.toLowerCase();
            switch (t) {
                case 'synonym': t = 'syn'; xr.className = 'xr-gs syn'; break;
                case 'see related entries:': t = 'related'; xr.className = 'xr-gs related'; break;
                case 'see idioms in': t = 'idioms in'; xr.className = 'xr-gs isioms-in'; break;
                case 'opposite': t = 'opp'; xr.className = 'xr-gs opp'; break; // `load`
                case 'see also': t = 'also'; xr.className = 'xr-gs also'; break;
                case 'language bank at': t = 'lang bank'; xr.className = 'xr-gs bank'; break; // `essential`
                case 'past tense, past participle of': t = 'pst, pp'; xr.className = 'xr-gs ppp'; break; // `fried`
                case 'express yourself at': t = 'express u'; xr.className = 'xr-gs express'; break; // `ask`
                case 'compare': xr.className = 'xr-gs compare'; break;
                case 'note at': xr.className = 'xr-gs note'; break; // `need`
                case '=': xr.className = 'xr-gs equal'; break;
            }
            if (t.substr(0, 8) == 'related ') { // `give away`
                // c.innerText = '∞' + t.substr(7);
                xr.className = 'xr-gs related related-2';
            } else c.innerText = t;
        }
    })();

    Array.prototype.filter.call(document.querySelectorAll('.x-g .cf, .sn-g .cf, .sn-g>.use, .sn-g>.v-gs, .top-g>.use, .idm'), function (e) {
        e.innerHTML = e.innerHTML
            .replace(/something/g, 'sth.')
            .replace(/somebody/g, 'sb.')
            .replace('not usually used in', 'n.uu.')
            .replace('not used in', 'n.u.')
            .replace('only used in', 'o.u.')
            .replace('usually used in', 'u.u.') // `face`: .use, 'usually used in negative sentences and questions'
            .replace('used in', 'u.')
            .replace('not usually used with', 'n.uu+')
            .replace('not used with', 'n.u+')
            .replace('only used with', 'o.u+')
            .replace('usually used with', 'u.u+')
            .replace('usually in ', 'usl. ')
            .replace('usually with ', 'usl+ ')
            .replace('used with ', 'u+ ')
            .replace('used after ', 'aft. ') // `come`
            .replace('often in ', 'ofn.') // `skin`
            .replace('especially', 'esp.')
            .replace('the perfect tenses', '<i>pft.</i>') // `be`: .use, 'only used in the perfect tenses'
            .replace('the passive', '<i>psv.</i>') // `take`: .use, 'or in the passive'
            .replace('the progressive tenses', '<i>pst.</i>') // `have`: .use, 'not used in the progressive tenses'
            .replace('past participle', '<i>p.p.</i>')
            .replace('past simple', '<i>p.</i>')
            .replace('prespart', '<i>-ing.</i>')
            .replace('negative sentences', '<i>neg.</i>')
            .replace('<span class="wrap">(</span>', '<span class="wrap">⟨</span>') // .sn-g>.use, .sn-g>.v-gs, , .top-g>.use
            .replace('<span class="wrap">)</span>', '<span class="wrap">⟩</span>')
    });

    /// modify unbox header title
    Array.prototype.filter.call(document.querySelectorAll('.heading'), function (e) {
        var s = e.innerHTML.replace(/<.*\/span>/g, '').trim();
        // console.log(s + ' @ ' + e.innerHTML);
        switch (s) {
            case 'Oxford Collocations Dictionary': e.innerHTML = 'Collocations'; break;
            case 'Grammar Point': e.innerHTML = 'Grammar'; break; // `can`
            case 'Which Word?': e.innerHTML = 'Which ?'; break; // `deep`
            case 'Synonyms': e.innerHTML = 'Synonyms'; break; // `drive`
            case 'AWL Collocations': e.innerHTML = 'Collocations <i class="o8">⟨AWL⟩</i>'; break; // NOT FOUND
            case 'Collocations': e.innerHTML = e.innerHTML.indexOf('O8E') >= 0 ? 'Collocations <i class="o8">⟨ℰ8⟩</i>' : 'Collocations'; break; // `home`,`pension`,`driving`
            case 'Language Bank': e.innerHTML = 'Lang Bank'; break; // `possible`
            case 'Vocabulary Building': e.innerHTML = 'Vocabulary'; break; // `make`,`face`
            case 'More About': e.innerHTML = 'About +'; break; // `waiter`
            case 'More Like This': e.innerHTML = 'Like This +'; break; // `face`
            case 'Extra examples': e.innerHTML = 'Examples'; break;
            case 'Express Yourself': e.innerHTML = 'Express U'; break; // `possible`
            case 'Word Origin': e.innerHTML = 'Origin'; break;
            case 'Word Family': e.innerHTML = 'Family'; break; // `deep`
            case 'British/​American': e.innerHTML = e.innerHTML.indexOf('O8E') >= 0 ? 'BrE/AmE <i class="o8">⟨ℰ8⟩</i>' : 'BrE/AmE'; break; // `have`,`rent`
        }

        // 'Oxford Collocations Dictionary'
        // 'Grammar Point语法说明'
        // 'Which Word?词语辨析'
        // 'Synonyms同义词辨析'
        // 'Collocations词语搭配'
        // 'Language Bank用语库'
        // 'Vocabulary Building词汇扩充'
        // 'More About补充说明'
    });

    /// hide sounding example's leader ornaments
    Array.prototype.filter.call(document.querySelectorAll('.OALECD_audio'), function (x) {
        var a = x, b;
        x = x.previousSibling; // #text
        if (!x) return;
        if (!x.tagName) x = x.previousSibling;
        if (x && x.className == 'x') {
            x.className = 'x _orn';
            b = a.cloneNode(true);
            a.parentElement.removeChild(a);
            x.insertBefore(b, x.firstChild);
        }
    });

    Array.prototype.filter.call(document.querySelectorAll('.x-g > .x'), function (e) {
        if (e.hasAttribute('bred')) return;
        e.setAttribute('bred', 1);
        var p = document.createElement('p');
        p.className = '_br';
        e.parentNode.insertBefore(p, e);
    });

    // `rent`
    Array.prototype.filter.call(document.querySelectorAll('.collapse[title="British/American"]'), function (col) {
        Array.prototype.filter.call(col.querySelectorAll('.bullet .li'), function (li) {
            var h = li.innerHTML;
            if (h.substr(-1) == '.') li.innerHTML = h.substr(0, h.length - 1)
        })
    });

    // Replace non-standard characters
    Array.prototype.filter.call(document.querySelectorAll('.collapse[title="Extra examples"] .x-g > .x'), function (e) {
        e.innerHTML = e.innerHTML
        .replace(/\u0091/g, '‘')
        .replace(/\u0092/g, '’')
        // .replace(/\u0093/g, '“')
        // .replace(/\u0094/g, '”');
    });

    // `can`#GrammarPoint .wx
    Array.prototype.filter.call(document.querySelectorAll('.x-g > .wx'), function (e) {
        e.parentNode.classList.add('_wx');
    });

    /// modify tags
    // TODO: .subj: `determiner`,`markup`
    Array.prototype.filter.call(document.querySelectorAll('.geo, .reg, .gram, .ei'), function (e) {
        if (e.className == 'reg' && e.innerHTML.indexOf('taboo') >= 0) e.classList.add('taboo'); // `jack`,`tool`
        e.innerText = e.innerText
            .replace('Australian English', 'AuE')
            .replace('North American English', 'NAmE')
            .replace('American English', 'AmE')
            .replace('US English', 'usE')
            .replace('British English', 'BrE')
            .replace('Indian English', 'IndE')
            .replace('Scottish English', 'ScoE')
            .replace('New Zealand English', 'NzE') // `swag`
            .replace('French', 'Fr.')
            .replace('especially', 'esp.')
            .replace('both', 'both') // `driving`
            .replace('formal', 'fm.')
            .replace('informal', 'infm.')
            .replace('slang', 'sl.')
            .replace('specialist', 'specl.')
            .replace('old use', 'old use')
            .replace('old-fashioned', 'old-f')
            .replace('non-standard', 'no-std')
            .replace('frequent', 'freq.') // <less frequent>
            .replace('sometimes', 'stms.') // <sometimes disapproving>
            .replace('disapproving', 'dsp.')
            .replace('figurative', 'figu.')
            .replace('approving', 'appr.')
            .replace('saying', 'sai.')
            .replace('humorous', 'humo.')
            .replace('literary', 'liter.')
            .replace('not before', 'n.b.') // `due`
            .replace('only before', 'o.b.')
            .replace('only after', 'o.f.')
            .replace('only', 'onl.')
            .replace('usually before', 'u.b.')
            .replace('usually after', 'u.f.')
            .replace('usually', 'usl.')
            .replace('often', 'ofn.')
            .replace('rather', 'rar.') // `drive`#Collocations,#Synonyms,#Culture
            .replace('passive', 'psv.')
            .replace('uncountable', 'U')
            .replace('countable', 'C')
            .replace('intransitive', 'I')
            .replace('transitive', 'T')
            .replace(/singular/g, 'sin.') // `army`
            .replace(/plural/g, 'pl.')
            .replace(' or ', ' / ');
    });
}
