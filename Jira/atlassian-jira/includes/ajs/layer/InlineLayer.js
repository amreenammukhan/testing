define('jira/ajs/layer/inline-layer', ['jira/ajs/layer/layer-constants', 'jira/ajs/layer/layer-interactions', 'jira/ajs/control', 'jira/ajs/layer/hide-reasons', 'jira/ajs/layer/inline-layer/options-descriptor', 'jira/ajs/contentretriever/content-retriever', 'jira/util/events', 'jquery'], function (LayerConstants, interactions, Control, LayerHideReason, OptionsDescriptor, ContentRetriever, Event, jQuery) {
    'use strict';

    /**
     * A control that when specified element [offsetTarget] is clicked positions specified content absolutely underneath.
     *
     * @class InlineLayer
     * @extends Control
     *
     * @note Because AJS.ContentRetriever is deprecated, this class will soon be on the chopping block.
     * @see UncomplicatedInlineLayer
     * @see AJS.ProgressiveDataSet
     */

    var InlineLayer = Control.extend({

        CLASS_SIGNATURE: "AJS_InlineLayer",

        SCROLL_HIDE_EVENT: "scroll.hide-dropdown",

        /**
         * @constructs
         * @param {OptionsDescriptor | Object} options - {@see InlineLayer.OptionsDescriptor}
         */
        init: function init(options) {

            var instance = this;

            if (!(options instanceof OptionsDescriptor)) {
                this.options = new OptionsDescriptor(options);
            } else {
                this.options = options;
            }

            this.offsetTarget(this.options.offsetTarget());
            this.contentRetriever = this.options.contentRetriever();

            // poor mans mixin
            jQuery.extend(this, this.options.positioningController());

            if (!(this.contentRetriever instanceof ContentRetriever)) {
                throw new Error("InlineLayer: Failed construction, Content retriever does not implement interface " + "[AJS.ContentRetrieverInterface]");
            }
            this.contentRetriever.startingRequest(function () {
                instance._showLoading();
            });
            this.contentRetriever.finishedRequest(function () {
                instance._hideLoading();
            });

            // If contentRetriver supports callbacks for failedrequest, pass the control to
            // our onerror method
            if (this.contentRetriever.failedRequest) {
                this.contentRetriever.failedRequest(function () {
                    instance.onerror();
                });
            }
            // people may want to assign events so creating it just incase
            this.$layer = this._render("layer", this.options.alignment());
        },

        // Getters and Setters

        /**
         * Gets and sets content.
         * - If provided a function and content retriever is asynchronous, will wait for server response
         * before executing function.
         * - If provided a DOM element or jQuery element will override current content
         *
         * @param {Function | HTMLElement | jQuery} arg
         */
        content: function content(arg) {

            var instance = this;

            // and we are a function, we are going to get content and wait for it (async) if it hasn't been set yet
            if (jQuery.isFunction(arg)) {
                // once we have it
                this.contentRetriever.content(function (content) {
                    // set our content
                    instance.$content = content.removeClass("hidden");
                    // then call our callback in context of this inlineLayer instance
                    arg.call(instance);
                });
            } else {

                // if we provide no callback, then we are assuming our content retriever already has the content.
                // No callback required.
                return this.$content;
            }
        },

        /**
         * Gets/Sets offsetTarget. This is the element the layer will be positioned absolutely underneath
         *
         * @param {HTMLElement | jQuery | string} offsetTarget
         * @return {jQuery}
         */
        offsetTarget: function offsetTarget() {
            var $offsetTarget = this.options.offsetTarget();
            if (jQuery.isFunction($offsetTarget)) {
                $offsetTarget = $offsetTarget();
            }
            return $offsetTarget;
        },

        /**
         * Adds a callback when the content has been changed. If no argument has been provided will execute callbacks.
         *
         * Important! Only use if you are using this object in a composite class. Otherwise consider creating a custom event
         * instead.
         *
         * @param {Function} callback
         */
        contentChange: function contentChange(callback) {

            var instance = this;

            if (jQuery.isFunction(callback)) {

                if (!this.contentChangeCallback) {
                    this.contentChangeCallback = [];
                }

                this.contentChangeCallback.push(callback);
            } else if (!callback) {

                this.trigger("contentChanged", [this]);
                this.setWidth(this.options.width());
                this.setPosition();
                if (this.contentChangeCallback) {
                    jQuery.each(this.contentChangeCallback, function (i, callback) {
                        callback(instance);
                    });
                }
            }
        },

        /**
         * Adds a callback when dropdown is hidden. If no argument has been provided will execute callbacks.
         *
         * Important! Only use if you are using this object in a composite class. Otherwise consider creating a custom event
         * instead.
         *
         * @param {Function} callback
         */
        onhide: function onhide(callback) {

            var instance = this;

            if (jQuery.isFunction(callback)) {

                if (!this.hideCallback) {
                    this.hideCallback = [];
                }

                this.hideCallback.push(callback);
            } else if (!callback && this.hideCallback) {

                jQuery.each(this.hideCallback, function (i, callback) {
                    callback(instance);
                });
            }
        },

        /**
         * Adds a callback when content retrieving for the dropdown has failed. If no argument has been provided will
         * execute callbacks.
         *
         * @param {Function} callback
         */
        onerror: function onerror(callback) {
            var instance = this;

            if (jQuery.isFunction(callback)) {

                if (!this.errorCallback) {
                    this.errorCallback = [];
                }

                this.errorCallback.push(callback);
            } else if (!callback && this.errorCallback) {

                jQuery.each(this.errorCallback, function (i, callback) {
                    callback(instance);
                });
            }
        },

        /**
         * Gets layer element
         *
         * @return {jQuery}
         */
        layer: function layer(_layer) {
            if (_layer) {
                this.$layer = _layer;
            } else {
                return this.$layer;
            }
        },

        // Getters ONLY (readonly)

        /**
         * Gets placeholder. When the layer is visible it is appended to the body. When we hide, we put it back to its
         * original position (within this placeholder) so that when we empty a parent node it is destroyed when expected.
         */
        placeholder: function placeholder(_placeholder) {
            if (_placeholder) {
                this._throwReadOnlyError("placeholder");
            } else {
                return this.$placeholder;
            }
        },

        /**
         * Gets boolean if visible or not
         *
         * @return {Boolean}
         */
        isVisible: function isVisible(visible) {
            if (typeof visible !== "undefined") {
                this._throwReadOnlyError("visible");
            }
            return this.visible;
        },

        /**
         * Gets scrollable container. The scrollable container is a parent element of $layer/$offsetTarget that when
         * scrolled causes the InlineLayer to be hidden.
         *
         * @return {jQuery}
         */
        scrollableContainer: function scrollableContainer(_scrollableContainer) {
            if (_scrollableContainer) {
                this._throwReadOnlyError("scrollableContainer");
            }
            return this.$scrollableContainer;
        },

        /**
         * This control is lazy initialized. This flag will be true when content has been appended and layer is visible
         * for the first time.
         *
         * @return {Boolean}
         */
        isInitialized: function isInitialized(initialised) {
            if (initialised) {
                this._throwReadOnlyError("initialized");
            }
            return this.initialized;
        },

        /**
         * Hides layer and restores to original DOM position
         */
        hide: function hide(reason, e) {
            var event;
            var target = e && e.target;
            if (!this.isVisible()) {
                return false;
            }
            event = jQuery.Event(InlineLayer.EVENTS.beforeHide);
            this.trigger(event, [this.layer(), reason, this.options.id, target]);
            Event.trigger(event, [this.layer(), reason, this.options.id, target]);

            if (!event.isDefaultPrevented()) {
                this.visible = false;

                this._makeInactiveAndHideLayer();

                // we need to put it back so that it is cleared when dialog content is emptied...
                var positionController = this;

                setTimeout(function () {
                    //                // ...but not before the current "click" live event completes, otherwise IE will not fire other click handlers.
                    positionController.appendToPlaceholder();
                }, 0);

                this.layer().attr("aria-hidden", "true");
                this._unbindEvents();
                this.onhide();

                /* Legacy events */
                this.trigger("hideLayer", [this]);
                jQuery(document).trigger("hideLayer", [this.CLASS_SIGNATURE, this]);
                /* Legacy events end */

                this.trigger(InlineLayer.EVENTS.hide, [this.layer(), reason, this.options.id]);
                Event.trigger(InlineLayer.EVENTS.hide, [this.layer(), reason, this.options.id]);

                InlineLayer.current = null;
            }
        },

        _makeInactiveAndHideLayer: function _makeInactiveAndHideLayer() {
            this.layer().removeClass(LayerConstants.ACTIVE_CLASS).hide();
            this.offsetTarget().removeClass(LayerConstants.ACTIVE_CLASS);
        },

        /**
         * Refreshes content. This is usually used when you have an asynchronous content retriever such as
         * {@link AjaxContentRetriever} and you want to get the latest from the server.
         *
         * @param callback - function to be called once content is refreshed
         */
        refreshContent: function refreshContent(callback) {
            var instance = this;
            this.content(function () {
                if (this.layer().has(this.content()).length === 0) {
                    this.layer().html(this.content());
                }
                if (jQuery.isFunction(callback)) {
                    callback.call(instance);
                }
                this.contentChange();
            });
        },

        /**
         * Shows layer, retrieving content if required.
         */
        show: function show() {
            var instance = this;
            var event;

            if (this.isVisible()) {
                return;
            }

            event = jQuery.Event(InlineLayer.EVENTS.beforeShow);
            this.trigger(event, [this.layer(), this.options.id]);
            Event.trigger(event, [this.layer(), this.options.id]);

            if (!event.isDefaultPrevented()) {

                if (!this.isInitialized()) {
                    this._lazyInit(function () {
                        instance._showContent();
                    });
                } else if (this.contentRetriever.cache() === false) {
                    this.refreshContent(function () {
                        instance._showContent();
                    });
                } else {
                    instance._showContent();
                }
            }
        },

        _showContent: function _showContent() {
            // Only show if target is still visible.
            if (this.offsetTarget().is(":visible")) {
                this._show();
            } else {
                this._makeInactiveAndHideLayer();
            }
        },

        /**
         * Toggles the visibility of the layer.
         *
         * @param shouldShow {Boolean} optional. set to true or false to explicitly show or hide
         */
        toggle: function toggle(shouldShow) {
            if (shouldShow == null) {
                shouldShow = !this.isVisible();
            }
            if (shouldShow) {
                this.show();
            } else {
                this.hide(LayerHideReason.toggle);
            }
        },

        getPositioning: function getPositioning(_ref) {
            var hasSpaceOnLeft = _ref.hasSpaceOnLeft,
                hasSpaceOnRight = _ref.hasSpaceOnRight,
                offsetTargetBounds = _ref.offsetTargetBounds;

            var positioning;
            var $window = jQuery(window);

            if (this.options.alignment() === LayerConstants.RIGHT) {
                if (hasSpaceOnLeft || !hasSpaceOnRight) {
                    positioning = this.right();
                } else {
                    positioning = this.left();
                }
            } else if (this.options.alignment() === LayerConstants.LEFT) {
                if (hasSpaceOnRight || !hasSpaceOnLeft) {
                    positioning = this.left();
                } else {
                    positioning = this.right();
                }
            } else if (this.options.alignment() === LayerConstants.INTELLIGENT_GUESS) {
                if (offsetTargetBounds.left + offsetTargetBounds.width / 2 > $window.width() / 2) {
                    positioning = this.right();
                } else {
                    positioning = this.left();
                }
            }
            return positioning;
        },

        /**
         * Sets absolute position and alignment based on [offsetTarget] and defined options. If the full layer element
         * is not visible in the viewport, a slow scroll will occur to pull it into view.
         */
        setPosition: function setPosition() {
            var $window = jQuery(window);

            if (!this.isInitialized() || !this.offsetTarget() || this.offsetTarget().length === 0) {
                return;
            }

            var offsetTargetBounds = this.offsetTarget().get(0).getBoundingClientRect();
            var layerWidth = this.layer().width();
            var hasSpaceOnRight = offsetTargetBounds.left + layerWidth < $window.width() + $window.scrollLeft();
            var hasSpaceOnLeft = offsetTargetBounds.left + offsetTargetBounds.width - layerWidth > $window.scrollLeft();
            var positioning = this.getPositioning({ hasSpaceOnLeft: hasSpaceOnLeft, hasSpaceOnRight: hasSpaceOnRight, offsetTargetBounds: offsetTargetBounds });

            this.trigger("setLayerPosition", [positioning, this]);

            if (this.options.properties.setMaxHeightToWindow || this.options.properties.setMaxHeightToWindow !== false && jQuery(".aui-blanket").is(":visible")) {
                var scrollLeft = $window.scrollLeft();
                if (scrollLeft > 0) {
                    positioning.left -= scrollLeft;
                }

                var $fixedParents = this.fixedParent();
                var scrollTop;

                if ($fixedParents.size()) {
                    scrollTop = 0;
                } else {
                    scrollTop = $window.scrollTop();
                }

                positioning.maxHeight = $window.height() - positioning.top + scrollTop - this.options.cushion();
            }

            positioning.minHeight = this.options.properties.minHeight;

            this.layer().css(positioning);
        },

        setOverflowAndHeight: function setOverflowAndHeight() {
            if (this.options.properties.maxInlineResultsDisplayed) {
                this.layer().addClass("limited");
            }
        },

        fixedParent: function fixedParent() {
            return this.offsetTarget().parents().filter(function () {
                return jQuery(this).css("position") === 'fixed';
            });
        },

        /**
         *  Sets to the width specified.
         *  Adds horizontal scrollbar if specified and content is wider than specified width.
         *
         *
         * @param {Number} width
         */
        setWidth: function setWidth(width) {
            this.layer().width(width);
        },

        /**
         * Gets content, and builds necessary furniture.
         *
         * @protected
         * @param {Function} callback - called after control is ready
         */
        _lazyInit: function _lazyInit(callback) {

            if (this.initializing) {
                return;
            }

            this.initializing = true;

            this.refreshContent(function () {

                var instance = this;

                this.initializing = false;
                this.initialized = true;

                // We want to make our own wrapper and append the content to that, so we can be sure we have the correct css style
                this.layer().insertAfter(this.offsetTarget());

                if (this._supportsBoxShadow()) {
                    this.layer().addClass(LayerConstants.BOX_SHADOW_CLASS);
                }

                this.$placeholder = jQuery("<div class='ajs-layer-placeholder' />").insertAfter(this.offsetTarget());
                this.$scrollableContainer = this.offsetTarget().closest(this.options.hideOnScroll());
                this.rebuilt(function (layer) {
                    instance.layer(layer);
                });

                callback(); // show
            });
        },

        /**
         * Shows layer, appends to body and binds events
         *
         * @protected
         */
        _show: function _show() {

            if (InlineLayer.current) {
                InlineLayer.current.hide();
            }

            this.visible = true;

            this.content().show();

            this._appendTo();

            this.layer().addClass(LayerConstants.ACTIVE_CLASS);
            this.offsetTarget().addClass(LayerConstants.ACTIVE_CLASS);
            this.layer().show();
            this.layer().attr("aria-hidden", "false");

            this.setWidth(this.options.width());
            this.setPosition();
            this.setOverflowAndHeight();
            this._bindEvents();

            if (!AJS.dim.dim) {
                this.scrollTo();
            }

            InlineLayer.current = this;

            /* Legacy events */
            this.trigger("showLayer", [this]);
            jQuery(document).trigger("showLayer", [this.CLASS_SIGNATURE, this]);
            /* Legacy events END */

            this.trigger(InlineLayer.EVENTS.show, [this.layer(), this.options.id]);
            Event.trigger(InlineLayer.EVENTS.show, [this.layer(), this.options.id]);
        },

        /**
         * Removes a loading class to [offsetTarget] and [layer].
         */
        _hideLoading: function _hideLoading() {
            this.$layer.removeClass(LayerConstants.LOADING_CLASS);
            this.offsetTarget().removeClass(LayerConstants.LOADING_CLASS);
        },

        /**
         * Adds a loading class to [offsetTarget] and [layer]. Actual styling is left to CSS.
         */
        _showLoading: function _showLoading() {
            this.$layer.addClass(LayerConstants.LOADING_CLASS);
            this.offsetTarget().addClass(LayerConstants.LOADING_CLASS);
        },

        _unbindEvents: function _unbindEvents() {
            this.$scrollableContainer.unbind(this.SCROLL_HIDE_EVENT);
            this._unassignCustomEvents();
            this._unassignEvents("container", document);
            this._unassignEvents("win", window);
        },

        _bindEvents: function _bindEvents() {
            var instance = this;
            this.$scrollableContainer.one(this.SCROLL_HIDE_EVENT, function () {
                instance.hide();
            });
            this._assignCustomEvents();
            this._assignEvents("container", document);
            this._assignEvents("win", window);
        },

        /**
         * Binds of custom events, different from the events provided by AJS.Control.
         * Those events are stored under options.customEvents
         *
         * @protected
         */
        _assignCustomEvents: function _assignCustomEvents() {
            var customEvents = this.options.customEvents();

            // Do nothing if we don't have custom events
            if (!customEvents) {
                return;
            }

            // Prevent duplicate event handlers.
            this._unassignCustomEvents();

            // Loop over the custom events and create handlers for all of them
            for (var target in customEvents) {
                if (Object.prototype.hasOwnProperty.call(customEvents, target)) {
                    for (var eventType in customEvents[target]) {
                        if (Object.prototype.hasOwnProperty.call(customEvents[target], eventType)) {
                            jQuery(target).on(eventType, this._getCustomEventsDispatcher(target, eventType, customEvents));
                        }
                    }
                }
            }
        },

        /**
         * Unbinds custom events. Those events are stored under options.customEvents
         *
         * @protected
         */
        _unassignCustomEvents: function _unassignCustomEvents() {
            var customEvents = this.options.customEvents();

            // Do nothing if we don't have custom events
            if (!customEvents) {
                return;
            }

            // Loop over the custom events and unbind them
            for (var target in customEvents) {
                if (Object.prototype.hasOwnProperty.call(customEvents, target)) {
                    for (var eventType in customEvents[target]) {
                        if (Object.prototype.hasOwnProperty.call(customEvents[target], eventType)) {
                            jQuery(target).off(eventType, this._getCustomEventsDispatcher(target, eventType, customEvents));
                        }
                    }
                }
            }
        },

        /**
         * Helper method for _assignCustomEvents and _unassignCustomEvents
         *
         * It creates an event handler under _dispatchers["custom/<target>/<eventType>"] and returns it.
         * This event handler will be used by _unassignCustomEvents
         *
         * @param {string} target
         * @param {string} eventType
         * @param {object} events
         */
        _getCustomEventsDispatcher: function _getCustomEventsDispatcher(target, eventType, events) {
            var group = "custom";
            var ns = group + "/" + target + "/" + eventType;

            if (!this._dispatchers) {
                this._dispatchers = {};
            }
            if (!this._dispatchers[ns]) {
                var instance = this;
                var handler = events[target][eventType];
                this._dispatchers[ns] = function (event) {
                    return handler.call(instance, event, jQuery(this));
                };
            }
            return this._dispatchers[ns];
        },

        /**
         * Determines if the click event was valid to close InlineLayer.
         *
         * An invalid click if:
         * - is [offsetTarget]
         * - is a child of [offsetTarget]
         * - is a child of [layer]
         *
         * @param {Event} e
         * @return {Boolean}
         */
        _validateClickToClose: function _validateClickToClose(e) {

            if (e.target === this.offsetTarget()[0]) {
                return false;
            } else if (e.target === this.layer()[0]) {
                return false;
            } else if (this.offsetTarget().has(e.target).length > 0) {
                return false;
            } else if (this.layer().has(e.target).length > 0) {
                return false;
            }

            return true;
        },

        _appendTo: function _appendTo() {
            if (this.options.appendToTrigger()) {
                this.appendToTrigger();
            } else {
                this.appendToBody();
            }
        },

        "keys": {
            Esc: function Esc(e) {
                this.hide(LayerHideReason.escPressed, e);
            }
        },

        _events: {

            container: {
                "aui:keydown": function auiKeydown(event) {
                    this._handleKeyEvent(event);
                },
                click: function click(e) {
                    if (this._validateClickToClose(e)) {
                        this.hide(LayerHideReason.clickOutside, e);
                    }
                }
            },
            win: {
                resize: function resize() {
                    this.setPosition();
                },
                scroll: function scroll() {
                    this.setPosition();
                }
            }
        },

        _renders: {
            layer: function layer() {
                return jQuery("<div />").addClass("ajs-layer").addClass(this.options.styleClass());
            }
        }

    });

    InlineLayer.EVENTS = {
        beforeHide: "InlineLayer.beforeHide",
        hide: "InlineLayer.hide",
        beforeShow: "InlineLayer.beforeShow",
        show: "InlineLayer.show"
    };

    interactions.preventInputBlur(InlineLayer);
    interactions.preventDialogHide(InlineLayer);
    interactions.hideBeforeDialogShown(InlineLayer);

    return InlineLayer;
});