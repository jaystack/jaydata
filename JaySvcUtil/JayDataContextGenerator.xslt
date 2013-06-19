<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
                xmlns:edm="@@VERSIONNS@@" 
                xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" 
                xmlns:metadata="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" 
                xmlns:annot="http://schemas.microsoft.com/ado/2009/02/edm/annotation" 
                xmlns:exsl="http://exslt.org/common" 
                xmlns:msxsl="urn:schemas-microsoft-com:xslt" exclude-result-prefixes="msxsl">

  <xsl:key name="entityType" match="edm:EntityType" use="concat(string(../@Namespace),'.', string(@Name))"/>
  <xsl:key name="associations" match="edm:Association" use="concat(string(../@Namespace),'.', string(@Name))"/>

  <xsl:strip-space elements="property item unprocessed"/>
  <xsl:output method="text" indent="no"  />
  <xsl:param name="contextNamespace" />

  <xsl:param name="SerivceUri" />
  <xsl:param name="EntityBaseClass"/>
  <xsl:param name="ContextBaseClass"/>
  <xsl:param name="AutoCreateContext"/>
  <xsl:param name="ContextInstanceName"/>
  <xsl:param name="EntitySetBaseClass"/>
  <xsl:param name="CollectionBaseClass"/>
  <xsl:param name="DefaultNamespace"/>
  <xsl:param name="MaxDataserviceVersion"/>
  <xsl:param name="AllowedTypesList" />
  <xsl:param name="GenerateNavigationProperties" />

  <xsl:param name="AllowedTypesListX">Microsoft.Crm.Sdk.Data.Services.Product;Microsoft.Crm.Sdk.Data.Services.LeadAddress:Telephone1,City,UTCOffset;</xsl:param>

  <xsl:template name="createFieldsList">
    <xsl:param name="fields" />
    <!--<xsl:message terminate="no">
      create field: @<xsl:value-of select="$fields"/>@
    </xsl:message>-->
      <xsl:variable name="thisField">
        <xsl:choose>
          <xsl:when test="contains($fields,',')">
            <xsl:value-of select="substring-before($fields, ',')"/>
          </xsl:when>
          <xsl:otherwise>
            <xsl:value-of select="$fields"/>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:variable>
      <xsl:element name="field">
        <xsl:attribute name="name">
          <xsl:value-of select="$thisField"/>
        </xsl:attribute> 
      </xsl:element>
      <xsl:variable name="remaining" select="substring($fields, string-length($thisField) + 2)" />
      <xsl:if test="string-length($remaining) > 0">
        <xsl:call-template name="createFieldsList">
          <xsl:with-param name="fields" select="$remaining" />
        </xsl:call-template>
      </xsl:if>
  </xsl:template>

  <xsl:template name="createType">
    <xsl:param name="typeFull" />
    <!--<xsl:message terminate="no">
      create type: <xsl:value-of select="$typeFull"/>
    </xsl:message>-->
    <xsl:variable name="typeName">
      <xsl:choose>
        <xsl:when test="contains($typeFull,':')">
          <xsl:value-of select="substring-before($typeFull, ':') "/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="$typeFull"/>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="fields" select="substring($typeFull, string-length($typeName) + 2)" />
    <xsl:element name="type">
      <xsl:attribute name="name">
        <xsl:value-of select="$typeName"/>
      </xsl:attribute>
      <xsl:if test="string-length($fields) > 0">
        <xsl:call-template name="createFieldsList">
          <xsl:with-param name="fields" select="$fields" />
        </xsl:call-template>
      </xsl:if>
    </xsl:element>
  </xsl:template>
  
  <xsl:template name="createTypeList">
    <xsl:param name="types" />
    <!--<xsl:message terminate="no">
      createTypeList: <xsl:value-of select="$types"/>
    </xsl:message>-->
        
    <xsl:variable name="thisTypeFull">
      <xsl:choose>
        <xsl:when test="contains($types, ';')">
          <xsl:value-of select="substring-before($types, ';')"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="$types"/>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <xsl:if test="string-length($thisTypeFull) > 0">
      <xsl:call-template name="createType">
        <xsl:with-param name="typeFull" select="$thisTypeFull" />
      </xsl:call-template>
    </xsl:if>
    
    <xsl:variable name="remaining" select="substring($types, string-length($thisTypeFull) + 2)" />
    <!--<xsl:message terminate="no">
      rem: @<xsl:value-of select="$remaining"/>@  
    </xsl:message>-->
    
    <xsl:if test="string-length($remaining) > 0">
      <xsl:call-template name="createTypeList">
        <xsl:with-param name="types" select="$remaining" />
      </xsl:call-template>
    </xsl:if>
  </xsl:template>

  <xsl:variable name="allowedTypes">
    <xsl:call-template name="createTypeList">
      <xsl:with-param name="types" select="$AllowedTypesList" />
    </xsl:call-template>
  </xsl:variable>
  

<!-- TODO EXSLT node-set -->
  <!--<xsl:variable name="hasTypeFilter" select="boolean(count(msxsl:node-set($allowedTypes)/type) > 0)"/>-->
  <xsl:variable name="hasTypeFilter">
    <xsl:choose>
      <xsl:when test="function-available('msxsl:node-set')"><xsl:value-of select="boolean(count(msxsl:node-set($allowedTypes)/type) > 0)"/></xsl:when>
      <xsl:otherwise><xsl:value-of select="boolean(count(exsl:node-set($allowedTypes)/type) > 0)"/></xsl:otherwise>
    </xsl:choose>
  </xsl:variable>
  <xsl:template match="/">

/*//////////////////////////////////////////////////////////////////////////////////////
////// Autogenerated by JaySvcUtil.exe http://JayData.org for more info        /////////
//////                             oData @@VERSION@@                                    /////////
//////////////////////////////////////////////////////////////////////////////////////*/
(function(global, $data, undefined) {

    
<xsl:for-each select="//edm:EntityType | //edm:ComplexType" xml:space="default">
  <xsl:variable name="thisName" select="concat(../@Namespace, '.', @Name)" />
  <!-- TODO EXSLT node-set-->
  <!--<xsl:variable name="thisTypeNode" select="msxsl:node-set($allowedTypes)/type[@name = $thisName]" />-->
  <xsl:variable name="thisTypeNode">
    <xsl:choose>
      <xsl:when test="function-available('msxsl:node-set')">
        <xsl:copy-of select="msxsl:node-set($allowedTypes)/type[@name = $thisName]"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:copy-of select="exsl:node-set($allowedTypes)/type[@name = $thisName]"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:variable>
  <xsl:variable name="thisTypeNodeExists">
    <xsl:choose>
      <xsl:when test="function-available('msxsl:node-set')">
        <xsl:copy-of select="(count(msxsl:node-set($allowedTypes)/type[@name = $thisName]) > 0)"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:copy-of select="(count(exsl:node-set($allowedTypes)/type[@name = $thisName]) > 0)"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:variable>
  <!--<xsl:variable name="filterFields" select="(count($thisTypeNode/field) > 0)" />-->
  <xsl:variable name="filterFields">
    <xsl:choose>
      <xsl:when test="function-available('msxsl:node-set')">
        <xsl:copy-of select="(count(msxsl:node-set($thisTypeNode)/type/field) > 0)"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:copy-of select="(count(exsl:node-set($thisTypeNode)/type/field) > 0)"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:variable>
  <xsl:if test="($hasTypeFilter = 'false') or ($thisTypeNodeExists = 'true')">

      <xsl:message terminate="no">Info: generating type <xsl:value-of select="concat(../@Namespace, '.', @Name)"/></xsl:message>
    
      <xsl:variable name="BaseType">
        <xsl:choose>
          <xsl:when test="@BaseType">
            <xsl:value-of select="@BaseType"/>
          </xsl:when>
          <xsl:otherwise>
            <xsl:value-of select="$EntityBaseClass"  />
          </xsl:otherwise>
        </xsl:choose>
      </xsl:variable>


     <xsl:variable name="props">
       <xsl:for-each select="*[local-name() != 'NavigationProperty' or ($GenerateNavigationProperties = 'true' and local-name() = 'NavigationProperty')]">
         <xsl:variable name="fname" select="@Name" />
         <xsl:variable name="isAllowedField">
           <xsl:choose>
             <xsl:when test="function-available('msxsl:node-set')">
               <xsl:copy-of select="(count(msxsl:node-set($thisTypeNode)/type/field[@name = $fname]) > 0)"/>
             </xsl:when>
             <xsl:otherwise>
               <xsl:copy-of select="(count(exsl:node-set($thisTypeNode)/type/field[@name = $fname]) > 0)"/>
             </xsl:otherwise>
           </xsl:choose>
         </xsl:variable>
         <xsl:if test="($filterFields = 'false') or ($isAllowedField = 'true')">
           <xsl:apply-templates select="." />
         </xsl:if> 
       </xsl:for-each>
      </xsl:variable>
    
      <xsl:text xml:space="preserve">  </xsl:text><xsl:value-of select="$BaseType"  />.extend('<xsl:value-of select="concat($DefaultNamespace,../@Namespace)"/>.<xsl:value-of select="@Name"/>', {
     <xsl:choose>
        <xsl:when test="function-available('msxsl:node-set')">
          <xsl:for-each select="msxsl:node-set($props)/*">
            <xsl:value-of select="."/>
            <xsl:if test="position() != last()">
            <xsl:text>,&#10;     </xsl:text>  
            </xsl:if>
          </xsl:for-each>
        </xsl:when>
        <xsl:otherwise>
          <xsl:for-each select="exsl:node-set($props)/*">
            <xsl:value-of select="."/>
            <xsl:if test="position() != last()">,&#10;     </xsl:if>
          </xsl:for-each>
        </xsl:otherwise>
      </xsl:choose>
      <xsl:variable name="currentName"><xsl:value-of select="concat(../@Namespace,'.',@Name)"/></xsl:variable>
      <xsl:for-each select="//edm:FunctionImport[@IsBindable and edm:Parameter[1]/@Type = $currentName]"><xsl:if test="position() = 1">,
      </xsl:if>
        <xsl:apply-templates select="."></xsl:apply-templates><xsl:if test="position() != last()">,
      </xsl:if>
      </xsl:for-each>
  });

</xsl:if>
</xsl:for-each>

<xsl:for-each select="//edm:EntityContainer">
  <xsl:text xml:space="preserve">  </xsl:text><xsl:value-of select="$ContextBaseClass"  />.extend('<xsl:value-of select="concat(concat($DefaultNamespace,../@Namespace), '.', @Name)"/>', {
     <!--or (@IsBindable = 'true' and (@IsAlwaysBindable = 'false' or @m:IsAlwaysBindable = 'false' or @metadata:IsAlwaysBindable = 'false'))-->

   <xsl:variable name="subset">
    <xsl:for-each select="edm:EntitySet | edm:FunctionImport">
      <xsl:choose>
        <xsl:when test="function-available('msxsl:node-set')">
          <xsl:if test="($hasTypeFilter = 'false') or msxsl:node-set($allowedTypes)/type[@name = current()/@EntityType]">
            <xsl:copy-of select="."/>
          </xsl:if>
        </xsl:when>
        <xsl:otherwise>
          <xsl:if test="($hasTypeFilter = 'false') or exsl:node-set($allowedTypes)/type[@name = current()/@EntityType]">
            <xsl:copy-of select="."/>
          </xsl:if>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:for-each>
  </xsl:variable>

  
  <xsl:choose>
    <xsl:when test="function-available('msxsl:node-set')">
      <xsl:for-each select="msxsl:node-set($subset)/*[local-name() != 'FunctionImport' or not(@IsBindable) or @IsBindable = 'false']">
        <xsl:apply-templates select="."></xsl:apply-templates>
        <xsl:if test="position() != last()">,
     </xsl:if>
      </xsl:for-each>
    </xsl:when>
    <xsl:otherwise>
      <xsl:for-each select="exsl:node-set($subset)/*[local-name() != 'FunctionImport' or not(@IsBindable) or @IsBindable = 'false']">
        <xsl:apply-templates select="."></xsl:apply-templates>
        <xsl:if test="position() != last()">,
     </xsl:if>
      </xsl:for-each>
    </xsl:otherwise>
  </xsl:choose>
  });

  $data.generatedContexts = $data.generatedContexts || [];
  $data.generatedContexts.push(<xsl:value-of select="concat(concat($DefaultNamespace,../@Namespace), '.', @Name)" />);
  <xsl:if test="$AutoCreateContext = 'true'">
  /*Context Instance*/
  <xsl:value-of select="$DefaultNamespace"/><xsl:value-of select="$ContextInstanceName" /> = new <xsl:value-of select="concat(concat($DefaultNamespace,../@Namespace), '.', @Name)" />({ name:'oData', oDataServiceHost: '<xsl:value-of select="$SerivceUri" />', maxDataServiceVersion: '<xsl:value-of select="$MaxDataserviceVersion" />' });
</xsl:if>

</xsl:for-each>
      
})(window, $data);
      
    </xsl:template>

  <xsl:template match="edm:Key"></xsl:template>

  <xsl:template match="edm:FunctionImport">
    <xsl:text>'</xsl:text>
    <xsl:value-of select="@Name"/>
    <xsl:text>': { type: </xsl:text>
    <xsl:choose>
      <xsl:when test="@IsBindable = 'true'">
        <xsl:text>$data.ServiceAction</xsl:text>
      </xsl:when>
      <xsl:otherwise>
        <xsl:text>$data.ServiceOperation</xsl:text>
      </xsl:otherwise>
    </xsl:choose>

    <xsl:apply-templates select="@*" mode="FunctionImport-mode"/>

    <xsl:variable name="IsBindable">
      <xsl:value-of select="@IsBindable"/>
    </xsl:variable>
    <xsl:text>, params: [</xsl:text>
    <xsl:for-each select="edm:Parameter[($IsBindable = 'true' and position() > 1) or (($IsBindable = 'false' or $IsBindable = '') and position() > 0)]">
      <xsl:text>{ name: '</xsl:text>
      <xsl:value-of select="@Name"/>
      <xsl:text>', type: '</xsl:text>
      <xsl:apply-templates select="@Type" mode="render-functionImport-type" />
      <xsl:text>' }</xsl:text>
      <xsl:if test="position() != last()">, </xsl:if>
    </xsl:for-each>    
    <xsl:text>]</xsl:text>

    <xsl:text> }</xsl:text>
  </xsl:template>
  
  <xsl:template match="@ReturnType" mode="FunctionImport-mode">
    <xsl:text>, returnType: </xsl:text>
    <xsl:choose>
      <xsl:when test="not(.)">null</xsl:when>
      <xsl:when test="starts-with(., 'Collection')">$data.Queryable</xsl:when>
      <xsl:otherwise>
        <xsl:text>'</xsl:text>
        <xsl:apply-templates select="." mode="render-functionImport-type" />
        <xsl:text>'</xsl:text>
      </xsl:otherwise>
    </xsl:choose>

    <xsl:if test="starts-with(., 'Collection')">
      <xsl:variable name="len" select="string-length(.)-12"/>
      <xsl:variable name="curr" select="substring(.,12,$len)"/>
      <xsl:variable name="ElementType" >
        <xsl:choose>
          <xsl:when test="//edm:Schema[starts-with($curr, @Namespace)]">
            <xsl:value-of select="concat($DefaultNamespace,$curr)" />
          </xsl:when>
          <xsl:otherwise>
            <xsl:value-of select="$curr" />
          </xsl:otherwise>
        </xsl:choose>
      </xsl:variable>
      <xsl:text>, elementType: '</xsl:text>
      <xsl:value-of select="$ElementType"/>
      <xsl:text>'</xsl:text>
    </xsl:if>
  </xsl:template>
  <xsl:template match="@Name" mode="FunctionImport-mode"></xsl:template>
  <xsl:template match="@m:HttpMethod" mode="FunctionImport-mode">
    <xsl:text>, method: '</xsl:text>
    <xsl:value-of select="."/>
    <xsl:text>'</xsl:text>
  </xsl:template>
  <xsl:template match="@IsBindable | @IsSideEffecting | @IsAlwaysBindable | @m:IsAlwaysBindable | @metadata:IsAlwaysBindable | @IsComposable" mode="FunctionImport-mode">
    <xsl:text>, </xsl:text>
    <xsl:call-template name="GetAttributeName">
      <xsl:with-param name="Name" select="name()" />
    </xsl:call-template>
    <xsl:text>: </xsl:text>
    <xsl:value-of select="."/>
  </xsl:template>
  <xsl:template match="@*" mode="FunctionImport-mode">
    <xsl:text>, '</xsl:text>
    <xsl:call-template name="GetAttributeName">
      <xsl:with-param name="Name" select="name()" />
    </xsl:call-template>
    <xsl:text>': '</xsl:text>
    <xsl:value-of select="."/>        
    <xsl:text>'</xsl:text>
  </xsl:template>
  <xsl:template name="GetAttributeName">
    <xsl:param name="Name" />
    <xsl:choose>
      <xsl:when test="contains($Name, ':')">
        <xsl:value-of select="substring-after($Name, ':')"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="$Name"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="edm:EntitySet">'<xsl:value-of select="@Name"/>': { type: <xsl:value-of select="$EntitySetBaseClass"  />, elementType: <xsl:value-of select="concat($DefaultNamespace,@EntityType)"/><xsl:text> </xsl:text><xsl:apply-templates select="." mode="Collection-Actions" />}</xsl:template>

  <xsl:template match="edm:EntitySet" mode="Collection-Actions">
    <xsl:variable name="CollectionType" select="concat('Collection(', @EntityType, ')')" />
    <xsl:for-each select="//edm:FunctionImport[edm:Parameter[1]/@Type = $CollectionType]">
      <xsl:if test="position() = 1">
        <xsl:text>, actions: { 
        </xsl:text>
      </xsl:if>
        <xsl:apply-templates select="."></xsl:apply-templates><xsl:if test="position() != last()">,
        </xsl:if>
      <xsl:if test="position() = last()">
        <xsl:text>
      }</xsl:text>
      </xsl:if>
    </xsl:for-each>
  </xsl:template>
  
  <xsl:template match="edm:Property | edm:NavigationProperty">
    <property>
    <xsl:variable name="memberDefinition">
      <xsl:if test="parent::edm:EntityType/edm:Key/edm:PropertyRef[@Name = current()/@Name]"><attribute name="key">true</attribute></xsl:if>
      <xsl:apply-templates select="@*[local-name() != 'Name']" mode="render-field" />
    </xsl:variable>'<xsl:value-of select="@Name"/>': { <xsl:choose><xsl:when test="function-available('msxsl:node-set')"><xsl:for-each select="msxsl:node-set($memberDefinition)/*">'<xsl:if test="@extended = 'true'">$</xsl:if><xsl:value-of select="@name"/>':<xsl:value-of select="."/>
      <xsl:if test="position() != last()">,<xsl:text> </xsl:text>
    </xsl:if> </xsl:for-each></xsl:when>
  <xsl:otherwise><xsl:for-each select="exsl:node-set($memberDefinition)/*">'<xsl:if test="@extended = 'true'">$</xsl:if><xsl:value-of select="@name"/>':<xsl:value-of select="."/>
      <xsl:if test="position() != last()">,<xsl:text> </xsl:text>
    </xsl:if> </xsl:for-each></xsl:otherwise>
    </xsl:choose> }</property>
</xsl:template>
  
  <xsl:template match="@Name" mode="render-field">
  </xsl:template>

  <xsl:template match="@Type" mode="render-field">
    <xsl:choose>
      <xsl:when test="starts-with(., 'Collection')">
        <attribute name="type">'Array'</attribute>
        <xsl:variable name="len" select="string-length(.)-12"/>
        <xsl:variable name="currType" select="substring(.,12,$len)"/>
        <xsl:choose>
          <xsl:when test="starts-with($currType, ../../../@Namespace)">
            <attribute name="elementType">'<xsl:value-of select="$DefaultNamespace"/><xsl:value-of select="$currType" />'</attribute>
          </xsl:when>
          <xsl:otherwise>
            <attribute name="elementType">'<xsl:value-of select="$currType" />'</attribute>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:when>
      <xsl:when test="starts-with(., ../../../@Namespace)">
        <attribute name="type">'<xsl:value-of select="$DefaultNamespace"/><xsl:value-of select="."/>'</attribute>
      </xsl:when>
      <xsl:otherwise>
        <attribute name="type">'<xsl:value-of select="."/>'</attribute>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="@ConcurrencyMode" mode="render-field">
    <attribute name="concurrencyMode">$data.ConcurrencyMode.<xsl:value-of select="."/></attribute>
  </xsl:template>

  <xsl:template match="@Nullable" mode="render-field">
    <attribute name="nullable"><xsl:value-of select="."/></attribute>
    
    <xsl:if test=". = 'false'">
      <xsl:choose>
        <xsl:when test="parent::edm:Property/@annot:StoreGeneratedPattern = 'Identity' or parent::edm:Property/@annot:StoreGeneratedPattern = 'Computed'"></xsl:when>
        <xsl:otherwise><attribute name="required">true</attribute></xsl:otherwise>
      </xsl:choose>
    </xsl:if>
  </xsl:template>

  <xsl:template match="@annot:StoreGeneratedPattern" mode="render-field">
    <xsl:if test=". != 'None'"><attribute name="computed">true</attribute></xsl:if>    
  </xsl:template>

  <xsl:template match="@MaxLength" mode="render-field">
    <attribute name="maxLength">
      <xsl:choose>
        <xsl:when test="string(.) = 'Max'">Number.POSITIVE_INFINITY</xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="."/>
        </xsl:otherwise>
      </xsl:choose>
    </attribute>
  </xsl:template>

  <xsl:template match="@FixedLength | @Unicode | @Precision | @Scale" mode="render-field">
  </xsl:template>
  <xsl:template match="@*" mode="render-field">
    <xsl:variable name="nameProp">
      <xsl:choose>
        <xsl:when test="substring-after(name(), ':') != ''">
          <xsl:value-of select="substring-after(name(), ':')"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="name()"/>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:element name="attribute"><xsl:attribute name="extended">true</xsl:attribute><xsl:attribute name="name"><xsl:value-of select="$nameProp"/></xsl:attribute>'<xsl:value-of select="."/>'</xsl:element>
  </xsl:template>

  <xsl:template match="@Relationship" mode="render-field">
    <xsl:variable name="relationName" select="string(../@ToRole)"/>
    <xsl:variable name="relationshipName" select="string(.)" />
    <xsl:variable name="relation" select="key('associations',string(.))/edm:End[@Role = $relationName]" />
    <xsl:variable name="otherName" select="../@FromRole" />
    <xsl:variable name="otherProp" select="//edm:NavigationProperty[@ToRole = $otherName and @Relationship = $relationshipName]" />
    <xsl:variable name="m" select="$relation/@Multiplicity" />
    <xsl:choose>
      <xsl:when test="$m = '*'">
        <attribute name="type">'<xsl:value-of select="$CollectionBaseClass"/>'</attribute>
        <attribute name="elementType">'<xsl:value-of select="$DefaultNamespace"/><xsl:value-of select="$relation/@Type"/>'</attribute>
        <xsl:if test="not($otherProp/@Name)">
          <attribute name="inverseProperty">'$$unbound'</attribute></xsl:if>
        <xsl:if test="$otherProp/@Name">
          <attribute name="inverseProperty">'<xsl:value-of select="$otherProp/@Name"/>'</attribute></xsl:if>
      </xsl:when>
      <xsl:when test="$m = '0..1'">
        <attribute name="type">'<xsl:value-of select="$DefaultNamespace"/><xsl:value-of select="$relation/@Type"/>'</attribute>
        <xsl:choose>
          <xsl:when test="$otherProp">
            <attribute name="inverseProperty">'<xsl:value-of select="$otherProp/@Name"/>'</attribute>
          </xsl:when >
          <xsl:otherwise>
            <attribute name="inverseProperty">'$$unbound'</attribute>
            <xsl:message terminate="no">  Warning: inverseProperty other side missing: <xsl:value-of select="."/>
          </xsl:message>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:when>
      <xsl:when test="$m = '1'">
        <attribute name="type">'<xsl:value-of select="$DefaultNamespace"/><xsl:value-of select="$relation/@Type"/>'</attribute>
        <attribute name="required">true</attribute>
        <xsl:choose>
          <xsl:when test="$otherProp">
            <attribute name="inverseProperty">'<xsl:value-of select="$otherProp/@Name"/>'</attribute>
          </xsl:when >
          <xsl:otherwise>
            <attribute name="inverseProperty">'$$unbound'</attribute>
            <xsl:message terminate="no">
              Warning: inverseProperty other side missing: <xsl:value-of select="."/>
            </xsl:message>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:when>
    </xsl:choose>
  </xsl:template>


  <xsl:template match="@FromRole | @ToRole" mode="render-field"></xsl:template>

  <xsl:template match="*" mode="render-field">
    <!--<unprocessed>!!<xsl:value-of select="name()"/>!!</unprocessed>-->
    <xsl:message terminate="no">  Warning: <xsl:value-of select="../../@Name"/>.<xsl:value-of select="../@Name"/>:<xsl:value-of select="name()"/> is an unknown/unprocessed attribued</xsl:message>
  </xsl:template>
  <!--<xsl:template match="*">
    !<xsl:value-of select="name()"/>!
  </xsl:template>-->
</xsl:stylesheet>
