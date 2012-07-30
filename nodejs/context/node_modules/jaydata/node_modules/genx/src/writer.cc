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

#include "writer.h"
#include "element.h"
#include "attribute.h"
#include "namespace.h"

static Persistent<String> sym_data, sym_emit;

void Writer::Initialize(Handle<Object> target)
{
  HandleScope scope;

  Local<FunctionTemplate> t = FunctionTemplate::New(New);
  t->InstanceTemplate()->SetInternalFieldCount(1);
  t->SetClassName(String::NewSymbol("Writer"));

  NODE_SET_PROTOTYPE_METHOD(t, "startDocument", StartDoc);
  NODE_SET_PROTOTYPE_METHOD(t, "endDocument", EndDocument);

  NODE_SET_PROTOTYPE_METHOD(t, "declareNamespace", DeclareNamespace);

  NODE_SET_PROTOTYPE_METHOD(t, "declareElement", DeclareElement);
  NODE_SET_PROTOTYPE_METHOD(t, "startElement", StartElement);
  NODE_SET_PROTOTYPE_METHOD(t, "startElementLiteral", StartElementLiteral);

  NODE_SET_PROTOTYPE_METHOD(t, "addText", AddText);
  NODE_SET_PROTOTYPE_METHOD(t, "addComment", AddComment);

  NODE_SET_PROTOTYPE_METHOD(t, "declareAttribute", DeclareAttribute);
  NODE_SET_PROTOTYPE_METHOD(t, "addAttribute", AddAttribute);
  NODE_SET_PROTOTYPE_METHOD(t, "addAttributeLiteral", AddAttributeLiteral);

  NODE_SET_PROTOTYPE_METHOD(t, "endElement", EndElement);

  target->Set(String::NewSymbol("Writer"), t->GetFunction());

  sym_data = NODE_PSYMBOL("data");
  sym_emit = NODE_PSYMBOL("emit");
}

Writer::Writer()
{
  // alloc, free, userData
  writer = genxNew(NULL, NULL, this);
  sender.send = sender_send;
  sender.sendBounded = sender_sendBounded;
  sender.flush = sender_flush;
}

Writer::~Writer()
{
  genxDispose(writer);
}

Handle<Value> Writer::New(const Arguments& args)
{
  HandleScope scope;
  Writer* writer = new Writer();
  writer->Wrap(args.This());
  return args.This();
}

Handle<Value> Writer::StartDoc(const Arguments& args)
{
  HandleScope scope;
  Writer* w = ObjectWrap::Unwrap<Writer>(args.This());

  w->startDoc();
  return args.This();
}

genxStatus Writer::startDoc()
{
  return genxStartDocSender(writer, &sender);
}

Handle<Value> Writer::EndDocument(const Arguments& args)
{
  HandleScope scope;
  Writer* w = ObjectWrap::Unwrap<Writer>(args.This());

  w->endDocument();
  return args.This();
}

genxStatus Writer::endDocument()
{
  return genxEndDocument(writer);
}

// uri, [prefix]
Handle<Value> Writer::DeclareNamespace(const Arguments& args)
{
  HandleScope scope;
  Writer* w = ObjectWrap::Unwrap<Writer>(args.This());
  Local<String> Uri;
  Local<String> Prefix;

  utf8 uri = NULL;
  utf8 prefix = NULL;

  // Prefix is optional
  switch(args.Length()) {
    case 1:
      if (!args[0]->IsString()) {
        return ThrowException(Exception::TypeError(
                  String::New("First argument to declareNamespace must be a string")));
      }
      Uri = args[0]->ToString();
      break;
    case 2:
      if (!args[0]->IsString()) {
        return ThrowException(Exception::TypeError(
                  String::New("First argument to declareNamespace must be a string")));
      }
      if (!args[1]->IsString()) {
        return ThrowException(Exception::TypeError(
                  String::New("Second argument to declareNamespace must be a string")));
      }
      Uri = args[0]->ToString();
      Prefix = args[1]->ToString();
      prefix = createUtf8FromString(Prefix);
      break;
    default:
      return ThrowException(Exception::Error(String::New(
        "Wrong number of arguments to declareNamespace")));
  }

  uri = createUtf8FromString(Uri);

  Handle<Value> name_space = w->declareNamespace(uri, prefix);
  delete[] uri;
  if (prefix != NULL) delete[] prefix;

  return name_space;
}

Handle<Value> Writer::declareNamespace(constUtf8 uri, constUtf8 prefix)
{
  HandleScope scope;
  genxStatus status = GENX_SUCCESS;
  genxNamespace name_space = genxDeclareNamespace(writer, uri, prefix, &status);

  if (status != GENX_SUCCESS) {
    return ThrowException(Exception::Error(String::New(
      genxGetErrorMessage(writer, status))));
  }

  Local<Value> argv[1];
  argv[0] = External::New(name_space);
  Persistent<Object> ns (Namespace::constructor_template->GetFunction()->NewInstance(1, argv));

  return Persistent<Value>::New(ns);
}

// [namespace], elementName
Handle<Value> Writer::DeclareElement(const Arguments& args)
{
  HandleScope scope;
  Writer* w = ObjectWrap::Unwrap<Writer>(args.This());
  Namespace *name_space = NULL;
  Local<String> Text;

  utf8 name = NULL;
  genxNamespace ns = NULL;

  // Namespace is optional
  switch(args.Length()) {
    case 1:
      if (!args[0]->IsString()) {
        return ThrowException(Exception::TypeError(
                  String::New("First argument must be a string")));
      }
      Text = args[0]->ToString();
      break;
    case 2:
      if (!args[0]->IsObject()) {
        return ThrowException(Exception::TypeError(
                  String::New("First argument must a Namespace")));
      }
      if (!args[1]->IsString()) {
        return ThrowException(Exception::TypeError(
                  String::New("Second argument must be a string")));
      }
      name_space = ObjectWrap::Unwrap<Namespace>(args[0]->ToObject());
      Text = args[1]->ToString();
      break;
    default:
      return ThrowException(Exception::Error(String::New(
        "Wrong number of arguments to declareElement")));
  }

  name = createUtf8FromString(Text);
  if (name_space != NULL) ns = name_space->getNamespace();

  Handle<Value> elem = w->declareElement(ns, name);
  delete[] name;

  return elem;
}

Handle<Value> Writer::declareElement(genxNamespace ns, constUtf8 name)
{
  HandleScope scope;
  genxStatus status = GENX_SUCCESS;
  genxElement element = genxDeclareElement(writer, ns, name, &status);

  if (status != GENX_SUCCESS) {
    return ThrowException(Exception::Error(String::New(
      genxGetErrorMessage(writer, status))));
  }

  Local<Value> argv[1];
  argv[0] = External::New(element);
  Persistent<Object> e (Element::constructor_template->GetFunction()->NewInstance(1, argv));

  return Persistent<Value>::New(e);
}

Handle<Value> Writer::StartElement(const Arguments& args)
{
  HandleScope scope;
  Writer* w = ObjectWrap::Unwrap<Writer>(args.This());

  if (args.Length() < 1) {
    return ThrowException(Exception::Error(
              String::New("Not enough arguments to startElement")));
  }
  else if(!args[0]->IsObject()) {
    return ThrowException(Exception::TypeError(
              String::New("Argument to startElement must be an Element")));
  }

  Element *e = ObjectWrap::Unwrap<Element>(args[0]->ToObject());

  Handle<Value> result = w->startElement(e);

  return result->IsUndefined() ? args.This() : result;
}

Handle<Value> Writer::startElement(Element *elem)
{
  genxStatus status = elem->start();

  if (status != GENX_SUCCESS) {
    return ThrowException(Exception::Error(String::New(
      genxGetErrorMessage(writer, status))));
  }

  return Undefined();
}

// [namespace], type
Handle<Value> Writer::StartElementLiteral(const Arguments& args)
{
  HandleScope scope;
  Writer* w = ObjectWrap::Unwrap<Writer>(args.This());
  Local<String> Namespace;
  Local<String> Type;

  utf8 type = NULL;
  utf8 name_space = NULL;

  // Namespace is optional
  switch(args.Length()) {
    case 1:
      if (!args[0]->IsString()) {
        return ThrowException(Exception::TypeError(
                  String::New("First argument must be a string")));
      }
      Type = args[0]->ToString();
      break;
    case 2:
      if (!args[0]->IsString()) {
        return ThrowException(Exception::TypeError(
                  String::New("First argument must a string")));
      }
      if (!args[1]->IsString()) {
        return ThrowException(Exception::TypeError(
                  String::New("Second argument must be a string")));
      }
      Namespace = args[0]->ToString();
      name_space = createUtf8FromString(Namespace);
      Type = args[1]->ToString();
      break;
    default:
      return ThrowException(Exception::Error(String::New(
        "Wrong number of arguments to startElementLiteral")));
  }

  type = createUtf8FromString(Type);

  Handle<Value> result = w->startElementLiteral(name_space, type);
  delete[] type;

  return result->IsUndefined() ? args.This() : result;
}

Handle<Value> Writer::startElementLiteral(constUtf8 ns, constUtf8 type)
{
  genxStatus status = genxStartElementLiteral(writer, ns, type);

  if (status != GENX_SUCCESS) {
    return ThrowException(Exception::Error(String::New(
      genxGetErrorMessage(writer, status))));
  }

  return Undefined();
}

Handle<Value> Writer::AddText(const Arguments& args)
{
  HandleScope scope;
  Writer* w = ObjectWrap::Unwrap<Writer>(args.This());
  utf8 text = NULL;

  if (args.Length() < 1) {
    return ThrowException(Exception::Error(String::New(
      "Not enough arguments to addText")));
  }
  else if(!args[0]->IsString()) {
    return ThrowException(Exception::TypeError(String::New(
      "Argument to addText must be a string")));
  }

  Local<String> Text = args[0]->ToString();
  text = createUtf8FromString(Text);

  Handle<Value> result = w->addText(text);
  delete[] text;

  return result->IsUndefined() ? args.This() : result;
}

Handle<Value> Writer::addText(constUtf8 text)
{
  genxStatus status = genxAddText(writer, text);

  if (status != GENX_SUCCESS) {
    return ThrowException(Exception::Error(String::New(
      genxGetErrorMessage(writer, status))));
  }

  return Undefined();
}

Handle<Value> Writer::AddComment(const Arguments& args)
{
  HandleScope scope;
  Writer* w = ObjectWrap::Unwrap<Writer>(args.This());
  utf8 text = NULL;

  if (args.Length() < 1) {
    return ThrowException(Exception::Error(String::New(
      "Not enough arguments to addComment")));
  }
  else if(!args[0]->IsString()) {
    return ThrowException(Exception::TypeError(String::New(
      "Argument to addComment must be a string")));
  }

  Local<String> Text = args[0]->ToString();
  text = createUtf8FromString(Text);

  Handle<Value> result = w->addComment(text);
  delete[] text;

  return result->IsUndefined() ? args.This() : result;
}

Handle<Value> Writer::addComment(constUtf8 comment)
{
  genxStatus status = genxComment(writer, comment);

  if (status != GENX_SUCCESS) {
    return ThrowException(Exception::Error(String::New(
      genxGetErrorMessage(writer, status))));
  }

  return Undefined();
}

// [namespace], name
Handle<Value> Writer::DeclareAttribute(const Arguments& args)
{
  HandleScope scope;
  Writer* w = ObjectWrap::Unwrap<Writer>(args.This());
  Namespace *name_space = NULL;
  Local<String> Text;

  utf8 name = NULL;
  genxNamespace ns = NULL;

  // Namespace is optional
  switch(args.Length()) {
    case 1:
      if (!args[0]->IsString()) {
        return ThrowException(Exception::TypeError(
                  String::New("First argument must be a string")));
      }
      Text = args[0]->ToString();
      break;
    case 2:
      if (!args[0]->IsObject()) {
        return ThrowException(Exception::TypeError(
                  String::New("First argument must a Namespace")));
      }
      if (!args[1]->IsString()) {
        return ThrowException(Exception::TypeError(
                  String::New("Second argument must be a string")));
      }
      name_space = ObjectWrap::Unwrap<Namespace>(args[0]->ToObject());
      Text = args[1]->ToString();
      break;
    default:
      return ThrowException(Exception::Error(String::New(
        "Wrong number of arguments to declareAttribute")));
  }

  name = createUtf8FromString(Text);
  if (name_space != NULL) ns = name_space->getNamespace();

  Handle<Value> attr = w->declareAttribute(ns, name);
  delete[] name;

  return attr;
}

Handle<Value> Writer::declareAttribute(genxNamespace ns, constUtf8 name)
{
  HandleScope scope;
  genxStatus status = GENX_SUCCESS;
  genxAttribute attribute = genxDeclareAttribute(writer, ns, name, &status);

  if (status != GENX_SUCCESS) {
    return ThrowException(Exception::Error(String::New(
      genxGetErrorMessage(writer, status))));
  }

  Local<Value> argv[1];
  argv[0] = External::New(attribute);
  Persistent<Object> a (Attribute::constructor_template->GetFunction()->NewInstance(1, argv));

  return Persistent<Value>::New(a);
}

Handle<Value> Writer::AddAttribute(const Arguments& args)
{
  HandleScope scope;
  Writer* w = ObjectWrap::Unwrap<Writer>(args.This());
  utf8 value = NULL;

  if (args.Length() < 2) {
    return ThrowException(Exception::Error(
              String::New("Wrong number of arguments to addAttribute")));
  }
  else if(!args[0]->IsObject()) {
    return ThrowException(Exception::TypeError(
              String::New("First argument to addAttribute must be an Attribute")));
  }
  else if(!args[1]->IsString()) {
    return ThrowException(Exception::TypeError(
              String::New("Second argument to addAttribute must be a string")));
  }

  Attribute *attr = ObjectWrap::Unwrap<Attribute>(args[0]->ToObject());
  Local<String> Text = args[1]->ToString();
  value = createUtf8FromString(Text);

  Handle<Value> result = w->addAttribute(attr, value);
  delete[] value;

  return result->IsUndefined() ? args.This() : result;
}

Handle<Value> Writer::addAttribute(Attribute *attr, constUtf8 value)
{
  genxStatus status = attr->add(value);

  if (status != GENX_SUCCESS) {
    return ThrowException(Exception::Error(String::New(
      genxGetErrorMessage(writer, status))));
  }

  return Undefined();
}

Handle<Value> Writer::AddAttributeLiteral(const Arguments& args)
{
  HandleScope scope;
  Writer* w = ObjectWrap::Unwrap<Writer>(args.This());
  utf8 name = NULL;
  utf8 value = NULL;

  if (args.Length() < 2    ||
     !args[0]->IsString() ||
     !args[1]->IsString()) {
    return ThrowException(Exception::Error(String::New(
      "Two string arguments must be supplied to addAttributeLiteral")));
  }

  Local<String> Name = args[0]->ToString();
  Local<String> Val = args[1]->ToString();

  // Get the raw UTF-8 strings
  name = createUtf8FromString(Name);
  value = createUtf8FromString(Val);

  Handle<Value> result = w->addAttributeLiteral(name, value);
  delete[] name;
  delete[] value;

  return result->IsUndefined() ? args.This() : result;
}

Handle<Value> Writer::addAttributeLiteral(constUtf8 name, constUtf8 value)
{
  constUtf8 xmlns = NULL;

  genxStatus status = genxAddAttributeLiteral(writer, xmlns, name, value);
  if (status != GENX_SUCCESS) {
    return ThrowException(Exception::Error(String::New(
      genxGetErrorMessage(writer, status))));
  }

  return Undefined();
}

Handle<Value> Writer::EndElement(const Arguments& args)
{
  HandleScope scope;
  Writer* w = ObjectWrap::Unwrap<Writer>(args.This());

  w->endElement();
  return args.This();
}

genxStatus Writer::endElement()
{
  return genxEndElement(writer);
}

utf8 Writer::createUtf8FromString(Handle<String> String)
{
  utf8 string = NULL;
  int length = String->Utf8Length() + 1;  // +1 for NUL character

  string = new unsigned char[length];
  String->WriteUtf8((char *)string, length);

  return string;
}

void Writer::Emit(int argc, Handle<Value>argv[])
{
  HandleScope scope;

  Local<Function> emit = Local<Function>::Cast(handle_->Get(sym_emit));
  emit->Call(handle_, argc, argv);
}

genxStatus Writer::sender_send(void *userData, constUtf8 s)
{
  HandleScope scope;
  Writer *w = reinterpret_cast<Writer *>(userData);

  // Deliver the data event
  Local<String> dataString = String::New((const char *)s);
  Handle<Value> argv[2] = { sym_data, dataString };
  w->Emit(2, argv);

  return GENX_SUCCESS;
}

genxStatus Writer::sender_sendBounded(void *userData, constUtf8 start, constUtf8 end)
{
  HandleScope scope;
  Writer *w = reinterpret_cast<Writer *>(userData);

  // Deliver the data event
  Local<String> dataString = String::New((const char *)start, end - start);
  Handle<Value> argv[2] = { sym_data, dataString };
  w->Emit(2, argv);

  return GENX_SUCCESS;
}

genxStatus Writer::sender_flush(void * userData)
{
  return GENX_SUCCESS;
}

