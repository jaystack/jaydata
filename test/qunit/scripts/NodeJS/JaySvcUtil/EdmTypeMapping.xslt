<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

    <xsl:variable name="EdmJayTypeMapping">
        <map from="Edm.Boolean" to="$data.Boolean" />
        <map from="Edm.Binary" to="$data.Blob" />
        <map from="Edm.DateTime" to="$data.Date" />
        <map from="Edm.DateTimeOffset" to="$data.Integer" />
        <map from="Edm.Time" to="$data.Integer" />
        <map from="Edm.Decimal" to="$data.Number" />
        <map from="Edm.Single" to="$data.Number" />
        <map from="Edm.Double" to="$data.Number" />
        <map from="Edm.Guid" to="$data.String" />
        <map from="Edm.Int16" to="$data.Integer" />
        <map from="Edm.Int32" to="$data.Integer" />
        <map from="Edm.Int64" to="$data.Integer" />
        <map from="Edm.Byte" to="$data.Integer" />
        <map from="Edm.String" to="$data.String" />
        <map from="Edm.GeographyPoint" to="$data.Blob" />
    </xsl:variable>

</xsl:stylesheet>