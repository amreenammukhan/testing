<%@ page import="com.atlassian.jira.component.ComponentAccessor" %>
<%@ page import="com.atlassian.jira.themes.request.BootstrapToVelocitySafeRequestThemeService" %>
<%@ page import="com.atlassian.theme.api.request.RequestScopeThemeService" %>
<%@ page import="com.atlassian.jira.config.FeatureManager" %>

<%
    final FeatureManager featureManager = ComponentAccessor.getComponent(FeatureManager.class);
    String htmlAttributes = "";
    if (featureManager.isEnabled("com.atlassian.jira.theme.switcher.enabled")) {
        final RequestScopeThemeService requestScopeThemeService = ComponentAccessor.getComponentOfType(BootstrapToVelocitySafeRequestThemeService.class).getRequestThemeService();
        htmlAttributes = requestScopeThemeService.getHtmlAttributesForThisRequest(request);
    }
%>
<%= htmlAttributes %>