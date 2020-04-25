(function(){
    // Polyfill: element.closest()
    if (window.Element && !Element.prototype.closest) {
        Element.prototype.closest =
        function(s) {
            var matches = (this.document || this.ownerDocument).querySelectorAll(s),
                i,
                el = this;
            do {
                i = matches.length;
                while (--i >= 0 && matches.item(i) !== el) {};
            } while ((i < 0) && (el = el.parentElement));
            return el;
        };
    }
    // Polyfill: CustomEvent
    (function(){
        if (typeof window.CustomEvent !== "function") return false;
        function CustomEvent ( event, params ) {
        params = params || { bubbles: false, cancelable: false, detail: null };
        var evt = document.createEvent( 'CustomEvent' );
        evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
        return evt;
        }
        window.CustomEvent = CustomEvent;
    });

    window.Vermin = {
        config: {
            enableHoneypot: true,
            enableTimer: true,
            enableActionSwitch: true,
            actionSwitchAttr: 'data-action',
            honeypotName: 'favorite_address',
            timerDelay: 2000,
            onDeny: null
        },
        initialTimestamp: Date.now(),
        init: function(config) {
            if (typeof config == 'object') {
                // Validate and apply the user's configuration
                for (key in config) {
                    if (typeof Vermin.config[key] == 'undefined') {
                        Vermin.console('warn', "Unknown configuration key: '%s'. This configuration has been ignored.", [key]);
                        continue;
                    }

                    var invalidTypeTemplate = "Invalid configuration for key '%s': a %s is expected. This configuration has been ignored.";

                    switch (key) {
                        case 'enableHoneypot':
                        case 'enableTimer':
                        case 'enableActionSwitch':
                            if (!!config[key] != config[key]) {
                                Vermin.console('warn', invalidTypeTemplate, [key, 'boolean']);
                                continue;
                            }
                            break;

                        case 'actionSwitchAttr':
                        case 'honeypotName':
                            if (typeof config[key] != 'string') {
                                Vermin.console('warn', invalidTypeTemplate, [key, 'string']);
                                continue;
                            }
                            break;

                        case 'timerDelay':
                            if (typeof config[key] != 'number') {
                                Vermin.console('warn', invalidTypeTemplate, [key, 'number']);
                                continue;
                            }
                            break;

                        case 'onDeny':
                            if (typeof config[key] != 'function') {
                                Vermin.console('warn', invalidTypeTemplate, [key, 'function']);
                                continue;
                            }
                            break;
                    }
                }

                Vermin.config[key] = config[key];
            }

            Vermin.apply();
        },
        apply: function() {
            var forms = document.querySelectorAll('form:not([vermin])');
            var index;
            for (index = 0; index < forms.length; index++) {
                forms[index].setAttribute('vermin', 'on');
                forms[index].addEventListener('submit', Vermin.screen);
                forms[index].addEventListener('focus', Vermin.actionSwitchListener, true);
                Vermin.insertHoneypot(forms[index]);
            }
        },
        actionSwitchListener: function(e) {
            if (!Vermin.config.enableActionSwitch) {
                return;
            }

            if (['input', 'textarea', 'select'].indexOf(e.target.tagName.toLowerCase()) != -1) {
                var form = e.target.closest('form');
                form.setAttribute('action', form.getAttribute(Vermin.config.actionSwitchAttr));
                form.removeEventListener('focus', Vermin.actionSwitchListener);
            }
        },
        insertHoneypot: function(form) {
            var honeypotField = Vermin.buildNode(Vermin.sprintf('<div class="vermin-verification-field" style="position: fixed; top: -100%; left: -100%; width: 0; height: 0; padding: 0; margin: 0; opacity: 0; visibility: hidden; pointer-events: none;"><label>%s</label><input type="text" name="%s" autocomplete="new-password"></div>"', [Vermin.config.honeypotName, Vermin.config.honeypotName]));
            form.appendChild(honeypotField);
        },
        screen: function(e) {
            if (Vermin.config.enableTimer && (Date.now() - Vermin.initialTimestamp) < Vermin.config.timerDelay) {
                return Vermin.deny(e, 'timer');
            }

            if (Vermin.config.enableActionSwitch && e.target.getAttribute('action') != e.target.getAttribute(Vermin.config.actionSwitchAttr)) {
                return Vermin.deny(e, 'actionSwitch');
            }

            if (Vermin.config.enableHoneypot && e.target.querySelector(Vermin.sprintf('input[name="%s"]', [Vermin.config.honeypotName])).value.length) {
                return Vermin.deny(e, 'honeypot');
            } else {
                // If the honeypot validation has been passed once, it'll be passed again. Remove the field to prevent useless data in the form submission payload
                var honeypotField = e.target.querySelector(Vermin.sprintf('input[name="%s"]', [Vermin.config.honeypotName]));
                honeypotField.parentNode.removeChild(honeypotField);
            }

            e.target.dispatchEvent(new CustomEvent('vermin-success'));
        },
        deny: function(e, reason) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();

            var messages = {
                timer: 'Please wait a few seconds and submit the form again.',
                actionSwitch: 'Please click on one of the form\'s input and submit the form again.',
                honeypot: Vermin.sprintf('Please empty the honeypot field (%s) and submit the form again.', [Vermin.config.honeypotName])
            };
            var defaultMessage = messages[reason];

            if (Vermin.config.onDeny) {
                Vermin.config.onDeny(e, reason, defaultMessage);
            } else {
                var errorNotice = Vermin.buildNode(Vermin.sprintf('<div class="vermin-error-message" style="position: fixed; top: 0; left: 0; right: 0; width: 600px; max-width: 90%; padding: 12px 16px; margin: 30px auto; font-size: 14px; font-weight: 600; color: white; background-color: #e23a36; border-radius: 3px; box-shadow: 0 7px 10px rgba(0, 0, 0, .1); cursor: pointer; -webkit-font-smoothing: antialiased;">%s</div>', [defaultMessage]));
                document.body.appendChild(errorNotice);
                errorNotice.addEventListener('click', function(){
                    errorNotice.parentNode.removeChild(errorNotice);
                });
                setTimeout(function(){
                    if (errorNotice && errorNotice.parentNode) {
                        errorNotice.parentNode.removeChild(errorNotice);
                    }
                }, 7500);
            }
        },
        sprintf: function(template, parameters) {
            var message = template;
            parameters = typeof parameters != 'object' ? [] : parameters;

            for (index in parameters) {
                message = message.replace('%s', parameters[index]);
            }

            return message;
        },
        buildNode: function(html) {
            var tmpNode = document.createElement('div');
            tmpNode.innerHTML = html;
            return tmpNode.firstChild;
        },
        console: function(type, template, parameters) {
            console[type]("[Vermin.js] " + Vermin.sprintf(template, parameters) + ' For more information, please refer to the documentation: https://github.com/EmilePerron/vermin.js');
        }
    };

    Vermin.init();
})();
