/*
Copyright (c) 2011, Wesley Moore http://www.wezm.net/
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are
met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.

    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

    * Neither the name of the node-genx Project, Wesley Moore, nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written
      permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR
CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

#ifndef NODE_GENX_WRITER_H
#define NODE_GENX_WRITER_H

#include <node.h>
#include <node_object_wrap.h>

#include "genx.h"
#include "node-genx.h"
#include "attribute.h"
#include "element.h"

using namespace v8;
using namespace node;

class Writer: public ObjectWrap
{
private:
  genxWriter writer;
  genxSender sender;
public:
  static void Initialize(Handle<Object> target);

  Writer();

  ~Writer();

protected:

  static Handle<Value> New(const Arguments& args);

  static Handle<Value> StartDoc(const Arguments& args);
  genxStatus startDoc();

  static Handle<Value> EndDocument(const Arguments& args);
  genxStatus endDocument();

  static Handle<Value> DeclareNamespace(const Arguments& args);
  Handle<Value> declareNamespace(constUtf8 ns, constUtf8 name);

  static Handle<Value> DeclareElement(const Arguments& args);
  Handle<Value> declareElement(genxNamespace ns, constUtf8 name);
  
  static Handle<Value> StartElement(const Arguments& args);
  Handle<Value> startElement(Element *elem);
  static Handle<Value> StartElementLiteral(const Arguments& args);
  Handle<Value> startElementLiteral(constUtf8 ns, constUtf8 type);

  static Handle<Value> AddText(const Arguments& args);
  Handle<Value> addText(constUtf8 text);

  static Handle<Value> AddComment(const Arguments& args);
  Handle<Value> addComment(constUtf8 comment);

  static Handle<Value> DeclareAttribute(const Arguments& args);
  Handle<Value> declareAttribute(genxNamespace ns, constUtf8 name);

  static Handle<Value> AddAttribute(const Arguments& args);
  Handle<Value> addAttribute(Attribute *attr, constUtf8 value);
  static Handle<Value> AddAttributeLiteral(const Arguments& args);
  Handle<Value> addAttributeLiteral(constUtf8 name, constUtf8 value);

  static Handle<Value> EndElement(const Arguments& args);
  genxStatus endElement();

private:
  static utf8 createUtf8FromString(Handle<String> String);

  void Emit(int argc, Handle<Value>argv[]);
  static genxStatus sender_send(void *userData, constUtf8 s);
  static genxStatus sender_sendBounded(void *userData, constUtf8 start, constUtf8 end);
  static genxStatus sender_flush(void * userData);
};

#endif

