<%@ page import="com.atlassian.jira.component.ComponentAccessor" %>
<%@ taglib prefix="ww" uri="webwork" %>
<%@ taglib prefix="aui" uri="webwork" %>
<%@ taglib prefix="page" uri="sitemesh-page" %>
<!DOCTYPE html>
<html lang="<%= ComponentAccessor.getJiraAuthenticationContext().getI18nHelper().getLocale().getLanguage() %>">
<head>
    <title><ww:text name="'cloneissue.title'"><ww:param value="originalIssue/key"/></ww:text></title>
    <meta name="decorator" content="message" />
</head>
<body>
    <div class="form-body">
        <header>
            <h1><ww:text name="'admin.common.words.error'"/></h1>
        </header>
        <aui:component template="auimessage.jsp" theme="'aui'">
            <aui:param name="'messageType'">error</aui:param>
            <aui:param name="'titleText'"><ww:property value="/attachmentCloneErrorTitle"/></aui:param>
            <aui:param name="'messageHtml'">
                <p><ww:property value="/attachmentCloneErrorBody"/></p>
                <p><a href="<ww:url value="/clonedIssuePath" atltoken="false" />"><ww:text name="'cloneissue.clone.attachments.failed.continue.to.issue'"/></a></p>
            </aui:param>
        </aui:component>
    </div>
</body>
</html>
