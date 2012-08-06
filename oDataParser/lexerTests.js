$(document).ready(function () {
    module("ODataRequestParser Lexer tests");
    var ASCII = $data.oDataParser.ASCII;
    var CharType = $data.oDataParser.CharType;
    var TokenType = $data.oDataParser.TokenType;

    test("NextChar: empty source", 2, function () {
		var src = "";
		var l = new $data.oDataParser.RequestLexer(src);
		l.nextChar();
		equal(l.currentChar, ASCII.NULL);
		equal(l.currentCharType, CharType.EOF);
    });
    test("NextChar: character classes", 36, function () {
		var src = ". aAzZ	09\r\n.asdf42";
		var l = new $data.oDataParser.RequestLexer(src);
		              equal(l.currentChar, ASCII.SPC, "1");           equal(l.currentCharType, CharType.WSP, "2");
		l.nextChar(); equal(l.currentChar, ASCII.a, "3");             equal(l.currentCharType, CharType.ALPHA, "4");
		l.nextChar(); equal(l.currentChar, ASCII.A, "5");             equal(l.currentCharType, CharType.ALPHA, "6");
		l.nextChar(); equal(l.currentChar, ASCII.z, "7");             equal(l.currentCharType, CharType.ALPHA, "8");
		l.nextChar(); equal(l.currentChar, ASCII.Z, "9");             equal(l.currentCharType, CharType.ALPHA, "10");
		l.nextChar(); equal(l.currentChar, ASCII.HTAB, "11");         equal(l.currentCharType, CharType.WSP, "12");
		l.nextChar(); equal(l.currentChar, ASCII.ZERO, "13");         equal(l.currentCharType, CharType.DIGIT, "14");
		l.nextChar(); equal(l.currentChar, ASCII.NINE, "15");         equal(l.currentCharType, CharType.DIGIT, "16");
		l.nextChar(); equal(l.currentChar, "\r".charCodeAt(0), "17"); equal(l.currentCharType, CharType.CTRLCHAR, "18");
		l.nextChar(); equal(l.currentChar, "\n".charCodeAt(0), "19"); equal(l.currentCharType, CharType.CTRLCHAR, "20");
		l.nextChar(); equal(l.currentChar, ".".charCodeAt(0), "21");  equal(l.currentCharType, CharType.CHAR, "22");
		l.nextChar(); equal(l.currentChar, "a".charCodeAt(0), "23");  equal(l.currentCharType, CharType.ALPHA, "24");
		l.nextChar(); equal(l.currentChar, "s".charCodeAt(0), "25");  equal(l.currentCharType, CharType.ALPHA, "26");
		l.nextChar(); equal(l.currentChar, "d".charCodeAt(0), "27");  equal(l.currentCharType, CharType.ALPHA, "28");
		l.nextChar(); equal(l.currentChar, "f".charCodeAt(0), "29");  equal(l.currentCharType, CharType.ALPHA, "30");
		l.nextChar(); equal(l.currentChar, "4".charCodeAt(0), "31");  equal(l.currentCharType, CharType.DIGIT, "32");
		l.nextChar(); equal(l.currentChar, "2".charCodeAt(0), "33");  equal(l.currentCharType, CharType.DIGIT, "34");
		l.nextChar(); equal(l.currentChar, ASCII.NULL, "35");         equal(l.currentCharType, CharType.EOF, "36");
    });
    test("OneToken: word", 2, function () {
		var src = "asdf";
		var l = new $data.oDataParser.RequestLexer(src);
		var t=l.token;
		equal(t.tokenType, TokenType.WORD);
		equal(t.value, "asdf");
    });
    test("OneToken: word and spaces", 2, function () {
		var src = " 	asdf ";
		var l = new $data.oDataParser.RequestLexer(src);
		var t=l.token;
		equal(t.tokenType, TokenType.WORD);
		equal(t.value, "asdf");
    });
    test("OneToken: digits", 2, function () {
		var src = "42";
		var l = new $data.oDataParser.RequestLexer(src);
		var t=l.token;
		equal(t.tokenType, TokenType.DIGITS);
		equal(t.value, "42");
    });
    test("OneToken: lot of digits", 2, function () {
		var src = "1234567890123456789012345678901234567890";
		var l = new $data.oDataParser.RequestLexer(src);
		var t=l.token;
		equal(t.tokenType, TokenType.DIGITS);
		equal(t.value, "1234567890123456789012345678901234567890");
    });
    test("OneToken: string", 2, function () {
		var src = " 'asdf' ";
		var l = new $data.oDataParser.RequestLexer(src);
		var t=l.token;
		equal(t.tokenType, TokenType.STRING);
		equal(t.value, "asdf");
    });
    test("Next token", 10, function () {
		var src = "x asdf 'yxcv' qwer 12 ";
		var l = new $data.oDataParser.RequestLexer(src);
		var t;
		l.nextToken();t=l.token; equal(t.tokenType, TokenType.WORD, "1");    equal(t.value, "asdf", "2");
		l.nextToken();t=l.token; equal(t.tokenType, TokenType.STRING, "3");  equal(t.value, "yxcv", "4");
		l.nextToken();t=l.token; equal(t.tokenType, TokenType.WORD, "5");    equal(t.value, "qwer", "6");
		l.nextToken();t=l.token; equal(t.tokenType, TokenType.DIGITS, "7");  equal(t.value, "12", "8");
		l.nextToken();t=l.token; equal(t.tokenType, TokenType.EOF, "9");     equal(t.value, "\u0000", "10");
    });
    test("Column info 1", 6, function () {
		//         012345678
		var src = "x asdf  ";
		var l = new $data.oDataParser.RequestLexer(src);
		var t;
		l.nextToken();t=l.token; equal(t.tokenType, TokenType.WORD,   "t1");	equal(t.value, "asdf",   "v1"); equal(t.column, 2, "c1");
		l.nextToken();t=l.token; equal(t.tokenType, TokenType.EOF,    "t2"); equal(t.value, "\u0000", "v2"); equal(t.column, 8, "c2");
    });
    test("Column info 2", 15, function () {
		//         0         1         2
		//         0123456789012345678901
		var src = "x asdf 'yxcv' qwer 12 ";
		var l = new $data.oDataParser.RequestLexer(src);
		var t;
		l.nextToken();t=l.token; equal(t.tokenType, TokenType.WORD,   "t1");	equal(t.value, "asdf",   "v1"); equal(t.column, 2,  "c1");
		l.nextToken();t=l.token; equal(t.tokenType, TokenType.STRING, "t2"); equal(t.value, "yxcv",   "v2"); equal(t.column, 7,  "c2");
		l.nextToken();t=l.token; equal(t.tokenType, TokenType.WORD,   "t3"); equal(t.value, "qwer",   "v3"); equal(t.column, 14,  "c3");
		l.nextToken();t=l.token; equal(t.tokenType, TokenType.DIGITS, "t4"); equal(t.value, "12",     "v4"); equal(t.column, 19, "c4");
		l.nextToken();t=l.token; equal(t.tokenType, TokenType.EOF,    "t5"); equal(t.value, "\u0000", "v5"); equal(t.column, 22, "c5");
    });

});
