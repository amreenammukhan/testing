AJS.test.require(["jira.webresources:jira-global"], function () {
    'use strict';

    var $ = require("jquery");
    var Dialogs = require("jira/dialog/dialog-register");

    module("initDialog", {
        setup: function setup() {
            this.server = sinon.fakeServer.create();

            this.server.respondWith("GET", /.*WorkflowUIDispatcher.*/, [200, { "Content-Type": "text/html" }, "-"]);
        },

        teardown: function teardown() {
            if (this.dialog) {
                this.dialog.hide();
            }

            this.server.restore();
        },

        testTransitionLink: function testTransitionLink(linkHtml, elementToClickId, actionId) {
            $(linkHtml).appendTo($("#qunit-fixture"));

            $("#" + elementToClickId).click();

            this.server.respond();

            this.dialog = Dialogs["workflow-transition-" + actionId + "-dialog"];

            ok(this.dialog, "Transition dialog shown");
            equal(this.dialog.$activeTrigger.attr("id"), "action_id_" + actionId, "Link is the $activeTrigger of the transition dialog");
        },

        testDialogInstancePersistence: function testDialogInstancePersistence(linkHtml, linkHtml2, actionId, firstDialogButtonId, secondDialogButtonId) {
            var dialogId = "workflow-transition-" + actionId + "-dialog";

            // open & close dialog 1
            $(linkHtml).appendTo($("#qunit-fixture"));
            $("#" + firstDialogButtonId).click();
            this.server.respond();

            var dialog1 = Dialogs[dialogId];
            ok($("#" + dialogId)[0], "Dialog1 appended to DOM");
            dialog1.hide();
            ok(!$("#" + dialogId)[0], "Dialog1 removed from DOM");
            equal(dialog1.options.isIssueDialog, true);
            equal(dialog1.options.refreshOnSubmit, true);

            // open & close dialog 2
            $(linkHtml2).appendTo($("#qunit-fixture"));
            $("#" + secondDialogButtonId).click();
            this.server.respond();

            var dialog2 = Dialogs[dialogId];
            ok($("#" + dialogId)[0], "Dialog2 appended to DOM");
            dialog2.hide();
            ok(!$("#" + dialogId)[0], "Dialog2 removed from DOM");
            equal(dialog2.options.isIssueDialog, false);
            equal(dialog2.options.refreshOnSubmit, false);

            notEqual(dialog1, dialog2);
        }
    });

    var newLinkHtml = function newLinkHtml(anchorTagId, actionId, children, otherAttributes) {
        return "<a id='" + anchorTagId + "' class='issueaction-workflow-transition' href='/secure/WorkflowUIDispatcher.jspa?id=" + actionId + "&action=" + actionId + "' " + otherAttributes + ">" + children + "</a>";
    };

    test("Workflow transition link handler called when clicked on a transition link", function () {
        var actionId = "1";
        var anchorTagId = "action_id_1";
        var linkHtml = newLinkHtml(anchorTagId, actionId, "Test 1");

        this.testTransitionLink(linkHtml, anchorTagId, actionId);
    });

    test("Workflow transition link handler called when clicked on a span inside transition link", function () {
        var actionId = "2";
        var anchorTagId = "action_id_2";
        var childSpanId = "action_span_id_2";
        var linkHtml = newLinkHtml(anchorTagId, actionId, "<span id='" + childSpanId + "' class='trigger-label'>Test 2</span>");

        this.testTransitionLink(linkHtml, childSpanId, actionId);
    });

    test("New instance of form dialog created when same link is clicked multiple times", function () {
        var actionId = "2";

        var firstDialogButtonId = "action_id_1";
        var linkHtml1 = newLinkHtml(firstDialogButtonId, actionId, "Issue view dialog");

        var secondDialogButtonId = "action_id_2";
        var linkHtml2 = newLinkHtml(secondDialogButtonId, actionId, "Some other dialog", "is-issue-dialog='false' refresh-on-submit='false'");

        this.testDialogInstancePersistence(linkHtml1, linkHtml2, actionId, firstDialogButtonId, secondDialogButtonId);
    });
});