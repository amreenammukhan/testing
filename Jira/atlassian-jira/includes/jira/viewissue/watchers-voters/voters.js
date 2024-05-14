define('jira/viewissue/watchers-voters/voters', ['require'], function (require) {
    'use strict';

    var VotersUsersCollection = require('jira/viewissue/watchers-voters/entities/voters-user-collection');
    var VotersView = require('jira/viewissue/watchers-voters/views/voters-view');
    var Issue = require('jira/issue');
    var InlineLayer = require('jira/ajs/layer/inline-layer');
    var inlineDialog = require('aui/inline-dialog');
    var keyCodes = require('jira/util/key-code');
    var $ = require('jquery');

    // Wire up inline dialog to our Backbone view
    var dialog = inlineDialog("#view-voter-list", "voters", function (contents, trigger, doShowPopup) {
        var loadingIcon = $('#vote-toggle').next('.icon');
        var collection = new VotersUsersCollection(Issue.getIssueKey());
        contents.parent(".aui-inline-dialog").attr({
            'aria-labelledby': 'voters-modal-label',
            'aria-modal': false,
            'role': 'dialog'
        });
        loadingIcon.addClass("loading");
        new VotersView({
            collection: collection
        }).render().done(function (viewHtml) {
            contents.html(viewHtml);
            contents.find(".cancel").click(function (e) {
                dialog.hide();
                trigger.focus();
                e.preventDefault();
            });
            loadingIcon.removeClass('loading');
            doShowPopup();
            setTimeout(function () {
                var focusable = contents.find(':focusable');
                focusable.focus();

                contents.on('keydown', function (e) {
                    if (e.key === 'Tab') {
                        if (e.shiftKey && document.activeElement === focusable[0] || document.activeElement === focusable[focusable.length - 1]) {
                            e.preventDefault();
                            return false;
                        }
                    }

                    if (e.key === 'Escape') {
                        e.preventDefault();
                        trigger.focus();
                        dialog.hide();
                        return false;
                    }
                });
            }, 100);
        });

        collection.on("errorOccurred", function () {
            dialog.hide();
            $("#view-voter-list").focus();
        });
    }, {
        width: 240,
        useLiveEvents: true,
        items: "#view-voters-list",
        preHideCallback: function preHideCallback() {
            return !InlineLayer.current; // Don't close if we have inline layer shown
        }
    });

    $(document).bind("keydown", function (e) {
        // special case for when user hover is open at same time
        if (e.keyCode === keyCodes.ESCAPE && inlineDialog.current !== dialog && dialog.is(":visible")) {
            if (inlineDialog.current) {
                inlineDialog.current.hide();
            }
            dialog.hide();
            $("#view-voter-list").focus();
        }
    });

    // Clicking any whitespace outside of the dialog should dismiss the dialog
    $(document).click(function (e) {
        var currentDialog = inlineDialog.current;
        if (currentDialog && currentDialog.id === "voters") {
            if (!$(e.target).closest("#inline-dialog-voters").length) {
                // I am not a child of the inline dialog
                currentDialog.hide();
                $("#view-voter-list").focus();
            }
        }
    });
});