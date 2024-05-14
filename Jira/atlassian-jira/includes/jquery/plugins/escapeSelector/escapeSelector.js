/**
 * Escape CSS selector
 * Technically - a backport of jQuery 3.0 escapeSelector
 */
define('jira/jquery/plugins/escapeSelector', ['jquery'], function ($) {
    if (!$.escapeSelector) {
        $.escapeSelector = CSS.escape;
    }

    return $.escapeSelector;
});

// make it available
(function () {
    require('jira/jquery/plugins/escapeSelector');
})();