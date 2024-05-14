<%@ taglib uri="webwork" prefix="ww" %>
<%@ taglib uri="webwork" prefix="ui" %>
<%@ taglib uri="webwork" prefix="aui" %>
<%@ taglib uri="sitemesh-page" prefix="page" %>
<html>
<head>
	<title><ww:text name="'admin.attachmentsettings.edit.attachment.settings'"/></title>
    <meta name="admin.active.section" content="admin_system_menu/advanced_menu_section/advanced_section"/>
    <meta name="admin.active.tab" content="attachments"/>
    <meta name="decorator" content="panel-admin"/>
</head>


<body>

<page:applyDecorator id="edit-attachments" name="auiform">
    <page:param name="action">EditAttachmentSettings.jspa</page:param>
    <page:param name="method">post</page:param>
    <page:param name="submitButtonText"><ww:text name="'common.forms.save'"/></page:param>
    <page:param name="submitButtonName"><ww:text name="'common.forms.save'"/></page:param>
    <page:param name="cancelLinkURI">ViewAttachmentSettings.jspa</page:param>

    <aui:component template="formHeading.jsp" theme="'aui'">
        <aui:param name="'text'"><ww:text name="'admin.attachmentsettings.edit.attachment.settings'"/></aui:param>
    </aui:component>

    <ww:if test="/systemAdministrator == true">
        <ui:soy moduleKey="'jira.webresources:filestore-information-resources'" template="'JIRA.Templates.Admin.Jira.FileStoreInformation.enableAttachmentsFieldset'">
            <ui:param name="'enabled'" value="/attachmentsEnabled" />
            <ui:param name="'heading'" value="/attachmentsLocation/heading" />
            <ui:param name="'information'" value="/attachmentsLocation/entries" />
        </ui:soy>
        <hr/>
        <ww:if test="/customAttachmentPathSelectedInUi == true">
            <page:applyDecorator name="auifieldset">
                <page:param name="type">group</page:param>
                <page:param name="legend"><ww:text name="'admin.attachmentsettings.usecustompath'"/></page:param>
                <page:applyDecorator name="auifieldgroup">
                    <page:param name="type">radio</page:param>
                    <page:param name="description">
                        <em><ww:property value="/customAttachmentPath"/></em>
                        <aui:component template="auimessage.jsp" theme="'aui'">
                            <aui:param name="'messageType'">warning</aui:param>
                            <aui:param name="'messageHtml'">
                                <ww:text name="'admin.attachmentsettings.custompath.migration.msg'"/>
                            </aui:param>
                        </aui:component>
                    </page:param>
                    <%-- Set the checked state of the radio --%>
                    <ww:if test="customAttachmentPathSelectedInUi == 'true'">
                        <ww:property id="customAttachmentPath-enabled-checked" value="'true'"/>
                    </ww:if>
                    <aui:radio checked="@customAttachmentPath-enabled-checked" id="customAttachmentPath-enabled" label="text('admin.common.words.on')" value="true" list="null" name="'customAttachmentPathSelectedInUi'" theme="'aui'" />
                </page:applyDecorator>
                <page:applyDecorator name="auifieldgroup">
                    <page:param name="type">radio</page:param>
                    <%-- Set the checked state of the radio --%>
                    <ww:if test="customAttachmentPath == 'false'">
                        <ww:property id="customAttachmentPath-disabled-checked" value="'true'"/>
                    </ww:if>
                    <aui:radio checked="@customAttachmentPath-disabled-checked" id="customAttachmentPath-disabled" label="text('admin.common.words.off')" value="false" list="null" name="'customAttachmentPathSelectedInUi'" theme="'aui'" />
                </page:applyDecorator>
            </page:applyDecorator>
        </ww:if>
    </ww:if>

    <page:applyDecorator name="auifieldgroup">
        <aui:textfield label="text('admin.attachmentsettings.attachment.size')" id="'maxAttachmentSize'" mandatory="false" maxlength="40" name="'maxAttachmentSize'" theme="'aui'" />
        <page:param name="description"><ww:text name="'admin.attachmentsettings.attachment.size.description'"/></page:param>
    </page:applyDecorator>

    <page:applyDecorator name="auifieldset">
        <page:param name="type">group</page:param>
        <page:param name="legend"><ww:text name="'admin.attachmentsettings.enable.thumbnails'"/></page:param>
        <page:applyDecorator name="auifieldgroup">
            <page:param name="type">radio</page:param>
            <%-- Set the checked state of the radio --%>
            <ww:if test="thumbnailsEnabled == 'true'">
                <ww:property id="thumbnails-enabled-checked" value="'true'"/>
            </ww:if>
            <aui:radio checked="@thumbnails-enabled-checked" id="thumbnails-enabled" label="text('admin.common.words.on')" value="true" list="null" name="'thumbnailsEnabled'" theme="'aui'" />
        </page:applyDecorator>
        <page:applyDecorator name="auifieldgroup">
            <page:param name="type">radio</page:param>
            <page:param name="description"><ww:text name="'admin.attachmentsettings.enable.thumbnails.description'"/></page:param>
            <%-- Set the checked state of the radio --%>
            <ww:if test="thumbnailsEnabled == 'false'">
                <ww:property id="thumbnails-disabled-checked" value="'true'"/>
            </ww:if>
            <aui:radio checked="@thumbnails-disabled-checked" id="thumbnails-disabled" label="text('admin.common.words.off')" value="false" list="null" name="'thumbnailsEnabled'" theme="'aui'" />
        </page:applyDecorator>
    </page:applyDecorator>

    <page:applyDecorator name="auifieldset">
        <page:param name="type">group</page:param>
        <page:param name="legend"><ww:text name="'admin.attachmentsettings.enable.zipsupport'"/></page:param>
        <page:applyDecorator name="auifieldgroup">
            <page:param name="type">radio</page:param>
            <%-- Set the checked state of the radio --%>
            <ww:if test="zipSupport == 'true'">
                <ww:property id="zipSupport-enabled-checked" value="'true'"/>
            </ww:if>
            <aui:radio checked="@zipSupport-enabled-checked" id="zipSupport-enabled" label="text('admin.common.words.on')" value="true" list="null" name="'zipSupport'" theme="'aui'" />
        </page:applyDecorator>
        <page:applyDecorator name="auifieldgroup">
            <page:param name="type">radio</page:param>
            <page:param name="description"><ww:text name="'admin.attachmentsettings.enable.zipsupport.description'"/></page:param>
            <%-- Set the checked state of the radio --%>
            <ww:if test="zipSupport == 'false'">
                <ww:property id="zipSupport-disabled-checked" value="'true'"/>
            </ww:if>
            <aui:radio checked="@zipSupport-disabled-checked" id="zipSupport-disabled" label="text('admin.common.words.off')" value="false" list="null" name="'zipSupport'" theme="'aui'" />
        </page:applyDecorator>
    </page:applyDecorator>

    <hr/>
    <page:applyDecorator name="auifieldset">
        <page:param name="type">group</page:param>
        <page:param name="legend"><ww:text name="'admin.attachmentsettings.extension.restriction.mode'"/></page:param>
        <page:applyDecorator name="auifieldgroup">
            <page:param name="type">radio</page:param>
            <page:param name="description"><ww:text name="'admin.attachmentsettings.extension.restriction.mode.none.explanation'"/></page:param>
            <%-- Set the checked state of the radio --%>
            <ww:if test="extensionRestrictionMode == 'none'">
                <ww:property id="extension-restriction-mode-none" value="'true'"/>
            </ww:if>
            <aui:radio checked="@extension-restriction-mode-none" id="extension-restriction-mode-none" label="text('admin.attachmentsettings.extension.restriction.mode.none')" value="none" list="null" name="'extensionRestrictionMode'" theme="'aui'">
                <aui:param name="'customValue'">none</aui:param>
            </aui:radio>
        </page:applyDecorator>
        <page:applyDecorator name="auifieldgroup">
            <page:param name="type">radio</page:param>
            <page:param name="description"><ww:text name="'admin.attachmentsettings.extension.restriction.mode.blocklist.explanation'"/></page:param>
            <%-- Set the checked state of the radio --%>
            <ww:if test="extensionRestrictionMode == 'blocklist'">
                <ww:property id="extension-restriction-mode-blocklist" value="'true'"/>
            </ww:if>
            <aui:radio checked="@extension-restriction-mode-blocklist" id="extension-restriction-mode-blocklist" label="text('admin.attachmentsettings.extension.restriction.mode.blocklist')" value="blocklist" list="null" name="'extensionRestrictionMode'" theme="'aui'">
                <aui:param name="'customValue'">blocklist</aui:param>
            </aui:radio>
        </page:applyDecorator>
        <page:applyDecorator name="auifieldgroup">
            <page:param name="type">radio</page:param>
            <page:param name="description"><ww:text name="'admin.attachmentsettings.extension.restriction.mode.allowlist.explanation'"/></page:param>
            <%-- Set the checked state of the radio --%>
            <ww:if test="extensionRestrictionMode == 'allowlist'">
                <ww:property id="extension-restriction-mode-allowlist" value="'true'"/>
            </ww:if>
            <aui:radio checked="@extension-restriction-mode-allowlist" id="extension-restriction-mode-allowlist" label="text('admin.attachmentsettings.extension.restriction.mode.allowlist')" value="allowlist" list="null" name="'extensionRestrictionMode'" theme="'aui'">
                <aui:param name="'customValue'">allowlist</aui:param>
            </aui:radio>
        </page:applyDecorator>
    </page:applyDecorator>

    <page:applyDecorator name="auifieldgroup">
        <aui:textarea label="text('admin.attachmentsettings.filtered.file.extensions')" id="filteredFileExtensions" name="'filteredFileExtensions'" rows="'2'" theme="'aui'"/>
        <page:param name="description"><ww:text name="'admin.attachmentsettings.filtered.file.extensions.description'"/></page:param>
    </page:applyDecorator>

    <page:applyDecorator name="auifieldset">
        <page:param name="type">group</page:param>
        <page:applyDecorator name="auifieldgroup">
            <page:param name="type">checkbox</page:param>
            <aui:checkbox label="text('admin.attachmentsettings.filter.files.without.extensions')" id="filterFilesWithoutExtensions" name="'filterFilesWithoutExtensions'" fieldValue="true" theme="'aui'">
                <aui:param name="'labelBefore'">false</aui:param>
            </aui:checkbox>
        </page:applyDecorator>
    </page:applyDecorator>
</page:applyDecorator>
</body>
</html>
