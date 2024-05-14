<%@ page import="com.atlassian.jira.component.ComponentAccessor" %>
<%@ page import="com.atlassian.jira.plugin.navigation.HeaderFooterRendering" %>
<%@ page import="com.atlassian.web.servlet.api.LocationUpdater" %>
<%@ page import="com.atlassian.jira.web.pagebuilder.CommonWebResourcesProvider" %>
<%@ page import="com.atlassian.jira.plugin.navigation.LfStylesService" %>
<%=ComponentAccessor.getComponent(LfStylesService.class).prepareLookAndFeelColorsCss()%>

<script>window.contextPath = '<%=request.getContextPath()%>';</script>
<%
    final LocationUpdater locationUpdater = ComponentAccessor.getOSGiComponentInstanceOfType(LocationUpdater.class);
    locationUpdater.updateLocation(out);

    CommonWebResourcesProvider commonWebResourcesProvider = ComponentAccessor.getComponent(CommonWebResourcesProvider.class);
    commonWebResourcesProvider.requireCommonWebResources();
    commonWebResourcesProvider.drainIncludedWebResources(out);

    HeaderFooterRendering headerAndFooter = ComponentAccessor.getComponent(HeaderFooterRendering.class);
    headerAndFooter.includeWebPanels(out, "atl.header.after.scripts");
%>
