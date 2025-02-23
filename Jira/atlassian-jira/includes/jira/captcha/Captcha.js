define('jira/captcha', ['jquery'], function (jQuery) {
    'use strict';

    /**
     * @namespace JIRA.Captcha
     */

    var captcha = {
        setup: function setup() {
            jQuery("#captcha").delegate("a.captcha-trigger", "click keydown", function (e) {
                if (e.type === 'click' || e.type === 'keydown' && (e.key === ' ' || e.key === 'Enter')) {
                    captcha.refresh();
                    e.preventDefault();
                }
            });
        },
        refresh: function refresh() {
            var $img = jQuery(".captcha-image", "#captcha .captcha-container");
            var src = $img.attr("src");
            if (src.indexOf("__r") >= 0) {
                src = src.replace(/__r=([^&]+)/, "__r=" + Math.random());
            } else {
                src = src.indexOf('?') >= 0 ? src + "&__r=" + Math.random() : src + "?__r=" + Math.random();
            }
            $img.attr("src", src);
            jQuery("#captcha .captcha-response").focus();
        }
    };
    return captcha;
});

AJS.namespace('JIRA.Captcha', null, require('jira/captcha'));