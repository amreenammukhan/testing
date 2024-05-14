var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

define('jira/ajs/select/dropdown-select', ['jira/ajs/layer/layer-constants', 'jira/ajs/control', 'jira/ajs/select/select-model', 'jira/ajs/layer/inline-layer-factory', 'jira/ajs/list/list', 'jquery', 'jira/util/events', 'jira/ajs/layer/inline-layer'], function (LayerConstants, Control, SelectModel, InlineLayerFactory, List, jQuery, Events, InlineLayer) {
    'use strict';
    /**
     * This dropdown binds to first <a> before "options" element (<select>).
     * By clicking on mentioned <a> you expand list of options under it.
     * Hides original <select> element and creates <div> container as view.
     * <div> is used to display list of options and has id={idPrefix}-suggestions
     * where {idPrefix} is id of <select> element.
     *
     * @class DropdownSelect
     * @extends Control
     */

    return Control.extend({

        /**
         *
         * @param options - <select> element
         */
        init: function init(options) {
            var inlineLayerOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};


            var instance = this;

            this.model = new SelectModel(options);

            this.model.$element.hide();

            this._createFurniture();

            instance._createFocusHandler = instance._createFocusHandler.bind(this);

            this.listController = new List({
                listId: this.model.$element.attr("id") + '-suggestions-list',
                containerSelector: jQuery(".aui-list", this.$container),
                groupSelector: "ul.opt-group",
                itemSelector: "li:not(.no-suggestions)",
                rootRole: this.model.$element.data("root-role"),
                selectionHandler: function selectionHandler(e) {
                    instance._selectionHandler(this.getFocused(), e);
                    return false;
                },
                stallEventBind: true,
                suggestionRole: this.model.$element.data("suggestion-role"),
                suggestionsListRole: this.model.$element.data("suggestions-list-role")
            });

            this.dropdownController = InlineLayerFactory.createInlineLayers(Object.assign({
                alignment: LayerConstants.LEFT,
                width: 200,
                hideOnScroll: ".issue-container",
                content: jQuery(".aui-list", this.$container)
            }, inlineLayerOptions));

            this.dropdownController.layer().addClass("select-menu");

            this._assignEventsToFurniture();

            Events.bind(InlineLayer.EVENTS.beforeHide, function () {
                instance.shown = false;
                instance.$trigger.attr('aria-expanded', instance.shown);
                jQuery(document).unbind("keydown", instance._createFocusHandler);
            });
        },

        _createFocusHandler: function _createFocusHandler(e) {
            if (e.keyCode === 27) {
                e.preventDefault();
                e.stopPropagation();

                this.dropdownController.hide();
                this.$trigger.focus();

                return;
            }
            if (e.key === "Tab") {
                this.listController._handleSectionByKeyboard(e);
            }
        },

        show: function show() {
            var instance = this;
            this.listController.generateListFromJSON(this.model.getAllDescriptors());
            this.dropdownController.show();
            this.dropdownController.setPosition();
            this.shown = true;
            this.listController.enable();

            setTimeout(function () {

                jQuery(document).bind("keydown", instance._createFocusHandler);
                instance.$trigger.attr('aria-expanded', instance.shown);
            }, 0);

            this.listController.on("itemFocus", function (_ref) {
                var _ref2 = _slicedToArray(_ref, 1),
                    element = _ref2[0];

                instance.$trigger.attr({
                    'aria-activedescendant': element.find('a').attr('id')
                });
            });
        },

        _assignEventsToFurniture: function _assignEventsToFurniture() {
            this._assignEvents("trigger", this.$trigger);
        },

        _createFurniture: function _createFurniture() {
            var id = this.model.$element.attr("id");

            this.$container = this._render("container", id);
            this.$trigger = this.model.$element.prev("a").appendTo(this.$container);
            this.$container.append(this._render("suggestionsContainer", id));
            this.$container.insertBefore(this.model.$element);
        },

        _renders: {
            container: function container(idPrefix) {
                return jQuery('<div class="select-menu" />').attr("id", idPrefix + '-multi-select');
            },
            suggestionsContainer: function suggestionsContainer(idPrefix) {
                return jQuery('<div class="aui-list aui-list-checked" tabindex="-1" />').attr('id', idPrefix + '-suggestions');
            }
        },

        _selectionHandler: function _selectionHandler(selected) {
            var instance = this;
            var intCount = 0;

            this.model.setSelected(selected.data("descriptor"));

            this.dropdownController.content().find(".aui-checked").removeClass(".aui-checked");

            selected.addClass(".aui-checked");

            var myInterval = window.setInterval(function () {
                intCount++;
                selected.toggleClass(".aui-checking");
                if (intCount > 2) {
                    clearInterval(myInterval);
                    instance.dropdownController.hide();
                }
            }, 80);

            instance.$trigger.focus();
        },
        shown: false,
        _events: {
            trigger: {
                'aui:keydown': function auiKeydown(e) {
                    if (e.key === "Spacebar" && !this.shown) {
                        e.preventDefault();
                        e.stopPropagation();

                        this.show();
                    }
                },
                click: function click(e) {
                    e.preventDefault();
                    e.stopPropagation();

                    if (!this.shown) {
                        this.show();
                    } else {
                        this.dropdownController.hide();
                    }
                }
            }
        }
    });
});

/** Preserve legacy namespace
    @deprecated AJS.SelectMenu*/
AJS.namespace("AJS.SelectMenu", null, require('jira/ajs/select/dropdown-select'));
AJS.namespace("AJS.DropdownSelect", null, require('jira/ajs/select/dropdown-select'));