define('jira/field/project-issue-type-select', ['jira/lib/class'], function (Class) {
    'use strict';

    /**
     * @class
     * @extends Class
     */

    return Class.extend({

        init: function init(options) {
            var val;
            var instance = this;

            this.$project = options.project;

            this.issueTypeSelect = options.issueTypeSelect;
            this.$projectIssueTypesSchemes = options.projectIssueTypesSchemes;
            this.$issueTypeSchemeIssueDefaults = options.issueTypeSchemeIssueDefaults;
            this.projectIssueTypeSchemes = JSON.parse(this.$projectIssueTypesSchemes.html());
            this.issueTypesSchemeDefaults = JSON.parse(this.$issueTypeSchemeIssueDefaults.html() || '[]');

            //may not have a project select on the edit issue page!
            if (instance.$project.length > 0) {
                val = instance.$project.val();
                instance.setIssueTypeScheme(instance.getIssueTypeSchemeForProject(val));

                this.$project.change(function () {
                    var val = instance.$project.val();
                    instance._handleProjectChanged(instance.getIssueTypeSchemeForProject(val));
                });
            }
        },

        _handleProjectChanged: function _handleProjectChanged(issueTypeSchemeId) {
            this.issueTypeSelect.model.setFilterGroup(issueTypeSchemeId);
            var defaultIssueType = this.getDefaultIssueTypeForScheme(issueTypeSchemeId);
            var defaultIssueTypeDescriptor = this.issueTypeSelect.model.getDescriptor(defaultIssueType);
            var selectedIssueType = this.issueTypeSelect.model.getValue();
            if (this.issueTypeSelect.model.$element.data('move-context')) {
                this._handleProjectChangedWhenIssueMoved(defaultIssueTypeDescriptor, selectedIssueType);
            } else {
                this._handleProjectChangedWhenIssueCreated(defaultIssueTypeDescriptor, selectedIssueType);
            }
            this.issueTypeSelect.model.$element.data('project', this.$project.val());
        },

        /**
         * When new issue is being created its type is selected with rules:
         *  1. Project's default issue is used when present.
         *  2. Previously selected issue type is used when present in current project.
         *  3. First issue type from the list is used.
         */
        _handleProjectChangedWhenIssueCreated: function _handleProjectChangedWhenIssueCreated(defaultIssueTypeDescriptor, selectedIssueType) {
            if (defaultIssueTypeDescriptor) {
                this.issueTypeSelect.setSelection(defaultIssueTypeDescriptor, false);
            } else {
                if (!this.issueTypeSelect.model.setSelected(selectedIssueType, false)) {
                    this.issueTypeSelect.setSelection(this.issueTypeSelect.model.getAllDescriptors()[0], false);
                }
            }
        },

        /**
         * When existing issue is being moved to another project its type is selected with rules:
         *  1. Current issue type is used when present in target project
         *  2. Project's default issue is used when present
         *  2. First issue type from the target project issue types types list is used.
         */
        _handleProjectChangedWhenIssueMoved: function _handleProjectChangedWhenIssueMoved(defaultIssueTypeDescriptor, selectedIssueType) {
            if (!this.issueTypeSelect.model.setSelected(selectedIssueType, false)) {
                this.issueTypeSelect.setSelection(defaultIssueTypeDescriptor ? defaultIssueTypeDescriptor : this.issueTypeSelect.model.getAllDescriptors()[0], false);
            }
        },

        getIssueTypeSchemeForProject: function getIssueTypeSchemeForProject(projectId) {
            return this.projectIssueTypeSchemes[projectId];
        },

        getDefaultIssueTypeForScheme: function getDefaultIssueTypeForScheme(issueTypeSchemeId) {
            return this.issueTypesSchemeDefaults[issueTypeSchemeId];
        },

        setIssueTypeScheme: function setIssueTypeScheme(issueTypeSchemeId) {
            var selectedIssueType = this.issueTypeSelect.model.getValue();

            this.issueTypeSelect.model.setFilterGroup(issueTypeSchemeId);

            //retain value if possible, if not set default value
            //we set selection using model method since this change doesn't deal with dropdown
            if (!this.issueTypeSelect.model.setSelected(selectedIssueType, false)) {
                this.setDefaultIssueType(issueTypeSchemeId);
            }

            this.issueTypeSelect.model.$element.data('project', this.$project.val());
        },
        /**
         * Sets the default issue type for given issue type scheme.
         * If there is no default issue type in model set the first one
         *
         * @param {string} issueTypeSchemeId id of the issue type scheme
         */
        setDefaultIssueType: function setDefaultIssueType(issueTypeSchemeId) {
            var defaultIssueType = this.getDefaultIssueTypeForScheme(issueTypeSchemeId);
            var descriptor = this.issueTypeSelect.model.getDescriptor(defaultIssueType);

            if (!descriptor) {
                descriptor = this.issueTypeSelect.model.getAllDescriptors()[0];
            }
            this.issueTypeSelect.setSelection(descriptor, false);
        }
    });
});

AJS.namespace('JIRA.ProjectIssueTypeSelect', null, require('jira/field/project-issue-type-select'));