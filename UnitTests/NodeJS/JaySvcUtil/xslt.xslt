<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:exsl="http://exslt.org/common"
                xmlns:subns="http://subns.com"
                xmlns:libxslt="http://xmlsoft.org/XSLT/namespace"
                extension-element-prefixes="exsl">
    <xsl:output version="1.0" method="text" encoding="UTF-8" indent="no"/>
    <xsl:param name="apple">asdasd</xsl:param>

    <xsl:template match="/">
        <div>
            <xsl:value-of select="$apple" />
        </div>
    </xsl:template>
</xsl:stylesheet>
