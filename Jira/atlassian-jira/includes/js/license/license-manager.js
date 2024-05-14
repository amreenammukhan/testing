/**
 * @deprecated since 9.13 as it always returns true for isDC and there's nothing else in this module
 */
define('jira/license/license-manager', ['exports'], function (exports) {
    'use strict';

    var licenses = {};
    Object.defineProperty(licenses, 'isDcLicense', {
        value: true
    });

    /**
     * @returns true always true since 9.13
     */
    exports.isDcLicense = function () {
        return licenses['isDcLicense'];
    };
});