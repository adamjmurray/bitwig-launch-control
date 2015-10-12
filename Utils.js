var Utils = {

  printProperties: function(obj) {
    println(obj);
    for (var prop in obj) {
      try {
        println(' * ' + prop + (obj[prop] instanceof Function ? '()' : ''));
      }
      catch (err) {
        // some properties are prohibited from accessing
        // println(prop + ': ' + err);
      }
    }
  }

};
