define('jira/ajs/select/select-model', ['jira/ajs/control', 'jira/ajs/list/group-descriptor', 'jira/ajs/list/item-descriptor', 'jira/util/objects', 'jquery'], function (Control, GroupDescriptor, ItemDescriptor, Objects, jQuery) {
    'use strict';

    /**
     * Gives a JSON interface to a &lt;select&gt; list. Allowing you to add elements via JSON descriptors. It also
     * provides utility methods to retrieve collections of elements as JSON, for example selected options.
     *
     * @class SelectModel
     * @extends Control
     */

    return Control.extend({

        /**
         * Sets some defaults and parses all options, and option group into JSON. This json representation is bound
         * to its corresponding DOM element, and can be accessed using jQuery([OPTION OR OPTGROUP HERE]).data("descriptor")
         *
         * @constructs
         * @param {jQuery | Selector | HTMLElement} options - &lt;select&rt; tag for the in dom representation of model
         */
        init: function init(options) {
            var instance = this;
            var opts = {};

            if (options) {
                if (options instanceof jQuery) {
                    opts.element = options;
                } else if (options instanceof Element || typeof options === "string") {
                    opts.element = jQuery(options);
                } else {
                    opts = options;
                }
            }
            this._setOptions(opts);

            this.$element = this.options.element.hide();
            this.type = this.$element.attr("multiple") ? "multiple" : "single";
            this.id = this.$element.attr("id") || this.$element.attr("name");

            if (this.type === "single") {
                this.$element.attr("multiple", "multiple");
            }

            // provide a way for people to dynamically update/populate the <select> and have it be reflected in frother control
            this.$element.bind("reset", function () {
                instance._parseDescriptors();
            });

            // Get a json representation of our <select>
            this._parseDescriptors();
        },

        /**
         *
         * @param value
         * @returns {boolean}
         */
        hasOptionByValue: function hasOptionByValue(value) {
            return this.$element.find('option[value="' + value + '"]').length > 0;
        },

        /**
         * Returns text content of every selected option as array
         *
         * @returns {Array}
         */
        getSelectedTexts: function getSelectedTexts() {
            var selectedTexts = [];
            var selected = this.getDisplayableSelectedDescriptors();
            for (var i = 0; i < selected.length; i++) {
                selectedTexts.push(selected[i].label());
            }
            return selectedTexts;
        },

        /**
         *
         * @param {String} value
         * @param {String} [text] - text to put in if not existing option is added
         * @param {boolean} [hidden=false]
         */
        putOption: function putOption(value, text, hidden) {
            var option;
            if (this.hasOptionByValue(value)) {
                var descriptor = this.getDescriptor(value);
                if (!text) {
                    text = descriptor.label();
                }
                option = descriptor.model();
            } else {
                option = jQuery('<option/>');
                this.$element.append(option);
            }
            if (hidden) {
                option.addClass('hidden');
            }
            if (text) {
                option.text(text);
            }
            option.attr('value', value);

            this._parseOption(option);
        },

        /**
         * this will fire 'change' event even when option with value was selected earlier
         *
         * @param {String} value
         * @returns {boolean} result
         */
        changeSelectionByValue: function changeSelectionByValue(value) {
            var descriptor = this.getDescriptor(value);
            if (descriptor) {
                var changed = this.setSelected(descriptor);
                if (!changed) {
                    this.$element.trigger('change', descriptor);
                }
                return true;
            }
            return false;
        },

        /**
         * Gets value of <option> that represents the free text in <input>
         * @return {*}
         * @private
         */
        _getFreeInputEl: function _getFreeInputEl() {
            return this.$element.find(".free-input");
        },

        /**
         * Removes free input option
         */
        removeFreeInputVal: function removeFreeInputVal() {
            this._getFreeInputEl().remove();
        },

        /**
         * Updates <option> that represents the free text in <input>
         * @param {String} val
         */
        updateFreeInput: function updateFreeInput(val) {
            var $freeInput = this._getFreeInputEl();
            val = jQuery.trim(val);
            if (val) {
                if (!$freeInput.length) {
                    $freeInput = jQuery("<option class='free-input' />").appendTo(this.$element);
                }
                $freeInput.attr({
                    "value": val,
                    "selected": "selected"
                });
            } else {
                $freeInput.remove();
            }
        },

        /**
         * Gets default options
         *
         * @return {Object}
         */
        _getDefaultOptions: function _getDefaultOptions() {
            return {};
        },

        /**
         * Returns all the selected values
         *
         * @return {Array}
         */
        getSelectedValues: function getSelectedValues() {
            var selectedVals = [];
            var selected = this.getDisplayableSelectedDescriptors();
            for (var i = 0; i < selected.length; i++) {
                selectedVals.push(selected[i].value());
            }
            return selectedVals;
        },

        /**
         * Used to set selected state on option. In the case of a single select this will remove the selected property
         * from all other options.
         *
         * @param {Object} descriptor - JSON object describing option. E.g. {label: "one", value: 1}
         */
        setSelected: function setSelected(descriptor) {
            var instance = this;
            var selectedItem = false;
            var changed = false;

            var $toSelect = this.$element.find("option").not(this._getExclusions()).filter(function () {
                // need to filter rather than using jQuery expression in find as value may container special characters.
                return this.value === descriptor.value();
            });

            // In the case of a single select we want to loop over all the <option>'s and remove selection so we are in a clean state.
            // Please note that our <select> is actually a <select multiple="multiple" />.

            if (this.type === "single") {

                // No need to update here
                if (this.getValue() === descriptor.value()) {
                    return changed;
                }

                // As we are a single select we only want to select the first option, even though there may be multiple
                // <option>'s with the same value
                $toSelect = $toSelect.first();

                this.$element.find("option:selected").not(this._getExclusions()).each(function (i, option) {
                    var currDescriptor = jQuery(this).data("descriptor");
                    if ($toSelect[0] !== option) {
                        instance.setUnSelected(currDescriptor);
                    }
                });
            }

            $toSelect.each(function () {
                var $this = jQuery(this);
                selectedItem = true;
                changed = !$this.is(':selected'); // if already selected, it hasn't really changed
                $this.attr("selected", "selected").data("descriptor").selected(true);
                // MNSTR-6933: this is a workaround to fix the issue with deselecting items
                if (descriptor.properties) {
                    descriptor.properties.selected = true;
                }
            });

            // if the option doesn't exist, create it! This may be useful for free text dropdowns like the labels
            if (!selectedItem) {
                descriptor.selected(true);
                descriptor.removeOnUnSelect(true);
                var newOption = this._render("option", descriptor);
                newOption.attr("selected", "selected");
                this.$element.append(newOption);
                changed = true;
            }

            /**
             * Remove highlighting. If this {@link ItemDescriptor} is reused, the old highlighting will appear.
             * {@link List.prototype._filterOptions} -- Highlighted item are passed straight through
             * to the suggestions list.
             */
            descriptor.highlighted(false);

            // We need to manually fire the change event as this doesn't fire when we programmatically change the value.
            if (changed) {
                this.$element.trigger('change', descriptor);
            }

            return changed;
        },

        /**
         * Sets all options to unselected
         *
         * @private
         */
        setAllSelected: function setAllSelected() {
            var instance = this;
            jQuery(this.getDisplayableUnSelectedDescriptors()).each(function () {
                instance.setSelected(this);
            });
        },

        /**
         * Sets all options to unselected
         */
        setAllUnSelected: function setAllUnSelected() {
            var instance = this;
            jQuery(this.getDisplayableSelectedDescriptors()).each(function () {
                instance.setUnSelected(this);
            });
        },

        /**
         * Used to set unselected an option. Note, this will unselect and option with the same value also.
         *
         * @param {Object} descriptor - JSON object decribing option
         */
        setUnSelected: function setUnSelected(descriptor) {
            var instance = this;
            var value = descriptor.value();

            this.$element.find("option:selected").not(this._getExclusions()).filter(function () {
                return jQuery(this).attr("value") === value;
            }).each(function () {
                var $this = jQuery(this);
                $this.data("descriptor").selected(false);
                // MNSTR-6933: this is a workaround to fix the issue with deselecting items
                if (descriptor.properties) {
                    descriptor.properties.selected = false;
                }
                if (instance.options.removeOnUnSelect || $this.data("descriptor").removeOnUnSelect()) {
                    $this.remove();
                } else {
                    $this.removeAttr("selected");
                }
            });
        },

        /**
         * Removes corresponding option from select
         *
         * @param {Object} descriptor - JSON object decribing option
         */
        remove: function remove(descriptor) {
            if (descriptor && descriptor.model()) {
                descriptor.model().remove();
            }
        },

        /**
         * Loops over all unselected descriptors searching for one that either matches the value or label of argument
         *
         * @param {String} value - value or label to test against
         * @return {Object} descriptor
         */
        getDescriptor: function getDescriptor(value) {

            var returnDescriptor;

            value = jQuery.trim(value.toLowerCase());

            jQuery.each(this.getAllDescriptors(false), function (e, descriptor) {
                if (value === jQuery.trim(descriptor.label().toLowerCase()) || value === jQuery.trim(descriptor.value().toLowerCase())) {
                    returnDescriptor = descriptor;
                    return false; //bail out of loop, we are done
                }
            });

            return returnDescriptor;
        },

        /**
         * Supplied with an option element, a JSON object describing it is bound to it using jQuery's data method
         *
         * @param {jQuery | HTMLElement} optionElem - element to which a json descriptor will be bound
         * @return {Object} descriptor - JSON object decribing option
         */
        _parseOption: function _parseOption(optionElem) {
            var descriptor;
            var icon;
            var iconType;
            var fallbackIcon;

            optionElem = jQuery(optionElem);

            if (this.options.removeNullOptions && this._hasNullValue(optionElem)) {
                optionElem.remove(); // thank you
                return null;
            }

            icon = optionElem.attr("data-icon");
            iconType = optionElem.attr("data-icon-type");
            fallbackIcon = optionElem.attr("data-fallback-icon");

            descriptor = new ItemDescriptor({
                styleClass: optionElem.prop("className"),
                value: optionElem.val(),
                invalid: optionElem.hasClass("invalid_sel"),
                // The text that will appear in the field when this item is selected. Also used for the item id.
                fieldText: optionElem.attr("data-field-text"),
                title: optionElem.attr("title"),
                labelSuffix: optionElem.attr("data-label-suffix"),
                meta: optionElem.data("meta"),
                // The text that will be displayed in the dropdown item
                label: optionElem.attr("data-field-label") || jQuery.trim(optionElem.text()),
                icon: icon ? icon : optionElem.css("backgroundImage").replace(/url\(['"]?(.*?)['"]?\)/, "$1"), // we just store the url
                iconType: iconType ? iconType : undefined,
                fallbackIcon: fallbackIcon ? fallbackIcon : "none",
                selected: optionElem.prop("selected"),
                removeOnUnSelect: !!optionElem.data("remove-on-unselect"),
                model: optionElem
            });

            optionElem.data("descriptor", descriptor);

            return descriptor;
        },

        /**
         * Checks if given option element has 'null' value. As 'null' we understand any value lower than 0 that indicates
         * this option will be used to reset field value to null.
         *
         * @param {jQuery | HTMLElement} optionElement - element to check
         * @return {boolean} true, if value of the element is lowert than 0, false otherwise
         */
        _hasNullValue: function _hasNullValue(optionElement) {
            return optionElement.val() < 0;
        },

        /**
         * Builds then binds a JSON representation to optgroups and options
         */
        _parseDescriptors: function _parseDescriptors() {
            var instance = this;
            var items = this.$element.children();

            function parseOptGroup(optionGroup) {
                var properties = {
                    label: optionGroup.attr("label"),
                    placement: optionGroup.attr("data-placement"),
                    footerText: optionGroup.attr("data-footer-text"),
                    styleClass: optionGroup.prop("className"),
                    model: optionGroup,
                    items: retrieveAvailableOptions(optionGroup)
                };
                var weight = optionGroup.data('weight');
                if (weight) {
                    properties.weight = +weight;
                }
                optionGroup.data("descriptor", new GroupDescriptor(properties));
            }

            function retrieveAvailableOptions(parent) {
                var availableOptionElems = jQuery("option", parent);
                var arr = [];

                jQuery.each(availableOptionElems, function () {
                    arr.push(instance._parseOption(this));
                });

                return arr;
            }

            items.each(function (i) {
                var item = items.eq(i);
                if (item.is("optgroup")) {
                    parseOptGroup(item);
                } else if (item.is("option")) {
                    if (item.attr("data-placeholder")) {
                        instance.placeholder = item.text();
                        item.remove();
                    } else {
                        instance._parseOption(item);
                    }
                }
            });
        },

        getPlaceholder: function getPlaceholder() {
            return this.placeholder;
        },

        _getExclusions: function _getExclusions() {
            return ".free-input";
        },

        /**
         * Gets value
         *
         * @return {String | Array}
         */
        getValue: function getValue() {
            if (this.type === "single") {
                return this.$element.val() && this.$element.val()[0];
            } else {
                return this.$element.val();
            }
        },

        /**
         * Gets an array of JSON descriptors for selected options
         *
         * @return {Array}
         */
        getDisplayableSelectedDescriptors: function getDisplayableSelectedDescriptors() {
            var descriptors = [];
            this.$element.find("option:selected").not(this._getExclusions()).each(function () {
                descriptors.push(jQuery.data(this, "descriptor"));
            });
            return descriptors;
        },

        /**
         * Gets an array of JSON descriptors for unselected options
         *
         * @return {Array}
         */
        getDisplayableUnSelectedDescriptors: function getDisplayableUnSelectedDescriptors() {
            var descriptors = [];
            this.$element.find("option").not(":selected").not(this._getExclusions()).each(function () {
                descriptors.push(jQuery.data(this, "descriptor"));
            });
            return descriptors;
        },

        /**
         * Gets an array of all descriptors, selected and unselected.
         *
         * @param {boolean} showGroups - If set to false will not include group descriptors
         * @return {Array}
         */
        getAllDescriptors: function getAllDescriptors(showGroups) {
            var properties;
            var descriptors = [];

            this.$element.children().each(function () {
                var descriptor;
                var elem = jQuery(this);
                if (elem.is("option")) {
                    if (elem.data("descriptor")) {
                        descriptors.push(elem.data("descriptor"));
                    }
                } else if (elem.is("optgroup")) {
                    if (showGroups !== false) {
                        var descriptorData = elem.data("descriptor");
                        if (descriptorData) {
                            properties = Objects.copyObject(descriptorData.allProperties(), false);
                            properties.items = [];
                            descriptor = new GroupDescriptor(properties);
                            descriptors.push(descriptor);
                        }
                    }
                    elem.children("option").each(function () {
                        var elem = jQuery(this);
                        var itemDescriptor = elem.data("descriptor");
                        if (itemDescriptor) {
                            if (showGroups !== false) {
                                descriptor.addItem(itemDescriptor);
                            } else {
                                descriptors.push(itemDescriptor);
                            }
                        }
                    });
                }
            });

            return descriptors;
        },

        /**
         * Removes all unselected options
         */
        clearUnSelected: function clearUnSelected() {
            this.$element.find("option:not(:selected)").not(this._getExclusions()).remove();
        },

        /**
         * Gets an array of JSON descriptors for unselected options
         *
         * @return {Array}
         */
        getUnSelectedDescriptors: function getUnSelectedDescriptors() {
            var instance = this;
            var descriptors = [];
            var selectedValues = {};
            var addedValues = {};

            // this function looks for options already selected by comparing values. NOTE: not case sensitive
            function isValid(descriptor) {
                var descriptorVal = descriptor.value().toLowerCase();
                if (!selectedValues[descriptorVal] && (!addedValues[descriptorVal] || descriptor.allowDuplicate() !== false)) {
                    addedValues[descriptorVal] = true;
                    return true;
                }
                return false;
            }

            var selectedDescriptors = this.getDisplayableSelectedDescriptors();
            jQuery.each(selectedDescriptors, function (i, descriptor) {
                selectedValues[descriptor.value().toLowerCase()] = true;
            });

            var selectChildren = this.$element.children();
            selectChildren.each(function () {
                var descriptor;
                var properties;
                var elem = jQuery(this);
                if (elem.is("option") && !this.selected) {
                    descriptor = jQuery.data(this, "descriptor");
                    if (isValid(descriptor)) {
                        descriptors.push(descriptor);
                    }
                } else if (elem.is("optgroup")) {
                    properties = Objects.copyObject(elem.data("descriptor").allProperties(), false);
                    properties.items = [];
                    descriptor = new GroupDescriptor(properties);
                    descriptors.push(descriptor);
                    elem.find("option").not(instance._getExclusions()).each(function (option) {
                        if (option.selected) {
                            return;
                        }
                        var itemDescriptor = jQuery.data(this, "descriptor");
                        if (isValid(itemDescriptor)) {
                            descriptor.addItem(itemDescriptor);
                        }
                    });
                }
            });

            return descriptors;
        },

        _renders: {

            /**
             * Renders an option, built using descriptor.
             *
             * You call this method like this:
             *
             * <pre>
             * this.render("option", {...});
             * </pre>
             *
             * @method _renders.option
             * @private
             * @param {ItemDescriptor} descriptor
             * @return {jQuery}
             */
            option: function option(descriptor) {

                var label = descriptor.label();
                var text = descriptor.fieldText() || label;
                var option = new Option(text, descriptor.value());
                var $option = jQuery(option);
                var iconUrl = descriptor.icon();

                option.title = descriptor.title();

                if (text != label) {
                    // eslint-disable-line eqeqeq
                    // The displayed label might be more descriptive that the text entered in an input field.
                    $option.data('field-label', label);
                }

                if (descriptor.selected()) {
                    $option.attr("selected", "selected");
                }

                jQuery.data(option, "descriptor", descriptor);

                descriptor.model($option);

                if (iconUrl) {
                    $option.css("backgroundImage", "url(" + iconUrl + ")");
                }

                return $option;
            },

            /**
             * Renders an optgroup, built using descriptor.
             *
             * You call this method like this:
             *
             * <pre>
             * this.render("optgroup", {...});
             * </pre>
             *
             * @method _renders.optgroup
             * @private
             * @param {GroupDescriptor} descriptor
             * @return {jQuery}
             */
            optgroup: function optgroup(descriptor) {

                var elem = jQuery("<optgroup />").addClass(descriptor.styleClass()).attr("label", descriptor.label());

                descriptor.model(elem);

                elem.data("descriptor", descriptor);

                if (descriptor.id()) {
                    elem.attr("id", descriptor.id());
                }

                return elem;
            }
        }

    });
});

AJS.namespace('AJS.SelectModel', null, require('jira/ajs/select/select-model'));