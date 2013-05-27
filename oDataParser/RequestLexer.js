(function () {

    $data.Class.define('$data.oDataParser.ASCII', null, null, {}, {
        NULL: { value: "\u0000" },
        HTAB: { value: 9 },
        LF: { value: 10 },
        VTAB: { value: 11 },
        CR: { value: 13 },
        SPC: { value: 32 },
        DOLLAR: { value: 36 }, // $
        AMP: { value: 38 }, // &
        APOS: { value: 39 }, // '
        LPAREN: { value: 40 }, // (
        RPAREN: { value: 41 }, // )
        ASTERISK: { value: 42 }, // *
        PLUS: { value: 43 }, // +
        COMMA: { value: 44 }, // },
        MINUS: { value: 45 }, // -
        DOT: { value: 46 }, // .
        SLASH: { value: 47 }, // /
        ZERO: { value: 48 }, // 0
        NINE: { value: 57 }, // 9
        COLON: { value: 58 }, // :
        A: { value: 65 },
        Z: { value: 90 },
        UNDERSCORE: { value: 95 }, // _
        a: { value: 97 },
        z: { value: 122 }
    });

    $data.Class.define('$data.oDataParser.CharType', null, null, {}, {
        EOF: { value: 0 }, WSP: { value: 1 }, CTRLCHAR: { value: 2 }, CHAR: { value: 3 }, DIGIT: { value: 4 }, ALPHA: { value: 5 }
    });

    $data.Class.define('$data.oDataParser.TokenType', null, null, {}, {
        EOF: { value: 0 }, WSP: { value: 1 }, CTRLCHAR: { value: 2 }, CHAR: { value: 3 }, DIGITS: { value: 4 }, WORD: { value: 5 }, STRING: { value: 6 }
    });

    var ASCII = $data.oDataParser.ASCII;
    var CharType = $data.oDataParser.CharType;
    var TokenType = $data.oDataParser.TokenType;


    $data.Class.define('$data.oDataParser.RequestToken', null, null, {
        constructor: function () {
            this.tokenType = TokenType.EOF;
            this.value = "";
            this.line = -1;
            this.column = -1;
        },
        toString: function () {
            if (this.tokenType == TokenType.DIGITS || this.tokenType == TokenType.WORD || this.tokenType == TokenType.STRING)
                return this.value;
            else if (this.tokenType == TokenType.CTRLCHAR || this.tokenType == TokenType.CHAR || this.tokenType == TokenType.WSP)
                return String.fromCharCode(this.value);
            return "[EOF]";
        }
    });

    $data.Class.define('$data.oDataParser.RequestLexer', null, null, {
        constructor: function (src) {
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
        },
        nextChar: function () {
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
        },
        getCharType: function (c) {
            if (c == ASCII.NULL) return CharType.EOF;
            if (c == ASCII.HTAB) return CharType.WSP;
            if (c < ASCII.SPC) return CharType.CTRLCHAR;
            if (c == ASCII.SPC) return CharType.WSP;
            if (c < ASCII.ZERO) return CharType.CHAR;
            if (c <= ASCII.NINE) return CharType.DIGIT;
            if (c < ASCII.A) return CharType.CHAR;
            if (c <= ASCII.Z) return CharType.ALPHA;
            if (c < ASCII.a) return CharType.CHAR;
            if (c <= ASCII.z) return CharType.ALPHA;
            return c;
        },
        nextToken: function () {
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
            var token = new $data.oDataParser.RequestToken();
            this.token = token;
            token.line = this.line;
            token.column = this.column;
            switch (this.currentCharType) {
                case CharType.EOF: token.tokenType = TokenType.EOF; token.value = this.currentChar; break;
                case CharType.WSP: token.tokenType = TokenType.WSP; token.value = this.currentChar; this.nextChar(); break;
                case CharType.CTRLCHAR: token.tokenType = TokenType.CTRLCHAR; token.value = this.currentChar; this.nextChar(); break;
                case CharType.CHAR: this.scanChar(token); break;
                case CharType.DIGIT: this.scanDigits(token); break;
                case CharType.ALPHA: this.scanWord(token); break;
                default:
                    throw "Unknown CharType: " + this.currentCharType;
            }
            return this.token;
        },
        readTo: function (str) {
            if (this.srcIndex == this.srcLength )
                return false;
            var p = this.src.indexOf(str, this.srcIndex);
            if (p < 0)
                return false;
            this.srcIndex = p + 1;
            return true;
        },
        skipWhiteSpaces: function () {
            while (this.currentCharType == CharType.WSP && this.nextChar()) { }
        },
        scanDigits: function (token) {
            var startIndex = this.srcIndex - 1;
            var length = 0;
            token.tokenType = TokenType.DIGITS;
            while (this.currentCharType == CharType.DIGIT) {
                this.nextChar();
                length++;
            }
            token.value = this.src.substr(startIndex, length);
        },
        scanWord: function (token) {
            var startIndex = this.srcIndex - 1;
            var length = 0;
            while (this.currentCharType == CharType.ALPHA) {
                this.nextChar();
                length++;
            }
            token.tokenType = TokenType.WORD;
            token.value = this.src.substr(startIndex, length);
        },
        scanChar: function (token) {
            var startIndex = this.srcIndex;

            if (this.currentChar == ASCII.APOS && this.readTo("'")) {
                this.scanString(token, startIndex);
            }
            else {
                token.tokenType = TokenType.CHAR;
                token.value = this.currentChar;
                this.nextChar();
            }
        },
        scanString: function (token, startIndex) {
            token.tokenType = TokenType.STRING;
            var length = this.srcIndex - startIndex - 1;
            token.value += this.src.substr(startIndex, this.srcIndex - startIndex - 1);
            this.column += length + 1;

            this.nextChar();
            if (this.currentChar == ASCII.APOS) {
                token.value += "'";
                this.scanChar(token);
            }
        }
    });
})();
