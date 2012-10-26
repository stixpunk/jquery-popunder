/*!
 * jquery-popunder
 *
 * @fileoverview jquery-popunder plugin
 *
 * @author Hans-Peter Buniat <hpbuniat@googlemail.com>
 * @copyright 2012 Hans-Peter Buniat <hpbuniat@googlemail.com>
 * @license http://www.opensource.org/licenses/bsd-license.php BSD License
 *
 * @requires jQuery
 */

/*global jQuery, self, window, screen, opener, top */
(function($, self, window, screen) {
    "use strict";

    /**
     * Create a popunder
     *
     * @param  {Array} aPopunder The popunder(s) to open
     * @param  {string|object} form A form, where the submit is used to open the popunder
     * @param  {string|object} trigger A button, where the mousedown & click is used to open the popunder
     *
     * @return jQuery
     */
    $.popunder = function(aPopunder, form, trigger) {
        var h = $.popunder.helper;
        if (trigger || form) {
            h.bindEvents(aPopunder, form, trigger);
        }
        else {
            if (aPopunder.length) {
                var p = aPopunder.shift();
                h.open(p[0], p[1] || {});
            }
            else {
                h.moveToBackground();
            }
        }

        return $;
    };

    /* several helper functions */
    $.popunder.helper = {
        _top: self,
        lastWindow: null,
        timeouts: [],
        messageName: 'popunder',
        counter: 0,

        /**
         * Create a popunder
         *
         * @param  {Array} aPopunder The popunder(s) to open
         * @param  {string|object} form A form, where the submit is used to open the popunder
         * @param  {string|object} trigger A button, where the mousedown & click is used to open the popunder
         *
         * @return void
         */
        bindEvents: function(aPopunder, form, trigger) {
            var a = function(e) {
                $.popunder(aPopunder);
                $.popunder(aPopunder);
                return true;
            };

            if (form) {
                form = (typeof form === 'string') ? $(form) : form;
                form.on('submit', $.proxy(a, this));
            }

            if (trigger) {
                trigger = (typeof trigger === 'string') ? $(trigger) : trigger;
                trigger.on('click mousedown', $.proxy(a, this));
            }
        },

        /**
         * Helper to create a (optionally) random value with prefix
         *
         * @param  {string} sUrl The url to open
         * @param  {object} options Options for the Popunder
         *
         * @return boolean
         */
        cookieCheck: function(sUrl, options) {
            var name = this.rand(options.cookie, false),
                cookie = $.cookies.get(name),
                ret = false;

            if (!cookie) {
                cookie = sUrl;
            }
            else if (cookie.indexOf(sUrl) === -1) {
                cookie += sUrl;
            }
            else {
                ret = true;
            }

            $.cookies.set(name, cookie, {
                expiresAt: new Date((new Date()).getTime() + options.blocktime * 3600000)
            });

            return ret;
        },

        /**
         * Helper to create a (optionally) random value with prefix
         *
         * @param  {string} name
         * @param  {boolean} rand
         *
         * @return string
         */
        rand: function(name, rand) {
            var p = (name) ? name : 'pu_';
            return p + (rand === false ? '' : Math.floor(89999999*Math.random()+10000000));
        },

        /**
         * Open the popunder
         *
         * @param  {string} sUrl The URL to open
         * @param  {object} options Options for the Popunder
         *
         * @return boolean
         */
        open: function(sUrl, options) {
            if (top !== self) {
                try {
                    if (top.document.location.toString()) {
                        this._top = top;
                    }
                } catch (err) {}
            }

            options.disableOpera = options.disableOpera || true;
            if (options.disableOpera === true && $.browser.opera === true) {
                return false;
            }

            options.blocktime = options.blocktime || false;
            options.cookie = options.cookie || 'puCookie';
            if (options.blocktime && (typeof $.cookies === 'object') && this.cookieCheck(sUrl, options)) {
                return false;
            }

            /* create pop-up */
            this.lastWindow = this._top.window.open(sUrl, this.rand(options.cookie, true), this.getOptions(options)) || this.lastWindow;
            this.counter++;
            this.moveToBackground();

            return true;
        },

        /**
         * Move a popup to the background
         */
        moveToBackground: function() {
            var t = this;
            if (t.lastWindow) {
                t.lastWindow.blur();
                t._top.window.blur();
                t._top.window.focus();
                if ($.browser.msie === true) {

                    /* classic popunder, used for ie */
                    window.focus();
                    try {
                        opener.window.focus();
                    }
                    catch (err) {}
                }
                else {

                    /* popunder for e.g. ff, chrome */
                    t.lastWindow.init = function(e) {
                        t.backgroundHack(e);
                        try {
                            e.opener.window.focus();
                        }
                        catch (err) {}
                    };

                    t.lastWindow.init(t.lastWindow);
                }
            }
        },

        backgroundHack: function(e) {
            /* in ff4+, chrome21+ we need to trigger a window.open loose the focus on the popup. Afterwards we can re-focus the parent-window */
            if (typeof e.window.mozPaintCount !== 'undefined' || typeof e.navigator.webkitGetUserMedia === "function") {
                try {
                    e.window.open('about:blank').close();
                }
                catch (err) {}
            }
        },

        /**
         * Get the option-string for the popup
         *
         * @param  {object} options
         *
         * @return {String}
         */
        getOptions: function(options) {
            return 'toolbar=' + options.toolbar || ((!$.browser.webkit && (!$.browser.mozilla || parseInt($.browser.version, 10) < 12)) ? '1' : '0') +
                ',scrollbars=' + options.scrollbars || '1' +
                ',location=' + options.location || '1' +
                ',statusbar=' + options.statusbar || '1' +
                ',menubar=' + options.menubar || '0' +
                ',resizable=' + options.resizable || '1' +
                ',width=' + options.width || (screen.availWidth - 122).toString() +
                ',height=' + options.height || (screen.availHeight - 122).toString() +
                ',screenX=' + options.screenX || '0' +
                ',screenY=' + options.screenY || '0' +
                ',left=' +  options.left || '0' +
                ',top=' + options.top || '0';
        },

        /**
         * Trigger a function to be executed non-blocking
         *
         * @param {function} fn
         */
        timeout: function(fn) {
            if ($.browser.msie) {
                fn();
            }
            else if (typeof window.postMessage !== 'undefined') {
                this.timeouts.push(fn);
                window.postMessage(this.messageName, "*");
            }
            else {
                setTimeout(fn, 0);
            }
        },

        /**
         * Handle messages from postMessage
         *
         * @param {Event} e
         */
        handleMessage: function(e) {
            var h = $.popunder.helper;
            if (e.source === window && e.data === h.messageName) {
                e.stopPropagation();
                if (h.timeouts.length > 0) {
                    var fn = $.proxy(h.timeouts.shift(), h);
                    fn();
                }
            }
        }
    };

    if (typeof window.addEventListener === 'function') {
        window.addEventListener("message", $.popunder.helper.handleMessage, true);
    }

})(jQuery, self, window, screen);
