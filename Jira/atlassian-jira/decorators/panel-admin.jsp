<%@ page import="com.atlassian.jira.plugin.keyboardshortcut.KeyboardShortcutManager" %>
<%@ page import="com.atlassian.jira.util.ComponentFactory" %>
<%@ page import="com.atlassian.jira.web.sitemesh.AdminDecoratorHelper" %>
<%@ page import="com.atlassian.jira.web.util.ProductVersionDataBeanProvider" %>
<%@ page import="com.atlassian.plugin.webresource.WebResourceManager" %>
<%@ taglib uri="sitemesh-decorator" prefix="decorator" %>
<%@ taglib uri="sitemesh-page" prefix="page" %>
<%@ taglib uri="webwork" prefix="ww"%>
<%@ taglib uri="webwork" prefix="ui"%>
<%@ taglib uri="webwork" prefix="aui"%>
<%@ taglib uri="jiratags" prefix="jira" %>
<decorator:usePage id="configPage"/>
<%
    {
        final ComponentFactory factory = ComponentAccessor.getComponentOfType(ComponentFactory.class);
        final AdminDecoratorHelper helper = factory.createObject(AdminDecoratorHelper.class);

        helper.setCurrentSection(configPage.getProperty("meta.admin.active.section"));
        helper.setCurrentTab(configPage.getProperty("meta.admin.active.tab"));
        helper.setProject(configPage.getProperty("meta.projectKey"));

        request.setAttribute("adminHelper", helper);
        request.setAttribute("jira.admin.mode", true);
        request.setAttribute("jira.selected.section", helper.getSelectedMenuSection()); // Determine what tab should be active

        // Plugins 2.5 allows us to perform context-based resource inclusion. This defines the context "atl.admin"
        final WebResourceManager adminWebResourceManager = ComponentAccessor.getWebResourceManager();
        adminWebResourceManager.requireResourcesForContext("atl.admin");
        adminWebResourceManager.requireResourcesForContext("jira.admin");

        final KeyboardShortcutManager adminKeyboardShortcutManager = ComponentAccessor.getComponentOfType(KeyboardShortcutManager.class);
        adminKeyboardShortcutManager.requireShortcutsForContext(KeyboardShortcutManager.Context.admin);
    }
%>
<!DOCTYPE html>
<html lang="<%= ComponentAccessor.getJiraAuthenticationContext().getI18nHelper().getLocale().getLanguage() %>" <%@ include file="/includes/decorators/theme-switcher-attributes.jsp" %>>
<head>
    <%@ include file="/includes/decorators/aui-layout/head-common.jsp" %>
    <%@ include file="/includes/decorators/aui-layout/head-resources.jsp" %>
    <decorator:head/>
</head>
<body id="jira" class="aui-layout aui-theme-default page-type-admin <jira:a11y-classes/> <decorator:getProperty property="body.class" />" <%= ComponentAccessor.getComponent(ProductVersionDataBeanProvider.class).get().getBodyHtmlAttributes() %>>
<div id="page">
    <header id="header" role="banner">
        <%@ include file="/includes/decorators/aui-layout/notifications-header.jsp" %>
        <%@ include file="/includes/admin/admin-info-notifications.jsp" %>
        <%@ include file="/includes/decorators/unsupported-browsers.jsp" %>
        <%@ include file="/includes/decorators/aui-layout/header.jsp" %>
    </header>
    <%@ include file="/includes/decorators/aui-layout/notifications-content.jsp" %>
    <div id="content">
        <ui:soy moduleKey="'com.atlassian.auiplugin:soy'" template="'aui.page.pagePanel'">
            <ui:param name="'content'">
                <ui:soy moduleKey="'com.atlassian.auiplugin:soy'" template="'aui.page.pagePanelContent'">
                    <ui:param name="'content'">
                        <decorator:body />
                    </ui:param>
                </ui:soy>
            </ui:param>
        </ui:soy>
    </div>
    <footer id="footer" role="contentinfo">
        <%@ include file="/includes/decorators/aui-layout/footer.jsp" %>
    </footer>
</div>
<%@ include file="/includes/decorators/aui-layout/endbody-resources.jsp" %>
</body>
</html>
