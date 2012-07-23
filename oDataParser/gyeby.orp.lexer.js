var ASCII = {
    NULL: "\u0000",
    HTAB:         9,
    LF:          10,
    VTAB:        11,
    CR:          13,
    SPC:         32,
    DOLLAR:      36, // $
    AMP:         38, // &
    APOS:        39, // '
    LPAREN:      40, // (
    RPAREN:      41, // )
    PLUS:        43, // +
    COMMA:       44, // ,
    MINUS:       45, // -
    DOT:         46, // .
    SLASH:       47, // /
    ZERO:        48, // 0
    NINE:        57, // 9
    COLON:       58, // :
    A:           65, 
    Z:           90,
    UNDERSCORE:  95, // _
    a:           97,
    z:          122
};
var CharType =  {EOF:0,WSP:1,CTRLCHAR:2,CHAR:3,DIGIT:4,ALPHA:5};
var TokenType = {EOF:0,WSP:1,CTRLCHAR:2,CHAR:3,DIGITS:4,WORD:5,STRING:6};

function ODataRequestToken() {
    this.tokenType = TokenType.EOF;
    this.value = "";
    this.line = -1;
    this.column = -1;
    this.toString = function() {
        if (this.tokenType == TokenType.DIGITS || this.tokenType == TokenType.WORD || this.tokenType == TokenType.STRING)
            return this.value;
        else if (this.tokenType == TokenType.CTRLCHAR || this.tokenType == TokenType.CHAR || this.tokenType == TokenType.WSP)
            return String.fromCharCode(this.value);
        return "[EOF]";
    };
}

function ODataRequestLexer(src) {
    this.src = src;
    this.srcLength = src.length;
    this.srcIndex = 0;
    this.token = null;
    this.currentChar = ASCII.NULL;
    this.currentCharType = CharType.EOF;
    this.line = 0;
    this.column = -1;
    this.nextChar();
    this.nextToken();
}
//ODataRequestLexer.prototype.syswords = ["batch","filter","format","inlinecount","it","metadata","orderby","select","skip","top","count"];
//ODataRequestLexer.prototype.words = ["add","all","allpages","and","any","asc","atom","binary","boolean","byte","cast","ceiling","concat","datetime","datetimeoffset","day","decimal","desc","distance","div","double","edm","endswith","eq","false","float","floor","ge","geography","geographycollection","geometriclinestring","geometricmultilinestring","geometricmultipoint","geometricmultipolygon","geometricpoint","geometricpolygon","geometry","geometrycollection","gettotaloffsetminutes","gt","guid","hour","indexof","inf","int16","int32","int64","intersects","isof","json","le","length","linestring","lt","metadata","minute","mod","month","mul","multilinedtring","multipoint","multipolygon","nan","ne","none","not","null","or","point","polygon","replace","round","sbyte","second","single","startswith","stream","string","sub","substring","substringof","time","tolower","toupper","trim","true","type","xml","year"];
ODataRequestLexer.prototype.nextChar = function() {
    if (this.srcIndex >= this.srcLength) {
        this.currentChar = '\0';
        this.currentCharType = CharType.EOF;
        this.column++;
        return false;
    }
    if (this.currentChar == ASCII.CR) {
        this.line++;
        this.column = -1;
    }
    this.currentChar = this.src.charCodeAt(this.srcIndex++);
    this.column++;
    this.currentCharType = this.getCharType(this.currentChar);
    return true;
};
ODataRequestLexer.prototype.getCharType = function(c) {
    if (c == ASCII.NULL) return CharType.EOF;
    if (c == ASCII.HTAB) return CharType.WSP;
    if (c < ASCII.SPC)   return CharType.CTRLCHAR;
    if (c == ASCII.SPC)  return CharType.WSP;
    if (c < ASCII.ZERO)  return CharType.CHAR;
    if (c <= ASCII.NINE) return CharType.DIGIT;
    if (c < ASCII.A)     return CharType.CHAR;
    if (c <= ASCII.Z)    return CharType.ALPHA;
    if (c < ASCII.a)     return CharType.CHAR;
    if (c <= ASCII.z)    return CharType.ALPHA;
    return c;
};
ODataRequestLexer.prototype.nextToken = function () {
    /*    
    whitespace:
        SPC HTAB VTAB CR LF
    char:
        '-!$%&()*,./:;?@[]_{}~+= ; ????
    digit:
        0 1 2 3 4 5 6 7 8 9
    word:
        add all ...
    string:
        ' char | whitespace | digit | alpha '
    */
    this.skipWhiteSpaces();
    var token = new ODataRequestToken();
    this.token = token;
    token.line = this.line;
    token.column = this.column;
    switch(this.currentCharType) {
        case CharType.EOF:      token.tokenType = TokenType.EOF;      token.value = this.currentChar; return;
        case CharType.WSP:      token.tokenType = TokenType.WSP;      token.value = this.currentChar; this.nextChar(); return;
        case CharType.CTRLCHAR: token.tokenType = TokenType.CTRLCHAR; token.value = this.currentChar; this.nextChar(); return;
        case CharType.CHAR:
            var startIndex = this.srcIndex;
            if (this.currentChar == ASCII.APOS && this.readTo("'")) {
                token.tokenType = TokenType.STRING;
                var length = this.srcIndex-startIndex-1;
                token.value = this.src.substr(startIndex, this.srcIndex-startIndex-1);
                this.column += length+1;
            }
            else {
                token.tokenType = TokenType.CHAR;
                token.value = this.currentChar;
            }
            this.nextChar();
            return;
        case CharType.DIGIT:    this.scanDigits(token); return;
        case CharType.ALPHA:    this.scanWord(token); return;
        default:
            throw "Unknown CharType: " + this.currentCharType;
    }
};
ODataRequestLexer.prototype.readTo = function (str) {
    if(this.srcIndex==this.srcLength-1)
        return false;
    var p = this.src.indexOf(str, this.srcIndex+1);
    if(p<0)
        return false;
    this.srcIndex = p+1;
    return true;
};
ODataRequestLexer.prototype.skipWhiteSpaces = function () {
    while (this.currentCharType == CharType.WSP && this.nextChar()) {}
};
ODataRequestLexer.prototype.scanDigits = function (token) {
    var startIndex = this.srcIndex - 1;
    var length = 0;
    token.tokenType = TokenType.DIGITS;
    while (this.currentCharType == CharType.DIGIT) {
        this.nextChar();
        length++;
    }
    token.value = this.src.substr(startIndex, length);
};
ODataRequestLexer.prototype.scanWord = function (token) {
    var startIndex = this.srcIndex - 1;
    var length = 0;
    while (this.currentCharType == CharType.ALPHA) {
        this.nextChar();
        length++;
    }
    token.tokenType = TokenType.WORD;
    token.value = this.src.substr(startIndex, length);
};
