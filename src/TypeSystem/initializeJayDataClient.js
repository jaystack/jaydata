export default function _data_handler() {
  //console.log("@@@@", this);
  if (this instanceof _data_handler) {
    var type = _data_handler["implementation"].apply(this, arguments);
    return new type(arguments[1]);
  } else {
    return _data_handler["implementation"].apply(this, arguments)
  }
};
