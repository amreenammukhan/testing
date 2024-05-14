<%@ taglib uri="webwork" prefix="ww" %>
<%@ taglib uri="sitemesh-page" prefix="page" %>
<%@ taglib uri="jiratags" prefix="jira" %>
<html>
<head>
	<title><ww:text name="'admin.export.backup.all.jira.data'"/></title>
    <meta name="admin.active.section" content="admin_system_menu/top_system_section/import_export_section"/>
    <meta name="admin.active.tab" content="backup_data"/>
</head>
<body>

<page:applyDecorator name="jiraform">
	<page:param name="title"><ww:text name="'admin.export.backup.jira.data'"/></page:param>
	<page:param name="action">XmlBackup.jspa</page:param>
	<page:param name="autoSelectFirst">false</page:param>
	<page:param name="width">100%</page:param>
	<tr>
		<td colspan=2 bgcolor=#ffffff>
			<ww:if test="filename == null">
				<p>
				<ww:text name="'admin.export.cut.and.paste.xml'"/>
				</p>
				<textarea name="foobar" rows=20 cols=80><ww:property value="xml" /></textarea>
			</ww:if>
			<ww:else>
				<ww:text name="'admin.export.data.exported.to'"/>
			<span id="backup-file" >
				<ww:if test="/s3InUse == true">
					<strong><ww:text name="'admin.export.xml.backup.s3.storage'"/></strong>
					<a href="#">
						<span class="aui-icon aui-icon aui-iconfont-info-filled" role="img" aria-label="Amazon S3 Storage Details" aria-controls="inline-dialog-help" data-aui-trigger />
					</a>
					<aui-inline-dialog id="inline-dialog-help" class="aui-help" alignment="bottom center">
						<ww:text name="'admin.export.xml.backup.s3.storage.info'"/> <br/><br>

						<ww:text name="'admin.export.xml.backup.s3.storage.file.name'"/>: <ww:property value="/destinationFile"/>   <br/>
						<ww:text name="'admin.export.xml.backup.s3.storage.info.region'"/>: <ww:property value="/s3FileStoreConfig//region"  />   <br/>
						<ww:text name="'admin.export.xml.backup.s3.storage.info.bucket'"/>: <ww:property value="/s3FileStoreConfig//bucketName"  />
						<ww:if test="/s3FileStoreConfig//endpointOverride != null">
							<br/>
							<ww:text name="'admin.export.xml.backup.s3.storage.info.endpoint'"/>: <ww:property value="/s3FileStoreConfig//endpointOverride"/>
						</ww:if>
					</aui-inline-dialog>
				</ww:if>
				<ww:else>
					<b><ww:property value="destinationFile" /></b>
				</ww:else>
			</span>
			</ww:else>
		</td>
	</tr>
 </page:applyDecorator>
</body>
</html>
